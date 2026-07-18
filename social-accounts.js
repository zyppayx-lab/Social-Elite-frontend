/==================================================
SOCIALELITE
social-accounts.js
PART 1
==================================================/

/========================
SUPABASE
=========================/

const SUPABASE_URL =
"https://dohxtukzxopwkvxeppdl.supabase.co";

const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvaHh0dWt6eG9wd2t2eGVwcGRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxOTA5NzksImV4cCI6MjA5ODc2Njk3OX0.EvzBxG--UmAIDL6dX-cU878tjRRHacazKv9mbEsGgWY";

const supabase = window.supabase.createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);

/========================
EDGE FUNCTION
=========================/

const PURCHASE_ENDPOINT =
"https://dohxtukzxopwkvxeppdl.supabase.co/functions/v1/purchase-social-account";

/========================
DOM
=========================/

const loader =
document.getElementById("pageLoader");

const productsGrid =
document.getElementById("productsGrid");

const loadingCards =
document.getElementById("loadingCards");

const emptyState =
document.getElementById("emptyState");

const resultCount =
document.getElementById("resultCount");

const searchInput =
document.getElementById("searchInput");

const platformFilter =
document.getElementById("platformFilter");

const countryFilter =
document.getElementById("countryFilter");

const refreshBtn =
document.getElementById("refreshBtn");

const purchaseModal =
document.getElementById("purchaseModal");

const successModal =
document.getElementById("successModal");

const confirmPurchaseBtn =
document.getElementById("confirmPurchaseBtn");

const closePurchaseModal =
document.getElementById("closePurchaseModal");

const closeSuccessModal =
document.getElementById("closeSuccessModal");

const toast =
document.getElementById("toast");

const toastMessage =
document.getElementById("toastMessage");

/========================
GLOBAL STATE
=========================/

let session = null;

let jwt = null;

let currentUser = null;

let allProducts = [];

let filteredProducts = [];

let selectedProduct = null;

/========================
INIT
=========================/

document.addEventListener(
"DOMContentLoaded",
initializePage
);

/========================
INITIALIZE
=========================/

async function initializePage(){

showLoader();

const authenticated =
await checkAuthentication();

if(!authenticated){

return;

}

await Promise.all([
loadProducts(),
loadCountries()
]);

hideLoader();

}

/========================
AUTH
=========================/

async function checkAuthentication(){

const {
data,
error
} =
await supabase.auth.getSession();

if(error){

redirectToLogin();

return false;

}

session = data.session;

if(!session){

redirectToLogin();

return false;

}

jwt =
session.access_token;

currentUser =
session.user;

const verify =
await supabase.auth.getUser();

if(
verify.error ||
!verify.data.user
){

redirectToLogin();

return false;

}

return true;

}

/========================
REDIRECT
=========================/

function redirectToLogin(){

window.location.href =
"login.html";

}

/========================
LOAD PRODUCTS
=========================/

async function loadProducts(){

showLoadingCards();

const {
data,
error
} =
await supabase

.from("available_products")

.select("*")

.order(
"name",
{
ascending:true
}
);

hideLoadingCards();

if(error){

console.error(error);

showToast(
"Unable to load marketplace."
);

return;

}

allProducts =
data || [];

filteredProducts =
[...allProducts];

renderProducts();

}

/========================
LOAD COUNTRIES
=========================/

async function loadCountries(){

const {
data,
error
} =
await supabase

.from("available_countries")

.select("*")

.order(
"country"
);

if(error){

console.error(error);

return;

}

countryFilter.innerHTML =

`<option value="all">
All Countries

</option>`;  data.forEach(item=>{

countryFilter.innerHTML +=

`<option value="${item.country}">
${item.country}

</option>`;  });

}

/========================
LOADER
=========================/

function showLoader(){

loader.style.display="flex";

}

function hideLoader(){

loader.style.display="none";

}

/========================
LOADING GRID
=========================/

function showLoadingCards(){

loadingCards.classList.remove(
"hidden"
);

productsGrid.classList.add(
"hidden"
);

}

