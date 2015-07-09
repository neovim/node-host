var assert = require('chai').assert,
    DevNull = require('../lib/devnull')

describe('DevNull', function() {
    it('should be webscale', function( done ) {
        var devnull = new DevNull()
        assert.isNull( devnull.read(), 'Read should return null' )
        assert.isTrue( devnull.write( 'benchmarks', done ), 'Write should succeed' )
    })
})
