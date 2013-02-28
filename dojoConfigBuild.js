var dojoConfig = {
  baseUrl: './',
  packages: [
    { name: 'dojo', location: 'public/js/dojo' },
    { name: 'dijit', location: 'public/js/dijit' },
    { name: 'dojox', location: 'public/js/dojox' },
    { name: 'wsrpc', location: 'public/js/wsrpc' },
    { name: 'azp', location: 'public/js/azp', main: 'main' }
  ],
  async: true
};