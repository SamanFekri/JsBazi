var DOMOfChessXml = null;
var resultOfChessAjax;
var chessdir;
var whiteOutMan=[] , blackOutMan=[];
var whiteInMan=[] ,blackInMan=[]; // 0->unicode, 1->x, 2->y;
var chessCells;
var whiteScore,blackScore,whiteField,blackField;
var unicodes;
var selectedPiece , selectedCanGo;
var castle;
var whiteCellColor , blackCellColor;

function loadChessGame(dir) {
    chessdir = dir;
    if(DOMOfChessXml == null){
        synchronousAjax(chessdir,analyzeChess);
    }
    whiteOutMan=[];
    blackOutMan=[];
    whiteInMan=[] ;
    blackInMan=[];
    chessCells ="";
    whiteScore="";
    blackScore="";
    whiteField="";
    blackField="";
    unicodes=[];
    selectedPiece = null;
    selectedCanGo = null;
    castle = Array(2).fill(0);
    makeChess();
}
function makeChess() {
    $('#main-container').html("");
    chessCells = [];

    unicodes = unicodesMaker();
    chessmanToken();

    var chessDiv = jQuery("<div/>").attr("id","chess");
    $('#main-container').append(chessDiv);
    chessDiv.append(makeChessInfo());
    chessDiv.append(makeChessManPanel("white",whiteOutMan));
    chessDiv.append(makeChessPanel());
    chessDiv.append(makeChessManPanel("black",blackOutMan));
}
function selectChessCell(event) {
    var cell = chessCells[event.data.x][event.data.y];
    //console.log(event.data.x + " > " + event.data.y);
    if(selectedPiece == null){
        // deselect all cells
        deselectAllCell();
        if($('#turn').html() === cell.attr('owner')){
            cell.css("color","blue");
            selectedCanGo = whereCanGo(cell,event.data.x,event.data.y);
            if(typeof selectedCanGo !== 'undefined'){
                colorWhereCanGo(selectedCanGo);
            }
            selectedPiece = cell;
        }
    }else{
        if($('#turn').html() === cell.attr('owner')){
            deselectAllCell();
            cell.css("color","blue");
            selectedCanGo = whereCanGo(cell,event.data.x,event.data.y);
            if(typeof selectedCanGo !== 'undefined'){
                colorWhereCanGo(selectedCanGo);
            }
            selectedPiece = cell;
        }else if(cell.attr('owner') == 'none'){

        }
    }
}
function whereCanGo(cell,x,y) {
    var type = whoIs(x,y);
    switch (type){
        case "pawn":
            if(cell.attr('owner') == "white"){
                return(pawnMoves(x,y,whiteField));
            } else if(cell.attr('owner') == "black"){
                return(pawnMoves(x,y,blackField));
            }
            break;
    }
}
function pawnMoves(x,y,moveDir) {
    var retVal = [];
    if(moveDir == "top"){
        if(x == 6){
            for(var i = 1; i <= 2; i++){
                if(chessCells[x - i][y].attr('owner') != "none"){
                    break;
                }
                retVal.push([x - i , y]);
            }
        }else {
            if (x > 0) {
                if (chessCells[x - 1][y].attr('owner') == "none") {
                    retVal.push([x - 1, y])
                }
            }
        }
        if(x > 0 && y < 7 && y > 0){
            if(chessCells[x - 1][y - 1].attr('owner') != chessCells[x][y].attr('owner')
                && chessCells[x - 1][y - 1].attr('owner') != "none"){
                retVal.push([x - 1, y - 1]);
            }
            if(chessCells[x - 1][y + 1].attr('owner') != chessCells[x][y].attr('owner')
                && chessCells[x - 1][y + 1].attr('owner') != "none"){
                retVal.push([x - 1, y + 1]);
            }
        }
    }else{
        if(x == 1){
            for(var i = 1; i <= 2; i++){
                if(chessCells[x + i][y].attr('owner') != "none"){
                    break;
                }
                retVal.push([x + i , y]);
            }
        }else {
            if (x < 7) {
                if (chessCells[x + 1][y].attr('owner') == "none") {
                    retVal.push([x + 1, y])
                }
            }
        }
        if(x < 7 && y < 7 && y > 0){
            if(chessCells[x + 1][y - 1].attr('owner') != chessCells[x][y].attr('owner')
                && chessCells[x + 1][y - 1].attr('owner') != "none"){
                retVal.push([x + 1, y - 1]);
            }
            if(chessCells[x + 1][y + 1].attr('owner') != chessCells[x][y].attr('owner')
                && chessCells[x + 1][y + 1].attr('owner') != "none"){
                retVal.push([x + 1, y + 1]);
            }
        }
    }
    return retVal;
}
function colorWhereCanGo(arrayCanGo) {
    for (var i = 0; i < arrayCanGo.length; i++){
        if(chessCells[arrayCanGo[i][0]][arrayCanGo[i][1]].attr('owner') == "none"){
            if(arrayCanGo[i][0] % 2 == arrayCanGo[i][1] % 2){
                chessCells[arrayCanGo[i][0]][arrayCanGo[i][1]].css("background-color","lime");
            }else{
                chessCells[arrayCanGo[i][0]][arrayCanGo[i][1]].css("background-color","green");
            }
        }else{
            chessCells[arrayCanGo[i][0]][arrayCanGo[i][1]].css("color","red");
        }
    }
}
function whoIs(x,y) {
    var mcode = chessCells[x][y].html();
    for (var code in unicodes){
        if(mcode == unicodes[code]){
            return code;
        }
    }
}
function deselectAllCell() {
    for (var i = 0; i < 8; i++){
        for (var j = 0; j < 8; j++){
            if( i % 2 == j % 2){
                chessCells[i][j].css("background-color",whiteCellColor);
            }else{
                chessCells[i][j].css("background-color",blackCellColor);
            }
            if(chessCells[i][j].attr('owner') != 'none'){
                chessCells[i][j].css("color",chessCells[i][j].attr('owner'));
            }
        }
    }
}

