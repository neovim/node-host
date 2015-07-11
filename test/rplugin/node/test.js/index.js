loaded = [] instanceof Array
globals = global
required = require('fixture')
console.log('ahh, silence')

plugin.commandSync('JSHostTestCmd', {
    range: '',
    nargs: '*',
}, function( nvim, args, range ) {
    nvim.setCurrentLine('A line, for your troubles')
    if ( args[0] === 'canhazresponse?') {
        throw new Error('no >:(')
    }
})

plugin.autocmdSync('BufEnter', {
    pattern: '*.js',
    eval: 'expand("<afile>")'
}, function( nvim, filename ) {
    debug('This is an annoying function')
})

plugin.function('Func', function( nvim, args ) {
    return 'Funcy ' + args
})
