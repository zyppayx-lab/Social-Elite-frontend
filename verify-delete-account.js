/* =====================================
SOCIALELITE
VERIFY DELETE ACCOUNT
PART 1
===================================== */

"use strict";

/* =====================================
CONFIG
===================================== */

const API_BASE =
"https://dohxtukzxopwkvxeppdl.supabase.co/functions/v1";

const VERIFY_DELETE_ACCOUNT =
`${API_BASE}/verify-delete-account`;

/* =====================================
ELEMENTS
===================================== */

const form =
document.getElementById("verifyDeleteForm");

const emailInput =
document.getElementById("email");

const otpInput =
document.getElementById("otp");

const passwordInput =
document.getElementById("password");

const deleteBtn =
document.getElementById("deleteBtn");

const loadingOverlay =
document.getElementById("loadingOverlay");

const loadingText =
document.getElementById("loadingText");

const toast =
document.getElementById("toast");

/* =====================================
LOAD EMAIL
===================================== */

const savedEmail =
sessionStorage.getItem(
"delete_account_email"
);

if(!savedEmail){

window.location.href =
"delete-account.html";

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
message;

loadingOverlay.classList.add("active");

}

function hideLoading(){

loadingOverlay.classList.remove("active");

}

let toastTimer;

function showToast(message,type="success"){

clearTimeout(toastTimer);

toast.textContent = message;

toast.className =
`toast ${type} show`;

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

const result =
await response.json();

return{

ok:response.ok,

data:result

};

}
/* =====================================
SOCIALELITE
VERIFY DELETE ACCOUNT
PART 2
===================================== */

async function deleteAccount(){

    if(isSubmitting) return;

    const email =
    emailInput.value.trim().toLowerCase();

    const otp =
    otpInput.value.trim();

    const password =
    passwordInput.value;

    if(!otp){

        showToast(
        "Verification code is required.",
        "error"
        );

        otpInput.focus();

        return;

    }

    if(otp.length !== 6){

        showToast(
        "OTP must be 6 digits.",
        "error"
        );

        otpInput.focus();

        return;

    }

    if(!password){

        showToast(
        "Current password is required.",
        "error"
        );

        passwordInput.focus();

        return;

    }

    isSubmitting = true;

    deleteBtn.disabled = true;

    showLoading("Deleting account...");

    try{

        const result =
        await postJSON(

            VERIFY_DELETE_ACCOUNT,

            {

                email,

                password,

                otp

            }

        );

        hideLoading();

        if(!result.ok){

            throw new Error(

                result.data.error ||

                result.data.message ||

                "Account deletion failed."

            );

        }

        /* CLEAR LOCAL DATA */

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        sessionStorage.removeItem("delete_account_email");
        sessionStorage.removeItem("signup_email");
        sessionStorage.removeItem("signup_referral");
        sessionStorage.removeItem("reset_email");

        showToast(

            result.data.message ||

            "Account deleted successfully."

        );

        setTimeout(()=>{

            window.location.replace(
                "login.html"
            );

        },1500);

    }

    catch(error){

        hideLoading();

        showToast(

            error.message ||

            "Unable to delete account.",

            "error"

        );

    }

    finally{

        isSubmitting = false;

        deleteBtn.disabled = false;

    }

}

/* =====================================
SHOW / HIDE PASSWORD
===================================== */

document
.querySelectorAll(".toggle-password")
.forEach(button=>{

    button.addEventListener("click",()=>{

        const input =
        document.getElementById(
            button.dataset.target
        );

        const icon =
        button.querySelector("i");

        if(input.type==="password"){

            input.type="text";

            icon.classList.replace(
                "fa-eye",
                "fa-eye-slash"
            );

        }else{

            input.type="password";

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

function(e){

e.preventDefault();

deleteAccount();

}

);
