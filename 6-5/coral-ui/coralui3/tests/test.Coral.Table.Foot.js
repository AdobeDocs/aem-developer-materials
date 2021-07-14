describe('Coral.Table.Foot', function() {
  'use strict';

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral.Table).to.have.property('Foot');
    });
  });

  describe('attributes', function() {
    describe('#divider', function() {
      it('should apply row divider', function() {
        var foot = new Coral.Table.Foot();
        foot.divider = Coral.Table.divider.ROW;
        helpers.next(function() {
          expect(foot.classList.contains('coral-Table-divider--row')).to.be.true;
          expect(foot.classList.contains('coral-Table-divider--column')).to.be.false;
          expect(foot.classList.contains('coral-Table-divider--cell')).to.be.false;
        });
      });

      it('should apply column divider', function() {
        var foot = new Coral.Table.Foot();
        foot.divider = Coral.Table.divider.COLUMN;
        helpers.next(function() {
          expect(foot.classList.contains('coral-Table-divider--column')).to.be.true;
          expect(foot.classList.contains('coral-Table-divider--row')).to.be.false;
          expect(foot.classList.contains('coral-Table-divider--cell')).to.be.false;
        });
      });

      it('should apply cell divider', function() {
        var foot = new Coral.Table.Foot();
        foot.divider = Coral.Table.divider.CELL;
        helpers.next(function() {
          expect(foot.classList.contains('coral-Table-divider--cell')).to.be.true;
          expect(foot.classList.contains('coral-Table-divider--column')).to.be.false;
          expect(foot.classList.contains('coral-Table-divider--row')).to.be.false;
        });
      });
    });
  });

  describe('a11y', function() {
    it('should set a11y attribute', function() {
      var row = new Coral.Table.Foot();
      expect(row.getAttribute('role')).to.equal('rowgroup');
    });
  });
});
