// console.log("MESSAGE BOARD SCRIPT INIT");

window.addEventListener('load', loadUtiliti, true);
function loadUtiliti() {
    // console.log("LOADED");
    messageBoardRefreshPosts();
    mBoardUtilities();
    connectEventSource();
};

let postInput; 
let postsDiv;

function callMessageBoard(){
    getRequest("./mboard/openBoard", displayMessageBoard);
    return;
};

function closeMessageBoard(){
    hideWindows();
    return;
};

function mBoardUtilities(){    
    postInput = document.getElementById("postInput");
    // postInput.addEventListener("input",resetAutoLogoutMboard)
}

function keyboardFocusMboard(){
    // console.log("MBOARD FOCUS");
    if(document.getElementById("postInput") != null){
    window.onkeydown = function () { postInput.focus(); };
    postInput.addEventListener("keypress", function(event) {        
        if (event.key === "Enter") {
            // console.log("TESTING ENTER");
            event.preventDefault();
            document.getElementById("mboardSend").click();
        }
    });
}
    return;
};

function resetAutoLogoutMboard(){    
    resetAutoLogout();
};

function postSend(){
    if (postInput.value == ""){return;};
    let post = postInput.value;
    postInput.value = "";
    let postJSON = JSON.stringify({"post": post});
    postRequest('./insertPost', messageBoardRefreshPosts, postJSON);
    // console.log("INSERT FROM REMOTE")
    return;    
};

function messageBoardRefreshPosts(){
    // console.log("RELOAD POSTS");
    getRequest("./reloadPosts", displayPostsInDiv);
    return;
};

function displayPostsInDiv(content){
    content = JSON.parse(content);    
    postsDiv = document.getElementById("divPosts");
    postsDiv.innerHTML = content;
    postsDiv.scrollTop = postsDiv.scrollHeight;
    return;    
};

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
            // console.log(this.response);
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
    return;
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
        // console.log(source)
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
    // console.log("event: " + data);
    if (JSON.parse(data) == "refresh") {
        // console.log("MATCH REFRESH TERMINAL");
        refreshPage();
    }

    if (JSON.parse(data) == "reloadPosts") {
        // console.log("MATCH MESSAGE BOARD RELOAD POSTS");
        messageBoardRefreshPosts();
    }
    // if (JSON.parse(data) == "0") {
    //     data = data.replace(/^"(.*)"$/, '$1');
    //     // console.log(data);
    //     let conIndic = document.getElementById("conIndic");
    //     conIndic.style.opacity = data;
    // }
    // if (JSON.parse(data) == "1") {
    //     data = data.replace(/^"(.*)"$/, '$1');
    //     // console.log(data);
    //     let conIndic = document.getElementById("conIndic");
    //     conIndic.style.opacity = data;
    // }
};