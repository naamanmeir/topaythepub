var xhttp = new XMLHttpRequest();

// VARIABLES
var timeOut = 60000*5;
let timerLogout;

var item1 = 0;
var item2 = 0;
var item3 = 0;
var item4 = 0;
var id = 999;
var clientName;
var clientNick;

var sideMenu = false;

var fs = false;

var limit = 0; // throttle limiter for db

function fullScreen(){
    if(!fs){
        setTimeout(function(){
            document.getElementById("fs_mark").style.backgroundImage="url(img/fs1.png)";
            document.getElementById("fs_mark").innerText=("חלון");
            document.body.requestFullscreen();
            window.scrollTo(0,200);
            closeNav();
            fs = true;
        },100);
    }
    if(fs){
        setTimeout(function(){
            document.getElementById("fs_mark").style.backgroundImage="url(img/fs2.png)";
            document.getElementById("fs_mark").innerText=("מסך מלא");
            document.exitFullscreen();
            window.scrollTo(0,200);
            closeNav();
            fs = false;
        },100);
    }

}

function fullScreenOff(){
    window.addEventListener("click" ,function(){
        setTimeout(function(){
            document.body.requestFullscreen();
            window.scrollTo(0,200);
        },100);
        setTimeout(function(){        
            window.scrollTo(0,1);
        },200);
    });
};

const searchBox1 = document.getElementById("searchBox");
searchBox1.addEventListener('focus',function(){
    searchBoxClear();
    if(searchBox1.value.length==0){userSearchMessage(0);};
    if(searchBox1.value.length>0){searchBox1.placeholder=("");};
});
searchBox1.addEventListener('blur',function(){
    searchBoxClear();
    searchBox1.placeholder=("לכתוב פה את השם שלכם✍👉👉");
});
searchBox1.addEventListener('input',function(){
    searchBoxClear();    
    if(searchBox1.value.length==0){userSearchMessage(0);};
    if(searchBox1.value.length>0){searchBox1.placeholder=("");};
    searchBox(searchBox1.value);    
});

function afterOrderAnimation(){
    const holder = document.createElement('img');
    let rnd1 = Math.floor(Math.random() * (20 - 1) + 1);
    let rnd2 = Math.floor(Math.random() * (6 - 1) + 1);
    rnd1 = ('0'+rnd1).slice(-2);
    const imgRnd = ("img/thank_"+rnd1+".png");
    const animRnd = ("animation"+rnd2);
    // const animRnd = ("animation1");
    holder.src = imgRnd;
    document.body.appendChild(holder);    
    holder.className = (animRnd);
    userLogout();
    pointerEnableIn(3000);
    allElements(1);    
};

function orderSubmitted(data){
    const window = document.createElement('div');
    const text = document.createElement('p');    
    text.innerHTML = (data.replace(/,/g,"<br>"))    
    text.classList = ("finaleMessageBoxText");    
    window.className = ("finaleMessageBox");    
    window.appendChild(text);
    document.body.appendChild(window);
    setTimeout(() => {
        text.remove();
        window.remove();
        afterOrderAnimation();
    },3000)
};

async function placeOrder(orderPack){
    
    xhttp.open("GET", "./order/"+orderPack, true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        // console.log("ORDER PASSED AND RESPONDED: "+this.response);
        orderSubmitted(this.response);
      };
    };    
};

function cancelOrder(message){
    allElements(1);
    message.innerHTML = ("");
    message.classList.remove("messageBoxOn");
    userLogout();
};

