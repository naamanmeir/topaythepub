var xhttp = new XMLHttpRequest();

var limit = 0; // throttle limiter for db

let products = [];
let productName;
let productPrice;
let productImage;
let productStock;
let productId;
// FUNCTIONS TO RUN SERVER ACTIONS
async function placeOrder(orderPack) {
    xhttp.open("GET", "./order/" + orderPack, true);
    xhttp.send();
};

async function createTable() {
    xhttp.open("GET", "./retable/", true);
    xhttp.send();

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.response);
            return;
        }
    };
};

function navtab(select) {
    var i;
    var x = document.getElementsByClassName("page");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    document.getElementById(select).style.display = "block";
};

function addImgDropdown() {
    let imgDiv = document.getElementById("imgDiv");
}
const searchBox1 = document.getElementById("getUserByName");
searchBox1.addEventListener('focus', function () {
    searchBoxClear();
    if (searchBox1.value.length == 0) { userSearchMessage(0); };
    if (searchBox1.value.length > 0) { searchBox1.placeholder = (""); };
});
searchBox1.addEventListener('blur', function () {
    if (searchBox1.value == '' || searchBox1.value == null) { clientId = null; clientName = null; clientAccount = null; clientNick = null; };
    searchBoxClear();
});
searchBox1.addEventListener('input', function () {
    searchBoxClear();
    if (searchBox1.value.length == 0) { userSearchMessage(0); };
    if (searchBox1.value.length > 0) { searchBox1.placeholder = (""); };
    searchBox(searchBox1.value);
});


