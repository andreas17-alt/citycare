// ==========================================================
// CITYCARE - RENDEZ-VOUS CITOYEN
// public/js/rendezvous.js
// Compatible avec rendezvous.html fourni
// ==========================================================

"use strict";


// ==========================================================
// CONFIGURATION
// ==========================================================

const API_BASE = "/rendezvous/api";


// ==========================================================
// VARIABLES
// ==========================================================

let formRendezVous = null;
let selectCentre = null;
let inputService = null;
let inputDate = null;
let inputHeure = null;

let tableRendezVous = null;
let aucunRendezVous = null;
let messageRendezVous = null;
let btnActualiser = null;

let modalRendezVous = null;
let formModifierRendezVous = null;
let modifierId = null;
let modifierCentre = null;
let modifierService = null;
let modifierDate = null;
let modifierHeure = null;

let btnFermerModal = null;
let btnAnnulerModification = null;


// ==========================================================
// INITIALISATION
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("🚀 CityCare - rendezvous.js chargé");

    initialiserElements();

    initialiserDateMinimum();

    chargerCentres();

    initialiserFormulaire();

    initialiserActualisation();

    initialiserModal();

    chargerMesRendezVous();

});


// ==========================================================
// RÉCUPÉRER LES ÉLÉMENTS HTML
// ==========================================================

function initialiserElements() {

    // ------------------------------------------------------
    // FORMULAIRE PRINCIPAL
    // ------------------------------------------------------

    formRendezVous =
        document.getElementById("formRendezvous");


    // ------------------------------------------------------
    // CHAMPS PRINCIPAUX
    // ------------------------------------------------------

    selectCentre =
        document.getElementById("centre");

    inputService =
        document.getElementById("service");

    inputDate =
        document.getElementById("date");

    inputHeure =
        document.getElementById("heure");


    // ------------------------------------------------------
    // LISTE DES RENDEZ-VOUS
    // ------------------------------------------------------

    tableRendezVous =
        document.getElementById("tableRendezvous");

    aucunRendezVous =
        document.getElementById("aucunRendezvous");


    // ------------------------------------------------------
    // MESSAGES
    // ------------------------------------------------------

    messageRendezVous =
        document.getElementById("messageRendezvous");


    // ------------------------------------------------------
    // ACTUALISATION
    // ------------------------------------------------------

    btnActualiser =
        document.getElementById("btnActualiser");


    // ------------------------------------------------------
    // MODALE
    // ------------------------------------------------------

    modalRendezVous =
        document.getElementById("modalRendezvous");

    formModifierRendezVous =
        document.getElementById("formModifierRendezvous");

    modifierId =
        document.getElementById("modifierId");

    modifierCentre =
        document.getElementById("modifierCentre");

    modifierService =
        document.getElementById("modifierService");

    modifierDate =
        document.getElementById("modifierDate");

    modifierHeure =
        document.getElementById("modifierHeure");


    btnFermerModal =
        document.getElementById("btnFermerModal");

    btnAnnulerModification =
        document.getElementById(
            "btnAnnulerModification"
        );


    console.log("🔎 Éléments rendez-vous :", {

        formulaire:
            !!formRendezVous,

        centre:
            !!selectCentre,

        service:
            !!inputService,

        date:
            !!inputDate,

        heure:
            !!inputHeure,

        tableau:
            !!tableRendezVous,

        aucun:
            !!aucunRendezVous,

        message:
            !!messageRendezVous,

        modal:
            !!modalRendezVous

    });

}


// ==========================================================
// DATE MINIMUM
// ==========================================================

function initialiserDateMinimum() {

    if (!inputDate) {
        return;
    }

    const maintenant =
        new Date();

    const annee =
        maintenant.getFullYear();

    const mois =
        String(
            maintenant.getMonth() + 1
        ).padStart(2, "0");

    const jour =
        String(
            maintenant.getDate()
        ).padStart(2, "0");

    inputDate.min =
        `${annee}-${mois}-${jour}`;

}


// ==========================================================
// CHARGER LES CENTRES
// GET /rendezvous/api/centres
// ==========================================================

