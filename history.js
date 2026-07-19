const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";


const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);



const historyList =
document.getElementById("historyList");



const filterButtons =
document.querySelectorAll(".filter-btn");



let currentUser = null;

let allTransactions = [];

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









async function loadHistory(){


    try{


        const request = Promise.all([



            // Wallet transactions

            supabaseClient
            .from("wallet_transactions")
            .select(`
                type,
                amount,
                description,
                status,
                created_at
            `)
            .eq(
                "user_id",
                currentUser.id
            ),





            // Deposits

            supabaseClient
            .from("wallet_deposits")
            .select(`
                amount,
                status,
                payment_method,
                created_at
            `)
            .eq(
                "user_id",
                currentUser.id
            ),





            // Social orders

            supabaseClient
            .from("orders")
            .select(`
                total_amount,
                status,
                payment_method,
                created_at
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
                "History timeout"
                )
                );


            },10000);


        });





        const results =
        await Promise.race([
            request,
            timeout
        ]);



        const [
            wallet,
            deposits,
            orders,
            sms
        ] = results;





        allTransactions = [];







        // Wallet

        if(wallet.data){


            wallet.data.forEach(item=>{


                allTransactions.push({

                    title:
                    item.description ||
                    item.type,

                    amount:
                    item.amount,

                    category:
                    item.amount > 0 ?
                    "reward":
                    "purchase",

                    status:
                    item.status,

                    date:
                    item.created_at

                });


            });


        }








        // Deposits

        if(deposits.data){


            deposits.data.forEach(item=>{


                allTransactions.push({


                    title:
                    "Wallet Deposit",


                    amount:
                    item.amount,


                    category:
                    "deposit",


                    status:
                    item.status,


                    date:
                    item.created_at


                });


            });


        }








        // Orders

        if(orders.data){


            orders.data.forEach(item=>{


                allTransactions.push({


                    title:
                    "Social Account Purchase",


                    amount:
                    -Math.abs(item.total_amount),


                    category:
                    "purchase",


                    status:
                    item.status,


                    date:
                    item.created_at


                });



            });


        }








        // SMS

        if(sms.data){


            sms.data.forEach(item=>{


                allTransactions.push({


                    title:
                    "SMS Number Purchase",


                    amount:
                    -Math.abs(item.selling_price),


                    category:
                    "purchase",


                    status:
                    item.status,


                    date:
                    item.created_at


                });



            });


        }






        allTransactions.sort(
            (a,b)=>
            new Date(b.date)-new Date(a.date)
        );



        renderHistory();





    }catch(error){


        console.error(error);


        historyList.innerHTML = `

        <p class="empty-state">
        Failed to load history
        </p>

        `;


    }


}








function renderHistory(){


    let filtered =
    allTransactions;



    if(currentFilter !== "all"){


        filtered =
        allTransactions.filter(item=>
            item.category === currentFilter
        );


    }





    if(filtered.length===0){


        historyList.innerHTML = `

        <p class="empty-state">
        No transactions found
        </p>

        `;


        return;


    }






    historyList.innerHTML="";






    filtered.forEach(item=>{


        const income =
        Number(item.amount) > 0;



        historyList.innerHTML += `


        <div class="transaction-item">


            <div class="transaction-top">


                <div class="transaction-title">

                ${item.title}

                </div>



                <div class="
                transaction-amount
                ${income ? "income":"expense"}
                ">

                ${income ? "+" : "-"}
                ${formatMoney(Math.abs(item.amount))}

                </div>


            </div>




            <div class="transaction-info">

            ${formatDate(item.date)}

            </div>



            <span class="status 
            ${item.status}">

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



        renderHistory();



    });


});








async function init(){


    currentUser =
    await getUser();



    if(!currentUser){

        return;

    }



    await loadHistory();



}



init();
