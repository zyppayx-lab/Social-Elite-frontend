/*==================================================
SOCIALELITE
social-accounts.js
PART 1
==================================================*/

/*========================
SUPABASE CONFIG
=========================*/

const SUPABASE_URL = "https://dohxtukzxopwkvxeppdl.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvaHh0dWt6eG9wd2t2eGVwcGRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxOTA5NzksImV4cCI6MjA5ODc2Njk3OX0.EvzBxG--UmAIDL6dX-cU878tjRRHacazKv9mbEsGgWY";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const PURCHASE_ENDPOINT =
"https://dohxtukzxopwkvxeppdl.supabase.co/functions/v1/purchase-social-account";

/*========================
GLOBAL VARIABLES
=========================*/

let session = null;
let jwt = null;
let currentUser = null;

let products = [];
let filteredProducts = [];
let selectedProduct = null;

/*========================
DOM ELEMENTS
=========================*/

const loader = document.getElementById("pageLoader");

const productsGrid = document.getElementById("productsGrid");

const loadingCards = document.getElementById("loadingCards");

const emptyState = document.getElementById("emptyState");

const resultCount = document.getElementById("resultCount");

const searchInput = document.getElementById("searchInput");

const platformFilter = document.getElementById("platformFilter");

const countryFilter = document.getElementById("countryFilter");

const refreshBtn = document.getElementById("refreshBtn");

const purchaseModal = document.getElementById("purchaseModal");

const successModal = document.getElementById("successModal");

const confirmPurchaseBtn = document.getElementById("confirmPurchaseBtn");

const closePurchaseModal = document.getElementById("closePurchaseModal");

const closeSuccessModal = document.getElementById("closeSuccessModal");

const toast = document.getElementById("toast");

const toastMessage = document.getElementById("toastMessage");

/*========================
INITIALIZE
=========================*/

document.addEventListener("DOMContentLoaded", async () => {

    try {

        showLoader();

        await verifySession();

        await loadMarketplace();

        await loadCountries();

        hideLoader();

    } catch (error) {

        console.error(error);

        hideLoader();

        showToast(error.message || "Unable to load marketplace.");

    }

});

/*========================
VERIFY USER SESSION
=========================*/

async function verifySession() {

    const { data, error } =
    await supabase.auth.getSession();

    if (error) {

        window.location.href = "login.html";

        throw new Error(error.message);

    }

    if (!data.session) {

        window.location.href = "login.html";

        throw new Error("Login required.");

    }

    session = data.session;

    jwt = session.access_token;

    currentUser = session.user;

}

/*========================
LOAD MARKETPLACE
=========================*/

async function loadMarketplace() {

    showLoadingCards();

    const { data, error } = await supabase

    .from("available_products")

    .select("*")

    .order("name", { ascending: true });

    hideLoadingCards();

    if (error) {

        throw new Error(error.message);

    }

    products = data || [];

    filteredProducts = [...products];

    renderProducts();

}

/*========================
LOAD COUNTRIES
=========================*/

async function loadCountries() {

    const { data, error } = await supabase

    .from("available_countries")

    .select("*")

    .order("country");

    if (error) return;

    countryFilter.innerHTML =
    `<option value="all">All Countries</option>`;

    data.forEach(country => {

        countryFilter.innerHTML +=
        `<option value="${country.country}">
            ${country.country}
        </option>`;

    });

}

/*========================
LOADER
=========================*/

function showLoader() {

    if(loader)
    loader.style.display = "flex";

}

function hideLoader() {

    if(loader)
    loader.style.display = "none";

}

/*========================
LOADING GRID
=========================*/

function showLoadingCards() {

    if(loadingCards)
        loadingCards.classList.remove("hidden");

    if(productsGrid)
        productsGrid.classList.add("hidden");

}

function hideLoadingCards() {

    if(loadingCards)
        loadingCards.classList.add("hidden");

    if(productsGrid)
        productsGrid.classList.remove("hidden");

}

/*========================
TOAST
=========================*/

function showToast(message){

    if(!toast || !toastMessage) return;

    toastMessage.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    },3000);

}
/*==================================================
SOCIALELITE
social-accounts.js
PART 2
==================================================*/

