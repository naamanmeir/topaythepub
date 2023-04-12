exports.buildOrderConfirm = function (userInfo, orderData) {
    let messagesJson = require('../messages.json');
    let messageClient = messagesJson.client[0];
    let messageUi = messagesJson.ui[0];

    console.log("REQUEST ORDER CONFIRM MODULE START");
    console.log(userInfo);
    let html = ``;
    html += `<head>
            <link rel="stylesheet" href="./css/windowStyle.css">
            </head>
            <div class="window" id="OrderConfirmWindow">
            <div class="userInfoCloseButton" id="orderConfirmCloseButton">X</div>
            <div class="windowTop">
            <div><p>${messageUi.orderConfirmTitle}</p></div>
            <br>
            <div><p>${messageUi.orderConfirmHello} ${userInfo.nick}</p></div>
            <div><p></p></div>
            </div>
            <br>
            <div class="orderInfo">
            <p>${messageUi.orderConfirmText1}<p>`
    for (i = 0; i < orderData.length; i++) {
        html += `<div class="orderConfirmItem">
        <p>${orderData[i][0]} ${orderData[i][1]} ${orderData[i][2]}
        ${orderData[i][3]}</p>
        <img src="${orderData[i][4]}" width="50px" height="50px">
        </div>`
    };
    html += `</div><div class="windowButtons">`
    html += `<button class="'windowButton'" id="orderConfirmNoButton">${messageUi.orderConfirmButtonNo}</button>`;
    html += `<button class="'windowButton'" id="orderConfirmYesButton">${messageUi.orderConfirmButtonYes}</button>`;
    html += `</div>
        </div>`;
    return html;
};

{/* <p>${messageUi.userPageAccount}${userInfo.account}</p> */ }
{/* <p>${messageUi.userPageId}${userInfo.id}</p>=> */ }