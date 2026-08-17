// ==========================================================
// CITYCARE - JAVASCRIPT DASHBOARD CITOYEN
// public/js/dashboard.js
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("========================================");
    console.log("🚀 Dashboard CityCare chargé.");
    console.log("========================================");


    // ======================================================
    // 1. ÉLÉMENTS HTML
    // ======================================================

    const messageBienvenue =
        document.getElementById("messageBienvenue");

    const nomUtilisateur =
        document.getElementById("nomUtilisateur");

    const sidebarNom =
        document.getElementById("sidebarNom");

    const topProfileName =
        document.getElementById("topProfileName");

    const nomProfil =
        document.getElementById("nomProfil");

    const sidebarAvatar =
        document.getElementById("sidebarAvatar");

    const topAvatar =
        document.getElementById("topAvatar");

    const nbSignalements =
        document.getElementById("nbSignalements");

    const nbRendezvous =
        document.getElementById("nbRendezvous");

    const nbTransport =
        document.getElementById("nbTransport");

    const tableActivites =
        document.getElementById("tableActivites");

    const dateActuelle =
        document.getElementById("dateActuelle");

    const mobileMenu =
        document.getElementById("mobileMenu");

    const sidebar =
        document.querySelector(".sidebar");

    const overlay =
        document.getElementById("sidebarOverlay");

    const btnDeconnexion =
        document.getElementById("btnDeconnexion");

    const footerLogout =
        document.getElementById("footerLogout");


    // ======================================================
    // 2. INITIALISATION
    // ======================================================

    afficherDate();

    chargerDashboard();

    chargerActivites();

    initialiserMenuMobile();

    initialiserDeconnexion();

    initialiserNavigation();


    // ======================================================
    // 3. AFFICHER LA DATE
    // ======================================================

    function afficherDate() {

        if (!dateActuelle) {
            return;
        }

        const maintenant = new Date();

        dateActuelle.textContent =
            maintenant.toLocaleDateString(
                "fr-FR",
                {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            );
    }


    // ======================================================
    // 4. OBTENIR L'INITIALE
    // ======================================================

    function obtenirInitiale(nom, prenom) {

        if (
            prenom &&
            typeof prenom === "string" &&
            prenom.trim()
        ) {

            return prenom
                .trim()
                .charAt(0)
                .toUpperCase();
        }

        if (
            nom &&
            typeof nom === "string" &&
            nom.trim()
        ) {

            return nom
                .trim()
                .charAt(0)
                .toUpperCase();
        }

        return "C";
    }


    // ======================================================
    // 5. AFFICHER LES INFORMATIONS UTILISATEUR
    // ======================================================

    function afficherUtilisateur(utilisateur) {

        if (!utilisateur) {

            console.warn(
                "⚠️ Aucune information utilisateur reçue."
            );

            return;
        }


        const nom =
            utilisateur.nom || "";

        const prenom =
            utilisateur.prenom || "";

        const username =
            utilisateur.username || "";


        const nomComplet =
            `${prenom} ${nom}`.trim();


        const nomAffichage =
            nomComplet ||
            username ||
            "Citoyen";


        const prenomAffichage =
            prenom ||
            username ||
            "Citoyen";


        // --------------------------------------------------
        // MESSAGE DE BIENVENUE
        // --------------------------------------------------

        if (messageBienvenue) {

            messageBienvenue.textContent =
                `Bienvenue ${prenomAffichage} 👋`;
        }


        // --------------------------------------------------
        // DESCRIPTION
        // --------------------------------------------------

        if (nomUtilisateur) {

            nomUtilisateur.textContent =
                `Bonjour ${prenomAffichage}, voici un aperçu de votre activité sur CityCare.`;
        }


        // --------------------------------------------------
        // NOM SIDEBAR
        // --------------------------------------------------

        if (sidebarNom) {

            sidebarNom.textContent =
                nomAffichage;
        }


        // --------------------------------------------------
        // NOM TOPBAR
        // --------------------------------------------------

        if (topProfileName) {

            topProfileName.textContent =
                nomAffichage;
        }


        // --------------------------------------------------
        // NOM CARTE PROFIL
        // --------------------------------------------------

        if (nomProfil) {

            nomProfil.textContent =
                nomAffichage;
        }


        // --------------------------------------------------
        // AVATAR
        // --------------------------------------------------

        const initiale =
            obtenirInitiale(
                nom,
                prenom
            );


        if (sidebarAvatar) {

            sidebarAvatar.textContent =
                initiale;
        }


        if (topAvatar) {

            topAvatar.textContent =
                initiale;
        }


        console.log(
            "👤 Utilisateur affiché :",
            nomAffichage
        );
    }


    // ======================================================
    // 6. ANIMATION DES NOMBRES
    // ======================================================

    function animerNombre(element, valeurFinale) {

        if (!element) {
            return;
        }


        const valeur =
            Number(valeurFinale) || 0;


        const duree = 700;


        const debut =
            performance.now();


        function animation(temps) {

            const progression =
                Math.min(
                    (temps - debut) / duree,
                    1
                );


            const valeurActuelle =
                Math.floor(
                    progression * valeur
                );


            element.textContent =
                valeurActuelle;


            if (progression < 1) {

                requestAnimationFrame(
                    animation
                );

            } else {

                element.textContent =
                    valeur;
            }
        }


        requestAnimationFrame(
            animation
        );
    }


    // ======================================================
    // 7. CHARGER LE DASHBOARD
    // ======================================================

    async function chargerDashboard() {

        try {

            console.log(
                "📊 Chargement des données du dashboard..."
            );


            const response =
                await fetch(
                    "/dashboard/api/dashboard",
                    {
                        method: "GET",

                        credentials: "same-origin",

                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );


            console.log(
                "📥 Dashboard HTTP :",
                response.status
            );


            // ------------------------------------------------
            // SESSION EXPIRÉE
            // ------------------------------------------------

            if (response.status === 401) {

                console.warn(
                    "⚠️ Session expirée."
                );


                window.location.href =
                    "/login";


                return;
            }


            // ------------------------------------------------
            // AUTRE ERREUR HTTP
            // ------------------------------------------------

            if (!response.ok) {

                throw new Error(
                    `Erreur HTTP ${response.status}`
                );
            }


            // ------------------------------------------------
            // RÉCUPÉRATION JSON
            // ------------------------------------------------

            const data =
                await response.json();


            console.log(
                "📦 Données dashboard :",
                data
            );


            // ------------------------------------------------
            // VÉRIFICATION
            // ------------------------------------------------

            if (
                !data ||
                !data.succes
            ) {

                throw new Error(
                    data?.message ||
                    "Impossible de charger le dashboard."
                );
            }


            // ------------------------------------------------
            // UTILISATEUR
            // ------------------------------------------------

            afficherUtilisateur(
                data.utilisateur
            );


            // ------------------------------------------------
            // STATISTIQUES
            // ------------------------------------------------

            const statistiques =
                data.statistiques || {};


            animerNombre(
                nbSignalements,
                statistiques.signalements || 0
            );


            animerNombre(
                nbRendezvous,
                statistiques.rendezvous || 0
            );


            animerNombre(
                nbTransport,
                statistiques.transport || 0
            );


            console.log(
                "✅ Dashboard chargé avec succès."
            );


        } catch (erreur) {

            console.error(
                "❌ Erreur dashboard :",
                erreur
            );


            if (nomUtilisateur) {

                nomUtilisateur.textContent =
                    "Impossible de charger les informations du tableau de bord.";
            }
        }
    }


    // ======================================================
    // 8. FORMATER UNE DATE
    // ======================================================

    function formaterDate(date) {

        if (!date) {
            return "-";
        }


        const dateObjet =
            new Date(date);


        if (
            Number.isNaN(
                dateObjet.getTime()
            )
        ) {

            return String(date);
        }


        return dateObjet.toLocaleDateString(
            "fr-FR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );
    }


    // ======================================================
    // 9. NORMALISER LE STATUT
    // ======================================================

    function normaliserStatut(statut) {

        if (!statut) {

            return {
                texte: "Inconnu",
                classe: "unknown"
            };
        }


        const valeur =
            String(statut)
                .toLowerCase()
                .trim();


        // --------------------------------------------------
        // SUCCÈS
        // --------------------------------------------------

        if (
            valeur.includes("resolu") ||
            valeur.includes("résolu") ||
            valeur.includes("termin") ||
            valeur.includes("confirme") ||
            valeur.includes("confirmé") ||
            valeur.includes("accepte") ||
            valeur.includes("accepté")
        ) {

            return {
                texte: statut,
                classe: "success"
            };
        }


        // --------------------------------------------------
        // EN ATTENTE
        // --------------------------------------------------

        if (
            valeur.includes("attente") ||
            valeur.includes("cours") ||
            valeur.includes("pending")
        ) {

            return {
                texte: statut,
                classe: "warning"
            };
        }


        // --------------------------------------------------
        // ERREUR / REFUS
        // --------------------------------------------------

        if (
            valeur.includes("refus") ||
            valeur.includes("annul") ||
            valeur.includes("rejete") ||
            valeur.includes("rejeté")
        ) {

            return {
                texte: statut,
                classe: "danger"
            };
        }


        // --------------------------------------------------
        // AUTRE
        // --------------------------------------------------

        return {
            texte: statut,
            classe: "info"
        };
    }


    // ======================================================
    // 10. PROTECTION CONTRE HTML INJECTÉ
    // ======================================================

    function escapeHTML(valeur) {

        return String(valeur ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    // ======================================================
    // 11. AFFICHER LES ACTIVITÉS
    // ======================================================

    function afficherActivites(activites) {

        if (!tableActivites) {

            console.warn(
                "⚠️ #tableActivites introuvable."
            );

            return;
        }


        // --------------------------------------------------
        // AUCUNE ACTIVITÉ
        // --------------------------------------------------

        if (
            !Array.isArray(activites) ||
            activites.length === 0
        ) {

            tableActivites.innerHTML = `
                <tr>

                    <td colspan="3">

                        <div class="empty-state">

                            <span class="empty-icon">
                                📭
                            </span>

                            <strong>
                                Aucune activité récente
                            </strong>

                            <span>
                                Vos dernières actions apparaîtront ici.
                            </span>

                        </div>

                    </td>

                </tr>
            `;

            return;
        }


        // --------------------------------------------------
        // ACTIVITÉS
        // --------------------------------------------------

        tableActivites.innerHTML =
            activites
                .map((activite) => {

                    const statut =
                        normaliserStatut(
                            activite.statut
                        );


                    const date =
                        formaterDate(
                            activite.date
                        );


                    const action =
                        activite.action || "-";


                    return `
                        <tr>

                            <td>
                                ${escapeHTML(date)}
                            </td>

                            <td>
                                ${escapeHTML(action)}
                            </td>

                            <td>

                                <span
                                    class="status-badge ${statut.classe}"
                                >
                                    ${escapeHTML(
                                        statut.texte
                                    )}
                                </span>

                            </td>

                        </tr>
                    `;
                })
                .join("");
    }


    // ======================================================
    // 12. CHARGER LES ACTIVITÉS
    // ======================================================

    async function chargerActivites() {

        if (!tableActivites) {
            return;
        }


        try {

            console.log(
                "📋 Chargement des activités..."
            );


            const response =
                await fetch(
                    "/dashboard/api/activites",
                    {
                        method: "GET",

                        credentials: "same-origin",

                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );


            console.log(
                "📥 Activités HTTP :",
                response.status
            );


            // ------------------------------------------------
            // SESSION EXPIRÉE
            // ------------------------------------------------

            if (response.status === 401) {

                window.location.href =
                    "/login";

                return;
            }


            // ------------------------------------------------
            // ERREUR HTTP
            // ------------------------------------------------

            if (!response.ok) {

                throw new Error(
                    `Erreur HTTP ${response.status}`
                );
            }


            // ------------------------------------------------
            // JSON
            // ------------------------------------------------

            const data =
                await response.json();


            console.log(
                "📋 Activités reçues :",
                data
            );


            // ------------------------------------------------
            // VÉRIFICATION
            // ------------------------------------------------

            if (
                !data ||
                !data.succes
            ) {

                throw new Error(
                    data?.message ||
                    "Impossible de charger les activités."
                );
            }


            // ------------------------------------------------
            // AFFICHAGE
            // ------------------------------------------------

            afficherActivites(
                data.activites || []
            );


        } catch (erreur) {

            console.error(
                "❌ Erreur activités :",
                erreur
            );


            tableActivites.innerHTML = `
                <tr>

                    <td colspan="3">

                        <div class="error-state">

                            <span class="error-icon">
                                ⚠️
                            </span>

                            <strong>
                                Impossible de charger les activités
                            </strong>

                            <span>
                                Veuillez réessayer plus tard.
                            </span>

                        </div>

                    </td>

                </tr>
            `;
        }
    }


    // ======================================================
    // 13. OUVRIR LE MENU MOBILE
    // ======================================================

    function ouvrirMenuMobile() {

        if (
            !sidebar ||
            !overlay
        ) {
            return;
        }


        sidebar.classList.add(
            "mobile-open"
        );


        overlay.classList.add(
            "active"
        );


        document.body.classList.add(
            "menu-open"
        );


        if (mobileMenu) {

            mobileMenu.setAttribute(
                "aria-expanded",
                "true"
            );
        }
    }


    // ======================================================
    // 14. FERMER LE MENU MOBILE
    // ======================================================

    function fermerMenuMobile() {

        if (
            !sidebar ||
            !overlay
        ) {
            return;
        }


        sidebar.classList.remove(
            "mobile-open"
        );


        overlay.classList.remove(
            "active"
        );


        document.body.classList.remove(
            "menu-open"
        );


        if (mobileMenu) {

            mobileMenu.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    }


    // ======================================================
    // 15. INITIALISER LE MENU MOBILE
    // ======================================================

    function initialiserMenuMobile() {

        // --------------------------------------------------
        // BOUTON MENU
        // --------------------------------------------------

        if (mobileMenu) {

            mobileMenu.setAttribute(
                "aria-expanded",
                "false"
            );


            mobileMenu.addEventListener(
                "click",
                () => {

                    const menuOuvert =
                        sidebar?.classList.contains(
                            "mobile-open"
                        );


                    if (menuOuvert) {

                        fermerMenuMobile();

                    } else {

                        ouvrirMenuMobile();
                    }
                }
            );
        }


        // --------------------------------------------------
        // OVERLAY
        // --------------------------------------------------

        if (overlay) {

            overlay.addEventListener(
                "click",
                fermerMenuMobile
            );
        }


        // --------------------------------------------------
        // LIENS SIDEBAR
        // --------------------------------------------------

        if (sidebar) {

            const liens =
                sidebar.querySelectorAll("a");


            liens.forEach((lien) => {

                lien.addEventListener(
                    "click",
                    fermerMenuMobile
                );

            });
        }


        // --------------------------------------------------
        // TOUCHE ESC
        // --------------------------------------------------

        document.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Escape"
                ) {

                    fermerMenuMobile();
                }
            }
        );
    }


    // ======================================================
    // 16. DÉCONNEXION
    // ======================================================

    async function effectuerDeconnexion(event) {

        if (event) {

            event.preventDefault();
        }


        console.log(
            "🚪 Déconnexion..."
        );


        try {

            const response =
                await fetch(
                    "/auth/logout",
                    {
                        method: "POST",

                        credentials:
                            "same-origin",

                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );


            console.log(
                "📥 Déconnexion HTTP :",
                response.status
            );


        } catch (erreur) {

            console.error(
                "❌ Erreur déconnexion :",
                erreur
            );


        } finally {

            window.location.href =
                "/login";
        }
    }


    // ======================================================
    // 17. INITIALISER LA DÉCONNEXION
    // ======================================================

    function initialiserDeconnexion() {

        if (btnDeconnexion) {

            btnDeconnexion.addEventListener(
                "click",
                effectuerDeconnexion
            );
        }


        if (footerLogout) {

            footerLogout.addEventListener(
                "click",
                effectuerDeconnexion
            );
        }
    }


    // ======================================================
    // 18. INITIALISER LA NAVIGATION
    // ======================================================

    function initialiserNavigation() {

        const liensNavigation =
            document.querySelectorAll(
                ".sidebar a[href], " +
                ".quick-action[href], " +
                ".city-service[href], " +
                ".stat-card a[href], " +
                ".top-profile[href]"
            );


        liensNavigation.forEach((lien) => {

            lien.addEventListener(
                "click",
                () => {

                    console.log(
                        "➡️ Navigation vers :",
                        lien.getAttribute("href")
                    );


                    fermerMenuMobile();
                }
            );
        });
    }


    // ======================================================
    // 19. EMPÊCHER LE SCROLL QUAND MENU MOBILE OUVERT
    // ======================================================

    function gererScrollMobile() {

        if (!sidebar) {
            return;
        }


        const observer =
            new MutationObserver(() => {

                const ouvert =
                    sidebar.classList.contains(
                        "mobile-open"
                    );


                document.body.style.overflow =
                    ouvert
                        ? "hidden"
                        : "";
            });


        observer.observe(
            sidebar,
            {
                attributes: true,
                attributeFilter: ["class"]
            }
        );
    }


    gererScrollMobile();


    // ======================================================
    // 20. FIN
    // ======================================================

    console.log(
        "✅ Initialisation complète du dashboard."
    );

});