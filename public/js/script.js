// ===== Scroll to Top ==== 
$(window).scroll(function() {
    if ($(this).scrollTop() >= 50) {
        $('#return-to-top').fadeIn(400);
    } else {
        $('#return-to-top').fadeOut(400);
    }
});
$('#return-to-top').click(function() {
    $('body,html').animate({
        scrollTop : 0
    }, 500);
});

// FUNCTIONS TO RUN SERVER ACTIONS
async function placeOrder(id,d1,d2,d3,d4){
    var textbox = document.getElementById("menu");
    var name = "";
    $.get('./order/'+id+d1+d2+d3+d4, async function (response) {
        //place order at server
    }).then( function (response) {
        document.getElementById('searchBox').value = "";
        searchBox();        
    }).catch(function (error){
        console.log(error);
    })
};

var item1,item2,item3,item4;

function add(item){    
    const count1 = document.getElementById("count1");
    const count2 = document.getElementById("count2");
    const count3 = document.getElementById("count3");
    const count4 = document.getElementById("count4");
    const orderDiv = document.getElementById("order");
    if(item==1){
        if(item1==null){
            item1 = 1;
            count1.innerText = item1;
        }else{
            item1 = item1+1;
            count1.innerText = item1;
        }        
    }
    if(item==2){
        if(item2==null){
            item2 = 1;
            count2.innerText = item2;
        }else{
            item2 = item2+1;
            count2.innerText = item2;
        }
    }
    if(item==3){
        if(item3==null){
            item3 = 1;
            count3.innerText = item3;
        }else{
            item3 = item3+1;
            count3.innerText = item3;
        }
    }
    if(item==4){
        if(item4==null){
            item4 = 1;
            count4.innerText = item4;
        }else{
            item4 = item4+1;
            count4.innerText = item4;
        }
    }
    if(item==101){
        item1 = 0;
        item2 = 0;
        item3 = 0;
        item4 = 0;
        count1.innerText = "";
        count2.innerText = "";
        count3.innerText = "";
        count4.innerText = "";
    }
    if(item==100){
        var answer = window.confirm("שלום שם מומצא האם אתה בטוח שתה רוצה לרכוש את הבירות הללו בכרטיס תושב ש'ך?");
        if (answer) {
            add(101);
        }
        else {
            add(101);
        }

    }
}


function searchBox(){
    // var autoClose;
    // clearTimeout(autoClose);
    var input, filter, divContainer, divList, p2, i, txtValue;
    var ifEmpty = 0;
    input = document.getElementById('searchBox');
    filter = input.value.toUpperCase();
    divContainer = document.getElementById("grid-container");
    divList = document.getElementsByClassName("grid-item");
    for (i = 1; i < divList.length; i++) {
        p2 = divList[i].getElementsByClassName("p2")[0];
        txtValue = p2.textContent || p2.innerText;        
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            divList[i].style.display = "";
            ifEmpty = ifEmpty-1;
          } else {
            divList[i].style.display = "none";
            ifEmpty = ifEmpty+1;            
          }
        if (ifEmpty == divList.length-1){            
            var emptyBox = document.getElementById("emptySearch");
            emptyBox.innerHTML = ("לא נמצאו תוצאות");
            emptyBox.innerText = ("לא נמצאו תוצאות");
          } else {
            var emptyBox = document.getElementById("emptySearch");
            emptyBox.innerHTML = ("");
          }
        // clearTimeout(autoClose);
    };

    input.addEventListener("search", function(event){
        searchBox();
    })

    // autoClose = setTimeout(function(){
    //     input.value = "";
    //     console.log("AUTO CLOSE");
    //     searchBox();
    // },15000);
};