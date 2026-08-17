// ==========================================================
// CITYCARE - ROUTES TRANSPORT
// routes/transport.js
// ==========================================================

const express = require("express");
const path = require("path");

const router = express.Router();
const db = require("../db");

const {
    verifierConnexion
} = require("../middleware/auth");

// ==========================================================
// PAGE TRANSPORT
// GET /transport
// ==========================================================

router.get("/", verifierConnexion, (req, res) => {

    console.log("🚌 Ouverture page transport");

    return res.sendFile(
        path.join(
            __dirname,
            "../views/transport.html"
        )
    );

});

// ==========================================================
// GET /transport/api
// RÉCUPÉRER TOUTES LES LIGNES
// ==========================================================

router.get("/api", verifierConnexion, (req, res) => {

    console.log("🚌 API TRANSPORT");

    const sql = `
        SELECT
            id_transport,
            numero_ligne,
            depart,
            arrivee
        FROM transports
        ORDER BY numero_ligne ASC
    `;

    db.query(sql, (erreur, resultats) => {

        if (erreur) {

            console.error(
                "❌ Erreur MySQL transport :",
                erreur
            );

            return res.status(500).json({
                succes: false,
                message: "Erreur lors de la récupération des transports."
            });
        }

        console.log(
            "✅ Transports récupérés :",
            resultats.length
        );

        return res.json({
            succes: true,
            transports: resultats
        });

    });

});

// ==========================================================
// GET /transport/api/recherche
// RECHERCHER UNE LIGNE
// ==========================================================

router.get(
    "/api/recherche",
    verifierConnexion,
    (req, res) => {

        const recherche = String(
            req.query.recherche || ""
        ).trim();

        const valeur = `%${recherche}%`;

        const sql = `
            SELECT
                id_transport,
                numero_ligne,
                depart,
                arrivee
            FROM transports
            WHERE
                numero_ligne LIKE ?
                OR depart LIKE ?
                OR arrivee LIKE ?
            ORDER BY numero_ligne ASC
        `;

        db.query(
            sql,
            [
                valeur,
                valeur,
                valeur
            ],
            (erreur, resultats) => {

                if (erreur) {

                    console.error(
                        "❌ Erreur recherche transport :",
                        erreur
                    );

                    return res.status(500).json({
                        succes: false,
                        message: "Erreur lors de la recherche."
                    });
                }

                return res.json({
                    succes: true,
                    transports: resultats
                });

            }
        );

    }
);

// ==========================================================
// GET /transport/api/:id
// RÉCUPÉRER UNE LIGNE
// ==========================================================

router.get(
    "/api/:id",
    verifierConnexion,
    (req, res) => {

        const id = Number(req.params.id);

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({
                succes: false,
                message: "Identifiant invalide."
            });

        }

        const sql = `
            SELECT
                id_transport,
                numero_ligne,
                depart,
                arrivee
            FROM transports
            WHERE id_transport = ?
            LIMIT 1
        `;

        db.query(
            sql,
            [id],
            (erreur, resultats) => {

                if (erreur) {

                    console.error(
                        "❌ Erreur récupération transport :",
                        erreur
                    );

                    return res.status(500).json({
                        succes: false,
                        message: "Erreur serveur."
                    });
                }

                if (resultats.length === 0) {

                    return res.status(404).json({
                        succes: false,
                        message: "Ligne de transport introuvable."
                    });

                }

                return res.json({
                    succes: true,
                    transport: resultats[0]
                });

            }
        );

    }
);

// ==========================================================
// POST /transport/api
// AJOUTER UNE LIGNE
// ==========================================================

router.post(
    "/api",
    verifierConnexion,
    (req, res) => {

        const numero_ligne = String(
            req.body.numero_ligne || ""
        ).trim();

        const depart = String(
            req.body.depart || ""
        ).trim();

        const arrivee = String(
            req.body.arrivee || ""
        ).trim();

        if (
            !numero_ligne ||
            !depart ||
            !arrivee
        ) {

            return res.status(400).json({
                succes: false,
                message: "Tous les champs sont obligatoires."
            });

        }

        const sql = `
            INSERT INTO transports
            (
                numero_ligne,
                depart,
                arrivee
            )
            VALUES (?, ?, ?)
        `;

        db.query(
            sql,
            [
                numero_ligne,
                depart,
                arrivee
            ],
            (erreur, resultat) => {

                if (erreur) {

                    console.error(
                        "❌ Erreur ajout transport :",
                        erreur
                    );

                    return res.status(500).json({
                        succes: false,
                        message: "Erreur lors de l'ajout."
                    });

                }

                return res.status(201).json({
                    succes: true,
                    message: "Ligne ajoutée avec succès.",
                    id_transport: resultat.insertId
                });

            }
        );

    }
);

// ==========================================================
// PUT /transport/api/:id
// MODIFIER UNE LIGNE
// ==========================================================

router.put(
    "/api/:id",
    verifierConnexion,
    (req, res) => {

        const id = Number(req.params.id);

        const numero_ligne = String(
            req.body.numero_ligne || ""
        ).trim();

        const depart = String(
            req.body.depart || ""
        ).trim();

        const arrivee = String(
            req.body.arrivee || ""
        ).trim();

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({
                succes: false,
                message: "Identifiant invalide."
            });

        }

        if (
            !numero_ligne ||
            !depart ||
            !arrivee
        ) {

            return res.status(400).json({
                succes: false,
                message: "Tous les champs sont obligatoires."
            });

        }

        const sql = `
            UPDATE transports
            SET
                numero_ligne = ?,
                depart = ?,
                arrivee = ?
            WHERE id_transport = ?
        `;

        db.query(
            sql,
            [
                numero_ligne,
                depart,
                arrivee,
                id
            ],
            (erreur, resultat) => {

                if (erreur) {

                    console.error(
                        "❌ Erreur modification transport :",
                        erreur
                    );

                    return res.status(500).json({
                        succes: false,
                        message: "Erreur lors de la modification."
                    });

                }

                if (
                    resultat.affectedRows === 0
                ) {

                    return res.status(404).json({
                        succes: false,
                        message: "Ligne introuvable."
                    });

                }

                return res.json({
                    succes: true,
                    message: "Ligne modifiée avec succès."
                });

            }
        );

    }
);

// ==========================================================
// DELETE /transport/api/:id
// SUPPRIMER UNE LIGNE
// ==========================================================

router.delete(
    "/api/:id",
    verifierConnexion,
    (req, res) => {

        const id = Number(req.params.id);

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({
                succes: false,
                message: "Identifiant invalide."
            });

        }

        const sql = `
            DELETE FROM transports
            WHERE id_transport = ?
        `;

        db.query(
            sql,
            [id],
            (erreur, resultat) => {

                if (erreur) {

                    console.error(
                        "❌ Erreur suppression transport :",
                        erreur
                    );

                    return res.status(500).json({
                        succes: false,
                        message: "Erreur lors de la suppression."
                    });

                }

                if (
                    resultat.affectedRows === 0
                ) {

                    return res.status(404).json({
                        succes: false,
                        message: "Ligne introuvable."
                    });

                }

                return res.json({
                    succes: true,
                    message: "Ligne supprimée avec succès."
                });

            }
        );

    }
);

// ==========================================================
// EXPORT
// ==========================================================

module.exports = router;