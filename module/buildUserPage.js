exports.buildUserPage = function (userInfo, userData) {
    let messagesJson = require('../messages.json');
    let messageClient = messagesJson.client[0];
    let messageUi = messagesJson.ui[0];

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
            </div>
            <div class="userInfoChangeNickDiv">
            <p class="userInfoText">${messageUi.userPageNick}<textarea class="userInfoChangeNickText">${userInfo.nick}</textarea></p>
            <button class="userInfoChangeNickButton" id="userInfoChangeNickButton">${messageUi.userPageNickButtonYes}</button>
            </div>
            </div>
            <br>`
    html += `<div class="userInfoTableDiv">
            <table class="userInfoTable"><tbody>`
    html += `<tr class="tableHead"><th>${messageUi.userPageTableSum}</th>
            <th>${messageUi.userPageTableDetails}</th><th>${messageUi.userPageTableDate}</th>
            <th>${messageUi.userPageTableId}</th></tr>`

    userData.forEach((order, i) => {
        var bg;
        if (i % 2 === 0) { bg = 'class="tableEven"' } else { bg = 'class="tableOdd"' };
        html += `<tr ${bg}><td>${order.sum}</td><td>${order.info}</td><td>${order.formatted_date}</td><td>${order.orderid}</td></tr>`
    });

    html += `</tbody></table></div>`;

    html += `<div class="deleteOrderButton">${messageUi.userPageButtonDeleteOrder}</div>`;
    html += `</div>`;
    return html;
};