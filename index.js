// ======================================
// MOBILE MENU
// ======================================

const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");

        const icon = menuBtn.querySelector("i");

        if (mobileMenu.classList.contains("hidden")) {
            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");
        } else {
            icon.classList.remove("fa-bars");
            icon.classList.add("fa-xmark");
        }
    });
}

// ======================================
// NAVBAR SCROLL
// ======================================

const header = document.querySelector("header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 80) {

        header.classList.add("scrolled");

    } else {

        header.classList.remove("scrolled");

    }

});

// ======================================
// REVEAL ANIMATION
// ======================================

const revealElements = document.querySelectorAll("section");

const reveal = () => {

    const trigger = window.innerHeight - 120;

    revealElements.forEach((section) => {

        const top = section.getBoundingClientRect().top;

        if (top < trigger) {

            section.classList.add("fade-up");

        }

    });

};

window.addEventListener("scroll", reveal);

reveal();

// ======================================
// SMOOTH BUTTON EFFECT
// ======================================

document.querySelectorAll("a").forEach((link) => {

    link.addEventListener("mouseenter", () => {

        link.style.transition = ".35s";

    });

});

// ======================================
// CARD TILT EFFECT
// ======================================

document.querySelectorAll(".grid > a").forEach((card) => {

    card.addEventListener("mousemove", (e) => {

        const rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const rotateX = -(y - rect.height / 2) / 20;
        const rotateY = (x - rect.width / 2) / 20;

        card.style.transform =
            `perspective(1000px)
             rotateX(${rotateX}deg)
             rotateY(${rotateY}deg)
             translateY(-8px)`;

    });

    card.addEventListener("mouseleave", () => {

        card.style.transform =
            "perspective(1000px) rotateX(0) rotateY(0)";

    });

});

// ======================================
// BUTTON RIPPLE
// ======================================

document.querySelectorAll("a").forEach((button) => {

    button.addEventListener("click", function (e) {

        const circle = document.createElement("span");

        const size = Math.max(
            this.clientWidth,
            this.clientHeight
        );

        circle.style.width = size + "px";
        circle.style.height = size + "px";

        circle.style.left =
            e.clientX -
            this.getBoundingClientRect().left -
            size / 2 +
            "px";

        circle.style.top =
            e.clientY -
            this.getBoundingClientRect().top -
            size / 2 +
            "px";

        circle.style.position = "absolute";
        circle.style.borderRadius = "50%";
        circle.style.background = "rgba(255,255,255,.3)";
        circle.style.transform = "scale(0)";
        circle.style.animation = "ripple .6s linear";
        circle.style.pointerEvents = "none";

        this.style.position = "relative";
        this.style.overflow = "hidden";

        this.appendChild(circle);

        setTimeout(() => {

            circle.remove();

        }, 600);

    });

});

// ======================================
// RIPPLE STYLE
// ======================================

const style = document.createElement("style");

style.innerHTML = `
@keyframes ripple{

from{

transform:scale(0);
opacity:.7;

}

to{

transform:scale(4);
opacity:0;

}

}
`;

document.head.appendChild(style);

// ======================================
// PARALLAX BACKGROUND
// ======================================

window.addEventListener("scroll", () => {

    document.body.style.backgroundPositionY =
        window.scrollY * 0.2 + "px";

});

// ======================================
// COPYRIGHT YEAR
// ======================================

const year = document.querySelector("#year");

if (year) {

    year.textContent = new Date().getFullYear();

}

console.log("Landing page loaded successfully.");
