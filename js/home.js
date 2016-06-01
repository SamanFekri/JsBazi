var homedir = "http://ie.ce-it.ir/hw3/xml/home.xml";
var resultOfHomeAjax;
var DOMOfHomeXml;
var state;
var menuState;
var games_item;
var game_list;
window.onload = function (){
    var tmp;
    synchronousAjax(homedir,analyze);
    state = "home";
    menuState = 0; // 0 is close 1 is open

    var pwd = document.getElementById("pwd");
    var pwdColor = DOMOfHomeXml.getElementsByTagName("pwd")[0];
    console.log(pwdColor.childNodes[0].nodeValue);
    pwd.style.color = pwdColor.childNodes[0].nodeValue;

    tmp = document.getElementsByTagName("header");
    var header = tmp[0];
    var headerColor = DOMOfHomeXml.getElementsByTagName("background")[0];
    console.log("header : " +header + " => " + headerColor.childNodes[0].nodeValue);
    header.style.backgroundColor = headerColor.childNodes[0].nodeValue;

    var gameicon = DOMOfHomeXml.getElementsByTagName("gameicon")[0];
    var gamesAttr = gameicon.getElementsByTagName("game")[0];
    var hgame = document.getElementById("games");
    var hgame_lis = hgame.getElementsByTagName("li");

    games_item = DOMOfHomeXml.getElementsByTagName("games")[0];
    game_list = games_item.getElementsByTagName("game");
    console.log("list of games");
    console.log(game_list);

    // adding list of games to gameicon header
    for (var i = 0; i < game_list.length; i++){
        if ("true".localeCompare(game_list[i].getAttribute('active')) == 0) {
            hgame.innerHTML += "<li>" + game_list[i].getElementsByTagName('name')[0].childNodes[0].nodeValue + "</li>";
        }
    }
    //console.log(hgame.innerHTML);

    //hgame_lis[0].style.color = gameicon.getAttribute('color');
    // set color and hover in menu
    setItemColor(hgame_lis[0],gameicon.getAttribute('color'));
    setOnhoverColor(hgame_lis[0],gameicon.getAttribute('hover'));
    for (var i = 0; i < hgame_lis.length; i++){
        if(i > 0){
            setItemColor(hgame_lis[i],gamesAttr.getAttribute('color'));
            setOnhoverColor(hgame_lis[i],gamesAttr.getAttribute('hover'));
            // list of li click
            setGameOnClick(hgame_lis[i],hgame_lis[i].innerHTML);
        }
    }
    //set gameicon click
    hgame_lis[0].onclick = changeMenu;

    //initial
    var home_icon = document.getElementById('home-icon');
    setGameOnClick(home_icon,'home');
    makeHome();

}


function makeHome(){
    document.getElementById('home-icon').style.display="none";
    var main_container = document.getElementById("main-container");
    var max = 0;
    var maxOnlineIndex = 0;
    main_container.innerHTML = "";
    for (var i=0; i < game_list.length; i++){
        main_container.innerHTML += '<div class="game-block" ' +
            'id="'+ game_list[i].getElementsByTagName('name')[0].childNodes[0].nodeValue+'-block" ' +
            'data-onlines="'+game_list[i].getElementsByTagName('onlines')[0].childNodes[0].nodeValue+'">' +
            '<div class="game-image-container">' +
            '<img src="'+game_list[i].getElementsByTagName('image')[0].childNodes[0].nodeValue+'"/>' +
            '</div>' +
            '<p>'+game_list[i].getElementsByTagName('text')[0].childNodes[0].nodeValue+'</p>';
        if(max < game_list[i].getElementsByTagName('onlines')[0].childNodes[0].nodeValue){
            max = game_list[i].getElementsByTagName('onlines')[0].childNodes[0].nodeValue;
            maxOnlineIndex = i;
        }
    }
    var gName = game_list[maxOnlineIndex].getElementsByTagName('name')[0].childNodes[0].nodeValue;
    var blockID = gName+ "-block";
    var gBlock = document.getElementById(blockID);
    gBlock.style.backgroundColor = games_item.getAttribute('max-onlines-background');
    gBlock.style.borderWidth = games_item.getAttribute('max-onlines-border-width');
    gBlock.style.borderColor = games_item.getAttribute('max-onlines-border-color');
    gBlock.style.borderStyle = games_item.getAttribute('max-onlines-border-style');
    for (var i=0; i < game_list.length; i++){
        gName = game_list[i].getElementsByTagName('name')[0].childNodes[0].nodeValue;
        blockID = gName + "-block";
        gBlock = document.getElementById(blockID);
        setItemColor(gBlock.getElementsByTagName('p')[0],game_list[i].getElementsByTagName('text')[0].getAttribute('color'));
        setOnhoverColor(gBlock.getElementsByTagName('p')[0],game_list[i].getElementsByTagName('text')[0].getAttribute('hover'));
        setGameOnClick(gBlock,gName);
    }
}

