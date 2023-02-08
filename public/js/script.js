var xhttp = new XMLHttpRequest();

// VARIABLES
var timeOutDef = 40000; // 60000 *5;
var timeOut = timeOutDef;
let timerLogout;

var refreshDataIntervalTime = 120000;

// const refreshDataInterval = setInterval(startRefreshDataInterval, refreshDataIntervalTime);

var item1 = 0;
var item2 = 0;
var item3 = 0;
var item4 = 0;

let products = [];
let orderArray = [];
var clientId = 999;
var clientName;
var clientNick;

var sideMenu = false;

var fs = false;

const windowWidth = window.innerWidth + "px";
const windowHeight = window.innerHeight + "px";
var viewport = document.querySelector("meta[name=viewport]");
var limit = 0;

window.addEventListener('load', loadUtiliti, false);
// window.addEventListener("resize", windowSizeChanged);

function loadUtiliti() {
    setTimeout(function () {
        viewport.setAttribute("content", "width=" + window.innerWidth + ", height=" + window.innerHeight + ", initial-scale=1.0, maximum-scale=1.0, user-scalable=yes");
    }, 100);
    setTimeout(getProducts(), 300);    
    setTimeout(uiSidemenu(), 500);

    // setTimeout(displayItems(), 6200);
    // setTimeout(replaceItems(), 1600);

};

function getProducts() {
    xhttp.open("GET", "./clientGetProducts/", true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            products = JSON.parse(this.response);
            // console.log(products);
            displayItems();
            // replaceItems();
            return;
        }
    };
};

function generateRandomColor() {
    let maxVal = 0xFFFFFF; // 16777215
    let randomNumber = Math.random() * maxVal;
    randomNumber = Math.floor(randomNumber);
    randomNumber = randomNumber.toString(16);
    let randColor = randomNumber.padStart(6, 0);
    return `#${randColor.toUpperCase()}`
};

function windowSizeChanged() {
    viewport.setAttribute("content", "width=" + windowWidth + ", height=" + windowHeight + ", initial-scale=1.0, maximum-scale=1.0, user-scalable=no");
};

function fullScreen() {
    if (!fs) {
        document.body.requestFullscreen();
        setTimeout(function () {
            document.getElementById("fs_mark").style.backgroundImage = "url(img/fs1.png)";
            document.getElementById("fs_mark").innerText = ("חלון");
            // window.scrollTo(0,1);
            closeNav();
            fs = true;
            viewport.setAttribute("content", "width=" + window.innerWidth + ", height=" + window.innerHeight + ", initial-scale=1.0, maximum-scale=1.0, user-scalable=no");
        }, 300);
    }
    if (fs) {
        setTimeout(function () {
            document.getElementById("fs_mark").style.backgroundImage = "url(img/fs2.png)";
            document.getElementById("fs_mark").innerText = ("מסך מלא");
            document.exitFullscreen();
            // window.scrollTo(0,200);
            closeNav();
            fs = false;
        }, 300);
    }
};

function fullScreenOff() {
    window.addEventListener("click", function () {
        setTimeout(function () {
            document.body.requestFullscreen();
            window.scrollTo(0, 200);
        }, 100);
        setTimeout(function () {
            window.scrollTo(0, 1);
        }, 200);
    });
};

const searchBox1 = document.getElementById("searchBox");
searchBox1.addEventListener('focus', function () {
    searchBoxClear();
    if (searchBox1.value.length == 0) { userSearchMessage(0); };
    if (searchBox1.value.length > 0) { searchBox1.placeholder = (""); };
});
searchBox1.addEventListener('blur', function () {
    // searchBoxClear();
    searchBox1.placeholder = ("שלום הכניסו שם✍👉👉");
});
searchBox1.addEventListener('input', function () {
    // searchBoxClear();
    if (searchBox1.value.length == 0) { userSearchMessage(0); };
    // if(searchBox1.value.length>0){searchBox1.placeholder=("");};
    searchBox(searchBox1.value);
});
//---------------------UI-----------------------------

