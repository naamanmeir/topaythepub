
function canvasTest(){
    // console.log("canvas function")
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(100, 50, 75, 45, 2*Math.PI);    
    ctx.fillStyle = "green";
    ctx.fill();
}
canvasTest();
