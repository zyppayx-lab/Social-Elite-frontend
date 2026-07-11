/* =====================================
verify-signup.js
PART 1
===================================== */

"use strict";

/* =====================================
CONFIG
===================================== */

const SUPABASE_URL =
"https://dohxtukzxopwkvxeppdl.supabase.co";

const VERIFY_SIGNUP_ENDPOINT =
`${SUPABASE_URL}/functions/v1/verify-signup-otp`;

const SEND_SIGNUP_OTP_ENDPOINT =
`${SUPABASE_URL}/functions/v1/send-signup-otp`;

/* =====================================
ELEMENTS
===================================== */

const verifyForm =
document.getElementById("verifyForm");

const emailInput =
document.getElementById("email");

const otpInput =
document.getElementById("otp");

const passwordInput =
document.getElementById("password");

const confirmPasswordInput =
document.getElementById("confirmPassword");

const resendButton =
document.getElementById("resendOTP");

const loadingOverlay =
document.getElementById("loadingOverlay");

const loadingText =
document.getElementById("loadingText");

const toast =
document.getElementById("toast");

const passwordStrength =
document.getElementById("passwordStrength");

/* =====================================
RESTORE EMAIL
===================================== */

const signupEmail =
sessionStorage.getItem("signup_email") || "";

emailInput.value = signupEmail;

/* =====================================
HELPERS
===================================== */

function showLoading(message){

loadingText.textContent = message;

loadingOverlay.classList.add("active");

}

function hideLoading(){

loadingOverlay.classList.remove("active");

}

function showToast(message,type){

toast.textContent = message;

toast.className = `toast ${type}`;

setTimeout(()=>{

toast.className="toast";

},3000);

}

function checkPasswordStrength(password){

let score = 0;

if(password.length>=8) score++;

if(/[A-Z]/.test(password)) score++;

if(/[a-z]/.test(password)) score++;

if(/[0-9]/.test(password)) score++;

if(/[^A-Za-z0-9]/.test(password)) score++;

if(score<=2){

passwordStrength.className="password-strength weak";

passwordStrength.textContent="Weak Password";

}

else if(score<=4){

passwordStrength.className="password-strength medium";

passwordStrength.textContent="Medium Password";

}

else{

passwordStrength.className="password-strength strong";

passwordStrength.textContent="Strong Password";

}

}

passwordInput.addEventListener("input",()=>{

checkPasswordStrength(passwordInput.value);

});
/* =====================================
verify-signup.js
PART 2
===================================== */

/* =====================================
SHOW / HIDE PASSWORD
===================================== */

document.querySelectorAll(".toggle-password").forEach(button => {

    button.addEventListener("click", () => {

        const target = document.getElementById(
            button.dataset.target
        );

        if (target.type === "password") {

            target.type = "text";
            button.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';

        } else {

            target.type = "password";
            button.innerHTML = '<i class="fa-solid fa-eye"></i>';

        }

    });

});

/* =====================================
VERIFY OTP
===================================== */

verifyForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = emailInput.value.trim();
    const otp = otpInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!email) {
        showToast("Email is missing.", "error");
        return;
    }

    if (!otp) {
        showToast("Enter the OTP.", "error");
        return;
    }

    if (password.length < 8) {
        showToast("Password must be at least 8 characters.", "error");
        return;
    }

    if (password !== confirmPassword) {
        showToast("Passwords do not match.", "error");
        return;
    }

    try {

        showLoading("Creating your account...");

        const response = await fetch(
            VERIFY_SIGNUP_ENDPOINT,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password,
                    otp
                })
            }
        );

        const result = await response.json();

        hideLoading();

        if (!response.ok || !result.success) {

            showToast(
                result.error ||
                result.message ||
                "Verification failed.",
                "error"
            );

            return;

        }

        sessionStorage.removeItem("signup_email");
        sessionStorage.removeItem("referral_code");

        showToast(
            "Account created successfully. Redirecting...",
            "success"
        );

        setTimeout(() => {

            window.location.href = "login.html";

        }, 1500);

    } catch (error) {

        hideLoading();

        showToast(
            error.message || "Network error.",
            "error"
        );

    }

});

/* =====================================
RESEND OTP
===================================== */

resendButton.addEventListener("click", async () => {

    const email = emailInput.value.trim();

    if (!email) {

        showToast("Email not found.", "error");
        return;

    }

    try {

        showLoading("Sending OTP...");

        const response = await fetch(
            SEND_SIGNUP_OTP_ENDPOINT,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    referral_code: sessionStorage.getItem("referral_code") || null
                })
            }
        );

        const result = await response.json();

        hideLoading();

        if (!response.ok || !result.success) {

            showToast(
                result.error ||
                result.message ||
                "Failed to resend OTP.",
                "error"
            );

            return;

        }

        showToast(
            "OTP sent successfully.",
            "success"
        );

    } catch (error) {

        hideLoading();

        showToast(
            error.message || "Network error.",
            "error"
        );

    }

});