/*========================
RENDER PRODUCTS
=========================*/

function renderProducts() {

    if (!productsGrid) return;

    productsGrid.innerHTML = "";

    if (filteredProducts.length === 0) {

        productsGrid.classList.add("hidden");

        if (emptyState)
            emptyState.classList.remove("hidden");

        if (resultCount)
            resultCount.textContent = "0 Products Found";

        return;
    }

    productsGrid.classList.remove("hidden");

    if (emptyState)
        emptyState.classList.add("hidden");

    if (resultCount)
        resultCount.textContent =
            `${filteredProducts.length} Product${filteredProducts.length === 1 ? "" : "s"} Found`;

    filteredProducts.forEach(product => {

        const stock = Number(product.stock || 0);

        const available = stock > 0;

        const card = document.createElement("div");

        card.className = "product-card fade-in";

        card.innerHTML = `

<div class="product-top">

<div class="platform-badge">

<i class="fa-solid fa-globe"></i>

${product.platform || "Unknown"}

</div>

<div class="stock-badge ${available ? "" : "out"}">

${available ? `${stock} In Stock` : "Out Of Stock"}

</div>

</div>

<h2 class="product-name">

${product.name}

</h2>

<p class="product-description">

${product.description || "No description available."}

</p>

<div class="product-details">

<div class="detail-box">

<span>Country</span>

<strong>${product.country || "Global"}</strong>

</div>

<div class="detail-box">

<span>Category</span>

<strong>${product.category || "-"}</strong>

</div>

</div>

<div class="price-row">

<div class="price-label">

Price

</div>

<div class="product-price">

₦${Number(product.price).toLocaleString()}

</div>

</div>

<button
class="buy-btn"
data-id="${product.id}"
${available ? "" : "disabled"}>

${available ? "Purchase" : "Out Of Stock"}

</button>

`;

        productsGrid.appendChild(card);

    });

    attachBuyButtons();

}

/*========================
BUY BUTTONS
=========================*/

function attachBuyButtons() {

    const buttons =
        document.querySelectorAll(".buy-btn");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const id = button.dataset.id;

            selectedProduct =
                products.find(item => item.id === id);

            if (!selectedProduct) {

                showToast("Product not found.");

                return;

            }

            openPurchaseModal(selectedProduct);

        });

    });

}

/*========================
OPEN PURCHASE MODAL
=========================*/

function openPurchaseModal(product) {

    document.getElementById("modalName").textContent =
        product.name;

    document.getElementById("modalPlatform").textContent =
        product.platform || "-";

    document.getElementById("modalCountry").textContent =
        product.country || "Global";

    document.getElementById("modalPrice").textContent =
        `₦${Number(product.price).toLocaleString()}`;

    purchaseModal.classList.remove("hidden");

}

/*========================
CLOSE PURCHASE MODAL
=========================*/

if (closePurchaseModal) {

    closePurchaseModal.addEventListener("click", () => {

        purchaseModal.classList.add("hidden");

        selectedProduct = null;

    });

}

/*========================
SEARCH
=========================*/

if (searchInput) {

    searchInput.addEventListener("input", filterProducts);

}

/*========================
PLATFORM FILTER
=========================*/

if (platformFilter) {

    platformFilter.addEventListener("change", filterProducts);

}

/*========================
COUNTRY FILTER
=========================*/

if (countryFilter) {

    countryFilter.addEventListener("change", filterProducts);

}

/*========================
FILTER PRODUCTS
=========================*/

function filterProducts() {

    const keyword =
        searchInput.value.toLowerCase().trim();

    const platform =
        platformFilter.value;

    const country =
        countryFilter.value;

    filteredProducts = products.filter(product => {

        const matchSearch =

            (product.name || "")
            .toLowerCase()
            .includes(keyword)

            ||

            (product.description || "")
            .toLowerCase()
            .includes(keyword)

            ||

            (product.platform || "")
            .toLowerCase()
            .includes(keyword);

        const matchPlatform =

            platform === "all" ||

            product.platform === platform;

        const matchCountry =

            country === "all" ||

            product.country === country;

        return (
            matchSearch &&
            matchPlatform &&
            matchCountry
        );

    });

    renderProducts();

}

