/* ===========================================
SOCIALELITE MARKETPLACE
marketplace.js
PART 1
=========================================== */

"use strict";

/* ==========================
SUPABASE
========================== */

const SUPABASE_URL = "https://dohxtukzxopwkvxeppdl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvaHh0dWt6eG9wd2t2eGVwcGRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxOTA5NzksImV4cCI6MjA5ODc2Njk3OX0.EvzBxG--UmAIDL6dX-cU878tjRRHacazKv9mbEsGgWY";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

/* ==========================
ELEMENTS
========================== */

const socialGrid = document.getElementById("socialProducts");
const socialLoading = document.getElementById("socialLoading");
const socialEmpty = document.getElementById("socialEmpty");

const numberGrid = document.getElementById("numberServices");
const numbersLoading = document.getElementById("numbersLoading");
const numbersEmpty = document.getElementById("numbersEmpty");

const socialSearch = document.getElementById("socialSearch");
const numberSearch = document.getElementById("numberSearch");

const platformFilter = document.getElementById("platformFilter");
const countryFilter = document.getElementById("countryFilter");
const categoryFilter = document.getElementById("categoryFilter");
const priceFilter = document.getElementById("priceFilter");

let socialProducts = [];
let smsServices = [];
let session = null;

/* ==========================
INIT
========================== */

document.addEventListener("DOMContentLoaded", async () => {

    const {
        data
    } = await supabase.auth.getSession();

    session = data.session;

    if (!session) {

        location.href = "login.html";
        return;

    }

    await loadCountries();

    await loadPlatforms();

    await loadCategories();

    await loadProducts();

    await loadSmsServices();

});
/* ==========================
LOAD COUNTRIES
========================== */

async function loadCountries() {

    const { data, error } = await supabase
        .from("available_countries")
        .select("country")
        .order("country");

    if (error) return;

    countryFilter.innerHTML =
        `<option value="">All Countries</option>`;

    data.forEach(item => {

        countryFilter.innerHTML +=
        `<option value="${item.country}">
            ${item.country}
        </option>`;

    });

}

/* ==========================
LOAD PLATFORMS
========================== */

async function loadPlatforms() {

    const { data, error } = await supabase
        .from("categories")
        .select("platform");

    if (error) return;

    platformFilter.innerHTML =
        `<option value="">All Platforms</option>`;

    [...new Set(data.map(item => item.platform))]
        .sort()
        .forEach(platform => {

            platformFilter.innerHTML +=
            `<option value="${platform}">
                ${platform}
            </option>`;

        });

}

/* ==========================
LOAD CATEGORIES
========================== */

async function loadCategories() {

    const { data, error } = await supabase
        .from("categories")
        .select("name");

    if (error) return;

    categoryFilter.innerHTML =
        `<option value="">All Categories</option>`;

    [...new Set(data.map(item => item.name))]
        .sort()
        .forEach(category => {

            categoryFilter.innerHTML +=
            `<option value="${category}">
                ${category}
            </option>`;

        });

}

/* ==========================
LOAD PRODUCTS
========================== */

async function loadProducts() {

    socialLoading.style.display = "flex";

    const { data, error } = await supabase
        .from("available_products")
        .select("*")
        .order("price");

    socialLoading.style.display = "none";

    if (error) {

        socialEmpty.style.display = "flex";
        return;

    }

    socialProducts = data;

    renderProducts(data);

}
/* ==========================
RENDER PRODUCTS
========================== */

function renderProducts(products) {

    socialGrid.innerHTML = "";

    if (!products.length) {

        socialEmpty.style.display = "flex";
        return;

    }

    socialEmpty.style.display = "none";

    products.forEach(product => {

        socialGrid.innerHTML += `

        <div class="market-card">

            <div class="market-card-top">

                <div class="platform">

                    <img src="assets/icons/${product.platform.toLowerCase().replace("/", "-")}.png">

                    <div>

                        <h3>${product.name}</h3>

                        <span class="category">
                            ${product.category}
                        </span>

                    </div>

                </div>

                <span class="country">
                    ${product.country}
                </span>

            </div>

            <div class="market-card-body">

                <p class="description">
                    ${product.description}
                </p>

                <div class="price">
                    ₦${Number(product.price).toLocaleString()}
                </div>

                <div class="stock">
                    ${product.stock} Available
                </div>

                <button
                    class="buy-btn"
                    onclick="buyProduct('${product.id}')">

                    Buy Now

                </button>

            </div>

        </div>

        `;

    });

}

