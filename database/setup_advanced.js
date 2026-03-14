const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'inventory.db');
const db = new sqlite3.Database(dbPath);

function run(sql) {
    return new Promise((resolve, reject) => {
        db.run(sql, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

function all(sql) {
    return new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function migrate() {
    try {
        console.log('--- DATABASE MIGRATION START ---');

        await run(`CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT (datetime('now','localtime')),
            action TEXT NOT NULL,
            details TEXT,
            user TEXT DEFAULT 'admin'
        )`);
        console.log('✔ Logs table verified/created.');

        const rows = await all("PRAGMA table_info(people)");
        const hasRating = rows.some(r => r.name === 'rating');
        if (!hasRating) {
            await run(`ALTER TABLE people ADD COLUMN rating INTEGER DEFAULT 0`);
            console.log('✔ Rating column added to people table.');
        } else {
            console.log('✔ Rating column already exists.');
        }

        console.log('--- MIGRATION COMPLETE ---');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        db.close();
    }
}

migrate();
