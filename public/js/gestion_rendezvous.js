// ==========================================================
// CITYCARE
// public/js/gestion_rendezvous.js
// GESTION DES RENDEZ-VOUS - ADMINISTRATION
// ==========================================================

"use strict";


// ==========================================================
// CONFIGURATION
// ==========================================================

// IMPORTANT :
// Cette route existe réellement dans routes/admin.js.
//
// GET /admin/api/rendezvous
//
const API_URL =
    "/admin/api/rendezvous";


// Actualisation automatique
const AUTO_REFRESH_INTERVAL =
    5000;


// Nombre de rendez-vous par page
const ITEMS_PER_PAGE =
    8;


// ==========================================================
// ETAT GLOBAL
// ==========================================================

let rendezVous = [];

let rendezVousFiltres = [];

let centres = [];

let currentPage = 1;

let selectedRdv = null;

let selectedDeleteId = null;

let autoRefreshTimer = null;

let isLoading = false;

let lastDataSignature = "";


// ==========================================================
// STATUTS
// ==========================================================
//
// IMPORTANT :
// Ces statuts doivent correspondre aux valeurs actuellement
// utilisées dans la base de données.
//
// Ton routes/admin.js ne fournit actuellement PAS de route
// PUT pour modifier un rendez-vous.
//
// Le JavaScript ne va donc PAS inventer une route.
//
// ==========================================================

const STATUTS = [
    "En attente",
    "En cours",
    "Terminé",
    "Refusé"
];


// ==========================================================
// ELEMENTS DOM
// ==========================================================

const elements = {};


// ==========================================================
// INITIALISER LES ELEMENTS
// ==========================================================

function initialiserElements() {

    // ------------------------------------------------------
    // SIDEBAR
    // ------------------------------------------------------

    elements.sidebar =
        document.getElementById(
            "adminRdvSidebar"
        );


    elements.menuToggle =
        document.getElementById(
            "menuToggle"
        );


    elements.logoutButton =
        document.getElementById(
            "logoutButton"
        );


    // ------------------------------------------------------
    // TOPBAR
    // ------------------------------------------------------

    elements.adminClock =
        document.getElementById(
            "adminClock"
        );


    elements.refreshButton =
        document.getElementById(
            "refreshButton"
        );


    // ------------------------------------------------------
    // FILTRES
    // ------------------------------------------------------

    elements.rdvSearch =
        document.getElementById(
            "rdvSearch"
        );


    elements.statusFilter =
        document.getElementById(
            "statusFilter"
        );


    elements.dateFilter =
        document.getElementById(
            "dateFilter"
        );


    elements.centreFilter =
        document.getElementById(
            "centreFilter"
        );


    elements.resetFilters =
        document.getElementById(
            "resetFilters"
        );


    // ------------------------------------------------------
    // TABLEAU
    // ------------------------------------------------------

    elements.rdvTableBody =
        document.getElementById(
            "rdvTableBody"
        );


    elements.paginationInfo =
        document.getElementById(
            "paginationInfo"
        );


    elements.previousPage =
        document.getElementById(
            "previousPage"
        );


    elements.currentPage =
        document.getElementById(
            "currentPage"
        );


    elements.nextPage =
        document.getElementById(
            "nextPage"
        );


    // ------------------------------------------------------
    // ETAT VIDE
    // ------------------------------------------------------

    elements.emptyState =
        document.getElementById(
            "emptyState"
        );


    elements.emptyResetButton =
        document.getElementById(
            "emptyResetButton"
        );


    // ------------------------------------------------------
    // STATISTIQUES
    // ------------------------------------------------------

    elements.totalRdv =
        document.getElementById(
            "totalRdv"
        );


    elements.pendingRdv =
        document.getElementById(
            "pendingRdv"
        );


    elements.confirmedRdv =
        document.getElementById(
            "confirmedRdv"
        );


    elements.refusedRdv =
        document.getElementById(
            "refusedRdv"
        );


    elements.completedRdv =
        document.getElementById(
            "completedRdv"
        );


    elements.pendingBadge =
        document.getElementById(
            "pendingBadge"
        );


    // ------------------------------------------------------
    // MODALE DETAILS
    // ------------------------------------------------------

    elements.detailsModal =
        document.getElementById(
            "rdvDetailsModal"
        );


    elements.closeDetailsModal =
        document.getElementById(
            "closeDetailsModal"
        );


    elements.cancelDetailsButton =
        document.getElementById(
            "cancelDetailsButton"
        );


    elements.detailId =
        document.getElementById(
            "detailId"
        );


    elements.detailUser =
        document.getElementById(
            "detailUser"
        );


    elements.detailCentre =
        document.getElementById(
            "detailCentre"
        );


    elements.detailService =
        document.getElementById(
            "detailService"
        );


    elements.detailDate =
        document.getElementById(
            "detailDate"
        );


    elements.detailTime =
        document.getElementById(
            "detailTime"
        );


    elements.detailCurrentStatus =
        document.getElementById(
            "detailCurrentStatus"
        );


    elements.detailStatus =
        document.getElementById(
            "detailStatus"
        );


    elements.saveStatusButton =
        document.getElementById(
            "saveStatusButton"
        );


    // ------------------------------------------------------
    // MODALE SUPPRESSION
    // ------------------------------------------------------

    elements.deleteModal =
        document.getElementById(
            "deleteRdvModal"
        );


    elements.closeDeleteModal =
        document.getElementById(
            "closeDeleteModal"
        );


    elements.cancelDeleteButton =
        document.getElementById(
            "cancelDeleteButton"
        );


    elements.confirmDeleteButton =
        document.getElementById(
            "confirmDeleteButton"
        );


    elements.deleteRdvReference =
        document.getElementById(
            "deleteRdvReference"
        );

}


