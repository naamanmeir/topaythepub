exports.buildItemHtml = function (array) {
    let html = `<div class="items>`;
    array.forEach(item => {
        html += `<div class="item" id="item${item.itemid}">`;
        html += `<p class="itemName">${item.itemname}</p>`;
        html += `<img src="${item.itemimgpath}" height="100px">`;
        html += `<p class="itemPrice">${item.price}`;
        html += `</div>`;
        let row = [item.itemid, item.itemname, item.price, item.itemimgpath];
    });
    html += `</div>`;
    console.log(html);
    return html;
};