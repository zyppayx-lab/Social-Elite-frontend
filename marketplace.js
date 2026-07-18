/* ==========================================
SOCIALELITE MARKETPLACE
marketplace.js
PART 1 OF 4
========================================== */

"use strict";

/* ==========================================
SUPABASE
========================================== */

const SUPABASE_URL =
"https://dohxtukzxopwkvxeppdl.supabase.co";

const SUPABASE_ANON_KEY =
"sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";

const supabase =
window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

/* ==========================================
EDGE FUNCTIONS
========================================== */

const PURCHASE_SOCIAL_ENDPOINT =
`${SUPABASE_URL}/functions/v1/purchase-social-account`;

const GET_SMSGIG_SERVICES_ENDPOINT =
`${SUPABASE_URL}/functions/v1/get-smsgig-services`;

const PURCHASE_NUMBER_ENDPOINT =
`${SUPABASE_URL}/functions/v1/purchase-number`;

const GET_SMS_ENDPOINT =
`${SUPABASE_URL}/functions/v1/get-sms`;

/* ==========================================
ELEMENTS
========================================== */

const socialProducts =
document.getElementById("socialProducts");

const socialLoading =
document.getElementById("socialLoading");

const socialEmpty =
document.getElementById("socialEmpty");

const numberServices =
document.getElementById("numberServices");

const numbersLoading =
document.getElementById("numbersLoading");

const numbersEmpty =
document.getElementById("numbersEmpty");

const platformFilter =
document.getElementById("platformFilter");

const countryFilter =
document.getElementById("countryFilter");

const categoryFilter =
document.getElementById("categoryFilter");

const priceFilter =
document.getElementById("priceFilter");

const socialSearch =
document.getElementById("socialSearch");

const numberSearch =
document.getElementById("numberSearch");

const walletBalance =
document.getElementById("walletBalance");

/* ==========================================
GLOBAL VARIABLES
========================================== */

let allProducts = [];
let allCountries = [];
let allCategories = [];
let allServices = [];
let pollingInterval = null;

/* ==========================================
AUTH SESSION
========================================== */

async function getAccessToken(){

    const {
        data:{session}
    } = await supabase.auth.getSession();

    if(!session){

        window.location.href="login.html";

        return null;

    }

    return session.access_token;

}

/* ==========================================
START APP
========================================== */

document.addEventListener("DOMContentLoaded",async()=>{

    await Promise.all([

        loadCountries(),

        loadCategories()

    ]);

    await Promise.all([

        loadProducts(),

        loadSmsGigServices()

    ]);

    registerEvents();

});

/* ==========================================
LOAD COUNTRIES
========================================== */

async function loadCountries(){

    try{

        const {data,error} =
        await supabase
        .from("available_countries")
        .select("country")
        .order("country");

        if(error) throw error;

        allCountries = data || [];

        countryFilter.innerHTML =
        `<option value="">Country</option>`;

        allCountries.forEach(country=>{

            countryFilter.innerHTML += `
                <option value="${country.country}">
                    ${country.country}
                </option>
            `;

        });

    }

    catch(error){

        console.error(error);

    }

}

/* ==========================================
LOAD CATEGORIES
========================================== */

async function loadCategories(){

    try{

        const {data,error} =
        await supabase
        .from("categories")
        .select("platform,name")
        .order("platform");

        if(error) throw error;

        allCategories = data || [];

        platformFilter.innerHTML =
        `<option value="">Platform</option>`;

        categoryFilter.innerHTML =
        `<option value="">Category</option>`;

        [...new Set(
            allCategories.map(c=>c.platform)
        )].forEach(platform=>{

            platformFilter.innerHTML += `
                <option value="${platform}">
                    ${platform}
                </option>
            `;

        });

        allCategories.forEach(category=>{

            categoryFilter.innerHTML += `
                <option value="${category.name}">
                    ${category.name}
                </option>
            `;

        });

    }

    catch(error){

        console.error(error);

    }

}

/* ==========================================
LOAD SOCIAL PRODUCTS
========================================== */

async function loadProducts(){

    socialLoading.style.display="flex";
    socialProducts.style.display="none";
    socialEmpty.style.display="none";

    try{

        const {data,error} =
        await supabase
        .from("available_products")
        .select("*")
        .order("price",{
            ascending:true
        });

        if(error) throw error;

        allProducts = data || [];

        renderProducts(allProducts);

    }

    catch(error){

        console.error(error);

        socialProducts.style.display="none";
        socialEmpty.style.display="flex";

    }

    finally{

        socialLoading.style.display="none";

    }

}

