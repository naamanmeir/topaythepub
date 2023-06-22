exports.buildHtml = function (messageUi,posts) {    
    let html = ``;
    for (i = 0; i < posts.length; i++) {        
        if(i%2==0){
            html += `<div class="postDisplay evenPost" id="post${i}"><p>${posts[i].post}</p></div>`
        }else{
            html += `<div class="postDisplay oddPost" id="post${i}"><p>${posts[i].post}</p></div>`
        };
    };    
    return html;
    };    
