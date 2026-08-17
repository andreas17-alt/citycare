// ==========================================================
// CITYCARE
// public/js/register-admin.js
// CRÉATION COMPTE ADMINISTRATEUR
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // ==================================================
        // ÉLÉMENTS
        // ==================================================

        const form =
            document.getElementById(
                "formRegisterAdmin"
            );

        const message =
            document.getElementById(
                "message"
            );

        const button =
            document.getElementById(
                "btnRegisterAdmin"
            );

        const loader =
            document.getElementById(
                "btnLoader"
            );

        const togglePassword =
            document.getElementById(
                "togglePassword"
            );

        const toggleConfirmation =
            document.getElementById(
                "toggleConfirmation"
            );

        const password =
            document.getElementById(
                "password"
            );

        const confirmation =
            document.getElementById(
                "confirmation"
            );


        // ==================================================
        // VÉRIFICATION FORMULAIRE
        // ==================================================

        if (!form) {

            console.error(
                "❌ Formulaire formRegisterAdmin introuvable."
            );

            return;

        }


        // ==================================================
        // MESSAGE
        // ==================================================

        function afficherMessage(
            texte,
            type
        ) {

            if (!message) {
                return;
            }

            message.textContent =
                texte;

            message.className =
                "message";

            message.classList.add(
                type
            );

        }


        // ==================================================
        // ÉTAT BOUTON
        // ==================================================

        function changerEtatBouton(
            chargement
        ) {

            if (!button) {
                return;
            }

            button.disabled =
                chargement;

            if (loader) {

                if (chargement) {

                    loader.style.display =
                        "inline-block";

                } else {

                    loader.style.display =
                        "none";

                }

            }

        }


        // ==================================================
        // AFFICHER / CACHER MOT DE PASSE
        // ==================================================

        function configurerToggle(
            bouton,
            champ
        ) {

            if (
                !bouton ||
                !champ
            ) {

                return;

            }


            bouton.addEventListener(
                "click",
                () => {

                    if (
                        champ.type ===
                        "password"
                    ) {

                        champ.type =
                            "text";

                        bouton.textContent =
                            "◉";

                    } else {

                        champ.type =
                            "password";

                        bouton.textContent =
                            "◉";

                    }

                }
            );

        }


        configurerToggle(
            togglePassword,
            password
        );


        configurerToggle(
            toggleConfirmation,
            confirmation
        );


        // ==================================================
        // ENVOI FORMULAIRE
        // ==================================================

        form.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                // ------------------------------------------
                // RÉCUPÉRATION
                // ------------------------------------------

                const formData =
                    new FormData(form);


                const donnees = {

                    nom:
                        String(
                            formData.get("nom") || ""
                        ).trim(),

                    prenom:
                        String(
                            formData.get("prenom") || ""
                        ).trim(),

                    username:
                        String(
                            formData.get("username") || ""
                        ).trim(),

                    email:
                        String(
                            formData.get("email") || ""
                        ).trim(),

                    password:
                        String(
                            formData.get("password") || ""
                        ),

                    confirmation:
                        String(
                            formData.get("confirmation") || ""
                        ),

                    codeAdmin:
                        String(
                            formData.get("codeAdmin") || ""
                        ).trim()

                };


                // ------------------------------------------
                // VALIDATION FRONT-END
                // ------------------------------------------

                if (
                    !donnees.nom ||
                    !donnees.prenom ||
                    !donnees.username ||
                    !donnees.email ||
                    !donnees.password ||
                    !donnees.confirmation ||
                    !donnees.codeAdmin
                ) {

                    afficherMessage(
                        "Veuillez remplir tous les champs.",
                        "error"
                    );

                    return;

                }


                if (
                    donnees.password.length < 6
                ) {

                    afficherMessage(
                        "Le mot de passe doit contenir au moins 6 caractères.",
                        "error"
                    );

                    return;

                }


                if (
                    donnees.password !==
                    donnees.confirmation
                ) {

                    afficherMessage(
                        "Les mots de passe ne correspondent pas.",
                        "error"
                    );

                    return;

                }


                // ------------------------------------------
                // CHARGEMENT
                // ------------------------------------------

                changerEtatBouton(
                    true
                );

                afficherMessage(
                    "Création du compte administrateur...",
                    "loading"
                );


                // ------------------------------------------
                // REQUÊTE SERVEUR
                // ------------------------------------------

                try {

                    const response =
                        await fetch(
                            "/register-admin",
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


                    // --------------------------------------
                    // LECTURE RÉPONSE
                    // --------------------------------------

                    let resultat;

                    try {

                        resultat =
                            await response.json();

                    } catch (erreurJSON) {

                        console.error(
                            "Réponse serveur non JSON :",
                            erreurJSON
                        );

                        afficherMessage(
                            "Le serveur a retourné une réponse inattendue.",
                            "error"
                        );

                        changerEtatBouton(
                            false
                        );

                        return;

                    }


                    // --------------------------------------
                    // ERREUR SERVEUR
                    // --------------------------------------

                    if (
                        !response.ok ||
                        !resultat.succes
                    ) {

                        afficherMessage(
                            resultat.message ||
                            "Impossible de créer le compte.",
                            "error"
                        );

                        changerEtatBouton(
                            false
                        );

                        return;

                    }


                    // --------------------------------------
                    // SUCCÈS
                    // --------------------------------------

                    afficherMessage(
                        resultat.message ||
                        "Compte administrateur créé avec succès.",
                        "success"
                    );


                    // Vider le formulaire
                    form.reset();


                    // --------------------------------------
                    // REDIRECTION
                    // --------------------------------------

                    setTimeout(
                        () => {

                            window.location.href =
                                "/login";

                        },
                        1800
                    );


                } catch (erreur) {

                    console.error(
                        "❌ ERREUR FETCH REGISTER ADMIN :",
                        erreur
                    );


                    afficherMessage(
                        "Impossible de contacter le serveur.",
                        "error"
                    );


                    changerEtatBouton(
                        false
                    );

                }

            }
        );

    }
);