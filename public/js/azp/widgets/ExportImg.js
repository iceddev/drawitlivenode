define([
  '../exportImage',
  './ExportTooltip',
  'dojo/dom-style',
  'dojo/_base/declare',
  'dijit/form/Button'
], function(exportImage, ExportTooltip, domStyle, declare, Button){

  /* jshint strict: false */

  return declare(Button, {
    postCreate: function(){
      this.set('showLabel', false);

      this.set('tooltip', new ExportTooltip({
        connectId: this.id,
        label: this.label
      }));

      if(Modernizr.canvas){
        this.on('click', exportImage);
        // registry.byId('exportMovieImgBtn').on('click', exportMovieImage);
      } else {
        domStyle.set(this.domNode, 'display', 'none');
        // domStyle(registry.byId('exportMovieImgBtn').domNode, {'visibility': 'hidden', 'display': 'none'});
      }

      this.inherited(arguments);
    }
  });

});