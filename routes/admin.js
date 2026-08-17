// ==========================================================
// CITYCARE
// routes/admin.js
// ADMINISTRATION UNIFIÉE
// ==========================================================

const express = require("express");
const path = require("path");

const router = express.Router();

const db = require("../db");


// ==========================================================
// DATABASE PROMISE
// ==========================================================

const database =
    typeof db.promise === "function"
        ? db.promise()
        : db;


// ==========================================================
// VERIFICATION ADMIN
// ==========================================================

function verifierAdmin(
    req,
    res,
    next
) {

    if (
        !req.session ||
        !req.session.user
    ) {

        if (
            req.originalUrl.includes(
                "/api/"
            )
        ) {

            return res.status(401).json({

                succes: false,

                message:
                    "Vous devez être connecté."

            });

        }


        return res.redirect(
            "/login"
        );

    }


    if (
        req.session.user.role !==
        "admin"
    ) {

        if (
            req.originalUrl.includes(
                "/api/"
            )
        ) {

            return res.status(403).json({

                succes: false,

                message:
                    "Accès réservé aux administrateurs."

            });

        }


        return res.redirect(
            "/dashboard"
        );

    }


    next();

}


// ==========================================================
// PAGE ADMIN UNIQUE
// ==========================================================

function envoyerPageAdmin(
    req,
    res
) {

    return res.sendFile(

        path.join(
            __dirname,
            "..",
            "views",
            "admin.html"
        )

    );

}


// ==========================================================
// PAGES
// ==========================================================

router.get(
    "/",
    verifierAdmin,
    envoyerPageAdmin
);

router.get(
    "/dashboard",
    verifierAdmin,
    envoyerPageAdmin
);

router.get(
    "/signalements",
    verifierAdmin,
    envoyerPageAdmin
);

router.get(
    "/rendezvous",
    verifierAdmin,
    envoyerPageAdmin
);

router.get(
    "/utilisateurs",
    verifierAdmin,
    envoyerPageAdmin
);

router.get(
    "/transport",
    verifierAdmin,
    envoyerPageAdmin
);

router.get(
    "/statistiques",
    verifierAdmin,
    envoyerPageAdmin
);

router.get(
    "/securite",
    verifierAdmin,
    envoyerPageAdmin
);

router.get(
    "/parametres",
    verifierAdmin,
    envoyerPageAdmin
);


// ==========================================================
// ME
// GET /admin/api/me
// ==========================================================

router.get(
    "/api/me",
    verifierAdmin,
    async (
        req,
        res
    ) => {

        try {

            const idUser =
                req.session.user.id_user;


            const [
                rows
            ] =
                await database.query(
                    `
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
                    `,
                    [
                        idUser
                    ]
                );


            if (!rows.length) {

                return res.status(404).json({

                    succes: false,

                    message:
                        "Administrateur introuvable."

                });

            }


            return res.json({

                succes: true,

                utilisateur:
                    rows[0]

            });

        }
        catch (erreur) {

            console.error(
                "ERREUR API ME :",
                erreur
            );


            return res.status(500).json({

                succes: false,

                message:
                    "Impossible de charger l'administrateur."

            });

        }

    }
);


// ==========================================================
// LOGOUT
// POST /admin/api/logout
// ==========================================================

router.post(
    "/api/logout",
    verifierAdmin,
    (
        req,
        res
    ) => {

        req.session.destroy(
            erreur => {

                if (erreur) {

                    console.error(
                        "ERREUR LOGOUT :",
                        erreur
                    );


                    return res.status(500).json({

                        succes: false,

                        message:
                            "Impossible de vous déconnecter."

                    });

                }


                res.clearCookie(
                    "connect.sid"
                );


                return res.json({

                    succes: true,

                    message:
                        "Déconnexion réussie."

                });

            }
        );

    }
);


// ==========================================================
// DASHBOARD
// GET /admin/api/dashboard
// ==========================================================

