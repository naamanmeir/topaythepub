console.log("MESSAGE BOARD SCRIPT INIT");

function callMessageBoard(){
    getRequest("./mboard/openBoard", displayMessageBoard);
    return;
};

function displayMessageBoard(content){
    console.log(content);    
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
};

function closeMessageBoard(){
    // divMessageBoard.innerHTML = null;
    hideWindows();
    return;
};