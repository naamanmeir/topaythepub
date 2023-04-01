const timerRefreshMainDivsTime = 9995000;
const timerRefreshContentTime = 9995000;
const timerRefreshElementsTime = 9995000;
const timerRefreshCssTime = 9995000;


const divHeader = document.getElementById("divHeader");
const divTopMenu = document.getElementById("divTopMenu");
const divSideMenu = document.getElementById("divSideMenu");
const divFloatMenu = document.getElementById("divFloatMenu");
const divContent = document.getElementById("divContent");
const divFooter = document.getElementById("divFooter");

let appendedScriptObjectContent;

let searchBox1;

window.addEventListener('load', loadUtiliti, false);
function loadUtiliti() {
    setTimeout(populateMainDivs(), 100);
    let timerRefreshMainDivs = setInterval(populateMainDivs, timerRefreshMainDivsTime);
    let timerRefreshContent = setInterval(populateContent, timerRefreshContentTime);
    setTimeout(populateElements(), 110);
    let timerRefreshElements = setInterval(populateElements, timerRefreshElementsTime);
    let timerRefreshCss = setInterval(refreshCss, timerRefreshCssTime);
};

function populateMainDivs() {
    getRequest("./app/header", displayHeader);
    getRequest("./app/topMenu", displayTopMenu);
    getRequest("./app/sideMenu", displaySideMenu);
    getRequest("./app/floatMenu", displayFloatMenu);
    getRequest("./app/content", displayContent);
    getRequest("./app/footer", displayFooter);
};

function populateContent() {
    getRequest("./app/content", displayContent);
};

function populateElements() {
    getRequest("./app/getProducts", displayProducts);
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
    appendScriptContent();
};
function appendScriptContent() {
    let scriptSrc = document.getElementById("contentScript");
    var script = document.createElement("script");
    script.src = (scriptSrc.src) + '?id=' + randomNumberGen();
    scriptSrc.remove();
    divContent.append(script);
    populateProducts();
};

function displayFooter(content) {
    divFooter.innerHTML = (content);
};

function populateProducts() {
    getRequest("./app/getProducts", displayProducts);
};
function displayProducts(content) {
    if (divContent.innerHTML == "" || divContent.innerHTML == null) { return };
    let productsDiv = document.getElementById("productsDiv");
    productsDiv.className = "items";
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
//------------------------SEND PORT REQUEST TO: url WITH -> callback function AND APPENDED data----------------
async function postRequest(url, callback, data) {
    var xhttp = new XMLHttpRequest();
    console.log("SENDING POST REQUEST TO: " + url);
    if (data != null) { xhttp.open("POST", url + data, true); }
    if (data == null) { xhttp.open("POST", url, true); }
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // console.log("RESPONSE: " + this.response);
            if (callback != null) { callback(this.response); }
            return this.response;
        };
    };

};
//------------------------FAKE FUNCTION TO NULL RESPONSES----------------
async function responseToNull(res) {
    console.log("response went to null");
    console.log(res);
    res = null;
    delete res;
}
function refreshCss() {
    let links = document.getElementsByTagName('link');
    for (let i = 0; i < links.length; i++) {
        if (links[i].getAttribute('rel') == 'stylesheet') {
            let href = links[i].getAttribute('href').split('?')[0];
            let newHref = href + '?version='
                + new Date().getMilliseconds();
            // console.log(newHref)
            links[i].setAttribute('href', newHref);
        }
    }
};

function randomNumberGen() {
    var val = Math.floor(1000 + Math.random() * 9000);
    return val;
};
