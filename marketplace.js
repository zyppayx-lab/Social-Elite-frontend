/* ==========================================
SOCIALELITE MARKETPLACE
marketplace.js
PART 1
========================================== */

"use strict";

/* ==========================================
SUPABASE
========================================== */

const SUPABASE_URL = "https://dohxtukzxopwkvxeppdl.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";

const supabase = window.supabase.createClient(
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

/* ==========================================
GLOBAL VARIABLES
========================================== */

let allProducts = [];

let allCountries = [];

let allCategories = [];

let allServices = [];

let pollingInterval = null;

/* ==========================================
START APP
========================================== */

document.addEventListener("DOMContentLoaded", async () => {

    await loadCountries();

    await loadCategories();

    await loadProducts();

    await loadSmsGigServices();

    registerEvents();

});
/* ==========================================
LOAD COUNTRIES
========================================== */

async function loadCountries() {

    const { data, error } = await supabase
        .from("available_countries")
        .select("country")
        .order("country");

    if (error) {

        console.error(error);

        return;

    }

    allCountries = data;

    countryFilter.innerHTML = `
        <option value="">Country</option>
    `;

    data.forEach(country => {

        countryFilter.innerHTML += `
            <option value="${country.country}">
                ${country.country}
            </option>
        `;

    });

}

/* ==========================================
LOAD CATEGORIES
========================================== */

async function loadCategories() {

    const { data, error } = await supabase
        .from("categories")
        .select("platform,name")
        .order("platform");

    if (error) {

        console.error(error);

        return;

    }

    allCategories = data;

    const platforms =
    [...new Set(data.map(item => item.platform))];

    platformFilter.innerHTML = `
        <option value="">Platform</option>
    `;

    categoryFilter.innerHTML = `
        <option value="">Category</option>
    `;

    platforms.forEach(platform => {

        platformFilter.innerHTML += `
            <option value="${platform}">
                ${platform}
            </option>
        `;

    });

    data.forEach(category => {

        categoryFilter.innerHTML += `
            <option value="${category.name}">
                ${category.name}
            </option>
        `;

    });

}

/* ==========================================
LOAD MARKETPLACE PRODUCTS
========================================== */

async function loadProducts() {

    socialLoading.style.display = "flex";

    socialProducts.style.display = "none";

    socialEmpty.style.display = "none";

    const { data, error } = await supabase
        .from("available_products")
        .select("*")
        .order("price",{ ascending:true });

    socialLoading.style.display = "none";

    if (error) {

        console.error(error);

        socialEmpty.style.display = "flex";

        return;

    }

    allProducts = data;

    renderProducts(allProducts);

}

/* ==========================================
LOAD SMSGIG SERVICES
========================================== */

async function loadSmsGigServices() {

    numbersLoading.style.display = "flex";

    numberServices.style.display = "none";

    numbersEmpty.style.display = "none";

    const session =
    await supabase.auth.getSession();

    const token =
    session.data.session?.access_token;

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

    numbersLoading.style.display = "none";

    if(!response.ok){

        console.error(result);

        numbersEmpty.style.display = "flex";

        return;

    }

    allServices =
    result.data || [];

    renderSmsServices(allServices);

}
/* ==========================================
RENDER SOCIAL PRODUCTS
========================================== */

function renderProducts(products){

    socialProducts.innerHTML = "";

    if(products.length === 0){

        socialProducts.style.display = "none";

        socialEmpty.style.display = "flex";

        return;

    }

    socialProducts.style.display = "grid";

    socialEmpty.style.display = "none";

    products.forEach(product=>{

        socialProducts.innerHTML += `

        <div class="market-card">

            <div class="market-card-top">

                <div class="platform">

                    <img src="assets/platforms/${product.platform.toLowerCase()}.png">

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

                    ${product.description}

                </p>

                <h2 class="price">

                    ₦${Number(product.price).toLocaleString()}

                </h2>

                <span class="stock">

                    ${product.stock} In Stock

                </span>

                <button
                    class="buy-btn"
                    onclick="buySocialAccount('${product.id}')">

                    Buy Now

                </button>

            </div>

        </div>

        `;

    });

}

/* ==========================================
RENDER SMS SERVICES
========================================== */

function renderSmsServices(services){

    numberServices.innerHTML = "";

    if(services.length===0){

        numberServices.style.display="none";

        numbersEmpty.style.display="flex";

        return;

    }

    numberServices.style.display="grid";

    numbersEmpty.style.display="none";

    services.forEach(service=>{

        numberServices.innerHTML += `

        <div class="market-card">

            <div class="market-card-top">

                <div>

                    <h3>${service.name}</h3>

                    <span class="category">

                        USA Virtual Number

                    </span>

                </div>

            </div>

            <div class="market-card-body">

                <p class="description">

                    Instant SMS verification number.

                </p>

                <h2 class="price">

                    ₦${Number(service.price).toLocaleString()}

                </h2>

                <button
                    class="buy-btn"
                    onclick="purchaseNumber('${service.service_code}')">

                    Rent Number

                </button>

            </div>

        </div>

        `;

    });

}
/* ==========================================
BUY SOCIAL ACCOUNT
========================================== */

async function buySocialAccount(productId){

    try{

        const session =
        await supabase.auth.getSession();

        const token =
        session.data.session?.access_token;

        if(!token){

            alert("Please login first.");

            return;

        }

        const button =
        event.target;

        button.disabled = true;

        button.innerHTML = "Processing...";

        const response =
        await fetch(
            PURCHASE_SOCIAL_ENDPOINT,
            {
                method:"POST",

                headers:{
                    "Content-Type":"application/json",
                    "Authorization":`Bearer ${token}`
                },

                body:JSON.stringify({
                    product_id:productId
                })
            }
        );

        const result =
        await response.json();

        button.disabled = false;

        button.innerHTML = "Buy Now";

        if(!response.ok){

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

        document.getElementById("credentialModal").style.display =
        "flex";

    }catch(err){

        console.error(err);

        alert("Unable to complete purchase.");

    }

}

/* ==========================================
CLOSE CREDENTIAL MODAL
========================================== */

document
.getElementById("closeCredentialModal")
.addEventListener("click",async()=>{

    document
    .getElementById("credentialModal")
    .style.display="none";

    await loadProducts();

});

/* ==========================================
COPY BUTTONS
========================================== */

document
.querySelectorAll(".copy-btn")
.forEach(button=>{

    button.addEventListener("click",()=>{

        const input =
        document.getElementById(
            button.dataset.copy
        );

        navigator.clipboard.writeText(
            input.value
        );

        button.innerHTML="✓";

        setTimeout(()=>{

            button.innerHTML="📋";

        },1000);

    });

});
/* ==========================================
PURCHASE USA NUMBER
========================================== */

async function purchaseNumber(serviceCode){

    try{

        const session =
        await supabase.auth.getSession();

        const token =
        session.data.session?.access_token;

        if(!token){

            alert("Please login first.");

            return;

        }

        const response =
        await fetch(
            PURCHASE_NUMBER_ENDPOINT,
            {
                method:"POST",

                headers:{
                    "Authorization":`Bearer ${token}`,
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    service_code:serviceCode

                })

            }
        );

        const result =
        await response.json();

        if(!response.ok){

            alert(result.message || "Unable to rent number.");

            return;

        }

        document.getElementById("smsNumber").value =
        result.phone_number;

        document.getElementById("smsService").value =
        result.service_code;

        document.getElementById("smsStatus").value =
        result.status;

        document.getElementById("smsCode").value = "";

        document.getElementById("smsMessage").value = "";

        document.getElementById("smsModal").style.display =
        "flex";

        startSmsPolling(result.activation_id);

    }

    catch(error){

        console.error(error);

        alert("Something went wrong.");

    }

}

/* ==========================================
GET SMS
========================================== */

async function getSms(activationId){

    const session =
    await supabase.auth.getSession();

    const token =
    session.data.session?.access_token;

    const response =
    await fetch(
        GET_SMS_ENDPOINT,
        {

            method:"POST",

            headers:{

                "Authorization":`Bearer ${token}`,

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                activation_id:activationId

            })

        }
    );

    return await response.json();

}

