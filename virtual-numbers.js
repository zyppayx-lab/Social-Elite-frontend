// ===============================
// Supabase Configuration
// ===============================

const SUPABASE_URL =
"https://dohxtukzxopwkvxeppdl.supabase.co";

const SUPABASE_ANON_KEY =
"sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";


const supabaseClient =
window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);



// ===============================
// Edge Function
// ===============================

const SMS_SERVICES_URL =
"https://dohxtukzxopwkvxeppdl.supabase.co/functions/v1/get-smsgig-services";



// ===============================
// Elements
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
// Data
// ===============================

let allServices = [];

let displayedServices = [];

let currentPage = 1;

const itemsPerPage = 150;



// ===============================
// Helpers
// ===============================

function showLoading(show){

    loadingState.style.display =
    show ? "flex" : "none";

}


function showEmpty(show){

    emptyState.style.display =
    show ? "block" : "none";

}


function showMessage(message){

    statusContainer.innerHTML = `
        <div class="status-message">
            ${message}
        </div>
    `;

}



// ===============================
// Authentication
// ===============================

async function getUserToken(){

    const {
        data
    } =
    await supabaseClient.auth.getSession();


    if(!data.session){

        window.location.href =
        "login.html";

        return null;
    }


    return data.session.access_token;

}



// ===============================
// Load Services
// ===============================

async function loadServices(){

    showLoading(true);

    servicesContainer.innerHTML = "";

    statusContainer.innerHTML = "";

    showEmpty(false);


    try{


        const token =
        await getUserToken();


        if(!token){

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
            "SERVICE RESPONSE:",
            result
        );



        if(
            !response.ok ||
            !result.success
        ){

            throw new Error(
                result.message ||
                "Unable to load services"
            );

        }



        allServices =
        result.data || [];

        alert(
    allServices
    .map(service => service.name)
    .filter(name =>
        name.toLowerCase().includes("whatsapp") ||
        name.toLowerCase().includes("facebook") ||
        name.toLowerCase().includes("tiktok")
    )
    .join("\n")
);



        // Popular services first

        const priorityServices = [
            "whatsapp",
            "facebook",
            "instagram",
            "tiktok",
            "telegram",
            "google",
            "gmail",
            "chatgpt",
            "twitter",
            "x"
        ];



        allServices.sort((a,b)=>{


            const aName =
            a.name.toLowerCase();


            const bName =
            b.name.toLowerCase();



            const aIndex =
            priorityServices.findIndex(
                item =>
                aName.includes(item)
            );


            const bIndex =
            priorityServices.findIndex(
                item =>
                bName.includes(item)
            );



            if(
                aIndex !== -1 &&
                bIndex !== -1
            ){

                return aIndex - bIndex;

            }



            if(aIndex !== -1){

                return -1;

            }



            if(bIndex !== -1){

                return 1;

            }



            return aName.localeCompare(
                bName
            );


        });



        console.log(
            "TOTAL SERVICES:",
            allServices.length
        );


        renderServices(
            allServices
        );



    }catch(error){


        console.error(error);


        showMessage(
            error.message
        );


    }finally{


        showLoading(false);

    }

}
// ===============================
// Initial Render
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


    displayedServices = services;

    currentPage = 1;

    renderPage();

}



// ===============================
// Pagination Render
// ===============================

function renderPage(){

    const start =
    (currentPage - 1) * itemsPerPage;


    const end =
    start + itemsPerPage;


    const items =
    displayedServices.slice(
        start,
        end
    );



    items.forEach(service=>{


        const card =
        document.createElement("div");


        card.className =
        "service-card";



        card.innerHTML = `

        <div class="service-header">

            <h3>
                ${service.name}
            </h3>

        </div>


        <div class="service-info">


            <p>
            Price:
            <strong>
            ₦${Number(
                service.selling_price
            ).toLocaleString()}
            </strong>
            </p>


            <p>
            Stock:
            ${service.stock}
            </p>


            <p>
            Duration:
            ${Math.floor(
                service.ttl / 60
            )}
            minutes
            </p>


            <p>
            Multiple SMS:
            ${
            service.multiple_sms
            ?
            "Yes"
            :
            "No"
            }
            </p>


        </div>


        <button class="buy-btn">
            Buy Number
        </button>

        `;



        card.querySelector(
            ".buy-btn"
        )
        .onclick = ()=>{


            window.location.href =
            `purchase-sms.html?service=${encodeURIComponent(
                service.service_code
            )}`;


        };



        servicesContainer.appendChild(
            card
        );


    });



    if(
        end < displayedServices.length
    ){

        const loadMore =
        document.createElement("button");


        loadMore.className =
        "load-more-btn";


        loadMore.textContent =
        "Load More";


        loadMore.onclick = ()=>{


            currentPage++;


            loadMore.remove();


            renderPage();


        };


        servicesContainer.appendChild(
            loadMore
        );

    }

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
        service=>{


            const name =
            service.name
            .toLowerCase();


            return name.includes(keyword);

        }
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
()=>{

    loadServices();

});



// ===============================
// Auth Watch
// ===============================

supabaseClient.auth.onAuthStateChange(
(event)=>{


    if(
        event === "SIGNED_OUT"
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
