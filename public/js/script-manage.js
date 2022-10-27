var xhttp = new XMLHttpRequest();

// FUNCTIONS TO RUN SERVER ACTIONS
async function placeOrder(orderPack){  
    xhttp.open("GET", "./order/"+orderPack, true);
    xhttp.send();
};

async function createTable(){    
    xhttp.open("GET", "./retable/", true);
    xhttp.send();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.response);                
            return;
            }        
        };
}

function getUserDetailsByFields(nameField,nickField,numberField,nameFieldSmall){
    let name = document.getElementById(nameField).value;
    let nick = document.getElementById(nickField).value;
    let number = document.getElementById(numberField).value;
    let getData = [name,nick,number];
    // console.log(getData);
    getData = JSON.stringify(getData);
    // console.log(getData);
    xhttp.open("POST", "./getUserDetails/"+getData, true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // console.log(this.response);
            editClientFields(this.response,nickField,numberField,nameFieldSmall);
            return;
            }
        };
};

function editClientFields(data,destNick,destNumber,destSmallName){
    destName = document.getElementById(destSmallName);
    destNick = document.getElementById(destNick);
    destNumber = document.getElementById(destNumber);    
    data = JSON.parse(data);
    console.log(data[0].name);
    let gotName = data[0].name;
    let gotNick = data[0].nick;
    let gotNumber = data[0].account;    
    console.log(gotName,gotNick,gotNumber);
    destName.value = gotName;
    destNick.value = gotNick;
    destNumber.value = gotNumber;
}

function insertName(nameField,nickField,numberField){
    let newName = document.getElementById(nameField).value;
    let newNick = document.getElementById(nickField).value;
    let newNumber = document.getElementById(numberField).value;    
    let newData = [newName,newNick,newNumber];
    newData = JSON.stringify(newData);    
    xhttp.open("POST", "./insertClient/"+newData, true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.response);                
            return;
            }        
        };
};

function getAllData(scope){
    // console.log(scope);
    xhttp.open("POST", "./getAllData/"+scope, true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // console.log(this.response);
            if(scope==1){
                showDataTable(JSON.parse(this.response));
            }
            if(scope==2){
                showAccountTable(JSON.parse(this.response));
            }            
            return;
            }
        };
};

function showDataTable(data){    
    const table = document.createElement("table");
    const tableBody = document.createElement("tbody");
    const TR = document.createElement("tr");
    TR.innerHTML = ("<th>ID</th><th>נרשם בתאריך</th><th>מוצר1</th><th>מוצר2</th><th>מוצר3</th><th>מוצר4</th><th>סך הכל</th><th>מספר חשבון</th><th>שם רשום</th><th>כינוי</th>");
    tableBody.appendChild(TR);
    for(let i = 0;i < data.length; i++){
        const row = document.createElement("tr");
        let clientRow = Object.values(data[i]);        
        for (let j = 0; j < clientRow.length; j++) {            
            const cell = document.createElement("td");
            let cellText = document.createTextNode(clientRow[j]);            
            cell.appendChild(cellText);
            row.appendChild(cell);
        }
        row.setAttribute("dir","rtl");
        if(i % 2 === 0  ){row.setAttribute("style", "background-color:lightblue;")}
    tableBody.appendChild(row);    
    }
    table.appendChild(tableBody);  
    table.setAttribute("border", "1");
    table.setAttribute("align", "center");
    table.setAttribute("style", "font-size:larger");
    table.setAttribute("class", "tableStyle");
    var tableWindow = window.open("", "טבלת חיובים", "width=800, height=800, dir=rtl");    
    tableWindow.document.write();    
    tableWindow.document.appendChild(table);
};

function showAccountTable(data){    
    const table = document.createElement("table");
    const tableBody = document.createElement("tbody");
    const TR = document.createElement("tr");
    TR.innerHTML = ("<th>סכום</th><th>מספר חשבון</th><th>שם</th>");    
    tableBody.appendChild(TR);
    for(let i = 0;i < data.length; i++){
        const row = document.createElement("tr");
        let clientRow = Object.values(data[i]);        
        for (let j = 0; j < clientRow.length; j++) {
            if(j == 2){clientRow[j] = clientRow[j]};
            const cell = document.createElement("td");
            const cellText = document.createTextNode(clientRow[j]);
            cell.appendChild(cellText);
            row.appendChild(cell);
        }
        row.setAttribute("dir","rtl");
        if(i % 2 === 0  ){row.setAttribute("style", "background-color:lightblue;")}
    tableBody.appendChild(row);    
    }
    table.appendChild(tableBody);  
    table.setAttribute("border", "1");
    table.setAttribute("align", "center");
    table.setAttribute("style", "font-size:larger");
    table.setAttribute("class", "tableStyle");
    var tableWindow = window.open("", "טבלת חיובים", "width=800, height=800, dir=rtl");    
    tableWindow.document.write();    
    tableWindow.document.appendChild(table);
};

function backupTable(){
    xhttp.open("POST", "./backupTable/", true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.response);
            // showDataTable(JSON.parse(this.response));
            return;
            }
        };
};

