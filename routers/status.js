/* jshint node: true */
/**
 * Wake Up Platform
 * (c) Telefonica Digital, 2013 - All rights reserved
 * License: GNU Affero V3 (see LICENSE file)
 * Fernando Rodríguez Sela <frsela@tid.es>
 */

var log = require('../shared_libs/logger'),
    querystring = require('querystring');

module.exports.info = {
  name: 'statusRouter',
  type: 'router',
  virtualpath: 'status',
  description: 'Used to check server status. Needed by load-balancers'
};

var server_status = {
  available: true
};

module.exports.entrypoint = function router_status(parsedURL, body, req, res) {
  switch (req.method) {
  case 'GET':
    if (server_status.available === true) {
      res.setHeader('Content-Type', 'text/plain');
      res.statusCode = 200;
      res.write('OK, server available !');
    } else {
      res.setHeader('Content-Type', 'text/plain');
      res.statusCode = 503;
      res.write('ERROR, server unavailable !');
    }
    break;
  case 'POST':
    var status_data = querystring.parse(body);
    if (!status_data.enable) {
      log.debug('WU_Router_exports --> No required data provided');
      res.statusCode = 400;
      res.write('Bad parameters. No required data provided' + JSON.stringify(status_data));
      return;
    }
    server_status.available = (status_data.enable === 'true');
    res.setHeader('Content-Type', 'text/plain');
    res.statusCode = 200;
    break;
  default:
    response.setHeader('Content-Type', 'text/plain');
    response.statusCode = 405;
    response.write('Bad method. Only GET and POST is allowed');
    log.debug('WU_Router_exports --> Bad method - ' +
      req.method);
  }
};
