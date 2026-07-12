/* =====================================
SOCIALELITE DEPOSIT
deposit.js
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

const depositForm =
document.getElementById("depositForm");

const amountInput =
document.getElementById("amount");

const depositBtn =
document.getElementById("depositBtn");

const loadingOverlay =
document.getElementById("loadingOverlay");

const toast =
document.getElementById("toast");

const quickButtons =
document.querySelectorAll(".quick-btn");

/* =====================================
STATE
===================================== */

let currentSession = null;

let isSubmitting = false;

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

},4000);

}
/* =====================================
AUTH
QUICK AMOUNTS
VALIDATION
deposit.js
PART 2
===================================== */

/* =====================================
AUTH CHECK
===================================== */

async function checkAuth(){

const {

data:{session},

error

} = await supabase.auth.getSession();

if(error || !session){

window.location.replace("login.html");

return;

}

currentSession = session;

}

/* =====================================
QUICK AMOUNTS
===================================== */

quickButtons.forEach(button=>{

button.addEventListener("click",()=>{

quickButtons.forEach(btn=>

btn.classList.remove("active")

);

button.classList.add("active");

amountInput.value =

button.dataset.amount;

});

});

/* =====================================
VALIDATE AMOUNT
===================================== */

function validateAmount(){

const amount =

Number(amountInput.value);

if(!amount){

showToast(

"Enter a deposit amount.",

"error"

);

return false;

}

if(amount < 100){

showToast(

"Minimum deposit is ₦100.",

"error"

);

return false;

}

if(amount > 5000000){

showToast(

"Maximum deposit is ₦5,000,000.",

"error"

);

return false;

}

return true;

}
/* =====================================
CREATE PAYSTACK DEPOSIT
START
deposit.js
PART 3
===================================== */

async function createDeposit(){

if(isSubmitting) return;

if(!validateAmount()) return;

isSubmitting = true;

depositBtn.disabled = true;

showLoading();

try{

const accessToken =

currentSession.access_token;

const response = await fetch(

"https://dohxtukzxopwkvxeppdl.supabase.co/functions/v1/create-paystack-deposit",

{

method:"POST",

headers:{

"Content-Type":"application/json",

"Authorization":`Bearer ${accessToken}`

},

body:JSON.stringify({

amount:Number(amountInput.value)

})

}

);

const result = await response.json();

if(!response.ok){

throw new Error(

result.error ||

result.message ||

"Unable to initialize deposit."

);

}

if(

!result.authorization_url

){

throw new Error(

"Payment link was not returned."

);

}

showToast(

"Redirecting to Paystack..."

);

setTimeout(()=>{

window.location.href =

result.authorization_url;

},800);

}catch(error){

hideLoading();

showToast(

error.message,

"error"

);

depositBtn.disabled = false;

isSubmitting = false;

}

}

/* =====================================
FORM SUBMIT
===================================== */

depositForm.addEventListener(

"submit",

async(event)=>{

event.preventDefault();

await createDeposit();

}

);

/* =====================================
START
===================================== */

document.addEventListener(

"DOMContentLoaded",

async()=>{

await checkAuth();

hideLoading();

}

);