// ==========================================================
// INITIALISATION
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initialiserElements();

        initialiserStatuts();

        initialiserEvenements();

        demarrerHorloge();

        chargerDonnees(true);

        demarrerActualisationAutomatique();

    }
);


// ==========================================================
// INITIALISER LES STATUTS
// ==========================================================

function initialiserStatuts() {

    // ------------------------------------------------------
    // FILTRE STATUT
    // ------------------------------------------------------

    if (
        elements.statusFilter
    ) {

        elements.statusFilter.innerHTML =
            "";

        ajouterOptionSelect(
            elements.statusFilter,
            "",
            "Tous les statuts"
        );


        STATUTS.forEach(
            statut => {

                ajouterOptionSelect(
                    elements.statusFilter,
                    statut,
                    statut
                );

            }
        );

    }


    // ------------------------------------------------------
    // SELECT DANS LA MODALE
    // ------------------------------------------------------

    if (
        elements.detailStatus
    ) {

        elements.detailStatus.innerHTML =
            "";


        STATUTS.forEach(
            statut => {

                ajouterOptionSelect(
                    elements.detailStatus,
                    statut,
                    statut
                );

            }
        );

    }

}


// ==========================================================
// AJOUTER UNE OPTION
// ==========================================================

function ajouterOptionSelect(
    select,
    value,
    texte
) {

    if (!select) {
        return;
    }


    const option =
        document.createElement(
            "option"
        );


    option.value =
        value;


    option.textContent =
        texte;


    select.appendChild(
        option
    );

}


// ==========================================================
// EVENEMENTS
// ==========================================================

