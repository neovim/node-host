var assert = require('chai').assert,
    path = require('path'),
    Plugin = require('../lib/plugin'),
    PLUGIN_PATH = path.join( __dirname, 'rplugin', 'node', 'test.js' )

describe('Plugin', function() {
    var plugin

    beforeEach( function() {
        plugin = new Plugin( PLUGIN_PATH ).load()
    })

    it('should collect the specs from a plugin file', function() {
        var exSPECted = [
                { type: 'command', name: 'JSHostTestCmd', sync: true,
                    opts: { range: '', nargs: '*' } },
                { type: 'autocmd', name: 'BufEnter', sync: true,
                    opts: { pattern: '*.js', eval: 'expand("<afile>")' } },
                { type: 'function', name: 'Func', sync: false, opts: {} }
            ]
        assert.deepEqual( plugin.specs, exSPECted )
    })

    it('should collect the handlers from a plugin', function() {
        var handlerId = [ PLUGIN_PATH, 'function', 'Func' ].join(':')
        assert.strictEqual( plugin.handlers[ handlerId ]( null, 'town' ), 'Funcy town' )
    })

    it('should load the plugin a sandbox', function() {
        var sandbox = plugin.sandbox
        assert.isTrue( sandbox.loaded, 'Plugin was not loaded' )
        assert.isUndefined( global.loaded, 'Plugin polluted host global scope' )
        assert.notInclude( Object.keys( sandbox.process ), [ 'chdir', 'exit' ],
                           'Plugin should not have dangerous `process` functions')
    })

    it('should load files required by the plugin in a sandbox', function() {
        var required = plugin.sandbox.required
        assert.strictEqual( required.loaded, 'you bet!',
                            'require() from within a plugin failed' )
        assert.notInclude( Object.keys( required.globals.process ), [ 'chdir', 'exit' ],
                           'Plugin should not have dangerous `process` functions')
    })

    it('should cache loaded plugins', function() {
        var samePlugin = new Plugin( PLUGIN_PATH ).load()
        assert.strictEqual( plugin, samePlugin )
    })
})
