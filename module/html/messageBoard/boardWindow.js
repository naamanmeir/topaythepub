exports.buildHtml = function (messageUi,posts) {    
    let html = ``;    
    html +=
        `        
        <div class="closeButton left" id="messageBoardCloseButtonLeft">X</div>
        `;

    html +=
        `        
        <div class="closeButton right" id="messageBoardCloseButtonRight">${messageUi.mBoardCloseText}</div>
        `;

    html +=`        
        <div class="mBoardHeader center">
        ${messageUi.mBoardHeader}
        </div>
        `;

    html += `<div class="posts" id="messageBoardDivPosts">`;
        for (i = 0; i < posts.length; i++) {        
            if(i%2==0){
                html += `<div class="postDisplay evenPost" id="post${i}"><p>${posts[i].post}</p></div>`
            }else{
                html += `<div class="postDisplay oddPost" id="post${i}"><p>${posts[i].post}</p></div>`
            };
        };
        
    html += `</div>`;

    html +=
        `
        <div class="postInputDiv">
            <textarea id="postInput" class="postInput" name="postInput" placeholder="${messageUi.mBoardPlaceHolder}"></textarea>
            <div class="mboardButton" id="mboardSend" onclick="postSend()">${messageUi.mBoardButtonSend}</div>
        </div>
        `;

    html +=
        `<div class="messageBoardBottom" id="messageBoardBottom">${messageUi.mBoardFooter}</div>`;    
    return html;
    };    
