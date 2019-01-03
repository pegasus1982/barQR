// const svgToImg = require("svg-to-img");
// const pdf = require('html-pdf');

function downloadPNG(index){
    console.log(index);
    //png test
    saveSvgAsPng(document.getElementById(index), "d:/diagram.png",{backgroundColor : $("#background-color").val()});

    
}

function downloadJPG(index){
    //jpg test
    var elem = document.getElementById(index);
    var content = elem.outerHTML;
    console.log(content);
    (async () => {
        await svgToImg.from(content).toJpeg({
            path: "d:/example.jpeg"
        });
    })();
}

function downloadPDF(index){
    var elem = document.getElementById(index);
    var html = elem.outerHTML;

    var options = { 
        // format: 'Letter' 
    };
    
    pdf.create(html, options).toFile('d:/barcode.pdf', function(err, res) {
        if (err) return console.log(err);
        console.log(res); // { filename: '/app/businesscard.pdf' }
    });
}

function downloadAI(index){

}

function downloadEPS(index){

}
var barcodeResultContainer = function(id,value,option){
    this.id = id;
    this.value = value;
    // this.option = option;
    this.option = {
        format              : "ean8",
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
        $('#result-'+id).append('<svg id="image-'+this.id+'"></svg>');
        $('#result-'+id).append('<div style="text-align:left;padding:2rem">'+
                                    '<span class="btn-download" id="btn-png" data-imageID="'+this.id+'" onclick="downloadPNG(\''+"image-"+this.id+'\')">PNG</span>'+
                                    '<span class="btn-download" id="btn-jpg" data-imageID="'+this.id+'" onclick="downloadJPG(\''+"image-"+this.id+'\')">JPG</span>'+
                                    '<span class="btn-download" id="btn-pdf" data-imageID="'+this.id+'" onclick="downloadPDF(\''+"image-"+this.id+'\')">PDF</span>'+
                                    '<span class="btn-download" id="btn-ai"  data-imageID="'+this.id+'" onclick="downloadAI(\''+"image-"+this.id+'\')">AI</span>'+
                                    '<span class="btn-download" id="btn-eps" data-imageID="'+this.id+'" onclick="downloadEPS(\''+"image-"+this.id+'\')">EPS</span>'+
                                    '<br><br><hr>'+
                                '</div>');

        JsBarcode("#image-"+this.id, this.value,this.option);
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
        console.log(strCodeList);

        //clear result panel
        $('#result-container').children().remove();

        //add results
        for(var i in strCodeList){
            barcodeResultContainer(i, strCodeList[i]);
        }
    })
})