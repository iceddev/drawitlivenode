define([
  '../wb/whiteboard',
  'dojo/dom-style',
  'dojo/_base/declare',
  'dijit/popup',
  'dijit/TooltipDialog',
  'dijit/form/Button',
  'dojox/widget/ColorPicker'
], function(whiteboard, domStyle, declare, popup, TooltipDialog, Button, ColorPicker){

  /* jshint strict: false */

  return declare(TooltipDialog, {
    title: 'Color Palette',
    postCreate: function(){
      var self = this;

      var colorPicker = new ColorPicker({
        value: '#000000'
      });
      this.addChild(colorPicker);

      domStyle.set(self.colorDisplay, 'background-color', colorPicker.value);

      var okBtn = new Button({
        label: 'OK'
      });
      okBtn.on('click', function(){
        whiteboard[self.type + 'Color'] = colorPicker.value;
        domStyle.set(self.colorDisplay, 'background-color', colorPicker.value);
        popup.close(self);
      });
      this.addChild(okBtn);

      var cancelBtn = new Button({
        label: 'Cancel'
      });
      cancelBtn.on('click', function(){
        colorPicker.value = whiteboard[self.type + 'Color'];
        domStyle.set(self.colorDisplay, 'background-color', colorPicker.value);
        popup.close(self);
      });
      this.addChild(cancelBtn);

      this.inherited(arguments);
    }
  });

});