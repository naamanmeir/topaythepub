var xhttp = new XMLHttpRequest();

var limit = 0; // throttle limiter for db

let products = [];

let progBarDiv;
let progBar;


// ------------  REQUEST MANAGE FUNCTION -------------------------------------//

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

//-----------------------------UI-------------------------//
function navtab(select, buttonEl) {
    var i;
    var x = document.getElementsByClassName("page");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    document.getElementById(select).style.display = "block";
    const buttons = document.querySelectorAll(".manageNavBtn[data-target]");
    buttons.forEach(btn => btn.classList.remove("is-active"));
    const targetBtn = buttonEl || document.querySelector(`.manageNavBtn[data-target="${select}"]`);
    if (targetBtn) {
        targetBtn.classList.add("is-active");
    }
};

function initBackToTop() {
    const btn = document.getElementById("manageBackToTop");
    if (!btn) {
        return;
    }
    const toggleVisibility = function () {
        const docHeight = Math.max(
            document.documentElement.scrollHeight,
            document.body ? document.body.scrollHeight : 0
        );
        const canScroll = docHeight > window.innerHeight + 10;
        if (canScroll) {
            btn.classList.add("is-visible");
            return;
        }
        btn.classList.remove("is-visible");
    };
    btn.addEventListener('click', function () {
        const scroller = document.scrollingElement || document.documentElement;
        if (scroller && typeof scroller.scrollTo === 'function') {
            scroller.scrollTo({ top: 0, behavior: 'smooth' });
        }
        if (document.body && typeof document.body.scrollTo === 'function') {
            document.body.scrollTo({ top: 0, behavior: 'smooth' });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (scroller) {
            scroller.scrollTop = 0;
        }
        if (document.body) {
            document.body.scrollTop = 0;
        }
    });
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    window.addEventListener('resize', toggleVisibility);
    toggleVisibility();
}

window.addEventListener('load', initBackToTop, false);
function addImgDropdown() {
    let imgDiv = document.getElementById("imgDiv");
};

//--------------USER SEARCH FUNCTIONS----------------------------//
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
        xhttp.open("POST", "./manage/searchNameManage/" + query, true);
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

//--------------USER EDIT MANAGEMANENT FUNCTIONS----------------------------//

let clientId;
let clientName;
let clientAccount;
let clientNick;

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
    xhttp.open("POST", "./manage/getUserDetails/" + clientId, true);
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
        xhttp.open("POST", "./manage/editClientFields/" + data, true);
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
        xhttp.open("POST", "./manage/deleteLastOrder/" + clientId, true);
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
    xhttp.open("POST", "./manage/getUserOrders/" + clientId, true);
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
    // console.log(text);
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
    xhttp.open("POST", "./manage/insertClient/" + newData, true);
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
            xhttp.open("POST", "./manage/deleteClient/" + clientId, true);
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

// ------------------------------ FUNCTIONS TO RUN SERVER ACTIONS
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

// ------------------------------ PRODUCTS DATA EDIT ADD DELETE -----------------------------//

let draggedProductRow = null;
let hideOutOfStock = false;
let lastUndoAction = null;
let undoTimer = null;
let touchDragRow = null;
let touchDragActive = false;
let touchDragStartY = 0;

function normalizeImageFilename(imagePath) {
    if (!imagePath) {
        return "";
    }
    return imagePath.replace(/^img\/items\//, "");
}

function buildProductRow(product) {
    const row = document.createElement("div");
    row.className = "productsRow";
    row.setAttribute("draggable", "true");
    row.dataset.id = product.itemid;
    row.dataset.image = product.itemimgpath || "";
    row.dataset.prevName = product.itemname || "";
    row.dataset.prevPrice = product.price || 0;
    row.dataset.prevStock = product.stock > 0 ? 1 : 0;
    row.dataset.prevOrder = product.itemorder || 1;

    const dragCell = document.createElement("div");
    dragCell.className = "cell dragCell";
    dragCell.dataset.label = "גרור";
    dragCell.innerHTML = '<span class="dragHandle">⋮⋮</span>';
    const dragHandle = dragCell.querySelector(".dragHandle");

    const orderCell = document.createElement("div");
    orderCell.className = "cell orderCell";
    orderCell.dataset.label = "סדר";
    const orderInput = document.createElement("input");
    orderInput.className = "productInput orderInput";
    orderInput.type = "number";
    orderInput.min = "1";
    orderInput.value = product.itemorder || 1;
    orderCell.appendChild(orderInput);

    const nameCell = document.createElement("div");
    nameCell.className = "cell nameCell";
    nameCell.dataset.label = "שם";
    const nameInput = document.createElement("input");
    nameInput.className = "productInput nameInput";
    nameInput.type = "text";
    nameInput.value = product.itemname || "";
    nameCell.appendChild(nameInput);

    const priceCell = document.createElement("div");
    priceCell.className = "cell priceCell";
    priceCell.dataset.label = "מחיר";
    const priceInput = document.createElement("input");
    priceInput.className = "productInput priceInput";
    priceInput.type = "number";
    priceInput.min = "0";
    priceInput.value = product.price || 0;
    priceCell.appendChild(priceInput);

    const stockCell = document.createElement("div");
    stockCell.className = "cell stockCell";
    stockCell.dataset.label = "בתפריט";
    const stockInput = document.createElement("input");
    stockInput.className = "stockInput";
    stockInput.type = "checkbox";
    stockInput.checked = product.stock > 0;
    stockCell.appendChild(stockInput);

    const imageCell = document.createElement("div");
    imageCell.className = "cell imageCell";
    imageCell.dataset.label = "תמונה";
    const image = document.createElement("img");
    image.className = "productImageThumb";
    image.src = product.itemimgpath || "";
    image.alt = product.itemname || "product";
    imageCell.appendChild(image);

    const actionsCell = document.createElement("div");
    actionsCell.className = "cell actionsCell";
    actionsCell.dataset.label = "פעולות";
    const deleteButton = document.createElement("button");
    deleteButton.className = "red productActionBtn";
    deleteButton.textContent = "מחיקה";
    actionsCell.appendChild(deleteButton);

    row.appendChild(dragCell);
    row.appendChild(orderCell);
    row.appendChild(nameCell);
    row.appendChild(priceCell);
    row.appendChild(stockCell);
    row.appendChild(imageCell);
    row.appendChild(actionsCell);

    nameInput.addEventListener("change", () => updateProductRow(row, false));
    priceInput.addEventListener("change", () => updateProductRow(row, false));
    orderInput.addEventListener("change", () => updateProductRow(row, false));
    stockInput.addEventListener("change", () => updateProductRow(row, false));
    deleteButton.addEventListener("click", () => deleteProductById(product.itemid, product.itemname));

    row.addEventListener("dragstart", onProductDragStart);
    row.addEventListener("dragover", onProductDragOver);
    row.addEventListener("drop", onProductDrop);
    row.addEventListener("dragend", onProductDragEnd);
    if (dragHandle) {
        dragHandle.addEventListener("touchstart", onProductTouchStart, { passive: false });
    }

    return row;
}

function onProductTouchStart(event) {
    if (!event.touches || event.touches.length !== 1) {
        return;
    }
    const row = event.currentTarget.closest(".productsRow");
    if (!row) {
        return;
    }
    touchDragStartY = event.touches[0].clientY;
    touchDragActive = true;
    touchDragRow = row;
    touchDragRow.classList.add("dragging");
    document.body.classList.add("dragging-products");
    document.addEventListener("touchmove", onProductTouchMove, { passive: false });
    document.addEventListener("touchend", onProductTouchEnd);
    document.addEventListener("touchcancel", onProductTouchEnd);
    event.preventDefault();
}

function onProductTouchMove(event) {
    if (!touchDragActive || !touchDragRow) {
        return;
    }
    const touch = event.touches && event.touches[0];
    if (!touch) {
        return;
    }
    if (Math.abs(touch.clientY - touchDragStartY) < 2) {
        event.preventDefault();
        return;
    }
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetRow = target ? target.closest(".productsRow") : null;
    if (targetRow && targetRow !== touchDragRow) {
        const rect = targetRow.getBoundingClientRect();
        const shouldInsertAfter = (touch.clientY - rect.top) > rect.height / 2;
        const parent = targetRow.parentNode;
        if (shouldInsertAfter) {
            parent.insertBefore(touchDragRow, targetRow.nextSibling);
        } else {
            parent.insertBefore(touchDragRow, targetRow);
        }
    }
    event.preventDefault();
}

function onProductTouchEnd() {
    if (!touchDragRow) {
        return;
    }
    touchDragRow.classList.remove("dragging");
    touchDragRow = null;
    touchDragActive = false;
    document.body.classList.remove("dragging-products");
    document.removeEventListener("touchmove", onProductTouchMove);
    document.removeEventListener("touchend", onProductTouchEnd);
    document.removeEventListener("touchcancel", onProductTouchEnd);
    updateProductOrdersFromDom();
}

function renderProductRows(productList) {
    const tableBody = document.getElementById("productsTableBody");
    if (!tableBody) {
        return;
    }
    tableBody.innerHTML = "";
    const filtered = hideOutOfStock
        ? productList.filter(product => product.stock > 0)
        : productList;
    filtered.forEach(product => {
        tableBody.appendChild(buildProductRow(product));
    });
}

function onProductDragStart(event) {
    draggedProductRow = event.currentTarget;
    event.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
        draggedProductRow.classList.add("dragging");
    }, 0);
}

