exports.buildHtml = function (message) {    
    let html = ``;    
    html +=
        `    
        <div class="topMenuDiv">
            <div id="conIndic" class="connectionIndic conOk"></div>
            <div id="userPageButton" class="userPageHidden"></div>
            <div id="userIndic" class="userIndicInsert"></div>
            <div class="display" id="display">
                <div class="displayMessage" id="displayMessage"></div>
            </div>
        </div>
    `;
    return html;
    };    
