//-----------------DEVELOPE PARAMS-----------------//
const timerRefreshMainDivsTime = 9995000;
const timerRefreshContentTime = 9995000;
const timerRefreshElementsTime = 9995000;
const timerRefreshCssTime = 9995000;
const logOutTime = 40000;
const closeSideMenuTimeoutTime = 10000;
const sideMenuSlideTime = "0.6s";

//-----------------RUNTIME PARAMS-----------------//
const timerClearLoggedUSerTIme = 999999;
let currentUserLogged;
let messageUi;
let messageClient;
let regexBlock;

const divFullPage = document.getElementById("divFullPage");
const divHeader = document.getElementById("divHeader");
const divTopMenu = document.getElementById("divTopMenu");
const divSideMenu = document.getElementById("divSideMenu");
const divFloatMenu = document.getElementById("divFloatMenu");
const divContent = document.getElementById("divContent");
const divAbout = document.getElementById("divAbout");
const divFooter = document.getElementById("divFooter");

divFullPage.style.opacity = "1";

const openSideMenu = document.getElementById("openSideMenu");

let appendedScriptObjectContent;

window.addEventListener('load', loadUtiliti, true);
function loadUtiliti() {
    populateUtilities();
    // populateMainDivs();
    // populateElements();
};

function populateUtilities(){
    getRequest("./app/messages", buildMessage);
    return;
};

function populateMainDivs() {
    getRequest("./app/header", displayHeader);
    getRequest("./app/topMenu", displayTopMenu);
    getRequest("./app/sideMenu", displaySideMenu);
    getRequest("./app/floatMenu", displayFloatMenu);
    getRequest("./app/content", displayContent);
    getRequest("./app/footer", displayFooter);
    return;
};

function populateContent() {
    getRequest("./app/content", displayContent);
    return;
};

function populateElements() {
    populateProducts();
    return;
};

function buildMessage(content) {
    messageUi = JSON.parse(content).ui[0];
    messageClient = JSON.parse(content).client[0];
    messageError = JSON.parse(content).error[0];
    regexBlock = new RegExp(messageUi.regexBlock, "g");
    return populateMainDivs();
};

function displayHeader(content) {
    divHeader.innerHTML = (content);
    // let headerText = document.getElementById("headerText");
    // let headerAnimElement1 = document.getElementById("headerAnimElement1");
    // let headerAnimElement2 = document.getElementById("headerAnimElement2");
    // headerText.innerText = messageUi.headerText;
    // headerAnimElement1.innerText = messageUi.headerAnimElement1;
    // headerAnimElement2.innerText = messageUi.headerAnimElement2;
};
function displayTopMenu(content) {
    divTopMenu.innerHTML = (content);    
};
function displaySideMenu(content) {
    divSideMenu.innerHTML = (content);
    divSideMenu.className = "sideMenu";
    openSideMenu.addEventListener("click",openSideMenuFunc);
};

function openSideMenuFunc(){    
    divSideMenu.style.transition = `all ${sideMenuSlideTime}`;
    divSideMenu.style.width = "10rem";
    divSideMenu.style.borderWidth = "2px";
    let closeSideMenu = document.getElementById("closeSideMenu");
    closeSideMenu.addEventListener("click",closeSideMenuFunc);
    openSideMenu.removeEventListener("click",openSideMenuFunc);
    openSideMenu.addEventListener("click",closeSideMenuFunc);
    divContent.addEventListener('click',() =>{
        closeSideMenuFunc();
    });
    setTimeout(closeSideMenuFunc,closeSideMenuTimeoutTime);
};

function closeSideMenuFunc(){    
    divSideMenu.style.width = "0px";
    divSideMenu.style.borderWidth = "0px";
    openSideMenu.removeEventListener("click",closeSideMenuFunc);
    openSideMenu.addEventListener("click",openSideMenuFunc);
    divContent.removeEventListener('click',() =>{
        closeSideMenuFunc();
    });
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
    connectEventSource();
};

