define([
  'dojo/dom',
  'dojo/query',
  'dijit/registry'
], function(dom, query, registry){

  'use strict';

  return function exportImage(){
    try{
      dom.byId("exportedImg").src = query('canvas', 'applicationArea')[0].toDataURL();
      registry.byId("imgDialog").show();
    }catch(e){
      console.info("canvas not supported",e);
    }
  };

});