// ==========================================================
// CITYCARE - ROUTES SIGNALEMENTS
// routes/signalement.js
// ==========================================================

const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const router = express.Router();
const db = require("../db");


// ==========================================================
// DOSSIER UPLOAD
// ==========================================================

const uploadDirectory = path.join(
    __dirname,
    "../public/uploads/signalements"
);

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true
    });
}


// ==========================================================
// CONFIGURATION MULTER
// ==========================================================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(
            null,
            uploadDirectory
        );

    },

    filename: function (req, file, cb) {

        const extension =
            path.extname(file.originalname);

        const nomFichier =
            "signalement-" +
            Date.now() +
            "-" +
            Math.round(
                Math.random() * 100000
            ) +
            extension;

        cb(
            null,
            nomFichier
        );

    }

});


const upload = multer({

    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: function (
        req,
        file,
        cb
    ) {

        const typesAutorises = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (
            typesAutorises.includes(
                file.mimetype
            )
        ) {

            cb(
                null,
                true
            );

        } else {

            cb(
                new Error(
                    "Format de photo non accepté. Utilisez JPG, PNG ou WEBP."
                )
            );

        }

    }

});


// ==========================================================
// CATÉGORIES AUTORISÉES
// ==========================================================

const CATEGORIES_AUTORISEES = [
    1,
    5,
    3,
    4
];


// ==========================================================
// MIDDLEWARE CONNEXION
// ==========================================================

function verifierConnexion(
    req,
    res,
    next
) {

    console.log(
        "🔐 Vérification connexion - Signalement"
    );

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


    console.log(
        "✅ Utilisateur connecté :",
        req.session.user.username
    );

    next();

}


// ==========================================================
// OUTIL ID
// ==========================================================

function idValide(
    valeur
) {

    const nombre =
        Number(valeur);

    return (
        Number.isInteger(nombre) &&
        nombre > 0
    );

}


// ==========================================================
// OUTIL TEXTE
// ==========================================================

function chainePropre(
    valeur
) {

    if (
        valeur === undefined ||
        valeur === null
    ) {

        return "";

    }

    return String(
        valeur
    ).trim();

}


// ==========================================================
// PAGE SIGNALEMENT CITOYEN
// GET /signalement
// ==========================================================

router.get(
    "/",
    verifierConnexion,
    (req, res) => {

        console.log(
            "📢 Accès page signalement"
        );

        console.log(
            "Utilisateur :",
            req.session.user.username
        );


        // --------------------------------------------------
        // ADMIN
        // --------------------------------------------------

        if (
            req.session.user.role === "admin"
        ) {

            console.log(
                "👑 Administrateur → gestion des signalements"
            );

            return res.redirect(
                "/admin/signalements"
            );

        }


        // --------------------------------------------------
        // CITOYEN
        // --------------------------------------------------

        console.log(
            "👤 Citoyen → signalement.html"
        );

        return res.sendFile(
            path.join(
                __dirname,
                "../views/signalement.html"
            )
        );

    }
);


// ==========================================================
// GET /signalement/api/categories
// ==========================================================

router.get(
    "/api/categories",
    verifierConnexion,
    (req, res) => {

        const sql = `

            SELECT
                id_categorie,
                nom

            FROM categories

            WHERE
                id_categorie IN (1, 5, 3, 4)

            ORDER BY
                FIELD(
                    id_categorie,
                    1,
                    5,
                    3,
                    4
                )

        `;


        db.query(
            sql,
            (erreur, resultats) => {

                if (erreur) {

                    console.error(
                        "❌ ERREUR CATÉGORIES :",
                        erreur
                    );

                    return res.status(500).json({

                        succes: false,

                        message:
                            "Impossible de récupérer les catégories."

                    });

                }


                return res.json({

                    succes: true,

                    categories:
                        resultats

                });

            }
        );

    }
);


// ==========================================================
// GET /signalement/api/types/:id_categorie
// ==========================================================

router.get(
    "/api/types/:id_categorie",
    verifierConnexion,
    (req, res) => {

        const idCategorie =
            Number(
                req.params.id_categorie
            );


        if (
            !idValide(idCategorie)
        ) {

            return res.status(400).json({

                succes: false,

                message:
                    "Identifiant de catégorie invalide."

            });

        }


        if (
            !CATEGORIES_AUTORISEES.includes(
                idCategorie
            )
        ) {

            return res.status(400).json({

                succes: false,

                message:
                    "Cette catégorie n'est pas disponible."

            });

        }


        const sql = `

            SELECT
                id_type,
                id_categorie,
                nom,
                description

            FROM types_problemes

            WHERE
                id_categorie = ?

            ORDER BY
                id_type ASC

        `;


        db.query(
            sql,
            [idCategorie],
            (erreur, resultats) => {

                if (erreur) {

                    console.error(
                        "❌ ERREUR TYPES :",
                        erreur
                    );

                    return res.status(500).json({

                        succes: false,

                        message:
                            "Impossible de récupérer les types."

                    });

                }


                return res.json({

                    succes: true,

                    types:
                        resultats

                });

            }
        );

    }
);


