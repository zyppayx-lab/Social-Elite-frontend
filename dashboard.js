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
"sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";


const supabaseClient =
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
        data,
        error
    } = await supabaseClient.auth.getUser();



    if(error || !data.user){

        window.location.href =
        "login.html";

        return false;

    }



    currentUser = data.user;


    return true;

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
    } = await supabaseClient

    .from("profiles")

    .select("wallet_balance")

    .eq("id", currentUser.id)

    .single();



    if(error){

        console.error(
            "Wallet fetch error:",
            error
        );


        walletBalance.textContent =
        "₦0.00";

        return;

    }



    walletBalance.textContent =

    "₦" +

    Number(
        data.wallet_balance || 0
    )

    .toLocaleString("en-NG");


}



/* =====================================
FEATURED SOCIAL ACCOUNTS
===================================== */

async function loadFeaturedAccounts(){


    const {
        data,
        error
    } = await supabaseClient

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
INITIALIZE DASHBOARD
===================================== */

async function initializeDashboard(){


    try{


        const authenticated =
        await checkAuth();



        if(!authenticated){

            return;

        }



        await loadWalletBalance();


        await loadFeaturedAccounts();



    }catch(error){


        console.error(
            "Dashboard error:",
            error
        );


    }finally{


        hideLoading();


    }


}



/* =====================================
AUTH LISTENER
===================================== */

supabaseClient.auth.onAuthStateChange(

(event, session)=>{


    if(
        event === "SIGNED_OUT" ||
        !session
    ){

        window.location.href =
        "login.html";

    }


});



/* =====================================
START
===================================== */

document.addEventListener(

"DOMContentLoaded",

initializeDashboard

);
