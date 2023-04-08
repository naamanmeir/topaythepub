exports.buildUserPage = function (array) {
    let html = ``;
    console.log(array);
    array.forEach(item => {
        html += `<div class="item" id="item${item.itemid}">`;
        html += `<p class="itemName">${item.itemname}</p>`;
        html += `<img src="${item.itemimgpath}" height="100px">`;
        html += `<p class="itemPrice">₪${item.price}`;
        html += `</div>`;
    });
    return html;
};