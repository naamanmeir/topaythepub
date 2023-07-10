exports.buildHtml = function (messageUi,array) {
    let html = ``;
    array.forEach(item => {
        html +=
            `
        <div 
        class="item" id="item${item.itemid}"
        onmousedown="addItem(${item.itemid})">
        <itemName>${item.itemname}</itemName>
        `        
        if(item.price>0){
            html +=`
            <itemPrice>${messageUi.orderConfirmCurrency}${item.price}</itemPrice>
            `;
        }else{
            html +=`
            <itemPrice></itemPrice>
            <br><br>
            `;
        }
        html +=`        
        <img src="${item.itemimgpath}">        
        <div class="itemCount" id="itemCount${item.itemid}"></div>
        </div>
        
        `;

    });
    return html;
};