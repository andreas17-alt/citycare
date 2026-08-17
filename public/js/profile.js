// ==========================================================
// CITYCARE - RENDEZ-VOUS.JS
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("📅 CityCare - module rendez-vous démarré");


    // ======================================================
    // ÉLÉMENTS
    // ======================================================

    const formRendezvous =
        document.getElementById("formRendezvous");

    const centre =
        document.getElementById("centre");

    const service =
        document.getElementById("service");

    const date =
        document.getElementById("date");

    const heure =
        document.getElementById("heure");

    const table =
        document.getElementById("tableRendezvous");

    const aucun =
        document.getElementById("aucunRendezvous");

    const btnActualiser =
        document.getElementById("btnActualiser");

    const message =
        document.getElementById("messageRendezvous");

    const messageFormulaire =
        document.getElementById("messageFormulaire");


    // MODALE

    const modal =
        document.getElementById("modalRendezvous");

    const formModification =
        document.getElementById(
            "formModifierRendezvous"
        );

    const modifierId =
        document.getElementById("modifierId");

    const modifierCentre =
        document.getElementById("modifierCentre");

    const modifierService =
        document.getElementById("modifierService");

    const modifierDate =
        document.getElementById("modifierDate");

    const modifierHeure =
        document.getElementById("modifierHeure");

    const messageModification =
        document.getElementById(
            "messageModification"
        );

    const btnFermer =
        document.getElementById("btnFermerModal");

    const btnAnnuler =
        document.getElementById(
            "btnAnnulerModification"
        );


    let rendezvousActuel = null;


    // ======================================================
    // API
    // ======================================================

    async function api(url, options = {}) {

        const response = await fetch(
            url,
            {
                credentials: "same-origin",
                ...options
            }
        );


        const contentType =
            response.headers.get(
                "content-type"
            ) || "";


        if (
            !contentType.includes(
                "application/json"
            )
        ) {

            const texte =
                await response.text();

            console.error(
                "❌ Réponse non JSON :",
                texte
            );

            throw new Error(
                "Le serveur a retourné une réponse invalide."
            );
        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                `Erreur HTTP ${response.status}`
            );
        }


        return data;
    }


    // ======================================================
    // MESSAGES
    // ======================================================

    function afficherMessage(
        element,
        texte,
        type = "error"
    ) {

        if (!element) {
            return;
        }


        element.textContent =
            texte;

        element.className =
            element.id === "messageRendezvous"
                ? `message ${type}`
                : `form-message ${type}`;

        element.hidden =
            false;
    }


    function cacherMessage(element) {

        if (!element) {
            return;
        }

        element.hidden = true;
        element.textContent = "";
    }


    // ======================================================
    // DATE MINIMUM
    // ======================================================

    function definirDateMinimum() {

        if (!date) {
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


        date.min =
            `${annee}-${mois}-${jour}`;


        if (modifierDate) {

            modifierDate.min =
                `${annee}-${mois}-${jour}`;
        }
    }


    // ======================================================
    // DATE + HEURE FUTURE
    // ======================================================

    function dateFuture(
        dateValue,
        heureValue
    ) {

        if (
            !dateValue ||
            !heureValue
        ) {
            return false;
        }


        const valeur =
            new Date(
                `${dateValue}T${heureValue}`
            );


        return (
            !Number.isNaN(
                valeur.getTime()
            ) &&
            valeur > new Date()
        );
    }


    // ======================================================
    // CHARGER LES CENTRES
    // ======================================================

    async function chargerCentres() {

        try {

            centre.innerHTML = `
                <option value="">
                    Chargement...
                </option>
            `;


            const data =
                await api(
                    "/rendezvous/api/centres-sante"
                );


            if (
                !Array.isArray(
                    data.centres
                )
            ) {

                throw new Error(
                    "Les centres reçus sont invalides."
                );
            }


            centre.innerHTML = `
                <option value="">
                    Sélectionnez un centre
                </option>
            `;


            modifierCentre.innerHTML = `
                <option value="">
                    Sélectionnez un centre
                </option>
            `;


            data.centres.forEach(
                centreData => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        centreData.id_centre;


                    option.textContent =
                        centreData.nom;


                    centre.appendChild(
                        option
                    );


                    const optionModification =
                        option.cloneNode(true);


                    modifierCentre.appendChild(
                        optionModification
                    );
                }
            );


        } catch (error) {

            console.error(
                "❌ Centres :",
                error
            );


            centre.innerHTML = `
                <option value="">
                    Impossible de charger les centres
                </option>
            `;


            afficherMessage(
                message,
                error.message,
                "error"
            );
        }
    }


    // ======================================================
    // FORMATER DATE
    // ======================================================

    function formaterDate(valeur) {

        if (!valeur) {
            return "-";
        }


        const partie =
            String(valeur)
                .substring(0, 10);


        const morceaux =
            partie.split("-");


        if (
            morceaux.length === 3
        ) {

            return (
                `${morceaux[2]}/` +
                `${morceaux[1]}/` +
                `${morceaux[0]}`
            );
        }


        return valeur;
    }


    // ======================================================
    // FORMATER HEURE
    // ======================================================

    function formaterHeure(valeur) {

        if (!valeur) {
            return "-";
        }


        return String(valeur)
            .substring(0, 5);
    }


    // ======================================================
    // STATUT
    // ======================================================

    function classeStatut(statut) {

        const valeur =
            String(statut || "")
                .toLowerCase()
                .trim();


        if (
            valeur === "confirmé" ||
            valeur === "confirme"
        ) {

            return "confirme";
        }


        if (
            valeur === "refusé" ||
            valeur === "refuse"
        ) {

            return "refuse";
        }


        if (
            valeur === "terminé" ||
            valeur === "termine"
        ) {

            return "termine";
        }


        return "en-attente";
    }


    // ======================================================
    // AFFICHER RENDEZ-VOUS
    // ======================================================

    function afficherRendezvous(
        rendezvous
    ) {

        table.innerHTML = "";


        if (
            !Array.isArray(rendezvous) ||
            rendezvous.length === 0
        ) {

            aucun.hidden = false;

            table.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="empty-cell"
                    >
                        Aucun rendez-vous enregistré.
                    </td>
                </tr>
            `;

            return;
        }


        aucun.hidden = true;


        rendezvous.forEach(
            rdv => {

                const ligne =
                    document.createElement(
                        "tr"
                    );


                // DATE

                const tdDate =
                    document.createElement(
                        "td"
                    );

                tdDate.textContent =
                    formaterDate(
                        rdv.date_rdv
                    );


                // HEURE

                const tdHeure =
                    document.createElement(
                        "td"
                    );

                tdHeure.textContent =
                    formaterHeure(
                        rdv.heure_rdv
                    );


                // CENTRE

                const tdCentre =
                    document.createElement(
                        "td"
                    );

                tdCentre.textContent =
                    rdv.nom_centre ||
                    "-";


                // SERVICE

                const tdService =
                    document.createElement(
                        "td"
                    );

                tdService.textContent =
                    rdv.service ||
                    "-";


                // STATUT

                const tdStatut =
                    document.createElement(
                        "td"
                    );


                const badge =
                    document.createElement(
                        "span"
                    );


                badge.className =
                    `status ${classeStatut(
                        rdv.statut
                    )}`;


                badge.textContent =
                    rdv.statut ||
                    "En attente";


                tdStatut.appendChild(
                    badge
                );


                // ACTIONS

                const tdActions =
                    document.createElement(
                        "td"
                    );


                const actions =
                    document.createElement(
                        "div"
                    );


                actions.className =
                    "actions";


                const statut =
                    String(
                        rdv.statut || ""
                    )
                    .toLowerCase()
                    .trim();


                // MODIFIER

                if (
                    statut !== "terminé" &&
                    statut !== "termine" &&
                    statut !== "refusé" &&
                    statut !== "refuse"
                ) {

                    const btnModifier =
                        document.createElement(
                            "button"
                        );


                    btnModifier.type =
                        "button";

                    btnModifier.className =
                        "btn-modifier";

                    btnModifier.textContent =
                        "✏️ Modifier";


                    btnModifier.addEventListener(
                        "click",
                        () => {
                            ouvrirModification(
                                rdv
                            );
                        }
                    );


                    actions.appendChild(
                        btnModifier
                    );
                }


                // ANNULER

                if (
                    statut !== "terminé" &&
                    statut !== "termine" &&
                    statut !== "refusé" &&
                    statut !== "refuse"
                ) {

                    const btnSupprimer =
                        document.createElement(
                            "button"
                        );


                    btnSupprimer.type =
                        "button";

                    btnSupprimer.className =
                        "btn-supprimer";

                    btnSupprimer.textContent =
                        "🗑️ Annuler";


                    btnSupprimer.addEventListener(
                        "click",
                        () => {

                            annulerRendezvous(
                                rdv.id_rendezvous
                            );
                        }
                    );


                    actions.appendChild(
                        btnSupprimer
                    );
                }


                tdActions.appendChild(
                    actions
                );


                ligne.appendChild(tdDate);
                ligne.appendChild(tdHeure);
                ligne.appendChild(tdCentre);
                ligne.appendChild(tdService);
                ligne.appendChild(tdStatut);
                ligne.appendChild(tdActions);


                table.appendChild(
                    ligne
                );
            }
        );
    }


    // ======================================================
    // CHARGER MES RENDEZ-VOUS
    // ======================================================

    async function chargerRendezvous() {

        table.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="loading"
                >
                    Chargement des rendez-vous...
                </td>
            </tr>
        `;


        try {

            const data =
                await api(
                    "/rendezvous/api/rendezvous"
                );


            afficherRendezvous(
                data.rendezvous
            );


        } catch (error) {

            console.error(
                "❌ Rendez-vous :",
                error
            );


            table.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="loading"
                    >
                        Impossible de charger les rendez-vous.
                    </td>
                </tr>
            `;


            afficherMessage(
                message,
                error.message,
                "error"
            );
        }
    }


    // ======================================================
    // CRÉER
    // ======================================================

    async function creerRendezvous() {

        cacherMessage(
            messageFormulaire
        );


        if (!centre.value) {

            afficherMessage(
                messageFormulaire,
                "Veuillez sélectionner un centre.",
                "error"
            );

            return;
        }


        if (!service.value.trim()) {

            afficherMessage(
                messageFormulaire,
                "Veuillez indiquer le service.",
                "error"
            );

            return;
        }


        if (!date.value) {

            afficherMessage(
                messageFormulaire,
                "Veuillez sélectionner une date.",
                "error"
            );

            return;
        }


        if (!heure.value) {

            afficherMessage(
                messageFormulaire,
                "Veuillez sélectionner une heure.",
                "error"
            );

            return;
        }


        if (
            !dateFuture(
                date.value,
                heure.value
            )
        ) {

            afficherMessage(
                messageFormulaire,
                "Veuillez choisir une date et une heure futures.",
                "error"
            );

            return;
        }


        const bouton =
            formRendezvous.querySelector(
                'button[type="submit"]'
            );


        try {

            bouton.disabled = true;

            bouton.textContent =
                "⏳ Réservation...";


            const data =
                await api(
                    "/rendezvous/api/rendezvous",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                id_centre:
                                    Number(
                                        centre.value
                                    ),

                                service:
                                    service.value.trim(),

                                date_rdv:
                                    date.value,

                                heure_rdv:
                                    heure.value
                            })
                    }
                );


            afficherMessage(
                message,
                data.message ||
                "Rendez-vous créé avec succès.",
                "success"
            );


            formRendezvous.reset();


            await chargerRendezvous();


        } catch (error) {

            console.error(
                "❌ Création :",
                error
            );


            afficherMessage(
                messageFormulaire,
                error.message,
                "error"
            );


        } finally {

            bouton.disabled = false;

            bouton.textContent =
                "📅 Réserver le rendez-vous";
        }
    }


    // ======================================================
    // OUVRIR MODIFICATION
    // ======================================================

    function ouvrirModification(rdv) {

        rendezvousActuel =
            rdv;


        modifierId.value =
            rdv.id_rendezvous;


        modifierCentre.value =
            rdv.id_centre;


        modifierService.value =
            rdv.service || "";


        modifierDate.value =
            String(
                rdv.date_rdv || ""
            ).substring(0, 10);


        modifierHeure.value =
            String(
                rdv.heure_rdv || ""
            ).substring(0, 5);


        cacherMessage(
            messageModification
        );


        modal.hidden = false;


        document.body.classList.add(
            "modal-ouvert"
        );
    }


    // ======================================================
    // MODIFIER
    // ======================================================

    async function modifierRendezvous() {

        cacherMessage(
            messageModification
        );


        const id =
            Number(
                modifierId.value
            );


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            afficherMessage(
                messageModification,
                "Identifiant du rendez-vous invalide.",
                "error"
            );

            return;
        }


        if (!modifierCentre.value) {

            afficherMessage(
                messageModification,
                "Veuillez sélectionner un centre.",
                "error"
            );

            return;
        }


        if (
            !modifierService.value.trim()
        ) {

            afficherMessage(
                messageModification,
                "Veuillez indiquer le service.",
                "error"
            );

            return;
        }


        if (!modifierDate.value) {

            afficherMessage(
                messageModification,
                "Veuillez sélectionner une date.",
                "error"
            );

            return;
        }


        if (!modifierHeure.value) {

            afficherMessage(
                messageModification,
                "Veuillez sélectionner une heure.",
                "error"
            );

            return;
        }


        if (
            !dateFuture(
                modifierDate.value,
                modifierHeure.value
            )
        ) {

            afficherMessage(
                messageModification,
                "Veuillez choisir une date et une heure futures.",
                "error"
            );

            return;
        }


        const bouton =
            formModification.querySelector(
                'button[type="submit"]'
            );


        try {

            bouton.disabled = true;

            bouton.textContent =
                "⏳ Enregistrement...";


            const data =
                await api(
                    `/rendezvous/api/rendezvous/${id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                id_centre:
                                    Number(
                                        modifierCentre.value
                                    ),

                                service:
                                    modifierService.value.trim(),

                                date_rdv:
                                    modifierDate.value,

                                heure_rdv:
                                    modifierHeure.value
                            })
                    }
                );


            fermerModal();


            afficherMessage(
                message,
                data.message ||
                "Rendez-vous modifié avec succès.",
                "success"
            );


            await chargerRendezvous();


        } catch (error) {

            console.error(
                "❌ Modification :",
                error
            );


            afficherMessage(
                messageModification,
                error.message,
                "error"
            );


        } finally {

            bouton.disabled = false;

            bouton.textContent =
                "💾 Enregistrer";
        }
    }


    // ======================================================
    // ANNULER
    // ======================================================

    async function annulerRendezvous(id) {

        if (
            !id ||
            Number(id) <= 0
        ) {
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

            const data =
                await api(
                    `/rendezvous/api/rendezvous/${id}`,
                    {
                        method: "DELETE"
                    }
                );


            afficherMessage(
                message,
                data.message ||
                "Rendez-vous annulé avec succès.",
                "success"
            );


            await chargerRendezvous();


        } catch (error) {

            console.error(
                "❌ Annulation :",
                error
            );


            afficherMessage(
                message,
                error.message,
                "error"
            );
        }
    }


    // ======================================================
    // FERMER MODALE
    // ======================================================

    function fermerModal() {

        modal.hidden = true;

        document.body.classList.remove(
            "modal-ouvert"
        );


        rendezvousActuel =
            null;


        formModification.reset();

        cacherMessage(
            messageModification
        );
    }


    // ======================================================
    // ÉVÉNEMENTS
    // ======================================================

    formRendezvous.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            creerRendezvous();
        }
    );


    formModification.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            modifierRendezvous();
        }
    );


    btnFermer.addEventListener(
        "click",
        fermerModal
    );


    btnAnnuler.addEventListener(
        "click",
        fermerModal
    );


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


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                !modal.hidden
            ) {

                fermerModal();
            }
        }
    );


    btnActualiser.addEventListener(
        "click",
        async () => {

            btnActualiser.disabled =
                true;

            const ancien =
                btnActualiser.textContent;


            btnActualiser.textContent =
                "⏳ Actualisation...";


            try {

                await chargerRendezvous();

            } finally {

                btnActualiser.disabled =
                    false;

                btnActualiser.textContent =
                    ancien;
            }
        }
    );


    // ======================================================
    // INITIALISATION
    // ======================================================

    definirDateMinimum();

    chargerCentres();

    chargerRendezvous();

});