function uiSidemenu(){
    const sideNav = document.getElementById("sideNav");
    // sideNav.innerHTML = (`<a href="#" onclick="refreshPage()"">טען מחדש</a>`);
    sideNav.innerHTML += (`<a href="#" id="fs_mark" onclick="fullScreen()">מסך מלא</a>`);
    sideNav.innerHTML += (`<a href="#" class="hidden" id="user_info" onclick="getUserInfoById()">משתמש</a>`);
    // sideNav.innerHTML += (`<a href="#" onclick="bgSelect(0)" onclick="clearTimeout(window.tcm)"> שחור</a>`);
    // sideNav.innerHTML += (`<a href="#" onclick="bgSelect(2)" onclick="clearTimeout(window.tcm)"> ריבועים</a>`);
    // sideNav.innerHTML += (`<a href="#" onclick="bgSelect(3)" onclick="clearTimeout(window.tcm)"> טבעות</a>`);    
    // sideNav.innerHTML += (`<a href="#" onclick="bgSelect(1)" onclick="clearTimeout(window.tcm)"> עיגולים</a>`);
    sideNav.innerHTML += (`<a href="./logout"> התנתק</a>`);
    sideNav.innerHTML += (`<a href="javascript:void(0)" class="closebtn" onclick="closeNav()"><img src="img/ui/menu_close.png"></a>`);

};

function replaceItems() {
    var divs = document.getElementsByClassName('item');
    // console.log(divs);
    for (var i = 0; i < divs.length; i++) {
        var thisDiv = divs[i];
        randomTop = getRandomNumber(0, 12);
        randomLeft = getRandomNumber(0, 12);
        thisDiv.style.top = randomTop + "px";
        thisDiv.style.left = randomLeft + "px";
    }
    function getRandomNumber(min, max) {
        return Math.random() * (max - min) + min;
    }
};

function displayItems() {
    var items = document.getElementById('itemsDiv');
    while (items.firstChild) {
        items.removeChild(items.firstChild);
    };
    // console.log(products);
    products.forEach((item, index) => {
        // console.log(item);
        // console.log(index);
        let itemDiv = document.createElement("div");
        itemDiv.innerHTML = (`<p class="itemName" id="name${index}">${item[1]}</p>;
        <img src="${item[3]}" onmousedown="addItem(${index})">
        <p class="itemPrice p2">₪${item[2]}</p>
        <count class="counts" id="count${index}"></count>        
        `);
        itemDiv.className = ("item");
        items.appendChild(itemDiv);
        itemDiv.onclick = function () {
            addItem(index);
        };
        // replaceItems();
    });
};

function refreshPage(){
    location.reload();
};

//-------------NOT--------------UI--------------
function afterOrderAnimation() {
    const holder = document.createElement('img');
    let rnd1 = Math.floor(Math.random() * (20 - 1) + 1);
    let rnd2 = Math.floor(Math.random() * (6 - 1) + 1);
    rnd1 = ('0' + rnd1).slice(-2);
    const imgRnd = ("img/outro/thank_" + rnd1 + ".png");
    const animRnd = ("animation" + rnd2);
    // const animRnd = ("animation1");
    holder.src = imgRnd;
    holder.className = ("endAnimation");
    document.body.appendChild(holder);
    holder.classList.add("imgFill");
    holder.classList.add(animRnd);
    userLogout();
    pointerEnableIn(3000);
    setTimeout(() => {
        allElements(1);
    }, 2500)
};

function orderSubmitted(data) {
    const window = document.createElement('div');
    const text = document.createElement('p');
    text.innerHTML = (data.replace(/,/g, "<br>"))
    text.classList = ("finaleMessageBoxText");
    window.className = ("finaleMessageBox");
    window.appendChild(text);
    document.body.appendChild(window);
    setTimeout(() => {
        text.remove();
        window.remove();
        afterOrderAnimation();
    }, 1500)
};

