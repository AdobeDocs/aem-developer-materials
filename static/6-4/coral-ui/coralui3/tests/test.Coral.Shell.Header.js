describe('Coral.Shell.Header', function() {
  'use strict';

  it('should be defined in the Coral.Shell namespace', function() {
    expect(Coral.Shell).to.have.property('Header');
  });

  it('should support creation from markup', function(done) {
    helpers.build('<coral-shell-header>', function(el) {
      expect(el instanceof Coral.Shell.Header).to.equal(true);
      done();
    });
  });

  it('should have inline z-index when open and remove it after closed', function(done){
    helpers.build(window.__html__['Coral.Shell.Header.zIndex.html'], function(el) {
      // show menu
      el.querySelector('#menu_help').open = true;
      helpers.next(function() {
        var header = el.querySelector('coral-shell-header');
        expect(helpers.zIndex(header)).not.to.equal(-1);

        // hide menu
        el.querySelector('#menu_help').open = false;
        setTimeout(function() {
          expect(helpers.zIndex(header)).to.equal(-1);
          done();
        }, 800);
      });
    });
  });

});
