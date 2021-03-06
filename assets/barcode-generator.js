const svgToImg = require("svg-to-img");
const { dialog } = require('electron').remote;
const tempDir = require('temp-dir');
const AdmZip = require('adm-zip');
const fs = require('fs');
///////////////////////////////////////////////////////////////////////
//download individual
///////////////////////////////////////////////////////////////////////
function convertioApiCall(index,type){
    console.log(index);
    var elem = document.getElementById(index);
    var svg = elem.outerHTML;
    
    var comboValue = $('#barcodeType').val();
    var bar_type = "EAN-8";
    switch(comboValue){
        case "EAN8" : 
            bar_type = "EAN-8"
            break;
        case "EAN13" : 
            bar_type = "EAN-13";
            break;
    }
    var value = $('#'+index).attr('value');

    var data = {
                    "apikey" : "beae8c11b61a55427c7780836217566c",
                    "input"  : "raw",
                    "file"   : svg,
                    "filename" : bar_type+"_"+value+".svg",
                    "outputformat" : type
                };
    data = JSON.stringify(data)
    console.log(data);
    $.ajax({
        type: 'POST',
        url: "https://api.convertio.co/convert",
        contentType: "application/json",
        data: data,
        success : function(e){
            console.log(e)
            if(e.code == 200){
                //get download url
                setTimeout(() => {
                    $.ajax({
                        type : 'GET',
                        url : "https://api.convertio.co/convert/"+e.data.id+"/status",
                        // data : JSON.stringify({
                        //     id : e.data.id
                        // }),
                        success : function(e){
                            console.log('download info ', e);
                            var url = e.data.output.url;
                            window.open(url);
                        }
                    })    
                }, 3000);
                
            }
        },
        error: function(e) {
          console.log(e);
        },
    });
}
function downloadPNG(index){
    console.log(index);
    var comboValue = $('#barcodeType').val();
    var bar_type = "EAN-8";
    switch(comboValue){
        case "EAN8" : 
            bar_type = "EAN-8"
            break;
        case "EAN13" : 
            bar_type = "EAN-13";
            break;
    }
    var value = $('#'+index).attr('value');
    //png test
    saveSvgAsPng(document.getElementById(index), bar_type+"_"+value+".png",{backgroundColor : $("#background-color").val()});

    // convertioApiCall(index,'png');
}

function downloadJPG(index){
    //jpg test
    var elem = document.getElementById(index);
    var content = elem.outerHTML;
    
    var comboValue = $('#barcodeType').val();
    var bar_type = "EAN-8";
    switch(comboValue){
        case "EAN8" : 
            bar_type = "EAN-8"
            break;
        case "EAN13" : 
            bar_type = "EAN-13";
            break;
    }
    var value = $('#'+index).attr('value');
    dialog.showSaveDialog(
        {
            filters : [
                { name: 'Image', extensions: ['jpg'] }
            ],
            defaultPath : bar_type+"_"+value+".jpg"
        },
        function(path){
            (async () => {
                await svgToImg.from(content).toJpeg({
                    path: path
                });
            })();
        }
    );
}

function downloadPDF(index){
    var elem = document.getElementById(index);
    var context = elem.outerHTML;
    var comboValue = $('#barcodeType').val();
    var bar_type = "EAN-8";
    switch(comboValue){
        case "EAN8" : 
            bar_type = "EAN-8"
            break;
        case "EAN13" : 
            bar_type = "EAN-13";
            break;
    }
    var value = $('#'+index).attr('value');
    var buffer = $('#result-container').html();
    $('#result-container').children().remove();
    $('#result-container').append(context);
    console.log('start entry here');
    var opt = {
        margin:       0,
        filename:     bar_type+"_"+value+".pdf",
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 30 },
        jsPDF:        { orientation : 'l', unit: 'px', format: [$('#'+index).width(), $('#'+index).height()+10]}
      };
      
    // New Promise-based usage:
    html2pdf().set(opt).from(context).save();
    setTimeout(() => {
        $('#result-container').children().remove();
        $('#result-container').append(buffer);    
    }, 800);
    
}

function downloadAI(index){
    convertioApiCall(index,'ai');
}

function downloadEPS(index){
    convertioApiCall(index,'eps');
}

///////////////////////////////////////////////////////////////////////
//download bulk
///////////////////////////////////////////////////////////////////////
function savePngBulk(){
    var comboValue = $('#barcodeType').val();
    var bar_type = "EAN-8";
    switch(comboValue){
        case "EAN8" : 
            bar_type = "EAN-8"
            break;
        case "EAN13" : 
            bar_type = "EAN-13";
            break;
    }

    var pathList = [];
    dir = dialog.showOpenDialog(null, {

        properties: ['openDirectory']

    });
    console.log(dir);
    var elemlist = [];
    var elemindex = 0;
    $('svg[id*=image-]').each( async function() {
        elemlist.push($(this).attr('id'));
    });
    console.log(elemlist);

    var modal = new StatusModal("Saving",elemlist.length);
    async function timerCallback(){
        var elem = $('#'+elemlist[elemindex]);
        var index = elem.attr('id');
        var value = elem.attr('value');
        console.log(index,value);
        var svgelem = document.getElementById(index);
        var html = svgelem.outerHTML;
        var path = dir+"/"+bar_type+"_"+value+".png";
        console.log(path);
        await svgToImg.from(html).toPng({
            path: path,
            encoding: "base64"
        });

        modal.updateModal(elemindex);

        setTimeout(() => {
            if(elemindex<elemlist.length)
            {
                timerCallback();
                elemindex++;
            }
            else{
                modal.removeModal();
            }
        }, 400);
    }

    timerCallback();
}
function saveJpgBulk(){
    var comboValue = $('#barcodeType').val();
    var bar_type = "EAN-8";
    switch(comboValue){
        case "EAN8" : 
            bar_type = "EAN-8"
            break;
        case "EAN13" : 
            bar_type = "EAN-13";
            break;
    }

    var pathList = [];
    dir = dialog.showOpenDialog(null, {

        properties: ['openDirectory']

    });
    console.log(dir);
    var elemlist = [];
    var elemindex = 0;
    $('svg[id*=image-]').each( async function() {
        elemlist.push($(this));
    });
    console.log(elemlist);
    var modal = new StatusModal("Saving",elemlist.length);
    async function timerCallback(){
        var elem = elemlist[elemindex];
        var index = elem.attr('id');
        var value = elem.attr('value');
        console.log(index,value);
        var svgelem = document.getElementById(index);
        var html = svgelem.outerHTML;
        var path = dir+"/"+bar_type+"_"+value+".jpg";
        console.log(path);
        modal.updateModal(elemindex);
        await svgToImg.from(html).toJpeg({
            path: path
        });

        setTimeout(() => {
            if(elemindex<elemlist.length)
            {
                timerCallback();
                elemindex++;
            }
            else{
                modal.removeModal();
            }
        }, 400);
    }

    timerCallback();
}

