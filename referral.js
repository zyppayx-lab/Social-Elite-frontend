const SUPABASE_URL = "https://dohxtukzxopwkvxeppdl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvaHh0dWt6eG9wd2t2eGVwcGRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxOTA5NzksImV4cCI6MjA5ODc2Njk3OX0.EvzBxG--UmAIDL6dX-cU878tjRRHacazKv9mbEsGgWY";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);



const referralCodeElement = document.getElementById("referralCode");
const referralLinkElement = document.getElementById("referralLink");

const totalReferralsElement = document.getElementById("totalReferrals");
const completedRewardsElement = document.getElementById("completedRewards");
const totalEarnedElement = document.getElementById("totalEarned");

const earningsList = document.getElementById("earningsList");
const referralList = document.getElementById("referralList");



function setLoadingFinished(element, message){

    if(element){
        element.innerHTML = message;
    }

}



function formatMoney(amount){

    return "₦" + Number(amount || 0).toLocaleString();

}




async function checkUser(){

    const { data, error } = await supabaseClient.auth.getUser();


    if(error || !data.user){

        window.location.href = "login.html";
        return null;

    }


    return data.user;

}





async function loadProfile(userId){


    const request = supabaseClient
    .from("profiles")
    .select(`
        referral_code
    `)
    .eq("id", userId)
    .single();



    const timeout = new Promise((_, reject)=>{

        setTimeout(()=>{

            reject(new Error("Profile request timeout"));

        },8000);

    });



    try{


        const {data,error}= await Promise.race([
            request,
            timeout
        ]);



        if(error){

            throw error;

        }



        const code = data.referral_code || "Unavailable";


        referralCodeElement.textContent = code;



        const baseUrl = window.location.origin;


        referralLinkElement.textContent =
        `${baseUrl}/signup.html?ref=${code}`;



        return code;



    }catch(error){


        referralCodeElement.textContent="Unavailable";
        referralLinkElement.textContent="Unavailable";

        console.error(error);


    }



}







async function loadReferrals(userId){


    try{


        const {data,error}=await supabaseClient
        .from("referrals")
        .select(`
            created_at,
            rewarded
        `)
        .eq("referrer_id",userId)
        .order("created_at",{ascending:false});



        if(error){

            throw error;

        }



        totalReferralsElement.textContent=data.length;


        const completed =
        data.filter(item=>item.rewarded).length;



        completedRewardsElement.textContent=completed;



        if(data.length===0){

            referralList.innerHTML =
            `<p class="empty-state">
            No referrals yet
            </p>`;

            return;

        }




        referralList.innerHTML="";



        data.forEach(item=>{


            referralList.innerHTML += `

            <div class="history-item">

                <h4>
                Referral User
                </h4>


                <p>
                Joined:
                ${new Date(item.created_at).toLocaleDateString()}
                </p>


                <p class="${item.rewarded ? 
                "status-complete":"status-pending"}">

                ${
                item.rewarded ?
                "Reward Completed":
                "Pending"
                }

                </p>


            </div>

            `;


        });



    }catch(error){


        referralList.innerHTML =
        `<p class="empty-state">
        Failed to load referrals
        </p>`;

        console.error(error);


    }


}









async function loadEarnings(userId){


    try{


        const {data,error}=await supabaseClient
        .from("referral_earnings")
        .select(`
            source,
            amount,
            created_at
        `)
        .eq("referrer_id",userId)
        .order("created_at",{ascending:false});



        if(error){

            throw error;

        }




        let total=0;



        data.forEach(item=>{

            total += Number(item.amount);

        });



        totalEarnedElement.textContent =
        formatMoney(total);





        if(data.length===0){


            earningsList.innerHTML =
            `<p class="empty-state">
            No earnings yet
            </p>`;

            return;


        }




        earningsList.innerHTML="";



        data.forEach(item=>{


            earningsList.innerHTML += `

            <div class="history-item">


            <h4>
            ${item.source.replace("_"," ")}
            </h4>


            <p class="amount">
            ${formatMoney(item.amount)}
            </p>


            <p>
            ${new Date(item.created_at)
            .toLocaleDateString()}
            </p>


            </div>


            `;


        });




    }catch(error){


        earningsList.innerHTML =
        `<p class="empty-state">
        Failed to load earnings
        </p>`;

        console.error(error);


    }


}








document.getElementById("copyCodeBtn")
.addEventListener("click",()=>{


    navigator.clipboard.writeText(
        referralCodeElement.textContent
    );


});




document.getElementById("copyLinkBtn")
.addEventListener("click",()=>{


    navigator.clipboard.writeText(
        referralLinkElement.textContent
    );


});








async function initReferral(){


    try{


        const user = await checkUser();


        if(!user){
            return;
        }



        await loadProfile(user.id);


        await loadReferrals(user.id);


        await loadEarnings(user.id);



    }catch(error){

        console.error(error);

    }



}




initReferral();
