var xhttp = new XMLHttpRequest();

var limit = 0; // throttle limiter for db

function editLog(text) {
    console.log(text);
    document.getElementById("editLog").innerText = text;
    document.getElementById("editName").value = '';
    document.getElementById("editNick").value = '';
    document.getElementById("editNumber").value = '';
    document.getElementById("getUserByName").value = '';
}

function getAllData(scope) {
    // console.log(scope);
    xhttp.open("POST", "./getAllData/" + scope, true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.response);
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
                showAccountTable(JSON.parse(this.response));
            }
            if (scope == 5) {
                showAccountOrdersTable(JSON.parse(this.response));
            }
            return;
        }
    };
};

function showOrdersTable(data) {
    const table = document.createElement("table");
    const tableBody = document.createElement("tbody");
    const TR = document.createElement("tr");
    TR.innerHTML = ("<th>תג עסקה</th><th>נרשם בתאריך</th><th>פרטים</th><th>סך הכל</th><th>תג</th><th>שם</th>");
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
    TR.innerHTML = ("<th>תג משתמש</th><th>נרשם בתאריך</th><th>סך הכל</th><th>מספר חשבון</th><th>שם רשום</th><th>כינוי</th>");
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
    var tableWindow = window.open("", "טבלת משתמשים", "width=1000, height=800, dir=rtl");
    tableWindow.document.write();
    tableWindow.document.appendChild(table);
};

function showAccountTable(data) {
    const table = document.createElement("table");
    const tableBody = document.createElement("tbody");
    const TR = document.createElement("tr");
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
    table.setAttribute("style", "font-size:larger");
    table.setAttribute("class", "tableStyle");
    var tableWindow = window.open("", "טבלת חיובים", "width=1000, height=800, dir=rtl");
    tableWindow.document.write();
    tableWindow.document.appendChild(table);
};

function showAccountOrdersTable(data) {
    const table = document.createElement("table");
    const tableBody = document.createElement("tbody");
    const TR = document.createElement("tr");
    TR.innerHTML = ("<th>סכום</th><th>תאריך</th><th>פרטים</th><th>שם לקוח</th><th>מס. לקוח</th>");
    tableBody.appendChild(TR);
    for (let i = 0; i < data.length; i++) {
        const row = document.createElement("tr");
        let clientRow = Object.values(data[i]);
        for (let j = 0; j < clientRow.length; j++) {
            if (j == 2) { clientRow[j] = clientRow[j] };
            const cell = document.createElement("td");
            let cellText;
            if (j == 0) { cellText = document.createTextNode(clientRow[j] + " ₪"); }
            if (j == 1) { cellText = document.createTextNode(clientRow[j]); }
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
    table.setAttribute("style", "font-size:larger");
    table.setAttribute("class", "tableStyle");
    var tableWindow = window.open("", "טבלת חיובים", "width=1000, height=800, dir=rtl");
    tableWindow.document.write();
    tableWindow.document.appendChild(table);
};

function createReportFileOrders() {
    xhttp.open("GET", "./createFileReportOrders/", true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // THIS WILL DOWNLOAD YES
            window.open(this.response);
            return;
        }
    };
};

function createReportFileClients() {
    xhttp.open("GET", "./createFileReportClients/", true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // THIS WILL DOWNLOAD YES
            window.open(this.response);
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
    console.log(selectBar.value);
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

function requestReportArchive() {
    let selectBar = document.getElementById("reportArchive");
    console.log(selectBar.value);
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
getReportArchiveList();
