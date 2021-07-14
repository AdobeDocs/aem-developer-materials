describe('Coral.Masonry', function() {
  'use strict';

  // increased timeout due to animations
  this.timeout(5000);

  var m;

  afterEach(function() {
    m = null;
  });

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Masonry');
    });
  });

  function testInstance(masonry, expectedLayout, done) {
    expect(masonry.classList.contains('coral3-Masonry')).to.be.true;

    helpers.next(function() { // sync
      expect(masonry.getAttribute('layout')).to.equal(expectedLayout);
      done();
    });
  }

  describe('Instantiation', function() {

    it('should be possible using new', function(done) {
      m = new Coral.Masonry();
      m.layout = 'variable';
      testInstance(m, 'variable', done);
    });

    it('should be possible using createElement', function(done) {
      m = document.createElement('coral-masonry');
      m.layout = 'variable';
      testInstance(m, 'variable', done);
    });

    it('should be possible using markup', function(done) {
      helpers.build(window.__html__['Coral.Masonry.variable.empty.html'], function(m) {
        testInstance(m, 'variable', done);
      });
    });
  });

  describe('API', function() {

    beforeEach(function() {
      m = new Coral.Masonry();
      helpers.target.appendChild(m);
    });

    describe('#layout', function() {

      function createLayout() {
        return function() {
          this.layout = sinon.spy();
          this.destroy = sinon.spy();
        };
      }

      var defaultSpy;

      before(function() {
        Coral.Masonry.registerLayout('layout1', createLayout());
        Coral.Masonry.registerLayout('layout2', createLayout());
        defaultSpy = sinon.spy(Coral.Masonry._layouts, Object.keys(Coral.Masonry._layouts)[0]);
      });

      beforeEach(function() {
        defaultSpy.reset();
      });

      after(function() {
        delete Coral.Masonry._layouts.layout1;
        delete Coral.Masonry._layouts.layout2;
        defaultSpy.restore();
      });

      it('should use the first layout by default', function(done) {
        var firstLayoutName = Object.keys(Coral.Masonry._layouts)[0];
        expect(firstLayoutName).to.be.a('string');

        expect(m.layout).to.equal(firstLayoutName);
        done();
      });

      it('should not initialize the default layout if it is not used', function(done) {
        m.layout = 'layout1';

        helpers.masonryLayouted(m, function() {
          expect(defaultSpy).to.not.have.been.called;
          done();
        });
      });

      it('should be set and reflected', function(done) {
        m.layout = 'layout1';
        expect(m.layout).to.equal('layout1');

        helpers.next(function() { // sync
          expect(m.getAttribute('layout')).to.equal('layout1');
          done();
        });
      });

      it('should be set and reflected', function(done) {
        m.layout = 'layout1';
        expect(m.layout).to.equal('layout1');

        helpers.next(function() { // sync
          expect(m.getAttribute('layout')).to.equal('layout1');
          done();
        });
      });

      it('should not change the layout if it does not exist', function() {
        m.layout = 'layout1';
        m.layout = 'non-existing';
        expect(m.layout).to.equal('layout1');
      });

      it('should schedule a layout after the layout name has been changed', function(done) {
        m.layout = 'layout1';
        helpers.next(function() { // sync
          expect(m._layout.layout).to.be.called;
          done();
        });
      });

      it('should destory the previous layout when the layout is changed', function(done) {
        m.layout = 'layout1';
        helpers.next(function() { // sync
          var oldLayout = m._layout;
          m.layout = 'layout2';
          helpers.next(function() { // sync
            expect(oldLayout.destroy).to.be.called;
            done();
          });
        });
      });

      it('should even set the layout if the custom element upgrades before the layouts have been registered', function(done) {
        // Simulate immediate upgrade. In this case the layouts property isn't set yet.
        var layouts = Coral.Masonry._layouts;
        delete Coral.Masonry._layouts;
        m.layout = 'layout1';

        Coral.Masonry._layouts = layouts;
        window.setTimeout(function() {
          expect(m.layout).to.equal('layout1');
          done();
        }, 0);
      });

    });

    describe('#items', function() {

      var item1, item2;

      beforeEach(function() {
        item1 = new Coral.Masonry.Item();
        item2 = new Coral.Masonry.Item();
      });

      it('should be read-only', function() {
        var items = m.items;
        m.items = [item1, item2];
        expect(m.items).to.deep.equal(items);
      });

      describe('#add', function() {

        it('should add item to list and children', function() {
          m.items.add(item1);
          expectItems([item1]);

          m.items.add(item2);
          expectItems([item1, item2]);
        });

        it('should move the item to the end of the list if it is already in the list', function() {
          m.items.add(item1);
          m.items.add(item2);
          m.items.add(item1);
          expectItems([item2, item1]);
        });

        it('should trigger coral-collection:add event', function(done) {
          var eventSpy = sinon.spy();
          m.on('coral-collection:add', eventSpy);

          m.items.add(item1);

          helpers.next(function() { // polyfill attachedCallback
            expect(eventSpy).to.be.calledOnce;
            expect(eventSpy.args[0][0].detail.item).to.equal(item1);
            done();
          });
        });

        it('should not trigger coral-collection:add/remove event if item is just moved', function(done) {
          m.items.add(item1);
          m.items.add(item2);

          helpers.next(function() { // polyfill attachedCallback
            var eventSpy = sinon.spy();
            m.on('coral-collection:add', eventSpy);
            m.on('coral-collection:remove', eventSpy);

            m.items.add(item1); // move item

            helpers.next(function() { // TODO find out why this is necessary
              helpers.transitionEnd(item1, function() {
                expect(eventSpy).to.be.not.called;
                done();
              });
            });
          });
        });

      });

      describe('#remove', function() {

        it('should remove the given item', function() {
          m.items.add(item1);
          m.items.add(item2);

          m.items.remove(item1);
          expectItems([item2]);

          m.items.remove(item2);
          expectItems([]);
        });

        it('should trigger coral-collection:remove event', function(done) {
          m.items.add(item1);

          helpers.next(function() { // polyfill attachedCallback
            var eventSpy = sinon.spy();
            m.on('coral-collection:remove', eventSpy);

            m.items.remove(item1);

            helpers.next(function() { // TODO find out why this is necessary
              helpers.transitionEnd(item1, function() {
                expect(eventSpy).to.be.calledOnce;
                expect(eventSpy.args[0][0].detail.item).to.equal(item1);
                done();
              });
            });
          });
        });

      });

      describe('#clear', function() {

        it('should remove all items', function() {
          m.items.add(item1);
          m.items.add(item2);
          m.items.clear();
          expectItems([]);
        });

        it('should not remove non-item elements', function() {
          var div = document.createElement('div');
          m.appendChild(div);
          m.items.add(item1);
          m.items.clear();
          expect(div.parentNode).to.equal(m);
        });

      });

      describe('#getAll', function() {

        it('should return all items', function() {
          m.appendChild(document.createTextNode('text'));
          m.appendChild(document.createElement('div'));
          m.appendChild(item1);
          m.appendChild(item2);

          expect(m.items.getAll()).to.deep.equal([item1, item2]);
        });

      });

      function expectItems(items) {
        expect(m.items.getAll()).to.deep.equal(items);
        expect(m.items.getAll().filter(function(item) {
          return !item._removing;
        })).to.deep.equal(items);
      }

    });

    describe('#selectedItem', function() {

      var item1, item2;

      beforeEach(function() {
        item1 = new Coral.Masonry.Item();
        item2 = new Coral.Masonry.Item();
        m.appendChild(item1);
        m.appendChild(item2);
      });

      it('should be read-only', function() {
        var selectedItem = m.selectedItem;
        m.selectedItem = item1;
        expect(m.selectedItem).to.equal(selectedItem);
      });

      it('should return the selected item', function() {
        item2.selected = true;

        expect(m).to.have.property('selectedItem', item2);
      });

      it('should return the first selected item', function() {
        item1.selected = true;
        item2.selected = true;

        expect(m).to.have.property('selectedItem', item1);
      });

      it('should return null if there are no items selected', function() {
        expect(m).to.have.property('selectedItem', null);
      });

    });

    describe('#selectedItems', function() {

      var item1, item2, item3;

      beforeEach(function() {
        item1 = new Coral.Masonry.Item();
        item2 = new Coral.Masonry.Item();
        item3 = new Coral.Masonry.Item();
        m.appendChild(item1);
        m.appendChild(item2);
        m.appendChild(item3);
      });

      it('should be read-only', function() {
        var selectedItems = m.selectedItems.slice();
        m.selectedItems = [item1];
        expect(m.selectedItems).to.deep.equal(selectedItems);
      });

      it('should return all selected items', function() {
        item1.selected = true;
        item2.selected = true;

        expect(m.selectedItems).to.deep.equal([item1, item2]);
      });

      it('should return an empty array if there are no items selected', function() {
        expect(m.selectedItems).to.deep.equal([]);
      });

    });

    describe('#selectAll', function() {

      it('should select all items', function() {
        var item1 = new Coral.Masonry.Item();
        var item2 = new Coral.Masonry.Item();
        m.appendChild(item1);
        m.appendChild(item2);

        m.selectAll();

        expect(item1).to.have.property('selected', true);
        expect(item2).to.have.property('selected', true);
      });

    });

    describe('#deselectAll', function() {

      it('should deselect all items', function() {
        var item1 = new Coral.Masonry.Item();
        var item2 = new Coral.Masonry.Item();
        m.appendChild(item1);
        m.appendChild(item2);
        item1.selected = true;
        item2.selected = true;

        m.deselectAll();

        expect(item1).to.have.property('selected', false);
        expect(item2).to.have.property('selected', false);
      });

    });

    describe('#orderable', function() {

      var item1, item2;

      beforeEach(function() {
        item1 = new Coral.Masonry.Item();
        item1.setAttribute('coral-masonry-draghandle', '');
        item2 = new Coral.Masonry.Item();
        item2.setAttribute('coral-masonry-draghandle', '');
        m.appendChild(item1);
        m.appendChild(item2);
      });

      it('should be disabled by default', function() {
        expect(m).to.have.property('orderable', false);
      });

      it('should allow to enable drag & drop for all items', function(done) {
        m.orderable = true;

        helpers.next(function() { // sync
          expectDraggable(item1, true);
          expectDraggable(item2, true);
          done();
        });
      });

      it('should allow to disable drag & drop for all items', function(done) {
        m.orderable = true;

        helpers.next(function() { // sync
          m.orderable = false;

          helpers.next(function() { // sync
            expectDraggable(item1, false);
            expectDraggable(item2, false);
            done();
          });
        });
      });

    });

    function expectDraggable(el, draggable) {
      if (draggable) {
        expect(el.classList.contains('u-coral-openHand')).to.be.true;
      }
      else {
        expect(el.classList.contains('u-coral-openHand')).to.be.false;
      }
    }

    describe('#spacing', function() {

      it('should allow to set spacing', function(done) {
        var spacing = 123;

        m.spacing = spacing;
        m.layout = 'variable';
        m.setAttribute('columnwidth', 100);
        m.style.width = '500px'; // fails on the console without

        var item = new Coral.Masonry.Item();
        item.textContent = 'text';
        m.appendChild(item);

        helpers.masonryLayouted(m, function() {
          var masonryRect = m.getBoundingClientRect();
          var itemRect = item.getBoundingClientRect();

          expect(itemRect.left - masonryRect.left).to.equal(spacing);
          expect(masonryRect.right - itemRect.right).to.equal(spacing);
          expect(itemRect.top - masonryRect.top).to.equal(spacing);
          expect(masonryRect.bottom - Math.ceil(itemRect.bottom)).to.equal(spacing);

          done();
        });
      });
    });
  });

  describe('User Interaction', function() {
    describe('#home', function() {
      it('should go to the first visual item', function(done) {
        helpers.build(window.__html__['Coral.Masonry.fixed-centered.9-items.html'], function(el) {

          expect(el.items.length).not.to.equal(0, 'Masonry should have items');
          expect(el.contains(document.activeElement)).to.equal(false, 'Focus is not inside the masonry');

          // we wait for the columns to appear
          helpers.masonryLayouted(el, function() {
            expect(el._layout._columns.length).not.to.equal(1, 'More than one column should be available');

            // we focus the last element so that the keypress would move the focus to the first item
            el.items.last().focus();

            helpers.keypress('home', document.activeElement);
            helpers.expectActive(el.items.first());

            done();
          });
        });
      });

      it('should go to first item where there is only 1 item', function(done) {
        helpers.build(window.__html__['Coral.Masonry.fixed-centered.1-items.html'], function(el) {
          expect(el.items.length).to.equal(1, 'Masonry should only have 1 item');
          expect(el.contains(document.activeElement)).to.equal(false, 'Focus is not inside the masonry');

          // we wait for the columns to appear
          helpers.masonryLayouted(el, function() {
            expect(el._layout._columns.length).not.to.equal(1, 'More than one column should be available');

            // we focus the last element so that the keypress would move the focus to the first item
            el.items.first().focus();

            helpers.keypress('home', document.activeElement);
            helpers.expectActive(el.items.first());

            done();
          });
        });
      });

      it.skip('should not focus any item when the masonry is empty', function(done) {
        helpers.build(window.__html__['Coral.Masonry.variable.empty.html'], function(el) {
          expect(el.items.length).to.equal(0, 'Masonry should be empty');
          expect(el.contains(document.activeElement)).to.equal(false, 'Focus is not inside the masonry');

          // we wait for the columns to appear
          helpers.masonryLayouted(el, function() {
            el.focus();

            helpers.keypress('home', el);
            helpers.expectActive(document.body);

            done();
          });
        });
      });
    });

    describe('#end', function() {
      it('should go to the last visual item', function(done) {
        helpers.build(window.__html__['Coral.Masonry.fixed-centered.9-items.html'], function(el) {
          expect(el.items.length).not.to.equal(0, 'Masonry should have items');
          expect(el.contains(document.activeElement)).to.equal(false, 'Focus is not inside the masonry');

          // we wait for the layout to occur
          helpers.masonryLayouted(el, function() {
            // we focus the last element so that the keypress would move the focus to the first item
            el.items.first().focus();

            var lastItem;
            var columns = el._layout._columns;
            expect(columns.length).not.to.equal(1, 'More than one column should be available');

            // we select the last item of a column that has items
            for (var i = columns.length - 1; i > -1; i--) {
              if (columns[i].items.length > 0) {
                lastItem = columns[i].items[columns[i].items.length - 1];
                break;
              }
            }

            helpers.keypress('end', document.activeElement);
            helpers.expectActive(lastItem);

            done();
          });
        });
      });

      it('should go to first item where there is only 1 item', function(done) {
        helpers.build(window.__html__['Coral.Masonry.fixed-centered.1-items.html'], function(el) {
          expect(el.items.length).not.to.equal(0, 'Masonry should have items');
          expect(el.contains(document.activeElement)).to.equal(false, 'Focus is not inside the masonry');

          // we wait for the layout to occur
          helpers.masonryLayouted(el, function() {
            // we focus the last element so that the keypress would move the focus to the first item
            el.items.first().focus();

            var lastItem;
            var columns = el._layout._columns;
            expect(columns.length).not.to.equal(1, 'More than one column should be available');

            // we select the last item of a column that has items
            for (var i = columns.length - 1; i > -1; i--) {
              if (columns[i].items.length > 0) {
                lastItem = columns[i].items[columns[i].items.length - 1];
                break;
              }
            }

            helpers.keypress('end', document.activeElement);
            helpers.expectActive(lastItem);

            done();
          });
        });
      });

      it.skip('should not focus any item when the masonry is empty', function(done) {
        helpers.build(window.__html__['Coral.Masonry.variable.empty.html'], function(el) {
          expect(el.items.length).to.equal(0, 'Masonry should be empty');
          expect(el.contains(document.activeElement)).to.equal(false, 'Focus is not inside the masonry');

          // we wait for the columns to appear
          helpers.masonryLayouted(el, function() {
            el.focus();

            helpers.keypress('end', el);
            helpers.expectActive(document.body);

            done();
          });
        });
      });
    });

    // TODO: CUI-5210 failing every now and then in the TLB
    describe.skip('reorder with drag & drop', function() {
      beforeEach(function(done) {
        helpers.build(window.__html__['Coral.Masonry.variable.3-columns-9-items.html'], function(m2) {
          m = m2;
          m.items.getAll().forEach(function(item) {
            item.setAttribute('coral-masonry-draghandle');
          });
          m.orderable = true;
          helpers.next(function() { // sync
            done();
          });
        });
      });

      it('should allow to drag the last item to the first position', function(done) {
        var itemsBefore = m.items.getAll();
        var firstItem = itemsBefore[0];
        var lastItem = itemsBefore[itemsBefore.length - 1];
        var start = center(lastItem.getBoundingClientRect());
        var end = center(firstItem.getBoundingClientRect());
        var oldBeforeItem = itemsBefore[itemsBefore.length - 2];

        var eventSpy = sinon.spy();
        m.on('coral-masonry:order', eventSpy);

        helpers.mockMouse([
          {
            type: 'down',
            clientX: start.x,
            clientY: start.y
          },
          {
            type: 'move',
            startX: start.x,
            startY: start.y,
            endX: end.x,
            endY: end.y,
            duration: 1000
          },
          {
            type: 'up',
            clientX: end.x,
            clientY: end.y
          }
        ], function() {
          var expectedItemsAfter = itemsBefore.slice(); // copy
          expectedItemsAfter.unshift(lastItem);
          expectedItemsAfter.pop();

          expect(eventSpy.callCount).to.equal(1);
          var eventDetail = eventSpy.args[0][0].detail;
          expect(eventDetail.item).to.equal(lastItem);
          expect(eventDetail.oldBefore).to.equal(oldBeforeItem);
          expect(eventDetail.before).to.equal(null);

          expect(m.items.getAll()).to.deep.equal(expectedItemsAfter);
          done();
        });
      });

      it('should allow to drag the first item to the last position', function(done) {
        var itemsBefore = m.items.getAll();
        var firstItem = itemsBefore[0];
        var lastItem = itemsBefore[itemsBefore.length - 1];
        var start = center(firstItem.getBoundingClientRect());
        var end = center(lastItem.getBoundingClientRect());

        var eventSpy = sinon.spy();
        m.on('coral-masonry:order', eventSpy);

        helpers.mockMouse([
          {
            type: 'down',
            clientX: start.x,
            clientY: start.y
          },
          {
            type: 'move',
            startX: start.x,
            startY: start.y,
            endX: end.x,
            endY: end.y,
            duration: 1000
          },
          {
            type: 'up',
            clientX: end.x,
            clientY: end.y
          }
        ], function() {
          var expectedItemsAfter = itemsBefore.slice(); // copy
          expectedItemsAfter.push(firstItem);
          expectedItemsAfter.shift();

          expect(eventSpy.callCount).to.equal(1);
          var eventDetail = eventSpy.args[0][0].detail;
          expect(eventDetail.item).to.equal(firstItem);
          expect(eventDetail.oldBefore).to.equal(null);
          expect(eventDetail.before).to.equal(lastItem);

          expect(m.items.getAll()).to.deep.equal(expectedItemsAfter);
          done();
        });
      });

      function center(rect) {
        return {
          x: rect.left + Math.round(rect.width / 2),
          y: rect.top + Math.round(rect.height / 2)
        };
      }

      // TODO: CUI-5210 failing every now and then in the TLB
      it.skip('should transition item to the final position', function(done) {
        var itemsBefore = m.items.getAll();
        var firstItem = itemsBefore[0];
        var lastItem = itemsBefore[itemsBefore.length - 1];
        var start = center(firstItem.getBoundingClientRect());
        var end = center(lastItem.getBoundingClientRect());

        helpers.mockMouse([
          {
            type: 'down',
            clientX: start.x,
            clientY: start.y
          },
          {
            type: 'move',
            startX: start.x,
            startY: start.y,
            endX: end.x + 100,
            endY: end.y,
            duration: 500
          },
          {
            type: 'up',
            clientX: end.x,
            clientY: end.y
          }
        ], function() {
          var rects = [];
          var intervalId = window.setInterval(function() {
            rects.push(firstItem.getBoundingClientRect());
          }, 50);

          helpers.transitionEnd(firstItem, function() {
            window.clearInterval(intervalId);

            // Check if item was transitioned
            expect(rects).to.have.length.above(5);
            for (var i = 1; i < rects.length; i++) {
              expect(rects[i].left).to.be.below(rects[i - 1].left);
            }
            done();
          });
        });
      });

    });
  });

  describe('Events', function() { });

  describe('Implementation Details', function() {

    describe('Accessibility', function() {

      beforeEach(function(done) {
        helpers.build(window.__html__['Coral.Masonry.variable.3-columns-9-items.html'], function(m2) {
          m = m2;
          done();
        });
      });

      it('should only be the first item tabbable by default', function() {
        expectOnlyToBeTabbable(0);
      });

      it('should make the last focused item tabbable', function() {
        helpers.focus(m.items.getAll()[3]);
        expectOnlyToBeTabbable(3);
      });

      function expectOnlyToBeTabbable(expectedFocusedIndex) {
        expect(m.hasAttribute('tabindex')).to.be.false;

        var items = m.items.getAll();
        for (var i = 0; i < items.length; i++) {
          expect(items[i].getAttribute('tabindex')).to.equal((i === expectedFocusedIndex) ? '0' : '-1');
        }
      }

      it('should focus the next item if the currently focused item is removed', function(done) {
        var item1 = m.items.getAll()[1];
        var item2 = m.items.getAll()[2];

        helpers.focus(item1);
        helpers.expectActive(item1);

        item1.remove();
        expect(m.items.getAll()[1]).to.equal(item2);

        helpers.masonryLayouted(m, function() {
          helpers.expectActive(item2);
          done();
        });
      });

      it('should focus the previous item if the currently focused item which is the last is removed', function(done) {
        var item1 = m.items.getAll()[7];
        var item2 = m.items.getAll()[8];
        expect(item2).to.equal(m.items.getAll()[m.items.getAll().length - 1]);

        helpers.focus(item2);
        helpers.expectActive(item2);

        item2.remove();

        helpers.masonryLayouted(m, function() {
          helpers.expectActive(item1);
          done();
        });
      });

      it('should not try to get back lost focus', function(done) {
        var item = m.items.getAll()[0];
        helpers.focus(item);
        document.activeElement.blur();
        helpers.expectActive(document.body);

        // this would get back the focus if the implementation was wrong
        m._scheduleLayout('test');

        helpers.masonryLayouted(m, function() {
          helpers.expectActive(document.body);
          done();
        });
      });
    });

    describe('class is-loaded', function() {

      beforeEach(function() {
        m = new Coral.Masonry();
        m.layout = 'variable';
        m.setAttribute('columnwidth', 100);
        helpers.target.appendChild(m);
      });

      // Skipped until CUI-5682 is fixed
      it.skip('should be added after two frames if there are no images', function(done) {
        expect(m._loaded).to.equal(false);
        expect(m.classList.contains('is-loaded')).to.be.false;

        // Two helpers.next are required because updateLoaded is called in the next frame after the element has been attached
        helpers.next(function() {
          helpers.next(function() {
            expect(m._loaded).to.equal(true);
            expect(m.classList.contains('is-loaded')).to.be.true;

            done();
          });
        });
      });

      // Skipped until CUI-5682 is fixed
      it.skip('should be added after all images have been loaded', function(done) {
        var t = document.createElement('div');
        t.innerHTML = window.__html__['Coral.Masonry.Item.image.html'];
        var item = t.firstElementChild;
        m.appendChild(item);

        expect(m.classList.contains('is-loaded')).to.be.false;

        var img = item.querySelector('img');
        img.src += '?ck=' + Date.now();
        img.onload = function() {
          helpers.masonryLayouted(m, function() {
            expect(m.classList.contains('is-loaded')).to.be.true;
            done();
          });
        };
      });

      // Skipped until CUI-5682 is fixed
      it.skip('should be added if the images cannot be loaded', function(done) {
        m.addEventListener('error', function() {
          // TODO improve in firefox
          helpers.masonryLayouted(m, function() {
            expect(m.classList.contains('is-loaded')).to.be.true;
            done();
          });
        }, true);

        var t = document.createElement('div');
        t.innerHTML = window.__html__['Coral.Masonry.Item.broken-image.html'];
        var item = t.firstElementChild;
        m.appendChild(item);
      });
    });

    describe('resizable container', function() {
      var container;

      beforeEach(function(done) {
        helpers.build(window.__html__['Coral.Masonry.container.html'], function(el) {
          container = el;
          done();
        });
      });

      it('should resize the masonry when the container changes its width', function(done) {
        m = container.querySelector('coral-masonry');
        var widthBefore = m.getBoundingClientRect().width;
        container.style.width = '500px';

        helpers.masonryLayouted(m, function() {
          expect(m.getBoundingClientRect().width).to.not.equal(widthBefore);
          done();
        });
      });
    });

    describe('hidden container', function() {
      var container;

      beforeEach(function(done) {
        helpers.build(window.__html__['Coral.Masonry.hidden-container.html'], function(el) {
          container = el;
          expect(getComputedStyle(container).display).to.equal('none');
          done();
        });
      });

      it('should resize the masonry when the container becomes visible', function(done) {
        m = container.querySelector('coral-masonry');
        var heightBefore = m.getBoundingClientRect().height;
        container.style.display = 'block';

        helpers.masonryLayouted(m, function() {
          expect(m.getBoundingClientRect().height).to.be.above(heightBefore);
          done();
        });
      });
    });

    describe('changing items', function() {
      var firstItem;
      var scheduleLayoutSpy;

      before(function() {
        scheduleLayoutSpy = sinon.spy(Coral.Masonry.prototype, '_scheduleLayout'); // before bind() happens
      });

      beforeEach(function(done) {
        helpers.build(window.__html__['Coral.Masonry.variable.3-columns-9-items.html'], function(m2) {
          m = m2;
          firstItem = m.items.getAll()[0];
          done();
        });
      });

      after(function() {
        scheduleLayoutSpy.restore();
      });

      it('should relayout when the text of an item changes', function(done) {
        scheduleLayoutSpy.reset();
        firstItem.content.firstChild.data += ' ... some text which is definitely longer then the column width';
        helpers.next(function() { // observer callback
          expect(scheduleLayoutSpy).to.be.called;
          done();
        });
      });

      it('should relayout when the children of an item change', function(done) {
        scheduleLayoutSpy.reset();
        var div = document.createElement('div');
        div.style.height = '100px';
        firstItem.appendChild(div);
        helpers.next(function() { // observer callback
          expect(scheduleLayoutSpy).to.be.called;
          done();
        });
      });

      it('should relayout when an item becomes hidden', function(done) {
        scheduleLayoutSpy.reset();
        firstItem.hide();
        helpers.next(function() { // observer callback
          expect(scheduleLayoutSpy).to.be.called;
          done();
        });
      });

      it('should relayout when an item becomes visible again', function(done) {
        firstItem.hide();
        Coral.commons.transitionEnd(m, function() {
          scheduleLayoutSpy.reset();
          firstItem.show();
          helpers.next(function() { // observer callback
            expect(scheduleLayoutSpy).to.be.called;
            done();
          });
        });
      });

      // Skipped until CUI-5682 is fixed
      it.skip('should not relayout when an item changes its position', function(done) {
        // After two frames the is-loaded class should be set and the DOM should be stable (see also is-loaded tests)
        helpers.next(function() {
          helpers.next(function() {
            expect(m.classList.contains('is-loaded')).to.be.true;

            expect(m._layoutScheduled).to.equal(false);

            scheduleLayoutSpy.reset();
            firstItem.style.left = '100px';
            firstItem.style.top = '100px';
            firstItem.style.transform = 'translate(100px, 100px)';

            m._observer.takeRecords(); // ignore the .css() call above

            helpers.next(function() { // wait until schedule would normally have been called
              expect(scheduleLayoutSpy).to.not.be.called;
              done();
            });
          });
        });
      });
    });
  });
});
