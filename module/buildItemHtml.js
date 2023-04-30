exports.buildItemHtml = function (array) {
    let html = ``;
    array.forEach(item => {
        html +=
            `
        <div style="background-image: url('${item.itemimgpath}')";
        class="item" id="item${item.itemid}"
        onmousedown="addItem(${item.itemid})">
        <p class="itemName">${item.itemname}</p>
        <style>
            
        </style>
        <img src="${item.itemimgpath}">
        <p class="itemPrice">₪${item.price}
        <div class="itemCount" id="itemCount${item.itemid}">&nbsp;&nbsp;</div>
        </div>
        
        `;

    });
    return html;
};