/* ==========================================
START POLLING
========================================== */

function startSmsPolling(activationId){

    if(pollingInterval){

        clearInterval(pollingInterval);

    }

    pollingInterval = setInterval(async()=>{

        const result =
        await getSms(activationId);

        if(!result) return;

        if(result.status){

            document.getElementById("smsStatus").value =
            result.status;

        }

        if(result.code){

            document.getElementById("smsCode").value =
            result.code;

        }

        if(result.message){

            document.getElementById("smsMessage").value =
            result.message;

        }

        if(result.code){

            clearInterval(pollingInterval);

        }

    },3000);

}

/* ==========================================
CLOSE SMS MODAL
========================================== */

document
.getElementById("closeSmsModal")
.addEventListener("click",()=>{

    document
    .getElementById("smsModal")
    .style.display="none";

    clearInterval(pollingInterval);

});
/* ==========================================
SEARCH & FILTERS
========================================== */

function registerEvents(){

    socialSearch.addEventListener("input",filterProducts);

    platformFilter.addEventListener("change",filterProducts);

    countryFilter.addEventListener("change",filterProducts);

    categoryFilter.addEventListener("change",filterProducts);

    priceFilter.addEventListener("change",filterProducts);

    numberSearch.addEventListener("input",()=>{

        const keyword =
        numberSearch.value.toLowerCase();

        const filtered =
        allServices.filter(service=>

            service.name
            .toLowerCase()
            .includes(keyword)

        );

        renderSmsServices(filtered);

    });

}

/* ==========================================
FILTER PRODUCTS
========================================== */

function filterProducts(){

    let filtered = [...allProducts];

    const keyword =
    socialSearch.value.toLowerCase().trim();

    const platform =
    platformFilter.value;

    const country =
    countryFilter.value;

    const category =
    categoryFilter.value;

    const price =
    priceFilter.value;

    if(keyword){

        filtered = filtered.filter(product=>

            product.name
            .toLowerCase()
            .includes(keyword)

            ||

            product.description
            .toLowerCase()
            .includes(keyword)

        );

    }

    if(platform){

        filtered = filtered.filter(product=>

            product.platform === platform

        );

    }

    if(country){

        filtered = filtered.filter(product=>

            product.country === country

        );

    }

    if(category){

        filtered = filtered.filter(product=>

            product.category === category

        );

    }

    if(price==="low"){

        filtered.sort((a,b)=>

            Number(a.price)-Number(b.price)

        );

    }

    if(price==="high"){

        filtered.sort((a,b)=>

            Number(b.price)-Number(a.price)

        );

    }

    renderProducts(filtered);

}

/* ==========================================
CLICK OUTSIDE MODAL
========================================== */

window.addEventListener("click",(event)=>{

    const credentialModal =
    document.getElementById("credentialModal");

    const smsModal =
    document.getElementById("smsModal");

    if(event.target===credentialModal){

        credentialModal.style.display="none";

        loadProducts();

    }

    if(event.target===smsModal){

        smsModal.style.display="none";

        clearInterval(pollingInterval);

    }

});

/* ==========================================
END OF marketplace.js
========================================== */
