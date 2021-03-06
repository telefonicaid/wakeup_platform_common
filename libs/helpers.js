/**
 * Wake Up Platform
 * (c) Telefonica Digital, 2014 - All rights reserved
 * License: GNU Affero V3 (see LICENSE file)
 * Fernando Rodríguez Sela <frsela at tid dot es>
 * Guillermo López Leal <gll at tid dot es>
 */

'use strict';

var net = require('net');

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

module.exports.isIPInNetwork = function isIPInNetwork(ip, networks) {
    if (!net.isIP(ip)) {
        return false;
    }

    if (!Array.isArray(networks)) {
        networks = [networks];
    }

    //If IP is in one of the network ranges, we think that you are in a
    //private network and can be woken up.
    return __isIPInNetworks(ip, networks);
};

function __isIPInNetworks(ip, networks) {
    var rv = false;
    networks.forEach(function(network) {
        //If is found in other network, return.
        if (rv) {
            return;
        }
        var split = network.split('/');
        var ad1 = __ipAddr2Int(ip);
        var ad2 = __ipAddr2Int(split[0]);
        var mask = 0;
        // JavaScript operates in 32 bits. Check
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators#Summary
        // and see that a Left Shift of 32 should not be used
        // "The right operand should be less than 32"
        if (split[1] !== '0') {
            mask = -1 << (32 - split[1]);
        }
        rv = (ad1 & mask) == ad2;
    });
    return rv;
}

function __ipAddr2Int(ip) {
    var split = ip.split('.');
    return split[0] << 24 | split[1] << 16 | split[2] << 8 | split[3];
}
