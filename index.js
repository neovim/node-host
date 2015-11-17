'use strict'

var attach = require('neovim-client'),
    fs = require('fs'),
    Plugin = require('./lib/plugin'),
    fmt = require('util').format,
    debug = function() {},
    debugOut

// redirect stderr and set up debug output
if ( process.env.NEOVIM_JS_DEBUG ) {
    debugOut = fs.createWriteStream( process.env.NEOVIM_JS_DEBUG, { flags: 'w' } )
    process.stderr.write = debug.write
    debug = function() {
        var args = [].slice.call( arguments ),
            sout = fmt.apply( null, [].concat( 'node-host:', args ) )
        debugOut.write(sout + '\n')
    }
}

function loadPlugin( filename ) {
    try {
        return new Plugin( filename, { stdout: debugOut } ).load()
    } catch ( err ) {
        debug( 'ERROR loading plugin "' + filename + '":', err, err.stack )
        return null
    }
}

function callHandler( nvim, method, args, isRequest ) {
    var procInfo = method.split(':'),
        filename = procInfo[0],
        type = procInfo[1],
        procName = '"' + procInfo.slice(2).join(' ') + '"',
        plugin = loadPlugin( filename ),
        reqType = isRequest ? 'request' : 'notification'

    if ( plugin === null ) {
        return new Error('Error loading plugin')
    }

    if ( typeof plugin.handlers[ method ] !== 'function' ) {
        debug('ERROR: no handler for', type,  '"' + procName + '" in', filename)
        return new Error( fmt( 'No', reqType, 'handler for', type, procName ) )
    }

    try {
        return plugin.handlers[ method ].apply( nvim, [].concat( nvim, args ) )
    } catch ( err ) {
        debug('ERROR in', reqType, 'handler for', type, procName,
              'in', filename, err.stack)
        return new Error( fmt( 'Error in', reqType, 'handler for', type,
                               procName + ':', err.message ) )
    }
}

// stdio is reversed since it's from the perspective of Neovim
attach( process.stdout, process.stdin, function( err, nvim ) {
    if ( err ) {
        debug( 'ERROR: could not connect to Neovim', err.stack )
        process.exit(1)
    }

    nvim.on( 'request', function( method, args, res ) {
        var plugin,
            ret

        if ( method === 'specs' ) {
            plugin = loadPlugin( args[0] )
            return res.send( plugin ? plugin.specs : [] )
        } else {
            ret = callHandler( nvim, method, args, true )
            ret instanceof Error ? res.send( ret.message, true ) : res.send( ret === undefined ? null : ret )
        }
    })

    nvim.on( 'notification', callHandler.bind( null, nvim ) )
})