/* ==========================================
LOAD SMSGIG SERVICES
========================================== */

async function loadSmsGigServices(){

    numbersLoading.style.display="flex";
    numberServices.style.display="none";
    numbersEmpty.style.display="none";

    try{

        const token =
        await getAccessToken();

        if(!token) return;

        const response =
        await fetch(
            GET_SMSGIG_SERVICES_ENDPOINT,
            {
                headers:{
                    Authorization:`Bearer ${token}`
                }
            }
        );

        const result =
        await response.json();

        if(!response.ok){

            throw new Error(
                result.message ||
                "Unable to load services."
            );

        }

        allServices =
        result.data || [];

        renderSmsServices(allServices);

    }

    catch(error){

        console.error(error);

        numberServices.style.display="none";
        numbersEmpty.style.display="flex";

    }

    finally{

        numbersLoading.style.display="none";

    }

}
/* ==========================================
LOAD SMSGIG SERVICES
========================================== */

async function loadSmsGigServices() {

    numbersLoading.style.display = "flex";
    numberServices.style.display = "none";
    numbersEmpty.style.display = "none";

    try {

        const {
            data: { session }
        } = await supabase.auth.getSession();

        if (!session) {
            throw new Error("No active session");
        }

        const response = await fetch(
            GET_SMSGIG_SERVICES_ENDPOINT,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const result = await response.json();

        numbersLoading.style.display = "none";

        if (!response.ok) {
            throw new Error(result.message || "Unable to load services");
        }

        allServices = result.data || [];

        renderSmsServices(allServices);

    } catch (err) {

        console.error(err);

        numbersLoading.style.display = "none";
        numbersEmpty.style.display = "flex";

    }

}

/* ==========================================
RENDER SOCIAL PRODUCTS
========================================== */

function renderProducts(products) {

    socialProducts.innerHTML = "";

    if (!products || products.length === 0) {

        socialProducts.style.display = "none";
        socialEmpty.style.display = "flex";
        return;

    }

    socialProducts.style.display = "grid";
    socialEmpty.style.display = "none";

    products.forEach(product => {

        socialProducts.insertAdjacentHTML(
            "beforeend",
            `
            <div class="market-card">

                <div class="market-card-top">

                    <div class="platform">

                        <img
                            src="assets/platforms/${(product.platform || "default")
                                .toLowerCase()
                                .replace("/", "-")}.png"
                            onerror="this.src='assets/platforms/default.png'"
                        >

                        <div>

                            <h3>${product.name}</h3>

                            <span class="category">
                                ${product.platform} • ${product.category}
                            </span>

                        </div>

                    </div>

                    <span class="country">
                        ${product.country}
                    </span>

                </div>

                <div class="market-card-body">

                    <p class="description">
                        ${product.description || ""}
                    </p>

                    <h2 class="price">
                        ₦${Number(product.price).toLocaleString()}
                    </h2>

                    <span class="stock">
                        ${product.stock} Available
                    </span>

                    <button
                        class="buy-btn"
                        onclick="buySocialAccount('${product.id}', this)">
                        Buy Now
                    </button>

                </div>

            </div>
            `
        );

    });

}
/* ==========================================
RENDER SMS SERVICES
========================================== */

function renderSmsServices(services) {

    numberServices.innerHTML = "";

    if (!services || services.length === 0) {

        numberServices.style.display = "none";
        numbersEmpty.style.display = "flex";
        return;

    }

    numberServices.style.display = "grid";
    numbersEmpty.style.display = "none";

    services.forEach(service => {

        numberServices.insertAdjacentHTML(
            "beforeend",
            `
            <div class="market-card">

                <div class="market-card-top">

                    <div>

                        <h3>${service.name}</h3>

                        <span class="category">
                            Virtual Number
                        </span>

                    </div>

                    <span class="stock">
                        ${service.stock}
                    </span>

                </div>

                <div class="market-card-body">

                    <p class="description">
                        TTL: ${service.ttl}s
                    </p>

                    <h2 class="price">
                        ₦${Number(service.selling_price).toLocaleString()}
                    </h2>

                    <button
                        class="buy-btn"
                        onclick="purchaseNumber('${service.service_code}', this)">

                        Rent Number

                    </button>

                </div>

            </div>
            `
        );

    });

}

/* ==========================================
BUY SOCIAL ACCOUNT
========================================== */

async function buySocialAccount(productId, button) {

    try {

        const {
            data: { session }
        } = await supabase.auth.getSession();

        if (!session) {

            alert("Please login first.");
            return;

        }

        button.disabled = true;
        button.textContent = "Processing...";

        const response = await fetch(
            PURCHASE_SOCIAL_ENDPOINT,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    product_id: productId
                })
            }
        );

        const result = await response.json();

        button.disabled = false;
        button.textContent = "Buy Now";

        if (!response.ok) {

            alert(result.message || "Purchase failed.");
            return;

        }

        document.getElementById("credentialUsername").value =
            result.username || "";

        document.getElementById("credentialPassword").value =
            result.password || "";

        document.getElementById("credentialRecoveryEmail").value =
            result.recovery_email || "";

        document.getElementById("credentialRecoveryPassword").value =
            result.recovery_password || "";

        document.getElementById("credentialNotes").value =
            result.notes || "";

        document.getElementById("credentialModal").style.display = "flex";

        await loadProducts();

    } catch (err) {

        console.error(err);

        if (button) {

            button.disabled = false;
            button.textContent = "Buy Now";

        }

        alert("Unable to complete purchase.");

    }

}
/* ==========================================
PURCHASE USA NUMBER
========================================== */

