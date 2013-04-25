define([
  'wsrpc/client'
], function(WsRpc){

  'use strict';

  var wsrpc = new WsRpc(io.connect('/'));

  return wsrpc;

});