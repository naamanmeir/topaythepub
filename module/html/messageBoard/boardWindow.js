exports.buildHtml = function (messageUi) {    
    let html = ``;    
    html +=
        `        
        <div class="closeButton" id="messageBoardCloseButton">X</div>
        <div class="windowTop">
        message board
        </div>

        <div id="windowButtons">
        <div class="windowButton yes row" id="closeWindowButton">${messageUi.userPageButtonCloseWindow}</div>
        <div class="windowButton no row" id="deleteOrderButton">${messageUi.userPageButtonDeleteOrder}</div>
        </div>

    `;    
    return html;
    };    
