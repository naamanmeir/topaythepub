const PostLengthMax = 400;
const pressTimerTime = 400;
const pressTimerDelete = 1000;
const pressTimerPost = 400;
const pressTimerPin = 400;

let postInput;
let postsDiv;
let imageSelector;
let progBarDiv;
let progBar;

let chatbotIsTyping;
let photobotIsPainting;

function callMessageBoard(){
    getRequest("./mboard/openBoard", displayMessageBoard);
    return;
};

function displayMessageBoard(content){    
    divMessageBoard.innerHTML = null;
    divMessageBoard.innerHTML = content;
    openWindows(divMessageBoard);
    let closeButtonLeft = document.getElementById("messageBoardCloseButtonLeft");
    closeButtonLeft.addEventListener('click',() =>{
        divMessageBoard.innerHTML = null;
        closeMessageBoard();
    });
    let closeButtonRight = document.getElementById("messageBoardCloseButtonRight");
    closeButtonRight.addEventListener('click',() =>{
        divMessageBoard.innerHTML = null;
        closeMessageBoard();
    });
    mBoardUtilities();
    postsDiv = document.getElementById("messageBoardDivPosts");
    postsDiv.addEventListener("scroll",resetAutoLogoutMboard);
    postsDiv.scrollTop = postsDiv.scrollHeight;
    setTimeout(() => {
        postsDiv.scrollTop = postsDiv.scrollHeight;
        postsDiv.style = "scroll-behavior: auto";
    }, 500);
};

function closeMessageBoard(){
    hideWindows();
    return;
};

function mBoardUtilities(){
    postInput = document.getElementById("postInput");    
    postInput.addEventListener("input",resetAutoLogoutMboard);
    imageSelector = document.getElementById("imageSelector");
    postsDiv = document.getElementById("messageBoardDivPosts");
    messageBoardRefreshPosts();
    imagePreview();
    createProgressBar();
    keyboardFocusMboard();
    preventAutoCloseOnTyping();
    postsDiv.addEventListener('touchstart', (e) => {postContextMenu(e)});
    postsDiv.addEventListener('mousedown', (e) => {postContextMenu(e)});
    postInput.maxLength = PostLengthMax;
    postInput.addEventListener("keydown",postLenghthCheck);
    postInput.addEventListener("change",postLenghthCheck);
    postInput.addEventListener("paste",postLenghthCheck);
    window.addEventListener('popstate', function() {
        divMessageBoard.innerHTML = null;
        closeMessageBoard();
      });
};

function postContextMenu(e){
    let target;
    let postid;
    let postdiv;
    let imgSrc;
    let menu;

    if(document.getElementById("contextMenu") && e.target.parentNode.id != "contextMenu"){
        document.getElementById("contextMenu").remove();
    };

    postsDiv.addEventListener('touchend',()=>{        
        clearTimeout(pressTimer);
        return;
    });
    
    postsDiv.addEventListener('mouseup',()=>{        
        clearTimeout(pressTimer);
        return;
    });

    let pressTimer = setTimeout(function(){
        let mode = 1;
        if(e.target.parentNode.id.startsWith("post")){
            target = e.target.parentNode.id;            
            if(e.target.parentNode.id.substring(4).startsWith("Img")){
                postid = e.target.parentNode.id.substring(7);
                imgSrc = e.target.parentNode.getElementsByTagName('img')[0].src;                
                mode = 2;
            }else{                
                postid = e.target.parentNode.id.substring(4);
                postdiv = e.target.parentNode.id;
            }
            target = document.getElementById(target);
            if(!document.getElementById("contextMenu")){
                menu = document.createElement("div");
                menu.setAttribute('id','contextMenu');
                menu.setAttribute('class','contextMenu');
                menu.innerHTML = ''
                if(mode!=2){
                    menu.innerHTML += `<div class="cmenuItems" id="cmenuPin"></div>`;
                    menu.innerHTML += `<div class="cmenuItems" id="cmenuCopy"></div>`;
                };
                if(mode==2){
                    menu.innerHTML += `<div class="cmenuItems" id="cmenuImgFull"></div>`;
                };
                menu.innerHTML += `<div class="cmenuItems" id="cmenuErase"></div>`;                
                target.appendChild(menu);
                let cmenuErase = document.getElementById("cmenuErase");
                if(mode!=2){
                    let cmenuCopy = document.getElementById("cmenuCopy");
                    let cmenuPin = document.getElementById("cmenuPin");
                };
                if(mode==2){
                    let cmenuImgFull = document.getElementById("cmenuImgFull");
                }
                cmenuErase.style.backgroundImage="url(./img/ui/cmenu_erase.png)";
                if(mode!=2){                
                    cmenuCopy.style.backgroundImage="url(./img/ui/cmenu_copy.png)";
                    cmenuPin.style.backgroundImage="url(./img/ui/cmenu_pin.png)";
                };
                if(mode==2){
                    cmenuImgFull.style.backgroundImage="url(./img/ui/cmenu_resize.png)";
                };
                cmenuErase.addEventListener('touchstart',()=>{
                    postDelete(postid)
                });
                cmenuErase.addEventListener('mousedown',()=>{
                    postDelete(postid)
                });
                if(mode!=2){
                    cmenuCopy.addEventListener('touchstart',()=>{
                        postCopy(postdiv)
                    });
                    cmenuPin.addEventListener('touchstart',()=>{
                        postPin(postid)
                    });
                    cmenuCopy.addEventListener('mousedown',()=>{
                        postCopy(postdiv)
                    });
                    cmenuPin.addEventListener('mousedown',()=>{
                        postPin(postid)
                    });
                };
                if(mode==2){
                    cmenuImgFull.addEventListener('touchstart',()=>{
                        postImgFull(imgSrc)
                    });
                    cmenuImgFull.addEventListener('mousedown',()=>{
                        postImgFull(imgSrc)
                    });
                }
                document.getElementById("contextMenu").scrollIntoView(
                    { behavior: "smooth", block: "start", inline: "center" }
                );
            }else{
                document.getElementById("contextMenu").remove();
            };
        };
    },pressTimerTime);
};

