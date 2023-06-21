console.log("MESSAGE BOARD SCRIPT INIT");

let postInput;

function callMessageBoard(){
    getRequest("./mboard/openBoard", displayMessageBoard);
    return;
};

function displayMessageBoard(content){
    console.log("LOADED MESSAGEBOARD WINDOW");
    divMessageBoard.innerHTML = null;
    divMessageBoard.innerHTML = content;
    divMessageBoard.classList.remove("hidden");
    var seconds = windowFadeTime/1000;
    divMessageBoard.style.transition = "opacity "+seconds+"s ease";
    divMessageBoard.style.opacity = 1;
    divMessageBoard.classList.add("windowConstant");
    divMessageBoard.classList.add("messageBoardWindow");
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
};

function closeMessageBoard(){
    // divMessageBoard.innerHTML = null;
    hideWindows();
    return;
};

function mBoardUtilities(){
    console.log("MBOARD UTILITIES");
    postInput = document.getElementById("postInput");
    keyboardFocusMboard();
}

function keyboardFocusMboard(){
    console.log("MBOARD FOCUS");
    window.onkeydown = function () { postInput.focus(); };
    return;
};

function postSend(){
    let post = postInput.value;
    console.log(post);
    let postJSON = JSON.stringify({"post": post});
    postRequest('./mboard/insertPost', window.parent.displayMessageBoard, postJSON);
    return;    
};

function messageBoardRefreshPosts(){
    if(document.getElementById("messageBoardDivPosts") != null){
        getRequest("./mboard/refreshPosts", displayPostsInDiv);
        return;
    }else{
        console.log("POSTS DIV DOWS NOT EXIST");
        return;
    }
};

function displayPostsInDiv(content){
    content = JSON.parse(content);
    console.log(content);    
    if(document.getElementById("messageBoardDivPosts") != null){
        let postsDiv = document.getElementById("messageBoardDivPosts");
        postsDiv.innerHTML = content;
        return;
    }else{
        console.log("POSTS DIV DOWS NOT EXIST");
        return;
    }
};
