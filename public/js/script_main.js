//-----------------DEVELOPE PARAMS-----------------//
const timerRefreshMainDivsTime = 9995000;
const mainDivsAutoRefreshIntervalTime = 600000;
const timerRefreshContentTime = 9995000;
const timerRefreshElementsTime = 9995000;
const timerRefreshCssTime = 9995000;
// const logOutTime = 60000;
const closeSideMenuTimeoutTime = 10000;
const sideMenuSlideTime = "0.6s";
const windowFadeTime = 800;

let autoLogoutTime = 90000;
let closeAppAttempt = 6;

//-----------------RUNTIME PARAMS-----------------//
const timerClearLoggedUSerTIme = 999999;
let currentUserLogged;
let messageUi;
let messageClient;
let regexBlock;

var fs = false;

const divFullPage = document.getElementById("divFullPage");
const divHeader = document.getElementById("divHeader");
const divTopMenu = document.getElementById("divTopMenu");
const divSideMenu = document.getElementById("divSideMenu");
const divFloatMenu = document.getElementById("divFloatMenu");
const divContent = document.getElementById("divContent");
const divMessageBoard = document.getElementById("divMessageBoard");
const divAbout = document.getElementById("divAbout");
const divFooter = document.getElementById("divFooter");

divFullPage.style.opacity = "1";

const openSideMenu = document.getElementById("openSideMenu");

let appendedScriptObjectContent;

window.addEventListener('load', loadUtiliti, true);
function loadUtiliti() {
    window.history.pushState({}, '');
    window.addEventListener('popstate', function() {
        // console.log(closeAppAttempt);
        if(closeAppAttempt>0){
            window.history.pushState({}, '');
            closeAppAttempt--;
        };
    });
    populateUtilities();
    loadTheme();
    loadUiConfig();
    mainDivsAutoRefreshInterval();
    setViewport();
    // populateMainDivs();
    // populateElements();
};

function loadTheme() {
    var req = new XMLHttpRequest();
    req.open("GET", "./app/theme", true);
    req.send();
    req.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            try {
                const response = JSON.parse(this.response);
                applyTheme(response.theme || 'default');
                applyBackgroundMode(response.backgroundMode || 'none');
            } catch (error) {
                applyTheme('default');
                applyBackgroundMode('none');
            }
        }
    };
}

function loadUiConfig() {
    var req = new XMLHttpRequest();
    req.open("GET", "./app/ui-config", true);
    req.send();
    req.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            try {
                const response = JSON.parse(this.response);
                applyTheme(response.theme || 'default');
                applyBackgroundMode(response.backgroundMode || 'none');
                applyUiConfig(response);
            } catch (error) {
                applyUiConfig({});
            }
        }
    };
}

function applyUiConfig(config) {
    window.latestUiConfig = config || {};
    const keepCurrentBackground = Boolean(
        config && config.backgroundRandomEnabled && !config.backgroundImage && window.currentBackgroundImage
    );
    window.shopUiConfig = {
        scrollEnabled: config.scrollEnabled !== false,
        scrollSpeed: config.scrollSpeed || 'medium',
        scrollTextColor: config.scrollTextColor || 'default',
        scrollTextColorCustom: config.scrollTextColorCustom || '',
        scrollTextSizePx: config.scrollTextSizePx,
        scrollTextWeight: config.scrollTextWeight,
        scrollTextSpacing: config.scrollTextSpacing,
        scrollOrderMode: config.scrollOrderMode || 'random',
        scrollLocation: config.scrollLocation || 'top',
        scrollDelayMs: config.scrollDelayMs,
        backgroundImage: config.backgroundImage || '',
        backgroundImageOpacity: normalizeOpacityValue(config.backgroundImageOpacity),
        backgroundOverlayColor: config.backgroundOverlayColor || '',
        backgroundPattern: config.backgroundPattern || 'none',
        backgroundRandomEnabled: Boolean(config.backgroundRandomEnabled),
        backgroundRandomIntervalMin: config.backgroundRandomIntervalMin,
        backgroundRandomPool: Array.isArray(config.backgroundRandomPool) ? config.backgroundRandomPool : [],
        backgroundFolderAllowList: Array.isArray(config.backgroundFolderAllowList) ? config.backgroundFolderAllowList : []
    };
    if (!keepCurrentBackground) {
        applyBackgroundImage(window.shopUiConfig.backgroundImage);
    }
    applyBackgroundImageOpacity(window.shopUiConfig.backgroundImageOpacity);
    applyBackgroundOverlayColor(window.shopUiConfig.backgroundOverlayColor);
    applyBackgroundPattern(window.shopUiConfig.backgroundPattern);
    startBackgroundRotation(window.shopUiConfig);
    if (typeof window.applyScrollConfig === 'function') {
        window.applyScrollConfig(window.shopUiConfig);
    }
}

