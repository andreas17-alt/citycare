// ==========================================================
// CITYCARE - ROUTES DASHBOARD CITOYEN
// routes/dashboard.js
// ==========================================================

const express = require("express");
const path = require("path");

const router = express.Router();
const db = require("../db");


// ==========================================================
// MIDDLEWARE : VÉRIFIER LA CONNEXION
// ==========================================================

function verifierConnexion(req, res, next) {

    if (!req.session || !req.session.user) {

        console.log(
            "⚠️ Accès refusé : utilisateur non connecté."
        );


        // API
        if (req.path.startsWith("/api/")) {

            return res.status(401).json({

                succes: false,

                message:
                    "Vous devez être connecté."
            });
        }


        // PAGE
        return res.redirect("/login");
    }


    next();
}


// ==========================================================
// PAGE DASHBOARD
// GET /dashboard
// ==========================================================

router.get(
    "/",
    verifierConnexion,
    (req, res) => {

        console.log(
            "📊 Ouverture du dashboard pour :",
            req.session.user.username
        );


        // --------------------------------------------------
        // ADMIN
        // --------------------------------------------------

        if (
            req.session.user.role === "admin"
        ) {

            return res.redirect("/admin");
        }


        // --------------------------------------------------
        // CITOYEN
        // --------------------------------------------------

        return res.sendFile(
            path.join(
                __dirname,
                "../views/dashboard.html"
            )
        );
    }
);


// ==========================================================
// API DASHBOARD
// GET /dashboard/api/dashboard
// ==========================================================

router.get(
    "/api/dashboard",
    verifierConnexion,
    (req, res) => {

        const idUser =
            req.session.user.id_user;


        console.log(
            "📊 Chargement dashboard utilisateur :",
            idUser
        );


        const sql = `

            SELECT

                (
                    SELECT COUNT(*)
                    FROM signalements
                    WHERE id_user = ?
                ) AS signalements,

                (
                    SELECT COUNT(*)
                    FROM rendez_vous
                    WHERE id_user = ?
                ) AS rendezvous,

                (
                    SELECT COUNT(*)
                    FROM lignes_transport
                ) AS transport

        `;


        db.query(
            sql,
            [
                idUser,
                idUser
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        "❌ Erreur statistiques dashboard :",
                        err
                    );


                    return res.status(500).json({

                        succes: false,

                        message:
                            "Impossible de charger les statistiques."
                    });
                }


                const statistiques =
                    result[0];


                console.log(
                    "✅ Statistiques dashboard :",
                    statistiques
                );


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
                    },


                    statistiques: {

                        signalements:
                            Number(
                                statistiques.signalements
                            ) || 0,

                        rendezvous:
                            Number(
                                statistiques.rendezvous
                            ) || 0,

                        transport:
                            Number(
                                statistiques.transport
                            ) || 0
                    }

                });
            }
        );
    }
);


// ==========================================================
// API ACTIVITÉS RÉCENTES
// GET /dashboard/api/activites
// ==========================================================

router.get(
    "/api/activites",
    verifierConnexion,
    (req, res) => {

        const idUser =
            req.session.user.id_user;


        console.log(
            "📋 Chargement activités utilisateur :",
            idUser
        );


        // ==================================================
        // SIGNALEMENTS
        // ==================================================

        const sqlSignalements = `

            SELECT

                date_signalement AS date,

                CONCAT(
                    'Signalement : ',
                    titre
                ) AS action,

                statut

            FROM signalements

            WHERE id_user = ?

            ORDER BY
                date_signalement DESC

            LIMIT 5

        `;


        db.query(
            sqlSignalements,
            [idUser],
            (err, signalements) => {

                if (err) {

                    console.error(
                        "❌ Erreur activités signalements :",
                        err
                    );


                    return res.status(500).json({

                        succes: false,

                        message:
                            "Impossible de récupérer les activités."
                    });
                }


                // ==================================================
                // RENDEZ-VOUS
                // ==================================================

                const sqlRendezvous = `

                    SELECT

                        CONCAT(
                            date_rdv,
                            ' ',
                            heure_rdv
                        ) AS date,

                        CONCAT(
                            'Rendez-vous : ',
                            service
                        ) AS action,

                        statut

                    FROM rendez_vous

                    WHERE id_user = ?

                    ORDER BY
                        date_rdv DESC,
                        heure_rdv DESC

                    LIMIT 5

                `;


                db.query(
                    sqlRendezvous,
                    [idUser],
                    (err, rendezvous) => {

                        if (err) {

                            console.error(
                                "❌ Erreur activités rendez-vous :",
                                err
                            );


                            return res.status(500).json({

                                succes: false,

                                message:
                                    "Impossible de récupérer les activités."
                            });
                        }


                        // ==================================================
                        // COMBINER
                        // ==================================================

                        const activites = [

                            ...signalements.map(
                                (item) => ({

                                    date:
                                        item.date,

                                    action:
                                        item.action,

                                    statut:
                                        item.statut
                                })
                            ),


                            ...rendezvous.map(
                                (item) => ({

                                    date:
                                        item.date,

                                    action:
                                        item.action,

                                    statut:
                                        item.statut
                                })
                            )

                        ];


                        // ==================================================
                        // TRIER
                        // ==================================================

                        activites.sort(
                            (a, b) => {

                                return (
                                    new Date(b.date) -
                                    new Date(a.date)
                                );
                            }
                        );


                        // ==================================================
                        // 10 PLUS RÉCENTES
                        // ==================================================

                        const activitesRecentes =
                            activites.slice(
                                0,
                                10
                            );


                        console.log(
                            "✅ Activités récupérées :",
                            activitesRecentes.length
                        );


                        // ==================================================
                        // RÉPONSE
                        // ==================================================

                        return res.json({

                            succes: true,

                            activites:
                                activitesRecentes
                        });
                    }
                );
            }
        );
    }
);


// ==========================================================
// API PROFIL
// GET /dashboard/api/profil
// ==========================================================

router.get(
    "/api/profil",
    verifierConnexion,
    (req, res) => {

        const idUser =
            req.session.user.id_user;


        const sql = `

            SELECT

                id_user,
                nom,
                prenom,
                username,
                email,
                role,
                date_creation

            FROM users

            WHERE id_user = ?

            LIMIT 1

        `;


        db.query(
            sql,
            [idUser],
            (err, result) => {

                if (err) {

                    console.error(
                        "❌ Erreur profil dashboard :",
                        err
                    );


                    return res.status(500).json({

                        succes: false,

                        message:
                            "Impossible de récupérer votre profil."
                    });
                }


                if (
                    result.length === 0
                ) {

                    return res.status(404).json({

                        succes: false,

                        message:
                            "Utilisateur introuvable."
                    });
                }


                return res.json({

                    succes: true,

                    utilisateur:
                        result[0]
                });
            }
        );
    }
);


// ==========================================================
// EXPORT
// ==========================================================

module.exports = router;