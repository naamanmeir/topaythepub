exports.buildHtml = function (messageUi,posts) {    
    let html = ``;    
    html +=
        `        
        <div class="closeButton left" id="messageBoardCloseButtonLeft">X</div>
        `;
    html +=
        `        
        <div class="closeButton right" id="messageBoardCloseButtonRight">X</div>
        `;
    html +=`        
        <div class="windowTop center">
        message board
        </div>
        `;
    html +=
        `
        <div>
            <textarea id="postInput" class="postInput" name="postInput"></textarea>            
        </div>
        <div>
            <input class="mboardButton" id="mboardSend" type="button" onclick="postSend()" value="שלח" />
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
        <div class="messageBoardBottom" id="messageBoardBottom">למטה של הזה</div>`;    
    return html;
    };    
