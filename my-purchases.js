const SUPABASE_URL = "https://dohxtukzxopwkvxeppdl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";


const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);



const purchaseList =
document.getElementById("purchaseList");


const filterButtons =
document.querySelectorAll(".filter-btn");



let currentUser = null;

let allPurchases = [];

let currentFilter = "all";







async function getUser(){


    const {data,error} =
    await supabaseClient.auth.getUser();



    if(error || !data.user){

        window.location.href="login.html";

        return null;

    }


    return data.user;


}







function formatMoney(amount){

    return "₦" + Number(amount || 0)
    .toLocaleString();

}




function formatDate(date){

    return new Date(date)
    .toLocaleString();

}









async function loadPurchases(){


    try{


        const request = Promise.all([



            // Social purchases

            supabaseClient
            .from("orders")
            .select(`
                id,
                total_amount,
                status,
                created_at,
                order_items(
                    price,
                    products(
                        name,
                        country
                    )
                )
            `)
            .eq(
                "user_id",
                currentUser.id
            ),




            // SMS purchases

            supabaseClient
            .from("sms_purchases")
            .select(`
                selling_price,
                status,
                service_code,
                phone_number,
                created_at
            `)
            .eq(
                "user_id",
                currentUser.id
            )



        ]);






        const timeout =
        new Promise((_,reject)=>{


            setTimeout(()=>{


                reject(
                new Error(
                "Purchase loading timeout"
                )
                );


            },10000);



        });






        const [
            ordersResult,
            smsResult

        ] = await Promise.race([
            request,
            timeout
        ]);





        allPurchases = [];







        // Social accounts

        if(ordersResult.data){



            ordersResult.data.forEach(order=>{



                order.order_items.forEach(item=>{



                    allPurchases.push({


                        type:"social",


                        title:
                        item.products?.name ||
                        "Social Account",


                        price:
                        item.price,


                        country:
                        item.products?.country ||
                        "",


                        status:
                        order.status,


                        date:
                        order.created_at



                    });



                });



            });


        }








        // SMS numbers

        if(smsResult.data){



            smsResult.data.forEach(item=>{



                allPurchases.push({


                    type:"sms",


                    title:
                    "SMS Number",


                    price:
                    item.selling_price,


                    service:
                    item.service_code,


                    phone:
                    item.phone_number,


                    status:
                    item.status,


                    date:
                    item.created_at



                });



            });


        }







        allPurchases.sort(
            (a,b)=>
            new Date(b.date)-new Date(a.date)
        );



        renderPurchases();





    }catch(error){


        console.error(error);



        purchaseList.innerHTML = `

        <p class="empty-state">
        Failed to load purchases
        </p>

        `;


    }



}









function renderPurchases(){



    let filtered =
    allPurchases;



    if(currentFilter !== "all"){


        filtered =
        allPurchases.filter(item=>
            item.type === currentFilter
        );


    }







    if(filtered.length===0){


        purchaseList.innerHTML = `

        <p class="empty-state">
        No purchases found
        </p>

        `;


        return;


    }






    purchaseList.innerHTML="";






    filtered.forEach(item=>{



        purchaseList.innerHTML += `


        <div class="purchase-item">



            <div class="purchase-top">


                <div class="purchase-title">

                ${item.title}

                </div>



                <div class="purchase-price">

                ${formatMoney(item.price)}

                </div>



            </div>





            <div class="purchase-info">



            ${
            item.country
            ?
            `Country: ${item.country}<br>`
            :
            ""
            }



            ${
            item.service
            ?
            `Service: ${item.service}<br>`
            :
            ""
            }




            Purchased:
            ${formatDate(item.date)}



            </div>




            <span class="status ${item.status}">

            ${item.status}

            </span>




        </div>


        `;



    });



}









filterButtons.forEach(button=>{


    button.addEventListener(
    "click",
    ()=>{


        filterButtons.forEach(btn=>
            btn.classList.remove("active")
        );



        button.classList.add("active");



        currentFilter =
        button.dataset.filter;



        renderPurchases();



    });


});








async function init(){


    currentUser =
    await getUser();



    if(!currentUser){

        return;

    }



    await loadPurchases();



}



init();
