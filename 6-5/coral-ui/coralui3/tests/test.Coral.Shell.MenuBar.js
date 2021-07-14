describe('Coral.Shell.MenuBar', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral.Shell).to.have.property('MenuBar');
    });
  });

  describe('Instantiation', function() {
    it('should support creation from markup', function(done) {
      helpers.build('<coral-shell-menubar>', function(el) {
        expect(el).to.be.an.instanceof(Coral.Shell.MenuBar);
        done();
      });
    });
  });

  describe('API', function() {
    describe('#items', function() {});
  });

  describe('Markup', function() {
    describe('#items', function() {});
  });

  describe('Events', function() {});

  describe('User Interaction', function() {});

  describe('Implementation Details', function() {});
});
