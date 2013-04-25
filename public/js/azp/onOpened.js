define([
  './initGfx',
  './getUserList',
  './sendChatMessage',
  './printChatMessage',
  'dojo/dom',
  'dijit/registry'
], function(initGfx, getUserList, sendChatMessage, printChatMessage, dom, registry){

  'use strict';

  return function onOpened(messageList) {
    dom.byId('setUserDiv').style.display = 'none';

    dom.byId('applicationArea').style.display = '';
    registry.byId('applicationArea').resize();
    initGfx(messageList);
    registry.byId('chatBtn').on('click', sendChatMessage);

    //display any saved messages
    _.forEach(messageList, function(m){
      if(m.chatMessage){
        printChatMessage(m);
      }
    });

    getUserList();
  };

});