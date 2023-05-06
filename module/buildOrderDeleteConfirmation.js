exports.buildOrderDeleteConfirmation = function (userInfo,orderInfo) {
    let messagesJson = require('../messages.json');
    let messageClient = messagesJson.client[0];
    let messageUi = messagesJson.ui[0];

    let html = `
        <head>
        <link rel="stylesheet" href="./css/windowStyle.css">
        </head> 
        `;
        html +=
            `
            <div id="deleteOrderConfirmWindow">
            <div>
            <p>${messageUi.deleteorderConfirmDate} ${orderInfo.time}<p>
            <p>${messageUi.deleteorderConfirmInfo} ${orderInfo.info}<p>
            <p>${messageUi.deleteorderConfirmSum} ${messageUi.orderConfirmCurrency}${orderInfo.sum}<p>
            <p>${messageUi.deleteorderConfirmAccount} ${userInfo.account}<p>
            <p>${messageUi.deleteorderConfirmClient} ${userInfo.name}<p>
            </div>`

        html += `
            <div id="windowButtons">
            <button id="deleteOrderConfirmButtonNo">${messageUi.deleteorderConfirmButtonNo}</button>
            <button id="deleteOrderConfirmButtonYes">${messageUi.deleteorderConfirmButtonYes}</button>
            </div>
            `
        html += `</div>`
    return html;
};
