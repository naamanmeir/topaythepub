exports.buildHtml = function (messageUi) {    
    let html = ``;    
    html +=
        `
        <script id="messageBoardScript" src="js/script_mboard.js"></script>
        <div class="userInfoCloseButton" id="userPageCloseButton">X</div>
        <div class="windowTop">
        message board
        </div>        
    `;
    return html;
    };    
