define([
  './sendMessage',
  './drawFromJson',
  './doGfxMouseUp',
  './doGfxMouseDown',
  './doGfxMouseMove',
  './wb/whiteboard',
  './wb/DNDFileController',
  'dojo/on',
  'dojo/dom',
  'dojo/dom-style',
  'dojo/dom-geometry',
  'dojox/gfx',
  'dojox/gfx/move'
], function(sendMessage, drawFromJSON, doGfxMouseUp, doGfxMouseDown, doGfxMouseMove, whiteboard, DNDFileController, on, dom, domStyle, domGeom, gfx){

  'use strict';

  return function initGfx(messageList){
    whiteboard.container = dom.byId('whiteboardContainer');
    whiteboard.overlayContainer = dom.byId('whiteboardOverlayContainer');

    whiteboard.drawing = gfx.createSurface(whiteboard.container, whiteboard.width, whiteboard.height);
    whiteboard.overlayDrawing = gfx.createSurface(whiteboard.overlayContainer, whiteboard.width, whiteboard.height);

    //for playback
    whiteboard.movieContainer = dom.byId('movieWhiteboardContainer');
    whiteboard.movieDrawing = gfx.createSurface(whiteboard.movieContainer, whiteboard.width, whiteboard.height);

    //draw any saved objects
    _.forEach(messageList, function(m){
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
    var c = domGeom.getMarginBox(whiteboard.container);
    console.dir(c);
    domStyle.set(whiteboard.overlayContainer,'top', (c.t + 'px'));
    domStyle.set(whiteboard.overlayContainer,'left', (c.l + 'px'));

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

});