exports.buildHtml = function (message) {    
    let html = ``;    
    html +=
        `
        <head>
        <link rel="stylesheet" href="./css/footer.css">
    </head>
    <div class="footer">
        <p class="footer">${message.footerText}</p>
    </div>      
    `;
    return html;
    };    
