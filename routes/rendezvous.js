// ==========================================================
// CITYCARE - ROUTES RENDEZ-VOUS
// ==========================================================

const express = require("express");
const path = require("path");

const router = express.Router();
const db = require("../db");


// ==========================================================
// MIDDLEWARE - VÉRIFIER LA CONNEXION
// ==========================================================

function verifierConnexion(req, res, next) {

    if (!req.session || !req.session.user) {

        if (req.path.startsWith("/api")) {

            return res.status(401).json({
                succes: false,
                message: "Vous devez être connecté."
            });
        }

        return res.redirect("/login");
    }

    next();
}


// ==========================================================
// OUTIL - VÉRIFIER ID
// ==========================================================

function idValide(id) {

    const nombre = Number(id);

    return (
        Number.isInteger(nombre) &&
        nombre > 0
    );
}


// ==========================================================
// OUTIL - VÉRIFIER DATE + HEURE FUTURES
// ==========================================================

function dateHeureFuture(date, heure) {

    if (!date || !heure) {
        return false;
    }

    const valeur = new Date(`${date}T${heure}`);

    if (Number.isNaN(valeur.getTime())) {
        return false;
    }

    return valeur > new Date();
}


// ==========================================================
// PAGE RENDEZ-VOUS
// GET /rendezvous
// ==========================================================

router.get(
    "/",
    verifierConnexion,
    (req, res) => {

        // Un administrateur ne doit pas utiliser
        // l'interface citoyen.

        if (req.session.user.role === "admin") {

            return res.redirect("/admin/rendezvous");
        }

        return res.sendFile(
            path.join(
                __dirname,
                "../views/rendezvous.html"
            )
        );
    }
);


// ==========================================================
// GET CENTRES DE SANTÉ
// GET /rendezvous/api/centres
// ==========================================================

router.get(
    "/api/centres",
    verifierConnexion,
    (req, res) => {

        const sql = `

            SELECT
                id_centre,
                nom

            FROM centres_sante

            ORDER BY nom ASC

        `;

        db.query(
            sql,
            (err, result) => {

                if (err) {

                    console.error(
                        "❌ ERREUR CHARGEMENT CENTRES :",
                        err
                    );

                    return res.status(500).json({
                        succes: false,
                        message:
                            "Impossible de charger les centres de santé."
                    });
                }

                return res.json({
                    succes: true,
                    centres: result
                });
            }
        );
    }
);


// ==========================================================
// POST - CRÉER UN RENDEZ-VOUS
// POST /rendezvous/api
// ==========================================================

