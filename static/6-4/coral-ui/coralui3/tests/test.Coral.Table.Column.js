describe('Coral.Table.Column', function() {
  'use strict';

  // Mock for dragging
  function dragTo(headerCell, direction) {
    // Calculate distance to enable swap
    var x = headerCell.getBoundingClientRect().width * 2 * direction;
    // Initiates the dragAction
    headerCell.dispatchEvent(new MouseEvent('mousedown', {
      bubbles: true
    }));
    // Triggering twice is enough to perform the swap
    for (var i = 0; i < 2; i++) {
      headerCell.dispatchEvent(new MouseEvent('mousemove', {
        bubbles: true,
        clientX: x
      }));
    }
    // Destroy dragAction
    headerCell.dispatchEvent(new MouseEvent('mouseup', {
      bubbles: true
    }));
  }

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral.Table).to.have.property('Column');
    });
  });

  describe('attributes', function() {
    describe('#fixedWidth', function() {
      it('should set a fixed width to the column', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.fixedwidth.html'], function() {
          var col = table._getColumns()[0];
          var headRow = table._elements.head._elements.rows[0];
          var bodyRow = table._elements.body._elements.rows[0];
          var headerCell1 = headRow._elements.headerCells[0];
          var headerCell2 = headRow._elements.headerCells[1];
          var cell1 = bodyRow._elements.cells[0];
          var cell2 = bodyRow._elements.cells[1];
          var cell1Width = cell1.getBoundingClientRect().width;
          var cell2Width = cell2.getBoundingClientRect().width;
          col.fixedWidth = true;
          helpers.next(function() {
            expect(cell1.getBoundingClientRect().width < cell1Width).to.be.true;
            expect(cell2.getBoundingClientRect().width > cell2Width).to.be.true;
            expect(headerCell1.hasAttribute('fixedwidth')).to.be.true;
            expect(headerCell2.hasAttribute('fixedwidth')).to.be.false;
            done();
          });
        });
      });
    });

    describe('#hidden', function() {
      it('should hide the column', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.hidden.html'], function() {
          helpers.next(function() {
            table._getRows().forEach(function(row) {
              expect(row._getCellByIndex(0).hasAttribute('hidden')).to.be.true;
            });
            done();
          });
        });
      });

      it('appended cells should be hidden', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.hidden.html'], function() {
          var cell1 = new Coral.Table.Cell();
          var cell2 = new Coral.Table.Cell();
          cell2.hidden = true;
          var row = table.items.add({});
          row.appendChild(cell1);
          row.appendChild(cell2);
          table._elements.body.appendChild(row);
          helpers.next(function() {
            expect(cell1.hidden).to.be.true;
            expect(cell2.hidden).to.be.false;
            done();
          });
        });
      });
    });

    describe('#sortable', function() {
      it('should set sortable direction to default', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.sortable.html'], function() {
          var col = table._getColumns()[0];
          var headerCell = table._elements.head._elements.rows[0]._elements.headerCells[0];
          helpers.next(function() {
            expect(col.sortableDirection).to.equal(Coral.Table.Column.sortableDirection.DEFAULT);
            expect(headerCell.getAttribute('sortabledirection')).to.equal(col.sortableDirection);
            done();
          });
        });
      });

      it('should set sortable direction to ascending', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.sortable.html'], function() {
          table.on('coral-table:columnsort', eventSpy);
          var col = table._getColumns()[0];
          var headerCell = table._elements.head._elements.rows[0]._elements.headerCells[0];
          headerCell.click();
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.column).to.equal(col);
            expect(col.sortableDirection).to.equal(Coral.Table.Column.sortableDirection.ASCENDING);
            expect(headerCell.getAttribute('sortabledirection')).to.equal(col.sortableDirection);
            done();
          });
        });
      });

      it('should not trigger coral-table:change event when sorting', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.sortable.html'], function() {
          table.selectable = true;
          table._elements.body._elements.rows[0].selected = true;
          table.on('coral-table:change', eventSpy);
          var col = table._getColumns()[0];
          col.sortableDirection = Coral.Table.Column.sortableDirection.ASCENDING;
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(0);
            done();
          });
        });
      });

      it('should set sortable direction to descending', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.sortable.html'], function() {
          table.on('coral-table:columnsort', eventSpy);
          var col = table._getColumns()[0];
          var headerCell = table._elements.head._elements.rows[0]._elements.headerCells[0];
          headerCell.click();
          headerCell.click();
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(2);
            expect(eventSpy.args[0][0].detail.column).to.equal(col);
            expect(col.sortableDirection).to.equal(Coral.Table.Column.sortableDirection.DESCENDING);
            expect(headerCell.getAttribute('sortabledirection')).to.equal(col.sortableDirection);
            done();
          });
        });
      });

      it('should set sortable direction back to default', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.sortable.html'], function() {
          table.on('coral-table:columnsort', eventSpy);
          var col = table._getColumns()[0];
          var headerCell = table._elements.head._elements.rows[0]._elements.headerCells[0];
          headerCell.click();
          headerCell.click();
          headerCell.click();
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(3);
            expect(eventSpy.args[0][0].detail.column).to.equal(col);
            expect(col.sortableDirection).to.equal(Coral.Table.Column.sortableDirection.DEFAULT);
            expect(headerCell.getAttribute('sortabledirection')).to.equal(col.sortableDirection);
            done();
          });
        });
      });

      it('should sort ascending by alphanumeric type', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.sortable.html'], function() {
          var col = table._getColumns()[0];
          col.sortableDirection = Coral.Table.Column.sortableDirection.ASCENDING;
          helpers.next(function() {
            table.items.getAll().forEach(function(row, i) {
              expect(parseInt(row.dataset.alphanumeric)).to.equal(i);
            });
            done();
          });
        });
      });

      it('should sort ascending by alphanumeric type by default', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.sortable.default.html'], function() {
          helpers.next(function() {
            table.items.getAll().forEach(function(row, i) {
              expect(parseInt(row.dataset.alphanumeric)).to.equal(i);
            });
            done();
          });
        });
      });

      it('should sort descending by alphanumeric type', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.sortable.html'], function() {
          var col = table._getColumns()[0];
          col.sortableDirection = Coral.Table.Column.sortableDirection.DESCENDING;
          helpers.next(function() {
            var rows = table.items.getAll().reverse();
            rows.forEach(function(row, i) {
              expect(parseInt(row.dataset.alphanumeric)).to.equal(i);
            });
            done();
          });
        });
      });

      it('should sort ascending by number type', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.sortable.html'], function() {
          var col = table._getColumns()[1];
          col.sortableDirection = Coral.Table.Column.sortableDirection.ASCENDING;
          helpers.next(function() {
            table.items.getAll().forEach(function(row, i) {
              expect(parseInt(row.dataset.number)).to.equal(i);
            });
            done();
          });
        });
      });

      it('should sort descending by number type', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.sortable.html'], function() {
          var col = table._getColumns()[1];
          col.sortableDirection = Coral.Table.Column.sortableDirection.DESCENDING;
          helpers.next(function() {
            var rows = table.items.getAll().reverse();
            rows.forEach(function(row, i) {
              expect(parseInt(row.dataset.number)).to.equal(i);
            });
            done();
          });
        });
      });

      it('should sort ascending by date type', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.sortable.html'], function() {
          var col = table._getColumns()[table._getColumns().length - 1];
          col.sortableDirection = Coral.Table.Column.sortableDirection.ASCENDING;
          helpers.next(function() {
            table.items.getAll().forEach(function(row, i) {
              expect(parseInt(row.dataset.date)).to.equal(i);
            });
            done();
          });
        });
      });

      it('should sort descending by date type', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.sortable.html'], function() {
          var col = table._getColumns()[table._getColumns().length - 1];
          col.sortableDirection = Coral.Table.Column.sortableDirection.DESCENDING;
          helpers.next(function() {
            var rows = table.items.getAll().reverse();
            rows.forEach(function(row, i) {
              expect(parseInt(row.dataset.date)).to.equal(i);
            });
            done();
          });
        });
      });

      it('should restore default sorting', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.sortable.html'], function() {
          var col = table._getColumns()[0];
          col.sortableDirection = Coral.Table.Column.sortableDirection.ASCENDING;
          col.sortableDirection = Coral.Table.Column.sortableDirection.DEFAULT;
          helpers.next(function() {
            table.items.getAll().forEach(function(row, i) {
              expect(parseInt(row.dataset.default)).to.equal(i);
            });
            done();
          });
        });
      });

      it('should sort by alphanumeric type ascending using cells value property', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.sortable.value.html'], function() {
          table.on('coral-table:columnsort', eventSpy);
          var col = table._getColumns()[0];
          var headerCell = table._elements.head._elements.rows[0]._elements.headerCells[0];
          col.sortableDirection = Coral.Table.Column.sortableDirection.ASCENDING;
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.column).to.equal(col);
            expect(col.sortableDirection).to.equal(Coral.Table.Column.sortableDirection.ASCENDING);
            expect(headerCell.getAttribute('sortabledirection')).to.equal(col.sortableDirection);
            table.items.getAll().forEach(function(row, i) {
              expect(parseInt(row.dataset.alphanumeric)).to.equal(i);
            });
            done();
          });
        });
      });

      it('should sort by alphanumeric type descending using cells value property', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.sortable.value.html'], function() {
          table.on('coral-table:columnsort', eventSpy);
          var col = table._getColumns()[0];
          var headerCell = table._elements.head._elements.rows[0]._elements.headerCells[0];
          col.sortableDirection = Coral.Table.Column.sortableDirection.DESCENDING;
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.column).to.equal(col);
            expect(col.sortableDirection).to.equal(Coral.Table.Column.sortableDirection.DESCENDING);
            expect(headerCell.getAttribute('sortabledirection')).to.equal(col.sortableDirection);
            var rows = table.items.getAll().reverse();
            rows.forEach(function(row, i) {
              expect(parseInt(row.dataset.alphanumeric)).to.equal(i);
            });
            done();
          });
        });
      });

      it('should sort by number type ascending using cells value property', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.sortable.value.html'], function() {
          table.on('coral-table:columnsort', eventSpy);
          var col = table._getColumns()[1];
          var headerCell = table._elements.head._elements.rows[0]._elements.headerCells[1];
          col.sortableDirection = Coral.Table.Column.sortableDirection.ASCENDING;
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.column).to.equal(col);
            expect(col.sortableDirection).to.equal(Coral.Table.Column.sortableDirection.ASCENDING);
            expect(headerCell.getAttribute('sortabledirection')).to.equal(col.sortableDirection);
            table.items.getAll().forEach(function(row, i) {
              expect(parseInt(row.dataset.number)).to.equal(i);
            });
            done();
          });
        });
      });

      it('should sort by number type descending using cells value property', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.sortable.value.html'], function() {
          table.on('coral-table:columnsort', eventSpy);
          var col = table._getColumns()[1];
          var headerCell = table._elements.head._elements.rows[0]._elements.headerCells[1];
          col.sortableDirection = Coral.Table.Column.sortableDirection.DESCENDING;
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.column).to.equal(col);
            expect(col.sortableDirection).to.equal(Coral.Table.Column.sortableDirection.DESCENDING);
            expect(headerCell.getAttribute('sortabledirection')).to.equal(col.sortableDirection);
            var rows = table.items.getAll().reverse();
            rows.forEach(function(row, i) {
              expect(parseInt(row.dataset.number)).to.equal(i);
            });
            done();
          });
        });
      });

      it('should sort by date type ascending using cells value property', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.sortable.value.html'], function() {
          table.on('coral-table:columnsort', eventSpy);
          var col = table._getColumns()[2];
          var headerCell = table._elements.head._elements.rows[0]._elements.headerCells[2];
          col.sortableDirection = Coral.Table.Column.sortableDirection.ASCENDING;
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.column).to.equal(col);
            expect(col.sortableDirection).to.equal(Coral.Table.Column.sortableDirection.ASCENDING);
            expect(headerCell.getAttribute('sortabledirection')).to.equal(col.sortableDirection);

            table.items.getAll().forEach(function(row, i) {
              expect(parseInt(row.dataset.date)).to.equal(i);
            });
            done();
          });
        });
      });

      it('should sort by date type descending using cells value property', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.sortable.value.html'], function() {
          table.on('coral-table:columnsort', eventSpy);
          var col = table._getColumns()[2];
          var headerCell = table._elements.head._elements.rows[0]._elements.headerCells[2];
          col.sortableDirection = Coral.Table.Column.sortableDirection.DESCENDING;
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.column).to.equal(col);
            expect(col.sortableDirection).to.equal(Coral.Table.Column.sortableDirection.DESCENDING);
            expect(headerCell.getAttribute('sortabledirection')).to.equal(col.sortableDirection);
            var rows = table.items.getAll().reverse();
            rows.forEach(function(row, i) {
              expect(parseInt(row.dataset.date)).to.equal(i);
            });
            done();
          });
        });
      });

      it('should trigger coral-table:beforecolumnsort', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.sortable.html'], function() {
          table.on('coral-table:beforecolumnsort', eventSpy);
          var col = table._getColumns()[0];
          var headerCell = table._elements.head._elements.rows[0]._elements.headerCells[0];
          headerCell.click();
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.column).to.equal(col);
            expect(eventSpy.args[0][0].detail.direction).to.equal(Coral.Table.Column.sortableDirection.ASCENDING);
            done();
          });
        });
      });

      it('should prevent sorting if user clicks the sorting arrow', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.sortable.html'], function() {
          table.on('coral-table:columnsort', eventSpy);
          table.on('coral-table:beforecolumnsort', function(event) {
            event.preventDefault();
          });
          var col = table._getColumns()[0];
          var sortableDirection = col.sortableDirection;
          table._elements.head._elements.rows[0]._elements.headerCells[0].click();
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(0);
            expect(col.sortableDirection).to.equal(sortableDirection);
            done();
          });
        });
      });

      it('should be able to sort programmatically by setting the sortableDirection property', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.sortable.html'], function() {
          table.on('coral-table:columnsort', eventSpy);
          var col = table._getColumns()[0];
          col.sortableDirection = Coral.Table.Column.sortableDirection.DESCENDING;
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.column).to.equal(col);
            expect(col.sortableDirection).to.equal(Coral.Table.Column.sortableDirection.DESCENDING);
            done();
          });
        });
      });

      it('should be able to sort programmatically if beforecolumnsort event is prevented', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.sortable.html'], function() {
          table.on('coral-table:beforecolumnsort', function(event) {
            event.preventDefault();
          });
          table.on('coral-table:columnsort', eventSpy);
          var col = table._getColumns()[0];
          col.sortableDirection = Coral.Table.Column.sortableDirection.DESCENDING;
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.column).to.equal(col);
            expect(col.sortableDirection).to.equal(Coral.Table.Column.sortableDirection.DESCENDING);
            done();
          });
        });
      });

      it('should not sort if sortableType is set to custom but still allow to change sortableDirection', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.sortable.html'], function() {
          table.on('coral-table:columnsort', eventSpy);
          var col = table._getColumns()[0];
          var headerCell = table._elements.head._elements.rows[0]._elements.headerCells[0];
          col.sortableType = Coral.Table.Column.sortableType.CUSTOM;
          col.sortableDirection = Coral.Table.Column.sortableDirection.DESCENDING;
          helpers.next(function() {
            // 'coral-table:columnsort' is not triggered if custom sorting
            expect(eventSpy.callCount).to.equal(0);
            expect(col.sortableDirection).to.equal(Coral.Table.Column.sortableDirection.DESCENDING);
            expect(headerCell.getAttribute('sortabledirection')).to.equal(col.sortableDirection);
            table.items.getAll().forEach(function(row, i) {
              expect(parseInt(row.dataset.default)).to.equal(i);
            });
            done();
          });
        });
      });

      it('should disable row ordering if table is in a sorted state (ascending)', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.orderable.hidden.html'], function() {
          table.on('coral-table:columnsort', eventSpy);
          var col = table._getColumns()[0];
          col.sortableDirection = Coral.Table.Column.sortableDirection.ASCENDING;
          helpers.next(function() {
            expect(table._isSorted()).to.be.true;
            expect(table.classList.contains('is-sorted')).to.be.true;
            done();
          });
        });
      });

      it('should disable row ordering if table is in a sorted state (descending)', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.orderable.hidden.html'], function() {
          table.on('coral-table:columnsort', eventSpy);
          var col = table._getColumns()[0];
          col.sortableDirection = Coral.Table.Column.sortableDirection.DESCENDING;
          helpers.next(function() {
            expect(table._isSorted()).to.be.true;
            expect(table.classList.contains('is-sorted')).to.be.true;
            done();
          });
        });
      });

      it('should enable row ordering back if table is not in a sorted state anymore', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.orderable.hidden.html'], function() {
          table.on('coral-table:columnsort', eventSpy);
          var col = table._getColumns()[0];
          col.sortableDirection = Coral.Table.Column.sortableDirection.DESCENDING;
          col.sortableDirection = Coral.Table.Column.sortableDirection.DEFAULT;
          helpers.next(function() {
            expect(table._isSorted()).to.be.false;
            expect(table.classList.contains('is-sorted')).to.be.false;
            done();
          });
        });
      });
    });

    describe('#orderable', function() {
      it('should drag the header cell to the left', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.orderable.column.html'], function() {
          var col = table._getColumns()[1];
          table.on('coral-table:columndrag', eventSpy);
          dragTo(table._elements.head._elements.rows[0]._elements.headerCells[1], -1);
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.column).to.equal(col);
            table._getRows().forEach(function(row) {
              expect(parseInt(row._getCellByIndex(0).dataset.dragged)).to.equal(0);
            });
            done();
          });
        });
      });

      it('should prevent the header cell from being inserted at the dragged position', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.orderable.column.html'], function() {
          var col = table._getColumns()[1];
          table.on('coral-table:beforecolumndrag', eventSpy);
          table.on('coral-table:beforecolumndrag', function(event) {
            event.preventDefault();
          });
          dragTo(table._elements.head._elements.rows[0]._elements.headerCells[1], -1);
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.column).to.equal(col);
            expect(eventSpy.args[0][0].detail.before).to.equal(table._getColumns()[0]);
            table._getRows().forEach(function(row) {
              expect(parseInt(row._getCellByIndex(0).dataset.dragged)).to.equal(1);
            });
            done();
          });
        });
      });

      it('should pass the sibling column to allow reverting', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.orderable.column.html'], function() {
          var col = table._getColumns()[0];
          var oldBefore = table._getColumns()[1];
          table.on('coral-table:columndrag', eventSpy);
          dragTo(table._elements.head._elements.rows[0]._elements.headerCells[0], 1);
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.column).to.equal(col);
            expect(eventSpy.args[0][0].detail.oldBefore).to.equal(oldBefore);
            expect(eventSpy.args[0][0].detail.before).to.equal(col.nextElementSibling);
            done();
          });
        });
      });

      it('should drag the header cell to the left (sortable)', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.orderable.column.html'], function() {
          var col = table._getColumns()[1];
          col.sortable = true;
          table.on('coral-table:columndrag', eventSpy);
          helpers.next(function() {
            dragTo(table._elements.head._elements.rows[0]._elements.headerCells[1], -1);
            helpers.next(function() {
              expect(eventSpy.callCount).to.equal(1);
              expect(eventSpy.args[0][0].detail.column).to.equal(col);
              table._getRows().forEach(function(row) {
                expect(parseInt(row._getCellByIndex(0).dataset.dragged)).to.equal(0);
              });
              done();
            });
          });
        });
      });

      it('should drag the header cell to the left (sticky)', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.orderable.column.html'], function() {
          var col = table._getColumns()[1];
          table.on('coral-table:columndrag', eventSpy);
          table._elements.head.sticky = true;
          helpers.next(function() {
            dragTo(table._elements.head._elements.rows[0]._elements.headerCells[1].content, -1);
            helpers.next(function() {
              expect(eventSpy.callCount).to.equal(1);
              expect(eventSpy.args[0][0].detail.column).to.equal(col);
              table._getRows().forEach(function(row) {
                expect(parseInt(row._getCellByIndex(0).dataset.dragged)).to.equal(0);
              });
              done();
            });
          });
        });
      });

      it('should drag the header cell to the left (sortable + sticky)', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.orderable.column.html'], function() {
          var col = table._getColumns()[1];
          table.on('coral-table:columndrag', eventSpy);
          table._elements.head.sticky = true;
          col.sortable = true;
          helpers.next(function() {
            dragTo(table._elements.head._elements.rows[0]._elements.headerCells[1].content, 0, 0);
            helpers.next(function() {
              expect(eventSpy.callCount).to.equal(1);
              expect(eventSpy.args[0][0].detail.column).to.equal(col);
              table._getRows().forEach(function(row) {
                expect(parseInt(row._getCellByIndex(0).dataset.dragged)).to.equal(0);
              });
              done();
            });
          });
        });
      });

      it('should drag the header cell to the right', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.orderable.column.html'], function() {
          var col = table._getColumns()[0];
          table.on('coral-table:columndrag', eventSpy);
          dragTo(table._elements.head._elements.rows[0]._elements.headerCells[0], 1);
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.column).to.equal(col);
            table._getRows().forEach(function(row) {
              expect(parseInt(row._getCellByIndex(1).dataset.dragged)).to.equal(1);
            });
            done();
          });
        });
      });

      it('should drag the header cell to the right (sticky)', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.orderable.column.html'], function() {
          var col = table._getColumns()[0];
          table.on('coral-table:columndrag', eventSpy);
          table._elements.head.sticky = true;
          helpers.next(function() {
            dragTo(table._elements.head._elements.rows[0]._elements.headerCells[0].content, 1);
            helpers.next(function() {
              expect(eventSpy.callCount).to.equal(1);
              expect(eventSpy.args[0][0].detail.column).to.equal(col);
              table._getRows().forEach(function(row) {
                expect(parseInt(row._getCellByIndex(1).dataset.dragged)).to.equal(1);
              });
              done();
            });
          });
        });
      });

      it('should drag the header cell to the right (sortable)', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.orderable.column.html'], function() {
          var col = table._getColumns()[0];
          table._elements.head.sticky = true;
          col.sortable = true;
          table.on('coral-table:columndrag', eventSpy);
          dragTo(table._elements.head._elements.rows[0]._elements.headerCells[0], 1);
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.column).to.equal(col);
            table._getRows().forEach(function(row) {
              expect(parseInt(row._getCellByIndex(1).dataset.dragged)).to.equal(1);
            });
            done();
          });
        });
      });

      it('should drag the header cell to the right (sortable + sticky)', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Coral.Table.orderable.column.html'], function() {
          table._elements.head.sticky = true;
          var col = table._getColumns()[0];
          col.sortable = true;
          table.on('coral-table:columndrag', eventSpy);
          helpers.next(function() {
            dragTo(table._elements.head._elements.rows[0]._elements.headerCells[0].content, 1);
            helpers.next(function() {
              expect(eventSpy.callCount).to.equal(1);
              expect(eventSpy.args[0][0].detail.column).to.equal(col);
              table._getRows().forEach(function(row) {
                expect(parseInt(row._getCellByIndex(1).dataset.dragged)).to.equal(1);
              });
              done();
            });
          });
        });
      });

      it('should scroll to the table right', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.orderable.column.html'], function() {
          var headerCell = table.head._elements.rows[0]._elements.headerCells[0];
          var container = table._elements.container;
          // setTimeout required else scrolling won't be effective
          setTimeout(function() {
            container.scrollLeft = 0;
            dragTo(headerCell, 1);
            helpers.next(function() {
              expect(headerCell).to.equal(table.head._elements.rows[0]._elements.headerCells[1]);
              expect(container.scrollLeft > 0).to.be.true;
              done();
            });
          }, 100);
        });
      });

      it('should scroll to the table left', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.orderable.column.html'], function() {
          var headerCell = table.head._elements.rows[0]._elements.headerCells[1];
          var container = table._elements.container;
          // setTimeout required else scrolling won't be effective
          setTimeout(function() {
            container.scrollLeft = 1000;
            var maxScrollLeft = container.scrollLeft;
            dragTo(headerCell, -1);
            helpers.next(function() {
              expect(headerCell).to.equal(table.head._elements.rows[0]._elements.headerCells[0]);
              expect(container.scrollLeft < maxScrollLeft).to.be.true;
              done();
            });
          }, 100);
        });
      });

      it('should scroll to the table right in sticky mode', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.sticky.orderable.column.html'], function() {
          var headerCell = table.head._elements.rows[0]._elements.headerCells[0];
          var container = table._elements.container;
          // setTimeout required else scrolling won't be effective
          setTimeout(function() {
            container.scrollLeft = 0;
            dragTo(headerCell.content, 1000);
            helpers.next(function() {
              expect(headerCell).to.equal(table.head._elements.rows[0]._elements.headerCells[1]);
              expect(container.scrollLeft > 0).to.be.true;
              done();
            });
          }, 100);
        });
      });

      it('should scroll to the table left in sticky mode', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.sticky.orderable.column.html'], function() {
          var headerCell = table.head._elements.rows[0]._elements.headerCells[1];
          var container = table._elements.container;
          // setTimeout required else scrolling won't be effective
          setTimeout(function() {
            container.scrollLeft = 1000;
            var maxScrollLeft = container.scrollLeft;
            dragTo(headerCell.content, -1);
            helpers.next(function() {
              expect(headerCell).to.equal(table.head._elements.rows[0]._elements.headerCells[0]);
              expect(container.scrollLeft < maxScrollLeft).to.be.true;
              done();
            });
          }, 100);
        });
      });

      it('should initialize the dragAction on the sticky header cells', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.orderable.column.html'], function() {
          table._elements.head.sticky = true;
          helpers.next(function() {
            table._elements.head._elements.rows[0]._getCells(['headerCells']).forEach(function(headerCell) {
              expect(headerCell.content.dragAction).to.be.not.undefined;
            });
            done();
          });
        });
      });
    });
  });
});