function postLenghthCheck(){
    if(postInput.value.length >= (PostLengthMax)){
        document.getElementById("mboardSend").style.display="none";
        document.getElementById("mboardSendError").style.display="block";
    }else{
        document.getElementById("mboardSend").style.display="block";
        document.getElementById("mboardSendError").style.display="none";
    }
};

function keyboardFocusMboard(){
    if(document.getElementById("postInput") != null){
    window.onkeydown = function () { postInput.focus(); };
    postInput.addEventListener("keypress", function(event) {        
        if (event.key === "Enter") {            
            event.preventDefault();
            document.getElementById("mboardSend").click();
        }
    });
    }
        return;
};

function preventAutoCloseOnTyping(){
    postInput.addEventListener("keypress", function(event) {        
        window.parent.resetAutoLogout();
    });
}

function resetAutoLogoutMboard(){    
    resetAutoLogout();
};

function postDelete(postid){   
    
    let panel = document.getElementById("contextMenu");
    let preColor = panel.style.backgroundColor;
    panel.style.transition =  "all 3s";
    panel.style.backgroundColor = "red";

    postsDiv.addEventListener('mouseup',()=>{        
        clearTimeout(pressTimer);
        panel.style.backgroundColor = preColor;
        return;
    });

    postsDiv.addEventListener('touchend',()=>{        
        clearTimeout(pressTimer);
        panel.style.backgroundColor = preColor;
        return;
    });
    
    let pressTimer = setTimeout(function(){
        postid = JSON.stringify({'postid':postid});
        postRequest('./mboard/deletePost', window.parent.messageBoardRefreshPostsNoScroll, postid);
        return;
    },pressTimerDelete);
};

function postCopy(postdiv){
    let panel = document.getElementById("contextMenu");
    let preColor = panel.style.backgroundColor;
    panel.style.transition =  "all 0.4s";
    panel.style.backgroundColor = "green";

    postsDiv.addEventListener('mouseup',()=>{        
        clearTimeout(pressTimer);
        panel.style.backgroundColor = preColor;
        return;
    });

    postsDiv.addEventListener('touchend',()=>{        
        clearTimeout(pressTimer);
        panel.style.backgroundColor = preColor;
        return;
    });
    
    let pressTimer = setTimeout(function(){        
        let contentDiv = document.getElementById(postdiv);
        let content = contentDiv.getElementsByTagName("p")[0].innerHTML;
        let tempInput = document.createElement("input");
        tempInput.id = 'tempInput';
        tempInput.style.height = 0;
        document.body.appendChild(tempInput);
        tempInput.value = content;
        tempInput.select();        
        navigator.clipboard.writeText(tempInput.value);
        document.body.removeChild(tempInput);
        document.getElementById("contextMenu").remove();
        return;
    },pressTimerPost);
};