function orderConfirm(orderPack,abort){
    userAutoLogout(60000); // LOGOUT AFTER ONE MINUTE
    const message = document.getElementById("messageBox");    
    if(abort){message.innerHTML=("");message.classList.remove("messageBoxOn");return};
    let buttonYes = document.createElement("button");
    let buttonNo = document.createElement("button");
    const body = document.body;
    pointerNone(body);
    pointerAll(message)
    const items = document.getElementsByClassName("item");
    var itemsArray = Array.from(items);
    itemsArray.forEach(pointerNone);
    allElements(0);
    buttonYes.classList.add("enable-click");
    buttonNo.classList.add("enable-click");
    buttonYes.className = ("confirmButtons");
    buttonNo.className = ("confirmButtons");
    buttonYes.classList.add("confirmButtonsYes");
    buttonNo.classList.add("confirmButtonsNo");
    buttonYes.textContent = 'אשר רישום';
    buttonNo.textContent = 'בטל רישום';
    let i1 = orderPack[0][1];
    let i2 = orderPack[0][2];
    let i3 = orderPack[0][3];
    let i4 = orderPack[0][4];
    let price = (i1*10)+(i2*12)+i3+i4;
    message.innerHTML = ("<p2>   היי </p2>");
    message.innerHTML += ("<br>");
    message.innerHTML += ("<p5>"+clientName+"</p5>");
    message.innerHTML += ("<br>");    
    message.innerHTML += ("<p1> ההזמנה מכילה :</p1>");
    message.innerHTML += ("<br>");    
    if(i1!=0){message.innerHTML += ("<p2>"+itemName1+": </p2><p3>"+i1+"</p3>");message.innerHTML += ("<br>");}
    if(i2!=0){message.innerHTML += ("<p2>"+itemName2+": </p2><p3>"+i2+"</p3>");message.innerHTML += ("<br>");}
    if(i3!=0){message.innerHTML += ("<p2>"+itemName3+": </p2><p3>"+i3+"</p3>");message.innerHTML += ("<br>");}
    if(i4!=0){message.innerHTML += ("<p2>"+itemName4+": </p2><p3>"+i4+"</p3>");message.innerHTML += ("<br>");}
    message.innerHTML += ("<br>");
    if(price!=0){message.innerHTML += ("<p1>וסך הכל בשקלים זה: </p1>");message.innerHTML += ("<p4>"+price+"</p4><p2> שקלים</p2>");message.innerHTML += ("<br>");}
    message.innerHTML += ("<br>");
    message.innerHTML += ("<p1>האם לרשום גביה של "+price+" שקלים בכרטיס המיסים ? </p1>");message.innerHTML += ("<br>");message.innerHTML += ("<br>");
    message.appendChild(buttonYes);
    message.appendChild(buttonNo);
    buttonYes.addEventListener("click",function(){
        placeOrder(orderPack);
        message.innerHTML = ("");
        message.classList.remove("messageBoxOn");
    });
    buttonYes.addEventListener("touchend",function(){
        placeOrder(orderPack);
        message.innerHTML = ("");
        message.classList.remove("messageBoxOn");
    });
    buttonNo.addEventListener("click",function(){
        cancelOrder(message);
        message.innerHTML = ("");
        message.classList.remove("messageBoxOn");
        userLogout();
    });
    buttonNo.addEventListener("touchend",function(){
        cancelOrder(message);
        message.innerHTML = ("");
        message.classList.remove("messageBoxOn");
        userLogout();
    });
    message.classList.add("messageBoxOn");   
};

function add(item){
    if(sideMenu){return};
    searchBox1.blur();
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
            searchBox1.blur();
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
        // userLogout();
        return;
    }
    if(item==100){
        if(clientNick==null){
            errorMessage(1);
            return;
        }
        if(item1+item2+item3+item4 == 0){
            errorMessage(2);
            return;
        }
        if(clientNick!=null){
        var orderPack = [];
        orderPack.push([id,item1,item2,item3,item4]);
        orderConfirm(orderPack,false);
        add(101);
        }
    }
};

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
        },150);
    };
};

function searchBoxClear(){
    const searchBox = document.getElementById("searchBox");
    if(searchBox1.value.length==0){userSearchMessage(0);};
    if(searchBox.value == ""){userSearchMessage(0);};
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
        if(searchBox1.value.length==0){userSearchMessage(0);};
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
        names.push(clients[i].nick);
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
        if(i % 2 === 0){para.classList.add("autocomplete-itemsEven");}
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
    if(searchBox1.value.length==0){userSearchMessage(0);};
    if(searchBox1.value == ""){clearAutoComplete(autoDiv);}    
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
        clientNick = login[0].nick;
        clientName = login[0].name;        
        id = login[0].id;
        userLogged();
      };
    };
};

function userLogged(){
    userSearchMessage(3);
    searchBox1.blur();    
    searchBox1.classList.add("searchBoxLogged");
    userAutoLogout(0);
};

function userLogout(){
    searchBox1.value = ("");    
    userSearchMessage(0);
    add(101);
    clientName = null;
    clientNick = null;
    id = null;
    // var empty = [0,0,0,0,0];
    // orderConfirm(empty,true);
    const message = document.getElementById("messageBox");
    message.innerHTML=("");
    message.classList.remove("messageBoxOn");
    timeOut = (60000*5);
    pointerEnableIn(3000);
    allElements(1);
};

