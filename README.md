# Update
This is no longer needed as it has been merged into neovim! https://github.com/neovim/neovim/pull/7458 🎉

Please direct node client related issues to [neovim client repository](https://github.com/neovim/node-client).

# node-host
## Installation

**Prerequisites:** You must have the `node` executable (currently only 6.x is supported) on your PATH and a copy of `npm`

1. ~~Install this plugin using `vim-plug` or your favorite plugin manager~~
2. Install `neovim` package globally: `npm install -g neovim`

### ~~Example config (vim-plug)~~
```vim
call plug#begin()
  Plug 'neovim/node-host', { 'do': 'npm install -g neovim' }
call plug#end()
```

## Usage
To use a Node plugin, place the appropriate file or folder in `rplugin/node` in a `runtimepath` directory (e.g. `~/.nvim/rplugin/node`), run `npm install` if necessary, and then execute a `:UpdateRemotePlugins`.

You *must* restart neovim after a `:UpdateRemotePlugins` before you can use your new plugin.

## Writing plugins
A plugin can either be a file or folder in the `rplugin/node` directory. If the plugin is a folder, the `main` script from `package.json` will be loaded.

Please see the [neovim client repository](https://github.com/neovim/node-client) for documentation on how to write a plugin (API is currently a WIP)
