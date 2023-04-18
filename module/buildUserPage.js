exports.buildUserPage = function (userInfo, userData) {
        let messagesJson = require('../messages.json');
        let messageClient = messagesJson.client[0];
        let messageUi = messagesJson.ui[0];

        let html = ``;
        html += `<head>
            <link rel="stylesheet" href="./css/windowStyle.css">
            </head>
            <div class="window" id="userPageWindow">
            <div class="userInfoCloseButton" id="userPageCloseButton">X</div>
            <div class="windowTop">
            <p>${messageUi.userPageName}${userInfo.name}</p>
            <p>${messageUi.userPageAccount}${userInfo.account}</p>
            <p>${messageUi.userPageId}${userInfo.id}</p>
            </div>
            <div class="userInfoChangeNickDiv">
            <p class="userInfoText">${messageUi.userPageNick}<textarea class="userInfoChangeNickText">${userInfo.nick}</textarea></p>
            <button class="userInfoChangeNickButton" id="userInfoChangeNickButton">${messageUi.userPageNickButtonYes}</button>
            </div>           
            <br>`
        html += `<div class="userInfoTableDiv">
            <table class="userInfoTable"><tbody>`
        html += `<tr class="tableHead"><th>${messageUi.userPageTableSum}</th>
            <th>${messageUi.userPageTableDetails}</th><th>${messageUi.userPageTableDate}</th>
            <th>${messageUi.userPageTableId}</th></tr>`
        userData.forEach((order, i) => {
                var bg;
                let timezone = "Indian/Kerguelen";
                let time = new Date(order.formatted_date).toLocaleString("he-IL", { timeZone: timezone});
                console.log(time);
                if (i % 2 === 0) { bg = 'class="tableEven"' } else { bg = 'class="tableOdd"' };
                html += `<tr ${bg}><td>${order.sum}</td><td>${order.info}</td><td>${time}</td><td>${order.orderid}</td></tr>`
        });
        html += `</tbody></table></div>`;
        html += `<div class="deleteOrderButton" id="deleteOrderButton">${messageUi.userPageButtonDeleteOrder}</div>`;
        html += `</div>`;
        return html;
};