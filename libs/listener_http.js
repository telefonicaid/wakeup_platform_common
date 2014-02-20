/* jshint node: true */
/**
 * Wake Up Platform
 * (c) Telefonica Digital, 2014 - All rights reserved
 * License: GNU Affero V3 (see LICENSE file)
 * Fernando Rodríguez Sela <frsela at tid dot es>
 * Guillermo López Leal <gll at tid dot es>
 */

var config = process.configuration,
    log = require('./logger'),
    helpers = require('./helpers'),
    url = require('url');

function ListenerHttp(ip, port, ssl, routers, callback) {
  if (typeof(callback) != 'function') {
    callback = function() {
      log.fatal('WU_ListenerHTTP: No wakeup callback method defined !');
    };
  }
  this.routers = routers;
  this.ip = ip;
  this.port = port;
  this.ssl = ssl;
  this.cb = callback;
}

ListenerHttp.prototype = {
  init: function() {
    log.info('Starting WakeUp ListenerHttp');

    // Create a new HTTP(S) ListenerHttp
    if (this.ssl) {
      var options = {
        ca: helpers.getCaChannel(),
        key: fs.readFileSync(config.ssl.key),
        cert: fs.readFileSync(config.ssl.cert)
      };
      this.server = require('https').createServer(options,
        this.onHTTPMessage.bind(this));
    } else {
      this.server = require('http').createServer(this.onHTTPMessage.bind(this));
    }
    this.server.listen(this.port, this.ip);
    log.info('WU_ListenerHTTP::init --> HTTP' + (this.ssl ? 'S' : '') +
             ' WakeUp ListenerHttp starting on ' + this.ip + ':' + this.port);
  },

  stop: function() {
    this.server.close(function() {
      log.info('WU_ListenerHTTP::stop --> WU_ListenerHTTP closed correctly');
    });
  },

  //////////////////////////////////////////////
  // HTTP callbacks
  //////////////////////////////////////////////
  onHTTPMessage: function(request, response) {
    log.debug('onHTTPMessage: Received Headers: ', request.headers);

    // Set id for tracking purposes
    var xTrackingID = request.headers['x-tracking-id'];
    if (!xTrackingID) {
      xTrackingID = helpers.uuid();
      request.headers['x-tracking-id'] = xTrackingID;
    }
    
    // Set tracking header
    response.setHeader('x-tracking-id', xTrackingID);

    var _url = url.parse(request.url);
    var router = this.routers[_url.pathname];
    if (!router || !router.func) {
        response.setHeader('Content-Type', 'text/plain');
        response.statusCode = 404;
        response.write('Not found');
        log.warn('Bad query ' + request.url + ', router not found');
        response.end();
        return;
    }
    if ((request.headers['x-client-cert-verified'] !== 'SUCCESS') &&
        (router.unsafe !== true)) {
      log.error('Received certificate not accepted by SSL terminator !');
      response.setHeader('Content-Type', 'text/plain');
      response.statusCode = 400;
      response.write('Client certificate not accepted');
      response.end();
      return;
    } else {
      request.headers['x-client-cert-verified'] =
            request.headers['x-client-cert-verified'] || 'SUCCESS';
      request.headers['x-client-cert-dn'] =
            request.headers['x-client-cert-dn'] || 'CN=unsafe_request';
    }

    log.debug('New message to ' + request.url + ' from ' +
      request.headers['x-client-cert-dn']);

    var body = '',
        self = this;
    request.on('data', function(data) {
        body += data;
    });
    request.on('end', function() {
        router.func(_url, body, request, response, self.cb);
        response.end();
    });
  }
};

// Exports
exports.ListenerHttp = ListenerHttp;
