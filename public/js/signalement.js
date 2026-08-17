// ==========================================================
// CITYCARE - SIGNALEMENT
// public/js/signalement.js
// ==========================================================

"use strict";


// ==========================================================
// ÉLÉMENTS
// ==========================================================

const categoriesSection =
    document.getElementById(
        "categoriesSection"
    );

const formSection =
    document.getElementById(
        "formSection"
    );

const successSection =
    document.getElementById(
        "successSection"
    );

const signalementForm =
    document.getElementById(
        "signalementForm"
    );

const selectedCategoryIcon =
    document.getElementById(
        "selectedCategoryIcon"
    );

const selectedCategoryName =
    document.getElementById(
        "selectedCategoryName"
    );

const idCategorie =
    document.getElementById(
        "idCategorie"
    );

const typeProbleme =
    document.getElementById(
        "typeProbleme"
    );

const typeDescription =
    document.getElementById(
        "typeDescription"
    );

const idQuartier =
    document.getElementById(
        "idQuartier"
    );

const depuisQuand =
    document.getElementById(
        "depuisQuand"
    );

const titre =
    document.getElementById(
        "titre"
    );

const description =
    document.getElementById(
        "description"
    );

const photo =
    document.getElementById(
        "photo"
    );

const photoPreview =
    document.getElementById(
        "photoPreview"
    );

const formMessage =
    document.getElementById(
        "formMessage"
    );

const submitBtn =
    document.getElementById(
        "submitBtn"
    );

const btnText =
    document.getElementById(
        "btnText"
    );

const btnLoader =
    document.getElementById(
        "btnLoader"
    );

const changeCategoryBtn =
    document.getElementById(
        "changeCategoryBtn"
    );

const cancelBtn =
    document.getElementById(
        "cancelBtn"
    );

const newSignalementBtn =
    document.getElementById(
        "newSignalementBtn"
    );

const titreCounter =
    document.getElementById(
        "titreCounter"
    );

const descriptionCounter =
    document.getElementById(
        "descriptionCounter"
    );


// ==========================================================
// VARIABLES
// ==========================================================

let categorieSelectionnee = null;


// ==========================================================
// ICONES
// ==========================================================

const iconesCategories = {

    1: "💧",

    5: "⚡",

    3: "🗑️",

    4: "🛒"

};


// ==========================================================
// NOMS DE CATÉGORIES
// ==========================================================

const nomsCategories = {

    1: "Gestion de l'eau",

    5: "Coupures d'électricité",

    3: "Collecte des déchets",

    4: "Marché local"

};


// ==========================================================
// INITIALISATION
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "🚀 CityCare - page signalement chargée."
        );

        await chargerQuartiers();

    }
);


// ==========================================================
// CHARGER LES QUARTIERS
// ==========================================================

async function chargerQuartiers() {

    try {

        const response =
            await fetch(
                "/signalement/api/quartiers",
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        const data =
            await response.json();


        console.log(
            "📍 Quartiers :",
            data
        );


        if (
            !response.ok ||
            !data.succes
        ) {

            throw new Error(
                data.message ||
                "Impossible de charger les quartiers."
            );

        }


        idQuartier.innerHTML = `

            <option value="">
                Sélectionnez votre quartier
            </option>

        `;


        data.quartiers.forEach(
            function (quartier) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    quartier.id_quartier;

                option.textContent =
                    quartier.nom;

                idQuartier.appendChild(
                    option
                );

            }
        );


    } catch (erreur) {

        console.error(
            "❌ Erreur quartiers :",
            erreur
        );


        idQuartier.innerHTML = `

            <option value="">
                Impossible de charger les quartiers
            </option>

        `;

        afficherErreur(
            erreur.message
        );

    }

}


// ==========================================================
// BOUTONS CATÉGORIES
// ==========================================================

document
    .querySelectorAll(
        ".category-card"
    )
    .forEach(
        function (card) {

            card.addEventListener(
                "click",
                async function () {

                    const id =
                        Number(
                            card.dataset.categorie
                        );

                    await selectionnerCategorie(
                        id
                    );

                }
            );

        }
    );


