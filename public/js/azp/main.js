define([
  'require',
  'lodash',

  './widgets/UserNameBtn',
  './widgets/UserNameText',
  './widgets/ImgDialog',
  './widgets/TextDialog',
  './widgets/MovieDialog',

  './widgets/ToolButton',

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
], function(
  req,
  _,
  UserNameBtn,
  UserNameText,
  ImgDialog,
  TextDialog,
  MovieDialog,
  ToolButton,
  tools, selectTool, whiteboard, chooseColor, cancelChooseColor, exportImage, exportMovieImage, showMovie, incrementMovie, doCancelAddText, doAddText, doIncrementalText, onClearDrawing, onClearDrawingCancel, dom, parser, registry){

  'use strict';

  var messageList = [];

  parser.parse().then(function(){
    req(['./webrtc'], function(){});

    dom.byId('setUserDiv').style.display = '';

    var userNameText = new UserNameText({}, 'userNameText');
    userNameText.startup();
    var wbIdText = new UserNameText({}, 'wbIdText');
    wbIdText.startup();
    var userNameBtn = new UserNameBtn({}, 'userNameBtn');
    userNameBtn.startup();

    var imgDialog = new ImgDialog({}, 'imgDialog');
    imgDialog.startup();
    var textDialog = new TextDialog({}, 'textDialog');
    textDialog.startup();
    var movieDialog = new MovieDialog({}, 'movieDialog');
    movieDialog.startup();

    var penTool = new ToolButton({
      label: 'Pencil (freehand drawing)',
      iconClass: 'icon pencil-icon'
    }, 'penToolBtn');
    penTool.startup();

    var lineTool = new ToolButton({
      label: 'Straight Line',
      iconClass: 'icon line-icon'
    }, 'lineToolBtn');
    lineTool.startup();

    var rectTool = new ToolButton({
      label: 'Rectangle',
      iconClass: 'icon rect-icon'
    }, 'rectToolBtn');
    rectTool.startup();

    var filledRectTool = new ToolButton({
      label: 'Filled Rectangle',
      iconClass: 'icon filled-rect-icon'
    }, 'filledRectToolBtn');
    filledRectTool.startup();

    var ellipseTool = new ToolButton({
      label: 'Ellipse',
      iconClass: 'icon ellipse-icon'
    }, 'ellipseToolBtn');
    ellipseTool.startup();

    var filledEllipseTool = new ToolButton({
      label: 'Filled Ellipse',
      iconClass: 'icon filled-ellipse-icon'
    }, 'filledEllipseToolBtn');
    filledEllipseTool.startup();

    var textTool = new ToolButton({
      label: 'Draw Text',
      iconClass: 'icon text-icon'
    }, 'textToolBtn');
    textTool.startup();

    var moveTool = new ToolButton({
      label: 'Move a shape',
      iconClass: 'icon move-icon'
    }, 'moveToolBtn');
    moveTool.startup();

    var moveUpTool = new ToolButton({
      label: 'Pull a shape forward',
      iconClass: 'icon move-up-icon'
    }, 'moveUpToolBtn');
    moveUpTool.startup();

    var moveDownTool = new ToolButton({
      label: 'Push a shape back',
      iconClass: 'icon move-down-icon'
    }, 'moveDownToolBtn');
    moveDownTool.startup();

    var deleteTool = new ToolButton({
      label: 'Delete a shape',
      iconClass: 'icon delete-icon'
    }, 'deleteToolBtn');

    var smileTool = new ToolButton({
      label: 'Say Cheese!',
      iconClass: 'icon'
    }, 'smileBtn');
    smileTool.startup();

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
