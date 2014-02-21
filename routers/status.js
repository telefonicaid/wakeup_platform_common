/**
 * Wake Up Platform
 * (c) Telefonica Digital, 2014 - All rights reserved
 * License: GNU Affero V3 (see LICENSE file)
 * Fernando Rodríguez Sela <frsela at tid dot es>
 * Guillermo López Leal <gll at tid dot es>
 */

'use strict';

var log = require('../shared_libs/logger'),
    querystring = require('querystring');

module.exports.info = {
    name: 'statusRouter',
    type: 'router',
    virtualpath: 'status',
    description: 'Used to check server status. Needed by load-balancers',
    // Accessible without client-side certificate
    unsafe: true
};

var serverStatus = {
    available: true
};

module.exports.entrypoint = function routerStatus(parsedURL, body, req, res) {
    switch (req.method) {
        case 'GET':
            if (serverStatus.available === true) {
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
            var statusData = querystring.parse(body);
            if (!statusData.enable) {
                log.debug('WU_Router_exports --> No required data provided');
                res.statusCode = 400;
                res.write('Bad parameters. No required data provided' +
                  JSON.stringify(statusData));
                return;
            }
            serverStatus.available = (statusData.enable === 'true');
            res.setHeader('Content-Type', 'text/plain');
            res.statusCode = 200;
            break;
        case 'OPTIONS':
            // CORS support
            log.debug('WU_Router_exports --> Received an OPTIONS method');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
            res.statusCode = 200;
            break;
        default:
            res.setHeader('Content-Type', 'text/plain');
            res.statusCode = 405;
            res.write('Bad method. Only GET and POST is allowed');
            log.debug('WU_Router_exports --> Bad method - ' +
                req.method);
    }
};
