define([
  'dijit/registry',
  'dijit/popup'
], function(registry, popup){

  'use strict';

  return function cancelChooseColor(type){
    popup.close(registry.byId(type + "ColorPaletteDialog"));
  };

});