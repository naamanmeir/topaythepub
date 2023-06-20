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
    let closeButton = document.getElementById("messageBoardCloseButton");
    closeButton.addEventListener('click',() =>{
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
    postInput = document.getElementById("postInput");
    keyboardFocusMboard();
}

function keyboardFocusMboard(){
    window.onkeydown = function () { postInput.focus(); };
    return;
};

function postSend(){
    let post = postInput.value;
    console.log(post);
    let postJSON = JSON.stringify({"post": post});

    postRequest('./mboard/insertPost', window.parent.displayMessageBoard, postJSON);        
    
};
