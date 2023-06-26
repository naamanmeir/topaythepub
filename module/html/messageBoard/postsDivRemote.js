exports.buildHtml = function (messageUi,posts) {  

    let html = ``;
    for (i = 0; i < posts.length; i++) {
        if(posts[i].user == 75){
            html += `<div class="postDisplay chatbotPost" id="post${i}"><p>${posts[i].post}</p></div>`;
            continue;
        }
        if(posts[i].img != 0){
            let img = JSON.parse(posts[i].img);
            html += `<div class="postDisplay postDisplayImg" id="postImg${i}"><img src="../img/posts/${img}"></div>`
        };
        if(i%2==0){
            html += `<div class="postDisplay evenPost" id="post${i}"><p>${posts[i].post}</p></div>`
        }else{
            html += `<div class="postDisplay oddPost" id="post${i}"><p>${posts[i].post}</p></div>`
        };
    };    
    return html;
    };    
