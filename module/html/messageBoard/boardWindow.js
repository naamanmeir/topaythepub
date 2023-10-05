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

    html += `<div class="posts" id="messageBoardDivPosts"></div>`;

    html +=
        `
        <div class="postInputDiv" id="postInputDiv">
            <textarea id="postInput" class="postInput" name="postInput" placeholder="${messageUi.mBoardPlaceHolder}"></textarea>
            <img class="postImgPreview" id="postImgPreview" src="#">            
        </div>
        
        <div id="progBarDiv" class="progBarDiv">
            <div id="progBar" class="progBar"></div>
        </div>

        <div class="postInputTypes">
            <div class="uploadImg">
                <input id="imageSelector" type="file" name="imgUpload" text="" style="display: none;">
                <input type="button" class="mboardButton" value="${messageUi.remoteMessageBoardButtonAddPicture}"
                    onclick="document.getElementById('imageSelector').click();" id="imageAddButton" style="display: block;" />
                <input type="button" class="mboardButton" value="${messageUi.remoteMessageBoardButtonRemovePicture}" onclick="imageCancel()" id="imageRemoveButton" style="display: none;" />
            </div>            
            <div class="mboardButton" id="mboardSend" onclick="postSend()">${messageUi.mBoardButtonSend}</div>
            <div class="mboardButtonError" id="mboardSendError">${messageUi.mBoardButtonSendError}</div>
        </div>

        `;

    html +=
        `<div class="messageBoardBottom" id="messageBoardBottom">${messageUi.mBoardFooter}</div>`;    
    return html;
    };    
