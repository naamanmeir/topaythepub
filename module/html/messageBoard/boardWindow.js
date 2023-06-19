exports.buildHtml = function (message) {    
    let html = ``;    
    html +=
        `
        <div class="userInfoCloseButton" id="userPageCloseButton">X</div>
        <div class="windowTop">
        <p>${messageUi.userPageName}${userInfo.name}</p>
        <p>${messageUi.userPageAccount}${userInfo.account}</p>
        <p>${messageUi.userPageId}${userInfo.id}</p>
        </div>        
    `;
    return html;
    };    
