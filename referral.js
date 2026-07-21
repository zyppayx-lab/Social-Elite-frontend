const SUPABASE_URL = "https://dohxtukzxopwkvxeppdl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const referralCodeElement =
document.getElementById("referralCode");

const referralLinkElement =
document.getElementById("referralLink");

const totalReferralsElement =
document.getElementById("totalReferrals");

const completedRewardsElement =
document.getElementById("completedRewards");

const totalEarnedElement =
document.getElementById("totalEarned");

const earningsList =
document.getElementById("earningsList");

const referralList =
document.getElementById("referralList");

function formatMoney(amount){

    return "₦" +
    Number(amount || 0).toLocaleString();

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

        if(error){
            throw error;
        }

        const code =
        data.referral_code || "Unavailable";

        referralCodeElement.textContent =
        code;

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
        .from("referrals")
        .select(`
            referred_id,
            created_at,
            rewarded
        `)
        .eq("referrer_id",userId)
        .order("created_at",{
            ascending:false
        });

        if(error){
            throw error;
        }

        totalReferralsElement.textContent =
        data.length;

        completedRewardsElement.textContent =
        data.filter(item=>item.rewarded).length;

        if(data.length===0){

            referralList.innerHTML = `
            <p class="empty-state">
                No referrals yet
            </p>
            `;

            return;

        }

        const referredIds =
        data.map(item=>item.referred_id);

        const {
            data:profiles,
            error:profileError
        } =
        await supabaseClient
        .from("profiles")
        .select(`
            id,
            full_name,
            email
        `)
        .in("id",referredIds);

        if(profileError){
            throw profileError;
        }

        const profileMap = {};

        profiles.forEach(profile=>{

            profileMap[profile.id] =
            profile;

        });

        referralList.innerHTML = "";

        data.forEach(item=>{

            const profile =
            profileMap[item.referred_id];

            referralList.innerHTML += `

            <div class="history-item">

                <h4>
                    ${profile?.full_name || "Unknown User"}
                </h4>

                <p>
                    ${profile?.email || ""}
                </p>

                <p>
                    Joined:
                    ${new Date(item.created_at).toLocaleDateString()}
                </p>

                <p class="${
                    item.rewarded
                    ? "status-complete"
                    : "status-pending"
                }">

                    ${
                        item.rewarded
                        ? "Reward Completed"
                        : "Pending Reward"
                    }

                </p>

            </div>

            `;

        });

    }catch(error){

        console.error(error);

        referralList.innerHTML = `
        <p class="empty-state">
            Failed to load referrals
        </p>
        `;

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

        const user =
        await checkUser();

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
