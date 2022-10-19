// ===== Scroll to Top ==== 
$(window).scroll(function() {
    if ($(this).scrollTop() >= 50) {
        $('#return-to-top').fadeIn(400);
    } else {
        $('#return-to-top').fadeOut(400);
    }
});
$('#return-to-top').click(function() {
    $('body,html').animate({
        scrollTop : 0
    }, 500);
});

var xhttp = new XMLHttpRequest();

// VARIABLES
var item1 = 0;
var item2 = 0;
var item3 = 0;
var item4 = 0;
var id = 26;
var name;

// FUNCTIONS TO RUN SERVER ACTIONS
async function placeOrder(orderPack){  
    xhttp.open("GET", "./order/"+orderPack, true);
    xhttp.send();    

    // $.get('./order/'+orderPack, async function (response) {
    //     //place order at server
    // }).then( function (response) {
    //     document.getElementById('searchBox').value = "";
    //     searchBox();        
    // }).catch(function (error){
    //     console.log(error);
    // })
};

function add(item){    
    const count1 = document.getElementById("count1");
    const count2 = document.getElementById("count2");
    const count3 = document.getElementById("count3");
    const count4 = document.getElementById("count4");
    const buttonsDiv = document.getElementById("buttons");
    if(item==1){        
            item1 = item1+1;
            count1.innerText = item1;
        }        
    
    if(item==2){        
            item2 = item2+1;
            count2.innerText = item2;
        }
    
    if(item==3){        
            item3 = item3+1;
            count3.innerText = item3;
        }
    
    if(item==4){

            item4 = item4+1;
            count4.innerText = item4;
        }
    
    if(item==101){
        item1 = 0;
        item2 = 0;
        item3 = 0;
        item4 = 0;
        count1.innerText = "";
        count2.innerText = "";
        count3.innerText = "";
        count4.innerText = "";
    }
    if(item==100){
        var answer = window.confirm(msg1);
        if (answer) {
            var orderPack = [];
            orderPack.push([id,item1,item2,item3,item4]);
            placeOrder(orderPack);
            add(101);
        }
        else {
            add(101);
        }
    }
}

async function getName(id){
    
}

var limit = 0;
function searchBox(){
    const searchBox = document.getElementById("searchBox");
    let searchText = searchBox.value;
    searchText = searchText.replace(/\\/g, '');
    searchText = searchText.replace(/\//g, '');
    searchText = searchText.replace(/[0-9]/g, '');
    searchText = searchText.replace(/\./g, '');
    searchText = searchText.replace(/\,/g, '');
    searchText = searchText.replace(/\'/g, '');
    searchText = searchText.replace(/\`/g, '');
    searchText = searchText.replace(/\"/g, '');
    searchText = searchText.substring(0,42);    
    searchBox.value = searchText;
    if(searchText == ""){
        searchText = "-";
    };
    if(limit == 0){
        limit = 1;        
        setTimeout(() => {
            limit = 0;
            searchQuery(searchText,searchBox);
        },250);
    }
};

function searchQuery(query,dest){
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        //   console.log(this.response);
          let clients = JSON.parse(this.response);
        //   console.log(clients);
        if(clients[0] != null){
            foundNames(query,clients,dest);
        }          
        }
      };
    if(query != ""){
        xhttp.open("POST", "./searchName/"+query, true);
        xhttp.send();
    }    
};

function foundNames(query,clients,dest){    
    console.log(clients);
    names = [];
    for(i=0;i<clients.length;i++){
        names.push(clients[i].name);
    }
    console.log(names)
    dest.value = names[0];
    autoComplete(names);
}

function autoComplete(names){
    const autoDiv = document.getElementById("autoComplete");
    while (autoDiv.hasChildNodes()) {
        autoDiv.removeChild(autoDiv.firstChild);
      }
    for(i=0;i<names.length;i++){
        const para = document.createElement("p");
        para.innerText = names[i];
        autoDiv.appendChild(para);
    };
}