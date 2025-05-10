const express = require('express');
const mysql   = require('mysql');
const app     = express();

// Create a MySQL connection (using plaintext credentials for simplicity)
const db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'password',
  database : 'myapp'
});

app.get('/user', (req, res) => {
  // UNSAFE: directly embedding user input into a SQL query
  const userId = req.query.id; 
  const sql = `SELECT * FROM users WHERE id = '${userId}'`;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).send('DB error');
    }
    res.json(results);
  });
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
