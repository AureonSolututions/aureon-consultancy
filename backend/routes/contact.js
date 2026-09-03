const express = require("express");
const db = require("../database");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

router.post("/", (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({
            error: "Name, email and message are required."
        });
    }

    const insert = db.prepare(`
        INSERT INTO contacts (name, email, phone, subject, message)
        VALUES (?, ?, ?, ?, ?)
    `);

    insert.run(
        name.trim(),
        email.trim(),
        phone ? phone.trim() : "",
        subject ? subject.trim() : "",
        message.trim()
    );

    res.json({
        success: true,
        message: "Your message has been received."
    });
});

router.get("/", authenticateToken, (req, res) => {
    const contacts = db.prepare(`
        SELECT * FROM contacts
        ORDER BY submitted_at DESC
    `).all();

    res.json(contacts);
});

module.exports = router;
