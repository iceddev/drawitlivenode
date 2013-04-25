define([
  './wsrpc',
  './clearChatUI',
  'dijit/registry'
], function(wsrpc, clearChatUI, registry){

  'use strict';

  var wbId;

  return function sendMessage(message){
    /* jshint eqnull:true */
    if(wbId == null){
      wbId = registry.byId('wbIdText').get('value');
    }
    wsrpc.methods.sendMessage(wbId, message, userName).then(function(resp){
      console.log("post response",resp);
      // if(resp.message){
      //   messageList.push(resp.message);
      // }
      clearChatUI();
    });
  };

});