function applyBackgroundImage(path) {
    const normalized = normalizeImagePath(path);
    if (!normalized) {
        document.body.style.removeProperty('--bg-image');
        window.currentBackgroundImage = '';
        return;
    }
    document.body.style.setProperty('--bg-image', `url('${normalized}')`);
    window.currentBackgroundImage = normalized;
}

function normalizeImagePath(path) {
    if (!path) {
        return '';
    }
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    if (path.startsWith('/')) {
        return path;
    }
    return `/${path}`;
}

function normalizeOpacityValue(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return 0.08;
    }
    if (parsed < 0) {
        return 0;
    }
    if (parsed > 1) {
        return 1;
    }
    return parsed;
}

function applyBackgroundImageOpacity(value) {
    const normalized = normalizeOpacityValue(value);
    document.body.style.setProperty('--bg-image-opacity', normalized);
}

function applyBackgroundOverlayColor(value) {
    if (!value) {
        document.body.style.removeProperty('--bg-overlay-color');
        return;
    }
    document.body.style.setProperty('--bg-overlay-color', value);
}

function applyBackgroundPattern(patternKey) {
    const patterns = {
        none: { image: 'none', size: 'auto' },
        dots: {
            image: 'radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)',
            size: '14px 14px'
        },
        grid: {
            image: 'linear-gradient(rgba(255, 255, 255, 0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.18) 1px, transparent 1px)',
            size: '18px 18px'
        },
        diagonal: {
            image: 'repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.2) 0 2px, transparent 2px 8px)',
            size: 'auto'
        },
        waves: {
            image: 'repeating-radial-gradient(circle at 0 0, rgba(255, 255, 255, 0.18) 0 2px, transparent 2px 10px)',
            size: '20px 20px'
        }
    };
    const selected = patterns[patternKey] || patterns.none;
    document.body.style.setProperty('--bg-pattern', selected.image);
    document.body.style.setProperty('--bg-pattern-size', selected.size);
}

let backgroundRandomTimer = null;
let backgroundFadeTimeout = null;

function startBackgroundRotation(config) {
    if (backgroundRandomTimer) {
        clearInterval(backgroundRandomTimer);
        backgroundRandomTimer = null;
    }
    if (!config || !config.backgroundRandomEnabled) {
        return;
    }
    const pool = Array.isArray(config.backgroundRandomPool) ? config.backgroundRandomPool : [];
    if (!pool.length) {
        return;
    }
    const intervalMin = Number(config.backgroundRandomIntervalMin) || 10;
    const intervalMs = Math.max(1, intervalMin) * 60 * 1000;
    if (!window.currentBackgroundImage) {
        setRandomBackground(pool);
    }
    backgroundRandomTimer = setInterval(function () {
        setRandomBackground(pool);
    }, intervalMs);
}

function setRandomBackground(pool) {
    if (!pool.length) {
        return;
    }
    const next = pool[Math.floor(Math.random() * pool.length)];
    fadeToBackgroundImage(next);
}

