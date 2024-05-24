const fs = require('fs');
const path = require('node:path');

exports.buildHtml = function (messageUi,posts) {  

    let html = ``;
    for (i = 0; i < posts.length; i++) {   
        let postValid = posts[i].post.replace(/</gi,'&#60;').replace(/>/gi,'&#62;');
     
        if(posts[i].user == 75){  // IF POST FROM CHATBOT
            html += `<div class="postDisplay chatbotPost" id="post${posts[i].postid}"><p>${postValid}</p></div>`;
            continue;
        }
        if(posts[i].user == 76){} // IF POST FROM PHOTOBOT
        if(posts[i].user == 77 && posts[i].img != null && posts[i].img != '' && posts[i].img != '0'){
            let img;
            try {
                img = JSON.parse(posts[i].img);
            } catch (e) {
                console.log("error on image loading");
            }; 
            html += `<div class="postDisplay systemPost" id="postImg${posts[i].postid}">
            <div class="postDisplayImg"><img src="img/qRcode/${img}"></div></div>`
        };
        if(posts[i].user == 77 && posts[i].post != null && posts[i].post != ''){
            html += `<div class="postDisplay systemPost" id="post${posts[i].postid}"><p>${postValid}</p></div>`;            
        };
        if(posts[i].user == 77){continue;};// IF POST FROM SYSTEM
        
        let pinClass = '';
        if(posts[i].pin == 1){
            pinClass = 'postPind';
        }
        if(posts[i].img != 0){
            let img;
            img = JSON.parse(posts[i].img);
            if((fs.existsSync(path.resolve(`public/img/posts/${img}`)))){
                html += `<div class="postDisplay" id="postImg${posts[i].postid}">
                <div class="postDisplayImg"><img src="img/posts/${img}"></div></div>`
            };
        };
        if(posts[i].post==''){continue;};
        if(i%2==0){
            html += `<div class="postDisplay evenPost ${pinClass}" id="post${posts[i].postid}"><p>${postValid}</p></div>`
        }else{
            html += `<div class="postDisplay oddPost ${pinClass}" id="post${posts[i].postid}"><p>${postValid}</p></div>`
        };
    };    
    return html;
    };    
