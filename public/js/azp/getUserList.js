define([
  './wsrpc',
  './populateUserList',
  'dijit/registry'
], function(wsrpc, populateUserList, registry){

  'use strict';

  var wbId;

  return function getUserList(){
    /* jshint eqnull:true */
    if(wbId == null){
      wbId = registry.byId('wbIdText').get('value');
    }
    wsrpc.methods.getUsers(wbId).then(populateUserList);
  };

});