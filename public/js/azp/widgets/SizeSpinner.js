define([
  '../wb/whiteboard',
  'dojo/_base/declare',
  'dijit/form/NumberSpinner'
], function(whiteboard, declare, NumberSpinner){

  /* jshint strict: false */

  return declare(NumberSpinner, {
    intermediateChanges: true,
    postCreate: function(){
      var self = this;

      this.set('constraints', {
        min: 1,
        max: 100,
        places: 0
      });

      this.on('change', function(val){
        if(typeof val !== 'number'){
          return;
        }

        if(self.isValid()){
          return whiteboard[self.wbType] = val;
        }

        if(val < self.constraints.min){
          val = self.constraints.min;
        } else {
          val = self.constraints.max;
        }

        self.set('value', val);
      });

      this.inherited(arguments);
    }
  });

});