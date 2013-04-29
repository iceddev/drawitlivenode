define([
  '../selectTool',
  './ToolTooltip',
  'lodash',
  'dojo/_base/declare',
  'dijit/form/Button'
], function(selectTool, ToolTooltip, _, declare, Button){

  /* jshint strict: false */

  return declare(Button, {
    postCreate: function(){
      this.set('showLabel', false);

      this.set('tooltip', new ToolTooltip({
        connectId: this.id,
        label: this.label
      }));

      this.on('click', _.partial(selectTool, this.id));

      this.inherited(arguments);
    }
  });

});