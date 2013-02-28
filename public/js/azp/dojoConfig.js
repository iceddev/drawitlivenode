var dojoConfig = {
  baseUrl: '/js',
  gfxRenderer:'canvas,svg,vml,silverlight',
  parseOnLoad: false,
  defaultDuration:1,
  packages: [{
      name: "dojo",
      location: "dojo"
    },{
      name: "dijit",
      location: "dijit"
    },{
      name: "dojox",
      location: "dojox"
    },{
      name: "wsrpc",
      location: "wsrpc"
    },{
      name: "azp",
      location: "azp"
    }],
  deps: [ 'azp' ] // And array of modules to load on "boot"
};