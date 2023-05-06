// divContent.style.backgroundColor = "black";
// divContent.style.backgroundColor = generateRandomColor();


function generateRandomColor() {
    let maxVal = 0xFFFFFF; // 16777215
    let randomNumber = Math.random() * maxVal;
    randomNumber = Math.floor(randomNumber);
    randomNumber = randomNumber.toString(16);
    let randColor = randomNumber.padStart(6, 0);
    return `#${randColor.toUpperCase()}`
};
//------------------------ PARAMETERS ------------------------//
const maxAutoCompleteResults = 4;
const messageTimeoutTime = 2500;

//------------------------ UI ELEMENTS DECLATE ------------------------//

const searchBox1 = document.getElementById("searchBox");
const buttonOrder = document.getElementById("buttonOrder");
const buttonCancel = document.getElementById("buttonCancel");
const errorMessage = document.getElementById("errorMessage");
const autoCompleteDiv = document.getElementById("autoComplete");

const contentDiv = document.getElementById("divContent");
const userPage = document.getElementById("userPage");
const userIndic = document.getElementById("userIndic");

let userWindow;
let messageWindow;
let deleteOrderWindow;
let userPageButton = document.getElementById("userPageButton");


//-----------------FUNCTIONAL GLOBALS-----------------//
let orderData = {};

//------------------------ ELEMENTS ------------------------//

searchBox1.placeholder = (messageClient.inputPlaceholder);

window.onkeydown = function () { searchBox1.focus(); };

searchBox1.addEventListener('focus', function () {
    // console.log("focus");
    searchBox1.placeholder = (messageClient.inputPlaceholder);
    if (searchBox1.value.length > 0) { searchBox1.placeholder = (""); };
    if (searchBox1.value.length < 1) { searchBox1.placeholder = (messageClient.inputPlaceholder); };
    let input = searchBox1.value;
    input = inputSanitize(input);
    searchBox1.value = input;
    if (input == '' || input == null) {
        clearAutoComplete(autoCompleteDiv);
        userIndicState(0, null);
        return;
    };
});
searchBox1.addEventListener('blur', function () {
    // console.log("blur");
    searchBox1.placeholder = (messageClient.inputPlaceholder);
    let input = searchBox1.value;
    input = inputSanitize(input);
    searchBox1.value = input;
    if (input == '' || input == null) {
        clearAutoComplete(autoCompleteDiv);
        userIndicState(0, null);
        return;
    };
});
searchBox1.addEventListener('input', function () {
    let input = searchBox1.value;
    input = inputSanitize(input);
    searchBox1.value = input;
    if (input == '' || input == null) {
        clearAutoComplete(autoCompleteDiv);
        userIndicState(0, null);
        return;
    };
    if (searchBox1.value == '') { userIndicMessage('') };
    sendNameSearchQuery(input);
});
buttonOrder.addEventListener('click', function () {
    buttonOrderClick();
});
buttonCancel.addEventListener('click', function () {
    console.log("button cancel click");
    buttonCancelClick();
});

// buttonOrder.style.backgroundColor = ("green");
// buttonCancel.style.backgroundColor = ("red");

//-------------------------AT LOAD CONTENT WINDOW-------------------------//
function loadUtiliti() {    
    userIndicMessage(messageClient.notUsed);
    userPageButton.innerHTML = messageUi.userPageLable;
};
loadUtiliti();

//-------------------------MESSAGE FLOATING WINDOW-------------------------//
function openMessageWindow(message,className){
    console.log("message:"+message);
    if(messageWindow != undefined) {messageWindow.remove();};
    messageWindow = document.createElement('div');    
    messageWindow.className = ("messageWindow");
    let p = document.createElement('p');
    p.className = (className);
    p.innerHTML = (message);
    messageWindow.appendChild(p);
    divContent.appendChild(messageWindow);
    let messageTimeout = setTimeout(closeMessageWindow,messageTimeoutTime);
    return;
};
function closeMessageWindow(){
    while (messageWindow.hasChildNodes()) {
        messageWindow.removeChild(messageWindow.firstChild);
    };    
    messageWindow.remove();
    return;
};

