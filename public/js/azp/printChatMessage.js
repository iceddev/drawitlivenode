define([
  'dojo/dom'
], function(dom){

  'use strict';

  return function printChatMessage(message){
    dom.byId('output').innerHTML += '<pre class=\"chatMessage\"><span class=\"chatFrom\">' + message.fromUser + '</span>: ' + message.chatMessage + '</pre><br>';
    dom.byId('output').scrollTop = dom.byId('output').scrollHeight;
  };

});