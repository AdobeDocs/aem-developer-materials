helpers.testSelectionList = function(Group, GroupItem) {
  'use strict';

  var group;

  beforeEach(function(done) {
    group = new Group();
    helpers.target.appendChild(group);
    Coral.commons.ready(group, function(){
      helpers.next(function() {
        done();
      });
    });
  });

  describe('API', function() {

    describe('#selectedItem', function() {

      it('should default to null', function() {
        expect(group.selectedItem).to.be.null;
        expect(group.selectedItems.length).to.equal(0);
      });

      it('should take the last selected if not multiple, post init', function(done) {
        var item = group.items.add({});
        item = group.items.add({});
        item.selected = true;
        item = group.items.add({});
        item.selected = true;

        helpers.next(function() {
          var items = group.items.getAll();
          expect(group.selectedItem).to.equal(items[2]);
          expect(group.selectedItems).to.deep.equal([items[2]]);
          expect(items[2].selected).to.be.true;

          // The items that are not the last selected will not be set to selected=false until
          // the next frame in polyfilled environments.
          helpers.next(function() {
            expect(items[2].selected).to.be.true;
            expect(items[2].hasAttribute('selected')).to.be.true;
            expect(items[0].hasAttribute('selected')).to.be.false;
            expect(items[0].selected).to.be.false;
            // checks again the items
            expect(group.selectedItem).to.equal(items[2]);
            expect(group.selectedItems).to.deep.equal([items[2]]);
            done();
          });
        });
      });

      it('should take the first selected on multiple, post init', function(done) {
        group.multiple = true;

        var item = group.items.add({});
        item.id = 'i1';
        item.selected = true;
        item = group.items.add({});
        item.id = 'i2';
        item = group.items.add({});
        item.id = 'i3';
        item.selected = true;

        helpers.next(function() {
          var items = group.items.getAll();
          expect(group.selectedItem, 'selected item is first item').to.equal(items[0]);
          expect(group.selectedItems, 'selected item maps to first and last item').to.deep.equal([items[0], items[2]]);
          expect(items[0].selected, 'selected flagged on first item').to.be.true;

          // The items that are not the last selected will not be set to selected=false until
          // the next frame in polyfilled environments.
          helpers.next(function() {
            expect(items[0].selected).to.be.true;
            expect(items[0].hasAttribute('selected')).to.be.true;
            expect(items[2].hasAttribute('selected')).to.be.true;
            expect(items[2].selected).to.be.true;
            // checks again the items
            expect(group.selectedItem).to.equal(items[0]);
            expect(group.selectedItems).to.deep.equal([items[0], items[2]]);
            done();
          });
        });
      });
    });

    describe('#multiple', function() {
      it('should return set value', function() {
        group.multiple = true;
        expect(group.multiple).to.be.true;
      });
    });

    describe('#items', function() {

      it('should exist', function() {
        expect(group).to.have.property('items');
      });

      it('should be read-only', function(done) {
        var items = group.items;
        group.items = null;
        helpers.next(function() {
          expect(group.items).to.equal(items);
          done();
        });
      });

      it('should be empty initially', function() {
        expect(group.items.getAll().length).to.equal(0);
      });

      describe('#add', function() {

        it('should support config to create an item', function(done) {
          var addSpy = sinon.spy();
          var removeSpy = sinon.spy();

          group.on('coral-collection:add', addSpy);
          group.on('coral-collection:remove', removeSpy);

          var item = group.items.add({});

          helpers.next(function() {
            expect(window.CustomElements.instanceof(item, GroupItem)).to.be.true;
            expect(group.items.getAll()).to.eql([item]);
            expect(addSpy.calledOnce, 'coral-collection:add not invoked once').to.be.true;
            expect(removeSpy.callCount).to.equal(0);
            group.off('coral-collection:add', addSpy);
            group.off('coral-collection:remove', removeSpy);
            done();
          });
        });

        it('should be able to insert as last element', function(done) {
          var item1 = group.items.add(new GroupItem());
          var item2 = new GroupItem();
          group.items.add(item2, null);

          helpers.next(function() {
            expect(group.items.getAll()).to.eql([item1, item2]);
            done();
          });
        });

        it('should be able insert before an element', function(done) {
          var item1 = group.items.add(new GroupItem());
          var item2 = new GroupItem();
          group.items.add(item2, item1);

          helpers.next(function() {
            expect(group.items.getAll()).to.eql([item2, item1]);
            done();
          });
        });
      });

      it('should remove all items via clear()', function(done) {
        var removeSpy = sinon.spy();
        group.on('coral-collection:remove', removeSpy);

        group.items.add(new GroupItem());
        group.items.add(new GroupItem());

        helpers.next(function() {

          expect(group.items.length).to.equal(2);
          group.items.clear();

          helpers.next(function() {
            expect(group.items.length).to.equal(0, 'group.items.length not 0 after clear()');
            expect(removeSpy.callCount).to.equal(2, 'removeSpy was not called twice');
            group.off('coral-collection:remove', removeSpy);
            done();
          });
        });
      });
    });
  });


  describe('Events', function() {

    it('should trigger coral-collection:add on appendChild', function(done) {
      var eventSpy = sinon.spy();
      group.on('coral-collection:add', eventSpy);
      var item = new GroupItem();
      group.appendChild(item);

      helpers.next(function() {
        var all = group.items.getAll();
        expect(all.length, 'items length').to.equal(1);
        expect(all[0], 'item match').to.equal(item);
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1, 'coral-collection:add event not invoked');
          group.off('coral-collection:add', eventSpy);
          item = null;
          done();
        });
      });
    });

    it('should trigger coral-collection:remove on removeChild', function(done) {
      var eventSpy = sinon.spy();
      group.on('coral-collection:remove', eventSpy);

      var item1 = new GroupItem();
      var item2 = new GroupItem();
      group.appendChild(item1);
      group.appendChild(item2);

      helpers.next(function() {
        expect(group.items.getAll()).to.eql([item1, item2]);

        group.removeChild(item1);

        helpers.next(function() {
          expect(group.items.getAll()).to.eql([item2]);
          expect(eventSpy.callCount).to.equal(1, 'coral-collection:remove event not invoked');
          group.off('coral-collection:remove', eventSpy);
          item1 = item2 = null;
          done();
        });
      });
    });

  });
};