function onProductDragOver(event) {
    event.preventDefault();
    const targetRow = event.currentTarget;
    if (!draggedProductRow || targetRow === draggedProductRow) {
        return;
    }
    const rect = targetRow.getBoundingClientRect();
    const shouldInsertAfter = (event.clientY - rect.top) > rect.height / 2;
    const parent = targetRow.parentNode;
    if (shouldInsertAfter) {
        parent.insertBefore(draggedProductRow, targetRow.nextSibling);
    } else {
        parent.insertBefore(draggedProductRow, targetRow);
    }
}

function onProductDrop(event) {
    event.preventDefault();
}

function onProductDragEnd() {
    if (!draggedProductRow) {
        return;
    }
    draggedProductRow.classList.remove("dragging");
    draggedProductRow = null;
    updateProductOrdersFromDom();
}

function updateProductOrdersFromDom() {
    const rows = document.querySelectorAll("#productsTableBody .productsRow");
    rows.forEach((row, index) => {
        const orderInput = row.querySelector(".orderInput");
        const newOrder = index + 1;
        if (orderInput && Number(orderInput.value) !== newOrder) {
            orderInput.value = newOrder;
            updateProductRow(row, true);
        }
    });
}

function updateProductRow(row, silent) {
    if (!row) {
        return;
    }
    const prevState = {
        name: row.dataset.prevName || "",
        price: row.dataset.prevPrice || 0,
        stock: row.dataset.prevStock || 0,
        order: row.dataset.prevOrder || 1,
        image: row.dataset.image || ""
    };
    const id = row.dataset.id;
    const name = row.querySelector(".nameInput").value.trim();
    const price = row.querySelector(".priceInput").value;
    const order = row.querySelector(".orderInput").value;
    const stock = row.querySelector(".stockInput").checked ? 1 : 0;
    const image = normalizeImageFilename(row.dataset.image || "");
    const data = [id, name, price, image, stock, order];
    sendProductUpdate(data, silent);

    row.dataset.prevName = name;
    row.dataset.prevPrice = price;
    row.dataset.prevStock = stock;
    row.dataset.prevOrder = order;

    if (!silent) {
        showUndoToast("בוצע עדכון למוצר", () => undoProductChange(row, prevState));
    }
}

function sendProductUpdate(data, silent) {
    const req = new XMLHttpRequest();
    req.open("POST", "./manage/editProduct/" + data, true);
    req.send();
    req.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if (!silent) {
                const log = document.getElementById("productsEditLog");
                if (log) {
                    log.innerText = this.response;
                }
            }
            return;
        }
    };
}

function showUndoToast(message, undoAction) {
    const toast = document.getElementById("productUndoToast");
    const messageEl = document.getElementById("undoMessage");
    if (!toast || !messageEl) {
        return;
    }
    messageEl.textContent = message;
    lastUndoAction = undoAction;
    toast.classList.add("show");
    if (undoTimer) {
        clearTimeout(undoTimer);
    }
    undoTimer = setTimeout(() => {
        hideUndoToast();
    }, 5000);
}

function hideUndoToast() {
    const toast = document.getElementById("productUndoToast");
    if (!toast) {
        return;
    }
    toast.classList.remove("show");
    lastUndoAction = null;
}

function undoLastProductChange() {
    if (lastUndoAction) {
        lastUndoAction();
    }
    hideUndoToast();
}