function hideLoadingCards(){

loadingCards.classList.add(
"hidden"
);

productsGrid.classList.remove(
"hidden"
);

}

/========================
TOAST
=========================/

function showToast(message){

toastMessage.textContent =
message;

toast.classList.add("show");

setTimeout(()=>{

toast.classList.remove("show");

},3000);

}
/==================================================
SOCIALELITE
social-accounts.js
PART 2
==================================================/

/========================
RENDER PRODUCTS
=========================/

function renderProducts(){

productsGrid.innerHTML="";

if(filteredProducts.length===0){

productsGrid.classList.add("hidden");
emptyState.classList.remove("hidden");

resultCount.textContent="0 Products Found";

return;

}

productsGrid.classList.remove("hidden");
emptyState.classList.add("hidden");

resultCount.textContent=
${filteredProducts.length} Product${filteredProducts.length===1?"":"s"} Found;

filteredProducts.forEach(product=>{

const stock=
Number(product.stock)||0;

const available=
stock>0;

const card=document.createElement("div");

card.className="product-card fade-in";

card.innerHTML=`

<div class="product-top">  <div class="platform-badge">  <i class="fa-solid fa-globe"></i>

${product.platform||"Unknown"}

</div>  <div class="stock-badge ${available?"":"out"}">  ${available?${stock} In Stock:"Out Of Stock"}

</div>  </div>  <h2 class="product-name">  ${product.name}

</h2>  <p class="product-description">  ${product.description||"No description available."}

</p>  <div class="product-details">  <div class="detail-box">  <span>Country</span>

<strong>  ${product.country||"Global"}

</strong>  </div>  <div class="detail-box">  <span>Category</span>

<strong>  ${product.category||"-"}

</strong>  </div>  </div>  <div class="price-row">  <div>  <div class="price-label">  Price

</div>  </div>  <div class="product-price">  ₦${Number(product.price).toLocaleString()}

</div>  </div>  <button
class="buy-btn"
${available?"":"disabled"}
data-id="${product.id}">

${available?"Purchase":"Out Of Stock"}

</button>  `;

productsGrid.appendChild(card);

});

attachBuyEvents();

}

/========================
BUY EVENTS
=========================/

function attachBuyEvents(){

document
.querySelectorAll(".buy-btn")
.forEach(button=>{

button.onclick=()=>{

const id=
button.dataset.id;

selectedProduct=
allProducts.find(
p=>p.id===id
);

if(!selectedProduct){

showToast(
"Product not found."
);

return;

}

openPurchaseModal(
selectedProduct
);

};

});

}

/========================
PURCHASE MODAL
=========================/

function openPurchaseModal(product){

document.getElementById(
"modalName"
).textContent=
product.name;

document.getElementById(
"modalPlatform"
).textContent=
product.platform;

document.getElementById(
"modalCountry"
).textContent=
product.country;

document.getElementById(
"modalPrice"
).textContent=
₦${Number(product.price).toLocaleString()};

purchaseModal.classList.remove(
"hidden"
);

}

closePurchaseModal.onclick=()=>{

purchaseModal.classList.add(
"hidden"
);

selectedProduct=null;

};

/========================
SEARCH
=========================/

searchInput.addEventListener(
"input",
filterProducts
);

/========================
FILTERS
=========================/

platformFilter.addEventListener(
"change",
filterProducts
);

countryFilter.addEventListener(
"change",
filterProducts
);

/========================
FILTER LOGIC
=========================/

function filterProducts(){

const keyword=
searchInput.value
.toLowerCase()
.trim();

const platform=
platformFilter.value;

const country=
countryFilter.value;

filteredProducts=
allProducts.filter(product=>{

const matchesSearch=

(product.name||"")
.toLowerCase()
.includes(keyword)

||

(product.description||"")
.toLowerCase()
.includes(keyword)

||

(product.platform||"")
.toLowerCase()
.includes(keyword);

const matchesPlatform=

platform==="all"

||

product.platform===platform;

const matchesCountry=

country==="all"

||

product.country===country;

return(

matchesSearch&&
matchesPlatform&&
matchesCountry

);

});

renderProducts();

}

