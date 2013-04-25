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
  'dojo/on',
  'wsrpc/client',
  './wb/create-json',
  "dojo/parser",
  'dijit',
  'dojo/_base/fx',

  'dijit/form/ValidationTextBox',
  'dijit/registry',
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
], function(req, _, tools, selectTool, drawFromJSON, whiteboard, getGfxMouse, DNDFileController, dom, on, WsRpc, createGeom, parser, dijit, fx){

var chatMessageList = [];
var geomMessageList = [];
var messageList = [];
var messageMax = 200;
var wbId;
var lastMessage = '';
var userList = [];
var messageListObj = null;


var error = '';

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

  wsrpc.methods.getUsers(wbId).then(function(users){
    populateUserList (users);
  });
 };

var populateUserList = function(userList){
  if(userList && userList.length){
    try{
      var output = '';
      dojo.forEach(userList,function(user){
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

    }catch(e)
    {
      console.info("couldn\'t animate " + user, e);
    }

  };

var clearChatUI = function(){
  try{
    dijit.registry.byId('chatText').setAttribute('disabled',false);
    dijit.registry.byId('chatText').setValue('');
    dijit.registry.byId('chatBtn').setAttribute('disabled',false);
    dom.byId('chatWaitMessage').innerHTML = '';
  }catch(e){}
};



var onOpened = function() {
    dom.byId('setUserDiv').style.display = 'none';

    dom.byId('applicationArea').style.display = '';
    dijit.registry.byId('applicationArea').resize();
    initGfx();
    dojo.connect(dijit.registry.byId('chatBtn'),'onClick',sendChatMessage);

    //display any saved messages
    dojo.forEach(messageList,function(m){
      if(m.chatMessage){
        printChatMessage(m);
      }
    });

    getUserList();
  };

 var printChatMessage = function(message){
    chatMessageList.push('<pre class=\"chatMessage\"><span class=\"chatFrom\">' + message.fromUser + '</span>: ' + message.chatMessage + '</pre><br>');
    if(chatMessageList.length > messageMax){
      chatMessageList.shift();
    }

    var messageListStr = '';
    for(var i=0; i < chatMessageList.length; i++){
      messageListStr += chatMessageList[i];
    }
    dom.byId('output').innerHTML= messageListStr;
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
    dojo.forEach(messageList,function(m){
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
    //console.log('offset',origBB, pointInBB, newPt);

    var xDelta = Math.abs(pointInBB.x - origBB.x1);
    var yDelta = Math.abs(pointInBB.y - origBB.y1);

    //console.log('deltas',xDelta,yDelta);
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
    //console.dir(pt);
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
            //console.dir(offBB);
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
    //console.dir(pt);

    //always clear the overlay
    whiteboard.overlayDrawing.clear();

    if(whiteboard.mouseDownPt){
      //make sure mouse was released inside of drawing area
      if(pointInDrawing(pt)){

        //console.dir(whiteboard.mouseDownPt);

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
          //console.log(whiteboard.selectedShape,whiteboard.mouseDownPt,bounds);
          if(whiteboard.selectedShape && whiteboard.mouseDownPt){
            var ptDelta = {x: (pt.x - whiteboard.mouseDownPt.x),y: (pt.y - whiteboard.mouseDownPt.y)};

            geom = createGeom.move(whiteboard.selectedShape, ptDelta);

            drawFromJSON(geom,whiteboard.drawing);
            //console.dir(geom);
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
          dijit.registry.byId('textDialog').show();
          dijit.registry.byId('wbText').focus();

        }


        //whiteboard.points = [];

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
      var cp = dijit.registry.byId(type + 'ColorPaletteWidget');
      //console.log(cp);
      dojo.style(dom.byId(type + 'Swatch'),{backgroundColor: cp.value});
    whiteboard[type + 'Color'] = cp.value;
      dijit.popup.close(dijit.registry.byId(type + "ColorPaletteDialog"));
  };

var cancelChooseColor = function(type) {
  dijit.popup.close(dijit.registry.byId(type + "ColorPaletteDialog"));
};

var  sendChatMessage = function(){
  var cwm = dom.byId('chatWaitMessage');
  var ct = dijit.registry.byId('chatText');
  var cb = dijit.registry.byId('chatBtn');
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
    dijit.registry.byId("imgDialog").show();

  }catch(e){
    console.info("canvas not supported",e);
  }
  };

 var exportMovieImage = function(){
    try{

      dom.byId("exportedImg").src = dojo.query('canvas',dom.byId('movieDialog'))[0].toDataURL();
      dijit.registry.byId("imgDialog").show();

    }catch(e){
      console.info("canvas not supported",e);
    }
};

var showMovie = function(){
    try{

      dijit.registry.byId("movieDialog").show();

      if(messageList){
        whiteboard.geomMessageList = [];
        dojo.forEach(messageList,function(m){
          if(m.geometry){
            whiteboard.geomMessageList.push(m);
          }
        });
      }
      var mSlider = dijit.registry.byId('movieSlider');
      mSlider.setAttribute('maximum',whiteboard.geomMessageList.length);
      mSlider.setAttribute('discreteValues',whiteboard.geomMessageList.length);

      mSlider.setValue(0);

    }catch(e){
      console.info("canvas not supported",e);
    }
  };

 var incrementMovie = function(){
    var indexEnd = Math.round(dijit.registry.byId('movieSlider').getValue());
    whiteboard.movieDrawing.clear();
    for(var i =0; i < indexEnd; i++){
      drawFromJSON(whiteboard.geomMessageList[i].geometry, whiteboard.movieDrawing);
    }
    if(indexEnd > 0){
      dom.byId('movieUser').innerHTML = whiteboard.geomMessageList[indexEnd - 1].fromUser;
    }

  };

  var doCancelAddText = function(){
    dijit.registry.byId('wbText').setValue('');
    dijit.registry.byId('textDialog').hide();
    whiteboard.overlayDrawing.clear();
    whiteboard.textPoint = null;
  };

  var doAddText = function(){
    var text = dijit.registry.byId('wbText').getValue();
    if((text != '') && (whiteboard.textPoint)){
      dijit.registry.byId('textDialog').hide();
      var geom = createGeom.text(whiteboard.textPoint, text, whiteboard.fontSize, whiteboard.lineColor);
      drawFromJSON(geom,whiteboard.drawing);
      whiteboard.textPoint = null;
      whiteboard.sendMessage({geometry:geom});
    }
    whiteboard.overlayDrawing.clear();
  };

  var doIncrementalText = function(){
    whiteboard.overlayDrawing.clear();
    var text = dijit.registry.byId('wbText').getValue();
    if((text != '') && (whiteboard.textPoint)){
      var geom = createGeom.text(whiteboard.textPoint, text, whiteboard.fontSize, whiteboard.lineColor);
      drawFromJSON(geom,whiteboard.overlayDrawing);
    }

  };


var submitUserName = function(){
    var unm = dom.byId('subitUserNameMessage');
    var unt = dijit.registry.byId('userNameText');
    var unb = dijit.registry.byId('userNameBtn');
    wbId = dijit.registry.byId('wbIdText').getValue();
    if(!unt.isValid()){
      unm.innerHTML = 'Invalid user name';
    }else{
      unb.setAttribute('disabled',true);
      unt.setAttribute('disabled',true);
      unm.innerHTML = 'sending...';

      userName = _.escape(unt.getValue());
      wsrpc.methods.getWhiteBoard(wbId, userName).then(function(result){
       messageList = result.messages;
       //showResult(result,timeStart);
       wsrpc.socket.on('message',onMessage);
       wsrpc.socket.on('users',populateUserList);
       onOpened();

      });


    }
 };

 var loadFunction = function(){

      dojo.connect(dijit.registry.byId('userNameBtn'),'onClick',submitUserName);
      dom.byId('setUserDiv').style.display = '';
      dojo.connect(dijit.registry.byId("userNameText"), 'onKeyDown', function(evt) {
         if(evt.keyCode == dojo.keys.ENTER) {
                submitUserName();
          }
      });


  dojo.connect(dijit.registry.byId('lineColorPaletteOkBtn'),'onClick',function(){
    chooseColor('line');
  });
  dojo.connect(dijit.registry.byId('lineColorPaletteCancelBtn'),'onClick',function(){
    cancelChooseColor('line');
  });

  dojo.connect(dijit.registry.byId('fillColorPaletteOkBtn'),'onClick',function(){
    chooseColor('fill');
  });
  dojo.connect(dijit.registry.byId('fillColorPaletteCancelBtn'),'onClick',function(){
    cancelChooseColor('fill');
  });

  if(Modernizr.canvas)
  {
    dojo.connect(dijit.registry.byId('exportImgBtn'),'onClick',exportImage);
    dojo.connect(dijit.registry.byId('exportMovieImgBtn'),'onClick',exportMovieImage);
  }else{
    dojo.style(dijit.registry.byId('exportImgBtn').domNode, {'visibility': 'hidden', 'display': 'none'});
    dojo.style(dijit.registry.byId('exportMovieImgBtn').domNode, {'visibility': 'hidden', 'display': 'none'});
  }

  dojo.connect(dijit.registry.byId('showMovieBtn'),'onClick',showMovie);

  dojo.connect(dijit.registry.byId('movieSlider'),'onChange',incrementMovie);



  dojo.connect(dijit.registry.byId('lineStrokeSelect'),'onChange',function(){
    whiteboard.lineStroke = Math.floor(1.0 * dijit.registry.byId('lineStrokeSelect').getValue());
  });

  dojo.connect(dijit.registry.byId('fontSizeSelect'),'onChange',function(){
    whiteboard.fontSize = Math.floor(1.0 * dijit.registry.byId('fontSizeSelect').getValue());
  });

  dojo.connect(dijit.registry.byId('clearDrawingNoBtn'),'onClick',function(){
    dijit.popup.close(dijit.registry.byId("clearDrawingDialog"));
  });

  dojo.connect(dijit.registry.byId('clearDrawingYesBtn'),'onClick',function(){
    dijit.popup.close(dijit.registry.byId("clearDrawingDialog"));
    var geom = createClearDrawingJSON();
    whiteboard.sendMessage({geometry: geom });
    drawFromJSON(geom,whiteboard.drawing);

  });

  dojo.connect(dijit.registry.byId('sendMailButton'),'onClick',function(){

    sendEmail();

  });

  dojo.forEach(tools,function(tool){
    dojo.connect(dijit.registry.byId(tool.name + 'ToolBtn'),'onClick',function(){
      selectTool(tool.name);
    });
  });

    dojo.connect(dijit.registry.byId("wbText"), 'onKeyDown', function(evt) {
          if(evt.keyCode == dojo.keys.ENTER) {
            doAddText();
      }
     });

     dojo.connect(dijit.registry.byId("okTextBtn"), 'onClick', function(evt) {
          doAddText();
     });

     dojo.connect(dijit.registry.byId("cancelTextBtn"), 'onClick', function(evt) {
          doCancelAddText();
     });

     dojo.connect(dijit.registry.byId("wbText"), 'onKeyUp', function(evt) {
          doIncrementalText();
     });

     dojo.connect(dijit.registry.byId("wbText"), 'onChange', function(evt) {
          doIncrementalText();
     });

     dojo.connect(dijit.registry.byId("textDialog"), 'onClose', function(evt) {
      whiteboard.overlayDrawing.clear();
      dijit.registry.byId("wbText").setValue('');
     });

     dojo.connect(dijit.registry.byId("textDialog"), 'onHide', function(evt) {
      whiteboard.overlayDrawing.clear();
      dijit.registry.byId("wbText").setValue('');
     });

     try{
       var reader = new FileReader();
       reader.onload = function(e) {
         document.querySelector('img').src = e.target.result;
       };

       function onDrop(e) {
         reader.readAsDataURL(e.dataTransfer.files[0]);
       };

     }catch(imgE){


     }
};

  var wsrpc = new WsRpc(io.connect('/'));
  window.wsrpc = wsrpc; //export global to play with in web dev tools

  loadFunction();

});
