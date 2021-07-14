describe('Coral.CycleButton', function() {
  'use strict';

  var SNIPPET_MIXEDITEMS = window.__html__['Coral.CycleButton.mixedItems.html'];
  var SNIPPET_TWOITEMS = window.__html__['Coral.CycleButton.twoItems.html'];
  var SNIPPET_THREEITEMS = window.__html__['Coral.CycleButton.threeItems.html'];
  var SNIPPET_PRESETSELECT = window.__html__['Coral.CycleButton.presetSelect.html'];
  var SNIPPET_WITHACTIONS = window.__html__['Coral.CycleButton.withActions.html'];
  var SNIPPET_GENERALICON = window.__html__['Coral.CycleButton.generalIcon.html'];

  var WHITESPACE_REGEX = /[\t\n\r ]+/g;

  function stripWhitespace(string) {
    return string.replace(WHITESPACE_REGEX, ' ');
  }

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('CycleButton');
    });
    it('should define the displayMode in an enum', function() {
      expect(Coral.CycleButton.displayMode).to.exist;
      expect(Coral.CycleButton.displayMode.ICON).to.equal('icon');
      expect(Coral.CycleButton.displayMode.TEXT).to.equal('text');
      expect(Coral.CycleButton.displayMode.ICON_TEXT).to.equal('icontext');
      expect(Object.keys(Coral.CycleButton.displayMode).length).to.equal(3);
    });
  });

  describe('Instantiation', function() {
    it('should be possible to clone the element using markup', function(done) {
      helpers.build(SNIPPET_TWOITEMS, function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible via cloneNode using js', function(done) {
      var el = new Coral.CycleButton();
      el.appendChild(new Coral.CycleButton.Item());
      el.appendChild(new Coral.CycleButton.Item());
      helpers.target.appendChild(el);
      helpers.next(function() {
        helpers.testComponentClone(el, done);
      });
    });
  });

  describe('API', function() {
    describe('#icon', function() {
      it('should have the general icon', function(done) {
        helpers.build(SNIPPET_GENERALICON, function(el) {
          helpers.next(function() {
            expect(el.icon).to.equal('apps');
            expect(el._elements.button.icon).to.equal('apps');
            done();
          });
        });
      });
    });

    describe('#threshold', function() {
      it('should have default threshold', function(done) {
        var el = new Coral.CycleButton();
        helpers.target.appendChild(el);
        helpers.next(function() {
          expect(el.threshold).to.equal(3);
          done();
        });
      });
    });

    describe('#displayMode', function() {
      it('should have default displayMode set to icon', function(done) {
        var el = new Coral.CycleButton();
        helpers.target.appendChild(el);
        helpers.next(function() {
          expect(el.displayMode).to.equal('icon');
          done();
        });
      });

      it('should display only icon when in icon mode and icon and text is in item object', function(done) {
        helpers.build(SNIPPET_MIXEDITEMS, function(el) {
          el.displayMode = Coral.CycleButton.displayMode.ICON;
          helpers.next(function() {
            var button = el._elements.button;
            expect(button.icon.trim()).to.equal('viewCard');
            expect(button.textContent.trim()).to.equal('');
            done();
          });
        });
      });

      it('should display icon and text when in icontext mode and icon and text is in item object', function(done) {
        helpers.build(SNIPPET_MIXEDITEMS, function(el) {
          el.displayMode = Coral.CycleButton.displayMode.ICON_TEXT;
          helpers.next(function() {
            var button = el._elements.button;
            expect(button.icon.trim()).to.equal('viewCard');
            expect(button.textContent.trim()).to.equal('Card');
            done();
          });
        });
      });

      it('should display only icon when component in icontext mode and item in icon mode', function(done) {
        helpers.build(SNIPPET_MIXEDITEMS, function(el) {
          el.displayMode = Coral.CycleButton.displayMode.ICON_TEXT;
          el.items.getAll()[0].displayMode = Coral.CycleButton.displayMode.ICON;
          helpers.next(function() {
            var button = el._elements.button;
            expect(button.icon.trim()).to.equal('viewCard');
            expect(button.textContent.trim()).to.equal('');
            done();
          });
        });
      });

      it('should display only text when in text mode and icon and text is in item object', function(done) {
        helpers.build(SNIPPET_MIXEDITEMS, function(el) {
          el.displayMode = Coral.CycleButton.displayMode.TEXT;
          helpers.next(function() {
            var button = el._elements.button;
            expect(button.icon.trim()).to.equal('');
            expect(button.textContent.trim()).to.equal('Card');
            done();
          });
        });
      });

      it('should display text when in icon mode and only text is in item object', function(done) {
        helpers.build(SNIPPET_MIXEDITEMS, function(el) {
          el.displayMode = Coral.CycleButton.displayMode.ICON;
          el.items.getAll()[1].selected = true;
          helpers.next(function() {
            var button = el._elements.button;
            expect(button.icon.trim()).to.equal('');
            expect(button.label.innerHTML.trim()).to.equal('List <b>View</b>');
            done();
          });
        });
      });

      it('should display icon when in text mode and only icon is in item object', function(done) {
        helpers.build(SNIPPET_MIXEDITEMS, function(el) {
          el.displayMode = Coral.CycleButton.displayMode.TEXT;
          el.items.getAll()[2].selected = true;
          helpers.next(function() {
            var button = el._elements.button;
            expect(button.icon.trim()).to.equal('viewColumn');
            expect(button.textContent.trim()).to.equal('');
            done();
          });
        });
      });
    });

    describe('#selectedItem', function() {
      it('should return null when there are 0 buttons', function(done) {
        var el = new Coral.CycleButton();
        expect(el.selectedItem).to.be.null;
        helpers.target.appendChild(el);
        helpers.next(function() {
          expect(el.selectedItem).to.be.null;
          done();
        });
      });

      it('should return the selected item', function(done) {
        helpers.build(SNIPPET_TWOITEMS, function(el) {
          expect(el.selectedItem).to.exist;
          expect(el.selectedItem.id).to.equal('btn1');
          done();
        });
      });

      it('should be readonly', function(done) {
        helpers.build(SNIPPET_TWOITEMS, function(el) {
          el.selectedItem = el.items.getAll()[1];
          expect(el.selectedItem.id).to.equal('btn1');
          done();
        });
      });

      it('should return the first element after a child got added', function(done) {
        var item = new Coral.CycleButton.Item();
        var el = new Coral.CycleButton();
        el.appendChild(item);
        helpers.target.appendChild(el);
        helpers.next(function() {
          expect(el.selectedItem).to.equal(item);
          done();
        });
      });

      it('should stay on the current item when the only item present got clicked', function(done) {
        var item = new Coral.CycleButton.Item();
        var el = new Coral.CycleButton();
        el.appendChild(item);
        helpers.target.appendChild(el);
        helpers.next(function() {
          item.click();
          helpers.next(function() {
            expect(el.selectedItem).to.equal(item);
            done();
          });
        });
      });

      it('should return the id of the 2nd child, after the 1st child got removed, using removeChild', function(done) {
        helpers.build(SNIPPET_THREEITEMS, function(el) {
          el.removeChild(el.items.getAll()[0]);
          helpers.next(function() {
            expect(el.selectedItem.id).to.equal(el.items.getAll()[0].id);
            done();
          });
        });
      });

      it('should return the id of the 2nd child, after the 1st child got removed', function(done) {
        helpers.build(SNIPPET_THREEITEMS, function(el) {
          el.removeChild(el.querySelector('#btn1'));
          helpers.next(function() {
            expect(el.selectedItem.id).to.equal('btn2');
            done();
          });
        });
      });

      it('should select the next available item on removing the current selection', function(done) {
        helpers.build(SNIPPET_THREEITEMS, function(el) {
          helpers.next(function() {
            el.removeChild(el.querySelector('#btn1'));
            helpers.next(function() {
              expect(el.selectedItem.id).to.equal('btn2');
              done();
            });
          });
        });
      });

      it('removing all items should set selectedItem to null', function(done) {
        helpers.build(SNIPPET_THREEITEMS, function(el) {
          helpers.next(function() {
            // effectively removes all children
            el.innerHTML = '';
            helpers.next(function() {
              expect(el.selectedItem).to.be.null;
              done();
            });
          });
        });
      });

      it('preset selection should be honoured', function(done) {
        helpers.build(SNIPPET_PRESETSELECT, function(el) {
          expect(el.selectedItem.id).to.equal('btn2');
          done();
        });
      });
    });

    describe('#items', function() {
      it('should exist and be readonly', function(done) {
        helpers.build(SNIPPET_TWOITEMS, function(el) {
          el.items = null;
          expect(el.items).to.exist;
          done();
        });
      });

      describe('#length', function() {
        it('should return the number of items', function(done) {
          helpers.build(SNIPPET_TWOITEMS, function(el) {
            expect(el.items.length).to.equal(2);
            done();
          });
        });
      });

      describe('#add', function() {
        it('should allow adding a node before the desired one', function(done) {
          helpers.build(SNIPPET_TWOITEMS, function(el) {
            var item = document.createElement('coral-cyclebutton-item');
            el.items.add(item, el.firstChild);
            helpers.next(function() {
              expect(el.firstChild).to.equal(item);
              done();
            });

          });
        });

        it('should allow adding a node at the end', function(done) {
          helpers.build(SNIPPET_TWOITEMS, function(el) {
            var item = document.createElement('coral-cyclebutton-item');
            el.items.add(item);
            helpers.next(function() {
              expect(el.lastChild).to.equal(item);
              done();
            });

          });
        });

        it('should return the added node', function(done) {
          helpers.build(SNIPPET_TWOITEMS, function(el) {
            var item = document.createElement('coral-cyclebutton-item');
            var newItem = el.items.add(item);
            expect(newItem).to.equal(item);
            done();
          });
        });

        it('should support adding an object', function(done) {
          helpers.build(SNIPPET_TWOITEMS, function(el) {
            el.items.add({
              label: 'lorem ipsum'
            });
            helpers.next(function() {
              expect(el.items.length).to.equal(3);
              done();
            });
          });
        });

        it('should do nothing if the added node is not a cyclebutton-item element', function(done) {
          helpers.build(SNIPPET_TWOITEMS, function(el) {
            var item = document.createElement('button');
            el.items.add(item);
            helpers.next(function() {
              expect(el.items.length).to.equal(2);
              done();
            });
          });
        });

        it('should trigger coral-collection:add', function(done) {
          helpers.build(SNIPPET_TWOITEMS, function(el) {
            var item = document.createElement('coral-cyclebutton-item');
            var eventSpy = sinon.spy();

            el.on('coral-collection:add', eventSpy);
            el.items.add(item);

            helpers.next(function() {
              expect(eventSpy.args[0][0].detail.item).to.equal(item);
              el.off('coral-collection:add');
              done();
            });
          });
        });
      });

      describe('#remove', function() {
        it('should remove the desired node', function(done) {
          helpers.build(SNIPPET_TWOITEMS, function(el) {
            var item = el.firstChild;
            el.items.remove(item);
            helpers.next(function() {
              expect(item.parentNode).to.equal.undefined;
              expect(el.contains(item)).to.be.false;
              done();
            });
          });
        });

        it('should return the removed node', function(done) {
          helpers.build(SNIPPET_TWOITEMS, function(el) {
            var item = el.firstChild;
            var oldItem = el.items.remove(item);
            expect(oldItem).to.equal(item);
            done();
          });
        });

        it('should do nothing if the removed is not a dom element', function(done) {
          helpers.build(SNIPPET_TWOITEMS, function(el) {
            el.items.remove(el.firstChild);
            expect(el.items.length).to.equal(2);
            done();
          });
        });

        it('should trigger coral-collection:remove', function(done) {
          helpers.build(SNIPPET_TWOITEMS, function(el) {
            var item = el.items.getAll()[0];
            var eventSpy = sinon.spy();

            el.on('coral-collection:remove', eventSpy);
            el.items.remove(item);

            helpers.next(function() {
              expect(eventSpy.args[0][0].detail.item).to.equal(item);
              done();
            });
          });
        });
      });

      describe('#getAll', function() {
        it('should return all nodes', function(done) {
          helpers.build(SNIPPET_TWOITEMS, function(el) {
            var items = el.items.getAll();
            expect(items.length).to.equal(2);
            expect(items[0].id).to.equal(el.querySelector('#btn1').id);
            expect(items[1].id).to.equal(el.querySelector('#btn2').id);
            expect(items[0]).to.equal(el.querySelector('#btn1'));
            expect(items[1]).to.equal(el.querySelector('#btn2'));
            done();
          });
        });
      });

      describe('#clear', function() {
        it('should remove all nodes', function(done) {
          helpers.build(SNIPPET_TWOITEMS, function(el) {
            var items = el.items.getAll();
            var oldItems = el.items.clear();
            helpers.next(function() {
              expect(el.items.getAll().length).to.equal(0);
              expect(oldItems.length).to.equal(2);
              expect(oldItems[1]).to.equal(items[0]);
              expect(oldItems[0]).to.equal(items[1]);
              done();
            });
          });
        });

        it('should trigger coral-collection:remove for each removed node', function(done) {
          helpers.build(SNIPPET_TWOITEMS, function(el) {
            var items = el.items.getAll();
            var eventSpy = sinon.spy();

            el.on('coral-collection:remove', eventSpy);
            el.items.clear();

            helpers.next(function() {
              expect(eventSpy.callCount).to.equal(2);
              expect(eventSpy.args[1][0].detail.item).to.equal(items[0]);
              expect(eventSpy.args[0][0].detail.item).to.equal(items[1]);
              done();
            });
          });
        });
      });
    });

    describe('#actions', function() {
      it('should exist and be readonly', function(done) {
        helpers.build(SNIPPET_WITHACTIONS, function(el) {
          el.actions = null;
          expect(el.actions).to.exist;
          done();
        });
      });

      describe('#length', function() {
        it('should return the number of items', function(done) {
          helpers.build(SNIPPET_WITHACTIONS, function(el) {
            expect(el.actions.length).to.equal(2);
            done();
          });
        });
      });

      describe('#add', function() {
        it('should allow adding a node before the desired one', function(done) {
          helpers.build(SNIPPET_WITHACTIONS, function(el) {
            var action = document.createElement('coral-cyclebutton-action');
            el.actions.add(action, el.firstChild);
            helpers.next(function() {
              expect(el.firstChild).to.equal(action);
              done();
            });

          });
        });

        it('should allow adding a node at the end', function(done) {
          helpers.build(SNIPPET_WITHACTIONS, function(el) {
            var action = document.createElement('coral-cyclebutton-action');
            el.actions.add(action);
            helpers.next(function() {
              expect(el.lastChild).to.equal(action);
              done();
            });

          });
        });

        it('should return the added node', function(done) {
          helpers.build(SNIPPET_WITHACTIONS, function(el) {
            var action = document.createElement('coral-cyclebutton-action');
            var newAction = el.actions.add(action);
            expect(newAction).to.equal(action);
            done();
          });
        });

        it('should support adding an object', function(done) {
          helpers.build(SNIPPET_WITHACTIONS, function(el) {
            el.actions.add({
              label: 'lorem ipsum'
            });
            helpers.next(function() {
              expect(el.actions.length).to.equal(3);
              done();
            });
          });
        });

        it('should do nothing if the added node is not a cyclebutton-action element', function(done) {
          helpers.build(SNIPPET_WITHACTIONS, function(el) {
            var action = document.createElement('button');
            el.actions.add(action);
            helpers.next(function() {
              expect(el.actions.length).to.equal(2);
              done();
            });
          });
        });
      });

      describe('#remove', function() {
        it('should remove the desired node', function(done) {
          helpers.build(SNIPPET_WITHACTIONS, function(el) {
            var action = el.firstChild;
            el.actions.remove(action);
            helpers.next(function() {
              expect(action.parentNode).to.equal.undefined;
              expect(el.contains(action)).to.be.false;
              done();
            });

          });
        });

        it('should return the removed node', function(done) {
          helpers.build(SNIPPET_WITHACTIONS, function(el) {
            var action = el.firstChild;
            var oldAction = el.actions.remove(action);
            expect(oldAction).to.equal(action);
            done();
          });
        });

        it('should do nothing if the removed is not a dom element', function(done) {
          helpers.build(SNIPPET_WITHACTIONS, function(el) {
            el.actions.remove(el.firstChild);
            expect(el.actions.length).to.equal(2);
            done();
          });
        });
      });

      describe('#getAll', function() {
        it('should return all nodes', function(done) {
          helpers.build(SNIPPET_WITHACTIONS, function(el) {
            var actions = el.actions.getAll();
            expect(actions.length).to.equal(2);
            expect(actions[0].id).to.equal(el.querySelector('#action1').id);
            expect(actions[1].id).to.equal(el.querySelector('#action2').id);
            expect(actions[0]).to.equal(el.querySelector('#action1'));
            expect(actions[1]).to.equal(el.querySelector('#action2'));
            done();
          });
        });
      });

      describe('#clear', function() {
        it('should remove all nodes', function(done) {
          helpers.build(SNIPPET_WITHACTIONS, function(el) {
            var actions = el.actions.getAll();
            var oldActions = el.actions.clear();
            helpers.next(function() {
              expect(el.actions.getAll().length).to.equal(0);
              expect(oldActions.length).to.equal(2);
              expect(oldActions[1]).to.equal(actions[0]);
              expect(oldActions[0]).to.equal(actions[1]);
              done();
            });
          });
        });
      });
    });
  }); // API

  describe('Markup', function() {
    describe('#threshold', function() {
      it('should be in normal mode if itemCount less than threshold', function(done) {
        helpers.build(SNIPPET_TWOITEMS, function(el) {
          expect(el.classList.contains('coral3-CycleButton--extended')).to.be.false;
          done();
        });
      });

      it('should enable extended mode if itemCount greater than threshold', function(done) {
        helpers.build(SNIPPET_THREEITEMS, function(el) {
          expect(el.classList.contains('coral3-CycleButton--extended')).to.be.true;
          done();
        });
      });

      it('should change extended mode if itemCount gets greater than threshold', function(done) {
        helpers.build(SNIPPET_TWOITEMS, function(el) {
          expect(el.classList.contains('coral3-CycleButton--extended')).to.be.false;
          var button = new Coral.CycleButton.Item();
          el.appendChild(button);
          helpers.next(function() {
            expect(el.classList.contains('coral3-CycleButton--extended')).to.be.true;
            done();
          });
        });
      });

      it('should change extended mode if itemCount gets less than threshold', function(done) {
        helpers.build(SNIPPET_THREEITEMS, function(el) {
          expect(el.classList.contains('coral3-CycleButton--extended')).to.be.true;
          el.removeChild(el.querySelector('#btn3'));
          helpers.next(function() {
            expect(el.classList.contains('coral3-CycleButton--extended')).to.be.false;
            done();
          });
        });
      });
    });
  }); // Markup

  describe('Events', function() {
    var changeSpy;

    beforeEach(function() {
      changeSpy = sinon.spy();
      document.addEventListener('coral-cyclebutton:change', changeSpy);
      expect(changeSpy.callCount).to.equal(0);
    });

    afterEach(function() {
      document.removeEventListener('coral-cyclebutton:change', changeSpy);
      changeSpy.reset();
    });

    it('should not trigger change when appended', function(done) {
      helpers.build(SNIPPET_TWOITEMS, function(el) {
        expect(changeSpy.callCount).to.equal(0);
        helpers.next(function() {
          expect(changeSpy.callCount).to.equal(0);
          done();
        });
      });
    });

    it('should trigger change on click', function(done) {
      helpers.build(SNIPPET_TWOITEMS, function(el) {
        // reset changeSpy, for same reason the callCount is '1' here
        changeSpy.reset();
        el.items.getAll()[0].click();
        helpers.next(function() {
          expect(changeSpy.callCount).to.equal(1);
          done();
        });
      });
    });

    it('should proxy click event on action when selected by clicking an actionList item', function(done) {
      helpers.build(SNIPPET_WITHACTIONS, function(el) {
        var spy = sinon.spy();

        // opens the overlay
        el._elements.button.click();

        helpers.next(function() {
          document.addEventListener('click', spy);

          // we click on the first action available
          el._elements.actionList.items.first().click();

          helpers.next(function() {
            expect(spy.callCount).to.equal(1, 'spy called once after clicking actions actionList item');
            expect(spy.args[0][0].target.tagName.toLowerCase()).to.equal('coral-cyclebutton-action');
            document.removeEventListener('click', spy);
            done();
          });
        });
      });
    });
  }); // Events

  describe('User Interaction', function() {
    it('should open the overlay when there are more than 3 items and keep the focus on the item', function(done) {
      helpers.build(SNIPPET_THREEITEMS, function(el) {
        var labelString = stripWhitespace(el.selectedItem.textContent);
        expect(el._elements.button.getAttribute('aria-haspopup')).to.equal('true', 'aria-haspopup attribute is not set to \'true\'');
        expect(el._elements.button.getAttribute('aria-expanded')).to.equal('false', 'aria-expanded attribute was not set to \'false\' when overlay is closed');
        expect(el._elements.button.getAttribute('aria-owns')).to.equal(el._elements.selectList.id, 'aria-owns attribute was not set');
        expect(el._elements.button.getAttribute('aria-controls')).to.equal(el._elements.selectList.id, 'aria-controls attribute was not set');
        if (el.icon) {
          expect(el._elements.button.getAttribute('aria-label')).to.equal(labelString, 'aria-label attribute on button does not match the selected item label');
          expect(el._elements.button.getAttribute('title')).to.equal(labelString, 'title attribute on button does not match the selected item label');
        }
        el.querySelector('#btn1').click();
        helpers.next(function() {
          expect(el.selectedItem.id).to.equal('btn1');
          expect(el._elements.overlay.open).to.be.true;
          expect(document.activeElement).to.exist;
          expect(el._elements.button.getAttribute('aria-expanded')).to.equal('true', 'aria-expanded attribute was not set to \'true\' when overlay is closed');
          done();
        });
      });
    });

    it('overlay should be open following a click of a child of the button element', function(done) {
      helpers.build(SNIPPET_THREEITEMS, function(el) {
        el._elements.button.querySelector('coral-icon').click();
        helpers.next(function() {
          expect(el._elements.overlay.open).to.be.true;
          done();
        });
      });
    });

    it('should close the overlay when the selected item is clicked again', function(done) {
      helpers.build(SNIPPET_THREEITEMS, function(el) {
        el.querySelector('#btn1').click();
        helpers.next(function() {
          el.querySelector('#btn1').click();
          helpers.next(function() {
            expect(el.selectedItem.id).to.equal('btn1');
            expect(el._elements.overlay.open).to.be.false;
            expect(el._elements.button.getAttribute('aria-expanded')).to.equal('false', 'aria-expanded attribute was not set to \'false\'');
            done();
          });
        });
      });
    });

    it('should close the overlay, update the selected item and focus the button when an item is clicked', function(done) {
      helpers.build(SNIPPET_THREEITEMS, function(el) {
        el.querySelector('#btn1').click();
        helpers.next(function() {
          el._elements.selectList.children[1].click();
          helpers.next(function() {
            var labelString = stripWhitespace(el.selectedItem.textContent);
            expect(el.selectedItem.id).to.equal('btn2', 'Second item not selected, when clicked on element in popover');
            expect(el._elements.overlay.open).to.be.false;
            expect(document.activeElement).to.exist;
            expect(document.activeElement.id).to.equal(el._elements.button.id, 'Button didn\'t get focus automatically');
            if (el.icon) {
              expect(el._elements.button.getAttribute('aria-label')).to.equal(labelString, 'aria-label attribute on button does not match the updated selected item label');
              expect(el._elements.button.getAttribute('title')).to.equal(labelString, 'title attribute on button does not match the updated selected item label');
            }
            done();
          });
        });
      });
    });

    it('should close the overlay, when there\'s a global click outside of the overlay', function(done) {
      helpers.build(SNIPPET_THREEITEMS, function(el) {
        el.querySelector('#btn1').click();
        helpers.next(function() {
          document.body.click();
          helpers.next(function() {
            expect(el._elements.overlay.open).to.be.false;
            expect(el._elements.button.getAttribute('aria-expanded')).to.equal('false', 'aria-expanded attribute was not set to \'false\'');
            done();
          });
        });
      });
    });

    it('should move to the next item when the current item gets clicked and focus it', function(done) {
      helpers.build(SNIPPET_TWOITEMS, function(el) {
        helpers.next(function() {
          var labelString = '';
          expect(el.selectedItem.id).to.equal('btn1', 'First item not selected by default');
          el.querySelector('#btn1').click();
          helpers.next(function() {
            labelString = stripWhitespace(el.selectedItem.textContent);
            expect(el.selectedItem.id).to.equal('btn2', 'Second item not selected after first was clicked');
            expect(document.activeElement).to.exist;
            expect(document.activeElement.id).to.equal(el._elements.button.id, 'Button didn\'t get focus automatically');
            if (el.icon) {
              expect(el._elements.button.getAttribute('aria-label')).to.equal(labelString, 'aria-label attribute on button does not match the updated selected item label');
              expect(el._elements.button.getAttribute('title')).to.equal(labelString, 'title attribute on button does not match the updated selected item label');
            }
            el.querySelector('#btn2').click();
            helpers.next(function() {
              labelString = stripWhitespace(el.selectedItem.textContent);
              expect(el.selectedItem.id).to.equal('btn1', 'First item not selected after second was clicked');
              expect(document.activeElement).to.exist;
              expect(document.activeElement.id).to.equal(el._elements.button.id, 'Button didn\'t get focus automatically');
              if (el.icon) {
                expect(el._elements.button.getAttribute('aria-label')).to.equal(labelString, 'aria-label attribute on button does not match the updated selected item label');
                expect(el._elements.button.getAttribute('title')).to.equal(labelString, 'title attribute on button does not match the updated selected item label');
              }
              done();
            });
          });
        });
      });
    });

    it('should keep the actions selectList hidden when there are no actions', function(done) {
      helpers.build(SNIPPET_THREEITEMS, function(el) {
        expect(el.actions.length).to.equal(0);
        el.querySelector('#btn1').click();
        helpers.next(function() {
          expect(el._elements.actionList.getAttribute('hidden') === 'true').to.be.true;
          done();
        });
      });
    });

    it('should show the actions selectList when there are actions', function(done) {
      helpers.build(SNIPPET_WITHACTIONS, function(el) {
        el.querySelector('#btn1').click();
        helpers.next(function() {
          expect(el._elements.actionList.hasAttribute('hidden')).to.be.false;
          done();
        });
      });
    });

    it('should switch between inline/overlay selection when adding/removing nodes', function(done) {
      helpers.build(SNIPPET_THREEITEMS, function(el) {
        el.querySelector('#btn1').click();

        helpers.next(function() {
          expect(window.getComputedStyle(el._elements.overlay).display).to.not.equal('none');
          expect(el._elements.overlay.open).to.be.true;
          el.querySelector('#btn1').click();

          helpers.next(function() {
            var btn = el.querySelector('#btn3');
            el.removeChild(btn);
            el.querySelector('#btn1').click();

            helpers.next(function() {
              expect(window.getComputedStyle(el._elements.overlay).display).to.equal('none');
              expect(el._elements.overlay.open).to.be.false;
              el.appendChild(btn);

              helpers.next(function() {
                el.querySelector('#btn1').click();

                helpers.next(function() {
                  expect(window.getComputedStyle(el._elements.overlay).display).to.not.equal('none');
                  expect(el._elements.overlay.open).to.be.true;
                  done();
                });
              });
            });
          });
        });
      });
    });

    it('should allow changing the number of nodes after which to switch to overlay selection', function(done) {
      helpers.build(SNIPPET_THREEITEMS, function(el) {
        el.threshold = 4;
        el.querySelector('#btn1').click();

        helpers.next(function() {
          expect(window.getComputedStyle(el._elements.overlay).display).to.equal('none');
          expect(el._elements.overlay.open).to.be.false;
          el.querySelector('#btn2').click();
          el.querySelector('#btn3').click();
          var item = el.appendChild(document.createElement('coral-cyclebutton-item'));
          el.querySelector('#btn1').click();

          helpers.next(function() {
            expect(window.getComputedStyle(el._elements.overlay).display).to.not.equal('none');
            expect(el._elements.overlay.open).to.be.true;
            el.querySelector('#btn1').click();

            helpers.next(function() {
              el.removeChild(item);
              el.querySelector('#btn1').click();

              helpers.next(function() {
                expect(window.getComputedStyle(el._elements.overlay).display).to.equal('none');
                expect(el._elements.overlay.open).to.be.false;
                done();
              });
            });
          });
        });
      });
    });

    it('should update the overlay content when adding/removing more items', function(done) {
      helpers.build(SNIPPET_THREEITEMS, function(el) {

        el.querySelector('#btn1').click();

        helpers.next(function() {
          expect(el._elements.selectList.children.length).to.equal(3);
          el.querySelector('#btn1').click();

          helpers.next(function() {
            var btn = el.appendChild(document.createElement('coral-cyclebutton-item'));
            el.querySelector('#btn1').click();

            helpers.next(function() {
              expect(el._elements.selectList.children.length).to.equal(4);
              el.querySelector('#btn1').click();

              helpers.next(function() {
                el.removeChild(btn);
                el.querySelector('#btn1').click();

                helpers.next(function() {
                  expect(el._elements.selectList.children.length).to.equal(3);
                  done();
                });
              });
            });
          });
        });
      });
    });

    it('should have the general icon when item is clicked and has no icon defined', function(done) {
      helpers.build(SNIPPET_GENERALICON, function(el) {
        helpers.next(function () {
          el.items.first().click();
          expect(el.icon).to.equal('apps', 'The general icon is not apps');
          expect(el._elements.button.icon).to.equal('apps', 'The icon of the the button is not the general one');
          el.icon = 'viewOn';

          helpers.next(function () {
            expect(el._elements.button.icon).to.equal('viewOn', 'The button icon is not the new defined "viewOn" one');
            el._elements.selectList.children[0].click();

            helpers.next(function () {
              expect(el.icon).to.equal('viewOn', 'The general icon is not apps');
              expect(el._elements.button.icon).to.equal('viewOn', 'The icon of the button is not the defined default viewOn one');
              done();
            });
          });
        });
      });
    });

    it('should have the item icon when item is clicked and has a icon defined', function(done) {
      helpers.build(SNIPPET_GENERALICON, function(el) {
        helpers.next(function () {
          el.items.first().click();
          expect(el.icon).to.equal('apps', 'The general icon is not apps');
          expect(el._elements.button.icon).to.equal('apps', 'The icon of the the button is not the general one');
          el._elements.selectList.children[1].click();

          helpers.next(function () {
            expect(el.icon).to.equal('apps', 'The general icon is not apps');
            expect(el._elements.button.icon).to.equal(el.selectedItem.icon, 'The icon of the button is not overwritten by the selected item');
            done();
          });
        });
      });
    });
  }); // User Interaction

  describe('Implementation Details', function() {
    it('should keep selection when moved around', function(done) {
      helpers.build(window.__html__['Coral.CycleButton.presetSelect.html'], function(el) {
        // we move the component to a fragment to produce an attach/detach
        var frag = new DocumentFragment();
        frag.appendChild(el);

        helpers.next(function() {

          helpers.target.appendChild(frag);

          helpers.next(function() {
            expect(el.items.getAll()[1].selected).to.equal(true, 'Second item is selected');

            done();
          });
        });
      });
    });

    it('should allow HTML content inside the items', function(done) {
      helpers.build(SNIPPET_MIXEDITEMS, function(el) {
        // opens the overlay
        el._elements.button.click();

        helpers.next(function() {
          var items = el.items.getAll();
          var listItems = el._elements.selectList.items.getAll();

          items.forEach(function(item, index) {
            // we use contain, as the item will have the markup for the icon as well
            expect(listItems[index].content.innerHTML).to.contain(item.content.innerHTML, 'Items should include the HTML');
          });

          // selects the 2nd item
          listItems[1].click();

          helpers.next(function() {

            expect(el._elements.button.label.innerHTML).to.equal(items[1].content.innerHTML, 'Button should show the HTML');

            done();
          });
        });
      });
    });

    it('should allow HTML content inside the actions', function(done) {
      helpers.build(SNIPPET_WITHACTIONS, function(el) {
        // opens the overlay
        el._elements.button.click();

        helpers.next(function() {
          var items = el.actions.getAll();
          var listItems = el._elements.actionList.items.getAll();

          items.forEach(function(item, index) {
            expect(item.content.innerHTML).to.equal(listItems[index].content.innerHTML, 'Actions should include the HTML');
          });

          // selects the 2nd item
          listItems[1].click();

          done();
        });
      });
    });
  }); // Implementation Details
});
