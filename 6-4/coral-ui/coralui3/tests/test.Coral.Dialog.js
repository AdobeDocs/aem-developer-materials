describe('Coral.Dialog', function() {
  'use strict';

  /**
    To mock the dragging part
  */
  var dummyMouseEvent = function(type, x, y) {
    return new MouseEvent(type, {
      clientX: x,
      clientY: y,
      bubbles: true,
      cancelable: true
    });
  };

  // cleans up the DOM with all the dialogs found
  afterEach(function() {
    var dialogs = document.querySelectorAll('coral-dialog');

    for (var i = 0, dialogsCount = dialogs.length; i < dialogsCount; i++) {
      dialogs[i].open = false;
      dialogs[i].remove();
    }
  });

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Dialog');
    });

    it('should expose enumerations', function() {
      expect(Coral.Dialog).to.have.property('variant');
      expect(Coral.Dialog).to.have.property('backdrop');
      expect(Coral.Dialog).to.have.property('closable');
    });
  });

  describe('Instantiation', function() {
    it('should be possible via cloneNode using markup', function(done) {
      helpers.build(window.__html__['Coral.Dialog.fromElements.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible via cloneNode using markup (wrapper)', function(done) {
      helpers.build(window.__html__['Coral.Dialog.wrapper.single.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible via cloneNode using js', function(done) {
      var el = new Coral.Dialog();
      el.set({
        header: {
          innerHTML: 'Header'
        },
        content: {
          innerHTML: 'Content'
        },
        footer: {
          innerHTML: 'Footer'
        }
      });
      helpers.next(function() {
        helpers.testComponentClone(el, done);
      });
    });
  });

  describe('API', function() {
    var el;

    beforeEach(function() {
      el = new Coral.Dialog();
      helpers.target.appendChild(el);
    });

    afterEach(function() {
      el = null;
    });

    it('should have the correct default attributes', function(done) {
      // We need to check on the next animation frame to give time for visible to sync
      helpers.next(function() {
        expect(el.interaction).to.equal(Coral.Dialog.interaction.ON);
        expect(el.closable).to.equal(Coral.Dialog.closable.OFF);
        expect(el.backdrop).to.equal(Coral.Dialog.backdrop.MODAL);
        expect(el.movable).to.equal(false);
        expect(helpers.visible(el)).to.equal(false);
        done();
      });
    });

    describe('#variant', function() {
      it('should support error variant', function(done) {
        el.variant = Coral.Dialog.variant.ERROR;

        helpers.next(function() {
          expect(el.classList.contains('coral3-Dialog--error')).to.be.true;
          expect(el._elements.icon.icon).to.equal('alert');
          expect(el.getAttribute('role')).to.equal('alertdialog');
          done();
        });
      });

      it('should support warning variant', function(done) {
        el.variant = Coral.Dialog.variant.WARNING;

        helpers.next(function() {
          expect(el.classList.contains('coral3-Dialog--warning')).to.be.true;
          expect(el._elements.icon.icon).to.equal('alert');
          expect(el.getAttribute('role')).to.equal('alertdialog');
          done();
        });
      });

      it('should support success variant', function(done) {
        el.variant = Coral.Dialog.variant.SUCCESS;

        helpers.next(function() {
          expect(el.classList.contains('coral3-Dialog--success')).to.be.true;
          expect(el._elements.icon.icon).to.equal('checkCircle');
          expect(el.getAttribute('role')).to.equal('alertdialog');
          done();
        });
      });

      it('should support help variant', function(done) {
        el.variant = Coral.Dialog.variant.HELP;

        helpers.next(function() {
          expect(el.classList.contains('coral3-Dialog--help')).to.be.true;
          expect(el._elements.icon.icon).to.equal('helpCircle');
          expect(el.getAttribute('role')).to.equal('alertdialog');
          done();
        });
      });

      it('should support info variant', function(done) {
        el.variant = Coral.Dialog.variant.INFO;

        helpers.next(function() {
          expect(el.classList.contains('coral3-Dialog--info')).to.be.true;
          expect(el._elements.icon.icon).to.equal('infoCircle');
          expect(el.getAttribute('role')).to.equal('alertdialog');
          done();
        });
      });

      it('should support switching variants', function(done) {
        el.variant = Coral.Dialog.variant.INFO;

        helpers.next(function() {
          expect(el.classList.contains('coral3-Dialog--info')).to.be.true;
          expect(el._elements.icon.icon).to.equal('infoCircle');

          el.variant = Coral.Dialog.variant.HELP;

          helpers.next(function() {
            expect(el.classList.contains('coral3-Dialog--info')).to.be.false;
            expect(el.classList.contains('coral3-Dialog--help')).to.be.true;
            expect(el._elements.icon.icon).to.equal('helpCircle');

            el.variant = Coral.Dialog.variant.DEFAULT;

            helpers.next(function() {
              expect(el.classList.contains('coral3-Dialog--help')).to.be.false;
              expect(el.classList.contains('coral3-Dialog--default')).to.be.false;
              expect(el._elements.icon.icon).to.equal('');
              done();
            });
          });
        });
      });
    });

    describe('#focusOnShow', function() {
      it('should default to ON', function() {
        expect(el.focusOnShow).to.equal(Coral.mixin.overlay.focusOnShow.ON);
      });
    });

    describe('#movable', function() {
      it('should create a drag action instance', function(done) {
        el.movable = true;

        helpers.next(function() {
          var dragAction = el._elements.wrapper.dragAction;
          expect(dragAction instanceof Coral.DragAction).to.be.true;
          expect(dragAction.handle).to.equal(el._elements.headerWrapper);

          done();
        });
      });

      it('should be movable by dragging the dialog header', function(done) {
        // The dialog needs to be opened before it can be moved.
        helpers.build(window.__html__['Coral.Dialog.fromElements-open.html'], function(el) {
          var dragElement = el._elements.wrapper;
          var handle = el._elements.headerWrapper;

          el.movable = true;

          var offset = {
            left: dragElement.offsetLeft,
            top: dragElement.offsetTop
          };

          var width = dragElement.getBoundingClientRect().width;

          helpers.next(function() {
            expect(el._elements.wrapper.style.width).to.equal(width + 'px');

            el.dispatchEvent(dummyMouseEvent('mousedown'));
            el.dispatchEvent(dummyMouseEvent('mousemove', 10, 20));

            // The dialog can only be moved by the handle
            expect(dragElement.offsetLeft).to.equal(offset.left);
            expect(dragElement.offsetTop).to.equal(offset.top);

            handle.dispatchEvent(dummyMouseEvent('mousedown'));
            handle.dispatchEvent(dummyMouseEvent('mousemove', 10, 20));

            expect(dragElement.offsetLeft).to.equal(offset.left + 10);
            expect(dragElement.offsetTop).to.equal(offset.top + 20);

            done();
          });
        });
      });

      it('should not be possible to have fullscreen and movable set to true', function() {
        el.fullscreen = true;
        el.movable = true;

        expect(el.fullscreen).to.be.false;
        expect(el.movable).to.be.true;
      });

      it('should not be possible to have movable and fullscreen set to true', function() {
        el.movable = true;
        el.fullscreen = true;

        expect(el.movable).to.be.false;
        expect(el.fullscreen).to.be.true;
      });

      it('should be possible to center a moved dialog', function(done) {
        el.movable = true;

        var dragElement = el._elements.wrapper;
        var handle = el._elements.headerWrapper;

        helpers.next(function() {
          handle.dispatchEvent(dummyMouseEvent('mousedown'));
          handle.dispatchEvent(dummyMouseEvent('mousemove', 10, 20));

          el.center();

          helpers.next(function() {
            expect(dragElement.style.top).to.equal('50%');
            expect(dragElement.style.left).to.equal('50%');

            done();
          });
        });
      });

      it('should destroy the drag action instance', function(done) {
        el.movable = true;

        helpers.next(function() {
          el.movable = false;

          helpers.next(function() {
            expect(el._elements.wrapper.dragAction).to.be.undefined;

            done();
          });
        });
      });

      it('should center the dialog if not movable anymore', function(done) {
        el.movable = true;

        var dragElement = el._elements.wrapper;
        var handle = el._elements.headerWrapper;

        helpers.next(function() {
          handle.dispatchEvent(dummyMouseEvent('mousedown'));
          handle.dispatchEvent(dummyMouseEvent('mousemove', 10, 20));

          el.movable = false;

          helpers.next(function() {
            expect(dragElement.style.top).to.equal('50%');
            expect(dragElement.style.left).to.equal('50%');

            done();
          });
        });
      });
    });

    describe('#backdrop', function() {
      it('should not take the whole screen if backdrop is set to none', function(done) {
        el.backdrop = 'none';
        el.open = true;

        helpers.next(function() {
          expect(el.open).to.be.true;
          expect(el.classList.contains('coral3-Dialog--backdropNone')).to.be.true;
          expect(document.elementFromPoint(0, 0)).to.not.equal(el);

          done();
        });
      });
    });
  });

  describe('Markup', function() {
    describe('#focusOnShow', function() {
      it('should focus the focusOnShow element when opened', function(done) {
        helpers.build(window.__html__['Coral.Dialog.focusOnShow.html'], function(el) {
          el.on('coral-overlay:open', function() {
            expect(document.activeElement).to.equal(el.querySelector(el.focusOnShow));
            done();
          });

          el.show();
        });
      });

      it('should not focus the close button', function(done) {
        helpers.build(window.__html__['Coral.Dialog.closable.html'], function(el) {
          expect(el.closable).to.equal(Coral.Dialog.closable.ON);

          el.on('coral-overlay:open', function() {
            // we wait a frame for the focus allocation to happen
            helpers.next(function() {
              expect(document.activeElement).to.equal(el, 'The Dialog should be focused');
              done();
            });
          });

          el.show();
        });
      });
    });
  });

  describe('User Interaction', function() {
    describe('#ESC', function() {
      it('should close when escape pressed and interaction=ON', function(done) {
        helpers.build(window.__html__['Coral.Dialog.open.html'], function(el) {
          expect(el.open).to.be.true;
          helpers.keypress('escape');
          expect(el.open).to.be.false;

          done();
        });
      });

      it('should not close when ESC pressed and interaction=OFF', function(done) {
        helpers.build(window.__html__['Coral.Dialog.open.html'], function(el) {
          expect(el.open).to.be.true;
          el.interaction = Coral.Dialog.interaction.OFF;
          helpers.keypress('escape');
          expect(el.open).to.be.true;

          done();
        });
      });

      it('should only close the topmost dialog', function(done) {
        var dialog1 = new Coral.Dialog();
        var dialog2 = new Coral.Dialog();

        helpers.target.appendChild(dialog1);
        helpers.target.appendChild(dialog2);

        var openEventCount = 0;

        // we have to listen at the body level since the dialog would move in order to position itself correctly
        document.body.addEventListener('coral-overlay:open', function() {
          openEventCount++;

          if (openEventCount === 2) {
            expect(dialog2._isTopOverlay()).to.equal(true, 'Dialog 2 should be the top most');

            helpers.keypress('escape');

            expect(dialog1.open).to.equal(true, 'Dialog 1 remains open');
            expect(dialog2.open).to.equal(false, 'Dialog 2 closes when escape is pressed');

            done();
          }
        });

        dialog1.open = true;
        dialog2.open = true;
      });
    });

    // @todo maybe this test should be part of a mixin
    describe('[coral-close]', function() {
      it('should close when close button clicked', function(done) {
        helpers.build(window.__html__['Coral.Dialog.full.html'], function(el) {
          // this targets the close in the header
          el.querySelector('[coral-close]').click();

          expect(el.open).to.equal(false, 'Should be closed after the button with coral-close is clicked');
          done();
        });
      });

      it('should hide when any element with [coral-close] clicked', function(done) {
        helpers.build(window.__html__['Coral.Dialog.full.html'], function(el) {
          expect(el.open).to.equal(true, 'open before close clicked');

          // this targets the close in the footer
          el.footer.querySelector('[coral-close]').click();

          expect(el.open).to.equal(false, 'Should be closed after the button with coral-close is clicked');
          done();
        });
      });

      it('should only hide if selector matches value of [coral-close], should not let events bubble', function() {
        var el = new Coral.Dialog();
        helpers.target.appendChild(el);

        var spy = sinon.spy();
        helpers.target.addEventListener('click', spy);

        el.show();

        el.id = 'myDialog';

        expect(el.open).to.equal(true, 'open before close clicked');

        el.content.innerHTML = '<button coral-close="#myDialog" id="closeMyDialog">Close me!</button><button coral-close="#otherDialog" id="closeOtherDialog">Close someone else!</button>';

        el.querySelector('#closeOtherDialog').click();

        expect(el.open).to.equal(true, 'open after other close clicked');
        expect(spy.callCount).to.equal(1, 'Should have been called once');

        spy.reset();
        el.querySelector('#closeMyDialog').click();

        expect(el.open).to.equal(false, 'open after close clicked');
        expect(spy.callCount).to.equal(0, 'Should be callsed since the id does not match');
      });
    });
  });

  describe('Implementation details', function() {
    var el;
    beforeEach(function() {
      el = new Coral.Dialog();
      helpers.target.appendChild(el);
    });

    afterEach(function() {
      el = null;
    });

    describe('Positioning', function() {
      it('should cause the dialog to scroll when contents are large', function(done) {
        el.set({
          header: {
            innerHTML: 'I am the eggman'
          },
          content: {
            innerHTML: (new Array(500)).join('I am the walrus<br>')
          },
          footer: {
            innerHTML: 'Coo coo ca choo'
          }
        });

        helpers.next(function() {
          el.show();

          helpers.next(function() {
            var content = el._elements.content;
            var dialogHeight = content.getBoundingClientRect().height;
            var docHeight = document.body.getBoundingClientRect().height;

            // If the dialog height is greater than the doc height
            // Then we know the dialog is scrollable
            expect(dialogHeight).to.be.gt(docHeight);

            // We should also be positioned in such a way that the outer div scrolls
            expect(window.getComputedStyle(content).position).to.equal('static');

            // Clean up explicitly
            el.hide();
            helpers.next(done.bind(null, null));
          });
        });
      });

      it('should allow vertical scroll if the dialog is bigger than the window', function(done) {
        el._elements.wrapper.style.height = (window.innerHeight * 2) + 'px';
        el.open = true;
        helpers.next(function() {
          expect(el._elements.wrapper.style.top).to.equal('');
          expect(el._elements.wrapper.style.marginTop).to.equal('');
          done();
        });
      });

      it('should take the whole screen in fullscreen', function(done) {
        el.fullscreen = true;
        el.open = true;
        helpers.next(function() {
          expect(el._elements.wrapper.style.left).to.equal('');
          expect(el._elements.wrapper.style.marginLeft).to.equal('');
          done();
        });
      });

      it('should be centered when contents are small', function(done) {
        el.set({
          header: 'I am the eggman',
          content: 'I am the walrus',
          footer: 'Coo coo ca choo'
        });

        el.show();

        helpers.next(function() {
          var wrapper = el._elements.wrapper;

          var style = wrapper.style;

          // We should definitely be positioned absolute in this case
          expect(style.position).to.equal('absolute');

          // In the center
          expect(style.top).to.equal('50%');
          expect(style.left).to.equal('50%');

          // With a nice calculation for margin offset
          expect(parseFloat(style.marginTop)).to.be.lessThan(0);
          expect(parseFloat(style.marginLeft)).to.be.lessThan(0);

          // Clean up explicitly
          el.hide();
          helpers.next(done.bind(null, null));
        });
      });
    });

    describe('Backdrop', function() {
      it('should remove backdrop when dialog is detached', function(done) {
        el.show();

        // wait in FF one frame
        helpers.next(function() {

          expect(el.open).to.be.true;
          el.remove();

          helpers.next(function() {
            expect(el.parentNode).to.equal(null, 'dialog should be detached');
            var backdrop = document.querySelector('.coral3-Backdrop');
            expect(backdrop).to.not.be.null;

            // Make sure the backdrop is visible
            expect(backdrop._isOpen).to.equal(false, 'backdrop visibility when top overlay hidden');
            done();
          });
        });
      });

      it('should remove backdrop when dialog is detached (even if dialog was closed)', function(done) {
        var el = new Coral.Dialog();
        helpers.target.appendChild(el);
        el.show();

        // wait in FF one frame
        helpers.next(function() {

          expect(el.open).to.be.true;
          el.open = false; //This used to break the test ...
          el.remove();

          helpers.next(function() {
            expect(el.parentNode).to.equal(null, 'dialog should be detached');
            var backdrop = document.querySelector('.coral3-Backdrop');
            expect(backdrop).to.not.be.null;

            // Make sure the backdrop is visible
            expect(backdrop._isOpen).to.equal(false, 'backdrop visibility when top overlay hidden');
            done();

          });
        });
      });
    });

    it('should support inner-wrapper elements', function(done) {
      helpers.build(window.__html__['Coral.Dialog.wrapper.multiple.html'], function(el) {
        var wrapper1 = el.querySelector('#wrapper1');
        var wrapper2 = el.querySelector('#wrapper2');

        expect(el._elements.wrapper).to.exist;
        expect(el._elements.wrapper.className).to.equal('coral3-Dialog-wrapper');

        expect(el._elements.wrapper.contains(wrapper1)).to.equal(true, 'Dialog should contain wrapper1');
        expect(el._elements.wrapper.contains(wrapper2)).to.equal(true, 'Dialog should contain wrapper2');

        expect(wrapper1.contains(wrapper2)).to.equal(true, 'wrapper1 should contain wrapper2');

        expect(wrapper2.contains(el.header)).to.equal(true, 'wrapper2 should contain header');
        expect(wrapper2.contains(el.content)).to.equal(true, 'wrapper2 should contain content');
        expect(wrapper2.contains(el.footer)).to.equal(true, 'wrapper2 should contain footer');

        // Clean up explicitly
        el.hide();
        helpers.next(done.bind(null, null));
      });
    });

    it('should support inner-wrapper elements', function(done) {
      helpers.build(window.__html__['Coral.Dialog.wrapper.single.html'], function(el) {
        var wrapper1 = el.querySelector('#wrapper1');

        expect(el._elements.wrapper).to.exist;
        expect(el._elements.wrapper.className).to.equal('coral3-Dialog-wrapper');

        expect(el._elements.wrapper.contains(wrapper1)).to.equal(true, 'Dialog should contain wrapper1');

        expect(wrapper1.contains(el.header)).to.equal(true, 'wrapper1 should contain header');
        expect(wrapper1.contains(el.content)).to.equal(true, 'wrapper1 should contain content');
        expect(wrapper1.contains(el.footer)).to.equal(true, 'wrapper1 should contain footer');

        // Clean up explicitly
        el.hide();
        helpers.next(done.bind(null, null));
      });
    });

    it('should wrap internal elements', function(done) {
      helpers.build(window.__html__['Coral.Dialog.fromElements.html'], function(el) {
        var wrapper = el._elements.wrapper;

        expect(el._elements.wrapper).to.exist;
        expect(el._elements.wrapper.className).to.equal('coral3-Dialog-wrapper');

        expect(wrapper.contains(el.header)).to.equal(true, 'wrapper should contain header');
        expect(wrapper.contains(el.content)).to.equal(true, 'wrapper should contain content');
        expect(wrapper.contains(el.footer)).to.equal(true, 'wrapper should contain footer');

        // Clean up explicitly
        el.hide();
        helpers.next(done.bind(null, null));
      });
    });

    it('should create wrapper when no content zones are provided', function(done) {
      helpers.build(window.__html__['Coral.Dialog.contentOnly.html'], function(el) {
        var wrapper = el._elements.wrapper;

        expect(el._elements.wrapper).to.exist;
        expect(el._elements.wrapper.className).to.equal('coral3-Dialog-wrapper');

        // we check that all content zones were properly created
        expect(el.header).to.exist;
        expect(el.contains(el.header)).to.be.true;
        expect(el.content).to.exist;
        expect(el.contains(el.content)).to.be.true;
        expect(el.footer).to.exist;
        expect(el.contains(el.footer)).to.be.true;

        expect(wrapper.contains(el.header)).to.equal(true, 'wrapper should contain header');
        expect(wrapper.contains(el.content)).to.equal(true, 'wrapper should contain content');
        expect(wrapper.contains(el.footer)).to.equal(true, 'wrapper should contain footer');

        // the content should be moved into the coral-dialog-content
        expect(el.content.textContent).to.equal('This content will be moved to coral-dialog-content.');

        // Clean up explicitly
        el.hide();
        helpers.next(done.bind(null, null));
      });
    });

    it('should keep all extra elements when content zones are provided', function(done) {
      helpers.build(window.__html__['Coral.Dialog.wrapper.multiple.html'], function(el) {
        var form = el.querySelector('#wrapper2');
        var input = el.querySelector('#input');

        expect(form.firstElementChild).to.equal(input);

        // Clean up explicitly
        el.hide();
        helpers.next(done.bind(null, null));
      });
    });
  });
});