async function chargerCentres() {

    if (!selectCentre) {

        console.error(
            "❌ #centre introuvable."
        );

        return;
    }


    selectCentre.innerHTML = "";

    const optionChargement =
        document.createElement("option");

    optionChargement.value = "";
    optionChargement.textContent =
        "Chargement des centres...";

    optionChargement.disabled = true;
    optionChargement.selected = true;

    selectCentre.appendChild(
        optionChargement
    );


    try {

        const response =
            await fetch(
                `${API_BASE}/centres`,
                {
                    method: "GET",
                    credentials: "same-origin",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const data =
            await lireJSON(response);


        console.log(
            "🏥 Centres reçus :",
            data
        );


        if (
            !response.ok ||
            !data ||
            data.succes !== true ||
            !Array.isArray(data.centres)
        ) {

            throw new Error(
                data && data.message
                    ? data.message
                    : "Impossible de charger les centres."
            );

        }


        selectCentre.innerHTML = "";


        const optionDefaut =
            document.createElement("option");

        optionDefaut.value = "";
        optionDefaut.textContent =
            "Sélectionnez un centre de santé";

        optionDefaut.disabled = true;
        optionDefaut.selected = true;

        selectCentre.appendChild(
            optionDefaut
        );


        if (data.centres.length === 0) {

            optionDefaut.textContent =
                "Aucun centre disponible";

            return;
        }


        data.centres.forEach(
            (centre) => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    String(
                        centre.id_centre
                    );

                option.textContent =
                    centre.nom || "Centre de santé";

                selectCentre.appendChild(
                    option
                );

            }
        );


        console.log(
            `✅ ${data.centres.length} centre(s) chargé(s).`
        );

    }
    catch (error) {

        console.error(
            "❌ ERREUR CENTRES :",
            error
        );


        selectCentre.innerHTML = "";


        const optionErreur =
            document.createElement("option");

        optionErreur.value = "";
        optionErreur.textContent =
            "Impossible de charger les centres";

        optionErreur.disabled = true;
        optionErreur.selected = true;

        selectCentre.appendChild(
            optionErreur
        );

    }

}


// ==========================================================
// FORMULAIRE CRÉATION
// ==========================================================

function initialiserFormulaire() {

    if (!formRendezVous) {

        console.error(
            "❌ #formRendezvous introuvable."
        );

        return;
    }


    formRendezVous.addEventListener(
        "submit",
        creerRendezVous
    );

}


// ==========================================================
// CRÉER UN RENDEZ-VOUS
// POST /rendezvous/api
// ==========================================================

async function creerRendezVous(event) {

    event.preventDefault();


    const idCentre =
        selectCentre
            ? selectCentre.value
            : "";

    const service =
        inputService
            ? inputService.value.trim()
            : "";

    const dateRdv =
        inputDate
            ? inputDate.value
            : "";

    const heureRdv =
        inputHeure
            ? inputHeure.value
            : "";


    // ------------------------------------------------------
    // VALIDATION
    // ------------------------------------------------------

    if (!idCentre) {

        afficherMessage(
            "Veuillez sélectionner un centre de santé.",
            "error"
        );

        return;
    }


    if (!service) {

        afficherMessage(
            "Veuillez indiquer le service demandé.",
            "error"
        );

        return;
    }


    if (!dateRdv) {

        afficherMessage(
            "Veuillez sélectionner une date.",
            "error"
        );

        return;
    }


    if (!heureRdv) {

        afficherMessage(
            "Veuillez sélectionner une heure.",
            "error"
        );

        return;
    }


    // ------------------------------------------------------
    // BOUTON
    // ------------------------------------------------------

    const bouton =
        formRendezVous.querySelector(
            'button[type="submit"]'
        );


    const texteOriginal =
        bouton
            ? bouton.innerHTML
            : "Réserver le rendez-vous";


    if (bouton) {

        bouton.disabled = true;

        bouton.innerHTML =
            "<span>Réservation...</span>";

    }


    try {

        const response =
            await fetch(
                API_BASE,
                {
                    method: "POST",

                    credentials:
                        "same-origin",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            id_centre:
                                Number(idCentre),

                            service:
                                service,

                            date_rdv:
                                dateRdv,

                            heure_rdv:
                                heureRdv

                        })

                }
            );


        const data =
            await lireJSON(response);


        console.log(
            "📡 Création rendez-vous :",
            data
        );


        if (
            !response.ok ||
            !data ||
            data.succes !== true
        ) {

            afficherMessage(
                data && data.message
                    ? data.message
                    : "Impossible de créer le rendez-vous.",
                "error"
            );

            return;
        }


        // --------------------------------------------------
        // SUCCÈS
        // --------------------------------------------------

        afficherMessage(
            "Rendez-vous créé avec succès.",
            "success"
        );


        // --------------------------------------------------
        // RESET FORMULAIRE
        // --------------------------------------------------

        formRendezVous.reset();


        initialiserDateMinimum();


        // --------------------------------------------------
        // RECHARGER LES DONNÉES
        // --------------------------------------------------

        await chargerMesRendezVous();

    }
    catch (error) {

        console.error(
            "❌ ERREUR CRÉATION :",
            error
        );


        afficherMessage(
            "Une erreur est survenue lors de la réservation.",
            "error"
        );

    }
    finally {

        if (bouton) {

            bouton.disabled = false;

            bouton.innerHTML =
                texteOriginal;

        }

    }

}


