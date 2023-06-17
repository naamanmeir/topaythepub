var xhttp = new XMLHttpRequest();

const divHeader = document.getElementById("header");
const divContent = document.getElementById("content");
const searchBox1 = document.getElementById("content");

divHeader.style.backgroundColor = "red";
getRequest(displayHeader, "./app/header");

function displayHeader(content) {
    let window = divHeader;
    window.innerHTML = (content);
};


//------------------------SEND GET REQUEST WITH -> callback function , url , data----------------
async function getRequest(callback, url, data) {
    console.log("SENDING GET REQUEST TO: " + url);
    if (data != null) { xhttp.open("GET", url + data, true); }
    if (data == null) { xhttp.open("GET", url, true); }
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log("RESPONSE: " + this.response);
            callback(this.response);
            return this.response;
        };
    };
};