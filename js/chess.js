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
var pieceScore ={pawn:1,knight:3,bishop:3,rook:5,queen:9};

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

    castle = [];
    castle.push([0,0]);
    castle.push([0,0]);
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

    //castle check
    castleFirstCheck();
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
            move(cell,event.data.x,event.data.y);
        }else{
            var canAttack = attack(cell);
            if(canAttack){
                move(cell,event.data.x,event.data.y);
            }

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
        case "knight":
            return(knightMoves(x,y));
            break;
        case "bishop":
            return(bishopMoves(x,y));
            break;
        case "rook":
            var ret_val = rookMoves(x,y);
            return ret_val;
            break;
        case "queen":
            var ret_val = rookMoves(x,y);
            ret_val = ret_val.concat(bishopMoves(x,y));
            return ret_val;
            break;
        case "king":
            return(kingMoves(x,y));
            break;
    }
}
function kingMoves(x,y) {
    var retVal = [];
    var mytmp = [];
    mytmp.push([x+1,y+1]);
    mytmp.push([x+1,y-1]);
    mytmp.push([x-1,y+1]);
    mytmp.push([x-1,y-1]);
    mytmp.push([x+1,y]);
    mytmp.push([x-1,y]);
    mytmp.push([x,y+1]);
    mytmp.push([x,y-1]);
    for(var i =0; i < mytmp.length; i++){
        if(mytmp[i][0] < 8 && mytmp[i][0] > -1 && mytmp[i][1] < 8 && mytmp[i][1] > -1 ){
            if(chessCells[mytmp[i][0]][mytmp[i][1]].attr('owner') != chessCells[x][y].attr('owner')){
                retVal.push([mytmp[i][0],mytmp[i][1]]);
            }
        }
    }
    var mycastle = castleMoves(x,y);
    if(mycastle != null){
        retVal = retVal.concat(mycastle);
    }
    console.log(retVal);
    return retVal;
}
function rookMoves(x,y) {
    var mytmp = [];

    var i = 1;
    while (x + i < 8){
        if (chessCells[x + i][y].attr('owner') != "none") {
            if (chessCells[x + i][y].attr('owner') != chessCells[x][y].attr('owner')) {
                mytmp.push([x + i, y]);
            }
            break;
        } else {
            mytmp.push([x + i, y]);
        }
        i++;
    }

    i = 1;
    while (x - i > -1){
        if (chessCells[x - i][y].attr('owner') != "none") {
            if (chessCells[x - i][y].attr('owner') != chessCells[x][y].attr('owner')) {
                mytmp.push([x - i, y]);
            }
            break;
        } else {
            mytmp.push([x - i, y]);
        }
        i++;
    }

    i = 1;
    while (y + i < 8){
        if (chessCells[x][y + i].attr('owner') != "none") {
            if (chessCells[x][y + i].attr('owner') != chessCells[x][y].attr('owner')) {
                mytmp.push([x, y + i]);
            }
            break;
        } else {
            mytmp.push([x, y + i]);
        }
        i++;
    }

    i = 1;
    while (y - i > -1){
        if (chessCells[x][y - i].attr('owner') != "none") {
            if (chessCells[x][y - i].attr('owner') != chessCells[x][y].attr('owner')) {
                mytmp.push([x, y - i]);
            }
            break;
        } else {
            mytmp.push([x, y - i]);
        }
        i++;
    }
    return mytmp;
}
function bishopMoves(x,y) {
    var mytmp = [];
    for(var i = 1; i < 8; i++) {
        if (x + i < 8 && y + i < 8) {
            if (chessCells[x + i][y + i].attr('owner') != "none") {
                if (chessCells[x + i][y + i].attr('owner') != chessCells[x][y].attr('owner')) {
                    mytmp.push([x + i, y + i]);
                }
                break;
            } else {
                mytmp.push([x + i, y + i]);
            }
        }
    }
    for(var i = 1; i < 8; i++) {
        if (x - i > -1 && y + i < 8) {
            if (chessCells[x - i][y + i].attr('owner') != "none") {
                if (chessCells[x - i][y + i].attr('owner') != chessCells[x][y].attr('owner')) {
                    mytmp.push([x - i, y + i]);
                }
                break;
            } else {
                mytmp.push([x - i, y + i]);
            }
        }
    }
    for(var i = 1; i < 8; i++) {
        if(x + i < 8&& y - i >-1) {
            if (chessCells[x + i][y - i].attr('owner') != "none") {
                if (chessCells[x + i][y - i].attr('owner') != chessCells[x][y].attr('owner')) {
                    mytmp.push([x + i, y - i]);
                }
                break;
            } else {
                mytmp.push([x + i, y - i]);
            }
        }
    }
    for(var i = 1; i < 8; i++) {
        if(x-i > -1&& y-i > -1) {
            if (chessCells[x - i][y - i].attr('owner') != "none") {
                if (chessCells[x - i][y - i].attr('owner') != chessCells[x][y].attr('owner')) {
                    mytmp.push([x - i, y - i]);
                }
                break;
            } else {
                mytmp.push([x - i, y - i]);
            }
        }
    }
    return mytmp;
}
function knightMoves(x,y) {
    var retVal = [];
    var mytmp = [];
    mytmp.push([x+2,y+1]);
    mytmp.push([x+2,y-1]);
    mytmp.push([x-2,y+1]);
    mytmp.push([x-2,y-1]);
    mytmp.push([x+1,y+2]);
    mytmp.push([x-1,y+2]);
    mytmp.push([x+1,y-2]);
    mytmp.push([x-1,y-2]);
    for(var i =0; i < mytmp.length; i++){
        if(mytmp[i][0] < 8 && mytmp[i][0] > -1 && mytmp[i][1] < 8 && mytmp[i][1] > -1 ){
            if(chessCells[mytmp[i][0]][mytmp[i][1]].attr('owner') != chessCells[x][y].attr('owner')){
                retVal.push([mytmp[i][0],mytmp[i][1]]);
            }
        }
    }
    return retVal;
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
        if(x < 7 ){
            if(y > 0){
                if(chessCells[x + 1][y - 1].attr('owner') != chessCells[x][y].attr('owner')
                    && chessCells[x + 1][y - 1].attr('owner') != "none"){
                    retVal.push([x + 1, y - 1]);
                }
            }
            if(y < 7){
                if(chessCells[x + 1][y + 1].attr('owner') != chessCells[x][y].attr('owner')
                    && chessCells[x + 1][y + 1].attr('owner') != "none") {
                    retVal.push([x + 1, y + 1]);
                }
            }
        }
    }
    return retVal;
}
function castleFirstCheck() {
    //console.log("castle");
    var filedColor;
    if(whiteField == "top"){
        filedColor = {top:"white",bot:"black"}
    }else{
        filedColor = {bot:"white",top:"black"}
    }
    var index = {white:0,black:1};

    if(chessCells[0][3].attr('owner') == filedColor['bot']){

        if (whoIs(0, 3) != "king") {
            castle[index[filedColor['bot']]][0] = 1;
            castle[index[filedColor['bot']]][1] = 1;
        }else{
            if (chessCells[0][0].attr('owner') == filedColor['bot']) {
                if (whoIs(0, 0) != "rook") {
                    castle[index[filedColor['bot']]][0] = 1;
                }
            } else {
                castle[index[filedColor['bot']]][0] = 1;
            }
            if (chessCells[0][7].attr('owner') == filedColor['bot']) {
                if (whoIs(0, 7) != "rook") {
                    castle[index[filedColor['bot']]][1] = 1;
                }
            } else {
                castle[index[filedColor['bot']]][1] = 1;
            }
        }
    }else {
        castle[index[filedColor['bot']]][0] = 1;
        castle[index[filedColor['bot']]][1] = 1;
    }
    if(chessCells[7][3].attr('owner') == filedColor['top']) {
        if (whoIs(7, 3) != "king") {
            castle[index[filedColor['top']]][0] = 1;
            castle[index[filedColor['top']]][1] = 1;
        } else {
            if (chessCells[7][0].attr('owner') == filedColor['top']) {
                if (whoIs(7, 0) != "rook") {
                    castle[index[filedColor['top']]][0] = 1;
                }
            } else {
                castle[index[filedColor['top']]][0] = 1;
            }
            if (chessCells[7][7].attr('owner') == filedColor['top']) {
                if (whoIs(7, 7) != "rook") {
                    castle[index[filedColor['top']]][1] = 1;
                }
            } else {
                castle[index[filedColor['top']]][1] = 1;
            }
        }
    }else{
        castle[index[filedColor['top']]][0] = 1;
        castle[index[filedColor['top']]][1] = 1;

    }

    /*console.log(castle);
    console.log(index[filedColor['bot']] + " > " + filedColor['bot']);
    console.log(index[filedColor['top']] + " > " + filedColor['top']);*/
}
function castleMoves(x,y) {
    var ret_val = [];
    var index = {white:0,black:1};
    if(castle[index[chessCells[x][y].attr('owner')]][0] == 0){
        if(chessCells[x][1].attr('owner') == 'none' &&
            chessCells[x][2].attr('owner') == 'none'){
            ret_val.push([x,1]);
        }
    }
    if(castle[index[chessCells[x][y].attr('owner')]][1] == 0){
        if(chessCells[x][4].attr('owner') == 'none' &&
            chessCells[x][5].attr('owner') == 'none' &&
            chessCells[x][6].attr('owner') == 'none'){
            ret_val.push([x,5]);
        }
    }
    //console.log(ret_val);
    if(x == 0 || x == 7){
        return ret_val;
    } else{
        return null;
    }
}

