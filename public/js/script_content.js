// divContent.style.backgroundColor = "black";
// divContent.style.backgroundColor = generateRandomColor();

let currentUserLogged;

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

//------------------------ OBJECT EVENT LISTENERS ------------------------//

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
    // console.log("input");
    let input = searchBox1.value;
    sendQuery(input);
});
buttonOrder.addEventListener('click', function () {
    console.log("button order click");
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
    await postRequest('./app/searchName/', window.parent.parseQuery, query);
    return;
};

function parseQuery(data) {
    data = JSON.parse(data);
    // console.log(data);
    autoComplete(data);
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
    console.log("CURRENT USER LOGGED: " + data);
    currentUserLogged = data;
};

function buttonOrderClick() {

};
function buttonCancelClick() {

};
function errorMessageShow() {

};