async function placeOrder(orderPack) {

    xhttp.open("GET", "./order/" + orderPack, true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // console.log("ORDER PASSED AND RESPONDED: "+this.response);
            orderSubmitted(this.response);
        };
    };
};

function cancelOrder(message) {
    allElements(1);
    message.innerHTML = ("");
    message.classList.remove("messageBoxOn");
    userLogout();
};

function orderConfirm(orderArray2, abort) {
    userAutoLogout(60000); // LOGOUT AFTER ONE MINUTE
    // console.log("orderConfirm");
    const message = document.getElementById("messageBox");
    if (abort) { message.innerHTML = (""); message.classList.remove("messageBoxOn"); return };
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
    // console.log(orderArray2);
    message.innerHTML = ("<p2>   היי </p2>");
    message.innerHTML += ("<br>");
    message.innerHTML += ("<p5>" + clientName + "</p5>");
    message.innerHTML += ("<br>");
    message.innerHTML += ("<p1> ההזמנה מכילה :</p1>");
    message.innerHTML += ("<br>");
    let finalPrice = 0;
    let orderComplete = [];
    for (let i = 0; i < orderArray2.length; i++) {
        if (orderArray2[i]) {
            let itemCount = orderArray2[i][0];
            let itemName = orderArray2[i][1];
            let itemPrice = orderArray2[i][2];
            let totalPrice = (itemCount * itemPrice);
            // console.log(itemCount,itemName,itemPrice,totalPrice)
            finalPrice += totalPrice;
            message.innerHTML += ("<p2>" + itemName + ": </p2><p3>" + itemCount + "</p3><p2>  בשווי: </p2><p3>" + totalPrice + "</p3><p2> ₪ </p2>"); message.innerHTML += ("<br>");
            let orderRow = [itemCount, itemName];
            orderComplete.push([orderRow])
        }
    };
    message.innerHTML += ("<br>");
    if (finalPrice != 0) { message.innerHTML += ("<p1>וסך הכל בשקלים זה: </p1>"); message.innerHTML += ("<p4>" + finalPrice + "</p4><p2> שקלים</p2>"); message.innerHTML += ("<br>"); }
    message.innerHTML += ("<br>");
    message.innerHTML += ("<p1>האם לרשום גביה של " + finalPrice + " שקלים? </p1>"); message.innerHTML += ("<br>"); message.innerHTML += ("<br>");
    message.appendChild(buttonYes);
    message.appendChild(buttonNo);
    // let orderComplete = [orderArray2,finalPrice];
    orderComplete.push([finalPrice]);
    orderComplete.push([clientId]);
    // console.log(orderComplete);
    buttonYes.addEventListener("click", function () {
        vibrate(75);
        placeOrder(orderComplete);
        message.innerHTML = ("");
        message.classList.remove("messageBoxOn");
    });
    buttonYes.addEventListener("touchend", function () {
        vibrate(75);
        placeOrder(orderComplete);
        message.innerHTML = ("");
        message.classList.remove("messageBoxOn");
    });
    buttonNo.addEventListener("click", function () {
        vibrate(175);
        cancelOrder(message);
        message.innerHTML = ("");
        message.classList.remove("messageBoxOn");
        userLogout();
    });
    buttonNo.addEventListener("touchend", function () {
        vibrate(175);
        cancelOrder(message);
        message.innerHTML = ("");
        message.classList.remove("messageBoxOn");
        userLogout();
    });
    message.classList.add("messageBoxOn");
};

function addItem(item) {
    if (sideMenu) { return };
    const counts = document.getElementsByClassName("counts");
    if (counts[item].innerText == "" || counts[item].innerText == null) {
        counts[item].innerText = 1;
    } else {
        let current = counts[item].innerText;
        if (current < 99) counts[item].innerText = (parseInt(current) + 1);
    }
    let itemsBought = parseInt(counts[item].innerText);
    orderArray[item] = [itemsBought, products[item][1], products[item][2]];
}

