define([
  './ColorPalette',
  'dojo/_base/declare',
  'dijit/form/DropDownButton'
], function(ColorPalette, declare, DropDownButton){

  /* jshint strict: false */

  return declare(DropDownButton, {
    iconClass: 'icon',
    postCreate: function(){
      var colorPalette = new ColorPalette({
        type: this.type,
        colorDisplay: this.iconNode
      });
      this.set('dropDown', colorPalette);

      this.inherited(arguments);
    }
  });

});