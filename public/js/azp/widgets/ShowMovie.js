define([
  '../showMovie',
  './ExportTooltip',
  'dojo/_base/declare',
  'dijit/form/Button'
], function(showMovie, ExportTooltip, declare, Button){

  /* jshint strict: false */

  return declare(Button, {
    postCreate: function(){
      this.set('showLabel', false);

      this.set('tooltip', new ExportTooltip({
        connectId: this.id,
        label: this.label
      }));

      this.on('click', showMovie);

      this.inherited(arguments);
    }
  });

});