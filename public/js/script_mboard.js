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
    let postsDiv = document.getElementById("messageBoardDivPosts");
    postsDiv.scrollTop = postsDiv.scrollHeight;
};

function closeMessageBoard(){
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
    if(document.getElementById("postInput") != null){
    window.onkeydown = function () { postInput.focus(); };
    postInput.addEventListener("keypress", function(event) {        
        if (event.key === "Enter") {
            console.log("TESTING ENTER");
            event.preventDefault();
            document.getElementById("mboardSend").click();
        }
    });
}
    return;
};

function postSend(){
    if (postInput.value == ""){return;};
    let post = postInput.value;
    postInput.value = "";
    let postJSON = JSON.stringify({"post": post});
    postRequest('./mboard/insertPost', window.parent.displayMessageBoard, postJSON);
    return;    
};

function messageBoardRefreshPosts(){
    if(document.getElementById("messageBoardDivPosts") != null){
        getRequest("./mboard/refreshPosts", displayPostsInDiv);
        return;
    }else{
        console.log("POSTS DIV DOES NOT EXIST");
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
        return;
    }else{
        console.log("POSTS DIV DOWS NOT EXIST");
        return;
    }
};
