// ==========================================================
// CITYCARE
// public/js/admin.js
// ADMINISTRATION UNIFIÉE
// ==========================================================

"use strict";


// ==========================================================
// CONFIGURATION
// ==========================================================

const API = {

    me:
        "/admin/api/me",

    dashboard:
        "/admin/api/dashboard",

    activites:
        "/admin/api/activites",

    signalements:
        "/admin/api/signalements",

    rendezvous:
        "/admin/api/rendezvous",

    utilisateurs:
        "/admin/api/utilisateurs",

    transports:
        "/admin/api/transports",

    centres:
        "/admin/api/centres-sante"

};


const AUTO_REFRESH_INTERVAL = 10000;


// ==========================================================
// ETAT
// ==========================================================

let admin = null;

let signalements = [];
let rendezvous = [];
let utilisateurs = [];
let transports = [];

let selectedRdv = null;
let selectedTransportId = null;

let autoRefreshTimer = null;


// ==========================================================
// DOM
// ==========================================================

const $ = id =>
    document.getElementById(id);


// ==========================================================
// INITIALISATION
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        initialiserNavigation();

        initialiserMenu();

        initialiserHorloge();

        initialiserBoutons();

        initialiserFiltres();

        initialiserModales();

        await chargerAdministrateur();

        await chargerTout();

        demarrerActualisation();

    }
);


// ==========================================================
// NAVIGATION
// ==========================================================

function initialiserNavigation() {

    const liens =
        document.querySelectorAll(
            ".nav-link"
        );


    liens.forEach(
        lien => {

            lien.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    const section =
                        lien.dataset.section;

                    if (!section) {
                        return;
                    }

                    afficherSection(
                        section
                    );

                    fermerSidebar();

                }
            );

        }
    );


    window.addEventListener(
        "hashchange",
        () => {

            afficherSection(
                obtenirSection()
            );

        }
    );


    afficherSection(
        obtenirSection()
    );

}


// ==========================================================
// SECTION
// ==========================================================

function obtenirSection() {

    const hash =
        window.location.hash
            .replace("#", "")
            .trim()
            .toLowerCase();


    const sections = [
        "dashboard",
        "signalements",
        "rendezvous",
        "utilisateurs",
        "transport",
        "statistiques",
        "securite",
        "parametres"
    ];


    if (!sections.includes(hash)) {

        return "dashboard";

    }


    return hash;

}


// ==========================================================
// AFFICHER SECTION
// ==========================================================

function afficherSection(
    nom
) {

    const section =
        document.getElementById(
            nom
        );


    if (!section) {
        return;
    }


    document
        .querySelectorAll(
            ".admin-section"
        )
        .forEach(
            element => {

                element.classList.toggle(
                    "active",
                    element.id === nom
                );

            }
        );


    document
        .querySelectorAll(
            ".nav-link"
        )
        .forEach(
            lien => {

                lien.classList.toggle(
                    "active",
                    lien.dataset.section === nom
                );

            }
        );


    const titres = {

        dashboard:
            "Tableau de bord",

        signalements:
            "Signalements",

        rendezvous:
            "Rendez-vous",

        utilisateurs:
            "Utilisateurs",

        transport:
            "Transport",

        statistiques:
            "Statistiques",

        securite:
            "Sécurité",

        parametres:
            "Paramètres"

    };


    if ($("breadcrumbCurrent")) {

        $("breadcrumbCurrent")
            .textContent =
            titres[nom] ||
            "Administration";

    }


    if (
        window.location.hash !==
        `#${nom}`
    ) {

        history.replaceState(
            null,
            "",
            `#${nom}`
        );

    }


    if (nom === "signalements") {
        chargerSignalements();
    }

    if (nom === "rendezvous") {
        chargerRendezvous();
    }

    if (nom === "utilisateurs") {
        chargerUtilisateurs();
    }

    if (nom === "transport") {
        chargerTransports();
    }

    if (nom === "statistiques") {
        chargerStatistiques();
    }

}


// ==========================================================
// MENU MOBILE
// ==========================================================

function initialiserMenu() {

    const button =
        $("menuToggle");

    const sidebar =
        $("sidebar");

    const overlay =
        $("sidebarOverlay");


    if (button) {

        button.addEventListener(
            "click",
            () => {

                sidebar.classList.toggle(
                    "open"
                );

                overlay.classList.toggle(
                    "active"
                );

            }
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            fermerSidebar
        );

    }

}


function fermerSidebar() {

    $("sidebar")?.classList.remove(
        "open"
    );

    $("sidebarOverlay")?.classList.remove(
        "active"
    );

}


// ==========================================================
// HORLOGE
// ==========================================================