/* ==========================
FILTERS
========================== */

platformFilter.onchange = filterProducts;
countryFilter.onchange = filterProducts;
categoryFilter.onchange = filterProducts;
priceFilter.onchange = filterProducts;
socialSearch.oninput = filterProducts;

function filterProducts() {

    let results = [...socialProducts];

    if (platformFilter.value) {

        results = results.filter(item =>
            item.platform === platformFilter.value
        );

    }

    if (countryFilter.value) {

        results = results.filter(item =>
            item.country === countryFilter.value
        );

    }

    if (categoryFilter.value) {

        results = results.filter(item =>
            item.category === categoryFilter.value
        );

    }

    if (socialSearch.value) {

        const keyword = socialSearch.value.toLowerCase();

        results = results.filter(item =>

            item.name.toLowerCase().includes(keyword) ||

            item.platform.toLowerCase().includes(keyword) ||

            item.category.toLowerCase().includes(keyword)

        );

    }

    if (priceFilter.value === "low") {

        results.sort((a, b) => a.price - b.price);

    }

    if (priceFilter.value === "high") {

        results.sort((a, b) => b.price - a.price);

    }

    renderProducts(results);

}
/* ==========================
BUY SOCIAL ACCOUNT
========================== */

async function buyProduct(productId) {

    if (!confirm("Purchase this account?")) return;

    try {

        const {
            data: {
                session
            }
        } = await supabase.auth.getSession();

        const response = await fetch(

            `${SUPABASE_URL}/functions/v1/purchase-social-account`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json",

                    "Authorization": `Bearer ${session.access_token}`

                },

                body: JSON.stringify({

                    product_id: productId

                })

            }

        );

        const result = await response.json();

        if (!response.ok) {

            alert(result.message || "Purchase failed.");

            return;

        }

        /* ======================
        DISPLAY CREDENTIALS
        ====================== */

        document.getElementById("credentialUsername").value =
            result.username || "";

        document.getElementById("credentialPassword").value =
            result.password || "";

        document.getElementById("credentialRecoveryEmail").value =
            result.recovery_email || "";

        document.getElementById("credentialRecoveryPassword").value =
            result.recovery_password || "";

        document.getElementById("credentialNotes").value =
            result.notes || "No notes.";

        document.getElementById("credentialModal").style.display =
            "flex";

        /* Remove sold product */

        await loadProducts();

    }

    catch (error) {

        console.error(error);

        alert("Something went wrong.");

    }

}

/* ==========================
COPY TO CLIPBOARD
========================== */

document.querySelectorAll(".copy-btn")

.forEach(button => {

    button.addEventListener("click", () => {

        const input = document.getElementById(

            button.dataset.copy

        );

        navigator.clipboard.writeText(input.value);

        button.textContent = "✓";

        setTimeout(() => {

            button.textContent = "📋";

        }, 1500);

    });

});

/* ==========================
CLOSE CREDENTIAL MODAL
========================== */

document

.getElementById("closeCredentialModal")

