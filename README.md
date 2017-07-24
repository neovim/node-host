# Breaking Changes Incoming
We will be introducing breaking changes in the near future. See the [new node-host](https://github.com/neovim/node-host/tree/next) and [new node-client](https://github.com/neovim/node-client/tree/next) for more information about the changes

# node-host
## Installation

**Prerequisites:** You must have the `node` executable (currently only 7.x is supported) on your PATH and a copy of `npm`

1. Install this plugin using `vim-plug` or your favorite plugin manager
2. Install `neovim` package globally: `npm install -g neovim@next`

### Example config (vim-plug)
```vim
call plug#begin()
  Plug 'neovim/node-host', { 'branch': 'next', 'do': 'npm install -g neovim@next' }
call plug#end()
```

## Usage
To use a Node plugin, place the appropriate file or folder in `rplugin/node` in a `runtimepath` directory (e.g. `~/.nvim/rplugin/node`), run `npm install` if necessary, and then execute a `:UpdateRemotePlugins`.

You *must* restart neovim after a `:UpdateRemotePlugins` before you can use your new plugin.

## Writing plugins
A plugin can either be a file or folder in the `rplugin/node` directory. If the plugin is a folder, the `main` script from `package.json` will be loaded.

Please see the [neovim repository](https://github.com/billyvg/node-client) for documentation on how to write a plugin (API is currently a WIP)
