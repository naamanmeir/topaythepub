//------------------------ PARAMETERS ------------------------//
const maxAutoCompleteResults = 4;
const messageTimeoutTime = 3000;
const displaySpeed = 26;

//------------------------ UI ELEMENTS DECLATE ------------------------//

const searchBox1 = document.getElementById("searchBox");
const buttonsMain = document.getElementById("buttons");
const buttonOrder = document.getElementById("buttonOrder");
const buttonCancel = document.getElementById("buttonCancel");
const errorMessage = document.getElementById("errorMessage");
const autoCompleteDiv = document.getElementById("autoComplete");

const contentDiv = document.getElementById("divContent");
const userPage = document.getElementById("userPage");
const userIndic = document.getElementById("userIndic");
const display = document.getElementById("display");

let displayMessages;
let displayRefreshTimer;
let displayIsScrolling = 0;

let userWindow;
let messageWindow;
let deleteOrderWindow;
let orderConfirmWindow;
let userPageButton = document.getElementById("userPageButton");

//-----------------FUNCTIONAL GLOBALS-----------------//
let orderData = {};
let autoLogoutTimer;

//------------------------ ELEMENTS ------------------------//

searchBox1.placeholder = (messageClient.inputPlaceholder);

function keyboardFocusMain(){
    if(document.getElementById("postInput") == null){
        window.onkeydown = function () { searchBox1.focus(); };
    }
    return;
};
keyboardFocusMain();

searchBox1.addEventListener('focus', function () {
    // console.log("focus");
    monitorSwitch(1);
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
    monitorSwitch(0);
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
    monitorSwitch(1);
    let input = searchBox1.value;
    input = inputSanitize(input);
    searchBox1.value = input;
    if (input == '' || input == null) {
        searchBox1.placeholder = (messageClient.inputPlaceholder);
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
    // console.log("button cancel click");
    buttonCancelClick();
});
divFullPage.addEventListener('click',function (){
    resetAutoLogout();
});

//-------------------------AT LOAD CONTENT WINDOW-------------------------//
function loadUtiliti() {    
    userIndicMessage(messageClient.notUsed);
    userPageButton.innerHTML = messageUi.userPageLable;
    buttonOrder.innerHTML = messageUi.buttonOrder;
    buttonCancel.innerHTML = messageUi.buttonCancel;
    buttonsMain.className = ("buttons");
    buttonOrder.className = ("placeOrder");
    buttonCancel.className = ("cancel");
    requestDisplayInfo(1);
    monitorSwitch(0);
};
loadUtiliti();

//-------------------------MESSAGE FLOATING WINDOW-------------------------//
function openMessageWindow(message,className){
    // console.log("message:"+message);
    if(messageWindow != undefined) {messageWindow.remove();};
    messageWindow = document.createElement('div');    
    messageWindow.className = ("messageWindow");
    let p = document.createElement('p');
    p.className = (className);
    p.innerHTML = (message);
    messageWindow.appendChild(p);
    divFullPage.appendChild(messageWindow);
    let messageTimeout = setTimeout(closeMessageWindow,messageTimeoutTime);
    return;
};
function closeMessageWindow(){    
    messageWindow.style.transition = "opacity 2s ease";
    messageWindow.style.opacity = "0";
    setTimeout(function() {
        messageWindow.remove()},3000);
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
            userIndicMessage(messageClient.notUsed);
            userLogout();
            break;
        case 1:
            userLogout();
            break;
        case 2:
            if (searchBox1.value != '') { userIndicMessage(messageClient.enterName); };
            userLogout();
            break;
        case 3:
            userLogin(id);
            break;
        default:
            break;
    };
};
function userLogin(id) {
    currentUserLogged = null;
    id = JSON.stringify({ "id": id });
    postRequest('./client/userLogin/', window.parent.userLogged, id);
};
function userLogged(data) {
    if (data == null || data == '') { console.log("ERROR WITH DB"); return; }
    currentUserLogged = data;
    // console.log(`CURRENT USER LOGGED: 
    // ${currentUserLogged.nick} , 
    // ${currentUserLogged.name} , 
    // ${currentUserLogged.account} ,
    // ${currentUserLogged.id}`);
    displayUserPageButton();
    userIndicLogged();    
    resetAutoLogout()
};

