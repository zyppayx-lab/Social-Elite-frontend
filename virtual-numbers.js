// ===============================
// Supabase Configuration
// ===============================

const SUPABASE_URL = "https://dohxtukzxopwkvxeppdl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ===============================
// Edge Function URL
// ===============================

const SMS_SERVICES_URL =
"https://dohxtukzxopwkvxeppdl.supabase.co/functions/v1/get-smsgig-services";


// ===============================
// DOM Elements
// ===============================

const searchInput =
document.getElementById("searchInput");

const servicesContainer =
document.getElementById("servicesContainer");

const loadingState =
document.getElementById("loadingState");

const emptyState =
document.getElementById("emptyState");

const statusContainer =
document.getElementById("statusContainer");

const refreshBtn =
document.getElementById("refreshBtn");


// ===============================
// State
// ===============================

let allServices = [];


// ===============================
// Authentication
// ===============================

async function requireAuth(){

    const {
        data:{
            session
        }
    } = await supabase.auth.getSession();


    if(!session){

        window.location.href =
        "login.html";

        return null;
    }


    return session.access_token;

}



// ===============================
// UI Helpers
// ===============================

function showLoading(show){

    loadingState.style.display =
    show ? "flex" : "none";

}


function showEmpty(show){

    emptyState.style.display =
    show ? "block" : "none";

}


function showMessage(message,type="error"){

    statusContainer.innerHTML = `

    <div class="status-message status-${type}">
        ${message}
    </div>

    `;

}


function clearMessage(){

    statusContainer.innerHTML = "";

}



// ===============================
// Load SMS Services
// ===============================

async function loadServices(){

    showLoading(true);

    clearMessage();

    servicesContainer.innerHTML = "";

    showEmpty(false);


    try{


        const token =
        await requireAuth();


        if(!token){

            showLoading(false);
            return;

        }



        const response =
        await fetch(
            SMS_SERVICES_URL,
            {

                method:"POST",

                headers:{

                    "Authorization":
                    `Bearer ${token}`,

                    "Content-Type":
                    "application/json"

                },

                body:JSON.stringify({})

            }
        );



        const result =
        await response.json();



        console.log(
            "SMS SERVICES RESPONSE:",
            result
        );



        if(
            !response.ok ||
            !result.success
        ){

            throw new Error(
                result.message ||
                "Failed to load services."
            );

        }



        allServices =
        result.data || [];



        renderServices(
            allServices
        );



    }catch(error){


        console.error(
            "LOAD ERROR:",
            error
        );


        showMessage(
            error.message
        );


    }finally{


        showLoading(false);


    }

}



// ===============================
// Render Services
// ===============================

function renderServices(services){


    servicesContainer.innerHTML = "";


    if(
        !services ||
        services.length === 0
    ){

        showEmpty(true);
        return;

    }



    showEmpty(false);



    services.forEach(service=>{


        const stockClass =
        service.stock > 20
        ?
        "badge-success"
        :
        service.stock > 0
        ?
        "badge-warning"
        :
        "badge-danger";



        const card =
        document.createElement("div");


        card.className =
        "service-card";



        card.innerHTML = `

        <div class="service-title">

            ${service.name}

        </div>


        <div class="info-row">

            <span class="label">
            Price
            </span>

            <span class="value">
            ₦${Number(
                service.selling_price
            ).toLocaleString()}
            </span>

        </div>



        <div class="info-row">

            <span class="label">
            Stock
            </span>

            <span class="badge ${stockClass}">
            ${
                service.stock > 0
                ?
                service.stock+" Available"
                :
                "Out of Stock"
            }
            </span>

        </div>



        <div class="info-row">

            <span class="label">
            Valid Time
            </span>

            <span class="value">

            ${
                Math.floor(
                    service.ttl / 60
                )
            }
            mins

            </span>

        </div>



        <div class="info-row">

            <span class="label">
            Multiple SMS
            </span>


            <span class="value">

            ${
                service.multiple_sms
                ?
                "Yes"
                :
                "No"
            }

            </span>

        </div>



        <button
        class="buy-btn"
        ${
            service.stock <=0
            ?
            "disabled"
            :
            ""
        }
        >

        ${
            service.stock >0
            ?
            "Buy Number"
            :
            "Out of Stock"
        }

        </button>

        `;



        const button =
        card.querySelector(
            ".buy-btn"
        );



        button.onclick = ()=>{


            window.location.href =
            `purchase-sms.html?service=${encodeURIComponent(
                service.service_code
            )}`;


        };



        servicesContainer.appendChild(
            card
        );


    });


}



// ===============================
// Search
// ===============================

searchInput.addEventListener(
"input",
()=>{


    const keyword =
    searchInput.value
    .toLowerCase()
    .trim();



    const filtered =
    allServices.filter(
        service =>
        service.name
        .toLowerCase()
        .includes(keyword)
    );



    renderServices(
        filtered
    );


});



// ===============================
// Refresh
// ===============================

refreshBtn.addEventListener(
"click",
loadServices
);



// ===============================
// Auth Listener
// ===============================

supabase.auth.onAuthStateChange(
(event)=>{

    if(
        event==="SIGNED_OUT"
    ){

        window.location.href =
        "login.html";

    }

});



// ===============================
// Start
// ===============================

document.addEventListener(
"DOMContentLoaded",
()=>{

    loadServices();

});