function fadeToBackgroundImage(path) {
    const normalized = normalizeImagePath(path);
    const targetOpacity = normalizeOpacityValue(window.shopUiConfig && window.shopUiConfig.backgroundImageOpacity);
    if (backgroundFadeTimeout) {
        clearTimeout(backgroundFadeTimeout);
        backgroundFadeTimeout = null;
    }
    applyBackgroundImageOpacity(0);
    backgroundFadeTimeout = setTimeout(function () {
        if (!normalized) {
            document.body.style.removeProperty('--bg-image');
            window.currentBackgroundImage = '';
        } else {
            document.body.style.setProperty('--bg-image', `url('${normalized}')`);
            window.currentBackgroundImage = normalized;
        }
        applyBackgroundImageOpacity(targetOpacity);
    }, 700);
}

function applyTheme(theme) {
    const themeLink = document.getElementById("themeStylesheet");
    if (!themeLink) {
        return;
    }
    if (!theme || theme === 'default') {
        themeLink.setAttribute('href', '');
        document.body.dataset.theme = '';
        return;
    }
    themeLink.setAttribute('href', `./css/themes/${theme}.css?version=${new Date().getTime()}`);
    document.body.dataset.theme = theme;
}

function applyBackgroundMode(mode) {
    document.body.dataset.bgMode = mode || 'none';
}

function setViewport(){
    setTimeout(()=>
    document.querySelector("meta[name=viewport]").setAttribute("content", "height=" + screen.height*0.9 + "px, width=device-width, initial-scale=1.0")
 , 300);
}

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

function mainDivsAutoRefreshInterval(){
    setInterval(mainDivsRefreshAction,mainDivsAutoRefreshIntervalTime);
};

function mainDivsRefreshAction(){
    getRequest("./app/header", displayHeader);
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
    if (window.latestUiConfig && typeof window.applyScrollConfig === 'function') {
        window.applyScrollConfig(window.latestUiConfig);
    }
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
    });
    window.addEventListener('popstate', function() {
        closeAbout();
    });
};
function closeAbout(){
    divAbout.className = "divAboutClose";
    divAbout.innerHTML = "";
    closeAppAttempt = 6;
    divFullPage.removeEventListener('click',() =>{
        closeAbout();
})};


//------------------------SEND GET REQUEST TO: url WITH -> callback function AND APPENDED data----------------
async function getRequest(url, callback, data) {
    var xhttp = new XMLHttpRequest();
    // console.log("SENDING GET REQUEST TO: " + url);
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
    // console.log("SENDING POST REQUEST TO: " + url);
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    // console.log("SENDING DATA AS JSON: " + data);
    xhttp.send(data);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {            
            // console.log("RESPONSE: ");
            // console.log(this.response);
            if(isJson(this.response)){
                let parsedReponse = JSON.parse(this.response);
                // console.log(parsedReponse);            
                if (parsedReponse.errorClient){
                    window.parent.openMessageWindow(parsedReponse.errorClient)
                };
                if (callback != null) { callback(parsedReponse); }
                return parsedReponse;
            }else{
                return;
            }
            if (callback != null) { callback(this.response); }
            return this.response;
        };
    };

};

function isJson(input) {
    // console.log("testing for JSON input:");
    // console.log(input);
    try {        
        JSON.parse(input);
    } catch (e) {
        // console.log("false");
        // console.log(e);
        return false;
    }
    // console.log("true");
    return true;
};