function initialiserEvenements() {

    // ------------------------------------------------------
    // MENU MOBILE
    // ------------------------------------------------------

    if (
        elements.menuToggle &&
        elements.sidebar
    ) {

        elements.menuToggle.addEventListener(
            "click",
            () => {

                elements.sidebar.classList.toggle(
                    "open"
                );

            }
        );

    }


    // ------------------------------------------------------
    // FERMER SIDEBAR APRÈS NAVIGATION
    // ------------------------------------------------------

    if (
        elements.sidebar
    ) {

        const liens =
            elements.sidebar.querySelectorAll(
                ".admin-rdv-nav-link"
            );


        liens.forEach(
            lien => {

                lien.addEventListener(
                    "click",
                    () => {

                        elements.sidebar.classList.remove(
                            "open"
                        );

                    }
                );

            }
        );

    }


    // ------------------------------------------------------
    // ACTUALISER
    // ------------------------------------------------------

    if (
        elements.refreshButton
    ) {

        elements.refreshButton.addEventListener(
            "click",
            () => {

                chargerDonnees(true);

            }
        );

    }


    // ------------------------------------------------------
    // RECHERCHE
    // ------------------------------------------------------

    if (
        elements.rdvSearch
    ) {

        elements.rdvSearch.addEventListener(
            "input",
            () => {

                currentPage =
                    1;

                appliquerFiltres();

            }
        );

    }


    // ------------------------------------------------------
    // FILTRE STATUT
    // ------------------------------------------------------

    if (
        elements.statusFilter
    ) {

        elements.statusFilter.addEventListener(
            "change",
            () => {

                currentPage =
                    1;

                appliquerFiltres();

            }
        );

    }


    // ------------------------------------------------------
    // FILTRE DATE
    // ------------------------------------------------------

    if (
        elements.dateFilter
    ) {

        elements.dateFilter.addEventListener(
            "change",
            () => {

                currentPage =
                    1;

                appliquerFiltres();

            }
        );

    }


    // ------------------------------------------------------
    // FILTRE CENTRE
    // ------------------------------------------------------

    if (
        elements.centreFilter
    ) {

        elements.centreFilter.addEventListener(
            "change",
            () => {

                currentPage =
                    1;

                appliquerFiltres();

            }
        );

    }


    // ------------------------------------------------------
    // RESET FILTRES
    // ------------------------------------------------------

    if (
        elements.resetFilters
    ) {

        elements.resetFilters.addEventListener(
            "click",
            reinitialiserFiltres
        );

    }


    // ------------------------------------------------------
    // RESET DEPUIS ETAT VIDE
    // ------------------------------------------------------

    if (
        elements.emptyResetButton
    ) {

        elements.emptyResetButton.addEventListener(
            "click",
            reinitialiserFiltres
        );

    }


    // ------------------------------------------------------
    // PAGINATION PRECEDENTE
    // ------------------------------------------------------

    if (
        elements.previousPage
    ) {

        elements.previousPage.addEventListener(
            "click",
            () => {

                if (
                    currentPage > 1
                ) {

                    currentPage--;

                    afficherPage();

                }

            }
        );

    }


    // ------------------------------------------------------
    // PAGINATION SUIVANTE
    // ------------------------------------------------------

    if (
        elements.nextPage
    ) {

        elements.nextPage.addEventListener(
            "click",
            () => {

                const totalPages =
                    calculerNombrePages();


                if (
                    currentPage <
                    totalPages
                ) {

                    currentPage++;

                    afficherPage();

                }

            }
        );

    }


    // ------------------------------------------------------
    // FERMER MODALE DETAILS
    // ------------------------------------------------------

    if (
        elements.closeDetailsModal
    ) {

        elements.closeDetailsModal.addEventListener(
            "click",
            fermerDetails
        );

    }


    if (
        elements.cancelDetailsButton
    ) {

        elements.cancelDetailsButton.addEventListener(
            "click",
            fermerDetails
        );

    }


    // ------------------------------------------------------
    // ENREGISTRER STATUT
    // ------------------------------------------------------

    if (
        elements.saveStatusButton
    ) {

        elements.saveStatusButton.addEventListener(
            "click",
            sauvegarderStatut
        );

    }


    // ------------------------------------------------------
    // FERMER MODALE SUPPRESSION
    // ------------------------------------------------------

    if (
        elements.closeDeleteModal
    ) {

        elements.closeDeleteModal.addEventListener(
            "click",
            fermerSuppression
        );

    }


    if (
        elements.cancelDeleteButton
    ) {

        elements.cancelDeleteButton.addEventListener(
            "click",
            fermerSuppression
        );

    }


    // ------------------------------------------------------
    // CONFIRMER SUPPRESSION
    // ------------------------------------------------------

    if (
        elements.confirmDeleteButton
    ) {

        elements.confirmDeleteButton.addEventListener(
            "click",
            confirmerSuppression
        );

    }


    // ------------------------------------------------------
    // ESCAPE
    // ------------------------------------------------------

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Escape"
            ) {

                return;

            }


            fermerDetails();

            fermerSuppression();

        }
    );


    // ------------------------------------------------------
    // DECONNEXION
    // ------------------------------------------------------

    if (
        elements.logoutButton
    ) {

        elements.logoutButton.addEventListener(
            "click",
            deconnexion
        );

    }

}


// ==========================================================
// CHARGER LES RENDEZ-VOUS
// ==========================================================

async function chargerDonnees(
    afficherChargement = false
) {

    if (
        isLoading
    ) {

        return;

    }


    isLoading =
        true;


    if (
        afficherChargement
    ) {

        afficherEtatChargement();

    }


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "GET",

                    credentials:
                        "same-origin",

                    headers: {
                        "Accept":
                            "application/json"
                    },

                    cache:
                        "no-store"
                }
            );


        let data;


        try {

            data =
                await response.json();

        } catch (
            erreurJSON
        ) {

            throw new Error(
                "Le serveur a retourné une réponse invalide."
            );

        }


        if (
            response.status === 401
        ) {

            window.location.href =
                "/login";

            return;

        }


        if (
            response.status === 403
        ) {

            throw new Error(
                "Accès réservé aux administrateurs."
            );

        }


        if (
            !response.ok
        ) {

            throw new Error(
                data.message ||
                "Impossible de charger les rendez-vous."
            );

        }


        if (
            data.succes !== true
        ) {

            throw new Error(
                data.message ||
                "Erreur lors du chargement des rendez-vous."
            );

        }


        rendezVous =
            Array.isArray(
                data.rendezvous
            )
                ? data.rendezvous
                : [];


        const nouvelleSignature =
            creerSignatureDonnees(
                rendezVous
            );


        const donneesChangees =
            nouvelleSignature !==
            lastDataSignature;


        lastDataSignature =
            nouvelleSignature;


        mettreAJourStatistiques();

        mettreAJourCentres();

        appliquerFiltres();


        if (
            donneesChangees &&
            !afficherChargement &&
            window.citycareInitialDataLoaded
        ) {

            afficherToast(
                "Les rendez-vous ont été actualisés.",
                "success"
            );

        }


        window.citycareInitialDataLoaded =
            true;


        console.log(
            "📅 CityCare — rendez-vous chargés :",
            rendezVous.length
        );

    }
    catch (
        erreur
    ) {

        console.error(
            "❌ Erreur chargement rendez-vous :",
            erreur
        );


        afficherErreur(
            erreur.message ||
            "Impossible de charger les rendez-vous."
        );

    }
    finally {

        isLoading =
            false;

    }

}


// ==========================================================
// SIGNATURE DES DONNEES
// ==========================================================

