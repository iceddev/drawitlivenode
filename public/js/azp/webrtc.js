define([
  './wb/whiteboard',
  './wb/create-json',
  './drawFromJson',
  'dojo/on',
  'dojo/domReady!'
], function(whiteboard, createGeom, drawFromJSON, on){

  'use strict';

  navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia;
  window.URL = window.URL || window.webkitURL || window.mozURL;

  var takePicture = function(){
    if(navigator.getUserMedia  && !whiteboard.hasStream){
      navigator.getUserMedia({video: true}, gotStream, noStream);
    }else if(navigator.getUserMedia){
      console.log('take pic');
      photoCtx.drawImage(video, 0, 0);
      var img = document.createElement('img');
      img.src = photoCanvas.toDataURL('image/png');

      var bounds = {x1:100, y1:100, y2: 300, x2: 400};
      var imgJSON = createGeom.image(bounds, photoCanvas.toDataURL());
      drawFromJSON(imgJSON, whiteboard.drawing);
      whiteboard.sendMessage({geometry:imgJSON});
    }
  };

  on(dijit.registry.byId('smileBtn'), 'click', takePicture);

  var app = document.getElementById('app');
  var video = document.getElementById('monitor');
  var photoCanvas = document.getElementById('photo');
  var photoCtx = photoCanvas.getContext('2d');
  var intervalId = null;
  var idx = 0;

  function gotStream(stream) {
    if (window.URL) {
      video.src = window.URL.createObjectURL(stream);
    } else {
      video.src = stream; // Opera.
    }

    video.onerror = function(e) {
      stream.stop();
    };

    stream.onended = noStream;

    video.onloadedmetadata = function(e) { // Not firing in Chrome. See crbug.com/110938.
      document.getElementById('splash').hidden = true;
      document.getElementById('app').hidden = false;
    };

    // Since video.onloadedmetadata isn't firing for getUserMedia video, we have
    // to fake it.
    setTimeout(function() {
      photoCanvas.width = video.videoWidth;
      photoCanvas.height = video.videoHeight;
      document.getElementById('splash').hidden = true;
      document.getElementById('app').hidden = false;
      whiteboard.hasStream = true;
      setTimeout(function() {
        takePicture();
      }, 100);
    }, 100);
  }

  function noStream(e) {
    var msg = 'No camera available.';
    if (e.code == 1) {
      msg = 'User denied access to use camera.';
    }
    document.getElementById('errorMessage').textContent = msg;
  }

});