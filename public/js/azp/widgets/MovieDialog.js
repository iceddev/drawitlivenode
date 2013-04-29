define([
  '../wb/whiteboard',
  '../exportImage',
  './ExportTooltip',
  'lodash',
  'put',
  'dojo/_base/declare',
  'dojo/query',
  'dijit/Dialog',
  'dijit/form/Button',
  'dijit/form/HorizontalSlider'
], function(whiteboard, exportImage, ExportTooltip, _, put, declare, query, Dialog, Button, HorizontalSlider){

  /* jshint strict: false */

  // TODO: use actual message list
  var messageList = [];

  return declare(Dialog, {
    title: 'Move slider to see drawing steps.',
    postCreate: function(){
      var container = this.containerNode;
      put(container, 'div#movieWhiteboardContainer');

      var slider = new HorizontalSlider({
        value: 0,
        minimum: 0,
        maximum: 1,
        discreteValues: 2,
        intermediateChanges: true,
        showButtons: false,
        style: 'width: 700px;'
      });
      this.addChild(slider);

      var exportBtn = new Button({
        label: 'Export this snapshot of the drawing surface',
        iconClass: 'icon export-icon',
        showLabel: false,
        postCreate: function(){
          if(Modernizr.canvas){
            this.on('click', function(){
              var canvas = query('canvas', container)[0];
              exportImage(canvas);
            });
          } else {
            domStyle.set(this.domNode, 'display', 'none');
          }
        }
      });
      this.addChild(exportBtn);

      var tooltip = new ExportTooltip({
        connectId: exportBtn.id,
        label: exportBtn.label
      });
      this.addChild(tooltip);

      put(container, 'span#movieUser', {
        innerHTML: 'User:'
      });

      this.on('show', function(){
        if(messageList){
          whiteboard.geomMessageList = [];
          _.forEach(messageList, function(m){
            if(m.geometry){
              whiteboard.geomMessageList.push(m);
            }
          });
        }

        slider.set('maximum', whiteboard.geomMessageList.length);
        slider.set('discreteValues', whiteboard.geomMessageList.length);
        slider.set('value', 0);
      });

      this.inherited(arguments);
    }
  });

});