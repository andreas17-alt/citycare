// ==========================================================
// CITYCARE
// AUTHENTIFICATION
// routes/auth.js
// ==========================================================

const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();

const db = require("../db");


// ==========================================================
// CONFIGURATION
// ==========================================================

const SALT_ROUNDS = 10;


// ==========================================================
// FONCTION : NETTOYER UNE VALEUR
// ==========================================================

function nettoyerValeur(valeur) {

    if (
        valeur === undefined ||
        valeur === null
    ) {

        return "";

    }

    return String(valeur).trim();

}


// ==========================================================
// FONCTION : RÉPONSE JSON
// ==========================================================

function reponseSucces(
    res,
    message,
    donnees = {}
) {

    return res.json({

        succes: true,

        message,

        ...donnees

    });

}


// ==========================================================
// FONCTION : RÉPONSE ERREUR
// ==========================================================

function reponseErreur(
    res,
    status,
    message
) {

    return res.status(status).json({

        succes: false,

        message

    });

}


// ==========================================================
// INSCRIPTION
// POST /auth/register
// ==========================================================

router.post(
    "/register",
    async (req, res) => {

        console.log("");
        console.log("========================================");
        console.log("📝 INSCRIPTION CITYCARE");
        console.log("========================================");


        try {

            // --------------------------------------------------
            // RÉCUPÉRATION DES DONNÉES
            // --------------------------------------------------

            const nom =
                nettoyerValeur(
                    req.body.nom
                );

            const prenom =
                nettoyerValeur(
                    req.body.prenom
                );

            const username =
                nettoyerValeur(
                    req.body.username
                );

            const email =
                nettoyerValeur(
                    req.body.email
                ).toLowerCase();

            const motDePasse =
                nettoyerValeur(
                    req.body.mot_de_passe ||
                    req.body.motDePasse ||
                    req.body.password
                );


            console.log(
                "👤 Username :",
                username
            );

            console.log(
                "📧 Email :",
                email
            );


            // --------------------------------------------------
            // VALIDATION DES CHAMPS
            // --------------------------------------------------

            if (
                !nom ||
                !prenom ||
                !username ||
                !email ||
                !motDePasse
            ) {

                return reponseErreur(
                    res,
                    400,
                    "Tous les champs sont obligatoires."
                );

            }


            // --------------------------------------------------
            // VALIDATION NOM
            // --------------------------------------------------

            if (
                nom.length < 2
            ) {

                return reponseErreur(
                    res,
                    400,
                    "Le nom doit contenir au moins 2 caractères."
                );

            }


            // --------------------------------------------------
            // VALIDATION PRÉNOM
            // --------------------------------------------------

            if (
                prenom.length < 2
            ) {

                return reponseErreur(
                    res,
                    400,
                    "Le prénom doit contenir au moins 2 caractères."
                );

            }


            // --------------------------------------------------
            // VALIDATION USERNAME
            // --------------------------------------------------

            if (
                username.length < 3
            ) {

                return reponseErreur(
                    res,
                    400,
                    "Le nom d'utilisateur doit contenir au moins 3 caractères."
                );

            }


            // --------------------------------------------------
            // VALIDATION EMAIL
            // --------------------------------------------------

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailRegex.test(email)
            ) {

                return reponseErreur(
                    res,
                    400,
                    "Adresse email invalide."
                );

            }


            // --------------------------------------------------
            // VALIDATION MOT DE PASSE
            // --------------------------------------------------

            if (
                motDePasse.length < 6
            ) {

                return reponseErreur(
                    res,
                    400,
                    "Le mot de passe doit contenir au moins 6 caractères."
                );

            }


            // --------------------------------------------------
            // VÉRIFIER USERNAME
            // --------------------------------------------------

            const sqlUsername = `

                SELECT
                    id_user,
                    username

                FROM users

                WHERE username = ?

                LIMIT 1

            `;


            const utilisateurUsername =
                await new Promise(
                    (resolve, reject) => {

                        db.query(
                            sqlUsername,
                            [username],
                            (erreur, resultat) => {

                                if (erreur) {

                                    reject(
                                        erreur
                                    );

                                    return;

                                }

                                resolve(
                                    resultat
                                );

                            }
                        );

                    }
                );


            if (
                utilisateurUsername &&
                utilisateurUsername.length > 0
            ) {

                return reponseErreur(
                    res,
                    409,
                    "Ce nom d'utilisateur est déjà utilisé."
                );

            }


            // --------------------------------------------------
            // VÉRIFIER EMAIL
            // --------------------------------------------------

            const sqlEmail = `

                SELECT
                    id_user,
                    email

                FROM users

                WHERE email = ?

                LIMIT 1

            `;


            const utilisateurEmail =
                await new Promise(
                    (resolve, reject) => {

                        db.query(
                            sqlEmail,
                            [email],
                            (erreur, resultat) => {

                                if (erreur) {

                                    reject(
                                        erreur
                                    );

                                    return;

                                }

                                resolve(
                                    resultat
                                );

                            }
                        );

                    }
                );


            if (
                utilisateurEmail &&
                utilisateurEmail.length > 0
            ) {

                return reponseErreur(
                    res,
                    409,
                    "Cette adresse email est déjà utilisée."
                );

            }


            // --------------------------------------------------
            // HASH DU MOT DE PASSE
            // --------------------------------------------------

            const motDePasseHash =
                await bcrypt.hash(
                    motDePasse,
                    SALT_ROUNDS
                );


            // --------------------------------------------------
            // CRÉATION DU CITOYEN
            // --------------------------------------------------

            const sqlInsert = `

                INSERT INTO users (

                    nom,
                    prenom,
                    username,
                    email,
                    mot_de_passe,
                    role,
                    date_creation

                )

                VALUES (

                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    'citoyen',
                    NOW()

                )

            `;


            const resultatInsertion =
                await new Promise(
                    (resolve, reject) => {

                        db.query(
                            sqlInsert,
                            [
                                nom,
                                prenom,
                                username,
                                email,
                                motDePasseHash
                            ],
                            (erreur, resultat) => {

                                if (erreur) {

                                    reject(
                                        erreur
                                    );

                                    return;

                                }

                                resolve(
                                    resultat
                                );

                            }
                        );

                    }
                );


            console.log(
                "✅ Inscription réussie."
            );

            console.log(
                "🆔 ID utilisateur :",
                resultatInsertion.insertId
            );


            // --------------------------------------------------
            // RÉPONSE
            // --------------------------------------------------

            return reponseSucces(
                res,
                "Compte créé avec succès.",
                {

                    utilisateur: {

                        id_user:
                            resultatInsertion.insertId,

                        nom,

                        prenom,

                        username,

                        email,

                        role:
                            "citoyen"

                    }

                }
            );


        } catch (erreur) {

            console.error(
                "❌ Erreur inscription :",
                erreur
            );


            // --------------------------------------------------
            // ERREUR MYSQL DUPLICATE
            // --------------------------------------------------

            if (
                erreur.code === "ER_DUP_ENTRY"
            ) {

                const message =
                    String(
                        erreur.sqlMessage ||
                        ""
                    ).toLowerCase();


                if (
                    message.includes(
                        "username"
                    )
                ) {

                    return reponseErreur(
                        res,
                        409,
                        "Ce nom d'utilisateur est déjà utilisé."
                    );

                }


                if (
                    message.includes(
                        "email"
                    )
                ) {

                    return reponseErreur(
                        res,
                        409,
                        "Cette adresse email est déjà utilisée."
                    );

                }


                return reponseErreur(
                    res,
                    409,
                    "Un utilisateur avec ces informations existe déjà."
                );

            }


            return reponseErreur(
                res,
                500,
                "Erreur interne lors de l'inscription."
            );

        }

    }
);


