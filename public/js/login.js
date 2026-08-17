// ==========================================================
// CITYCARE - LOGIN
// public/js/login.js
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("========================================");
    console.log("🔐 LOGIN.JS CHARGÉ");
    console.log("========================================");

    const formLogin =
        document.getElementById("formLogin");

    const btnLogin =
        document.getElementById("btnLogin");

    // --------------------------------------------------
    // Vérifier formulaire
    // --------------------------------------------------

    if (!formLogin) {

        console.error(
            "❌ #formLogin introuvable"
        );

        return;
    }

    console.log(
        "✅ #formLogin trouvé"
    );

    // --------------------------------------------------
    // SUBMIT
    // --------------------------------------------------

    formLogin.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            console.log("");
            console.log(
                "========================================"
            );

            console.log(
                "➡️ FORMULAIRE LOGIN ENVOYÉ"
            );

            console.log(
                "========================================"
            );

            const usernameElement =
                document.getElementById("username");

            const passwordElement =
                document.getElementById("password");

            // --------------------------------------------------
            // Vérifier champs
            // --------------------------------------------------

            if (
                !usernameElement ||
                !passwordElement
            ) {

                console.error(
                    "❌ Champ username/password introuvable"
                );

                alert(
                    "Erreur : champs de connexion introuvables."
                );

                return;
            }

            const username =
                usernameElement.value.trim();

            const mot_de_passe =
                passwordElement.value;

            console.log(
                "👤 Username :",
                username
            );

            // --------------------------------------------------
            // Vérification
            // --------------------------------------------------

            if (
                !username ||
                !mot_de_passe
            ) {

                alert(
                    "Veuillez remplir tous les champs."
                );

                return;
            }

            // --------------------------------------------------
            // Désactiver bouton
            // --------------------------------------------------

            if (btnLogin) {

                btnLogin.disabled = true;

                btnLogin.textContent =
                    "Connexion...";

            }

            try {

                console.log(
                    "📤 Envoi POST /auth/login"
                );

                // --------------------------------------------------
                // FETCH LOGIN
                // --------------------------------------------------

                const response =
                    await fetch(
                        "/auth/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            credentials:
                                "same-origin",

                            body:
                                JSON.stringify({

                                    username:
                                        username,

                                    mot_de_passe:
                                        mot_de_passe

                                })
                        }
                    );

                console.log(
                    "📥 HTTP :",
                    response.status
                );

                // --------------------------------------------------
                // Lire réponse
                // --------------------------------------------------

                const data =
                    await response.json();

                console.log(
                    "📥 Réponse serveur :",
                    data
                );

                // --------------------------------------------------
                // ÉCHEC
                // --------------------------------------------------

                if (
                    !response.ok ||
                    !data.succes
                ) {

                    alert(
                        data.message ||
                        "Connexion impossible."
                    );

                    return;
                }

                // --------------------------------------------------
                // SUCCÈS
                // --------------------------------------------------

                console.log(
                    "========================================"
                );

                console.log(
                    "✅ LOGIN RÉUSSI"
                );

                console.log(
                    "👤 Utilisateur :",
                    data.user
                );

                console.log(
                    "========================================"
                );

                // --------------------------------------------------
                // Vérifier la session
                // --------------------------------------------------

                console.log(
                    "🔎 Vérification de /auth/me..."
                );

                const sessionResponse =
                    await fetch(
                        "/auth/me",
                        {
                            method: "GET",

                            credentials:
                                "same-origin"
                        }
                    );

                const sessionData =
                    await sessionResponse.json();

                console.log(
                    "📥 Session :",
                    sessionData
                );

                if (
                    !sessionResponse.ok ||
                    !sessionData.connecte
                ) {

                    console.error(
                        "❌ Session non détectée après login"
                    );

                    alert(
                        "Connexion réussie mais la session n'a pas été enregistrée."
                    );

                    return;
                }

                console.log(
                    "✅ SESSION CONFIRMÉE"
                );

                // --------------------------------------------------
                // Redirection
                // --------------------------------------------------

                if (
                    data.user &&
                    data.user.role === "admin"
                ) {

                    console.log(
                        "➡️ Redirection admin"
                    );

                    window.location.href =
                        "/admin/dashboard";

                } else {

                    console.log(
                        "➡️ Redirection citoyen"
                    );

                    window.location.href =
                        "/dashboard";

                }

            } catch (erreur) {

                console.error(
                    "❌ ERREUR LOGIN :",
                    erreur
                );

                alert(
                    "Impossible de contacter le serveur."
                );

            } finally {

                if (btnLogin) {

                    btnLogin.disabled =
                        false;

                    btnLogin.textContent =
                        "Se connecter";

                }

            }

        }
    );

});