function undoProductChange(row, prevState) {
    if (!row) {
        return;
    }
    row.querySelector(".nameInput").value = prevState.name;
    row.querySelector(".priceInput").value = prevState.price;
    row.querySelector(".orderInput").value = prevState.order;
    row.querySelector(".stockInput").checked = Number(prevState.stock) > 0;
    row.dataset.prevName = prevState.name;
    row.dataset.prevPrice = prevState.price;
    row.dataset.prevStock = prevState.stock;
    row.dataset.prevOrder = prevState.order;
    updateProductRow(row, true);
}

function toggleHideOutOfStock(input) {
    hideOutOfStock = input.checked;
    renderProductRows(products);
}

function quickAddProduct() {
    const nameInput = document.getElementById("quickProductName");
    const priceInput = document.getElementById("quickProductPrice");
    if (!nameInput || !priceInput) {
        return;
    }
    const name = nameInput.value.trim();
    const price = priceInput.value.trim();
    if (!name || !price) {
        return;
    }
    if (!imgSelect) {
        imgSelect = getDefaultImageFilename();
    }
    if (!imgSelect) {
        alert("בחר תמונה למוצר");
        return;
    }
    const insertName = document.getElementById("insertProduct");
    const insertPrice = document.getElementById("insertPrice");
    if (insertName && insertPrice) {
        insertName.value = name;
        insertPrice.value = price;
    }
    insertProduct();
    nameInput.value = "";
    priceInput.value = "";
}

function getDefaultImageFilename() {
    const firstImage = document.querySelector("#imgDiv img");
    if (!firstImage) {
        return "";
    }
    const src = firstImage.getAttribute("src") || "";
    return normalizeImageFilename(src);
}

function scrollToImagePicker() {
    const imgDiv = document.getElementById("imgDiv");
    if (imgDiv) {
        imgDiv.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

function scrollToAddProduct() {
    const addProduct = document.querySelector('.addProduct');
    if (addProduct) {
        addProduct.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

function deleteProductById(id, name) {
    if (!id) {
        return;
    }
    if (!window.confirm("למחוק " + name + "?")) {
        return;
    }
    const req = new XMLHttpRequest();
    req.open("POST", "./manage/deleteProduct/" + id, true);
    req.send();
    req.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const log = document.getElementById("productsEditLog");
            if (log) {
                log.innerText = this.response;
            }
            getProducts();
            return;
        }
    };
}

async function getAllData(scope) {
    console.log("GET ALL DATA FUNC: ");
    let itemsBought;
    // itemsBought = await this.getItemsBought().then((buys) => {return (buys)});   
    // console.log(itemsBought);
    xhttp.open("POST", "./manage/getAllData/" + scope, true);
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

async function getItemImagesAsHtml(){
    console.log('GET IMAGES');
    getRequest('./manage/getItemImgs/', window.parent.displayItemImagesInDiv,null);
    return;
};

function displayItemImagesInDiv(content){    
    let imgDiv = document.getElementById('imgDiv');
    imgDiv.innerHTML = content;
    const firstImage = imgDiv.querySelector('.imgSelector');
    if (firstImage && !imgSelect) {
        const filename = firstImage.id.replace('image-', '');
        setSelectedImage(firstImage, filename);
    }
    return;
}

async function getItemsBought() {
    xhttp.open("GET", "./manage/getItemsBought/", false);
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
    xhttp.open("GET", "./manage/getProducts/", true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // console.log(this.response);
            products = JSON.parse(this.response);
            let selectBar = document.getElementById("selectProduct");
            if (selectBar) {
                while (selectBar.childElementCount > 1) {
                    selectBar.removeChild(selectBar.lastChild);
                };
            }
            // console.log(products);
            renderProductRows(products);
            products.forEach(table => {
                if (!selectBar) {
                    return;
                }
                var opt = document.createElement("option");
                opt.value = table.itemname;
                opt.innerHTML = table.itemname;
                selectBar.appendChild(opt);
            });
            return;
        }
    };
};


let imgSelect;
function imgClickSelect(img, imgId) {
    const imgEl = document.getElementById(imgId);
    if (!imgEl) {
        return;
    }
    setSelectedImage(imgEl, img);
}

function setSelectedImage(imgEl, filename) {
    const images = document.querySelectorAll(".imgSelector");
    images.forEach(element => element.classList.remove("selected"));
    imgEl.classList.add("selected");
    imgSelect = filename;
    updateSelectedImageLabel(filename);
}

function updateSelectedImageLabel(filename) {
    const label = document.getElementById("selectedImageLabel");
    if (!label) {
        return;
    }
    label.textContent = filename ? ("תמונה נבחרת: " + filename) : "תמונה נבחרת: -";
}

function insertProduct() {
    let newItem = document.getElementById("insertProduct");
    let newPrice = document.getElementById("insertPrice");
    // let newStock = document.getElementById("insertStock");
    let newStock = {value: 10}
    let newImg = imgSelect;
    if (newItem.value == '' | newPrice.value == '' | newStock.value == '' | newImg == '') { return };
    let newData = [newItem.value, newPrice.value, newImg, newStock.value];
    newData = JSON.stringify(newData);
    newItem.value = '';
    newPrice.value = '';
    if (window.confirm("להכניס מוצר?")) {
        xhttp.open("POST", "./manage/insertProduct/" + newData, true);
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


// ------------------------------UPLOAD PRODUCT IMAGE----------------------------------------------- //

function productImageUploadSend(){
    const formData = new FormData();    
    formData.append("img",imageSelector.files[0]);
    var req = new XMLHttpRequest();       
    req.upload.addEventListener("progress", updateProgress);
    req.open("POST", "./manage/uploadItemImg");
    req.send(formData);
    imageSelector.value = "";
    imageCancel();
    imagePreview();
    return;
}

function resetProgressBar(){
    progBar.style.width = "0px";
};

function updateProgress(e){
    progBar.style.width = (((e.loaded/e.total)*100))+ "%";
    if((e.loaded/e.total)==1){        
        setTimeout(resetProgressBar,2000);
        setTimeout(function(){
            getItemImagesAsHtml();
        },4000);        
    };
};

function createProgressBar(){    
    progBarDiv = document.getElementById("progBarDiv");
    progBar = document.getElementById("progBar");
    progBarDiv.className = "progressBarDiv";
    progBar.className = "progressBar";
};

function imagePreview(){
    var productImgUploadPreview = document.getElementById('productImgUploadPreview');
    var imageAddButton = document.getElementById('imageAddButton');
    var imageRemoveButton = document.getElementById('imageRemoveButton');
    var productImageSendButton = document.getElementById('productImageSendButton');
    productImgUploadPreview.style.display = "none";
    productImageSendButton.style.display = "none";
    imageSelector.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            imageAddButton.style.display = "block";
            imageRemoveButton.style.display = "none";
            productImageSendButton.style.display = "none";
            productImgUploadPreview.onload = () => {
                URL.revokeObjectURL(productImgUploadPreview.src);
                imageAddButton.style.display = "none";
                imageRemoveButton.style.display = "block";
                productImageSendButton.style.display = "block";
            }
            productImgUploadPreview.src = URL.createObjectURL(this.files[0]);
            productImgUploadPreview.style.display = "block";            
        }
    });
};

function imageCancel(){    
    var productImgUploadPreview = document.getElementById('productImgUploadPreview');
    productImgUploadPreview.style.display = "none";
    imageSelector.value = "";
    imageAddButton.style.display = "block";
    imageRemoveButton.style.display = "none";
    productImageSendButton.style.display = "none";
};



// ------------------------------------------------------------------------------------- //

function openInfotables() {
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.response);
            window.open("./manage/infotables", "_blank");
        }
    };
    xhttp.open("GET", "./manage/infotables", false);
    xhttp.send();
};

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
        xhttp.open("POST", "./manage/backupTable/", true);
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
    xhttp.open("POST", "./manage/requestReportArchive/" + data, true);
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
    xhttp.open("GET", "./manage/getListOfArchiveReport/", true);
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
        xhttp.open("GET", "./manage/resetClientsDataAfterRead/", true);
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
        xhttp.open("GET", "./manage/removeOldBackups/", true);
        xhttp.send();
    };
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            return;
        }
    };
};