function creerSignatureDonnees(
    donnees
) {

    return donnees
        .map(
            rdv => {

                return [
                    rdv.id_rdv,
                    rdv.id_user,
                    rdv.id_centre,
                    rdv.service,
                    rdv.date_rdv,
                    rdv.heure_rdv,
                    rdv.statut
                ].join("|");

            }
        )
        .sort()
        .join("||");

}


// ==========================================================
// ACTUALISATION AUTOMATIQUE
// ==========================================================

function demarrerActualisationAutomatique() {

    arreterActualisationAutomatique();


    autoRefreshTimer =
        setInterval(
            () => {

                chargerDonnees(false);

            },
            AUTO_REFRESH_INTERVAL
        );

}


// ==========================================================
// ARRETER ACTUALISATION
// ==========================================================

function arreterActualisationAutomatique() {

    if (
        autoRefreshTimer
    ) {

        clearInterval(
            autoRefreshTimer
        );

        autoRefreshTimer =
            null;

    }

}


// ==========================================================
// STATISTIQUES
// ==========================================================

function mettreAJourStatistiques() {

    const total =
        rendezVous.length;


    const attente =
        rendezVous.filter(
            rdv =>
                normaliserStatut(
                    rdv.statut
                ) === "En attente"
        ).length;


    const confirme =
        rendezVous.filter(
            rdv =>
                normaliserStatut(
                    rdv.statut
                ) === "Confirmé"
        ).length;


    const refuse =
        rendezVous.filter(
            rdv =>
                normaliserStatut(
                    rdv.statut
                ) === "Refusé"
        ).length;


    const termine =
        rendezVous.filter(
            rdv =>
                normaliserStatut(
                    rdv.statut
                ) === "Terminé"
        ).length;


    if (
        elements.totalRdv
    ) {

        elements.totalRdv.textContent =
            total;

    }


    if (
        elements.pendingRdv
    ) {

        elements.pendingRdv.textContent =
            attente;

    }


    if (
        elements.confirmedRdv
    ) {

        elements.confirmedRdv.textContent =
            confirme;

    }


    if (
        elements.refusedRdv
    ) {

        elements.refusedRdv.textContent =
            refuse;

    }


    if (
        elements.completedRdv
    ) {

        elements.completedRdv.textContent =
            termine;

    }


    if (
        elements.pendingBadge
    ) {

        elements.pendingBadge.textContent =
            attente;

    }

}


// ==========================================================
// CENTRES
// ==========================================================
//
// Le endpoint des centres n'est pas nécessaire ici.
// Les centres sont déjà fournis par
// GET /admin/api/rendezvous.
//
// On construit donc le filtre directement à partir
// des données récupérées.
//
// ==========================================================

function mettreAJourCentres() {

    const noms =
        rendezVous
            .map(
                rdv =>
                    rdv.centre
            )
            .filter(
                centre =>
                    centre !== null &&
                    centre !== undefined &&
                    String(
                        centre
                    ).trim() !== ""
            )
            .map(
                centre =>
                    String(
                        centre
                    ).trim()
            );


    centres =
        [...new Set(noms)]
            .sort(
                (a, b) =>
                    a.localeCompare(
                        b,
                        "fr"
                    )
            );


    if (
        !elements.centreFilter
    ) {

        return;

    }


    const ancienneValeur =
        elements.centreFilter.value;


    elements.centreFilter.innerHTML =
        "";


    ajouterOptionSelect(
        elements.centreFilter,
        "",
        "Tous les centres"
    );


    centres.forEach(
        centre => {

            ajouterOptionSelect(
                elements.centreFilter,
                centre,
                centre
            );

        }
    );


    if (
        centres.includes(
            ancienneValeur
        )
    ) {

        elements.centreFilter.value =
            ancienneValeur;

    }

}


// ==========================================================
// FILTRES
// ==========================================================

