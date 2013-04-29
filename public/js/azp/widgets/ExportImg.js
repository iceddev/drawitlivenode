define([
  '../exportImage',
  './ExportTooltip',
  'dojo/dom-style',
  'dojo/query',
  'dojo/_base/declare',
  'dijit/form/Button'
], function(exportImage, ExportTooltip, domStyle, query, declare, Button){

  /* jshint strict: false */

  return declare(Button, {
    postCreate: function(){
      this.set('showLabel', false);

      this.set('tooltip', new ExportTooltip({
        connectId: this.id,
        label: this.label
      }));

      if(Modernizr.canvas){
        this.on('click', function(){
          var canvas = query('canvas', 'applicationArea')[0];
          exportImage(canvas);
        });
      } else {
        domStyle.set(this.domNode, 'display', 'none');
      }

      this.inherited(arguments);
    }
  });

});