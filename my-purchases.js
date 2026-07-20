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


        const {
            data,
            error
        } = await supabaseClient

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
        );





        if(error){

            throw error;

        }





        allPurchases = [];







        // Social accounts only

        if(data){


            data.forEach(order=>{


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
