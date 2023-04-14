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

//------------------------ PARAMS AND OBJECT DECLATE ------------------------//
const maxAutoCompleteResults = 4;
const searchBox1 = document.getElementById("searchBox");
const buttonOrder = document.getElementById("buttonOrder");
const buttonCancel = document.getElementById("buttonCancel");
const errorMessage = document.getElementById("errorMessage");
const autoCompleteDiv = document.getElementById("autoComplete");

const contentDiv = document.getElementById("divContent");
const userPage = document.getElementById("userPage");
const userIndic = document.getElementById("userIndic");

let userWindow;

//-----------------FUNCTIONAL GLOBALS-----------------//
let orderData = {};

//------------------------ OBJECT EVENT LISTENERS ------------------------//

// searchBox1.setAttribute("pattern", regexBlock);

window.onkeydown = function () { searchBox1.focus(); }

searchBox1.addEventListener('focus', function () {
    // console.log("focus");
    searchBox1.placeholder = ("👉👉התחילו לכתוב את שמכם");
    if (searchBox1.value.length > 0) { searchBox1.placeholder = (""); };
});
searchBox1.addEventListener('blur', function () {
    // console.log("blur");
    searchBox1.placeholder = ("שלום הכניסו שם✍👉👉");
});
searchBox1.addEventListener('input', function () {
    let input = searchBox1.value;
    input = inputSanitize(input);
    searchBox1.value = input;
    if (input == '' || input == null) { clearAutoComplete(autoCompleteDiv); return; }
    if (searchBox1.value == '') { userIndicMessage('') };
    if (searchBox1.value != '') { userIndicMessage(messageClient.enterName); };
    sendQuery(input);
});
buttonOrder.addEventListener('click', function () {
    buttonOrderClick();
});
buttonCancel.addEventListener('click', function () {
    console.log("button cancel click");
    buttonCancelClick();
});

buttonOrder.style.backgroundColor = ("green");
buttonCancel.style.backgroundColor = ("red");

async function sendQuery(query) {
    if (query == "" || query == null) { return; };
    query = JSON.stringify({ "name": query });
    console.log("send query: '" + query + "'");
    await postRequest('./client/searchName/', window.parent.parseResponse, query);
    return;
};

function parseResponse(data) {
    data = JSON.parse(data);
    // console.log(data);
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
    if (searchBox1.value.length == 0) { searchIndicator(0); };
};

function autoComplete(names) {
    clearAutoComplete(autoCompleteDiv);
    if (names.length == 0) { searchIndicator(1); return; };
    autoCompleteDiv.className = "autoCompleteSuggestions";
    for (i = 0; i < names.length && i < maxAutoCompleteResults; i++) {
        const row = document.createElement("p");
        row.className = "autocomplete-items";
        if (i % 2 === 0) { row.classList.add("autocomplete-itemsEven"); }
        row.innerText = names[i].nick;
        row.setAttribute('id', names[i].id);
        autoCompleteDiv.appendChild(row);
        row.onclick = function () {
            searchIndicator(3, row.getAttribute('id'));
            searchBox1.value = row.innerText;
            clearAutoComplete(autoCompleteDiv);
        };
    };
    if (names[0].nick == searchBox1.value || names[0].name == searchBox1.value) {
        searchBox1.value = names[0].nick;
        searchIndicator(3, names[0].id);
        clearAutoComplete(autoCompleteDiv);
        searchBox1.blur();
    };
    if (searchBox1.value.length == 0) { searchIndicator(0); };
    if (searchBox1.value == "") { clearAutoComplete(autoCompleteDiv); }
};

function clearAutoComplete(autoCompleteDiv) {
    autoCompleteDiv.className = "autoCompleteNone";
    while (autoCompleteDiv.hasChildNodes()) {
        autoCompleteDiv.removeChild(autoCompleteDiv.firstChild);
    };
    return;
};

function searchIndicator(state, id) {
    switch (state) {
        case 0:
            console.log("USER STATE INDIC: " + state);
            console.log("USER STATE INDIC: EMPTY");
            break;
        case 1:
            console.log("USER STATE INDIC: " + state);
            console.log("USER STATE INDIC: NOT IN LIST");
            break;
        case 2:
            console.log("USER STATE INDIC: " + state);
            console.log("USER STATE INDIC: SELECT FROM LIST");
            break;
        case 3:
            console.log("USER STATE INDIC: " + state);
            console.log("USER STATE INDIC: ACCEPTED");
            userLogin(id);
            break;
        default:
            console.log("USER STATE INDIC OUT OF SCOPE")
            break;
    };
};

function userLogin(id) {
    console.log("LOGIN USER: " + id);
    id = JSON.stringify({ "id": id });
    postRequest('./client/userLogin/', window.parent.userLogged, id);
};

function userLogged(data) {
    if (data == null || data == '') { console.log("ERROR WITH DB"); return; }
    currentUserLogged = JSON.parse(data);
    console.log(`CURRENT USER LOGGED: 
    ${currentUserLogged.nick} , 
    ${currentUserLogged.name} , 
    ${currentUserLogged.account} ,
    ${currentUserLogged.id}`);
    displayUserPageButton();
    userIndicLogged();
};

function addItem(item) {
    orderData[item] = (orderData[item] || 0) + 1;
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
    orderDataReturn = JSON.parse(content).orderData;
    orderDataReturn = JSON.stringify(orderDataReturn);
    totalSumReturn = JSON.parse(content).totalSum;
    content = JSON.parse(content).html;
    if (document.getElementById("orderConfirmPage")) { document.getElementById("orderConfirmPage").remove; };
    let orderConfirmWindow = null;
    orderConfirmWindow = document.createElement('div');
    orderConfirmWindow.className = ("userInfo");
    orderConfirmWindow.setAttribute("id", "userInfoWindow");
    orderConfirmWindow.innerHTML = (content);
    document.body.appendChild(orderConfirmWindow);
    let closeButton = document.getElementById("orderConfirmCloseButton");
    let orderConfirmButtonNo = document.getElementById("orderConfirmButtonNo");
    closeButton.addEventListener('click', function () {
        orderClear();
        orderConfirmWindow.remove();
    });
    orderConfirmButtonNo.addEventListener('click', function () {
        orderClear();
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
    orderClear()
    return;
};

function orderClear() {
    orderData = null;
    orderData = {};
    console.log("clear orderData");
    console.log(orderData);
};

function orderComplete(content) {
    console.log(content);
    console.log("order complete");
}

function displayUserPageButton() {
    if (currentUserLogged != null);
    userPage.className = "userPageShow";
    userPage.addEventListener("click", function () {
        requestUserPage(currentUserLogged.id);
    })
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
        userWindow.remove();
    });
    divFullPage.addEventListener('click', function () {
        userWindow.remove();
    });
    let deleteOrderButton = document.getElementById("deleteOrderButton");
    deleteOrderButton.addEventListener('click', function () {
        deleteLastOrder(currentUserLogged.id);
        userWindow.remove();
        requestUserPage(currentUserLogged.id);
    });
};

function deleteLastOrder(id) {
    id = JSON.stringify({ "id": id });
    let deleteOrderResponse = postRequest('./client/deleteLastOrder/', null, id);
    return deleteOrderResponse;
}

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

function buttonOrderClick() {
    orderManage("placeOrder");
};
function buttonCancelClick() {
    orderManage("abort");
};
function errorMessageShow() {

};
