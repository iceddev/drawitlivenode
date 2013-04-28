define([
  'require',

  './widgets/UserNameBtn',
  './widgets/UserNameText',
  './widgets/ImgDialog',
  './widgets/TextDialog',
  './widgets/MovieDialog',

  './widgets/ToolButton',

  './widgets/ColorDropDown',
  './widgets/SizeSpinner',

  './widgets/ExportImg',
  './widgets/ShowMovie',

  './widgets/ClearDropDown',

  './selectTool',

  './exportMovieImage',
  './incrementMovie',

  'dojo/dom',
  'dojo/parser',
  'dijit/registry',

  'dojo/domReady!'
], function(
  req,
  UserNameBtn,
  UserNameText,
  ImgDialog,
  TextDialog,
  MovieDialog,
  ToolButton,
  ColorDropDown,
  SizeSpinner,
  ExportImage,
  ShowMovie,
  ClearDropDown, selectTool, exportMovieImage, incrementMovie, dom, parser, registry){

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
    }, 'pen');
    penTool.startup();

    var lineTool = new ToolButton({
      label: 'Straight Line',
      iconClass: 'icon line-icon'
    }, 'line');
    lineTool.startup();

    var rectTool = new ToolButton({
      label: 'Rectangle',
      iconClass: 'icon rect-icon'
    }, 'rect');
    rectTool.startup();

    var filledRectTool = new ToolButton({
      label: 'Filled Rectangle',
      iconClass: 'icon filled-rect-icon'
    }, 'filledRect');
    filledRectTool.startup();

    var ellipseTool = new ToolButton({
      label: 'Ellipse',
      iconClass: 'icon ellipse-icon'
    }, 'ellipse');
    ellipseTool.startup();

    var filledEllipseTool = new ToolButton({
      label: 'Filled Ellipse',
      iconClass: 'icon filled-ellipse-icon'
    }, 'filledEllipse');
    filledEllipseTool.startup();

    var textTool = new ToolButton({
      label: 'Draw Text',
      iconClass: 'icon text-icon'
    }, 'text');
    textTool.startup();

    var moveTool = new ToolButton({
      label: 'Move a shape',
      iconClass: 'icon move-icon'
    }, 'move');
    moveTool.startup();

    var moveUpTool = new ToolButton({
      label: 'Pull a shape forward',
      iconClass: 'icon move-up-icon'
    }, 'moveUp');
    moveUpTool.startup();

    var moveDownTool = new ToolButton({
      label: 'Push a shape back',
      iconClass: 'icon move-down-icon'
    }, 'moveDown');
    moveDownTool.startup();

    var deleteTool = new ToolButton({
      label: 'Delete a shape',
      iconClass: 'icon delete-icon'
    }, 'delete');

    var smileTool = new ToolButton({
      label: 'Say Cheese!',
      iconClass: 'icon smiley-icon'
    }, 'smile');
    smileTool.startup();

    var lineColor = new ColorDropDown({
      label: 'Color',
      type: 'line'
    }, 'lineColorDisplay');
    lineColor.startup();

    var fillColor = new ColorDropDown({
      label: 'Fill',
      type: 'fill'
    }, 'fillColorDisplay');
    fillColor.startup();

    var lineStroke = new SizeSpinner({
      value: 3,
      wbType: 'lineStroke'
    }, 'lineStrokeSelect');
    lineStroke.startup();

    var fontSize = new SizeSpinner({
      value: 12,
      wbType: 'fontSize'
    }, 'fontSizeSelect');
    fontSize.startup();

    var exportImage = new ExportImage({
      label: 'Export the drawing surface.',
      iconClass: 'icon export-icon'
    }, 'exportImgBtn');
    exportImage.startup();

    var showMovie = new ShowMovie({
      label: 'View all steps that made this drawing.',
      iconClass: 'icon movie-icon'
    }, 'showMovieBtn');
    showMovie.startup();

    var clearDrawing = new ClearDropDown({
      label: 'Clear'
    }, 'clearDrawingDisplay');
    clearDrawing.startup();

    registry.byId('movieSlider').on('change', incrementMovie);

    selectTool('pen');
  });

});
