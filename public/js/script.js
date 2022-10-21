var xhttp = new XMLHttpRequest();

// VARIABLES
var item1 = 0;
var item2 = 0;
var item3 = 0;
var item4 = 0;
var id = 999;
var clientName;

var sideMenu = false;

async function placeOrder(orderPack){  
    xhttp.open("GET", "./order/"+orderPack, true);
    xhttp.send();
};

function add(item){
    if(sideMenu){return};
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
        // var answer = window.confirm(msg1);
        if(clientName!=null){
        const message = document.getElementById("textbox");
        var orderPack = [];
        orderPack.push([id,item1,item2,item3,item4]);
        message.innerText = (" היי   "+clientName+" רשמנו לך הזמנה"+
        " כזאת האם סבבה "+orderPack); 
        placeOrder(orderPack);
        autoCloseTextBox(message);
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
    searchText = searchText.replace(/\`/g, '');
    searchText = searchText.replace(/\"/g, '');
    searchText = searchText.substring(0,42);    
    searchBox.value = searchText;
    searchText = searchText.replace(/\'/g, "''");
    if(searchText == ""){
        searchText = "-";
    };
    if(limit == 0){
        limit = 1;        
        setTimeout(() => {
            limit = 0;
            searchQuery(searchText,searchBox);
        },250);
    };
};

function searchQuery(query,dest){
    let clients;
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            if(this.response == (JSON.stringify("clear"))){
                console.log("CLEAR AUTOSEARCH");
                clients = null;
                clearAutoComplete(document.getElementById("autoComplete"));
                return;
            }
        clients = JSON.parse(this.response);        
        if(clients[0] != null){
            foundNames(query,clients,dest);
            }
        };
      };
    if(query != ""){
        query = JSON.stringify(query);
        xhttp.open("POST", "./searchName/"+query, true);
        xhttp.send();
    }else{
        clients = null;
        clearAutoComplete(document.getElementById("autoComplete"));
    };
};

function foundNames(query,clients,dest){    
    console.log(clients);
    names = [];
    for(i=0;i<clients.length;i++){
        names.push(clients[i].name);
    };
    autoComplete(names);
};

function autoComplete(names){
    const autoDiv = document.getElementById("autoComplete");
    clearAutoComplete(autoDiv);
    autoDiv.className = "autoCompleteSuggestions";
    for(i=0;i<names.length && i<15;i++){
        const para = document.createElement("p");
        para.className = "autocomplete-items";
        para.innerText = names[i];        
        autoDiv.appendChild(para);
        para.onclick = function () {
            copyTextToSearchBox(para.innerText);
            login(para.innerText);
            clearAutoComplete(autoDiv);
        }
    };
};

function clearAutoComplete(autoDiv){
    autoDiv.className = "autoCompleteNone";
    while (autoDiv.hasChildNodes()) {
        autoDiv.removeChild(autoDiv.firstChild);
      };
};

function copyTextToSearchBox(text){
    const searchBox = document.getElementById("searchBox");
    searchBox.value = text;
};

function login(name){
    console.log(name);

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        login = JSON.parse(this.response);
        console.log(login);
        clientName = login[0].name;
        id = login[0].id;
        console.log("id: "+id+" name: "+clientName);
      };
    };
    if(name != ""){
        name = name.replace(/\'/g, "''");
        name = JSON.stringify(name);
        xhttp.open("POST", "./searchName/"+name, true);
        xhttp.send();
    };
};

function autoCloseTextBox(message){
    setTimeout(function(){
        message.innerText = "";
    }, 5000);
};

function bgSelect(set){
    const background = document.getElementById("backgroundPanel");
    const textBackground = document.getElementsByClassName('textBackground1 textBackground2 textBackground3');
    let bg = ("background"+set);
    let tbg = ("textBackground"+set);    
    for(i=0;i<textBackground.length;i++){        
        console.log(textBackground[i]);
        textBackground[i].className = (tbg);
        console.log(textBackground[i].classList);
    };    
    background.className = (bg);    
};

function openNav() {
    sideMenu = true;
    const sideNav = document.getElementById("sideNav");
    sideNav.style.width = "10rem";
    const out = document.getElementById("gridContent");
    out.onclick =  (function(){
        if(sideNav.style.width == "10rem"){
            closeNav();
        }
});
};
  
function closeNav() {
    document.getElementById("sideNav").style.width = "0";
    sideMenu = false;
};