async function postRequest_bk(url, callback, data) {
    var xhttp = new XMLHttpRequest();
    // console.log("SENDING POST REQUEST TO: " + url);
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

//------------------------ UI ELEMENTS----------------//

function closeWindows(){
    userPageButton.setAttribute('userPageButtonEnableListener', 0);
    enableUserPageButton();
    userPageButton.style.pointerEvents = "auto";
    const windows = document.querySelectorAll('.window');
    var seconds = windowFadeTime/1000;
    divContent.classList.remove("hidden");
    keyboardFocusMain();
    windows.forEach(window => {
        window.style.transition = "opacity "+seconds+"s ease";
        window.style.opacity = 0;
    });
    setTimeout(()=>{
        windows.forEach(window => {
            window.remove();
        });
        getRequest('./client/windowIsClose/',null,null);
    },windowFadeTime);
    closeAppAttempt = 6;
    return;
};

function hideWindows(){
    userPageButton.setAttribute('userPageButtonEnableListener', 0);
    enableUserPageButton();
    userPageButton.style.pointerEvents = "auto";
    const windows = document.querySelectorAll('.windowConstant');
    var seconds = windowFadeTime/1000;
    divContent.classList.remove("hidden");
    keyboardFocusMain();
    windows.forEach(window => {
        window.style.transition = "opacity "+seconds+"s ease";
        window.style.opacity = 0;
    });
    setTimeout(()=>{
        windows.forEach(window => {
            window.className = "hidden";
        });
        getRequest('./client/windowIsClose/',null,null);
    },windowFadeTime);
    closeAppAttempt = 6;
    return;
};

function openWindows(openWindow){
    openWindow.classList.remove("hidden");
    openWindow.style.transition = "opacity 0s ease";
    openWindow.style.opacity = 0;
    var seconds = windowFadeTime/1000;
    openWindow.style.transition = "opacity "+seconds+"s ease";
    openWindow.style.opacity = 1;
    openWindow.classList.add("windowConstant");
    openWindow.classList.add("messageBoardWindow");
    divContent.style.transition = "opacity "+seconds+"s ease";
    divContent.classList.add("hidden");
    closeAppAttempt = 6;
    return;
};


function fullScreenOn() {
    if (!fs) {
        document.body.requestFullscreen();
        setTimeout(function () {
            // document.getElementById("fs_mark").style.backgroundImage = "url(img/ui/fs1.png)";
            // document.getElementById("fs_mark").innerText = ("חלון");
            // window.scrollTo(0,1);
            closeSideMenuFunc();
            fs = true;
            viewport.setAttribute("content", "width=" + window.innerWidth + ", height=" + window.innerHeight + ", initial-scale=1.0, maximum-scale=1.0, user-scalable=no");
        }, 300);
    }
    if (fs) {
        setTimeout(function () {
            // document.getElementById("fs_mark").style.backgroundImage = "url(img/ui/fs2.png)";
            // document.getElementById("fs_mark").innerText = ("מסך מלא");
            document.exitFullscreen();
            // window.scrollTo(0,200);
            closeSideMenuFunc();
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

//------------------------FAKE FUNCTION TO NULL RESPONSES----------------
async function responseToNull(res) {
    // console.log("response went to null");
    // console.log(res);
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

function gotoManagePage(){
    window.location.href = './manage';

    // getRequest('./manage',null,null);    
    return;
};

function clientLogout(){
    getRequest('./logout',null,null);
    setTimeout(refreshPage,3500)
    return;
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

//------------------------ SERVER SIDE EVENTS ----------------//


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
            setTimeout(refreshPage,10000);
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
    if (JSON.parse(data) == "refresh") {
        refreshPage();
    };
    if (JSON.parse(data) == "reloadItems") {
        populateProducts();
    };
    if (JSON.parse(data) == "reloadPosts") {
        messageBoardRefreshPosts();
        otherSideIsTyping(0);
    };
    if (JSON.parse(data) == "reloadPostsNoScroll") {
        messageBoardRefreshPostsNoScroll();
        otherSideIsTyping(0);
    };
    if (JSON.parse(data) == "uiConfig") {
        loadUiConfig();
    };
    if (JSON.parse(data) == "chatbotIsTyping") {
        otherSideIsTyping(1);
    };
    if (JSON.parse(data) == "chatbotIsNotTyping") {
        otherSideIsNotTyping();
        otherSideIsTyping(0);
    };
    if (JSON.parse(data) == "photobotIsPainting") {
        otherSideIsTyping(2);
    };
    if (JSON.parse(data) == "photobotIsPaintingApainting") {
        otherSideIsTyping(3);
    };
    if (JSON.parse(data) == "photobotIsNotPainting") {
        otherSideIsNotTyping();
        otherSideIsTyping(0);
    };
    if (JSON.parse(data) == "0") {
        data = data.replace(/^"(.*)"$/, '$1');
        let conIndic = document.getElementById("conIndic");
        conIndic.style.opacity = data;
    };
    if (JSON.parse(data) == "1") {
        data = data.replace(/^"(.*)"$/, '$1');
        let conIndic = document.getElementById("conIndic");
        conIndic.style.opacity = data;
    };
};