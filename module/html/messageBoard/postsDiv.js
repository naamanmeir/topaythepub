exports.buildHtml = function (messageUi,posts) {  

    let html = ``;
    for (i = 0; i < posts.length; i++) {   
        let postValid = posts[i].post.replace(/</gi,'&#60;').replace(/>/gi,'&#62;');
     
        if(posts[i].user == 75){
            html += `<div class="postDisplay chatbotPost" id="post${posts[i].postid}"><p>${postValid}</p></div>`;
            continue;
        }
        if(posts[i].img != 0){
            let img = JSON.parse(posts[i].img);
            html += `<div class="postDisplay" id="postImg${posts[i].postid}">
            <div class="postDisplayImg"><img src="./img/posts/${img}"></div></div>`
        };        
        if(i%2==0){
            html += `<div class="postDisplay evenPost" id="post${posts[i].postid}"><p>${postValid}</p></div>`
        }else{
            html += `<div class="postDisplay oddPost" id="post${posts[i].postid}"><p>${postValid}</p></div>`
        };
    };    
    return html;
    };    
