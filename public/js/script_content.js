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
const autoCompleteDiv = document.getElementById("autoComplete");

//------------------------ OBJECT EVENT LISTENERS ------------------------//
searchBox1.addEventListener('focus', function () {
    console.log("focus");
    searchBox1.placeholder = ("👉👉התחילו לכתוב את שמכם");
    if (searchBox1.value.length > 0) { searchBox1.placeholder = (""); };
});
searchBox1.addEventListener('blur', function () {
    console.log("blur");
    searchBox1.placeholder = ("שלום הכניסו שם✍👉👉");
});
searchBox1.addEventListener('input', function () {
    console.log("input");
    let input = searchBox1.value;
    sendQuery(input);
});

async function sendQuery(query) {
    query = JSON.stringify({ "name": query });
    console.log("send query: '" + query + "'");
    await postRequest('./app/searchName/', window.parent.parseQuery, query);
    return;
};

function parseQuery(data) {
    data = JSON.parse(data);
    autoComplete(data);
};

function searchBoxClear() {
    clearAutoComplete(document.getElementById("autoComplete"));
    if (searchBox1.value.length == 0) { searchIndicator(0); };
};

function autoComplete(names) {
    clearAutoComplete(autoCompleteDiv);
    if (names.length == 0) { searchIndicator(1) };
    autoCompleteDiv.className = "autoCompleteSuggestions";
    for (i = 0; i < names.length && i < maxAutoCompleteResults; i++) {
        const row = document.createElement("p");
        row.className = "autocomplete-items";
        if (i % 2 === 0) { row.classList.add("autocomplete-itemsEven"); }
        row.innerText = names[i].nick;
        autoCompleteDiv.appendChild(row);
        row.onclick = function () {
            searchBox1.value = row.innerText;
            clearAutoComplete(autoCompleteDiv);
            searchIndicator(3);
        };
    };
    if (names[0] == searchBox1.value) {
        clearAutoComplete(autoCompleteDiv);
        searchIndicator(3);
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

function searchIndicator(state) {
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
            break;
        default:
            console.log("USER STATE INDIC OUT OF SCOPE")
            break;
    };
};