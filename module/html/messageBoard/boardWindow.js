exports.buildHtml = function (messageUi,posts) {    
    let html = ``;    
    html +=
        `        
        <div class="closeButton" id="messageBoardCloseButton">X</div>
        <div class="windowTop">
        message board
        </div>
        `;
    html +=
        `
        <div>
            <textarea id="postInput" class="postInput" name="postInput"></textarea>
            <input type="button" onclick="postSend()" value="שלח" />
        </div>
        `;
    
    for (i = 0; i < posts.length; i++) {
        console.log(posts[i].post)
        html +=
        `
        <div id="post${i}">
        ${posts[i].post}
        </div>
        `
    }   

    html +=
        `
        <div id="windowButtons">
            <div class="windowButton yes row" id="closeWindowButton">${messageUi.userPageButtonCloseWindow}</div>
            <div class="windowButton no row" id="deleteOrderButton">${messageUi.userPageButtonDeleteOrder}</div>
        </div>        
        `;    
    return html;
    };    
