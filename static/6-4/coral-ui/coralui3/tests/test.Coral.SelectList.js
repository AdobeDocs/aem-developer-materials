describe('Coral.SelectList', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('SelectList');
    });
  });

  describe('Instantiation', function() {
    it.skip('should be possible to clone using markup', function(done) {
      helpers.build(window.__html__['Coral.SelectList.base.html'], function(sl) {
        helpers.testComponentClone(sl, done);
      });
    });

    it.skip('should be possible to clone using js', function(done) {
      var sl = new Coral.SelectList();
      helpers.target.appendChild(sl);

      helpers.next(function() {
        helpers.testComponentClone(sl, done);
      });
    });
  });

  describe('Selection mixin tests', function() {
    helpers.testSelectionList(Coral.SelectList, Coral.SelectList.Item);
  });

  describe('API', function() {
    describe('#selectedItem', function() {
      it('should default to null', function(done) {
        helpers.build(window.__html__['Coral.SelectList.base.html'], function(el) {
          expect(el.selectedItem).to.be.null;
          expect(el.selectedItems.length).to.equal(0);
          done();
        });
      });

      it('should take the last selected if not multiple', function(done) {
        helpers.build(window.__html__['Coral.SelectList.doubleselected.html'], function(el) {
          var items = el.items.getAll();
          expect(el.multiple).to.be.false;
          expect(el.selectedItem).to.equal(items[2]);
          expect(el.selectedItems).to.deep.equal([items[2]]);
          expect(items[2].selected).to.be.true;

          // The items that are not the last selected will not be set to selected=false until
          // the next frame in polyfilled environments.
          helpers.next(function() {
            expect(items[2].selected).to.be.true;
            expect(items[2].hasAttribute('selected')).to.be.true;
            expect(items[0].hasAttribute('selected')).to.be.false;
            expect(items[0].selected).to.be.false;
            // checks again the items
            expect(el.selectedItem).to.equal(items[2]);
            expect(el.selectedItems).to.deep.equal([items[2]]);
            done();
          });
        });
      });

      it('should take the first selected with multiple', function(done) {
        helpers.build(window.__html__['Coral.SelectList.multiple.html'], function(el) {
          var items = el.items.getAll();
          expect(el.multiple).to.be.true;
          expect(el.selectedItem).to.equal(items[0]);
          expect(el.selectedItems).to.deep.equal([items[0], items[2]]);
          expect(items[0].selected).to.be.true;

          // The items that are not the last selected will not be set to selected=false until
          // the next frame in polyfilled environments.
          helpers.next(function() {
            expect(items[0].selected).to.be.true;
            expect(items[0].hasAttribute('selected')).to.be.true;
            expect(items[2].hasAttribute('selected')).to.be.true;
            expect(items[2].selected).to.be.true;
            // checks again the items
            expect(el.selectedItem).to.equal(items[0]);
            expect(el.selectedItems).to.deep.equal([items[0], items[2]]);
            done();
          });
        });
      });

      it('should read the selected from the markup', function(done) {
        helpers.build(window.__html__['Coral.SelectList.selected.html'], function(el) {
          expect(el.selectedItem).to.equal(el.items.getAll()[1]);
          done();
        });
      });
    });

    describe('#selectedItems', function() {});

    describe('#multiple', function() {});

    describe('#loading', function() {
      it('should show a loading indicator when set to true', function(done) {
        helpers.build(window.__html__['Coral.SelectList.base.html'], function(el) {
          el.loading = true;

          helpers.next(function() {
            var indicator = el.querySelector('.coral3-SelectList-loading');
            expect(indicator).to.not.equal(null);
            done();
          });
        });
      });

      it('should hide a loading indicator when set to false', function(done) {
        helpers.build(window.__html__['Coral.SelectList.base.html'], function(el) {
          el.loading = true;

          helpers.next(function() {
            el.loading = false;

            helpers.next(function() {
              var indicator = el.querySelector('.coral3-SelectList-loading');
              expect(indicator).to.equal(null);
              done();
            });
          });
        });
      });

      it('should always add the loading at the end', function(done) {
        helpers.build(window.__html__['Coral.SelectList.base.html'], function(el) {
          el.loading = true;

          helpers.next(function() {
            el.loading = false;

            helpers.next(function() {
              var indicator = el.querySelector('.coral3-SelectList-loading');
              expect(indicator).to.equal(null);

              el.items.add({
                value: 'other',
                content: {
                  innerHTML: 'Other'
                }
              });

              el.loading = true;

              helpers.next(function() {

                var indicator = el.children[el.children.length - 1];

                expect(indicator.classList.contains('coral3-SelectList-loading')).to.be.true;
                done();
              });
            });
          });
        });
      });
    });

    describe('#items', function() {});

    describe('#groups', function() {
      var selectList;

      beforeEach(function(done) {
        helpers.build(window.__html__['Coral.SelectList.groups.html'], function(element) {
          selectList = element;
          done();
        });
      });

      it('retrieves all groups', function() {
        var groups = selectList.groups.getAll();
        expect(groups.length).to.equal(2);
      });

      it('adds a group instance', function() {
        var group = new Coral.SelectList.Group();
        group.label = 'Test group';

        selectList.groups.add(group);

        var groups = Array.prototype.slice.call(selectList.getElementsByTagName('coral-selectlist-group'));
        expect(groups.length).to.equal(3);
        expect(groups[2].label).to.equal('Test group');
      });

      it('adds a group using a config object', function() {
        selectList.groups.add({
          label: 'Test group'
        });

        var groups = Array.prototype.slice.call(selectList.getElementsByTagName('coral-selectlist-group'));
        expect(groups.length).to.equal(3);
        expect(groups[2].label).to.equal('Test group');
      });

      it('removes a group', function() {
        var group = selectList.groups.getAll()[0];
        selectList.groups.remove(group);

        var groups = Array.prototype.slice.call(selectList.getElementsByTagName('coral-selectlist-group'));
        expect(groups.length).to.equal(1);
        expect(group.parentNode).to.be.null;
      });

      it('clears all groups', function() {
        selectList.groups.clear();

        var groups = Array.prototype.slice.call(selectList.getElementsByTagName('coral-selectlist-group'));
        expect(groups.length).to.equal(0);
      });
    });

    describe('#focus()', function() {
      it('should focus the first item when no selection is available', function(done) {
        helpers.build(window.__html__['Coral.SelectList.base.html'], function(el) {
          expect(document.activeElement).not.to.equal(el);

          el.focus();

          expect(document.activeElement).to.equal(el.items.first(), 'Focus should move to the first item');

          done();
        });
      });

      it('should not shift focus if already inside the component', function(done) {
        helpers.build(window.__html__['Coral.SelectList.base.html'], function(el) {
          expect(document.activeElement).not.to.equal(el);

          // we focus the last item to shift focus into the component
          el.items.last().focus();

          expect(document.activeElement).to.equal(el.items.last(), 'Focus should move inside the component');

          el.focus();

          expect(document.activeElement).to.equal(el.items.last(), 'Focus should not be reset');

          done();
        });
      });

      it('should should move the focus to the selected item', function(done) {
        helpers.build(window.__html__['Coral.SelectList.selected.html'], function(el) {
          expect(document.activeElement).not.to.equal(el);

          el.focus();

          expect(document.activeElement).to.equal(el.selectedItem, 'Focus should move to the selected item');
          expect(el.selectedItem).not.to.equal(el.items.first(), 'Select item should not be the first item');

          done();
        });
      });
    });
  });

  describe('Events', function() {

    var el;
    var item1;
    var item2;
    var item3;

    beforeEach(function() {
      el = new Coral.SelectList();
      helpers.target.appendChild(el);

      item1 = new Coral.SelectList.Item();
      item1.label = 'Item 1';

      item2 = new Coral.SelectList.Item();
      item2.label = 'Item 2';

      item3 = new Coral.SelectList.Item();
      item3.label = 'Item 3';
    });

    afterEach(function() {
      helpers.target.removeChild(el);
      el = item1 = item2 = item3 = null;
    });

    describe('#coral-selectlist:change', function() {});

    describe('#coral-selectlist:scrollbottom', function() {
      it('should trigger a scrollbottom event when user scrolls to the bottom of the list', function(done) {
        for (var i = 0; i < 50; i++) {
          el.items.add({
            value: 'value' + i,
            content: {
              innerHTML: 'content' + i
            }
          });
        }

        // Give the newly-added items time to render.
        helpers.next(function() {
          var spy = sinon.spy();
          var clock = sinon.useFakeTimers();

          el.on('coral-selectlist:scrollbottom', spy);

          el.scrollTop = 10000;
          el.trigger('scroll');
          clock.tick(1000); // Fast-forward past scroll debounce.

          expect(spy.callCount).to.equal(1);

          // If the user scrolls again but doesn't scroll outside of the bottom threshold
          // distance it should still trigger another scrollbottom event.
          el.scrollTop -= 10;
          el.trigger('scroll');
          clock.tick(1000); // Fast-forward past scroll debounce.

          expect(spy.callCount).to.equal(2);

          clock.restore();
          done();
        });
      });
    });
  });

  describe('User Interaction', function() {
    
    it('should focus the item which contains text starting with the letter O', function(done) {
      helpers.build(window.__html__['Coral.SelectList.base.html'], function(el) {
        var lastItem = el.items.last();
        el._onKeyPress({which: 'O'.charCodeAt(0)});
        
        // Key press search is implemented with a 1 sec timeout
        setTimeout(function() {
          expect(lastItem.getAttribute('tabindex')).to.equal('0');
          expect(document.activeElement).to.equal(lastItem);
          done();
        }, 1000);
      });
    });
    // @todo: test focus of initial state
    // @todo: test focus of an empty list
    // @todo: test focus of a list with a selected item
    // @todo: focus on a hidden selected item
    // @todo: add a test for focus() and no children
  });
});
