define([
  'require',
  'lodash',

  './sendMessage',

  './tools',
  './selectTool',
  './drawFromJSON',

  './wb/whiteboard',

  './chooseColor',
  './cancelChooseColor',
  './exportImage',
  './exportMovieImage',

  './doCancelAddText',
  './doAddText',
  './doIncrementalText',
  './submitUserName',

  'dojo/dom',
  'dojo/parser',
  'dijit/popup',
  'dijit/registry',

  'dijit/form/ValidationTextBox',
  'dijit/form/TextBox',
  'dijit/form/Textarea',
  'dijit/form/Button',
  'dijit/Dialog',
  'dijit/layout/BorderContainer',
  'dijit/layout/ContentPane',

  "dojox/widget/ColorPicker",

  "dijit/form/DropDownButton",
  "dijit/Dialog",
  "dijit/TooltipDialog",
  "dijit/Tooltip",
  "dijit/form/RadioButton",
  "dijit/form/Select",
  "dijit/form/Form",
  "dijit/form/Slider",
  "dijit/form/HorizontalSlider",

  'dojo/domReady!'
], function(req, _, sendMessage, tools, selectTool, drawFromJSON, whiteboard, chooseColor, cancelChooseColor, exportImage, exportMovieImage, doCancelAddText, doAddText, doIncrementalText, submitUserName, dom, parser, popup, registry){

  var geomMessageList = [];
  var messageList = [];
  var messageMax = 200;
  var wbId;
  var userList = [];
  var messageListObj = null;

  var showMovie = function(){
    try{
      registry.byId("movieDialog").show();

      if(messageList){
        whiteboard.geomMessageList = [];
        _.forEach(messageList,function(m){
          if(m.geometry){
            whiteboard.geomMessageList.push(m);
          }
        });
      }
      var mSlider = registry.byId('movieSlider');
      mSlider.setAttribute('maximum',whiteboard.geomMessageList.length);
      mSlider.setAttribute('discreteValues',whiteboard.geomMessageList.length);

      mSlider.setValue(0);
    }catch(e){
      console.info("canvas not supported",e);
    }
  };

  var incrementMovie = function(){
    var indexEnd = Math.round(registry.byId('movieSlider').getValue());
    whiteboard.movieDrawing.clear();
    for(var i =0; i < indexEnd; i++){
      drawFromJSON(whiteboard.geomMessageList[i].geometry, whiteboard.movieDrawing);
    }
    if(indexEnd > 0){
      dom.byId('movieUser').innerHTML = whiteboard.geomMessageList[indexEnd - 1].fromUser;
    }
  };

  parser.parse().then(function(){
    req(['./webrtc'], function(){});

    registry.byId('userNameBtn').on('click', submitUserName);

    dom.byId('setUserDiv').style.display = '';

    registry.byId("userNameText").on('keydown', function(evt) {
      if(evt.keyCode == dojo.keys.ENTER) {
        submitUserName();
      }
    });

    registry.byId('lineColorPaletteOkBtn').on('click', function(){
      chooseColor('line');
    });

    registry.byId('lineColorPaletteCancelBtn').on('click', function(){
      cancelChooseColor('line');
    });

    registry.byId('fillColorPaletteOkBtn').on('click', function(){
      chooseColor('fill');
    });

    registry.byId('fillColorPaletteCancelBtn').on('click', function(){
      cancelChooseColor('fill');
    });

    if(Modernizr.canvas){
      registry.byId('exportImgBtn').on('click', exportImage);
      registry.byId('exportMovieImgBtn').on('click', exportMovieImage);
    } else {
      dojo.style(registry.byId('exportImgBtn').domNode, {'visibility': 'hidden', 'display': 'none'});
      dojo.style(registry.byId('exportMovieImgBtn').domNode, {'visibility': 'hidden', 'display': 'none'});
    }

    registry.byId('showMovieBtn').on('click', showMovie);

    registry.byId('movieSlider').on('change', incrementMovie);

    registry.byId('lineStrokeSelect').on('change', function(){
      whiteboard.lineStroke = Math.floor(1.0 * registry.byId('lineStrokeSelect').getValue());
    });

    registry.byId('fontSizeSelect').on('change', function(){
      whiteboard.fontSize = Math.floor(1.0 * registry.byId('fontSizeSelect').getValue());
    });

    registry.byId('clearDrawingNoBtn').on('click',function(){
      popup.close(registry.byId("clearDrawingDialog"));
    });

    registry.byId('clearDrawingYesBtn').on('click', function(){
      popup.close(registry.byId("clearDrawingDialog"));
      var geom = createClearDrawingJSON();
      sendMessage({geometry: geom });
      drawFromJSON(geom,whiteboard.drawing);
    });

    _.forEach(tools,function(tool){
      registry.byId(tool.name + 'ToolBtn').on('click', function(){
        selectTool(tool.name);
      });
    });

    registry.byId("wbText").on('keydown', function(evt) {
      if(evt.keyCode == dojo.keys.ENTER) {
        doAddText();
      }
    });

    registry.byId("okTextBtn").on('click', function(evt) {
      doAddText();
    });

    registry.byId("cancelTextBtn").on('click', function(evt) {
      doCancelAddText();
    });

    registry.byId("wbText").on('keyup', function(evt) {
      doIncrementalText();
    });

    registry.byId("wbText").on('change', function(evt) {
      doIncrementalText();
    });

    registry.byId("textDialog").on('close', function(evt) {
      whiteboard.overlayDrawing.clear();
      registry.byId("wbText").setValue('');
    });

    registry.byId("textDialog").on('hide', function(evt) {
      whiteboard.overlayDrawing.clear();
      registry.byId("wbText").setValue('');
    });

    try{
      var reader = new FileReader();
      reader.onload = function(e) {
        document.querySelector('img').src = e.target.result;
      };

      function onDrop(e) {
        reader.readAsDataURL(e.dataTransfer.files[0]);
      }
    } catch(imgE){}

    selectTool('pen');
  });

});
