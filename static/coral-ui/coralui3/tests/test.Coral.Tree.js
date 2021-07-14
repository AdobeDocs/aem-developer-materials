describe('Coral.Tree', function() {
  'use strict';


  // Assert whether an item is properly active or inactive.
  var assertActiveness = function(item, isSelected, isExpanded) {

    var header = item._elements.header;
    var subTree = item._elements.subTreeContainer;

    if (isSelected) {
      expect(item.classList.contains('is-selected')).to.be.true;
      expect(item.getAttribute('aria-selected')).to.equal('true');
    }
    else {
      expect(item.classList.contains('is-selected')).to.be.false;
      expect(item.getAttribute('aria-selected')).to.equal('false');
    }

    if (isExpanded) {
      expect(header.getAttribute('aria-expanded')).to.equal('true');
      expect(subTree.getAttribute('aria-hidden')).to.equal('false');
    }
    else {
      expect(header.getAttribute('aria-expanded')).to.equal('false');
      expect(subTree.getAttribute('aria-hidden')).to.equal('true');
    }
  };

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Tree');
      expect(Coral.Tree).to.have.property('Item');
      expect(Coral.Tree.Item).to.have.property('Content');
    });
  });

  describe('Instantiation', function() {
    it('should be possible to clone using markup', function() {
      helpers.cloneComponent(window.__html__['Coral.Tree.base.html']);
    });

    it('should be possible to clone using js', function(done) {
      var el = new Coral.Tree();
      helpers.target.appendChild(el);

      helpers.next(function() {
        helpers.testComponentClone(el, done);
      });
    });
  });

  describe('Variants', function() {
    it('Variants should be defined', function() {
      expect(Coral.Tree.Item.variant).to.exist;
      expect(Coral.Tree.Item.variant.LEAF).to.equal('leaf');
      expect(Coral.Tree.Item.variant.DRILLDOWN).to.equal('drilldown');
      expect(Object.keys(Coral.Tree.Item.variant).length).to.equal(2);
    });
  
    it('Default variant should be drilldown', function() {
      var item = new Coral.Tree.Item();
      expect(item.variant).to.equal(Coral.Tree.Item.variant.DRILLDOWN);
    });
  
    it('Possible to set variant through API', function() {
      var item = new Coral.Tree.Item().set({
        variant: 'leaf'
      });
      expect(item.variant).to.equal(Coral.Tree.Item.variant.LEAF);
    });
  
    it('Set variant after initialized', function() {
      var item = new Coral.Tree.Item();
      expect(item.variant).to.equal(Coral.Tree.Item.variant.DRILLDOWN);
      item.variant = Coral.Tree.Item.variant.LEAF;
      expect(item.variant).to.equal(Coral.Tree.Item.variant.LEAF);
    });
  
    it('Possible to set variant through markup', function(done) {
      var itemMarkup = '<coral-tree-item variant="leaf"></coral-tree-item>';
      helpers.build(itemMarkup, function(item) {
        expect(item.variant).to.equal(Coral.Tree.Item.variant.LEAF);
        done();
      });
    });
  });
  
  describe('API', function() {
    describe('#expanded', function() {
      it('should be possible to expand collapse items in Tree', function(done) {
        helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {

          var secondItem = el.items.getAll()[1];
          secondItem.expanded = true;

          helpers.next(function() {
            assertActiveness(secondItem, false, true);
            secondItem.expanded = false;

            helpers.next(function() {
              assertActiveness(secondItem, false, false);
              done();
            });
          });
        });
      });
    });
  
    describe('#parent', function() {
      it('should be readonly', function() {
        helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {
          var item = el.items.first();
          item.parent = document.body;
          expect(item.parent).to.equal(null);
        });
      });
  
      it('should retrieve the parent tree', function(done) {
        helpers.build(window.__html__['Coral.Tree.nested.html'], function(el) {
          el = el.items.first();
          expect(el.parent).to.equal(null);
          el.items.getAll().forEach(function(item) {
            expect(item.parent).to.equal(el);
          });
          done();
        });
      });
    });

    describe('#selected', function() {
      it('should be possible to select items in Tree', function(done) {
        helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {

          var secondItem = el.items.getAll()[1];
          secondItem.selected = true;

          helpers.next(function() {
            assertActiveness(secondItem, true, false);
            expect(el.selectedItem).to.equal(secondItem);

            secondItem.selected = false;

            helpers.next(function() {
              assertActiveness(secondItem, false, false);
              expect(el.selectedItem).to.equal(null);
              done();
            });
          });
        });
      });
    });

    describe('#selectedAndExpanded', function() {
      it('should be possible to select and expand same item in Tree', function(done) {
        helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {

          var firstItem = el.items.getAll()[0];
          firstItem.selected = firstItem.expanded = true;

          helpers.next(function() {

            assertActiveness(firstItem, true, true);
            expect(el.selectedItem).to.equal(firstItem);
            done();
          });
        });
      });
    });

    describe('#expandAll', function() {
      it('should be possible to expand all items in Tree', function(done) {
        helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {
          el.expandAll();

          helpers.next(function() {

            var items = el.items.getAll();
            var length = items.length;
            for (var index = 0; index < length; index++) {
              assertActiveness(items[index], false, true);
            }
            done();
          });
        });
      });
    });

    describe('#collapseAll', function() {
      it('should be possible to collapse all items in Tree', function(done) {
        helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {
          el.collapseAll();

          helpers.next(function() {

            var items = el.items.getAll();
            var length = items.length;
            for (var index = 0; index < length; index++) {
              assertActiveness(items[index], false, false);
            }
            done();
          });
        });
      });
    });

    describe('#disabled', function() {
      it('should be possible to enable/disable item in Tree', function(done) {
        helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {

          var firstItem = el.items.getAll()[0];
          expect(firstItem.disabled).to.be.false;

          firstItem.disabled = true;

          helpers.next(function() {
            assertActiveness(firstItem, false, false);
            expect(firstItem.disabled).to.be.true;
            done();
          });
        });
      });
    });
  
    describe('#selectedItems', function() {
      it('should retrieve all selected items included nested ones', function(done) {
        helpers.build(window.__html__['Coral.Tree.nested.html'], function(el) {
          var items = el.items.getAll();
          el.multiple = true;
          items.forEach(function(item) {
            item.selected = true;
          });
          expect(el.selectedItems).to.deep.equal(items);
          done();
        });
      });
    });
  
    describe('#selectedItem', function() {
      it('should retrieve the first selected item', function(done) {
        helpers.build(window.__html__['Coral.Tree.nested.html'], function(el) {
          var items = el.items.getAll();
          el.multiple = true;
          items.forEach(function(item) {
            item.selected = true;
          });
          expect(el.selectedItem).to.equal(el.selectedItems[0]);
          done();
        });
      });
    });
  
    describe('#multiple', function() {
      it('should not allow to select multiple items', function(done) {
        helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {
          var items = el.items.getAll();
          items.forEach(function(item) {
            item.selected = true;
          });
          expect(el.selectedItems).to.deep.equal([items[items.length - 1]]);
          done();
        });
      });
      
      it('should select the last item if multiple is changed to false', function(done) {
        helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {
          var items = el.items.getAll();
          el.multiple = true;
          items.forEach(function(item) {
            item.selected = true;
          });
          el.multiple = false;
          helpers.next(function() {
            expect(el.selectedItems).to.deep.equal([items[items.length - 1]]);
            done();
          });
        });
      });
    });

    describe('#items', function() {

      it('should be readOnly', function() {
        helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {

          el.items = null;
          expect(el.items).not.to.be.null;
        });
      });

      it('should get all the items with getAll()', function() {
        helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {

          var items = el.items.getAll();
          expect(items.length).to.equal(3);
        });
      });

      it('should remove all the items with clear()', function() {
        helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {
          // we remove all the items
          el.items.clear();
          expect(el.items.length).to.equal(0);
        });
      });

      it('should add items using add()', function() {
        helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {

          var item = new Coral.Tree.Item().set({
            content: {
              innerHTML: 'Item 4'
            }
          });

          el.items.add(item);
          expect(el.items.length).to.equal(4);
        });
      });
    });
  });

  describe('Markup', function() {

    describe('#selected', function() {
      it('should be possible to select item using markup', function(done) {
        helpers.build(window.__html__['Coral.Tree.items.html'], function(el) {
          var item = el.items.getAll()[0];
          assertActiveness(item, true, false);
          done();
        });
      });
    });

    describe('#expanded', function() {
      it('should be possible to expand item using markup', function(done) {
        helpers.build(window.__html__['Coral.Tree.items.html'], function(el) {
          var item = el.items.getAll()[1];
          assertActiveness(item, false, true);
          done();
        });
      });
    });

    describe('#disabled', function() {
      it('should be possible to disable item using markup', function(done) {
        helpers.build(window.__html__['Coral.Tree.items.html'], function(el) {
          var item = el.items.getAll()[2];
          expect(item.disabled).to.be.true;
          done();
        });
      });
    });
  });

  describe('user interaction', function() {

    it('should expand/collapse item in tree when expand/collapse icon is clicked', function(done) {
      helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {

        var item = el.items.getAll()[1];
        item._elements.icon.click();

        helpers.next(function() {
          assertActiveness(item, false, true);

          item._elements.icon.click();

          helpers.next(function() {
            assertActiveness(item, false, false);
            done();
          });
        });
      });
    });

    it('should select item in tree when header is clicked', function(done) {
      helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {

        var item = el.items.getAll()[1];
        item._elements.header.click();

        helpers.next(function() {
          assertActiveness(item, true, false);

          item._elements.header.click();

          helpers.next(function() {
            assertActiveness(item, false, false);
            done();
          });
        });
      });
    });
  
    it('should focus the first item via keyboard', function(done) {
      helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {
        var lastItem = el.items.last();
        el._resetFocusableItem(lastItem);
        helpers.next(function() {
          helpers.keypress('home', lastItem._elements.header);
          helpers.next(function() {
            var firstItem = el.items.first();
            expect(lastItem._elements.header.getAttribute('tabindex') === '-1').to.be.true;
            expect(firstItem._elements.header.getAttribute('tabindex') === '0').to.be.true;
            expect(firstItem._elements.header).to.equal(document.activeElement);
            done();
          });
        });
      });
    });
  
    it('should focus the last item via keyboard', function(done) {
      helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {
        var firstItem = el.items.first();
        helpers.keypress('end', firstItem._elements.header);
        helpers.next(function() {
          var lastItem = el.items.last();
          expect(firstItem._elements.header.getAttribute('tabindex') === '-1').to.be.true;
          expect(lastItem._elements.header.getAttribute('tabindex') === '0').to.be.true;
          expect(lastItem._elements.header).to.equal(document.activeElement);
          done();
        });
      });
    });
  
    it('should focus the next item via keyboard', function(done) {
      helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {
        var firstItem = el.items.first();
        var nextItem = firstItem.nextElementSibling;
        helpers.keypress('right', firstItem._elements.header);
        helpers.next(function() {
          expect(firstItem._elements.header.getAttribute('tabindex') === '-1').to.be.true;
          expect(nextItem._elements.header.getAttribute('tabindex') === '0').to.be.true;
          expect(nextItem._elements.header).to.equal(document.activeElement);
          done();
        });
      });
    });
  
    it('should focus the previous item via keyboard', function(done) {
      helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {
        var lastItem = el.items.last();
        el._resetFocusableItem(lastItem);
        helpers.next(function() {
          var previousItem = lastItem.previousElementSibling;
          helpers.keypress('left', lastItem._elements.header);
          helpers.next(function() {
            expect(lastItem._elements.header.getAttribute('tabindex') === '-1').to.be.true;
            expect(previousItem._elements.header.getAttribute('tabindex') === '0').to.be.true;
            expect(previousItem._elements.header).to.equal(document.activeElement);
            done();
          });
        });
      });
    });
    
    it('should focus the next edge item via keyboard', function(done) {
      helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {
        var firstItem = el.items.first();
        var lastItem = el.items.last();
        helpers.keypress('left', firstItem._elements.header);
        helpers.next(function() {
          expect(firstItem._elements.header.getAttribute('tabindex') === '-1').to.be.true;
          expect(lastItem._elements.header.getAttribute('tabindex') === '0').to.be.true;
          expect(lastItem._elements.header).to.equal(document.activeElement);
          done();
        });
      });
    });
  
    it('should focus the previous edge item via keyboard', function(done) {
      helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {
        var firstItem = el.items.first();
        var lastItem = el.items.last();
        el._resetFocusableItem(lastItem);
        helpers.next(function() {
          helpers.keypress('right', lastItem._elements.header);
          helpers.next(function() {
            expect(lastItem._elements.header.getAttribute('tabindex') === '-1').to.be.true;
            expect(firstItem._elements.header.getAttribute('tabindex') === '0').to.be.true;
            expect(firstItem._elements.header).to.equal(document.activeElement);
            done();
          });
        });
      });
    });
  
    it('should focus the sibling item via keyboard (nested)', function(done) {
      helpers.build(window.__html__['Coral.Tree.nested.html'], function(el) {
        var items = el.items.getAll();
        var firstItem = items[0];
        var beforeLastItem = items[items.length - 2];
        el._resetFocusableItem(beforeLastItem);
        helpers.next(function() {
          helpers.keypress('left', beforeLastItem._elements.header);
          helpers.next(function() {
            expect(beforeLastItem._elements.header.getAttribute('tabindex') === '-1').to.be.true;
            expect(firstItem._elements.header.getAttribute('tabindex') === '0').to.be.true;
            expect(firstItem._elements.header).to.equal(document.activeElement);
            done();
          });
        });
      });
    });
  
    it('should set a new focusable item if the current one is disabled', function(done) {
      helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {
        var items = el.items.getAll();
        var firstItem = items[0];
        var secondItem = items[1];
        firstItem.disabled = true;
        helpers.next(function() {
          expect(firstItem._elements.header.getAttribute('tabindex') === '-1').to.be.true;
          expect(secondItem._elements.header.getAttribute('tabindex') === '0').to.be.true;
          done();
        });
      });
    });
  
    it('should set a new focusable item if the current one is hidden', function(done) {
      helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {
        var items = el.items.getAll();
        var firstItem = items[0];
        var secondItem = items[1];
        firstItem.hidden = true;
        helpers.next(function() {
          expect(firstItem._elements.header.getAttribute('tabindex') === '-1').to.be.true;
          expect(secondItem._elements.header.getAttribute('tabindex') === '0').to.be.true;
          done();
        });
      });
    });
    
    it('should expand the tree item with key:enter', function(done) {
      helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {
        var firstItem = el.items.first();
        helpers.keypress('enter', firstItem._elements.header);
        helpers.next(function() {
          expect(firstItem.expanded).to.be.true;
          done();
        });
      });
    });
    
    it('should select the tree item with key:space', function(done) {
      helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {
        var firstItem = el.items.first();
        helpers.keypress('space', firstItem._elements.header);
        helpers.next(function() {
          expect(firstItem.selected).to.be.true;
          done();
        });
      });
    });
  });
  
  describe('Events', function() {
    describe('#coral-collection:add', function() {
      it('should be triggered with add()', function(done) {
        var el = new Coral.Tree();
        helpers.target.appendChild(el);
        // Wait for MO to kick-in
        helpers.next(function() {
          var item = null;
          el.on('coral-collection:add', function(event) {
            expect(event.target).to.equal(el, 'Event should be triggered by the collection');
            expect(event.detail).to.deep.equal({
              item: item
            });
            expect(el.items.length).to.equal(1, 'Collection should have one item');
            done();
          });
          item = el.items.add();
        });
      });
  
      it('should be triggered with add() for nested items', function(done) {
        helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {
          var spy = sinon.spy();
          el = el.items.first();
          el.on('coral-collection:add', spy);
          var item = el.items.add();
          // Wait for the MO to kick in
          helpers.next(function() {
            expect(spy.callCount).to.equal(1);
            expect(spy.getCall(0).args[0].target).to.equal(el, 'Event should be triggered by the collection');
            expect(spy.getCall(0).args[0].detail).to.deep.equal({
              item: item
            });
            expect(el.items.length).to.equal(1, 'Collection should have one item');
            done();
          });
        });
      });
    });
    
    describe('#coral-collection:remove', function() {
      it('should be triggered with remove()', function(done) {
        helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {
          var spy = sinon.spy();
          el.on('coral-collection:remove', spy);
          var item = el.items.last();
          item.remove();
          // Wait for the MO to kick in
          helpers.next(function() {
            expect(spy.callCount).to.equal(1);
            expect(spy.getCall(0).args[0].target).to.equal(el, 'Event should be triggered by the collection');
            expect(spy.getCall(0).args[0].detail).to.deep.equal({
              item: item
            });
            expect(el.items.length).to.equal(2, 'Collection should have 2 items');
            done();
          });
        });
      });
  
      it('should be triggered with remove() for nested items', function(done) {
        helpers.build(window.__html__['Coral.Tree.nested.html'], function(el) {
          var spy = sinon.spy();
          el = el.items.first();
          el.on('coral-collection:remove', spy);
          var item = el.items.last();
          item.remove();
          // Wait for the MO to kick in
          helpers.next(function() {
            expect(spy.callCount).to.equal(1);
            expect(spy.getCall(0).args[0].target).to.equal(el, 'Event should be triggered by the collection');
            expect(spy.getCall(0).args[0].detail).to.deep.equal({
              item: item
            });
            expect(el.items.length).to.equal(2, 'Collection should have 2 items');
            done();
          });
        });
      });
    });
  
    describe('#coral-tree:change', function() {
      it('should trigger a change event on selecting an item', function(done) {
        helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {
          var spy = sinon.spy();
          var firstItem = el.items.first();
          el.on('coral-tree:change', spy);
          firstItem.selected = true;
          helpers.next(function() {
            expect(spy.callCount).to.equal(1);
            expect(spy.getCall(0).args[0].detail).to.deep.equal({
              oldSelection: [],
              selection: [firstItem]
            });
            done();
          });
        });
      });
  
      it('should trigger a change event on deselecting an item', function(done) {
        helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {
          var spy = sinon.spy();
          var firstItem = el.items.first();
          firstItem.selected = true;
          el.on('coral-tree:change', spy);
          firstItem.selected = false;
          helpers.next(function() {
            expect(spy.callCount).to.equal(1);
            expect(spy.getCall(0).args[0].detail).to.deep.equal({
              oldSelection: [firstItem],
              selection: []
            });
            done();
          });
        });
      });
  
      it('should trigger a change event on changing the selection', function(done) {
        helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {
          var spy = sinon.spy();
          var firstItem = el.items.first();
          var lastItem = el.items.last();
          firstItem.selected = true;
          el.on('coral-tree:change', spy);
          lastItem.selected = true;
          helpers.next(function() {
            expect(spy.callCount).to.equal(1);
            expect(spy.getCall(0).args[0].detail).to.deep.equal({
              oldSelection: [firstItem],
              selection: [lastItem]
            });
            done();
          });
        });
      });
  
      it('should trigger a change event on changing multiple to false', function(done) {
        helpers.build(window.__html__['Coral.Tree.base.html'], function(el) {
          el.multiple = true;
          var items = el.items.getAll();
          items.forEach(function(item) {
             item.selected = true;
          });
          el.on('coral-tree:change', function(event) {
            expect(event.detail).to.deep.equal({
              oldSelection: items,
              selection: [items[items.length -1 ]]
            });
            done();
          });
          el.multiple = false;
        });
      });
    });
    
    describe('#coral-tree:expand', function() {
      it('should trigger the event if an item is expanded', function(done) {
        helpers.build(window.__html__['Coral.Tree.nested.html'], function(el) {
          var item = el.items.first();
          item.expanded = true;
          
          el.on('coral-tree:expand', function(event) {
            expect(event.detail).to.deep.equal({
              item: item
            });
            done();
          });
        });
      });
    });
  
    describe('#coral-tree:collapse', function() {
      it('should trigger the event if an item is collapsed', function(done) {
        helpers.build(window.__html__['Coral.Tree.nested.html'], function(el) {
          var item = el.items.first();
          item.expanded = true;
          item.expanded = false;
      
          el.on('coral-tree:collapse', function(event) {
            expect(event.detail).to.deep.equal({
              item: item
            });
            done();
          });
        });
      });
    });
  });

  describe('Implementation Details', function() {
    var el;
    var item;

    beforeEach(function() {
      el = new Coral.Tree();
      helpers.target.appendChild(el);

      var item = new Coral.Tree.Item();
      item.set({
        content: {
          innerHTML: 'Item'
        }
      });

      el.items.add(item);
    });

    afterEach(function() {
      el = item = null;
    });

    it('should have right role set', function() {

      expect(el.getAttribute('role')).to.equal('tree');
      var item = el.items.getAll()[0];
      var header = item._elements.header;
      var subTree = item._elements.subTreeContainer;
      expect(item.getAttribute('role')).to.equal('treeitem');
      expect(header.getAttribute('role')).to.equal('tab');

      expect(header.getAttribute('aria-controls'))
        .equal(subTree.getAttribute('id'));

      expect(subTree.getAttribute('aria-labelledby'))
        .equal(header.getAttribute('id'));
    });

    it('should have right classes set', function() {

      expect(el.classList.contains('coral3-Tree')).to.be.true;
      var item = el.items.getAll()[0];
      expect(item.classList.contains('coral3-Tree-item')).to.be.true;
    });

    it('should generate header and subtree for tree item with right classes', function() {

      var item = el.items.getAll()[0];
      var header = item._elements.header;
      var subTree = item._elements.subTreeContainer;
      expect(header).not.to.be.null;
      expect(subTree).not.to.be.null;
      expect(header.classList.contains('coral3-Tree-header')).to.be.true;
      expect(subTree.classList.contains('coral3-Tree-subTree')).to.be.true;
    });
  });

  describe('#InteractiveElements', function() {

    it('should be possible to clone tree with interactive elements', function(done) {
      helpers.build(window.__html__['Coral.Tree.interactive.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('Item should not be selected when checkbox checked', function(done) {
      helpers.build(window.__html__['Coral.Tree.interactive.html'], function(el) {
        var item = el.items.getAll()[0];
        assertActiveness(item, false, false);
        var checkbox = item.querySelector('input[type="checkbox"]');
        expect(checkbox).to.exist;
        checkbox.click();

        helpers.next(function() {
          expect(checkbox.checked).to.equal(true);
          assertActiveness(item, false, false);
          item._elements.icon.click();

          helpers.next(function() {
            assertActiveness(item, false, true);
            item._elements.header.click();

            helpers.next(function() {
              assertActiveness(item, true, true);
              done();
            });
          });
        });
      });
    });

    it('Item should not be selected when Coral-Select is selected', function(done) {
      helpers.build(window.__html__['Coral.Tree.interactive.html'], function(el) {
        var item = el.items.getAll()[1];
        assertActiveness(item, false, false);
        var select = item.querySelector('select');
        expect(select).to.exist;
        expect(select.value).to.equal('Option 1');
        select.click();
        select.focus();

        helpers.next(function() {
          assertActiveness(item, false, false);
          item._elements.icon.click();

          helpers.next(function() {
            assertActiveness(item, false, true);
            item._elements.header.click();

            helpers.next(function() {
              assertActiveness(item, true, true);
              done();
            });
          });
        });
      });
    });

    it('Item should not be selected when Button is selected', function(done) {
      helpers.build(window.__html__['Coral.Tree.interactive.html'], function(el) {
        var item = el.items.getAll()[2];
        assertActiveness(item, false, false);
        var button = item.querySelector('button');
        expect(button).to.exist;
        button.click();

        helpers.next(function() {
          assertActiveness(item, false, false);
          item._elements.icon.click();

          helpers.next(function() {
            assertActiveness(item, false, true);
            item._elements.header.click();

            helpers.next(function() {
              assertActiveness(item, true, true);
              done();
            });
          });
        });
      });
    });

    it('Item should not be selected when Textarea is focused', function(done) {
      helpers.build(window.__html__['Coral.Tree.interactive.html'], function(el) {
        var item = el.items.getAll()[3];
        assertActiveness(item, false, false);
        var textarea = item.querySelector('textarea');
        expect(textarea).to.exist;
        textarea.click();
        textarea.focus();
        textarea.blur();

        helpers.next(function() {
          assertActiveness(item, false, false);
          item._elements.icon.click();

          helpers.next(function() {
            assertActiveness(item, false, true);
            item._elements.header.click();

            helpers.next(function() {
              assertActiveness(item, true, true);
              done();
            });
          });
        });
      });
    });

    it('should be possible to select items in Tree', function(done) {
      helpers.build(window.__html__['Coral.Tree.interactive.html'], function(el) {
        var item = el.items.getAll()[0];
        item.selected = true;

        helpers.next(function() {
          assertActiveness(item, true, false);
          expect(el.selectedItem).to.equal(item);
          item.selected = false;

          helpers.next(function() {
            assertActiveness(item, false, false);
            expect(el.selectedItem).to.equal(null);
            done();
          });
        });
      });
    });

    it('Item should not be selected when Radio is selected', function(done) {
      helpers.build(window.__html__['Coral.Tree.interactive.html'], function(el) {
        var item = el.items.getAll()[4];
        assertActiveness(item, false, false);
        var radio = item.querySelector('input[type="radio"]');
        expect(radio).to.exist;
        expect(radio.checked).to.equal(false);
        radio.click();

        helpers.next(function() {
          expect(radio.checked).to.equal(true);
          assertActiveness(item, false, false);
          item._elements.icon.click();

          helpers.next(function() {
            assertActiveness(item, false, true);
            item._elements.header.click();

            helpers.next(function() {
              assertActiveness(item, true, true);
              done();
            });
          });
        });
      });
    });

    it('should be possible to expand items in Tree', function(done) {
      helpers.build(window.__html__['Coral.Tree.interactive.html'], function(el) {
        var item = el.items.getAll()[0];
        item.expanded = true;

        helpers.next(function() {
          assertActiveness(item, false, true);
          item.expanded = false;

          helpers.next(function() {
            assertActiveness(item, false, false);
            done();
          });
        });
      });
    });
  });
});
