var DOMOfSudokuXml = null;
var resultOfSudokuAjax;
var sudokudir;
var xsl;
var xsltDir = "sudoku.xsl";
var sudokuVals;
var selectBgColor , selectColor , sudoCellHover;

function loadSudokuGame(dir) {
    sudokudir = dir;
    synchronousAjax(xsltDir, readXsltFile);
    if(DOMOfSudokuXml == null){
        synchronousAjax(sudokudir,analyzeSudoku);
    }
    makeSudoko();
}
function makeSudoko() {
    var xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xsl);
    var resultDocument = xsltProcessor.transformToFragment(DOMOfSudokuXml,document);
    console.log("result of document : ");
    console.log(resultDocument);
    $('#main-container').html(resultDocument);

    var tmp2= DOMOfSudokuXml.getElementsByTagName('sudoku')[0];
    selectBgColor = tmp2.getAttribute("selectedNumberBackColor");
    selectColor = tmp2.getAttribute("selectedNumberColor");
    sudoCellHover = tmp2.getAttribute("hover");

    var rows = $('#sudoku tr');
    sudokuVals = new Array(rows.length);
    for (var i = 0; i < rows.length; i++){
        var cells = rows[i].getElementsByTagName('td');
        var tmp = [];
        for (var j = 0; j < cells.length; j++){
            tmp.push(Number(cells[j].innerHTML));
            setOnkeypress(cells[j],i,j);
            sudokoCellHover(cells[j],sudoCellHover);
            onCellClick(cells[j],i,j);

        }
        sudokuVals[i] = tmp;
    }
    console.log(sudokuVals);
    $("#submit-sudoku").click(function () {
        alert("hi");
       console.log(faultsNum());
    });
}

function faultsNum() {
    var faultCell = [];
    // search square
    for (var i = 0; i < sudokuVals.length; i++){
        for (var j = 0; j < sudokuVals[i].length; j++){
            var tmpNo = sudokuVals[i][j];
            console.log(i + " > " + j)
            for (var k = 0; k < sudokuVals.length/3; k++){
                for (var s = 0; s < sudokuVals[k].length/3; s++){
                    console.log(k + " >> " + s)
                    console.log(((i/3)*3+k) + " >>> " + ((j/3)*3+s))
                    if((i%3) != k && (j%3) != s && tmpNo == sudokuVals[(i/3)*3+k][(j/3)*3+s]){
                        faultCell.push([i,j]);
                        faultCell.push([(i/3)*3+k,(j/3)*3+s]);
                        return faultCell;
                    }
                }
            }
        }
    }
    // search in rows and 0
    for (var i = 0; i < sudokuVals.length; i++){
        for (var j = 0; j < sudokuVals[i].length; j++){
            var tmpNo = sudokuVals[i][j];
            if(tmpNo == 0){
                faultCell.push([i,j]);
                return faultCell;
            }
            for (var k = 0; k < sudokuVals[i].length; k++){
                if(j != k && tmpNo == sudokuVals[i][k]){
                    faultCell.push([i,j]);
                    faultCell.push([i,k]);
                    return faultCell;
                }
            }
        }
    }
    // search in column
    for (var j = 0; j < sudokuVals.length; j++){
        for (var i = 0; i < sudokuVals[j].length; i++){
            var tmpNo = sudokuVals[i][j];
            for (var k = 0; k < sudokuVals[j].length; k++){
                if(i != k && tmpNo == sudokuVals[k][j]){
                    faultCell.push([i,j]);
                    faultCell.push([k,j]);
                    return faultCell;
                }
            }
        }
    }
    return 0;
}

function onCellClick(item,i,j) {
    item.onclick = function () {
        for (var p = 0; p < sudokuVals.length; p++){
            for (var q = 0; q < sudokuVals[p].length; q++){
                if(sudokuVals[i][j] == sudokuVals[p][q] && sudokuVals[p][q] != 0){
                    $('#sudoku tr')[p].getElementsByTagName('td')[q].style.backgroundColor = selectBgColor;
                    $('#sudoku tr')[p].getElementsByTagName('td')[q].style.color = selectColor;
                }else{
                    $('#sudoku tr')[p].getElementsByTagName('td')[q].style.backgroundColor = "";
                    $('#sudoku tr')[p].getElementsByTagName('td')[q].style.color = "";
                }
            }
        }
    }
}
function sudokoCellHover(item,bgColor){
    item.onmouseover = function () {
        if(item.style.color.localeCompare(selectColor) != 0) {
            item.style.backgroundColor = bgColor;
        }
    }
    item.onmouseout =function () {
        if(item.style.color.localeCompare(selectColor) != 0){
            item.style.backgroundColor = "";
        }
    }
}
function setOnkeypress(item,i,j) {
    item.onkeydown = function (e) {
        if(e.keyCode > 48 && e.keyCode < 58)  {
            if(item.innerHTML.length > 0){
                item.innerHTML = "";
            }
            sudokuVals[i][j] = e.keyCode - 48;
        }else if(e.keyCode > 96 && e.keyCode < 106){
            if(item.innerHTML.length > 0){
                item.innerHTML = "";
            }
            sudokuVals[i][j] = e.keyCode - 96;
        }else if(e.keyCode == 8){
            sudokuVals[i][j] = 0;
        }else{
            return false;
        }
        //console.log(sudokuVals);
    }
}
function sudokuOnKeyPress(e) {
    if(e.keyCode > '0' && e.keyCode <= '9' || e.keyCode == 8){
        return;
    }
    console.log(e);
    console.log('hiiiiiiiiiiiiiii');
}
function readXsltFile() {
    if(this.readyState == 4){
        if(this.status == 200){
            var response = this.responseText;
            xsl = parser(response);
            console.log("XSLT is : ");
            console.log(xsl);
        }
        else{
            window.alert("Error: "+ this.statusText);
        }
    }
}
function analyzeSudoku(){
    if(this.readyState == 4){
        if(this.status == 200){
            var response = this.responseText;
            resultOfSudokuAjax = response;
            DOMOfSudokuXml = parser(response);
            console.log("Sudoku xml is : ");
            console.log(DOMOfSudokuXml);
        }
        else{
            window.alert("Error: "+ this.statusText);
        }
    }
}