var xhttp = new XMLHttpRequest();

// VARIABLES
var timeOut = 60000*5;
// var timeOut = 5000;
let timerLogout;

var item1 = 0;
var item2 = 0;
var item3 = 0;
var item4 = 0;
var id = 999;
var clientName;

var sideMenu = false;

const searchBox1 = document.getElementById("searchBox");
searchBox1.addEventListener('input',function(){
    searchBox(searchBox1.value);
});

function orderAccepted(){
    //animated heart RANDOM ANIMATED EACH TIME
}

async function placeOrder(orderPack){
    orderAccepted();
    xhttp.open("GET", "./order/"+orderPack, true);
    xhttp.send();
    userLogout();
};

function cancelOrder(message){
    message.innerHTML = ("");
    message.classList.remove("messageBoxOn");
};

function orderConfirm(orderPack,abort){
    userAutoLogout(60000); // LOGOUT AFTER ONE MINUTE
    const message = document.getElementById("messageBox");
    if(abort){message.innerHTML=("");message.classList.remove("messageBoxOn");return};
    let buttonYes = document.createElement("button");
    let buttonNo = document.createElement("button");
    buttonYes.className = ("confirmButtons");
    buttonNo.className = ("confirmButtons");
    buttonYes.classList.add("confirmButtonsYes");
    buttonNo.classList.add("confirmButtonsNo");
    buttonYes.textContent = 'אשר רישום בכרטיס המיסים';
    buttonNo.textContent = 'בטל הזמנה בטל הכל לברוח לברוח';
    let i1 = orderPack[0][1];
    let i2 = orderPack[0][2];
    let i3 = orderPack[0][3];
    let i4 = orderPack[0][4];
    let price = (i1+i2+i3+i4)*10;
    message.innerHTML = ("   היי  "+clientName);
    message.innerHTML += ("<br>");
    message.innerHTML += ("נרשמה הזמנה המכילה :");
    message.innerHTML += ("<br>");
    if(i1!=0){message.innerHTML += ("בירה חצי "+i1);message.innerHTML += ("<br>");}
    if(i2!=0){message.innerHTML += ("בירה שליש "+i2);message.innerHTML += ("<br>");}
    if(i3!=0){message.innerHTML += ("כוס משקה "+i3);message.innerHTML += ("<br>");}
    if(i4!=0){message.innerHTML += ("פטריה "+i4);message.innerHTML += ("<br>");}
    message.innerHTML += ("<br>");
    if(price!=0){message.innerHTML += ("וסך הכל בשקלים זה: "+price);message.innerHTML += ("<br>");}
    message.innerHTML += ("האם אתה מאשר לרשום גביה");message.innerHTML += ("<br>");
    message.innerHTML += ("של סכום זה בכרטיס המיסים שלך? ");message.innerHTML += ("<br>");message.innerHTML += ("<br>");
    message.appendChild(buttonYes);
    message.appendChild(buttonNo);
    buttonYes.addEventListener("click",function(){
        placeOrder(orderPack);
        message.innerHTML = ("");
        message.classList.remove("messageBoxOn");
    });
    buttonNo.addEventListener("click",function(){
        message.innerHTML = ("");
        message.classList.remove("messageBoxOn");
        userLogout();
    });
    message.classList.add("messageBoxOn");   
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
        if(clientName==null){
            errorMessage(1);
            return;
        }
        if(item1+item2+item3+item4 == 0){
            errorMessage(2);
            return;
        }
        if(clientName!=null){
        var orderPack = [];
        orderPack.push([id,item1,item2,item3,item4]);
        orderConfirm(orderPack,false);
        add(101);
        }
    }
};