function orderButtons(btn) {
    if (btn == 2) { // CANCEL ITEMS AND CLEAR ARRAY        
        let counts = document.getElementsByClassName("counts");        
        counts = [].slice.call(counts);
        counts.forEach(removeItems);
        orderArray = [];
        vibrate(75);
        return;
    }
    if (btn == 1) { // PLACE ORDER IF ENOUGHT DATA
        vibrate(200);
        if (clientNick == null) {
            errorMessage(1);
            return;
        }
        if (orderArray == "" || orderArray == null) {
            vibrate(200);
            errorMessage(2);
            return;
        }
        orderConfirm(orderArray, false);
    }
}

function removeItems(item){
    item.innerText = "";
}

// function add(item) {
//     if (sideMenu) { return };
//     const counts = document.getElementsByClassName("counts");
//     const buttonsDiv = document.getElementById("buttons");
//     if (item == 0) {
//         if (item1 == 99) { return };
//         vibrate(45);
//         item1 = item1 + 1;
//         counts[0].innerText = item1;
//     }
//     if (item == 1) {
//         if (item2 == 99) { return };
//         vibrate(55);
//         item2 = item2 + 1;
//         counts[1].innerText = item2;
//     }
//     if (item == 2) {
//         if (item3 == 99) { return };
//         vibrate(65);
//         item3 = item3 + 1;
//         counts[2].innerText = item3;
//     }
//     if (item == 3) {
//         if (item4 == 99) { return };
//         vibrate(75);
//         item4 = item4 + 1;
//         counts[3].innerText = item4;
//     }
//     if (item == 101) {
//         vibrate(75);
//         orderArray = [];
//         // userLogout();
//         return;
//     }
//     if (item == 100) {
//         vibrate(200);
//         if (clientNick == null) {
//             errorMessage(1);
//             return;
//         }
//         if (item1 + item2 + item3 + item4 == 0) {
//             vibrate(200);

//             errorMessage(2);
//             return;
//         }
//         if (clientNick != null) {
//             vibrate(75);
//             var orderPack = [];
//             orderPack.push([clientId, item1, item2, item3, item4]);
//             orderConfirm(orderPack, false);
//             add(101);
//         }
//     }
// };

function vibrate(length) {
    if (!("vibrate" in navigator)) { console.log("Vibrate not supported!"); return; }
    navigator.vibrate(length);
};

