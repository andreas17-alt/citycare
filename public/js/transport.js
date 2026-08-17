// ==========================================================
// CITYCARE - TRANSPORT.JS
// Gestion du transport public
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    // ======================================================
    // ÉLÉMENTS HTML
    // ======================================================

    const recherche = document.getElementById("recherche");
    const btnRecherche = document.getElementById("btnRecherche");
    const btnReset = document.getElementById("btnReset");
    const btnResetEmpty = document.getElementById("btnResetEmpty");

    const tableTransport = document.getElementById("tableTransport");

    const totalLignes = document.getElementById("totalLignes");
    const nombreResultats = document.getElementById("nombreResultats");

    const messageTransport =
        document.getElementById("messageTransport");

    const messageErreur =
        document.getElementById("messageErreur");

    const aucunResultat =
        document.getElementById("aucunResultat");

    const nomUtilisateur =
        document.getElementById("nomUtilisateur");


    // ======================================================
    // VARIABLES
    // ======================================================

    let lignesTransport = [];


    // ======================================================
    // CHARGEMENT INITIAL
    // ======================================================

    chargerTransports();


    // ======================================================
    // CHARGER LES TRANSPORTS
    // ======================================================

    async function chargerTransports() {

        afficherChargement();

        masquerErreur();

        try {

            console.log("🚌 Chargement des transports...");

            const response = await fetch(
                "/transport/api",
                {
                    method: "GET",

                    credentials: "same-origin",

                    headers: {
                        "Accept": "application/json"
                    }
                }
            );


            console.log(
                "📡 Réponse API transport :",
                response.status
            );


            // ==================================================
            // SESSION NON CONNECTÉE
            // ==================================================

            if (response.status === 401) {

                afficherErreur(
                    "Votre session a expiré. Veuillez vous reconnecter."
                );

                setTimeout(() => {

                    window.location.href = "/login";

                }, 1500);

                return;
            }


            // ==================================================
            // AUTRE ERREUR HTTP
            // ==================================================

            if (!response.ok) {

                throw new Error(
                    `Erreur HTTP ${response.status}`
                );

            }


            // ==================================================
            // RÉCUPÉRER JSON
            // ==================================================

            const data = await response.json();


            console.log(
                "📥 Données reçues :",
                data
            );


            // ==================================================
            // VÉRIFIER LA RÉPONSE
            // ==================================================

            if (data.succes !== true) {

                throw new Error(
                    data.message ||
                    "Erreur lors du chargement des transports."
                );

            }


            // ==================================================
            // RÉCUPÉRER LES LIGNES
            // ==================================================

            if (!Array.isArray(data.transports)) {

                throw new Error(
                    "Les données de transport reçues sont invalides."
                );

            }


            lignesTransport = data.transports;


            console.log(
                "✅ Nombre de lignes :",
                lignesTransport.length
            );


            // ==================================================
            // AFFICHER
            // ==================================================

            afficherTransports(
                lignesTransport
            );

        }

        catch (erreur) {

            console.error(
                "❌ Erreur transport :",
                erreur
            );

            lignesTransport = [];

            afficherErreur(
                "Impossible de charger les lignes de transport."
            );

        }

    }


    // ======================================================
    // AFFICHER LE CHARGEMENT
    // ======================================================

    function afficherChargement() {

        if (messageTransport) {

            messageTransport.textContent =
                "Chargement des lignes...";

        }


        if (tableTransport) {

            tableTransport.innerHTML = `

                <tr>

                    <td
                        colspan="4"
                        class="loading-cell"
                    >

                        <div class="loading">

                            <span
                                class="loading-spinner"
                            ></span>

                            <span>
                                Chargement des lignes...
                            </span>

                        </div>

                    </td>

                </tr>

            `;

        }


        if (aucunResultat) {

            aucunResultat.hidden = true;

        }

    }


    // ======================================================
    // AFFICHER UNE ERREUR
    // ======================================================

    function afficherErreur(message) {

        if (messageErreur) {

            messageErreur.textContent = message;

            messageErreur.hidden = false;

        }


        if (messageTransport) {

            messageTransport.textContent =
                "Une erreur est survenue.";

        }


        if (tableTransport) {

            tableTransport.innerHTML = `

                <tr>

                    <td
                        colspan="4"
                        class="error-cell"
                    >

                        ❌
                        ${echapperHTML(message)}

                    </td>

                </tr>

            `;

        }


        if (nombreResultats) {

            nombreResultats.textContent = "0";

        }

    }


    // ======================================================
    // MASQUER ERREUR
    // ======================================================

    function masquerErreur() {

        if (messageErreur) {

            messageErreur.hidden = true;

            messageErreur.textContent = "";

        }

    }


    // ======================================================
    // AFFICHER LES TRANSPORTS
    // ======================================================

    function afficherTransports(lignes) {

        masquerErreur();


        if (!tableTransport) {

            console.error(
                "❌ #tableTransport introuvable."
            );

            return;

        }


        // ==================================================
        // VÉRIFICATION
        // ==================================================

        if (!Array.isArray(lignes)) {

            lignes = [];

        }


        // ==================================================
        // NOMBRE DE RÉSULTATS
        // ==================================================

        if (totalLignes) {

            totalLignes.textContent =
                lignesTransport.length;

        }


        if (nombreResultats) {

            nombreResultats.textContent =
                lignes.length;

        }


        // ==================================================
        // AUCUN RÉSULTAT
        // ==================================================

        if (lignes.length === 0) {

            tableTransport.innerHTML = "";


            if (messageTransport) {

                messageTransport.textContent =
                    "Aucune ligne trouvée.";

            }


            if (aucunResultat) {

                aucunResultat.hidden = false;

            }


            return;

        }


        // ==================================================
        // MASQUER ÉTAT VIDE
        // ==================================================

        if (aucunResultat) {

            aucunResultat.hidden = true;

        }


        // ==================================================
        // MESSAGE
        // ==================================================

        if (messageTransport) {

            messageTransport.textContent =
                `${lignes.length} ligne(s) disponible(s).`;

        }


        // ==================================================
        // VIDER TABLEAU
        // ==================================================

        tableTransport.innerHTML = "";


        // ==================================================
        // CRÉER LES LIGNES
        // ==================================================

        lignes.forEach((ligne, index) => {

            const tr =
                document.createElement("tr");


            // ------------------------------------------------
            // DONNÉES MYSQL
            // ------------------------------------------------

            const numero =
                ligne.numero_ligne ?? "-";

            const depart =
                ligne.depart ?? "-";

            const arrivee =
                ligne.arrivee ?? "-";


            // ------------------------------------------------
            // CELLULE NUMÉRO
            // ------------------------------------------------

            const tdNumero =
                document.createElement("td");

            tdNumero.innerHTML = `

                <strong>
                    ${echapperHTML(numero)}
                </strong>

            `;


            // ------------------------------------------------
            // CELLULE DÉPART
            // ------------------------------------------------

            const tdDepart =
                document.createElement("td");

            tdDepart.innerHTML = `

                <span class="route-point">
                    📍
                </span>

                ${echapperHTML(depart)}

            `;


            // ------------------------------------------------
            // CELLULE ARRIVÉE
            // ------------------------------------------------

            const tdArrivee =
                document.createElement("td");

            tdArrivee.innerHTML = `

                <span class="route-point">
                    🏁
                </span>

                ${echapperHTML(arrivee)}

            `;


            // ------------------------------------------------
            // CELLULE TRAJET
            // ------------------------------------------------

            const tdTrajet =
                document.createElement("td");

            tdTrajet.innerHTML = `

                <div class="route-line">

                    <span class="route-start">
                        ${echapperHTML(depart)}
                    </span>

                    <span class="route-arrow">
                        →
                    </span>

                    <span class="route-end">
                        ${echapperHTML(arrivee)}
                    </span>

                </div>

            `;


            // ------------------------------------------------
            // AJOUT DES CELLULES
            // ------------------------------------------------

            tr.appendChild(tdNumero);

            tr.appendChild(tdDepart);

            tr.appendChild(tdArrivee);

            tr.appendChild(tdTrajet);


            // ------------------------------------------------
            // AJOUT AU TABLEAU
            // ------------------------------------------------

            tableTransport.appendChild(tr);

        });

    }


    // ======================================================
    // RECHERCHE LOCALE
    // ======================================================

    function rechercherLocalement() {

        if (!recherche) {

            return;

        }


        const texte =
            recherche.value
                .trim()
                .toLowerCase();


        // ==================================================
        // RECHERCHE VIDE
        // ==================================================

        if (texte === "") {

            afficherTransports(
                lignesTransport
            );

            return;

        }


        // ==================================================
        // FILTRAGE
        // ==================================================

        const resultats =
            lignesTransport.filter((ligne) => {

                const numero =
                    String(
                        ligne.numero_ligne ?? ""
                    ).toLowerCase();


                const depart =
                    String(
                        ligne.depart ?? ""
                    ).toLowerCase();


                const arrivee =
                    String(
                        ligne.arrivee ?? ""
                    ).toLowerCase();


                return (

                    numero.includes(texte)

                    ||

                    depart.includes(texte)

                    ||

                    arrivee.includes(texte)

                );

            });


        // ==================================================
        // AFFICHER RÉSULTATS
        // ==================================================

        afficherTransports(
            resultats
        );

    }


    // ======================================================
    // BOUTON RECHERCHER
    // ======================================================

    if (btnRecherche) {

        btnRecherche.addEventListener(
            "click",
            rechercherLocalement
        );

    }


    // ======================================================
    // RECHERCHE EN DIRECT
    // ======================================================

    if (recherche) {

        recherche.addEventListener(
            "input",
            rechercherLocalement
        );


        recherche.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    rechercherLocalement();

                }

            }
        );

    }


    // ======================================================
    // RÉINITIALISER
    // ======================================================

    function reinitialiserRecherche() {

        if (recherche) {

            recherche.value = "";

        }


        afficherTransports(
            lignesTransport
        );

    }


    if (btnReset) {

        btnReset.addEventListener(
            "click",
            reinitialiserRecherche
        );

    }


    if (btnResetEmpty) {

        btnResetEmpty.addEventListener(
            "click",
            reinitialiserRecherche
        );

    }


    // ======================================================
    // RÉCUPÉRER LA SESSION
    // ======================================================

    chargerUtilisateur();


    async function chargerUtilisateur() {

        try {

            const response =
                await fetch(
                    "/api/session",
                    {
                        method: "GET",

                        credentials: "same-origin",

                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );


            if (!response.ok) {

                return;

            }


            const data =
                await response.json();


            console.log(
                "👤 Session :",
                data
            );


            if (
                data.succes === true &&
                data.connecte === true &&
                data.utilisateur
            ) {

                const utilisateur =
                    data.utilisateur;


                if (nomUtilisateur) {

                    nomUtilisateur.textContent =
                        `${utilisateur.prenom || ""} ${utilisateur.nom || ""}`.trim()
                        || utilisateur.username
                        || "Citoyen";

                }

            }

        }

        catch (erreur) {

            console.error(
                "❌ Erreur récupération session :",
                erreur
            );

        }

    }


    // ======================================================
    // PROTECTION CONTRE LE HTML
    // ======================================================

    function echapperHTML(valeur) {

        const div =
            document.createElement("div");

        div.textContent =
            valeur ?? "";

        return div.innerHTML;

    }

});