//-------------------------NAME SEARCH FUNCTIONS-------------------------//

async function sendNameSearchQuery(query) {
    if (query == "" || query == null) { return; };
    query = JSON.stringify({ "name": query });
    await postRequest('./client/searchName/', window.parent.parseNameSearchResponse, query);
    return;
};
function parseNameSearchResponse(data) {    
    if (!data.errorLog && !data.errorClient) { autoComplete(data); return; }
    if (data.errorLog) { console.log(data); return; }
    if (data.errorClient) {
        console.log(data);
        userIndicMessage(data.errorClient);
        clearAutoComplete(autoCompleteDiv);
        return;
    }
};
function searchBoxClear() {
    clearAutoComplete(document.getElementById("autoComplete"));
    if (searchBox1.value.length == 0) { userIndicState(0); };
};
function autoComplete(names) {
    clearAutoComplete(autoCompleteDiv);
    if (names.length == 0) { userIndicState(1); return; };
    autoCompleteDiv.className = "autoCompleteSuggestions";
    for (i = 0; i < names.length && i < maxAutoCompleteResults; i++) {
        const row = document.createElement("p");
        row.className = "autocomplete-items";
        if (i % 2 === 0) { row.classList.add("autocomplete-itemsEven"); }
        row.innerText = names[i].nick;
        row.setAttribute('id', names[i].id);
        autoCompleteDiv.appendChild(row);
        row.onclick = function () {
            userIndicState(3, row.getAttribute('id'));
            searchBox1.value = row.innerText;
            clearAutoComplete(autoCompleteDiv);
        };
    };
    if (names[0].nick == searchBox1.value || names[0].name == searchBox1.value) {
        searchBox1.value = names[0].nick;
        userIndicState(3, names[0].id);
        clearAutoComplete(autoCompleteDiv);
        searchBox1.blur();
    };
    if (names.length > 0 && names[0].nick != searchBox1.value || names[0].name != searchBox1.value){
        userIndicState(2, names[0].id);
    }
    if (searchBox1.value.length == 0) { userIndicState(0); };
    if (searchBox1.value == "") { clearAutoComplete(autoCompleteDiv); }
};
function clearAutoComplete(autoCompleteDiv) {
    autoCompleteDiv.className = "autoCompleteNone";
    while (autoCompleteDiv.hasChildNodes()) {
        autoCompleteDiv.removeChild(autoCompleteDiv.firstChild);
    };
    return;
};

//---------------------- USER LOGIN FUNCTIONS ----------------------//
function userIndicState(state, id) {
    switch (state) {
        case 0:
            // console.log("USER STATE INDIC: " + state);
            // console.log("USER STATE INDIC: EMPTY");
            userIndicMessage(messageClient.notUsed);
            userLogout();
            break;
        case 1:
            // console.log("USER STATE INDIC: " + state);
            // console.log("USER STATE INDIC: NOT IN LIST");
            userLogout();
            break;
        case 2:
            // console.log("USER STATE INDIC: " + state);
            // console.log("USER STATE INDIC: SELECT FROM LIST");
            if (searchBox1.value != '') { userIndicMessage(messageClient.enterName); };
            userLogout();
            break;
        case 3:
            // console.log("USER STATE INDIC: " + state);
            // console.log("USER STATE INDIC: ACCEPTED");
            userLogin(id);
            break;
        default:
            // console.log("USER STATE INDIC OUT OF SCOPE")
            break;
    };
};
function userLogin(id) {
    currentUserLogged = null;
    console.log("LOGIN USER: " + id);
    id = JSON.stringify({ "id": id });
    postRequest('./client/userLogin/', window.parent.userLogged, id);
};
function userLogged(data) {
    if (data == null || data == '') { console.log("ERROR WITH DB"); return; }
    currentUserLogged = data;
    console.log(`CURRENT USER LOGGED: 
    ${currentUserLogged.nick} , 
    ${currentUserLogged.name} , 
    ${currentUserLogged.account} ,
    ${currentUserLogged.id}`);
    displayUserPageButton();
    userIndicLogged();
};
function userLogout(){
    currentUserLogged = null;
    hideUserPageButton();    
};
function userIndicLogged() {
    let par = document.createElement("p");
    par.innerText = currentUserLogged.message;
    userIndic.innerHTML = "";
    userIndic.append(par);
};
function userIndicMessage(message) {
    let par = document.createElement("p");
    par.innerText = message;
    userIndic.innerHTML = "";
    userIndic.append(par);
};

