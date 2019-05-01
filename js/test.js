function GetBinary() {
    var canvas = document.createElement("canvas");
    var imgElement = documen
    canvas.width = imgElement.offsetWidth;
    canvas.height = imgElement.offsetHeight;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(imgElement,0,0);

    var map = ctx.getImageData(0,0,canvas.width,canvas.height);
    var imdata = map.data;

    var r,g,b;
    for(var p = 0, len = imdata.length; p < len; p+=4) {
        r = imdata[p]
        g = imdata[p+1];
        b = imdata[p+2];

        if ((r >= 164 && r <= 255) && (g >= 191 && g <= 229) && (b >= 220 && b <= 255)) {

            // black  = water
             imdata[p] = 0;
             imdata[p+1] = 0;
             imdata[p+2] = 0;

        } else {

            // white = land
             imdata[p] = 255;
             imdata[p+1] = 255;
             imdata[p+2] = 255;                     
        }                   
    }
    ctx.putImageData(map,0,0);
    imgElement.src = canvas.toDataURL();
} 