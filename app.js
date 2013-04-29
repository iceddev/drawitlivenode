var loadModule = "server";

dojoConfig = {
  baseUrl: __dirname,
  async: 1,
  hasCache: {
    "host-node": 1,
    "dom": 0
  },
  paths: {
    'lodash': 'public/js/lodash',
    // 'put': 'put-selector/put'
  },
  packages: [{
    name: "dojo",
    location: "public/js/dojo"
  },{
    name: "app",
    location: "public/js/app"
  },{
    name: "wsrpc",
    location: "public/js/wsrpc"
  },{
    name: "server",
    location: "server"
  }],
  deps: [ loadModule ]
};

require("./public/js/dojo/dojo.js");