define([
  '../submitUserName',
  'dojo/keys',
  'dojo/_base/declare',
  'dijit/form/ValidationTextBox'
], function(submitUserName, keys, declare, ValidationTextBox){

  /* jshint strict: false */

  return declare(ValidationTextBox, {
    required: true,
    postCreate: function(){
      this.on('keydown', function(evt) {
        if(evt.keyCode === keys.ENTER) {
          submitUserName();
        }
      });

      this.inherited(arguments);
    }
  });

});