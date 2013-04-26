define([
  'dojo/_base/declare',
  'dijit/Dialog',
  'dojo/text!./templates/textDialog.jst'
], function(declare, Dialog, tmpl){

  /* jshint strict: false */

  return declare(Dialog, {
    title: 'Type in some text.',
    postCreate: function(){
      this.set('content', tmpl);

      this.inherited(arguments);
    }
  });

});