/* =====================================
SOCIALELITE
VERIFY RESET PASSWORD
PART 1
===================================== */

"use strict";

/* =====================================
CONFIG
===================================== */

const API_BASE =
"https://dohxtukzxopwkvxeppdl.supabase.co/functions/v1";

const VERIFY_RESET_PASSWORD =
`${API_BASE}/verify-reset-password-otp`;

/* =====================================
ELEMENTS
===================================== */

const form =
document.getElementById("resetPasswordForm");

const emailInput =
document.getElementById("email");

const otpInput =
document.getElementById("otp");

const newPasswordInput =
document.getElementById("newPassword");

const confirmPasswordInput =
document.getElementById("confirmPassword");

const resetBtn =
document.getElementById("resetBtn");

const loadingOverlay =
document.getElementById("loadingOverlay");

const loadingText =
document.getElementById("loadingText");

const toast =
document.getElementById("toast");

/* =====================================
INIT
===================================== */

const savedEmail =
sessionStorage.getItem("reset_email");

if (!savedEmail) {

    window.location.href =
    "forgot-password.html";

}

emailInput.value = savedEmail;

/* =====================================
STATE
===================================== */

let isSubmitting = false;

/* =====================================
HELPERS
===================================== */

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
VERIFY RESET PASSWORD
PART 2
===================================== */

async function resetPassword() {

    if (isSubmitting) return;

    const email =
        emailInput.value.trim().toLowerCase();

    const otp =
        otpInput.value.trim();

    const newPassword =
        newPasswordInput.value;

    const confirmPassword =
        confirmPasswordInput.value;

    if (!otp) {

        showToast(
            "Enter your verification code.",
            "error"
        );

        otpInput.focus();

        return;

    }

    if (otp.length !== 6) {

        showToast(
            "OTP must be 6 digits.",
            "error"
        );

        otpInput.focus();

        return;

    }

    if (newPassword.length < 8) {

        showToast(
            "Password must be at least 8 characters.",
            "error"
        );

        newPasswordInput.focus();

        return;

    }

    if (newPassword !== confirmPassword) {

        showToast(
            "Passwords do not match.",
            "error"
        );

        confirmPasswordInput.focus();

        return;

    }

    isSubmitting = true;

    resetBtn.disabled = true;

    showLoading("Resetting password...");

    try {

        const result = await postJSON(

            VERIFY_RESET_PASSWORD,

            {

                email,

                otp,

                newPassword

            }

        );

        hideLoading();

        if (!result.ok) {

            throw new Error(

                result.data.error ||

                result.data.message ||

                "Password reset failed."

            );

        }

        sessionStorage.removeItem(
            "reset_email"
        );

        showToast(

            result.data.message ||

            "Password reset successfully."

        );

        setTimeout(() => {

            window.location.href =
                "login.html";

        }, 1500);

    } catch (error) {

        hideLoading();

        showToast(

            error.message ||

            "Unable to reset password.",

            "error"

        );

    } finally {

        isSubmitting = false;

        resetBtn.disabled = false;

    }

}

/* =====================================
SHOW / HIDE PASSWORD
===================================== */

document
.querySelectorAll(".toggle-password")
.forEach(button => {

    button.addEventListener("click", () => {

        const input = document.getElementById(
            button.dataset.target
        );

        const icon = button.querySelector("i");

        if (input.type === "password") {

            input.type = "text";

            icon.classList.replace(
                "fa-eye",
                "fa-eye-slash"
            );

        } else {

            input.type = "password";

            icon.classList.replace(
                "fa-eye-slash",
                "fa-eye"
            );

        }

    });

});

/* =====================================
FORM SUBMIT
===================================== */

form.addEventListener(

    "submit",

    function(event){

        event.preventDefault();

        resetPassword();

    }

);
