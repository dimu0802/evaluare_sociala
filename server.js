require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt=require('bcrypt');
const { Pool } = require('pg');
const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
const PORT = 3001;

const pool = new Pool({
    user: 'dimu',
    host: 'localhost',
    password: process.env.DB_PASSWORD,
    database: 'evaluare_sociala',
    port: 5432,
  });

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));


app.get('/api/companies', async (req, res) => {
    const { name, domain } = req.query;
  
    let baseQuery = 'SELECT * FROM companies WHERE 1=1';
    const params = [];
  
    if (name) {
      params.push(`%${name}%`);
      baseQuery += ` AND LOWER(name) LIKE LOWER($${params.length})`;
    }
  
    if (domain) {
      params.push(domain);
      baseQuery += ` AND domain = $${params.length}`;
    }
  
    try {
      const result = await pool.query(baseQuery, params);
      res.json(result.rows);
    } catch (err) {
      console.error('Eroare la interogarea companiilor:', err);
      res.status(500).json({ message: 'Eroare la obținerea companiilor' });
    }
  });

  app.get('/api/domains', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT unnest(enum_range(NULL::domain_type)) AS domain
      `);
      res.json(result.rows.map(row => row.domain));
    } catch (err) {
      console.error('Eroare la obținerea domeniilor:', err);
      res.status(500).json({ message: 'Eroare la obținerea domeniilor' });
    }
  });

app.get('/api/companies/:id', async (req, res) => {
    const companyId = req.params.id;
  
    try {
      const result = await pool.query(
        'SELECT * FROM companies WHERE id = $1',
        [companyId]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Compania nu a fost găsită' });
      }
  
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Eroare la obținerea companiei:', err);
      res.status(500).json({ message: 'Eroare internă' });
    }
  });
  
  app.get('/api/companies/:id/reviews', async (req, res) => {
    const companyId = req.params.id;
  
    try {
      const result = await pool.query(`
        SELECT r.rating, r.comment, u.username
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.company_id = $1
        ORDER BY r.id DESC
      `, [companyId]);
  
      res.json(result.rows);
    } catch (err) {
      console.error('Eroare la obținerea review-urilor:', err);
      res.status(500).json({ message: 'Eroare internă' });
    }
  });

  app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const result = await pool.query(
        'SELECT id, username, password_hash, is_owner FROM users WHERE email = $1',
        [email]
      );
  
      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Email sau parolă greșite.' });
      }
  
      const user = result.rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
  
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Email sau parolă greșite.' });
      }
  
      res.json({ id: user.id, username: user.username, is_owner: user.is_owner });
    } catch (err) {
      console.error('Eroare la autentificare:', err);
      res.status(500).json({ message: 'Eroare la autentificare' });
    }
  });

  app.post('/api/register', async (req, res) => {
    const { username, email, password, gender, is_owner } = req.body;
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const result = await pool.query(
        'INSERT INTO users (username, email, password_hash, gender, is_owner) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [username, email, hashedPassword, gender, is_owner]
      );
  
      res.status(201).json({ id: result.rows[0].id, message: 'Utilizator creat cu succes' });
    } catch (err) {
      console.error('Eroare la înregistrare:', err);
      res.status(500).json({ message: 'Eroare la înregistrare' });
    }
  });

  app.post('/api/reviews', async (req, res) => {
    const { user_id, company_id, rating, comment } = req.body;
  
    try {
      await pool.query(
        `INSERT INTO reviews (user_id, company_id, rating, comment)
         VALUES ($1, $2, $3, $4)`,
        [user_id, company_id, rating, comment]
      );
  
      res.status(201).json({ message: 'Review adăugat cu succes' });
    } catch (err) {
      console.error('Eroare la adăugare review:', err);
      res.status(500).json({ message: 'Eroare la salvarea review-ului' });
    }
  });

  app.post('/api/ai-feedback/:companyId', async (req, res) => {
    const companyId = req.params.companyId;
  
    try {

      const result = await pool.query(`
        SELECT r.rating, r.comment, u.username
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.company_id = $1
      `, [companyId]);
  
      const reviews = result.rows;
      if (reviews.length === 0) {
        return res.status(400).json({ message: 'Compania nu are încă review-uri.' });
      }
  
      const prompt = `Evaluează aceste review-uri și sugerează ce ar putea îmbunătăți compania:\n\n` +
        reviews.map(r => `- [${r.rating}/5] ${r.comment}`).join("\n") +
        `\n\nRăspunde în română, clar și obiectiv.`;
  
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.7
      });
  
      const feedback = completion.choices[0].message.content;
      res.json({ feedback });
  
    } catch (err) {
      console.error("Eroare AI:", err);
      res.status(500).json({ message: "Eroare la generarea sugestiilor" });
    }
  });

  app.post('/api/companies', async (req, res) => {
    const { name, description, domain, user_id } = req.body;
  
    if (!name || !domain || !user_id) {
      return res.status(400).json({ message: "Datele lipsesc." });
    }
  
    try {
      const result = await pool.query(
        'SELECT is_owner FROM users WHERE id = $1',
        [user_id]
      );
  
      if (result.rows.length === 0 || result.rows[0].is_owner !== true) {
        return res.status(403).json({ message: "Nu ai permisiunea să adaugi firme." });
      }
  
      const insert = await pool.query(
        `INSERT INTO companies (name, description, domain)
         VALUES ($1, $2, $3) RETURNING id`,
        [name, description, domain]
      );
  
      const companyId = insert.rows[0].id;
  
      await pool.query(
        `UPDATE users SET company_id = $1 WHERE id = $2`,
        [companyId, user_id]
      );
  
      res.status(201).json({ message: "Firmă adăugată", company_id: companyId });
  
    } catch (err) {
      console.error("Eroare la adăugarea firmei:", err);
      res.status(500).json({ message: "Eroare internă" });
    }
  });

app.listen(PORT, () => {
  console.log(`Serverul rulează pe http://localhost:${PORT}`);
});