async function purchaseNumber(serviceCode, button) {

    try {

        const {
            data: { session }
        } = await supabase.auth.getSession();

        if (!session) {

            alert("Please login first.");
            return;

        }

        button.disabled = true;
        button.textContent = "Processing...";

        const response = await fetch(
            PURCHASE_NUMBER_ENDPOINT,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    service_code: serviceCode
                })
            }
        );

        const result = await response.json();

        button.disabled = false;
        button.textContent = "Rent Number";

        if (!response.ok) {

            alert(result.message || "Unable to rent number.");
            return;

        }

        document.getElementById("smsNumber").value =
            result.order.phone_number || "";

        document.getElementById("smsService").value =
            result.order.service_name || "";

        document.getElementById("smsStatus").value =
            result.order.status || "active";

        document.getElementById("smsCode").value = "";

        document.getElementById("smsMessage").value = "";

        document.getElementById("smsModal").style.display = "flex";

        startSmsPolling(result.order.order_id);

    } catch (error) {

        console.error(error);

        if (button) {

            button.disabled = false;
            button.textContent = "Rent Number";

        }

        alert("Something went wrong.");

    }

}

/* ==========================================
GET SMS
========================================== */

async function getSms(orderId) {

    const {
        data: { session }
    } = await supabase.auth.getSession();

    if (!session) return null;

    const response = await fetch(
        GET_SMS_ENDPOINT,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                order_id: orderId
            })
        }
    );

    return await response.json();

}

/* ==========================================
START SMS POLLING
========================================== */

function startSmsPolling(orderId) {

    if (pollingInterval) {

        clearInterval(pollingInterval);

    }

    pollingInterval = setInterval(async () => {

        const result = await getSms(orderId);

        if (!result) return;

        if (result.status) {

            document.getElementById("smsStatus").value =
                result.status;

        }

        if (result.code) {

            document.getElementById("smsCode").value =
                result.code;

        }

        if (result.message) {

            document.getElementById("smsMessage").value =
                result.message;

        }

        if (result.code) {

            clearInterval(pollingInterval);

        }

    }, 5000);

}

/* ==========================================
REGISTER EVENTS
========================================== */

function registerEvents() {

    socialSearch.addEventListener("input", filterProducts);

    platformFilter.addEventListener("change", filterProducts);

    countryFilter.addEventListener("change", filterProducts);

    categoryFilter.addEventListener("change", filterProducts);

    priceFilter.addEventListener("change", filterProducts);

    numberSearch.addEventListener("input", () => {

        const keyword = numberSearch.value.toLowerCase();

        renderSmsServices(

            allServices.filter(service =>
                service.name.toLowerCase().includes(keyword)
            )

        );

    });

}

/* ==========================================
WINDOW EVENTS
========================================== */

window.addEventListener("click", (event) => {

    const credentialModal =
        document.getElementById("credentialModal");

    const smsModal =
        document.getElementById("smsModal");

    if (event.target === credentialModal) {

        credentialModal.style.display = "none";

        loadProducts();

    }

    if (event.target === smsModal) {

        smsModal.style.display = "none";

        clearInterval(pollingInterval);

    }

});

document
.getElementById("closeCredentialModal")
.addEventListener("click", () => {

    document.getElementById("credentialModal").style.display = "none";

    loadProducts();

});

document
.getElementById("closeSmsModal")
.addEventListener("click", () => {

    document.getElementById("smsModal").style.display = "none";

    clearInterval(pollingInterval);

});

/* ==========================================
END OF marketplace.js
========================================== */
