// ==========================================================
// CITYCARE
// routes/register-admin.js
// CRÉATION DE COMPTE ADMINISTRATEUR
// ==========================================================

const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");

const router = express.Router();
const db = require("../db");


// ==========================================================
// CONFIGURATION
// ==========================================================

// Code nécessaire pour créer un administrateur.
// Tu peux modifier cette valeur si tu veux utiliser
// un autre code d'autorisation.
const CODE_ADMIN = "CITYCARE-ADMIN-2026";


// Nombre de tours bcrypt
const SALT_ROUNDS = 10;


// ==========================================================
// OUTIL BASE DE DONNÉES
// ==========================================================

const database =
    typeof db.promise === "function"
        ? db.promise()
        : db;


// ==========================================================
// PAGE DE CRÉATION ADMIN
// GET /register-admin
// ==========================================================

router.get(
    "/",
    (req, res) => {

        return res.sendFile(
            path.join(
                __dirname,
                "../views/register-admin.html"
            )
        );

    }
);


// ==========================================================
// CRÉATION DU COMPTE ADMIN
// POST /register-admin
// ==========================================================

router.post(
    "/",
    async (req, res) => {

        try {

            // --------------------------------------------------
            // RÉCUPÉRATION DES DONNÉES
            // --------------------------------------------------

            const nom =
                String(req.body.nom || "")
                    .trim();

            const prenom =
                String(req.body.prenom || "")
                    .trim();

            const username =
                String(req.body.username || "")
                    .trim();

            const email =
                String(req.body.email || "")
                    .trim()
                    .toLowerCase();

            const password =
                String(req.body.password || "");

            const confirmation =
                String(req.body.confirmation || "");

            const codeAdmin =
                String(req.body.codeAdmin || "")
                    .trim();


            // --------------------------------------------------
            // VÉRIFICATION DES CHAMPS
            // --------------------------------------------------

            if (
                !nom ||
                !prenom ||
                !username ||
                !email ||
                !password ||
                !confirmation ||
                !codeAdmin
            ) {

                return res.status(400).json({

                    succes: false,

                    message:
                        "Tous les champs sont obligatoires."

                });

            }


            // --------------------------------------------------
            // LONGUEUR MINIMALE
            // --------------------------------------------------

            if (password.length < 6) {

                return res.status(400).json({

                    succes: false,

                    message:
                        "Le mot de passe doit contenir au moins 6 caractères."

                });

            }


            // --------------------------------------------------
            // CONFIRMATION MOT DE PASSE
            // --------------------------------------------------

            if (password !== confirmation) {

                return res.status(400).json({

                    succes: false,

                    message:
                        "Les mots de passe ne correspondent pas."

                });

            }


            // --------------------------------------------------
            // CODE ADMIN
            // --------------------------------------------------

            if (codeAdmin !== CODE_ADMIN) {

                return res.status(403).json({

                    succes: false,

                    message:
                        "Le code d'autorisation administrateur est incorrect."

                });

            }


            // --------------------------------------------------
            // VÉRIFICATION USERNAME
            // --------------------------------------------------

            const [usernameRows] =
                await database.query(
                    `
                    SELECT
                        id_user
                    FROM users
                    WHERE username = ?
                    LIMIT 1
                    `,
                    [username]
                );


            if (usernameRows.length > 0) {

                return res.status(409).json({

                    succes: false,

                    message:
                        "Ce nom d'utilisateur existe déjà."

                });

            }


            // --------------------------------------------------
            // VÉRIFICATION EMAIL
            // --------------------------------------------------

            const [emailRows] =
                await database.query(
                    `
                    SELECT
                        id_user
                    FROM users
                    WHERE email = ?
                    LIMIT 1
                    `,
                    [email]
                );


            if (emailRows.length > 0) {

                return res.status(409).json({

                    succes: false,

                    message:
                        "Cette adresse e-mail existe déjà."

                });

            }


            // --------------------------------------------------
            // HASH DU MOT DE PASSE
            // --------------------------------------------------

            const motDePasseHash =
                await bcrypt.hash(
                    password,
                    SALT_ROUNDS
                );


            // --------------------------------------------------
            // CRÉATION ADMIN
            // --------------------------------------------------

            const [result] =
                await database.query(
                    `
                    INSERT INTO users
                    (
                        nom,
                        prenom,
                        username,
                        email,
                        mot_de_passe,
                        role,
                        date_creation
                    )
                    VALUES
                    (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        'admin',
                        NOW()
                    )
                    `,
                    [
                        nom,
                        prenom,
                        username,
                        email,
                        motDePasseHash
                    ]
                );


            // --------------------------------------------------
            // VÉRIFICATION INSERTION
            // --------------------------------------------------

            if (
                !result ||
                !result.insertId
            ) {

                return res.status(500).json({

                    succes: false,

                    message:
                        "Le compte administrateur n'a pas pu être créé."

                });

            }


            // --------------------------------------------------
            // SUCCÈS
            // --------------------------------------------------

            console.log(
                "========================================"
            );

            console.log(
                "✅ ADMINISTRATEUR CRÉÉ"
            );

            console.log(
                "ID :",
                result.insertId
            );

            console.log(
                "Username :",
                username
            );

            console.log(
                "Email :",
                email
            );

            console.log(
                "========================================"
            );


            return res.status(201).json({

                succes: true,

                message:
                    "Compte administrateur créé avec succès.",

                utilisateur: {

                    id_user:
                        result.insertId,

                    nom:
                        nom,

                    prenom:
                        prenom,

                    username:
                        username,

                    email:
                        email,

                    role:
                        "admin"

                }

            });

        } catch (erreur) {

            console.error(
                "========================================"
            );

            console.error(
                "❌ ERREUR CRÉATION ADMIN"
            );

            console.error(
                erreur
            );

            console.error(
                "========================================"
            );


            // --------------------------------------------------
            // ERREUR DUPLICATION MYSQL
            // --------------------------------------------------

            if (
                erreur.code === "ER_DUP_ENTRY"
            ) {

                return res.status(409).json({

                    succes: false,

                    message:
                        "Le nom d'utilisateur ou l'adresse e-mail existe déjà."

                });

            }


            // --------------------------------------------------
            // ERREUR GÉNÉRALE
            // --------------------------------------------------

            return res.status(500).json({

                succes: false,

                message:
                    "Erreur lors de la création du compte administrateur.",

                erreur:
                    erreur.message

            });

        }

    }
);


// ==========================================================
// EXPORT
// ==========================================================

module.exports = router;