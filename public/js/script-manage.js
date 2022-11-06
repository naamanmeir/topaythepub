var xhttp = new XMLHttpRequest();

var limit = 0; // throttle limiter for db

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
};

const searchBox1 = document.getElementById("getUserByName");
searchBox1.addEventListener('focus',function(){
    searchBoxClear();
    if(searchBox1.value.length==0){userSearchMessage(0);};
    if(searchBox1.value.length>0){searchBox1.placeholder=("");};
});
searchBox1.addEventListener('blur',function(){
    if(searchBox1.value==''||searchBox1.value==null)
    {clientId=null;clientName=null;clientAccount=null;clientNick=null;};
    searchBoxClear();    
});
searchBox1.addEventListener('input',function(){
    searchBoxClear();    
    if(searchBox1.value.length==0){userSearchMessage(0);};
    if(searchBox1.value.length>0){searchBox1.placeholder=("");};
    searchBox(searchBox1.value);    
});
function searchBox(text){
    // const searchBox = document.getElementById("searchBox");
    let searchText = text;
    searchText = searchText.replace(/\\/g, '');
    searchText = searchText.replace(/\//g, '');
    searchText = searchText.replace(/[0-9]/g, '');
    searchText = searchText.replace(/\./g, '');
    searchText = searchText.replace(/\,/g, '');    
    searchText = searchText.replace(/\`/g, '');
    searchText = searchText.replace(/\"/g, '');
    searchText = searchText.substring(0,42);    
    searchBox1.value = searchText;
    searchText = searchText.replace(/\'/g, "''");
    if(searchText == ""){
        userSearchMessage(0);
        searchText = "-";
    };
    if(limit == 0){
        limit = 1;        
        setTimeout(() => {
            limit = 0;
            searchQuery(searchText,searchBox);
        },150);
    };
};

function searchBoxClear(){
    const searchBox = document.getElementById("getUserByName");
    if(searchBox1.value.length==0){userSearchMessage(0);};
    if(searchBox.value == ""){userSearchMessage(0);};
};

function searchQuery(query,dest){
    let clients;
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            if(this.response == (JSON.stringify("clear"))){
                // console.log("CLEAR AUTOSEARCH");
                clients = null;
                clearAutoComplete(document.getElementById("autoComplete"));
                return;
            };
        clients = JSON.parse(this.response);        
        if(searchBox1.value.length==0|searchBox1.value.length<1){userSearchMessage(0);};
        if(clients[0] == null){
            userSearchMessage(1);
            };
        if(clients[0] != null){
            userSearchMessage(2);
            // foundNames(query,clients,dest);
            autoComplete(clients);
            };
        };
      };
    if(query != ""){
        query = JSON.stringify(query);
        xhttp.open("POST", "./searchNameManage/"+query, true);
        xhttp.send();
    }else{
        clients = null;
        clearAutoComplete(document.getElementById("autoComplete"));
    };
};

function foundNames(query,clients,dest){
    names = [];  
    console.log(clients);
    for(i=0;i<clients.length;i++){
        names.push(clients[i].name);
    };
    autoComplete(clients);
    // autoComplete(names);
};

function autoComplete(clients){
    const autoDiv = document.getElementById("autoComplete");
    clearAutoComplete(autoDiv);    
    autoDiv.className = "autoCompleteSuggestions";
    for(i=0;i<clients.length;i++){
        const para = document.createElement("p");
        para.className = "autocomplete-items";
        if(i % 2 === 0){para.classList.add("autocomplete-itemsEven");}
        para.innerText = (clients[i].id + ": "+clients[i].name);
        const clientsSelected = [clients[i].id,clients[i].name,clients[i].account,clients[i].nick];
        autoDiv.appendChild(para);
        para.onclick = function () {
            copyTextToSearchBox(clientsSelected);
            clearAutoComplete(autoDiv);
        }
    };
    if(clients[0].name == searchBox1.value){
        clearAutoComplete(autoDiv);
        document.getElementById("editNick").value = clients[0].nick;
        document.getElementById("editNumber").value = clients[0].account;
        document.getElementById("editName").value = clients[0].name;  
        searchBox1.blur();
        userSearchMessage(3);        
        };
    if(searchBox1.value.length==0){userSearchMessage(0);};
    if(searchBox1.value == ""){clearAutoComplete(autoDiv);}    
};

function clearAutoComplete(autoDiv){
    autoDiv.className = "autoCompleteNone";
    while (autoDiv.hasChildNodes()) {
        autoDiv.removeChild(autoDiv.firstChild);
      };
};

let clientId;
let clientName;
let clientAccount;
let clientNick;
//-------------------LOGGED IN CLIENT FOR EDIT
function copyTextToSearchBox(clientsSelected){
    clientId = clientsSelected[0];
    clientName = clientsSelected[1];
    clientAccount = clientsSelected[2];
    clientNick = clientsSelected[3];
    const searchBox = document.getElementById("getUserByName");    
    searchBox.value = clientsSelected[1];
    document.getElementById("editName").value = clientsSelected[1];
    document.getElementById("editNick").value = clientsSelected[3];
    document.getElementById("editNumber").value = clientsSelected[2];    
    userSearchMessage(3);
};

function userSearchMessage(select){    
    if(select == 0){
        document.getElementById("editNick").value = "";
        document.getElementById("editNumber").value = "";
        document.getElementById("editName").value = "";
        document.getElementById("getUserByName").value = "";
        document.getElementById("getUserByName").className = ("searchBoxNoLogged");
        clientId=null;
        clientName=null;
        clientAccount=null;
        clientNick=null;
    }
    if(select == 1){
        searchBox1.classList.remove("searchBoxNotOk");
        searchBox1.classList.remove("searchBoxOk");
        searchBox1.classList.add("searchBoxNotLogged");    
    }    
    if(select == 2){
        searchBox1.classList.remove("searchBoxNotLogged");
        searchBox1.classList.remove("searchBoxOk");
        searchBox1.classList.add("searchBoxNotOk");  
    }
    if(select == 3){
        searchBox1.classList.remove("searchBoxNotLogged");
        searchBox1.classList.remove("searchBoxNotOk");
        searchBox1.classList.add("searchBoxOk");
    }
};

function getUserDetailsById(){
    console.log(clientId);
    xhttp.open("POST", "./getUserDetails/"+clientId, true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.response);
            displayClientFields(this.response);
            return;
            }
        };
};

function displayClientFields(data,destNick,destNumber,destSmallName){
    destName = document.getElementById("editNick");
    destNick = document.getElementById("editNumber");
    destNumber = document.getElementById("editName");    
    data = JSON.parse(data);
    console.log("Test")
    if(data==null||data[0]==null){return ("DATA NULL")};
    console.log(data);
    let gotName = data[0].name;
    let gotNick = data[0].nick;
    let gotNumber = data[0].account;    
    console.log("here : "+gotName,gotNick,gotNumber);
    destName.value = gotName;
    destNick.value = gotNick;
    destNumber.value = gotNumber;
    clientEdit = gotName;
};

function editClientFields(field,value){
    if(clientId==null||clientId==""){console.log("this is stupid");return};
    if(value==null||value==''){console.log("this is stupid");return};
    if (window.confirm("לערוך נתונים של משתמש?")) {
        value = document.getElementById(value).value;
        console.log(field,value);
        let data = [clientId,field,value];
        xhttp.open("POST", "./editClientFields/"+data, true);
        xhttp.send();
        };
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            editLog(this.response);
            return;
            }
        };
};

function clientDeleteLastOrder(){
    if(clientId==null||clientId==""){return};
    if (window.confirm("למחוק רשימה אחרונה של משתמש?")) {        
        xhttp.open("POST", "./deleteLastOrder/"+clientId, true);
        xhttp.send();
    };
    xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {            
            editLog(this.response);
            userSearchMessage(0);
            return;
            }        
    };
}

function editLog(text){
    console.log(text);
    document.getElementById("editLog").innerText = text;
    document.getElementById("editName").value = '';
    document.getElementById("editNick").value = '';
    document.getElementById("editNumber").value = '';
    document.getElementById("getUserByName").value = '';
}

function importNameListFile(){
    xhttp.open("POST", "./updateNameList/", true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.response);
            document.getElementById("addLog").innerText = this.response;
            return;
            }        
        };
}

function insertName(){
    let newName = document.getElementById("insertName");
    let newNick = document.getElementById("insertNick");
    let newNumber = document.getElementById("insertNumber");
    let status = document.getElementById("insertUserStatus");
    if(newNick.value==''){newNick.value=newName.value};
    if(newName.value==''|newNick.value==''|newNumber.value==''){return}    
    let newData = [newName.value,newNick.value,newNumber.value];
    newData = JSON.stringify(newData);
    newName.value = '';
    newNick.value = '';
    newNumber.value = '';
    xhttp.open("POST", "./insertClient/"+newData, true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.response);
            document.getElementById("addLog").innerText = this.response;
            return;
            }        
        };
};

function copyNameToNick(){    
    if(document.getElementById("insertNick").value==''){
    document.getElementById("insertNick").value = (document.getElementById("insertName").value);
    }
};

function deleteClient(){
    if(clientId==null||clientId==''){return};
    if(window.confirm("למחוק את "+clientName+" ?")){
        if(window.confirm("בטוח בטוח "+clientName+","+clientNick+","+clientId+" ???")){
            xhttp.open("POST", "./deleteClient/"+clientId, true);
            xhttp.send();
        }
    }
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.response);
            userSearchMessage(0);
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
                showOrdersTable(JSON.parse(this.response));
            }
            if(scope==2){
                showClientsTable(JSON.parse(this.response));
            }
            if(scope==3){
                showAccountTable(JSON.parse(this.response));
            }              
            return;
            }
        };
};

function showOrdersTable(data){
    const table = document.createElement("table");
    const tableBody = document.createElement("tbody");
    const TR = document.createElement("tr");
    TR.innerHTML = ("<th>תג עסקה</th><th>נרשם בתאריך</th><th>מוצר1</th><th>מוצר2</th><th>מוצר3</th><th>מוצר4</th><th>סך הכל</th><th>תג משתמש</th><th>שם רשום</th>");
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

function showClientsTable(data){
    const table = document.createElement("table");
    const tableBody = document.createElement("tbody");
    const TR = document.createElement("tr");
    TR.innerHTML = ("<th>תג משתמש</th><th>נרשם בתאריך</th><th>מוצר1</th><th>מוצר2</th><th>מוצר3</th><th>מוצר4</th><th>סך הכל</th><th>מספר חשבון</th><th>שם רשום</th><th>כינוי</th>");
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
    TR.innerHTML = ("<th>מתאריך</th><th>סכום</th><th>מספר חשבון</th><th>שם</th>");    
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
    // t.value = t.value.replace(/\'/, "''");
    let badValues = /[\d/\/.,"``;~./\[/\]/\-=+?{}<>":!\d|/\\/#$%@^&*()]/gi;    
    t.value = t.value.replace(badValues, '');
    return t;
};

function login(name){
    // console.log(name);

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        login = JSON.parse(this.response);
        console.log("LOGIN FUNCTION: "+login);
        displayClientFields(login);
        clientName = login[0].name;
        id = login[0].id;
        console.log("id: "+id+" name: "+clientName);
      };
    };
    if(name != ""){
        name = JSON.stringify(name);
        xhttp.open("POST", "./searchNameManage/"+name, true);
        xhttp.send();
    };
};

// OLD FUNCTIONS FOR ADD REMOVE --------------------------
let nameInsert;
function createName(){
    let text = document.getElementById("insertNameText");     
    nameInsert = text.value;
    // console.log(nameInsert);
};
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
};
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
// function clearConsole(){
//     document.getElementById("console").innerHTML ="";
// };
// if (typeof console  != "undefined") 
//   if (typeof console.log != 'undefined')
//     console.olog = console.log;
// else
//   console.olog = function() {};

// console.log = function(message) {
//   console.olog(message);
//   document.getElementById("console").append('<p>' + message + '</p>');
// };
// console.error = console.debug = console.info =  console.log;