//---------------------- ORDER MANGE FUNCTIONS ----------------------//

function addItem(item) {    
    if(orderData[item]==99){console.log("Max is 99");return;};
    orderData[item] = (orderData[item] || 0) + 1;    
    // console.log(orderData);
    const count = document.getElementById(`itemCount${item}`)
    if (count.innerText < (parseInt(1) )) {
        count.innerText = 1;
    } else {
        let current = count.innerText;
        if (current < 99) count.innerText = (parseInt(current) + 1);
    };
    return;
};
function orderManage(data) {
    if (data === "abort") { console.log("abort"); return; }
    if (data === "placeOrder") {
        if (orderData.length == 0) { console.log("no order yet"); return; }
        orderData = JSON.stringify({ "order": orderData, "userId": parseInt(currentUserLogged.id) });
        console.log("request order confirm:");
        console.log(orderData);
        requestOrderPage(orderData)
        return;
    }
};
function requestOrderPage(order) {
    console.log("request order page for order: " + order);
    postRequest('./client/requestOrderPage/', window.parent.openOrderConfirm, order);
    return;
};
function openOrderConfirm(content) {
    console.log("ORDER CONFIRM PAGE");
    orderDataReturn = content.orderData;
    orderDataReturn = JSON.stringify(orderDataReturn);
    totalSumReturn = content.totalSum;
    content = content.html;
    if (document.getElementById("orderConfirmPage")) { document.getElementById("orderConfirmPage").remove; };
    let orderConfirmWindow = null;
    orderConfirmWindow = document.createElement('div');
    orderConfirmWindow.className = ("window");    
    orderConfirmWindow.innerHTML = (content);
    divContent.appendChild(orderConfirmWindow);
    let closeButton = document.getElementById("orderConfirmCloseButton");
    let orderConfirmButtonNo = document.getElementById("orderConfirmButtonNo");
    closeButton.addEventListener('click', function () {
        orderClear();
        clearCounts();
        orderConfirmWindow.remove();
    });
    orderConfirmButtonNo.addEventListener('click', function () {
        orderClear();
        clearCounts();
        orderConfirmWindow.remove();
    });
    orderConfirmButtonYes.addEventListener('click', function () {
        if (!validateOrder(orderDataReturn)) { console.log("error with order validation"); return; }
        placeOrder(orderDataReturn)
        orderConfirmWindow.remove();
    });
};
function validateOrder(orderDataReturn) {
    return (orderDataReturn === orderData);
};
function placeOrder(orderDataReturn) {
    console.log("place order : " + orderDataReturn);
    postRequest('./client/placeOrder/', window.parent.orderComplete, orderDataReturn);
    orderClear();
    clearCounts();
    return;
};
function orderClear() {
    orderData = null;
    orderData = {};
    console.log("clear orderData");
};
function clearCounts() {
    let counts = document.getElementsByClassName("itemCount");
    counts = Array.from(counts);
    // console.log(counts);
    counts.forEach(count => {
        count.innerText = "";
    });
    return;
};
function orderComplete(content) {
    console.log("order complete");
    console.log(content);
    openMessageWindow(content);
};

//---------------------- USER MANAGE FUNCTIONS ----------------------//

