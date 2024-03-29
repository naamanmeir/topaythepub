exports.buildHtml = function (messageUi,userInfo, orderData, orderPriceSum) {

    // console.log("REQUEST ORDER CONFIRM MODULE START");
    let html = ``;
    html += `
            <div id="OrderConfirmWindow">
            <div class="windowTop"><p>${messageUi.orderConfirmTitle}</p></div>
            <div class="userInfoCloseButton" id="orderConfirmCloseButton">X</div>            
            <div class="windowTop"><p>${messageUi.orderConfirmHello} ${userInfo.nick}</p></div>
            <div><p></p></div>            
            <br>
            <div class="orderInfo">
            <p>${messageUi.orderConfirmPleaseAprove}<p>`
    for (i = 0; i < orderData.length; i++) {
        html += `<div class="orderConfirmItem">
        <p>${orderData[i][0]} ${orderData[i][1]} ${messageUi.orderConfirmPrice} ${messageUi.orderConfirmCurrency}${orderData[i][2]}
        <img src="${orderData[i][4]}" width="30px" height="30px">
        <br>
        ${messageUi.orderConfirmSum} ${messageUi.orderConfirmCurrency}${orderData[i][3]}
        <br>
                </p>        
        </div>`
    };
    html += `<br><p>${messageUi.orderConfirmTotalSum} ${messageUi.orderConfirmCurrency}${orderPriceSum}</p>`
    html += `<br><p>${messageUi.orderConfirmToName} ${userInfo.name} <br> &emsp;
    ${messageUi.orderConfirmToAccount} ${userInfo.account}</p>><br>`

    html += `</div>
    <div id="windowButtons">`    
    html += `<button id="orderConfirmButtonYes">${messageUi.orderConfirmButtonYes}</button>`;
    html += `<button id="orderConfirmButtonNo">${messageUi.orderConfirmButtonNo}</button>`;
    html += `</div>
        </div>`;
    return html;
};