function populateProducts() {
    getRequest("./app/getProducts", displayProducts);
};
function displayProducts(content) {
    if (divContent.innerHTML == "" || divContent.innerHTML == null) { return };
    let productsDiv = document.getElementById("productsDiv");
    productsDiv.innerHTML = '';
    productsDiv.className = "items";
    productsDiv.innerHTML = content;
};

function populateAbout() {
    getRequest("./app/about", displayAbout);
};
function displayAbout(content) {
    closeSideMenuFunc();  
    divAbout.className = "divAbout";
    divAbout.innerHTML = content;
    divFullPage.addEventListener('click',() =>{
        closeAbout();
    })
};
function closeAbout(){
    divAbout.className = "divAboutClose";
    divAbout.innerHTML = "";
    divFullPage.removeEventListener('click',() =>{
        closeAbout();
})};

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
            if (this.response.errorClient){
                window.parent.openMessageWindow(this.response.errorClient)
            };
            if (callback != null) { callback(this.response); }            
            return this.response;
        };
    };

};
//------------------------SEND POST REQUEST TO: url WITH -> callback function AND APPENDED data----------------
async function postRequest(url, callback, data) {
    if (data == null) { return; }
    var xhttp = new XMLHttpRequest();
    console.log("SENDING POST REQUEST TO: " + url);
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    console.log("SENDING DATA AS JSON: " + data);
    xhttp.send(data);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {            
            // console.log("RESPONSE: ");
            // console.log(this.response);
            let parsedReponse = JSON.parse(this.response);
            // console.log(parsedReponse);
            if (parsedReponse.errorClient){
                window.parent.openMessageWindow(parsedReponse.errorClient)
            };
            if (callback != null) { callback(parsedReponse); }
            return this.response;
        };
    };

};
async function postRequest_bk(url, callback, data) {
    var xhttp = new XMLHttpRequest();
    console.log("SENDING POST REQUEST TO: " + url);
    if (data != null || data == " ") { xhttp.open("POST", url + data, true); }
    if (data == null) { xhttp.open("POST", url, true); }
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // console.log("RESPONSE: " + this.response);
            if (this.response.errorClient){
                window.parent.openMessageWindow(this.response.errorClient)
            };
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
};

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

function refreshPage() {
    location.reload();
};

function randomNumberGen() {
    var val = Math.floor(1000 + Math.random() * 9000);
    return val;
};

function inputSanitize(input) {
    input = input.replace(regexBlock, '');
    input = input.substring(0, 42);    
    return input;
};

function connectEventSource() {
    if (!!window.EventSource) {
        var source = new EventSource('./events')

        source.addEventListener('message', function (event) {
            // console.log(event.data);
            eventHandler(event);
        }, false)

        source.addEventListener('open', function (e) {
            console.log("connected");
        }, false)

        source.addEventListener('error', function (e) {
            if (e.eventPhase == EventSource.CLOSED)
                console.log("closing connection and recall function");
            source.close()
            // setTimeout(connectEventSource(),3000);
            // connectEventSource();
            if (e.target.readyState == EventSource.CLOSED) {
                // connectEventSource();
            }
            else if (e.target.readyState == EventSource.CONNECTING) {
                console.log("connecting");
            }
        }, false)
    } else {
        console.log("Your browser doesn't support SSE")
    }
};


function eventHandler(event) {
    let data = event.data;
    // console.log("event: " + data);
    if (JSON.parse(data) == "refresh") {
        console.log("MATCH REFRESH TERMINAL");
        refreshPage();
    }
    if (JSON.parse(data) == "reloadItems") {
        console.log("MATCH RELOAD ITEMS");
        populateProducts();
    }
    if (JSON.parse(data) == "0") {
        data = data.replace(/^"(.*)"$/, '$1');
        // console.log(data);
        let conIndic = document.getElementById("conIndic");
        conIndic.style.opacity = data;
    }
    if (JSON.parse(data) == "1") {
        data = data.replace(/^"(.*)"$/, '$1');
        // console.log(data);
        let conIndic = document.getElementById("conIndic");
        conIndic.style.opacity = data;
    }
};