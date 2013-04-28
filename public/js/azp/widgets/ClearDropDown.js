define([
  './ClearTooltipDialog',
  'dojo/_base/declare',
  'dijit/form/DropDownButton'
], function(ClearTooltipDialog, declare, DropDownButton){

  /* jshint strict: false */

  return declare(DropDownButton, {
    postCreate: function(){
      var clear = new ClearTooltipDialog({});
      this.set('dropDown', clear);

      this.inherited(arguments);
    }
  })

});