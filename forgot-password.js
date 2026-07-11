/* =====================================
SOCIALELITE
FORGOT PASSWORD
PART 1
===================================== */

"use strict";

/* =====================================
CONFIG
===================================== */

const API_BASE =
"https://dohxtukzxopwkvxeppdl.supabase.co/functions/v1";

const SEND_RESET_PASSWORD_OTP =
`${API_BASE}/send-reset-password-otp`;

/* =====================================
ELEMENTS
===================================== */

const form =
document.getElementById("forgotPasswordForm");

const emailInput =
document.getElementById("email");

const sendButton =
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

/* =====================================
POST JSON
===================================== */

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
FORGOT PASSWORD
PART 2
===================================== */

async function sendResetOTP() {

    if (isSubmitting) return;

    const email = emailInput.value.trim().toLowerCase();

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

    sendButton.disabled = true;

    showLoading("Sending verification code...");

    try {

        const result = await postJSON(

            SEND_RESET_PASSWORD_OTP,

            {
                email
            }

        );

        hideLoading();

        if (!result.ok) {

            throw new Error(

                result.data.error ||

                result.data.message ||

                "Failed to send OTP."

            );

        }

        sessionStorage.setItem(

            "reset_email",

            email

        );

        showToast(

            result.data.message ||

            "Verification code sent successfully."

        );

        setTimeout(() => {

            window.location.href =
                "verify-reset-password.html";

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

        sendButton.disabled = false;

    }

}

/* =====================================
FORM SUBMIT
===================================== */

form.addEventListener(

    "submit",

    function (event) {

        event.preventDefault();

        sendResetOTP();

    }

);
