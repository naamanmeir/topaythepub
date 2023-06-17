exports.buildHtml = function (message) {    
    let html = ``;    
    html +=
        `
        <head>
          <link rel="stylesheet" href="./css/sidemenu.css">
        </head>
        <div class="sideMenuDiv">
            <p id="openAbout" onclick="populateAbout()">${message.sideMenuOpenAbout}</p>
            <p id="fullScreenButton">${message.sideMenuFullScreen}</p>
            <p onclick="refreshCss()">${message.sideMenuRefreshCss}</p>
            <p onclick="refreshPage()">${message.SideMenuRefreshPage}</p>
            <p onclick="clientLogout()">${message.SideMenuLogOutClient}</p>
            <p id="closeSideMenu" class="closeSideMenu">${message.SideMenuCloseSideMenu}</p>
        </div>      
    `;
    return html;
    };    