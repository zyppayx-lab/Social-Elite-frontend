/* =====================================
SOCIALELITE DASHBOARD
dashboard.js
PART 1
===================================== */

"use strict";

/* =====================================
SUPABASE
===================================== */

import { createClient }

from

"https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

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
ELEMENTS
===================================== */

const walletBalance =
document.getElementById("walletBalance");

const featuredAccounts =
document.getElementById("featuredAccounts");

const featuredNumbers =
document.getElementById("featuredNumbers");

const loadingOverlay =
document.getElementById("loadingOverlay");

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
AUTH
===================================== */

let currentUser = null;

async function checkAuth(){

showLoading();

const {

data:{session},

error

} = await supabase.auth.getSession();

if(error || !session){

window.location.replace("login.html");

return;

}

currentUser = session.user;

await loadWalletBalance();

}
/* =====================================
LOAD WALLET BALANCE
FEATURED SOCIAL ACCOUNTS
dashboard.js
PART 2
===================================== */

/* =====================================
LIVE WALLET BALANCE
===================================== */

async function loadWalletBalance(){

const {

data,

error

} = await supabase

.from("profiles")

.select("wallet_balance")

.eq("id",currentUser.id)

.single();

if(error){

walletBalance.textContent="₦0.00";

return;

}

walletBalance.textContent =

new Intl.NumberFormat(

"en-NG",

{

style:"currency",

currency:"NGN"

}

).format(

Number(data.wallet_balance || 0)

);

}

/* =====================================
FEATURED SOCIAL ACCOUNTS
===================================== */

async function loadFeaturedAccounts(){

const {

data,

error

} = await supabase

.from("products")

.select("*")

.eq("type","social")

.limit(3);

if(error){

featuredAccounts.innerHTML=

"<p>No social accounts available.</p>";

return;

}

featuredAccounts.innerHTML="";

data.forEach(product=>{

featuredAccounts.innerHTML += `

<div class="product-card">

<div class="product-platform">

${product.name}

</div>

<div class="product-country">

${product.description || "Premium Account"}

</div>

<div class="product-price">

₦${Number(product.price).toLocaleString()}

</div>

</div>

`;

});

}
/* =====================================
FEATURED VIRTUAL NUMBERS
INITIALIZE
dashboard.js
PART 3
===================================== */

/* =====================================
FEATURED VIRTUAL NUMBERS
===================================== */

async function loadFeaturedNumbers(){

const {

data,

error

} = await supabase

.from("products")

.select("*")

.eq("type","number")

.limit(2);

if(error){

featuredNumbers.innerHTML =

"<p>No virtual numbers available.</p>";

return;

}

featuredNumbers.innerHTML = "";

data.forEach(product=>{

featuredNumbers.innerHTML += `

<div class="product-card">

<div class="product-platform">

${product.name}

</div>

<div class="product-country">

${product.description || "Instant OTP Verification"}

</div>

<div class="product-price">

₦${Number(product.price).toLocaleString()}

</div>

</div>

`;

});

}

/* =====================================
START DASHBOARD
===================================== */

async function initializeDashboard(){

try{

await checkAuth();

await Promise.all([

loadFeaturedAccounts(),

loadFeaturedNumbers()

]);

}catch(error){

console.error(error);

window.location.replace("login.html");

}finally{

hideLoading();

}

}

/* =====================================
AUTH LISTENER
===================================== */

supabase.auth.onAuthStateChange(

(event, session)=>{

if(event==="SIGNED_OUT" || !session){

window.location.replace("login.html");

}

}

);

/* =====================================
START
===================================== */

document.addEventListener(

"DOMContentLoaded",

initializeDashboard

);