// ==========================================================
// CHARGER MES RENDEZ-VOUS
// GET /rendezvous/api
// ==========================================================

async function chargerMesRendezVous() {

    if (!tableRendezVous) {

        console.error(
            "❌ #tableRendezvous introuvable."
        );

        return;
    }


    afficherChargement();


    try {

        const response =
            await fetch(
                API_BASE,
                {
                    method: "GET",

                    credentials:
                        "same-origin",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const data =
            await lireJSON(response);


        console.log(
            "📋 Rendez-vous citoyen :",
            data
        );


        if (
            !response.ok ||
            !data ||
            data.succes !== true
        ) {

            throw new Error(
                data && data.message
                    ? data.message
                    : "Impossible de charger les rendez-vous."
            );

        }


        const rendezvous =
            Array.isArray(data.rendezvous)
                ? data.rendezvous
                : [];


        afficherRendezVous(
            rendezvous
        );

    }
    catch (error) {

        console.error(
            "❌ ERREUR CHARGEMENT RENDEZ-VOUS :",
            error
        );


        afficherErreurTableau(
            error.message ||
            "Impossible de charger les rendez-vous."
        );

    }

}


// ==========================================================
// AFFICHER LE CHARGEMENT
// ==========================================================

function afficherChargement() {

    if (!tableRendezVous) {
        return;
    }


    tableRendezVous.innerHTML = `

        <tr>

            <td
                colspan="6"
                class="loading"
            >
                Chargement des rendez-vous...
            </td>

        </tr>

    `;


    if (aucunRendezVous) {
        aucunRendezVous.hidden = true;
    }

}


// ==========================================================
// AFFICHER UNE ERREUR DANS LE TABLEAU
// ==========================================================

function afficherErreurTableau(message) {

    if (!tableRendezVous) {
        return;
    }


    tableRendezVous.innerHTML = `

        <tr>

            <td
                colspan="6"
                class="loading"
            >
                ${echapperHTML(message)}
            </td>

        </tr>

    `;


    if (aucunRendezVous) {
        aucunRendezVous.hidden = true;
    }

}


// ==========================================================
// AFFICHER LES RENDEZ-VOUS
// ==========================================================

function afficherRendezVous(rendezvous) {

    if (!tableRendezVous) {
        return;
    }


    tableRendezVous.innerHTML = "";


    // ------------------------------------------------------
    // AUCUN RENDEZ-VOUS
    // ------------------------------------------------------

    if (!rendezvous.length) {

        if (aucunRendezVous) {
            aucunRendezVous.hidden = false;
        }

        return;
    }


    if (aucunRendezVous) {
        aucunRendezVous.hidden = true;
    }


    // ------------------------------------------------------
    // AFFICHER LES LIGNES
    // ------------------------------------------------------

    rendezvous.forEach(
        (rdv) => {

            const ligne =
                document.createElement("tr");


            const statut =
                rdv.statut ||
                "En attente";


            const statutClasse =
                obtenirClasseStatut(
                    statut
                );


            ligne.innerHTML = `

                <td>
                    ${echapperHTML(
                        formaterDate(
                            rdv.date_rdv
                        )
                    )}
                </td>

                <td>
                    ${echapperHTML(
                        formaterHeure(
                            rdv.heure_rdv
                        )
                    )}
                </td>

                <td>
                    ${echapperHTML(
                        rdv.centre ||
                        "Centre inconnu"
                    )}
                </td>

                <td>
                    ${echapperHTML(
                        rdv.service ||
                        "-"
                    )}
                </td>

                <td>

                    <span
                        class="statut ${statutClasse}"
                    >
                        ${echapperHTML(
                            statut
                        )}
                    </span>

                </td>

                <td>

                    <div class="rdv-actions">

                        <button
                            type="button"
                            class="btn-modifier-rdv"
                            data-id="${Number(
                                rdv.id_rdv
                            )}"
                        >
                            Modifier
                        </button>

                        <button
                            type="button"
                            class="btn-annuler-rdv"
                            data-id="${Number(
                                rdv.id_rdv
                            )}"
                        >
                            Annuler
                        </button>

                    </div>

                </td>

            `;


            // ------------------------------------------------
            // MODIFIER
            // ------------------------------------------------

            const boutonModifier =
                ligne.querySelector(
                    ".btn-modifier-rdv"
                );


            if (boutonModifier) {

                boutonModifier.addEventListener(
                    "click",
                    () => {

                        ouvrirModification(
                            rdv
                        );

                    }
                );

            }


            // ------------------------------------------------
            // ANNULER
            // ------------------------------------------------

            const boutonAnnuler =
                ligne.querySelector(
                    ".btn-annuler-rdv"
                );


            if (boutonAnnuler) {

                boutonAnnuler.addEventListener(
                    "click",
                    () => {

                        annulerRendezVous(
                            rdv.id_rdv
                        );

                    }
                );

            }


            tableRendezVous.appendChild(
                ligne
            );

        }
    );

}


// ==========================================================
// CLASSE STATUT
// ==========================================================

function obtenirClasseStatut(statut) {

    const valeur =
        String(statut || "")
            .toLowerCase();


    if (
        valeur.includes("résolu") ||
        valeur.includes("confirme") ||
        valeur.includes("confirmé") ||
        valeur.includes("accepte") ||
        valeur.includes("accepté")
    ) {

        return "statut-success";

    }


    if (
        valeur.includes("rejet") ||
        valeur.includes("annul")
    ) {

        return "statut-error";

    }


    if (
        valeur.includes("cours")
    ) {

        return "statut-warning";

    }


    return "statut-pending";

}


// ==========================================================
// ACTUALISER
// ==========================================================

function initialiserActualisation() {

    if (!btnActualiser) {
        return;
    }


    btnActualiser.addEventListener(
        "click",
        async () => {

            btnActualiser.disabled = true;


            try {

                await chargerMesRendezVous();

            }
            finally {

                btnActualiser.disabled =
                    false;

            }

        }
    );

}


// ==========================================================
// INITIALISER LA MODALE
// ==========================================================

function initialiserModal() {

    if (!modalRendezVous) {
        return;
    }


    if (btnFermerModal) {

        btnFermerModal.addEventListener(
            "click",
            fermerModal
        );

    }


    if (btnAnnulerModification) {

        btnAnnulerModification.addEventListener(
            "click",
            fermerModal
        );

    }


    const overlay =
        modalRendezVous.querySelector(
            ".modal-overlay"
        );


    if (overlay) {

        overlay.addEventListener(
            "click",
            fermerModal
        );

    }


    if (formModifierRendezVous) {

        formModifierRendezVous.addEventListener(
            "submit",
            modifierRendezVous
        );

    }


    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                !modalRendezVous.hidden
            ) {

                fermerModal();

            }

        }
    );

}