function appliquerFiltres() {

    const recherche =
        elements.rdvSearch
            ? elements.rdvSearch.value
                .trim()
                .toLowerCase()
            : "";


    const statut =
        elements.statusFilter
            ? elements.statusFilter.value
            : "";


    const date =
        elements.dateFilter
            ? elements.dateFilter.value
            : "";


    const centre =
        elements.centreFilter
            ? elements.centreFilter.value
            : "";


    rendezVousFiltres =
        rendezVous.filter(
            rdv => {

                // ------------------------------------------
                // RECHERCHE
                // ------------------------------------------

                if (
                    recherche
                ) {

                    const texte =
                        [
                            obtenirNomCitoyen(rdv),
                            rdv.username,
                            rdv.email,
                            rdv.service,
                            rdv.centre,
                            rdv.adresse,
                            rdv.telephone,
                            rdv.date_rdv,
                            rdv.heure_rdv,
                            rdv.statut
                        ]
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

                if (
                    statut &&
                    normaliserStatut(
                        rdv.statut
                    ) !==
                    normaliserStatut(
                        statut
                    )
                ) {

                    return false;

                }


                // ------------------------------------------
                // DATE
                // ------------------------------------------

                if (
                    date
                ) {

                    const dateRdv =
                        convertirDateISO(
                            rdv.date_rdv
                        );


                    if (
                        dateRdv !==
                        date
                    ) {

                        return false;

                    }

                }


                // ------------------------------------------
                // CENTRE
                // ------------------------------------------

                if (
                    centre &&
                    String(
                        rdv.centre || ""
                    ) !==
                    centre
                ) {

                    return false;

                }


                return true;

            }
        );


    currentPage =
        ajusterPageCourante();


    afficherPage();

}


// ==========================================================
// CALCULER NOMBRE DE PAGES
// ==========================================================

function calculerNombrePages() {

    if (
        rendezVousFiltres.length === 0
    ) {

        return 0;

    }


    return Math.ceil(
        rendezVousFiltres.length /
        ITEMS_PER_PAGE
    );

}


// ==========================================================
// AJUSTER PAGE
// ==========================================================

function ajusterPageCourante() {

    const totalPages =
        calculerNombrePages();


    if (
        totalPages === 0
    ) {

        return 1;

    }


    if (
        currentPage >
        totalPages
    ) {

        return totalPages;

    }


    if (
        currentPage <
        1
    ) {

        return 1;

    }


    return currentPage;

}


// ==========================================================
// AFFICHER PAGE
// ==========================================================

function afficherPage() {

    if (
        !elements.rdvTableBody
    ) {

        return;

    }


    masquerEtatVide();


    const total =
        rendezVousFiltres.length;


    const totalPages =
        calculerNombrePages();


    if (
        total === 0
    ) {

        elements.rdvTableBody.innerHTML =
            `

            <tr>

                <td
                    colspan="8"
                    class="admin-rdv-loading"
                >

                    <div>
                        ◷
                    </div>

                    <strong>
                        Aucun rendez-vous
                    </strong>

                    <span>
                        Aucun résultat ne correspond aux filtres sélectionnés.
                    </span>

                </td>

            </tr>

            `;


        afficherEtatVide();


        mettreAJourPagination(
            0,
            0,
            0
        );


        return;

    }


    masquerEtatVide();


    const debut =
        (
            currentPage - 1
        ) *
        ITEMS_PER_PAGE;


    const fin =
        debut +
        ITEMS_PER_PAGE;


    const page =
        rendezVousFiltres.slice(
            debut,
            fin
        );


    elements.rdvTableBody.innerHTML =
        "";


    page.forEach(
        rdv => {

            const ligne =
                creerLigneRendezVous(
                    rdv
                );


            elements.rdvTableBody.appendChild(
                ligne
            );

        }
    );


    ajouterEvenementsTableau();


    mettreAJourPagination(
        total,
        debut,
        fin
    );

}


// ==========================================================
// CREER UNE LIGNE
// ==========================================================

function creerLigneRendezVous(
    rdv
) {

    const ligne =
        document.createElement(
            "tr"
        );


    const id =
        rdv.id_rdv;


    const citoyen =
        obtenirNomCitoyen(
            rdv
        );


    const centre =
        rdv.centre ||
        "—";


    const service =
        rdv.service ||
        "—";


    const date =
        formaterDate(
            rdv.date_rdv
        );


    const heure =
        formaterHeure(
            rdv.heure_rdv
        );


    const statut =
        normaliserStatut(
            rdv.statut
        );


    ligne.innerHTML =
        `

        <td>
            <strong>
                #${escapeHTML(id)}
            </strong>
        </td>

        <td>
            ${escapeHTML(citoyen)}
        </td>

        <td>
            ${escapeHTML(service)}
        </td>

        <td>
            ${escapeHTML(centre)}
        </td>

        <td>
            ${escapeHTML(date)}
        </td>

        <td>
            ${escapeHTML(heure)}
        </td>

        <td>
            <strong>
                ${escapeHTML(statut)}
            </strong>
        </td>

        <td>

            <div
                style="
                    display:flex;
                    gap:6px;
                    align-items:center;
                "
            >

                <button
                    type="button"
                    class="admin-rdv-secondary-button"
                    data-action="details"
                    data-id="${escapeAttribute(id)}"
                    title="Voir les détails"
                >
                    Voir
                </button>

                <button
                    type="button"
                    class="admin-rdv-danger-button"
                    data-action="delete"
                    data-id="${escapeAttribute(id)}"
                    title="Supprimer"
                >
                    Supprimer
                </button>

            </div>

        </td>

        `;


    return ligne;

}


// ==========================================================
// EVENEMENTS DU TABLEAU
// ==========================================================

function ajouterEvenementsTableau() {

    if (
        !elements.rdvTableBody
    ) {

        return;

    }


    const boutons =
        elements.rdvTableBody.querySelectorAll(
            "[data-action]"
        );


    boutons.forEach(
        bouton => {

            bouton.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            bouton.dataset.id
                        );


                    const action =
                        bouton.dataset.action;


                    if (
                        action ===
                        "details"
                    ) {

                        ouvrirDetails(
                            id
                        );

                    }


                    if (
                        action ===
                        "delete"
                    ) {

                        ouvrirSuppression(
                            id
                        );

                    }

                }
            );

        }
    );

}


