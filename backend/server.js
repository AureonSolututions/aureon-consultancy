require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const path = require("path");

require("./database");

const analyticsRoutes = require("./routes/analytics");
const contactRoutes = require("./routes/contact");

const app = express();
const PORT = process.env.PORT || 3000;

// Render sits behind a proxy, so trust the forwarded visitor IP
app.set("trust proxy", true);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: "Too many requests. Please try again later." }
});

app.use("/api/", apiLimiter);

const websiteDirectory = path.resolve(__dirname, "..");

app.use(express.static(websiteDirectory));

app.get("/about.html", (req, res) => {
    res.sendFile(path.join(websiteDirectory, "about.html"));
});

app.get("/services.html", (req, res) => {
    res.sendFile(path.join(websiteDirectory, "services.html"));
});

app.get("/industries.html", (req, res) => {
    res.sendFile(path.join(websiteDirectory, "industries.html"));
});

app.get("/approach.html", (req, res) => {
    res.sendFile(path.join(websiteDirectory, "approach.html"));
});

app.get("/portfolio.html", (req, res) => {
    res.sendFile(path.join(websiteDirectory, "portfolio.html"));
});

app.get("/contact.html", (req, res) => {
    res.sendFile(path.join(websiteDirectory, "contact.html"));
});

app.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    if (
        username !== process.env.ADMIN_USERNAME ||
        password !== process.env.ADMIN_PASSWORD
    ) {
        return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
        { username, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
    );

    res.json({ success: true, token });
});

app.use("/api/analytics", analyticsRoutes);
app.use("/api/contact", contactRoutes);

app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        message: "Aureon backend is running.",
        time: new Date().toISOString()
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log("");
    console.log("=================================");
    console.log("   AUREON BACKEND IS RUNNING");
    console.log("=================================");
    console.log("");
    console.log(`Website: http://localhost:${PORT}`);
    console.log(`Admin:   http://localhost:${PORT}/admin`);
    console.log(`API:     http://localhost:${PORT}/api/status`);
    console.log("");
});
