describe('Coral.Table', function() {
  'use strict';

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Table');
    });
  });

  describe('attributes', function() {
    describe('#multiple', function() {
      it('should only select the last selected row if multiple is false', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
          var row1 = table._elements.body._elements.rows[0];
          var row2 = table._elements.body._elements.rows[1];
          expect(table.multiple).to.be.false;
          row1.selected = true;
          row2.selected = true;
          expect(row1.selected).to.be.false;
          expect(row2.selected).to.be.true;
          done();
        });
      });

      it('should select multiple rows if multiple is true', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
          var row1 = table._elements.body._elements.rows[0];
          var row2 = table._elements.body._elements.rows[1];
          table.multiple = true;
          row1.selected = true;
          row2.selected = true;
          expect(table.multiple).to.be.true;
          expect(row1.selected).to.be.true;
          expect(row2.selected).to.be.true;
          done();
        });
      });

      it('should select multiple rows after enabling table selection', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.base.html'], function() {
          var row1 = table._elements.body._elements.rows[0];
          var row2 = table._elements.body._elements.rows[1];
          table.multiple = true;
          table.selectable = true;
          helpers.next(function() {
            row1.selected = true;
            row2.selected = true;
            expect(table.multiple).to.be.true;
            expect(row1.selected).to.be.true;
            expect(row2.selected).to.be.true;
            done();
          });
        });
      });

      it('should enable multiple selection after adding the body to the table', function(done) {
        var table = new Coral.Table().set({
          selectable: true,
          multiple: true
        });
        var body = document.createElement('tbody', 'coral-table-body');
        table._elements.table.appendChild(body);
        helpers.next(function() {
          expect(table._elements.table.getAttribute('aria-multiselectable')).to.equal('true');
          done();
        });
      });

      it('should trigger a change event if multiple is set to false with selected items', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.all.html'], function() {
          var eventSpy = sinon.spy();
          var items = table.items.getAll();
          items.forEach(function(item) {
            item.selected = true;
          });
          table.on('coral-table:change', eventSpy);
          table.multiple = false;
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal(items);
            expect(eventSpy.args[0][0].detail.selection).to.deep.equal(table.selectedItems);
            done();
          });
        });
      });
    });

    describe('#selectable', function() {
      it('should set all items to selectable items', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.base.html'], function(){
          table.selectable = true;
          helpers.next(function() {
            table.items.getAll().forEach(function(item) {
              expect(item.hasAttribute('coral-table-rowselect')).be.true;
            });
            done();
          });
        });
      });

      it('should remove selection mode', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
          table.selectable = false;
          var row = table._elements.body._elements.rows[0];
          row.click();
          helpers.next(function() {
            expect(row.selected).to.be.false;
            expect(row.classList.contains('is-selected')).to.be.false;
            expect(row.getAttribute('aria-selected') === 'false').to.be.true;
            done();
          });
        });
      });

      it('appended items should be selectable', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
          var item = table.items.add();
          helpers.next(function() {
            item.click();
            helpers.next(function() {
              expect(item.selected).to.be.true;
              expect(item.hasAttribute('coral-table-rowselect')).to.be.true;
              done();
            });
          });
        });
      });

      it('should trigger a change event if selectable is set to false with selected items', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.all.html'], function() {
          var eventSpy = sinon.spy();
          var items = table.items.getAll();
          items.forEach(function(item) {
            item.selected = true;
          });
          table.on('coral-table:change', eventSpy);
          table.selectable = false;
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal(items);
            expect(eventSpy.args[0][0].detail.selection).to.deep.equal([]);
            done();
          });
        });
      });
    });

    describe('#selectedItem', function() {
      it('should return null if no rows are selected', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
          expect(table.selectedItem).to.equal(null);
          done();
        });
      });

      it('should return the selected row', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
          var row = table._elements.body._elements.rows[0];
          row.selected = true;
          expect(table.selectedItem).to.equal(row);
          done();
        });
      });

      it('should be readonly', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
          var row = table._elements.body._elements.rows[0];
          row.selected = true;
          table.selectedItem = '';
          expect(table.selectedItem).to.equal(row);
          done();
        });
      });
    });

    describe('#selectedItems', function() {
      it('should return an array of selected rows', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
          var row = table._elements.body._elements.rows[0];
          row.selected = true;
          expect(table.selectedItems.length).to.equal(1);
          expect(table.selectedItems[0]).to.equal(row);
          done();
        });
      });

      it('should return an empty array if no rows are selected', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
          expect(table.selectedItems.length).to.equal(0);
          done();
        });
      });

      it('should be readonly', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
          var row = table._elements.body._elements.rows[0];
          row.selected = true;
          table.selectedItems = '';
          expect(table.selectedItems[0]).to.equal(row);
          done();
        });
      });
    });

    describe('#lockable', function() {
      it('should set all items to lockable items', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.base.html'], function() {
          table.lockable = true;
          helpers.next(function() {
            table.items.getAll().forEach(function(item) {
              expect(item.hasAttribute('coral-table-rowlock')).to.be.true;
            });
            done();
          });
        });
      });

      it('should remove lockable mode', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.lockable.html'], function() {
          var row = table._elements.body._elements.rows[1];
          table.lockable = false;
          row.click();
          helpers.next(function() {
            expect(row.locked).to.be.false;
            done();
          });
        });
      });
    });

    describe('#orderable', function() {
      it('should set all items to orderable items', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.base.html'], function() {
          table.orderable = true;
          helpers.next(function() {
            table.items.getAll().forEach(function(item) {
              expect(item.hasAttribute('coral-table-roworder')).to.be.true;
            });
            done();
          });
        });
      });

      it('should remove orderable mode', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.orderable.row.html'], function() {
          table.orderable = false;
          helpers.next(function() {
            table.items.getAll().forEach(function(item) {
              expect(item.dragAction).to.be.undefined;
            });
            done();
          });
        });
      });

      it('appended items should be orderable', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.orderable.row.html'], function() {
          var item = table.items.add();
          helpers.next(function() {
            // Initiates the dragAction
            item.dispatchEvent(new MouseEvent('mousedown', {
              bubbles: true
            }));
            expect(item.dragAction).to.not.be.undefined;
            expect(item.hasAttribute('coral-table-roworder')).be.true;
            done();
          });
        });
      });
    });
  });

  describe('collection', function() {
    it('should be readonly', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.base.html'], function() {
        var items = table.items;
        table.items = '';
        expect(table.items).to.equal(items);
        done();
      });
    });

    it('should retrieve all coral-table-body rows', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.base.html'], function() {
        var rows = table._elements.body._elements.rows;
        var all = table.items.getAll();
        expect(rows.length).to.equal(all.length);
        all.forEach(function(row, i) {
          expect(rows[i]).to.equal(row);
          expect(row instanceof Coral.Table.Row).to.be.true;
        });
        done();
      });
    });

    it('should append a row to the existing coral-table-body', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.base.html'], function() {
        var length = table.items.length;
        var row = table.items.add(document.createElement('tr', 'coral-table-row'));
        expect(table.items.length).to.equal(length + 1);
        expect(row instanceof Coral.Table.Row).to.be.true;
        done();
      });
    });

    it('should append a row when using an object', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.base.html'], function() {
        var length = table.items.length;
        var row = table.items.add({});
        expect(table.items.length).to.equal(length + 1);
        expect(row instanceof Coral.Table.Row).to.be.true;
        done();
      });
    });

    it('should append a row at the given position to the existing body', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.base.html'], function() {
        var length = table.items.length;
        var row = table.items.add(document.createElement('tr', 'coral-table-row'), table._elements.body._elements.rows[0]);
        expect(table.items.length).to.equal(length + 1);
        expect(row).to.equal(table.items.getAll()[0]);
        expect(row instanceof Coral.Table.Row).to.be.true;
        done();
      });
    });

    it('should append a row to the existing body', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.base.html'], function() {
        var length = table.items.length;
        var row = table.items.add(document.createElement('tr', 'coral-table-row'));
        expect(table.items.length).to.equal(length + 1);
        expect(table.items.getAll()[table.items.length - 1]).to.equal(row);
        expect(row instanceof Coral.Table.Row).to.be.true;
        done();
      });
    });

    it('should append a coral-table-body if none', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.empty.html'], function() {
        var row = table.items.add(document.createElement('tr', 'coral-table-row'));
        expect(table.items.length).to.equal(1);
        expect(table.items.getAll()[0]).to.equal(row);
        expect(row instanceof Coral.Table.Row).to.be.true;
        done();
      });
    });

    it('should remove all rows', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.base.html'], function() {
        expect(table.items.length > 0).to.be.true;
        table.items.clear();
        expect(table.items.length).to.equal(0);
        done();
      });
    });

    it('should trigger coral-collection:add when appending a row', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.base.html'], function() {
        var eventSpy = sinon.spy();
        table.on('coral-collection:add', eventSpy);
        var row = table.items.add();
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.item).to.equal(row);
          done();
        });
      });
    });

    it('should trigger coral-collection:add when appending a not upgraded row', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.base.html'], function() {
        var eventSpy = sinon.spy();
        table.body.innerHTML = '';
        table.on('coral-collection:add', eventSpy);
        table.body.innerHTML = '<tr is="coral-table-row"></tr>';
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1);
          done();
        });
      });
    });

    it('should trigger coral-collection:remove', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.base.html'], function() {
        var eventSpy = sinon.spy();
        table.on('coral-collection:remove', eventSpy);
        var row = table._elements.body._elements.rows[0];
        row.remove();
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.item).to.equal(row);
          done();
        });
      });
    });

    it('should disable table features if no items', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.selectable.empty.html'], function() {
        expect(table.classList.contains('is-disabled')).to.be.true;
        expect(table.querySelector('[coral-table-select]').disabled).to.be.true;
        done();
      });
    });
    
    it('should be possible to declare items without table body', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.rowsonly.html'], function() {
        var selector = 'table tbody[is="coral-table-body"] tr[is="coral-table-row"]';
        expect(table.items.getAll()).to.deep.equal(Array.from(table.querySelectorAll(selector)));
        expect(table.querySelector('tbody:not([is])')).equal(null);
        done();
      });
    });
  });

  describe('a11y', function() {
    it('should set a11y attributes', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.base.html'], function() {
        expect(table.getAttribute('role')).to.equal('presentation');
        expect(table._elements.container.getAttribute('role')).to.equal('presentation');
        expect(table._elements.table.getAttribute('role')).to.equal('grid');

        var headerCell = table._elements.head._elements.rows[0]._elements.headerCells[0];
        expect(headerCell.getAttribute('scope')).to.equal('col');
        expect(headerCell.getAttribute('role')).to.equal('columnheader');

        table._elements.body._elements.rows[0].appendChild(headerCell);
        helpers.next(function() {
          expect(headerCell.getAttribute('scope')).to.equal('row');
          expect(headerCell.getAttribute('role')).to.equal('rowheader');
          done();
        });
      });
    });

    it('first selectable item is focusable by default', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
        expect(table.items.first().getAttribute('tabindex') === '0').to.be.true;
        done();
      });
    });

    it('first lockable item is focusable by default', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.lockable.html'], function() {
        expect(table.items.first().getAttribute('tabindex') === '0').to.be.true;
        done();
      });
    });

    it('first orderable item is focusable by default', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.orderable.row.html'], function() {
        expect(table.items.first().getAttribute('tabindex') === '0').to.be.true;
        done();
      });
    });

    it('should focus the selected item', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
        var row1 = table._elements.body._elements.rows[0];
        var row2 = table._elements.body._elements.rows[1];
        row2.click();
        helpers.next(function() {
          expect(row1.hasAttribute('tabindex')).to.be.false;
          expect(row2.getAttribute('tabindex') === '0').to.be.true;
          expect(row2).to.equal(document.activeElement);
          done();
        });
      });
    });

    it('should focus the first item with key:home', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
        var row1 = table._elements.body._elements.rows[0];
        var row3 = table._elements.body._elements.rows[2];
        row3.click();
        helpers.next(function() {
          expect(row3.getAttribute('tabindex') === '0').to.be.true;
          expect(row3).to.equal(document.activeElement);
          helpers.keypress('home', row3);
          helpers.next(function() {
            expect(row1.getAttribute('tabindex') === '0').to.be.true;
            expect(row1).to.equal(document.activeElement);
            done();
          });
        });
      });
    });

    it('should focus the last item with key:end', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
        var row1 = table._elements.body._elements.rows[0];
        var row3 = table._elements.body._elements.rows[2];
        row1.click();
        helpers.next(function() {
          expect(row1.getAttribute('tabindex') === '0').to.be.true;
          expect(row1).to.equal(document.activeElement);
          helpers.keypress('end', row1);
          helpers.next(function() {
            expect(row3.getAttribute('tabindex') === '0').to.be.true;
            expect(row3).to.equal(document.activeElement);
            done();
          });
        });
      });
    });

    it('should focus the next item with key:right', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
        var row1 = table._elements.body._elements.rows[0];
        var row2 = table._elements.body._elements.rows[1];
        helpers.keypress('right', row1);
        helpers.next(function() {
          expect(row2.getAttribute('tabindex') === '0').to.be.true;
          expect(row2).to.equal(document.activeElement);
          done();
        });
      });
    });

    it('should focus the next item with key:down', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
        var row1 = table._elements.body._elements.rows[0];
        var row2 = table._elements.body._elements.rows[1];
        helpers.keypress('down', row1);
        helpers.next(function() {
          expect(row2.getAttribute('tabindex') === '0').to.be.true;
          expect(row2).to.equal(document.activeElement);
          done();
        });
      });
    });

    it('should focus the next item with key:pagedown', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
        var row1 = table._elements.body._elements.rows[0];
        var row2 = table._elements.body._elements.rows[1];
        helpers.keypress('pagedown', row1);
        helpers.next(function() {
          expect(row2.getAttribute('tabindex') === '0').to.be.true;
          expect(row2).to.equal(document.activeElement);
          done();
        });
      });
    });

    it('should focus the previous item with key:left, key:up, key:pageup', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
        var row1 = table._elements.body._elements.rows[0];
        var row2 = table._elements.body._elements.rows[1];
        row2.click();
        helpers.next(function() {
          helpers.keypress('left', row2);
          helpers.next(function() {
            expect(row1.getAttribute('tabindex') === '0').to.be.true;
            expect(row1).to.equal(document.activeElement);
            done();
          });
        });
      });
    });

    it('should focus the previous item with key:up', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
        var row1 = table._elements.body._elements.rows[0];
        var row2 = table._elements.body._elements.rows[1];
        row2.click();
        helpers.next(function() {
          helpers.keypress('up', row2);
          helpers.next(function() {
            expect(row1.getAttribute('tabindex') === '0').to.be.true;
            expect(row1).to.equal(document.activeElement);
            done();
          });
        });
      });
    });

    it('should focus the previous item with key:pageup', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
        var row1 = table._elements.body._elements.rows[0];
        var row2 = table._elements.body._elements.rows[1];
        row2.click();
        helpers.next(function() {
          helpers.keypress('up', row2);
          helpers.next(function() {
            expect(row1.getAttribute('tabindex') === '0').to.be.true;
            expect(row1).to.equal(document.activeElement);
            done();
          });
        });
      });
    });

    it('should select next item with key:down+shift', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
        var row1 = table._elements.body._elements.rows[0];
        var row2 = table._elements.body._elements.rows[1];
        table.multiple = true;
        row1.click();
        helpers.next(function() {
          helpers.keypress('down', row1, ['shift']);
          helpers.next(function() {
            expect(table.selectedItems.length).to.equal(2);
            expect(row1.selected).to.be.true;
            expect(row2.selected).to.be.true;
            expect(row2).to.equal(document.activeElement);
            done();
          });
        });
      });
    });

    it('should select next item with key:pagedown+shift', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
        var row1 = table._elements.body._elements.rows[0];
        var row2 = table._elements.body._elements.rows[1];
        table.multiple = true;
        row1.click();
        helpers.next(function() {
          helpers.keypress('down', row1, ['shift']);
          helpers.next(function() {
            expect(table.selectedItems.length).to.equal(2);
            expect(row1.selected).to.be.true;
            expect(row2.selected).to.be.true;
            expect(row2).to.equal(document.activeElement);
            done();
          });
        });
      });
    });

    it('should select next item with key:right+shift', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
        var row1 = table._elements.body._elements.rows[0];
        var row2 = table._elements.body._elements.rows[1];
        table.multiple = true;
        row1.click();
        helpers.next(function() {
          helpers.keypress('down', row1, ['shift']);
          helpers.next(function() {
            expect(table.selectedItems.length).to.equal(2);
            expect(row1.selected).to.be.true;
            expect(row2.selected).to.be.true;
            expect(row2).to.equal(document.activeElement);
            done();
          });
        });
      });
    });

    it('should select previous item with key:up+shift', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
        var row1 = table._elements.body._elements.rows[0];
        var row2 = table._elements.body._elements.rows[1];
        table.multiple = true;
        row2.click();
        helpers.next(function() {
          helpers.keypress('up', row2, ['shift']);
          helpers.next(function() {
            expect(table.selectedItems.length).to.equal(2);
            expect(row1.selected).to.be.true;
            expect(row2.selected).to.be.true;
            expect(row1).to.equal(document.activeElement);
            done();
          });
        });
      });
    });

    it('should select previous item with key:pageup+shift', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
        var row1 = table._elements.body._elements.rows[0];
        var row2 = table._elements.body._elements.rows[1];
        table.multiple = true;
        row2.click();
        helpers.next(function() {
          helpers.keypress('up', row2, ['shift']);
          helpers.next(function() {
            expect(table.selectedItems.length).to.equal(2);
            expect(row1.selected).to.be.true;
            expect(row2.selected).to.be.true;
            expect(row1).to.equal(document.activeElement);
            done();
          });
        });
      });
    });

    it('should select previous item with key:left+shift', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
        var row1 = table._elements.body._elements.rows[0];
        var row2 = table._elements.body._elements.rows[1];
        table.multiple = true;
        row2.click();
        helpers.next(function() {
          helpers.keypress('up', row2, ['shift']);
          helpers.next(function() {
            expect(table.selectedItems.length).to.equal(2);
            expect(row1.selected).to.be.true;
            expect(row2.selected).to.be.true;
            expect(row1).to.equal(document.activeElement);
            done();
          });
        });
      });
    });

    it('should prevent text-selection', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
        var row = table._elements.body._elements.rows[0];
        row.selected = true;
        table.multiple = true;
        table._elements.body._elements.rows[1].dispatchEvent(new MouseEvent('mousedown', {
          bubbles: true,
          shiftKey: true
        }));
        helpers.next(function() {
          expect(table.selectedItems.length).to.equal(1);
          expect(table.selectedItem).to.equal(row);
          expect(table.classList.contains('is-unselectable')).to.be.true;
          done();
        });
      });
    });

    it('should select multiple items with click+shift if no items selected by default', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
        table.multiple = true;
        table._elements.body._elements.rows[1].dispatchEvent(new MouseEvent('click', {
          bubbles: true,
          shiftKey: true
        }));
        expect(table._elements.body._elements.rows[0].selected).to.be.true;
        expect(table._elements.body._elements.rows[1].selected).to.be.true;
        expect(table._elements.body._elements.rows[2].selected).to.be.false;
        done();
      });
    });

    it('should select an item range with click+shift on deselected item', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
        var rows = table._elements.body._elements.rows;
        table.multiple = true;
        rows[0].selected = true;
        helpers.next(function() {
          rows[rows.length - 1].dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            shiftKey: true
          }));
          helpers.next(function() {
            expect(table.selectedItems.length).to.equal(table.items.length);
            done();
          });
        });
      });
    });

    it('should select an item range if click+shift on selected item', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
        table.multiple = true;
        table._elements.body._elements.rows[0].selected = true;
        table._elements.body._elements.rows[2].selected = true;
        helpers.next(function() {
          table._elements.body._elements.rows[0].dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            shiftKey: true
          }));
          expect(table.selectedItems.length).to.equal(table.items.length);
          done();
        });
      });
    });

    it('should reverse selection with click+shift', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
        table.multiple = true;
        table._elements.body._elements.rows[1].selected = true;
        helpers.next(function() {
          table._elements.body._elements.rows[0].dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            shiftKey: true
          }));
          helpers.next(function() {
            table._elements.body._elements.rows[2].dispatchEvent(new MouseEvent('click', {
              bubbles: true,
              shiftKey: true
            }));
            helpers.next(function() {
              expect(table._elements.body._elements.rows[0].selected).to.be.false;
              expect(table._elements.body._elements.rows[1].selected).to.be.true;
              expect(table._elements.body._elements.rows[2].selected).to.be.true;
              done();
            });
          });
        });
      });
    });

    it('should deselect siblings items of selected row with click+shift', function(done) {
      var table = helpers.build(window.__html__['Coral.Table.selectable.html'], function() {
        table.multiple = true;
        table._elements.body._elements.rows[0].selected = true;
        table._elements.body._elements.rows[1].selected = true;
        table._elements.body._elements.rows[2].selected = true;
        helpers.next(function() {
          table._elements.body._elements.rows[1].dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            shiftKey: true
          }));
          helpers.next(function() {
            expect(table._elements.body._elements.rows[0].selected).to.be.false;
            expect(table._elements.body._elements.rows[1].selected).to.be.true;
            expect(table._elements.body._elements.rows[2].selected).to.be.true;
            done();
          });
        });
      });
    });
  });
});
