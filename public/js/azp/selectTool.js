define([
  './tools',
  './wb/whiteboard',
  'dijit/registry'
], function(tools, whiteboard, registry){

  'use strict';

  function hide(id){
    var tool = registry.byId(id);
    if(tool){
      tool.domNode.style.display = 'none';
    }
  }

  function show(id){
    var tool = registry.byId(id);
    if(tool){
      tool.domNode.style.display = '';
    }
  }

  return function selectTool(toolName){
    hide("lineColorDisplay");
    hide("fillColorDisplay");
    hide("lineStrokeSelect");
    hide("fontSizeSelect");

    var tool = null;
    dojo.forEach(tools,function(aTool){
      if(aTool.name == toolName){
        tool = aTool;
      }
      dojo.removeClass(dijit.registry.byId(aTool.name + 'ToolBtn').domNode, "selected");
    });

    if(!tool){
      return;
    }

    if(tool.name){
      dojo.addClass(dijit.registry.byId(tool.name + 'ToolBtn').domNode, "selected");
      whiteboard.tool = tool.name;
    }

    if(tool.showLineColor){
      show("lineColorDisplay");
    }
    if(tool.showFillColor){
      show("fillColorDisplay");
    }
    if(tool.showLineThickness){
      show("lineStrokeSelect");
    }
    if(tool.showFontSize){
      show("fontSizeSelect");
    }
  };

});