function initialiserHorloge() {

    const clock =
        $("adminClock");


    if (!clock) {
        return;
    }


    function update() {

        const now =
            new Date();


        clock.textContent =
            [
                String(
                    now.getHours()
                ).padStart(2, "0"),

                String(
                    now.getMinutes()
                ).padStart(2, "0"),

                String(
                    now.getSeconds()
                ).padStart(2, "0")

            ].join(":");

    }


    update();

    setInterval(
        update,
        1000
    );

}


// ==========================================================
// ADMINISTRATEUR
// ==========================================================

async function chargerAdministrateur() {

    try {

        const data =
            await requeteJSON(
                API.me
            );


        admin =
            data.utilisateur ||
            data.user ||
            null;


        if (!admin) {
            return;
        }


        const nom =
            [
                admin.prenom,
                admin.nom
            ]
                .filter(Boolean)
                .join(" ");


        const username =
            admin.username
                ? `@${admin.username}`
                : "";


        if ($("adminName")) {

            $("adminName")
                .textContent =
                nom ||
                "Administrateur";

        }


        if ($("adminUsername")) {

            $("adminUsername")
                .textContent =
                username;

        }


        if ($("adminAvatar")) {

            $("adminAvatar")
                .textContent =
                obtenirInitiales(
                    admin.prenom,
                    admin.nom
                );

        }


        if ($("securityAdminName")) {

            $("securityAdminName")
                .textContent =
                nom ||
                "Administrateur";

        }


        if ($("settingName")) {

            $("settingName")
                .textContent =
                nom ||
                "—";

        }


        if ($("settingUsername")) {

            $("settingUsername")
                .textContent =
                admin.username ||
                "—";

        }


        if ($("settingEmail")) {

            $("settingEmail")
                .textContent =
                admin.email ||
                "—";

        }


        if ($("settingRole")) {

            $("settingRole")
                .textContent =
                admin.role ||
                "—";

        }

    }
    catch (error) {

        console.error(
            "Erreur administrateur :",
            error
        );

    }

}


// ==========================================================
// CHARGEMENT GLOBAL
// ==========================================================

async function chargerTout() {

    await Promise.allSettled([

        chargerDashboard(),

        chargerSignalements(),

        chargerRendezvous(),

        chargerUtilisateurs(),

        chargerTransports()

    ]);

}


// ==========================================================
// DASHBOARD
// ==========================================================

async function chargerDashboard() {

    try {

        const data =
            await requeteJSON(
                API.dashboard
            );


        const s =
            data.statistiques ||
            data.statistics ||
            {};


        const utilisateurs =
            nombre(
                s.utilisateurs
            );


        const citoyens =
            nombre(
                s.citoyens
            );


        const admins =
            nombre(
                s.admins
            );


        const signalementsTotal =
            nombre(
                s.signalements
            );


        const attente =
            nombre(
                s.signalements_attente
            );


        const enCours =
            nombre(
                s.signalements_en_cours
            );


        const resolus =
            nombre(
                s.signalements_resolus
            );


        const rdv =
            nombre(
                s.rendezvous
            );


        const rdvAttente =
            nombre(
                s.rendezvous_attente
            );


        const transports =
            nombre(
                s.transports
            );


        setText(
            "totalUsers",
            utilisateurs
        );

        setText(
            "totalCitizens",
            citoyens
        );

        setText(
            "totalAdmins",
            admins
        );

        setText(
            "totalSignalements",
            signalementsTotal
        );

        setText(
            "totalPending",
            attente
        );

        setText(
            "signalementsCours",
            enCours
        );

        setText(
            "signalementsResolus",
            resolus
        );

        setText(
            "totalRendezvous",
            rdv
        );

        setText(
            "rendezvousAttente",
            rdvAttente
        );

        setText(
            "totalTransport",
            transports
        );


        setText(
            "statsUsers",
            utilisateurs
        );

        setText(
            "statsSignalements",
            signalementsTotal
        );

        setText(
            "statsRendezvous",
            rdv
        );

        setText(
            "statsTransport",
            transports
        );

        setText(
            "statsPending",
            attente
        );

        setText(
            "statsCours",
            enCours
        );

        setText(
            "statsResolus",
            resolus
        );


        const total =
            Math.max(
                signalementsTotal,
                1
            );


        setWidth(
            "barPending",
            attente / total * 100
        );

        setWidth(
            "barCours",
            enCours / total * 100
        );

        setWidth(
            "barResolus",
            resolus / total * 100
        );


        await chargerActivites();

    }
    catch (error) {

        console.error(
            "Dashboard :",
            error
        );

    }

}


// ==========================================================
// ACTIVITES
// ==========================================================

