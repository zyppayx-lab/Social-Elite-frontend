/* =====================================
SOCIALELITE MARKETPLACE
marketplace.js
PART 1
===================================== */

"use strict";

/* =====================================
SUPABASE
===================================== */

import { createClient }
from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL =
"https://dohxtukzxopwkvxeppdl.supabase.co";

const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvaHh0dWt6eG9wd2t2eGVwcGRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxOTA5NzksImV4cCI6MjA5ODc2Njk3OX0.EvzBxG--UmAIDL6dX-cU878tjRRHacazKv9mbEsGgWY";

const supabase =
createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);

/* =====================================
EDGE FUNCTIONS
===================================== */

const GET_SMS_URL =
`${SUPABASE_URL}/functions/v1/get-sms`;

const PURCHASE_SOCIAL_URL =
`${SUPABASE_URL}/functions/v1/purchase-social-account`;

const PURCHASE_NUMBER_URL =
`${SUPABASE_URL}/functions/v1/purchase-number`;

/* =====================================
ELEMENTS
===================================== */

const accountsGrid =
document.getElementById("accountsGrid");

const searchInput =
document.getElementById("searchInput");

const platformFilter =
document.getElementById("platformFilter");

const countryFilter =
document.getElementById("countryFilter");

const loadingOverlay =
document.getElementById("loadingOverlay");

const toast =
document.getElementById("toast");

/* =====================================
STATE
===================================== */

let session = null;

let socialProducts = [];

let smsProducts = [];

let marketplaceItems = [];

/* =====================================
LOADING
===================================== */

function showLoading(){

loadingOverlay.classList.add("active");

}

function hideLoading(){

loadingOverlay.classList.remove("active");

}

/* =====================================
TOAST
===================================== */

let toastTimer;

function showToast(message,type="success"){

clearTimeout(toastTimer);

toast.textContent = message;

toast.className = "toast";

toast.classList.add(type);

toast.classList.add("show");

toastTimer = setTimeout(()=>{

toast.classList.remove("show");

},3500);

}

/* =====================================
AUTH
===================================== */

async function checkAuth(){

const {

data:{session:currentSession},

error

}

=

await supabase.auth.getSession();

if(error || !currentSession){

window.location.replace("login.html");

return;

}

session = currentSession;

}

/* =====================================
LOAD SOCIAL PRODUCTS
===================================== */

async function loadSocialProducts(){

const {

data,

error

}

=

await supabase

.from("products")

.select(`
id,
category_id,
name,
description,
price,
type,
country,
status
`)

.eq("status","active")

.eq("type","social")

.order("price",{ascending:true});

if(error){

console.error(error);

return;

}

socialProducts =

(data || []).map(product=>({

...product,

item_type:"social"

}));

}

/* =====================================
LOAD SMS PRODUCTS
===================================== */

async function loadSmsProducts(){

const response =

await fetch(

GET_SMS_URL,

{

headers:{

Authorization:

`Bearer ${session.access_token}`

}

}

);

const result =

await response.json();

if(!result.success){

throw new Error(

result.message ||

"Unable to load virtual numbers."

);

}

smsProducts =

(result.data || []).map(service=>({

id:service.service_code,

item_type:"number",

name:service.name,

price:service.selling_price,

provider_price:service.provider_price,

platform_fee:service.platform_fee,

stock:service.stock,

ttl:service.ttl,

multiple_sms:service.multiple_sms,

service_code:service.service_code

}));

}
/* =====================================
SOCIALELITE MARKETPLACE
marketplace.js
PART 2
===================================== */

/* =====================================
LOAD CATEGORIES
===================================== */

let categories = [];

async function loadCategories(){

const {

data,

error

}

=

await supabase

.from("categories")

.select("*")

.order("platform",{ascending:true});

if(error){

console.error(error);

return;

}

categories = data || [];

populatePlatformFilter();

}

/* =====================================
PLATFORM FILTER
===================================== */

function populatePlatformFilter(){

const platforms =

[

...new Set(

categories.map(

item=>item.platform

)

)

].filter(Boolean);

platformFilter.innerHTML =

`<option value="">All Platforms</option>`;

platforms.forEach(platform=>{

platformFilter.innerHTML +=

`

<option value="${platform}">

${platform}

</option>

`;

});

}

/* =====================================
MERGE PRODUCTS
===================================== */

function buildMarketplace(){

marketplaceItems = [];

/* ---------- SOCIAL ---------- */

socialProducts.forEach(product=>{

const category =

categories.find(

item=>item.id===product.category_id

);

marketplaceItems.push({

id:product.id,

item_type:"social",

name:product.name,

description:product.description,

price:Number(product.price),

platform:category?.platform || "Social",

category:category?.name || "",

country:product.country || "Global"

});

});

/* ---------- VIRTUAL NUMBERS ---------- */

smsProducts.forEach(service=>{

marketplaceItems.push({

id:service.id,

item_type:"number",

service_code:service.service_code,

name:service.name,

description:"Virtual Number",

price:Number(service.price),

platform:"Virtual Number",

category:service.name,

country:"Global",

stock:service.stock,

ttl:service.ttl,

multiple_sms:service.multiple_sms

});

});

renderMarketplace(marketplaceItems);

}

