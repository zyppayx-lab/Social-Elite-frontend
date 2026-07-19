const SUPABASE_URL = "https://dohxtukzxopwkvxeppdl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";


const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);



const notificationList =
document.getElementById("notificationList");



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






function formatDate(date){


    return new Date(date)
    .toLocaleString();


}







async function loadNotifications(){


    try{


        const request =
        supabaseClient
        .from("notifications")
        .select(`
            id,
            title,
            message,
            type,
            is_read,
            created_at,
            metadata
        `)
        .eq(
            "user_id",
            currentUser.id
        )
        .order(
            "created_at",
            {
                ascending:false
            }
        );



        const timeout =
        new Promise((_,reject)=>{


            setTimeout(()=>{


                reject(
                new Error(
                "Notification timeout"
                )
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





        if(!data || data.length===0){


            notificationList.innerHTML = `

            <p class="empty-state">
            No notifications yet
            </p>

            `;


            return;


        }






        notificationList.innerHTML="";





        data.forEach(notification=>{



            notificationList.innerHTML += `


            <div class="notification-item 
            ${notification.is_read ? "read":"unread"}">



                <div class="notification-title">


                    <h3>
                    ${notification.title}
                    </h3>



                    ${
                    notification.is_read
                    ?
                    ""
                    :
                    `<span class="badge">
                    New
                    </span>`
                    }


                </div>




                <p class="notification-message">

                ${notification.message}

                </p>




                <p class="notification-date">

                ${formatDate(
                notification.created_at
                )}

                </p>





                ${
                notification.is_read
                ?
                ""
                :
                `

                <button 
                class="mark-read-btn"
                onclick="markAsRead('${notification.id}')">

                Mark as read

                </button>

                `
                }


            </div>


            `;



        });





    }catch(error){


        console.error(error);



        notificationList.innerHTML = `

        <p class="empty-state">
        Failed to load notifications
        </p>

        `;


    }



}








async function markAsRead(id){



    try{


        const {error} =
        await supabaseClient
        .from("notifications")
        .update({

            is_read:true

        })
        .eq(
            "id",
            id
        )
        .eq(
            "user_id",
            currentUser.id
        );




        if(error){

            throw error;

        }



        loadNotifications();




    }catch(error){


        console.error(error);

        alert(
        "Failed to update notification"
        );


    }



}







async function init(){


    currentUser =
    await getUser();



    if(!currentUser){

        return;

    }



    await loadNotifications();



}




init();