// ==========================================================
// OUVRIR MODIFICATION
// ==========================================================

async function ouvrirModification(rdv) {

    if (!modalRendezVous) {
        return;
    }


    if (!rdv) {
        return;
    }


    // ------------------------------------------------------
    // CHARGER LES CENTRES DANS LA MODALE
    // ------------------------------------------------------

    await chargerCentresModification();


    // ------------------------------------------------------
    // REMPLIR LES CHAMPS
    // ------------------------------------------------------

    if (modifierId) {

        modifierId.value =
            rdv.id_rdv || "";

    }


    if (modifierCentre) {

        modifierCentre.value =
            rdv.id_centre || "";

    }


    if (modifierService) {

        modifierService.value =
            rdv.service || "";

    }


    if (modifierDate) {

        modifierDate.value =
            normaliserDateInput(
                rdv.date_rdv
            );

    }


    if (modifierHeure) {

        modifierHeure.value =
            normaliserHeureInput(
                rdv.heure_rdv
            );

    }


    modalRendezVous.hidden =
        false;


    document.body.classList.add(
        "modal-open"
    );

}


// ==========================================================
// CHARGER CENTRES MODIFICATION
// ==========================================================

async function chargerCentresModification() {

    if (!modifierCentre) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/centres`,
                {
                    method: "GET",
                    credentials: "same-origin",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const data =
            await lireJSON(response);


        if (
            !response.ok ||
            !data ||
            data.succes !== true ||
            !Array.isArray(data.centres)
        ) {

            throw new Error(
                "Impossible de charger les centres."
            );

        }


        modifierCentre.innerHTML = "";


        const optionDefaut =
            document.createElement("option");

        optionDefaut.value = "";
        optionDefaut.textContent =
            "Sélectionnez un centre";

        optionDefaut.disabled = true;

        modifierCentre.appendChild(
            optionDefaut
        );


        data.centres.forEach(
            (centre) => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    String(
                        centre.id_centre
                    );

                option.textContent =
                    centre.nom ||
                    "Centre de santé";

                modifierCentre.appendChild(
                    option
                );

            }
        );

    }
    catch (error) {

        console.error(
            "❌ ERREUR CENTRES MODIFICATION :",
            error
        );

    }

}


// ==========================================================
// FERMER MODALE
// ==========================================================

function fermerModal() {

    if (!modalRendezVous) {
        return;
    }


    modalRendezVous.hidden =
        true;


    document.body.classList.remove(
        "modal-open"
    );


    if (formModifierRendezVous) {

        formModifierRendezVous.reset();

    }

}


// ==========================================================
// MODIFIER UN RENDEZ-VOUS
//
// IMPORTANT :
// Cette fonction essaie PUT /rendezvous/api/:id
// ==========================================================

async function modifierRendezVous(event) {

    event.preventDefault();


    const id =
        modifierId
            ? modifierId.value
            : "";


    const idCentre =
        modifierCentre
            ? modifierCentre.value
            : "";


    const service =
        modifierService
            ? modifierService.value.trim()
            : "";


    const dateRdv =
        modifierDate
            ? modifierDate.value
            : "";


    const heureRdv =
        modifierHeure
            ? modifierHeure.value
            : "";


    if (!id) {

        afficherMessage(
            "Identifiant du rendez-vous invalide.",
            "error"
        );

        return;
    }


    if (!idCentre) {

        afficherMessageModification(
            "Veuillez sélectionner un centre.",
            "error"
        );

        return;
    }


    if (!service) {

        afficherMessageModification(
            "Veuillez indiquer le service.",
            "error"
        );

        return;
    }


    if (!dateRdv) {

        afficherMessageModification(
            "Veuillez sélectionner une date.",
            "error"
        );

        return;
    }


    if (!heureRdv) {

        afficherMessageModification(
            "Veuillez sélectionner une heure.",
            "error"
        );

        return;
    }


    const bouton =
        document.getElementById(
            "btnModifierRendezvous"
        );


    const texteOriginal =
        bouton
            ? bouton.innerHTML
            : "Enregistrer";


    if (bouton) {

        bouton.disabled = true;

        bouton.innerHTML =
            "<span>Enregistrement...</span>";

    }


    try {

        const response =
            await fetch(
                `${API_BASE}/${encodeURIComponent(id)}`,
                {
                    method: "PUT",

                    credentials:
                        "same-origin",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            id_centre:
                                Number(idCentre),

                            service:
                                service,

                            date_rdv:
                                dateRdv,

                            heure_rdv:
                                heureRdv

                        })

                }
            );


        const data =
            await lireJSON(response);


        console.log(
            "📡 Modification rendez-vous :",
            data
        );


        if (
            !response.ok ||
            !data ||
            data.succes !== true
        ) {

            afficherMessageModification(
                data && data.message
                    ? data.message
                    : "Impossible de modifier le rendez-vous.",
                "error"
            );

            return;
        }


        fermerModal();


        afficherMessage(
            "Rendez-vous modifié avec succès.",
            "success"
        );


        await chargerMesRendezVous();

    }
    catch (error) {

        console.error(
            "❌ ERREUR MODIFICATION :",
            error
        );


        afficherMessageModification(
            "Une erreur est survenue lors de la modification.",
            "error"
        );

    }
    finally {

        if (bouton) {

            bouton.disabled = false;

            bouton.innerHTML =
                texteOriginal;

        }

    }

}


// ==========================================================
// ANNULER UN RENDEZ-VOUS
// DELETE /rendezvous/api/:id
// ==========================================================

async function annulerRendezVous(id) {

    if (!id) {
        return;
    }


    const confirmation =
        window.confirm(
            "Voulez-vous vraiment annuler ce rendez-vous ?"
        );


    if (!confirmation) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/${encodeURIComponent(id)}`,
                {
                    method: "DELETE",

                    credentials:
                        "same-origin",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const data =
            await lireJSON(response);


        console.log(
            "📡 Annulation rendez-vous :",
            data
        );


        if (
            !response.ok ||
            !data ||
            data.succes !== true
        ) {

            afficherMessage(
                data && data.message
                    ? data.message
                    : "Impossible d'annuler le rendez-vous.",
                "error"
            );

            return;
        }


        afficherMessage(
            "Rendez-vous annulé avec succès.",
            "success"
        );


        await chargerMesRendezVous();

    }
    catch (error) {

        console.error(
            "❌ ERREUR ANNULATION :",
            error
        );


        afficherMessage(
            "Une erreur est survenue lors de l'annulation.",
            "error"
        );

    }

}


