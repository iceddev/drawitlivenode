define([
  '../onClearDrawing',
  '../onClearDrawingCancel',
  'dojo/_base/declare',
  'dijit/TooltipDialog',
  'dijit/form/Button'
], function(onClearDrawing, onClearDrawingCancel, declare, TooltipDialog, Button){

  /* jshint strict: false */

  return declare(TooltipDialog, {
    title: 'Clear Drawing?',
    postCreate: function(){
      var self = this;

      var okBtn = new Button({
        label: 'Yes'
      });
      okBtn.on('click', onClearDrawing);
      this.addChild(okBtn);

      var cancelBtn = new Button({
        label: 'No'
      });
      cancelBtn.on('click', onClearDrawingCancel);
      this.addChild(cancelBtn);

      this.inherited(arguments);
    }
  });

});