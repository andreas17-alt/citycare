// ==========================================================
// CITYCARE - PAGE D'ACCUEIL
// public/js/index.js
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    // ======================================================
    // HEADER : effet au défilement
    // ======================================================

    const header = document.querySelector("header");

    function gererHeader() {

        if (!header) {
            return;
        }

        if (window.scrollY > 30) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }

    }

    window.addEventListener(
        "scroll",
        gererHeader
    );

    gererHeader();


    // ======================================================
    // LIENS DE NAVIGATION : DÉFILEMENT FLUIDE
    // ======================================================

    const liensInternes =
        document.querySelectorAll(
            'a[href^="#"]'
        );

    liensInternes.forEach((lien) => {

        lien.addEventListener(
            "click",
            (event) => {

                const cibleId =
                    lien.getAttribute("href");

                if (
                    !cibleId ||
                    cibleId === "#"
                ) {
                    return;
                }

                const cible =
                    document.querySelector(
                        cibleId
                    );

                if (!cible) {
                    return;
                }

                event.preventDefault();

                cible.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

    });


    // ======================================================
    // ANIMATION DES ÉLÉMENTS AU DÉFILEMENT
    // ======================================================

    const elements =
        document.querySelectorAll(
            ".service, .apropos, .hero-texte, .hero-image"
        );

    if ("IntersectionObserver" in window) {

        const observer =
            new IntersectionObserver(
                (entries) => {

                    entries.forEach(
                        (entry) => {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "visible"
                                );

                                observer.unobserve(
                                    entry.target
                                );

                            }

                        }
                    );

                },
                {
                    threshold: 0.15
                }
            );

        elements.forEach(
            (element) => {

                element.classList.add(
                    "animation-element"
                );

                observer.observe(
                    element
                );

            }
        );

    } else {

        elements.forEach(
            (element) => {

                element.classList.add(
                    "visible"
                );

            }
        );

    }


    // ======================================================
    // ANIMATION DES CARTES SERVICES
    // ======================================================

    const services =
        document.querySelectorAll(
            ".service"
        );

    services.forEach(
        (service, index) => {

            service.style.transitionDelay =
                `${index * 100}ms`;

        }
    );


    // ======================================================
    // BOUTON "COMMENCER"
    // ======================================================

    const bouton =
        document.querySelector(
            ".hero .btn"
        );

    if (bouton) {

        bouton.addEventListener(
            "click",
            () => {

                bouton.classList.add(
                    "clicked"
                );

                setTimeout(
                    () => {

                        bouton.classList.remove(
                            "clicked"
                        );

                    },
                    300
                );

            }
        );

    }


    // ======================================================
    // ANIMATION IMAGE HERO
    // ======================================================

    const image =
        document.querySelector(
            ".hero-image img"
        );

    if (image) {

        image.addEventListener(
            "load",
            () => {

                image.classList.add(
                    "loaded"
                );

            }
        );

    }


    // ======================================================
    // ANNÉE AUTOMATIQUE DU FOOTER
    // ======================================================

    const footer =
        document.querySelector(
            "footer p"
        );

    if (footer) {

        const annee =
            new Date().getFullYear();

        footer.textContent =
            `© ${annee} CityCare - Tous droits réservés.`;

    }

});