// ==========================================================
// CITYCARE
// SERVER.JS - VERSION POUR VERCEL
// ==========================================================

const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();

// ==========================================================
// DATABASE
// ==========================================================

const db = require("./db");

if (!db) {
    console.error("❌ Impossible de charger la base de données.");
}

// ==========================================================
// ROUTES
// ==========================================================

const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const signalementRoutes = require("./routes/signalement");
const rendezvousRoutes = require("./routes/rendezvous");
const transportRoutes = require("./routes/transport");
const adminRoutes = require("./routes/admin");
const registerAdminRoutes = require("./routes/register-admin");

// ==========================================================
// MIDDLEWARES GÉNÉRAUX
// ==========================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================================
// SESSION
// ==========================================================

app.use(
    session({
        secret: process.env.SESSION_SECRET || "citycare-secret-2026",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        }
    })
);

// ==========================================================
// FICHIERS STATIQUES
// ==========================================================

app.use(express.static(path.join(__dirname, "public")));

// ==========================================================
// AUTHENTIFICATION CITOYEN
// ==========================================================

app.use("/auth", authRoutes);

// ==========================================================
// DASHBOARD CITOYEN
// ==========================================================

app.use("/dashboard", dashboardRoutes);

// ==========================================================
// SIGNALEMENT CITOYEN
// ==========================================================

app.use("/signalement", signalementRoutes);

// ==========================================================
// RENDEZ-VOUS CITOYEN
// ==========================================================

app.use("/rendezvous", rendezvousRoutes);

// ==========================================================
// TRANSPORT
// ==========================================================

app.use("/transport", transportRoutes);

// ==========================================================
// CRÉATION COMPTE ADMIN
// ==========================================================

app.use("/register-admin", registerAdminRoutes);

// ==========================================================
// ADMINISTRATION
// ==========================================================

app.use("/admin", adminRoutes);

// ==========================================================
// PAGE ACCUEIL
// GET /
// ==========================================================

app.get("/", (req, res) => {
    return res.sendFile(path.join(__dirname, "views", "index.html"));
});

// ==========================================================
// PAGE INSCRIPTION CITOYEN
// GET /register
// ==========================================================

app.get("/register", (req, res) => {
    return res.sendFile(path.join(__dirname, "views", "register.html"));
});

// ==========================================================
// PAGE CONNEXION
// GET /login
// ==========================================================

app.get("/login", (req, res) => {
    return res.sendFile(path.join(__dirname, "views", "login.html"));
});

// ==========================================================
// PAGE PROFIL
// GET /profile
// ==========================================================

app.get("/profile", (req, res) => {
    if (!req.session || !req.session.user) {
        return res.redirect("/login");
    }

    if (req.session.user.role === "admin") {
        return res.redirect("/admin");
    }

    return res.sendFile(path.join(__dirname, "views", "profile.html"));
});

// ==========================================================
// TEST SERVEUR
// GET /test
// ==========================================================

app.get("/test", (req, res) => {
    const connecte = !!(req.session && req.session.user);

    return res.json({
        succes: true,
        message: "Serveur CityCare opérationnel.",
        connecte: connecte,
        utilisateur: connecte ? req.session.user : null
    });
});

// ==========================================================
// TEST SESSION
// GET /test-session
// ==========================================================

app.get("/test-session", (req, res) => {
    console.log("========================================");
    console.log("🔎 TEST SESSION");
    console.log("Session ID :", req.sessionID);
    console.log("Utilisateur :", req.session ? req.session.user : null);
    console.log("========================================");

    return res.json({
        succes: true,
        session_id: req.sessionID,
        connecte: !!(req.session && req.session.user),
        utilisateur: req.session && req.session.user ? req.session.user : null
    });
});

// ==========================================================
// ROUTE 404
// ==========================================================

app.use((req, res) => {
    console.log(`❌ 404 : ${req.method} ${req.originalUrl}`);

    return res.status(404).json({
        succes: false,
        message: "Route introuvable.",
        methode: req.method,
        url: req.originalUrl
    });
});

// ==========================================================
// GESTION DES ERREURS
// ==========================================================

app.use((erreur, req, res, next) => {
    console.error("========================================");
    console.error("❌ ERREUR SERVEUR");
    console.error(erreur);
    console.error("========================================");

    if (res.headersSent) {
        return next(erreur);
    }

    return res.status(500).json({
        succes: false,
        message: "Erreur interne du serveur.",
        erreur: erreur.message
    });
});

// ==========================================================
// EXPORT POUR VERCEL (MODIFICATION N°1)
// ==========================================================

module.exports = app;

// ==========================================================
// DÉMARRAGE LOCAL (MODIFICATION N°2)
// ==========================================================

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log("");
        console.log("========================================");
        console.log("🚀 CITYCARE");
        console.log("========================================");
        console.log(`🌐 Serveur : http://localhost:${PORT}`);
        console.log("");
        console.log(`🏠 Accueil : http://localhost:${PORT}/`);
        console.log(`🔐 Connexion : http://localhost:${PORT}/login`);
        console.log(`📝 Inscription : http://localhost:${PORT}/register`);
        console.log(`🔑 Création admin : http://localhost:${PORT}/register-admin`);
        console.log(`👤 Profil : http://localhost:${PORT}/profile`);
        console.log("");
        console.log(`📊 Dashboard citoyen : http://localhost:${PORT}/dashboard`);
        console.log(`🚨 Signalement citoyen : http://localhost:${PORT}/signalement`);
        console.log(`📅 Rendez-vous : http://localhost:${PORT}/rendezvous`);
        console.log(`🚌 Transport : http://localhost:${PORT}/transport`);
        console.log("");
        console.log(`⚙️ Administration : http://localhost:${PORT}/admin`);
        console.log(`📢 Gestion signalements : http://localhost:${PORT}/admin#signalements`);
        console.log(`📅 Gestion rendez-vous : http://localhost:${PORT}/admin#rendezvous`);
        console.log(`👥 Gestion utilisateurs : http://localhost:${PORT}/admin#utilisateurs`);
        console.log(`🚌 Gestion transport : http://localhost:${PORT}/admin#transport`);
        console.log("");
        console.log(`🧪 Test serveur : http://localhost:${PORT}/test`);
        console.log(`🔎 Test session : http://localhost:${PORT}/test-session`);
        console.log("");
        console.log("========================================");
        console.log("✅ Serveur CityCare prêt.");
        console.log("========================================");
        console.log("");
    });
}