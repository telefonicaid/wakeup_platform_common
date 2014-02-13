/* jshint node: true */
/**
 * Wake Up Platform
 * (c) Telefonica Digital, 2014 - All rights reserved
 * License: GNU Affero V3 (see LICENSE file)
 * Fernando Rodríguez Sela <frsela at tid dot es>
 * Guillermo López Leal <gll at tid dot es>
 */

var fs = require('fs');
var configFile = null;

if (process.configuration) {
  // If process.configuration is defined (Unit Testing, for example)
  // we export it, if no, we'll load a new config file
  module.exports = process.configuration;
  return;
}

if (process.env.WAKEUP_CONFIG) {
  configFile = process.env.WAKEUP_CONFIG;
}
if (process.argv.length > 2) {
  configFile = process.argv[2];
}
if (!configFile) {
  configFile = process.cwd() + '/config.default.json';
}

console.log(configFile);
process.configuration = require(configFile);

if (fs.existsSync('version.info')) {
  process.configuration._version = 'v.' +
    fs.readFileSync('version.info').toString();
} else {
  process.configuration._version = '(No version.info file !)';
}

module.exports = process.configuration;
