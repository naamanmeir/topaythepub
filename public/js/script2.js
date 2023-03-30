const timerRefreshMainDivsTime = 95000;
const timerRefreshElementsTime = 5000;

const divHeader = document.getElementById("divHeader");
const divTopMenu = document.getElementById("divTopMenu");
const divSideMenu = document.getElementById("divSideMenu");
const divFloatMenu = document.getElementById("divFloatMenu");
const divContent = document.getElementById("divContent");
const divFooter = document.getElementById("divFooter");

window.addEventListener('load', loadUtiliti, false);
function loadUtiliti() {
    setTimeout(populateMainDivs(), 100);
    let timerRefreshMainDivs = setInterval(populateMainDivs, timerRefreshMainDivsTime);
    setTimeout(populateElements(), 110);
    let timerRefreshElements = setInterval(populateElements, timerRefreshElementsTime);
};

function populateMainDivs() {
    getRequest("./app/header", displayHeader);
    getRequest("./app/topMenu", displayTopMenu);
    getRequest("./app/sideMenu", displaySideMenu);
    getRequest("./app/floatMenu", displayFloatMenu);
    getRequest("./app/content", displayContent);
    getRequest("./app/footer", displayFooter);
};

function populateElements() {
    getRequest("./app/getProductsHtml", displayProducts);
};

function displayHeader(content) {
    divHeader.innerHTML = (content);
};
function displayTopMenu(content) {
    divTopMenu.innerHTML = (content);
};
function displaySideMenu(content) {
    divSideMenu.innerHTML = (content);
    divSideMenu.className = "hidden";
};

function displayFloatMenu(content) {
    divFloatMenu.innerHTML = (content);
};
function displayContent(content) {
    divContent.innerHTML = (content);
    let scriptSrc = document.getElementById("contentScript");
    var script = document.createElement("script");
    script.src = (scriptSrc.src);
    scriptSrc.remove();
    divContent.append(script);
};
function displayFooter(content) {
    divFooter.innerHTML = (content);
};

function populateProducts() {
    getRequest("./app/getProductsHtml", displayProducts);
};
function displayProducts(content) {
    if (divContent.innerHTML == "" || divContent.innerHTML == null) { return };
    let productsDiv = document.getElementById("productsDiv");
    console.log(content);
    productsDiv.innerHTML = content;
};

//------------------------SEND GET REQUEST TO: url WITH -> callback function AND APPENDED data----------------
async function getRequest(url, callback, data) {
    var xhttp = new XMLHttpRequest();
    console.log("SENDING GET REQUEST TO: " + url);
    if (data != null) { xhttp.open("GET", url + data, true); }
    if (data == null) { xhttp.open("GET", url, true); }
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // console.log("RESPONSE: " + this.response);
            if (callback != null) { callback(this.response); }
            return this.response;
        };
    };

};