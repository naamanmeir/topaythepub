var xhttp = new XMLHttpRequest();

function currentReport(){

}

function orders(){

}

function clients(){

}

function clientsFull(){

}




function showAccountTable(data,itemsBought){
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
    itemsText = document.createTextNode(" משהוים נלקחו מהמקרר : "+", מרקים נלגמו : ");
    // div.appendChild(header);
    // div.appendChild(itemsText);
    TR.innerHTML = ("<th>סכום</th><th>פרטים</th><th>שם לקוח</th><th>מס. לקוח</th>");    
    tableBody.appendChild(TR);
    for(let i = 0;i < data.length; i++){
        const row = document.createElement("tr");
        let clientRow = Object.values(data[i]);
        for (let j = 0; j < clientRow.length; j++) {
            if(j == 2){clientRow[j] = clientRow[j]};
            const cell = document.createElement("td");
            let cellText;
            if(j==0){cellText = document.createTextNode(clientRow[j]+" ₪");}
            if(j==1){cellText = document.createTextNode("פאב "+clientRow[j]);}
            if(j>1){cellText = document.createTextNode(clientRow[j]);}
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
    table.setAttribute("width", "100%");
    table.setAttribute("style", "font-size:xx-large");
    table.setAttribute("class", "tableStyle");
    var tableWindow = window.open("", "טבלת חיובים", "width=1000, height=800, dir=rtl");    
    tableWindow.document.write();
    div.appendChild(table);
    tableWindow.document.appendChild(div);    
};