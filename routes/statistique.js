// ==========================================
// CITYCARE - ROUTES STATISTIQUES
// ==========================================

const express = require("express");
const router = express.Router();
const db = require("../db");

// ==========================================
// GET /statistiques
// Récupérer toutes les statistiques
// ==========================================

router.get("/", (req, res) => {

    const statistiques = {};

    // ------------------------------------------
    // 1. Nombre total d'utilisateurs
    // ------------------------------------------

    const sqlUsers = `
        SELECT COUNT(*) AS total
        FROM users
    `;

    db.query(sqlUsers, (erreur, resultUsers) => {

        if (erreur) {
            console.error("Erreur utilisateurs :", erreur);

            return res.status(500).json({
                succes: false,
                message: "Erreur lors du calcul des utilisateurs."
            });
        }

        statistiques.utilisateurs = resultUsers[0].total;

        // ------------------------------------------
        // 2. Nombre total de signalements
        // ------------------------------------------

        const sqlSignalements = `
            SELECT COUNT(*) AS total
            FROM signalements
        `;

        db.query(sqlSignalements, (erreur, resultSignalements) => {

            if (erreur) {
                console.error("Erreur signalements :", erreur);

                return res.status(500).json({
                    succes: false,
                    message: "Erreur lors du calcul des signalements."
                });
            }

            statistiques.signalements = resultSignalements[0].total;

            // ------------------------------------------
            // 3. Nombre total de rendez-vous
            // ------------------------------------------

            const sqlRendezvous = `
                SELECT COUNT(*) AS total
                FROM rendezvous
            `;

            db.query(sqlRendezvous, (erreur, resultRendezvous) => {

                if (erreur) {
                    console.error("Erreur rendez-vous :", erreur);

                    return res.status(500).json({
                        succes: false,
                        message: "Erreur lors du calcul des rendez-vous."
                    });
                }

                statistiques.rendezvous = resultRendezvous[0].total;

                // ------------------------------------------
                // 4. Nombre total de transports
                // ------------------------------------------

                const sqlTransport = `
                    SELECT COUNT(*) AS total
                    FROM transports
                `;

                db.query(sqlTransport, (erreur, resultTransport) => {

                    if (erreur) {
                        console.error("Erreur transports :", erreur);

                        return res.status(500).json({
                            succes: false,
                            message: "Erreur lors du calcul des transports."
                        });
                    }

                    statistiques.transports = resultTransport[0].total;

                    // ------------------------------------------
                    // 5. Signalements par statut
                    // ------------------------------------------

                    const sqlStatuts = `
                        SELECT statut, COUNT(*) AS total
                        FROM signalements
                        GROUP BY statut
                    `;

                    db.query(sqlStatuts, (erreur, resultStatuts) => {

                        if (erreur) {
                            console.error("Erreur statuts :", erreur);

                            return res.status(500).json({
                                succes: false,
                                message: "Erreur lors du calcul des statuts."
                            });
                        }

                        statistiques.signalements_par_statut =
                            resultStatuts;

                        // ------------------------------------------
                        // RÉPONSE FINALE
                        // ------------------------------------------

                        return res.json({
                            succes: true,
                            statistiques: statistiques
                        });

                    });

                });

            });

        });

    });

});


// ==========================================
// EXPORTATION
// ==========================================

module.exports = router;