async function chargerActivites() {

    const container =
        $("activitiesList");


    if (!container) {
        return;
    }


    try {

        const data =
            await requeteJSON(
                API.activites
            );


        const activites =
            Array.isArray(
                data.activites
            )
                ? data.activites
                : [];


        if (!activites.length) {

            container.innerHTML =
                `
                <div class="table-empty">
                    Aucune activité récente.
                </div>
                `;

            return;

        }


        container.innerHTML =
            activites
                .map(
                    activite => {

                        const type =
                            activite.type ||
                            "activité";


                        const titre =
                            activite.titre ||
                            "Activité";


                        const utilisateur =
                            activite.utilisateur ||
                            "Utilisateur";


                        return `
                            <div class="activity-item">

                                <div class="activity-icon">
                                    ${type === "rendezvous" ? "◷" : "!"}
                                </div>

                                <div class="activity-info">

                                    <strong>
                                        ${escapeHTML(titre)}
                                    </strong>

                                    <span>
                                        ${escapeHTML(utilisateur)}
                                        ·
                                        ${escapeHTML(type)}
                                    </span>

                                </div>

                            </div>
                        `;

                    }
                )
                .join("");

    }
    catch (error) {

        container.innerHTML =
            `
            <div class="table-empty">
                Impossible de charger les activités.
            </div>
            `;

    }

}


// ==========================================================
// SIGNALEMENTS
// ==========================================================

async function chargerSignalements() {

    const tbody =
        $("signalementsTableBody");


    if (!tbody) {
        return;
    }


    try {

        const data =
            await requeteJSON(
                API.signalements
            );


        signalements =
            Array.isArray(
                data.signalements
            )
                ? data.signalements
                : [];


        setText(
            "sideSignalements",
            signalements.filter(
                item =>
                    item.statut ===
                    "En attente"
            ).length
        );


        afficherSignalements();

    }
    catch (error) {

        tbody.innerHTML =
            `
            <tr>
                <td colspan="8" class="table-empty">
                    ${escapeHTML(error.message)}
                </td>
            </tr>
            `;

    }

}


function afficherSignalements() {

    const tbody =
        $("signalementsTableBody");


    if (!tbody) {
        return;
    }


    const recherche =
        String(
            $("signalementSearch")?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const statut =
        $("signalementStatusFilter")?.value ||
        "";


    const liste =
        signalements.filter(
            item => {

                if (
                    statut &&
                    item.statut !== statut
                ) {
                    return false;
                }


                if (!recherche) {
                    return true;
                }


                const texte =
                    [
                        item.id_signalement,
                        item.citoyen,
                        item.titre,
                        item.categorie,
                        item.type_probleme,
                        item.quartier,
                        item.statut
                    ]
                        .join(" ")
                        .toLowerCase();


                return texte.includes(
                    recherche
                );

            }
        );


    if (!liste.length) {

        tbody.innerHTML =
            `
            <tr>
                <td colspan="8" class="table-empty">
                    Aucun signalement trouvé.
                </td>
            </tr>
            `;

        return;

    }


    tbody.innerHTML =
        liste
            .map(
                item =>
                    `
                    <tr>

                        <td>
                            #${escapeHTML(item.id_signalement)}
                        </td>

                        <td>
                            ${escapeHTML(item.citoyen || "—")}
                        </td>

                        <td>
                            <strong>
                                ${escapeHTML(item.titre || "—")}
                            </strong>
                        </td>

                        <td>
                            ${escapeHTML(item.categorie || "—")}
                        </td>

                        <td>
                            ${escapeHTML(item.quartier || "—")}
                        </td>

                        <td>
                            ${afficherStatut(item.statut)}
                        </td>

                        <td>
                            ${formaterDateHeure(item.date_signalement)}
                        </td>

                        <td>

                            <div class="action-group">

                                <button
                                    type="button"
                                    class="action-button"
                                    data-signalement-details="${item.id_signalement}"
                                >
                                    Voir
                                </button>

                                <button
                                    type="button"
                                    class="action-button"
                                    data-signalement-status="${item.id_signalement}"
                                >
                                    Statut
                                </button>

                            </div>

                        </td>

                    </tr>
                    `
            )
            .join("");


    tbody
        .querySelectorAll(
            "[data-signalement-details]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        ouvrirDetailsSignalement(
                            Number(
                                button.dataset.signalementDetails
                            )
                        );

                    }
                );

            }
        );


    tbody
        .querySelectorAll(
            "[data-signalement-status]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        modifierStatutSignalement(
                            Number(
                                button.dataset.signalementStatus
                            )
                        );

                    }
                );

            }
        );

}


// ==========================================================
// DETAILS SIGNALEMENT
// ==========================================================

