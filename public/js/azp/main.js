define([
  'require',
  'lodash',
  './tools',
  './selectTool',
  './drawFromJSON',
  './wb/whiteboard',
  './wb/getGfxMouse',
  './wb/DNDFileController',
  'dojo/dom',
  'wsrpc/client',
  './wb/create-json',
  "dojo/parser",
  'dijit/popup',
  'dijit/registry',
  'dojo/_base/fx',

  'dijit/form/ValidationTextBox',
  'dijit/form/TextBox',
  'dijit/form/Textarea',
  'dijit/form/Button',
  'dijit/Dialog',
  'dijit/layout/BorderContainer',
  'dijit/layout/ContentPane',

  "dojox/gfx",
  "dojo/fx",
  "dojox/gfx/move",
  "dojo/NodeList-fx",
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
], function(req, _, tools, selectTool, drawFromJSON, whiteboard, getGfxMouse, DNDFileController, dom, WsRpc, createGeom, parser, popup, registry, fx){

  var geomMessageList = [];
  var messageList = [];
  var messageMax = 200;
  var wbId;
  var lastMessage = '';
  var userList = [];
  var messageListObj = null;

  parser.parse().then(function(){
    selectTool('pen');
    req(['./webrtc'], function(){});
  });

  whiteboard.sendMessage = function(message){
    wsrpc.methods.sendMessage(wbId,message,userName).then(function(resp){
      console.log("post response",resp);
      if(resp.message){
        messageList.push(resp.message);
      }
      clearChatUI();
    });
  };

  var getUserList = function() {
    wsrpc.methods.getUsers(wbId).then(populateUserList);
  };

  var populateUserList = function(userList){
    if(userList && userList.length){
      try{
        var output = '';
        _.forEach(userList,function(user){
          output += ('<span id=\"userListItem' + user + '\" style=\"background-color: #FFFFFF;\">' + user + '</span><br>');
        });
        dom.byId("userListDiv").innerHTML = output;
      }catch(e){
        console.info("error filling user list div",e);
      }
      animateUserItem(userList[userList.length - 1]);
    }
  };

  var animateUserItem = function(user){
    try{
      var userNode = dom.byId("userListItem" + user);
      if(userNode){
        fx.animateProperty({
          node: userNode,
          duration: 750,
          properties: {
              backgroundColor: {
                  start: "red",
                  end: "white"
              },
              color: {
                  start: "white",
                  end: "black"
              }
          }
        }).play();
      }
    }catch(e){
      console.info("couldn\'t animate " + user, e);
    }
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
    dojo.connect(registry.byId('chatBtn'),'onClick',sendChatMessage);

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

    if(obj.chatMessage || obj.geometry)
    {
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

    dojo.connect(dojo.body(),'onmouseup',doGfxMouseUp); //mouse release can happen anywhere in the container
    dojo.connect(whiteboard.overlayContainer,'onmousedown',doGfxMouseDown);
    //dojo.connect(dojo.body(),'onmousemove',doGfxMouseMove);
    dojo.connect(whiteboard.overlayContainer,'onmousemove',doGfxMouseMove);
    console.log("topov",dojo.style(whiteboard.overlayContainer,"top"));

     if(Modernizr.draganddrop){
       console.log('supports drag and drop!');
       var dndc = new DNDFileController('whiteboardOverlayContainer', function(imgJSON){
          drawFromJSON(imgJSON,whiteboard.drawing);

          whiteboard.sendMessage({geometry:imgJSON});
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

  var doGfxMouseDown = function(evt){
    var pt = getGfxMouse(evt);
    if(pointInDrawing(pt)){
      whiteboard.mouseDownPt = pt;
      whiteboard.points = [pt];
      whiteboard.mouseDown = true;

      whiteboard.selectedShape = getHoveredShape(whiteboard.drawing,pt);
    }
  };

  var doGfxMouseMove = function(evt){
    var pt = getGfxMouse(evt);
    var geom;

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
        var shape = getHoveredShape(whiteboard.drawing,pt);
        if(shape){
          geom = createGeom.moveOverlay(shape.wbbb);
          drawFromJSON(geom,whiteboard.overlayDrawing);
        }
      }
    }

    //mouse up or down doesn't matter for the select and delete tools
    if(whiteboard.tool == 'delete'){
      whiteboard.overlayDrawing.clear();
      var shape = getHoveredShape(whiteboard.drawing,pt);
      if(shape){
        geom = createGeom.deleteOverlay(shape.wbbb);
        drawFromJSON(geom,whiteboard.overlayDrawing);
      }
    }else if(whiteboard.tool == 'moveUp'){
      whiteboard.overlayDrawing.clear();
      var shape = getHoveredShape(whiteboard.drawing,pt);
      if(shape){
        geom = createGeom.moveUpOverlay(shape.wbbb);
        drawFromJSON(geom,whiteboard.overlayDrawing);
      }
    }else if(whiteboard.tool == 'moveDown'){
      whiteboard.overlayDrawing.clear();
      var shape = getHoveredShape(whiteboard.drawing,pt);
      if(shape){
        geom = createGeom.moveDownOverlay(shape.wbbb);
        drawFromJSON(geom,whiteboard.overlayDrawing);
      }
    }
  };

  var doGfxMouseUp = function(evt) {
    var pt = getGfxMouse(evt);
    whiteboard.mouseDown = false;

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
          var shape = getHoveredShape(whiteboard.drawing,pt);
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
          var shape = getHoveredShape(whiteboard.drawing,pt);
          if(shape){
            geom = createGeom.moveUp(shape);
            drawFromJSON(geom,whiteboard.drawing);
          }
        }else if(whiteboard.tool == 'moveDown'){
          var shape = getHoveredShape(whiteboard.drawing,pt);
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
          whiteboard.sendMessage({geometry:geom});
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
  };

  var getHoveredShape = function(drawing, pt){
    try{
      var children = drawing.children;
      if(children){
        for(var i = children.length; i > 0; i--){
          var child = children[i - 1];
          if(ptInBox(pt,child.wbbb)){
            return child;
          }
        }
      }
    }catch(e){
      console.log('error finding shape',e);
    }

    return null;
  };

  var ptInBox = function(pt, box){
    if(pt && box){
      if((pt.x >= box.x1) && (pt.x <= box.x2) && (pt.y >= box.y1) && (pt.y <= box.y2)){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  };

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
      whiteboard.sendMessage(chatMessage);
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
      whiteboard.sendMessage({geometry:geom});
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

  var loadFunction = function(){
    dojo.connect(registry.byId('userNameBtn'),'onClick',submitUserName);
    dom.byId('setUserDiv').style.display = '';
    dojo.connect(registry.byId("userNameText"), 'onKeyDown', function(evt) {
      if(evt.keyCode == dojo.keys.ENTER) {
        submitUserName();
      }
    });

    dojo.connect(registry.byId('lineColorPaletteOkBtn'),'onClick',function(){
      chooseColor('line');
    });
    dojo.connect(registry.byId('lineColorPaletteCancelBtn'),'onClick',function(){
      cancelChooseColor('line');
    });

    dojo.connect(registry.byId('fillColorPaletteOkBtn'),'onClick',function(){
      chooseColor('fill');
    });
    dojo.connect(registry.byId('fillColorPaletteCancelBtn'),'onClick',function(){
      cancelChooseColor('fill');
    });

    if(Modernizr.canvas){
      dojo.connect(registry.byId('exportImgBtn'),'onClick',exportImage);
      dojo.connect(registry.byId('exportMovieImgBtn'),'onClick',exportMovieImage);
    } else {
      dojo.style(registry.byId('exportImgBtn').domNode, {'visibility': 'hidden', 'display': 'none'});
      dojo.style(registry.byId('exportMovieImgBtn').domNode, {'visibility': 'hidden', 'display': 'none'});
    }

    dojo.connect(registry.byId('showMovieBtn'),'onClick',showMovie);

    dojo.connect(registry.byId('movieSlider'),'onChange',incrementMovie);

    dojo.connect(registry.byId('lineStrokeSelect'),'onChange',function(){
      whiteboard.lineStroke = Math.floor(1.0 * registry.byId('lineStrokeSelect').getValue());
    });

    dojo.connect(registry.byId('fontSizeSelect'),'onChange',function(){
      whiteboard.fontSize = Math.floor(1.0 * registry.byId('fontSizeSelect').getValue());
    });

    dojo.connect(registry.byId('clearDrawingNoBtn'),'onClick',function(){
      popup.close(registry.byId("clearDrawingDialog"));
    });

    dojo.connect(registry.byId('clearDrawingYesBtn'),'onClick',function(){
      popup.close(registry.byId("clearDrawingDialog"));
      var geom = createClearDrawingJSON();
      whiteboard.sendMessage({geometry: geom });
      drawFromJSON(geom,whiteboard.drawing);
    });

    _.forEach(tools,function(tool){
      dojo.connect(registry.byId(tool.name + 'ToolBtn'),'onClick',function(){
        selectTool(tool.name);
      });
    });

    dojo.connect(registry.byId("wbText"), 'onKeyDown', function(evt) {
      if(evt.keyCode == dojo.keys.ENTER) {
        doAddText();
      }
    });

     dojo.connect(registry.byId("okTextBtn"), 'onClick', function(evt) {
          doAddText();
     });

     dojo.connect(registry.byId("cancelTextBtn"), 'onClick', function(evt) {
          doCancelAddText();
     });

     dojo.connect(registry.byId("wbText"), 'onKeyUp', function(evt) {
          doIncrementalText();
     });

     dojo.connect(registry.byId("wbText"), 'onChange', function(evt) {
          doIncrementalText();
     });

     dojo.connect(registry.byId("textDialog"), 'onClose', function(evt) {
      whiteboard.overlayDrawing.clear();
      registry.byId("wbText").setValue('');
     });

     dojo.connect(registry.byId("textDialog"), 'onHide', function(evt) {
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
  };

  var wsrpc = new WsRpc(io.connect('/'));

  loadFunction();

});
