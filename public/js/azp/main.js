define([
  'require',
  'lodash',

  './tools',
  './selectTool',

  './wb/whiteboard',

  './chooseColor',
  './cancelChooseColor',
  './exportImage',
  './exportMovieImage',
  './showMovie',
  './incrementMovie',

  './doCancelAddText',
  './doAddText',
  './doIncrementalText',
  './submitUserName',
  './onClearDrawing',
  './onClearDrawingCancel',

  'dojo/dom',
  'dojo/parser',
  'dijit/registry',

  'dijit/form/ValidationTextBox',
  'dijit/form/TextBox',
  'dijit/form/Textarea',
  'dijit/form/Button',
  'dijit/Dialog',
  'dijit/layout/BorderContainer',
  'dijit/layout/ContentPane',

  'dojox/widget/ColorPicker',

  'dijit/form/DropDownButton',
  'dijit/Dialog',
  'dijit/TooltipDialog',
  'dijit/Tooltip',
  'dijit/form/RadioButton',
  'dijit/form/Select',
  'dijit/form/Form',
  'dijit/form/Slider',
  'dijit/form/HorizontalSlider',

  'dojo/domReady!'
], function(req, _, tools, selectTool, whiteboard, chooseColor, cancelChooseColor, exportImage, exportMovieImage, showMovie, incrementMovie, doCancelAddText, doAddText, doIncrementalText, submitUserName, onClearDrawing, onClearDrawingCancel, dom, parser, registry){

  var messageList = [];

  parser.parse().then(function(){
    req(['./webrtc'], function(){});

    registry.byId('userNameBtn').on('click', submitUserName);

    dom.byId('setUserDiv').style.display = '';

    registry.byId('userNameText').on('keydown', function(evt) {
      if(evt.keyCode == dojo.keys.ENTER) {
        submitUserName();
      }
    });

    registry.byId('lineColorPaletteOkBtn').on('click', _.partial(chooseColor, 'line'));

    registry.byId('lineColorPaletteCancelBtn').on('click', _.partial(cancelChooseColor, 'line'));

    registry.byId('fillColorPaletteOkBtn').on('click', _.partial(chooseColor, 'fill'));

    registry.byId('fillColorPaletteCancelBtn').on('click', _.partial(cancelChooseColor, 'fill'));

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

    registry.byId('clearDrawingNoBtn').on('click', onClearDrawingCancel);

    registry.byId('clearDrawingYesBtn').on('click', onClearDrawing);

    _.forEach(tools, function(tool){
      registry.byId(tool.name + 'ToolBtn').on('click', _.partial(selectTool, tool.name));
    });

    registry.byId('wbText').on('keydown', function(evt) {
      if(evt.keyCode == dojo.keys.ENTER) {
        doAddText();
      }
    });

    registry.byId('okTextBtn').on('click', doAddText);

    registry.byId('cancelTextBtn').on('click', doCancelAddText);

    registry.byId('wbText').on('keyup', doIncrementalText);

    registry.byId('wbText').on('change', doIncrementalText);

    registry.byId('textDialog').on('close', function(evt) {
      whiteboard.overlayDrawing.clear();
      registry.byId('wbText').setValue('');
    });

    registry.byId('textDialog').on('hide', function(evt) {
      whiteboard.overlayDrawing.clear();
      registry.byId('wbText').setValue('');
    });

    selectTool('pen');
  });

});
