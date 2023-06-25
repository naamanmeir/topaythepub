exports.buildHtml = function (message) {    
    let html = ``;    
    html +=
        `
        <head>
            <link rel="stylesheet" href="./css/header.css">
        </head>
        <div class="header no-border anim1">
            <p id="headerAnimElement1" class="animElement animColor1">${getRandomElemetn(message)}</p>
            <p id="headerText" class="shadow1">${message.headerText}</p>
            <p id="headerAnimElement2" class="animElement animColor2">${getRandomElemetn(message)}</p>
        </div>        
    `;
    return html;
    };

function getRandomElemetn(message){
    var val = Math.floor( 1 + Math.random() * 10);
    switch (val) {
        case 1:
            return message.headerAnimElement1;
        break;    
        case 2:            
            return message.headerAnimElement2;
        break;
        case 3:
            return message.headerAnimElement3;
        break;
        case 4:
            return message.headerAnimElement4;
        break;
        case 5:
            return message.headerAnimElement5;
        break;
        case 6:
            return message.headerAnimElement6;
        break;
        case 7:
            return message.headerAnimElement7;
        break;
        case 8:
            return message.headerAnimElement8;
        break;
        case 9:
            return message.headerAnimElement9;
        break;
        case 10:
            return message.headerAnimElement10;
        break;
        default:
            return;
        break;
    }
    return;
}