function postPin(postid){
    let panel = document.getElementById("contextMenu");
    let preColor = panel.style.backgroundColor;
    panel.style.transition =  "all 0.2s";
    panel.style.backgroundColor = "yellow";

    postsDiv.addEventListener('mouseup',()=>{        
        clearTimeout(pressTimer);
        panel.style.backgroundColor = preColor;
        return;
    });

    postsDiv.addEventListener('touchend',()=>{        
        clearTimeout(pressTimer);
        panel.style.backgroundColor = preColor;
        return;
    });
    
    let pressTimer = setTimeout(function(){        
        postid = JSON.stringify({'postid':postid});        
        postRequest('./mboard/pinPost', window.parent.afterPostPind, postid);
        return;
    },pressTimerPin);
};

function afterPostPind(content){
    window.parent.requestDisplayInfoRefresh(1);
    messageBoardRefreshPostsNoScroll();
};

function postImgFull(imgSrc){
    let panel = document.getElementById("contextMenu");
    let preColor = panel.style.backgroundColor;
    panel.style.transition =  "all 0.2s";
    panel.style.backgroundColor = "blue";

    postsDiv.addEventListener('mouseup',()=>{        
        clearTimeout(pressTimer);
        panel.style.backgroundColor = preColor;
        return;
    });

    postsDiv.addEventListener('touchend',()=>{        
        clearTimeout(pressTimer);
        panel.style.backgroundColor = preColor;
        return;
    });
    
    let pressTimer = setTimeout(function(){
        // let imageWindow = document.createElement('div');
        // let image = document.createElement('img');
        // image.src = imgSrc;
        imgSrc = imgSrc.replace('/img','');
        panel.remove();
        window.open(imgSrc,'Image','width=image.style.width,height=image.style.height,resizable=1');
        return;
    },pressTimerPin);
};

function postSend(){
    if (postInput.value == "" && imageSelector.files[0]==null){return;};
    let img;
    let post = postInput.value;
    if(imageSelector.files[0]!=null){        
        img = imageSelector.files[0].name;
        postSendImage();
        return;
    }
    let postJSON = JSON.stringify({
        'post': post,
        'img': img
    });    
    postInput.value = "";
    imageSelector.value = "";
    imageCancel();
    imagePreview();
    postRequest('./mboard/insertPost', window.parent.messageBoardRefreshPosts, postJSON);
    scrollPosts();
    return;    
};

function postSendImage(){
    if (postInput.value == "" && imageSelector.files[0]==null){return;};
    let post = postInput.value;
    const formData = new FormData();    
    formData.append("img",imageSelector.files[0]);
    formData.append("post",post);
    var req = new XMLHttpRequest();       
    req.upload.addEventListener("progress", updateProgress);
    req.open("POST", "./mboard/insertImage");
    req.send(formData);
    postInput.value = "";
    imageSelector.value = "";
    imageCancel();
    imagePreview();
    return;
};

function resetProgressBar(){
    progBar.style.width = "0px";
};

function updateProgress(e){
    progBar.style.width = (((e.loaded/e.total)*100))+ "%";
    if((e.loaded/e.total)==1){        
        setTimeout(resetProgressBar,2000);
    };
};

function createProgressBar(){
    progBarDiv = document.getElementById("progBarDiv");
    progBar = document.getElementById("progBar");
    progBarDiv.className = "progressBarDiv";
    progBar.className = "progressBar";
};

function imagePreview(){
    var postImg = document.getElementById('postImgPreview');
    var imageAddButton = document.getElementById('imageAddButton');
    var imageRemoveButton = document.getElementById('imageRemoveButton');
    postImg.style.display = "none";
    imageSelector.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            imageAddButton.style.display = "block";
            imageRemoveButton.style.display = "none";
            postImg.onload = () => {
                URL.revokeObjectURL(postImg.src);
                imageAddButton.style.display = "none";
                imageRemoveButton.style.display = "block";
            }
            postImg.src = URL.createObjectURL(this.files[0]);
            postImg.style.display = "block";            
        }
    });
};

