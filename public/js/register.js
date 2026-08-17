// ==========================================================
// CITYCARE - REGISTER.JS
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("========================================");
    console.log("✅ CityCare - register.js chargé");
    console.log("========================================");


    // ======================================================
    // ÉLÉMENTS
    // ======================================================

    const form =
        document.getElementById("formRegister");

    const button =
        document.getElementById("btnRegister");

    const message =
        document.getElementById("message");

    const password =
        document.getElementById("mot_de_passe");

    const confirmation =
        document.getElementById("confirmation");

    const togglePassword =
        document.getElementById("togglePassword");


    if (!form) {

        console.error(
            "❌ #formRegister introuvable"
        );

        return;
    }


    console.log(
        "✅ Formulaire trouvé"
    );


    // ======================================================
    // MESSAGE
    // ======================================================

    function afficherMessage(
        texte,
        type = "erreur"
    ) {

        if (!message) {
            return;
        }


        message.textContent =
            texte;

        message.style.display =
            "block";


        if (type === "succes") {

            message.style.color =
                "#166534";

            message.style.backgroundColor =
                "#dcfce7";

            message.style.border =
                "1px solid #86efac";

        } else {

            message.style.color =
                "#991b1b";

            message.style.backgroundColor =
                "#fee2e2";

            message.style.border =
                "1px solid #fca5a5";

        }

    }


    function cacherMessage() {

        if (!message) {
            return;
        }

        message.textContent =
            "";

        message.style.display =
            "none";

    }


    // ======================================================
    // MOT DE PASSE
    // ======================================================

    if (
        password &&
        togglePassword
    ) {

        togglePassword.addEventListener(
            "click",
            () => {

                if (
                    password.type ===
                    "password"
                ) {

                    password.type =
                        "text";

                } else {

                    password.type =
                        "password";

                }

            }
        );

    }


    // ======================================================
    // SUBMIT
    // ======================================================

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            console.log("");
            console.log(
                "🟢 FORMULAIRE ENVOYÉ"
            );


            cacherMessage();


            // ==================================================
            // RÉCUPÉRER LES CHAMPS
            // ==================================================

            const nom =
                document
                    .getElementById("nom")
                    .value
                    .trim();


            const prenom =
                document
                    .getElementById("prenom")
                    .value
                    .trim();


            const username =
                document
                    .getElementById("username")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim()
                    .toLowerCase();


            const mot_de_passe =
                document
                    .getElementById("mot_de_passe")
                    .value;


            const confirmation =
                document
                    .getElementById("confirmation")
                    .value;


            const conditions =
                document
                    .getElementById("conditions");


            console.log({
                nom,
                prenom,
                username,
                email,
                passwordPresent:
                    !!mot_de_passe,
                confirmationPresent:
                    !!confirmation
            });


            // ==================================================
            // VALIDATION
            // ==================================================

            if (
                !nom ||
                !prenom ||
                !username ||
                !email ||
                !mot_de_passe ||
                !confirmation
            ) {

                afficherMessage(
                    "Veuillez remplir tous les champs.",
                    "erreur"
                );

                return;
            }


            if (
                conditions &&
                !conditions.checked
            ) {

                afficherMessage(
                    "Vous devez accepter les conditions d'utilisation.",
                    "erreur"
                );

                return;
            }


            if (
                username.length < 3
            ) {

                afficherMessage(
                    "Le nom d'utilisateur doit contenir au moins 3 caractères.",
                    "erreur"
                );

                return;
            }


            if (
                mot_de_passe.length < 6
            ) {

                afficherMessage(
                    "Le mot de passe doit contenir au moins 6 caractères.",
                    "erreur"
                );

                return;
            }


            if (
                mot_de_passe !==
                confirmation
            ) {

                afficherMessage(
                    "Les mots de passe ne correspondent pas.",
                    "erreur"
                );

                return;
            }


            // ==================================================
            // DONNÉES
            // ==================================================

            const donnees = {

                nom:
                    nom,

                prenom:
                    prenom,

                username:
                    username,

                email:
                    email,

                mot_de_passe:
                    mot_de_passe

            };


            console.log(
                "📤 Envoi vers /auth/register..."
            );


            // ==================================================
            // BOUTON
            // ==================================================

            if (button) {

                button.disabled =
                    true;

                const span =
                    button.querySelector(
                        "span"
                    );

                if (span) {

                    span.textContent =
                        "Création du compte...";

                }

            }


            // ==================================================
            // FETCH
            // ==================================================

            try {

                const response =
                    await fetch(
                        "/auth/register",
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"

                            },

                            credentials:
                                "same-origin",

                            body:
                                JSON.stringify(
                                    donnees
                                )

                        }
                    );


                console.log(
                    "📥 HTTP :",
                    response.status
                );


                // ==================================================
                // RÉPONSE
                // ==================================================

                const resultat =
                    await response.json();


                console.log(
                    "📥 Réponse serveur :",
                    resultat
                );


                // ==================================================
                // ERREUR
                // ==================================================

                if (!response.ok) {

                    afficherMessage(
                        resultat.message ||
                        "Impossible de créer le compte.",
                        "erreur"
                    );

                    return;
                }


                // ==================================================
                // SUCCÈS
                // ==================================================

                if (
                    resultat.succes === true
                ) {

                    afficherMessage(
                        "✅ Compte créé avec succès ! Redirection...",
                        "succes"
                    );


                    form.reset();


                    setTimeout(
                        () => {

                            window.location.href =
                                "/login";

                        },
                        1500
                    );


                    return;
                }


                afficherMessage(
                    resultat.message ||
                    "L'inscription a échoué.",
                    "erreur"
                );


            } catch (erreur) {

                console.error(
                    "❌ ERREUR FETCH :",
                    erreur
                );


                afficherMessage(
                    "Impossible de contacter le serveur.",
                    "erreur"
                );


            } finally {

                if (button) {

                    button.disabled =
                        false;


                    const span =
                        button.querySelector(
                            "span"
                        );


                    if (span) {

                        span.textContent =
                            "Créer mon compte";

                    }

                }

            }

        }
    );

});