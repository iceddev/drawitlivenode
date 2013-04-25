define([
  './wsrpc',
  './onOpened',
  './onMessage',
  './populateUserList',
  'dojo/dom',
  'dijit/registry'
], function(wsrpc, onOpened, onMessage, populateUserList, dom, registry){

  'use strict';

  var wbId;

  return function submitUserName(){
    /* jshint eqnull: true */
    var unm = dom.byId('subitUserNameMessage');
    var unt = registry.byId('userNameText');
    var unb = registry.byId('userNameBtn');
    if(wbId == null){
      wbId = registry.byId('wbIdText').getValue();
    }
    if(!unt.isValid()){
      unm.innerHTML = 'Invalid user name';
    } else {
      unb.setAttribute('disabled', true);
      unt.setAttribute('disabled', true);
      unm.innerHTML = 'sending...';

      window.userName = _.escape(unt.getValue());
      wsrpc.methods.getWhiteBoard(wbId, userName).then(function(result){
        // messageList = result.messages;
        wsrpc.socket.on('message', onMessage);
        wsrpc.socket.on('users', populateUserList);
        onOpened(result.messages);
      });
    }
  };

});