function savePdfBulk(){
    var comboValue = $('#barcodeType').val();
    var bar_type = "EAN-8";
    switch(comboValue){
        case "EAN8" : 
            bar_type = "EAN-8"
            break;
        case "EAN13" : 
            bar_type = "EAN-13";
            break;
    }
    dir = dialog.showOpenDialog(null, {

        properties: ['openDirectory']

    });
    var elemlist = [];
    var elemindex = 0;
    $('svg[id*=image-]').each( function() {
        elemlist.push($(this).attr('id'));
    });
    console.log(elemlist);
    var modal = new StatusModal("Saving",elemlist.length);
    var buffer = $('#result-container').html();
    async function timerCallback(){
        var elem = $('#'+elemlist[elemindex]);
        var index = elem.attr('id');
        var value = elem.attr('value');
        console.log(index,value);
        var svgelem = document.getElementById(index);
        var html = svgelem.outerHTML;
        var path = dir+"/"+bar_type+"_"+value+".pdf";
        console.log(path);

        modal.updateModal(elemindex);

        
        $('#result-container').children().remove();
        $('#result-container').append(html);
        //html - pdf
        var opt = {
            margin:       0,
            filename:     bar_type+"_"+value+".pdf",
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 10 },
            jsPDF:        { orientation : 'l', unit: 'px', format: [$('#'+index).width(), $('#'+index).height()+10]}
        };
            
        // New Promise-based usage:
        await html2pdf().set(opt).from(html).outputPdf().then(async function(e){
            var buf = new Buffer(e, 'binary');
            await fs.writeFile(path, buf, function(err) {
                if(err) {
                    return console.log(err);
                }

                $('#result-container').children().remove();
                $('#result-container').append(buffer);
                console.log("The file was saved!");

                setTimeout(() => {
                    console.log('timeout entry');
                    if(elemindex<elemlist.length)
                    {
                        timerCallback();
                        elemindex++;
                    }
                    else{
                        modal.removeModal();
                    }
                }, 500);
            });
        });

        
    }

    timerCallback();
    
}
///////////////////////////////////////////////////////////////////////
//generate barcodes
///////////////////////////////////////////////////////////////////////
var barcodeResultContainer = function(id,value,option){
    this.id = id;
    this.value = value;
    var comboValue = $('#barcodeType').val();
    var format;
    switch(comboValue){
        case "EAN8" : 
            format = "ean8";
            break;
        case "EAN13" : 
            format = "ean13";
            break;
    }
    this.option = {
        format              : format,
        lineColor           : $("#line-color").val(),
        background          : $("#background-color").val(),
        font                : "OCR-B",
        width               : parseInt($("#bar-width").val()),
        height              : parseInt($("#bar-height").val()),
        margin              : parseInt($("#bar-margin").val()),
        valid               :
                            function(valid){
                                if(valid){
                                }
                                else{
                                }
                            }
    };

    // this.downloadPNG = function(){
    //     console.log('download png of ',this.value);
    // }
    this.createNewElement = function(){
        var _self = this;
        console.log(this.id, this.value, this.option);
        $('#result-container').append('<div class="row" id="result-'+this.id+'"></div>');

        $('#result-'+id).append('<div><span>Barcode </span><span>'+this.option.format+' : </span><span>'+this.value+'</span></div>');
        $('#result-'+id).append('<svg id="image-'+this.id+'" value="'+this.value+'"></svg>');
        $('#result-'+id).append('<div style="text-align:left;padding:2rem">'+
                                    '<span class="btn-download" id="btn-png" data-imageID="'+this.id+'" onclick="downloadPNG(\''+"image-"+this.id+'\')">PNG</span>'+
                                    '<span class="btn-download" id="btn-jpg" data-imageID="'+this.id+'" onclick="downloadJPG(\''+"image-"+this.id+'\')">JPG</span>'+
                                    '<span class="btn-download" id="btn-pdf" data-imageID="'+this.id+'" onclick="downloadPDF(\''+"image-"+this.id+'\')">PDF</span>'+
                                    '<a href="#" class="btn-download" id="btn-ai"  data-imageID="'+this.id+'" onclick="downloadAI(\''+"image-"+this.id+'\')">AI</a>'+
                                    '<span class="btn-download" id="btn-eps" data-imageID="'+this.id+'" onclick="downloadEPS(\''+"image-"+this.id+'\')">EPS</span>'+
                                    '<br><br><hr>'+
                                '</div>');

        JsBarcode("#image-"+this.id, this.value,this.option);
        $('#image-'+this.id).prepend('<defs><style type="text/css">@font-face {font-family: "OCR-B";src: url(data:font/truetype;charset=utf-8;base64,AAEAAAAPAIAAAwBwRkZUTUGlCQQAAFAsAAAAHEdERUYAJwCKAABQDAAAAB5PUy8yiJ5+IQAAAXgAAABWY21hcDFINWgAAAO0AAAB+mN2dCCcQZX9AAAJwAAAAU5mcGdt513xxAAABbAAAACLZ2x5ZnG4U9AAAAwcAABAGGhlYWTZmSqXAAAA/AAAADZoaGVhFFYMOwAAATQAAAAkaG10eB9tcF8AAAHQAAAB4mxvY2EF//YmAAALEAAAAQptYXhwAz8BDgAAAVgAAAAgbmFtZe5DYDIAAEw0AAACoHBvc3RY+WD6AABO1AAAATdwcmVwvNkjIQAABjwAAAOCAAEAAAABAAHGNdnBXw889QAfCAAAAAAAtA17oQAAAAC382Za//j9sA5tBe4AAAAIAAIAAAAAAAAAAQAABe79sAAADnP/+P+qDm0AAQAAAAAAAAAAAAAAAAAAAG0AAQAAAIQASQAFAAAAAAACABAAQAAHAAACngCDAAAAAAABBNEBkAAFAAAAAAAAAAAAAAAAAAAAAAAAAHsCZggJAgsGAQICAgICBAAAAAMAAAAAAAAAAAAAAABCaXRzAEAAICIZBhT+FAGaBe4CUAAAAAEAAAAAAAAE0QBoAAAAAATRAAAE0QAABNEB7ATRAS8E0QDPBNEAugTRANcE0QC4BNEB7gTRAaoE0QE9BNEAugTRAN0E0QEZBNEA0wTRAawE0QEABNEAuATRASUE0QDhBNEAxwTRAMsE0QEABNEAuATRAMcE0QC4BNEAugTRAb4E0QEjBNEAqATRAN8E0QDVBNEBAATRAMsE0QC6BNEA0QTRAQwE0QEXBNEBEgTRAWYE0QDNBNEA8gTRATsE0QEKBNEAywTRASUE0QDFBNEA3QTRAL4E0QD2BNEAsgTRAQQE0QDyBNEA2QTRANsE0QCoBNEAvATRAK4E0QCwBNEBBgTRAVwE0QD+BNEBBgTRALwE0f/4BNEBbQTRAN0E0QDnBNEBIQTRALQE0QDfBNEBGQTRAMcE0QEQBNEBZgTRAWAE0QEIBNEBqATRAMkE0QDfBNEAwwTRAOcE0QCyBNEBPQTRAPoE0QEdBNEA4QTRAK4E0QDBBNEAwwTRAKAE0QEIBNEA2QTRAhQE0QDdBNEAYgTRAAAE0QDbBNEAYgTRALIE0QDNBNEBcQTRAe4GHwCsBNEB+A5zAAYE0QCuAL4AtADBANMA9AIUARcA1QC+AMcAwQEAAN0AxwDDAQABCgHhAeEBEAEQAOMBrAAAAAAAAwAAAAMAAAAcAAEAAAAAAPQAAwABAAAAHAAEANgAAAAyACAABAASAH0AgACgAKUAqAC1ALgAwgDGAM8A1ADWANgA3ADfAOYA+ALGAtwgGSAdICAgrCIZ//8AAAAgAIAAoACjAKcAtAC4AMIAxADOANEA1gDYANwA3wDlAPgCxgLcIBggHCAgIKwiGf///+P/4f/C/8D/v/+0/7L/qf+o/6H/oP+f/57/m/+Z/5T/g/22/aHgZuBk4GLftd5qAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQYAAAEAAAAAAAAAAQIAAAACAAAAAAAAAAAAAAAAAAAAAQAAAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYAAAbG0AAHF1dwAAAAAAeQAAAAAAAAAAAAAAAAAAAAAAAACCAABjZgAAeAAAAGhnAG52AAAAAGVpAAAAAAAAAAB6ewAAAAAAAAAAAABiAAAAAAAAAICBfn8AAAAAAGEAAAAAAAAAAABrAAAAAABvcABzdAByAAAAAHx9AAAAAGoAAAAAALYGBQQDAgEALCAQsAIlSWSwQFFYIMhZIS0ssAIlSWSwQFFYIMhZIS0sIBAHILAAULANeSC4//9QWAQbBVmwBRywAyUIsAQlI+EgsABQsA15ILj//1BYBBsFWbAFHLADJQjhLSxLUFggsKZFRFkhLSywAiVFYEQtLEtTWLACJbACJUVEWSEhLSxFRC0AuAKAQGOk/gOjFAOhFAOgawOfSAOdfQOcfQObEgOaGQOZmBQFmBQDl0sDlv4DlUEDlCADk8gDkpENBZJ4A5ENA5COJgWQ/gOPjiYFj30DjiYDjRQDjBADi/4DipYDiX0DiIcQBYgUA4i4//tAOgSHEAOGCwOFhJQFhf4DhcAEhINhBYSUA4SABIOCLgWDYQODQASCLgOBgEcFgbsDgEcDf34QBX8SA3+4//RAIAR+EAN9fA4FfX0DfA4DfC8EenkTBXr+A3l4DgV5EwN5uP/2QHsEeA4Dd1QOBXeWA3ZUDgV2eAN1fQN0fQNzcowFc/4Dc8AEcnFZBXKMA3KABHFwJgVxWQNxQARwVA4FcCYDb30Dbv4DbWQQBW19A2x9A2v6A2qWA2lkEAVp/gNo/gNn/gNmRANlZBAFZT4DZBADY/4DYpYDYWBBBWH+A2G4/9FA/wRgQQNfuwNeXYwFXv4DXsAEXVxZBV2MA12ABFxbJgVcWQNcQARbJgNZlgNXVkQFV2QDVkQDVVQOBVX+A1QOA1NSZAVT/gNSZANRUBIFUWsDUBIDT/4DTv4DTUwTBUwTA0oqA0lIFAVIFANGfQNDIANCAyEFQn0DQSEDQH0DPpYDPfoDPP4DO/4DOkQDOTgUBTmWAzgUAzdLAzY1ZAU2/gM1ZAM0/gMzuwMylgMx/gMwfQMv/gMu/gMtQQMsQQMrRAMqfQMp/gMn/gMmHgMmCgQlNAMk/gMj/gMiEgMg/gMfPgMeIQMdAyEFHbsDHEQDG5YDGl0DGf4DGA8DF2sDFkBVfQMVDhAFFX0DFP4DE/4DEmsDEQRHBRF9AxAERwUQuwMPDhAFD/4DDhADDSQDDBQDCQMhBQk+AwgERwUIlgMHfQMEAyEFBEcDAyEDApYDAf4DACUDALv/8AAEAAABZIWNASsrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysAKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrHQAAAB0A+gC4AJwAqgB1AYcAvgC4AKoB6QFUAXcChQD6AXkAuAC4ALgDYAA9AVQChQC+AAACzwCcA2QA8gCqAyUBCgLVAtcC1wDyAvAA1wJeAwQDVAMlA1QBSAE3AWQBBgJvAJwC6QCcAN8DNQC4AMMDNQCcAOEA3wMQA0wAnAAAAhABcwAlAKoAnAEvAq4AFABWAIcAnAAAApgAfQCJAHMEAAD6ANkFBAUMBQQEqgCcAJEAbQUEAa4FBAUEBQQFBACNAAAAEgCcAmoA+gEtAjUCIwDLAS0AAACcAz8BEgOBAjUEqgSqBKoEqgB9AJwEqgSqAo8CfwJ7AJwFFwUXAjMCMwAAAA4DgQOBA4EDgQAAAekB6QCNA4EBNQAAAJwBNQEjASMAAABkAAACuAAQAJwAnACsAQYAnADLAOkDgQCHAJwAjQOBAH0ARgBzAAAUAAAAAAAAIgAiACIAIgBIAGwAzAFSAcgCYgJ8AqwC3gNeA4gDpAO6A9AD6gRIBGYEwgUUBUgFmgXiBiIGjgbUBvgHIgdEB2QHhAfmCGYIlgj2CTYJbAmcCcQKFApACmwKoArOCuwLHgtIC4QLvgwYDGIMwgziDRoNRA2QDcIN7g4YDjwOVg56DqAOtg7ODzYPgA++EAYQUBCUEPYRLhFWEZIRxBHqEkASfhK4EwATShOCE+IUMBRyFJwU3hUQFUoVdBX0FgoWihcMFwwXYBfiGBwYxBjoGQAZYhl6GZAZ3hpEGo4ayhsWG4QbmhuwG8YcGByOHOAdNh3QHmwe4h8AH04faB+CH6gfzB/2IAwAAAACAGj+lgRoBaQAAwAHABpADASkAAakAQgFTgIEAC/E1OwxABDU7NTsMBMRIRElIREhaAQA/HMDG/zl/pYHDvjycgYpAAIB7AAAAuUFDgADAAcAIkARAgRRAFMGAwIAAQAFAQAABAgQ1OT85BE5OTEAL+z8zDABMwMjAzMVIwIIwRGfLfn5BQ784v7j0wAAAAACAS8C1wO8BKoAAwAHAB5ADQYCBABVCAYFBAIAAQgQ1MTE1NTEMQAQ/DzEMjABMwMjATMDIwEv0TuWAb3QO5UEqv4tAdP+LQACAM8AAAQGBQ4AAwAfAE1AMxIOChQIABwYBBYGARAMUx4aHx4dHBsaGRgXFhUUEhEQDw4NDAsKCQgHBgQDAgEAHhMFIBDUxBc5MQAvPOwy1Dw8zDIy1Dw8zDIyMAEDMxMBIzczEyM3MxMzAyETMwMzByMDMwcjAyMTIwMjAhBF/kX+GVgfVkWVHJZQh1ABAE6JUFIaVEaTHJZUh1T+VIcDK/7JATf+SIEBN4EBYv6eAWL+noH+yYH+jQFz/o0AAAADALoAAAQSBQwABgANADIAbEA/JSQTDggHBgcSAC8tLBQhIAMmMgYSAFcaElcsHRobUywtJiEHFAMuGhIDACwkHAMHAwQXIQQgCwQpDwQXDgIzEPTE7NTs1OwQ7tYXPMwXMhE5ERI5MQAvxv7GMhDuEO4RFzkREjkREhc5MAEOARUUFh8BET4BNTQmBTMeARcRJy4BNTQ2NzUzFR4BFyMuAScRFx4BFRQGBxUjJy4BNQInU2dVZYVaYl39r6YCZ16FbHO8qIWjnAukBk9Rc4VuvqiFAba2BC0HSjI7SRzh/sMPTzk9Up0+SQQBcDEoiFh8mQxYWBJ+ejk+Cv60KzGEaYSpEVhWBY2JAAAABQDXAAYD+gUEAAsAFwAjAC8ANQBIQCgYWCcGWBUnWh5YLRVaAFgwDzItWTYwKiEzAwUMBgkFEhsFJAYhBSo2ENTs/OzU7PzsORESOTEAEOwy1Dzs7BDu7hDuEO4wJTI2NTQmIyIGFRQWNxQGIyImNTQ2MzIWATI2NTQmIyIGFRQWNxQGIyImNTQ2MzIWATUBMxUBAzclKSgmJioq6WpZWmprWVhr/aIlKCglJykq6GlZWmtrWlhq/n0CxVT9QXM4MjQ3NzQ0NmpidXRjYnV1AoQ2NDQ3ODMyOGpjdHRjYnV0+3ZgBJ5e+2AAAAADALj/7gQvBRcADAAWADsAg0BIOS4NFgQTLQwAAzUGFzoTICw1BhNiGgZfJl41GmE6OTYzNSktDAADCQMxNSkgIxAWLhcDNQ0sCQMEKTUJOjYJBCkjEAg2HQc8EPTE7NTE7BDE7hDuETk5ERc5ERI5ERI5ERIXORESORI5MQAv5Mb+7hDuERI5ORESORESFzkRFzkwAT4BNTQmIyIGFRQWFwcOARUUFjMyNjcXDgEjIiY1NDY3LgE1NDYzMhYVFAYPARM+ATU0JyY1MxQGBxcjAlRCO1BCSlcoLicuLndeJ0giXDaBTajPVWBBPrSdk6dWVoP+FBMBAZ8sMH/VA2I3VioxPVVJKmZH6SllO114FxiDJSTPp2SfT1+cQ4ecfGxOlEdq/qE0blIBBQ4PmMlFrgAAAAEB7gJ3AuUEqgADABZACQIAVQQBAgMABBDU1NzEMQAQ/MQwATMDIwHu9ySvBKr9zQAAAAABAar/7gOTBRkADwAlQBIJBw8AYQdeEAcBDAgACgwIBBAQ1OzsMhE5OTEAEOz0zBDOMAUjJgI1NBI3MxUOARUUFhcDk3TFsK/GdJ2Sk5wSjgE3ztEBOI+Gbf+mpv5qAAABAT3/7gMnBRkADwAlQBIAAQoIYQFeEAgCAA0IBQoJABAQ1Dz87BE5OTEAEOz0zBDOMAE1MxYSFRQCByM1NhI1NAIBPXXGr7DFdZ6UlASTho/+yNHO/smOhWoA/6WlAQAAAAAAAQC6APAEGQQ9ACwAa0BBJyUkIR4dGxgVExEPDQsJDyoGFAMAChwUJgoBLRQTEQ8NCgYLAiYkIR4dHAYlAAkVCwIbJyUGGCoDAAsLAiULAC0Q1Ozc7BIXORE5ORESOTkREhc5ERIXOTEAENzEMsQyEjk5ETk5FzkwATUzFRQGBz4BPwEXDwEGBxYfAgcnLgEnDgEPASc3PgE3LgEvATcXHgEXLgECDrcLA0qjBDc6PwR/dEZcBC2PKylJIjlDFyuNKyVSLzVtVD44OQOlSgQLBAozMxDJQR46AhauEgEnGk94BTpoOzlvN1plIDtoOzJlNAwcGhKuFgE8HU7CAAAAAAEA3QC+A/QESgALACRAEQoIAAQGAgwHDAkFBAEMAwAMENQ87Pw87DEAENQ8xNw8xDABITUhETMRIRUhESMCEv7LATWsATb+yqwCNZ4Bd/6Jnv6JAAEBGf7NA7QBOwAEABZACgNmAGUFAQ0DBAUQ1MTsMQAQ/OwwASEVASMCiwEp/inEATuT/iUAAAAAAQDTAiMD/gLuAAMAErcAaAJnBAEABBDUxDEAEPzsMBMhFSHTAyv81QLuywABAawAAAMlAS0AAwAQtgBpAgEPAAQQ1OwxAC/sMAEhESEBrAF5/ocBLf7TAAEBAP/yA9EFGQADABdACgBeAmEEAgABAwQQ1MQ5OTEAEOTsMAEzASMDG7b957gFGfrZAAACALj/7gQZBRkAFwAvACJAEgBiHgxiKl4eYTAGEBgSECQCMBD07NTsMQAQ5PzsEO4wJTI2Nz4BNTQmJy4BIyIGBw4BFRQWFx4BARQCBw4BIyImJyYCNTQSNz4BMzIWFxYSAmhUUhMgHxscEFRdXFQQHBsWFxJNAhw6OySafn+XJzk6Ozgnl39vliZCRIsVGCjjvrXgNB8aGh8237Sc2DQtIQH21/7qTC4sLTFIAR7P0AEhSDEuJSU+/tQAAAEBJQAAAxcFBAAGABdACgABA1kFBBEBAAcQ1MTsMQAv/Mw5MAkBNSUzESMCXP7JAS/DuwQ3/vDj+vr8AAEA4QAKA/AFGQAhAFBAKhgVGQoLDgcBFAADGQoHYgoOGWsbag5eIh4iHBUBFAAYBBAaERgQChwSIhD0xOzUxOwROTk5ORESOTEAEOz07BDG7hESFzkREjkREjk5MAE3PgE1NCYjIgYHNT4BMzIWFRQGDwEOAR0BIRUhLgE1NDYB55JpT3teRKlxS6liwd91hXd+XQI3/QkCAXYCbWJHcUZOakZLyC8uvqNpqldOU4lZJZwPHx7I7QABAMf/7gP4BQQAHABEQCMMCQATDg0cAwADYhkOaxANVgkQWRlhHQ4TDAYQERYMDwASHRD0PMTUxOwROTkxABDk7NTsEO4Q7sYSORESORESOTA3HgEzMjY1NCYjIgYHJwEhNSEVAR4BFRQEIyImJ8dVo1OGo666AysTAQFY/d4DAv62sMn+9edIoFfnLiyUeXx1AwGBAWCcsP62B8upweAgIQAAAAEAywAABAwFDgAOAC5AFgcLAGsJBQNZDQQIBQMBBgAECgwIAQ8Q1NQ8xOwyETk5ETkxAC/s1DzsMsQwASE1ATMBIREzETMVIxEjArj+EwF/uP5xAUWsqKisASG+Ay/8sAEP/vGd/t8AAQEA//ID1wUEABsASEAlDxsSBBgHEmINB2IbGAJrAFkNYRwAGwMVDRsEFRABCgQRGwoOHBDUxNTsEMTuERI5EjkSOTEAEOT87NTE7BDuERI5ERI5MAEhFSEDPgEzMhYVFAQhIzUeATMyNjU0JiMiBgcBLQKD/h0ODyQlxfv+mP7CMQwcHOL5rJgma0YFBJr+9gEB5rfa+Z8BAaiYdIYJCQAAAAACALj/8gQZBQ4ACwAeAC5AGRAGYhNsAGIZYQxZHxAMCQMQDRYTCRAcEh8Q9Oz8xOwROTkxABDs9Oz87DkwJTI2NTQmIyIGFRQWEzMOAQc+ATMyFhUUBiMiJjU0EgJtcoGEdHGGiMPqd9ZtJlApq+Puvsfu+pGPfnWJjnZ4jwR9aPKbDw/or7/v9MzBAaEAAAABAMcAAAQQBQQAFgAyQBwUEQcEAwAGEBUMCGsKWRUREAcEBAMLFBEACwkXENTE1OwRORc5MQAv/Ow5ETkXOTAlNBI/AT4BPQEhNSEVFAcGDwEGAh0BIwF9e4FePSX9jgNJmhIKWG5nsKbGAVGZcUk/FweXO5C6FQxqhf7op7AAAAMAuP/uBBkFFwALABcALwBKQCwkGAwABmIeDFYAEmIqXh5hMCoeEgwGACQYCBUPEC0UCRAbFRAnFBsDECECMBD07MT07BDu9O4RFzkxABDk/OzU7BDuERI5OTABDgEVFBYzMjY1NCYnPgE1NCYjIgYVFBYFHgEVFAYjIiY1NDY3LgE1NDYzMhYVFAYCaIZxg3R1g3GHXmVmXVlpZAECknviz87ifo9oZ8iqqslmAnE/flZicXFiVX/zJ2c5RE1NQD5nfk+ygKe3vqx4r05ClFOEnZp/WZYAAAIAugAABBsFGQALAB4AK0AXEAZiE2wAYhleDBAMAwkQHBMDEA0WAh8Q9MTs/OwROTkxAC/87PzsOTABIgYVFBYzMjY1NCYDIz4BNw4BIyImNTQ2MzIWFRQCAmp1goVycYeIt/SR2U4lTiqu4urCy+rvBIGNf3WJj3d1j/t/kPlxERDmtL/n7cy0/mUAAgG+AAADEgN9AAMABwAbQA0CbQBuBG0GBQEVBAAIENQ87DIxAC/s/OwwASERIREhESEBvgFU/qwBVP6sA33+6/6q/u4AAAAAAgEj/uEDqAN9AAMABwAlQBMGbwQCbQBuBG0IBAAVAQUWBgcIENTE/NTsOTEAEOz87BDuMAEhESETIQEjAh8BPf7DGgFv/ljdA33+7f6t/coAAAAAAQCoADED/ATjAAYAF0AJBQMABwUDAAEHENTEMjkxABDUxDkwJQE1ARUJAQP8/KwDVP2mAloxAjw7AjvV/n3+fQAAAAACAN8BdQP0A5YAAwAHABlACgUEAgAIBAEGAAgQ1DzEMjEAENTc3MwwEyEVIQUVITXfAxX86wMV/OsDlp7mnZ0AAQDVADEEKQTjAAYAF0AJAAIFBwADBQEHENQ8xDkxABDUxDkwCQE1ARUBNQMx/aQDVPysAosBg9X9xTv9xNcAAAIBAAAAA88EvAAfACMAWkAxHRoAAwQeDQoEGR4QDgpiDhMeIFETcyIaIR0ZFgcDBB0IACEBIAcIFiAYDQgWGQ8XJBD07PzkEO4Q7tXuOTkREjkREjkxAC/u/s0Qxu4RORI5ORI5Ehc5MAE0Nj8BPgE1NCYjIgYdASM1NDYzMhYVFAYPAQ4BHQEjBzMVIwIlGyJUMytbT1pirrS0pMM8RWIPCq4l+PgCCCI3IlIxVjFFUV9XNCutq6GFTX5EZA8VFjvV2QACAMv/9gQIBLAACwA3AGdANxwdGRUPBgAfHRksKQYWJQwDDSYAEgZ0KQB0DTUZdB0iczUvKTgsDQwDCRoOFRolAxoOHBoyHjgQ1DzsxOzU7BDuFzkxABDEMsT8xOwQxO4Q7jIRORIXORESORESORESOTkREjkwASIGFRQWMzI2NTQmNzUzERQWMzI2PQE0JiMiBh0BIzU0NjMyEhEVFAYjIiYnDgEjIiY1NDYzMhYBxzU2OUA9OEFDjyAkNCiKoXl1l9O80txsgTVOGR5dP319dnkvRwI7aWh/cl9qfntEM/4zOTN2zcnqxGRpBgScsP7x/v3y+rwwMDAwtLKwrBwAAgC6AAAEHwSyAAIACgAoQBcAAwd1AQN2CQUJCAcGBAMCAQAJBRsKCxDU7Bc5MQAvPOzU7BI5MAEDIQMzASMDIQMjAmSHAQ/47wE8uVT+pFamBBf94QK6+04BWv6mAAAAAwDRAAoEJwSgAAgAEQAkAEhAKRkBdQl5AHUSCnUiahJ3JQgFABkWDgsCERMiBQAFCBYOCBweCQAdEhwlEPzsMvzs1OwRFzkREjkREjkxABDs9OwQ7v7uOTABETMyNjU0JiMDETMyNjU0JiMBITIWFRQGBx4BFRQGBw4BKwEhAX3Nk31/i9PNmouJjP53AabB0klMV1tlWi9ybzn+sgQE/rZLVVlR/h3+hVtjYF0Cf6eZW3cfH4llZqApFhMAAAAAAQEM/+wD2QSyABkAKkAWCmINEQRiABdzEWEaAQgADQgOBwgUGhDU7NTs1OwxABDk/MTsEMbuMAEjLgEjIgYVFBYzMjY3Mw4BIyICERASMzIWA9WyBUhAZmtqZ0FOArIRpoDD09m5g6YDlkBD5tnk70g9hpoBRgEwARMBPZgAAAACARcACgPsBKAABgAPACtAFwB1BwF1DmoHdxAIDgcABAgLIAAdBx8QEPzs/OwREjk5MQAQ7PTsEO4wARE+ATU0JiUzMgAVEAAhIwHBpcvI/q6D/AFW/sT+8osEBvyiBdyuuPy1/qH7/vn+ywABARIACgPpBKAACwAsQBgEdQZ6AnUACHUKagB3DAEFCSEHAx0AHwwQ/Owy/MTEMQAQ7PTsEO7+7jABIRUhESEVIREhFSEBEgLF/eUB2v4mAi39KQSglP61nP6DngAAAAABAWYAAAPPBKAACQAiQBIEdQZ6AnUAdwgFASIHAx0AHwoQ/Owy/MQxAC/87PzsMAEhFSERIRUhESMBZgJp/kEBb/6RqgSglv60m/3dAAAAAAEAzf/sA/gEuAAdADxAIBscAhgFAHUcGGIFEmIOC3MFYRweABsdDwgOARUICBceEPTs1Dzs/MQxABDE5PzE7BDuEO4REjkROTABIREOASMiAhEQADMyFhcjLgEjIgYVFBYzMjY3ESECTAGscJ5E3/oBAN+GsBayGk0vlJeTkCNSMf7+An39tiYhAUcBJwEdAUGBci0x5eLn7BMUATEAAAABAPIAAAPhBKoACwAmQBQCdQh5BABVCgYHAx0FJAkBHQAjDBD87DL87DIxAC88/Dz87DATMxEhETMRIxEhESPyqgGbqqr+ZaoEqv4MAfT7VgIb/eUAAAAAAQE7AAoDlgSgAAsALEAYCAB1CgYCdQR3CmoMCSUFJQcdAyUBJQAMENT87Pzs7DEAEOT87DIQ7jIwJTMRIzUhFSMRMxUhATvXsgIRs9j9pagDYJiY/KCeAAEBCv/uA2gEqgARACpAFgcBChAEAARiDWEIVRIHHQkmAB0QHxIQ/Oz87DEAEOz07MwROTk5OTABFRQWMzI2NREzERQGIyImPQEBtDxHRUKqk5yYlwGBP2lQU1UDefy+wrinqEQAAAAAAQDLAAAEZgSqAAoAJUASCAUCAwMAVQkGBQEEBggBHQALENTsMtTEETkxAC887DIXOTATMxEBMwkBIwERI8uqAePl/cUCZO/9/qoEqv4QAfD9y/2LAiX92wAAAAABASUACgQpBKoABQAaQA0CdQRqAFUGAycBHQAGENzs7DEAEOz07DABMxEhFSEBJaoCWvz8BKr7/p4AAAABAMUAAAQQBKoADAAsQBgKBwIDCAMAVQsFCQgDAgEFCgYdBAodAA0Q1OzU7BEXOTEALzz8PMQXOTATIRsBIREjEQMjAxEjxQEUkZIBFKq6i7uhBKr98gIO+1YEAP2FAn/7/AAAAQDdAAAD9ASqAAkAJUASBwIDAFUIBQYBBwIdBAcdABwKEPzs3OwROTkxAC887DI5OTATMwERMxEjAREj3c0BqKLF/lCiBKr8hQN7+1YDg/x9AAAAAgC+/+4EEgS+AAsAFwAjQBMAYg8GYhVzD2EYAwgMKAkIEgcYEPTs/OwxABDk/OwQ7jAlMjY1NCYjIgYVFBYBEAIjIgIREBIzMhICaG2Fg29ug4QCF/G5uPLyuLnxjfnU1fb11tX4Acn+7/6pAVgBEAERAVf+qQAAAgD2AAAEGwSgAAgAEwAsQBcBdRAAdQl3EggCChAABQgNKREAHQkjFBD87DL87BE5OTk5MQAv/OzU7DABETMyNjU0JiMlITIWFRQGIyERIwGgwIt3eXj+hQGZutLKrf78qgQI/oNYZWBgmLagn7n+DgAAAAACALIAAARWBL4AEQAjAEBAIhUYAwESAAkPYhgJYh5zGBMSIQMBAAMVDAYIEyEqDAgbByQQ9Oz8xOwRORc5ETkxAC/E/OwQ7hE5OTk5ETkwAQMzFz4BNTQmIyIGFRQWMzI2NxMjJw4BIyICERASMzISERQGArLv13QNDHplbXF8ah4u7c3ZZDViNLvh3rq15CwBBgE8mC1aM87x2dG+2hIT/vqFIyABPAELAQMBMv6//vpsswACAQQAAAQhBKAACAAWAEFAIhABdRMAdQl3FRESDQUKEAIIEwARBQgNEB0TFAAdDR4JHxcQ/Oz8PNTsEO7EERI5ORE5ERI5MQAvPP7u1u45MAERMzI2NTQmIyUhMhYVFAYHASMBIxEjAa6DfX14hv7XAUDRzn14ATPN/uuRqgQI/oVbXGddmKmrgqEb/fIB8v4OAAAAAQDy//ID3wS6ACgASEAoFRgJCh4fBAATGGIQAANiJXMQYSkJCh4fAwAGCCIACCgbCA0iFAgTKRDU7MTU7NTsEO4RFzk5MQAQ5PzsxBDuxhEXORE5MAEuASMiBhUUFh8BHgEVFAYjIiYnMxUUFjMyNjU0Ji8BLgE1NDYzMhYXAx0EX1BPZ1h3RJp+1rWntQa4W1FcdVCeVHRz0KmYuQsDh0hSWEI4WTogTKN0lrGwqAZYYWRMQVlMKTecZouso5AAAQDZAAAD+gSgAAcAGkAMBAB1AncGAwUdAAEIENTU/MQxAC/87DIwASE1IRUhESMCFP7FAyH+xKoEBJyc+/wAAAEA2//uA/gEqgAUAClAFQgCCxQABWIOYQkAVRUIHQoBHQAcFRD87NzsMQAQ7DL07BE5OTk5MBMzERQWMzI2NREzERQGIyImJy4BNduqan58a6TI0mqnMCQeBKr9BKZ7gp0C/vzn18xLRjOHpgAAAAABAKgAAAQlBKoABgAqQBQCAwBVBQIGAwUEAQYABCsFACsGBxDU7NzsERI5ERI5ETkxAC/sMjkwEzMJATMBI6i2AQ8BDKz+vvMEqvv6BAb7VgAAAAABALwAAAQMBKoAFABEQCQQBwQFCgBVBREOEAUGAxEHDwoEEQEKHQssDh0PEh0RLAEdABUQ1Oz07NTs9OwREjkREjkRFzkxAC88xOwyEjk5OTATMxoBFxMzEzYSEzMKAQcjCwEjJgK8sAIgHnOZeRUaCqIHOjiyeXS3OD4Eqv72/jnHAcf+OZcBlwFq/m79yOABsv5OzwI5AAEArgAABB8EqgALAClAFgkDBAFVCgcKCQgGBAMCAAgBBQcBCwwQ1MTUxBEXOTEALzzsMjk5MAkBMxsBMwkBIwsBIwH8/rTN5+y8/sEBUsvy8cMCYAJK/lgBqP3A/ZYByf43AAABALAAAAQQBKoACAApQBQDBAFVBwQFAwYCAQAFLQYdAS0ACRDU5PzkERI5EjkROTEAL+wyOTAJATMbATMBESMCFP6cy+/suv6uqgIbAo/+NQHL/YP90wAAAQEGAAoDywSgAAkAJkATAXUDBnUIagN3CgYBAgQHAgAuChD0xNTEETk5MQAQ7PTsEO4wJQEhNSEVASEVIQEGAcf+PwKF/kAB+v07kQN1mo78lJwAAQFc/+4DywUZAAcAIUARA3sBBXsAYQFeCAYCLwQdAAgQ1OzsMjEAEOz07BDuMAURIRUhESEVAVwCb/47AcUSBSua/BChAAAAAQD+/+4D1QUZAAMAF0AKAmEAXgQDAQIABBDUxDk5MQAQ7OQwEzMBI/68Ahu6BRn61QAAAAEBBv/uA3UFGQAHACFAEQJ7BAB7BmEEXggBHQUvAwAIENQ8/OwxABDs9OwQ7jAlIREhNSERIQEGAcX+OwJv/ZGPA/Ca+tUAAAEAvAJtBBIFCgAGACBAEAYEAgMFAwB9BwUEAwMCBgcQ1MQXOTEAEPzEMhc5MAEzAQcJAScCP1IBgWj+vv6/awUK/blWAVT+rFYAAAAB//j9sAUn/kwAAwARtgB7AQQCAAQQ1MQxABDU7DADNSEVCAUv/bCcnAAAAAEBbQP2AuUFDgADABO3AAF9BAIDAQQQ1MQ5MQAQ/MwwAQMzEwI90N2bA/YBGP7oAAIA3f/0A8cDjQAMACkAU0AsGRYACgQaIBYNKAonFgQgHV8kCl8QBF8WfySFEIEoGQ0AMicgGiEnMQcwEyoQ1Ozs1OwQ7jIyMQAv5O727hDuEP7EERI5ERI5ERI5ERI5EjkwASYnJiMiBhUUFjMyNhcOASMiJjU0NiEyFjM1NCYjIgYHIz4BMzIWFREjAzMSHSkMqqZYRnWcBTeOVY+t/gEODTEMandBRwynDKOQwbCUAaECAQJPUTlKn69AP5p+mY4CBmpfIiRoa6e3/dEAAAACAOf/8AQdBQwACwAcADpAHw4RBhobAF8XBl8RhQxTF4EbGxoMCQMwFDQNCTIMMx0Q9Owy/OwREjk5MQAv5Oz87BDuETkREjkwJTI2NTQmIyIGFRQWATMRPgEzMhYVFAYjIiYnFSMCg3aChnJ4jIz+3Jg5j1Wx0M2wZIs6kIOomI6nqJKSqQSJ/gQ8PfXT2fg/SHcAAQEh//QDzQOFABkALEAYDYYKXxEAhgRfF4URgRoBGgANGg4HMBQaENTs1OzU7DEAEOT8/OQQ/uQwASMuASMiBhUUFjMyNjczDgEjIiY1NDYzMhYDxaYFSEFqZmJiR08GrAasmqW7w7yFmQKHOj2UmaiqTU2Ol/PX4OeFAAIAtP/wA+wFDAALABwANUAdDBoAEQ8GXxQAXxqFDVMUgQ8JERADDDIONAMwFx0Q1Oz87Bc5MQAv5Oz87BDuETkREjkwASIGFRQWMzI2NTQmNxEzESM1DgEjIiY1NDYzMhYCTnGHgnZ5jY6MmpI8imOwzdCxVY8C+KiNmKiqkZGpGAH8+vR3SD/42dP1PQAAAAIA3//yA/QDiwAGABwANkAdFwcUAIkViANfEQcaXwuBEYUdBxoIABoUFgYaDh0Q1Owy3OzU7DEAEOz0/MQQ7v7uORI5MAEuASMiBgcBMw4BIyImNTQ2MzIWHQEhFRQWMzI2A04Lcl5bexQBibcQqobI4uDAs8L9lYh2OUYCLWZvcGX+lmJv9NvV9frpBgqDlCEAAAABARkAAAOyBQwAFgBAQCAOAgtfCRMAiRECiglTFQMBAAkKDhEGAQASChQRMgABFxDU1Pw8xDIREjkSORE5ERI5MQAv7PQ87DIQ7hE5MAEjNTMuATU0NjsBFQ4BFTAWFSEVIREjAhT7+QEBss8hmm4CAQb++pgC7o8NHBuymY0CV3YiEY/9EgAAAgDH/ssD4QOHAAsAKABNQCodDxwgBgwNABWMGV8SBl8gAF8mhRKLIA2KKQkWHAwyDhYaFQMwDjcjNikQ9Ozs1OwQ7jIROTEAEOTE5PzsEO4Q/uQREjkREjk5OTABIgYVFBYzMjY1NCY3NTMRFAYjIiYnMx4BMzI2PQEOASMiJjU0NjMyFgJOaX15bXCEhIqZut2esgapBlBjiWkxiFamzMupV4gC+JeAipmag4SZFm/83du0dm0vJ2aYUj497cPC6D0AAAEBEAAAA8EFDAATACxAFgsOBgARBwNfDoUJUxIHADIRCgYyCBQQ3Owy3OwxAC887PzsETk5ORE5MAE0JiMiBhURIxEzET4BMzIWFREjAydLS3tumJg0gECPlpoCKWhpyOr+uAUM/hEzN6qk/ccAAAACAWYAAAMfBQwABQAJACNAEgCJAgiNBlMCigQGOQcDMgABChDU1PzU7DEAL+T87BDuMAEhNSERIwMzFSMCef7tAbWiPOLiAt+S/I8FDMoAAAIBYP7dA0YFDAADABEAOUAeBxAEDF8KBIkFAo0AUwqPBYoSCg0EADkBBjIEEAsSENTUzPzU7BE5OTEAEOTk/OwQ7hDuETk5MAEzFSMDNSERFAYrATUzMjY1EQJq3NylAXaLk72BcVQFDMr+oZD8yLSqkmeSAnsAAAEBCAAABBQFDAAMAChAFAkGAgMEAFMEigsHBgEFBwoBMgANENzsMtTEETkxAC885OwSFzkwATMRMwEzCQEjASMRIwEImgwBYOD+SQHd2/51DJoFDP0fAVL+ef4KAbL+TgAAAAABAagAAAODBQwACwAgQA8GAwQJXwRTAAkACgUyAwwQ1PzEOTkxAC/s7BE5OTAhIiY1ETMRFBY7ARUDAMKWmmacP6P5A3D8rMNkkQAAAQDJAAAEDAOHACIARUAlIBoXEQQODwgCHRRfAgsFhQCKIRgPCBkXEDIOGTIXASAyFwA6IxD0xPzEEP7W7hESOTEALzw85v48xu4yETkRORc5MBMzFT4BMzIWFz4BMzIWFREjETQmIyIGFREjETQmIyIGFREjyY8iUS8vTR0oXThfXZclJzo3lyMpPTiXA30+JCQzMzMzmZz9rgJ5QUB+hv4KAn9DOHqK/goAAAEA3wAAA/ADhwAXAC5AGBQLCAkCAA5fBYUAihYJCjIIOxQBMgAzGBD07DL87DEALzzk/OwRORE5OTkwEzMVPgEzMhYZASMRNCYjIgYHDgEdAREj35hAkVC5n5hUZlB+KBsWmAN9fURD0f74/lIBuLyKREErcXsa/rgAAAACAMP/8gQOA40ACwAXACNAEwBfDwZfFYUPgRgDMAw8CTASNhgQ9Oz87DEAEOT87BDuMCUyNjU0JiMiBhUUFgEUBiMiJjU0EjMyFgJoeI+Qd3ePjwId6L696Om8vuh/rZKTra2Tkq0BP9D8/NDQAP/+AAAAAAIA5/7dBB0DiQALABwANUAdDgwGGgBfFwZfEYUbkBeBDIodAzAUNBoNCTIMMx0Q9OwyMvzsMQAQ5OTs/OwQ7jkREjkwJTI2NTQmIyIGFRQWATMVPgEzMhYVFAYjIiYnESMCg3aCh3F4jo3+3ZY8kFOx0M2wYY01loeomI2oqZCSqgL2bT089dPV9Do//mwAAAIAsv7dA+kDiQALABwAOUAfERQGDA0ABl8UAF8ahQ+QFIENih0QDAkyDjQDMBcSHRD07PzsMjIxABDk5Oz87BDuERI5ERI5MAEiBhUUFjMyNjU0Jjc1MxEjEQ4BIyImNTQ2MzIWAk5xh4J2eY2Pj5WVN4xgss3RslKPAvyojZioqpKQqRRt+2ABlD869NXT9TwAAAABAT0AAAPNA4kAEwAwQBgLDhESCAkCAA5fCQWFAIoSCjIIEQEyABQQ3Owy1OwxAC/k/MTsETkRORI5EjkwATMVPgEzMhYdASM1NCYjIgYVESMBPZgxe0p6iJo6NG2DmAN9aTs6kIIGDD1Exar+cQAAAQD6//ID0QOLACcARkAoCQodHgQTAJIDXyQTkhdfEIUkgSgdCQoeAxoUPRMGPSEaPQ0APSEnKBDUxOzU7BDu1O4RFzk5MQAQ5Pz85BD+5REXOTAlHgEzMjY1NCYvAS4BNTQ2MzIWFwcuASMiBhUUFh8BHgEVFAYjIiYnAZMLYFhubTVUi4h+t7uRlgKZBUxgXFxCaIV2fMKrra0Q4zIyPT4oLRcnJnpegn6AfQFAMzc4LDQaIx58VoCSc34AAAAAAQEd//oDsgSDABsAQ0AiBQYDEhUOCxsRAQ5fERUJAYkGBwOKFRwEMgY+EQgKMgACHBDU3PzMMvTsMQAQxPQ8zOwyEMbuERI5ORESORESOTABESM1MzU3ESEVIREUFjMyNjcVDgEjIiYnLgE1AdW4xJoBN/69QEslWTo4cDtIbSAUEQFYAY+Q4Sv+9JD+b3BdHR+YGhk4NCFSUgAAAQDh//YD8gN9ABoAMEAZFw4LDAgCABFfBYEZDIoAFwEyADsNMgszGxD07PzsMjEAL+Qy9OwROTkROTk5MCEjNQ4BIyImJy4BNREzERQWMzI2Nz4BPQERMwPymEKSWVqMKiAcmFhqSn4mGheYfUZBRkEygp4Brv5Kv4lGPytxexoBSAAAAQCuAAAEIQN9AAcAKkATAgQAigYCAwcEBgUBBwAFBgcACBDU1NzEERI5ERI5ETk5MQAv5DI5MBMzATMBMwEjrqYBEA8BEJ7+uucDff0CAv78gwAAAQDBAAAEFAN9ABMAOEAhEQwJBgIFBw0AigcSDxIREAwJCAcGAgkBDTIPDgEyEwAUENTE7NTE7BEXOTEALzzE5DISFzkwEzMTFBcWFRMzEz4BNRMzAyMLASPBn0ACDGSzZgUJPJ9yy29qywN9/eMDClhPAXP+jTFqBQIx/IMBi/51AAAAAQDDAAAEDgOBAAsAKEAVCQYDAAQEAYoKBwkGAwAEAQUHAQsMENTE1MQRFzkxAC885DIXOTAJATMbATMJASMLASMCBv7NvtfVs/7ZAUXC6um2AcEBwP66AUb+TP4zAVL+rgAAAAEAoP7ZBD8DfQAPADNAHA4KAhAFAApfCI8DAIoQDw4LCAUDAgEICQQJABAQ1MTEERc5MQAQ5DL07BE5EjkROTATMwkBMwEOASsBNTMyNjcToLQBKwEZp/3TN1VPUkwWIQu4A3399AIM+/5lPZQSEgFOAAAAAQEIAAoDywNzAAkAJUASAYkDBokIkwOKCgYBAgQHAgAKENTE1MQROTkxABDk9OwQ7jAlASE1IRUBIRUhAQgB/P4nAov+DQII/T2uAjOSrP3VkgAAAQDZ/+4D9gUZAC4AeUBDKRwtHxQHEAAbKC0fCxAOGC0IFRAAIiEfeyUAey2UEHsOXiVhLxsYFQMULSspBwQBBggAIh8RDgQPHBQdIA8/KAgALxDU3DzsMuwyERc5ERIXOREXOTEAEOT87PzsEO7AwBESOTkSORESORESOTkREjk5ERI5OTATMzI2NTQ2PwE+ATMyNjsBFSMiBg8BDgEHHgEfAR4BOwEVIyImIyImLwE0NSYrAdlMaFADAQQMsdECLRRAQMNcCAgGOjk5OgYICFzDQEAFNBfGsAsEC7FMAtE/TAItFDyskAKeTHVkXGQTE2RcZHRNnQKRqjsFB8MAAAECFP3fAr4F7gADABG2AgAEAR0ABBDU7DEAENTEMAEzESMCFKqqBe738QAAAQDd/+4D+gUZACwAe0BCJhkqHBEEDQAlGCoiHhwIDQsVKgUSDSp7AA17Cxx7AJQeXgthLRwOEQwqJgQCAAUrGBUSAwUfCwwZER0rJQU/HQwtENQ8/DzM7DIROTkRFzkSFzkREjk5MQAQ5Pzs7BDuEO4SOTkSORESORESORI5ORESOTkREjk5MAEiBwYVBw4BIyIGKwE1MzI2PwE+ATcuAS8BLgErATUzMhYzMhYfARQXFjsBFQOssQoBAgyy3gYlDD55iV0IBgY7Ojo7BgYIXMNAPg00DsixCwIBDK9OAjW+CwY6ro4CnU5zZFtlExNlW2R1TJ4Ck6k7Bg28nAAAAAEAYv/uBFwFGQA0AGRANwViCAwSARQAKx0tGyQoYiFeDGE1NC4tLCsAAQclGxUxHRwUAxgTAiUSHjEYJRAkCBAJMRATGDUQ1MTs1OzU7BESOTkRORESFzkROTkSFzkxABDk/OzE1DzMMtw8zDIQxu4wAQchHgEzMjY3Mw4BIyImJy4BJyM3My4BNTQ2NyM3Mz4BMzIWFyMuASMiBgchByEOARUUFhcDOSL+1Q6GY1FzA7IUwph2tjkfLgnRJaIBAQEDtiOfHfOrmrsRtAVjVVuEGAGXI/6AAwIBAQJEiI6lTDmHmWJeMZFMiA0jIg4eH4fB8JWIQEeXhIceJQ8gHg0AAAAAAQDbAAoD9gUXABwATEArDBEJBhQNBBFiDQkVBJYCGQBrG2oXAgleHRkYFhUUDgYFAgEKAxoMAwASHRD0xMQyERc5MQAQ7MQy9OwyEO4yEMbuERI5ORESOTA3MxMjNTM3PgEzMhYXFSMuASMiBg8BMxUjAyEVIduBZbfZNCqVbjFWKy8kNx4zOho0tdllAez85aYBqpnTsKskJqItI0tt2pn+VpwAAAAAAQBi/+4EXAUZADQAZEA3BWIIDBIBFAArHS0bJChiIV4MYTU0Li0sKwABByUbFTEdHBQDGBMCJRIeMRglECQIEAkxEBMYNRDUxOzU7NTsERI5ORE5ERIXORE5ORIXOTEAEOT87MTUPMwy3DzMMhDG7jABByEeATMyNjczDgEjIiYnLgEnIzczLgE1NDY3IzczPgEzMhYXIy4BIyIGByEHIQ4BFRQWFwM5Iv7VDoZjUXMDshTCmHa2OR8uCdElogEBAQO2I58d86uauxG0BWNVW4QYAZcj/oADAgEBAkSIjqVMOYeZYl4xkUyIDSMiDh4fh8HwlYhAR5eEhx4lDyAeDQAAAAABALIAAAQfBKoAEAAyQBkHBQsClw0ACAVVDwcACUAMDgoEBUABAwARENQ8xOT8PMTkEjkxAC/sMtQ87DIROTABITUhNQEzGwEzARUhFSERIwIS/s0BM/6gvfH0y/6NATP+zZoBapbBAen+sgFO/hfBlv6WAAIAzf/uBAYFGQATAEgAfkBMLxUTDQoJAwAIJD5DGy41FAQ/JJEoliE/kUOWO2EhXkkuCgADAwkNExUULwcrJTUkEBseBhBCMiVCJAZCGDJGQiQ4K0IeQUBCGDg+SRDUxMTs9OwQxO7EEO4Q7hDuERI5ERI5ERIXORc5MQAQ7PT85BD+5BEXORI5Ehc5MAEuAScOARUUFh8BHgEXPgE1NCYnAycuATU0NjcuATU0NjMyFhUjLgEjIgYVFBYfAR4BFRQGBx4BFRQGIyImPQEzHgEzMjY1NCYCIy8uFBwZUmaFHTcbGxhWXFCMcYwyNiAf07SmurEEV1RlcFSaenF9JykpK9u6veeyD3Npa39bAucFCwkbLhkxLwkKAwkGGCoYLDMJ/r8KCYNhP1khHlA0iaSWhUBBRT45ORMRDXxgOFIcKGU6hJ6ogQxQTE1APzoAAAIBcQQCA2AFCAADAAcAHUAOBgKZBAB9CAFDAARDBQgQ1Ozc7DEAEPw87DIwATMRIwEzESMCtKys/r2srAUI/voBBv76AAAAAAEB7gP2A2gFDgADABO3AgB9BAABAwQQ1MQ5MQAQ/MwwATMDIwKL3dCqBQ7+6AAAAAEArAAABXMDiQAqAEZAJhYNCQAECxwaIigLEANfJR+FGoopGAsiDAkAMihFDDIJRRsWMhkrENTsMvz8/OwREjkxAC88POT8POwyETk5ETkRFzkwATQmIyIGBw4BHQERIxE0JiMiBgcOAR0BESMRMxU+ATMyFhc+ATMyFhURIwTdRVJAZh8UEZVHVzpmHBUSmpo7fEJeeiQxkV+HkJYBtr+JQz4oZ1hO/rgBtsOFRDsqcnki/rgDfWY5OUtQTk2ro/3FAAABAfj+2wMGACEAAwAUtwIABAIAAQMEENTMOTkxABDUxDAlMwMjAm+XUrwh/roAAAABAAYBjw5tAn0AAwARtgCbAgQBAAQQ1MQxABDU7DATIRUhBg5n8ZkCfe4AAAQArgAABCsFFAACAAoADgASAExAKwABEQ2cCwd1AQN2Dwt9CQUJDwgHAAQDAgEHEAYMCxAdDwsdDEYFGw9GChMQ1OT89OwQ7hESORIXORE5MQAvPO4y7tbuEO4yETkwAQMhAzMBIychByMBMxUjJTMVIwJmlwEz5aEBbbRK/ndKrAK8qqr9WaqqA7D96AMa+078/AUU5+fnAAAAAAMAvgAABBkFFwALAA8AIgBVQDAXEA0ABp4dE3UMDZ4AnQwdfRURFxUUAxoJExIQAyAPDg0MBAkDSSBHEQlJGkcRFiMQ1MT87BD87hEXOREXORESFzkxAC887sb+7hDsEO4REjk5MAEyNjU0JiMiBhUUFhMDIwMBEyMnIQcjEy4BNTQ2MzIWFRQGAmpbYmFcW2Fh91yFXAF517M5/nU4rNU8RbudnbxCA39IQUFGRkFCR/4IAXf+iQGo/NHn5wMtIHRHe5SVekZuAAAAAAIAtAAAA/gEoAADABMARkApAXUQCHUKeQYAdQQMdQ5qBHcQEhIREAMCAQAECBMMCwgHBA8JBQ8NExQQ1NTExMQRFzkSFzkxAC/E7PTsEO4y/u4Q7jABAzMDJyEVIRMzFSMTMxUhAyMDIwIfc8UjqAJK/vMZ698b1f6TEO47ngQK/cECP5aW/rCZ/oWcASX+0QAAAAACAMH/7AQXBKoAEAAUACxAFgMQCgENYgoGYREBVRMJCQAdAhIdERUQ3OzU7MQxAC887DL0xOwREjk5MAERMxEUBiMiJic1HgEzMjY1ATMRIwNtqoeYIlY4NFAbQkT9VKysAX8DK/ywxqgJC6oPEFZUA3X7VgAAAAAEANP+3QP+BQwAAwAHAAsAFwBIQCYNFgYEEl8QCgKNCABTEI8MBIoGEBMRCDkJADkBERYyCQwBBTIEGBDc/MTUxPzEEO4Q7hE5OTEAL+Yy5P487jIQ7hESOTkwEzMVIxczESMBMxUjFxEUBisBNTMyNjUR0+HhI5mZAiXj476LlLyBcVQFDMrF/IMFDMrF/L60qpJnkgMVAAIA9AAAA9sFFwAcACYAYkAzJB8iHRAWEwEHBA8WEwkABwQTB5UaBBYMfSAdJSIjHhABBA8AFgcIFhdKHx0hJB0ISh0nENTk7NTs9MwQzhE5ORc5MQAvPM4y/sTO1uTOERI5ORESORESORESORESOTkwAScuASMiBhUjNTQ2MzIWHwEeATMyNjczFAYjIiYFMwERMxEjAREjAlotDyUSHSCidFsrSSgtDyMTHiAConVcKkf+b9cBcp7Z/o+dBEQgCwwvKwRshhkdIAwLLi5uihiv/XUCi/yJAov9dQABAhT93wK+BOUAAwARtgIABAEdAAQQ1OwxABDUxDABMxEjAhSqqgTl+PoAAAEBFwA9A7wExQADABC1AAIEAQAEENTEMQAQ1MQwASERIQEXAqX9WwTF+3gAAQDV/nkD/P9CAAMAEbYCaAAEAQAEENTEMQAQ1OwwFyEVIdUDJ/zZvskAAAAEAL7/8gQSBRIACwAXABsAHwA5QB8AYhUGYg8eGpwcGH0PFWEgGB0ZAwgSHR0cCQgSKgwgENTs7NTsEO7U7jEAEOTM/DzsMhDuEO4wJTI2NTQmIyIGFRQWATQSMzISFRQCIyICATMVIyUzFSMCamqAf2tsf3/+x/KxsfPysrHyAqOqqv1WqqqNzK2tysmur8oBeeQBL/7R5Ob+0gEvA/Hp6ekAAAMAx//ZBAgEywAJABMAKwBhQDcUKQ0gHRMKCQAEAxcpDSMdAw1iFSkDYiEdVCksIiYQFhohFRMKCQAGFyAjFAQGEAgmKgYIGgcsEPTs/OwRFzkXORI5ERI5MQAQxPzE7BDE7hESORESORIXORE5ERI5MAEuASMiBhUUFh8BHgEzMjY1NCYnAwcjNy4BNRASMzIWFzczBx4BFRACIyImApsLGhJ7dCUndBUfCnVyKCj8HoorZmTNwhcyIh6FK2doyb4SNwPfAQG2w36sND0DA8PKcKY2/KFoj0j1sQEGARUFBWSMSPip/vj+6QUAAwDB/+4EEgUQAAMABwAdAD9AIRsVCRIIAxgTBgKfABhiD2EcEwQAfR4bHQAIAQUUHRIEHhDUPOzM1DzM7DEAEOwyzDL07BDuMhESFzk5OTABIRUhJSEVIQEVFAYHDgEjIiYZATMRFBYzMjY1ETMDEAEC/v79sQEC/v4DURodNrt93c+peI+JdaMFEIODg/1SKWh2Mltd7wECAfr+Pt+rr9sBwgABAQAAAAQhBRIAJQBAQCIjACAJGqAYIF8DUxFfJA8ZEBgPEgMjCRUdMAYVMAwjMgAmENTs1OzU7BE5ERc5OTkxAC887Pzs1Ow5ETk5MAE0NjMyFhUUBgceARUUBisBNTMyNjU0JisBNTI2NTQmIyIGFREjAQC1vrPSTU9oXaWQKxRXVXp0DGZtcGGAbZwDJ/zvuJ5YhjImm4ulu5NtcXJ5nGZgW2qUvvzPAAAAAwDd//QDxwUMAAsAGABBAHVAQCUiDBYQJiwiGUAWPyIQBqI2Fl8cEF8iLKMpojwwAKEifzZTHIFAPDkMMBMJTTNLA005JRkMMj8sMC0TMD8xH0IQ3Ozs1OwQ7jIy1O7+7hE5ERI5MQAv5O7m/sYy/uQQ7hDuEO4REjkREjkREjkREjkSOTABMjY1NCYjIgYVFBYBJicmIyIGFRQWMzI2Fw4BIyImNTQ2ITIWMzU0JiMiBgcjPgE3LgE1NDYzMhYVFAYHHgEVESMCZF5lZF9eZGQBLRIdKQyqpllJdJsDNY9Wj63+AQ4NMQxrYEdlFpkEPjo4OLGamLQxOUU8lANxSkVGSUlGRkn+MAIBAk9ROkmgsD9Amn6ZjgITVGA4M0BVFSJlRHuPj3dEXywYgoT95wAAAAADAMf/8gQKA4sACAATAEQAfkBEIyAGOzgvAz41MhEJLDMKHQYDABUpBBsUAYkzKgoYBl8gEV8+gSYghUVECxsjOwkAMgIwKRQJMAAbMBwrAA4wNClBNkUQ9MQy7MQy1OwQ7jIQ7jIREjk5ETk5MQAQ7DL07BDuMtY8xf48xRc5ETkREjk5ETk5Ehc5ERI5MAEVMzU0JiMiBgM1IyIGFRQWMzI2ETU0JiMiBgcjNTQ2MzIWFz4BMzIWHQEhFRQWMzI2PQEzFRQGIyImJw4BIyImNTQ2MwK0vy00MiyTLVBELC43MC8vLisEm4FwQV0OF1lHc3j+qjAzKzGXcndGWxYYXkRyd4emAndjZ0tAQf5sXkZTPTpSAUNpRkM4PwdygzcvNDKWkdV/TEc6MhcGhYE0NDU1hYGcgAADAMP/YgQOBAQACQATACsAX0A1IB0LCgkABAMXFCkOIx0DDl8pA18hHYUpgRUsIyImERYXGiEVCwoJAAYgFAYRMCY8BjAaNiwQ9Oz87BE5ORc5Ejk5ERI5OTEAEMTk/MTsEO4REjkREjk5Ehc5ETkwAS4BIyIGFRQWFwkBHgEzMjY1NCYBByM3LgE1NBIzMhYXNzMHHgEVFAYjIiYCzxsvGHyPJCQBg/7fFykUfpEi/nhfi4FOS+q9KlMtVI55SkfnuitUAucMC6uVTHIpAcf98wkJqpVMcv2SrOpCtnrQAP8QE5rbRbJ0zv4OAAEBAAP2A9EFCAAGABhACgQFAgB9BwQCBgcQ1MQ5MQAQ/MwyOTABIRMjJwcjAeMBD9/Hop/JBQj+7qysAAEBCgQOA8cFFwAdAEBAIRAWEwEHBBgPFhMJAAcEEweVGwQWDH0eFhAPBwEABhcIHhDUxBc5MQAQ/MTM1OTMERI5ORESOTkREjkREjkwAScuASMiBhUjNTQ2MzIWHwEeATMyNjczFRQGIyImAlwtDyUSHSCidFsrSSgtDyMTHiACoHRbLEgERCALDC8rBGyGGR0gDAsuLgRsiBkAAAEB4QKmAvAFEAADABdACgJjAFMEAQIDAAQQ1NTcxDEAEPzsMAEhAyMB4QEPKb0FEP2WAAABAeECpgLwBRAAAwAXQAoCYwBTBAECAwAEENTU1MQxABD87DABIQMjAeEBDym9BRD9lgAAAgEQAw4D2wUQAAMABwAgQA4EAAYCUwgCAAEGBQEECBDUxNTEEMbGMQAQ/DzEMjABIxMzASMTMwPb40Gi/hnkQqIDDgIC/f4CAgAAAAIBEAMOA9sFEAADAAcAHkANBgIEAFMIBgUEAAIBCBDUxMzU3MQxABD8PMwyMAEzAyMBMwMjARDkQKQB6ONBogUQ/f4CAv3+AAEA4wAAA+wEqgALACNAEQgEmgoCAAYDRAUBHQlEBwAMENQ87Pw87DEAL9TUPOwyMAEzESEVIREjESE1IQISqgEw/tCq/tEBLwSq/qyH/TECz4cAAAEBrAF3AyUCpAADABC1AAIEAQAEENTMMQAQ1MwwASERIQGsAXn+hwKk/tMAAAAOAK4AAQAAAAAAAAA3AHAAAQAAAAAAAQALAMAAAQAAAAAAAgAHANwAAQAAAAAAAwAdASAAAQAAAAAABAALAVYAAQAAAAAABQAZAZYAAQAAAAAABgAVAdwAAwABBAkAAABuAAAAAwABBAkAAQAWAKgAAwABBAkAAgAOAMwAAwABBAkAAwA6AOQAAwABBAkABAAWAT4AAwABBAkABQAyAWIAAwABBAkABgAqAbAAQwBvAHAAeQByAGkAZwBoAHQAIAAxADkAOQAwAC0AMgAwADAAMQAgAEIAaQB0AHMAdAByAGUAYQBtACAASQBuAGMALgAgAEEAbABsACAAcgBpAGcAaAB0AHMAIAByAGUAcwBlAHIAdgBlAGQALgAAQ29weXJpZ2h0IDE5OTAtMjAwMSBCaXRzdHJlYW0gSW5jLiBBbGwgcmlnaHRzIHJlc2VydmVkLgAATwBDAFIALQBCACAAMQAwACAAQgBUAABPQ1ItQiAxMCBCVAAAUgBlAGcAdQBsAGEAcgAAUmVndWxhcgAATwBDAFIALQBCACAAMQAwACAAUABpAHQAYwBoACwAIABNAG8AbgBvAHMAcABhAGMAZQAgADgANgAxAABPQ1ItQiAxMCBQaXRjaCwgTW9ub3NwYWNlIDg2MQAATwBDAFIALQBCACAAMQAwACAAQgBUAABPQ1ItQiAxMCBCVAAAVgBlAHIAcwBpAG8AbgAgADIALgAwADAAMQAgAG0AZgBnAHAAYwB0AHQAIAA0AC4ANAAAVmVyc2lvbiAyLjAwMSBtZmdwY3R0IDQuNAAATwBDAFIAQgAxADAAUABpAHQAYwBoAEIAVAAtAFIAZQBnAHUAbABhAHIAAE9DUkIxMFBpdGNoQlQtUmVndWxhcgAAAgAAAAAAAP7mAHsAAAAAAAAAAAAAAAAAAAAAAAAAAACEAAAAAQACAAMABAAFAAYABwAIAAkACgALAAwADQAOAA8AEAARABIAEwAUABUAFgAXABgAGQAaABsAHAAdAB4AHwAgACEAIgAjACQAJQAmACcAKAApACoAKwAsAC0ALgAvADAAMQAyADMANAA1ADYANwA4ADkAOgA7ADwAPQA+AD8AQABBAEIAQwBEAEUARgBHAEgASQBKAEsATABNAE4ATwBQAFEAUgBTAFQAVQBWAFcAWABZAFoAWwBcAF0AXgBfAGABAgEDAIUAvQCWAIYAjgCNAJcA3gDHAGIAYwCQAM0AzgBmANMA0ADRAGcAkQBoAIkAbgCgAKEA2ADZALYAtwC0ALUAggDDBEV1cm8HbmJzcGFjZQAAAQAAAAwAAAAWAAAAAgABAAEAgwABAAQAAAACAAAAAAAAAAEAAAAA1aQnCAAAAAC0DXuhAAAAALfzZlo=) format("truetype");font-weight: normal;font-style: normal;}</style></defs>');
    }
    this.createNewElement();
}

