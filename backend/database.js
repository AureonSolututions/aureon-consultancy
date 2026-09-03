const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dataDirectory = path.join(__dirname, "data");

if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
}

const db = new Database(path.join(dataDirectory, "aureon.db"));
db.pragma("journal_mode = WAL");

db.exec(`
    CREATE TABLE IF NOT EXISTS visitors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        ip_address TEXT,
        country TEXT,
        region TEXT,
        city TEXT,
        page TEXT,
        user_agent TEXT,
        device TEXT,
        browser TEXT,
        referrer TEXT,
        visited_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT,
        message TEXT NOT NULL,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

module.exports = db;
