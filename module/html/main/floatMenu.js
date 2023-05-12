exports.buildHtml = function (message) {    
    let html = ``;    
    html +=
        `
        <div class="floatMenuDiv">
            <a href="javascript:void(0)" class="openAbout" onclick="openAbout()">${message.floatMenuButton}</a>
        </div>      
    `;
    return html;
    };    