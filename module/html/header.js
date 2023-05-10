exports.buildHtml = function (message) {    
    let html = ``;    
    html +=
        `
        <head>
            <link rel="stylesheet" href="./css/header.css">
        </head>
        <div class="header no-border anim1">
            <p id="headerAnimElement1" class="animElement animColor1">${message.headerAnimElement1}</p>
            <p id="headerText" class="shadow1">${message.headerText}</p>
            <p id="headerAnimElement2" class="animElement animColor2">${message.headerAnimElement2}</p>
        </div>        
    `;
    return html;
    };    
