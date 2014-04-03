/**
 * Wake Up Platform
 * (c) Telefonica Digital, 2014 - All rights reserved
 * License: GNU Affero V3 (see LICENSE file)
 * Fernando Rodríguez Sela <frsela at tid dot es>
 * Guillermo López Leal <gll at tid dot es>
 */

'use strict';

var log = require('./logger'),
    fs = require('fs');

module.exports = (function PluginsLoader() {
    var plugins = {};

    function load(relativePath) {
        var path = process.cwd() + '/' + relativePath + '/';

        log.debug('WU_PluginsLoader: Loading plugins located on ' + path);
        var pluginsModules = fs.readdirSync(path);
        for (var i = 0; i < pluginsModules.length; i++) {
            var filename = pluginsModules[i];
            if (filename.substr(-2) === 'js') {
                try {
                    var plugin = require(path + filename);
                    if (plugin.info && plugin.info.name && plugin.info.type &&
                        plugin.entrypoint && typeof(plugin.entrypoint) === 'function') {

                        if (!plugins[plugin.info.type]) {
                            plugins[plugin.info.type] = {};
                        }
                        plugins[plugin.info.type][plugin.info.name] = {
                            info: plugin.info,
                            entrypoint: plugin.entrypoint
                        };

                        log.debug('WU_PluginsLoader::load - Loaded plugin ' +
                            filename + ' - ' + plugin.info.name +
                            ' (' + plugin.info.type + ')');
                        if (plugin.info.description) {
                            log.debug('WU_PluginsLoader::load - INFO: /' +
                                plugin.info.name + ' = ' + plugin.info.description);
                        }
                    } else {
                        log.error('WU_PluginsLoader::load - Plugin bad defined');
                    }
                } catch (e) {
                    log.error('WU_PluginsLoader::load - Not valid plugin ' +
                        filename);
                }
            }
        }
    }

    return {
        load: function loadPlugins(relativePath) {
            load(relativePath);
        },

        getByType: function getPluginsByType(type) {
            return plugins[type];
        },

        // Recover HTTP routers
        getRouters: function getRouters() {
            this.routers = {};
            var pluginsRouters = this.getByType('router');

            var self = this;
            Object.keys(pluginsRouters).forEach(function(routerId) {
                if (pluginsRouters[routerId].info.virtualpath) {
                    self.routers['/' + pluginsRouters[routerId].info.virtualpath] = {
                        func: pluginsRouters[routerId].entrypoint,
                        unsafe: pluginsRouters[routerId].info.unsafe
                    };

                    log.debug('WU_PluginsLoader::getRouters - Loaded router ' +
                        pluginsRouters[routerId].info.name + ' - on virtualpath: /' +
                        pluginsRouters[routerId].info.virtualpath + ' and it is ' +
                        (pluginsRouters[routerId].info.unsafe ? 'unsafe' : 'safe'));

                    if (pluginsRouters[routerId].info.description) {
                        log.debug('WU_PluginsLoader::getRouters - INFO: /' +
                            pluginsRouters[routerId].info.virtualpath + ' = ' +
                            pluginsRouters[routerId].info.description);
                    }

                    if (Array.isArray(pluginsRouters[routerId].info.alias)) {
                        log.debug('WU_PluginsLoader::getRouters - Loading aliases ...');
                        pluginsRouters[routerId].info.alias.forEach(function(alias) {
                            log.debug('WU_PluginsLoader::getRouters - Alias /' + alias +
                                ' = /' + pluginsRouters[routerId].info.virtualpath);
                            self.routers['/' + alias] = {
                                func: pluginsRouters[routerId].entrypoint,
                                unsafe: pluginsRouters[routerId].info.unsafe
                            };
                        });
                    }
                }
            });

            return this.routers;
        },

        // Recover Sandmans (WakeUp plugins)
        getSandmans: function getSandmans() {
            this.sandmans = {};
            var pluginsSandmans = this.getByType('sandman');

            var self = this;
            Object.keys(pluginsSandmans).forEach(function(sandmanId) {
                if (pluginsSandmans[sandmanId].info.protocol) {
                    self.sandmans[pluginsSandmans[sandmanId].info.protocol] =
                        pluginsSandmans[sandmanId].entrypoint;

                    log.debug('WU_PluginsLoader::getSandmans - Loaded sandman ' +
                        pluginsSandmans[sandmanId].info.name + ' for protocol: ' +
                        pluginsSandmans[sandmanId].info.protocol);

                    if (pluginsSandmans[sandmanId].info.description) {
                        log.debug('WU_PluginsLoader::getSandmans - INFO: /' +
                            pluginsSandmans[sandmanId].info.protocol + ' = ' +
                            pluginsSandmans[sandmanId].info.description);
                    }
                }
            });

            return this.sandmans;
        }
    };
})();
