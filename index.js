/*======================================
SOCIALELITE LANDING PAGE
index.js
PART 1
======================================*/

"use strict";

/*==============================
ELEMENTS
==============================*/

const header = document.querySelector(".header");

const menuToggle = document.querySelector(".menu-toggle");

const navbar = document.querySelector(".navbar");

const navLinks = document.querySelectorAll(".nav-links a");

const counters = document.querySelectorAll(".counter");

const reveals = document.querySelectorAll(
    ".reveal,.reveal-left,.reveal-right"
);

const backToTop = document.querySelector(".back-to-top");

const newsletterForm = document.querySelector(".newsletter-form");

/*==============================
STICKY HEADER
==============================*/

window.addEventListener("scroll", () => {

    if (window.scrollY > 60) {

        header.classList.add("scrolled");

    } else {

        header.classList.remove("scrolled");

    }

});

/*==============================
MOBILE MENU
==============================*/

if (menuToggle && navbar) {

    menuToggle.addEventListener("click", () => {

        menuToggle.classList.toggle("active");

        navbar.classList.toggle("active");

    });

}

/*==============================
CLOSE MENU
==============================*/

navLinks.forEach(link => {

    link.addEventListener("click", () => {

        if (navbar) {

            navbar.classList.remove("active");

        }

        if (menuToggle) {

            menuToggle.classList.remove("active");

        }

    });

});

/*==============================
ACTIVE NAVIGATION
==============================*/

const sections = document.querySelectorAll("section");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 120;

        const sectionHeight = section.offsetHeight;

        if (window.scrollY >= sectionTop) {

            current = section.getAttribute("id");

        }

    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (
            current &&
            link.getAttribute("href") === "#" + current
        ) {

            link.classList.add("active");

        }

    });

});
/*======================================
PART 2
SCROLL REVEAL
COUNTERS
BACK TO TOP
NEWSLETTER
END OF FILE
======================================*/

/*==============================
SCROLL REVEAL
==============================*/

function revealElements() {

    const trigger = window.innerHeight * 0.85;

    reveals.forEach(element => {

        const top = element.getBoundingClientRect().top;

        if (top < trigger) {

            element.classList.add("active");

        }

    });

}

window.addEventListener("scroll", revealElements);

window.addEventListener("load", revealElements);

/*==============================
COUNTER ANIMATION
==============================*/

let counterStarted = false;

function startCounters() {

    const statsSection = document.querySelector(".stats");

    if (!statsSection) return;

    const trigger = statsSection.getBoundingClientRect().top;

    if (trigger < window.innerHeight && !counterStarted) {

        counterStarted = true;

        counters.forEach(counter => {

            const target = Number(counter.dataset.target);

            const increment = target / 100;

            let current = 0;

            const updateCounter = () => {

                current += increment;

                if (current < target) {

                    counter.textContent = Math.floor(current);

                    requestAnimationFrame(updateCounter);

                } else {

                    counter.textContent = target;

                }

            };

            updateCounter();

        });

    }

}

window.addEventListener("scroll", startCounters);

window.addEventListener("load", startCounters);

/*==============================
BACK TO TOP
==============================*/

if (backToTop) {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 400) {

            backToTop.classList.add("show");

        } else {

            backToTop.classList.remove("show");

        }

    });

    backToTop.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}

/*==============================
NEWSLETTER FORM
==============================*/

if (newsletterForm) {

    newsletterForm.addEventListener("submit", e => {

        e.preventDefault();

        alert("Thank you for subscribing to SocialElite!");

        newsletterForm.reset();

    });

}

/*==============================
CURRENT YEAR
==============================*/

const year = document.querySelector("#year");

if (year) {

    year.textContent = new Date().getFullYear();

}

/*==============================
PRELOADER (OPTIONAL)
==============================*/

window.addEventListener("load", () => {

    const preloader = document.querySelector(".preloader");

    if (preloader) {

        preloader.classList.add("hide");

        setTimeout(() => {

            preloader.remove();

        }, 500);

    }

});

/*======================================
END OF index.js
======================================*/
