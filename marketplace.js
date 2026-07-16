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

const platformFilter = document.getElementById("platformFilter");
const countryFilter = document.getElementById("countryFilter");
const categoryFilter = document.getElementById("categoryFilter");
const priceFilter = document.getElementById("priceFilter");

const socialSearch = document.getElementById("socialSearch");
const numberSearch = document.getElementById("numberSearch");

let socialProducts = [];
let smsServices = [];

/* ==========================
CURRENT SESSION
========================== */

async function getSession() {

    const {
        data: { session }
    } = await supabase.auth.getSession();

    if (!session) {

        window.location.href = "login.html";
        return null;

    }

    return session;

}

/* ==========================
LOAD WALLET
========================== */

async function loadWallet() {

    const session = await getSession();

    if (!session) return;

    const {

        data,
        error

    } = await supabase

        .from("profiles")

        .select("wallet_balance")

        .eq("id", session.user.id)

        .single();

    if (error) return;

    document.getElementById("walletBalance").textContent =

        "₦" + Number(data.wallet_balance).toLocaleString();

}

/* ==========================
INITIALIZE
========================== */

document.addEventListener("DOMContentLoaded", async () => {

    await loadWallet();

    await loadCountries();

    await loadCategories();

    await loadMarketplaceProducts();

    await loadSmsServices();

});