router.get(
    "/api/dashboard",
    verifierAdmin,
    async (
        req,
        res
    ) => {

        try {

            const [
                [utilisateurs],
                [citoyens],
                [admins],
                [signalements],
                [attente],
                [enCours],
                [resolus],
                [rendezvous],
                [rdvAttente],
                [transports]
            ] =
                await Promise.all([

                    database.query(`
                        SELECT COUNT(*) AS total
                        FROM users
                    `),

                    database.query(`
                        SELECT COUNT(*) AS total
                        FROM users
                        WHERE role = 'citoyen'
                    `),

                    database.query(`
                        SELECT COUNT(*) AS total
                        FROM users
                        WHERE role = 'admin'
                    `),

                    database.query(`
                        SELECT COUNT(*) AS total
                        FROM signalements
                    `),

                    database.query(`
                        SELECT COUNT(*) AS total
                        FROM signalements
                        WHERE statut = 'En attente'
                    `),

                    database.query(`
                        SELECT COUNT(*) AS total
                        FROM signalements
                        WHERE statut = 'En cours'
                    `),

                    database.query(`
                        SELECT COUNT(*) AS total
                        FROM signalements
                        WHERE statut = 'Résolu'
                    `),

                    database.query(`
                        SELECT COUNT(*) AS total
                        FROM rendez_vous
                    `),

                    database.query(`
                        SELECT COUNT(*) AS total
                        FROM rendez_vous
                        WHERE statut = 'En attente'
                    `),

                    database.query(`
                        SELECT COUNT(*) AS total
                        FROM transports
                    `)

                ]);


            return res.json({

                succes: true,

                statistiques: {

                    utilisateurs:
                        utilisateurs[0].total,

                    citoyens:
                        citoyens[0].total,

                    admins:
                        admins[0].total,

                    signalements:
                        signalements[0].total,

                    signalements_attente:
                        attente[0].total,

                    signalements_en_cours:
                        enCours[0].total,

                    signalements_resolus:
                        resolus[0].total,

                    rendezvous:
                        rendezvous[0].total,

                    rendezvous_attente:
                        rdvAttente[0].total,

                    transports:
                        transports[0].total

                }

            });

        }
        catch (erreur) {

            console.error(
                "ERREUR DASHBOARD :",
                erreur
            );


            return res.status(500).json({

                succes: false,

                message:
                    "Impossible de charger le tableau de bord."

            });

        }

    }
);


// ==========================================================
// ACTIVITES
// ==========================================================

router.get(
    "/api/activites",
    verifierAdmin,
    async (
        req,
        res
    ) => {

        try {

            const [
                rows
            ] =
                await database.query(
                    `
                    SELECT *
                    FROM (

                        SELECT

                            'signalement' AS type,

                            s.id_signalement AS id,

                            s.titre AS titre,

                            s.statut AS statut,

                            s.date_signalement AS date,

                            CONCAT(
                                u.prenom,
                                ' ',
                                u.nom
                            ) AS utilisateur

                        FROM signalements s

                        INNER JOIN users u
                            ON u.id_user =
                               s.id_user


                        UNION ALL


                        SELECT

                            'rendezvous' AS type,

                            r.id_rdv AS id,

                            r.service AS titre,

                            r.statut AS statut,

                            CONCAT(
                                r.date_rdv,
                                ' ',
                                r.heure_rdv
                            ) AS date,

                            CONCAT(
                                u.prenom,
                                ' ',
                                u.nom
                            ) AS utilisateur

                        FROM rendez_vous r

                        INNER JOIN users u
                            ON u.id_user =
                               r.id_user

                    ) AS activites

                    ORDER BY date DESC

                    LIMIT 10
                    `
                );


            return res.json({

                succes: true,

                activites:
                    rows

            });

        }
        catch (erreur) {

            console.error(
                "ERREUR ACTIVITES :",
                erreur
            );


            return res.status(500).json({

                succes: false,

                message:
                    "Impossible de charger les activités."

            });

        }

    }
);


// ==========================================================
// SIGNALEMENTS
// GET /admin/api/signalements
// ==========================================================

router.get(
    "/api/signalements",
    verifierAdmin,
    async (
        req,
        res
    ) => {

        try {

            const [
                rows
            ] =
                await database.query(
                    `
                    SELECT

                        s.id_signalement,
                        s.id_user,
                        s.id_categorie,
                        s.id_type,
                        s.id_quartier,

                        s.titre,
                        s.description,
                        s.depuis_quand,
                        s.photo,
                        s.statut,
                        s.date_signalement,

                        CONCAT(
                            u.nom,
                            ' ',
                            u.prenom
                        ) AS citoyen,

                        u.username,
                        u.email,

                        c.nom AS categorie,

                        tp.nom AS type_probleme,

                        q.nom AS quartier

                    FROM signalements s

                    INNER JOIN users u
                        ON u.id_user =
                           s.id_user

                    INNER JOIN categories c
                        ON c.id_categorie =
                           s.id_categorie

                    INNER JOIN types_problemes tp
                        ON tp.id_type =
                           s.id_type

                    INNER JOIN quartiers q
                        ON q.id_quartier =
                           s.id_quartier

                    ORDER BY
                        s.date_signalement DESC
                    `
                );


            return res.json({

                succes: true,

                total:
                    rows.length,

                signalements:
                    rows

            });

        }
        catch (erreur) {

            console.error(
                "ERREUR SIGNALEMENTS :",
                erreur
            );


            return res.status(500).json({

                succes: false,

                message:
                    "Impossible de charger les signalements."

            });

        }

    }
);