function userLogout(){
    if(currentUserLogged!=null){
        let id = JSON.stringify({"id": currentUserLogged.id});
        postRequest('./client/userLogout/', window.parent.userLoggedOut, id);        
        currentUserLogged = null;
        hideUserPageButton();
        searchBox1.value = '';
        userIndicMessage(messageClient.notUsed);
        clearCounts();
        orderClear();
        closeWindows();
    };    
};
function userLoggedOut(data){
    // console.log(data);
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
        // console.log("request order confirm:");
        // console.log(orderData);
        requestOrderPage(orderData)
        return;
    }
};
function requestOrderPage(order) {
    // console.log("request order page for order: " + order);
    postRequest('./client/requestOrderPage/', window.parent.openOrderConfirm, order);
    return;
};
function openOrderConfirm(content) {    
    orderDataReturn = content.orderData;
    orderDataReturn = JSON.stringify(orderDataReturn);
    totalSumReturn = content.totalSum;
    content = content.html;
    if (document.getElementById("orderConfirmPage")) { document.getElementById("orderConfirmPage").remove; };
    orderConfirmWindow = null;
    orderConfirmWindow = document.createElement('div');
    orderConfirmWindow.className = ("window");    
    orderConfirmWindow.innerHTML = (content);
    divContent.appendChild(orderConfirmWindow);
    let closeButton = document.getElementById("orderConfirmCloseButton");    
    let orderConfirmButtonNo = document.getElementById("orderConfirmButtonNo");
    let orderConfirmButtonYes = document.getElementById("orderConfirmButtonYes");
    orderConfirmButtonNo.className = ("windowButton no");
    orderConfirmButtonYes.className = ("windowButton yes");
    getRequest('./client/windowIsOpen/',null,null);
    closeButton.addEventListener('click', function () {
        orderClear();
        clearCounts();
        closeWindows();        
    });
    orderConfirmButtonNo.addEventListener('click', function () {
        orderClear();
        clearCounts();
        closeWindows();
    });
    orderConfirmButtonYes.addEventListener('click', function () {
        if (!validateOrder(orderDataReturn)) { console.log("error with order validation"); return; }
        orderConfirmWindow.remove();
        placeOrder(orderDataReturn);        
    });
    return;
};
function validateOrder(orderDataReturn) {
    return (orderDataReturn === orderData);
};
function placeOrder(orderDataReturn) {
    // console.log("place order : " + orderDataReturn);
    postRequest('./client/placeOrder/', window.parent.orderComplete, orderDataReturn);
    orderClear();
    clearCounts();
    closeWindows();
    return;
};
function orderClear() {
    orderData = null;
    orderData = {};
    // console.log("clear orderData");
};
function clearCounts() {
    let counts = document.getElementsByClassName("itemCount");
    counts = Array.from(counts);
    counts.forEach(count => {
        count.innerText = "";
    });
    return;
};
function orderComplete(content) {
    openMessageWindow(content);
    userLogout();
    return;
};

//---------------------- USER MANAGE FUNCTIONS ----------------------//

function displayUserPageButton() {
    if (currentUserLogged != null);
    userPageButton.className = "userPageShow";
    enableUserPageButton();
    return;
};

function enableUserPageButton(){
    if(userPageButton.getAttribute('userPageButtonEnableListener')!= 1){
        userPageButton.addEventListener('click', callRequestUserPage);
    };
    return;
};

