// ==========================================================
// CITYCARE - MIDDLEWARE AUTHENTIFICATION
// middleware/auth.js
// ==========================================================


// ==========================================================
// VÉRIFIER SI L'UTILISATEUR EST CONNECTÉ
// ==========================================================

function verifierConnexion(req, res, next) {

    console.log("🔐 Vérification connexion");

    console.log(
        "Session :",
        req.session
    );

    console.log(
        "Utilisateur :",
        req.session
            ? req.session.user
            : null
    );

    // ------------------------------------------------------
    // PAS CONNECTÉ
    // ------------------------------------------------------

    if (
        !req.session ||
        !req.session.user
    ) {

        console.log(
            "❌ Utilisateur non connecté"
        );

        return res.status(401).json({

            succes: false,

            message:
                "Vous devez être connecté."

        });
    }

    // ------------------------------------------------------
    // CONNECTÉ
    // ------------------------------------------------------

    console.log(
        "✅ Utilisateur connecté :",
        req.session.user.username
    );

    next();
}


// ==========================================================
// VÉRIFIER SI L'UTILISATEUR EST ADMIN
// ==========================================================

function verifierAdmin(req, res, next) {

    // ------------------------------------------------------
    // Vérifier connexion
    // ------------------------------------------------------

    if (
        !req.session ||
        !req.session.user
    ) {

        return res.status(401).json({

            succes: false,

            message:
                "Vous devez être connecté."

        });
    }


    // ------------------------------------------------------
    // Vérifier rôle
    // ------------------------------------------------------

    if (
        req.session.user.role !== "admin"
    ) {

        console.log(
            "⚠️ Accès administrateur refusé :",
            req.session.user.username
        );

        return res.status(403).json({

            succes: false,

            message:
                "Accès réservé aux administrateurs."

        });
    }


    // ------------------------------------------------------
    // ADMIN AUTORISÉ
    // ------------------------------------------------------

    next();
}


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

    verifierConnexion,

    verifierAdmin

};