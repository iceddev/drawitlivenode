define([
  'require',
  'lodash',
  './tools',
  './selectTool',
  './drawFromJSON',
  './animateUserItem',
  './populateUserList',
  './getHoveredShape',
  './wb/whiteboard',
  './wb/getGfxMouse',
  './wb/DNDFileController',
  'dojo/dom',
  'wsrpc/client',
  './wb/create-json',
  'dojo/parser',
  'dojo/on',
  'dijit/popup',
  'dijit/registry',

  'dijit/form/ValidationTextBox',
  'dijit/form/TextBox',
  'dijit/form/Textarea',
  'dijit/form/Button',
  'dijit/Dialog',
  'dijit/layout/BorderContainer',
  'dijit/layout/ContentPane',

  "dojox/gfx",
  "dojox/gfx/move",
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
], function(req, _, tools, selectTool, drawFromJSON, animateUserItem, populateUserList, getHoveredShape, whiteboard, getGfxMouse, DNDFileController, dom, WsRpc, createGeom, parser, on, popup, registry){

  var geomMessageList = [];
  var messageList = [];
  var messageMax = 200;
  var wbId;
  var lastMessage = '';
  var userList = [];
  var messageListObj = null;

  var wsrpc = new WsRpc(io.connect('/'));

  function sendMessage(message){
    wsrpc.methods.sendMessage(wbId,message,userName).then(function(resp){
      console.log("post response",resp);
      if(resp.message){
        messageList.push(resp.message);
      }
      clearChatUI();
    });
  }

  var getUserList = function() {
    wsrpc.methods.getUsers(wbId).then(populateUserList);
  };

  var clearChatUI = function(){
    try{
      registry.byId('chatText').set('disabled', false);
      registry.byId('chatText').set('value', '');
      registry.byId('chatBtn').set('disabled', false);
      dom.byId('chatWaitMessage').innerHTML = '';
    }catch(e){}
  };

  var onOpened = function() {
    dom.byId('setUserDiv').style.display = 'none';

    dom.byId('applicationArea').style.display = '';
    registry.byId('applicationArea').resize();
    initGfx();
    registry.byId('chatBtn').on('click', sendChatMessage);

    //display any saved messages
    _.forEach(messageList, function(m){
      if(m.chatMessage){
        printChatMessage(m);
      }
    });

    getUserList();
  };

  var printChatMessage = function(message){
    dom.byId('output').innerHTML += '<pre class=\"chatMessage\"><span class=\"chatFrom\">' + message.fromUser + '</span>: ' + message.chatMessage + '</pre><br>';
    dom.byId('output').scrollTop = dom.byId('output').scrollHeight;
  };

  var onMessage = function(obj) {
    console.log("onMessage", obj);

    if(obj.chatMessage){
      printChatMessage(obj);
    }
    if(obj.geometry && obj.geometry.shapeType){
      obj.geometry.fromUser = obj.fromUser;
      if(obj.fromUser != userName){
        drawFromJSON(obj.geometry,whiteboard.drawing);
      }
    }

    if(obj.chatMessage || obj.geometry){
      messageList.push(obj);
    }

    if(obj.userList && (obj.userList.length > 0)){
      populateUserList(obj.userList);
    }

    if(obj.fromUser){
      animateUserItem(obj.fromUser);
    }
  };

 var initGfx = function(){
    whiteboard.container = dom.byId("whiteboardContainer");
    whiteboard.overlayContainer = dom.byId("whiteboardOverlayContainer");

    whiteboard.drawing = dojox.gfx.createSurface(whiteboard.container, whiteboard.width, whiteboard.height);
    whiteboard.overlayDrawing = dojox.gfx.createSurface(whiteboard.overlayContainer, whiteboard.width, whiteboard.height);

    //for playback
    whiteboard.movieContainer = dom.byId("movieWhiteboardContainer");
    whiteboard.movieDrawing = dojox.gfx.createSurface(whiteboard.movieContainer, whiteboard.width, whiteboard.height);

    //draw any saved objects
    _.forEach(messageList,function(m){
      if(m.geometry){
        m.geometry.fromUser = m.fromUser;
       drawFromJSON(m.geometry, whiteboard.drawing);
      }
    });

    whiteboard.overlayContainer.style.width = whiteboard.width + 'px';
    whiteboard.overlayContainer.style.height = whiteboard.height + 'px';
    whiteboard.container.style.width = whiteboard.width + 'px';
    whiteboard.container.style.height = whiteboard.height + 'px';

    whiteboard.movieContainer.style.width = whiteboard.width + 'px';
    whiteboard.movieContainer.style.height = whiteboard.height + 'px';

    whiteboard.overlayContainer.style.position = 'absolute';
    whiteboard.overlayContainer.style.zIndex = 1;
    var c = dojo.coords(whiteboard.container);
    console.dir(c);
    dojo.style(whiteboard.overlayContainer,"top", (c.t + 'px'));
    dojo.style(whiteboard.overlayContainer,"left", (c.l + 'px'));

    on(document, 'mouseup', doGfxMouseUp); //mouse release can happen anywhere in the container
    on(whiteboard.overlayContainer, 'mousedown', doGfxMouseDown);
    on(whiteboard.overlayContainer, 'mousemove', doGfxMouseMove);

    if(Modernizr.draganddrop){
      console.log('supports drag and drop!');
      var dndc = new DNDFileController('whiteboardOverlayContainer', function(imgJSON){
        drawFromJSON(imgJSON,whiteboard.drawing);

        sendMessage({geometry:imgJSON});
      });
    }
  };

  var createOffsetBB = function(origBB, pointInBB, newPt){
    var xDelta = Math.abs(pointInBB.x - origBB.x1);
    var yDelta = Math.abs(pointInBB.y - origBB.y1);

    var bounds = {
      x1: (newPt.x - xDelta),
      y1: (newPt.y - yDelta)
    };

    bounds.x2 = bounds.x1 + (origBB.x2 - origBB.x1);
    bounds.y2 = bounds.y1 + (origBB.y2 - origBB.y1);

    return bounds;
  };

  var pointInDrawing = function(pt){
    if((pt.x > -2) && (pt.x < (whiteboard.width + 2)) && (pt.y > -2) && (pt.y < (whiteboard.height + 2))){
      return true;
    }else{
      return false;
    }
  };

  function doGfxMouseDown(evt){
    var pt = getGfxMouse(evt);
    if(pointInDrawing(pt)){
      whiteboard.mouseDownPt = pt;
      whiteboard.points = [pt];
      whiteboard.mouseDown = true;

      whiteboard.selectedShape = getHoveredShape(whiteboard.drawing,pt);
    }
  }

  function doGfxMouseMove(evt){
    var pt = getGfxMouse(evt);
    var geom;
    var shape;

    if(whiteboard.mouseDown){
      if((whiteboard.tool == 'pen') && pointInDrawing(pt) ){
        if((whiteboard.points[whiteboard.points.length - 1].x != pt.x) || (whiteboard.points[whiteboard.points.length - 1].y != pt.y)){
          whiteboard.points.push(pt);

          if(whiteboard.points.length > 1){
          //make sure its not the same point as last time

            geom = createGeom.line(
                {x1: whiteboard.points[whiteboard.points.length - 2].x,
                y1: whiteboard.points[whiteboard.points.length - 2].y,
                x2: whiteboard.points[whiteboard.points.length - 1].x,
                y2: whiteboard.points[whiteboard.points.length - 1].y },
                whiteboard.lineColor, whiteboard.lineStroke
            );
            drawFromJSON(geom,whiteboard.overlayDrawing);
          }

        }
      }else{
        var bounds = {x1:whiteboard.mouseDownPt.x, y1:whiteboard.mouseDownPt.y, x2: pt.x, y2: pt.y};
        if(whiteboard.tool != 'pen'){
          whiteboard.overlayDrawing.clear();
        }

        if(whiteboard.tool == 'rect'){
          geom  = createGeom.rect(bounds, whiteboard.lineColor, whiteboard.lineStroke);
          drawFromJSON(geom,whiteboard.overlayDrawing);
        }else if(whiteboard.tool == 'filledRect'){
          geom  = createGeom.rect(bounds, whiteboard.lineColor, whiteboard.lineStroke, whiteboard.fillColor);
          drawFromJSON(geom,whiteboard.overlayDrawing);
        }else if(whiteboard.tool == 'ellipse'){
          geom  = createGeom.ellipse(bounds, whiteboard.lineColor, whiteboard.lineStroke);
          drawFromJSON(geom,whiteboard.overlayDrawing);
        }else if(whiteboard.tool == 'filledEllipse'){
          geom  = createGeom.ellipse(bounds, whiteboard.lineColor, whiteboard.lineStroke, whiteboard.fillColor);
          drawFromJSON(geom,whiteboard.overlayDrawing);
        }else if(whiteboard.tool == 'line'){
          geom  = createGeom.line(bounds, whiteboard.lineColor, whiteboard.lineStroke, whiteboard.fillColor);
          drawFromJSON(geom,whiteboard.overlayDrawing);
        }else if(whiteboard.tool == 'move'){
          if(whiteboard.selectedShape && whiteboard.mouseDownPt)
          {
            geom = createGeom.moveOverlay(whiteboard.selectedShape.wbbb);
            drawFromJSON(geom,whiteboard.overlayDrawing);
            var offBB = createOffsetBB(whiteboard.selectedShape.wbbb,whiteboard.mouseDownPt,pt);
            var geom2 = createGeom.moveOverlay(offBB);

            drawFromJSON(geom2,whiteboard.overlayDrawing);
          }
        }

      }
    } else {
      if(whiteboard.tool == 'move'){
        whiteboard.overlayDrawing.clear();
        shape = getHoveredShape(whiteboard.drawing,pt);
        if(shape){
          geom = createGeom.moveOverlay(shape.wbbb);
          drawFromJSON(geom,whiteboard.overlayDrawing);
        }
      }
    }

    //mouse up or down doesn't matter for the select and delete tools
    if(whiteboard.tool == 'delete'){
      whiteboard.overlayDrawing.clear();
      shape = getHoveredShape(whiteboard.drawing,pt);
      if(shape){
        geom = createGeom.deleteOverlay(shape.wbbb);
        drawFromJSON(geom,whiteboard.overlayDrawing);
      }
    }else if(whiteboard.tool == 'moveUp'){
      whiteboard.overlayDrawing.clear();
      shape = getHoveredShape(whiteboard.drawing,pt);
      if(shape){
        geom = createGeom.moveUpOverlay(shape.wbbb);
        drawFromJSON(geom,whiteboard.overlayDrawing);
      }
    }else if(whiteboard.tool == 'moveDown'){
      whiteboard.overlayDrawing.clear();
      shape = getHoveredShape(whiteboard.drawing,pt);
      if(shape){
        geom = createGeom.moveDownOverlay(shape.wbbb);
        drawFromJSON(geom,whiteboard.overlayDrawing);
      }
    }
  }

  function doGfxMouseUp(evt) {
    var pt = getGfxMouse(evt);
    whiteboard.mouseDown = false;
    var shape;

    //always clear the overlay
    whiteboard.overlayDrawing.clear();

    if(whiteboard.mouseDownPt){
      //make sure mouse was released inside of drawing area
      if(pointInDrawing(pt)){

        var bounds = {x1:whiteboard.mouseDownPt.x, y1:whiteboard.mouseDownPt.y, x2: pt.x, y2: pt.y};

        var geom = null;
        if(whiteboard.tool == 'rect'){
          geom  = createGeom.rect(bounds, whiteboard.lineColor, whiteboard.lineStroke);
          drawFromJSON(geom,whiteboard.drawing);
        }else if(whiteboard.tool == 'filledRect'){
          geom  = createGeom.rect(bounds, whiteboard.lineColor, whiteboard.lineStroke, whiteboard.fillColor);
          drawFromJSON(geom,whiteboard.drawing);
        }else if(whiteboard.tool == 'ellipse'){
          geom  = createGeom.ellipse(bounds, whiteboard.lineColor, whiteboard.lineStroke);
          drawFromJSON(geom,whiteboard.drawing);
        }else if(whiteboard.tool == 'filledEllipse'){
          geom  = createGeom.ellipse(bounds, whiteboard.lineColor, whiteboard.lineStroke, whiteboard.fillColor);
          drawFromJSON(geom,whiteboard.drawing);
        }else if(whiteboard.tool == 'line'){
          geom  = createGeom.line(bounds, whiteboard.lineColor, whiteboard.lineStroke, whiteboard.fillColor);
          drawFromJSON(geom,whiteboard.drawing);
        }else if(whiteboard.tool == 'pen'){
          geom = createGeom.pen(whiteboard.points, whiteboard.lineColor, whiteboard.lineStroke, whiteboard.fillColor);
          drawFromJSON(geom,whiteboard.drawing);
          console.log("num pen points sending:",geom.xPts.length);
        }else if(whiteboard.tool == 'delete'){
          shape = getHoveredShape(whiteboard.drawing,pt);
          if(shape){
            geom = createGeom.deleteGeom(shape);
            drawFromJSON(geom,whiteboard.drawing);
          }
        }else if(whiteboard.tool == 'move'){
          if(whiteboard.selectedShape && whiteboard.mouseDownPt){
            var ptDelta = {x: (pt.x - whiteboard.mouseDownPt.x),y: (pt.y - whiteboard.mouseDownPt.y)};

            geom = createGeom.move(whiteboard.selectedShape, ptDelta);

            drawFromJSON(geom,whiteboard.drawing);
          }

        }else if(whiteboard.tool == 'moveUp'){
          shape = getHoveredShape(whiteboard.drawing,pt);
          if(shape){
            geom = createGeom.moveUp(shape);
            drawFromJSON(geom,whiteboard.drawing);
          }
        }else if(whiteboard.tool == 'moveDown'){
          shape = getHoveredShape(whiteboard.drawing,pt);
          if(shape){
            geom = createGeom.moveDown(shape);
            drawFromJSON(geom,whiteboard.drawing);
          }
        }else if(whiteboard.tool == 'text'){
          whiteboard.textPoint = pt;
          registry.byId('textDialog').show();
          registry.byId('wbText').focus();
        }

        if(geom){
          sendMessage({geometry:geom});
        }

      }else{
        whiteboard.mouseDownPt = null;
        console.log("mouse released outside of drawing area");
      }
    }

    //clear everything
    whiteboard.mouseDownPt = null;
    whiteboard.selectedShape = null;
    whiteboard.points = [];
  }

  var chooseColor = function(type) {
    var cp = registry.byId(type + 'ColorPaletteWidget');
    dojo.style(dom.byId(type + 'Swatch'),{backgroundColor: cp.value});
    whiteboard[type + 'Color'] = cp.value;
    popup.close(registry.byId(type + "ColorPaletteDialog"));
  };

  var cancelChooseColor = function(type) {
    popup.close(registry.byId(type + "ColorPaletteDialog"));
  };

  var sendChatMessage = function(){
    var cwm = dom.byId('chatWaitMessage');
    var ct = registry.byId('chatText');
    var cb = registry.byId('chatBtn');
    var msg = _.escape(dojo.trim('' + ct.getValue()));
    if(msg == lastMessage){
      cwm.innerHTML = 'That\'s what you said last time.';
    }else if(msg){
      ct.setAttribute('disabled',true);
      cb.setAttribute('disabled',true);
      lastMessage = msg;
      dom.byId('chatWaitMessage').innerHTML = 'sending...';
      var chatMessage = {chatMessage:msg, fromUser: userName};
      sendMessage(chatMessage);
      printChatMessage(chatMessage);
    }else{
      cwm.innerHTML = 'Cat got your tongue?';
    }
  };

 var exportImage = function(){
  try{
    dom.byId("exportedImg").src = dojo.query('canvas',dom.byId('applicationArea'))[0].toDataURL();
    registry.byId("imgDialog").show();
    }catch(e){
      console.info("canvas not supported",e);
    }
  };

  var exportMovieImage = function(){
    try{
      dom.byId("exportedImg").src = dojo.query('canvas',dom.byId('movieDialog'))[0].toDataURL();
      registry.byId("imgDialog").show();
    }catch(e){
      console.info("canvas not supported",e);
    }
  };

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

  var doCancelAddText = function(){
    registry.byId('wbText').setValue('');
    registry.byId('textDialog').hide();
    whiteboard.overlayDrawing.clear();
    whiteboard.textPoint = null;
  };

  var doAddText = function(){
    var text = registry.byId('wbText').getValue();
    if((text != '') && (whiteboard.textPoint)){
      registry.byId('textDialog').hide();
      var geom = createGeom.text(whiteboard.textPoint, text, whiteboard.fontSize, whiteboard.lineColor);
      drawFromJSON(geom,whiteboard.drawing);
      whiteboard.textPoint = null;
      sendMessage({geometry:geom});
    }
    whiteboard.overlayDrawing.clear();
  };

  var doIncrementalText = function(){
    whiteboard.overlayDrawing.clear();
    var text = registry.byId('wbText').getValue();
    if((text != '') && (whiteboard.textPoint)){
      var geom = createGeom.text(whiteboard.textPoint, text, whiteboard.fontSize, whiteboard.lineColor);
      drawFromJSON(geom,whiteboard.overlayDrawing);
    }
  };

  var submitUserName = function(){
    var unm = dom.byId('subitUserNameMessage');
    var unt = registry.byId('userNameText');
    var unb = registry.byId('userNameBtn');
    wbId = registry.byId('wbIdText').getValue();
    if(!unt.isValid()){
      unm.innerHTML = 'Invalid user name';
    } else {
      unb.setAttribute('disabled',true);
      unt.setAttribute('disabled',true);
      unm.innerHTML = 'sending...';

      userName = _.escape(unt.getValue());
      wsrpc.methods.getWhiteBoard(wbId, userName).then(function(result){
        messageList = result.messages;
        wsrpc.socket.on('message', onMessage);
        wsrpc.socket.on('users', populateUserList);
        onOpened();
      });
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
