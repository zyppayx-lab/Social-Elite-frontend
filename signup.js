/* =====================================
   SOCIALELITE SIGNUP
   signup.js
===================================== */

"use strict";

/* =====================================
   CONFIG
===================================== */

const API_BASE =
  "https://dohxtukzxopwkvxeppdl.supabase.co/functions/v1";

const SEND_SIGNUP_OTP =
  `${API_BASE}/send-signup-otp-web`;

/* =====================================
   ELEMENTS
===================================== */

const signupForm =
  document.getElementById("signupForm");

const emailInput =
  document.getElementById("email");

const referralInput =
  document.getElementById("referral");

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
   EMAIL VALIDATION
===================================== */

function isValidEmail(email) {

    const regex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(email.trim());

}

/* =====================================
   LOADING
===================================== */

function showLoading(message = "Please wait...") {

    if (!loadingOverlay) return;

    loadingOverlay.classList.add("active");

    if (loadingText) {

        loadingText.textContent = message;

    }

}

function hideLoading() {

    if (!loadingOverlay) return;

    loadingOverlay.classList.remove("active");

}

/* =====================================
   TOAST
===================================== */

let toastTimer;

function showToast(message, type = "success") {

    if (!toast) {

        alert(message);

        return;

    }

    clearTimeout(toastTimer);

    toast.textContent = message;

    toast.className = "toast";

    toast.classList.add(type);

    toast.classList.add("show");

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 4000);

}

/* =====================================
   STORAGE
===================================== */

function saveSignupData(email, referralCode) {

    sessionStorage.setItem(
        "signup_email",
        email
    );

    sessionStorage.setItem(
        "signup_referral",
        referralCode || ""
    );

}

function getSignupEmail() {

    return sessionStorage.getItem(
        "signup_email"
    );

}

/* =====================================
   NETWORK REQUEST
===================================== */

async function postJSON(url, body) {

    const controller =
        new AbortController();

    const timeout =
        setTimeout(() => {

            controller.abort();

        }, 20000);

    try {

        const response = await fetch(url, {

            method: "POST",

            headers: {

                "Content-Type":
                "application/json"

            },

            body: JSON.stringify(body),

            signal: controller.signal

        });

        clearTimeout(timeout);

        const data =
            await response.json();

        return {

            ok: response.ok,

            status: response.status,

            data

        };

    } catch (error) {

        clearTimeout(timeout);

        throw error;

    }

}
/* =====================================
   SIGNUP
===================================== */

async function sendSignupOTP() {

    if (isSubmitting) return;

    const email =
        emailInput.value.trim().toLowerCase();

    const referralCode =
        referralInput.value.trim().toUpperCase();

    /* VALIDATION */

    if (!email) {

        showToast(
            "Email is required.",
            "error"
        );

        emailInput.focus();

        return;

    }

    if (!isValidEmail(email)) {

        showToast(
            "Enter a valid email address.",
            "error"
        );

        emailInput.focus();

        return;

    }

    isSubmitting = true;

    showLoading("Sending verification code...");

    try {

        const result =
            await postJSON(
                SEND_SIGNUP_OTP,
                {
                    email,
                    referral_code: referralCode || null
                }
            );

        hideLoading();

        isSubmitting = false;

        if (!result.ok) {

            showToast(
                result.data.error ||
                result.data.message ||
                "Failed to send OTP.",
                "error"
            );

            return;

        }

        saveSignupData(
            email,
            referralCode
        );

        showToast(
            result.data.message ||
            "Verification code sent.",
            "success"
        );

        setTimeout(() => {

            window.location.href =
                "verify-signup.html";

        }, 1200);

    } catch (error) {

        hideLoading();

        isSubmitting = false;

        if (error.name === "AbortError") {

            showToast(
                "Request timed out. Please try again.",
                "error"
            );

            return;

        }

        showToast(

            error.message ||

            "Unable to connect to the server.",

            "error"

        );

    }

}

/* =====================================
   FORM SUBMIT
===================================== */

signupForm.addEventListener(

    "submit",

    function(event){

        event.preventDefault();

        sendSignupOTP();

    }

);
/* =====================================
   INPUT HELPERS
===================================== */

emailInput.addEventListener("input", () => {

    emailInput.value =
        emailInput.value.trimStart().toLowerCase();

});

referralInput.addEventListener("input", () => {

    referralInput.value =
        referralInput.value
            .replace(/\s+/g, "")
            .toUpperCase();

});

/* =====================================
   ENTER KEY SUPPORT
===================================== */

document.addEventListener("keydown", (event) => {

    if (event.key !== "Enter") return;

    if (document.activeElement === emailInput) {

        event.preventDefault();

        referralInput.focus();

        return;

    }

});

/* =====================================
   RESTORE SAVED EMAIL
===================================== */

const savedEmail = getSignupEmail();

if (savedEmail) {

    emailInput.value = savedEmail;

}

/* =====================================
   PAGE INITIALIZATION
===================================== */

window.addEventListener("load", () => {

    hideLoading();

    emailInput.focus();

});

/* =====================================
   PREVENT MULTIPLE CLICKS
===================================== */

window.addEventListener("beforeunload", () => {

    isSubmitting = false;

});

/* =====================================
   EXPOSE FOR HTML (OPTIONAL)
===================================== */

window.sendSignupOTP = sendSignupOTP;
