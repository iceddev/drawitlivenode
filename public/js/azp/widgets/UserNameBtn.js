define([
  '../submitUserName',
  'dojo/_base/declare',
  'dijit/form/Button'
], function(submitUserName, declare, Button){

  /* jshint strict: false */

  return declare(Button, {
    postCreate: function(){
      this.on('click', submitUserName);

      this.inherited(arguments);
    }
  });

});