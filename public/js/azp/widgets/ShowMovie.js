define([
  './MovieDialog',
  './ExportTooltip',
  'dojo/_base/declare',
  'dijit/form/Button'
], function(MovieDialog, ExportTooltip, declare, Button){

  /* jshint strict: false */

  return declare(Button, {
    postCreate: function(){
      this.set('showLabel', false);

      this.set('tooltip', new ExportTooltip({
        connectId: this.id,
        label: this.label
      }));

      var movieDialog = new MovieDialog({});
      movieDialog.startup();

      this.on('click', function(){
        movieDialog.show();
      });

      this.inherited(arguments);
    }
  });

});