// ==========================================================
// GET /signalement/api/quartiers
// ==========================================================

router.get(
    "/api/quartiers",
    verifierConnexion,
    (req, res) => {

        const sql = `

            SELECT
                id_quartier,
                nom

            FROM quartiers

            ORDER BY
                nom ASC

        `;


        db.query(
            sql,
            (erreur, resultats) => {

                if (erreur) {

                    console.error(
                        "❌ ERREUR QUARTIERS :",
                        erreur
                    );

                    return res.status(500).json({

                        succes: false,

                        message:
                            "Impossible de récupérer les quartiers."

                    });

                }


                return res.json({

                    succes: true,

                    quartiers:
                        resultats

                });

            }
        );

    }
);


// ==========================================================
// POST /signalement/api
// CRÉER UN SIGNALEMENT
// ==========================================================

router.post(
    "/api",
    verifierConnexion,
    upload.single("photo"),
    (req, res) => {

        console.log(
            "\n========================================"
        );

        console.log(
            "📥 NOUVEAU SIGNALEMENT"
        );

        console.log(
            "BODY :",
            req.body
        );

        console.log(
            "FILE :",
            req.file
        );

        console.log(
            "========================================"
        );


        // ==================================================
        // UTILISATEUR
        // ==================================================

        const idUser =
            Number(
                req.session.user.id_user
            );


        // ==================================================
        // DONNÉES
        // ==================================================

        const idCategorie =
            Number(
                chainePropre(
                    req.body.id_categorie
                )
            );


        const idType =
            Number(
                chainePropre(
                    req.body.id_type
                )
            );


        const idQuartier =
            Number(
                chainePropre(
                    req.body.id_quartier
                )
            );


        const depuisQuand =
            chainePropre(
                req.body.depuis_quand
            );


        const titre =
            chainePropre(
                req.body.titre
            );


        const description =
            chainePropre(
                req.body.description
            );


        // ==================================================
        // PHOTO
        // ==================================================

        let photo = null;

        if (
            req.file
        ) {

            photo =
                "/uploads/signalements/" +
                req.file.filename;

        }


        // ==================================================
        // LOG
        // ==================================================

        console.log(
            "📋 DONNÉES APRÈS TRAITEMENT :",
            {
                idUser,
                idCategorie,
                idType,
                idQuartier,
                depuisQuand,
                titre,
                description,
                photo
            }
        );


        // ==================================================
        // VALIDATION
        // ==================================================

        if (
            !idValide(idUser)
        ) {

            return res.status(401).json({

                succes: false,

                message:
                    "Session utilisateur invalide."

            });

        }


        if (
            !idValide(idCategorie)
        ) {

            return res.status(400).json({

                succes: false,

                message:
                    "La catégorie est obligatoire."

            });

        }


        if (
            !idValide(idType)
        ) {

            return res.status(400).json({

                succes: false,

                message:
                    "Le type de problème est obligatoire."

            });

        }


        if (
            !idValide(idQuartier)
        ) {

            return res.status(400).json({

                succes: false,

                message:
                    "Le quartier est obligatoire."

            });

        }


        if (
            !depuisQuand
        ) {

            return res.status(400).json({

                succes: false,

                message:
                    "Le champ « Depuis quand ? » est obligatoire."

            });

        }


        if (
            !titre
        ) {

            return res.status(400).json({

                succes: false,

                message:
                    "Le titre du signalement est obligatoire."

            });

        }


        if (
            titre.length < 5
        ) {

            return res.status(400).json({

                succes: false,

                message:
                    "Le titre doit contenir au moins 5 caractères."

            });

        }


        if (
            !description
        ) {

            return res.status(400).json({

                succes: false,

                message:
                    "La description est obligatoire."

            });

        }


        if (
            description.length < 10
        ) {

            return res.status(400).json({

                succes: false,

                message:
                    "La description doit contenir au moins 10 caractères."

            });

        }


        // ==================================================
        // CATÉGORIE
        // ==================================================

        if (
            !CATEGORIES_AUTORISEES.includes(
                idCategorie
            )
        ) {

            return res.status(400).json({

                succes: false,

                message:
                    "Catégorie de signalement invalide."

            });

        }


        // ==================================================
        // VÉRIFIER TYPE
        // ==================================================

        const typeSql = `

            SELECT
                id_type,
                id_categorie

            FROM types_problemes

            WHERE
                id_type = ?
                AND id_categorie = ?

            LIMIT 1

        `;


        db.query(
            typeSql,
            [
                idType,
                idCategorie
            ],
            (erreur, types) => {

                if (erreur) {

                    console.error(
                        "❌ ERREUR TYPE :",
                        erreur
                    );

                    return res.status(500).json({

                        succes: false,

                        message:
                            "Erreur lors de la vérification du type."

                    });

                }


                if (
                    !types ||
                    types.length === 0
                ) {

                    return res.status(400).json({

                        succes: false,

                        message:
                            "Le type de problème ne correspond pas à la catégorie."

                    });

                }


                // ==================================================
                // VÉRIFIER QUARTIER
                // ==================================================

                const quartierSql = `

                    SELECT
                        id_quartier

                    FROM quartiers

                    WHERE
                        id_quartier = ?

                    LIMIT 1

                `;


                db.query(
                    quartierSql,
                    [idQuartier],
                    (erreur, quartiers) => {

                        if (erreur) {

                            console.error(
                                "❌ ERREUR QUARTIER :",
                                erreur
                            );

                            return res.status(500).json({

                                succes: false,

                                message:
                                    "Erreur lors de la vérification du quartier."

                            });

                        }


                        if (
                            !quartiers ||
                            quartiers.length === 0
                        ) {

                            return res.status(400).json({

                                succes: false,

                                message:
                                    "Le quartier sélectionné n'existe pas."

                            });

                        }


                        // ==================================================
                        // INSERTION
                        // ==================================================

                        const insertSql = `

                            INSERT INTO signalements
                            (
                                id_user,
                                id_categorie,
                                id_type,
                                id_quartier,
                                titre,
                                description,
                                depuis_quand,
                                photo,
                                statut,
                                date_signalement
                            )

                            VALUES
                            (
                                ?,
                                ?,
                                ?,
                                ?,
                                ?,
                                ?,
                                ?,
                                ?,
                                'En attente',
                                NOW()
                            )

                        `;


                        db.query(
                            insertSql,
                            [
                                idUser,
                                idCategorie,
                                idType,
                                idQuartier,
                                titre,
                                description,
                                depuisQuand,
                                photo
                            ],
                            (erreur, resultat) => {

                                if (erreur) {

                                    console.error(
                                        "❌ ERREUR INSERTION :",
                                        erreur
                                    );

                                    return res.status(500).json({

                                        succes: false,

                                        message:
                                            "Impossible d'enregistrer le signalement."

                                    });

                                }


                                console.log(
                                    "✅ SIGNALEMENT CRÉÉ :",
                                    resultat.insertId
                                );


                                return res.status(201).json({

                                    succes: true,

                                    message:
                                        "Signalement créé avec succès.",

                                    signalement: {

                                        id_signalement:
                                            resultat.insertId,

                                        id_user:
                                            idUser,

                                        id_categorie:
                                            idCategorie,

                                        id_type:
                                            idType,

                                        id_quartier:
                                            idQuartier,

                                        titre:
                                            titre,

                                        description:
                                            description,

                                        depuis_quand:
                                            depuisQuand,

                                        photo:
                                            photo,

                                        statut:
                                            "En attente"

                                    }

                                });

                            }
                        );

                    }
                );

            }
        );

    }
);