// ==========================================================
// TROUVER RENDEZ-VOUS
// ==========================================================

function trouverRendezVous(
    id
) {

    return rendezVous.find(
        rdv =>
            Number(
                rdv.id_rdv
            ) ===
            Number(id)
    );

}


// ==========================================================
// OUVRIR DETAILS
// ==========================================================

function ouvrirDetails(
    id
) {

    const rdv =
        trouverRendezVous(
            id
        );


    if (
        !rdv
    ) {

        afficherErreur(
            "Rendez-vous introuvable."
        );

        return;

    }


    selectedRdv =
        rdv;


    if (
        elements.detailId
    ) {

        elements.detailId.textContent =
            `#${rdv.id_rdv}`;

    }


    if (
        elements.detailUser
    ) {

        elements.detailUser.textContent =
            obtenirNomCitoyen(
                rdv
            );

    }


    if (
        elements.detailCentre
    ) {

        elements.detailCentre.textContent =
            rdv.centre ||
            "Centre inconnu";

    }


    if (
        elements.detailService
    ) {

        elements.detailService.textContent =
            rdv.service ||
            "—";

    }


    if (
        elements.detailDate
    ) {

        elements.detailDate.textContent =
            formaterDate(
                rdv.date_rdv
            );

    }


    if (
        elements.detailTime
    ) {

        elements.detailTime.textContent =
            formaterHeure(
                rdv.heure_rdv
            );

    }


    if (
        elements.detailCurrentStatus
    ) {

        elements.detailCurrentStatus.textContent =
            normaliserStatut(
                rdv.statut
            );

    }


    if (
        elements.detailStatus
    ) {

        const statut =
            normaliserStatut(
                rdv.statut
            );


        if (
            STATUTS.includes(
                statut
            )
        ) {

            elements.detailStatus.value =
                statut;

        }

    }


    afficherModal(
        elements.detailsModal
    );

}


// ==========================================================
// FERMER DETAILS
// ==========================================================

function fermerDetails() {

    if (
        !elements.detailsModal
    ) {

        return;

    }


    elements.detailsModal.hidden =
        true;


    elements.detailsModal.classList.remove(
        "show"
    );


    selectedRdv =
        null;


    document.body.classList.remove(
        "modal-open"
    );

}


// ==========================================================
// SAUVEGARDER STATUT
// ==========================================================
//
// ATTENTION :
// routes/admin.js fourni actuellement ne possède pas encore
// de route PUT pour rendez-vous.
//
// On ne fait donc PAS de faux fetch vers une route inexistante.
//
// ==========================================================

async function sauvegarderStatut() {

    if (
        !selectedRdv
    ) {

        return;

    }


    const nouveauStatut =
        elements.detailStatus
            ? elements.detailStatus.value
            : "";


    if (
        !STATUTS.includes(
            nouveauStatut
        )
    ) {

        afficherErreur(
            "Statut invalide."
        );

        return;

    }


    const ancienStatut =
        normaliserStatut(
            selectedRdv.statut
        );


    if (
        nouveauStatut ===
        ancienStatut
    ) {

        fermerDetails();

        return;

    }


    afficherToast(
        "La modification du statut sera activée lorsque la route PUT des rendez-vous sera ajoutée dans routes/admin.js.",
        "warning"
    );

}


// ==========================================================
// OUVRIR SUPPRESSION
// ==========================================================

function ouvrirSuppression(
    id
) {

    const rdv =
        trouverRendezVous(
            id
        );


    if (
        !rdv
    ) {

        afficherErreur(
            "Rendez-vous introuvable."
        );

        return;

    }


    selectedDeleteId =
        Number(
            id
        );


    if (
        elements.deleteRdvReference
    ) {

        elements.deleteRdvReference.textContent =
            `Rendez-vous #${rdv.id_rdv}`;

    }


    afficherModal(
        elements.deleteModal
    );

}


// ==========================================================
// FERMER SUPPRESSION
// ==========================================================

function fermerSuppression() {

    if (
        !elements.deleteModal
    ) {

        return;

    }


    elements.deleteModal.hidden =
        true;


    elements.deleteModal.classList.remove(
        "show"
    );


    selectedDeleteId =
        null;


    document.body.classList.remove(
        "modal-open"
    );

}


// ==========================================================
// CONFIRMER SUPPRESSION
// ==========================================================
//
// ATTENTION :
// Pas de DELETE inventé car routes/admin.js ne possède
// actuellement aucune route DELETE pour rendez-vous.
//
// ==========================================================

async function confirmerSuppression() {

    if (
        !selectedDeleteId
    ) {

        return;

    }


    afficherToast(
        "La suppression sera activée lorsque la route DELETE des rendez-vous sera ajoutée dans routes/admin.js.",
        "warning"
    );

}


// ==========================================================
// MODALE
// ==========================================================

