describe('Coral.Table.Row', function() {
  'use strict';

  // Mock for dragging
  function dragTo(row, direction) {
    // Calculate distance to enable swap
    var y = row.getBoundingClientRect().height * 2 * direction;
    // Initiates the dragAction
    row.dispatchEvent(new MouseEvent('mousedown', {
      bubbles: true
    }));
    // Triggering twice is enough to perform the swap
    for (var i = 0; i < 2; i++) {
      row.dispatchEvent(new MouseEvent('mousemove', {
        bubbles: true,
        clientY: y
      }));
    }
    // Destroy dragAction
    row.dispatchEvent(new MouseEvent('mouseup', {
      bubbles: true
    }));
  }

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral.Table).to.have.property('Row');
    });
  });

  describe('attributes', function() {
    function getIndexOf(el) {
      var parent = el.parentNode;
      if (!parent) {
        return -1;
      }

      return Array.prototype.indexOf.call(parent.children, el);
    }

    describe('#selectable', function() {
      it('should set all items to selectable items', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.base.html'], function(){
          var row = table.items.first();
          row.selectable = true;
          helpers.next(function() {
            row.items.getAll().forEach(function(item) {
              expect(item.hasAttribute('coral-table-cellselect')).to.be.true;
            });
            done();
          });
        });
      });

      it('should remove selection mode', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.cell.html'], function() {
          var row = table.items.first();
          row.selectable = false;
          var cell = row.items.first();
          cell.click();
          helpers.next(function() {
            expect(cell.selected).to.be.false;
            expect(cell.classList.contains('is-selected')).to.be.false;
            expect(cell.getAttribute('aria-selected') === 'true').to.be.false;
            done();
          });
        });
      });

      it('appended items should be selectable', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.cell.html'], function() {
          var cell = table.items.first().items.add();
          helpers.next(function() {
            cell.click();
            helpers.next(function() {
              expect(cell.selected).to.be.true;
              expect(cell.hasAttribute('coral-table-cellselect')).to.be.true;
              done();
            });
          });
        });
      });
    });

    describe('#selectedItem', function() {
      it('should return null if no cells are selected', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.cell.html'], function() {
          expect(table.items.first().selectedItem).to.equal(null);
          done();
        });
      });

      it('should return the selected cell', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.cell.html'], function() {
          var row = table.items.first();
          var cell = row.items.first();
          cell.selected = true;
          expect(row.selectedItem).to.equal(cell);
          done();
        });
      });

      it('should be readonly', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.cell.html'], function() {
          var row = table.items.first();
          var cell = row.items.first();
          cell.selected = true;
          row.selectedItem = '';
          expect(row.selectedItem).to.equal(cell);
          done();
        });
      });
    });

    describe('#selectedItems', function() {
      it('should return an array of selected cells', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.cell.html'], function() {
          var row = table.items.first();
          var cell = row.items.first();
          cell.selected = true;
          expect(row.selectedItems.length).to.equal(1);
          expect(row.selectedItems[0]).to.equal(cell);
          done();
        });
      });

      it('should return an empty array if no cells are selected', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.cell.html'], function() {
          expect(table.items.first().selectedItems.length).to.equal(0);
          done();
        });
      });

      it('should be readonly', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.cell.html'], function() {
          var row = table.items.first();
          var cell = row.items.first();
          cell.selected = true;
          row.selectedItems = '';
          expect(row.selectedItems[0]).to.equal(cell);
          done();
        });
      });
    });

    describe('#multiple', function() {
      it('should only select the last selected cell if multiple is false', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.cell.html'], function() {
          var row = table.items.first();
          var cells = row.items.getAll();
          var cell1 = cells[0];
          var cell2 = cells[1];
          expect(row.multiple).to.be.false;
          cell1.selected = true;
          cell2.selected = true;
          expect(cell1.selected).to.be.false;
          expect(cell2.selected).to.be.true;
          done();
        });
      });

      it('should select multiple cells if multiple is true', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.selectable.cell.html'], function() {
          var row = table.items.first();
          var cells = row.items.getAll();
          var cell1 = cells[0];
          var cell2 = cells[1];
          row.multiple = true;
          cell1.selected = true;
          cell2.selected = true;
          expect(row.multiple).to.be.true;
          expect(cell1.selected).to.be.true;
          expect(cell2.selected).to.be.true;
          done();
        });
      });

      it('should select multiple cells after enabling row selection', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.base.html'], function() {
          var row = table.items.first();
          var cells = row.items.getAll();
          var cell1 = cells[0];
          var cell2 = cells[1];
          row.multiple = true;
          row.selectable = true;
          helpers.next(function() {
            cell1.selected = true;
            cell2.selected = true;
            expect(row.multiple).to.be.true;
            expect(cell1.selected).to.be.true;
            expect(cell2.selected).to.be.true;
            done();
          });
        });
      });

      it('should only trigger one coral-table:rowchange event on single selection change', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.selectable.cell.html'], function() {
          var row = table.items.first();
          var firstItem = row.items.first();
          var lastItem = row.items.last();
          firstItem.selected = true;
          table.on('coral-table:rowchange', eventSpy);
          lastItem.selected = true;
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.row).to.equal(row);
            expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal([firstItem]);
            expect(eventSpy.args[0][0].detail.selection).to.deep.equal([lastItem]);
            done();
          });
        });
      });

      it('should only trigger one coral-table:rowchange event on multiple false change', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.selectable.cell.html'], function() {
          var row = table.items.first();
          row.multiple = true;
          row.items.getAll().forEach(function(item) {
            item.selected = true;
          });
          table.on('coral-table:rowchange', eventSpy);
          row.multiple = false;
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.row).to.equal(row);
            expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal(row.items.getAll());
            expect(eventSpy.args[0][0].detail.selection).to.deep.equal([row.items.last()]);
            done();
          });
        });
      });
    });

    describe('#locked', function() {
      it('should lock the row by placing it as first child of body', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.base.html'], function() {
          table.on('coral-table:rowlock', eventSpy);
          var row = table._elements.body._elements.rows[1];
          expect(getIndexOf(row)).to.equal(1);
          row.locked = true;
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.row).to.equal(row);
            expect(getIndexOf(row)).to.equal(0);
            done();
          });
        });
      });

      it('should not lock the row if table is not lockable', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.base.html'], function() {
          table.lockable = false;
          table.on('coral-table:rowlock', eventSpy);
          helpers.next(function() {
            var row = table._elements.body._elements.rows[1];
            expect(getIndexOf(row)).to.equal(1);
            row.click();
            helpers.next(function() {
              expect(eventSpy.callCount).to.equal(0);
              expect(getIndexOf(row)).to.equal(1);
              done();
            });
          });
        });
      });

      it('should lock the row if lock element is clicked', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.lockable.html'], function() {
          var row = table._elements.body._elements.rows[1];
          expect(getIndexOf(row)).to.equal(1);
          row.click();
          helpers.next(function() {
            expect(getIndexOf(row)).to.equal(0);
            expect(document.activeElement).to.equal(row);
            done();
          });
        });
      });

      it('should unlock the row by placing back to its position', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.base.html'], function() {
          table.on('coral-table:rowunlock', eventSpy);
          var row = table._elements.body._elements.rows[1];
          var initialRowIndex = getIndexOf(row);
          row.locked = true;
          helpers.next(function() {
            row.locked = false;
            helpers.next(function() {
              expect(eventSpy.callCount).to.equal(1);
              expect(eventSpy.args[0][0].detail.row).to.equal(row);
              expect(getIndexOf(row)).to.equal(initialRowIndex);
              done();
            });
          });
        });
      });

      it('should preserve the selection after locking', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.lockable.html'], function() {
          table.selectable = true;
          var row = table._elements.body._elements.rows[1];
          row.selected = true;
          row.click();
          helpers.next(function() {
            expect(row.selected).to.be.true;
            expect(row.locked).to.be.true;
            done();
          });
        });
      });

      it('appended items should be lockable', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.lockable.html'], function() {
          var item = table.items.add();
          helpers.next(function() {
            item.click();
            helpers.next(function() {
              expect(item.locked).to.be.true;
              expect(item.hasAttribute('coral-table-rowlock')).to.be.true;
              done();
            });
          });
        });
      });
    });

    describe('#orderable', function() {
      it('should drag the row to the top', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.orderable.row.html'], function() {
          table.on('coral-table:roworder', eventSpy);
          var row = table._elements.body._elements.rows[1];
          expect(getIndexOf(row)).to.equal(1);
          dragTo(row, -1);
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.row).to.equal(row);
            expect(getIndexOf(row)).to.equal(0);
            expect(document.activeElement).to.equal(row);
            done();
          });
        });
      });

      it('should drag the row to the bottom', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.orderable.row.html'], function() {
          table.on('coral-table:roworder', eventSpy);
          var row = table._elements.body._elements.rows[0];
          expect(getIndexOf(row)).to.equal(0);
          dragTo(row, 1);
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.row).to.equal(row);
            expect(getIndexOf(row)).to.equal(1);
            expect(document.activeElement).to.equal(row);
            done();
          });
        });
      });

      it('should prevent the row from being inserted at the dragged position', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.orderable.row.html'], function() {
          table.on('coral-table:beforeroworder', eventSpy);
          table.on('coral-table:beforeroworder', function(event) {
            event.preventDefault();
          });
          var row = table._elements.body._elements.rows[0];
          expect(getIndexOf(row)).to.equal(0);
          dragTo(row, 1);
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.row).to.equal(row);
            expect(eventSpy.args[0][0].detail.before).to.equal(null);
            expect(getIndexOf(row)).to.equal(0);
            expect(document.activeElement).to.equal(row);
            done();
          });
        });
      });

      it('should pass the sibling row to allow reverting', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.orderable.row.html'], function() {
          table.on('coral-table:roworder', eventSpy);
          var row = table._elements.body._elements.rows[0];
          var oldBefore = table._elements.body._elements.rows[1];
          expect(getIndexOf(row)).to.equal(0);
          dragTo(row, 1);
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.row).to.equal(row);
            expect(eventSpy.args[0][0].detail.oldBefore).to.equal(oldBefore);
            expect(eventSpy.args[0][0].detail.before).to.equal(row.nextElementSibling);
            done();
          });
        });
      });

      it('should not initialize dragging logic if the order handle is disabled', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.orderable.row.html'], function() {
          var row = table._elements.body._elements.rows[0];
          row.setAttribute('disabled', '');
          row.dispatchEvent(new MouseEvent('mousedown', {
            bubbles: true
          }));
          expect(row.dragAction).to.be.undefined;
          expect(table.querySelector('.coral-Table-row--placeholder')).to.be.null;
          done();
        });
      });

      it('should remove the row placeholder before triggering roworder events', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.orderable.row.html'], function() {
          table.on('coral-table:beforeroworder', function() {
            expect(table.querySelector('.coral-Table-row--placeholder')).to.be.null;
          });
          table.on('coral-table:roworder', function() {
            expect(table.querySelector('.coral-Table-row--placeholder')).to.be.null;
            done();
          });
          dragTo(table._elements.body._elements.rows[0], 1);
        });
      });

      it('should scroll to the table bottom in sticky mode', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.sticky.orderable.row.html'], function() {
          var row = table.items.first();
          var container = table._elements.container;
          // setTimeout required else scrolling won't be effective
          setTimeout(function() {
            container.scrollTop = 0;
            dragTo(row, 1);
            helpers.next(function() {
              expect(row).to.equal(table.items.last());
              expect(container.scrollTop > 0).to.be.true;
              done();
            });
          }, 100);
        });
      });

      it('should scroll to the table top in sticky mode', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.sticky.orderable.row.html'], function() {
          var row = table.items.last();
          var container = table._elements.container;
          // setTimeout required else scrolling won't be effective
          setTimeout(function() {
            container.scrollTop = 100;
            var maxScrollTop = container.scrollTop;
            dragTo(row, -1);
            helpers.next(function() {
              expect(row).to.equal(table.items.first());
              expect(container.scrollTop < maxScrollTop).to.be.true;
              done();
            });
          }, 100);
        });
      });

      it('should destroy the dragaction', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.orderable.row.html'], function() {
          var row = table._elements.body._elements.rows[1];
          row.orderable = false;
          helpers.next(function() {
            expect(row.dragaction).to.be.undefined;
            done();
          });
        });
      });
    });
  });

  describe('a11y', function() {
    it('should set a11y attribute', function() {
      var row = new Coral.Table.Row();
      expect(row.getAttribute('role')).to.equal('row');
    });
  });
});
