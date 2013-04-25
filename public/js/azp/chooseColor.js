define([
  './wb/whiteboard',
  'dojo/dom-style',
  'dijit/registry',
  'dijit/popup'
], function(whiteboard, domStyle, registry, popup){

  'use strict';

  return function chooseColor(type){
    var cp = registry.byId(type + 'ColorPaletteWidget');
    domStyle.set(type + 'Swatch', 'background-color', cp.value);
    whiteboard[type + 'Color'] = cp.value;
    popup.close(registry.byId(type + "ColorPaletteDialog"));
  };

});