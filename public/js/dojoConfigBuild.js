var dojoConfig = {
  baseUrl: './js',
  gfxRenderer: 'canvas,svg,vml,silverlight',
  parseOnLoad: false,
  defaultDuration: 1,
  paths: {
    'lodash': 'lodash',
    'put': 'put-selector/put'
  },
  packages: [
    {
      name: "dojo",
      location: "dojo"
    },
    {
      name: "dijit",
      location: "dijit"
    },
    {
      name: "dojox",
      location: "dojox"
    },
    {
      name: 'put-selector',
      location: 'put-selector',
      main: 'put'
    },
    {
      name: "wsrpc",
      location: "wsrpc"
    },
    {
      name: "azp",
      location: "azp"
    },
    {
      name: "dist",
      location: "dist"
    }
  ],
  deps: [ 'azp' ],
  locale: 'en-us',
  async: true
};