// --------------------------- UTILITIES AND LOADERS ------------------------------ //

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
        xhttp.open("POST", "./manage/searchNameManage/" + name, true);
        xhttp.send();
    };
};

window.addEventListener('load', loadUtiliti, false);
function loadUtiliti() {
    setTimeout(function () {
        getReportArchiveList();
    }, 100);
    setTimeout(function () {
        getProducts();
    }, 400);    
    setTimeout(function () {
        connectedTerminalsStatus();
        imagePreview();
        createProgressBar();
    }, 800);
    getItemImagesAsHtml();
    loadThemeSelection();
    loadDisplayMessages();

};

let backgroundImages = [];
let backgroundSelected = '';
let backgroundRandomPool = new Set();
let backgroundRandomAll = false;
let backgroundFolders = [];
let backgroundFolderAllowList = new Set();
const backgroundRootKey = '__root__';

function loadThemeSelection() {
    const select = document.getElementById("themeSelect");
    const backgroundSelect = document.getElementById("backgroundSelect");
    const backgroundRandomEnabled = document.getElementById("backgroundRandomEnabled");
    const backgroundRandomAllToggle = document.getElementById("backgroundRandomAll");
    const backgroundRandomIntervalMin = document.getElementById("backgroundRandomIntervalMin");
    const backgroundImageOpacity = document.getElementById("backgroundImageOpacity");
    const backgroundImageOpacityValue = document.getElementById("backgroundImageOpacityValue");
    const backgroundOverlayColor = document.getElementById("backgroundOverlayColor");
    const backgroundPattern = document.getElementById("backgroundPattern");
    const backgroundFoldersAllToggle = document.getElementById("backgroundFoldersAll");
    const scrollEnabled = document.getElementById("scrollEnabled");
    const scrollLocation = document.getElementById("scrollLocation");
    const scrollTextColor = document.getElementById("scrollTextColor");
    const scrollTextColorCustom = document.getElementById("scrollTextColorCustom");
    const scrollTextSize = document.getElementById("scrollTextSize");
    const scrollTextSizeValue = document.getElementById("scrollTextSizeValue");
    const scrollTextSpacing = document.getElementById("scrollTextSpacing");
    const scrollTextSpacingValue = document.getElementById("scrollTextSpacingValue");
    const scrollTextWeight = document.getElementById("scrollTextWeight");
    const scrollOrderMode = document.getElementById("scrollOrderMode");
    const scrollDelayMs = document.getElementById("scrollDelayMs");
    const scrollDelayValue = document.getElementById("scrollDelayValue");
    if (!select) {
        return;
    }
    getRequest("./manage/ui-config", function (response) {
        try {
            const data = JSON.parse(response);
            select.value = data.theme || 'default';
            if (backgroundSelect) {
                backgroundSelect.value = data.backgroundMode || 'none';
            }
            if (backgroundRandomEnabled) {
                backgroundRandomEnabled.checked = Boolean(data.backgroundRandomEnabled);
            }
            if (backgroundRandomAllToggle) {
                backgroundRandomAllToggle.checked = Boolean(data.backgroundRandomAll);
            }
            if (backgroundRandomIntervalMin) {
                backgroundRandomIntervalMin.value = clampIntervalMinutes(data.backgroundRandomIntervalMin);
            }
            if (backgroundImageOpacity) {
                backgroundImageOpacity.value = opacityToPercent(data.backgroundImageOpacity);
            }
            updateBackgroundOpacityLabel(backgroundImageOpacityValue, backgroundImageOpacity);
            if (backgroundOverlayColor) {
                backgroundOverlayColor.value = data.backgroundOverlayColor || '';
            }
            if (backgroundPattern) {
                backgroundPattern.value = data.backgroundPattern || 'none';
            }
            if (scrollEnabled) {
                scrollEnabled.checked = data.scrollEnabled !== false;
            }
            if (scrollLocation) {
                scrollLocation.value = data.scrollLocation || 'bottom';
            }
            if (scrollTextColor) {
                scrollTextColor.value = data.scrollTextColor || 'default';
            }
            if (scrollTextColorCustom) {
                scrollTextColorCustom.value = data.scrollTextColorCustom || '#f09e06';
            }
            if (scrollTextSize) {
                scrollTextSize.value = clampScrollTextSize(data.scrollTextSizePx);
            }
            updateScrollTextSizeLabel(scrollTextSize, scrollTextSizeValue);
            if (scrollTextSpacing) {
                scrollTextSpacing.value = clampScrollTextSpacing(data.scrollTextSpacing);
            }
            updateScrollTextSpacingLabel(scrollTextSpacing, scrollTextSpacingValue);
            if (scrollTextWeight) {
                scrollTextWeight.value = String(data.scrollTextWeight || '400');
            }
            if (scrollOrderMode) {
                scrollOrderMode.value = data.scrollOrderMode || 'random';
            }
            if (scrollDelayMs) {
                scrollDelayMs.value = normalizeDelayValue(data.scrollDelayMs, data.scrollSpeed);
            }
            updateScrollDelayLabel(scrollDelayMs, scrollDelayValue);
            backgroundSelected = data.backgroundImage || '';
            backgroundRandomPool = new Set(Array.isArray(data.backgroundRandomPool) ? data.backgroundRandomPool : []);
            backgroundRandomAll = Boolean(data.backgroundRandomAll);
            backgroundFolderAllowList = new Set(Array.isArray(data.backgroundFolderAllowList) ? data.backgroundFolderAllowList : []);
            if (backgroundFoldersAllToggle) {
                backgroundFoldersAllToggle.checked = backgroundFolderAllowList.size === 0;
            }
            loadBackgroundFolders();
            loadBackgroundImages();
        } catch (error) {
            select.value = 'default';
            if (backgroundSelect) {
                backgroundSelect.value = 'none';
            }
            if (backgroundRandomEnabled) {
                backgroundRandomEnabled.checked = false;
            }
            if (backgroundRandomAllToggle) {
                backgroundRandomAllToggle.checked = false;
            }
            if (backgroundRandomIntervalMin) {
                backgroundRandomIntervalMin.value = 10;
            }
            if (backgroundImageOpacity) {
                backgroundImageOpacity.value = opacityToPercent(null);
            }
            updateBackgroundOpacityLabel(backgroundImageOpacityValue, backgroundImageOpacity);
            if (backgroundOverlayColor) {
                backgroundOverlayColor.value = '';
            }
            if (backgroundPattern) {
                backgroundPattern.value = 'none';
            }
            if (scrollEnabled) {
                scrollEnabled.checked = true;
            }
            if (scrollLocation) {
                scrollLocation.value = 'bottom';
            }
            if (scrollTextColor) {
                scrollTextColor.value = 'default';
            }
            if (scrollTextColorCustom) {
                scrollTextColorCustom.value = '#f09e06';
            }
            if (scrollTextSize) {
                scrollTextSize.value = 18;
            }
            updateScrollTextSizeLabel(scrollTextSize, scrollTextSizeValue);
            if (scrollTextSpacing) {
                scrollTextSpacing.value = 0;
            }
            updateScrollTextSpacingLabel(scrollTextSpacing, scrollTextSpacingValue);
            if (scrollTextWeight) {
                scrollTextWeight.value = '400';
            }
            if (scrollOrderMode) {
                scrollOrderMode.value = 'random';
            }
            if (scrollDelayMs) {
                scrollDelayMs.value = 10;
            }
            updateScrollDelayLabel(scrollDelayMs, scrollDelayValue);
            backgroundSelected = '';
            backgroundRandomPool = new Set();
            backgroundRandomAll = false;
            backgroundFolderAllowList = new Set();
            if (backgroundFoldersAllToggle) {
                backgroundFoldersAllToggle.checked = true;
            }
            loadBackgroundFolders();
            loadBackgroundImages();
        }
    }, null);
    attachOpacitySliderHandlers(backgroundImageOpacity, backgroundImageOpacityValue);
    attachScrollDelayHandlers(scrollDelayMs, scrollDelayValue);
    attachScrollTextHandlers(scrollTextSize, scrollTextSizeValue, scrollTextSpacing, scrollTextSpacingValue);
}