// ==========================================================
// CONNEXION
// POST /auth/login
// ==========================================================

router.post(
    "/login",
    async (req, res) => {

        console.log("");
        console.log("========================================");
        console.log("🔐 CONNEXION CITYCARE");
        console.log("========================================");


        try {

            // --------------------------------------------------
            // RÉCUPÉRATION
            // --------------------------------------------------

            const identifiant =
                nettoyerValeur(
                    req.body.identifiant ||
                    req.body.username ||
                    req.body.email
                );

            const motDePasse =
                nettoyerValeur(
                    req.body.mot_de_passe ||
                    req.body.motDePasse ||
                    req.body.password
                );


            // --------------------------------------------------
            // VALIDATION
            // --------------------------------------------------

            if (
                !identifiant ||
                !motDePasse
            ) {

                return reponseErreur(
                    res,
                    400,
                    "Veuillez saisir votre identifiant et votre mot de passe."
                );

            }


            // --------------------------------------------------
            // RECHERCHER UTILISATEUR
            // --------------------------------------------------

            const sql = `

                SELECT

                    id_user,
                    nom,
                    prenom,
                    username,
                    email,
                    mot_de_passe,
                    role,
                    date_creation

                FROM users

                WHERE
                    username = ?
                    OR
                    email = ?

                LIMIT 1

            `;


            db.query(
                sql,
                [
                    identifiant,
                    identifiant.toLowerCase()
                ],
                async (erreur, resultat) => {

                    try {

                        if (erreur) {

                            console.error(
                                "❌ Erreur SQL connexion :",
                                erreur
                            );


                            return reponseErreur(
                                res,
                                500,
                                "Erreur lors de la connexion."
                            );

                        }


                        // --------------------------------------------------
                        // UTILISATEUR INTROUVABLE
                        // --------------------------------------------------

                        if (
                            !resultat ||
                            resultat.length === 0
                        ) {

                            return reponseErreur(
                                res,
                                401,
                                "Identifiant ou mot de passe incorrect."
                            );

                        }


                        const utilisateur =
                            resultat[0];


                        // --------------------------------------------------
                        // VÉRIFICATION MOT DE PASSE
                        // --------------------------------------------------

                        const motDePasseCorrect =
                            await bcrypt.compare(
                                motDePasse,
                                utilisateur.mot_de_passe
                            );


                        if (
                            !motDePasseCorrect
                        ) {

                            console.log(
                                "⛔ Mot de passe incorrect :",
                                utilisateur.username
                            );


                            return reponseErreur(
                                res,
                                401,
                                "Identifiant ou mot de passe incorrect."
                            );

                        }


                        // --------------------------------------------------
                        // CRÉATION SESSION
                        // --------------------------------------------------

                        req.session.user = {

                            id_user:
                                utilisateur.id_user,

                            nom:
                                utilisateur.nom,

                            prenom:
                                utilisateur.prenom,

                            username:
                                utilisateur.username,

                            email:
                                utilisateur.email,

                            role:
                                utilisateur.role,

                            date_creation:
                                utilisateur.date_creation

                        };


                        console.log(
                            "✅ Connexion réussie :",
                            utilisateur.username
                        );

                        console.log(
                            "👤 Rôle :",
                            utilisateur.role
                        );


                        // --------------------------------------------------
                        // SAUVEGARDER SESSION
                        // --------------------------------------------------

                        req.session.save(
                            sauvegardeErreur => {

                                if (
                                    sauvegardeErreur
                                ) {

                                    console.error(
                                        "❌ Erreur sauvegarde session :",
                                        sauvegardeErreur
                                    );


                                    return reponseErreur(
                                        res,
                                        500,
                                        "Impossible de créer la session."
                                    );

                                }


                                // --------------------------------------------------
                                // DESTINATION
                                // --------------------------------------------------

                                let destination =
                                    "/dashboard";


                                if (
                                    utilisateur.role ===
                                    "admin"
                                ) {

                                    destination =
                                        "/admin/dashboard";

                                }


                                // --------------------------------------------------
                                // RÉPONSE
                                // --------------------------------------------------

                                return reponseSucces(
                                    res,
                                    "Connexion réussie.",
                                    {

                                        utilisateur: {

                                            id_user:
                                                utilisateur.id_user,

                                            nom:
                                                utilisateur.nom,

                                            prenom:
                                                utilisateur.prenom,

                                            username:
                                                utilisateur.username,

                                            email:
                                                utilisateur.email,

                                            role:
                                                utilisateur.role

                                        },

                                        redirect:
                                            destination

                                    }
                                );

                            }
                        );

                    } catch (erreurInterne) {

                        console.error(
                            "❌ Erreur vérification connexion :",
                            erreurInterne
                        );


                        return reponseErreur(
                            res,
                            500,
                            "Erreur interne lors de la connexion."
                        );

                    }

                }
            );


        } catch (erreur) {

            console.error(
                "❌ Erreur connexion :",
                erreur
            );


            return reponseErreur(
                res,
                500,
                "Erreur interne lors de la connexion."
            );

        }

    }
);