/*========================
REFRESH BUTTON
=========================*/

if (refreshBtn) {

    refreshBtn.addEventListener("click", async () => {

        try {

            showLoader();

            await loadMarketplace();

            await loadCountries();

            hideLoader();

            showToast("Marketplace updated.");

        } catch (error) {

            hideLoader();

            console.error(error);

            showToast(error.message);

        }

    });

}
/*==================================================
SOCIALELITE
social-accounts.js
PART 3 (FINAL)
==================================================*/

/*========================
PURCHASE ACCOUNT
=========================*/

if (confirmPurchaseBtn) {

    confirmPurchaseBtn.addEventListener("click", purchaseAccount);

}

async function purchaseAccount() {

    if (!selectedProduct) {

        showToast("Please select a product.");

        return;

    }

    try {

        confirmPurchaseBtn.disabled = true;

        confirmPurchaseBtn.innerHTML =
            `<i class="fa-solid fa-spinner fa-spin"></i> Processing...`;

        const response = await fetch(PURCHASE_ENDPOINT, {

            method: "POST",

            headers: {

                "Content-Type": "application/json",

                "Authorization": `Bearer ${jwt}`

            },

            body: JSON.stringify({

                product_id: selectedProduct.id

            })

        });

        const result = await response.json();

        if (!response.ok || !result.success) {

            throw new Error(

                result.message ||

                "Purchase failed."

            );

        }

        purchaseModal.classList.add("hidden");

        showCredentials(result.data.credentials);

        showToast("Purchase successful.");

        await loadMarketplace();

    } catch (error) {

        console.error(error);

        showToast(error.message);

    } finally {

        confirmPurchaseBtn.disabled = false;

        confirmPurchaseBtn.innerHTML = "Purchase Now";

    }

}

/*========================
SHOW CREDENTIALS
=========================*/

function showCredentials(credentials) {

    document.getElementById("credUsername").value =
        credentials.username || "";

    document.getElementById("credPassword").value =
        credentials.password || "";

    document.getElementById("credRecoveryEmail").value =
        credentials.recovery_email || "";

    document.getElementById("credRecoveryPassword").value =
        credentials.recovery_password || "";

    document.getElementById("credNotes").value =
        credentials.notes || "";

    successModal.classList.remove("hidden");

}

/*========================
CLOSE SUCCESS MODAL
=========================*/

if (closeSuccessModal) {

    closeSuccessModal.addEventListener("click", () => {

        successModal.classList.add("hidden");

    });

}

/*========================
COPY BUTTONS
=========================*/

document.querySelectorAll(".copyBtn").forEach(button => {

    button.addEventListener("click", async () => {

        try {

            const input = document.getElementById(

                button.dataset.copy

            );

            await navigator.clipboard.writeText(

                input.value

            );

            showToast("Copied successfully.");

        } catch {

            showToast("Copy failed.");

        }

    });

});

/*========================
CLICK OUTSIDE MODAL
=========================*/

window.addEventListener("click", (event) => {

    if (event.target === purchaseModal) {

        purchaseModal.classList.add("hidden");

    }

    if (event.target === successModal) {

        successModal.classList.add("hidden");

    }

});

/*========================
ESC CLOSE
=========================*/

document.addEventListener("keydown", (event) => {

    if (event.key !== "Escape") return;

    purchaseModal.classList.add("hidden");

    successModal.classList.add("hidden");

});

/*========================
SESSION MONITOR
=========================*/

supabase.auth.onAuthStateChange(async (event) => {

    if (event === "SIGNED_OUT") {

        window.location.href = "login.html";

        return;

    }

    if (event === "TOKEN_REFRESHED") {

        const {

            data

        } = await supabase.auth.getSession();

        jwt = data.session?.access_token;

    }

});

/*========================
NETWORK STATUS
=========================*/

window.addEventListener("offline", () => {

    showToast("No internet connection.");

});

window.addEventListener("online", () => {

    showToast("Connection restored.");

});

/*========================
AUTO REFRESH
=========================*/

setInterval(async () => {

    if (document.hidden) return;

    try {

        await loadMarketplace();

    } catch (error) {

        console.error(error);

    }

}, 60000);

/*========================
END OF FILE
=========================*/
