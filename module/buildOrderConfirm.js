exports.buildOrderConfirm = function (userInfo, orderData) {
    let messagesJson = require('../messages.json');
    let messageClient = messagesJson.client[0];
    let messageUi = messagesJson.ui[0];

    console.log("REQUEST ORDER CONFIRM MODULE START");

    let html = ``;
    html += `<head>
            <link rel="stylesheet" href="./css/userPage.css">
            </head>
            <div class="window" id="userPageWindow">
            <div class="userInfoCloseButton" id="userPageCloseButton">X</div>
            <div class="userInfoTop">
            <p class="userInfoText">${messageUi.userPageName}${userInfo.name}</p>
            <p class="userInfoText">${messageUi.userPageAccount}${userInfo.account}</p>
            <p class="userInfoText">${messageUi.userPageId}${userInfo.id}</p>
            <p class="userInfoText">${messageUi.userPageId}${orderData.id}</p>
            </div>
            </div>
            <br>`
    //         orderData.forEach((item, i) => {
    //     var bg;
    //     if (i % 2 === 0) { bg = 'class="tableEven"' } else { bg = 'class="tableOdd"' };
    //     html += `<tr ${bg}><td>${order.sum}</td><td>${order.info}</td><td>${order.formatted_date}</td><td>${order.orderid}</td></tr>`
    // });

    html += `</div>`;

    html += `<div class="deleteOrderButton" id="deleteOrderButton">${messageUi.userPageButtonDeleteOrder}</div>`;
    html += `</div>`;
    return html;
};