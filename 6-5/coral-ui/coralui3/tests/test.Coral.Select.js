describe('Coral.Select', function() {
  // @todo: test reordering the options
  'use strict';

  function dispatchChangeEvent(element) {
    var event = document.createEvent('HTMLEvents');
    event.initEvent('change', true, true);
    element.dispatchEvent(event);
  }

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Select');
    });

    it('should define the variants in an enum', function() {
      expect(Coral.Select.variant).to.exist;
      expect(Coral.Select.variant.DEFAULT).to.equal('default');
      expect(Coral.Select.variant.QUIET).to.equal('quiet');
      expect(Object.keys(Coral.Select.variant).length).to.equal(2);
    });
  });

  describe('Instantiation', function() {
    function testDefaultInstance(select) {
      expect(select.classList.contains('coral3-Select')).to.be.true;
    }

    it('should be possible using new', function() {
      var select = new Coral.Select();
      testDefaultInstance(select);
    });

    it('should be possible using createElement', function() {
      var select = document.createElement('coral-select');
      testDefaultInstance(select);
    });

    it('should be possible using markup', function(done) {
      helpers.build('<coral-select></coral-select>', function(select) {
        testDefaultInstance(select);
        done();
      });
    });

    it('should be possible to clone using markup', function(done) {
      helpers.build(window.__html__['Coral.Select.multiple.base.html'], function(select) {
        helpers.testComponentClone(select, done);
      });
    });

    it('should be possible to clone using markup with framework data', function(done) {
      helpers.build(window.__html__['Coral.Select.mustache.html'], function(select) {
        helpers.testComponentClone(select, done);
      });
    });

    it('should be possible to clone using js', function(done) {
      var select = new Coral.Select();
      helpers.target.appendChild(select);

      helpers.next(function() {
        helpers.testComponentClone(select, done);
      });
    });
  });

  // API tests that do not set the placeholder as default
  describe('API', function() {
    // the select list item used in every test
    var el;
    var item1;
    var item2;
    var item3;

    beforeEach(function(done) {
      el = new Coral.Select();

      item1 = new Coral.Select.Item();
      item2 = new Coral.Select.Item();
      item3 = new Coral.Select.Item();

      item1.content.textContent = 'Item 1';
      item1.value = '1';
      item2.content.textContent = 'Item 2';
      item2.value = '2';
      item3.content.textContent = 'Item 3';
      item3.value = '3';

      // adds the item to the select
      el.items.add(item1);
      el.items.add(item2);
      el.items.add(item3);

      helpers.target.appendChild(el);

      Coral.commons.ready(el, function() {
        done();
      });
    });

    afterEach(function() {
      el = item1 = item2 = item3 = null;
    });

    describe('#placeholder', function() {
      // case 3: !p + !m +  se = se
      it('should default to empty string', function(done) {
        expect(el.placeholder).to.equal('');

        // selects the second item
        item2.selected = true;

        helpers.next(function() {
          expect(el.placeholder).to.equal('');
          expect(el._elements.label.textContent).to.equal(item2.content.textContent);

          done();
        });
      });

      // case 3: !p + !m +  se = se
      it('should correctly change to selected item after changing from multiple to single', function(done) {
        el.multiple = true;

        helpers.next(function() {
          expect(el.placeholder).to.equal('');

          // selects an item
          item1.selected = true;
          item2.selected = true;

          helpers.next(function() {
            expect(el.selectedItem).to.equal(item1);
            expect(el.selectedItems).to.deep.equal([item1, item2]);
            // should update to the default placeholder for multiple
            expect(el._elements.label.textContent).to.equal('Select', 'should be the default ');

            // we switch back to single
            el.multiple = false;

            helpers.next(function() {
              // should switch to the 2nd item
              expect(el._elements.label.innerHTML).to.equal(item2.content.innerHTML);

              done();
            });
          });
        });
      });

      // case 4: !p + !m + !se = firstSelectable, but with no selectable option
      it('should default to empty string if empty', function(done) {
        // we remove all the items for the text
        el.items.clear();

        expect(el.placeholder).to.equal('', 'placeholder is not an empty string');

        // waits for the MO to kick-in
        helpers.next(function() {
          // waits for the placeholder's sync
          helpers.next(function() {
            expect(el._elements.label.innerHTML).to.equal('', 'label is not an empty string');

            done();
          });
        });
      });

      // case 4: !p + !m + !se = firstSelectable
      it('should default to first selectable', function(done) {
        expect(el.placeholder).to.equal('');

        helpers.next(function() {
          expect(el._elements.label.innerHTML).to.equal(item1.content.innerHTML);

          done();
        });
      });

      // case 4: !p + !m + !se = firstSelectable
      // should correctly sync the value when switching
      it('should correctly switch the first selectable', function(done) {
        el.multiple = true;

        expect(el.placeholder).to.equal('');

        helpers.next(function() {
          // should update to the default placeholder for multiple
          expect(el._elements.label.textContent).to.equal('Select');

          // we switch back to single
          el.multiple = false;

          helpers.next(function() {
            // should show the first item since there is no placeholder
            expect(el._elements.label.innerHTML).to.equal(item1.content.innerHTML);
            done();
          });
        });
      });

      // case 8: !p +  m + !se = 'Select'
      it('should show "Select" if no placeholder, multiple and nothing selected', function(done) {
        el.multiple = true;

        // wait one frame for FF
        helpers.next(function() {
          expect(el.placeholder).to.equal('');
          expect(el._elements.label.textContent).to.equal('Select');
          done();
        });
      });

      // case 8: !p +  m + !se = 'Select'
      // should correctly sync the value
      it('should switch to default placeholder when switched from single to multiple', function(done) {
        // starts as single
        expect(el.multiple).to.be.false;
        // with no placeholder
        expect(el.placeholder).to.equal('');

        helpers.next(function() {
          // should show the first item since there is no placeholder
          expect(el._elements.label.innerHTML).to.equal(item1.content.innerHTML);

          // activates the multiple
          el.multiple = true;

          helpers.next(function() {
            // should update to the default placeholder for multiple
            expect(el._elements.label.textContent).to.equal('Select');
            done();
          });
        });
      });

      // case 7: !p +  m +  se = 'Select'
      it('should say "Select" in the label if multiple=true and there is selection', function(done) {
        // we wait for the selection to happen
        helpers.next(function() {
          el.multiple = true;

          expect(el.selectedItem).to.equal(item1);
          expect(el.selectedItems).to.deep.equal([item1]);
          expect(el.placeholder).to.equal('');

          // wait for the placeholder's sync
          helpers.next(function() {
            expect(el._elements.label.textContent).to.equal('Select');

            done();
          });
        });
      });

      // case 7: !p +  m +  se = 'Select'
      it('should correctly change to selected item after changing from single to multiple without placeholder', function(done) {
        // we start as single
        expect(el.multiple).to.be.false;
        // with no placeholder
        expect(el.placeholder).to.equal('');

        // selects an item
        item2.selected = true;

        helpers.next(function() {

          expect(el.selectedItem).to.equal(item2);
          // should show the first item since there is no placeholder
          expect(el._elements.label.innerHTML).to.equal(item2.content.innerHTML);

          // we change to multiple to see if the label is correctly updated
          el.multiple = true;

          helpers.next(function() {
            // should show the default placeholder since we are multiple
            expect(el._elements.label.textContent).to.equal('Select');

            done();
          });
        });
      });

      // case 5:  p + !m +  se = se
      it('should be "Select" if multiple and has a selectedItem', function(done) {
        el.placeholder = 'Choose an item';

        // selects the second item
        item2.selected = true;

        helpers.next(function() {
          expect(el.placeholder).to.equal('Choose an item');
          expect(el._elements.label.innerHTML).to.equal(item2.content.innerHTML);
          expect(el.selectedItems).to.deep.equal([item2]);
          done();
        });
      });

      // case 6:  p + !m + !se = p
      it('should be "Select" if not multiple and no selectedItem', function(done) {
        el.placeholder = 'Choose an item';

        // since the select was initialized without a placeholder we revert the forced selection
        item1.selected = false;

        // we wait for the placeholder's sync
        helpers.next(function() {
          expect(el._elements.label.innerHTML).to.equal('Choose an item');
          expect(el.selectedItems).to.deep.equal([]);

          done();
        });
      });

      // case 1:  p +  m +  se = p
      it('should show the placeholder with multiple and selectedItem(s)', function(done) {
        el.placeholder = 'Choose an item';
        el.multiple = true;

        item1.selected = true;
        item2.selected = true;

        helpers.next(function() {
          expect(el.placeholder).to.equal('Choose an item');
          expect(el._elements.label.innerHTML).to.equal('Choose an item');
          expect(el.selectedItems).to.deep.equal([item1, item2]);
          done();
        });
      });

      // case 2:  p +  m + !se = p
      it('should show the placeholder with multiple and no selectedItem(s)', function(done) {
        // we need to way for the sync to run and set a selection candidate
        helpers.next(function() {
          el.placeholder = 'Choose an item';

          el.multiple = true;

          helpers.next(function() {
            expect(el.placeholder).to.equal('Choose an item');
            expect(el._elements.label.innerHTML).to.equal('Choose an item');
            expect(el.selectedItem).to.equal(item1);
            expect(el.selectedItems).to.deep.equal([item1]);

            done();
          });
        });
      });

      it('should go back to the placeholder once the selected is removed', function(done) {
        el.placeholder = 'Choose an item';

        // selects the second item
        item2.selected = true;

        helpers.next(function() {
          expect(el.placeholder).to.equal('Choose an item');
          expect(el._elements.label.innerHTML).to.equal(item2.content.innerHTML);
          expect(el.selectedItems).to.deep.equal([item2]);

          // we remove the selection from the current item
          item2.removeAttribute('selected');

          expect(el.selectedItem).to.be.null;

          // we need to wait one more frame
          helpers.next(function() {
            expect(el._elements.label.innerHTML).to.equal('Choose an item');
            done();
          });
        });
      });

      it('should go back to the placeholder once the selected is removed', function(done) {
        el.placeholder = 'Choose an item';

        // selects the second item
        item2.selected = true;

        helpers.next(function() {
          expect(el.placeholder).to.equal('Choose an item');
          expect(el._elements.label.innerHTML).to.equal(item2.content.innerHTML);
          expect(el.selectedItems).to.deep.equal([item2]);

          // we remove the selection from the current item
          item2.remove();

          expect(el.selectedItem).to.be.null;

          // we wait for the MO to kick in
          helpers.next(function() {
            // and for the placeholder to sync
            helpers.next(function() {
              expect(el._elements.label.innerHTML).to.equal('Choose an item');
              done();
            });
          });
        });
      });
    });
  });

  describe('API', function() {
    // the select list item used in every test
    var el;
    var item1;
    var item2;
    var item3;

    beforeEach(function(done) {
      el = new Coral.Select();
      // using a placeholder stops the component from finding an initial selection
      el.placeholder = 'Placeholder';

      item1 = new Coral.Select.Item();
      item2 = new Coral.Select.Item();
      item3 = new Coral.Select.Item();

      item1.content.textContent = 'Item 1';
      item1.value = '1';
      item2.content.textContent = 'Item 2';
      item2.value = '2';
      item3.content.textContent = 'Item 3';
      item3.value = '3';

      // adds the item to the select
      el.items.add(item1);
      el.items.add(item2);
      el.items.add(item3);

      helpers.target.appendChild(el);

      Coral.commons.ready(el, function() {
        done();
      });
    });

    afterEach(function() {
      el = item1 = item2 = item3 = null;
    });

    describe('#placeholder', function() {
      // case 6:  p + !m + !se = p
      it('should default to the placeholder when multiple=false and no selection', function() {
        expect(el._elements.label.textContent).to.equal('Placeholder');
        expect(el.selectedItems).to.deep.equal([]);
      });

      // case 6:  p + !m + !se = p, no items for selection
      it('should default to placeholder when no items', function(done) {
        expect(el.placeholder).to.equal('Placeholder');

        item3.selected = true;
        expect(el.selectedItem).to.equal(item3);

        // waits for the placeholder's sync
        helpers.next(function() {
          expect(el._elements.label.textContent).to.equal(item3.textContent, 'label should match the selected item');
          // we remove all items which should cause the placeholder to fallback to the initial value
          el.items.clear();

          // we wait for the MO to kick-in
          helpers.next(function() {
            // and then the placeholder's sync
            helpers.next(function() {
              expect(el.items.length).to.equal(0);
              expect(el.selectedItems).to.deep.equal([]);
              expect(el._elements.label.textContent).to.equal(el.placeholder, 'label should be the placeholder');

              done();
            });
          });
        });
      });
    });

    describe('#selectedItem', function() {
      it('should default to null when a placeholder is added', function(done) {
        expect(el.placeholder).not.to.equal('');

        helpers.next(function() {
          expect(el.selectedItem).to.equal(null);
          expect(el._elements.label.textContent).to.equal(el.placeholder);

          done();
        });
      });

      it('should not be settable', function() {
        expect(el.selectedItem).to.equal(null);
        el.selectedItem = item2;
        expect(el.selectedItem).to.equal(null);
      });

      it('should default to the first item when the placeholder is removed', function(done) {
        // removing the placeholder should cause the select to find a candiate for selection
        el.placeholder = '';

        helpers.next(function() {
          expect(el.selectedItem).to.equal(el.items.first());
          expect(el._elements.label.textContent).to.equal(el.items.first().textContent);

          done();
        });
      });

      it('should update to the selected value', function() {
        item2.selected = true;
        expect(el.selectedItem).to.equal(item2);
        expect(el._elements.nativeSelect.value).to.equal(item2.value);

        item3.selected = true;
        expect(el.selectedItem).to.equal(item3);
        expect(el._elements.nativeSelect.value).to.equal(item3.value);
      });

      it('should be null if the selected is removed', function() {
        item2.selected = true;
        expect(el.selectedItem).to.equal(item2);
        expect(el._elements.nativeSelect.value).to.equal(item2.value);

        item2.remove();

        expect(el.selectedItem).to.be.null;
        expect(el._elements.label.textContent).to.equal(el.placeholder);
      });
    });

    describe('#selectedItems', function() {
      it('should default to empty array', function() {
        expect(el.selectedItems).to.deep.equal([]);
      });

      it('should not be settable', function() {
        el.selectedItems = [item2];
        expect(el.selectedItems).to.deep.equal([]);
      });

      it('should return all the selected items when multiple', function() {
        el.multiple = true;

        item2.selected = true;
        item3.selected = true;

        expect(el.selectedItems).to.deep.equal([item2, item3]);
        expect(el._elements.taglist.values).to.deep.equal(['2', '3']);
      });

      it('should return an array when a single item when single', function() {
        item2.selected = true;
        // only the second one will stay because multiple=false
        item3.selected = true;

        expect(el.selectedItems).to.deep.equal([item3]);
      });
    });

    describe('#multiple', function() {
      it('should default to false', function() {
        expect(el.multiple).to.be.false;

        expect(el._elements.nativeSelect.multiple).to.be.false;
        expect(el._elements.list.multiple).to.be.false;
      });

      it('should not allow multiple selection when false', function() {
        item2.selected = true;
        item3.selected = true;

        expect(el.selectedItem).to.equal(item3);
        expect(el.selectedItems.length).to.equal(1);
        expect(el._elements.nativeSelect.selectedOptions.length).to.equal(1);
        expect(el._elements.list.selectedItems.length).to.equal(1);
        expect(el._elements.taglist.items.length).to.equal(0);
      });

      it('should allow multiple selection when true', function(done) {
        el.multiple = true;

        // since the item was already initialized and is ready, it was initialized as multiple=false, meaning that it
        // had to find a candidate for selection
        item1.selected = false;
        item2.selected = true;
        item3.selected = true;

        helpers.next(function() {
          expect(el.selectedItem).to.equal(item2, 'item2 should be selected because it is the first selected one');
          expect(el.selectedItems).to.deep.equal([item2, item3], 'both items should be selected');

          expect(el.value).to.equal('2', 'value matches item2');
          expect(el.values).to.deep.equal(['2', '3']);

          // we check the internals to make sure the selection is correct
          expect(el._elements.nativeSelect.selectedOptions.length).to.equal(2);
          expect(el._elements.list.selectedItems.length).to.equal(2);
          expect(el._elements.taglist.items.length).to.equal(2);
          done();
        });
      });

      it('should transform single selected items to multiple correctly', function() {
        expect(el.selectedItem).to.equal(null, 'no initial selection due to placeholder');
        item2.selected = true;

        expect(el._elements.input.value).to.equal(item2.value);
        expect(el._elements.taglist.value).to.equal('');

        // when multiple = false, all items are visible
        el._elements.list.items.getAll().forEach(function(item) {
          expect(item.hidden).to.equal(false, 'all selectlist items should be visible');
        });

        el.multiple = true;

        var tags = el._elements.taglist.items.getAll();

        expect(tags.length).to.equal(1, 'there should be 1 tag');
        expect(tags[0].value).to.equal(item2.value);
        expect(tags[0].textContent).to.equal(item2.textContent);

        // when multiple = true, selected items are hidden
        el.items.getAll().forEach(function(item) {
          expect(item._elements.selectListItem.hidden).to.equal(item.selected, 'hidden should match the selection');
        });
      });

      it('should not have tags and multiple selected options when multiple is switched to single', function(done) {
        el.multiple = true;

        expect(el.selectedItem).to.equal(null, 'no initial selection due to placeholder');

        item2.selected = true;
        item3.selected = true;

        helpers.next(function() {
          expect(el.selectedItem).to.equal(item2, 'item2 should be selected because it is the first selected one.');
          expect(el.selectedItems).to.deep.equal([item2, item3], 'Both items should be selected');

          expect(el.value).to.equal('2', 'there should be the value two');
          expect(el.values).to.deep.equal(['2', '3'], 'there should be the array with value two and three');

          // we check the internals to make sure the selection is correct
          // expect(el._elements.nativeSelect.selectedOptions.length).to.equal(2, 'there should be two selected options');
          expect(el._elements.list.selectedItems.length).to.equal(2, 'there should be two selected items');
          expect(el._elements.taglist.items.length).to.equal(2, 'there should be two taglist items');

          // when multiple = true, selected items are hidden
          el._elements.list.items.getAll().forEach(function(item) {
            if (item.selected) {
              expect(item.hidden).to.equal(true, 'selected items should be hidden in the selectlist');
            }
            else {
              expect(item.hidden).to.equal(false, 'non selected items be visible in the selectlist');
            }
          });

          helpers.next(function() {
            el.multiple = false;

            // we check the internals to make sure the selection is correct
            expect(el.selectedItem).to.equal(item3, 'the last item should remain selected');
            expect(el.selectedItems).to.deep.equal([item3]);

            expect(el.value).to.equal('3');
            expect(el.values).to.deep.equal(['3']);

            // expect(el._elements.nativeSelect.selectedOptions.length).to.equal(1, 'there should be one selected option');
            expect(el._elements.list.selectedItems.length).to.equal(1, 'there should be one selected item');
            expect(el._elements.taglist.items.length).to.equal(0, 'there should be zero taglist items');

            // when multiple = false, all items are visible
            el._elements.list.items.getAll().forEach(function(item) {
              expect(item.hidden).to.equal(false, 'all items should be visible in the selectlist');
            });

            helpers.next(function() {
              // now instead of showing 'Select', the actual item needs to be shown
              expect(el._elements.label.textContent).to.equal(item3.content.textContent);

              done();
            });
          });
        });
      });

      it('should have tags when switched from single to multiple', function(done) {
        expect(el.multiple).to.be.false;

        // changes selection to 2nd item
        item2.selected = true;

        helpers.next(function() {
          expect(el.selectedItem).to.equal(item2);
          expect(el.selectedItems).to.deep.equal([item2]);

          expect(el.value).to.equal('2', 'there should be the value of the 2nd item');
          expect(el.values).to.deep.equal(['2'], 'there should be the array with value of the 2nd item');

          // we check the internals to make sure the selection is correct
          // expect(el._elements.nativeSelect.selectedOptions.length).to.equal(1, 'there should be one selected option');
          expect(el._elements.list.selectedItems.length).to.equal(1, 'there should be one selected item');
          expect(el._elements.taglist.items.length).to.equal(0, 'there should be zero taglist items');

          helpers.next(function() {
            el.multiple = true;

            expect(el.selectedItem).to.equal(item2);
            expect(el.selectedItems).to.deep.equal([item2]);

            expect(el.value).to.equal('2', 'there should be the value two');
            expect(el.values).to.deep.equal(['2'], 'there should be the array with value two');

            // we check the internals to make sure the selection is correct
            // expect(el._elements.nativeSelect.selectedOptions.length).to.equal(1, 'there should be one selected option');
            expect(el._elements.list.selectedItems.length).to.equal(1, 'there should be one selected item');
            expect(el._elements.taglist.items.length).to.equal(1, 'there should be one taglist items');

            done();
          });
        });
      });

      it('should allow inserting new items', function(done) {
        el.multiple = true;

        var itemCount = el._elements.list.items.length;

        var item4 = el.items.add({
          content: {
            textContent: 'Item 4'
          },
          value: '4',
          // new item starts selected
          selected: true
        });

        expect(el.selectedItem).to.equal(item4);
        expect(el.selectedItems).to.deep.equal([item4]);

        helpers.next(function() {
          expect(item4._elements.selectListItem.hidden).to.be.true;

          expect(el._elements.list.items.length).to.equal(itemCount + 1);
          expect(el._elements.taglist.items.length).to.equal(1);

          done();
        });
      });
    });

    describe('#value', function() {
      it('should default to empty string, if select is empty', function(done) {
        el.items.clear();

        helpers.next(function() {
          expect(el.value).to.equal('');

          done();
        });
      });

      it('should default to empty string when there is a placeholder', function() {
        expect(el.value).to.equal('');
        expect(el.getAttribute('value')).not.to.equal('value should not be reflected');
      });

      it('should default to the first item when there is no placeholder', function(done) {
        el.placeholder = '';

        // selection will happen in the sync when the placeholder detects there is no valid value
        helpers.next(function() {
          expect(el.value).to.equal(item1.value, 'value should default to the first item');
          expect(el.getAttribute('value')).not.to.equal('value should not be reflected');
          expect(el._elements.nativeSelect.value).to.equal(item1.value);

          done();
        });
      });

      it('should allow to set the value', function() {
        el.value = '2';
        expect(item2.selected).to.be.true;
        expect(el.selectedItem).to.equal(item2);
      });

      it('should allow to set the value even if the select is not attached to dom so far', function() {
        var myEl = new Coral.Select();
        var myItem1 = new Coral.Select.Item();
        var myItem2 = new Coral.Select.Item();

        myItem1.content.innerHTML = 'Item 1';
        myItem1.value = '1';
        myItem2.content.innerHTML = 'Item 2';
        myItem2.value = '2';

        // adds the item to the select
        myEl.items.add(myItem1);
        myEl.items.add(myItem2);

        myEl.value = '2';

        expect(myItem2.selected).to.be.true;
        expect(myEl.selectedItem).to.equal(myItem2);

        helpers.target.appendChild(myEl);
      });

      it('should be updated if we select a value', function(done) {
        item3.selected = true;
        expect(el.selectedItem).to.equal(item3);
        expect(el.value).to.equal(item3.value);

        // selected needs to sync
        helpers.next(function() {
          expect(el.selectedItem).to.equal(item3);
          expect(el.value).to.equal(item3.value);

          done();
        });
      });

      it('should accept empty string', function() {
        // we select something to force a value
        item2.selected = true;

        expect(el.value).to.equal(item2.value);

        el.value = '';

        expect(el.value).to.equal('');
        expect(el.selectedItem).to.be.null;
      });

      it('should ignore invalid values', function() {
        el.value = '5';

        expect(el.value).to.equal('');
        expect(el.selectedItem).to.be.null;
      });

      it('should deselect the other items', function(done) {
        el.value = '2';

        helpers.next(function() {

          expect(el.value).to.equal('2');
          expect(item2.selected).to.be.true;
          expect(el.selectedItem).to.equal(item2);

          el.value = '3';

          helpers.next(function() {

            expect(el.value).to.equal('3');
            expect(item2.selected).to.be.false;
            expect(item3.selected).to.be.true;
            expect(el.selectedItem).to.equal(item3);

            done();
          });
        });
      });

      it('should selected the first item with the matching value', function(done) {
        // changes the value so that item2 and item3 share a value
        item3.value = '2';

        el.value = '2';

        helpers.next(function() {

          expect(el.value).to.equal('2');
          expect(item2.selected).to.be.true;
          // should be deselected because item2 was found first
          expect(item3.selected).to.be.false;

          done();
        });
      });

      it('should default to empty string when multiple', function(done) {
        el.multiple = true;

        helpers.next(function() {
          expect(el.value).to.equal('');
          done();
        });
      });

      it('should deselect all other items when multiple', function(done) {
        el.multiple = true;

        Coral.commons.ready(el, function() {
          el.value = '2';

          helpers.next(function() {

            expect(el.value).to.equal('2');
            expect(item2.selected).to.be.true;
            expect(el.selectedItem).to.equal(item2);
            expect(el.selectedItems).to.deep.equal([item2]);

            el.value = '3';

            helpers.next(function() {

              expect(el.value).to.equal('3');
              expect(item2.selected).to.be.false;
              expect(item3.selected).to.be.true;
              expect(el.selectedItem).to.equal(item3);
              expect(el.selectedItems).to.deep.equal([item3]);

              done();
            });
          });
        });
      });

      it('should default to empty string on invalid value', function(done) {
        el.multiple = true;

        // sets an invalid value
        el.value = '10';

        helpers.next(function() {
          // since the value was invalid, it should default to empty string
          expect(el.value).to.equal('');
          expect(el.selectedItem).to.be.null;
          expect(el.selectedItems).to.deep.equal([]);

          done();
        });
      });

      it('should put back the placeholder if value is set to empty string', function(done) {
        // sets the placeholder
        el.placeholder = 'placeholder';

        // sets an empty value
        el.value = '';

        helpers.next(function() {
          // since the value was empty, it should default to placeholder string
          expect(el._elements.label.textContent).to.equal(el.placeholder);

          done();
        });
      });

      it('should be empty if placeholder is set and no item is selected', function(done) {
        helpers.build(window.__html__['Coral.Select.placeholder.html'], function(el) {
          expect(el.selectedItems.length).to.equal(0);
          expect(el._elements.input.value).to.equal('');
          expect(el._elements.taglist.value).to.equal('');
          expect(el.value).to.equal('');

          done();
        });
      });
    });

    describe('#values', function() {
      it('should default to [] when there is a placeholder and multiple=false', function() {
        expect(el.placeholder).not.to.equal('');
        expect(el.values).to.deep.equal([]);
      });

      it('should ignore null', function() {
        item2.selected = true;

        expect(el.values).to.deep.equal(['2']);

        el.values = null;
        expect(el.values).to.deep.equal(['2']);

        el.values = undefined;
        expect(el.values).to.deep.equal(['2']);
      });

      it('should get an array with the first item when there is no placeholder and multiple=false', function(done) {
        // setting the placeholder as empty will cause the first item to be selected
        el.placeholder = '';

        helpers.next(function() {
          expect(el.values).to.deep.equal(['1']);

          done();
        });
      });

      it('should get an empty array by default when multiple=true', function() {
        el.multiple = true;
        expect(el.values.length).to.equal(0);
      });

      it('should only set the first value when multiple=false', function() {
        el.values = ['1', '3'];

        expect(el.value).to.equal('1');
        expect(el.values).to.deep.equal(['1']);

        expect(el.selectedItems.length).to.equal(1);
        expect(el._elements.nativeSelect.selectedOptions.length).to.equal(1);
        expect(el._elements.nativeSelect.selectedOptions[0].value).to.equal('1');
      });

      it('should be possible to set multiple values if multiple=true', function() {
        el.multiple = true;

        el.values = ['1', '3'];

        expect(el.selectedItems.length).to.equal(2);
        expect(el.values.length).to.equal(2);
        expect(el.values[0]).to.equal('1');
        expect(el.values[1]).to.equal('3');
        expect(el._elements.nativeSelect.selectedOptions.length).to.equal(2);
        expect(el._elements.nativeSelect.selectedOptions[0].value).to.equal('1');
        expect(el._elements.nativeSelect.selectedOptions[1].value).to.equal('3');
        expect(el._elements.list.selectedItems.length).to.equal(2);
        expect(el._elements.taglist.items.length).to.equal(2);
      });

      it('should deselect all values with empty array and multiple=true', function() {
        el.multiple = true;

        expect(el.values.length).to.equal(0);
        // selects 2 items to check if unselecting works
        el.values = ['2', '3'];

        // we check 2 items were properly selected
        expect(el.selectedItems.length).to.equal(2);
        // it should have 3 items
        expect(el.items.length).to.equal(3);

        // we clear all the items
        el.values = [];

        expect(el.selectedItems.length).to.equal(0);
        expect(el.value).to.equal('');
        expect(el.values.length).to.equal(0);
        expect(el._elements.nativeSelect.selectedOptions.length).to.equal(0);
        expect(el._elements.list.selectedItems.length).to.equal(0);
        expect(el._elements.taglist.items.length).to.equal(0);
      });

      it('should return [""] when an item has empty string as its value', function() {
        item1.value = '';
        item1.selected = true;

        expect(el.selectedItem).to.equal(item1);
        expect(el.value).to.equal('');
        expect(el.values).to.deep.equal(['']);
      });

      it('should allow selecting items with value as empty string', function() {
        item2.value = '';

        el.values = [''];

        expect(el.selectedItem).to.equal(item2);
        expect(el.values).to.deep.equal(['']);
      });
    });

    describe('#variant', function() {
      it('should be initially Coral.Select.variant.DEFAULT', function() {
        expect(el.variant).to.equal(Coral.Select.variant.DEFAULT);
        expect(el.hasAttribute('variant')).to.be.false;
        expect(el._elements.button.variant).to.equal('secondary');
      });

      it('should set the new variant', function(done) {
        el.variant = Coral.Select.variant.QUIET;

        expect(el.variant).to.equal('quiet');
        expect(el._elements.button.variant).to.equal('quiet');

        helpers.next(function() {
          expect(el.classList.contains('coral3-Select--quiet')).to.be.true;
          expect(el.classList.contains('coral3-Select')).to.be.true;

          done();
        });
      });

      it('should not add class for invalid variant', function(done) {
        el.variant = 'invalidvariant';

        expect(el.variant).to.equal(Coral.Select.variant.DEFAULT);

        helpers.next(function() {
          expect(el.classList.contains('coral3-Select--invalidvariant')).to.be.false;
          expect(el.classList.contains('coral3-Select')).to.be.true;

          done();
        });
      });
    });

    describe('#name', function() {
      it('should have empty string as default', function() {
        expect(el.name).to.equal('');
        expect(el._elements.input.name).to.equal('');
        expect(el._elements.taglist.name).to.equal('');
      });

      it('should submit nothing when name is not specified even though an item is selected', function(done) {

        // we wrap first the select
        var form = document.createElement('form');
        form.appendChild(el);
        helpers.target.appendChild(form);

        // we need to wait a frame because wrap detaches the elements
        helpers.next(function() {
          item2.selected = true;

          expect(el.selectedItems).to.deep.equal([item2]);
          expect(el._elements.taglist.name).to.equal('');
          expect(el._elements.input.name).to.equal('');

          var values = helpers.serializeArray(form);

          expect(values.length).to.equal(0);
          done();
        });
      });

      it('should set the name to the native select', function() {
        el.name = 'select';
        expect(el.name).to.equal('select');
        expect(el._elements.input.name).to.equal('select');
        expect(el._elements.taglist.name).to.equal('');
      });

      it('should submit the one single value', function(done) {

        // we wrap first the select
        var form = document.createElement('form');
        form.appendChild(el);
        helpers.target.appendChild(form);

        // we need to wait a frame because wrap detaches the elements
        helpers.next(function() {
          el.name = 'select';
          item2.selected = true;

          expect(el.name).to.equal('select');
          expect(el.selectedItems).to.deep.equal([item2]);
          expect(el._elements.input.name).to.equal('select');
          expect(el._elements.taglist.name).to.equal('');

          // the native has the correct value
          expect(el._elements.nativeSelect.value).to.equal(item2.value);

          expect(helpers.serializeArray(form)).to.deep.equal([{
            name: 'select',
            value: '2'
          }]);

          while (el.firstChild) {
            el.parentNode.insertBefore(el.firstChild, el);
          }

          done();
        });
      });

      it('should set the input value to the added selected item value', function(done) {
        var template = document.createElement('template');
        template.innerHTML = '<coral-select id="select"><coral-select-item value="abc" selected></coral-select-item></coral-select>';
        var frag = document.importNode(template.content, true);

        helpers.next(function() {
          helpers.target.appendChild(frag);
          helpers.next(function() {
            var el = document.getElementById('select');
            expect(el._elements.input.value).to.equal('abc');
            expect(el.value).to.equal(el._elements.input.value);
            done();
          });
        });
      });

      it('should submit multiple values when multiple', function(done) {
        // we make sure it is multiple
        el.multiple = true;

        // we wrap first the select
        var form = document.createElement('form');
        form.appendChild(el);
        helpers.target.appendChild(form);

        // we need to wait a frame because wrap detaches the elements
        helpers.next(function() {

          el.name = 'select';
          item2.selected = true;
          item3.selected = true;

          expect(el.name).to.equal('select');
          expect(el.selectedItems).to.deep.equal([item2, item3]);
          expect(el._elements.input.name).to.equal('');
          expect(el._elements.taglist.name).to.equal('select');

          helpers.next(function() {
            // the native has the first value
            expect(el._elements.nativeSelect.multiple).to.be.true;
            expect(el._elements.nativeSelect.value).to.equal(item2.value);

            expect(el._elements.nativeSelect.selectedOptions.length).to.equal(2);

            expect(helpers.serializeArray(form)).to.deep.equal([{
              name: 'select',
              value: '2'
            }, {
              name: 'select',
              value: '3'
            }]);

            while (el.firstChild) {
              el.parentNode.insertBefore(el.firstChild, el);
            }

            done();
          });
        });
      });
    });

    describe('#required', function() {});

    describe('#invalid', function() {});

    describe('#disabled', function() {});

    describe('#readOnly', function() {});

    describe('#labelledBy', function() {});

    describe('#loading', function() {});

    describe('#items', function() {
      // the select list item used in every test
      var el;
      var item1;
      var item2;
      var item3;

      beforeEach(function() {
        el = new Coral.Select();
        item1 = new Coral.Select.Item();
        item2 = new Coral.Select.Item();
        item3 = new Coral.Select.Item();

        item1.content.innerHTML = 'Item 1';
        item1.value = '1';
        item2.content.innerHTML = 'Item 2';
        item2.value = '2';
        item3.content.innerHTML = 'Item 3';
        item3.value = '3';

        helpers.target.appendChild(el);
      });

      it('should not be settable', function() {
        el.items = null;
        expect(el.items).not.to.equal(null, 'items is not settable');
      });

      describe('#add()', function() {
        it('should allow to add a selected item using object notation', function() {

          el.items.add(item1);
          el.items.add(item2);
          el.items.add(item3);

          item2.selected = true;

          expect(el.selectedItem).to.equal(item2);

          var item4 = el.items.add({
            content: {
              innerHTML: 'America'
            },
            disabled: false,
            selected: true
          });

          expect(item4).to.equal(el.selectedItem);

          expect(el.selectedItem.content.innerHTML).to.equal('America');
        });
      });
    });

    describe('#clear()', function() {
      it('should default value "" when placeholder is available', function(done) {
        expect(el.placeholder).not.to.equal('');

        item2.selected = true;
        expect(el.selectedItem).to.equal(item2);

        // waits for the placeholder's sync
        helpers.next(function() {
          expect(el._elements.label.textContent).to.equal(item2.textContent, 'label should be updated to the item');

          el.clear();

          expect(el.selectedItem).to.equal(null, 'no item should be selected');
          expect(el.value).to.equal('', 'new value should be empty string');

          // waits for the placeholder's sync
          helpers.next(function() {
            expect(el._elements.label.textContent).to.equal(el.placeholder, 'label should match the placeholder');

            done();
          });
        });
      });

      it('should default to the first item when placeholder is not available', function(done) {
        el.placeholder = '';

        item2.selected = true;
        expect(el.selectedItem).to.equal(item2);

        // waits for the placeholder's sync
        helpers.next(function() {
          expect(el._elements.label.textContent).to.equal(item2.textContent, 'label should be updated to the item');

          el.clear();

          expect(el.selectedItem).to.equal(item1, 'should automatically select the first item');
          expect(el.value).to.equal(item1.value, 'should have the value of the first item');

          // waits for the placeholder's sync
          helpers.next(function() {
            expect(el._elements.label.textContent).to.equal(item1.textContent, 'label should match the first item');

            done();
          });
        });
      });

      it('should produce value "" when multiple', function(done) {
        expect(el.placeholder).not.to.equal('');

        el.multiple = true;

        item2.selected = true;
        expect(el.selectedItem).to.equal(item2);

        // waits for the placeholder's sync
        helpers.next(function() {
          expect(el._elements.label.textContent).to.equal(el.placeholder, 'label should match the placeholder');

          el.clear();

          expect(el.selectedItem).to.equal(null, 'no item should be selected');
          expect(el.value).to.equal('');

          // waits for the placeholder's sync
          helpers.next(function() {
            expect(el._elements.label.textContent).to.equal(el.placeholder, 'label should match the placeholder');

            done();
          });
        });
      });
    });

    describe('#focus()', function() {
      it('should focus the button', function() {
        expect(document.activeElement).not.to.equal(el);
        // we focus the component
        el.focus();
        expect(el.contains(document.activeElement)).to.be.true;
      });

      it('should not shift focus if already inside the component ', function(done) {
        el.on('coral-overlay:open', function(event) {
          expect(document.activeElement).not.to.equal(el._elements.button);
          // we focus the component
          el.focus();
          expect(document.activeElement).not.to.equal(el._elements.button, 'focus should not be in the button');

          done();
        // we use capture since the propagation of the event is stopped
        }, true);

        // opens the overlay
        el._elements.button.click();
      });

      it('should not focus the button if it is disabled', function(done) {
        expect(document.activeElement).not.to.equal(el);

        el.disabled = true;

        // we wait a frame because disable is applied on a sync()
        helpers.next(function() {
          // we focus the component
          el.focus();
          expect(el.contains(document.activeElement)).to.be.false;
          expect(el).not.to.equal(document.activeElement);

          done();
        });
      });
    });
  });

  describe('Markup', function() {
    describe('#variant', function() {
      it('should not add class for empty variant', function(done) {
        helpers.build(window.__html__['Coral.Select.variant.empty.html'], function(el) {
          expect(el.variant).to.equal(Coral.Select.variant.DEFAULT);
          expect(el.getAttribute('variant')).to.equal('');
          expect(el.classList.contains('coral3-Select')).to.be.true;

          done();
        });
      });

      it('should not add class for invalid variant', function(done) {
        helpers.build(window.__html__['Coral.Select.variant.invalid.html'], function(el) {
          expect(el.variant).to.equal(Coral.Select.variant.DEFAULT);
          expect(el.getAttribute('variant')).to.equal('invalidvariant');
          expect(el.classList.contains('coral3-Select')).to.be.true;
          expect(el.classList.contains('coral3-Select--invalidvariant')).to.be.false;

          done();
        });
      });

      it('should remove variant classnames when variant changes', function(done) {
        helpers.build(window.__html__['Coral.Select.variant.quiet.html'], function(el) {
          expect(el.classList.contains('coral3-Select--quiet')).to.be.true;
          expect(el._elements.button.variant).to.equal('quiet');

          el.variant = Coral.Select.variant.DEFAULT;
          expect(el._elements.button.variant).to.equal(Coral.Button.variant.DEFAULT);

          // these need an extra frame to pass in IE11
          helpers.next(function() {
            expect(el.classList.contains('coral3-Select--default')).to.be.false;
            expect(el.classList.contains('coral3-Select--quiet')).to.be.false;
            expect(el._elements.button.variant).to.not.equal(Coral.Button.variant.QUIET);

            done();
          });
        });
      });
    });

    describe('#selectedItem', function() {
      it('should allow selecting items in the DOM', function(done) {
        helpers.build(window.__html__['Coral.Select.selected.html'], function(el) {
          expect(el.selectedItem.value).to.equal('eu');
          expect(el.selectedItems.length).to.equal(1);
          expect(el.value).to.equal('eu');
          expect(el.values).to.deep.equal(['eu']);

          done();
        });
      });

      it('should allow removing the selected item', function(done) {
        helpers.build(window.__html__['Coral.Select.selected.html'], function(el) {
          // removes 'Africa'
          el.selectedItem.remove();

          // selects 'Africa'
          el.items.getAll()[1].selected = true;

          expect(el.selectedItem.value).to.equal('af');
          expect(el.value).to.equal('af');
          expect(el.values).to.deep.equal(['af']);

          done();
        });
      });
    });

    describe('#selectedItems', function() {
      it('should allow selecting items in the DOM', function(done) {
        helpers.build(window.__html__['Coral.Select.multiple.selected.html'], function(el) {

          expect(el.selectedItem.value).to.equal('af');
          expect(el.selectedItems.length).to.equal(2);
          expect(el.value).to.equal('af');
          expect(el.values).to.deep.equal(['af', 'eu']);

          done();
        });
      });

      it('should allow removing the selected item', function(done) {
        helpers.build(window.__html__['Coral.Select.multiple.selected.html'], function(el) {
          // removes 'Africa'
          el.selectedItem.remove();

          helpers.next(function() {
            expect(el.selectedItem.value).to.equal('eu');
            expect(el.value).to.equal('eu');
            expect(el.values).to.deep.equal(['eu']);

            done();
          });
        });
      });
    });

    describe('#multiple', function() {
      it('should default to false', function(done) {
        helpers.build(window.__html__['Coral.Select.base.html'], function(el) {

          expect(el.multiple).to.be.false;
          expect(el.hasAttribute('multiple')).to.be.false;

          done();
        });
      });

      it('should remove the attribute', function(done) {
        helpers.build(window.__html__['Coral.Select.multiple.base.html'], function(el) {

          expect(el.multiple).to.be.true;
          expect(el.hasAttribute('multiple')).to.be.true;

          el.multiple = false;

          helpers.next(function() {
            expect(el.hasAttribute('multiple')).to.be.false;

            done();
          });
        });
      });

      it('should allow multiple selection when true', function(done) {
        helpers.build(window.__html__['Coral.Select.multiple.selected.html'], function(el) {
          var items = el.items.getAll();

          expect(el.multiple).to.be.true;

          expect(el.selectedItem).to.equal(items[1], 'Should return the first selected item when multiple');
          expect(el.selectedItems).to.deep.equal([items[1], items[3]]);

          expect(el.value).to.equal(items[1].value, 'value matches item2');
          expect(el.values).to.deep.equal([items[1].value, items[3].value]);

          expect(el._elements.nativeSelect.selectedOptions.length).to.equal(2);
          expect(el._elements.nativeSelect.selectedOptions[0].value).to.equal('af');
          expect(el._elements.nativeSelect.selectedOptions[1].value).to.equal('eu');

          expect(el._elements.list.selectedItems.length).to.equal(2);

          el._elements.list.selectedItems.forEach(function(value) {
            expect(value.hidden).to.be.true;
            expect(value.selected).to.be.true;
          });

          expect(el._elements.taglist.items.length).to.equal(2, 'tags must have been created for the selected items');

          done();
        });
      });
    });

    describe('#placeholder', function() {
      it('should show placeholder when there is no selection', function(done) {
        helpers.build(window.__html__['Coral.Select.placeholder.html'], function(el) {
          expect(el.selectedItem).to.be.null;
          expect(el._elements.label.textContent).to.equal('Placeholder');

          done();
        });
      });

      it('should update the label to the selected item when there is selection', function(done) {
        helpers.build(window.__html__['Coral.Select.placeholder.selected.html'], function(el) {
          var item = el.items.getAll()[2];
          expect(el.selectedItem).to.equal(item);
          expect(el._elements.label.textContent).to.equal(item.textContent, 'label should match the selected item');

          done();
        });
      });

      it('should show the placeholder when there is no selection and multiple=true', function(done) {
        helpers.build(window.__html__['Coral.Select.placeholder.multiple.html'], function(el) {
          expect(el.selectedItem).to.equal(null, 'no selected item');
          expect(el._elements.label.textContent).to.equal(el.placeholder, 'label should match the placeholder');

          done();
        });
      });

      it('should show the placeholder when there is selection and multiple=true', function(done) {
        helpers.build(window.__html__['Coral.Select.placeholder.multiple.selected.html'], function(el) {
          var item = el.items.getAll()[2];
          expect(el.selectedItem).to.equal(item);
          expect(el._elements.label.textContent).to.equal(el.placeholder, 'label should match the placeholder');

          done();
        });
      });

      // case 7: !p +  m +  se = 'Select'
      it('should say "Select" in the label if multiple and has a selected item', function(done) {
        helpers.build(window.__html__['Coral.Select.multiple.selected.html'], function(el) {
          var items = el.items.getAll();

          expect(el.placeholder).to.equal('');
          expect(el.selectedItem).to.equal(items[1]);
          expect(el.selectedItems).to.deep.equal([items[1], items[3]]);

          expect(el._elements.label.textContent).to.equal('Select');

          done();
        });
      });
    });

    describe('#value', function() {
      it('should be possible to set the value using markup (in single mode)', function(done) {
        helpers.build(window.__html__['Coral.Select.value.html'], function(el) {
          expect(el.selectedItems.length).to.equal(1, 'one item should be selected');
          expect(el.values.length).to.equal(1, 'one value should be set');
          expect(el.selectedItems[0].value).to.equal('oc', '"oc" should be the value of the selected item');
          expect(el.values).to.contain('oc', '"oc" should be one value');
          expect(el.value).to.equal('oc', '"oc" should be set as value');

          done();
        });
      });

      it('should be possible to set the value using markup (in multi mode)', function(done) {
        helpers.build(window.__html__['Coral.Select.multiple.value.selected.html'], function(el) {
          // Setting a select.value will force all other selected items to be deselected => only one item is selected
          expect(el.selectedItems.length).to.equal(1, 'one item should be selected');
          expect(el.values.length).to.equal(1, 'one value should be set');
          expect(el.selectedItems[0].value).to.equal('oc', '"oc" should be the value of the selected item');
          expect(el.values).to.contain('oc', '"oc" should be one value');
          expect(el.value).to.equal('oc', '"oc" should be set as value');

          done();
        });
      });

      it('should default to value of first item, if no items are selected', function(done) {
        helpers.build(window.__html__['Coral.Select.base.html'], function(el) {
          expect(el.value).to.equal('am');
          done();
        });
      });

      it('should return the value of the selected item', function(done) {
        helpers.build(window.__html__['Coral.Select.base.html'], function(el) {

          var item2 = el.items.getAll()[1];
          expect(item2.value).to.equal('af');

          el.value = 'af';

          helpers.next(function() {
            expect(el.value).to.equal(item2.value);
            expect(el.selectedItem).to.equal(item2);
            done();
          });
        });
      });

      it('should default to empty string when multiple', function(done) {
        helpers.build(window.__html__['Coral.Select.multiple.base.html'], function(el) {
          expect(el.value).to.equal('');
          expect(el.selectedItem).to.be.null;
          done();
        });
      });
    });

    describe('#values', function() {
      it('should ignore the values attribute', function(done) {
        helpers.build(window.__html__['Coral.Select.multiple.base.html'], function(el) {
          expect(el.selectedItem).to.be.null;
          expect(el.selectedItems.length).to.equal(0);
          expect(el.values).to.deep.equal([]);
          expect(el.value).to.equal('');

          done();
        });
      });

      it('should be possible to get values set in markup', function(done) {
        helpers.build(window.__html__['Coral.Select.multiple.selected.html'], function(el) {
          expect(el.selectedItems.length).to.equal(2);
          expect(el.values.length).to.equal(2);
          expect(el.values[0]).to.equal('af');
          expect(el.values[1]).to.equal('eu');

          done();
        });
      });
    });

    // name is tested with the formField
    describe('#name', function() {});

    describe('#required', function() {});

    describe('#invalid', function() {});

    describe('#disabled', function() {});

    describe('#readOnly', function() {});

    describe('#labelledBy', function() {});

    describe('#loading', function() {});

    describe('#items', function() {});

    describe('#reset()', function() {
      it('should reset the select if reset() is called', function(done) {
        helpers.build(window.__html__['Coral.Select.multiple.selected.html'], function(el) {
          var selectedItems = el.selectedItems;
          var af = selectedItems[0];
          var eu = selectedItems[1];

          expect(el.values.length).to.equal(2, 'two elements should be selected by default');
          expect(el.selectedItems).to.deep.equal([af, eu]);
          expect(el._initialValues.length).to.equal(2, 'two elements should be selected by default (stored internally)');

          el.value = '';
          expect(el.values.length).to.equal(0, 'should have cleared the selection');
          expect(el.selectedItems).to.deep.equal([]);

          el.reset();
          expect(el.values.length).to.equal(2, 'the default elements should be selected again');
          expect(el.selectedItems).to.deep.equal([af, eu]);

          done();
        });
      });

      it('should allow removing an initial value', function(done) {
        helpers.build(window.__html__['Coral.Select.multiple.selected.html'], function(el) {
          var selectedItems = el.selectedItems;
          var af = selectedItems[0];
          var eu = selectedItems[1];

          expect(el.values.length).to.equal(2, 'two elements should be selected by default');
          expect(el.selectedItems).to.deep.equal([af, eu]);
          expect(el._initialValues.length).to.equal(2, 'two elements should be selected by default (stored internally)');

          // removes one of the initial values
          af.remove();

          // we need to wait for the MO to detect the element removal
          helpers.next(function() {
            expect(el._initialValues.length).to.equal(1, 'one item should be removed from the initial selection');

            el.value = '';

            el.reset();
            expect(el.values.length).to.equal(1);

            done();
          });
        });
      });
    });
  });

  // @todo: test multiple
  describe('Events', function() {
    // @todo: test these events
    describe('#coral-select:showitems', function() {});

    describe('#coral-select:hideitems', function() {});

    describe('#change', function() {
      it('should not trigger change while setting values programatically', function(done) {
        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.Select.base.html'], function(el) {

          el.on('change', changeSpy);

          expect(changeSpy.callCount).to.equal(0);

          el.items.getAll()[1].selected = true;
          expect(el.value).to.equal('af');

          expect(changeSpy.callCount).to.equal(0);
          done();
        });
      });

      it('should not trigger change setting the value', function(done) {
        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.Select.base.html'], function(el) {

          el.on('change', changeSpy);

          expect(changeSpy.callCount).to.equal(0);

          el.value = 'af';

          expect(el.value).to.equal('af');

          expect(changeSpy.callCount).to.equal(0);
          done();
        });
      });

      it('should trigger change if the user interacts with the selectlist', function(done) {
        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.Select.base.html'], function(el) {
          el.on('change', changeSpy);

          var callback = function() {
            if (!el._useNativeInput) {
              expect(el._elements.overlay.open).to.be.true;
              expect(helpers.visible(el._elements.overlay)).to.be.true;
            }

            expect(changeSpy.callCount).to.equal(0);

            // selects the 2nd item in the list
            // as change is only triggered on real user interaction, we have to fake the interaction
            if (el._useNativeInput) {
              var dummyOptions = [el._elements.nativeSelect.children[1]];
              dummyOptions.item = function(index) {
                return dummyOptions[index];
              };
              var dummyEvent = {
                stopImmediatePropagation: function() {},
                target: {
                  selectedOptions: dummyOptions
                }
              };
              el._onNativeSelectChange(dummyEvent);
            }
            else {
              el._elements.list.items.getAll()[1].click();
            }

            helpers.next(function() {
              expect(el.value).to.equal('af');

              expect(changeSpy.callCount).to.equal(1);
              done();
            });
          };

          if (!el._useNativeInput) {
            // Overlay does not open immediately any longer
            el.on('coral-overlay:open', callback, true);

            // opens the overlay (forces a change event to be triggered on next select)
            el._elements.button.click();
          }
          else {
            callback();
          }
        });
      });

      it('should not trigger change if the user selects the same item', function(done) {
        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.Select.base.html'], function(el) {
          el.on('change', changeSpy);

          var openEventCount = 0;
          el.on('coral-overlay:open', function() {
            if (openEventCount === 0) {
              expect(changeSpy.callCount).to.equal(0);
              // selects the 2nd item in the list
              el._elements.list.items.getAll()[1].click();
              expect(el.value).to.equal('af');
              expect(changeSpy.callCount).to.equal(1);

              // opens the overlay again
              el._elements.button.click();
            }
            else if (openEventCount === 1) {
              expect(changeSpy.callCount).to.equal(1, 'selecting an item again must not trigger a change event');
              // selects the 2nd item in the list
              el._elements.list.items.getAll()[1].click();
              // value must be the same
              expect(el.value).to.equal('af');
              // change must not be triggered for the same item
              expect(changeSpy.callCount).to.equal(1);

              done();
            }

            openEventCount++;
          }, true);

          // opens the overlay the first time
          el._elements.button.click();
        });
      });

      it('should not trigger new change while we are updating items in the change callback', function(done) {
        helpers.build(window.__html__['Coral.Select.base.html'], function(el) {
          var changeCallbackCount = 0;
          el.on('change', function() {
            changeCallbackCount++;
            el._elements.list.items.getAll()[2].click();
          });

          el.on('coral-overlay:open', function() {
            // selects the 2nd item in the list
            el._elements.list.items.getAll()[1].click();
            expect(el.value).to.equal('as');
            expect(changeCallbackCount).to.equal(1);

            done();
          }, true);

          // opens the overlay
          el._elements.button.click();
        });
      });

      it('should trigger a change event when a tag is removed', function(done) {
        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.Select.multiple.base.html'], function(el) {
          el.on('change', changeSpy);

          var items = el.items.getAll();

          // selects 2 items
          items[1].selected = true;
          items[3].selected = true;

          // no change event since the selection was done programatically
          expect(changeSpy.callCount).to.equal(0);

          // we need to wait in polyfilled environments for the values to be initialized
          helpers.next(function() {
            // checks that the corresponding tags were created
            expect(el._elements.taglist.values).to.deep.equal(['af', 'eu']);

            // clicks on the close button of the tag
            el._elements.taglist.items.getAll()[0]._elements.button.click();

            helpers.next(function() {
              // change event must be triggered
              expect(changeSpy.callCount).to.equal(1);

              // makes sure the target is correct
              expect(changeSpy.getCall(0).calledWithMatch({
                target: el
              })).to.be.true;

              expect(el.selectedItems).to.deep.equal([items[3]]);
              expect(el.value).to.equal('eu');
              expect(el.values).to.deep.equal(['eu']);

              done();
            });
          });
        });
      });

      it('should trigger change if the user interacts with the native select', function(done) {
        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.Select.base.html'], function(el) {
          el.on('change', changeSpy);

          var items = el.items.getAll();

          // we fake the native input
          el._useNativeInput = true;
          el.classList.add('coral3-Select--native');
          el.appendChild(el._elements.nativeSelect);

          var options = el._elements.nativeSelect.options;
          options[2].selected = true;

          dispatchChangeEvent(el._elements.nativeSelect);

          expect(changeSpy.callCount).to.equal(1);
          expect(changeSpy.getCall(0).args[0].target).to.equal(el, 'change event must be reparented');

          expect(el.selectedItem).to.equal(items[2]);
          expect(el.value).to.equal(items[2].value);

          expect(document.activeElement).to.equal(el._elements.button, 'focus should be on the button');

          done();
        });
      });

      it('should trigger change if the user interacts with the native select and multiple=true', function(done) {
        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.Select.multiple.base.html'], function(el) {
          el.on('change', changeSpy);

          var items = el.items.getAll();

          // we fake the native input
          el._useNativeInput = true;
          el.classList.add('coral3-Select--native');
          el.appendChild(el._elements.nativeSelect);

          var options = el._elements.nativeSelect.options;

          options[2].selected = true;
          dispatchChangeEvent(el._elements.nativeSelect);

          expect(changeSpy.callCount).to.equal(1);
          expect(changeSpy.getCall(0).args[0].target).to.equal(el);
          expect(changeSpy.getCall(0).args[0].target.values).to.deep.equal([items[2].value]);
          expect(changeSpy.getCall(0).args[0].target.selectedItems).to.deep.equal([items[2]]);

          options[4].selected = true;
          dispatchChangeEvent(el._elements.nativeSelect);

          expect(changeSpy.callCount).to.equal(2);
          expect(changeSpy.getCall(1).args[0].target.values).to.deep.equal([items[2].value, items[4].value]);
          expect(changeSpy.getCall(1).args[0].target.selectedItems).to.deep.equal([items[2], items[4]]);

          options[2].selected = false;
          dispatchChangeEvent(el._elements.nativeSelect);
          expect(changeSpy.callCount).to.equal(3);
          expect(changeSpy.getCall(2).args[0].target.values).to.deep.equal([items[4].value]);
          expect(changeSpy.getCall(2).args[0].target.selectedItems).to.deep.equal([items[4]]);

          expect(document.activeElement).not.to.equal(el._elements.button, 'focus not should be on the button');

          done();
        });
      });
    });
  });

  // TODO: Failing in scoped release (weird race conditions with activeElement)
  describe('User Interaction', function() {
    // @todo: add tests for space key
    // @todo: add tests for key down
    // @todo: add tests for tab key
    // @todo: add tests for global click
    // @todo: add tests for scrolling at the bottom of the list
    describe.skip('Removing the selected item', function() {
      // TODO: Failing in scoped release
      it('should not cause an error with single selection', function(done) {
        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.Select.selected.html'], function(el) {
          el.on('change', changeSpy);

          el.on('coral-overlay:open', function() {
            // we remove the selected item
            el.selectedItem.remove();

            // no change event should have been triggered
            expect(changeSpy.callCount).to.equal(0);

            helpers.next(function() {
              // selects the item on index 1 ("Africa")
              el._elements.list.items.getAll()[1].click();

              expect(el.selectedItem.value).to.equal('af');
              expect(el.selectedItems.length).to.equal(1);
              expect(el.value).to.equal('af');
              expect(el.values).to.deep.equal(['af']);

              expect(changeSpy.callCount).to.equal(1);
              expect(changeSpy.getCall(0).args[0].target.value).to.equal('af');
              expect(changeSpy.getCall(0).args[0].target.values).to.deep.equal(['af']);

              done();
            });
          }, true);

          // opens the list
          el._elements.button.click();
        });
      });
      // TODO: Failing in scoped release
      it('should not cause an error with multiple selection', function(done) {
        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.Select.multiple.selected.html'], function(el) {
          el.on('change', changeSpy);

          var totalItems = el.items.length;
          var totalSelectedItems = el.selectedItems.length;

          el.on('coral-overlay:open', function() {
            // we remove the selected item ("Africa")
            el.selectedItem.remove();

            // no change event should have been triggered
            expect(changeSpy.callCount).to.equal(0);

            helpers.next(function() {
              // checks the item was properly removed
              expect(el.items.length).to.equal(totalItems - 1);
              expect(el._elements.nativeSelect.options.length).to.equal(totalItems - 1);
              expect(el._elements.list.items.length).to.equal(totalItems - 1);
              expect(el._elements.taglist.items.length).to.equal(totalSelectedItems - 1);

              // makes sure it actually opened
              expect(el._elements.overlay.open).to.be.true;

              // selects the item on index 1 ("Asia")
              el._elements.list.items.getAll()[1].click();

              helpers.next(function() {
                expect(el.selectedItem.value).to.equal('as', 'selectedItem should match the first item');
                expect(el.selectedItems.length).to.equal(2);

                // values may be inverted because the taglist appends them
                expect(el.value).to.equal('eu');
                expect(el.values).to.deep.equal(['eu', 'as']);

                expect(changeSpy.callCount).to.equal(1);
                expect(changeSpy.getCall(0).args[0].target.value).to.equal('eu');
                expect(changeSpy.getCall(0).args[0].target.values).to.deep.equal(['eu', 'as']);

                done();
              });
            });
          }, true);

          // opens the list
          el._elements.button.click();
        });
      });
    });

    describe.skip('Placeholder', function() {
      it('should be updated when an item is clicked', function(done) {
        helpers.build(window.__html__['Coral.Select.placeholder.html'], function(el) {
          // all the available items
          var items = el.items.getAll();

          // we handle the event instead of assuming that it opens the next frame
          el.on('coral-overlay:open', function() {
            // selects the item on index 1
            el._elements.list.items.getAll()[1].click();
            expect(el.selectedItem).to.equal(items[1]);

            helpers.next(function() {
              // makes sure the placeholder was successfully set
              expect(el._elements.label.innerHTML).to.equal(items[1].content.innerHTML);

              done();
            });
          }, true);

          // opens the list
          el._elements.button.click();
        });
      });

      it('should allow removing the selected item', function(done) {
        helpers.build(window.__html__['Coral.Select.placeholder.html'], function(el) {
          // all the available items
          var items = el.items.getAll();
          var itemCount = items.length;

          var secondOpen = function() {
            // there is now one item less in the selectlist
            expect(el._elements.list.items.length).to.equal(itemCount - 1);
            // it should show now the placeholder
            expect(el._elements.label.textContent).to.equal('Placeholder');
            // selects the item on index 1
            el._elements.list.items.getAll()[1].click();
            // selected item should match selectedItem
            expect(el.selectedItem).to.equal(items[2]);

            done();
          };

          // first open selects an item
          var firstOpen = function() {
            // we need to remove the listener since the overlay will be open again
            el.off('coral-overlay:open', firstOpen);

            // selects the item on index 1, this will cause the overlay to close
            el._elements.list.items.getAll()[1].click();

            expect(el.selectedItem).to.equal(items[1]);

            // waits for the placeholder's
            helpers.next(function() {
              expect(el._elements.label.innerHTML).to.equal(items[1].content.innerHTML);

              // we remove the selected item
              items[1].remove();

              expect(el.selectedItem).to.be.null;
              // we have one item less in the collection
              expect(el.items.length).to.equal(itemCount - 1);

              el.on('coral-overlay:open', secondOpen, true);

              // opens the list again
              el._elements.button.click();
            });
          };

          el.on('coral-overlay:open', firstOpen, true);

          // opens the list
          el._elements.button.click();
        });
      });

      it('should update the placeholder when the content of the selectedItem changes', function(done) {
        helpers.build(window.__html__['Coral.Select.base.html'], function(el) {
          // we look for an item to select
          var item = el.items.last();
          item.selected = true;

          helpers.next(function() {
            expect(el.selectedItem).to.equal(item);
            expect(el._elements.label.textContent).to.equal(item.content.textContent);

            item.content.textContent = 'New Content';

            // we wait for the MO to trigger
            helpers.next(function() {
              // after the MO change, we wait for the placeholder and selectedItem sync
              helpers.next(function() {
                expect(el._elements.label.textContent).to.equal('New Content');

                done();
              });
            });
          });
        });
      });
    });

    it('should be tabbable', function(done) {
      var el = new Coral.Select();
      helpers.target.appendChild(el);

      Coral.commons.ready(el, function() {
        expect(el._elements.button.tabIndex).to.equal(0);
        done();
      });
    });

    it.skip('should remove selected items using the taglist when multiple=true', function(done) {
      helpers.build(window.__html__['Coral.Select.multiple.selected.html'], function(el) {
        expect(el.multiple).to.equal(true);
        // number of currently selected items
        var selectedItemCount = el.selectedItems.length;
        // we get all the selected tags
        var tags = el._elements.taglist.items.getAll();
        // we remove the a tag through interaction, which causes the taglist to trigger a change event
        tags[0]._elements.button.click();

        helpers.next(function() {
          expect(el.selectedItems.length).to.equal(selectedItemCount - 1);

          // makes sure the items inside the selectlist have the correct visibility
          el.items.getAll().forEach(function(item) {
            expect(item._elements.selectListItem.hidden).to.equal(item.selected, 'hidden should match the selection');
          });

          done();
        });
      });
    });

    it.skip('should focus the button when an item is selected', function(done) {
      helpers.build(window.__html__['Coral.Select.placeholder.html'], function(el) {
        el.on('coral-overlay:open', function() {
          // selects the 2nd item in the list
          el._elements.list.items.getAll()[1].click();

          // we wait for the nextFrame that focuses the button
          helpers.next(function() {
            expect(document.activeElement).to.equal(el._elements.button);

            done();
          });
        }, true);

        // opens the overlay
        el._elements.button.click();
      });
    });

    it.skip('should focus the button when the selected item is clicked again', function(done) {
      helpers.build(window.__html__['Coral.Select.placeholder.html'], function(el) {
        el.on('coral-overlay:open', function() {
          var selectListItems = el._elements.list.items.getAll();

          expect(selectListItems[2].selected).to.be.true;
          selectListItems[2].click();

          // we wait for the nextFrame that focuses the button
          helpers.next(function() {
            expect(document.activeElement).to.equal(el._elements.button);

            done();
          });
        }, true);

        // we select first an item
        el.items.getAll()[2].selected = true;

        // opens the overlay
        el._elements.button.click();
      });
    });

    it.skip('should focus the button when it is toggled', function(done) {
      helpers.build(window.__html__['Coral.Select.placeholder.html'], function(el) {
        el.on('coral-overlay:open', function() {

          // we click the button again to toggle the overlay
          el._elements.button.click();

          // we wait for the nextFrame that focuses the button
          helpers.next(function() {
            expect(document.activeElement).to.equal(el._elements.button);

            done();
          });
        }, true);

        // opens the overlay
        el._elements.button.click();
      });
    });

    // this behavior matches the native select
    it.skip('should focus the button when the overlay is open and the user clicks outside', function(done) {
      helpers.build(window.__html__['Coral.Select.placeholder.html'], function(el) {
        el.on('coral-overlay:open', function() {
          // we simulate a click somewhere else in the page
          document.body.click();

          // we wait for the nextFrame that focuses the button
          helpers.next(function() {
            expect(document.activeElement).to.equal(el._elements.button);

            done();
          });
        }, true);

        // opens the overlay
        el._elements.button.click();
      });
    });

    it.skip('should focus the button when an item is selected and multiple=true', function(done) {
      helpers.build(window.__html__['Coral.Select.placeholder.multiple.html'], function(el) {
        el.on('coral-overlay:open', function() {
          // selects the 2nd item in the list
          el._elements.list.items.getAll()[1].click();

          // we wait for the nextFrame that focuses the button
          helpers.next(function() {
            expect(document.activeElement).to.equal(el._elements.button);

            done();
          });
        }, true);

        // opens the overlay
        el._elements.button.click();
      });
    });

    it.skip('should focus the taglist when the last tag is removed', function(done) {
      helpers.build(window.__html__['Coral.Select.multiple.selected.html'], function(el) {
        expect(el._elements.taglist.items.length).to.equal(2, 'there should be one item');

        // we removed the first item as if it were through user interaction
        el._elements.taglist.items.getAll()[0]._elements.button.click();

        helpers.next(function() {
          expect(document.activeElement).not.to.equal(el._elements.button, 'focus should not be in the button');

          // removes the second item which should cause the focus to go back to the button
          el._elements.taglist.items.getAll()[0]._elements.button.click();

          helpers.next(function() {
            expect(document.activeElement).to.equal(el._elements.button, 'button should get focus when it is the last item');

            done();
          });
        });
      });
    });

    it.skip('should focus the button when user interacts with the native select', function(done) {
      helpers.build(window.__html__['Coral.Select.base.html'], function(el) {
        // we fake the native input
        el._useNativeInput = true;
        el.classList.add('coral3-Select--native');
        el.appendChild(el._elements.nativeSelect);

        var options = el._elements.nativeSelect.options;
        options[2].selected = true;

        dispatchChangeEvent(el._elements.nativeSelect);

        helpers.next(function() {
          expect(document.activeElement).to.equal(el._elements.button, 'focus should be on the button');

          done();
        });
      });
    });

    it.skip('should close the overlay using esc key', function(done) {
      helpers.build(window.__html__['Coral.Select.base.html'], function(el) {
        el.on('coral-overlay:open', function() {
          expect(el._elements.button.getAttribute('aria-expanded')).to.equal('true');
          expect(el._elements.button.classList.contains('is-selected')).to.be.true;

          // pressing escape should close the overlay
          helpers.keypress('esc', helpers.target);
        }, true);

        el.on('coral-overlay:close', function() {
          expect(el._elements.button.getAttribute('aria-expanded')).to.equal('false');
          expect(el._elements.overlay.open).to.equal(false, 'overlay should be closed');
          expect(el._elements.button.classList.contains('is-selected')).to.be.false;

          expect(document.activeElement).to.equal(el._elements.button, 'focus should return to the button');

          done();
        }, true);

        // opens the overlay
        el._elements.button.click();
      });
    });
  });

  // @todo: add tests for overlay position
  // @todo: add tests for internal events not bubbling (taglist, select, selectlist)
  describe('Implementation Details', function() {
    // the select list item used in every test
    var el;
    var item1;
    var item2;
    var item3;

    beforeEach(function(done) {
      el = new Coral.Select();
      item1 = new Coral.Select.Item();
      item2 = new Coral.Select.Item();
      item3 = new Coral.Select.Item();

      item1.content.innerHTML = 'Item 1';
      item1.value = '1';
      item2.content.innerHTML = 'Item 2';
      item2.value = '2';
      item3.content.innerHTML = 'Item 3';
      item3.value = '3';

      // adds the item to the select
      el.items.add(item1);
      el.items.add(item2);
      el.items.add(item3);

      helpers.target.appendChild(el);

      Coral.commons.ready(el, function() {
        done();
      });
    });

    afterEach(function() {
      el = item1 = item2 = item3 = null;
    });

    it('should set value of the internal items', function() {
      // all items should initialize the selectListItem and nativeOption
      expect(item1._elements.selectListItem.value).to.equal(item1.value);
      expect(item2._elements.selectListItem.value).to.equal(item2.value);
      expect(item3._elements.selectListItem.value).to.equal(item3.value);
      expect(item1._elements.nativeOption.value).to.equal(item1.value);
      expect(item2._elements.nativeOption.value).to.equal(item2.value);
      expect(item3._elements.nativeOption.value).to.equal(item3.value);
    });

    it('should change value of the internal items', function() {
      item1.value = '4';

      expect(item1._elements.selectListItem.value).to.equal(item1.value);
      expect(item1._elements.nativeOption.value).to.equal(item1.value);
    });

    it('should change value of the internal items and multiple=true', function() {
      // we switch to multiple because it includes tags
      el.multiple = true;

      item1.selected = true;

      expect(el.multiple).to.be.true;
      expect(el.selectedItem).to.equal(item1);

      expect(item1._elements.selectListItem.value).to.equal('1');
      expect(item1._elements.nativeOption.value).to.equal('1');
      expect(item1._elements.tag.value).to.equal('1');

      item1.value = '4';

      expect(item1._elements.selectListItem.value).to.equal('4', 'select list item should be updated');
      expect(item1._elements.nativeOption.value).to.equal('4', 'navive option should be updated');
      expect(item1._elements.tag.value).to.equal('4', 'tag value should be updated');
    });

    it('should change content of the internal items', function(done) {
      item1.content.textContent = 'America';

      // waits for the MO to kick in
      helpers.next(function() {
        expect(item1._elements.selectListItem.content.textContent).to.equal(item1.content.textContent);
        expect(item1._elements.nativeOption.textContent).to.equal(item1.content.textContent);

        done();
      });
    });

    it('should change content of the internal items and multiple=true', function(done) {
      el.multiple = true;

      item1.selected = true;

      expect(el.multiple).to.be.true;
      expect(el.selectedItem).to.equal(item1);

      item1.content.textContent = 'America';

      // waits for the MO to kick in
      helpers.next(function() {
        expect(item1._elements.selectListItem.content.textContent).to.equal(item1.content.textContent);
        expect(item1._elements.nativeOption.textContent).to.equal(item1.content.textContent);
        expect(item1._elements.tag.label.textContent).to.equal(item1.content.textContent);

        done();
      });
    });

    it('should change disabled of the internal items', function() {
      expect(item1.disabled).to.be.false;

      item1.disabled = true;

      expect(item1.disabled).to.be.true;
      expect(item1._elements.selectListItem.disabled).to.equal(item1.disabled);
      expect(item1._elements.nativeOption.disabled).to.equal(item1.disabled);
    });

    describe('arrayDiff', function() {
      // this is copied from Coral.Select.js since it is private
      var arrayDiff = function(a, b) {
        return a.filter(function(item) {
          return !b.some(function(item2) {
              return item === item2;
            });
        });
      };

      it('should calculate the different between 2 arrays', function() {
        expect(arrayDiff([item1, item2], [item2])).to.deep.equal([item1]);
        expect(arrayDiff([item1, item2], [])).to.deep.equal([item1, item2]);
        expect(arrayDiff([], [item1, item2, item3])).to.deep.equal([]);
        expect(arrayDiff([item1, item2, item3], [item1, item2, item3])).to.deep.equal([]);
        expect(arrayDiff([item1, item2], [item2, item1])).to.deep.equal([], 'order should not matter');
      });
    });
  });

  describe('Implementation Details (compliance)', function() {
    describe('#formField (single select)', function() {
      // Run generic formField tests
      helpers.testFormField(window.__html__['Coral.Select.value.html'], {
        value: 'as',
        default: 'am'
      });
    });

    describe('#formField (multi select)', function() {
      // Run generic formField tests
      helpers.testFormField(window.__html__['Coral.Select.multiple.value.html'], {
        value: 'as',
        default: ''
      });
    });
  });

  describe('Tracking', function() {
    var trackerFnSpy;

    beforeEach(function () {
      trackerFnSpy = sinon.spy();
      Coral.tracking.addListener(trackerFnSpy);
    });

    afterEach(function () {
      Coral.tracking.removeListener(trackerFnSpy);
    });

    it('should call the tracker callback fn with expected parameters when the simple select changes it\'s value that has a trackingElement attribute', function(done) {
      helpers.build(window.__html__['Coral.Select.tracking.single.html'], function(el) {
        el.click();

        Coral.commons.ready(el, function() {
          el.querySelector('coral-overlay coral-selectlist-item:nth-child(1)').click();

          expect(trackerFnSpy.callCount).to.equal(1, 'Tracker should have been called only once.');

          var spyCall = trackerFnSpy.getCall(0);
          expect(spyCall.args.length).to.equal(4);
          var trackData = spyCall.args[0];
          expect(trackData).to.have.property('targetElement', 'First element name');
          expect(trackData).to.have.property('targetType', 'select-item');
          expect(trackData).to.have.property('eventType', 'change');
          expect(trackData).to.have.property('rootElement', 'element name');
          expect(trackData).to.have.property('rootFeature', 'feature name');
          expect(trackData).to.have.property('rootType', 'select');
          expect(spyCall.args[1]).to.be.an.instanceof(CustomEvent);
          expect(spyCall.args[2]).to.be.an.instanceof(Coral.Select);
          done();
        });

      });
    });

    it('should call the tracker callback fn with expected parameters when the simple select changes it\'s value that doesn\'t have a trackingElement attribute', function(done) {
      helpers.build(window.__html__['Coral.Select.tracking.single.html'], function(el) {
        el.click();

        Coral.commons.ready(el, function() {
          el.querySelector('coral-overlay coral-selectlist-item:nth-child(2)').click();

          expect(trackerFnSpy.callCount).to.equal(1, 'Tracker should have been called only once.');

          var spyCall = trackerFnSpy.getCall(0);
          expect(spyCall.args.length).to.equal(4);
          var trackData = spyCall.args[0];
          expect(trackData).to.have.property('targetElement', 'Second');
          expect(trackData).to.have.property('targetType', 'select-item');
          expect(trackData).to.have.property('eventType', 'change');
          expect(trackData).to.have.property('rootElement', 'element name');
          expect(trackData).to.have.property('rootFeature', 'feature name');
          expect(trackData).to.have.property('rootType', 'select');
          expect(spyCall.args[1]).to.be.an.instanceof(CustomEvent);
          expect(spyCall.args[2]).to.be.an.instanceof(Coral.Select);
          done();
        });

      });
    });

    it('should call the tracker callback fn with expected parameters when the multiple select changes it\'s value that doesn\'t have a trackingElement attribute', function(done) {
      helpers.build(window.__html__['Coral.Select.tracking.multiple.html'], function(el) {
        el.click();

        Coral.commons.ready(el, function() {
          el.querySelector('coral-overlay coral-selectlist-item:nth-child(1)').click();

          expect(trackerFnSpy.callCount).to.equal(1, 'Tracker should have been called only once.');

          var spyCall = trackerFnSpy.getCall(0);
          expect(spyCall.args.length).to.equal(4);
          var trackData = spyCall.args[0];
          expect(trackData).to.have.property('targetElement', 'First element name');
          expect(trackData).to.have.property('targetType', 'select-item');
          expect(trackData).to.have.property('eventType', 'select');
          expect(trackData).to.have.property('rootElement', 'element name');
          expect(trackData).to.have.property('rootFeature', 'feature name');
          expect(trackData).to.have.property('rootType', 'select');
          expect(spyCall.args[1]).to.be.an.instanceof(CustomEvent);
          expect(spyCall.args[2]).to.be.an.instanceof(Coral.Select);
          done();
        });

      });
    });

    it('should call the tracker callback fn with expected parameters when the multiple select adds a new tag and then removes it', function(done) {
      helpers.build(window.__html__['Coral.Select.tracking.multiple.html'], function(selectElem) {
        selectElem.click();

        Coral.commons.ready(selectElem.querySelector('coral-overlay'), function() {
          var listItem = selectElem.querySelector('coral-overlay coral-selectlist-item:nth-child(1)');
          listItem.click();

          Coral.commons.ready(listItem, function() {
            var tagItemCloseBtn = selectElem.querySelector('coral-taglist coral-tag button[coral-close]');
            tagItemCloseBtn.click();

            Coral.commons.ready(tagItemCloseBtn, function() {
              expect(trackerFnSpy.callCount).to.equal(2, 'Tracker should have been called twice.');

              var spyCall = trackerFnSpy.getCall(1);
              expect(spyCall.args.length).to.equal(4);
              var trackData = spyCall.args[0];
              expect(trackData).to.have.property('targetElement', 'First element name');
              expect(trackData).to.have.property('targetType', 'select-item');
              expect(trackData).to.have.property('eventType', 'deselect');
              expect(trackData).to.have.property('rootElement', 'element name');
              expect(trackData).to.have.property('rootFeature', 'feature name');
              expect(trackData).to.have.property('rootType', 'select');
              expect(spyCall.args[1]).to.be.an.instanceof(CustomEvent);
              expect(spyCall.args[2]).to.be.an.instanceof(Coral.Select);
              done();
            });
          });

        });

      });
    });

  });

});