function resetDbData(){

};

function defineInputFields(){
let inputElements = document.getElementsByClassName("textbox");
const inputs = document.querySelectorAll('input');
inputs.forEach(input => {
//   input.setAttribute('autocomplete', 'off')
  input.setAttribute('autocorrect', 'off');
  input.setAttribute('autocapitalize', 'off');
  input.setAttribute('spellcheck', false);
});
for (i=0;i<inputElements.length;i++){
    inputElements[i].addEventListener('input', inputFilter);
    // console.log(inputElements[i]);    
}
};

defineInputFields();

function inputFilter(e){
    let t = e.target;
    // let goodValues = /^[a-z\u05D0-\u05EA]+$/i; // HEBREW REGEX
    let badValues = /[\d/\/.,"``;~./\[/\]/\-=+?{}<>":!\d|/\\/#$%@^&*()]/gi;
    t.value = t.value.replace(badValues, '');
    return t;
};

function searchBox(){
    const searchBox = document.getElementById("searchBox");
    let searchText = searchBox.value;
    searchText = searchText.replace(/\\/g, '');
    searchText = searchText.replace(/\//g, '');
    searchText = searchText.replace(/[0-9]/g, '');
    searchText = searchText.replace(/\./g, '');
    searchText = searchText.replace(/\,/g, '');
    searchText = searchText.replace(/\`/g, '');
    searchText = searchText.replace(/\"/g, '');
    searchText = searchText.substring(0,42);    
    searchBox.value = searchText;
    searchText = searchText.replace(/\'/g, "''");
    if(searchText == ""){
        searchText = "-";
    };
    if(limit == 0){
        limit = 1;        
        setTimeout(() => {
            limit = 0;
            searchQuery(searchText,searchBox);
        },250);
    };
};

function searchQuery(query,dest){
    let clients;
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            if(this.response == (JSON.stringify("clear"))){
                console.log("CLEAR AUTOSEARCH");
                clients = null;
                clearAutoComplete(document.getElementById("autoComplete"));
                return;
            }        
        clients = JSON.parse(this.response);        
        if(clients[0] != null){
            foundNames(query,clients,dest);
            }
        };
      };
    if(query != ""){
        query = JSON.stringify(query);
        xhttp.open("POST", "./searchName/"+query, true);
        xhttp.send();
    }else{
        clients = null;
        clearAutoComplete(document.getElementById("autoComplete"));
    };
};

function autoComplete(names){
    const autoDiv = document.getElementById("autoComplete");
    clearAutoComplete(autoDiv);
    autoDiv.className = "autoCompleteSuggestions";
    for(i=0;i<names.length && i<5;i++){
        const para = document.createElement("p");
        para.className = "autocomplete-items";
        para.innerText = names[i];        
        autoDiv.appendChild(para);
        para.onclick = function () {
            copyTextToSearchBox(para.innerText);
            login(para.innerText);
            clearAutoComplete(autoDiv);            
        }
    };
};

function clearAutoComplete(autoDiv){
    autoDiv.className = "autoCompleteNone";
    while (autoDiv.hasChildNodes()) {
        autoDiv.removeChild(autoDiv.firstChild);
      };
};

function copyTextToSearchBox(text){
    const searchBox = document.getElementById("searchBox");
    searchBox.value = text;
};

function login(name){
    console.log(name);

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        login = JSON.parse(this.response);
        console.log(login);
        clientName = login[0].name;
        id = login[0].id;
        console.log("id: "+id+" name: "+clientName);
      };
    };
    if(name != ""){
        name = JSON.stringify(name);
        xhttp.open("POST", "./searchName/"+name, true);
        xhttp.send();
    };
}

// OLD FUNCTIONS FOR ADD REMOVE --------------------------
let nameInsert;
function createName(){
    let text = document.getElementById("insertNameText");     
    nameInsert = text.value;
    // console.log(nameInsert);
}
function insertNameOld(){
    nameInsert = nameInsert.replace(/\'/g, "''");
    nameInsert = JSON.stringify(nameInsert);
    xhttp.open("POST", "./insertName/"+nameInsert, true);
    xhttp.send();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.response);                
            return;
            }        
        };
};
function createNameForDelete(){
    let text = document.getElementById("deleteNameText");     
    nameRemove = text.value;
    // console.log(nameInsert);
}
let nameRemove;
function deleteName(){
    nameRemove = nameRemove.replace(/\'/g, "''");
    nameRemove = JSON.stringify(nameRemove);
    xhttp.open("POST", "./deleteName/"+nameRemove, true);
    xhttp.send();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.response);                
            return;
            }        
        };
};

// LOG CONSOLE TO SCREEN ------------------------------
function clearConsole(){
    document.getElementById("console").innerHTML ="";
};
if (typeof console  != "undefined") 
  if (typeof console.log != 'undefined')
    console.olog = console.log;
else
  console.olog = function() {};

console.log = function(message) {
  console.olog(message);
  $('#console').append('<p>' + message + '</p>');
};
console.error = console.debug = console.info =  console.log;