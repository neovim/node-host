loaded = [] instanceof Array
globals = global
required = require('fixture')
console.log('ahh, silence')

plugin.commandSync('JSHostTestCmd', {
    range: '',
    nargs: '*',
}, function( nvim, args, range ) {
    if ( args[0] === 'can haz response?') {
        throw new Error('no >:(')
    }
    return [args, range]
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