function callRequestUserPage(){
    userPageButton.setAttribute('userPageButtonEnableListener', 1);
    userPageButton.style.pointerEvents = "none";
    userPageButton.removeEventListener('click', callRequestUserPage);
    requestUserPage(currentUserLogged.id);
    return;
};
function hideUserPageButton() {
    if (currentUserLogged == null);
    userPageButton.className = "userPageHidden";
    if(userPageButton.getAttribute('userPageButtonEnableListener')== 1){
        userPageButton.removeEventListener('click', callRequestUserPage)
    };    
};
function requestUserPage(id) {
    userPageButton.style.pointerEvents = "none";
    id = JSON.stringify({ "id": id });
    postRequest('./client/getUserPage/', window.parent.openUserPage, id);
    return;
};
function openUserPage(content) {
    if (document.contains(document.getElementById("userPageWindow"))) { document.getElementById("userPageWindow").remove; };
    userPageButton.style.pointerEvents = "none";
    userWindow = document.createElement('div');
    userWindow.className = ("window");
    userWindow.setAttribute("id", "userPageWindow");
    userWindow.innerHTML = (content);
    document.body.appendChild(userWindow);
    divContent.classList.add("hidden");
    let userInfoChangeNickText = document.getElementById("userInfoChangeNickText");
    let userInfoChangeNickButton = document.getElementById("userInfoChangeNickButton");
    let closeButton = document.getElementById("userPageCloseButton");
    let windowButtons = document.getElementById("windowButtons");
    windowButtons.className = ("windowbuttons");
    let userInfoTable = document.getElementById("userInfoTable");
    let closeWindowButton = document.getElementById("closeWindowButton");
    closeWindowButton.className = ("windowButton yes");
    let deleteOrderButton = document.getElementById("deleteOrderButton");
    deleteOrderButton.className = ("windowButton no");
    getRequest('./client/windowIsOpen/',null,null);
    closeButton.addEventListener('click', function () {
        closeWindows();
    });
    closeWindowButton.addEventListener('click', function () {        
        closeWindows();
    });
    deleteOrderButton.addEventListener('click', function () {
        closeWindows();
        return deleteLastOrderConfirm(currentUserLogged.id);
    });
    userInfoTable.addEventListener("scroll",resetAutoLogout);    
    userInfoTableDiv.addEventListener("scroll",resetAutoLogout);    
    userInfoChangeNickText.addEventListener('input',resetAutoLogout);
    userInfoChangeNickButton.addEventListener('click', function () {
        if(userInfoChangeNickText.value == "" || userInfoChangeNickText.value == null || userInfoChangeNickText == null){return;}
        let newNick = userInfoChangeNickText.value;
        newNick = inputSanitize(newNick);
        let data = JSON.stringify({ "newNick": newNick,"id":currentUserLogged.id})        
        let requestResult = postRequest('./client/changeNick/', null, data);    
        return;
    });
};

