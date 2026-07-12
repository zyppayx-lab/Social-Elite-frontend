/* =====================================
SOCIALELITE LOGIN
login.js
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
"sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";

const supabase =
createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);

/* =====================================
ELEMENTS
===================================== */

const loginForm =
document.getElementById("loginForm");

const emailInput =
document.getElementById("email");

const passwordInput =
document.getElementById("password");

const rememberMe =
document.getElementById("rememberMe");

const loginBtn =
document.getElementById("loginBtn");

const loadingOverlay =
document.getElementById("loadingOverlay");

const loadingText =
document.getElementById("loadingText");

const toast =
document.getElementById("toast");

/* =====================================
STATE
===================================== */

let isSubmitting = false;

/* =====================================
LOADING
===================================== */

function showLoading(message){

loadingText.textContent =
message || "Signing in...";

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
EMAIL VALIDATION
===================================== */

function validEmail(email){

return /^[^\s@]+@[^\s@]+.[^\s@]+$/

.test(email);

}

/* =====================================
PASSWORD TOGGLE
===================================== */

document

.querySelectorAll(".toggle-password")

.forEach(button=>{

button.addEventListener("click",()=>{

const input =

document.getElementById(

button.dataset.target

);

if(input.type==="password"){

input.type="text";

button.innerHTML=

'<i class="fa-solid fa-eye-slash"></i>';

}else{

input.type="password";

button.innerHTML=

'<i class="fa-solid fa-eye"></i>';

}

});

});
/* =====================================
LOGIN
PART 2
===================================== */

async function login() {

if (isSubmitting) return;  

const email = emailInput.value.trim().toLowerCase();  
const password = passwordInput.value;  

if (!email) {  
    showToast("Email is required.","error");  
    emailInput.focus();  
    return;  
}  

if (!validEmail(email)) {  
    showToast("Enter a valid email address.","error");  
    emailInput.focus();  
    return;  
}  

if (!password) {  
    showToast("Password is required.","error");  
    passwordInput.focus();  
    return;  
}  

isSubmitting = true;  

loginBtn.disabled = true;  

showLoading("Signing you in...");  

try {  

    const {  

        data,  

        error  

    } = await supabase.auth.signInWithPassword({  

        email,  

        password  

    });  

    if (error) throw error;  

    /*  
    Save Remember Me preference  
    */  

    localStorage.setItem(  
        "remember_me",  
        rememberMe.checked ? "true" : "false"  
    );  

    /*  
    Session/JWT is automatically stored  
    by Supabase.  
    */  

    const session = data.session;  

    if (!session) {  

        throw new Error(  
            "Login failed."  
        );  

    }  

    showToast(  
        "Login successful."  
    );  

    setTimeout(() => {  

        window.location.href =  
            "dashboard.html";  

    },1000);  

}  

catch(error){  

    showToast(  

        error.message ||  

        "Login failed.",  

        "error"  

    );  

}  

finally{  

    hideLoading();  

    loginBtn.disabled = false;  

    isSubmitting = false;  

}

}
/* =====================================
SOCIALELITE LOGIN
login.js
PART 3
===================================== */

/* =====================================
AUTO LOGIN CHECK
===================================== */

async function checkSession() {

try {  

    const {  

        data: { session }  

    } = await supabase.auth.getSession();  

    if (session) {  

        window.location.replace("dashboard.html");  

    }  

} catch (error) {  

    console.error(error);  

}

}

/* =====================================
FORM SUBMIT
===================================== */

loginForm.addEventListener(

"submit",  

function (event) {  

    event.preventDefault();  

    login();  

}

);

/* =====================================
REMEMBER EMAIL
===================================== */

const savedEmail = localStorage.getItem("remember_email");

if (savedEmail) {

emailInput.value = savedEmail;  

rememberMe.checked = true;

}

rememberMe.addEventListener("change", () => {

if (rememberMe.checked) {  

    localStorage.setItem(  

        "remember_email",  

        emailInput.value.trim()  

    );  

} else {  

    localStorage.removeItem("remember_email");  

}

});

emailInput.addEventListener("input", () => {

if (rememberMe.checked) {  

    localStorage.setItem(  

        "remember_email",  

        emailInput.value.trim()  

    );  

}

});

/* =====================================
START
===================================== */

checkSession();
