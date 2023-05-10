exports.buildHtml = function (message) {    
    let html = ``;    
    html +=
        `
        <head>
            <link rel="stylesheet" href="./css/topMenu.css">
       </head>
    
        <div class="topMenuDiv">
            <div id="conIndic" class="connectionIndic conOk"></div>
            <div id="userPageButton" class="userPageHidden"></div>
            <div id="userIndic" class="userIndicInsert"></div>
        </div>       
    `;
    return html;
    };    
