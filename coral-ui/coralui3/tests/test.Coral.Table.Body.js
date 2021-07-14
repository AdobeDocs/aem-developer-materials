describe('Coral.Table.Body', function() {
  'use strict';

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral.Table).to.have.property('Body');
    });
  });

  describe('attributes', function() {
    describe('#selected', function() {
      it('should select the row', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
          var eventSpy = sinon.spy();
          table.on('coral-table:change', eventSpy);
          var row = table._elements.body._elements.rows[0];
          row.click();
          helpers.next(function() {
            expect(row.selected).to.be.true;
            expect(row.classList.contains('is-selected')).to.be.true;
            expect(row.getAttribute('aria-selected')).to.equal('true');
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal([]);
            expect(eventSpy.args[0][0].detail.selection).to.deep.equal(table.selectedItems);
            done();
          });
        });
      });

      it('should pass selection and oldSelection', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
          var eventSpy = sinon.spy();
          table.multiple = true;
          var rows = table._elements.body._elements.rows;
          rows[0].selected = true;
          rows[1].selected = true;
          var selection = table.selectedItems;
          table.on('coral-table:change', eventSpy);
          table._elements.body._elements.rows[2].selected = true;
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal(selection);
            expect(eventSpy.args[0][0].detail.selection).to.deep.equal(table.selectedItems);
            done();
          });
        });
      });

      it('should trigger a change event when adding a selected item', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
          var eventSpy = sinon.spy();
          table.multiple = true;
          var rows = table._elements.body._elements.rows;
          rows[0].selected = true;
          rows[1].selected = true;
          var selection = table.selectedItems;
          table.on('coral-table:change', eventSpy);
          table._elements.body.appendChild(new Coral.Table.Row().set({
            selected: true
          }));
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal(selection);
            expect(eventSpy.args[0][0].detail.selection).to.deep.equal(table.selectedItems);
            done();
          });
        });
      });

      it('should trigger a change event when removing a selected item', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
          var eventSpy = sinon.spy();
          table.multiple = true;
          var rows = table._elements.body._elements.rows;
          rows[0].selected = true;
          rows[1].selected = true;
          var selection = table.selectedItems;
          table.on('coral-table:change', eventSpy);
          rows[1].remove();
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal(selection);
            expect(eventSpy.args[0][0].detail.selection).to.deep.equal(table.selectedItems);
            done();
          });
        });
      });

      it('should trigger a change events when adding a body with a selected item', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.empty.html'], function() {
          table.selectable = true;
          var body = new Coral.Table.Body();
          body.appendChild(new Coral.Table.Row().set({selected: true}));
          helpers.next(function() {
            var eventSpy = sinon.spy();
            table.on('coral-table:change', eventSpy);
            table._elements.table.appendChild(body);
            helpers.next(function() {
              // One event for the added row and one for the added body
              expect(eventSpy.callCount).to.equal(1);
              expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal([]);
              expect(eventSpy.args[0][0].detail.selection).to.deep.equal(table.selectedItems);
              done();
            });
          });
        });
      });

      it('should trigger a change event when removing a body with a selected item', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
          var eventSpy = sinon.spy();
          table._elements.body._elements.rows[0].selected = true;
          var selection = table.selectedItems;
          table.on('coral-table:change', eventSpy);
          table._elements.body.remove();
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal(selection);
            expect(eventSpy.args[0][0].detail.selection).to.deep.equal(table.selectedItems);
            done();
          });
        });
      });

      it('should allow input without selecting the row', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.input.html'], function() {
          var row = table._elements.body._elements.rows[0];
          row.querySelector('input[type="text"]').click();
          helpers.next(function() {
            expect(row.selected).to.be.false;
            expect(row.classList.contains('is-selected')).to.be.false;
            expect(row.getAttribute('aria-selected')).to.equal('false');
            done();
          });
        });
      });

      it('should set the select all handle to indeterminate state if not all rows are selected', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.all.html'], function() {
          table._elements.body._elements.rows[0].selected = true;
          helpers.next(function() {
            expect(table.querySelector('[coral-table-select]').indeterminate).to.be.true;
            done();
          });
        });
      });

      it('should set the select all handle to indeterminate state on initialization', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.preselected.html'], function() {
          expect(table.selectedItems.length).to.equal(table.items.length - 1);
          expect(table.querySelector('[coral-table-select]').indeterminate).to.be.true;
          done();
        });
      });
      
      it('should set the select all handle to checked if an item is removed and all others are selected', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.preselected.html'], function() {
          table.items.last().remove();
          helpers.next(function() {
            expect(table.querySelector('[coral-table-select]').checked).to.be.true;
            done();
          });
        });
      });

      it('should set the select all handle to indeterminate if unselected item is added', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.preselected.html'], function() {
          table.items.last().remove();
          table.items.add();
          helpers.next(function() {
            expect(table.querySelector('[coral-table-select]').indeterminate).to.be.true;
            done();
          });
        });
      });
  
      it('should set the select all handle to unchecked if the only selected item is removed', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.all.html'], function() {
          var last = table.items.last();
          last.selected = true;
          last.remove();
          helpers.next(function() {
            expect(table.querySelector('[coral-table-select]').checked).to.be.false;
            done();
          });
        });
      });
  
      it('should set the select all handle to indeterminate if selected item is added', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.all.html'], function() {
          table.items.add({
            selected: true
          });
          helpers.next(function() {
            expect(table.querySelector('[coral-table-select]').indeterminate).to.be.true;
            done();
          });
        });
      });
  
      it('should set the select all handle to checked if only selected item is added', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.all.html'], function() {
          table.items.clear();
          table.items.add({
            selected: true
          });
          helpers.next(function() {
            expect(table.querySelector('[coral-table-select]').checked).to.be.true;
            done();
          });
        });
      });
  
      it('should set the select all handle to unchecked if removing the body with selected items', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.preselected.html'], function() {
          table.body.remove();
          helpers.next(function() {
            expect(table.querySelector('[coral-table-select]').checked).to.be.false;
            done();
          });
        });
      });
  
      it('should set the select all handle to checked if adding a body with a selected item', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.all.html'], function() {
          table.body.remove();
          var body = new Coral.Table.Body();
          body.appendChild(new Coral.Table.Row().set({
            selected: true
          }));
          table.body = body;
          helpers.next(function() {
            expect(table.querySelector('[coral-table-select]').checked).to.be.true;
            done();
          });
        });
      });
      
      it('should set the select all handle to checked if all rows are selected', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.all.html'], function() {
          table.items.getAll().forEach(function(row) {
            row.selected = true;
          });
          helpers.next(function() {
            expect(table.querySelector('[coral-table-select]').checked).to.be.true;
            done();
          });
        });
      });

      it('should set the select all handle to unchecked if no rows are selected', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.all.html'], function() {
          table._elements.body._elements.rows[0].selected = true;
          table._elements.body._elements.rows[0].selected = false;
          helpers.next(function() {
            expect(table.querySelector('[coral-table-select]').checked).to.be.false;
            done();
          });
        });
      });

      it('should set the select all handle to unchecked if there are no items', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.empty.html'], function() {
          expect(table.items.length).to.equal(0);
          expect(table.querySelector('[coral-table-select]').checked).to.be.false;
          done();
        });
      });

      it('should select all rows if the select all handle is checked', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.selectable.all.html'], function() {
          table.on('coral-table:change', eventSpy);
          table.querySelector('[coral-table-select] input').click();
          helpers.next(function() {
            table.items.getAll().forEach(function(row) {
              expect(row.selected).to.be.true;
              expect(row.classList.contains('is-selected')).to.be.true;
              expect(row.hasAttribute('selected')).to.be.true;
            });
            expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal([]);
            expect(eventSpy.args[0][0].detail.selection).to.deep.equal(table.selectedItems);
            done();
          });
        });
      });

      it('should deselect all rows if the select all handle is unchecked', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.selectable.all.html'], function() {
          var items = table.items.getAll();
          items.forEach(function(item) {
            item.selected = true;
          });
          table.on('coral-table:change', eventSpy);
          helpers.next(function() {
            table.querySelector('[coral-table-select] input').click();
            helpers.next(function() {
              items.forEach(function(row) {
                expect(row.selected).to.be.false;
                expect(row.classList.contains('is-selected')).to.be.false;
                expect(row.hasAttribute('selected')).to.be.false;
              });
              expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal(items);
              expect(eventSpy.args[0][0].detail.selection).to.deep.equal([]);
              done();
            });
          });
        });
      });

      it('should select the last row if table selection multiple is false and select all handle is checked', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.all.html'], function() {
          table.multiple = false;
          table.querySelector('[coral-table-select] input').click();
          var rows = table._getRows(['body']);
          rows.forEach(function(row, i) {
            expect(row.selected).to.equal(i === rows.length - 1);
          });
          done();
        });
      });

      it('should deselect the last row if table selection multiple is false and select all handle gets unchecked', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.all.html'], function() {
          table.multiple = false;
          table.items.last().selected = true;

          helpers.next(function() {
            table.querySelector('[coral-table-select] input').click();
            var rows = table._getRows(['body']);
            rows.forEach(function(row) {
              expect(row.selected).to.be.false;
            });
            done();
          });
        });
      });
    });

    describe('#divider', function() {
      it('should apply row divider', function() {
        var body = new Coral.Table.Body();
        body.divider = Coral.Table.divider.ROW;
        helpers.next(function() {
          expect(body.classList.contains('coral-Table-divider--row')).to.be.true;
          expect(body.classList.contains('coral-Table-divider--column')).to.be.false;
          expect(body.classList.contains('coral-Table-divider--cell')).to.be.false;
        });
      });

      it('should apply column divider', function() {
        var body = new Coral.Table.Body();
        body.divider = Coral.Table.divider.COLUMN;
        helpers.next(function() {
          expect(body.classList.contains('coral-Table-divider--column')).to.be.true;
          expect(body.classList.contains('coral-Table-divider--row')).to.be.false;
          expect(body.classList.contains('coral-Table-divider--cell')).to.be.false;
        });
      });

      it('should apply cell divider', function() {
        var body = new Coral.Table.Body();
        body.divider = Coral.Table.divider.CELL;
        helpers.next(function() {
          expect(body.classList.contains('coral-Table-divider--cell')).to.be.true;
          expect(body.classList.contains('coral-Table-divider--column')).to.be.false;
          expect(body.classList.contains('coral-Table-divider--row')).to.be.false;
        });
      });
    });
  });

  describe('a11y', function() {
    it('should set a11y attribute', function() {
      var row = new Coral.Table.Body();
      expect(row.getAttribute('role')).to.equal('rowgroup');
    });
  });
});