.addEventListener("click", () => {

    document.getElementById("credentialModal")

    .style.display = "none";

});
```
/* ==========================
LOAD SMS SERVICES
========================== */

async function loadSmsServices() {

    numbersLoading.style.display = "flex";

    try {

        const {
            data: {
                session
            }
        } = await supabase.auth.getSession();

        const response = await fetch(

            `${SUPABASE_URL}/functions/v1/get-sms-service`,

            {

                headers: {

                    "Authorization": `Bearer ${session.access_token}`

                }

            }

        );

        const result = await response.json();

        numbersLoading.style.display = "none";

        if (!response.ok) {

            numbersEmpty.style.display = "flex";

            return;

        }

        smsServices = result.data;

        renderSmsServices(result.data);

    }

    catch (error) {

        console.error(error);

        numbersLoading.style.display = "none";

        numbersEmpty.style.display = "flex";

    }

}

/* ==========================
RENDER SMS SERVICES
========================== */

function renderSmsServices(services) {

    numberGrid.innerHTML = "";

    if (!services.length) {

        numbersEmpty.style.display = "flex";

        return;

    }

    numbersEmpty.style.display = "none";

    services.forEach(service => {

        numberGrid.innerHTML += `

        <div class="market-card">

            <div class="market-card-top">

                <div>

                    <h3>${service.name}</h3>

                    <span class="category">

                        USA Number

                    </span>

                </div>

                <span class="country">

                    USA

                </span>

            </div>

            <div class="market-card-body">

                <p class="description">

                    SMS Verification Service

                </p>

                <div class="price">

                    ₦${Number(service.selling_price).toLocaleString()}

                </div>

                <div class="stock">

                    ${service.stock} Available

                </div>

                <button

                    class="buy-btn"

                    onclick="buyNumber('${service.service_code}')">

                    Rent Number

                </button>

            </div>

        </div>

        `;

    });

}

/* ==========================
SEARCH SERVICES
========================== */

numberSearch.addEventListener("input", () => {

    const keyword = numberSearch.value.toLowerCase();

    const filtered = smsServices.filter(service =>

        service.name.toLowerCase().includes(keyword)

    );

    renderSmsServices(filtered);

});
/* ==========================
BUY USA NUMBER
========================== */

async function buyNumber(serviceCode) {

    if (!confirm("Rent this USA virtual number?")) return;

    try {

        const {
            data: {
                session
            }
        } = await supabase.auth.getSession();

        const response = await fetch(

            `${SUPABASE_URL}/functions/v1/purchase-number`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json",

                    "Authorization": `Bearer ${session.access_token}`

                },

                body: JSON.stringify({

                    service_code: serviceCode

                })

            }

        );

        const result = await response.json();

        if (!response.ok) {

            alert(result.message || "Unable to rent number.");

            return;

        }

        document.getElementById("smsNumber").value =
            result.phone_number;

        document.getElementById("smsService").value =
            result.service_code;

        document.getElementById("smsStatus").value =
            result.provider_status;

        document.getElementById("smsCode").value =
            "";

        document.getElementById("smsMessage").value =
            "Waiting for OTP...";

        document.getElementById("smsModal").style.display =
            "flex";

        pollOtp(result.activation_id);

    }

    catch (error) {

        console.error(error);

        alert("Something went wrong.");

    }

}

/* ==========================
POLL OTP
========================== */

let otpPolling;

async function pollOtp(activationId) {

    clearInterval(otpPolling);

    otpPolling = setInterval(async () => {

        try {

            const {
                data: {
                    session
                }
            } = await supabase.auth.getSession();

            const response = await fetch(

                `${SUPABASE_URL}/functions/v1/check-sms-status?activation_id=${activationId}`,

                {

                    headers: {

                        "Authorization": `Bearer ${session.access_token}`

                    }

                }

            );

            const result = await response.json();

            if (!response.ok) return;

            document.getElementById("smsStatus").value =
                result.provider_status;

            if (result.otp_code) {

                document.getElementById("smsCode").value =
                    result.otp_code;

                document.getElementById("smsMessage").value =
                    result.otp_message;

                clearInterval(otpPolling);

            }

        }

        catch (error) {

            console.error(error);

        }

    }, 3000);

}

/* ==========================
CLOSE SMS MODAL
========================== */

document

.getElementById("closeSmsModal")

.addEventListener("click", () => {

    clearInterval(otpPolling);

    document.getElementById("smsModal")

    .style.display = "none";

});
/* ==========================
CLOSE MODALS WHEN CLICKING
OUTSIDE
========================== */

window.addEventListener("click", (event) => {

    const credentialModal =
        document.getElementById("credentialModal");

    const smsModal =
        document.getElementById("smsModal");

    if (event.target === credentialModal) {

        credentialModal.style.display = "none";

    }

    if (event.target === smsModal) {

        clearInterval(otpPolling);

        smsModal.style.display = "none";

    }

});

/* ==========================
AUTO REFRESH MARKETPLACE
========================== */

setInterval(() => {

    loadProducts();

}, 60000);

/* ==========================
END OF marketplace.js
========================== */
