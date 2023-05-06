exports.buildOrderConfirm = function (userInfo, orderData, orderPriceSum) {
    let messagesJson = require('../messages.json');
    let messageClient = messagesJson.client[0];
    let messageUi = messagesJson.ui[0];

    // console.log("REQUEST ORDER CONFIRM MODULE START");
    let html = ``;
    html += `<head>
            <link rel="stylesheet" href="./css/windowStyle.css">
            </head>
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
        ${messageUi.orderConfirmSum} ${messageUi.orderConfirmCurrency}${orderData[i][3]}
                <img src="${orderData[i][4]}" width="30px" height="30px"></p>        
        </div>`
    };
    html += `<br><p>${messageUi.orderConfirmTotalSum} ${messageUi.orderConfirmCurrency}${orderPriceSum}</p>`
    html += `<br><p>${messageUi.orderConfirmToName} ${userInfo.name} &emsp;
    ${messageUi.orderConfirmToAccount} ${userInfo.account}</p>><br>`

    html += `</div>
    <div id="windowButtons">`
    html += `<button id="orderConfirmButtonNo">${messageUi.orderConfirmButtonNo}</button>`;
    html += `<button id="orderConfirmButtonYes">${messageUi.orderConfirmButtonYes}</button>`;
    html += `</div>
        </div>`;
    return html;
};