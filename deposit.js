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
EDGE FUNCTION
===================================== */

const CREATE_DEPOSIT_URL =
"https://dohxtukzxopwkvxeppdl.supabase.co/functions/v1/create-paystack-deposit";

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
LOADING
===================================== */

function showLoading(){

loadingOverlay.classList.add("active");

depositBtn.disabled = true;

}

function hideLoading(){

loadingOverlay.classList.remove("active");

depositBtn.disabled = false;

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
QUICK AMOUNTS
AUTH
CREATE DEPOSIT
START
deposit.js
PART 2
===================================== */

/* =====================================
QUICK AMOUNT BUTTONS
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
DEPOSIT
===================================== */

async function createDeposit(event){

event.preventDefault();

const amount =

Number(amountInput.value);

if(

!amount ||

amount < 100

){

showToast(

"Minimum deposit is ₦100.",

"error"

);

return;

}

showLoading();

try{

const {

data:{session}

} = await supabase.auth.getSession();

if(!session){

window.location.replace("login.html");

return;

}

const response = await fetch(

CREATE_DEPOSIT_URL,

{

method:"POST",

headers:{

"Content-Type":"application/json",

"Authorization":

`Bearer ${session.access_token}`

},

body:JSON.stringify({

amount

})

}

);

const result =

await response.json();

hideLoading();

if(!response.ok){

throw new Error(

result.error ||

"Unable to initialize payment."

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

}

}

/* =====================================
FORM
===================================== */

depositForm.addEventListener(

"submit",

createDeposit

);

/* =====================================
AUTH LISTENER
===================================== */

supabase.auth.onAuthStateChange(

(event,session)=>{

if(event==="SIGNED_OUT" || !session){

window.location.replace(

"login.html"

);

}

}

);
