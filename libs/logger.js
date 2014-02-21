/**
 * Wake Up Platform
 * (c) Telefonica Digital, 2014 - All rights reserved
 * License: GNU Affero V3 (see LICENSE file)
 * Fernando Rodríguez Sela <frsela at tid dot es>
 * Guillermo López Leal <gll at tid dot es>
 */

'use strict';

var log4js = require('log4js'),
    config = process.configuration.log4js;

function getLogger() {
    config.replaceConsole = true;
    log4js.configure(config);
    return log4js.getLogger(config.appenders[0].category);
}

module.exports = getLogger();
