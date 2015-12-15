'use strict'

var DevNull = require('./devnull'),
    Module = require('module'),
    omit = require('lodash/object/omit'),
    defaults = require('lodash/object/defaults'),
    path = require('path'),
    util = require('util'),
    vm = require('vm'),
    PROC_TYPES = [ 'command', 'autocmd', 'function' ]

// inspiration drawn from Module
function Plugin( filename, opts ) {
    opts = opts || {}

    this.filename = filename // Neovim always returns absolute paths
    this.module = new Module( filename )
    this.module.paths = Module._nodeModulePaths( filename )

    this.specs = []
    this.handlers = {}
    this.stdout = opts.stdout || new DevNull()
}

Plugin._cache = {} // filename -> plugin

Plugin._addProc = function( plugin, type, sync, name, opts, cb ) {
    var cbP = typeof cb === 'function',
        handlerId

    cb = cbP ? cb : opts
    opts = cbP ? opts : {}

    handlerId = [ plugin.filename, type, name ].join(':') +
        ( opts.pattern ? ':' + opts.pattern : '' )

    plugin.specs.push({
        type: type,
        name: name,
        sync: sync,
        opts: opts
    })
    plugin.handlers[ handlerId ] = cb
}

// taken, with minor modifications, from node/lib/module.js
Plugin._compileInSandbox = function( sandbox ) {
    return function( content, filename ) {
        var self = this,
            require = function( path ) {
                return self.require(path)
            },
            dirname = path.dirname( filename ),
            wrapper = Module.wrap( content ),
            compiledWrapper,
            args

        // remove shebang
        content = content.replace(/^\#\!.*/, '')

        require.resolve = function(request) {
            return Module._resolveFilename(request, self)
        }

        Object.defineProperty(require, 'paths', { get: function() {
            throw new Error('require.paths is removed. Use ' +
                            'node_modules folders, or the NODE_PATH ' +
                            'environment variable instead.')
        } } )

        require.main = process.mainModule

        // Enable support to add extra extension types
        require.extensions = Module._extensions
        require.registerExtension = function() {
            throw new Error('require.registerExtension() removed. Use ' +
                            'require.extensions instead.')
        }

        require.cache = Module._cache

        sandbox.__filename = filename
        sandbox.__dirname = dirname

        compiledWrapper = vm.runInContext(wrapper, sandbox, { filename: filename })
        args = [self.exports, require, self, filename, dirname]
        return compiledWrapper.apply(self.exports, args)
    }
}

// Loads the plugin in a new context
Plugin.prototype.load = function() {
    var self = this,
        sandbox,
        pluginRegFns,
        k

    if ( Plugin._cache[ self.filename ] ) {
        return Plugin._cache[ self.filename ]
    }

    // generates the plugin.(command|function|autocmd)(Sync)? functions
    pluginRegFns = PROC_TYPES.reduce( function( fns, type ) {
        fns[ type ] = Plugin._addProc.bind( null, self, type, false )
        fns[ type + 'Sync' ] = Plugin._addProc.bind( null, self, type, true )
        return fns
    }, {} ),

    self.sandbox = sandbox = vm.createContext({
        plugin: pluginRegFns,
        module: self.module,
        console: {},
        debug: function() {
            var args = [].slice.call( arguments ),
                debugId = path.basename( self.filename ),
                sout = util.format.apply( null, [].concat( Date(), debugId + ':', args ) )
            self.stdout.write(sout + '\n')
        }
    })

    defaults( sandbox, global ) // XXX: figure out how to contextify globals

    for ( k in console ) {
        sandbox.console[k] = function() {}
    }

    // patch `require` in sandbox to run loaded module in sandbox context
    sandbox.require = function( path ) {
        var oldCompile = Module.prototype._compile,
            moduleExports
        Module.prototype._compile = Plugin._compileInSandbox( sandbox )
        moduleExports = sandbox.module.require( path )
        Module.prototype._compile = oldCompile
        return moduleExports
    }

    // if you need any of these, it might be worth discussing spawning separate processes
    sandbox.process = omit( global.process,
        [ 'reallyExit', 'abort', 'chdir', 'umask', 'setuid', 'setgid', 'setgroups',
          '_kill', 'EventEmitter', '_maxListeners', '_fatalException', 'exit', 'kill' ])
    sandbox.process.stdin = new DevNull()
    sandbox.process.stdout = self.stdout
    sandbox.process.stderr = self.stdout

    // careful! this might throw an error
    sandbox.require( self.filename )
    Plugin._cache[ self.filename ] = self
    return self
}

module.exports = Plugin
