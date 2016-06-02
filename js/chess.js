var DOMOfChessXml = null;
var resultOfChessAjax;
var chessdir;
var whiteOutMan=[] , blackOutMan=[];
var whiteInMan=[] ,blackInMan=[]; // 0->unicode, 1->x, 2->y;
var chessCells;
var whiteScore,blackScore,whiteField,blackField;
var unicodes;

function loadChessGame(dir) {
    chessdir = dir;
    if(DOMOfChessXml == null){
        synchronousAjax(chessdir,analyzeChess);
    }
    makeChess();
}
function makeChess() {
    $('#main-container').html("");
    chessCells = Array(8);

    unicodes = unicodesMaker();
    chessmanToken();

    var chessDiv = jQuery("<div/>").attr("id","chess");
    $('#main-container').append(chessDiv);
    chessDiv.append(makeChessInfo());
    chessDiv.append(makeChessManPanel("white"));
    chessDiv.append(makeChessPanel());
    chessDiv.append(makeChessManPanel("black"));
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

function makeChessPanel(){
    var board = DOMOfChessXml.getElementsByTagName('board')[0];
    var whiteCellColor = board.getAttribute('white-cells');
    var blackCellColor = board.getAttribute('black-cells');
    var chessTable = jQuery("<table/>");
    for (var i = 0; i < 8; i++){
        var tr = jQuery("<tr/>");
        for (var j = 0; j < 8; j++){
            var td = jQuery("<td/>");
            if( i % 2 == j % 2){
                td.css("background-color",whiteCellColor);
            } else {
                td.css("background-color",blackCellColor);
            }
            tr.append(td);
        }
        chessTable.append(tr)
    }
    return chessTable;
}
function makeChessManPanel(color){
    var chessmanPanel = jQuery("<div/>").attr("id",color+"-chessman-panel");
    return chessmanPanel;
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