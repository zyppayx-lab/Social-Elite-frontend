const SUPABASE_URL = "https://dohxtukzxopwkvxeppdl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";

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

function formatMoney(amount){
    return "₦" + Number(amount || 0).toLocaleString();
}

async function checkUser(){

    const { data, error } =
    await supabaseClient.auth.getUser();

    if(error || !data.user){

        window.location.href = "login.html";
        return null;

    }

    return data.user;

}

async function loadProfile(userId){

    try{

        const {data,error} =
        await supabaseClient
        .from("profiles")
        .select("referral_code")
        .eq("id",userId)
        .single();

        if(error) throw error;

        const code =
        data.referral_code || "Unavailable";

        referralCodeElement.textContent = code;

        referralLinkElement.textContent =
        `${window.location.origin}/signup.html?ref=${code}`;

    }catch(error){

        console.error(error);

        referralCodeElement.textContent =
        "Unavailable";

        referralLinkElement.textContent =
        "Unavailable";

    }

}

async function loadReferrals(userId){

    try{

        const {data,error} =
        await supabaseClient
        .from("profiles")
        .select(`
            full_name,
            email,
            created_at
        `)
        .eq("referred_by",userId)
        .order("created_at",{ascending:false});

        if(error){
            throw error;
        }

        totalReferralsElement.textContent =
        data.length;

        if(data.length===0){

            completedRewardsElement.textContent = "0";

            referralList.innerHTML = `
            <p class="empty-state">
                No referrals yet
            </p>`;

            return;

        }

        referralList.innerHTML = "";

        data.forEach(item=>{

            const name =
            item.full_name ||
            item.email ||
            "Unknown User";

            referralList.innerHTML += `

            <div class="history-item">

                <h4>${name}</h4>

                <p>${item.email}</p>

                <p>
                Joined:
                ${new Date(item.created_at).toLocaleDateString()}
                </p>

            </div>

            `;

        });

    }catch(error){

        console.error(error);

        referralList.innerHTML = `
        <p class="empty-state">
        Failed to load referrals
        </p>`;

    }

}
async function loadEarnings(userId){

    try{

        const {data,error} =
        await supabaseClient
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

        let total = 0;

        data.forEach(item=>{
            total += Number(item.amount);
        });

        completedRewardsElement.textContent =
        data.length;

        totalEarnedElement.textContent =
        formatMoney(total);

        if(data.length===0){

            earningsList.innerHTML = `
            <p class="empty-state">
                No earnings yet
            </p>`;

            return;

        }

        earningsList.innerHTML = "";

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
                    ${new Date(item.created_at).toLocaleDateString()}
                </p>

            </div>

            `;

        });

    }catch(error){

        console.error(error);

        earningsList.innerHTML = `
        <p class="empty-state">
            Failed to load earnings
        </p>`;

    }

}

document
.getElementById("copyCodeBtn")
.addEventListener("click",()=>{

    navigator.clipboard.writeText(
        referralCodeElement.textContent
    );

    alert("Referral code copied");

});

document
.getElementById("copyLinkBtn")
.addEventListener("click",()=>{

    navigator.clipboard.writeText(
        referralLinkElement.textContent
    );

    alert("Referral link copied");

});

async function initReferral(){

    try{

        const user = await checkUser();

        if(!user){
            return;
        }

        await loadProfile(user.id);

        await Promise.all([
            loadReferrals(user.id),
            loadEarnings(user.id)
        ]);

    }catch(error){

        console.error(error);

    }

}

initReferral();
