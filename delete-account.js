/* =====================================
SOCIALELITE
DELETE ACCOUNT
PART 1
===================================== */

"use strict";

/* =====================================
CONFIG
===================================== */

const API_BASE =
"https://dohxtukzxopwkvxeppdl.supabase.co/functions/v1";

const SEND_DELETE_ACCOUNT_OTP =
`${API_BASE}/send-delete-account-otp`;

/* =====================================
ELEMENTS
===================================== */

const form =
document.getElementById("deleteAccountForm");

const emailInput =
document.getElementById("email");

const sendOtpBtn =
document.getElementById("sendOtpBtn");

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
HELPERS
===================================== */

function validEmail(email){

return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}

function showLoading(message){

loadingText.textContent =
message || "Please wait...";

loadingOverlay.classList.add("active");

}

function hideLoading(){

loadingOverlay.classList.remove("active");

}

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

async function postJSON(url,data){

const response = await fetch(url,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(data)

});

const result = await response.json();

return{

ok:response.ok,

data:result

};

}
/* =====================================
SOCIALELITE
DELETE ACCOUNT
PART 2
===================================== */

async function sendDeleteOTP() {

    if (isSubmitting) return;

    const email =
        emailInput.value.trim().toLowerCase();

    if (!email) {

        showToast(
            "Email is required.",
            "error"
        );

        emailInput.focus();

        return;

    }

    if (!validEmail(email)) {

        showToast(
            "Enter a valid email address.",
            "error"
        );

        emailInput.focus();

        return;

    }

    isSubmitting = true;

    sendOtpBtn.disabled = true;

    showLoading("Sending verification code...");

    try {

        const result = await postJSON(

            SEND_DELETE_ACCOUNT_OTP,

            {
                email
            }

        );

        hideLoading();

        if (!result.ok) {

            throw new Error(

                result.data.error ||

                result.data.message ||

                "Failed to send verification code."

            );

        }

        sessionStorage.setItem(

            "delete_account_email",

            email

        );

        showToast(

            result.data.message ||

            "Verification code sent successfully."

        );

        setTimeout(() => {

            window.location.href =
                "verify-delete-account.html";

        }, 1200);

    } catch (error) {

        hideLoading();

        showToast(

            error.message ||

            "Unable to send verification code.",

            "error"

        );

    } finally {

        isSubmitting = false;

        sendOtpBtn.disabled = false;

    }

}

/* =====================================
FORM SUBMIT
===================================== */

form.addEventListener(

    "submit",

    function(event){

        event.preventDefault();

        sendDeleteOTP();

    }

);
