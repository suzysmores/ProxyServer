/* Program written by: Suzana Vukovic 

This script, starts a new proxy chain server that acts as normal HTTP/HTTPS proxy server. 
This is to see the difference between the pre-existing Squid server used and proxy-chains 
and to compare and contrast their differences with respect to throughput, HTTP2 etc.

It includes a username and password so when you load up the client, the user is immediately
asked for their credentials in order to be able to access the webpage in Mozilla (test).

*/ 

const ProxyChain = require('proxy-chain');
 
const server = new ProxyChain.Server({
    // Port where the server will listen. By default 8000.
    port: 8000,
 
    // Enables verbose logging
    verbose: true,
 
    // Custom function to authenticate proxy requests and provide the URL to chained upstream proxy.
    // It must return an object (or promise resolving to the object) with the following form:
    // { requestAuthentication: Boolean, upstreamProxyUrl: String }
    // If the function is not defined or is null, the server runs in simple mode.
    // Note that the function takes a single argument with the following properties:
    // * request      - An instance of http.IncomingMessage class with information about the client request
    //                  (which is either HTTP CONNECT for SSL protocol, or other HTTP request)
    // * username     - Username parsed from the Proxy-Authorization header. Might be empty string.
    // * password     - Password parsed from the Proxy-Authorization header. Might be empty string.
    // * hostname     - Hostname of the target server
    // * port         - Port of the target server
    // * isHttp       - If true, this is a HTTP request, otherwise it's a HTTP CONNECT tunnel for SSL
    //                  or other protocols
    // * connectionId - Unique ID of the HTTP connection. It can be used to obtain traffic statistics.
    prepareRequestFunction: ({ request, username, password, hostname, port, isHttp, connectionId }) => {
        return {
            // Require clients to authenticate with username 'bob' and password 'TopSecret'
            requestAuthentication: username !== 'bob' || password !== 'TopSecret',
 
            // If "requestAuthentication" is true, you can use the following property
            // to define a custom error message instead of the default "Proxy credentials required"
            //failMsg: 'Bad username or password, please try again.',
        };
    },
});
 
server.listen(() => {
  console.log(`Proxy server is listening on port ${server.port}`);
});
 
// Emitted when HTTP connection is closed
server.on('connectionClosed', ({ connectionId, stats }) => {
  console.log(`Connection ${connectionId} closed`);
  console.dir(stats);
});
 
// Emitted when HTTP request fails
server.on('requestFailed', ({ request, error }) => {
  console.log(`Request ${request.url} failed`);
  console.error(error);
});