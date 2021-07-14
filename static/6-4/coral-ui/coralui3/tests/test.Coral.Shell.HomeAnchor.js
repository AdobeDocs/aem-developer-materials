describe('Coral.Shell.HomeAnchor', function() {
  'use strict';

  it('should be defined in the Coral.Shell namespace', function() {
    expect(Coral.Shell).to.have.property('HomeAnchor');
  });

  it('should support creation from markup', function() {
    helpers.build('<a is="coral-shell-homeanchor">', function(el) {
      expect(el instanceof Coral.Shell.HomeAnchor).to.equal(true);
    });
  });

  describe('_initialize', function() {
    it('should set correct CSS class', function() {
      var anchor = new Coral.Shell.HomeAnchor();
      expect(anchor.classList.contains('coral3-Shell-homeAnchor')).to.be.true;
    });
  });
});