function promotion(x,y) {
    var type = whoIs(x,y);
    var direction;
    if(chessCells[x][y].attr("owner") == "white"){
        direction = whiteField;
    }else{
        direction = blackField;
    }
    console.log(x + " > " + y)
    console.log(direction);
    if(type == "pawn") {
        if (x == 0 && direction == "top") {
            chessCells[x][y].html(unicodes["queen"]);
        } else if (x == 7 && direction == "bottom") {
            chessCells[x][y].html(unicodes["queen"]);
        }
        console.log("here");
    }

}

function attack(cell) {
    var type = whoIs(cell.attr("x"),cell.attr("y"));
    if(checkCanGo(cell.attr("x"),cell.attr("y"))){
        if(type == "king"){
            return false;
        }else{
            var score = Number($("#"+selectedPiece.attr('owner')+"-score").html());
            score += pieceScore[type];
            $("#"+selectedPiece.attr('owner')+"-score").html(score);
            $("#"+cell.attr('owner')+"-chessman-panel").append(cell.html());
            if(cell.attr('owner') == "white"){
                whiteOutMan.push(cell.html());
            }else{
                blackOutMan.push(cell.html());
            }
            return true;
        }
    } else {
        return false;
    }
}
function move(cell,x,y) {
    if(checkCanGo(x,y)){
        cell.html(selectedPiece.html());
        cell.css("color",selectedPiece.attr('owner'));
        cell.attr("owner",selectedPiece.attr('owner'));
        // for castle move
        //console.log("here3");
        //console.log(whoIs(selectedPiece.attr("x"),selectedPiece.attr("y")));
        if(whoIs(selectedPiece.attr("x"),selectedPiece.attr("y")) == "king"){
            //console.log("here");
            if(selectedPiece.attr("y") - y > 1){
                //console.log("here2");
                xchangeCell(chessCells[selectedPiece.attr("x")][0],chessCells[selectedPiece.attr("x")][2]);
            }else if( selectedPiece.attr("y") - y < -1 ) {
                //console.log("here4");
                xchangeCell(chessCells[selectedPiece.attr("x")][7],chessCells[selectedPiece.attr("x")][4]);
            }
        }
        selectedPiece.html("");
        selectedPiece.attr('owner',"none");
        selectedPiece.css('color',"");
        deselectAllCell();
        if(x % 2 == y % 2){
            cell.css("background-color","lime");
        }else{
            cell.css("background-color","green");
        }
        if(selectedPiece.attr('x') % 2 == selectedPiece.attr('y') % 2){
            selectedPiece.css("background-color","lime");
        }else{
            selectedPiece.css("background-color","green");
        }
        promotion(x,y);
        updateInMan();
        castleFirstCheck();
        //console.log(castle);
        setTimeout(function () {
            deselectAllCell();
        },500);

    }else{
        deselectAllCell();
    }
    selectedPiece = null;
    selectedCanGo = null;
}
function xchangeCell(from,to) {
    to.html(from.html());
    to.css("color",from.attr('owner'));
    to.attr("owner",from.attr('owner'));
    from.html("");
    from.attr('owner',"none");
    from.css('color',"");
}
function checkCanGo(x,y) {
    for(var i = 0; i < selectedCanGo.length; i++){
        if(selectedCanGo[i][0] == x && selectedCanGo[i][1] == y){
            return true;
        }
    }
    return false;
}
function updateInMan() {
    whiteInMan = [];
    blackInMan = [];
    for (var i = 0; i < chessCells.length; i++){
        for (var j = 0; j < chessCells[i].length; j++){
            if(chessCells[i][j].attr('owner') == "white"){
                whiteInMan.push([chessCells[i][j].html(),i,j]);
            }else{
                blackInMan.push([chessCells[i][j].html(),i,j]);
            }
        }
    }
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
            td.attr("x",i);
            td.attr("y",j);
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
    var chessmanPanel = jQuery("<div/>").attr("id",color+"-chessman-panel")
        .css("color",color).css("word-wrap","break-word");
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