function clampIntervalMinutes(value) {
    const parsed = Math.round(Number(value));
    if (!Number.isFinite(parsed)) {
        return 10;
    }
    if (parsed < 1) {
        return 1;
    }
    if (parsed > 180) {
        return 180;
    }
    return parsed;
}

function opacityToPercent(value) {
    const normalized = normalizeOpacity(value);
    return Math.round(normalized * 100);
}

function normalizeOpacity(value) {
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

function clampOpacityPercent(value) {
    const parsed = Math.round(Number(value));
    if (!Number.isFinite(parsed)) {
        return 8;
    }
    if (parsed < 0) {
        return 0;
    }
    if (parsed > 100) {
        return 100;
    }
    return parsed;
}

function updateBackgroundOpacityLabel(labelEl, sliderEl) {
    if (!labelEl || !sliderEl) {
        return;
    }
    const percent = clampOpacityPercent(sliderEl.value);
    sliderEl.value = percent;
    labelEl.textContent = percent + '%';
}

function attachOpacitySliderHandlers(sliderEl, labelEl) {
    if (!sliderEl) {
        return;
    }
    sliderEl.addEventListener('input', function () {
        updateBackgroundOpacityLabel(labelEl, sliderEl);
    });
}

function loadBackgroundImages() {
    const gallery = document.getElementById("backgroundGallery");
    if (!gallery) {
        return;
    }
    getRequest("./manage/background-images", function (response) {
        try {
            const data = JSON.parse(response);
            backgroundImages = Array.isArray(data) ? data : [];
        } catch (error) {
            backgroundImages = [];
        }
        renderBackgroundGallery();
    }, null);
}

function loadBackgroundFolders() {
    const list = document.getElementById("backgroundFolderList");
    if (!list) {
        return;
    }
    getRequest("./manage/background-folders", function (response) {
        try {
            const data = JSON.parse(response);
            backgroundFolders = Array.isArray(data) ? data : [];
        } catch (error) {
            backgroundFolders = [];
        }
        if (backgroundFolderAllowList.size === 0 && backgroundFolders.length) {
            backgroundFolderAllowList = new Set(backgroundFolders);
        }
        renderBackgroundFolderList();
        renderBackgroundGallery();
    }, null);
}

function renderBackgroundFolderList() {
    const list = document.getElementById("backgroundFolderList");
    if (!list) {
        return;
    }
    if (!backgroundFolders.length) {
        list.innerHTML = '<span class="hintText">אין תיקיות רקע זמינות.</span>';
        return;
    }
    const html = backgroundFolders.map((folder) => {
        const label = folder === backgroundRootKey ? 'root' : folder;
        const checked = backgroundFolderAllowList.has(folder) ? 'checked' : '';
        return (
            '<label class="folderChip">' +
                '<input type="checkbox" class="folderToggle" data-folder="' + folder + '" ' + checked + '>' +
                '<span>' + label + '</span>' +
            '</label>'
        );
    }).join('');
    list.innerHTML = html;
    attachFolderHandlers();
}

function attachFolderHandlers() {
    const list = document.getElementById("backgroundFolderList");
    if (!list) {
        return;
    }
    const toggles = list.querySelectorAll('.folderToggle');
    toggles.forEach((toggle) => {
        toggle.addEventListener('change', function () {
            const folder = toggle.getAttribute('data-folder');
            if (!folder) {
                return;
            }
            if (toggle.checked) {
                backgroundFolderAllowList.add(folder);
            } else {
                backgroundFolderAllowList.delete(folder);
            }
            syncFoldersAllToggle();
            renderBackgroundGallery();
        });
    });
}

function syncFoldersAllToggle() {
    const toggle = document.getElementById("backgroundFoldersAll");
    if (!toggle) {
        return;
    }
    toggle.checked = backgroundFolderAllowList.size === 0 || backgroundFolderAllowList.size === backgroundFolders.length;
}

function toggleBackgroundFoldersAll() {
    const toggle = document.getElementById("backgroundFoldersAll");
    if (!toggle) {
        return;
    }
    if (toggle.checked) {
        backgroundFolderAllowList = new Set(backgroundFolders);
    } else {
        backgroundFolderAllowList = new Set();
    }
    renderBackgroundFolderList();
    renderBackgroundGallery();
}

function renderBackgroundGallery() {
    const gallery = document.getElementById("backgroundGallery");
    if (!gallery) {
        return;
    }
    const filteredImages = getFilteredBackgroundImages();
    if (!filteredImages.length) {
        gallery.innerHTML = '<div class="hintText">לא נמצאו תמונות רקע.</div>';
        return;
    }
    if (backgroundSelected && !filteredImages.includes(backgroundSelected)) {
        backgroundSelected = '';
    }
    const html = filteredImages.map((path) => {
        const fileName = path.split('/').pop();
        const isSelected = path === backgroundSelected ? 'selected' : '';
        const randomChecked = backgroundRandomAll || backgroundRandomPool.has(path) ? 'checked' : '';
        const randomDisabled = backgroundRandomAll ? 'disabled' : '';
        return (
            '<div class="backgroundThumb ' + isSelected + '" data-path="' + path + '">' +
                '<img src="/' + path + '" alt="' + fileName + '">' +
                '<div class="thumbFooter">' +
                    '<span class="thumbLabel">' + fileName + '</span>' +
                    '<label class="thumbRandom">' +
                        '<input type="checkbox" class="thumbRandomInput" data-path="' + path + '" ' + randomChecked + ' ' + randomDisabled + '>רנדום' +
                    '</label>' +
                '</div>' +
            '</div>'
        );
    }).join('');
    gallery.innerHTML = html;
    attachBackgroundHandlers();
}

function getFilteredBackgroundImages() {
    if (!backgroundImages.length) {
        return [];
    }
    if (!backgroundFolderAllowList.size || backgroundFolderAllowList.size === backgroundFolders.length) {
        return backgroundImages.slice();
    }
    return backgroundImages.filter((path) => backgroundFolderAllowList.has(getImageFolderKey(path)));
}

function getImageFolderKey(path) {
    const parts = String(path).split('/');
    if (parts.length < 2) {
        return backgroundRootKey;
    }
    if (parts[0] !== 'img') {
        return backgroundRootKey;
    }
    return parts.length >= 3 ? parts[1] : backgroundRootKey;
}

function toggleBackgroundRandomAll() {
    const toggle = document.getElementById("backgroundRandomAll");
    backgroundRandomAll = toggle ? toggle.checked : false;
    renderBackgroundGallery();
}

function attachBackgroundHandlers() {
    const gallery = document.getElementById("backgroundGallery");
    if (!gallery) {
        return;
    }
    const thumbs = gallery.querySelectorAll('.backgroundThumb');
    thumbs.forEach((thumb) => {
        thumb.addEventListener('click', function () {
            const path = thumb.getAttribute('data-path');
            if (!path) {
                return;
            }
            const randomEnabledToggle = document.getElementById("backgroundRandomEnabled");
            const randomAllToggle = document.getElementById("backgroundRandomAll");
            if (randomEnabledToggle && randomEnabledToggle.checked) {
                randomEnabledToggle.checked = false;
            }
            if (randomAllToggle && randomAllToggle.checked) {
                randomAllToggle.checked = false;
                backgroundRandomAll = false;
            }
            backgroundSelected = path;
            updateBackgroundSelection();
        });
    });
    const randomInputs = gallery.querySelectorAll('.thumbRandomInput');
    randomInputs.forEach((input) => {
        input.addEventListener('click', function (event) {
            event.stopPropagation();
        });
        input.addEventListener('change', function () {
            const path = input.getAttribute('data-path');
            if (!path) {
                return;
            }
            if (input.checked) {
                backgroundRandomPool.add(path);
                return;
            }
            backgroundRandomPool.delete(path);
        });
    });
}

function updateBackgroundSelection() {
    const gallery = document.getElementById("backgroundGallery");
    if (!gallery) {
        return;
    }
    const thumbs = gallery.querySelectorAll('.backgroundThumb');
    thumbs.forEach((thumb) => {
        const path = thumb.getAttribute('data-path');
        if (path === backgroundSelected) {
            thumb.classList.add('selected');
            return;
        }
        thumb.classList.remove('selected');
    });
}

function normalizeDelayValue(value, speedFallback) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
        return clampDelay(parsed);
    }
    if (speedFallback === 'slow') {
        return 20;
    }
    if (speedFallback === 'fast') {
        return 5;
    }
    return 10;
}

