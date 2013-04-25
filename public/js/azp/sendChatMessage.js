define([
  './sendMessage',
  './printChatMessage',
  'lodash',
  'dojo/dom',
  'dijit/registry'
], function(sendMessage, printChatMessage, _, dom, registry){

  'use strict';

  var lastMessage;

  return function sendChatMessage(){
    var cwm = dom.byId('chatWaitMessage');
    var ct = registry.byId('chatText');
    var cb = registry.byId('chatBtn');
    var msg = _.escape(dojo.trim('' + ct.get('value')));
    if(msg == lastMessage){
      cwm.innerHTML = 'That\'s what you said last time.';
    }else if(msg){
      ct.setAttribute('disabled', true);
      cb.setAttribute('disabled', true);
      lastMessage = msg;
      dom.byId('chatWaitMessage').innerHTML = 'sending...';
      var chatMessage = {chatMessage:msg, fromUser: userName};
      sendMessage(chatMessage);
      printChatMessage(chatMessage);
    }else{
      cwm.innerHTML = 'Cat got your tongue?';
    }
  };

});