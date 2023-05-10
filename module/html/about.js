exports.buildHtml = function (message) {    
    let html = ``;    
    html +=
        `
        <div onclick="closeAbout()">
        <p>${message.appName} - ${message.appVersion}</p>
        <p>${message.aboutLine1}</p>
        <p>${message.aboutLine2}</p>
        <p>${message.aboutLine3}</p>
        <p>${message.aboutLine4}</p>
        <p>${message.aboutLine5}</p>
        <br>
        <a href="${message.aboutLink1}" target="_blank">
            <p style="margin: 0 50% 0 50%">${message.aboutLink1Text}</p>
        </a>
    </div>        
    `;
    return html;
    };    
