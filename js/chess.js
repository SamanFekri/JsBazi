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
var opColor ={white:"black",black:"white"}
var nextTurnCanGo ;

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
    nextTurnCanGo = [];
    makeChess();
    checckAndCheckmate($("#turn").html());
    deselectAllCell();
    //changeSide();
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
            selectedCanGo = filterWhereCanGo(cell.html());
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
            selectedCanGo = filterWhereCanGo(cell.html());
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
function changeTurn() {
    $("#turn").html(opColor[$("#turn").html()]);
    $("#turn").attr('class',$("#turn").html());
    //changeSide();
}
/*function changeSide() {
    var dir;
    if(whiteField == "top"){
        dir = {bot:"black",top:"white"}
    }else{
        dir = {top:"black",bot:"white"}
    }
    if($("#turn").html() == dir['bot']){
        $("#chess > table").css('-webkit-transform','rotate('+180+'deg)');
        $("#chess > table").css('-moz-transform','rotate('+180+'deg)');
        $("#chess > table").css('transform','rotate('+180+'deg)');
        for (var i = 0; i < chessCells.length; i++){
            for (var j = 0; j < chessCells[i].length; j++){
                chessCells[i][j].css('-webkit-transform','rotate('+180+'deg)');
                chessCells[i][j].css('-moz-transform','rotate('+180+'deg)');
                chessCells[i][j].css('transform','rotate('+180+'deg)');
            }
        }
    }else{
        $("#chess > table").css('-webkit-transform','rotate('+0+'deg)');
        $("#chess > table").css('-moz-transform','rotate('+0+'deg)');
        $("#chess > table").css('transform','rotate('+0+'deg)');
        for (var i = 0; i < chessCells.length; i++){
            for (var j = 0; j < chessCells[i].length; j++){
                chessCells[i][j].css('-webkit-transform','rotate('+0+'deg)');
                chessCells[i][j].css('-moz-transform','rotate('+0+'deg)');
                chessCells[i][j].css('transform','rotate('+0+'deg)');
            }
        }
    }
}*/
function filterWhereCanGo(cellUnicode) {
    var retVal = [];
    for(var i = 0; i < selectedCanGo.length; i++){
        for (var j = 0; j < nextTurnCanGo.length; j++){
            //console.log("ih >>> "+nextTurnCanGo[j][2] + " <<<< " + cellUnicode)
            //console.log(nextTurnCanGo[j])
            if(selectedCanGo[i][0] == nextTurnCanGo[j][0] &&
                selectedCanGo[i][1] == nextTurnCanGo[j][1] &&
                cellUnicode == nextTurnCanGo[j][2]){
                retVal.push([selectedCanGo[i][0],selectedCanGo[i][1]]);
            }
        }
    }
    console.log('filter');
    console.log(retVal);
    return retVal;
}
function checckAndCheckmate(color) {
    nextTurnCanGo =cellsCanGo(color);
    // test for cells can go
    /*console.log("checkmate")
    console.log(nextTurnCanGo)
    for(var i =0 ; i < nextTurnCanGo.length; i++){
        chessCells[nextTurnCanGo[i][0]][nextTurnCanGo[i][1]].css("background-color","red");
    }*/
    if(check(color)){
        if($('#p-stat').length > 0){
            $('#p-stat').html(color + " checked!!!");
        }else{
            var p = jQuery("<p/>");
            p.attr('id',"p-stat");
            p.html(color + " checked!!!");
            $("#main-container").append(p);
        }

        if(nextTurnCanGo.length == 0){
            $("#main-container").html("Congrajulation !! \n"+opColor[color] +" wins the match!!")
        }
    }else{
        if($('#p-stat').length > 0) {
            $('#p-stat').remove();
        }
    }
}
function check(color) {
    var lists = {white:whiteInMan,black:blackInMan}
    var mytmp = lists[color];
    //console.log(mytmp)
    var mytmp2 = [];
    for (var i = 0; i < mytmp.length; i++){
        if(mytmp[i][0] == unicodes['king']){
            mytmp2 = [mytmp[i][1],mytmp[i][2]];
            break;
        }
    }
    mytmp = cellsCanAttack(opColor[color]);
    //console.log(mytmp)
    //console.log(mytmp2)
    for (var i = 0; i < mytmp.length; i++){
        /*console.log("tmp")
        console.log(mytmp[i])
        console.log("tmp2")
        console.log(mytmp2)*/
        if(mytmp[i][0] == mytmp2[0] && mytmp[i][1] == mytmp2[1]){
            //alert("kish");
            return true;
        }
    }
    return false;
}
function cellsCanAttack(color) {
    var retVal = [];
    var chessmans = [];
    var dir;
    if(color == "white"){
        chessmans = whiteInMan;
        dir = whiteField;
    }else{
        chessmans = blackInMan;
        dir = blackField;
    }
    for (var i = 0; i <chessmans.length; i++){
        if(chessmans[i][0] != unicodes['pawn']){
//            console.log(chessCells[chessmans[i][1]][chessmans[i][2]])
//            chessCells[chessmans[i][1]][chessmans[i][2]].css("background-color","red")
            retVal = retVal.concat(whereCanGo(chessCells[chessmans[i][1]][chessmans[i][2]],
                Number(chessmans[i][1]),Number(chessmans[i][2])));
        } else {
            if(dir = "top"){
                retVal.push([chessmans[i][1]-1,chessmans[i][2]+1]);
                retVal.push([chessmans[i][1]-1,chessmans[i][2]-1]);
            }else{
                retVal.push([chessmans[i][1]+1,chessmans[i][2]+1]);
                retVal.push([chessmans[i][1]+1,chessmans[i][2]-1]);
            }
        }
    }
  //  console.log(retVal);
    return retVal;
}
function cellsCanGo(color) {
    var retVal = [];
    var chessmans = [];
    if(color == "white"){
        chessmans = whiteInMan;
    }else{
        chessmans = blackInMan;
    }
    for (var i = 0; i <chessmans.length; i++){
        var thisCanGo = whereCanGo(chessCells[chessmans[i][1]][chessmans[i][2]],
            Number(chessmans[i][1]),Number(chessmans[i][2]));

        for (var j = 0; j < thisCanGo.length; j++){
            var xy = [Number(chessmans[i][1]),Number(chessmans[i][2])];
            var ptmp = chessCells[Number(thisCanGo[j][0])][Number(thisCanGo[j][1])].html();
            var powner = chessCells[Number(thisCanGo[j][0])][Number(thisCanGo[j][1])].attr('owner');
            var pcolor = chessCells[Number(thisCanGo[j][0])][Number(thisCanGo[j][1])].css('color');

            xchangeCell(chessCells[xy[0]][xy[1]],chessCells[Number(thisCanGo[j][0])][Number(thisCanGo[j][1])]);
            chessmans[i][1] = Number(thisCanGo[j][0]);
            chessmans[i][2] = Number(thisCanGo[j][1]);
            updateInMan();

            if(check(color) == false) {
                retVal.push([Number(thisCanGo[j][0]), Number(thisCanGo[j][1])
                    ,chessCells[Number(thisCanGo[j][0])][Number(thisCanGo[j][1])].html()]);

                //console.log("hi >>> "+chessCells[Number(thisCanGo[j][0])][Number(thisCanGo[j][1])].html())

            }

            xchangeCell(chessCells[Number(thisCanGo[j][0])][Number(thisCanGo[j][1])],chessCells[xy[0]][xy[1]]);
            chessmans[i][1] = xy[0];
            chessmans[i][2] = xy[1];
            chessCells[Number(thisCanGo[j][0])][Number(thisCanGo[j][1])].html(ptmp);
            chessCells[Number(thisCanGo[j][0])][Number(thisCanGo[j][1])].attr('owner',powner);
            chessCells[Number(thisCanGo[j][0])][Number(thisCanGo[j][1])].css('color',pcolor);
            updateInMan();
        }
        /*retVal = retVal.concat(whereCanGo(chessCells[chessmans[i][1]][chessmans[i][2]],
            Number(chessmans[i][1]),Number(chessmans[i][2])));*/
    }
    //console.log(retVal);
    return retVal;
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
    //console.log(retVal);
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
        if(whoIs(selectedPiece.attr("x"),selectedPiece.attr("y")) == "king"){

            if(selectedPiece.attr("y") - y > 1){
                xchangeCell(chessCells[selectedPiece.attr("x")][0],chessCells[selectedPiece.attr("x")][2]);
            }else if( selectedPiece.attr("y") - y < -1 ) {
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

        checckAndCheckmate(opColor[$("#turn").html()]);
        changeTurn();
        deselectAllCell();

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
            }else if(chessCells[i][j].attr('owner') == "black"){
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
    //console.log(x+">"+y)
    //console.log(chessCells[x][y])
    var mcode = chessCells[x][y].html();
    //console.log("1" + mcode)
    for (var code in unicodes) {
        if (mcode == unicodes[code]) {
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