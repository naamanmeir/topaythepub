exports.buildHtml = function (messageUi) {    
    let html = ``;    
    html +=
        `        
        <div class="closeButton" id="messageBoardCloseButton">X</div>
        <div class="windowTop">
        message board
        </div>
        <div>
            <textarea id="postInput" class="postInput" name="postInput"></textarea>
            <input type="button" onclick="postSend()" value="שלח" />
        </div>
        <div id="windowButtons">
        <div class="windowButton yes row" id="closeWindowButton">${messageUi.userPageButtonCloseWindow}</div>
        <div class="windowButton no row" id="deleteOrderButton">${messageUi.userPageButtonDeleteOrder}</div>
        </div>

    `;    
    return html;
    };    
