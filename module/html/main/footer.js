exports.buildHtml = function (message) {    
    let html = ``;    
    html +=
        `
    <div class="footer">
        <p class="footer">${message.footerText}</p>
    </div>      
    `;
    return html;
    };    