/========================
REFRESH
=========================/

refreshBtn.onclick=
async()=>{

showLoader();

await loadProducts();

await loadCountries();

hideLoader();

showToast(
"Marketplace Updated"
);

};
/==================================================
SOCIALELITE
social-accounts.js
PART 3 (FINAL)
==================================================/

/========================
PURCHASE ACCOUNT
=========================/

confirmPurchaseBtn.addEventListener(
"click",
purchaseAccount
);

async function purchaseAccount(){

if(!selectedProduct){

showToast("No product selected.");

return;

}

confirmPurchaseBtn.disabled=true;

confirmPurchaseBtn.innerHTML=
<i class="fa-solid fa-spinner fa-spin"></i> Processing...;

try{

const response=
await fetch(
PURCHASE_ENDPOINT,
{
method:"POST",

headers:{

"Content-Type":"application/json",

"Authorization":
Bearer ${jwt}

},

body:JSON.stringify({

product_id:selectedProduct.id

})

}
);

const result=
await response.json();

if(!response.ok){

throw new Error(

result.message||

"Purchase failed."

);

}

purchaseModal.classList.add(
"hidden"
);

showCredentials(
result.data.credentials
);

showToast(
"Purchase Successful"
);

await loadProducts();

}catch(error){

console.error(error);

showToast(

error.message||

"Purchase failed."

);

}finally{

confirmPurchaseBtn.disabled=false;

confirmPurchaseBtn.innerHTML=
"Purchase Now";

}

}

/========================
SHOW CREDENTIALS
=========================/

function showCredentials(credentials){

document.getElementById(
"credUsername"
).value=
credentials.username||"";

document.getElementById(
"credPassword"
).value=
credentials.password||"";

document.getElementById(
"credRecoveryEmail"
).value=
credentials.recovery_email||"";

document.getElementById(
"credRecoveryPassword"
).value=
credentials.recovery_password||"";

document.getElementById(
"credNotes"
).value=
credentials.notes||"";

successModal.classList.remove(
"hidden"
);

}

/========================
CLOSE SUCCESS
=========================/

closeSuccessModal.onclick=()=>{

successModal.classList.add(
"hidden"
);

};

/========================
COPY BUTTONS
=========================/

document
.querySelectorAll(".copyBtn")
.forEach(button=>{

button.addEventListener(
"click",
()=>{

const id=
button.dataset.copy;

const input=
document.getElementById(id);

if(!input)return;

navigator.clipboard.writeText(
input.value
);

showToast(
"Copied"
);

});

});

/========================
SESSION WATCHER
=========================/

supabase.auth.onAuthStateChange(
(event)=>{

if(
event==="SIGNED_OUT"
){

redirectToLogin();

}

if(
event==="TOKEN_REFRESHED"
){

supabase.auth
.getSession()
.then(({data})=>{

jwt=
data.session?.access_token||jwt;

});

}

}
);

/========================
CLICK OUTSIDE MODAL
=========================/

window.addEventListener(
"click",
(event)=>{

if(
event.target===purchaseModal
){

purchaseModal.classList.add(
"hidden"
);

}

if(
event.target===successModal
){

successModal.classList.add(
"hidden"
);

}

});

/========================
ESC KEY
=========================/

document.addEventListener(
"keydown",
(event)=>{

if(event.key==="Escape"){

purchaseModal.classList.add(
"hidden"
);

successModal.classList.add(
"hidden"
);

}

});

/========================
NETWORK STATUS
=========================/

window.addEventListener(
"offline",
()=>{

showToast(
"No internet connection."
);

});

window.addEventListener(
"online",
()=>{

showToast(
"Connection restored."
);

});

/========================
INITIAL PRODUCT REFRESH
=========================/

setInterval(async()=>{

if(document.hidden)return;

await loadProducts();

},60000);
