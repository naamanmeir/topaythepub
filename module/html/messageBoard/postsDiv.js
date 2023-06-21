exports.buildHtml = function (messageUi,posts) {    
    let html = ``;
    for (i = 0; i < posts.length; i++) {        
        if(i%2==0){
            html += `<div class="postDisplay even" id="post${i}">${posts[i].post}</div>`
        }else{
            html += `<div class="postDisplay odd" id="post${i}">${posts[i].post}</div>`
        };
    };    
    return html;
    };    