// ==========================================================
// SÉLECTION CATÉGORIE
// ==========================================================

async function selectionnerCategorie(
    id
) {

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {

        afficherErreur(
            "Catégorie invalide."
        );

        return;

    }


    categorieSelectionnee =
        id;


    idCategorie.value =
        String(id);


    selectedCategoryIcon.textContent =
        iconesCategories[id] ||
        "📢";


    selectedCategoryName.textContent =
        nomsCategories[id] ||
        "Catégorie sélectionnée";


    // ------------------------------------------------------
    // Charger les types depuis la base
    // ------------------------------------------------------

    await chargerTypes(
        id
    );


    // ------------------------------------------------------
    // Afficher formulaire
    // ------------------------------------------------------

    categoriesSection.classList.add(
        "hidden"
    );

    formSection.classList.remove(
        "hidden"
    );


    formSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ==========================================================
// CHARGER TYPES
// ==========================================================

async function chargerTypes(
    idCategorieValue
) {

    typeProbleme.innerHTML = `

        <option value="">
            Chargement des problèmes...
        </option>

    `;


    typeProbleme.disabled =
        true;


    typeDescription.textContent =
        "Chargement des types de problèmes...";


    try {

        const response =
            await fetch(
                `/signalement/api/types/${idCategorieValue}`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        const data =
            await response.json();


        console.log(
            "🔎 Types reçus :",
            data
        );


        if (
            !response.ok ||
            !data.succes
        ) {

            throw new Error(
                data.message ||
                "Impossible de récupérer les types."
            );

        }


        typeProbleme.innerHTML = `

            <option value="">
                Sélectionnez le problème
            </option>

        `;


        if (
            !data.types ||
            data.types.length === 0
        ) {

            typeProbleme.innerHTML = `

                <option value="">
                    Aucun problème disponible
                </option>

            `;

            typeDescription.textContent =
                "Aucun type disponible pour cette catégorie.";

            return;

        }


        data.types.forEach(
            function (type) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    String(
                        type.id_type
                    );


                option.textContent =
                    type.nom;


                option.dataset.description =
                    type.description ||
                    "";


                typeProbleme.appendChild(
                    option
                );

            }
        );


        typeDescription.textContent =
            "Sélectionnez le problème rencontré.";


    } catch (erreur) {

        console.error(
            "❌ Erreur types :",
            erreur
        );


        typeProbleme.innerHTML = `

            <option value="">
                Impossible de charger les problèmes
            </option>

        `;


        typeDescription.textContent =
            erreur.message;


    } finally {

        typeProbleme.disabled =
            false;

    }

}


// ==========================================================
// CHANGEMENT TYPE
// ==========================================================

typeProbleme.addEventListener(
    "change",
    function () {

        const option =
            typeProbleme.options[
                typeProbleme.selectedIndex
            ];


        if (
            !option ||
            !option.value
        ) {

            typeDescription.textContent =
                "Sélectionnez le problème rencontré.";

            return;

        }


        typeDescription.textContent =
            option.dataset.description ||
            "Type de problème sélectionné.";

    }
);


// ==========================================================
// CHANGER DE CATÉGORIE
// ==========================================================

changeCategoryBtn.addEventListener(
    "click",
    function () {

        formSection.classList.add(
            "hidden"
        );

        categoriesSection.classList.remove(
            "hidden"
        );

        categoriesSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }
);


// ==========================================================
// ANNULER
// ==========================================================

cancelBtn.addEventListener(
    "click",
    function () {

        const confirmation =
            confirm(
                "Voulez-vous vraiment annuler ce signalement ?"
            );


        if (
            !confirmation
        ) {

            return;

        }


        resetForm();


        categorieSelectionnee =
            null;


        formSection.classList.add(
            "hidden"
        );

        categoriesSection.classList.remove(
            "hidden"
        );


        categoriesSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }
);


// ==========================================================
// COMPTEUR TITRE
// ==========================================================

titre.addEventListener(
    "input",
    function () {

        titreCounter.textContent =
            titre.value.length;

    }
);


// ==========================================================
// COMPTEUR DESCRIPTION
// ==========================================================

description.addEventListener(
    "input",
    function () {

        descriptionCounter.textContent =
            description.value.length;

    }
);


// ==========================================================
// PHOTO
// ==========================================================

photo.addEventListener(
    "change",
    function () {

        const fichier =
            photo.files[0];


        photoPreview.innerHTML =
            "";


        photoPreview.classList.add(
            "hidden"
        );


        // Photo facultative
        if (
            !fichier
        ) {

            return;

        }


        // --------------------------------------------------
        // Taille
        // --------------------------------------------------

        const tailleMax =
            5 * 1024 * 1024;


        if (
            fichier.size >
            tailleMax
        ) {

            afficherErreur(
                "La photo ne doit pas dépasser 5 Mo."
            );


            photo.value =
                "";


            return;

        }


        // --------------------------------------------------
        // Type
        // --------------------------------------------------

        const typesAutorises = [

            "image/jpeg",

            "image/png",

            "image/webp"

        ];


        if (
            !typesAutorises.includes(
                fichier.type
            )
        ) {

            afficherErreur(
                "Format de photo non accepté."
            );


            photo.value =
                "";


            return;

        }


        // --------------------------------------------------
        // Preview
        // --------------------------------------------------

        const image =
            document.createElement(
                "img"
            );


        image.src =
            URL.createObjectURL(
                fichier
            );


        image.alt =
            "Aperçu de la photo";


        photoPreview.appendChild(
            image
        );


        photoPreview.classList.remove(
            "hidden"
        );

    }
);


// ==========================================================
// VALIDATION
// ==========================================================

function validerFormulaire() {

    cacherMessage();


    // ------------------------------------------------------
    // CATÉGORIE
    // ------------------------------------------------------

    if (
        !idCategorie.value ||
        !idValide(
            idCategorie.value
        )
    ) {

        afficherErreur(
            "Veuillez sélectionner une catégorie."
        );

        return false;

    }


    // ------------------------------------------------------
    // TYPE
    // ------------------------------------------------------

    if (
        !typeProbleme.value ||
        !idValide(
            typeProbleme.value
        )
    ) {

        afficherErreur(
            "Veuillez sélectionner le type de problème."
        );

        typeProbleme.focus();

        return false;

    }


    // ------------------------------------------------------
    // QUARTIER
    // ------------------------------------------------------

    if (
        !idQuartier.value ||
        !idValide(
            idQuartier.value
        )
    ) {

        afficherErreur(
            "Veuillez sélectionner votre quartier."
        );

        idQuartier.focus();

        return false;

    }


    // ------------------------------------------------------
    // DEPUIS QUAND
    // ------------------------------------------------------

    if (
        !depuisQuand.value
    ) {

        afficherErreur(
            "Veuillez indiquer depuis quand le problème existe."
        );

        depuisQuand.focus();

        return false;

    }


    // ------------------------------------------------------
    // TITRE
    // ------------------------------------------------------

    const titreValue =
        titre.value.trim();


    if (
        !titreValue
    ) {

        afficherErreur(
            "Veuillez saisir le titre du signalement."
        );

        titre.focus();

        return false;

    }


    if (
        titreValue.length < 5
    ) {

        afficherErreur(
            "Le titre doit contenir au moins 5 caractères."
        );

        titre.focus();

        return false;

    }


    // ------------------------------------------------------
    // DESCRIPTION
    // ------------------------------------------------------

    const descriptionValue =
        description.value.trim();


    if (
        !descriptionValue
    ) {

        afficherErreur(
            "Veuillez saisir une description."
        );

        description.focus();

        return false;

    }


    if (
        descriptionValue.length < 10
    ) {

        afficherErreur(
            "La description doit contenir au moins 10 caractères."
        );

        description.focus();

        return false;

    }


    return true;

}


// ==========================================================
// UTILITAIRE ID
// ==========================================================

function idValide(
    valeur
) {

    const nombre =
        Number(valeur);


    return (
        Number.isInteger(nombre) &&
        nombre > 0
    );

}


// ==========================================================
// ENVOYER
// ==========================================================

signalementForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        cacherMessage();


        console.log(
            "========================================"
        );

        console.log(
            "📤 TENTATIVE ENVOI SIGNALEMENT"
        );

        console.log(
            "========================================"
        );


        // --------------------------------------------------
        // Validation
        // --------------------------------------------------

        if (
            !validerFormulaire()
        ) {

            return;

        }


        // --------------------------------------------------
        // Afficher exactement ce qui sera envoyé
        // --------------------------------------------------

        const formulaire =
            new FormData(
                signalementForm
            );


        console.log(
            "📦 FormData envoyée :"
        );


        for (
            const [cle, valeur]
            of formulaire.entries()
        ) {

            if (
                valeur instanceof File
            ) {

                console.log(
                    cle,
                    "=>",
                    valeur.name
                );

            } else {

                console.log(
                    cle,
                    "=>",
                    valeur
                );

            }

        }


        activerChargement();


        try {

            const response =
                await fetch(
                    "/signalement/api",
                    {
                        method: "POST",

                        credentials: "include",

                        body:
                            formulaire
                    }
                );


            const data =
                await response.json();


            console.log(
                "📥 Réponse serveur :",
                data
            );


            if (
                !response.ok ||
                !data.succes
            ) {

                throw new Error(
                    data.message ||
                    "Impossible d'envoyer le signalement."
                );

            }


            // ------------------------------------------------
            // SUCCÈS
            // ------------------------------------------------

            formSection.classList.add(
                "hidden"
            );


            categoriesSection.classList.add(
                "hidden"
            );


            successSection.classList.remove(
                "hidden"
            );


            successSection.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });


            console.log(
                "✅ Signalement enregistré."
            );


        } catch (erreur) {

            console.error(
                "❌ ERREUR ENVOI :",
                erreur
            );


            afficherErreur(
                erreur.message
            );


        } finally {

            desactiverChargement();

        }

    }
);