// ==========================================================
// DETAIL SIGNALEMENT
// ==========================================================

router.get(
    "/api/signalements/:id",
    verifierAdmin,
    async (
        req,
        res
    ) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            if (
                !Number.isInteger(id)
            ) {

                return res.status(400).json({

                    succes: false,

                    message:
                        "Identifiant invalide."

                });

            }


            const [
                rows
            ] =
                await database.query(
                    `
                    SELECT

                        s.*,

                        CONCAT(
                            u.nom,
                            ' ',
                            u.prenom
                        ) AS citoyen,

                        u.username,
                        u.email,

                        c.nom AS categorie,

                        tp.nom AS type_probleme,

                        q.nom AS quartier

                    FROM signalements s

                    INNER JOIN users u
                        ON u.id_user =
                           s.id_user

                    INNER JOIN categories c
                        ON c.id_categorie =
                           s.id_categorie

                    INNER JOIN types_problemes tp
                        ON tp.id_type =
                           s.id_type

                    INNER JOIN quartiers q
                        ON q.id_quartier =
                           s.id_quartier

                    WHERE
                        s.id_signalement = ?

                    LIMIT 1
                    `,
                    [
                        id
                    ]
                );


            if (!rows.length) {

                return res.status(404).json({

                    succes: false,

                    message:
                        "Signalement introuvable."

                });

            }


            return res.json({

                succes: true,

                signalement:
                    rows[0]

            });

        }
        catch (erreur) {

            console.error(
                "ERREUR DETAIL SIGNALEMENT :",
                erreur
            );


            return res.status(500).json({

                succes: false,

                message:
                    "Impossible de charger le signalement."

            });

        }

    }
);


// ==========================================================
// MODIFIER STATUT SIGNALEMENT
// PUT /admin/api/signalements/:id/statut
// ==========================================================

router.put(
    "/api/signalements/:id/statut",
    verifierAdmin,
    async (
        req,
        res
    ) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            const statut =
                req.body?.statut;


            const statuts = [

                "En attente",
                "En cours",
                "Résolu",
                "Rejeté"

            ];


            if (
                !Number.isInteger(id)
            ) {

                return res.status(400).json({

                    succes: false,

                    message:
                        "Identifiant invalide."

                });

            }


            if (
                !statuts.includes(
                    statut
                )
            ) {

                return res.status(400).json({

                    succes: false,

                    message:
                        "Statut invalide."

                });

            }


            const [
                resultat
            ] =
                await database.query(
                    `
                    UPDATE signalements

                    SET statut = ?

                    WHERE id_signalement = ?
                    `,
                    [
                        statut,
                        id
                    ]
                );


            if (
                resultat.affectedRows === 0
            ) {

                return res.status(404).json({

                    succes: false,

                    message:
                        "Signalement introuvable."

                });

            }


            return res.json({

                succes: true,

                message:
                    "Statut du signalement modifié."

            });

        }
        catch (erreur) {

            console.error(
                "ERREUR STATUT SIGNALEMENT :",
                erreur
            );


            return res.status(500).json({

                succes: false,

                message:
                    "Impossible de modifier le statut."

            });

        }

    }
);


// ==========================================================
// RENDEZ-VOUS
// GET /admin/api/rendezvous
// ==========================================================