function displayUserPageButton() {
    if (currentUserLogged != null);
    userPageButton.className = "userPageShow";
    if(userPageButton.getAttribute('userPageButtonEnableListener')!= 1){
        userPageButton.addEventListener("click", function callRequestUserPage() {
            userPageButton.setAttribute('userPageButtonEnableListener', 1);
            requestUserPage(currentUserLogged.id);
        })
    };    
};
function hideUserPageButton() {
    if (currentUserLogged == null);
    userPageButton.className = "userPageHidden";
    if(userPageButton.getAttribute('userPageButtonEnableListener')== 1){
        userPageButton.removeEventListener("click", requestUserPage)
    };    
};
function requestUserPage(id) {
    console.log("request user page for user: " + id);
    id = JSON.stringify({ "id": id });
    postRequest('./client/getUserPage/', window.parent.openUserPage, id);
    return;
};
function openUserPage(content) {
    if (document.getElementById("userInfoWindow")) { document.getElementById("userInfoWindow").remove; };
    userWindow = null;
    userWindow = document.createElement('div');
    userWindow.className = ("userInfo");
    userWindow.setAttribute("id", "userInfoWindow");
    userWindow.innerHTML = (content);
    document.body.appendChild(userWindow);
    let closeButton = document.getElementById("userPageCloseButton");
    closeButton.addEventListener('click', function () {        
        closeButton.remove();
        userWindow.remove();
    });
    divFullPage.addEventListener('click', function () {
        closeButton.remove();
        userWindow.remove();
    });
    let deleteOrderButton = document.getElementById("deleteOrderButton");
    deleteOrderButton.addEventListener('click', function () {
        // deleteLastOrder(currentUserLogged.id);        
        closeButton.remove();
        userWindow.remove();
        return deleteLastOrderConfirm(currentUserLogged.id);
    });
};
function deleteLastOrderConfirm(id){
    id = JSON.stringify({ "id": id });
    let deleteOrderResponse = postRequest('./client/deleteLastOrderConfirm/', openDeleteOrderConfirm, id);    
    return deleteOrderResponse;
};
function openDeleteOrderConfirm(content){    
    userWindow.remove();
    deleteOrderWindow = document.createElement('div');
    deleteOrderWindow.className = ("window fontLarge");
    deleteOrderWindow.innerHTML = (content);
    document.body.appendChild(deleteOrderWindow);    
    let deleteOrderConfirmButtonNo = document.getElementById("deleteOrderConfirmButtonNo");
    let deleteOrderConfirmButtonYes = document.getElementById("deleteOrderConfirmButtonYes");
    deleteOrderConfirmButtonNo.addEventListener('click', function () {        
        deleteOrderWindow.remove();
        return requestUserPage(currentUserLogged.id);        
    });    
    deleteOrderConfirmButtonYes.addEventListener('click', function () {        
        deleteOrderWindow.remove();
        return deleteLastOrder(currentUserLogged.id);        
    });
};
function deleteLastOrder(id) {
    id = JSON.stringify({ "id": id });
    let deleteOrderResponse = postRequest('./client/deleteLastOrder/', openDeleteOrderResults, id);    
    return;
};
function openDeleteOrderResults(content){
    console.log(content);
    openMessageWindow(content,'red big');
    return requestUserPage(currentUserLogged.id);
};

//---------------------- UI INTERACTIONS ----------------------//

function buttonOrderClick() {
    if (!currentUserLogged || currentUserLogged == null || currentUserLogged.userId == '') {
        console.log("no user logged");
        openMessageWindow(messageError.orderNoLoggedUSer,"green bottom")
        return;
    }
    if (!orderData || orderData == null || (Object.keys(orderData).length) <= 0) {
        console.log("order data is empty");        
        openMessageWindow(messageError.orderNoOrderData,"green bottom")
        return;
    };

    orderManage("placeOrder");
};
function buttonCancelClick() {
    if (Object.keys(orderData).length == 0) { 
        // openMessageWindow(messageClient.noOrderToAbortButton);
        return;
    };
    console.log(orderData.length);
    orderClear();
    clearCounts();
    // openMessageWindow(messageClient.orderAbortButton);
};
function errorMessageShow() {

};
