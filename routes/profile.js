// ==========================================================
// CITYCARE - ROUTES PROFILE
// ==========================================================

const express = require("express");
const path = require("path");

const router = express.Router();


// ==========================================================
// MIDDLEWARE CONNEXION
// ==========================================================

function verifierConnexion(req, res, next) {

    console.log("🔐 Vérification profil");

    if (
        !req.session ||
        !req.session.user
    ) {

        console.log("❌ Profil : utilisateur non connecté");

        return res.redirect("/login");
    }

    console.log(
        "✅ Profil : utilisateur connecté :",
        req.session.user.username
    );

    next();
}


// ==========================================================
// GET /profile
// PAGE PROFIL
// ==========================================================

router.get(
    "/",
    verifierConnexion,
    (req, res) => {

        console.log(
            "👤 Ouverture du profil pour :",
            req.session.user.username
        );

        return res.sendFile(
            path.join(
                __dirname,
                "../views/profile.html"
            )
        );
    }
);


// ==========================================================
// GET /profile/api
// INFORMATIONS UTILISATEUR
// ==========================================================

router.get(
    "/api",
    verifierConnexion,
    (req, res) => {

        return res.json({

            succes: true,

            utilisateur: {

                id_user:
                    req.session.user.id_user,

                nom:
                    req.session.user.nom,

                prenom:
                    req.session.user.prenom,

                username:
                    req.session.user.username,

                email:
                    req.session.user.email,

                role:
                    req.session.user.role

            }

        });

    }
);


// ==========================================================
// EXPORT
// ==========================================================

module.exports = router;