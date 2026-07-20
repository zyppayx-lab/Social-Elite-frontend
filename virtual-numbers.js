// ===============================
// Supabase
// ===============================

const SUPABASE_URL = "https://dohxtukzxopwkvxeppdl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// ===============================
// DOM
// ===============================

const searchInput = document.getElementById("searchInput");
const servicesContainer = document.getElementById("servicesContainer");
const loadingState = document.getElementById("loadingState");
const emptyState = document.getElementById("emptyState");
const statusContainer = document.getElementById("statusContainer");
const refreshBtn = document.getElementById("refreshBtn");

let allServices = [];

// ===============================
// Auth
// ===============================

async function requireAuth() {

    const {
        data: { session }
    } = await supabase.auth.getSession();

    if (!session) {

        window.location.href = "login.html";
        return null;

    }

    return session.access_token;
}

// ===============================
// UI Helpers
// ===============================

function showLoading(show) {

    loadingState.style.display = show ? "flex" : "none";

}

function showMessage(message, type = "error") {

    statusContainer.innerHTML = `
        <div class="status-message status-${type}">
            ${message}
        </div>
    `;

}

function clearMessage() {

    statusContainer.innerHTML = "";

}

function showEmpty(show) {

    emptyState.style.display = show ? "block" : "none";

}

// ===============================
// Load Services
// ===============================

async function loadServices() {

    showLoading(true);

    clearMessage();

    servicesContainer.innerHTML = "";

    try {

        const token = await requireAuth();

        if (!token) return;

        const response = await fetch(
            "https://dohxtukzxopwkvxeppdl.supabase.co/functions/v1/get-smsgig-services",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {

            throw new Error(
                result.message || "Unable to load services."
            );

        }

        allServices = result.data || [];

        renderServices(allServices);

    } catch (error) {

        console.error(error);

        showMessage(error.message);

    } finally {

        showLoading(false);

    }

}
// ===============================
// Render Services
// ===============================

function renderServices(services) {

    servicesContainer.innerHTML = "";

    if (!services || services.length === 0) {

        showEmpty(true);

        return;

    }

    showEmpty(false);

    services.forEach(service => {

        const stockClass =
            service.stock > 20
                ? "badge-success"
                : service.stock > 0
                ? "badge-warning"
                : "badge-danger";

        const stockText =
            service.stock > 0
                ? `${service.stock} Available`
                : "Out of Stock";

        const card = document.createElement("div");

        card.className = "service-card";

        card.innerHTML = `

            <div class="service-title">
                ${service.name}
            </div>

            <div class="info-row">
                <span class="label">Price</span>
                <span class="value">
                    ₦${Number(service.selling_price).toLocaleString()}
                </span>
            </div>

            <div class="info-row">
                <span class="label">Stock</span>
                <span class="badge ${stockClass}">
                    ${stockText}
                </span>
            </div>

            <div class="info-row">
                <span class="label">Valid For</span>
                <span class="value">
                    ${Math.floor(service.ttl / 60)} mins
                </span>
            </div>

            <div class="info-row">
                <span class="label">Multiple SMS</span>
                <span class="value">
                    ${service.multiple_sms ? "Yes" : "No"}
                </span>
            </div>

            <button
                class="buy-btn"
                ${service.stock <= 0 ? "disabled" : ""}
                data-service="${service.service_code}"
            >
                ${service.stock > 0 ? "Buy Number" : "Out of Stock"}
            </button>

        `;

        const button = card.querySelector(".buy-btn");

        button.addEventListener("click", () => {

            window.location.href =
                `purchase-sms.html?service=${encodeURIComponent(service.service_code)}`;

        });

        servicesContainer.appendChild(card);

    });

}



// ===============================
// Search
// ===============================

searchInput.addEventListener("input", () => {

    const keyword =
        searchInput.value
            .trim()
            .toLowerCase();

    const filtered =
        allServices.filter(service =>
            service.name
                .toLowerCase()
                .includes(keyword)
        );

    renderServices(filtered);

});



// ===============================
// Refresh
// ===============================

refreshBtn.addEventListener("click", loadServices);
// ===============================
// Session Watcher
// ===============================

supabase.auth.onAuthStateChange((event) => {

    if (event === "SIGNED_OUT") {

        window.location.href = "login.html";

    }

});



// ===============================
// Pull To Refresh
// ===============================

let startY = 0;

window.addEventListener("touchstart", (e) => {

    startY = e.touches[0].clientY;

});

window.addEventListener("touchend", (e) => {

    const endY = e.changedTouches[0].clientY;

    if (
        window.scrollY === 0 &&
        endY - startY > 120
    ) {

        loadServices();

    }

});



// ===============================
// Initialize
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    loadServices();

});