function deleteLastOrderConfirm(id){
    id = JSON.stringify({ "id": id });
    let deleteOrderResponse = postRequest('./client/deleteLastOrderConfirm/', openDeleteOrderConfirm, id);    
    return deleteOrderResponse;
};
function openDeleteOrderConfirm(content){
    userWindow.remove();
    resetAutoLogout();
    deleteOrderWindow = document.createElement('div');
    deleteOrderWindow.className = ("window fontLarge");
    deleteOrderWindow.innerHTML = (content);
    document.body.appendChild(deleteOrderWindow);
    let windowButtons = document.getElementById("windowButtons");
    windowButtons.className = ("windowbuttons"); 
    let deleteOrderConfirmButtonNo = document.getElementById("deleteOrderConfirmButtonNo");
    deleteOrderConfirmButtonNo.className = ("windowButton yes");
    let deleteOrderConfirmButtonYes = document.getElementById("deleteOrderConfirmButtonYes");
    deleteOrderConfirmButtonYes.className = ("windowButton no");
    getRequest('./client/windowIsOpen/',null,null);
    deleteOrderConfirmButtonNo.addEventListener('click', function () {
        closeWindows();
        return requestUserPage(currentUserLogged.id);
    });
    deleteOrderConfirmButtonYes.addEventListener('click', function () {
        closeWindows();
        return deleteLastOrder(currentUserLogged.id);
    });
};
function deleteLastOrder(id) {
    id = JSON.stringify({ "id": id });
    let deleteOrderResponse = postRequest('./client/deleteLastOrder/', openDeleteOrderResults, id);    
    return;
};
function openDeleteOrderResults(content){
    // console.log(content);
    openMessageWindow(content,'red big');
    return requestUserPage(currentUserLogged.id);
};
function buttonOrderClick() {
    if (!currentUserLogged || currentUserLogged == null || currentUserLogged.userId == '') {
        // console.log("no user logged");
        openMessageWindow(messageError.orderNoLoggedUSer,"green bottom")
        return;
    }
    if (!orderData || orderData == null || (Object.keys(orderData).length) <= 0) {
        // console.log("order data is empty");        
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
    // console.log(orderData.length);
    orderClear();
    clearCounts();
    // openMessageWindow(messageClient.orderAbortButton);
};

//---------------------- LOGIN INTERACTIONS ----------------------//

function autoLogout(){
    // console.log("autoLogout");    
    if(currentUserLogged!=null){
        openMessageWindow(messageClient.clientAutoLogout);
        let id = JSON.stringify({"id": currentUserLogged.id});
        postRequest('./client/userAutoLogout/', window.parent.userLoggedOut, id);        
        userLogout();
    };
    closeWindows();
    hideWindows();
    clearCounts();
    orderClear();
    searchBox1.value='';
    searchBox1.blur();
    userIndicMessage(messageClient.notUsed);
    keyboardFocusMain();
    return;
};
function resetAutoLogout(){
    clearTimeout(autoLogoutTimer);
    autoLogoutTimer = setTimeout(autoLogout,autoLogoutTime);
};

//---------------------- UI INTERACTIONS ----------------------//

function errorMessageShow() {
    console.log("errorMEssage");
};
function generateRandomColor() {
    let maxVal = 0xFFFFFF; // 16777215
    let randomNumber = Math.random() * maxVal;
    randomNumber = Math.floor(randomNumber);
    randomNumber = randomNumber.toString(16);
    let randColor = randomNumber.padStart(6, 0);
    return `#${randColor.toUpperCase()}`
};

//---------------------- UI ELEMENTS ----------------------//

function monitorSwitch(fnc){    
    let pDiv = document.getElementById('displayMessage');
    let fade = 1;
    pDiv.style.transition = 'opacity '+fade+'s';
    userIndic.style.transition = 'opacity '+fade+'s';
    switch (fnc) {
        case 0:
            userIndic.style.opacity = '0';
            pDiv.style.opacity = '1';
            break;
        case 1:
            userIndic.style.opacity = '1';
            pDiv.style.opacity = '0';
            break;
        default:
            break;
    };
    return;    
};

function requestDisplayInfo(id) {
    // console.log("send req to monitor");
    id = JSON.stringify({ "id": id });
    postRequest('./client/getDisplayInfo/', window.parent.storeDisplayMessagesArrayAndStartPlay, id);
    return;
};

function requestDisplayInfoRefresh(id) {
    // console.log("send req to monitor");
    id = JSON.stringify({ "id": id });
    if(displayIsScrolling==0){
        postRequest('./client/getDisplayInfo/', window.parent.storeDisplayMessagesArrayAndStartPlay, id);
    }
    if(displayIsScrolling==1){
        postRequest('./client/getDisplayInfo/', window.parent.storeDisplayMessagesArray, id);    
    }    
    return;
};

function storeDisplayMessagesArrayAndStartPlay(content){
    displayMessages = content;
    openDisplayInfo();
};

function storeDisplayMessagesArray(content){
    displayMessages = content;    
};

function openDisplayInfo() {
    // console.log("open display");
    // console.log(displayMessages.length);
    if(displayMessages.length == 0 || displayMessages == ''){displayIsScrolling = 0;return;};
    document.getElementById('displayMessage').innerHTML = '';
    let pDiv = document.getElementById('displayMessage');  
    pDiv.innerHTML = '';
    for(let i=0;i<displayMessages.length;i++){
        let p = document.createElement('p');
        p.className = 'displayPs';
        p.innerText = displayMessages[i].post;
        pDiv.appendChild(p);
    };
    display.appendChild(pDiv);
    scrollScrollBar();
    return;
};

function scrollScrollBar(){
    let items = [...document.getElementsByClassName('displayPs')];
    const displayMessage = document.getElementById("displayMessage");
    const displayDiv = document.getElementById("display");
    let displayRight = displayDiv.getBoundingClientRect().right;
    let displayLeft = displayDiv.getBoundingClientRect().left;
    let displayMessageRight = displayMessage.getBoundingClientRect().right;
    let displayMessageLeft = displayMessage.getBoundingClientRect().left;
    let displayFirstMessage = items[0];

    let left = -(displayRight+100);
    let amnt = 1

    function moveLoop(){
        displayIsScrolling = 1;
        let displayFirstMessageLeft = displayFirstMessage.getBoundingClientRect().left;
        if(items.length == 0){
            clearTimeout(displayRefreshTimer);            
            return openDisplayInfo();
        };        
        for(let i = 0;i<items.length;i++){
            items[i].style.left = `${left}px`;
            if(items[i].getBoundingClientRect().left > displayRight+100){
                items.splice(i,1);                
            }
        }
        left = left+amnt;
        displayRefreshTimer = setTimeout(moveLoop,displaySpeed);
    };
    return moveLoop();    
};