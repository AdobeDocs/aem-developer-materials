/* global helpers:true */
describe('Coral.Shell.SolutionSwitcher', function() {
  'use strict';

  it('should be defined in the Coral.Shell namespace', function() {
    expect(Coral.Shell).to.have.property('SolutionSwitcher');
  });

  it('should support creation from markup', function(done) {
    helpers.build('<coral-shell-solutionswitcher>', function(el) {
      expect(el).to.be.an.instanceof(Coral.Shell.SolutionSwitcher);
      done();
    });
  });
});