function searchBox(text) {
    // const searchBox = document.getElementById("searchBox");
    let searchText = text;
    searchText = searchText.replace(/\\/g, '');
    searchText = searchText.replace(/\//g, '');
    searchText = searchText.replace(/[0-9]/g, '');
    searchText = searchText.replace(/\./g, '');
    searchText = searchText.replace(/\,/g, '');
    searchText = searchText.replace(/\`/g, '');
    searchText = searchText.replace(/\"/g, '');
    searchText = searchText.substring(0, 42);
    searchBox1.value = searchText;
    searchText = searchText.replace(/\'/g, "''");
    if (searchText == "") {
        userSearchMessage(0);
        searchText = "-";
    };
    if (limit == 0) {
        limit = 1;
        setTimeout(() => {
            limit = 0;
            searchQuery(searchText, searchBox);
        }, 150);
    };
};

function searchBoxClear() {
    const searchBox = document.getElementById("getUserByName");
    if (searchBox1.value.length == 0) { userSearchMessage(0); };
    if (searchBox.value == "") { userSearchMessage(0); };
};

function searchQuery(query, dest) {
    let clients;
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if (this.response == (JSON.stringify("clear"))) {
                // console.log("CLEAR AUTOSEARCH");
                clients = null;
                clearAutoComplete(document.getElementById("autoComplete"));
                return;
            };
            clients = JSON.parse(this.response);
            if (searchBox1.value.length == 0 | searchBox1.value.length < 1) { userSearchMessage(0); };
            if (clients[0] == null) {
                userSearchMessage(1);
            };
            if (clients[0] != null) {
                userSearchMessage(2);
                // foundNames(query,clients,dest);
                autoComplete(clients);
            };
        };
    };
    if (query != "") {
        query = JSON.stringify(query);
        xhttp.open("POST", "./searchNameManage/" + query, true);
        xhttp.send();
    } else {
        clients = null;
        clearAutoComplete(document.getElementById("autoComplete"));
    };
};

function foundNames(query, clients, dest) {
    names = [];
    console.log(clients);
    for (i = 0; i < clients.length; i++) {
        names.push(clients[i].name);
    };
    autoComplete(clients);
    // autoComplete(names);
};

function autoComplete(clients) {
    const autoDiv = document.getElementById("autoComplete");
    clearAutoComplete(autoDiv);
    autoDiv.className = "autoCompleteSuggestions";
    for (i = 0; i < clients.length; i++) {
        const para = document.createElement("p");
        para.className = "autocomplete-items";
        if (i % 2 === 0) { para.classList.add("autocomplete-itemsEven"); }
        para.innerText = (clients[i].id + ": " + clients[i].name);
        const clientsSelected = [clients[i].id, clients[i].name, clients[i].account, clients[i].nick];
        autoDiv.appendChild(para);
        para.onclick = function () {
            copyTextToSearchBox(clientsSelected);
            clearAutoComplete(autoDiv);
        }
    };
    if (clients[0].name == searchBox1.value) {
        clearAutoComplete(autoDiv);
        document.getElementById("editNick").value = clients[0].nick;
        document.getElementById("editNumber").value = clients[0].account;
        document.getElementById("editName").value = clients[0].name;
        searchBox1.blur();
        userSearchMessage(3);
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

let clientId;
let clientName;
let clientAccount;
let clientNick;
//-------------------LOGGED IN CLIENT FOR EDIT
function copyTextToSearchBox(clientsSelected) {
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

function userSearchMessage(select) {
    if (select == 0) {
        document.getElementById("editNick").value = "";
        document.getElementById("editNumber").value = "";
        document.getElementById("editName").value = "";
        document.getElementById("getUserByName").value = "";
        document.getElementById("getUserByName").className = ("searchBoxNoLogged");
        clientId = null;
        clientName = null;
        clientAccount = null;
        clientNick = null;
    }
    if (select == 1) {
        searchBox1.classList.remove("searchBoxNotOk");
        searchBox1.classList.remove("searchBoxOk");
        searchBox1.classList.add("searchBoxNotLogged");
    }
    if (select == 2) {
        searchBox1.classList.remove("searchBoxNotLogged");
        searchBox1.classList.remove("searchBoxOk");
        searchBox1.classList.add("searchBoxNotOk");
    }
    if (select == 3) {
        searchBox1.classList.remove("searchBoxNotLogged");
        searchBox1.classList.remove("searchBoxNotOk");
        searchBox1.classList.add("searchBoxOk");
    }
};

function getUserDetailsById() {
    console.log(clientId);
    xhttp.open("POST", "./getUserDetails/" + clientId, true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.response);
            displayClientFields(this.response);
            return;
        }
    };
};

function displayClientFields(data, destNick, destNumber, destSmallName) {
    destName = document.getElementById("editNick");
    destNick = document.getElementById("editNumber");
    destNumber = document.getElementById("editName");
    data = JSON.parse(data);
    console.log("Test")
    if (data == null || data[0] == null) { return ("DATA NULL") };
    console.log(data);
    let gotName = data[0].name;
    let gotNick = data[0].nick;
    let gotNumber = data[0].account;
    console.log("here : " + gotName, gotNick, gotNumber);
    destName.value = gotName;
    destNick.value = gotNick;
    destNumber.value = gotNumber;
    clientEdit = gotName;
};

function editClient(field, value) {
    if (clientId == null || clientId == "") { console.log("this is stupid"); return };
    if (value == null || value == '') { console.log("this is stupid"); return };
    if (window.confirm("לערוך נתונים של משתמש?")) {
        value = document.getElementById(value).value;
        // console.log(field,value);
        let data = [clientId, field, value];
        xhttp.open("POST", "./editClientFields/" + data, true);
        xhttp.send();
    };
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            editLog(this.response);
            return;
        }
    };
};

function clientDeleteLastOrder() {
    if (clientId == null || clientId == "") { return };
    if (window.confirm("למחוק רשימה אחרונה של משתמש?")) {
        xhttp.open("POST", "./deleteLastOrder/" + clientId, true);
        xhttp.send();
    };
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            editLog(this.response);
            userSearchMessage(0);
            return;
        }
    };
};

function clientGetOrderHistory() {
    if (clientId == null) { return };
    xhttp.open("POST", "./getUserOrders/" + clientId, true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // editLog(JSON.parse(this.response));
            clientOrderHistory(JSON.parse(this.response));
            return;
        }
    };
};

function clientOrderHistory(data) {
    const table = document.createElement("table");
    const tableBody = document.createElement("tbody");
    const TR = document.createElement("tr");
    TR.innerHTML = ("<th>תג רשימה</th><th>נרשם בתאריך</th><th>פרטים</th><th>סך הכל</th><th>שם לקוח</th>");
    tableBody.appendChild(TR);
    for (let i = 0; i < data.length; i++) {
        const row = document.createElement("tr");
        let clientRow = Object.values(data[i]);
        for (let j = 0; j < clientRow.length; j++) {
            const cell = document.createElement("td");
            let cellText = document.createTextNode(clientRow[j]);
            cell.appendChild(cellText);
            row.appendChild(cell);
        }
        row.setAttribute("dir", "rtl");
        if (i % 2 === 0) { row.setAttribute("style", "background-color:lightblue;") }
        tableBody.appendChild(row);
    }
    table.appendChild(tableBody);
    table.setAttribute("border", "1");
    table.setAttribute("align", "center");
    table.setAttribute("width", "100%");
    table.setAttribute("style", "font-size:larger");
    table.setAttribute("class", "tableStyle");
    var clientHistorytableWindow = window.open("", "טבלת חיובים", "width=1000, height=800, dir=rtl");
    clientHistorytableWindow.document.write();
    clientHistorytableWindow.document.appendChild(table);
};

function editLog(text) {
    console.log(text);
    document.getElementById("editLog").innerText = text;
    document.getElementById("editName").value = '';
    document.getElementById("editNick").value = '';
    document.getElementById("editNumber").value = '';
    document.getElementById("getUserByName").value = '';
};

function importNameListFile() {
    if (window.confirm("להכניס את כל הרשימה עכשיו? ")) {
        xhttp.open("POST", "./updateNameList/", true);
        xhttp.send();
    };
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.response);
            document.getElementById("addLog").innerText = this.response;
            return;
        }
    };
};

function insertName() {
    let newName = document.getElementById("insertName");
    let newNick = document.getElementById("insertNick");
    let newNumber = document.getElementById("insertNumber");
    let status = document.getElementById("insertUserStatus");
    if (newNick.value == '') { newNick.value = newName.value };
    if (newName.value == '' | newNick.value == '' | newNumber.value == '') { return }
    let newData = [newName.value, newNick.value, newNumber.value];
    newData = JSON.stringify(newData);
    newName.value = '';
    newNick.value = '';
    newNumber.value = '';
    xhttp.open("POST", "./insertClient/" + newData, true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.response);
            document.getElementById("addLog").innerText = this.response;
            return;
        }
    };
};

function copyNameToNick() {
    if (document.getElementById("insertNick").value == '') {
        document.getElementById("insertNick").value = (document.getElementById("insertName").value);
    }
};

function deleteClient() {
    if (clientId == null || clientId == '') { return };
    if (window.confirm("למחוק את " + clientName + " ?")) {
        if (window.confirm("בטוח בטוח " + clientName + "," + clientNick + "," + clientId + " ???")) {
            xhttp.open("POST", "./deleteClient/" + clientId, true);
            xhttp.send();
        }
    }
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.response);
            userSearchMessage(0);
            return;
        }
    };
};

async function getAllData(scope) {
    console.log("GET ALL DATA FUNC: ");
    let itemsBought;
    // itemsBought = await this.getItemsBought().then((buys) => {return (buys)});   
    // console.log(itemsBought);
    xhttp.open("POST", "./getAllData/" + scope, true);
    xhttp.send();
    xhttp.onreadystatechange = async function () {
        if (this.readyState == 4 && this.status == 200) {
            // console.log(this.response);
            let allData = this.response;
            if (scope == 1) {
                showOrdersTable(JSON.parse(this.response));
            }
            if (scope == 2) {
                showClientsTable(JSON.parse(this.response));
            }
            if (scope == 3) {
                showClientsTable(JSON.parse(this.response));
            }
            if (scope == 4) {
                showAccountTable((JSON.parse(allData, itemsBought)));
            }
            return;
        }
    };
};

async function getItemsBought() {
    xhttp.open("GET", "./getItemsBought/", false);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.response);
            itemsBought = this.response;
            return itemsBought;
        }
    };
};

async function getProducts() {
    xhttp.open("GET", "./getProducts/", true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // console.log(this.response);
            products = JSON.parse(this.response);
            let selectBar = document.getElementById("selectProduct");
            let productDiv = document.getElementById("displayProducts");
            while (selectBar.childElementCount > 1) {
                selectBar.removeChild(selectBar.lastChild);
            };
            while (productDiv.childElementCount > 1) {
                productDiv.removeChild(productDiv.lastChild);
            };
            // console.log(products);
            products.forEach(table => {
                var productRow = document.createElement("div");
                productRow.className = ("productRow")
                var productId = document.createElement("input");
                var productName = document.createElement("input");
                var productDisplay = document.createElement("input");
                var productPrice = document.createElement("input");
                var productImage = document.createElement("image");
                // var imageSelect = document.createElement("option"); 

                productImage.innerHTML = `<img src="${table.itemimgpath}"/>`;

                // productImage.appendChild(imageSelect);
                productId.setAttribute("type", "number");
                productName.setAttribute("type", "text");
                productDisplay.setAttribute("type", "checkbox");
                productPrice.setAttribute("type", "number");
                productPrice.setAttribute("min", "0");
                productPrice.setAttribute("max", "99");

                productId.value = table.itemid;
                productName.value = table.itemname;
                productDisplay.checked = (table.stock > 0);
                productPrice.value = table.price;
                productPrice.style.width = ("3rem");

                productRow.appendChild(productName);
                productRow.appendChild(productPrice);
                productRow.appendChild(productImage);
                productRow.appendChild(productDisplay);
                productDiv.appendChild(productRow);

                productName.onchange = function () {
                    editProductFields(
                        table.itemid, productName.value, productPrice.value, table.itemimgpath, productDisplay.checked)
                };
                productPrice.onchange = function () {
                    editProductFields(
                        table.itemid, productName.value, productPrice.value, table.itemimgpath, productDisplay.checked)
                };
                productImage.onchange = function () {
                    editProductFields(
                        table.itemid, productName.value, productPrice.value, table.itemimgpath, productDisplay.checked)
                };
                productDisplay.onchange = function () {
                    editProductFields(
                        table.itemid, productName.value, productPrice.value, table.itemimgpath, productDisplay.checked)
                };
            });
            products.forEach(table => {
                var opt = document.createElement("option");
                opt.value = table.itemname;
                opt.innerHTML = table.itemname;
                selectBar.appendChild(opt);
            });
            return;
        }
    };
};

function editProductLoad() {
    let itemSelect = document.getElementById("selectProduct");
    let textName = document.getElementById("productName");
    let textPrice = document.getElementById("productPrice");
    let itemImage = document.getElementById("productImage");
    let textStock = document.getElementById("productStock");
    let i = itemSelect.selectedIndex - 1;
    // console.log(i);
    console.log(products[i].itemid);
    console.log(products[i].itemname);
    console.log(products[i].price);
    console.log(products[i].stock);
    productId = products[i].itemid;
    productName = products[i].itemname;
    textName.value = products[i].itemname;
    textPrice.value = products[i].price;
    itemImage.src = products[i].itemimgpath;
    textStock.value = products[i].stock;
};

function editProductFields(thisProductId, name, price, image, stock) {
    stock = stock ? 1 : 0;
    let data = [thisProductId, name, price, image, stock];
    // console.log(data);
    document.getElementById("productName").value = name;
    document.getElementById("productPrice").value = price;
    document.getElementById("productImage").src = image;
    document.getElementById("productStock").value = stock;
    productId = thisProductId;
    productName = name;
    editProduct();
}

function editProduct() {
    if (productId == null || productId == "") { console.log("this is stupid"); return };
    let newName = document.getElementById("productName");
    let newPrice = document.getElementById("productPrice");
    // let newImage = document.getElementById("productImage").getAttribute("src").replace('img/items/','').replace('.png','');
    let newImage = document.getElementById("productImage").getAttribute("src").replace('img/items/', '');
    let newStock = document.getElementById("productStock");
    let data = [productId, newName.value, newPrice.value, newImage, newStock.value];
    // console.log(data);
    if (window.confirm("לערוך נתונים של " + productName + "?")) {
        xhttp.open("POST", "./editProduct/" + data, true);
        xhttp.send();
    };
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            editLog(this.response);
            getProducts();
            return;
        }
    };
};

let imgSelect;
function imgClickSelect(img, imgId) {
    imgSelect = img;
    let imgSelector = document.getElementsByClassName("imgSelector");
    var arr = [...imgSelector];
    arr.forEach(element => {
        element.style.backgroundColor = "transparent";
        element.style.border = "none";
    });
    window.onclick = e => {
        document.getElementById(imgId).style.backgroundColor = "green";
        document.getElementById(imgId).style.border = "5px solid orange";
    }

}

function insertProduct() {
    let newItem = document.getElementById("insertProduct");
    let newPrice = document.getElementById("insertPrice");
    let newStock = document.getElementById("insertStock");
    let newImg = imgSelect;
    if (newItem.value == '' | newPrice.value == '' | newStock.value == '' | newImg == '') { return };
    let newData = [newItem.value, newPrice.value, newImg, newStock.value];
    newData = JSON.stringify(newData);
    newItem.value = '';
    newPrice.value = '';
    if (window.confirm("להכניס מוצר?")) {
        xhttp.open("POST", "./insertProduct/" + newData, true);
        xhttp.send();
    };
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.response);
            document.getElementById("productsLog").innerText = this.response;
            getProducts();
            return;
        }
    };
};

function deleteProduct() {
    if (!productId) return;
    if (window.confirm("למחוק " + productName + "?")) {
        xhttp.open("POST", "./deleteProduct/" + productId, true);
        xhttp.send();
    };
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.response);
            document.getElementById("productsEditLog").innerText = this.response;
            getProducts();
            return;
        }
    };
}

function openInfotables() {
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.response);
            window.open("./infotables", "_blank");
        }
    };
    xhttp.open("GET", "./infotables", false);
    xhttp.send();
}

function showOrdersTable(data) {
    const table = document.createElement("table");
    const tableBody = document.createElement("tbody");
    const TR = document.createElement("tr");
    TR.innerHTML = ("<th>תג עסקה</th><th>נרשם בתאריך</th><th>פרטים</th><th>סך הכל</th><th>תג משתמש</th><th>שם רשום</th>");
    tableBody.appendChild(TR);
    for (let i = 0; i < data.length; i++) {
        const row = document.createElement("tr");
        let clientRow = Object.values(data[i]);
        for (let j = 0; j < clientRow.length; j++) {
            const cell = document.createElement("td");
            let cellText = document.createTextNode(clientRow[j]);
            cell.appendChild(cellText);
            row.appendChild(cell);
        }
        row.setAttribute("dir", "rtl");
        if (i % 2 === 0) { row.setAttribute("style", "background-color:lightblue;") }
        tableBody.appendChild(row);
    }
    table.appendChild(tableBody);
    table.setAttribute("border", "1");
    table.setAttribute("align", "center");
    table.setAttribute("width", "100%");
    table.setAttribute("style", "font-size:larger");
    table.setAttribute("class", "tableStyle");
    var tableWindow = window.open("", "טבלת חיובים", "width=1000, height=800, dir=rtl");
    tableWindow.document.write();
    tableWindow.document.appendChild(table);
};

function showClientsTable(data) {
    const table = document.createElement("table");
    const tableBody = document.createElement("tbody");
    const TR = document.createElement("tr");
    TR.innerHTML = ("<th>תג משתמש</th><th>נרשם בתאריך</th><th>סכום בחשבון</th><th>מספר חשבון</th><th>שם רשום</th><th>כינוי</th>");
    tableBody.appendChild(TR);
    for (let i = 0; i < data.length; i++) {
        const row = document.createElement("tr");
        let clientRow = Object.values(data[i]);
        for (let j = 0; j < clientRow.length; j++) {
            const cell = document.createElement("td");
            let cellText = document.createTextNode(clientRow[j]);
            cell.appendChild(cellText);
            row.appendChild(cell);
        }
        row.setAttribute("dir", "rtl");
        if (i % 2 === 0) { row.setAttribute("style", "background-color:lightblue;") }
        tableBody.appendChild(row);
    }
    table.appendChild(tableBody);
    table.setAttribute("border", "1");
    table.setAttribute("align", "center");
    table.setAttribute("width", "100%");
    table.setAttribute("style", "font-size:larger");
    table.setAttribute("class", "tableStyle");
    var tableWindow = window.open("", "טבלת חיובים", "width=1000, height=800, dir=rtl");
    tableWindow.document.write();
    tableWindow.document.appendChild(table);
};

function showAccountTable(data, itemsBought) {
    let div = document.createElement("div");
    div.classList.add("reportTableDiv");
    // div.setAttribute("dir","rtl");
    div.setAttribute("border", "1");
    div.setAttribute("align", "center");
    div.setAttribute("width", "100%");
    div.setAttribute("style", "font-size:xx-large");
    div.setAttribute("class", "tableStyle");
    const table = document.createElement("table");
    const tableBody = document.createElement("tbody");
    const TR = document.createElement("tr");
    let header = document.createElement("p");
    let headerText = document.createTextNode("דוח לתקופה נוכחית תאריכים יוספו בהמשך");
    header.appendChild(headerText);
    // console.log(itemsBought);
    let itemsText;
    itemsText = document.createTextNode(" משהוים נלקחו מהמקרר : " + ", מרקים נלגמו : ");
    // div.appendChild(header);
    // div.appendChild(itemsText);
    TR.innerHTML = ("<th>סכום</th><th>פרטים</th><th>שם לקוח</th><th>מס. לקוח</th>");
    tableBody.appendChild(TR);
    for (let i = 0; i < data.length; i++) {
        const row = document.createElement("tr");
        let clientRow = Object.values(data[i]);
        for (let j = 0; j < clientRow.length; j++) {
            if (j == 2) { clientRow[j] = clientRow[j] };
            const cell = document.createElement("td");
            let cellText;
            if (j == 0) { cellText = document.createTextNode(clientRow[j] + " ₪"); }
            if (j == 1) { cellText = document.createTextNode("פאב " + clientRow[j]); }
            if (j > 1) { cellText = document.createTextNode(clientRow[j]); }
            cell.appendChild(cellText);
            row.appendChild(cell);
        }
        row.setAttribute("dir", "rtl");
        if (i % 2 === 0) { row.setAttribute("style", "background-color:lightblue;") }
        tableBody.appendChild(row);
    }
    table.appendChild(tableBody);
    table.setAttribute("border", "1");
    table.setAttribute("align", "center");
    table.setAttribute("width", "100%");
    table.setAttribute("style", "font-size:xx-large");
    table.setAttribute("class", "tableStyle");
    var tableWindow = window.open("", "טבלת חיובים", "width=1000, height=800, dir=rtl");
    tableWindow.document.write();
    div.appendChild(table);
    tableWindow.document.appendChild(div);
};

function backupTable() {
    if (window.confirm("לייצר גיבוי חדש לטבלת המשתמשים?")) {
        xhttp.open("POST", "./backupTable/", true);
        xhttp.send();
    };
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.response);
            getReportArchiveList();
            return;
        }
    };
};

function requestReportArchive() {
    let selectBar = document.getElementById("reportArchive");
    data = selectBar.value;
    xhttp.open("POST", "./requestReportArchive/" + data, true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.response);
            showAccountTable(JSON.parse(this.response));
            return;
        }
    };
};

function getReportArchiveList() {
    xhttp.open("GET", "./getListOfArchiveReport/", true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            archiveList = JSON.parse(this.response);
            let selectBar = document.getElementById("reportArchive");
            while (selectBar.hasChildNodes()) {
                selectBar.removeChild(selectBar.firstChild);
            };
            archiveList.forEach(table => {
                var opt = document.createElement("option");
                opt.value = table;
                opt.innerHTML = table;
                selectBar.appendChild(opt);
            });
            return;
        }
    };
};

function resetAfterReport() {
    if (window.confirm("פעולה זו תנקה נתונים לאחר הפקת דוח דו חודשי")) {
        xhttp.open("GET", "./resetClientsDataAfterRead/", true);
        xhttp.send();
    };
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // console.log(this.response);
            return;
        }
    };
};

function removeOldBackups() {
    if (window.confirm("זה כאילו למחוק את כל הגיבויים עד עכשיו לא ללחוץ סתם")) {
        xhttp.open("GET", "./removeOldBackups/", true);
        xhttp.send();
    };
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            return;
        }
    };
};

function defineInputFields() {
    let inputElements = document.getElementsByClassName("textbox");
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        //   input.setAttribute('autocomplete', 'off')
        input.setAttribute('autocorrect', 'off');
        input.setAttribute('autocapitalize', 'off');
        input.setAttribute('spellcheck', false);
    });
    for (i = 0; i < inputElements.length; i++) {
        inputElements[i].addEventListener('input', inputFilter);
        // console.log(inputElements[i]);    
    }
};

defineInputFields();

function inputFilter(e) {
    let t = e.target;
    // let goodValues = /^[a-z\u05D0-\u05EA]+$/i; // HEBREW REGEX
    // t.value = t.value.replace(/\'/, "''");
    let badValues = /[\d/\/.,"``;~./\[/\]/\-=+?{}<>":!\d|/\\/#$%@^&*()]/gi;
    t.value = t.value.replace(badValues, '');
    return t;
};

function login(name) {
    // console.log(name);

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            login = JSON.parse(this.response);
            console.log("LOGIN FUNCTION: " + login);
            displayClientFields(login);
            clientName = login[0].name;
            id = login[0].id;
            console.log("id: " + id + " name: " + clientName);
        };
    };
    if (name != "") {
        name = JSON.stringify(name);
        xhttp.open("POST", "./searchNameManage/" + name, true);
        xhttp.send();
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
window.addEventListener('load', loadUtiliti, false);
function loadUtiliti() {
    setTimeout(function () {
        getReportArchiveList();
    }, 100);
    setTimeout(function () {
        getProducts();
    }, 400);

};

function refreshAllClients() {
    if (window.confirm("לטעון מחדש את המסופים המחוברים?")) {
        xhttp.open("GET", "./refreshClients/", true);
        xhttp.send();
    };
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.response);
            return;
        }
    };
};

function connectedTerminalsStatus() {
    let connectedTerminals = document.getElementById("connectedTerminals");
    connectedTerminals.innerText = ("1234");
}

