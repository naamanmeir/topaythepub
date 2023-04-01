divContent.style.backgroundColor = "black";
// divContent.style.backgroundColor = generateRandomColor();

function generateRandomColor() {
    let maxVal = 0xFFFFFF; // 16777215
    let randomNumber = Math.random() * maxVal;
    randomNumber = Math.floor(randomNumber);
    randomNumber = randomNumber.toString(16);
    let randColor = randomNumber.padStart(6, 0);
    return `#${randColor.toUpperCase()}`
};

searchBox1 = document.getElementById("searchBox");
searchBox1.addEventListener('focus', function () {
    console.log("focus");
    searchBoxClear();
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
    let response = await postRequest('./app/searchName/', window.parent.parseQuery, query);
};

function parseQuery(data) {
    data = JSON.parse(data);
    console.log(data);
    autoComplete(data);
};

function searchBoxClear() {
    clearAutoComplete(document.getElementById("autoComplete"));
    const searchBox = document.getElementById("searchBox");
    if (searchBox1.value.length == 0) { userSearchMessage(0); };
    if (searchBox.value == "") { userSearchMessage(0); };
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
        para.innerText = names[i].nick;
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
