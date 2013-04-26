define([
  'dojo/_base/declare',
  'dijit/Tooltip'
], function(declare, Tooltip){

  /* jshint strict: false */

  return declare(Tooltip, {
    position: ['above-centered'],
    showDelay: 0
  });

});