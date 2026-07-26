/* =====================================
SOCIALELITE DASHBOARD
dashboard.js
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
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkb2h4dHVrenhvcHdrdnhlcHBkbCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzgzMTkwOTc5LCJleHAiOjIwOTg3NjY5Nzl9.EvzBxG--UmAIDL6dX-cU878tjRRHacazKv9mbEsGgWY";


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


const loadingOverlay =
document.getElementById("loadingOverlay");



/* =====================================
LOADING
===================================== */

function showLoading(){

if(loadingOverlay){

loadingOverlay.classList.add("active");

}

}


function hideLoading(){

if(loadingOverlay){

loadingOverlay.classList.remove("active");

}

}



/* =====================================
AUTH
===================================== */

let currentUser = null;


async function checkAuth(){

showLoading();


const {

data:{session}

} = await supabase.auth.getSession();



if(!session){

window.location.replace("login.html");

return;

}


currentUser = session.user;


await loadWalletBalance();


}



/* =====================================
LOAD WALLET BALANCE
===================================== */

async function loadWalletBalance(){


if(!currentUser){

return;

}



const {

data,
error

} = await supabase

.from("profiles")

.select("wallet_balance")

.eq("email", currentUser.email)

.single();



if(error || !data){

walletBalance.textContent = "₦0.00";

return;

}



walletBalance.textContent =

"₦" +

Number(data.wallet_balance || 0)

.toLocaleString("en-NG");


}



/* =====================================
FEATURED SOCIAL ACCOUNTS
===================================== */

async function loadFeaturedAccounts(){


const {

data,
error

} = await supabase

.from("available_products")

.select("*")

.eq("status","active")

.gt("stock",0)

.limit(3);



if(error){

featuredAccounts.innerHTML =
"<p>No social accounts available.</p>";

return;

}



featuredAccounts.innerHTML = "";


data.forEach(product=>{


featuredAccounts.innerHTML += `

<div class="product-card">

<div class="product-platform">

${product.platform}

</div>


<div class="product-country">

${product.country}

</div>


<div class="product-name">

${product.name}

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


await loadFeaturedAccounts();


}catch(error){


console.error(error);


}finally{


hideLoading();


}

}



/* =====================================
AUTH LISTENER
===================================== */

supabase.auth.onAuthStateChange(

(event, session)=>{


if(event === "SIGNED_OUT" || !session){

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
