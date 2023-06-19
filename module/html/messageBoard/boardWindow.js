exports.buildHtml = function (message) {    
    let html = ``;    
    html +=
        `
        <div>
        <p>${message.appName} - ${message.appVersion}</p>
        <p>${message.aboutLine1}</p>
        <p>${message.aboutLine2}</p>
        <p>${message.aboutLine3}</p>
        <p>${message.aboutLine4}</p>
        <p>${message.aboutLine5}</p>
        <p>${message.aboutLine6}</p>
        <p>${message.aboutLine7}</p>
        </a>
    </div>        
    `;
    return html;
    };    
