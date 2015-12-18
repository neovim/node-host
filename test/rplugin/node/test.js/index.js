loaded = [] instanceof Array
globals = global
required = require('fixture')
console.log('ahh, silence')

plugin.commandSync('JSHostTestCmd', {
    range: '',
    nargs: '*',
}, function( nvim, args, range, cb ) {
    nvim.setCurrentLine('A line, for your troubles')
    if ( args[0] === 'canhazresponse?') {
        cb(new Error('no >:('))
    }
    cb()
})

plugin.autocmdSync('BufEnter', {
    pattern: '*.js',
    eval: 'expand("<afile>")'
}, function( nvim, filename, cb ) {
    debug('This is an annoying function')
    cb()
})

plugin.function('Func', function( nvim, args ) {
    return 'Funcy ' + args
})
