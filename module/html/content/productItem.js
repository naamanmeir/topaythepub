exports.buildHtml = function (messageUi,array) {
    let html = ``;
    array.forEach(item => {
        html +=
            `
        <div 
        class="item" id="item${item.itemid}"
        onmousedown="addItem(${item.itemid})">
        <itemName>${item.itemname}</itemName>
        <itemPrice>${messageUi.orderConfirmCurrency}${item.price}</itemPrice>
        <img src="${item.itemimgpath}">        
        <div class="itemCount" id="itemCount${item.itemid}"></div>
        </div>
        
        `;

    });
    return html;
    // style="background-image: url('${item.itemimgpath}')" 
};