function makeChessPanel(){
    var board = DOMOfChessXml.getElementsByTagName('board')[0];
    whiteCellColor = board.getAttribute('white-cells');
    blackCellColor = board.getAttribute('black-cells');
    var chessTable = jQuery("<table/>");
    for (var i = 0; i < 8; i++){
        var tr = jQuery("<tr/>");
        var mytmp = Array(8);
        for (var j = 0; j < 8; j++){
            var td = jQuery("<td/>");
            mytmp[j] = td;
            if( i % 2 == j % 2){
                td.css("background-color",whiteCellColor);
            } else {
                td.css("background-color",blackCellColor);
            }
            td.attr("owner","none");
            td.click({x:i,y:j},selectChessCell);
            td.append(haveChessman(i,j,td));
            tr.append(td);
        }
        chessCells.push(mytmp);
        chessTable.append(tr);
    }
    console.log('chess array');
    console.log(chessCells);
    return chessTable;
}
function haveChessman(i,j,td){
    for(var p = 0; p < whiteInMan.length; p++){
        if(whiteInMan[p][1] == i && whiteInMan[p][2] == j){
            td.css("color","white");
            td.attr("owner","white");
            return whiteInMan[p][0];
        }
    }
    for(var p = 0; p < blackInMan.length; p++){
        if(blackInMan[p][1] == i && blackInMan[p][2] == j){
            td.css("color","black");
            td.attr("owner","black");
            return blackInMan[p][0];
        }
    }
    return "";
}
function makeChessManPanel(color,outMans){
    var chessmanPanel = jQuery("<div/>").attr("id",color+"-chessman-panel").css("color",color);
    for  (var i = 0; i<outMans.length;i++){
        chessmanPanel.append(outMans[i]);
    }
    return chessmanPanel;
}
function chessmanToken(){
    var board = DOMOfChessXml.getElementsByTagName('chess')[0].getElementsByTagName('board')[0];
    toChessmanList(board.getElementsByTagName('white')[0],whiteInMan,whiteOutMan);
    whiteField = board.getElementsByTagName('white')[0].getAttribute('field');
    console.log('white mans');
    console.log(whiteInMan);
    console.log(whiteOutMan);
    console.log(whiteField);
    
    toChessmanList(board.getElementsByTagName('black')[0],blackInMan,blackOutMan);
    blackField = board.getElementsByTagName('black')[0].getAttribute('field');
    console.log('black mans');
    console.log(blackInMan);
    console.log(blackOutMan);
    console.log(blackField);
}
function toChessmanList(inputXml,listInGame,listOutGame){
    listAdder(inputXml,'pawn',8,listInGame,listOutGame);
    listAdder(inputXml,'rook',2,listInGame,listOutGame);
    listAdder(inputXml,'knight',2,listInGame,listOutGame);
    listAdder(inputXml,'bishop',2,listInGame,listOutGame);
    listAdder(inputXml,'queen',1,listInGame,listOutGame);
    listAdder(inputXml,'king',1,listInGame,listOutGame);
}
function listAdder(inputXml,name,num,listInGame,listOutGame){
    var items = inputXml.getElementsByTagName(name);
    for(var i = num - items.length; i > 0; i--){
        listOutGame.push(unicodes[name]);
    }
    for (var i = 0; i < items.length; i++){
        listInGame.push([unicodes[name],items[i].getAttribute('row'),items[i].getAttribute('col')]);
    }
}
function unicodesMaker(){
    var chessmans = DOMOfChessXml.getElementsByTagName('chess')[0].getElementsByTagName('chessmans')[0];
    var ret = {
            pawn:chessmans.getElementsByTagName('pawn')[0].getAttribute('unicode'),
            rook:chessmans.getElementsByTagName('rook')[0].getAttribute('unicode'),
            knight:chessmans.getElementsByTagName('knight')[0].getAttribute('unicode'),
            bishop:chessmans.getElementsByTagName('bishop')[0].getAttribute('unicode'),
            queen:chessmans.getElementsByTagName('queen')[0].getAttribute('unicode'),
            king:chessmans.getElementsByTagName('king')[0].getAttribute('unicode')
            };
    console.log(ret);
    return ret;
}
function makeChessInfo() {
    var infoDiv = jQuery("<div/>").attr("id","chess-info");

    whiteScore = Number(DOMOfChessXml.getElementsByTagName('score')[0].getElementsByTagName('white')[0].childNodes[0].nodeValue);
    blackScore = Number(DOMOfChessXml.getElementsByTagName('score')[0].getElementsByTagName('black')[0].childNodes[0].nodeValue);

    var whiteScoreDiv = jQuery("<div/>").addClass("score")
        .html('white score: <span id="white-score">' + whiteScore+ '</span>');
    var turnDiv = jQuery("<div/>").attr("id","turn")
        .addClass(DOMOfChessXml.getElementsByTagName('chess')[0].getAttribute('turn'))
        .html(DOMOfChessXml.getElementsByTagName('chess')[0].getAttribute('turn'));
    var blackScoreDiv = jQuery("<div/>").addClass("score")
        .html('black score: <span id="black-score">' + blackScore+ '</span>');


    infoDiv.append(whiteScoreDiv);
    infoDiv.append(turnDiv);
    infoDiv.append(blackScoreDiv);
    return infoDiv;
}
function analyzeChess(){
    if(this.readyState == 4){
        if(this.status == 200){
            var response = this.responseText;
            resultOfChessAjax = response;
            DOMOfChessXml = parser(response);
        }
        else{
            window.alert("Error: "+ this.statusText);
        }
    }
}