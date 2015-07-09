let g:node_host_dir = expand('<sfile>:p:h:h')
call remote#host#Register('node', '*.js', function('js_host#RequireJSHost'))
