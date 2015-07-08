function! js_host#RequireJSHost(host)
  let plugin_host = expand('<sfile>:p:h').'/index.js'
  let args = [plugin_host]
  try
    return rpcstart(a:host.orig_name, args)
  catch
    echomsg v:exception
  endtry
  throw 'Failed to load Node host. You can try to see what happened '.
        \ 'by starting Neovim with the environment variable '.
        \ '$NVIM_JS_DEBUG set to a file and opening '.
        \ 'the generated log file. Also, the host stderr will be available '.
        \ 'in Neovim log, so it may contain useful information. '.
        \ 'See also ~/.nvimlog.'
endfunction