function ouvrirDetailsSignalement(
    id
) {

    const item =
        signalements.find(
            element =>
                Number(
                    element.id_signalement
                ) === id
        );


    if (!item) {
        return;
    }


    setText(
        "signalementDetailId",
        `#${item.id_signalement}`
    );

    setText(
        "signalementDetailUser",
        item.citoyen || "—"
    );

    setText(
        "signalementDetailCategory",
        item.categorie || "—"
    );

    setText(
        "signalementDetailType",
        item.type_probleme || "—"
    );

    setText(
        "signalementDetailQuartier",
        item.quartier || "—"
    );

    setText(
        "signalementDetailDate",
        formaterDateHeure(
            item.date_signalement
        )
    );

    setText(
        "signalementDetailTitle",
        item.titre || "—"
    );

    setText(
        "signalementDetailDescription",
        item.description || "Aucune description."
    );


    ouvrirModal(
        "signalementModal"
    );

}


// ==========================================================
// MODIFIER STATUT SIGNALEMENT
// ==========================================================

async function modifierStatutSignalement(
    id
) {

    const item =
        signalements.find(
            element =>
                Number(
                    element.id_signalement
                ) === id
        );


    if (!item) {
        return;
    }


    const statut =
        window.prompt(
            "Nouveau statut :\n\nEn attente\nEn cours\nRésolu\nRejeté",
            item.statut || "En attente"
        );


    if (!statut) {
        return;
    }


    const statuts = [
        "En attente",
        "En cours",
        "Résolu",
        "Rejeté"
    ];


    if (!statuts.includes(statut)) {

        afficherToast(
            "Statut invalide.",
            "error"
        );

        return;

    }


    try {

        await requeteJSON(
            `/admin/api/signalements/${id}/statut`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        statut
                    })
            }
        );


        afficherToast(
            "Statut du signalement mis à jour.",
            "success"
        );


        await chargerSignalements();

        await chargerDashboard();

    }
    catch (error) {

        afficherToast(
            error.message,
            "error"
        );

    }

}


// ==========================================================
// RENDEZ-VOUS
// ==========================================================

async function chargerRendezvous() {

    const tbody =
        $("rendezvousTableBody");


    if (!tbody) {
        return;
    }


    try {

        const data =
            await requeteJSON(
                API.rendezvous
            );


        rendezvous =
            Array.isArray(
                data.rendezvous
            )
                ? data.rendezvous
                : [];


        afficherRendezvous();


    }
    catch (error) {

        tbody.innerHTML =
            `
            <tr>
                <td colspan="8" class="table-empty">
                    ${escapeHTML(error.message)}
                </td>
            </tr>
            `;

    }

}


function afficherRendezvous() {

    const tbody =
        $("rendezvousTableBody");


    if (!tbody) {
        return;
    }


    const recherche =
        String(
            $("rdvSearch")?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const statut =
        $("rdvStatusFilter")?.value ||
        "";


    const liste =
        rendezvous.filter(
            rdv => {

                if (
                    statut &&
                    rdv.statut !== statut
                ) {
                    return false;
                }


                if (!recherche) {
                    return true;
                }


                const texte =
                    [
                        rdv.id_rdv,
                        rdv.citoyen,
                        rdv.username,
                        rdv.email,
                        rdv.centre,
                        rdv.service,
                        rdv.statut
                    ]
                        .join(" ")
                        .toLowerCase();


                return texte.includes(
                    recherche
                );

            }
        );


    mettreAJourStatsRdv();


    if (!liste.length) {

        tbody.innerHTML =
            `
            <tr>
                <td colspan="8" class="table-empty">
                    Aucun rendez-vous trouvé.
                </td>
            </tr>
            `;

        return;

    }


    tbody.innerHTML =
        liste
            .map(
                rdv =>
                    `
                    <tr>

                        <td>
                            #${escapeHTML(rdv.id_rdv)}
                        </td>

                        <td>
                            ${escapeHTML(rdv.citoyen || "—")}
                        </td>

                        <td>
                            ${escapeHTML(rdv.centre || "—")}
                        </td>

                        <td>
                            ${escapeHTML(rdv.service || "—")}
                        </td>

                        <td>
                            ${escapeHTML(rdv.date_rdv || "—")}
                        </td>

                        <td>
                            ${escapeHTML(rdv.heure_rdv || "—")}
                        </td>

                        <td>
                            ${afficherStatut(rdv.statut)}
                        </td>

                        <td>

                            <button
                                type="button"
                                class="action-button"
                                data-rdv="${rdv.id_rdv}"
                            >
                                Gérer
                            </button>

                        </td>

                    </tr>
                    `
            )
            .join("");


    tbody
        .querySelectorAll(
            "[data-rdv]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        ouvrirRdv(
                            Number(
                                button.dataset.rdv
                            )
                        );

                    }
                );

            }
        );

}


// ==========================================================
// STATS RDV
// ==========================================================