// ==========================================================
// GET /signalement/api
// MES SIGNALEMENTS
// ==========================================================

router.get(
    "/api",
    verifierConnexion,
    (req, res) => {

        const idUser =
            Number(
                req.session.user.id_user
            );


        const sql = `

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

                c.nom AS categorie,

                t.nom AS type_probleme,

                t.description AS type_description,

                q.nom AS quartier

            FROM signalements s

            LEFT JOIN categories c
                ON s.id_categorie =
                   c.id_categorie

            LEFT JOIN types_problemes t
                ON s.id_type =
                   t.id_type

            LEFT JOIN quartiers q
                ON s.id_quartier =
                   q.id_quartier

            WHERE
                s.id_user = ?

            ORDER BY
                s.date_signalement DESC,
                s.id_signalement DESC

        `;


        db.query(
            sql,
            [idUser],
            (erreur, resultats) => {

                if (erreur) {

                    console.error(
                        "❌ ERREUR MES SIGNALEMENTS :",
                        erreur
                    );

                    return res.status(500).json({

                        succes: false,

                        message:
                            "Impossible de récupérer vos signalements."

                    });

                }


                return res.json({

                    succes: true,

                    signalements:
                        resultats

                });

            }
        );

    }
);


// ==========================================================
// GET /signalement/api/:id
// ==========================================================

