var homedir = "http://ie.ce-it.ir/hw3/xml/home.xml";
var resultOfHomeAjax;
var DOMOfHomeXml;
window.onload = function (){
    synchronousAjax(homedir,analyze);
    var pwd =document.getElementById("pwd");
    var pwdColor = DOMOfHomeXml.getElementsByTagName("pwd")[0];
    console.log(pwdColor.childNodes[0].nodeValue);
    pwd.style.backgroundColor = pwdColor.childNodes[0].nodeValue;
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

