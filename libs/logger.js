/**
 * Wake Up Platform
 * (c) Telefonica Digital, 2014 - All rights reserved
 * License: GNU Affero V3 (see LICENSE file)
 * Fernando Rodríguez Sela <frsela at tid dot es>
 * Guillermo López Leal <gll at tid dot es>
 */

'use strict';

/**
 * Log levels:
 *
 * # NONE: Log disabled
 * # DEBUG: Very detailed information about all the things the server is doing
 * # INFO: General information about the things the server is doing
 * # ERROR: Error detected, but the server can continue working
 * # ALERT: Error detected but not directly on this process, so this is a
 *          notification that should be investigated
 * # NOTIFY: General notifications, ie. New connections
 * # CRITICAL: When a CRITICAL trace is sent the process will be STOPPED
 */

function logger() {
    var ANSIColors = {
        // ANSI Colors (for the console output)
        red: '\u001b[0;31m',
        RED: '\u001b[1;31m',
        green: '\u001b[0;32m',
        GREEN: '\u001b[1;32m',
        yellow: '\u001b[0;33m',
        YELLOW: '\u001b[1;33m',
        blue: '\u001b[0;34m',
        BLUE: '\u001b[1;34m',
        purple: '\u001b[0;35m',
        PURPLE: '\u001b[1;35m',
        cyan: '\u001b[0;36m',
        CYAN: '\u001b[1;36m',
        reset: '\u001b[0m',
    };
    var loglevel = {
        // Log levels bitwise
        NONE: 0,
        CRITICAL: 1,
        DEBUG: 2,
        INFO: 4,
        ERROR: 8,
        NOTIFY: 16,
        ALERT: 32,
        ALARM: 64
    };
    var params = {
        LOGLEVEL: loglevel.DEBUG | loglevel.INFO | loglevel.ERROR |
                  loglevel.CRITICAL | loglevel.ALERT | loglevel.NOTIFY |
                  loglevel.ALARM,
        APPNAME: 'Unknown'
    };

    function log(level, message, trace, color, object) {
        // Check if using standarized logtraces or not
        if (typeof(message) === 'object') {
            message = 'ID: 0x' + message.id.toString(16) + ' - ' + message.m;
            if (object) {
                Object.keys(object).forEach(function(k) {
                    if (typeof(object[k]) === 'object') {
                        message = message.replace('::' + k, JSON.stringify(object[k]));
                    } else {
                        message = message.replace('::' + k, object[k]);
                    }
                });
                object = null;
            }
        }

        // Print trace

        var logheader = '[' +
            (new Date().toISOString().replace('T',' ').replace('Z','')) +
            '] [' + level + '] ' + params.APPNAME + ' - ';
        var logmsg = color + logheader + ANSIColors.reset + message
        if (object) {
            logmsg += ' ' + ANSIColors.PURPLE + JSON.stringify(object);
        }

        process.stdout.write(logmsg + ANSIColors.reset + '\n');
        if (trace) {
            console.trace('logger::log --> Callstack:');
        }
    }

    function _debug(message, object) {
        if (params.LOGLEVEL & loglevel.DEBUG) {
            log('DEBUG', message, false, ANSIColors.cyan, object);
        }
    }
    function _critical(message, object) {
        if (params.LOGLEVEL & loglevel.CRITICAL) {
            log('CRITICAL', message, true, ANSIColors.RED, object);
        }
        log('CRITICAL', 'WE HAVE A CRITICAL ERROR, WE ARE CLOSING!!!', false, ANSIColors.red);
        setTimeout(function() {
            process.exit(1);
        }, 2000);
    }
    function _info(message, object) {
        if (params.LOGLEVEL & loglevel.INFO) {
            log('INFO', message, false, ANSIColors.green, object);
        }
    }
    function _error(message, object) {
        if (params.LOGLEVEL & loglevel.ERROR) {
            log('ERROR', message, true, ANSIColors.red, object);
        }
    }
    function _alert(message, object) {
        if (params.LOGLEVEL & loglevel.ALERT) {
            log('ALERT', message, false, ANSIColors.purple, object);
        }
    }
    function _notify(message, object) {
        if (params.LOGLEVEL & loglevel.NOTIFY) {
            log('NOTIFY', message, false, ANSIColors.yellow, object);
        }
    }
    function _alarm(message, object) {
        if (params.LOGLEVEL & loglevel.ALARM) {
            log('ALARM', message, true, ANSIColors.RED, object);
        }
    }

    // Redefine standard console.log routines
    console.log = function(msg) {
        _debug(msg);
    };
    console.error = function(msg) {
        _error(msg);
    };
    console.info = function(msg) {
        _info(msg);
    };
    console.warn =function(msg) {
        _alert(msg);
    };

    return {
        loglevels: loglevel,
        getParams: function() {
            return params;
        },
        setParams: function(_params) {
            params = _params;
        },

        /**
         * Commodity methods per log level
         */
        critical: function(message, object) {
            _critical(message, object);
        },

        debug: function(message, object) {
            _debug(message, object);
        },

        info: function(message, object) {
            _info(message, object);
        },

        error: function(message, object) {
            _error(message, object);
        },

        alert: function(message, object) {
            _alert(message, object);
        },

        notify: function(message, object) {
            _notify(message, object);
        },

        alarm: function(message, object) {
            _alarm(message, object);
        }

    };
};
module.exports = logger();
