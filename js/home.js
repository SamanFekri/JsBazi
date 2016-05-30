var homedir = "http://ie.ce-it.ir/hw3/xml/home.xml";
var resultOfHomeAjax;
var DOMOfHomeXml;
var state;
var menuState;
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

    var games_item = DOMOfHomeXml.getElementsByTagName("games")[0];
    var game_list = games_item.getElementsByTagName("game");
    console.log("list of games");
    console.log(game_list);

    // adding list of games to gameicon header
    for (var i = 0; i < game_list.length; i++){
        if ("true".localeCompare(game_list[i].getAttribute('active')) == 0) {
            hgame.innerHTML += "<li>" + game_list[i].getElementsByTagName('name')[0].childNodes[0].nodeValue + "</li>";
        }
    }
    console.log(hgame.innerHTML);

    //hgame_lis[0].style.color = gameicon.getAttribute('color');
    setItemColor(hgame_lis[0],gameicon.getAttribute('color'));
    setOnhoverColor(hgame_lis[0],gameicon.getAttribute('hover'));
    // list of li
    //set image icon click
    for (var i = 0; i < hgame_lis.length; i++){
        hgame_lis[i].onclick = changeMenu;
        if(i > 0){
            setItemColor(hgame_lis[i],gamesAttr.getAttribute('color'));
            setOnhoverColor(hgame_lis[i],gamesAttr.getAttribute('hover'));
        }
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
            if(i == 0){
                menu_items[i].style.display="none";
            } else{
                menu_items[i].style.display="inline-block";
            }
        }
        menuState = 1;
    }
}
function synchronousAjax(url,process){
    var xmlhttp=new XMLHttpRequest();
    xmlhttp.onreadystatechange = process;
    xmlhttp.open("GET",url,false);
    xmlhttp.send(null);
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

