// ==========================================================
// CITYCARE - STATISTIQUES ADMIN
// public/js/statistiques.js
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    // ======================================================
    // ÉLÉMENTS HTML
    // ======================================================

    const nbUsers =
        document.getElementById("nbUsers");

    const nbSignalements =
        document.getElementById("nbSignalements");

    const nbRendezvous =
        document.getElementById("nbRdv") ||
        document.getElementById("nbRendezvous");

    const nbTransport =
        document.getElementById("nbTransport");

    const tableStatistiques =
        document.getElementById("tableStatistiques");

    const tableSignalements =
        document.getElementById("tableSignalements");

    const tableRendezvous =
        document.getElementById("tableRendezvous");

    const btnActualiser =
        document.getElementById("btnActualiser");

    // ======================================================
    // CHARGEMENT PRINCIPAL
    // ======================================================

    async function chargerStatistiques() {

        afficherChargement();

        try {

            const response = await fetch(
                "/admin/statistiques/api"
            );

            if (!response.ok) {

                throw new Error(
                    "Impossible de récupérer les statistiques."
                );

            }

            const data =
                await response.json();

            console.log(
                "📊 Statistiques reçues :",
                data
            );

            if (data.succes === false) {

                throw new Error(
                    data.message ||
                    "Erreur lors du chargement des statistiques."
                );

            }

            // ==================================================
            // EXTRACTION DES DONNÉES
            // ==================================================

            const statistiques =
                data.statistiques ||
                data.data ||
                data;

            // ==================================================
            // COMPTEURS
            // ==================================================

            mettreAJourCompteur(
                nbUsers,
                statistiques.users ??
                statistiques.utilisateurs ??
                statistiques.nbUsers ??
                0
            );

            mettreAJourCompteur(
                nbSignalements,
                statistiques.signalements ??
                statistiques.nbSignalements ??
                0
            );

            mettreAJourCompteur(
                nbRendezvous,
                statistiques.rendezvous ??
                statistiques.rdv ??
                statistiques.nbRdv ??
                0
            );

            mettreAJourCompteur(
                nbTransport,
                statistiques.transport ??
                statistiques.transports ??
                statistiques.nbTransport ??
                0
            );

            // ==================================================
            // TABLEAUX
            // ==================================================

            const listeSignalements =
                data.signalements ||
                statistiques.listeSignalements ||
                [];

            const listeRendezvous =
                data.rendezvousListe ||
                statistiques.listeRendezvous ||
                [];

            if (tableSignalements) {

                afficherStatistiquesSignalements(
                    listeSignalements
                );

            }

            if (tableRendezvous) {

                afficherStatistiquesRendezvous(
                    listeRendezvous
                );

            }

            if (tableStatistiques) {

                afficherTableStatistiques(
                    statistiques
                );

            }

        } catch (erreur) {

            console.error(
                "❌ Erreur statistiques :",
                erreur
            );

            afficherErreur(
                erreur.message ||
                "Impossible de charger les statistiques."
            );

        }

    }

    // ======================================================
    // AFFICHER LES COMPTEURS
    // ======================================================

    function mettreAJourCompteur(
        element,
        valeur
    ) {

        if (!element) {

            return;

        }

        const nombre =
            Number(valeur);

        element.textContent =
            Number.isFinite(nombre)
                ? nombre.toLocaleString("fr-FR")
                : "0";

    }

    // ======================================================
    // TABLEAU GLOBAL
    // ======================================================

    function afficherTableStatistiques(
        statistiques
    ) {

        if (!tableStatistiques) {

            return;

        }

        tableStatistiques.innerHTML = "";

        const lignes = [

            {
                nom: "Utilisateurs",
                valeur:
                    statistiques.users ??
                    statistiques.utilisateurs ??
                    0
            },

            {
                nom: "Signalements",
                valeur:
                    statistiques.signalements ??
                    0
            },

            {
                nom: "Rendez-vous",
                valeur:
                    statistiques.rendezvous ??
                    statistiques.rdv ??
                    0
            },

            {
                nom: "Transport",
                valeur:
                    statistiques.transport ??
                    statistiques.transports ??
                    0
            }

        ];

        lignes.forEach(
            (ligne) => {

                const tr =
                    document.createElement("tr");

                tr.innerHTML = `
                    <td>
                        ${echapperHTML(ligne.nom)}
                    </td>

                    <td>
                        ${Number(ligne.valeur || 0)
                            .toLocaleString("fr-FR")}
                    </td>
                `;

                tableStatistiques.appendChild(tr);

            }
        );

    }

    // ======================================================
    // STATISTIQUES SIGNALEMENTS
    // ======================================================

    function afficherStatistiquesSignalements(
        signalements
    ) {

        if (!tableSignalements) {

            return;

        }

        tableSignalements.innerHTML = "";

        if (
            !Array.isArray(signalements) ||
            signalements.length === 0
        ) {

            tableSignalements.innerHTML = `
                <tr>
                    <td colspan="4">
                        Aucun signalement disponible.
                    </td>
                </tr>
            `;

            return;

        }

        signalements.forEach(
            (signalement) => {

                const tr =
                    document.createElement("tr");

                const categorie =
                    signalement.categorie ??
                    signalement.nom_categorie ??
                    "—";

                const total =
                    signalement.total ??
                    signalement.nombre ??
                    signalement.count ??
                    0;

                const statut =
                    signalement.statut ??
                    "—";

                const date =
                    signalement.date ??
                    signalement.date_creation ??
                    "";

                tr.innerHTML = `

                    <td>
                        ${echapperHTML(categorie)}
                    </td>

                    <td>
                        ${Number(total)
                            .toLocaleString("fr-FR")}
                    </td>

                    <td>
                        ${echapperHTML(statut)}
                    </td>

                    <td>
                        ${formaterDate(date)}
                    </td>

                `;

                tableSignalements.appendChild(tr);

            }
        );

    }

    // ======================================================
    // STATISTIQUES RENDEZ-VOUS
    // ======================================================

    function afficherStatistiquesRendezvous(
        rendezvous
    ) {

        if (!tableRendezvous) {

            return;

        }

        tableRendezvous.innerHTML = "";

        if (
            !Array.isArray(rendezvous) ||
            rendezvous.length === 0
        ) {

            tableRendezvous.innerHTML = `
                <tr>
                    <td colspan="4">
                        Aucun rendez-vous disponible.
                    </td>
                </tr>
            `;

            return;

        }

        rendezvous.forEach(
            (rdv) => {

                const tr =
                    document.createElement("tr");

                const centre =
                    rdv.centre ??
                    rdv.nom_centre ??
                    "—";

                const total =
                    rdv.total ??
                    rdv.nombre ??
                    rdv.count ??
                    0;

                const statut =
                    rdv.statut ??
                    "—";

                const date =
                    rdv.date ??
                    rdv.date_rendezvous ??
                    "";

                tr.innerHTML = `

                    <td>
                        ${echapperHTML(centre)}
                    </td>

                    <td>
                        ${Number(total)
                            .toLocaleString("fr-FR")}
                    </td>

                    <td>
                        ${echapperHTML(statut)}
                    </td>

                    <td>
                        ${formaterDate(date)}
                    </td>

                `;

                tableRendezvous.appendChild(tr);

            }
        );

    }

    // ======================================================
    // CHARGEMENT
    // ======================================================

    function afficherChargement() {

        if (tableStatistiques) {

            tableStatistiques.innerHTML = `
                <tr>
                    <td colspan="4">
                        ⏳ Chargement des statistiques...
                    </td>
                </tr>
            `;

        }

        if (tableSignalements) {

            tableSignalements.innerHTML = `
                <tr>
                    <td colspan="4">
                        ⏳ Chargement...
                    </td>
                </tr>
            `;

        }

        if (tableRendezvous) {

            tableRendezvous.innerHTML = `
                <tr>
                    <td colspan="4">
                        ⏳ Chargement...
                    </td>
                </tr>
            `;

        }

    }

    // ======================================================
    // ERREUR
    // ======================================================

    function afficherErreur(message) {

        if (tableStatistiques) {

            tableStatistiques.innerHTML = `
                <tr>
                    <td colspan="4">
                        ❌ ${echapperHTML(message)}
                    </td>
                </tr>
            `;

        }

        if (tableSignalements) {

            tableSignalements.innerHTML = `
                <tr>
                    <td colspan="4">
                        ❌ ${echapperHTML(message)}
                    </td>
                </tr>
            `;

        }

        if (tableRendezvous) {

            tableRendezvous.innerHTML = `
                <tr>
                    <td colspan="4">
                        ❌ ${echapperHTML(message)}
                    </td>
                </tr>
            `;

        }

    }

    // ======================================================
    // FORMAT DATE
    // ======================================================

    function formaterDate(date) {

        if (!date) {

            return "—";

        }

        const dateObj =
            new Date(date);

        if (
            Number.isNaN(
                dateObj.getTime()
            )
        ) {

            return echapperHTML(date);

        }

        return dateObj.toLocaleDateString(
            "fr-FR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    }

    // ======================================================
    // PROTECTION CONTRE HTML
    // ======================================================

    function echapperHTML(texte) {

        const element =
            document.createElement("div");

        element.textContent =
            texte ?? "";

        return element.innerHTML;

    }

    // ======================================================
    // BOUTON ACTUALISER
    // ======================================================

    if (btnActualiser) {

        btnActualiser.addEventListener(
            "click",
            () => {

                chargerStatistiques();

            }
        );

    }

    // ======================================================
    // INITIALISATION
    // ======================================================

    chargerStatistiques();

});