// ==========================================================
// DÉCONNEXION
// POST /auth/logout
// GET  /auth/logout
// ==========================================================

function deconnecterUtilisateur(
    req,
    res
) {

    console.log(
        "🚪 Déconnexion..."
    );


    if (
        !req.session
    ) {

        return reponseSucces(
            res,
            "Déconnexion réussie.",
            {
                redirect: "/login"
            }
        );

    }


    req.session.destroy(
        erreur => {

            if (erreur) {

                console.error(
                    "❌ Erreur déconnexion :",
                    erreur
                );


                return reponseErreur(
                    res,
                    500,
                    "Impossible de se déconnecter."
                );

            }


            // --------------------------------------------------
            // SUPPRIMER COOKIE SESSION
            // --------------------------------------------------

            res.clearCookie(
                "connect.sid"
            );


            console.log(
                "✅ Déconnexion réussie."
            );


            // --------------------------------------------------
            // SI NAVIGATION CLASSIQUE
            // --------------------------------------------------

            const accepteHtml =
                req.headers.accept &&
                req.headers.accept.includes(
                    "text/html"
                );


            if (
                accepteHtml &&
                !req.headers["content-type"]?.includes(
                    "application/json"
                )
            ) {

                return res.redirect(
                    "/login"
                );

            }


            // --------------------------------------------------
            // SI FETCH / AJAX
            // --------------------------------------------------

            return reponseSucces(
                res,
                "Déconnexion réussie.",
                {
                    redirect: "/login"
                }
            );

        }
    );

}


router.post(
    "/logout",
    deconnecterUtilisateur
);


router.get(
    "/logout",
    deconnecterUtilisateur
);


// ==========================================================
// INFORMATIONS UTILISATEUR CONNECTÉ
// GET /auth/me
// ==========================================================

router.get(
    "/me",
    (req, res) => {

        if (
            !req.session ||
            !req.session.user
        ) {

            return res.status(401).json({

                succes: false,

                connecte: false,

                message:
                    "Aucun utilisateur connecté."

            });

        }


        return res.json({

            succes: true,

            connecte: true,

            utilisateur:
                req.session.user

        });

    }
);


// ==========================================================
// VÉRIFICATION SESSION
// GET /auth/check
// ==========================================================

router.get(
    "/check",
    (req, res) => {

        const connecte =
            Boolean(
                req.session &&
                req.session.user
            );


        return res.json({

            succes: true,

            connecte,

            utilisateur:
                connecte
                    ? req.session.user
                    : null

        });

    }
);


// ==========================================================
// EXPORT
// ==========================================================

module.exports = router;