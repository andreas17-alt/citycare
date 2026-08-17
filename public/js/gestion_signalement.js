// ==========================================================
// CITYCARE — ADMIN
// GESTION DES RENDEZ-VOUS
// public/js/gestion_rendezvous.js
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("========================================");
    console.log("📅 CITYCARE — GESTION RENDEZ-VOUS");
    console.log("========================================");


    // ======================================================
    // CONFIGURATION
    // ======================================================

    const API_URL = "/admin/rendezvous/api";
    const API_UPDATE_URL = "/admin/rendezvous";


    // ======================================================
    // VARIABLES
    // ======================================================

    let rendezvous = [];
    let rendezvousFiltres = [];
    let pageActuelle = 1;

    const lignesParPage = 10;


    // ======================================================
    // ÉLÉMENTS DOM
    // ======================================================

    const tableBody =
        document.getElementById("rendezvousTableBody");

    const searchInput =
        document.getElementById("rendezvousSearch");

    const statusFilter =
        document.getElementById("rendezvousStatusFilter");

    const serviceFilter =
        document.getElementById("rendezvousServiceFilter");

    const pagination =
        document.getElementById("rendezvousPagination");

    const paginationInfo =
        document.getElementById("rendezvousPaginationInfo");


    // STATISTIQUES

    const totalRendezvous =
        document.getElementById("totalRendezvous");

    const totalAttente =
        document.getElementById("totalRendezvousAttente");

    const totalConfirmes =
        document.getElementById("totalRendezvousConfirmes");

    const totalRefuses =
        document.getElementById("totalRendezvousRefuses");

    const totalTermines =
        document.getElementById("totalRendezvousTermines");


    // MODAL

    const modal =
        document.getElementById("rendezvousModal");

    const modalClose =
        document.getElementById("rendezvousModalClose");

    const modalBody =
        document.getElementById("rendezvousModalBody");


    // TOAST

    const toast =
        document.getElementById("rendezvousToast");


    // ======================================================
    // INITIALISATION
    // ======================================================

    initialiser();


    async function initialiser() {

        console.log("🚀 Initialisation gestion rendez-vous...");

        initialiserFiltres();

        initialiserModal();

        await chargerRendezvous();

        console.log("========================================");
        console.log("✅ GESTION RENDEZ-VOUS PRÊTE");
        console.log("========================================");

    }


    // ======================================================
    // CHARGER LES RENDEZ-VOUS
    // ======================================================

    async function chargerRendezvous() {

        afficherChargement();

        try {

            const response = await fetch(
                API_URL,
                {
                    method: "GET",
                    credentials: "same-origin",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );


            if (!response.ok) {

                if (response.status === 401) {

                    window.location.href = "/login";

                    return;

                }


                if (response.status === 403) {

                    window.location.href = "/dashboard";

                    return;

                }


                throw new Error(
                    `Erreur HTTP ${response.status}`
                );

            }


            const data =
                await response.json();


            if (!data.succes) {

                throw new Error(
                    data.message ||
                    "Impossible de récupérer les rendez-vous."
                );

            }


            rendezvous =
                Array.isArray(data.rendezvous)
                    ? data.rendezvous
                    : [];


            console.log(
                "📅 Rendez-vous récupérés :",
                rendezvous.length
            );


            calculerStatistiques();

            remplirFiltreServices();

            appliquerFiltres();


        } catch (erreur) {

            console.error(
                "❌ Erreur chargement rendez-vous :",
                erreur
            );


            afficherErreur(
                "Impossible de charger les rendez-vous."
            );

        }

    }


    // ======================================================
    // FILTRES
    // ======================================================

    function initialiserFiltres() {

        if (searchInput) {

            searchInput.addEventListener(
                "input",
                () => {

                    pageActuelle = 1;

                    appliquerFiltres();

                }
            );

        }


        if (statusFilter) {

            statusFilter.addEventListener(
                "change",
                () => {

                    pageActuelle = 1;

                    appliquerFiltres();

                }
            );

        }


        if (serviceFilter) {

            serviceFilter.addEventListener(
                "change",
                () => {

                    pageActuelle = 1;

                    appliquerFiltres();

                }
            );

        }

    }


    // ======================================================
    // REMPLIR FILTRE SERVICES
    // ======================================================

    function remplirFiltreServices() {

        if (!serviceFilter) {
            return;
        }


        const valeurActuelle =
            serviceFilter.value;


        const services =
            [...new Set(
                rendezvous
                    .map(rdv => rdv.service)
                    .filter(service => service)
            )]
            .sort(
                (a, b) =>
                    String(a).localeCompare(
                        String(b),
                        "fr"
                    )
            );


        serviceFilter.innerHTML = `
            <option value="">
                Tous les services
            </option>
        `;


        services.forEach(service => {

            const option =
                document.createElement("option");


            option.value =
                service;


            option.textContent =
                service;


            serviceFilter.appendChild(
                option
            );

        });


        if (
            services.includes(
                valeurActuelle
            )
        ) {

            serviceFilter.value =
                valeurActuelle;

        }

    }


    // ======================================================
    // APPLIQUER LES FILTRES
    // ======================================================

    function appliquerFiltres() {

        const recherche =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        const statut =
            statusFilter
                ? statusFilter.value
                : "";


        const service =
            serviceFilter
                ? serviceFilter.value
                : "";


        rendezvousFiltres =
            rendezvous.filter(rdv => {

                // ------------------------------------------
                // RECHERCHE
                // ------------------------------------------

                if (recherche) {

                    const texte = [

                        rdv.id_rdv,

                        rdv.citoyen,

                        rdv.nom_citoyen,

                        rdv.prenom,

                        rdv.nom,

                        rdv.username,

                        rdv.email,

                        rdv.centre,

                        rdv.nom_centre,

                        rdv.service,

                        rdv.statut

                    ]
                    .filter(
                        valeur =>
                            valeur !== null &&
                            valeur !== undefined
                    )
                    .join(" ")
                    .toLowerCase();


                    if (
                        !texte.includes(
                            recherche
                        )
                    ) {

                        return false;

                    }

                }


                // ------------------------------------------
                // STATUT
                // ------------------------------------------

                if (statut) {

                    const statutNormalise =
                        normaliserStatut(
                            rdv.statut
                        );


                    if (
                        statutNormalise !==
                        statut
                    ) {

                        return false;

                    }

                }


                // ------------------------------------------
                // SERVICE
                // ------------------------------------------

                if (service) {

                    if (
                        String(
                            rdv.service || ""
                        ) !== String(service)
                    ) {

                        return false;

                    }

                }


                return true;

            });


        afficherTableau();

    }


    // ======================================================
    // AFFICHER LE TABLEAU
    // ======================================================

    function afficherTableau() {

        if (!tableBody) {
            return;
        }


        if (
            rendezvousFiltres.length === 0
        ) {

            afficherVide();

            afficherPagination();

            return;

        }


        const debut =
            (pageActuelle - 1) *
            lignesParPage;


        const fin =
            debut +
            lignesParPage;


        const page =
            rendezvousFiltres.slice(
                debut,
                fin
            );


        tableBody.innerHTML = "";


        page.forEach(rdv => {

            tableBody.appendChild(
                creerLigne(rdv)
            );

        });


        afficherPagination();

    }


    // ======================================================
    // CRÉER UNE LIGNE
    // ======================================================

    function creerLigne(rdv) {

        const tr =
            document.createElement("tr");


        const nomCitoyen =
            obtenirNomCitoyen(rdv);


        const initiales =
            obtenirInitiales(
                nomCitoyen
            );


        const centre =
            rdv.nom_centre ||
            rdv.centre ||
            `Centre #${rdv.id_centre}`;


        const service =
            rdv.service ||
            "Non renseigné";


        const date =
            rdv.date_rdv;


        const heure =
            rdv.heure_rdv;


        const statut =
            normaliserStatut(
                rdv.statut
            );


        tr.innerHTML = `

            <td>
                <span class="rdv-id">
                    #${echapperHTML(rdv.id_rdv)}
                </span>
            </td>


            <td>

                <div class="rdv-citizen">

                    <div class="rdv-citizen-avatar">
                        ${echapperHTML(initiales)}
                    </div>

                    <div class="rdv-citizen-info">

                        <strong>
                            ${echapperHTML(nomCitoyen)}
                        </strong>

                        <span>
                            ${
                                echapperHTML(
                                    rdv.username ||
                                    rdv.email ||
                                    `Utilisateur #${rdv.id_user}`
                                )
                            }
                        </span>

                    </div>

                </div>

            </td>


            <td>

                <div class="rdv-centre">

                    <strong>
                        ${echapperHTML(centre)}
                    </strong>

                    <span>
                        Centre de service
                    </span>

                </div>

            </td>


            <td>

                <span class="rdv-service">
                    ${echapperHTML(service)}
                </span>

            </td>


            <td>

                <div class="rdv-date">

                    <strong>
                        ${formaterDate(date)}
                    </strong>

                    <span>
                        ${jourDate(date)}
                    </span>

                </div>

            </td>


            <td>

                <span
                    class="rdv-time"
                >
                    ${formaterHeure(heure)}
                </span>

            </td>


            <td>

                <span
                    class="rdv-status ${classeStatut(statut)}"
                >
                    ${texteStatut(statut)}
                </span>

            </td>


            <td>

                <div class="rdv-actions">

                    <button
                        type="button"
                        class="rdv-action-button view"
                        title="Voir le rendez-vous"
                        data-action="view"
                        data-id="${echapperHTML(rdv.id_rdv)}"
                    >
                        👁
                    </button>

                    ${
                        statut === "en_attente"
                        ? `
                            <button
                                type="button"
                                class="rdv-action-button confirm"
                                title="Confirmer"
                                data-action="confirm"
                                data-id="${echapperHTML(rdv.id_rdv)}"
                            >
                                ✓
                            </button>

                            <button
                                type="button"
                                class="rdv-action-button refuse"
                                title="Refuser"
                                data-action="refuse"
                                data-id="${echapperHTML(rdv.id_rdv)}"
                            >
                                ×
                            </button>
                        `
                        : ""
                    }

                </div>

            </td>

        `;


        const boutons =
            tr.querySelectorAll(
                "[data-action]"
            );


        boutons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const action =
                        button.dataset.action;


                    const id =
                        Number(
                            button.dataset.id
                        );


                    traiterAction(
                        action,
                        id
                    );

                }
            );

        });


        return tr;

    }


    // ======================================================
    // ACTIONS
    // ======================================================

    async function traiterAction(
        action,
        id
    ) {

        const rdv =
            rendezvous.find(
                element =>
                    Number(
                        element.id_rdv
                    ) === Number(id)
            );


        if (!rdv) {

            afficherToast(
                "Rendez-vous introuvable.",
                "error"
            );

            return;

        }


        // --------------------------------------------------
        // VOIR
        // --------------------------------------------------

        if (action === "view") {

            afficherDetails(
                rdv
            );

            return;

        }


        // --------------------------------------------------
        // CONFIRMER
        // --------------------------------------------------

        if (action === "confirm") {

            const confirmation =
                window.confirm(
                    "Voulez-vous confirmer ce rendez-vous ?"
                );


            if (!confirmation) {
                return;
            }


            await modifierStatut(
                id,
                "Confirme"
            );

            return;

        }


        // --------------------------------------------------
        // REFUSER
        // --------------------------------------------------

        if (action === "refuse") {

            const confirmation =
                window.confirm(
                    "Voulez-vous refuser ce rendez-vous ?"
                );


            if (!confirmation) {
                return;
            }


            await modifierStatut(
                id,
                "Refuse"
            );

        }

    }


    // ======================================================
    // MODIFIER STATUT
    // ======================================================

    async function modifierStatut(
        id,
        statut
    ) {

        try {

            const response =
                await fetch(
                    `${API_UPDATE_URL}/${id}`,
                    {
                        method: "PUT",
                        credentials: "same-origin",
                        headers: {
                            "Content-Type":
                                "application/json",
                            "Accept":
                                "application/json"
                        },
                        body: JSON.stringify({
                            statut: statut
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Impossible de modifier le statut."
                );

            }


            if (!data.succes) {

                throw new Error(
                    data.message ||
                    "Modification refusée."
                );

            }


            afficherToast(
                data.message ||
                "Statut modifié avec succès.",
                "success"
            );


            await chargerRendezvous();


        } catch (erreur) {

            console.error(
                "❌ Erreur modification rendez-vous :",
                erreur
            );


            afficherToast(
                erreur.message ||
                "Impossible de modifier le rendez-vous.",
                "error"
            );

        }

    }


    // ======================================================
    // MODAL
    // ======================================================

    function initialiserModal() {

        if (modalClose) {

            modalClose.addEventListener(
                "click",
                fermerModal
            );

        }


        if (modal) {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target === modal
                    ) {

                        fermerModal();

                    }

                }
            );

        }


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape"
                ) {

                    fermerModal();

                }

            }
        );

    }


    // ======================================================
    // AFFICHER DÉTAILS
    // ======================================================

    function afficherDetails(rdv) {

        if (!modal || !modalBody) {
            return;
        }


        const nomCitoyen =
            obtenirNomCitoyen(rdv);


        const centre =
            rdv.nom_centre ||
            rdv.centre ||
            `Centre #${rdv.id_centre}`;


        modalBody.innerHTML = `

            <div class="rdv-detail-grid">

                <div class="rdv-detail">

                    <span class="rdv-detail-label">
                        ID rendez-vous
                    </span>

                    <span class="rdv-detail-value">
                        #${echapperHTML(rdv.id_rdv)}
                    </span>

                </div>


                <div class="rdv-detail">

                    <span class="rdv-detail-label">
                        Statut
                    </span>

                    <span class="rdv-detail-value">
                        ${texteStatut(
                            normaliserStatut(
                                rdv.statut
                            )
                        )}
                    </span>

                </div>


                <div class="rdv-detail">

                    <span class="rdv-detail-label">
                        Citoyen
                    </span>

                    <span class="rdv-detail-value">
                        ${echapperHTML(nomCitoyen)}
                    </span>

                </div>


                <div class="rdv-detail">

                    <span class="rdv-detail-label">
                        Identifiant utilisateur
                    </span>

                    <span class="rdv-detail-value">
                        #${echapperHTML(rdv.id_user)}
                    </span>

                </div>


                <div class="rdv-detail">

                    <span class="rdv-detail-label">
                        Centre
                    </span>

                    <span class="rdv-detail-value">
                        ${echapperHTML(centre)}
                    </span>

                </div>


                <div class="rdv-detail">

                    <span class="rdv-detail-label">
                        Service
                    </span>

                    <span class="rdv-detail-value">
                        ${echapperHTML(
                            rdv.service ||
                            "Non renseigné"
                        )}
                    </span>

                </div>


                <div class="rdv-detail">

                    <span class="rdv-detail-label">
                        Date
                    </span>

                    <span class="rdv-detail-value">
                        ${formaterDate(
                            rdv.date_rdv
                        )}
                    </span>

                </div>


                <div class="rdv-detail">

                    <span class="rdv-detail-label">
                        Heure
                    </span>

                    <span class="rdv-detail-value">
                        ${formaterHeure(
                            rdv.heure_rdv
                        )}
                    </span>

                </div>


            </div>

        `;


        modal.classList.add(
            "show"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    // ======================================================
    // FERMER MODAL
    // ======================================================

    function fermerModal() {

        if (!modal) {
            return;
        }


        modal.classList.remove(
            "show"
        );


        modal.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    // ======================================================
    // STATISTIQUES
    // ======================================================

    function calculerStatistiques() {

        const total =
            rendezvous.length;


        let attente = 0;
        let confirmes = 0;
        let refuses = 0;
        let termines = 0;


        rendezvous.forEach(rdv => {

            const statut =
                normaliserStatut(
                    rdv.statut
                );


            if (statut === "en_attente") {
                attente++;
            }

            if (statut === "confirme") {
                confirmes++;
            }

            if (statut === "refuse") {
                refuses++;
            }

            if (statut === "termine") {
                termines++;
            }

        });


        afficherNombre(
            totalRendezvous,
            total
        );


        afficherNombre(
            totalAttente,
            attente
        );


        afficherNombre(
            totalConfirmes,
            confirmes
        );


        afficherNombre(
            totalRefuses,
            refuses
        );


        afficherNombre(
            totalTermines,
            termines
        );

    }


    // ======================================================
    // AFFICHER NOMBRE
    // ======================================================

    function afficherNombre(
        element,
        nombre
    ) {

        if (!element) {
            return;
        }


        element.textContent =
            Number(nombre || 0)
                .toLocaleString(
                    "fr-FR"
                );

    }


    // ======================================================
    // PAGINATION
    // ======================================================

    function afficherPagination() {

        if (!pagination) {
            return;
        }


        const total =
            rendezvousFiltres.length;


        const nombrePages =
            Math.ceil(
                total /
                lignesParPage
            );


        pagination.innerHTML = "";


        if (
            nombrePages <= 1
        ) {

            if (paginationInfo) {

                paginationInfo.textContent =
                    total === 0
                        ? "Aucun rendez-vous"
                        : `${total} rendez-vous`;

            }

            return;

        }


        const debut =
            (pageActuelle - 1) *
            lignesParPage +
            1;


        const fin =
            Math.min(
                pageActuelle *
                lignesParPage,
                total
            );


        if (paginationInfo) {

            paginationInfo.textContent =
                `Affichage ${debut}–${fin} sur ${total} rendez-vous`;

        }


        // --------------------------------------------------
        // PRÉCÉDENT
        // --------------------------------------------------

        const precedent =
            creerBoutonPagination(
                "‹",
                pageActuelle - 1,
                pageActuelle === 1
            );


        pagination.appendChild(
            precedent
        );


        // --------------------------------------------------
        // PAGES
        // --------------------------------------------------

        for (
            let page = 1;
            page <= nombrePages;
            page++
        ) {

            const bouton =
                creerBoutonPagination(
                    page,
                    page,
                    false,
                    page === pageActuelle
                );


            pagination.appendChild(
                bouton
            );

        }


        // --------------------------------------------------
        // SUIVANT
        // --------------------------------------------------

        const suivant =
            creerBoutonPagination(
                "›",
                pageActuelle + 1,
                pageActuelle === nombrePages
            );


        pagination.appendChild(
            suivant
        );

    }


    // ======================================================
    // BOUTON PAGINATION
    // ======================================================

    function creerBoutonPagination(
        texte,
        page,
        desactive,
        actif = false
    ) {

        const bouton =
            document.createElement("button");


        bouton.type =
            "button";


        bouton.className =
            "rdv-page-button";


        if (actif) {

            bouton.classList.add(
                "active"
            );

        }


        bouton.textContent =
            texte;


        bouton.disabled =
            desactive;


        bouton.addEventListener(
            "click",
            () => {

                if (
                    page < 1
                ) {
                    return;
                }


                pageActuelle =
                    page;


                afficherTableau();

            }
        );


        return bouton;

    }


    // ======================================================
    // ÉTAT CHARGEMENT
    // ======================================================

    function afficherChargement() {

        if (!tableBody) {
            return;
        }


        tableBody.innerHTML = `

            <tr>

                <td colspan="8">

                    <div class="rdv-loading">

                        <div class="rdv-spinner"></div>

                        Chargement des rendez-vous...

                    </div>

                </td>

            </tr>

        `;

    }


    // ======================================================
    // ÉTAT VIDE
    // ======================================================

    function afficherVide() {

        tableBody.innerHTML = `

            <tr>

                <td colspan="8">

                    <div class="rdv-empty">

                        <div class="rdv-empty-icon">
                            📅
                        </div>

                        <h3>
                            Aucun rendez-vous trouvé
                        </h3>

                        <p>
                            Aucun rendez-vous ne correspond
                            aux critères sélectionnés.
                        </p>

                    </div>

                </td>

            </tr>

        `;

    }


    // ======================================================
    // ERREUR
    // ======================================================

    function afficherErreur(
        message
    ) {

        if (!tableBody) {
            return;
        }


        tableBody.innerHTML = `

            <tr>

                <td colspan="8">

                    <div class="rdv-empty">

                        <div class="rdv-empty-icon">
                            !
                        </div>

                        <h3>
                            Erreur
                        </h3>

                        <p>
                            ${echapperHTML(message)}
                        </p>

                    </div>

                </td>

            </tr>

        `;

    }


    // ======================================================
    // TOAST
    // ======================================================

    function afficherToast(
        message,
        type = "success"
    ) {

        if (!toast) {

            console.log(
                message
            );

            return;

        }


        toast.textContent =
            message;


        toast.className =
            `rdv-toast ${type} show`;


        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

    }


    // ======================================================
    // NORMALISER STATUT
    // ======================================================

    function normaliserStatut(
        statut
    ) {

        const valeur =
            String(
                statut || ""
            )
            .trim()
            .toLowerCase();


        const correspondances = {

            "en attente":
                "en_attente",

            "en_attente":
                "en_attente",

            "confirmé":
                "confirme",

            "confirme":
                "confirme",

            "refusé":
                "refuse",

            "refuse":
                "refuse",

            "terminé":
                "termine",

            "termine":
                "termine"

        };


        return (
            correspondances[valeur] ||
            valeur
        );

    }


    // ======================================================
    // TEXTE STATUT
    // ======================================================

    function texteStatut(
        statut
    ) {

        const textes = {

            en_attente:
                "En attente",

            confirme:
                "Confirmé",

            refuse:
                "Refusé",

            termine:
                "Terminé"

        };


        return (
            textes[statut] ||
            statut ||
            "Inconnu"
        );

    }


    // ======================================================
    // CLASSE STATUT
    // ======================================================

    function classeStatut(
        statut
    ) {

        const classes = {

            en_attente:
                "en-attente",

            confirme:
                "confirme",

            refuse:
                "refuse",

            termine:
                "termine"

        };


        return (
            classes[statut] ||
            ""
        );

    }


    // ======================================================
    // NOM CITOYEN
    // ======================================================

    function obtenirNomCitoyen(
        rdv
    ) {

        if (
            rdv.citoyen
        ) {

            return rdv.citoyen;

        }


        if (
            rdv.nom_citoyen
        ) {

            return rdv.nom_citoyen;

        }


        const nom =
            [
                rdv.prenom,
                rdv.nom
            ]
            .filter(Boolean)
            .join(" ")
            .trim();


        if (nom) {

            return nom;

        }


        if (
            rdv.username
        ) {

            return rdv.username;

        }


        return `Utilisateur #${rdv.id_user}`;

    }


    // ======================================================
    // INITIALES
    // ======================================================

    function obtenirInitiales(
        nom
    ) {

        const morceaux =
            String(nom || "")
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (
            morceaux.length === 0
        ) {

            return "??";

        }


        if (
            morceaux.length === 1
        ) {

            return morceaux[0]
                .substring(0, 2)
                .toUpperCase();

        }


        return (
            morceaux[0].charAt(0) +
            morceaux[
                morceaux.length - 1
            ].charAt(0)
        )
        .toUpperCase();

    }


    // ======================================================
    // FORMATER DATE
    // ======================================================

    function formaterDate(
        date
    ) {

        if (!date) {
            return "Non renseignée";
        }


        const objetDate =
            new Date(
                `${date}T00:00:00`
            );


        if (
            Number.isNaN(
                objetDate.getTime()
            )
        ) {

            return date;

        }


        return objetDate.toLocaleDateString(
            "fr-FR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    }


    // ======================================================
    // JOUR DE LA SEMAINE
    // ======================================================

    function jourDate(
        date
    ) {

        if (!date) {
            return "";
        }


        const objetDate =
            new Date(
                `${date}T00:00:00`
            );


        if (
            Number.isNaN(
                objetDate.getTime()
            )
        ) {

            return "";

        }


        return objetDate.toLocaleDateString(
            "fr-FR",
            {
                weekday: "long"
            }
        );

    }


    // ======================================================
    // FORMATER HEURE
    // ======================================================

    function formaterHeure(
        heure
    ) {

        if (!heure) {
            return "--:--";
        }


        return String(
            heure
        )
        .substring(
            0,
            5
        );

    }


    // ======================================================
    // PROTECTION HTML
    // ======================================================

    function echapperHTML(
        valeur
    ) {

        if (
            valeur === null ||
            valeur === undefined
        ) {

            return "";

        }


        return String(valeur)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    // ======================================================
    // API PUBLIQUE
    // ======================================================

    window.CityCareGestionRendezvous = {

        chargerRendezvous,

        appliquerFiltres,

        afficherDetails,

        modifierStatut

    };


});