function clampDelay(value) {
    const rounded = Math.round(value);
    if (rounded < 5) {
        return 5;
    }
    if (rounded > 50) {
        return 50;
    }
    return rounded;
}

function clampScrollTextSize(value) {
    const parsed = Math.round(Number(value));
    if (!Number.isFinite(parsed)) {
        return 18;
    }
    if (parsed < 12) {
        return 12;
    }
    if (parsed > 32) {
        return 32;
    }
    return parsed;
}

function clampScrollTextSpacing(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return 0;
    }
    if (parsed < 0) {
        return 0;
    }
    if (parsed > 4) {
        return 4;
    }
    return parsed;
}

function updateScrollTextSizeLabel(sliderEl, labelEl) {
    if (!sliderEl || !labelEl) {
        return;
    }
    const value = clampScrollTextSize(sliderEl.value);
    sliderEl.value = value;
    labelEl.textContent = String(value);
}

function updateScrollTextSpacingLabel(sliderEl, labelEl) {
    if (!sliderEl || !labelEl) {
        return;
    }
    const value = clampScrollTextSpacing(sliderEl.value);
    sliderEl.value = value;
    labelEl.textContent = String(value);
}

function attachScrollTextHandlers(sizeEl, sizeLabel, spacingEl, spacingLabel) {
    if (sizeEl) {
        sizeEl.addEventListener('input', function () {
            updateScrollTextSizeLabel(sizeEl, sizeLabel);
        });
    }
    if (spacingEl) {
        spacingEl.addEventListener('input', function () {
            updateScrollTextSpacingLabel(spacingEl, spacingLabel);
        });
    }
}

