describe('Coral.Table.Cell', function() {
  'use strict';

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral.Table).to.have.property('Cell');
      expect(Coral.Table).to.have.property('HeaderCell');
    });
  });

  describe('attributes', function() {
    describe('#selected', function() {
      it('should select the cell', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.cell.html'], function() {
          var eventSpy = sinon.spy();
          var row = table.items.first();
          var cell = row.items.first();
          table.on('coral-table:rowchange', eventSpy);
          cell.click();
          helpers.next(function() {
            expect(cell.selected).to.be.true;
            expect(cell.classList.contains('is-selected')).to.be.true;
            expect(cell.getAttribute('aria-selected')).to.equal('true');
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal([]);
            expect(eventSpy.args[0][0].detail.selection).to.deep.equal(row.selectedItems);
            expect(eventSpy.args[0][0].detail.row).to.equal(row);
            done();
          });
        });
      });

      it('should pass selection and oldSelection', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.cell.html'], function() {
          var eventSpy = sinon.spy();
          var row = table.items.first();
          row.multiple = true;
          var cells = row._elements.cells;
          cells[0].selected = true;
          cells[1].selected = true;
          var selection = row.selectedItems;
          table.on('coral-table:rowchange', eventSpy);
          cells[2].selected = true;
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal(selection);
            expect(eventSpy.args[0][0].detail.selection).to.deep.equal(row.selectedItems);
            expect(eventSpy.args[0][0].detail.row).to.equal(row);
            done();
          });
        });
      });

      it('should trigger a change event when adding a selected item', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.cell.html'], function() {
          var eventSpy = sinon.spy();
          var row = table.items.first();
          row.multiple = true;
          var cells = row._elements.cells;
          cells[0].selected = true;
          cells[1].selected = true;
          var selection = row.selectedItems;
          table.on('coral-table:rowchange', eventSpy);
          row.items.add({
            selected: true
          });
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal(selection);
            expect(eventSpy.args[0][0].detail.selection).to.deep.equal(row.selectedItems);
            expect(eventSpy.args[0][0].detail.row).to.equal(row);
            done();
          });
        });
      });

      it('should trigger a change event when removing a selected item', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.cell.html'], function() {
          var eventSpy = sinon.spy();
          var row = table.items.first();
          row.multiple = true;
          var cells = row._elements.cells;
          cells[0].selected = true;
          cells[1].selected = true;
          var selection = row.selectedItems;
          table.on('coral-table:rowchange', eventSpy);
          cells[1].remove();
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal(selection);
            expect(eventSpy.args[0][0].detail.selection).to.deep.equal(row.selectedItems);
            expect(eventSpy.args[0][0].detail.row).to.equal(row);
            done();
          });
        });
      });

      it('should trigger a change event when adding a selected item to a row', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.cell.html'], function() {
          var eventSpy = sinon.spy();
          var row = table.items.first();
          table.on('coral-table:rowchange', eventSpy);
          row.items.add({
            selected: true
          });
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal([]);
            expect(eventSpy.args[0][0].detail.selection).to.deep.equal(row.selectedItems);
            expect(eventSpy.args[0][0].detail.row).to.equal(row);
            done();
          });
        });
      });

      it('should trigger a change event when removing a row with a selected item', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.cell.html'], function() {
          var eventSpy = sinon.spy();
          var row = table.items.first();
          var cell = row.items.first();
          cell.selected = true;
          var selection = row.selectedItems;
          table.on('coral-table:rowchange', eventSpy);
          row.removeChild(cell);
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal(selection);
            expect(eventSpy.args[0][0].detail.selection).to.deep.equal(row.selectedItems);
            expect(eventSpy.args[0][0].detail.row).to.deep.equal(row);
            done();
          });
        });
      });
    });
  });
});
