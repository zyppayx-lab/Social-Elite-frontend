/* =====================================
SOCIALELITE DASHBOARD
dashboard.js
===================================== */

"use strict";

/* =====================================
SUPABASE
===================================== */

const SUPABASE_URL =
"https://dohxtukzxopwkvxeppdl.supabase.co";

const SUPABASE_ANON_KEY =
"sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";

const supabase =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);

/* =====================================
ELEMENTS
===================================== */

const walletBalance =
document.getElementById("walletBalance");

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
AUTH CHECK
===================================== */

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

await loadBalance(session.user.id);

}

/* =====================================
LOAD BALANCE
===================================== */

async function loadBalance(userId){

const {

data,

error

} = await supabase

.from("profiles")

.select("wallet_balance")

.eq("id",userId)

.single();

hideLoading();

if(error){

walletBalance.textContent="₦0.00";

return;

}

const balance =
Number(data.wallet_balance || 0);

walletBalance.textContent =
new Intl.NumberFormat(

"en-NG",

{

style:"currency",

currency:"NGN"

}

).format(balance);

}
/* =====================================
AUTH STATE LISTENER
===================================== */

supabase.auth.onAuthStateChange(
(event, session) => {

if (!session) {

window.location.replace("login.html");

return;

}

if (event === "SIGNED_OUT") {

window.location.replace("login.html");

}

}
);

/* =====================================
INITIALIZE
===================================== */

document.addEventListener(
"DOMContentLoaded",
() => {

checkAuth();

}
);
