const PostLengthMax = 400;

let postInput;
let postsDiv;
let imageSelector;
let progBarDiv;
let progBar;

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
    // postsDiv.addEventListener('touch', (e) => {postContextMenu(e)});
    postsDiv.addEventListener('mousedown', (e) => {postContextMenu(e)});
    postInput.maxLength = PostLengthMax;
    postInput.addEventListener("keydown",postLenghthCheck);
    postInput.addEventListener("change",postLenghthCheck);
    postInput.addEventListener("paste",postLenghthCheck);
};

function postContextMenu(e){
    let target;
    let postid;
    let menu;

    if(document.getElementById("contextMenu")){
        document.getElementById("contextMenu").remove();
    };       
    
    postsDiv.addEventListener('mouseup',()=>{        
        clearTimeout(pressTimer);
        return;
    });

    let pressTimer = setTimeout(function(){
        if(e.target.parentNode.id.startsWith("post")){
            target = e.target.parentNode.id;
            if(e.target.parentNode.id.substring(4).startsWith("Img")){
                console.log("image: "+e.target.parentNode.id.substring(7));
                postid = e.target.parentNode.id.substring(7);
            }else{
                console.log("text: "+e.target.parentNode.id.substring(4));
                postid = e.target.parentNode.id.substring(4);
            }
            target = document.getElementById(target);
            if(!document.getElementById("contextMenu")){
                menu = document.createElement("div");
                menu.setAttribute('id','contextMenu');
                menu.setAttribute('class','contextMenu');            
                menu.innerHTML = 
                `
                <img src="img/ui/cmenu_copy.png" id="cmenu_copy">
                <img src="img/ui/cmenu_erase.png" id="cmenu_erase">                
                `
                target.appendChild(menu);
                let cmenu_erase = document.getElementById("cmenu_erase");
                cmenu_erase.addEventListener('mousedown',postDelete(postid));
                cmenu_copy.addEventListener('mousedown',postCopy(postid));
            }else{            
                document.getElementById("contextMenu").remove();
            }            
        };
    },1000);
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

function resetAutoLogoutMboard(){    
    resetAutoLogout();
};

function postDelete(postid){    
    postid = JSON.stringify({'postid':postid});
    postRequest('./mboard/deletePost', window.parent.messageBoardRefreshPosts, postid);
    return;
};

function postCopy(postid){
    console.log("COPY POST");
}

function postSend(){    
    if (postInput.value == ""){return;};
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
    return;    
};

function postSendImage(){
    if (postInput.value == ""){return;};    
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
        postsDiv.scrollTop = postsDiv.scrollHeight;
        setTimeout(() => {postsDiv.scrollTop = postsDiv.scrollHeight;postsDiv.style = "scroll-behavior: auto";}, 500);
        return;
    }else{        
        return;
    }
};
