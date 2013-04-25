define([
  'dijit/registry',
  'dijit/popup'
], function(registry, popup){

  'use strict';

  return function onClearDrawingCancel(){
    popup.close(registry.byId("clearDrawingDialog"));
  };

});