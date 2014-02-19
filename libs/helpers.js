/* jshint node: true */
/**
 * Wake Up Platform
 * (c) Telefonica Digital, 2014 - All rights reserved
 * License: GNU Affero V3 (see LICENSE file)
 * Fernando Rodríguez Sela <frsela at tid dot es>
 * Guillermo López Leal <gll at tid dot es>
 */

'use strict';

module.exports.checkCallback = function checkCallback(callback) {
    if (typeof(callback) != 'function') {
      callback = function() {};
    }
    return callback;
};

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
}

module.exports.uuid = function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
};

module.exports.isIPInNetwork = function isIPInNetwork(ip, network) {
    var split = network.split('/');
    var ad1 = __ipAddr2Int(ip);
    var ad2 = __ipAddr2Int(split[0]);
    var mask = -1 << (32 - split[1]);

    return (ad1 & mask) == ad2;
}

function __ipAddr2Int(ip) {
    var split = ip.split('.');
    return split[0] << 24 | split[1] << 16 | split[2] << 8 | split[3];
}