router.get(
    "/api/rendezvous",
    verifierAdmin,
    async (
        req,
        res
    ) => {

        try {

            const [
                rows
            ] =
                await database.query(
                    `
                    SELECT

                        r.id_rdv,
                        r.id_user,
                        r.id_centre,

                        r.service,
                        r.date_rdv,
                        r.heure_rdv,
                        r.statut,

                        CONCAT(
                            u.nom,
                            ' ',
                            u.prenom
                        ) AS citoyen,

                        u.username,
                        u.email,

                        cs.nom AS centre,
                        cs.adresse,
                        cs.telephone

                    FROM rendez_vous r

                    INNER JOIN users u
                        ON u.id_user =
                           r.id_user

                    INNER JOIN centres_sante cs
                        ON cs.id_centre =
                           r.id_centre

                    ORDER BY
                        r.date_rdv DESC,
                        r.heure_rdv DESC
                    `
                );


            return res.json({

                succes: true,

                total:
                    rows.length,

                rendezvous:
                    rows

            });

        }
        catch (erreur) {

            console.error(
                "ERREUR RENDEZ-VOUS :",
                erreur
            );


            return res.status(500).json({

                succes: false,

                message:
                    "Impossible de charger les rendez-vous."

            });

        }

    }
);


// ==========================================================
// MODIFIER STATUT RENDEZ-VOUS
// PUT /admin/api/rendezvous/:id/statut
// ==========================================================

router.put(
    "/api/rendezvous/:id/statut",
    verifierAdmin,
    async (
        req,
        res
    ) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            const statut =
                req.body?.statut;


            const statuts = [

                "En attente",
                "En cours",
                "Terminé",
                "Refusé"

            ];


            if (
                !Number.isInteger(id)
            ) {

                return res.status(400).json({

                    succes: false,

                    message:
                        "Identifiant invalide."

                });

            }


            if (
                !statuts.includes(
                    statut
                )
            ) {

                return res.status(400).json({

                    succes: false,

                    message:
                        "Statut invalide."

                });

            }


            const [
                resultat
            ] =
                await database.query(
                    `
                    UPDATE rendez_vous

                    SET statut = ?

                    WHERE id_rdv = ?
                    `,
                    [
                        statut,
                        id
                    ]
                );


            if (
                resultat.affectedRows === 0
            ) {

                return res.status(404).json({

                    succes: false,

                    message:
                        "Rendez-vous introuvable."

                });

            }


            return res.json({

                succes: true,

                message:
                    "Statut du rendez-vous modifié."

            });

        }
        catch (erreur) {

            console.error(
                "ERREUR STATUT RDV :",
                erreur
            );


            return res.status(500).json({

                succes: false,

                message:
                    "Impossible de modifier le rendez-vous."

            });

        }

    }
);


// ==========================================================
// UTILISATEURS
// GET /admin/api/utilisateurs
// ==========================================================

router.get(
    "/api/utilisateurs",
    verifierAdmin,
    async (
        req,
        res
    ) => {

        try {

            const [
                rows
            ] =
                await database.query(
                    `
                    SELECT

                        id_user,
                        nom,
                        prenom,
                        username,
                        email,
                        role,
                        date_creation

                    FROM users

                    ORDER BY
                        date_creation DESC
                    `
                );


            return res.json({

                succes: true,

                total:
                    rows.length,

                utilisateurs:
                    rows

            });

        }
        catch (erreur) {

            console.error(
                "ERREUR UTILISATEURS :",
                erreur
            );


            return res.status(500).json({

                succes: false,

                message:
                    "Impossible de charger les utilisateurs."

            });

        }

    }
);


// ==========================================================
// TRANSPORTS
// GET /admin/api/transports
// ==========================================================

router.get(
    "/api/transports",
    verifierAdmin,
    async (
        req,
        res
    ) => {

        try {

            const [
                rows
            ] =
                await database.query(
                    `
                    SELECT

                        id_transport,
                        numero_ligne,
                        depart,
                        arrivee

                    FROM transports

                    ORDER BY
                        numero_ligne ASC
                    `
                );


            return res.json({

                succes: true,

                total:
                    rows.length,

                transports:
                    rows

            });

        }
        catch (erreur) {

            console.error(
                "ERREUR TRANSPORTS :",
                erreur
            );


            return res.status(500).json({

                succes: false,

                message:
                    "Impossible de charger les transports."

            });

        }

    }
);


// ==========================================================
// AJOUTER TRANSPORT
// POST /admin/api/transports
// ==========================================================