function afficherModal(
    modal
) {

    if (
        !modal
    ) {

        return;

    }


    modal.hidden =
        false;


    document.body.classList.add(
        "modal-open"
    );


    requestAnimationFrame(
        () => {

            modal.classList.add(
                "show"
            );

        }
    );

}


// ==========================================================
// ETAT CHARGEMENT
// ==========================================================

function afficherEtatChargement() {

    if (
        !elements.rdvTableBody
    ) {

        return;

    }


    masquerEtatVide();


    elements.rdvTableBody.innerHTML =
        `

        <tr>

            <td
                colspan="8"
                class="admin-rdv-loading"
            >

                <div>
                    ◷
                </div>

                <strong>
                    Chargement des rendez-vous...
                </strong>

                <span>
                    Les données sont en cours de récupération.
                </span>

            </td>

        </tr>

        `;

}


// ==========================================================
// ETAT VIDE
// ==========================================================

function afficherEtatVide() {

    if (
        elements.emptyState
    ) {

        elements.emptyState.hidden =
            false;

    }

}


// ==========================================================
// MASQUER ETAT VIDE
// ==========================================================

function masquerEtatVide() {

    if (
        elements.emptyState
    ) {

        elements.emptyState.hidden =
            true;

    }

}


// ==========================================================
// PAGINATION
// ==========================================================

function mettreAJourPagination(
    total,
    debut,
    fin
) {

    const totalPages =
        calculerNombrePages();


    const premier =
        total === 0
            ? 0
            : debut + 1;


    const dernier =
        Math.min(
            fin,
            total
        );


    if (
        elements.paginationInfo
    ) {

        elements.paginationInfo.textContent =
            total === 0
                ? "0 rendez-vous"
                : `${premier}–${dernier} sur ${total} rendez-vous`;

    }


    if (
        elements.currentPage
    ) {

        elements.currentPage.textContent =
            totalPages === 0
                ? "1"
                : String(
                    currentPage
                );

    }


    if (
        elements.previousPage
    ) {

        elements.previousPage.disabled =
            currentPage <= 1 ||
            totalPages === 0;

    }


    if (
        elements.nextPage
    ) {

        elements.nextPage.disabled =
            currentPage >= totalPages ||
            totalPages === 0;

    }

}


// ==========================================================
// REINITIALISER FILTRES
// ==========================================================

function reinitialiserFiltres() {

    if (
        elements.rdvSearch
    ) {

        elements.rdvSearch.value =
            "";

    }


    if (
        elements.statusFilter
    ) {

        elements.statusFilter.value =
            "";

    }


    if (
        elements.dateFilter
    ) {

        elements.dateFilter.value =
            "";

    }


    if (
        elements.centreFilter
    ) {

        elements.centreFilter.value =
            "";

    }


    currentPage =
        1;


    appliquerFiltres();

}


// ==========================================================
// NORMALISER STATUT
// ==========================================================

function normaliserStatut(
    statut
) {

    if (
        statut === null ||
        statut === undefined
    ) {

        return "—";

    }


    const valeur =
        String(
            statut
        ).trim();


    const correspondances = {

        "en_attente":
            "En attente",

        "en attente":
            "En attente",

        "En attente":
            "En attente",

        "en_cours":
            "En cours",

        "en cours":
            "En cours",

        "En cours":
            "En cours",

        "confirme":
            "Confirmé",

        "confirmé":
            "Confirmé",

        "Confirmé":
            "Confirmé",

        "termine":
            "Terminé",

        "terminé":
            "Terminé",

        "Terminé":
            "Terminé",

        "refuse":
            "Refusé",

        "refusé":
            "Refusé",

        "Refusé":
            "Refusé"

    };


    return (
        correspondances[
            valeur
        ] ||
        valeur
    );

}


// ==========================================================
// NOM DU CITOYEN
// ==========================================================

function obtenirNomCitoyen(
    rdv
) {

    if (
        rdv.citoyen
    ) {

        return String(
            rdv.citoyen
        );

    }


    if (
        rdv.nom &&
        rdv.prenom
    ) {

        return `${rdv.nom} ${rdv.prenom}`;

    }


    if (
        rdv.username
    ) {

        return String(
            rdv.username
        );

    }


    if (
        rdv.email
    ) {

        return String(
            rdv.email
        );

    }


    return "Citoyen inconnu";

}


// ==========================================================
// FORMATER DATE
// ==========================================================

function formaterDate(
    valeur
) {

    if (
        !valeur
    ) {

        return "—";

    }


    const texte =
        String(
            valeur
        ).trim();


    const match =
        texte.match(
            /^(\d{4})-(\d{2})-(\d{2})/
        );


    if (
        match
    ) {

        return `${match[3]}/${match[2]}/${match[1]}`;

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

        return texte;

    }


    return date.toLocaleDateString(
        "fr-FR"
    );

}


// ==========================================================
// CONVERTIR DATE EN ISO
// ==========================================================