function setGameOnClick(item, name) {
    item.onclick = function () {
        controller(name);
    };
}
function controller(newState) {
    if(state.localeCompare(newState) != 0){
        state = newState;
        console.log("selected : " + state);
        var dir = document.getElementById('pwd');
        dir.innerHTML = state;
        if("home".localeCompare(state) == 0){
            makeHome();
        }else{
            var ajaxUrl;
            document.getElementById('home-icon').style.display="inline-block";
            // for games not implemented
            for (var i = 0; i < game_list.length; i++){
                if("true".localeCompare(game_list[i].getAttribute('active')) != 0
                    && state.localeCompare(game_list[i].getElementsByTagName('name')[0].childNodes[0].nodeValue) == 0){
                    var main_container = document.getElementById("main-container");
                    main_container.innerHTML = "<p>This game is not implemented yet!</p>";
                    return ;
                }  else if (state.localeCompare(game_list[i].getElementsByTagName('name')[0].childNodes[0].nodeValue) == 0){
                    ajaxUrl = game_list[i].getElementsByTagName('url')[0].childNodes[0].nodeValue;
                }
            }
            // games implemented
            if("chess".localeCompare(state) == 0){
                loadChessGame(ajaxUrl);
            }else if("sudoku" .localeCompare(state) == 0){
                loadSudokuGame(ajaxUrl);
            }
        }
    }
}
function changeMenu(){
    var menu_items = document.getElementById("games").getElementsByTagName('li');
    if(menuState == 1){
        for(var i = 0; i < menu_items.length; i++){
            if(i == 0){
                menu_items[i].style.display="inline-block";
            } else{
                menu_items[i].style.display="none";
            }
        }
        menuState = 0;
    }else{
        for(var i = 0; i <menu_items.length; i++){
            menu_items[i].style.display="inline-block";
        }
        menuState = 1;
    }
}
function setItemColor(item,color){
    item.style.color = color;
}
function setOnhoverColor(item,color){
    var sColor = item.style.color;
    item.onmouseover = function () {
        item.style.color = color;
    }
    item.onmouseout = function () {
        item.style.color = sColor;
    }
}
function analyze(){
    if(this.readyState == 4){
        if(this.status == 200){
            var response = this.responseText;
            resultOfHomeAjax = response;
            DOMOfHomeXml = parser(response);
        }
        else{
            window.alert("Error: "+ this.statusText);
        }
    }
}
// synchronus ajax
function synchronousAjax(url,process){
    var xmlhttp=new XMLHttpRequest();
    xmlhttp.onreadystatechange = process;
    xmlhttp.open("GET",url,false);
    xmlhttp.send(null);
}
function parser(inputXml) {
    var parser = new DOMParser();
    try {
        var xmlDoc = parser.parseFromString(inputXml,"text/xml");
        console.log("xml parsed : ");
        console.log(xmlDoc);
        return xmlDoc;
    } catch (e){
        alert("error in xml parsing");
    }
}