var limit = 0;
function searchBox(text){
    // const searchBox = document.getElementById("searchBox");
    let searchText = text;
    searchText = searchText.replace(/\\/g, '');
    searchText = searchText.replace(/\//g, '');
    searchText = searchText.replace(/[0-9]/g, '');
    searchText = searchText.replace(/\./g, '');
    searchText = searchText.replace(/\,/g, '');    
    searchText = searchText.replace(/\`/g, '');
    searchText = searchText.replace(/\"/g, '');
    searchText = searchText.substring(0,42);    
    searchBox1.value = searchText;
    searchText = searchText.replace(/\'/g, "''");
    if(searchText == ""){
        userSearchMessage(0);
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

function searchBoxClear(){
    const searchBox = document.getElementById("searchBox");
    if(searchBox.value == ""){
        userSearchMessage(0);
    }
};

function searchQuery(query,dest){
    let clients;
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            if(this.response == (JSON.stringify("clear"))){
                // console.log("CLEAR AUTOSEARCH");
                clients = null;
                clearAutoComplete(document.getElementById("autoComplete"));
                return;
            };
        clients = JSON.parse(this.response);
        if(clients[0] == null){
            userSearchMessage(1);
            };
        if(clients[0] != null){
            userSearchMessage(2);
            foundNames(query,clients,dest);
            };
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
    // console.log(clients);
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
            loginFunction(para.innerText);
            clearAutoComplete(autoDiv);
        }
    };
    if(names[0] == searchBox1.value){
        clearAutoComplete(autoDiv);        
        userSearchMessage(3);
        searchBox1.blur();
        loginFunction(names[0]);
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

function loginFunction(name){
    if(name != ""){
        name = name.replace(/\'/g, "''");
        name = JSON.stringify(name);
        xhttp.open("POST", "./searchName/"+name, true);
        xhttp.send();
    };
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        login = JSON.parse(this.response);        
        clientName = login[0].name;
        id = login[0].id;
        userLogged();
      };
    };
};

function userLogged(){
    userSearchMessage(3);
    searchBox1.style.backgroundColor = ("RGBA(255,100,255,0.5");
    userAutoLogout(0);
};

function userLogout(){
    searchBox1.value = ("");
    searchBox1.style.backgroundColor = ("RGBA(255,255,255,1");
    userSearchMessage(0);
    add(101);
    clientName = "";
    var empty = [0,0,0,0,0];
    orderConfirm(empty,true);
    timeOut = (60000*5);
};

function userAutoLogout(reset){
    if(reset != 0){
        clearTimeout(timerLogout);
        timeOut = reset;
    };    
    timerLogout = setTimeout(() => {
        userLogout();
    },timeOut);
};

function userSearchMessage(select){    
    let textBox = document.getElementById("searchBox");
    let userIndic = document.getElementById("userStateIndicator");
    if(select == 0){
        userIndic.classList.remove("userStateIndicatorNotOk");
        userIndic.classList.remove("userStateIndicatorOk");
        userIndic.classList.remove("userStateIndicatorSelect");
        userIndic.innerText = ("");
        searchBox1.style.backgroundColor = ("RGBA(255,255,255,1");

    }
    if(select == 1){
    userIndic.innerText = ("👎 שם לא סבבה 👎");
    userIndic.classList.remove("userStateIndicatorOk");
    userIndic.classList.remove("userStateIndicatorSelect");
    userIndic.classList.add("userStateIndicatorNotOk");
    searchBox1.style.backgroundColor = ("RGBA(255,255,255,1");
    }    
    if(select == 2){
        userIndic.innerText = ("☟ ☟ לבחור שם מהמאגר ☟ ☟");
        userIndic.classList.remove("userStateIndicatorNotOk");
        userIndic.classList.remove("userStateIndicatorOk");
        userIndic.classList.add("userStateIndicatorSelect");
        searchBox1.style.backgroundColor = ("RGBA(255,255,255,1");
    }
    if(select == 3){
        userIndic.innerText = ("👍 מה המצב");
        userIndic.classList.remove("userStateIndicatorNotOk");        
        userIndic.classList.remove("userStateIndicatorSelect");
        userIndic.classList.add("userStateIndicatorOk");
    }
};

function errorMessage(value){
    const message = document.getElementById("errorMessage");
    if(value == 1){
        message.innerText = ("לא הכנסת שם");
        message.classList.add("errorMessageOn");
        closeErrorMessage(message);
    };
    if(value == 2){
        message.innerText = ("לא שתית כלום");
        message.classList.add("errorMessageOn");
        closeErrorMessage(message);
    };
};

function closeErrorMessage(message){
    setTimeout(() => {
        message.innerText = ("");
        message.classList.remove("errorMessageOn");
    },3000);
};

function autoCloseTextBox(message){    
    setTimeout(function(){
        message.classList.remove("messageBoxOn");
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