function updateScrollDelayLabel(sliderEl, labelEl) {
    if (!sliderEl || !labelEl) {
        return;
    }
    const value = clampDelay(sliderEl.value);
    sliderEl.value = value;
    labelEl.textContent = String(value);
}

function attachScrollDelayHandlers(sliderEl, labelEl) {
    if (!sliderEl) {
        return;
    }
    sliderEl.addEventListener('input', function () {
        updateScrollDelayLabel(sliderEl, labelEl);
    });
}

let displayMessagesList = [];

function loadDisplayMessages() {
    const table = document.getElementById("displayMessagesTable");
    if (!table) {
        return;
    }
    getRequest("./manage/message-board/posts", function (response) {
        try {
            displayMessagesList = JSON.parse(response) || [];
        } catch (error) {
            displayMessagesList = [];
        }
        renderDisplayMessages();
    }, null);
}

function renderDisplayMessages() {
    const table = document.getElementById("displayMessagesTable");
    if (!table) {
        return;
    }
    if (!displayMessagesList.length) {
        table.innerHTML = '<div class="hintText">אין הודעות זמינות.</div>';
        return;
    }
    const html = displayMessagesList.map((post) => {
        const text = String(post.post || '').trim();
        const shortText = text.length > 120 ? text.substring(0, 117) + '...' : text;
        const enabledChecked = post.display_enabled ? 'checked' : '';
        const tempChecked = post.display_is_temporary ? 'checked' : '';
        const pinChecked = post.pin ? 'checked' : '';
        const duration = Number.isFinite(Number(post.display_duration_min)) ? Number(post.display_duration_min) : 5;
        const orderValue = Number.isFinite(Number(post.display_order)) ? Number(post.display_order) : 0;
        const priorityValue = Number.isFinite(Number(post.display_priority)) ? Number(post.display_priority) : 1;
        const expiresAt = post.display_expires_at ? String(post.display_expires_at) : '-';
        return (
            '<div class="messageRow" data-postid="' + post.postid + '">' +
                '<div>' +
                    '<div class="messageText" title="' + text.replace(/"/g, '&quot;') + '">' + shortText + '</div>' +
                    '<div class="messageMeta">ID ' + post.postid + ' | תפוגה: ' + expiresAt + '</div>' +
                '</div>' +
                '<label class="toggleGroup">' +
                    '<input type="checkbox" class="messageToggle" data-field="display_enabled" ' + enabledChecked + '>תצוגה' +
                '</label>' +
                '<label class="toggleGroup">' +
                    '<input type="checkbox" class="messageToggle" data-field="display_is_temporary" ' + tempChecked + '>זמני' +
                '</label>' +
                '<label class="toggleGroup">' +
                    '<input type="checkbox" class="messageToggle" data-field="pin" ' + pinChecked + '>נעוץ' +
                '</label>' +
                '<select class="select messagePriority" data-field="display_priority">' +
                    '<option value="2" ' + (priorityValue === 2 ? 'selected' : '') + '>גבוהה</option>' +
                    '<option value="1" ' + (priorityValue === 1 ? 'selected' : '') + '>רגילה</option>' +
                    '<option value="0" ' + (priorityValue === 0 ? 'selected' : '') + '>נמוכה</option>' +
                '</select>' +
                '<input type="number" class="textboxNumber messageDuration" min="1" max="180" value="' + duration + '">' +
                '<input type="number" class="textboxNumber messageOrder" min="0" max="999" value="' + orderValue + '">' +
                '<button class="outline messageSaveBtn">שמירה</button>' +
                '<button class="outline messageDeleteBtn">מחיקה</button>' +
            '</div>'
        );
    }).join('');
    table.innerHTML = html;
    attachDisplayMessageHandlers();
}

function attachDisplayMessageHandlers() {
    const table = document.getElementById("displayMessagesTable");
    if (!table) {
        return;
    }
    const rows = table.querySelectorAll('.messageRow');
    rows.forEach((row) => {
        const saveBtn = row.querySelector('.messageSaveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', function () {
                saveDisplayMessageRow(row);
            });
        }
        const deleteBtn = row.querySelector('.messageDeleteBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function () {
                deleteDisplayMessageRow(row);
            });
        }
    });
}

function addCustomDisplayMessage() {
    const textInput = document.getElementById("customMessageText");
    if (!textInput) {
        return;
    }
    const text = String(textInput.value || '').trim();
    if (!text) {
        return;
    }
    const tempToggle = document.getElementById("customMessageTemporary");
    const prioritySelect = document.getElementById("customMessagePriority");
    const durationInput = document.getElementById("customMessageDuration");
    const orderInput = document.getElementById("customMessageOrder");
    const duration = durationInput ? Number(durationInput.value) : 5;
    const orderValue = orderInput ? Number(orderInput.value) : 0;
    const priorityValue = prioritySelect ? Number(prioritySelect.value) : 1;
    const payload = JSON.stringify({
        text: text,
        display_is_temporary: tempToggle ? tempToggle.checked : false,
        display_priority: priorityValue,
        display_duration_min: duration,
        display_order: orderValue
    });
    postRequest("./manage/message-board/custom", function () {
        textInput.value = '';
        const log = document.getElementById("displayMessagesLog");
        if (log) {
            log.innerText = 'נוספה הודעה חדשה';
        }
        loadDisplayMessages();
    }, payload);
}