function imageCancel(){
    var postImg = document.getElementById('postImgPreview');
    postImg.style.display = "none";
    imageSelector.value = "";
    imageAddButton.style.display = "block";
    imageRemoveButton.style.display = "none";
};

function messageBoardRefreshPosts(){
    if(document.getElementById("messageBoardDivPosts") != null){
        getRequest("./mboard/reloadPosts", displayPostsInDiv);
        scrollPosts();
        return;
    }else{        
        return;
    }
};

function messageBoardRefreshPostsNoScroll(){
    if(document.getElementById("messageBoardDivPosts") != null){
        getRequest("./mboard/reloadPosts", displayPostsInDivNoScroll);        
        return;
    }else{        
        return;
    }
};

function displayPostsInDiv(content){
    content = JSON.parse(content);
    if(document.getElementById("messageBoardDivPosts") != null){
        postsDiv = document.getElementById("messageBoardDivPosts");
        postsDiv.innerHTML = content;
        scrollPosts();
        window.parent.requestDisplayInfoRefresh(1);    
        return;
    }else{
        return;
    }
};

function displayPostsInDivNoScroll(content){
    content = JSON.parse(content);
    if(document.getElementById("messageBoardDivPosts") != null){
        postsDiv = document.getElementById("messageBoardDivPosts");
        postsDiv.innerHTML = content;        
        window.parent.requestDisplayInfoRefresh(1);    
        return;
    }else{
        return;
    }
};

function scrollPosts(){
    postsDiv.scrollHeight;postsDiv.style = "scroll-behavior: smooth";
    postsDiv.scrollTop = postsDiv.scrollHeight;
    setTimeout(() => {postsDiv.scrollTop = postsDiv.scrollHeight;postsDiv.style = "scroll-behavior: auto";}, 500);
};

function otherSideIsTyping(act){

    if(chatbotIsTyping == 1){return;};
    if(photobotIsPainting == 1){return;};

    let placeholder = "";
    let placeholderDefault = messageUi.mBoardPlaceHolder;    
    let inputElement = document.getElementById("postInput");

    if(act==1){
        
        chatbotIsTyping = 1;
        let i = 0;
        const txt = messageUi.otherSideIsTypingMessage;
        let speed = Math.random() * (500 - 90) + 90;    

        function type(){        
            if(chatbotIsTyping==0){return;};
            placeholder = txt.substring(0,i+1);
            if(inputElement != null){
                inputElement.setAttribute("placeholder",placeholder);
            };            
            i++;
            speed = Math.random() * (500 - 90) + 90;
            if(i>=txt.length){
                placeholder = "";
                i=11;
            };
            setTimeout(type,speed);            
            };
            setTimeout(() => {
                type()
            },1500);
    };
    if(act==2){
        
        photobotIsPainting = 1;
        let i = 0;
        const txt = messageUi.photobotIsPainting;
        let speed = Math.random() * (500 - 90) + 90;        

        function type(){        
            if(photobotIsPainting==0){return;};
            placeholder = txt.substring(0,i+1);
            if(inputElement != null){
                inputElement.setAttribute("placeholder",placeholder);
            };
            i++;
            speed = Math.random() * (500 - 90) + 90;
            if(i>=txt.length){
                let rndStart = Math.random() * 12;
                placeholder = "";
                i=rndStart;
            };
            setTimeout(type,speed);            
            };
            setTimeout(() => {
                type()
            },1500);
    };
    if(act==3){
        
        photobotIsPainting = 1;
        let i = 0;
        const txt = messageUi.photobotIsPaintingPainting;
        let speed = Math.random() * (500 - 90) + 90;        

        function type(){        
            if(photobotIsPainting==0){return;};
            placeholder = txt.substring(0,i+1);
            if(inputElement != null){
                inputElement.setAttribute("placeholder",placeholder);
            };
            i++;
            speed = Math.random() * (500 - 90) + 90;
            if(i>=txt.length){
                let rndStart = Math.random() * 12;
                placeholder = "";
                i=rndStart;
            };
            setTimeout(type,speed);            
            };
            setTimeout(() => {
                type()
            },1500);
    };
    if(act==0){
        if(inputElement != null){
            inputElement.setAttribute("placeholder",placeholderDefault);
        }
        return;
    };
    return;
};

function otherSideIsNotTyping(){
    chatbotIsTyping = 0;
    photobotIsPainting = 0;    
};

function photobotIsNotPainting(){
    chatbotIsTyping = 0;    
};