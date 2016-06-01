var DOMOfSudokuXml = null;
var resultOfSudokuAjax;
var sudokudir;
var xsl;
var xsltDir = "sudoku_solution.xsd";

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
    var resultDocument = xsltProcessor.transformToFragment(DOMOfSudokuXml, xsl);
    console.log("result of document : ");
    console.log(resultDocument);
    $('#main-container').html(resultDocument);
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