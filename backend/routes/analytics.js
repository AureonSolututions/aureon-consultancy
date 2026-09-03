const express = require("express");
const crypto = require("crypto");
const db = require("../database");

const authenticateToken = require("../middleware/auth");

const router = express.Router();


// ==========================================
// DEVICE DETECTION
// ==========================================

function detectDevice(userAgent) {

    if (!userAgent) return "Unknown";

    if (/tablet/i.test(userAgent)) {
        return "Tablet";
    }

    if (/mobile/i.test(userAgent)) {
        return "Mobile";
    }

    return "Desktop";
}


// ==========================================
// BROWSER DETECTION
// ==========================================

function detectBrowser(userAgent) {

    if (!userAgent) return "Unknown";

    if (/Edg/i.test(userAgent)) {
        return "Edge";
    }

    if (/Chrome/i.test(userAgent)) {
        return "Chrome";
    }

    if (/Firefox/i.test(userAgent)) {
        return "Firefox";
    }

    if (/Safari/i.test(userAgent)) {
        return "Safari";
    }

    return "Other";
}


// ==========================================
// GET VISITOR LOCATION
// ==========================================

async function getLocation(ip) {

    try {

        // Localhost addresses cannot be geolocated
        if (
            !ip ||
            ip === "::1" ||
            ip === "127.0.0.1" ||
            ip === "::ffff:127.0.0.1"
        ) {

            return {
                country: "Localhost",
                region: "Local",
                city: "Local"
            };
        }


        const response = await fetch(
            `https://ipapi.co/${ip}/json/`,
            {
                headers: {
                    "User-Agent": "Aureon-Consultancy-Analytics/1.0"
                }
            }
        );


        if (!response.ok) {

            console.log("Location lookup failed:", response.status);

            return {
                country: "Unknown",
                region: "Unknown",
                city: "Unknown"
            };
        }


        const location = await response.json();


        return {

            country: location.country_name || "Unknown",

            region: location.region || "Unknown",

            city: location.city || "Unknown"

        };


    } catch (error) {

        console.error("Location lookup error:", error);

        return {

            country: "Unknown",

            region: "Unknown",

            city: "Unknown"

        };
    }
}


// ==========================================
// RECORD VISITOR / PAGE VIEW
// ==========================================

router.post("/track", async (req, res) => {

    try {

        const {
            sessionId,
            page,
            referrer
        } = req.body;


        const userAgent =
            req.headers["user-agent"] || "";


        const forwardedFor = req.headers["x-forwarded-for"];

const ip =
    (forwardedFor
        ? forwardedFor.split(",")[0].trim()
        : req.socket.remoteAddress
    ) || "";


        const finalSessionId =
            sessionId || crypto.randomUUID();


        // Get approximate location
        const location =
            await getLocation(ip);


        const insert = db.prepare(`

            INSERT INTO visitors (

                session_id,
                ip_address,
                country,
                region,
                city,
                page,
                user_agent,
                device,
                browser,
                referrer

            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

        `);


        insert.run(

            finalSessionId,

            ip,

            location.country,

            location.region,

            location.city,

            page || "/",

            userAgent,

            detectDevice(userAgent),

            detectBrowser(userAgent),

            referrer || ""

        );


        res.json({

            success: true,

            location: {

                country: location.country,

                region: location.region,

                city: location.city

            }

        });


    } catch (error) {

        console.error(error);


        res.status(500).json({

            error: "Unable to record visitor"

        });

    }

});


// ==========================================
// ADMIN DASHBOARD ANALYTICS
// ==========================================

router.get("/dashboard", authenticateToken, (req, res) => {


    // UNIQUE VISITORS

    const totalVisitors = db.prepare(`

        SELECT COUNT(DISTINCT session_id) AS total

        FROM visitors

    `).get();


    // UNIQUE VISITORS TODAY

    const todayVisitors = db.prepare(`

        SELECT COUNT(DISTINCT session_id) AS total

        FROM visitors

        WHERE date(visited_at) = date('now')

    `).get();


    // TOTAL PAGE VIEWS

    const totalPageViews = db.prepare(`

        SELECT COUNT(*) AS total

        FROM visitors

    `).get();


    // TOTAL CONTACTS

    const totalContacts = db.prepare(`

        SELECT COUNT(*) AS total

        FROM contacts

    `).get();


    // COUNTRIES

    const countries = db.prepare(`

        SELECT

            country,

            COUNT(DISTINCT session_id) AS visitors

        FROM visitors

        GROUP BY country

        ORDER BY visitors DESC

        LIMIT 10

    `).all();


    // POPULAR PAGES

    const pages = db.prepare(`

        SELECT

            page,

            COUNT(*) AS views

        FROM visitors

        GROUP BY page

        ORDER BY views DESC

        LIMIT 10

    `).all();


    // DEVICES

    const devices = db.prepare(`

        SELECT

            device,

            COUNT(DISTINCT session_id) AS visitors

        FROM visitors

        GROUP BY device

        ORDER BY visitors DESC

    `).all();


    // BROWSERS

    const browsers = db.prepare(`

        SELECT

            browser,

            COUNT(DISTINCT session_id) AS visitors

        FROM visitors

        GROUP BY browser

        ORDER BY visitors DESC

    `).all();


    res.json({

        totalVisitors: totalVisitors.total,

        todayVisitors: todayVisitors.total,

        totalPageViews: totalPageViews.total,

        totalContacts: totalContacts.total,

        countries,

        pages,

        devices,

        browsers

    });

});


// ==========================================
// RECENT VISITORS
// ==========================================

router.get("/visitors", authenticateToken, (req, res) => {

    const visitors = db.prepare(`

        SELECT

            id,

            country,

            region,

            city,

            page,

            device,

            browser,

            referrer,

            visited_at

        FROM visitors

        ORDER BY visited_at DESC

        LIMIT 100

    `).all();


    res.json(visitors);

});


module.exports = router;