// ==========================================================
// MESSAGE PRINCIPAL
// ==========================================================

function afficherMessage(
    message,
    type = "info"
) {

    const zone =
        messageRendezVous ||
        document.getElementById(
            "messageRendezvous"
        );


    if (!zone) {

        console.log(
            `[${type}] ${message}`
        );

        return;
    }


    zone.textContent =
        message;


    zone.hidden =
        false;


    zone.className =
        `message ${type}`;


    window.setTimeout(
        () => {

            if (zone) {

                zone.hidden =
                    true;

                zone.textContent =
                    "";

            }

        },
        5000
    );

}


// ==========================================================
// MESSAGE MODIFICATION
// ==========================================================

function afficherMessageModification(
    message,
    type = "info"
) {

    const zone =
        document.getElementById(
            "messageModification"
        );


    if (!zone) {
        return;
    }


    zone.textContent =
        message;


    zone.hidden =
        false;


    zone.className =
        `form-message ${type}`;


    window.setTimeout(
        () => {

            zone.hidden =
                true;

            zone.textContent =
                "";

        },
        5000
    );

}


// ==========================================================
// LIRE UNE RÉPONSE JSON
// ==========================================================

async function lireJSON(response) {

    const texte =
        await response.text();


    if (!texte) {
        return {};
    }


    try {

        return JSON.parse(
            texte
        );

    }
    catch (error) {

        console.error(
            "❌ Réponse serveur non JSON :",
            texte
        );


        throw new Error(
            "Le serveur a retourné une réponse invalide."
        );

    }

}