function mettreAJourStatsRdv() {

    const total =
        rendezvous.length;


    const pending =
        rendezvous.filter(
            r =>
                r.statut ===
                "En attente"
        ).length;


    const completed =
        rendezvous.filter(
            r =>
                r.statut ===
                "Terminé"
        ).length;


    const refused =
        rendezvous.filter(
            r =>
                r.statut ===
                "Refusé"
        ).length;


    setText(
        "rdvTotal",
        total
    );

    setText(
        "rdvPending",
        pending
    );

    setText(
        "rdvCompleted",
        completed
    );

    setText(
        "rdvRefused",
        refused
    );


    setText(
        "sideRendezvous",
        pending
    );

}


// ==========================================================
// OUVRIR RDV
// ==========================================================

function ouvrirRdv(
    id
) {

    const rdv =
        rendezvous.find(
            element =>
                Number(
                    element.id_rdv
                ) === id
        );


    if (!rdv) {
        return;
    }


    selectedRdv =
        rdv;


    setText(
        "rdvDetailId",
        `#${rdv.id_rdv}`
    );

    setText(
        "rdvDetailUser",
        rdv.citoyen || "—"
    );

    setText(
        "rdvDetailCentre",
        rdv.centre || "—"
    );

    setText(
        "rdvDetailService",
        rdv.service || "—"
    );

    setText(
        "rdvDetailDate",
        rdv.date_rdv || "—"
    );

    setText(
        "rdvDetailTime",
        rdv.heure_rdv || "—"
    );


    if ($("rdvDetailStatus")) {

        $("rdvDetailStatus").value =
            rdv.statut ||
            "En attente";

    }


    ouvrirModal(
        "rdvModal"
    );

}


// ==========================================================
// SAUVEGARDER STATUT RDV
// ==========================================================

async function sauvegarderStatutRdv() {

    if (!selectedRdv) {
        return;
    }


    const statut =
        $("rdvDetailStatus")?.value;


    try {

        await requeteJSON(
            `/admin/api/rendezvous/${selectedRdv.id_rdv}/statut`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        statut
                    })
            }
        );


        fermerModal(
            "rdvModal"
        );


        afficherToast(
            "Statut du rendez-vous mis à jour.",
            "success"
        );


        await chargerRendezvous();

        await chargerDashboard();

    }
    catch (error) {

        afficherToast(
            error.message,
            "error"
        );

    }

}


// ==========================================================
// UTILISATEURS
// ==========================================================

async function chargerUtilisateurs() {

    const tbody =
        $("usersTableBody");


    if (!tbody) {
        return;
    }


    try {

        const data =
            await requeteJSON(
                API.utilisateurs
            );


        utilisateurs =
            Array.isArray(
                data.utilisateurs
            )
                ? data.utilisateurs
                : [];


        afficherUtilisateurs();

    }
    catch (error) {

        tbody.innerHTML =
            `
            <tr>
                <td colspan="6" class="table-empty">
                    ${escapeHTML(error.message)}
                </td>
            </tr>
            `;

    }

}


