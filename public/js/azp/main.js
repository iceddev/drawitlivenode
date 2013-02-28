define([
  'dojo/dom',
  'dojo/on',
  'wsrpc/client',
  './wb/create-json',
  "dojo/parser",
  'dijit',

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
  "dijit/ColorPalette",
  "dijit/form/DropDownButton",
  "dijit/TooltipDialog",
  "dijit/form/RadioButton",
  "dijit/form/Select",
  "dijit/form/Form",
  "dijit/form/Slider",


  'dojo/domReady!'
], function(dom,on,WsRpc, createGeom, parser, dijit){

parser.parse();

var tools = [{name: 'line', showLineColor: true, showLineThickness: true},
      {name: 'pen', showLineColor: true, showLineThickness: true},
      {name: 'rect', showLineColor: true, showLineThickness: true},
      {name: 'ellipse', showLineColor: true, showLineThickness: true},
      {name: 'filledRect', showFillColor: true, showLineColor: true, showLineThickness: true},
      {name: 'filledEllipse', showFillColor: true, showLineColor: true, showLineThickness: true},
      {name: 'text', showLineColor: true, showFontSize: true},
      {name: 'delete'},
      {name: 'move'},
      {name: 'moveUp'},
      {name: 'moveDown'}
    ];

var whiteboard = {
  width : 700,
  height : 400,
  container : null,
  drawing: null,
  overlayContainer : null,
  overlayDrawing: null,
  lineColor : "#000000",
  fillColor : "#FFFFFF",
  lineStroke : 3,
  fontSize : 12,
  pingInterval : 180000,
  userCheckInterval : 600000,
  tool : 'pen',
  points : [],
  mouseDown : false

};

whiteboard.sendMessage = function(message){

  wsrpc.methods.sendMessage(wbId,message,userName).then(function(resp){
    console.log("post response",resp);
    if(resp.message){
      messageList.push(resp.message);
    }
    clearChatUI();
  });

  };

  whiteboard.pingServer = function() {


    };



 var getUserList = function() {

  wsrpc.methods.getUsers(wbId).then(function(users){
    populateUserList ( users);
    setTimeout ( "getUserList()", whiteboard.userCheckInterval);
  });
 };

var populateUserList = function(userList){
    try{
      var output = '';
      dojo.forEach(userList,function(user){
        output += ('<span id=\"userListItem' + user + '\" style=\"background-color: #FFFFFF;\">' + user + '</span><br>');
      });
      dojo.byId("userListDiv").innerHTML = output;
    }catch(e){
      console.info("error filling user list div",e);
    }
  };

var animateUserItem = function(user){
    try{
      var userNode = dojo.byId("userListItem" + user);
      if(userNode){
        dojo.animateProperty({
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
    dojo.byId('chatWaitMessage').innerHTML = '';
  }catch(e){}
  };



var onOpened = function() {


    dojo.byId('setUserDiv').style.display = 'none';


    dojo.byId('applicationArea').style.display = '';
    dijit.registry.byId('applicationArea').resize();
    initGfx();
    //whiteboard.sendMessage({chatMessage:'I\'m here!'});
    dojo.connect(dijit.registry.byId('chatBtn'),'onClick',sendChatMessage);

    //display any saved messages
    dojo.forEach(messageList,function(m){
      if(m.chatMessage){
        printChatMessage(m);
      }
    });

    whiteboard.pingServer();
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
    dojo.byId('output').innerHTML= messageListStr;
    dojo.byId('output').scrollTop = dojo.byId('output').scrollHeight;

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
    //animateUserItem(obj.fromUser);
  }


  };


 var initGfx = function(){
    whiteboard.container = dojo.byId("whiteboardContainer");
    whiteboard.overlayContainer = dojo.byId("whiteboardOverlayContainer");


    whiteboard.drawing = dojox.gfx.createSurface(whiteboard.container, whiteboard.width, whiteboard.height);
    whiteboard.overlayDrawing = dojox.gfx.createSurface(whiteboard.overlayContainer, whiteboard.width, whiteboard.height);


    //for playback
    whiteboard.movieContainer = dojo.byId("movieWhiteboardContainer");
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
       var dndc = new DNDFileController('whiteboardOverlayContainer');
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



var drawFromJSON = function(geom,drawing)
  {
  if(geom && geom.shapeType){
    var shape;
    var stroke = {color: geom.lineColor, width: geom.lineStroke};
    if(geom.shapeType == 'rect'){
      shape = drawing.createRect({x: geom.xPts[0], y: geom.yPts[0], width: (geom.xPts[1] - geom.xPts[0]), height: (geom.yPts[1] - geom.yPts[0]) });
    }
    else if(geom.shapeType == 'image'){
      //var img = new Image();
      //img.src = geom.text;
      var imgData = geom.dataStr;
      //console.log('drawImage',imgData);
      if(imgData){
        shape =  drawing.createImage({src:imgData,x: geom.xPts[0], y: geom.yPts[0], width: (geom.xPts[1] - geom.xPts[0]), height: (geom.yPts[1] - geom.yPts[0]) });
      }

    }
    else if(geom.shapeType == 'line'){
      shape = drawing.createLine({x1: geom.xPts[0], y1: geom.yPts[0], x2: geom.xPts[1], y2: geom.yPts[1]});
      stroke.cap = 'round';
    }
    else if(geom.shapeType == 'text'){

      shape = drawing.createText({ x:geom.xPts[0], y:geom.yPts[0] + geom.lineStroke, text:geom.text});
      shape.setFont({ size:(geom.lineStroke + "pt"), weight:"normal", family:"Arial" });
      shape.setFill(geom.lineColor);
      var width = shape.getTextWidth(geom.text);
      shape.wbbb = {
        x1: geom.xPts[0],
        y1: geom.yPts[0],
        x2: (geom.xPts[0] + width),
        y2: geom.yPts[0] + geom.lineStroke
      };


    }
    else if(geom.shapeType == 'ellipse'){

      shape = drawing.createEllipse({cx: ((geom.xPts[1] - geom.xPts[0])/2) + geom.xPts[0],
         cy: ((geom.yPts[1] - geom.yPts[0])/2) + geom.yPts[0],
         rx: (geom.xPts[1] - geom.xPts[0])/2,
         ry: (geom.yPts[1] - geom.yPts[0])/2 });
    }
    else if(geom.shapeType == 'pen'){
      if(geom.xPts){
        if(geom.xPts.length > 1){
          //console.log("num pen points drawing:",geom.xPts.length);
          shape = drawing.createGroup();

          for(var i = 0; i < (geom.xPts.length - 1); i++){

            var lineShape = drawing.createLine({x1: geom.xPts[i], y1: geom.yPts[i], x2: geom.xPts[i + 1], y2: geom.yPts[i + 1]});
            stroke.cap = 'round';
            lineShape.setStroke(stroke);

            shape.add(lineShape);
          }
        }
      }
    }else if(geom.shapeType == 'clear'){
      drawing.clear();
    }else if(geom.shapeType == 'delete'){
      removeShape(geom,drawing);
    }else if(geom.shapeType == 'move'){
      moveShape(geom,drawing);
    }else if(geom.shapeType == 'moveUp'){
      moveShapeUp(geom,drawing);
    }else if(geom.shapeType == 'moveDown'){
      moveShapeDown(geom,drawing);
    }
    else if(geom.shapeType == 'select'){

      shape = drawing.createRect({x: geom.xPts[0] - 3, y: geom.yPts[0] - 3, width: (geom.xPts[1] - geom.xPts[0] + 6), height: (geom.yPts[1] - geom.yPts[0] + 6) });
      shape.setStroke({color: new dojo.Color([0,0,255,0.75]), width: 2});
      shape.setFill(new dojo.Color([0,0,255,0.25]));
      return shape;
    }else if(geom.shapeType == 'deleteOverlay'){

      shape = drawing.createRect({x: geom.xPts[0] - 3, y: geom.yPts[0] - 3, width: (geom.xPts[1] - geom.xPts[0] + 6), height: (geom.yPts[1] - geom.yPts[0] + 6) });
      shape.setStroke({color: new dojo.Color([255,0,0,0.75]), width: 2});
      shape.setFill(new dojo.Color([255,0,0,0.25]));

      var line = drawing.createLine({x1: geom.xPts[0] - 3, y1: geom.yPts[0] - 3, x2: geom.xPts[1] + 3, y2: geom.yPts[1] + 3});
      line.setStroke({color: "#FF0000", width: 2});

      line = drawing.createLine({x1: geom.xPts[1] + 3, y1: geom.yPts[0] - 3, x2: geom.xPts[0] - 3, y2: geom.yPts[1] + 3});
      line.setStroke({color: "#FF0000", width: 2});

      return shape;
    }else if(geom.shapeType == 'moveOverlay'){

      shape = drawing.createRect({x: geom.xPts[0] - 3, y: geom.yPts[0] - 3, width: (geom.xPts[1] - geom.xPts[0] + 6), height: (geom.yPts[1] - geom.yPts[0] + 6) });
      shape.setStroke({color: new dojo.Color([0,0,255,0.75]), width: 2});
      shape.setFill(new dojo.Color([0,0,255,0.25]));

      return shape;
    }else if(geom.shapeType == 'moveUpOverlay'){

      shape = drawing.createRect({x: geom.xPts[0] - 3, y: geom.yPts[0] - 3, width: (geom.xPts[1] - geom.xPts[0] + 6), height: (geom.yPts[1] - geom.yPts[0] + 6) });
      //shape.setStroke({color: new dojo.Color([0,0,255,0.75]), width: 2});
      shape.setFill(new dojo.Color([0,0,255,0.15]));

      var line = drawing.createLine({x1: geom.xPts[0] - 5, y1: geom.yPts[0] + ((geom.yPts[1] - geom.yPts[0]) / 2), x2: geom.xPts[1] + 3, y2: geom.yPts[0] + ((geom.yPts[1] - geom.yPts[0]) / 2)});
      line.setStroke({color: "#0000FF", width: 2});

      line = drawing.createLine({x1: geom.xPts[0] - 5, y1: geom.yPts[0] + ((geom.yPts[1] - geom.yPts[0]) / 2), x2: geom.xPts[0] + ((geom.xPts[1] - geom.xPts[0]) / 2), y2: geom.yPts[0] -5});
      line.setStroke({color: "#0000FF", width: 2});

      line = drawing.createLine({x1: geom.xPts[0] + ((geom.xPts[1] - geom.xPts[0]) / 2), y1: geom.yPts[0] -5, x2: geom.xPts[1] + 5, y2: geom.yPts[0] + ((geom.yPts[1] - geom.yPts[0]) / 2)});
      line.setStroke({color: "#0000FF", width: 2});


      return shape;
    }else if(geom.shapeType == 'moveDownOverlay'){

      shape = drawing.createRect({x: geom.xPts[0] - 3, y: geom.yPts[0] - 3, width: (geom.xPts[1] - geom.xPts[0] + 6), height: (geom.yPts[1] - geom.yPts[0] + 6) });
      //shape.setStroke({color: new dojo.Color([0,0,255,0.75]), width: 2});
      shape.setFill(new dojo.Color([0,0,255,0.15]));

      var line = drawing.createLine({x1: geom.xPts[0] - 5, y1: geom.yPts[0] + ((geom.yPts[1] - geom.yPts[0]) / 2), x2: geom.xPts[1] + 3, y2: geom.yPts[0] + ((geom.yPts[1] - geom.yPts[0]) / 2)});
      line.setStroke({color: "#0000FF", width: 2});

      line = drawing.createLine({x1: geom.xPts[0] - 5, y1: geom.yPts[0] + ((geom.yPts[1] - geom.yPts[0]) / 2), x2: geom.xPts[0] + ((geom.xPts[1] - geom.xPts[0]) / 2), y2: geom.yPts[1] + 5});
      line.setStroke({color: "#0000FF", width: 2});

      line = drawing.createLine({x1: geom.xPts[0] + ((geom.xPts[1] - geom.xPts[0]) / 2), y1: geom.yPts[1] + 5, x2: geom.xPts[1] + 5, y2: geom.yPts[0] + ((geom.yPts[1] - geom.yPts[0]) / 2)});
      line.setStroke({color: "#0000FF", width: 2});

      return shape;
    }

    if(shape){

      shape.cRand = geom.cRand;
      shape.cTime = geom.cTime;
      if(!shape.wbbb){
        shape.wbbb = getBoundingBox(geom);
      }
      shape.fromUser = geom.fromUser;

      if(geom.filled && shape.setFill){
        shape.setFill(geom.fillColor);
      }
      if(shape.setStroke && (geom.shapeType != 'text')){
        shape.setStroke(stroke);
      }
    }

    //console.log('drawFromJSON',shape, drawing);
    return shape;
  }

 };

 var getBoundingBox = function(geom){

   if(geom.xPts && geom.yPts){
     var xs = geom.xPts;
     var ys = geom.yPts;
     var bb = {x1: 0, x2: -1, y1: 0, y2: -1 };

     if(xs.length > 1){
      bb.x1 = xs[0];
      bb.x2 = xs[1];
      dojo.forEach(xs, function(x){
        if(x < bb.x1){
          bb.x1 = x;
        }
        else if(x > bb.x2){
          bb.x2 = x;
        }
      });
     }

     if(ys.length > 1){
        bb.y1 = ys[0];
        bb.y2 = ys[1];
        dojo.forEach(ys, function(y){
          if(y < bb.y1){
            bb.y1 = y;
          }
          else if(y > bb.y2){
            bb.y2 = y;
          }
        });
     }

     return bb;
   }
   else{
    return null;
   }

 };

 var removeShape = function(geom, drawing){
    var shape = getShapeFromGeom(geom,drawing);
    if(shape){
      drawing.remove(shape);
    }

  };


var moveShape = function(geom, drawing){
    var shape = getShapeFromGeom(geom,drawing);
    if(shape){
      shape.applyTransform({dx: geom.xPts[0], dy: geom.yPts[0]});
      if(shape.wbbb){
      shape.wbbb.x1 += geom.xPts[0];
      shape.wbbb.x2 += geom.xPts[0];
      shape.wbbb.y1 += geom.yPts[0];
      shape.wbbb.y2 += geom.yPts[0];
      }
    }

};

var moveShapeUp = function(geom, drawing){
    var shape = getShapeFromGeom(geom,drawing);
    if(shape){
      shape.moveToFront();
    }
};

var moveShapeDown = function(geom, drawing){
    var shape = getShapeFromGeom(geom,drawing);
    if(shape){
      shape.moveToBack();
    }
};


  var getShapeFromGeom = function(geom, drawing){

    var retVal = null;
    dojo.every(drawing.children, function(shape){
        if((shape.cRand == geom.cRand) && (shape.cTime == geom.cTime)){
          retVal = shape;
            return false;
        }
        return true; // keep going until we find one that isn't
    });

    return retVal;
  };

 var pointInDrawing = function(pt){
    if((pt.x > -2) && (pt.x < (whiteboard.width + 2)) && (pt.y > -2) && (pt.y < (whiteboard.height + 2))){
      return true;
    }else{
     return false;
    }

  };

var getGfxMouse = function(evt){
    var coordsM = dojo.coords(whiteboard.container);
    return {x: Math.round(evt.clientX - coordsM.x), y: Math.round(evt.clientY - coordsM.y)};
};

var  doGfxMouseDown = function(evt)
  {
  var pt = getGfxMouse(evt);
  //console.dir(pt);
  if(pointInDrawing(pt)){
    whiteboard.mouseDownPt = pt;
    whiteboard.points = [pt];
    whiteboard.mouseDown = true;

    whiteboard.selectedShape = getHoveredShape(whiteboard.drawing,pt);
  }

 };

var doGfxMouseMove = function(evt)
  {
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
  }
  else{
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


 var doGfxMouseUp = function(evt)
  {
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

          geom = createGeom.moveJSON(whiteboard.selectedShape, ptDelta);

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

var selectTool = function(toolName)
  {

    hide("lineColorDisplay");
    hide("fillColorDisplay");
    hide("lineStrokeSelect");
    hide("fontSizeSelect");

    var tool = null;
    dojo.forEach(tools,function(aTool){
        if(aTool.name == toolName){
          tool = aTool;
        }
      //dojo.style(dijit.registry.byId(aTool.name + 'ToolBtn').domNode,'border','0px');
        //dojo.addClass(dojo.style(dijit.registry.byId(aTool.name + 'ToolBtn').domNode, "selected");
        dojo.removeClass(dijit.registry.byId(aTool.name + 'ToolBtn').domNode, "selected");
    });

    //dojo.style(dijit.registry.byId(tool.name + 'ToolBtn').domNode,'border','2px solid black');
        dojo.addClass(dijit.registry.byId(tool.name + 'ToolBtn').domNode, "selected");
    whiteboard.tool = tool.name;

    if(tool.showLineColor){
      show("lineColorDisplay");
    }
    if(tool.showFillColor){
      show("fillColorDisplay");
    }
    if(tool.showLineThickness){
      show("lineStrokeSelect");
    }
    if(tool.showFontSize){
      show("fontSizeSelect");
    }

  };

 var hide = function(id){
  try{
    dijit.registry.byId(id).domNode.style.display = 'none';
  }catch(e)
  {
  }
 };

 var show = function(id){
   try{
    dijit.registry.byId(id).domNode.style.display = '';
  }catch(e)
  {
  }
 };

 var chooseColor = function(type) {
      var cp = dijit.registry.byId(type + 'ColorPaletteWidget');
      //console.log(cp);
      dojo.style(dojo.byId(type + 'Swatch'),{backgroundColor: cp.value});
    whiteboard[type + 'Color'] = cp.value;
      dijit.popup.close(dijit.registry.byId(type + "ColorPaletteDialog"));
  };

var cancelChooseColor = function(type) {
  dijit.popup.close(dijit.registry.byId(type + "ColorPaletteDialog"));
};

var  sendChatMessage = function(){
  var cwm = dojo.byId('chatWaitMessage');
  var ct = dijit.registry.byId('chatText');
  var cb = dijit.registry.byId('chatBtn');
  var msg = dojo.trim('' + ct.getValue());
  if(msg == '')
  {
    cwm.innerHTML = 'Cat got your tongue?';
    }else if(msg == lastMessage){
      cwm.innerHTML = 'That\'s what you said last time.';
    }else{
      ct.setAttribute('disabled',true);
    cb.setAttribute('disabled',true);
    lastMessage = msg;
    dojo.byId('chatWaitMessage').innerHTML = 'sending...';
    whiteboard.sendMessage({chatMessage:msg});
    }

  };

 var exportImage = function(){
  try{

    dojo.byId("exportedImg").src = dojo.query('canvas',dojo.byId('applicationArea'))[0].toDataURL();
    dijit.registry.byId("imgDialog").show();

  }catch(e){
    console.info("canvas not supported",e);
  }
  };

 var exportMovieImage = function(){
    try{

      dojo.byId("exportedImg").src = dojo.query('canvas',dojo.byId('movieDialog'))[0].toDataURL();
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

  var takePicture = function(){
    console.log('take pic');
    capture();

    var bounds = {x1:100, y1:100, y2: 300, x2: 400};
    var imgJSON = createGeom.image(bounds,canvas.toDataURL());
    drawFromJSON(imgJSON,whiteboard.drawing);
    whiteboard.sendMessage({geometry:imgJSON});
  };

 var incrementMovie = function(){
    var indexEnd = Math.round(dijit.registry.byId('movieSlider').getValue());
    whiteboard.movieDrawing.clear();
    for(var i =0; i < indexEnd; i++){
      drawFromJSON(whiteboard.geomMessageList[i].geometry, whiteboard.movieDrawing);
    }
    if(indexEnd > 0){
      dojo.byId('movieUser').innerHTML = whiteboard.geomMessageList[indexEnd - 1].fromUser;
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
    var unm = dojo.byId('subitUserNameMessage');
    var unt = dijit.registry.byId('userNameText');
    var unb = dijit.registry.byId('userNameBtn');
    wbId = dijit.registry.byId('wbIdText').getValue();
    if(!unt.isValid()){
      unm.innerHTML = 'Invalid user name';
    }else{
      unb.setAttribute('disabled',true);
      unt.setAttribute('disabled',true);
      unm.innerHTML = 'sending...';

      userName = unt.getValue();
      wsrpc.methods.getWhiteBoard(wbId, userName).then(function(result){
       messageList = result.messages;
       //showResult(result,timeStart);
       wsrpc.socket.on('message',onMessage);
       onOpened();

      });


    }
 };


 var loadFunction = function(){

      dojo.connect(dijit.registry.byId('userNameBtn'),'onClick',submitUserName);
      dojo.byId('setUserDiv').style.display = '';
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

  dojo.connect(dijit.registry.byId('smileBtn'),'onClick',takePicture);

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



function DNDFileController(id) {
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
                  var maxDim = 75;
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
                  var imgJSON = createImageJSON(bounds,tempCanvas.toDataURL());


                  //console.log(imgJSON);

                  drawFromJSON(imgJSON,whiteboard.drawing);

                  whiteboard.sendMessage({geometry:imgJSON});



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
  };











  var wsrpc = new WsRpc(io.connect('/'));
  window.wsrpc = wsrpc; //export global to play with in web dev tools


  loadFunction();

selectTool('pen');









navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.getUserMedia;
window.URL = window.URL || window.webkitURL;

var app = document.getElementById('app');
var video = document.getElementById('monitor');
var canvas = document.getElementById('photo');
var effect = document.getElementById('effect');
var gallery = document.getElementById('gallery');
var ctx = canvas.getContext('2d');
var intervalId = null;
var idx = 0;
var filters = [
  'grayscale',
  'sepia',
  'blur',
  'brightness',
  'contrast',
  'hue-rotate', 'hue-rotate2', 'hue-rotate3',
  'saturate',
  'invert',
  ''
];

function changeFilter(el) {
  el.className = '';
  var effect = filters[idx++ % filters.length];
  if (effect) {
    el.classList.add(effect);
  }
}

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
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    document.getElementById('splash').hidden = true;
    document.getElementById('app').hidden = false;
  }, 50);
}

function noStream(e) {
  var msg = 'No camera available.';
  if (e.code == 1) {
    msg = 'User denied access to use camera.';
  }
  document.getElementById('errorMessage').textContent = msg;
}

function capture() {
    ctx.drawImage(video, 0, 0);
    var img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
}


  navigator.getUserMedia({video: true}, gotStream, noStream);












});
