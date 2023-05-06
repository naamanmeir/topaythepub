exports.buildItemHtml = function (array) {
    let html = ``;
    array.forEach(item => {
        html +=
            `
        <div style="background-image: url('${item.itemimgpath}')" 
        class="item" id="item${item.itemid}"
        onmousedown="addItem(${item.itemid})">
        <itemName>${item.itemname}</itemName>
        <itemPrice>₪${item.price}</itemPrice>
        <div class="itemCount" id="itemCount${item.itemid}"></div>
        </div>
        
        `;

    });
    return html;
};