function userAutoLogout(reset){
    if(reset != 0){
        timeOut = reset;
    };
    clearTimeout(timerLogout);
    timerLogout = setTimeout(() => {
        if(clientName != null || clientNick != null){
        userLogout();
    }
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
    searchBox1.classList.add("searchBoxNotLogged");
    userIndic.placeholder=("");
    }    
    if(select == 2){
        userIndic.innerHTML = ("<img class='userStateIndicatorSelectimg1' "+
        "src='img/anim/finger_down.png'></img>"+
        "<img class='userStateIndicatorSelectimg2' src='img/anim/finger_down.png'>"+
        "</img><p>לבחור שם</p><img class='userStateIndicatorSelectimg3' "+
        "src='img/anim/finger_down.png'></img><img class='userStateIndicatorSelectimg4' "+
        "src='img/anim/finger_down.png'></img>");        
        userIndic.classList.remove("userStateIndicatorNotOk");
        userIndic.classList.remove("userStateIndicatorOk");
        userIndic.classList.add("userStateIndicatorSelect");
        userIndic.placeholder=("");
    }
    if(select == 3){
        userIndic.innerHTML = ("<p11>👍</p11><p12>👍</p12>");
        userIndic.classList.remove("userStateIndicatorNotOk");        
        userIndic.classList.remove("userStateIndicatorSelect");
        userIndic.classList.add("userStateIndicatorOk");
        userIndic.placeholder=("");
    }
};

function errorMessage(value){
    const message = document.getElementById("errorMessage");
    if(value == 1){
        message.innerText = ("צריך לכתוב קודם את השם שלכם");
        message.classList.add("errorMessageOn");
        closeErrorMessage(message);
    };
    if(value == 2){
        message.innerText = ("צריך לסמן כמה משקאות לקחתם");
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
    sideNav.style.transition = "all 0.5s";
    sideNav.style.width = "10rem";
    const out = document.getElementById("content");
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
//--------------GET USER INFO WITH ID SEND REQUEST----------------
async function getUserInfoById(){
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        uData = JSON.parse(this.response);
        // console.log(uData);
        userInfo (uData);
        };
      };
    if(id == null){return};
    xhttp.open("POST", "./getUserInfo/"+id, true);
    xhttp.send();
};
//-------------------PRINT USER INFO TO TABLE
async function userInfo(uData){    
    closeNav();
    const nameText = document.createElement('p');
    const closeButton = document.createElement('div');
    const nameNick = document.createElement('textarea');
    const tableDiv = document.createElement('div');
    const window = document.createElement('div');
    closeButton.innerText = ("X");
    nameText.innerHTML = (clientName.replace(/,/g,"<br>"));
    nameNick.value = (clientNick.replace(/,/g,"<br>"));
    closeButton.className = ("userInfoCloseButton");
    nameText.className = ("userInfoText");
    nameNick.className = ("userInfoChangeNick");
    tableDiv.className = ("userInfoTableDiv");      
    window.className = ("userInfo");
    window.appendChild(closeButton);
    window.appendChild(nameText);    
    window.appendChild(nameNick);
    window.appendChild(tableDiv);    
    document.body.appendChild(window);    
    const out = document.getElementById("content");    
    out.ondblclick =  (function(){        
        if(window){
            nameText.remove();
            closeButton.remove();
            nameNick.remove();
            tableDiv.remove();
            window.remove();
        }
    });
    closeButton.onclick =  (function(){        
        if(window){
            nameText.remove();
            closeButton.remove();
            nameNick.remove();
            tableDiv.remove();
            window.remove();
        }
    });
    const table = document.createElement("table");
    const tableBody = document.createElement("tbody");
    const TR = document.createElement("tr");
    TR.innerHTML = ("<th>שם</th><th>סכום</th><th>פריט 10</th><th>פריט 12</th><th>תאריך ושעה</th><th>תג רישום</th>");    
    TR.setAttribute("style", "background-color:lightblue;")
    tableBody.appendChild(TR);
    for(let i = 0;i < uData.length; i++){
        const row = document.createElement("tr"); 
        let rowInfo = Object.values(uData[i]);
        for (let j = 0; j < rowInfo.length; j++) {
            const cell = document.createElement("td");
            const cellText = document.createTextNode(rowInfo[j]);
            cell.appendChild(cellText);
            row.appendChild(cell);
        }
        row.setAttribute("dir","rtl");
        row.setAttribute("style", "background-color:lightskyblue;")
        if(i % 2 === 0  ){row.setAttribute("style", "background-color:lightblue;")}
    tableBody.appendChild(row);
    }
    table.appendChild(tableBody);    
    table.setAttribute("class", "userInfoTable");    
    tableDiv.appendChild(table);
};

function allElements(action){
    var searchBox = Array.from(document.getElementsByClassName("searchBox"));
    var userStateIndicator = Array.from(document.getElementsByClassName("userStateIndicator"))
    var items = Array.from(document.getElementsByClassName("items"));
    var buttons = Array.from(document.getElementsByClassName("buttons"));    
    var sidenav = Array.from(document.getElementsByClassName("sidenav"));    
    var elementOpen = Array.from(document.getElementsByClassName("elementOpen"));
    var classes = searchBox.concat(items,buttons,sidenav,elementOpen,userStateIndicator);
    if (action == 0){
        classes.forEach(elementOff);
    }
    if (action == 1){
        classes.forEach(elementOn);
    }    
};

function elementOff(element){
    element.classList.remove("opacityOn");
    element.classList.add("opacityOff");
};

function elementOn(element){
    element.classList.remove("opacityOff");
    element.classList.add("opacityOn");
};

function pointerAll(element){
    element.classList.remove("pointerNone");
    element.classList.add("pointerAll")
};

function pointerNone(element){
    element.classList.remove("pointerAll");
    element.classList.add("pointerNone")
};

function pointerEnableIn(i){
    setTimeout(() => {
        const body = document.body;
        pointerAll(body);
        const items = document.getElementsByClassName("item");
        var itemsArray = Array.from(items);
        itemsArray.forEach(pointerAll); 
    },i);
};