# node-host

## Installation

**Prerequisites:** You must have the `node` executable on your PATH and a copy of `npm`

1. Install this plugin using Vundle or your favorite plugin manager
2. Navigate to the `node-host` directory (e.g. `~/.nvim/bundle/node-host`) and run `npm install`

## Usage

To use a Node plugin, place the appropriate file or folder in `rplugin/node` in a `runtimepath` directory (e.g. `~/.nvim/rplugin/node`), run `npm install` if necessary, and then execute a `:UpdateRemotePlugins`.
Once you restart Neovim, you will be able to use your new plugins!

### Example

```javascript
var fmt = require('util').format,
    numCalls = 0

function incrementCalls() {
    if ( numCalls == 5 ) {
        throw new Error('Too many calls!')
    }
    numCalls++
}

plugin.commandSync('Cmd', {
    range: '',
    nargs: '*',
}, function( nvim, args, range ) {
    incrementCalls()
    nvim.setCurrentLine(
        fmt('Command: Called', numCalls, 'times, args:', args, 'range:', range) )
})

plugin.autocmdSync('BufEnter', {
    pattern: '*.js',
    eval: 'expand("<afile>")'
}, function( nvim, filename ) {
    incrementCalls()
    nvim.setCurrentLine( fmt('Autocmd: Called', numCalls, 'times, file:', filename) )
})

plugin.function('Func', function( nvim, args ) {
    incrementCalls()
    nvim.setCurrentLine( fmt('Function: Called', numCalls, 'times, args:', args) )
})
```

### Writing plugins

A plugin can either be a file or folder with the `*.js` extension in the `rplugin/node` directory.
If the plugin is a folder, the package "main" script will be loaded.

The following functions, available on the global `plugin` object, can be used to register plugin commands/functions/autocmds on the attached Neovim instance.

#### (command|function|autocmd)\[Sync](name, [opts], callback)

If the `Sync` variant is used, Neovim will wait for the callback to return or throw an error.
Otherwise, Neovim will continue execution immediately, ignoring any return values or errors.

`name` is the name of the plugin, `opts` is an optional hash of options, and `callback` is a function that is called whenever the command, function, or autocmd, is triggered.

Note: since `require` caches modules, to see your changes, you will need to restart the host by restarting Neovim.

#### Debugging

Also available in the global scope is the `debug` function, which can be used like `console.log` and writes to the file given by the `$NEOVIM_JS_DEBUG` environment variable.
If you suspect that errors may be occurring in or propagating up to the host, itself, further error output can be found in `.nvimlog`.

## TODO

* Auto-install Node executable if missing
* Plugin manager that allows post-install hooks for `npm install`
* Better isolation of global variables
