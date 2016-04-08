'use strict'

var attach = require('neovim-client'),
    fs = require('fs'),
    Plugin = require('./lib/plugin'),
    fmt = require('util').format,
    debug = function() {},
    debugOut

function loadPlugin( filename ) {
    try {
        return new Plugin( filename, { stdout: debugOut } ).load()
    } catch ( err ) {
        debug( 'ERROR loading plugin "' + filename + '":', err, err.stack )
        return null
    }
}

function callHandler( nvim, method, args, reqCb ) {
    var procInfo = method.split(':'),
        filename = procInfo[0],
        type = procInfo[1],
        procName = '"' + procInfo.slice(2).join(' ') + '"',
        plugin = loadPlugin( filename ),
        reqType = reqCb ? 'request' : 'notification',
        reqCb = setImmediate.bind( null, reqCb || function() {} )

    if ( plugin === null ) {
        reqCb( new Error('Error loading plugin') )
    }

    if ( typeof plugin.handlers[ method ] !== 'function' ) {
        debug('ERROR: no handler for', type,  '"' + procName + '" in', filename)
        reqCb( new Error( fmt( 'No', reqType, 'handler for', type, procName ) ) )
    }

    try {
        plugin.handlers[ method ].apply(  nvim, [].concat( nvim, args, reqCb ) )
    } catch ( err ) {
        debug('ERROR in', reqType, 'handler for', type, procName,
              'in', filename, err.stack)
        reqCb( new Error( fmt( 'Error in', reqType, 'handler for', type,
                               procName + ':', err.message ) ) )
    }
}

function init() {
    // stdio is reversed since it's from the perspective of Neovim
    attach( process.stdout, process.stdin, function( err, nvim ) {
        if ( err ) {
            debug( 'ERROR: could not connect to Neovim', err.stack )
            process.exit(1)
        }

        nvim.on( 'request', function( method, args, res ) {
            var plugin

            if ( method === 'specs' ) {
                plugin = loadPlugin( args[0] )
                res.send( plugin ? plugin.specs : [] )
            } else {
                debug( method, args )
                callHandler( nvim, method, args, function( err, plugRes ) {
                    err ? res.send( err.toString(), true )
                        : res.send( plugRes === undefined ? null : plugRes )
                })
            }
        })

        nvim.on( 'notification', callHandler.bind( null, nvim ) )
    })
}

// redirect stderr and set up debug output
if ( process.env.NEOVIM_JS_DEBUG ) {
    debugOut = fs.createWriteStream( process.env.NEOVIM_JS_DEBUG, { flags: 'w' } )
        .on( 'open', function() {
            debug = function() {
                var args = [].slice.call( arguments ),
                    sout = fmt.apply( null, [].concat( Date(), 'node-host:', args ) )
                debugOut.write(sout + '\n')
            }
            init()
        })
        .on( 'error', function( e ) {
            debug('node-host: Could not open NEOVIM_JS_DEBUG. ' + e)
            process.stderr.write('node-host: Could not open NEOVIM_JS_DEBUG. ' + e)
        })
} else {
    init()
}
