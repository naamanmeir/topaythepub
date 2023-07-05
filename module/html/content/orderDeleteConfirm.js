exports.buildHtml = function (messageClient,messageUi,userInfo,orderInfo) {

    console.log(orderInfo.sign);
    
    let html = ``;
        html +=
            `
            <div id="deleteOrderConfirmWindow">
            <div>
            <p>${messageUi.deleteorderConfirmDate} ${orderInfo.time}<p>
            <p>${messageUi.deleteorderConfirmInfo} ${orderInfo.info}<p>
            <p>${messageUi.deleteorderConfirmSum} ${messageUi.orderConfirmCurrency}${orderInfo.sum}<p>
            <p>${messageUi.deleteorderConfirmAccount} ${userInfo.account}<p>
            <p>${messageUi.deleteorderConfirmClient} ${userInfo.name}<p>
            </div>`


        if(orderInfo.sign==1){
            html += `
            <div id="windowButtons">
            <button id="deleteOrderConfirmButtonNo">${messageUi.deleteorderConfirmAborted}</button>
            <button id="deleteOrderConfirmButtonYes">X</button>
            </div>
            `
        }else if(orderInfo.sign==0){
            html += `
            <div id="windowButtons">
            <button id="deleteOrderConfirmButtonNo">${messageUi.deleteorderConfirmButtonNo}</button>
            <button id="deleteOrderConfirmButtonYes">${messageUi.deleteorderConfirmButtonYes}</button>
            </div>
            `
        };        
        html += `</div>`
    return html;
};
