describe('Coral.Table.Head', function() {
  'use strict';

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral.Table).to.have.property('Head');
    });
  });

  describe('attributes', function() {
    describe('#sticky', function() {
      it.skip('should add the sticky class and prepare the header cells', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.sticky.empty.html'], function() {
          var wait = table._wait;
          table._wait = 0;
          // Because of debouncing
          window.setTimeout(function() {
            helpers.next(function() {
              expect(table.classList.contains('coral-Table-wrapper--sticky')).to.be.true;
              table._elements.head._elements.rows[0]._getCells(['headerCells']).forEach(function(headerCell) {
                var computedStyle = window.getComputedStyle(headerCell);
                var cellWidth = Math.round(parseFloat(computedStyle.width));
                var cellPadding = Math.round(parseFloat(computedStyle.paddingLeft)) + Math.round(parseFloat(computedStyle.paddingRight));
                var borderRightWidth = Math.round(parseFloat(computedStyle.borderRightWidth));
                borderRightWidth = window.isNaN(borderRightWidth) ? 0 : borderRightWidth;
                expect(parseInt(headerCell._elements.content.style.width, 10)).to.equal(cellWidth + cellPadding + borderRightWidth);
                done();
              });
            });
          }, wait);
        });
      });

      it('should calculate head placeholder size if head is sticky', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.resize.html'], function() {
          var wait = table._wait;
          table._wait = 0;
          // Because of debouncing
          window.setTimeout(function() {
            var headHeight = 0;
            table._getRows(['head']).forEach(function(row, i) {
              // +1 pixel for the border between both header rows
              headHeight += row._elements.headerCells[0].content.clientHeight + (i > 0 ? 1 : 0);
            });
            expect(table._elements.head.divider).to.equal(Coral.Table.divider.CELL);
            expect(table._elements.head.sticky).to.be.true;
            expect(table._elements.container.style.marginTop).to.equal(headHeight + 'px');
            // Add 2 pixels for table border top and bottom
            headHeight += 2;
            expect(table._elements.container.style.height).to.equal('calc(100% - ' + headHeight + 'px)');
            done();
          }, wait);
        });
      });

      it.skip('should calculate the sticky headercells when table has empty columns', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.sticky.empty.html'], function() {
          var wait = table._wait;
          table._wait = 0;
          // Because of debouncing
          window.setTimeout(function() {
            helpers.next(function() {
              table._elements.head._elements.rows[0]._getCells(['headerCells']).forEach(function(headerCell) {
                var computedStyle = window.getComputedStyle(headerCell);
                var cellWidth = Math.round(parseFloat(computedStyle.width));
                var cellPadding = Math.round(parseFloat(computedStyle.paddingLeft)) + Math.round(parseFloat(computedStyle.paddingRight));
                var borderRightWidth = Math.round(parseFloat(computedStyle.borderRightWidth));
                borderRightWidth = window.isNaN(borderRightWidth) ? 0 : borderRightWidth;
                expect(parseInt(headerCell._elements.content.style.width, 10)).to.equal(cellWidth + cellPadding + borderRightWidth);
                done();
              });
            });
          }, wait);
        });
      });

      it('should scroll the sticky headercells when scrolling the table', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.sticky.html'], function() {
          table.style.width = '50px';
          var scrollLeft = 10;
          var headerCells = table._elements.head._elements.rows[0]._getCells(['headerCells']);
          headerCells.forEach(function(headerCell) {
            for (var i = 0; i < 10; i++) {
              headerCell.content.textContent += headerCell.content.textContent;
            }
          });

          table._elements.container.scrollLeft = scrollLeft;
          helpers.next(function() {
            headerCells.forEach(function(headerCell) {
              if (table._layoutStickyCellOnScroll) {
                var paddingLeft = Math.round(parseFloat(window.getComputedStyle(headerCell).paddingLeft));
                expect(headerCell._elements.content.style.marginLeft).to.equal('-' + (scrollLeft + paddingLeft) + 'px');
              }
            });
            done();
          });
        });
      });

      it('should not set a 0 width to the header cells if they are hidden', function(done) {
        var table = helpers.build(window.__html__['Coral.Table.sticky.hidden.html'], function() {
          var wait = table._wait;
          table._wait = 0;
          table.hidden = false;
          // Because of debouncing
          window.setTimeout(function() {
            var headerCells = table._elements.head._elements.rows[0]._getCells(['headerCells']);
            headerCells.forEach(function(headerCell) {
              expect(parseFloat(headerCell.style.minWidth) > 0).to.be.true;
            });
            done();
          }, wait);
        });
      });
    });

    describe('#divider', function() {
      it('should apply row divider', function() {
        var head = new Coral.Table.Head();
        head.divider = Coral.Table.divider.ROW;
        helpers.next(function() {
          expect(head.classList.contains('coral-Table-divider--row')).to.be.true;
          expect(head.classList.contains('coral-Table-divider--column')).to.be.false;
          expect(head.classList.contains('coral-Table-divider--cell')).to.be.false;
        });
      });

      it('should apply column divider', function() {
        var head = new Coral.Table.Body();
        head.divider = Coral.Table.divider.COLUMN;
        helpers.next(function() {
          expect(head.classList.contains('coral-Table-divider--column')).to.be.true;
          expect(head.classList.contains('coral-Table-divider--row')).to.be.false;
          expect(head.classList.contains('coral-Table-divider--cell')).to.be.false;
        });
      });

      it('should apply cell divider', function() {
        var head = new Coral.Table.Body();
        head.divider = Coral.Table.divider.CELL;
        helpers.next(function() {
          expect(head.classList.contains('coral-Table-divider--cell')).to.be.true;
          expect(head.classList.contains('coral-Table-divider--row')).to.be.false;
          expect(head.classList.contains('coral-Table-divider--column')).to.be.false;
        });
      });
    });
  });

  describe('a11y', function() {
    it('should set a11y attribute', function() {
      var row = new Coral.Table.Head();
      expect(row.getAttribute('role')).to.equal('rowgroup');
    });
  });
});