router.post(
    "/api",
    verifierConnexion,
    (req, res) => {

        const idUser =
            req.session.user.id_user;

        const idCentre =
            Number(req.body.id_centre);

        const service =
            String(
                req.body.service || ""
            ).trim();

        const dateRdv =
            String(
                req.body.date_rdv ||
                req.body.date ||
                ""
            ).trim();

        const heureRdv =
            String(
                req.body.heure_rdv ||
                req.body.heure ||
                ""
            ).trim();


        console.log(
            "📅 CRÉATION RENDEZ-VOUS :",
            {
                idUser,
                idCentre,
                service,
                dateRdv,
                heureRdv
            }
        );


        // ==================================================
        // VALIDATION
        // ==================================================

        if (
            !idValide(idCentre) ||
            !service ||
            !dateRdv ||
            !heureRdv
        ) {

            return res.status(400).json({
                succes: false,
                message:
                    "Veuillez remplir tous les champs."
            });
        }


        // ==================================================
        // DATE FUTURE
        // ==================================================

        if (
            !dateHeureFuture(
                dateRdv,
                heureRdv
            )
        ) {

            return res.status(400).json({
                succes: false,
                message:
                    "Le rendez-vous doit être prévu dans le futur."
            });
        }


        // ==================================================
        // VÉRIFIER QUE LE CENTRE EXISTE
        // ==================================================

        const centreSql = `

            SELECT
                id_centre,
                nom

            FROM centres_sante

            WHERE id_centre = ?

            LIMIT 1

        `;


        db.query(
            centreSql,
            [idCentre],
            (err, centres) => {

                if (err) {

                    console.error(
                        "❌ ERREUR VÉRIFICATION CENTRE :",
                        err
                    );

                    return res.status(500).json({
                        succes: false,
                        message:
                            "Impossible de vérifier le centre de santé."
                    });
                }


                if (
                    !centres ||
                    centres.length === 0
                ) {

                    return res.status(404).json({
                        succes: false,
                        message:
                            "Centre de santé introuvable."
                    });
                }


                // ==================================================
                // VÉRIFIER LA DISPONIBILITÉ
                // ==================================================

                const disponibiliteSql = `

                    SELECT
                        id_rdv

                    FROM rendez_vous

                    WHERE
                        id_centre = ?
                        AND date_rdv = ?
                        AND heure_rdv = ?

                        AND statut <> 'Refusé'

                    LIMIT 1

                `;


                db.query(
                    disponibiliteSql,
                    [
                        idCentre,
                        dateRdv,
                        heureRdv
                    ],
                    (err, conflits) => {

                        if (err) {

                            console.error(
                                "❌ ERREUR VÉRIFICATION DISPONIBILITÉ :",
                                err
                            );

                            return res.status(500).json({
                                succes: false,
                                message:
                                    "Impossible de vérifier la disponibilité."
                            });
                        }


                        // ==================================================
                        // CRÉNEAU DÉJÀ PRIS
                        // ==================================================

                        if (
                            conflits &&
                            conflits.length > 0
                        ) {

                            return res.status(409).json({
                                succes: false,
                                message:
                                    "Ce créneau est déjà réservé."
                            });
                        }


                        // ==================================================
                        // INSERTION
                        // ==================================================

                        const insertSql = `

                            INSERT INTO rendez_vous
                            (
                                id_user,
                                id_centre,
                                service,
                                date_rdv,
                                heure_rdv,
                                statut
                            )

                            VALUES
                            (
                                ?,
                                ?,
                                ?,
                                ?,
                                ?,
                                'En attente'
                            )

                        `;


                        db.query(
                            insertSql,
                            [
                                idUser,
                                idCentre,
                                service,
                                dateRdv,
                                heureRdv
                            ],
                            (err, result) => {

                                if (err) {

                                    console.error(
                                        "❌ ERREUR INSERTION RENDEZ-VOUS :",
                                        err
                                    );

                                    return res.status(500).json({
                                        succes: false,
                                        message:
                                            "Impossible de créer le rendez-vous."
                                    });
                                }


                                console.log(
                                    "✅ RENDEZ-VOUS CRÉÉ :",
                                    result.insertId
                                );


                                return res.status(201).json({

                                    succes: true,

                                    message:
                                        "Rendez-vous créé avec succès.",

                                    rendezvous: {

                                        id_rdv:
                                            result.insertId,

                                        id_user:
                                            idUser,

                                        id_centre:
                                            idCentre,

                                        service:
                                            service,

                                        date_rdv:
                                            dateRdv,

                                        heure_rdv:
                                            heureRdv,

                                        statut:
                                            "En attente",

                                        centre:
                                            centres[0].nom
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
// GET - MES RENDEZ-VOUS
// GET /rendezvous/api
// ==========================================================

router.get(
    "/api",
    verifierConnexion,
    (req, res) => {

        const idUser =
            req.session.user.id_user;


        const sql = `

            SELECT

                r.id_rdv,
                r.id_user,
                r.id_centre,
                r.service,
                r.date_rdv,
                r.heure_rdv,
                r.statut,

                c.nom AS centre

            FROM rendez_vous r

            LEFT JOIN centres_sante c
                ON r.id_centre = c.id_centre

            WHERE
                r.id_user = ?

            ORDER BY
                r.date_rdv DESC,
                r.heure_rdv DESC

        `;


        db.query(
            sql,
            [idUser],
            (err, result) => {

                if (err) {

                    console.error(
                        "❌ ERREUR RÉCUPÉRATION RENDEZ-VOUS :",
                        err
                    );

                    return res.status(500).json({
                        succes: false,
                        message:
                            "Impossible de charger les rendez-vous."
                    });
                }


                console.log(
                    `📋 ${result.length} rendez-vous récupérés pour l'utilisateur ${idUser}`
                );


                return res.json({

                    succes: true,

                    rendezvous:
                        result

                });
            }
        );
    }
);


// ==========================================================
// PUT - MODIFIER UN RENDEZ-VOUS
// PUT /rendezvous/api/:id
// ==========================================================

router.put(
    "/api/:id",
    verifierConnexion,
    (req, res) => {

        const idUser =
            req.session.user.id_user;

        const idRdv =
            Number(req.params.id);

        const idCentre =
            Number(req.body.id_centre);

        const service =
            String(
                req.body.service || ""
            ).trim();

        const dateRdv =
            String(
                req.body.date_rdv ||
                req.body.date ||
                ""
            ).trim();

        const heureRdv =
            String(
                req.body.heure_rdv ||
                req.body.heure ||
                ""
            ).trim();


        console.log(
            "✏️ MODIFICATION RENDEZ-VOUS :",
            {
                idRdv,
                idUser,
                idCentre,
                service,
                dateRdv,
                heureRdv
            }
        );


        // ==================================================
        // VALIDATION ID
        // ==================================================

        if (
            !idValide(idRdv)
        ) {

            return res.status(400).json({
                succes: false,
                message:
                    "Identifiant du rendez-vous invalide."
            });
        }


        // ==================================================
        // VALIDATION CHAMPS
        // ==================================================

        if (
            !idValide(idCentre) ||
            !service ||
            !dateRdv ||
            !heureRdv
        ) {

            return res.status(400).json({
                succes: false,
                message:
                    "Veuillez remplir tous les champs."
            });
        }


        // ==================================================
        // DATE FUTURE
        // ==================================================

        if (
            !dateHeureFuture(
                dateRdv,
                heureRdv
            )
        ) {

            return res.status(400).json({
                succes: false,
                message:
                    "Le rendez-vous doit être prévu dans le futur."
            });
        }


        // ==================================================
        // RÉCUPÉRER LE RENDEZ-VOUS
        // ==================================================

        const selectSql = `

            SELECT
                id_rdv,
                id_user,
                id_centre,
                service,
                date_rdv,
                heure_rdv,
                statut

            FROM rendez_vous

            WHERE
                id_rdv = ?
                AND id_user = ?

            LIMIT 1

        `;


        db.query(
            selectSql,
            [
                idRdv,
                idUser
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        "❌ ERREUR RECHERCHE RENDEZ-VOUS :",
                        err
                    );

                    return res.status(500).json({
                        succes: false,
                        message:
                            "Impossible de récupérer le rendez-vous."
                    });
                }


                if (
                    result.length === 0
                ) {

                    return res.status(404).json({
                        succes: false,
                        message:
                            "Rendez-vous introuvable."
                    });
                }


                const ancien =
                    result[0];


                const statut =
                    String(
                        ancien.statut || ""
                    )
                    .toLowerCase()
                    .trim();


                // ==================================================
                // STATUT NON MODIFIABLE
                // ==================================================

                if (
                    statut === "terminé" ||
                    statut === "termine"
                ) {

                    return res.status(400).json({
                        succes: false,
                        message:
                            "Impossible de modifier un rendez-vous terminé."
                    });
                }


                if (
                    statut === "refusé" ||
                    statut === "refuse"
                ) {

                    return res.status(400).json({
                        succes: false,
                        message:
                            "Impossible de modifier un rendez-vous refusé."
                    });
                }


                // ==================================================
                // VÉRIFIER CENTRE
                // ==================================================

                const centreSql = `

                    SELECT
                        id_centre,
                        nom

                    FROM centres_sante

                    WHERE id_centre = ?

                    LIMIT 1

                `;


                db.query(
                    centreSql,
                    [idCentre],
                    (err, centres) => {

                        if (err) {

                            console.error(
                                "❌ ERREUR CENTRE MODIFICATION :",
                                err
                            );

                            return res.status(500).json({
                                succes: false,
                                message:
                                    "Impossible de vérifier le centre de santé."
                            });
                        }


                        if (
                            centres.length === 0
                        ) {

                            return res.status(404).json({
                                succes: false,
                                message:
                                    "Centre de santé introuvable."
                            });
                        }


                        // ==================================================
                        // VÉRIFIER CONFLIT
                        // ==================================================

                        const conflitSql = `

                            SELECT
                                id_rdv

                            FROM rendez_vous

                            WHERE
                                id_centre = ?
                                AND date_rdv = ?
                                AND heure_rdv = ?

                                AND id_rdv != ?

                                AND statut <> 'Refusé'

                            LIMIT 1

                        `;


                        db.query(
                            conflitSql,
                            [
                                idCentre,
                                dateRdv,
                                heureRdv,
                                idRdv
                            ],
                            (err, conflits) => {

                                if (err) {

                                    console.error(
                                        "❌ ERREUR CONFLIT MODIFICATION :",
                                        err
                                    );

                                    return res.status(500).json({
                                        succes: false,
                                        message:
                                            "Impossible de vérifier la disponibilité."
                                    });
                                }


                                if (
                                    conflits.length > 0
                                ) {

                                    return res.status(409).json({
                                        succes: false,
                                        message:
                                            "Ce créneau est déjà réservé."
                                    });
                                }


                                // ==================================================
                                // UPDATE
                                // ==================================================

                                const updateSql = `

                                    UPDATE rendez_vous

                                    SET
                                        id_centre = ?,
                                        service = ?,
                                        date_rdv = ?,
                                        heure_rdv = ?,
                                        statut = 'En attente'

                                    WHERE
                                        id_rdv = ?
                                        AND id_user = ?

                                `;


                                db.query(
                                    updateSql,
                                    [
                                        idCentre,
                                        service,
                                        dateRdv,
                                        heureRdv,
                                        idRdv,
                                        idUser
                                    ],
                                    (err, updateResult) => {

                                        if (err) {

                                            console.error(
                                                "❌ ERREUR UPDATE RENDEZ-VOUS :",
                                                err
                                            );

                                            return res.status(500).json({
                                                succes: false,
                                                message:
                                                    "Impossible de modifier le rendez-vous."
                                            });
                                        }


                                        if (
                                            updateResult.affectedRows === 0
                                        ) {

                                            return res.status(404).json({
                                                succes: false,
                                                message:
                                                    "Le rendez-vous n'a pas pu être modifié."
                                            });
                                        }


                                        return res.json({

                                            succes: true,

                                            message:
                                                "Rendez-vous modifié avec succès.",

                                            rendezvous: {

                                                id_rdv:
                                                    idRdv,

                                                id_user:
                                                    idUser,

                                                id_centre:
                                                    idCentre,

                                                service:
                                                    service,

                                                date_rdv:
                                                    dateRdv,

                                                heure_rdv:
                                                    heureRdv,

                                                statut:
                                                    "En attente",

                                                centre:
                                                    centres[0].nom
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
    }
);


// ==========================================================
// DELETE - ANNULER UN RENDEZ-VOUS
// DELETE /rendezvous/api/:id
// ==========================================================

router.delete(
    "/api/:id",
    verifierConnexion,
    (req, res) => {

        const idUser =
            req.session.user.id_user;

        const idRdv =
            Number(req.params.id);


        // ==================================================
        // VALIDATION ID
        // ==================================================

        if (
            !idValide(idRdv)
        ) {

            return res.status(400).json({
                succes: false,
                message:
                    "Identifiant du rendez-vous invalide."
            });
        }


        // ==================================================
        // RECHERCHER LE RENDEZ-VOUS
        // ==================================================

        const selectSql = `

            SELECT
                id_rdv,
                statut

            FROM rendez_vous

            WHERE
                id_rdv = ?
                AND id_user = ?

            LIMIT 1

        `;


        db.query(
            selectSql,
            [
                idRdv,
                idUser
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        "❌ ERREUR RECHERCHE ANNULATION :",
                        err
                    );

                    return res.status(500).json({
                        succes: false,
                        message:
                            "Impossible de récupérer le rendez-vous."
                    });
                }


                if (
                    result.length === 0
                ) {

                    return res.status(404).json({
                        succes: false,
                        message:
                            "Rendez-vous introuvable."
                    });
                }


                const statut =
                    String(
                        result[0].statut || ""
                    )
                    .toLowerCase()
                    .trim();


                // ==================================================
                // DÉJÀ TERMINÉ
                // ==================================================

                if (
                    statut === "terminé" ||
                    statut === "termine"
                ) {

                    return res.status(400).json({
                        succes: false,
                        message:
                            "Impossible d'annuler un rendez-vous terminé."
                    });
                }


                // ==================================================
                // DÉJÀ REFUSÉ
                // ==================================================

                if (
                    statut === "refusé" ||
                    statut === "refuse"
                ) {

                    return res.status(400).json({
                        succes: false,
                        message:
                            "Impossible d'annuler un rendez-vous refusé."
                    });
                }


                // ==================================================
                // ANNULATION
                // ==================================================

                const updateSql = `

                    UPDATE rendez_vous

                    SET
                        statut = 'Refusé'

                    WHERE
                        id_rdv = ?
                        AND id_user = ?

                `;


                db.query(
                    updateSql,
                    [
                        idRdv,
                        idUser
                    ],
                    (err, updateResult) => {

                        if (err) {

                            console.error(
                                "❌ ERREUR ANNULATION RENDEZ-VOUS :",
                                err
                            );

                            return res.status(500).json({
                                succes: false,
                                message:
                                    "Impossible d'annuler le rendez-vous."
                            });
                        }


                        if (
                            updateResult.affectedRows === 0
                        ) {

                            return res.status(404).json({
                                succes: false,
                                message:
                                    "Le rendez-vous n'a pas pu être annulé."
                            });
                        }


                        return res.json({

                            succes: true,

                            message:
                                "Rendez-vous annulé avec succès."
                        });
                    }
                );
            }
        );
    }
);


// ==========================================================
// EXPORT
// ==========================================================

module.exports = router;