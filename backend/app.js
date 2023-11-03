const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require("cors");

const app = express();
const port = 3500;

// Create a connection to the SQLite database
const db = new sqlite3.Database('locations.db');

db.run(`
  CREATE TABLE IF NOT EXISTS locations (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Notes TEXT,
    LAT REAL NOT NULL,
    LNG REAL NOT NULL
  )
`);
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.use(bodyParser.json());

// Define API endpoints for CRUD operations

// Create a new location
app.post('/locations', (req, res) => {
  const { Name, Notes, LAT, LNG } = req.body;
  db.run(
    'INSERT INTO locations (Name, Notes, LAT, LNG) VALUES (?, ?, ?, ?)',
    [Name, Notes, LAT, LNG],
    function (err) {
      if (err) {
        res.status(500).json(err);
        return;
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Get all locations
app.get('/locations', (req, res) => {
  db.all('SELECT * FROM locations', (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving locations' });
      return;
    }
    res.json(rows);
  });
});

// Update a location by ID
app.put('/locations/:id', (req, res) => {
  const { Name, Notes, LAT, LNG } = req.body;
  const { id } = req.params;
  db.run(
    'UPDATE locations SET Name = ?, Notes = ?, LAT = ?, LNG = ? WHERE ID = ?',
    [Name, Notes, LAT, LNG, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Error updating location' });
        return;
      }
      res.json({ message: 'Location updated successfully' });
    }
  );
});

// Delete a location by ID
app.delete('/locations/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM locations WHERE ID = ?', id, function (err) {
    if (err) {
      res.status(500).json({ error: 'Error deleting location' });
      return;
    }
    res.json({ message: 'Location deleted successfully' });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