function searchBox(text) {
    userAutoLogout(25000);
    let searchText = text;
    searchText = searchText.replace(/\\/g, '');
    searchText = searchText.replace(/\//g, '');
    searchText = searchText.replace(/[0-9]/g, '');
    searchText = searchText.replace(/\./g, '');
    searchText = searchText.replace(/\,/g, '');
    searchText = searchText.replace(/\`/g, '');
    searchText = searchText.replace(/\"/g, '');
    searchText = searchText.substring(0, 42);
    searchBox1.value = searchText;
    searchText = searchText.replace(/\'/g, "''");
    if (searchText == "") {
        userSearchMessage(0);
        searchText = "-";
        userLogout();
    };
    if (limit == 0) {
        limit = 1;
        setTimeout(() => {
            limit = 0;
            searchQuery(searchText, searchBox);
        }, 250);
    };
};

function searchBoxClear() {
    clearAutoComplete(document.getElementById("autoComplete"));
    const searchBox = document.getElementById("searchBox");
    if (searchBox1.value.length == 0) { userSearchMessage(0); };
    if (searchBox.value == "") { userSearchMessage(0); };
};

function searchQuery(query, dest) {
    let clients;
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if (this.response == (JSON.stringify("clear"))) {
                // console.log("CLEAR AUTOSEARCH");
                clients = null;
                clearAutoComplete(document.getElementById("autoComplete"));
                return;
            };
            clients = JSON.parse(this.response);
            if (searchBox1.value.length == 0 | searchBox1.value.length < 1) { userSearchMessage(0); };
            if (clients[0] == null) {
                userSearchMessage(1);
            };
            if (clients[0] != null) {
                userSearchMessage(2);
                foundNames(query, clients, dest);
            };
        };
    };
    if (query != "") {
        query = JSON.stringify(query);
        xhttp.open("POST", "./searchName/" + query, true);
        xhttp.send();
    } else {
        clients = null;
        clearAutoComplete(document.getElementById("autoComplete"));
    };
};

function foundNames(query, clients, dest) {
    // console.log(clients);
    names = [];
    for (i = 0; i < clients.length; i++) {
        names.push(clients[i].nick);
    };
    autoComplete(names);
};

function autoComplete(names) {
    const autoDiv = document.getElementById("autoComplete");
    clearAutoComplete(autoDiv);
    autoDiv.className = "autoCompleteSuggestions";
    for (i = 0; i < names.length && i < 4; i++) {
        const para = document.createElement("p");
        para.className = "autocomplete-items";
        if (i % 2 === 0) { para.classList.add("autocomplete-itemsEven"); }
        para.innerText = names[i];
        autoDiv.appendChild(para);
        para.onclick = function () {
            copyTextToSearchBox(para.innerText);
            loginFunction(para.innerText);
            clearAutoComplete(autoDiv);
        }
    };
    if (names[0] == searchBox1.value) {
        clearAutoComplete(autoDiv);
        userSearchMessage(3);
        searchBox1.blur();
        loginFunction(names[0]);
    };
    if (searchBox1.value.length == 0) { userSearchMessage(0); };
    if (searchBox1.value == "") { clearAutoComplete(autoDiv); }
};

function clearAutoComplete(autoDiv) {
    autoDiv.className = "autoCompleteNone";
    while (autoDiv.hasChildNodes()) {
        autoDiv.removeChild(autoDiv.firstChild);
    };
};

function copyTextToSearchBox(text) {
    const searchBox = document.getElementById("searchBox");
    searchBox.value = text;
};

function loginFunction(name) {
    if (name != "") {
        name = name.replace(/\'/g, "''");
        name = JSON.stringify(name);
        xhttp.open("POST", "./searchName/" + name, true);
        xhttp.send();
    };
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            login = JSON.parse(this.response);
            clientNick = login[0].nick;
            clientName = login[0].name;
            clientId = login[0].id;
            userLogged();
        };
    };
};

function userLogged() {
    userSearchMessage(3);
    searchBox1.blur();
    searchBox1.classList.add("searchBoxLogged");
    searchBox1.classList.remove("searchBoxNotLogged");
    document.getElementById("user_info").style.display = "block";
    userAutoLogout(45000);
    // stopRefreshDataInterval();
};

function userLogout() {
    searchBox1.value = ("");
    userSearchMessage(0);
    orderButtons(2);
    // add(101);
    clientName = null;
    clientNick = null;
    clientId = null;
    const message = document.getElementById("messageBox");
    message.innerHTML = ("");
    message.classList.remove("messageBoxOn");
    searchBox1.classList.remove("searchBoxLogged");
    searchBox1.classList.add("searchBoxNotLogged");
    document.getElementById("user_info").style.display = "none";
    if (document.getElementsByClassName("userInfo")[0]) {
        document.getElementsByClassName("userInfoCloseButton")[0].remove();;
        document.getElementsByClassName("userInfoText")[0].remove();;
        document.getElementsByClassName("userInfoChangeNick")[0].remove();;
        document.getElementsByClassName("userInfoTableDiv")[0].remove();;
        document.getElementsByClassName("userInfo")[0].remove();
    }
    clearAutoComplete(document.getElementById("autoComplete"))
    timeOut = timeOutDef;
    pointerEnableIn(3000);
    getProducts();
    displayItems();
    // startRefreshDataInterval();
    allElements(1);
};

function userAutoLogout(reset) {
    if (reset != 0) {
        timeOut = reset;
    };
    clearTimeout(timerLogout);
    timerLogout = setTimeout(() => {
        userLogout();
    }, timeOut);
};

// function startRefreshDataInterval() {
//     if (refreshDataInterval){clearInterval(refreshDataInterval);}
//     const refreshDataInterval = setInterval(function () {
//         getProducts();
//         displayItems();
//     }, refreshDataIntervalTime);
// };

// function stopRefreshDataInterval() {
//     clearInterval(refreshDataInterval);
// };

function userSearchMessage(select) {
    let textBox = document.getElementById("searchBox");
    let userIndic = document.getElementById("userStateIndicator");
    if (select == 0) {
        userIndic.classList.remove("userStateIndicatorNotOk");
        userIndic.classList.remove("userStateIndicatorOk");
        userIndic.classList.remove("userStateIndicatorSelect");
        userIndic.innerText = ("");
    }
    if (select == 1) {
        userIndic.innerText = ("👎 שם לא ברשימה 👎");
        userIndic.classList.remove("userStateIndicatorOk");
        userIndic.classList.remove("userStateIndicatorSelect");
        userIndic.classList.add("userStateIndicatorNotOk");
        searchBox1.classList.add("searchBoxNotLogged");
        userIndic.placeholder = ("");
        clearAutoComplete(document.getElementById("autoComplete"));
    }
    if (select == 2) {
        userIndic.innerHTML = ("<img class='userStateIndicatorSelectimg1' " +
            "src='img/anim/finger_down.png'></img>" +
            "<img class='userStateIndicatorSelectimg2' src='img/anim/finger_down.png'>" +
            "</img><p>לבחור שם</p><img class='userStateIndicatorSelectimg3' " +
            "src='img/anim/finger_down.png'></img><img class='userStateIndicatorSelectimg4' " +
            "src='img/anim/finger_down.png'></img>");
        userIndic.classList.remove("userStateIndicatorNotOk");
        userIndic.classList.remove("userStateIndicatorOk");
        userIndic.classList.add("userStateIndicatorSelect");
        userIndic.placeholder = ("");
    }
    if (select == 3) {
        userIndic.innerHTML = ("<p11>👍</p11><p12>👍</p12>");
        userIndic.classList.remove("userStateIndicatorNotOk");
        userIndic.classList.remove("userStateIndicatorSelect");
        userIndic.classList.add("userStateIndicatorOk");
        userIndic.placeholder = ("");
    }
};

function errorMessage(value) {
    const message = document.getElementById("errorMessage");
    if (value == 1) {
        message.innerText = ("צריך להכניס שם");
        message.classList.add("errorMessageOn");
        closeErrorMessage(message);
    };
    if (value == 2) {
        message.innerText = ("צריך לסמן מה לקחתם");
        message.classList.add("errorMessageOn");
        closeErrorMessage(message);
    };
};

function closeErrorMessage(message) {
    setTimeout(() => {
        message.innerText = ("");
        message.classList.remove("errorMessageOn");
    }, 3000);
};

function autoCloseTextBox(message) {
    setTimeout(function () {
        message.classList.remove("messageBoxOn");
        message.innerText = "";
    }, 5000);
};

function bgSelect(set) {
    const background1 = document.getElementById("backgroundPanel1");
    const background2 = document.getElementById("backgroundPanel2");
    const background0 = document.getElementById("backgroundPanel0");
    if (set == 0) {
        background1.style.display = ("none");
        background2.style.display = ("none");
        background0.style.display = ("block");
        background0.className = ("background0");
        return;
    }
    if (set == 1) {
        background1.style.display = ("block");
        background1.className = ("background1");
        background2.style.display = ("none");
        background0.style.display = ("none");

    }
    if (set == 2) {
        background2.style.display = ("block");
        background2.className = ("background2");
        background1.style.display = ("none");
        background0.style.display = ("none");
    }
    if (set == 3) {
        background1.style.display = ("none");
        background2.style.display = ("block");
        background2.className = ("background3");
        background0.style.display = ("none");
    }
    return;
};

function openNav() {
    sideMenu = true;
    const sideNav = document.getElementById("sideNav");
    sideNav.style.transition = "all 0.5s";
    sideNav.style.width = "10rem";
    sideNav.style.borderWidth = "2px";
    const out = document.getElementById("content");
    out.onclick = (function () {
        if (sideNav.style.width == "10rem") {
            closeNav();
        }
    });
};

function closeNav() {
    document.getElementById("sideNav").style.width = "0";
    sideMenu = false;
    sideNav.style.borderWidth = "0px";
};
//--------------GET USER INFO WITH ID SEND REQUEST----------------
async function getUserInfoById() {
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            uData = JSON.parse(this.response);
            // console.log(uData);
            userInfo(uData);
        };
    };
    if (clientId == null) { return };
    xhttp.open("POST", "./getUserInfo/" + clientId, true);
    xhttp.send();
};
//-------------------PRINT USER INFO TO TABLE
async function userInfo(uData) {
    if (uData == null) { return };
    closeNav();
    allElements(0);
    userAutoLogout(1000 * 60);
    let lastOrderRow;
    const nameText = document.createElement('p');
    const closeButton = document.createElement('div');
    const nameNick = document.createElement('textarea');
    const tableDiv = document.createElement('div');
    const window = document.createElement('div');
    closeButton.innerText = ("X");
    nameText.innerHTML = (clientName.replace(/,/g, "<br>"));
    nameNick.value = (clientNick.replace(/,/g, "<br>"));
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
    out.ondblclick = (function () {
        if (window) {
            nameText.remove();
            closeButton.remove();
            nameNick.remove();
            tableDiv.remove();
            buttonDeleteOrder.remove();
            window.remove();
            allElements(1);
        }
    });
    closeButton.onclick = (function () {
        if (window) {
            nameText.remove();
            closeButton.remove();
            nameNick.remove();
            tableDiv.remove();
            buttonDeleteOrder.remove();
            window.remove();
            allElements(1);
        }
    });
    const table = document.createElement("table");
    const tableBody = document.createElement("tbody");
    const TR = document.createElement("tr");
    TR.innerHTML = ("<th>סכום</th><th>פרטים</th><th>תאריך ושעה</th><th>מס.</th>");
    TR.setAttribute("style", "background-color:lightblue;")
    tableBody.appendChild(TR);
    for (let i = 0; i < uData.length; i++) {
        const row = document.createElement("tr");
        let rowInfo = Object.values(uData[i]);
        for (let j = 0; j < rowInfo.length; j++) {
            const cell = document.createElement("td");
            const cellText = document.createTextNode(rowInfo[j]);
            cell.appendChild(cellText);
            row.appendChild(cell);
        }
        row.setAttribute("dir", "rtl");
        row.setAttribute("style", "background-color:lightskyblue;")
        if (i % 2 === 0) { row.setAttribute("style", "background-color:lightblue;") }
        tableBody.appendChild(row);
    }
    table.appendChild(tableBody);
    table.setAttribute("class", "userInfoTable");
    tableDiv.appendChild(table);
    const buttonDeleteOrder = document.createElement('div');
    buttonDeleteOrder.textContent = ('למחוק רישום אחרון');
    buttonDeleteOrder.className = ("deleteOrderButton");
    window.appendChild(buttonDeleteOrder);
    buttonDeleteOrder.onmouseup = (function () {
        const buttonYes = document.createElement('button');
        const buttonNo = document.createElement('button');
        buttonYes.className = ("deleteOrderConfirm"); buttonYes.classList.add("deleteOrderConfirmYes");
        buttonNo.className = ("deleteOrderConfirm"); buttonNo.classList.add("deleteOrderConfirmNo");
        buttonYes.innerText = ("למחוק רישום אחרון כן זאת הייתה טעות");
        buttonNo.innerText = ("לא למחוק את הרישום בעצם הפאב צריך ת'כסף");
        const confirmWindow = document.createElement('div');
        confirmWindow.className = ("userInfoOrderDeleteConfirm");
        buttonDeleteOrder.style.display = ("none");
        confirmWindow.appendChild(buttonNo);
        confirmWindow.appendChild(buttonYes);
        window.appendChild(confirmWindow);
        buttonNo.onclick = (function () {
            buttonNo.remove();
            buttonYes.remove();
            confirmWindow.remove();
            buttonDeleteOrder.style.display = ("block");
        })
        buttonYes.onclick = (function () {
            clientDeleteLastOrder();
            nameText.remove();
            closeButton.remove();
            nameNick.remove();
            tableDiv.remove();
            buttonDeleteOrder.remove();
            buttonNo.remove();
            buttonYes.remove();
            confirmWindow.remove();
            window.remove();
        })
    });
};

function clientDeleteLastOrder() {
    if (clientId == null) { return };
    xhttp.open("POST", "./deleteLastOrder/" + clientId, true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            getUserInfoById();
            return;
        }
    };
};

function allElements(action) {
    var searchBox = Array.from(document.getElementsByClassName("searchBox"));
    var userStateIndicator = Array.from(document.getElementsByClassName("userStateIndicator"))
    var items = Array.from(document.getElementsByClassName("items"));
    var buttons = Array.from(document.getElementsByClassName("buttons"));
    var sidenav = Array.from(document.getElementsByClassName("sidenav"));
    var elementOpen = Array.from(document.getElementsByClassName("elementOpen"));
    var classes = searchBox.concat(items, buttons, sidenav, elementOpen, userStateIndicator);
    if (action == 0) {
        classes.forEach(elementOff);
    }
    if (action == 1) {
        classes.forEach(elementOn);
    }
};

function elementOff(element) {
    element.classList.remove("opacityOn");
    element.classList.add("opacityOff");
};

function elementOn(element) {
    element.classList.remove("opacityOff");
    element.classList.add("opacityOn");
};

function pointerAll(element) {
    element.classList.remove("pointerNone");
    element.classList.add("pointerAll")
};

function pointerNone(element) {
    element.classList.remove("pointerAll");
    element.classList.add("pointerNone")
};

function pointerEnableIn(i) {
    setTimeout(() => {
        const body = document.body;
        pointerAll(body);
        const items = document.getElementsByClassName("item");
        var itemsArray = Array.from(items);
        itemsArray.forEach(pointerAll);
    }, i);
};

// ---------------------------------------------//
function connectEventSource(){
    if (!!window.EventSource) {
        var source = new EventSource('./events')

        source.addEventListener('message', function(event) {        
        // console.log(event.data);
        eventHandler(event);
        }, false)

        source.addEventListener('open', function(e) {        
            console.log("connected");
        }, false)

        source.addEventListener('error', function(e) {        
        if (e.eventPhase == EventSource.CLOSED)
            console.log("closing connection and recall function");
            source.close()
            connectEventSource();
        if (e.target.readyState == EventSource.CLOSED) {            
            connectEventSource();
        }
        else if (e.target.readyState == EventSource.CONNECTING) {
                console.log("connecting");            
        }
        }, false)
    } else {
        console.log("Your browser doesn't support SSE")
    }
}
connectEventSource();

function eventHandler(event) {
    let data = event.data;
    console.log("event: "+data);    
    if(JSON.parse(data) == "refresh"){
        console.log("MATCH REFRESH TERMINAL");
        refreshPage();
    }
    if(JSON.parse(data) == "reloadItems"){
        console.log("MATCH RELOAD ITEMS");
        getProducts();
    }
}