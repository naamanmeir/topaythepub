exports.buildHtml = function (messageUi,userInfo, userData) {
        let html = ``;
        html += `<head>
            <link rel="stylesheet" href="./css/windowStyle.css">
            </head>            
            <div class="userInfoCloseButton" id="userPageCloseButton">X</div>
            <div class="windowTop">
            <p>${messageUi.userPageName}${userInfo.name}</p>
            <p>${messageUi.userPageAccount}${userInfo.account}</p>
            <p>${messageUi.userPageId}${userInfo.id}</p>
            </div>
            <div class="userInfoChangeNickDiv">
            <p class="userInfoText">${messageUi.userPageNick}<textarea id="userInfoChangeNickText" class="userInfoChangeNickText">${userInfo.nick}</textarea></p>
            <button class="userInfoChangeNickButton" id="userInfoChangeNickButton">${messageUi.userPageNickButtonYes}</button>
            </div>           
            <br>`
        html += `<div id="userInfoTableDiv" class="userInfoTableDiv">
            <table class="userInfoTable"><tbody>`
        html += `<tr class="tableHead"><th>${messageUi.userPageTableSum}</th>
            <th>${messageUi.userPageTableDetails}</th><th>${messageUi.userPageTableDate}</th>
            <th>${messageUi.userPageTableId}</th></tr>`
        userData.forEach((order, i) => {
                var bg;
                let timezone = "Indian/Kerguelen";
                let time = new Date(order.formatted_date).toLocaleString("he-IL", { timeZone: timezone}).slice(0,-3).replace('.2023','');
                if (i % 2 === 0) { bg = 'class="tableEven"' } else { bg = 'class="tableOdd"' };
                html += `<tr ${bg}><td>${order.sum}</td><td>${order.info}</td><td>${time}</td><td>${order.orderid}</td></tr>`
        });
        html += `</tbody></table></div>`;
        html += `<div id="windowButtons">
                <div class="windowButton yes row" id="closeWindowButton">${messageUi.userPageButtonCloseWindow}</div>
                <div class="windowButton no row" id="deleteOrderButton">${messageUi.userPageButtonDeleteOrder}</div>
                </div>`;        
        return html;
};