// ==========================================================
// NOUVEAU SIGNALEMENT
// ==========================================================

newSignalementBtn.addEventListener(
    "click",
    function () {

        resetForm();


        categorieSelectionnee =
            null;


        successSection.classList.add(
            "hidden"
        );


        formSection.classList.add(
            "hidden"
        );


        categoriesSection.classList.remove(
            "hidden"
        );


        categoriesSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }
);


// ==========================================================
// RESET
// ==========================================================

function resetForm() {

    signalementForm.reset();


    idCategorie.value =
        "";


    typeProbleme.innerHTML = `

        <option value="">
            Sélectionnez le problème
        </option>

    `;


    typeDescription.textContent =
        "Sélectionnez le problème rencontré.";


    titreCounter.textContent =
        "0";


    descriptionCounter.textContent =
        "0";


    photoPreview.innerHTML =
        "";


    photoPreview.classList.add(
        "hidden"
    );


    cacherMessage();

}


// ==========================================================
// MESSAGE ERREUR
// ==========================================================

function afficherErreur(
    message
) {

    formMessage.textContent =
        message;


    formMessage.className =
        "form-message error";


    formMessage.classList.remove(
        "hidden"
    );


    formMessage.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


// ==========================================================
// CACHER MESSAGE
// ==========================================================

function cacherMessage() {

    formMessage.textContent =
        "";


    formMessage.className =
        "form-message hidden";

}


// ==========================================================
// CHARGEMENT
// ==========================================================

function activerChargement() {

    submitBtn.disabled =
        true;


    btnText.classList.add(
        "hidden"
    );


    btnLoader.classList.remove(
        "hidden"
    );

}


function desactiverChargement() {

    submitBtn.disabled =
        false;


    btnText.classList.remove(
        "hidden"
    );


    btnLoader.classList.add(
        "hidden"
    );

}