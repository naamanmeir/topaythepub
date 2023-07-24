exports.buildHtml = function (images) {    
    let html = ``;
    for(let i = 0;i<images.length;i++){        
        html +=`        
        <img src="img/items/${images[i]}" class="imgSelector" id="image-${images[i]}" alt="" width="50px" height="50px" onclick="imgClickSelect('${images[i]}','image-${images[i]}')">
        `;
    }
    return html;
};


