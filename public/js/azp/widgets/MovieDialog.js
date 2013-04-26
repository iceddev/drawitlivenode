define([
  'dojo/_base/declare',
  'dijit/Dialog',
  'dojo/text!./templates/movieDialog.jst'
], function(declare, Dialog, tmpl){

  /* jshint strict: false */

  return declare(Dialog, {
    title: 'Move slider to see drawing steps.',
    postCreate: function(){
      this.set('content', tmpl);

      this.inherited(arguments);
    }
  });

});