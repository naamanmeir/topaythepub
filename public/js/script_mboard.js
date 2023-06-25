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
    setTimeout(() => {postsDiv.scrollTop = postsDiv.scrollHeight;}, 1000);
};

function closeMessageBoard(){
    hideWindows();
    return;
};

function mBoardUtilities(){    
    postInput = document.getElementById("postInput");
    postInput.addEventListener("input",resetAutoLogoutMboard);
    imageSelector = document.getElementById("imageSelector");
    imagePreview();
    createProgressBar();
    keyboardFocusMboard();
}

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
    postRequest('./mboard/insertPost', window.parent.displayMessageBoard, postJSON);    
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
        console.log("FNISHSISH")
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
    mBoardUtilities();
    if(document.getElementById("messageBoardDivPosts") != null){
        let postsDiv = document.getElementById("messageBoardDivPosts");
        postsDiv.innerHTML = content;
        postsDiv.scrollTop = postsDiv.scrollHeight;
        setTimeout(() => {postsDiv.scrollTop = postsDiv.scrollHeight;}, 3000);
        return;
    }else{        
        return;
    }
};
