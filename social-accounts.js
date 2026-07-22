const SUPABASE_URL = "https://dohxtukzxopwkvxeppdl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const productList =
document.getElementById("productList");

const searchInput =
document.getElementById("searchInput");

const platformFilter =
document.getElementById("platformFilter");

const countryFilter =
document.getElementById("countryFilter");

const DEFAULT_IMAGE =
"images/no-image.png";

let products = [];

let filteredProducts = [];

async function checkAuth(){

    const {data,error} =
    await supabaseClient.auth.getUser();

    if(error || !data.user){

        window.location.href =
        "login.html";

        return false;

    }

    return true;

}

function formatMoney(amount){

    return "₦" +
    Number(amount)
    .toLocaleString();

}

async function loadProducts(){

    try{

        const request =
        Promise.all([

            supabaseClient
            .from("available_products")
            .select(`
                id,
                name,
                description,
                price,
                country,
                type,
                platform,
                category,
                stock,
                image_url,
                image_url_2
            `)
            .eq(
                "type",
                "social"
            ),

            supabaseClient
            .from("available_countries")
            .select("*")

        ]);

        const timeout =
        new Promise((_,reject)=>{

            setTimeout(()=>{

                reject(
                new Error(
                "Loading timeout"
                )
                );

            },10000);

        });

        const [
            productResult,
            countryResult

        ] = await Promise.race([

            request,
            timeout

        ]);

        if(productResult.error){

            throw productResult.error;

        }

        products =
        productResult.data || [];

        filteredProducts =
        [...products];

        loadPlatforms();

        loadCountries();

        renderProducts();

    }catch(error){

        console.error(error);

        productList.innerHTML = `

        <div class="empty">

        Failed to load products

        </div>

        `;

    }

}

function loadPlatforms(){

    const platforms =
    [
        ...new Set(
            products.map(
            item=>item.platform
            )
        )
    ];

    platforms.forEach(platform=>{

        platformFilter.innerHTML += `

        <option value="${platform}">
        ${platform}
        </option>

        `;

    });

}

function loadCountries(){

    supabaseClient
    .from("available_countries")
    .select("*")
    .then(({data})=>{

        if(!data)
        return;

        data.forEach(item=>{

            countryFilter.innerHTML += `

            <option value="${item.country}">
            ${item.country}
            </option>

            `;

        });

    });

}
function renderProducts(){

    if(filteredProducts.length===0){

        productList.innerHTML = `

        <div class="empty">

        No accounts available

        </div>

        `;

        return;

    }

    productList.innerHTML = "";

    filteredProducts.forEach(product=>{

        productList.innerHTML += `

        <div class="product-card">

            <div class="product-images">

                <img
                class="main-image"
                src="${
                    product.image_url ||
                    DEFAULT_IMAGE
                }"
                alt="${product.name}">

                ${
                    product.image_url_2
                    ?
                    `
                    <img
                    class="second-image"
                    src="${product.image_url_2}"
                    alt="${product.name}">
                    `
                    :
                    ""
                }

            </div>

            <div class="product-title">

            ${product.name}

            </div>

            <div class="product-description">

            ${product.description || ""}

            </div>

            <div class="product-info">

            Platform:
            ${product.platform}

            <br>

            Country:
            ${product.country}

            <br>

            Category:
            ${product.category}

            <br>

            <span class="stock">

            Stock:
            ${product.stock}

            </span>

            <br>

            <span class="price">

            ${formatMoney(product.price)}

            </span>

            </div>

            <button
            class="buy-btn"
            onclick="buyProduct('${product.id}')">

            Buy Now

            </button>

        </div>

        `;

    });

}

function applyFilters(){

    const search =
    searchInput.value
    .toLowerCase();

    const platform =
    platformFilter.value;

    const country =
    countryFilter.value;

    filteredProducts =
    products.filter(product=>{

        const matchSearch =
        product.name
        .toLowerCase()
        .includes(search);

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

function buyProduct(id){

    window.location.href =
    `purchase-account.html?id=${id}`;

}

searchInput.addEventListener(
"input",
applyFilters
);

platformFilter.addEventListener(
"change",
applyFilters
);

countryFilter.addEventListener(
"change",
applyFilters
);

async function init(){

    const authenticated =
    await checkAuth();

    if(!authenticated)
    return;

    await loadProducts();

}

init();