function colorchooser(){
    // $('.cp-color-picker').hide();
}

$(document).ready(function(){
    $('input[type="range"]').rangeslider({
        polyfill: false,
        rangeClass: 'rangeslider',
        fillClass: 'rangeslider__fill',
        handleClass: 'rangeslider__handle',
        onSlide: null,
        onSlideEnd: null
    });

    $('.color').colorPicker({renderCallback : colorchooser});
    
    //generate barcodes
    $('#btn-generate').click(function(){
        var strCode = $('#code-list').val();
        var strCodeList = strCode.split(/\r?\n/);

        //check duplicates
        var tmp = [];
        for(var i in strCodeList){
            if(!tmp.includes(strCodeList[i])) tmp.push(strCodeList[i]);
        }

        console.log(tmp);
        $('#bulk-save-container').show();
        //clear result panel
        $('#result-container').children().remove();

        //show Status bar
        $('#status-bar-container').show();
        $('#status-bar-container').html("<strong>Total Entries</strong> : "+strCodeList.length+" / <strong>Duplicated Entries</strong> : "+(strCodeList.length - tmp.length)+"<br><strong>"+tmp.length+"</strong> Barcodes Created");
        //add results
        for(var i in tmp){
            barcodeResultContainer(i, tmp[i]);
        }
    })

    $("#btn-png-bulk").click(function(){
        savePngBulk();
    })

    $("#btn-jpg-bulk").click(function(){
        saveJpgBulk();
    })

    $("#btn-pdf-bulk").click(function(){
        savePdfBulk();
    })

    $('#bulk-save-container').hide();
    $('#status-bar-container').hide();
})