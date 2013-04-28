define([
  '../wb/create-json',
  '../drawFromJson',
  '../sendMessage',
  '../wb/whiteboard',
  'dojo/_base/declare',
  'dijit/Dialog',
  'dijit/form/Button',
  'dijit/form/ValidationTextBox'
], function(createGeom, drawFromJSON, sendMessage, whiteboard, declare, Dialog, Button, ValidationTextBox){

  /* jshint strict: false */

  return declare(Dialog, {
    title: 'Type in some text.',
    postCreate: function(){

      var self = this;

      var wbText = new ValidationTextBox({});

      var doAddText = function(){
        var text = wbText.get('value');
        if((text != '') && (whiteboard.textPoint)){
          self.hide();
          var geom = createGeom.text(whiteboard.textPoint, text, whiteboard.fontSize, whiteboard.lineColor);
          drawFromJSON(geom,whiteboard.drawing);
          whiteboard.textPoint = null;
          sendMessage({geometry:geom});
        }
        whiteboard.overlayDrawing.clear();
      };
      wbText.on('keydown', function(evt) {
        if(evt.keyCode == dojo.keys.ENTER) {
          doAddText();
        }
      });

      var doIncrementalText = function(){
        whiteboard.overlayDrawing.clear();
        var text = wbText.get('value');
        if((text != '') && (whiteboard.textPoint)){
          var geom = createGeom.text(whiteboard.textPoint, text, whiteboard.fontSize, whiteboard.lineColor);
          drawFromJSON(geom, whiteboard.overlayDrawing);
        }
      };
      wbText.on('keyup', doIncrementalText);
      wbText.on('change', doIncrementalText);
      this.addChild(wbText);

      var okBtn = new Button({
        label: 'OK'
      });
      okBtn.on('click', doAddText);
      this.addChild(okBtn);

      var doCancelAddText = function(){
        wbText.setValue('');
        self.hide();
        whiteboard.overlayDrawing.clear();
        whiteboard.textPoint = null;
      };

      var cancelBtn = new Button({
        label: 'Cancel'
      });
      cancelBtn.on('click', doCancelAddText);
      this.addChild(cancelBtn);

      var close = function(evt) {
        whiteboard.overlayDrawing.clear();
        wbText.set('value', '');
      }

      this.on('open', wbText.focus);

      this.on('close', close);

      this.on('hide', close);

      this.inherited(arguments);
    }
  });

});