router.get(
    "/api/:id",
    verifierConnexion,
    (req, res) => {

        const idUser =
            Number(
                req.session.user.id_user
            );


        const idSignalement =
            Number(
                req.params.id
            );


        if (
            !idValide(idSignalement)
        ) {

            return res.status(400).json({

                succes: false,

                message:
                    "Identifiant invalide."

            });

        }


        const sql = `

            SELECT

                s.*,

                c.nom AS categorie,

                t.nom AS type_probleme,

                t.description AS type_description,

                q.nom AS quartier

            FROM signalements s

            LEFT JOIN categories c
                ON s.id_categorie =
                   c.id_categorie

            LEFT JOIN types_problemes t
                ON s.id_type =
                   t.id_type

            LEFT JOIN quartiers q
                ON s.id_quartier =
                   q.id_quartier

            WHERE
                s.id_signalement = ?
                AND s.id_user = ?

            LIMIT 1

        `;


        db.query(
            sql,
            [
                idSignalement,
                idUser
            ],
            (erreur, resultats) => {

                if (erreur) {

                    console.error(
                        "❌ ERREUR SIGNALMENT :",
                        erreur
                    );

                    return res.status(500).json({

                        succes: false,

                        message:
                            "Erreur interne."

                    });

                }


                if (
                    resultats.length === 0
                ) {

                    return res.status(404).json({

                        succes: false,

                        message:
                            "Signalement introuvable."

                    });

                }


                return res.json({

                    succes: true,

                    signalement:
                        resultats[0]

                });

            }
        );

    }
);


// ==========================================================
// DELETE /signalement/api/:id
// ==========================================================

router.delete(
    "/api/:id",
    verifierConnexion,
    (req, res) => {

        const idUser =
            Number(
                req.session.user.id_user
            );


        const idSignalement =
            Number(
                req.params.id
            );


        if (
            !idValide(idSignalement)
        ) {

            return res.status(400).json({

                succes: false,

                message:
                    "Identifiant invalide."

            });

        }


        const selectSql = `

            SELECT
                statut

            FROM signalements

            WHERE
                id_signalement = ?
                AND id_user = ?

            LIMIT 1

        `;


        db.query(
            selectSql,
            [
                idSignalement,
                idUser
            ],
            (erreur, resultats) => {

                if (erreur) {

                    console.error(
                        "❌ ERREUR VÉRIFICATION SUPPRESSION :",
                        erreur
                    );

                    return res.status(500).json({

                        succes: false,

                        message:
                            "Erreur interne."

                    });

                }


                if (
                    resultats.length === 0
                ) {

                    return res.status(404).json({

                        succes: false,

                        message:
                            "Signalement introuvable."

                    });

                }


                const statut =
                    String(
                        resultats[0].statut
                    )
                    .toLowerCase()
                    .trim();


                if (
                    statut === "résolu" ||
                    statut === "rejeté"
                ) {

                    return res.status(400).json({

                        succes: false,

                        message:
                            "Ce signalement ne peut plus être supprimé."

                    });

                }


                const deleteSql = `

                    DELETE FROM signalements

                    WHERE
                        id_signalement = ?
                        AND id_user = ?

                `;


                db.query(
                    deleteSql,
                    [
                        idSignalement,
                        idUser
                    ],
                    (erreur, resultat) => {

                        if (erreur) {

                            console.error(
                                "❌ ERREUR SUPPRESSION :",
                                erreur
                            );

                            return res.status(500).json({

                                succes: false,

                                message:
                                    "Impossible de supprimer le signalement."

                            });

                        }


                        return res.json({

                            succes: true,

                            message:
                                "Signalement supprimé avec succès."

                        });

                    }
                );

            }
        );

    }
);


// ==========================================================
// ERREURS MULTER
// ==========================================================

router.use(
    (
        erreur,
        req,
        res,
        next
    ) => {

        if (
            erreur instanceof multer.MulterError
        ) {

            if (
                erreur.code === "LIMIT_FILE_SIZE"
            ) {

                return res.status(400).json({

                    succes: false,

                    message:
                        "La photo ne doit pas dépasser 5 Mo."

                });

            }


            return res.status(400).json({

                succes: false,

                message:
                    "Erreur lors de l'envoi de la photo."

            });

        }


        if (
            erreur
        ) {

            console.error(
                "❌ ERREUR UPLOAD :",
                erreur
            );

            return res.status(400).json({

                succes: false,

                message:
                    erreur.message

            });

        }


        next();

    }
);


// ==========================================================
// EXPORT
// ==========================================================

module.exports = router;