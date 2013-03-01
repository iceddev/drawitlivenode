define([
  './create-json',
  './getGfxMouse'
], function(createGeom, getGfxMouse){

  function DNDFileController(id, imgJSONcallback) {
    var el_ = document.getElementById(id);
    var thumbnails_ = document.getElementById('thumbnails');



    this.dragenter = function(e) {
      e.stopPropagation();
      e.preventDefault();
      el_.classList.add('rounded');
    };

    this.dragover = function(e) {
      e.stopPropagation();
      e.preventDefault();
    };

    this.dragleave = function(e) {
      e.stopPropagation();
      e.preventDefault();
      el_.classList.remove('rounded');
    };

    this.drop = function(e) {

    try{

      //console.log('dropevent',e);

      var pt = getGfxMouse(e);

        e.stopPropagation();
        e.preventDefault();

        el_.classList.remove('rounded');

        var files = e.dataTransfer.files;

        for (var i = 0, file; file = files[i]; i++) {
          var imageType = /image.*/;
          if (!file.type.match(imageType)) {
            continue;
          }

            // FileReader
          var reader = new FileReader();

          reader.onerror = function(evt) {
             alert('Error code: ' + evt.target.error.code);
          };
          reader.onload = (function(aFile) {
            return function(evt) {
              if (evt.target.readyState == FileReader.DONE) {

                console.log('rawImg',evt.target.result.length);
                var img = new Image();
                img.src = evt.target.result;
                var imgData = img.src;
                var newH, newW;

                img.onload = function(){
                  console.log(img.height, img.width);
                  var maxDim = 200;
                  //console.log(whiteboard);
                  if(img.height > maxDim || img.width > maxDim){
                    //need to scale


                    if(img.width > img.height){
                      newW = maxDim;
                      newH = Math.round((maxDim * img.height) / img.width);
                    }else{
                      newH = maxDim;
                      newW = Math.round((maxDim * img.width) / img.height);

                    }

                  }else{
                    newH = img.height;
                    newW = img.width;
                  }


                  var tempCanvas = document.createElement("canvas");
                  tempCanvas.height = newH;
                  tempCanvas.width = newW;
                  var tempContext = tempCanvas.getContext("2d");
                  tempContext.drawImage(img,0,0,newW,newH);

                  var bounds = {x1:pt.x, y1:pt.y, x2: pt.x + newW, y2: pt.y + newH};
                  var imgJSON = createGeom.image(bounds,tempCanvas.toDataURL());

                  imgJSONcallback(imgJSON);
                  //console.log(imgJSON);





                };

              }
            };
          })(file);

          reader.readAsDataURL(file);
        }

        return false;


    }catch(dropE){
      console.log('DnD error',dropE);
    }
    };


    el_.addEventListener("dragenter", this.dragenter, false);
    el_.addEventListener("dragover", this.dragover, false);
    el_.addEventListener("dragleave", this.dragleave, false);
    el_.addEventListener("drop", this.drop, false);
  }

  return DNDFileController;

});