function convertirDateISO(
    valeur
) {

    if (
        !valeur
    ) {

        return "";

    }


    const texte =
        String(
            valeur
        ).trim();


    const match =
        texte.match(
            /^(\d{4})-(\d{2})-(\d{2})/
        );


    if (
        match
    ) {

        return `${match[1]}-${match[2]}-${match[3]}`;

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

        return "";

    }


    const annee =
        date.getFullYear();


    const mois =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const jour =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${annee}-${mois}-${jour}`;

}


// ==========================================================
// FORMATER HEURE
// ==========================================================

function formaterHeure(
    valeur
) {

    if (
        !valeur
    ) {

        return "—";

    }


    const texte =
        String(
            valeur
        ).trim();


    const match =
        texte.match(
            /(\d{1,2}):(\d{2})/
        );


    if (
        !match
    ) {

        return texte;

    }


    return (
        String(
            match[1]
        ).padStart(
            2,
            "0"
        ) +
        ":" +
        match[2]
    );

}


// ==========================================================
// HORLOGE
// ==========================================================

function demarrerHorloge() {

    mettreAJourHorloge();


    setInterval(
        mettreAJourHorloge,
        1000
    );

}


// ==========================================================
// METTRE A JOUR HORLOGE
// ==========================================================

function mettreAJourHorloge() {

    if (
        !elements.adminClock
    ) {

        return;

    }


    const maintenant =
        new Date();


    const heures =
        String(
            maintenant.getHours()
        ).padStart(
            2,
            "0"
        );


    const minutes =
        String(
            maintenant.getMinutes()
        ).padStart(
            2,
            "0"
        );


    const secondes =
        String(
            maintenant.getSeconds()
        ).padStart(
            2,
            "0"
        );


    elements.adminClock.textContent =
        `${heures}:${minutes}:${secondes}`;

}


// ==========================================================
// DECONNEXION
// ==========================================================
//
// Ton routes/admin.js possède :
// POST /admin/api/logout
//
// On utilise donc cette route et non une route inventée.
// ==========================================================

async function deconnexion() {

    const confirmation =
        window.confirm(
            "Voulez-vous vraiment vous déconnecter ?"
        );


    if (
        !confirmation
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                "/admin/api/logout",
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


        if (
            response.ok
        ) {

            window.location.href =
                "/login";

            return;

        }


        const data =
            await response.json()
                .catch(
                    () => ({})
                );


        throw new Error(
            data.message ||
            "Impossible de vous déconnecter."
        );

    }
    catch (
        erreur
    ) {

        console.error(
            "❌ Erreur déconnexion :",
            erreur
        );


        afficherErreur(
            erreur.message ||
            "Impossible de vous déconnecter."
        );

    }

}


// ==========================================================
// TOAST
// ==========================================================

function afficherToast(
    message,
    type = "info"
) {

    let toast =
        document.getElementById(
            "citycareRdvToast"
        );


    if (
        !toast
    ) {

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "citycareRdvToast";


        toast.style.position =
            "fixed";


        toast.style.right =
            "20px";


        toast.style.bottom =
            "20px";


        toast.style.zIndex =
            "9999";


        toast.style.maxWidth =
            "380px";


        toast.style.padding =
            "12px 16px";


        toast.style.borderRadius =
            "10px";


        toast.style.background =
            "#0f172a";


        toast.style.color =
            "#ffffff";


        toast.style.fontSize =
            "12px";


        toast.style.fontWeight =
            "600";


        toast.style.boxShadow =
            "0 10px 30px rgba(15, 23, 42, 0.18)";


        toast.style.opacity =
            "0";


        toast.style.transform =
            "translateY(10px)";


        toast.style.transition =
            "opacity .2s ease, transform .2s ease";


        document.body.appendChild(
            toast
        );

    }


    if (
        type === "success"
    ) {

        toast.style.background =
            "#166534";

    }
    else if (
        type === "error"
    ) {

        toast.style.background =
            "#b91c1c";

    }
    else if (
        type === "warning"
    ) {

        toast.style.background =
            "#92400e";

    }
    else {

        toast.style.background =
            "#0f172a";

    }


    toast.textContent =
        message;


    toast.style.opacity =
        "1";


    toast.style.transform =
        "translateY(0)";


    clearTimeout(
        toast._citycareTimer
    );


    toast._citycareTimer =
        setTimeout(
            () => {

                toast.style.opacity =
                    "0";

                toast.style.transform =
                    "translateY(10px)";

            },
            3500
        );

}


// ==========================================================
// ERREUR
// ==========================================================

function afficherErreur(
    message
) {

    console.error(
        "CityCare :",
        message
    );


    afficherToast(
        message,
        "error"
    );

}


// ==========================================================
// ESCAPE HTML
// ==========================================================

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


// ==========================================================
// ESCAPE ATTRIBUTE
// ==========================================================

function escapeAttribute(
    valeur
) {

    return escapeHTML(
        valeur
    );

}


// ==========================================================
// FIN
// ==========================================================

console.log(
    "✅ CityCare — gestion_rendezvous.js chargé."
);