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
            <div class="message">
            <p>${messageUi.deleteorderConfirmDate} ${orderInfo.time}<p>
            <p>${messageUi.deleteorderConfirmInfo} ${orderInfo.info}<p>
            <p>${messageUi.deleteorderConfirmSum} ${messageUi.orderConfirmCurrency}${orderInfo.sum}<p>
            <p>${messageUi.deleteorderConfirmAccount} ${userInfo.account}<p>
            <p>${messageUi.deleteorderConfirmClient} ${userInfo.name}<p>
            </div>`

        html += `</div><div class="windowButtons">`
        html += `<button class="windowButton" id="orderConfirmButtonNo">${messageUi.deleteorderConfirmButtonNo}</button>`;
        html += `<button class="windowButton" id="orderConfirmButtonYes">${messageUi.deleteorderConfirmButtonYes}</button>`;
        html += `</div>
            `
    return html;
};