function deleteDisplayMessageRow(row) {
    const postid = Number(row.getAttribute('data-postid'));
    if (!Number.isInteger(postid)) {
        return;
    }
    if (!window.confirm('למחוק את ההודעה?')) {
        return;
    }
    const payload = JSON.stringify({ postid: postid });
    postRequest("./manage/message-board/delete", function () {
        const log = document.getElementById("displayMessagesLog");
        if (log) {
            log.innerText = 'נמחקה הודעה #' + postid;
        }
        loadDisplayMessages();
    }, payload);
}

function saveDisplayMessageRow(row) {
    const postid = Number(row.getAttribute('data-postid'));
    if (!Number.isInteger(postid)) {
        return;
    }
    const enabledToggle = row.querySelector('.messageToggle[data-field="display_enabled"]');
    const tempToggle = row.querySelector('.messageToggle[data-field="display_is_temporary"]');
    const pinToggle = row.querySelector('.messageToggle[data-field="pin"]');
    const prioritySelect = row.querySelector('[data-field="display_priority"]');
    const durationInput = row.querySelector('.messageDuration');
    const orderInput = row.querySelector('.messageOrder');
    const duration = durationInput ? Number(durationInput.value) : 5;
    const orderValue = orderInput ? Number(orderInput.value) : 0;
    const priorityValue = prioritySelect ? Number(prioritySelect.value) : 1;
    const payload = JSON.stringify({
        postid: postid,
        display_enabled: enabledToggle ? enabledToggle.checked : false,
        display_is_temporary: tempToggle ? tempToggle.checked : false,
        display_priority: priorityValue,
        display_duration_min: duration,
        display_order: orderValue,
        pin: pinToggle ? (pinToggle.checked ? 1 : 0) : 0
    });
    postRequest("./manage/message-board/post", function () {
        const log = document.getElementById("displayMessagesLog");
        if (log) {
            log.innerText = 'נשמרה הודעה #' + postid;
        }
        loadDisplayMessages();
    }, payload);
}

function saveThemeSelection() {
    const select = document.getElementById("themeSelect");
    const backgroundSelect = document.getElementById("backgroundSelect");
    const backgroundRandomEnabled = document.getElementById("backgroundRandomEnabled");
    const backgroundRandomAllToggle = document.getElementById("backgroundRandomAll");
    const backgroundFoldersAllToggle = document.getElementById("backgroundFoldersAll");
    const backgroundRandomIntervalMin = document.getElementById("backgroundRandomIntervalMin");
    const backgroundImageOpacity = document.getElementById("backgroundImageOpacity");
    const backgroundOverlayColor = document.getElementById("backgroundOverlayColor");
    const backgroundPattern = document.getElementById("backgroundPattern");
    const scrollEnabled = document.getElementById("scrollEnabled");
    const scrollLocation = document.getElementById("scrollLocation");
    const scrollTextColor = document.getElementById("scrollTextColor");
    const scrollTextColorCustom = document.getElementById("scrollTextColorCustom");
    const scrollTextSize = document.getElementById("scrollTextSize");
    const scrollTextSpacing = document.getElementById("scrollTextSpacing");
    const scrollTextWeight = document.getElementById("scrollTextWeight");
    const scrollOrderMode = document.getElementById("scrollOrderMode");
    const scrollDelayMs = document.getElementById("scrollDelayMs");
    const log = document.getElementById("themeLog");
    if (!select) {
        return;
    }
    const delayValue = scrollDelayMs ? clampDelay(scrollDelayMs.value) : 10;
    const textSizeValue = scrollTextSize ? clampScrollTextSize(scrollTextSize.value) : 18;
    const textSpacingValue = scrollTextSpacing ? clampScrollTextSpacing(scrollTextSpacing.value) : 0;
    const randomInterval = backgroundRandomIntervalMin
        ? clampIntervalMinutes(backgroundRandomIntervalMin.value)
        : 10;
    const imageOpacityPercent = backgroundImageOpacity
        ? clampOpacityPercent(backgroundImageOpacity.value)
        : 8;
    const imageOpacity = imageOpacityPercent / 100;
    const randomAll = backgroundRandomAllToggle ? backgroundRandomAllToggle.checked : false;
    const filteredImages = getFilteredBackgroundImages();
    const randomPool = randomAll ? filteredImages.slice() : Array.from(backgroundRandomPool);
    if (backgroundFoldersAllToggle && backgroundFoldersAllToggle.checked) {
        backgroundFolderAllowList = new Set(backgroundFolders);
    }
    const payload = JSON.stringify({
        theme: select.value,
        backgroundMode: backgroundSelect ? backgroundSelect.value : 'none',
        backgroundImage: backgroundSelected || '',
        backgroundRandomEnabled: backgroundRandomEnabled ? backgroundRandomEnabled.checked : false,
        backgroundRandomAll: randomAll,
        backgroundRandomIntervalMin: randomInterval,
        backgroundRandomPool: randomPool,
        backgroundFolderAllowList: Array.from(backgroundFolderAllowList),
        backgroundImageOpacity: imageOpacity,
        backgroundOverlayColor: backgroundOverlayColor ? backgroundOverlayColor.value : '',
        backgroundPattern: backgroundPattern ? backgroundPattern.value : 'none',
        scrollEnabled: scrollEnabled ? scrollEnabled.checked : true,
        scrollLocation: scrollLocation ? scrollLocation.value : 'bottom',
        scrollTextColor: scrollTextColor ? scrollTextColor.value : 'default',
        scrollTextColorCustom: scrollTextColorCustom ? scrollTextColorCustom.value : '',
        scrollTextSizePx: textSizeValue,
        scrollTextWeight: scrollTextWeight ? scrollTextWeight.value : '400',
        scrollTextSpacing: textSpacingValue,
        scrollDelayMs: delayValue,
        scrollOrderMode: scrollOrderMode ? scrollOrderMode.value : 'random'
    });
    postRequest("./manage/ui-config", function (response) {
        if (log) {
            const mode = response.backgroundMode || (backgroundSelect ? backgroundSelect.value : 'none');
            log.innerText = "נשמר: " + (response.theme || select.value) + " | רקע: " + mode;
        }
    }, payload);
}

function refreshAllClients() {
    if (window.confirm("לטעון מחדש את המסופים המחוברים?")) {
        xhttp.open("GET", "./events/refreshClients", true);
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
    xhttp.open("GET", "./events/status", true);
    xhttp.send();    
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {            
            connectedTerminals.innerText = (JSON.parse(this.response).clients);
            return;
        }
    };
};
