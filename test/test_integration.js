var assert = require('chai').assert,
    attach = require('neovim-client'),
    cp = require('child_process'),
    fs = require('fs'),
    path = require('path'),
    temp = require('temp').track()

describe('Node host', function() {
    var testdir = process.cwd(),
        nvim
    this.timeout( 7000 )

    before( function() {
        var hostdir = path.resolve( __dirname, '..' ),
            plugdir = __dirname,
            vimdir = temp.mkdirSync( 'nvim' ),
            nvimrc = path.join( vimdir, 'nvimrc' ),
            args = [ '-u', nvimrc, '-i', 'NONE', '-c', 'UpdateRemotePlugins', '-c', 'q' ]

        process.chdir( vimdir )

        fs.writeFileSync( nvimrc, 'set rtp+=' + hostdir + ',' + plugdir )
        cp.spawnSync( 'nvim', args )

        nvim = cp.spawn( 'nvim', ['-u', nvimrc, '-i', 'NONE', '-N', '--embed'], {} )
    })

    after( function() {
        process.chdir( testdir )
    })

    it('should return specs', function( _done ) {
        var dones = 0,
            done = function( err ) {
                if ( err ) { return _done( err ) }
                dones += 1
                if ( dones === 2 ) {
                    _done()
                }
            }

        attach( nvim.stdin, nvim.stdout, function( err, nvim ) {
            if ( err ) { return done( err ) }

            nvim.command( 'JSHostTestCmd', function( err ) {
                if ( err ) { return done( err ) }

                nvim.getCurrentLine( function( err, res ) {
                    if ( err ) { return done( err ) }

                    assert.strictEqual( res.toString('utf8'), 'A line, for your troubles',
                                        'commandSync should work when asked nicely' )
                    done()
                })
            })

            nvim.command( 'JSHostTestCmd canhazresponse?', function( err ) {
                assert.instanceOf( err, Error,
                                   'commandSync should error for impolite request' )
                assert.match( err.message, /no >:\(/,
                              'Error message should be as returned' )
                done()
            })
        })
    })
})
