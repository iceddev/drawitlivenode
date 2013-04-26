define([
  './ToolTooltip',
  'dojo/_base/declare',
  'dijit/form/Button'
], function(ToolTooltip, declare, Button){

  /* jshint strict: false */

  return declare(Button, {
    postCreate: function(){
      this.set('showLabel', false);

      this.set('tooltip', new ToolTooltip({
        connectId: this.id,
        label: this.label
      }));

      // TODO: change names to make this work
      // this.on('click', _.partial(selectTool, tool.name));

      this.inherited(arguments);
    }
  });

});