/* =====================================
RENDER
===================================== */

function renderMarketplace(items){

accountsGrid.innerHTML="";

if(items.length===0){

accountsGrid.innerHTML=

`

<div class="empty-state">

<h3>

No products found

</h3>

</div>

`;

return;

}

items.forEach(item=>{

const badge =

item.item_type==="social"

?

item.platform

:

"Virtual Number";

accountsGrid.innerHTML +=

`

<div class="product-card">

<div class="product-top">

<span class="badge">

${badge}

</span>

</div>

<h3>

${item.name}

</h3>

<p>

${item.category}

</p>

<p>

${item.country}

</p>

<h2>

₦${Number(item.price).toLocaleString()}

</h2>

<button

class="buy-btn"

data-id="${item.id}"

data-type="${item.item_type}"

>

Buy Now

</button>

</div>

`;

});

bindPurchaseButtons();

}

/* =====================================
SEARCH & FILTER
===================================== */

function filterMarketplace(){

const keyword =

searchInput.value

.trim()

.toLowerCase();

const platform =

platformFilter.value;

const country =

countryFilter.value;

const filtered =

marketplaceItems.filter(item=>{

const matchSearch=

item.name.toLowerCase().includes(keyword)

||

item.category.toLowerCase().includes(keyword);

const matchPlatform=

!platform ||

item.platform===platform;

const matchCountry=

!country ||

item.country===country;

return(

matchSearch

&&

matchPlatform

&&

matchCountry

);

});

renderMarketplace(filtered);

}

searchInput.addEventListener(

"input",

filterMarketplace

);

platformFilter.addEventListener(

"change",

filterMarketplace

);

countryFilter.addEventListener(

"change",

filterMarketplace

);
/* =====================================
SOCIALELITE MARKETPLACE
marketplace.js
PART 3 (FINAL)
===================================== */

/* =====================================
PURCHASE BUTTONS
===================================== */

function bindPurchaseButtons(){

document

.querySelectorAll(".buy-btn")

.forEach(button=>{

button.addEventListener(

"click",

async()=>{

const id =

button.dataset.id;

const type =

button.dataset.type;

if(type==="social"){

await purchaseSocial(id);

}else{

const item =

marketplaceItems.find(

x=>x.id===id

);

await purchaseNumber(item);

}

}

);

});

}

/* =====================================
PURCHASE SOCIAL ACCOUNT
===================================== */

async function purchaseSocial(productId){

try{

showLoading();

const response =

await fetch(

PURCHASE_SOCIAL_URL,

{

method:"POST",

headers:{

"Content-Type":"application/json",

Authorization:

`Bearer ${session.access_token}`

},

body:JSON.stringify({

product_id:productId

})

}

);

const result =

await response.json();

hideLoading();

if(!result.success){

throw new Error(

result.message ||

"Purchase failed."

);

}

showToast(

"Purchase successful."

);

/* Save credentials for purchases page */

localStorage.setItem(

"latest_social_purchase",

JSON.stringify(

result.data.credentials

)

);

setTimeout(()=>{

window.location.href=

"purchases.html";

},800);

}catch(error){

hideLoading();

showToast(

error.message,

"error"

);

}

}

/* =====================================
PURCHASE VIRTUAL NUMBER
===================================== */

async function purchaseNumber(item){

try{

showLoading();

const response =

await fetch(

PURCHASE_NUMBER_URL,

{

method:"POST",

headers:{

"Content-Type":"application/json",

Authorization:

`Bearer ${session.access_token}`

},

body:JSON.stringify({

service_code:item.service_code,

country:item.country

})

}

);

const result =

await response.json();

hideLoading();

if(!result.success){

throw new Error(

result.message ||

"Purchase failed."

);

}

/* Save purchase for OTP page */

localStorage.setItem(

"latest_sms_purchase",

JSON.stringify(

result.data

)

);

showToast(

"Number purchased successfully."

);

setTimeout(()=>{

window.location.href=

"sms-purchase.html";

},800);

}catch(error){

hideLoading();

showToast(

error.message,

"error"

);

}

}

/* =====================================
AUTH LISTENER
===================================== */

supabase.auth.onAuthStateChange(

(event,currentSession)=>{

if(event==="SIGNED_OUT"){

window.location.replace(

"login.html"

);

return;

}

if(currentSession){

session=currentSession;

}

}

);

/* =====================================
INITIALIZE
===================================== */

document.addEventListener(

"DOMContentLoaded",

async()=>{

try{

showLoading();

await checkAuth();

await loadCategories();

await loadSocialProducts();

await loadSmsProducts();

buildMarketplace();

hideLoading();

}catch(error){

hideLoading();

console.error(error);

showToast(

"Failed to load marketplace.",

"error"

);

}

}

);
