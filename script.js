const navMarkup = `
<a class="brand" href="index.html" aria-label="Aureon home">
  <span class="brand-mark">A</span>
  <span><strong>AUREON</strong>
  <small>MANAGEMENT & CONSULTANCY FIRM</small>
  </span>
</a>
<button class="menu-toggle" aria-label="Open menu">☰</button>
<nav class="nav">
  <a href="index.html">Home</a>
  <a href="about.html">About Us</a>
  <a href="services.html">Services</a>
  <a href="industries.html">Industries</a>
  <a href="approach.html">Our Approach</a>
  <a href="portfolio.html">Portfolio</a>
  <a href="contact.html">Contact</a>
  <a class="nav-cta" href="contact.html">Let's Talk</a>
</nav>`;
document.querySelectorAll('.site-header').forEach(h=>h.innerHTML=navMarkup);
const current = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav a').forEach(a=>{ if(a.getAttribute('href')===current) a.classList.add('active'); });
document.querySelector('.menu-toggle')?.addEventListener('click',()=>document.querySelector('.nav').classList.toggle('open'));
document.querySelectorAll('.footer').forEach(f=>f.innerHTML='<div>Strategic Thinking · Measurable Impact · Lasting Growth</div><small>Management Consulting · Business Development · Strategy · Digital Solutions</small>');
// ==========================================
// AUREON CONTACT FORM
// ==========================================

const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData(contactForm);

        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            subject: formData.get("subject"),
            message: formData.get("message")
        };

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                alert("Thank you! Your message has been received by Aureon Consultancy Firm.");
                contactForm.reset();
            } else {
                alert("Sorry, your message could not be sent. Please try again.");
            }

        } catch (error) {
            console.error("Contact form error:", error);
            alert("Unable to connect to the server. Please try again later.");
        }
    });
}
// ==========================================
// AUREON VISITOR TRACKING
// ==========================================

(function () {
    const storageKey = "aureon_session_id";

    let sessionId = localStorage.getItem(storageKey);

    if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem(storageKey, sessionId);
    }

    fetch("/api/analytics/track", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            sessionId: sessionId,
            page: window.location.pathname,
            referrer: document.referrer
        })
    }).catch(function (error) {
        console.log("Analytics unavailable:", error);
    });
})();