// ==========================================================
// FORMATER DATE
// ==========================================================

function formaterDate(date) {

    if (!date) {
        return "-";
    }


    const valeur =
        String(date)
            .substring(0, 10);


    const morceaux =
        valeur.split("-");


    if (
        morceaux.length !== 3
    ) {

        return valeur;

    }


    return (
        `${morceaux[2]}/` +
        `${morceaux[1]}/` +
        `${morceaux[0]}`
    );

}


// ==========================================================
// NORMALISER DATE POUR INPUT
// ==========================================================

function normaliserDateInput(date) {

    if (!date) {
        return "";
    }


    return String(date)
        .substring(0, 10);

}


// ==========================================================
// FORMATER HEURE
// ==========================================================

function formaterHeure(heure) {

    if (!heure) {
        return "-";
    }


    const valeur =
        String(heure);


    if (
        valeur.length >= 5
    ) {

        return valeur.substring(
            0,
            5
        );

    }


    return valeur;

}


// ==========================================================
// NORMALISER HEURE POUR INPUT
// ==========================================================

function normaliserHeureInput(heure) {

    if (!heure) {
        return "";
    }


    return String(heure)
        .substring(0, 5);

}


// ==========================================================
// ÉCHAPPER HTML
// ==========================================================

function echapperHTML(valeur) {

    return String(
        valeur === null ||
        valeur === undefined
            ? ""
            : valeur
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
// EXPORT GLOBAL
// ==========================================================

window.chargerCentres =
    chargerCentres;

window.chargerMesRendezVous =
    chargerMesRendezVous;

window.annulerRendezVous =
    annulerRendezVous;

window.ouvrirModification =
    ouvrirModification;

window.fermerModal =
    fermerModal;