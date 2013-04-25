define([
  'dojo/dom',
  'dojo/query',
  'dijit/registry'
], function(dom, query, registry){

  'use strict';

  return function exportMovieImage(){
    try{
      dom.byId("exportedImg").src = query('canvas', 'movieDialog')[0].toDataURL();
      registry.byId("imgDialog").show();
    }catch(e){
      console.info("canvas not supported",e);
    }
  };

});