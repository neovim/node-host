'use strict'

let beautify = require('cssbeautify')

plugin.commandSync('BeautifyCSS', ( nvim, cb ) => {
    nvim.getCurrentBuffer( ( err, buf ) => {
        buf.getLineSlice( 0, -1, true, true, ( err, lines ) => {
            let beautified = beautify( lines.join('\n') )
            buf.setLineSlice( 0, -1, true, true, beautified.split('\n'), cb )
        })
    })
})
