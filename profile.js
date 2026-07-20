const SUPABASE_URL = "https://dohxtukzxopwkvxeppdl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";


const DEFAULT_AVATAR = 
"https://dohxtukzxopwkvxeppdl.supabase.co/storage/v1/object/public/avatars/default/file_00000000030071f48c3dadbbb5162e4f.jpg";



const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);



const profileAvatar = document.getElementById("profileAvatar");

const avatarInput = document.getElementById("avatarInput");

const changeAvatarBtn = document.getElementById("changeAvatarBtn");

const fullNameInput = document.getElementById("fullName");

const emailInput = document.getElementById("email");

const createdAtInput = document.getElementById("createdAt");

const referralCodeElement = document.getElementById("referralCode");

const editProfileBtn = document.getElementById("editProfileBtn");

const saveProfileBtn = document.getElementById("saveProfileBtn");



let currentUser = null;




async function getUser(){


    const {data,error} =
    await supabaseClient.auth.getUser();



    if(error || !data.user){

        window.location.href="login.html";
        return null;

    }


    return data.user;


}





async function loadProfile(){


    try{


        const request =
        supabaseClient
        .from("profiles")
        .select(`
            email,
            full_name,
            avatar_url,
            referral_code,
            created_at
        `)
        .eq("id",currentUser.id)
        .single();




        const timeout =
        new Promise((_,reject)=>{

            setTimeout(()=>{

                reject(
                new Error("Profile loading timeout")
                );

            },8000);


        });




        const {data,error} =
        await Promise.race([
            request,
            timeout
        ]);



        if(error){

            throw error;

        }



        profileAvatar.src =
        data.avatar_url || DEFAULT_AVATAR;



        fullNameInput.value =
        data.full_name || "";



        emailInput.value =
        data.email || currentUser.email;



        createdAtInput.value =
        new Date(data.created_at)
        .toLocaleDateString();



        referralCodeElement.textContent =
        data.referral_code || "Unavailable";



    }catch(error){


        console.error(error);


        profileAvatar.src =
        DEFAULT_AVATAR;


    }



}






changeAvatarBtn.addEventListener(
"click",
()=>{

    avatarInput.click();

});






avatarInput.addEventListener(
"change",
async()=>{


    const file =
    avatarInput.files[0];



    if(!file){

        return;

    }



    try{


        const filePath =
        `${currentUser.id}/avatar.png`;




        const {error:uploadError} =
        await supabaseClient
        .storage
        .from("avatars")
        .upload(
            filePath,
            file,
            {
                upsert:true
            }
        );



        if(uploadError){

            throw uploadError;

        }



        const {data:urlData} =
        supabaseClient
        .storage
        .from("avatars")
        .getPublicUrl(
            filePath
        );



        const avatarUrl =
        urlData.publicUrl;



        const {error:updateError} =
        await supabaseClient
        .from("profiles")
        .update({

            avatar_url: avatarUrl

        })
        .eq(
            "id",
            currentUser.id
        );



        if(updateError){

            throw updateError;

        }



        profileAvatar.src =
        avatarUrl;



        alert("Avatar updated successfully");



    }catch(error){


        console.error(error);

        alert("Failed to update avatar");


    }



});







editProfileBtn.addEventListener(
"click",
()=>{


    fullNameInput.disabled=false;

    saveProfileBtn.classList.remove(
        "hidden"
    );


});







saveProfileBtn.addEventListener(
"click",
async()=>{


    const name =
    fullNameInput.value.trim();



    const {error} =
    await supabaseClient
    .from("profiles")
    .update({

        full_name:name

    })
    .eq(
        "id",
        currentUser.id
    );



    if(error){

        console.error(error);

        alert("Failed to save");

        return;

    }



    fullNameInput.disabled=true;

    saveProfileBtn.classList.add(
        "hidden"
    );


    alert("Profile updated");


});








async function init(){


    currentUser =
    await getUser();



    if(!currentUser){

        return;

    }



    await loadProfile();


}



init();
