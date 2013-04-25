define([
  './animateUserItem',
  'dojo/dom'
], function(animateUserItem, dom){

  'use strict';

  return function populateUserList(userList){
    if(userList && userList.length){
      try{
        var output = '';
        _.forEach(userList, function(user){
          output += ('<span id=\"userListItem' + user + '\" style=\"background-color: #FFFFFF;\">' + user + '</span><br>');
        });
        dom.byId("userListDiv").innerHTML = output;
      }catch(e){
        console.info("error filling user list div", e);
      }
      animateUserItem(userList[userList.length - 1]);
    }
  };

});