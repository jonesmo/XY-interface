const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
app.use(cors()); // client fetches from a different origin
app.use(express.json());

// create tables
const xy_db = new Database(path.join(__dirname, 'xy_data.db'));
xy_db.pragma('foreign_keys = ON');

xy_db.exec(`
  CREATE TABLE IF NOT EXISTS runs (
    run_id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    received_at TEXT NOT NULL
  )
`);

xy_db.exec(`
  CREATE TABLE IF NOT EXISTS dot_positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id TEXT NOT NULL,
    dot_id TEXT,
    audio_src TEXT,
    x REAL,
    y REAL,
    background_color TEXT,
    highlighted_color TEXT,
    FOREIGN KEY (run_id) REFERENCES runs(run_id)
  )
`);

// log data
app.post('/api/save-positions', (req, res) => {
  const { runId, timestamp, dotData } = req.body;

  if (!runId || !Array.isArray(dotData)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  const receivedAt = new Date().toISOString();

  try {
    // Use a transaction so the run + all dots are saved atomically
    const insertRun = xy_db.prepare(`
      INSERT OR REPLACE INTO runs (run_id, timestamp, received_at)
      VALUES (?, ?, ?)
    `);

    const insertDot = xy_db.prepare(`
      INSERT INTO dot_positions (run_id, dot_id, audio_src, x, y, background_color, highlighted_color)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const deleteOldDots = xy_db.prepare(`
        DELETE FROM dot_positions WHERE run_id = ?
        `);

    const saveAll = xy_db.transaction(() => {
      insertRun.run(runId, timestamp, receivedAt);
      deleteOldDots.run(runId); // in case of double clicks or retries or shenanigans

      for (const dot of dotData) {
        insertDot.run(
          runId,
          dot.id,
          dot.audioSrc,
          dot.x,
          dot.y,
          dot.backgroundColor,
          dot.highlightedColor
        );
      }
    });

    saveAll();

    res.status(200).json({ status: 'ok', runId });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

['SIGINT', 'SIGTERM', 'SIGQUIT']
  .forEach(signal => process.on(signal, () => {
    xy_db.close();
    process.exit();
  }));