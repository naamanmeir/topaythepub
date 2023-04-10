exports.buildItemHtml = function (array) {
    let html = ``;
    array.forEach(item => {
        html +=
            `
        <div class="item" id="item${item.itemid}"
        onmousedown="addItem(${item.itemid})">
        <p class="itemName">${item.itemname}</p>
        <img src="${item.itemimgpath}" height="100px">
        <p class="itemPrice">₪${item.price}
        </div>
        <div class="counts" id="dount${item.itemid}"></div>
        `;

    });
    return html;
};