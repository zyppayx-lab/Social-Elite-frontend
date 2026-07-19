const SUPABASE_URL = "https://dohxtukzxopwkvxeppdl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const EDGE_FUNCTION =
`${SUPABASE_URL}/functions/v1/purchase-social-account`;

const params = new URLSearchParams(window.location.search);

const productId = params.get("id");

const productCard =
document.getElementById("productCard");

const productContent =
document.getElementById("productContent");

const loadingProduct =
document.getElementById("loadingProduct");

const successCard =
document.getElementById("successCard");

const purchaseBtn =
document.getElementById("purchaseBtn");

const productName =
document.getElementById("productName");

const productDescription =
document.getElementById("productDescription");

const productPlatform =
document.getElementById("productPlatform");

const productCountry =
document.getElementById("productCountry");

const productStock =
document.getElementById("productStock");

const productPrice =
document.getElementById("productPrice");

let currentUser = null;

let accessToken = "";

let purchaseResult = null;

let purchasing = false;

async function getSession() {

    const {
        data,
        error
    } = await supabaseClient.auth.getSession();

    if (
        error ||
        !data.session
    ) {

        window.location.href =
        "login.html";

        return false;

    }

    currentUser =
    data.session.user;

    accessToken =
    data.session.access_token;

    return true;

}

function formatMoney(amount) {

    return "₦" +
    Number(amount || 0)
    .toLocaleString();

}

async function loadProduct() {

    try {

        if (!productId) {

            throw new Error(
                "Invalid product."
            );

        }

        const timeout =
        new Promise((_, reject) => {

            setTimeout(() => {

                reject(
                    new Error(
                        "Loading timeout"
                    )
                );

            }, 10000);

        });

        const request =
        supabaseClient
        .from("available_products")
        .select("*")
        .eq("id", productId)
        .single();

        const {
            data,
            error
        } =
        await Promise.race([
            request,
            timeout
        ]);

        if (error)
            throw error;

        if (!data)
            throw new Error(
                "Product not found."
            );

        productName.textContent =
        data.name;

        productDescription.textContent =
        data.description || "";

        productPlatform.textContent =
        data.platform;

        productCountry.textContent =
        data.country;

        productStock.textContent =
        data.stock;

        productPrice.textContent =
        formatMoney(data.price);

        loadingProduct.style.display =
        "none";

        productContent.style.display =
        "block";

    } catch (error) {

        loadingProduct.innerHTML =

        `<div class="error-box">
            ${error.message}
        </div>`;

    }

}

async function purchaseAccount() {

    if (purchasing)
        return;

    purchasing = true;

    purchaseBtn.disabled = true;

    purchaseBtn.textContent =
    "Processing...";

    try {

        const controller =
        new AbortController();

        const timeout =
        setTimeout(() => {

            controller.abort();

        }, 30000);

        const response =
        await fetch(
            EDGE_FUNCTION,
            {

                method: "POST",

                headers: {

                    Authorization:
                    `Bearer ${accessToken}`,

                    "Content-Type":
                    "application/json"

                },

                body:
                JSON.stringify({

                    product_id:
                    productId

                }),

                signal:
                controller.signal

            }
        );

        clearTimeout(timeout);

        const result =
        await response.json();

        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(

                result.message ||

                "Purchase failed."

            );

        }

        purchaseResult = result;

        showPurchaseSuccess();

    } catch (error) {

        purchaseBtn.disabled = false;

        purchaseBtn.textContent =
        "Purchase Now";

        purchasing = false;

        alert(error.message);

    }

}

purchaseBtn.addEventListener(
    "click",
    purchaseAccount
);
// ===============================
// Purchase Success
// ===============================

function showPurchaseSuccess() {

    productCard.style.display = "none";

    successCard.style.display = "block";

    const credentials =
        purchaseResult.data.credentials;

    document.getElementById(
        "usernameValue"
    ).textContent =
    credentials.username || "-";



    // Password

    const password =
        document.getElementById(
            "passwordValue"
        );

    password.dataset.real =
        credentials.password || "";

    password.textContent =
        "••••••••";



    // Recovery Email

    document.getElementById(
        "emailValue"
    ).textContent =
    credentials.recovery_email || "-";



    // Recovery Password

    const recoveryPassword =
        document.getElementById(
            "recoveryPasswordValue"
        );

    recoveryPassword.dataset.real =
        credentials.recovery_password || "";

    recoveryPassword.textContent =
        "••••••••";



    document.getElementById(
        "notesValue"
    ).textContent =
    credentials.notes ||
    "No notes.";



    document.getElementById(
        "purchaseDate"
    ).textContent =
    new Date(
        purchaseResult.data.purchased_at
    ).toLocaleString();

}



// ===============================
// Password Visibility
// ===============================

function toggleSecret(elementId) {

    const element =
        document.getElementById(
            elementId
        );

    const value =
        element.dataset.real || "";

    if (element.textContent === "••••••••") {

        element.textContent = value;

    } else {

        element.textContent = "••••••••";

    }

}



document
.getElementById(
    "togglePassword"
)
.addEventListener(
    "click",
    () => {

        toggleSecret(
            "passwordValue"
        );

    }
);



document
.getElementById(
    "toggleRecoveryPassword"
)
.addEventListener(
    "click",
    () => {

        toggleSecret(
            "recoveryPasswordValue"
        );

    }
);



// ===============================
// Copy To Clipboard
// ===============================

async function copyText(text) {

    if (!text)
        return;

    try {

        await navigator.clipboard.writeText(
            text
        );

    } catch {

        const textarea =
            document.createElement(
                "textarea"
            );

        textarea.value = text;

        document.body.appendChild(
            textarea
        );

        textarea.select();

        document.execCommand(
            "copy"
        );

        textarea.remove();

    }

}



document
.querySelectorAll(".copy-btn")
.forEach(button => {

    button.addEventListener(
        "click",
        async () => {

            const target =
                document.getElementById(
                    button.dataset.copy
                );

            let value =
                target.dataset.real ||
                target.textContent;

            await copyText(value);

            const oldText =
                button.textContent;

            button.textContent =
                "Copied ✓";

            button.disabled = true;

            setTimeout(() => {

                button.textContent =
                    oldText;

                button.disabled =
                    false;

            }, 2000);

        }
    );

});
// ===============================
// Initialization
// ===============================

async function init() {

    // Validate product ID
    if (!productId) {

        loadingProduct.innerHTML = `
            <div class="error-box">
                Invalid purchase link.
            </div>
        `;

        return;

    }

    // Check login
    const authenticated =
        await getSession();

    if (!authenticated) {
        return;
    }

    // Load product information
    await loadProduct();

}


// ===============================
// Prevent duplicate purchase
// ===============================

window.addEventListener(
    "beforeunload",
    () => {

        purchaseBtn.disabled = true;

    }
);


// ===============================
// Start App
// ===============================

init();
