// ==========================================================
// CITYCARE — GESTION UTILISATEURS
// public/js/gestion_utilisateurs.js
// ==========================================================

(function () {

    "use strict";


    // ======================================================
    // VARIABLES
    // ======================================================

    let utilisateurs = [];

    let utilisateurSelectionne = null;


    // ======================================================
    // INITIALISATION
    // ======================================================

    function initialiserUtilisateurs() {

        console.log(
            "👥 CITYCARE — Module utilisateurs"
        );


        chargerUtilisateurs();

        initialiserRecherche();

        initialiserFiltres();

        initialiserActualisation();

        initialiserModale();

    }


    // ======================================================
    // CHARGER LES UTILISATEURS
    // ======================================================

    async function chargerUtilisateurs() {

        const tbody =
            document.getElementById(
                "usersTableBody"
            );


        if (!tbody) {

            return;

        }


        afficherChargement();


        try {

            const response =
                await fetch(
                    "/admin/api/utilisateurs",
                    {
                        method: "GET",
                        credentials: "same-origin"
                    }
                );


            const data =
                await response.json();


            if (!response.ok || !data.succes) {

                throw new Error(
                    data.message ||
                    "Impossible de charger les utilisateurs."
                );

            }


            utilisateurs =
                Array.isArray(data.utilisateurs)
                    ? data.utilisateurs
                    : [];


            afficherStatistiques(
                data.statistiques
            );


            afficherUtilisateurs();

            console.log(
                `✅ ${utilisateurs.length} utilisateurs chargés.`
            );


        } catch (erreur) {

            console.error(
                "❌ ERREUR UTILISATEURS :",
                erreur
            );


            afficherErreur(
                erreur.message
            );

        }

    }


    // ======================================================
    // AFFICHER LES STATISTIQUES
    // ======================================================

    function afficherStatistiques(
        statistiques
    ) {

        if (!statistiques) {

            statistiques = {};

        }


        definirTexte(
            "usersTotal",
            statistiques.total ?? 0
        );


        definirTexte(
            "usersCitizens",
            statistiques.citoyens ?? 0
        );


        definirTexte(
            "usersAdmins",
            statistiques.admins ?? 0
        );


        definirTexte(
            "usersRecent",
            statistiques.recents ?? 0
        );

    }


    function definirTexte(
        id,
        valeur
    ) {

        const element =
            document.getElementById(id);


        if (!element) {

            return;

        }


        element.textContent =
            Number(valeur).toLocaleString(
                "fr-FR"
            );

    }


    // ======================================================
    // AFFICHER LES UTILISATEURS
    // ======================================================

    function afficherUtilisateurs() {

        const tbody =
            document.getElementById(
                "usersTableBody"
            );


        if (!tbody) {

            return;

        }


        const recherche =
            (
                document.getElementById(
                    "usersSearch"
                )?.value || ""
            )
            .trim()
            .toLowerCase();


        const role =
            document.getElementById(
                "usersRoleFilter"
            )?.value || "";


        let resultat =
            utilisateurs.filter(
                utilisateur => {

                    const texte = [

                        utilisateur.nom,

                        utilisateur.prenom,

                        utilisateur.username,

                        utilisateur.email

                    ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                    const correspondRecherche =
                        !recherche ||
                        texte.includes(recherche);


                    const correspondRole =
                        !role ||
                        utilisateur.role === role;


                    return (
                        correspondRecherche &&
                        correspondRole
                    );

                }
            );


        afficherNombreResultats(
            resultat.length
        );


        if (resultat.length === 0) {

            tbody.innerHTML = `

                <tr>

                    <td colspan="6">

                        <div class="users-empty">

                            <div class="users-empty-icon">
                                ♙
                            </div>

                            <strong>
                                Aucun utilisateur trouvé
                            </strong>

                            <span>
                                Aucun compte ne correspond
                                aux critères actuels.
                            </span>

                        </div>

                    </td>

                </tr>

            `;

            return;

        }


        tbody.innerHTML =
            resultat
                .map(
                    utilisateur =>
                        creerLigneUtilisateur(
                            utilisateur
                        )
                )
                .join("");


        ajouterEvenementsActions();

    }


    // ======================================================
    // LIGNE UTILISATEUR
    // ======================================================

    function creerLigneUtilisateur(
        utilisateur
    ) {

        const prenom =
            utilisateur.prenom || "";


        const nom =
            utilisateur.nom || "";


        const nomComplet =
            `${prenom} ${nom}`.trim() ||
            utilisateur.username ||
            "Utilisateur";


        const initiales =
            obtenirInitiales(
                prenom,
                nom,
                utilisateur.username
            );


        const role =
            utilisateur.role === "admin"
                ? "Administrateur"
                : "Citoyen";


        const classeRole =
            utilisateur.role === "admin"
                ? "admin"
                : "citoyen";


        const date =
            formaterDate(
                utilisateur.date_creation
            );


        return `

            <tr>

                <td>

                    <div class="user-person">

                        <div class="user-avatar">
                            ${echapper(initiales)}
                        </div>

                        <div class="user-person-info">

                            <strong>
                                ${echapper(nomComplet)}
                            </strong>

                            <span>
                                ID #${echapper(
                                    utilisateur.id_user
                                )}
                            </span>

                        </div>

                    </div>

                </td>


                <td>

                    <span class="user-username">
                        @${echapper(
                            utilisateur.username || ""
                        )}
                    </span>

                </td>


                <td>

                    <span class="user-email">
                        ${echapper(
                            utilisateur.email || ""
                        )}
                    </span>

                </td>


                <td>

                    <span
                        class="user-role ${classeRole}"
                    >
                        ${role}
                    </span>

                </td>


                <td>

                    <span class="user-date">
                        ${date}
                    </span>

                </td>


                <td>

                    <div class="user-actions">

                        <button
                            type="button"
                            class="user-action"
                            data-action="edit"
                            data-id="${utilisateur.id_user}"
                            title="Modifier"
                        >
                            ✎
                        </button>

                    </div>

                </td>

            </tr>

        `;

    }


    // ======================================================
    // INITIALISER LES ACTIONS
    // ======================================================

    function ajouterEvenementsActions() {

        document
            .querySelectorAll(
                ".user-action[data-action='edit']"
            )
            .forEach(
                bouton => {

                    bouton.addEventListener(
                        "click",
                        () => {

                            const id =
                                Number(
                                    bouton.dataset.id
                                );


                            ouvrirEdition(id);

                        }
                    );

                }
            );

    }


    // ======================================================
    // RECHERCHE
    // ======================================================

    function initialiserRecherche() {

        const input =
            document.getElementById(
                "usersSearch"
            );


        if (!input) {

            return;

        }


        input.addEventListener(
            "input",
            afficherUtilisateurs
        );


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "/" &&
                    document.activeElement !== input
                ) {

                    event.preventDefault();

                    input.focus();

                }


                if (
                    event.key === "Escape" &&
                    document.activeElement === input
                ) {

                    input.value = "";

                    afficherUtilisateurs();

                    input.blur();

                }

            }
        );

    }


    // ======================================================
    // FILTRE
    // ======================================================

    function initialiserFiltres() {

        const select =
            document.getElementById(
                "usersRoleFilter"
            );


        if (!select) {

            return;

        }


        select.addEventListener(
            "change",
            afficherUtilisateurs
        );

    }


    // ======================================================
    // ACTUALISATION
    // ======================================================

    function initialiserActualisation() {

        const bouton =
            document.getElementById(
                "usersRefresh"
            );


        if (!bouton) {

            return;

        }


        bouton.addEventListener(
            "click",
            async () => {

                bouton.disabled = true;

                await chargerUtilisateurs();

                bouton.disabled = false;

                afficherToast(
                    "Liste des utilisateurs actualisée."
                );

            }
        );

    }


    // ======================================================
    // MODALE
    // ======================================================

    function initialiserModale() {

        const modal =
            document.getElementById(
                "userModal"
            );


        const close =
            document.getElementById(
                "userModalClose"
            );


        const cancel =
            document.getElementById(
                "userModalCancel"
            );


        const form =
            document.getElementById(
                "userEditForm"
            );


        if (!modal) {

            return;

        }


        close?.addEventListener(
            "click",
            fermerModale
        );


        cancel?.addEventListener(
            "click",
            fermerModale
        );


        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    fermerModale();

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

                    fermerModale();

                }

            }
        );


        form?.addEventListener(
            "submit",
            enregistrerUtilisateur
        );

    }


    // ======================================================
    // OUVRIR MODALE
    // ======================================================

    function ouvrirEdition(id) {

        const utilisateur =
            utilisateurs.find(
                element =>
                    Number(element.id_user) === id
            );


        if (!utilisateur) {

            console.warn(
                "Utilisateur introuvable :",
                id
            );

            return;

        }


        utilisateurSelectionne =
            utilisateur;


        definirValeur(
            "editUserId",
            utilisateur.id_user
        );


        definirValeur(
            "editPrenom",
            utilisateur.prenom
        );


        definirValeur(
            "editNom",
            utilisateur.nom
        );


        definirValeur(
            "editUsername",
            utilisateur.username
        );


        definirValeur(
            "editEmail",
            utilisateur.email
        );


        definirValeur(
            "editRole",
            utilisateur.role
        );


        const nomComplet =
            `${utilisateur.prenom || ""} ${utilisateur.nom || ""}`
            .trim();


        definirTexte(
            "userModalTitle",
            nomComplet ||
            utilisateur.username ||
            "Utilisateur"
        );


        definirTexte(
            "modalUserAvatar",
            obtenirInitiales(
                utilisateur.prenom,
                utilisateur.nom,
                utilisateur.username
            )
        );


        definirTexte(
            "userFormMessage",
            ""
        );


        document
            .getElementById(
                "userFormMessage"
            )
            ?.classList.remove(
                "error",
                "success"
            );


        const modal =
            document.getElementById(
                "userModal"
            );


        if (modal) {

            modal.hidden = false;

            document.body.style.overflow =
                "hidden";

        }

    }


    // ======================================================
    // FERMER MODALE
    // ======================================================

    function fermerModale() {

        const modal =
            document.getElementById(
                "userModal"
            );


        if (!modal) {

            return;

        }


        modal.hidden = true;

        document.body.style.overflow = "";


        utilisateurSelectionne = null;

    }


    // ======================================================
    // ENREGISTRER
    // ======================================================

    async function enregistrerUtilisateur(
        event
    ) {

        event.preventDefault();


        const id =
            Number(
                document.getElementById(
                    "editUserId"
                )?.value
            );


        if (!id) {

            return;

        }


        const donnees = {

            prenom:
                document.getElementById(
                    "editPrenom"
                )?.value.trim(),

            nom:
                document.getElementById(
                    "editNom"
                )?.value.trim(),

            username:
                document.getElementById(
                    "editUsername"
                )?.value.trim(),

            email:
                document.getElementById(
                    "editEmail"
                )?.value.trim(),

            role:
                document.getElementById(
                    "editRole"
                )?.value

        };


        const message =
            document.getElementById(
                "userFormMessage"
            );


        try {

            const response =
                await fetch(
                    `/admin/api/utilisateurs/${id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
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


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.succes
            ) {

                throw new Error(
                    data.message ||
                    "Impossible de modifier l'utilisateur."
                );

            }


            if (message) {

                message.textContent =
                    "Utilisateur modifié avec succès.";

                message.className =
                    "user-form-message success";

            }


            await chargerUtilisateurs();


            setTimeout(
                () => {

                    fermerModale();

                    afficherToast(
                        "Utilisateur modifié avec succès."
                    );

                },
                500
            );


        } catch (erreur) {

            console.error(
                "❌ ERREUR MODIFICATION :",
                erreur
            );


            if (message) {

                message.textContent =
                    erreur.message;

                message.className =
                    "user-form-message error";

            }

        }

    }


    // ======================================================
    // AFFICHAGE CHARGEMENT
    // ======================================================

    function afficherChargement() {

        const tbody =
            document.getElementById(
                "usersTableBody"
            );


        if (!tbody) {

            return;

        }


        tbody.innerHTML = `

            <tr>

                <td colspan="6">

                    <div class="users-loading">

                        <div class="loading-spinner"></div>

                        <span>
                            Chargement des utilisateurs...
                        </span>

                    </div>

                </td>

            </tr>

        `;

    }


    // ======================================================
    // AFFICHAGE ERREUR
    // ======================================================

    function afficherErreur(
        message
    ) {

        const tbody =
            document.getElementById(
                "usersTableBody"
            );


        if (!tbody) {

            return;

        }


        tbody.innerHTML = `

            <tr>

                <td colspan="6">

                    <div class="users-error">

                        <strong>
                            Impossible de charger les utilisateurs
                        </strong>

                        <span>
                            ${echapper(
                                message
                            )}
                        </span>

                    </div>

                </td>

            </tr>

        `;

    }


    // ======================================================
    // NOMBRE DE RÉSULTATS
    // ======================================================

    function afficherNombreResultats(
        nombre
    ) {

        const element =
            document.getElementById(
                "usersResultCount"
            );


        if (!element) {

            return;

        }


        element.textContent =
            `${nombre.toLocaleString("fr-FR")} ${
                nombre > 1
                    ? "utilisateurs"
                    : "utilisateur"
            }`;

    }


    // ======================================================
    // TOAST
    // ======================================================

    function afficherToast(
        message
    ) {

        const toast =
            document.getElementById(
                "usersToast"
            );


        if (!toast) {

            return;

        }


        toast.textContent =
            message;


        toast.classList.add(
            "show"
        );


        clearTimeout(
            toast._timer
        );


        toast._timer =
            setTimeout(
                () => {

                    toast.classList.remove(
                        "show"
                    );

                },
                2500
            );

    }


    // ======================================================
    // OUTILS
    // ======================================================

    function definirValeur(
        id,
        valeur
    ) {

        const element =
            document.getElementById(id);


        if (element) {

            element.value =
                valeur ?? "";

        }

    }


    function obtenirInitiales(
        prenom,
        nom,
        username
    ) {

        let initiales = "";


        if (prenom) {

            initiales +=
                prenom.charAt(0);

        }


        if (nom) {

            initiales +=
                nom.charAt(0);

        }


        if (!initiales && username) {

            initiales =
                username.substring(0, 2);

        }


        return (
            initiales ||
            "US"
        )
        .substring(0, 2)
        .toUpperCase();

    }


    function formaterDate(
        valeur
    ) {

        if (!valeur) {

            return "—";

        }


        const date =
            new Date(valeur);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "—";

        }


        return date.toLocaleDateString(
            "fr-FR",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    function echapper(
        valeur
    ) {

        return String(
            valeur ?? ""
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


    // ======================================================
    // API PUBLIQUE
    // ======================================================

    window.CityCareUtilisateurs = {

        initialiser:
            initialiserUtilisateurs,

        recharger:
            chargerUtilisateurs

    };


})();