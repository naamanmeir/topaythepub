exports.buildHtml = function (message) {    
    let html = ``;    
    html +=
        `
        <div class="floatMenuDiv">
            <p id="openMessageBoard" class="openMessageBoard" onclick="callMessageBoard()">${message.floatMenuButton}</p>
        </div>      
    `;
    return html;
    };    