function afficherUtilisateurs() {

    const tbody =
        $("usersTableBody");


    if (!tbody) {
        return;
    }


    const recherche =
        String(
            $("userSearch")?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const role =
        $("userRoleFilter")?.value ||
        "";


    const liste =
        utilisateurs.filter(
            user => {

                if (
                    role &&
                    user.role !== role
                ) {
                    return false;
                }


                if (!recherche) {
                    return true;
                }


                const texte =
                    [
                        user.id_user,
                        user.nom,
                        user.prenom,
                        user.username,
                        user.email,
                        user.role
                    ]
                        .join(" ")
                        .toLowerCase();


                return texte.includes(
                    recherche
                );

            }
        );


    if (!liste.length) {

        tbody.innerHTML =
            `
            <tr>
                <td colspan="6" class="table-empty">
                    Aucun utilisateur trouvé.
                </td>
            </tr>
            `;

        return;

    }


    tbody.innerHTML =
        liste
            .map(
                user =>
                    `
                    <tr>

                        <td>
                            #${escapeHTML(user.id_user)}
                        </td>

                        <td>

                            <div class="user-cell">

                                <div class="user-avatar">
                                    ${obtenirInitiales(
                                        user.prenom,
                                        user.nom
                                    )}
                                </div>

                                <div class="user-info">

                                    <strong>
                                        ${escapeHTML(
                                            `${user.prenom || ""} ${user.nom || ""}`
                                        )}
                                    </strong>

                                    <span>
                                        ${escapeHTML(
                                            user.username || ""
                                        )}
                                    </span>

                                </div>

                            </div>

                        </td>

                        <td>
                            ${escapeHTML(user.email || "—")}
                        </td>

                        <td>
                            ${escapeHTML(user.username || "—")}
                        </td>

                        <td>
                            ${afficherRole(user.role)}
                        </td>

                        <td>
                            ${formaterDateHeure(user.date_creation)}
                        </td>

                    </tr>
                    `
            )
            .join("");

}


// ==========================================================
// TRANSPORT
// ==========================================================

async function chargerTransports() {

    const tbody =
        $("transportTableBody");


    if (!tbody) {
        return;
    }


    try {

        const data =
            await requeteJSON(
                API.transports
            );


        transports =
            Array.isArray(
                data.transports
            )
                ? data.transports
                : [];


        afficherTransports();

    }
    catch (error) {

        tbody.innerHTML =
            `
            <tr>
                <td colspan="5" class="table-empty">
                    ${escapeHTML(error.message)}
                </td>
            </tr>
            `;

    }

}


function afficherTransports() {

    const tbody =
        $("transportTableBody");


    if (!tbody) {
        return;
    }


    const recherche =
        String(
            $("transportSearch")?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const liste =
        transports.filter(
            transport => {

                if (!recherche) {
                    return true;
                }


                return [
                    transport.numero_ligne,
                    transport.depart,
                    transport.arrivee
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(
                        recherche
                    );

            }
        );


    if (!liste.length) {

        tbody.innerHTML =
            `
            <tr>
                <td colspan="5" class="table-empty">
                    Aucune ligne trouvée.
                </td>
            </tr>
            `;

        return;

    }


    tbody.innerHTML =
        liste
            .map(
                transport =>
                    `
                    <tr>

                        <td>
                            #${escapeHTML(
                                transport.id_transport
                            )}
                        </td>

                        <td>
                            <strong>
                                ${escapeHTML(
                                    transport.numero_ligne
                                )}
                            </strong>
                        </td>

                        <td>
                            ${escapeHTML(
                                transport.depart
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                transport.arrivee
                            )}
                        </td>

                        <td>

                            <div class="action-group">

                                <button
                                    type="button"
                                    class="action-button"
                                    data-edit-transport="${transport.id_transport}"
                                >
                                    Modifier
                                </button>

                                <button
                                    type="button"
                                    class="action-button danger"
                                    data-delete-transport="${transport.id_transport}"
                                >
                                    Supprimer
                                </button>

                            </div>

                        </td>

                    </tr>
                    `
            )
            .join("");


    tbody
        .querySelectorAll(
            "[data-edit-transport]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        modifierTransport(
                            Number(
                                button.dataset.editTransport
                            )
                        );

                    }
                );

            }
        );


    tbody
        .querySelectorAll(
            "[data-delete-transport]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        supprimerTransport(
                            Number(
                                button.dataset.deleteTransport
                            )
                        );

                    }
                );

            }
        );

}


// ==========================================================
// STATISTIQUES
// ==========================================================

async function chargerStatistiques() {

    try {

        await chargerDashboard();

    }
    catch (error) {

        console.error(
            "Statistiques :",
            error
        );

    }

}


// ==========================================================
// BOUTONS
// ==========================================================

function initialiserBoutons() {

    $("refreshDashboard")
        ?.addEventListener(
            "click",
            async () => {

                await chargerDashboard();

                afficherToast(
                    "Tableau de bord actualisé.",
                    "success"
                );

            }
        );


    $("refreshSignalements")
        ?.addEventListener(
            "click",
            chargerSignalements
        );


    $("refreshRendezvous")
        ?.addEventListener(
            "click",
            chargerRendezvous
        );


    $("refreshUsers")
        ?.addEventListener(
            "click",
            chargerUtilisateurs
        );


    $("refreshTransport")
        ?.addEventListener(
            "click",
            chargerTransports
        );


    $("addTransportButton")
        ?.addEventListener(
            "click",
            () => {

                selectedTransportId =
                    null;

                $("transportModalTitle")
                    .textContent =
                    "Nouvelle ligne";

                $("transportId").value =
                    "";

                $("transportNumero").value =
                    "";

                $("transportDepart").value =
                    "";

                $("transportArrivee").value =
                    "";

                ouvrirModal(
                    "transportModal"
                );

            }
        );


    $("saveRdvStatus")
        ?.addEventListener(
            "click",
            sauvegarderStatutRdv
        );


    $("saveTransport")
        ?.addEventListener(
            "click",
            sauvegarderTransport
        );


    $("logout")
        ?.addEventListener(
            "click",
            deconnexion
        );

}


// ==========================================================
// FILTRES
// ==========================================================

