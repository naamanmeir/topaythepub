exports.buildHtml = function(message) {
    let html = ``;
    html +=
        `
        <div class="sideMenuDiv">
            <p id="closeSideMenu" class="closeSideMenu">${message.SideMenuCloseSideMenu}</p>
            <p id="openAbout" onclick="populateAbout()">${message.sideMenuOpenAbout}</p>
            <p id="fullScreenButton" onclick="fullScreenOn()">${message.sideMenuFullScreen}</p>
            <p onclick="refreshCss()">${message.sideMenuRefreshCss}</p>
            <p onclick="refreshPage()">${message.SideMenuRefreshPage}</p>
            <p onclick="gotoManagePage()">${message.SideMenuGotoManage}</p>
            <p onclick="clientLogout()">${message.SideMenuLogOutClient}</p>
        </div>      
    `;
    return html;
};