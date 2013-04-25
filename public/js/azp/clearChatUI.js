define([
  'dojo/dom',
  'dijit/registry'
], function(dom, registry){

  'use strict';

  return function clearChatUI(){
    try{
      registry.byId('chatText').set('disabled', false);
      registry.byId('chatText').set('value', '');
      registry.byId('chatBtn').set('disabled', false);
      dom.byId('chatWaitMessage').innerHTML = '';
    }catch(e){}
  };

});