function initialiserFiltres() {

    $("signalementSearch")
        ?.addEventListener(
            "input",
            afficherSignalements
        );


    $("signalementStatusFilter")
        ?.addEventListener(
            "change",
            afficherSignalements
        );


    $("resetSignalementFilters")
        ?.addEventListener(
            "click",
            () => {

                $("signalementSearch").value =
                    "";

                $("signalementStatusFilter").value =
                    "";

                afficherSignalements();

            }
        );


    $("rdvSearch")
        ?.addEventListener(
            "input",
            afficherRendezvous
        );


    $("rdvStatusFilter")
        ?.addEventListener(
            "change",
            afficherRendezvous
        );


    $("resetRdvFilters")
        ?.addEventListener(
            "click",
            () => {

                $("rdvSearch").value =
                    "";

                $("rdvStatusFilter").value =
                    "";

                afficherRendezvous();

            }
        );


    $("userSearch")
        ?.addEventListener(
            "input",
            afficherUtilisateurs
        );


    $("userRoleFilter")
        ?.addEventListener(
            "change",
            afficherUtilisateurs
        );


    $("transportSearch")
        ?.addEventListener(
            "input",
            afficherTransports
        );


    $("autoRefreshToggle")
        ?.addEventListener(
            "change",
            gererAutoRefresh
        );

}


// ==========================================================
// TRANSPORT MODAL
// ==========================================================

function modifierTransport(
    id
) {

    const transport =
        transports.find(
            element =>
                Number(
                    element.id_transport
                ) === id
        );


    if (!transport) {
        return;
    }


    selectedTransportId =
        id;


    $("transportModalTitle")
        .textContent =
        "Modifier la ligne";


    $("transportId").value =
        transport.id_transport;


    $("transportNumero").value =
        transport.numero_ligne ||
        "";

    $("transportDepart").value =
        transport.depart ||
        "";

    $("transportArrivee").value =
        transport.arrivee ||
        "";


    ouvrirModal(
        "transportModal"
    );

}


async function sauvegarderTransport() {

    const numero =
        $("transportNumero").value.trim();


    const depart =
        $("transportDepart").value.trim();


    const arrivee =
        $("transportArrivee").value.trim();


    if (!numero || !depart || !arrivee) {

        afficherToast(
            "Veuillez remplir tous les champs.",
            "error"
        );

        return;

    }


    const id =
        $("transportId").value;


    try {

        const url =
            id
                ? `/admin/api/transports/${id}`
                : "/admin/api/transports";


        await requeteJSON(
            url,
            {
                method:
                    id
                        ? "PUT"
                        : "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        numero_ligne:
                            numero,

                        depart,

                        arrivee
                    })
            }
        );


        fermerModal(
            "transportModal"
        );


        afficherToast(
            id
                ? "Ligne modifiée."
                : "Nouvelle ligne ajoutée.",
            "success"
        );


        await chargerTransports();

        await chargerDashboard();

    }
    catch (error) {

        afficherToast(
            error.message,
            "error"
        );

    }

}


async function supprimerTransport(
    id
) {

    const confirmation =
        window.confirm(
            "Voulez-vous vraiment supprimer cette ligne de transport ?"
        );


    if (!confirmation) {
        return;
    }


    try {

        await requeteJSON(
            `/admin/api/transports/${id}`,
            {
                method:
                    "DELETE"
            }
        );


        afficherToast(
            "Ligne de transport supprimée.",
            "success"
        );


        await chargerTransports();

        await chargerDashboard();

    }
    catch (error) {

        afficherToast(
            error.message,
            "error"
        );

    }

}


// ==========================================================
// MODALES
// ==========================================================

function initialiserModales() {

    $("closeRdvModal")
        ?.addEventListener(
            "click",
            () =>
                fermerModal(
                    "rdvModal"
                )
        );


    $("cancelRdvModal")
        ?.addEventListener(
            "click",
            () =>
                fermerModal(
                    "rdvModal"
                )
        );


    $("closeTransportModal")
        ?.addEventListener(
            "click",
            () =>
                fermerModal(
                    "transportModal"
                )
        );


    $("cancelTransportModal")
        ?.addEventListener(
            "click",
            () =>
                fermerModal(
                    "transportModal"
                )
        );


    $("closeSignalementModal")
        ?.addEventListener(
            "click",
            () =>
                fermerModal(
                    "signalementModal"
                )
        );


    $("cancelSignalementModal")
        ?.addEventListener(
            "click",
            () =>
                fermerModal(
                    "signalementModal"
                )
        );


    document
        .querySelectorAll(
            ".modal-overlay"
        )
        .forEach(
            overlay => {

                overlay.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target ===
                            overlay
                        ) {

                            fermerModal(
                                overlay.id
                            );

                        }

                    }
                );

            }
        );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                document
                    .querySelectorAll(
                        ".modal-overlay"
                    )
                    .forEach(
                        modal => {

                            modal.hidden =
                                true;

                        }
                    );

            }

        }
    );

}


function ouvrirModal(
    id
) {

    const modal =
        $(id);


    if (!modal) {
        return;
    }


    modal.hidden =
        false;

}


