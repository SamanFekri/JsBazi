var DOMOfSudokuXml = null;
var resultOfSudokuAjax;
var sudokudir;
var xsl;
var xsltDir = "sudoku.xsl";
var sudokuVals;

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
    var rows = $('#sudoku tr');
    sudokuVals = new Array(rows.length);
    for (var i = 0; i < rows.length; i++){
        var cells = rows[i].getElementsByTagName('td');
        var tmp = [];
        for (var j = 0; j < cells.length; j++){
            tmp.push(Number(cells[j].innerHTML));
            cells[j
        }
        sudokuVals[i] = tmp;
    }
    console.log(sudokuVals);
}
function sudokuOnKeyPress() {
    console.log(event);
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