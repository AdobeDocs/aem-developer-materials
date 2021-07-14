describe('Coral.ActionBar.Container', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral.ActionBar).to.have.property('Container');
    });
  });

  describe('Implementation Details', function() {
    it('should warn that coral-actionbar-container is deprecated', sinon.test(function() {
      var consoleSpy = this.spy(console, 'warn');

      new Coral.ActionBar.Container();

      expect(consoleSpy.calledOnce).to.equal(true, 'it should warn that the container is deprecated');
    }));
  });
});