function fermerModal(
    id
) {

    const modal =
        $(id);


    if (!modal) {
        return;
    }


    modal.hidden =
        true;

}


// ==========================================================
// ACTUALISATION
// ==========================================================

function demarrerActualisation() {

    arreterActualisation();


    autoRefreshTimer =
        setInterval(
            async () => {

                if (
                    $("autoRefreshToggle") &&
                    !$("autoRefreshToggle").checked
                ) {

                    return;

                }


                await chargerDashboard();

                await chargerSignalements();

                await chargerRendezvous();

                await chargerUtilisateurs();

                await chargerTransports();

            },
            AUTO_REFRESH_INTERVAL
        );

}


function arreterActualisation() {

    if (autoRefreshTimer) {

        clearInterval(
            autoRefreshTimer
        );

        autoRefreshTimer =
            null;

    }

}


function gererAutoRefresh() {

    if (
        $("autoRefreshToggle")?.checked
    ) {

        demarrerActualisation();

    }
    else {

        arreterActualisation();

    }

}


// ==========================================================
// DECONNEXION
// ==========================================================

async function deconnexion() {

    const confirmation =
        window.confirm(
            "Voulez-vous vraiment vous déconnecter ?"
        );


    if (!confirmation) {
        return;
    }


    try {

        const response =
            await fetch(
                "/admin/api/logout",
                {
                    method:
                        "POST",

                    credentials:
                        "same-origin"
                }
            );


        if (response.ok) {

            window.location.href =
                "/login";

            return;

        }

    }
    catch (error) {

        console.error(
            "Déconnexion :",
            error
        );

    }


    window.location.href =
        "/login";

}


// ==========================================================
// REQUETE JSON
// ==========================================================

async function requeteJSON(
    url,
    options = {}
) {

    const response =
        await fetch(
            url,
            {
                credentials:
                    "same-origin",

                cache:
                    "no-store",

                ...options
            }
        );


    let data = null;


    try {

        data =
            await response.json();

    }
    catch {

        throw new Error(
            "Le serveur a renvoyé une réponse invalide."
        );

    }


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Une erreur serveur est survenue."
        );

    }


    if (
        data &&
        data.succes === false
    ) {

        throw new Error(
            data.message ||
            "Opération refusée."
        );

    }


    return data;

}


// ==========================================================
// UTILITAIRES
// ==========================================================

function setText(
    id,
    value
) {

    const element =
        $(id);


    if (element) {

        element.textContent =
            value ?? "0";

    }

}


function setWidth(
    id,
    value
) {

    const element =
        $(id);


    if (element) {

        element.style.width =
            `${Math.max(
                0,
                Math.min(
                    100,
                    value || 0
                )
            )}%`;

    }

}


function nombre(
    valeur
) {

    const n =
        Number(
            valeur
        );


    return Number.isFinite(n)
        ? n
        : 0;

}


function obtenirInitiales(
    prenom,
    nom
) {

    const p =
        String(
            prenom || ""
        ).trim();

    const n =
        String(
            nom || ""
        ).trim();


    return (
        `${p.charAt(0)}${n.charAt(0)}`
    )
        .toUpperCase() ||
        "AD";

}


function afficherRole(
    role
) {

    if (role === "admin") {

        return `
            <span class="status progress">
                Administrateur
            </span>
        `;

    }


    return `
        <span class="status success">
            Citoyen
        </span>
    `;

}


function afficherStatut(
    statut
) {

    let classe =
        "pending";


    if (
        statut === "En cours"
    ) {

        classe =
            "progress";

    }


    if (
        statut === "Résolu" ||
        statut === "Terminé"
    ) {

        classe =
            "success";

    }


    if (
        statut === "Rejeté" ||
        statut === "Refusé"
    ) {

        classe =
            "danger";

    }


    return `
        <span class="status ${classe}">
            ${escapeHTML(
                statut || "—"
            )}
        </span>
    `;

}


function formaterDateHeure(
    valeur
) {

    if (!valeur) {
        return "—";
    }


    const date =
        new Date(
            valeur
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            valeur
        );

    }


    return date.toLocaleDateString(
        "fr-FR",
        {
            day:
                "2-digit",

            month:
                "2-digit",

            year:
                "numeric"
        }
    );

}


function escapeHTML(
    valeur
) {

    if (
        valeur === null ||
        valeur === undefined
    ) {

        return "";
    }


    return String(
        valeur
    )
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


function afficherToast(
    message,
    type = "success"
) {

    const container =
        $("toastContainer");


    if (!container) {
        return;
    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast ${type}`;


    toast.textContent =
        message;


    container.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.remove();

        },
        3500
    );

}


// ==========================================================
// FIN
// ==========================================================

console.log(
    "CityCare — admin.js chargé."
);