router.post(
    "/api/transports",
    verifierAdmin,
    async (
        req,
        res
    ) => {

        try {

            const numero =
                String(
                    req.body?.numero_ligne ||
                    ""
                ).trim();


            const depart =
                String(
                    req.body?.depart ||
                    ""
                ).trim();


            const arrivee =
                String(
                    req.body?.arrivee ||
                    ""
                ).trim();


            if (
                !numero ||
                !depart ||
                !arrivee
            ) {

                return res.status(400).json({

                    succes: false,

                    message:
                        "Tous les champs sont obligatoires."

                });

            }


            const [
                resultat
            ] =
                await database.query(
                    `
                    INSERT INTO transports
                    (
                        numero_ligne,
                        depart,
                        arrivee
                    )

                    VALUES
                    (
                        ?,
                        ?,
                        ?
                    )
                    `,
                    [
                        numero,
                        depart,
                        arrivee
                    ]
                );


            return res.json({

                succes: true,

                message:
                    "Ligne de transport ajoutée.",

                id_transport:
                    resultat.insertId

            });

        }
        catch (erreur) {

            console.error(
                "ERREUR AJOUT TRANSPORT :",
                erreur
            );


            return res.status(500).json({

                succes: false,

                message:
                    "Impossible d'ajouter la ligne."

            });

        }

    }
);


// ==========================================================
// MODIFIER TRANSPORT
// PUT /admin/api/transports/:id
// ==========================================================

router.put(
    "/api/transports/:id",
    verifierAdmin,
    async (
        req,
        res
    ) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            const numero =
                String(
                    req.body?.numero_ligne ||
                    ""
                ).trim();


            const depart =
                String(
                    req.body?.depart ||
                    ""
                ).trim();


            const arrivee =
                String(
                    req.body?.arrivee ||
                    ""
                ).trim();


            if (
                !Number.isInteger(id)
            ) {

                return res.status(400).json({

                    succes: false,

                    message:
                        "Identifiant invalide."

                });

            }


            const [
                resultat
            ] =
                await database.query(
                    `
                    UPDATE transports

                    SET
                        numero_ligne = ?,
                        depart = ?,
                        arrivee = ?

                    WHERE id_transport = ?
                    `,
                    [
                        numero,
                        depart,
                        arrivee,
                        id
                    ]
                );


            if (
                resultat.affectedRows === 0
            ) {

                return res.status(404).json({

                    succes: false,

                    message:
                        "Ligne introuvable."

                });

            }


            return res.json({

                succes: true,

                message:
                    "Ligne de transport modifiée."

            });

        }
        catch (erreur) {

            console.error(
                "ERREUR MODIFICATION TRANSPORT :",
                erreur
            );


            return res.status(500).json({

                succes: false,

                message:
                    "Impossible de modifier la ligne."

            });

        }

    }
);


// ==========================================================
// SUPPRIMER TRANSPORT
// DELETE /admin/api/transports/:id
// ==========================================================

router.delete(
    "/api/transports/:id",
    verifierAdmin,
    async (
        req,
        res
    ) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            if (
                !Number.isInteger(id)
            ) {

                return res.status(400).json({

                    succes: false,

                    message:
                        "Identifiant invalide."

                });

            }


            const [
                resultat
            ] =
                await database.query(
                    `
                    DELETE FROM transports

                    WHERE id_transport = ?
                    `,
                    [
                        id
                    ]
                );


            if (
                resultat.affectedRows === 0
            ) {

                return res.status(404).json({

                    succes: false,

                    message:
                        "Ligne introuvable."

                });

            }


            return res.json({

                succes: true,

                message:
                    "Ligne de transport supprimée."

            });

        }
        catch (erreur) {

            console.error(
                "ERREUR SUPPRESSION TRANSPORT :",
                erreur
            );


            return res.status(500).json({

                succes: false,

                message:
                    "Impossible de supprimer la ligne."

            });

        }

    }
);


// ==========================================================
// CENTRES DE SANTE
// ==========================================================

router.get(
    "/api/centres-sante",
    verifierAdmin,
    async (
        req,
        res
    ) => {

        try {

            const [
                rows
            ] =
                await database.query(
                    `
                    SELECT

                        id_centre,
                        nom,
                        adresse,
                        telephone

                    FROM centres_sante

                    ORDER BY
                        nom ASC
                    `
                );


            return res.json({

                succes: true,

                centres:
                    rows

            });

        }
        catch (erreur) {

            console.error(
                "ERREUR CENTRES :",
                erreur
            );


            return res.status(500).json({

                succes: false,

                message:
                    "Impossible de charger les centres."

            });

        }

    }
);


// ==========================================================
// EXPORT
// ==========================================================

module.exports =
    router;