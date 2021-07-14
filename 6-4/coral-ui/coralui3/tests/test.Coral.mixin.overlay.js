/* jshint -W106 */
describe('Coral.mixin.overlay', function() {
  'use strict';

  // Create dummy overlay components
  var Overlay;
  var OverlayNonModal;
  var tansitionEnd;

  before(function() {
    tansitionEnd = Coral.commons.transitionEnd;

    // mock transitionEnd for the tests (simulate transition ended after 100 ms)
    Coral.commons.transitionEnd = function(el, cb) {
      window.setTimeout(function() {
        cb();
      }, 100);
    };

    OverlayNonModal = Coral.register({
      name: 'NonModalOverlay',
      tagName: 'coral-overlay-nonmodal',
      className: 'coral3-Overlay-nonmodal',

      mixins: [
        Coral.mixin.overlay
      ],

      properties: {
        'trapFocus': {
          default: 'on'
        },
        'returnFocus': {
          default: 'on'
        },
        'content': Coral.property.contentZone({
          handle: 'content',
          tagName: 'coral-overlay-nonmodel-content',
          defaultContentZone: true,
          insert: function(content) {
            this.appendChild(content);
          }
        }),
      },

      _render: function() {
        // Create a temporary fragment
        var fragment = document.createDocumentFragment();

        // Create or fetch the content element.
        var content = this.querySelector('coral-overlay-nonmodel-content') ||
          document.createElement('coral-overlay-nonmodel-content');

        // Remove it so we can process children
        if (content.parentNode) {
          this.removeChild(content);
        }

        // Process remaining elements as necessary
        while (this.firstChild) {
          // Move anything else into the content
          content.appendChild(this.firstChild);
        }

        // Add the frag to the component
        this.appendChild(fragment);

        // Assign the content zones, moving them into place in the process
        this.content = content;
      }
    });

    Overlay = Coral.register({
      name: 'Overlay',
      tagName: 'coral-test-overlay',
      className: 'coral3-Overlay',
      extend: OverlayNonModal,

      properties: {
        'open': {
          sync: function() {
            if (this.open) {
              // Show the backdrop when we're shown
              // This makes the overlay "modal"
              this._showBackdrop();
            }
          }
        }
      }
    });
  });

  after(function() {
    // reset to original transitionEnd impl.
    Coral.commons.transitionEnd = tansitionEnd;
  });

  // Close and remove the instance
  function cleanUpInstance(instance) {
    if (!instance) {
      return;
    }

    instance.open = false;

    if (instance.parentNode) {
      instance.parentNode.removeChild(instance);
    }
  }

  /**
    Test if the provided backdrop element is hidden or hiding
  */
  function backdropOpen(element) {
    return element.style.display !== 'none' && element._isOpen;
  }

  // Hold the instances
  var overlay;
  var overlay1;
  var overlay2;
  var overlay3;

  beforeEach(function() {
    overlay = new Overlay();
    helpers.target.appendChild(overlay);
  });

  // Clean up
  afterEach(function() {
    cleanUpInstance(overlay);
    cleanUpInstance(overlay1);
    cleanUpInstance(overlay2);
    cleanUpInstance(overlay3);
  });

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('mixin');
      expect(Coral.mixin).to.have.property('overlay');
    });

    it('should define the trapFocus in an enum', function() {
      expect(Coral.mixin.overlay.trapFocus).to.exist;
      expect(Coral.mixin.overlay.trapFocus.ON).to.equal('on');
      expect(Coral.mixin.overlay.trapFocus.OFF).to.equal('off');
      expect(Object.keys(Coral.mixin.overlay.trapFocus).length).to.equal(2);
    });

    it('should define the returnFocus in an enum', function() {
      expect(Coral.mixin.overlay.returnFocus).to.exist;
      expect(Coral.mixin.overlay.returnFocus.ON).to.equal('on');
      expect(Coral.mixin.overlay.returnFocus.OFF).to.equal('off');
      expect(Object.keys(Coral.mixin.overlay.returnFocus).length).to.equal(2);
    });

    it('should define the focusOnShow in an enum', function() {
      expect(Coral.mixin.overlay.focusOnShow).to.exist;
      expect(Coral.mixin.overlay.focusOnShow.ON).to.equal('on');
      expect(Coral.mixin.overlay.focusOnShow.OFF).to.equal('off');
      expect(Object.keys(Coral.mixin.overlay.focusOnShow).length).to.equal(2);
    });
  });

  describe('API', function() {
    describe('#_isTopMost()', function() {
      it('should know if it is top most', function(done) {
        overlay1 = new Overlay();
        helpers.target.appendChild(overlay1);
        overlay1.show();

        overlay2 = new Overlay();
        helpers.target.appendChild(overlay2);
        overlay2.show();

        helpers.next(function() {
          expect(overlay1._isTopOverlay()).to.be.false;
          expect(overlay2._isTopOverlay()).to.be.true;

          done();
        });
      });
    });

    describe('#open/show()/hide()', function() {
      it('should default to false', function() {
        expect(overlay.open).to.equal(false, 'Overlays initialize closed by default');
      });

      it('should be set to display:none after closing the overlay silently', function(done) {
        overlay.content.textContent = 'Overlay 1';
        // overlay._overlayAnimationTime = 100;

        overlay.on('coral-overlay:open', function() {
          // close silently
          overlay.set('open', false, true);
          expect(overlay.open).to.equal(false, 'overlay should be closed now');

          // we use setTimeout instead of coral-overlay:close since the silent setter was used
          Coral.commons.transitionEnd(overlay, function() {
            expect(overlay.style.display).to.equal('none', 'overlay should be set to "display:none" now');

            done();
          });
        });

        overlay.open = true;
        expect(overlay.open).to.equal(true, 'overlay should be open now');
      });

      it('should not change hidden when show()/hide() called', function(done) {
        expect(overlay.hidden).to.equal(false);
        overlay.show();
        expect(overlay.hidden).to.equal(false);
        overlay.hide();
        expect(overlay.hidden).to.equal(false);

        done();
      });
    });

    describe('#focusOnShow', function() {
      it('should default to ON', function() {
        expect(overlay.focusOnShow).to.equal(Coral.mixin.overlay.focusOnShow.ON);
      });

      it('should focus the overlay when no content is focusable', function(done) {
        overlay.on('coral-overlay:open', function() {
          // we need to wait for the focus to be set
          helpers.next(function() {
            expect(document.activeElement).to.equal(overlay, 'Focus should fallback to the overlay itself');

            done();
          });
        });

        overlay.show();
      });

      it('should focus the first tababble descendent when available', function(done) {
        overlay.content.insertAdjacentHTML('afterbegin', window.__html__['Coral.mixin.overlay.someButtons.html']);

        overlay.on('coral-overlay:open', function() {
          // we need to wait for the focus to be set
          helpers.next(function() {
            expect(document.activeElement.id).to.equal('button1', 'The first focusable element should get the focus');

            done();
          });
        });

        overlay.show();
      });

      it('should accept an HTMLElement to focus', function(done) {
        overlay.content.insertAdjacentHTML('afterbegin', window.__html__['Coral.mixin.overlay.threeButtons.html']);

        var button2 = overlay.content.querySelector('#button2');

        overlay.focusOnShow = button2;

        overlay.on('coral-overlay:open', function() {
          // we need to wait for the focus to be set
          helpers.next(function() {
            expect(document.activeElement.id).to.equal(button2.id, 'The provided button should be focused');

            done();
          });
        });

        overlay.show();
      });

      it('should fallback to the document body when the provided element is not focusable', function(done) {
        overlay.content.insertAdjacentHTML('afterbegin', window.__html__['Coral.mixin.overlay.threeButtons.html']);

        var div = overlay.content.querySelector('div');

        overlay.focusOnShow = div;

        overlay.on('coral-overlay:open', function() {
          // we need to wait for the focus to be set
          helpers.next(function() {
            expect(document.activeElement).to.equal(document.body, 'Focus should fallback to body');

            done();
          });
        });

        overlay.show();
      });

      it('should focus the first item that matches a selector', function(done) {
        overlay.content.insertAdjacentHTML('afterbegin', window.__html__['Coral.mixin.overlay.threeButtons.html']);

        overlay.focusOnShow = '.demo-content button';

        overlay.on('coral-overlay:open', function() {
          // we need to wait for the focus to be set
          helpers.next(function() {
            expect(document.activeElement.id).to.equal('button1', 'Should focus the first item that matches the selctor');

            done();
          });
        });

        overlay.show();
      });

      it('should default to the first tababble descendent when the selector is invalid', function(done) {
        overlay.content.insertAdjacentHTML('afterbegin', window.__html__['Coral.mixin.overlay.threeButtons.html']);

        overlay.focusOnShow = '#input';

        overlay.on('coral-overlay:open', function() {
          // we need to wait for the focus to be set
          helpers.next(function() {
            expect(document.activeElement.id).to.equal('button1', 'Should fallback to the first tabbable element');

            done();
          });
        });

        overlay.show();
      });

      it('should not focus the contents if the selector matches a non focusable item', function(done) {
        overlay.content.insertAdjacentHTML('afterbegin', window.__html__['Coral.mixin.overlay.threeButtons.html']);
        overlay.focusOnShow = 'div';

        overlay.on('coral-overlay:open', function() {
          // we need to wait for the focus to be set
          helpers.next(function() {
            expect(document.activeElement).to.equal(document.body, 'Should focus the body since the div is not focusable');

            done();
          });
        });

        overlay.show();
      });

      it('should default to the overlay when the selector is invalid (and no tabbable element is available)', function(done) {
        overlay.content.insertAdjacentHTML('afterbegin', window.__html__['Coral.mixin.overlay.nonTabbableContent.html']);

        overlay.focusOnShow = '#input';

        overlay.on('coral-overlay:open', function() {
          // we need to wait for the focus to be set
          helpers.next(function() {
            expect(document.activeElement).to.equal(overlay, 'Should fallback to the overlay element');

            done();
          });
        });

        overlay.show();
      });

      it('should accept :first-child as a selector', function(done) {
        overlay.content.insertAdjacentHTML('afterbegin', window.__html__['Coral.mixin.overlay.someButtons.html']);
        overlay.focusOnShow = ':first-child';

        overlay.on('coral-overlay:open', function() {
          // we need to wait for the focus to be set
          helpers.next(function() {
            expect(document.activeElement).to.equal(overlay.content.firstChild, 'Should focus the first child');

            done();
          });
        });

        overlay.show();
      });

      it('should focus on the last-of-type item when shown', function(done) {
        overlay.content.insertAdjacentHTML('afterbegin', window.__html__['Coral.mixin.overlay.someButtons.html']);
        overlay.focusOnShow = 'button:last-of-type';

        overlay.on('coral-overlay:open', function() {
          // we need to wait for the focus to be set
          helpers.next(function() {
            expect(document.activeElement.id).to.equal('button2', 'Should focus the last button');

            done();
          });
        });

        overlay.show();
      });

      it('should not move focus when OFF', function(done) {
        overlay.content.insertAdjacentHTML('afterbegin', window.__html__['Coral.mixin.overlay.someButtons.html']);
        overlay.focusOnShow = Coral.mixin.overlay.focusOnShow.OFF;

        overlay.on('coral-overlay:open', function() {
          // we need to wait for the focus to be set
          helpers.next(function() {
            expect(document.activeElement).to.equal(document.body, 'Focus should remain on the body');

            done();
          });
        });

        overlay.show();
      });
    });

    describe('#returnFocus', function() {
      it('should focus on previously focused element when hidden', function(done) {
        var button = document.createElement('button');
        helpers.target.appendChild(button);

        // Focus on the button; this becomes the focused item that should receive focus after the overlay is closed
        button.focus();

        // Spy on the focus method
        // We can't actually check if the button is focused because the browser window needs to be focused for that to happen
        var focusSpy = sinon.spy(button, 'focus');

        // we close it immediately after it opens
        overlay.on('coral-overlay:open', function() {
          // we wait for the component to deal with the focus before hiding it; returnFocusTo assumes that the component
          // was focused or its internals, otherwise it would decide not to focus the target
          helpers.next(function() {
            expect(overlay).to.equal(document.activeElement, 'Overlay should be in focus');
            overlay.hide();
          });
        });

        overlay.on('coral-overlay:close', function() {
          // Wait a tick, then expect to have focus
          helpers.next(function() {
            // See if our spy was called
            expect(focusSpy.callCount).to.equal(1, 'Focus should have been called once');

            done();
          });
        });

        overlay.show();
      });
    });

    describe('#returnFocusTo()', function() {
      it('should return focus to the passed element', function(done) {
        var button1 = document.createElement('button');
        var button2 = document.createElement('button');
        helpers.target.appendChild(button1);
        helpers.target.appendChild(button2);

        // we move the focus to the 2nd button in order to test that returnFocusTo returns the focus to the provided
        // elements, instead of giving it back to the element that had focus before opening the overlay
        button2.focus();

        // Spy on the focus method; We can't actually check if the button is focused because the browser window needs to
        // be focused for that to happen
        var button1focusSpy = sinon.spy(button1, 'focus');
        var button2focusSpy = sinon.spy(button2, 'focus');

        // Tell the overlay to return focus to the button when hidden
        overlay.returnFocusTo(button1);

        // we close it immediately after it opens
        overlay.on('coral-overlay:open', function() {
          expect(overlay).to.equal(document.activeElement, 'Overlay should be in focus');
          overlay.hide();
        });

        overlay.on('coral-overlay:close', function() {
          expect(button1focusSpy.callCount).to.equal(1, 'focus() should have been called');
          expect(button2focusSpy.callCount).to.equal(0, 'focus() should not have been called');
          expect(document.activeElement).to.equal(button1, 'Focus returned to the button');

          done();
        });

        overlay.show();
      });

      it('should always return focus to the passed element', function(done) {
        var button1 = document.createElement('button');
        button1.id = 'button1';
        var button2 = document.createElement('button');
        button2.id = 'button2';
        helpers.target.appendChild(button1);
        helpers.target.appendChild(button2);

        var closeCount = 0;

        // we move the focus to the 2nd button in order to test that returnFocusTo returns the focus to the provided
        // elements, instead of giving it back to the element that had focus before opening the overlay
        button2.focus();

        // Spy on the focus method; We can't actually check if the button is focused because the browser window needs to
        // be focused for that to happen
        var button1focusSpy = sinon.spy(button1, 'focus');
        var button2focusSpy = sinon.spy(button2, 'focus');

        // Tell the overlay to return focus to the button when hidden
        overlay.returnFocusTo(button1);

        // we close it immediately after it opens
        overlay.on('coral-overlay:open', function() {
          expect(overlay).to.equal(document.activeElement, 'Overlay should be in focus');
          overlay.hide();
        });

        overlay.on('coral-overlay:close', function() {
          closeCount++;

          expect(document.activeElement).to.equal(button1, 'Focus returned to the button');
          expect(button1focusSpy.callCount).to.equal(closeCount, 'focus() should have been called');
          expect(button2focusSpy.callCount).to.equal(0, 'focus() should not have been called');

          if (closeCount === 2) {
            done();
            return;
          }

          helpers.next(function() {
            // we move the focus to the 2nd button again to check if it returns the focus to the desired target
            button2.focus();
            // we reset the spy since we called focus manually
            button2focusSpy.reset();
            // we open the overlay again
            overlay.show();
          });
        });

        overlay.show();
      });

      it('should focus on the element passed to returnFocusTo() when hidden, even when element is not interactive', function(done) {
        var div = document.createElement('div');
        helpers.target.appendChild(div);

        // Spy on the focus method
        // We can't actually check if the div is focused because the browser window needs to be focused for that to happen
        var focusSpy = sinon.spy(div, 'focus');

        // Tell the overlay to return focus to the div when hidden
        overlay.returnFocusTo(div);

        overlay.on('coral-overlay:open', function() {
          expect(div.getAttribute('tabindex')).to.equal('-1', 'returnFocusTo element is focusable');
          expect(overlay).to.equal(document.activeElement, 'Overlay should be in focus');
          overlay.hide();
        });

        overlay.on('coral-overlay:close', function() {
          // See if our spy was called
          expect(focusSpy.callCount).to.equal(1, 'focus() should have been called once');

          // Dispatch a blur event from returnFocusTo element
          helpers.event(div, 'blur');

          helpers.next(function() {

            expect(div.getAttribute('tabindex')).to.equal(null, 'tabindex removed from non-interactive returnFocusTo on blur');

            done();
          });
        });

        overlay.show();
      });
    });
  });

  describe('Markup', function() { });

  describe('Events', function() {
    it('should trigger "coral-overlay:open" event only after the transition is finished', function(done) {
      overlay.content.textContent = 'Overlay 1';
      //overlay._overlayAnimationTime = 100;

      var openHasBeenCalled = false;
      helpers.next(function() {
        openHasBeenCalled = true;
      });

      overlay.open = true;
      expect(openHasBeenCalled).to.equal(false, '"coral-overlay:open" should only be fired after the transition is finished');

      // "coral-overlay:open" should only be called after animation is over
      window.setTimeout(function() {
        expect(openHasBeenCalled).to.equal(true, '"coral-overlay:open" should now have been called');
        done();
      }, 101);
    });

    it('should trigger "coral-overlay:close" event only after the transition is finished', function(done) {
      overlay.content.textContent = 'Overlay 1';
      //overlay._overlayAnimationTime = 100;

      overlay.open = true;

      var closeHasBeenCalled = false;
      overlay.on('coral-overlay:close', function() {
        closeHasBeenCalled = true;
      });

      helpers.next(function() {
        overlay.open = false;
        expect(closeHasBeenCalled).to.equal(false, '"coral-overlay:close" should only be called after transition is over');

        // "coral-overlay:close" should only be called after animation is over
        window.setTimeout(function() {
          expect(closeHasBeenCalled).to.equal(true, '"coral-overlay:close" should now have been called');
          done();
        }, 101);
      });
    });

    it('should be possible to toggle the overlay while it is still in the transition', function(done) {
      var openSpy = sinon.spy();
      var closeSpy = sinon.spy();

      overlay.content.textContent = 'Overlay 1';
      overlay._overlayAnimationTime = 100; // This test will use a Coral.commons.transitionEnd mock!

      helpers.next(function() {
        overlay.on('coral-overlay:open', openSpy);
        overlay.on('coral-overlay:close', closeSpy);

        overlay.open = true;

        //make sure sync of "open" attribute has been called by waiting 2 frames
        helpers.next(function() {
          helpers.next(function() {
            overlay.open = false;
            expect(openSpy.called).to.equal(false, '"coral-overlay:open" should never be called as it is canceled by close before animation is done');
            expect(closeSpy.called).to.equal(false, '"coral-overlay:close" should only be called once animation is over');

            // "coral-overlay:close" should only be called after animation is over
            window.setTimeout(function() {
              expect(openSpy.called).to.equal(false, '"coral-overlay:open" should still not be called as it was canceled by close before animation was done');
              expect(closeSpy.called).to.equal(true, '"coral-overlay:close" now should have been called');
              done();
            }, 200);
          });
        });
      });
    });

    it('should make sure that only one "coral-overlay:close" event is thrown at a time', function(done) {
      var beforeOpenSpy = sinon.spy();
      var beforeCloseSpy = sinon.spy();
      var openSpy = sinon.spy();
      var closeSpy = sinon.spy();

      overlay.content.textContent = 'Overlay 1';
      overlay._overlayAnimationTime = 100; // This test will use a Coral.commons.transitionEnd mock!

      overlay.on('coral-overlay:beforeopen', beforeOpenSpy);
      overlay.on('coral-overlay:beforeclose', beforeCloseSpy);
      overlay.on('coral-overlay:open', openSpy);
      overlay.on('coral-overlay:close', closeSpy);

      overlay.open = true;
      overlay.open = false;
      overlay.open = true;
      overlay.open = false;

      window.setTimeout(function() {
        expect(beforeOpenSpy.callCount).to.equal(2, '"coral-overlay:beforeopen" should have been called twice!');
        expect(beforeCloseSpy.callCount).to.equal(2, '"coral-overlay:beforeclose" should have been called twice');
        expect(openSpy.callCount).to.equal(0, '"coral-overlay:open" should never be called as it is canceled by close before animation is done');
        expect(closeSpy.callCount).to.equal(1, '"coral-overlay:close" should only be called "once"!');
        done();
      }, 200);
    });

    it('should make sure that only one "coral-overlay:open" event is thrown at a time', function(done) {
      var beforeOpenSpy = sinon.spy();
      var beforeCloseSpy = sinon.spy();

      var openSpy = sinon.spy();
      var closeSpy = sinon.spy();

      overlay.content.textContent = 'Overlay 1';
      overlay._overlayAnimationTime = 100; // This test will use a Coral.commons.transitionEnd mock!

      overlay.on('coral-overlay:beforeopen', beforeOpenSpy);
      overlay.on('coral-overlay:beforeclose', beforeCloseSpy);
      overlay.on('coral-overlay:open', openSpy);
      overlay.on('coral-overlay:close', closeSpy);

      overlay.open = true;
      overlay.open = false;
      overlay.open = true;
      overlay.open = false;
      overlay.open = true;

      window.setTimeout(function() {
        expect(beforeOpenSpy.callCount).to.equal(3, '"coral-overlay:beforeopen" should have been called three times!');
        expect(beforeCloseSpy.callCount).to.equal(2, '"coral-overlay:beforeclose" should have been called twice');
        expect(openSpy.callCount).to.equal(1, '"coral-overlay:open" should only be called "once"!');
        expect(closeSpy.callCount).to.equal(0, '"coral-overlay:close" should never be called as it is canceled by open before animation is done');
        done();
      }, 200);
    });

    it('should be possible to open/close overlay silently', function(done) {
      overlay.content.textContent = 'Overlay 1';
      // overlay._overlayAnimationTime = 100;

      overlay.open = true;
      expect(overlay.open).to.equal(true, 'overlay should be open now');

      var beforeCloseSpy = sinon.spy();
      overlay.on('coral-overlay:beforeclose', beforeCloseSpy);

      var closeSpy = sinon.spy();
      overlay.on('coral-overlay:close', closeSpy);

      helpers.next(function() {
        overlay.set('open', false, true); // close silently
        expect(overlay.open).to.equal(false, 'overlay should be closed now');

        // "coral-overlay:close" should only be called after animation is over
        window.setTimeout(function() {
          expect(closeSpy.callCount).to.equal(0, 'no "coral-overlay:close" event should have been fired');
          expect(beforeCloseSpy.callCount).to.equal(0, 'no "coral-overlay:beforeclose" event should have been fired');

          done();
        }, 101);
      });
    });
  });

  describe('User Interaction', function() {
    it('should call backdropClickedCallback on all overlays when backdrop clicked', function(done) {
      overlay1 = new Overlay();
      helpers.target.appendChild(overlay1);
      overlay1.backdropClickedCallback = sinon.spy();
      overlay1.show();

      overlay2 = new Overlay();
      helpers.target.appendChild(overlay2);
      overlay2.backdropClickedCallback = sinon.spy();
      overlay2.show();

      helpers.next(function() {
        document.querySelector('.coral3-Backdrop').click();

        expect(overlay1.backdropClickedCallback.callCount).to.equal(1);
        expect(overlay2.backdropClickedCallback.callCount).to.equal(1);

        done();
      });
    });
  });

  describe('Implementation Details', function() {
    describe('focus()', function() {
      it('should keep focus on the container when focused', function(done) {
        overlay.content.insertAdjacentHTML('afterbegin', window.__html__['Coral.mixin.overlay.someButtons.html']);

        overlay.on('coral-overlay:open', function() {
          overlay.focus();
          expect(document.activeElement).to.equal(overlay);

          done();
        });

        overlay.show();
      });
    });

    describe('tabcapture', function() {
      /*skip*/
      it.skip('should focus on the last focusable element when top tab capture focused', function() {
        overlay.content.insertAdjacentHTML('afterbegin', window.__html__['Coral.mixin.overlay.someButtons.html']);

        var button2 = overlay.content.querySelector('#button2');

        overlay.show();

        overlay.querySelectorAll('[coral-tabcapture]')[0].focus();
        expect(document.activeElement).to.equal(button2);
      });

      /*skip*/
      it.skip('should focus on the first focusable element when intermediate tab capture focused', function() {
        overlay.content.insertAdjacentHTML('afterbegin', window.__html__['Coral.mixin.overlay.someButtons.html']);

        var button1 = overlay.content.querySelector('#button1');

        overlay.show();

        overlay.querySelectorAll('[coral-tabcapture]')[1].focus();
        expect(document.activeElement).to.equal(button1);
      });

      /*skip*/
      it.skip('should focus on the last focusable element when last tab capture focused', function() {
        overlay.content.insertAdjacentHTML('afterbegin', window.__html__['Coral.mixin.overlay.someButtons.html']);

        var button2 = overlay.content.querySelector('#button2');

        overlay.show();

        overlay.querySelectorAll('[coral-tabcapture]')[2].focus();
        expect(document.activeElement).to.equal(button2);
      });

      it('should position tabcapture elements correctly on show', function(done) {
        overlay.appendChild(document.createElement('div'));

        overlay.on('coral-overlay:open', function() {
          expect(overlay.lastElementChild).to.equal(overlay._elements.bottomTabCapture);
          expect(overlay.lastElementChild.previousElementSibling).to.equal(overlay._elements.intermediateTabCapture);

          done();
        });

        overlay.show();
      });

      it('should position tabcapture elements correctly on show if their order is changed', function(done) {
        overlay.insertBefore(document.createElement('div'), overlay._elements.bottomTabCapture);

        overlay.show();

        overlay.on('coral-overlay:open', function() {
          expect(overlay.lastElementChild).to.equal(overlay._elements.bottomTabCapture);
          expect(overlay.lastElementChild.previousElementSibling).to.equal(overlay._elements.intermediateTabCapture);

          done();
        });
      });
    });

    describe('Backdrop', function() {
      it('should appear above other overlays with a correctly positioned backdrop', function(done) {
        overlay1 = new Overlay();
        overlay1.content.textContent = 'Overlay 1';
        helpers.target.appendChild(overlay1);

        overlay2 = new Overlay();
        overlay2.content.textContent = 'Overlay 2';
        helpers.target.appendChild(overlay2);

        overlay1.show();
        overlay2.show();

        helpers.next(function() {
          var backdrop = document.querySelector('.coral3-Backdrop');
          expect(backdrop).to.not.be.null;

          // Make sure the top overlay is above the bottom overlay
          expect(helpers.zIndex(overlay2)).to.be.greaterThan(helpers.zIndex(overlay1));

          // Make sure the backdrop is positioned under the top overlay
          expect(helpers.zIndex(backdrop)).to.be.lessThan(helpers.zIndex(overlay2), 'backdrop zIndex as compared to top overlay when both visible');

          // Make sure the backdrop is positioned above the bottom overlay
          expect(helpers.zIndex(backdrop)).to.be.greaterThan(helpers.zIndex(overlay1), 'backdrop zIndex as compared to bottom overlay when both visible');

          // Clean up
          overlay1.hide();
          overlay2.hide();

          helpers.next(function() {
            // Wait for clean up to be complete
            done();
          });
        });
      });

      it('should hide backdrop when overlay is removed from DOM', function(done) {
        overlay.show();

        helpers.next(function() {
          var backdrop = document.querySelector('.coral3-Backdrop');
          expect(backdrop).to.not.be.null;

          // Make sure the backdrop is visible
          expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility when overlay shown');

          // Remove from the DOM
          helpers.target.removeChild(overlay);

          helpers.next(function() {
            // Make sure the backdrop is hidden
            expect(backdropOpen(backdrop)).to.equal(false, 'backdrop visibility when overlay removed from DOM');

            done();
          });
        });
      });

      it('should hide backdrop when hiding overlay (even if overlay is directly detached afterwards)', function(done) {
        overlay.show();

        helpers.next(function() {
          var backdrop = document.querySelector('.coral3-Backdrop');
          expect(backdrop).to.not.be.null;

          // Make sure the backdrop is visible
          expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility when overlay shown');

          // hide the overlay
          overlay.hide();

          // Remove from the DOM
          helpers.target.removeChild(overlay);

          helpers.next(function() {
            // Make sure the backdrop is hidden
            expect(backdropOpen(backdrop)).to.equal(false, 'backdrop visibility when overlay removed from DOM');

            done();
          });
        });
      });

      it('should not hide backdrop when multiple modal overlays are open and one is closed', function(done) {
        overlay1 = new Overlay();
        helpers.target.appendChild(overlay1);

        overlay2 = new Overlay();
        helpers.target.appendChild(overlay2);

        overlay1.show();
        overlay2.show();

        helpers.next(function() {
          var backdrop = document.querySelector('.coral3-Backdrop');
          expect(backdrop).to.not.be.null;

          // Make sure the backdrop is visible
          expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility when both overlays visible');

          // Make sure the backdrop positioned under the top overlay
          expect(helpers.zIndex(backdrop)).to.be.lessThan(helpers.zIndex(overlay2), 'backdrop zIndex as compared to top overlay when both visible');

          // Make sure the backdrop positioned above the bottom overlay
          expect(helpers.zIndex(backdrop)).to.be.greaterThan(helpers.zIndex(overlay1), 'backdrop zIndex as compared to bottom overlay when both visible');

          // Hide top overlay
          overlay2.hide();

          helpers.next(function() {
            // Make sure the backdrop is visible
            expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility when top overlay hidden');

            // Make sure it's positioned under the bottom overlay
            expect(helpers.zIndex(backdrop)).to.be.lessThan(helpers.zIndex(overlay1), 'backdrop zIndex as compared to bottom overlay when top overlay closed');

            // Hide the bottom overlay
            overlay1.hide();

            helpers.next(function() {
              // Make sure the backdrop is hidden
              expect(backdropOpen(backdrop)).to.equal(false, 'backdrop visibility when both overlays hidden');

              // Make sure it's positioned under the bottom overlay
              expect(helpers.zIndex(backdrop)).to.be.lessThan(helpers.zIndex(overlay1), 'backdrop zIndex as compared to bottom overlay when both overlays closed');

              done();
            });
          });
        });
      });

      it('should not hide backdrop when a non-modal overlay is closed before a modal overlay is opened', function(done) {
        overlay1 = new OverlayNonModal();
        helpers.target.appendChild(overlay1);

        overlay2 = new Overlay();
        helpers.target.appendChild(overlay2);

        overlay2.show();

        helpers.next(function() {
          var backdrop = document.querySelector('.coral3-Backdrop');
          expect(backdrop).to.not.be.null;

          // Make sure the backdrop is open
          expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility after modal overlay shown');

          // Hide modal overlay
          overlay2.hide();

          helpers.next(function() {
            // Make sure the backdrop is not open
            expect(backdropOpen(backdrop)).to.equal(false, 'backdrop visibility before modal overlay shown again');

            // Show non-modal overlay
            overlay1.show();

            helpers.next(function() {
              // Make sure the backdrop is not open
              expect(backdropOpen(backdrop)).to.equal(false, 'backdrop visibility before modal overlay shown again');

              // Show modal overlay
              overlay2.show();

              // Hide non-modal overlay
              overlay1.hide();

              setTimeout(function() {
                // Make sure the backdrop is visible
                expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility when non-modal overlay hidden');

                done();
              }, Coral.mixin.overlay.FADETIME + 50);
            });
          });
        });
      });

      it('should correctly position the backdrop when a middle overlay is closed', function(done) {
        overlay1 = new Overlay();
        helpers.target.appendChild(overlay1);
        overlay1.show();

        overlay2 = new Overlay();
        helpers.target.appendChild(overlay2);
        overlay2.show();

        overlay3 = new Overlay();
        helpers.target.appendChild(overlay3);
        overlay3.show();

        helpers.next(function() {
          var backdrop = document.querySelector('.coral3-Backdrop');
          expect(backdrop).to.not.be.null;

          // Make sure the backdrop is visible
          expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility initially');

          // Make sure it's positioned under the top overlay
          expect(helpers.zIndex(backdrop)).to.be.lessThan(helpers.zIndex(overlay3), 'backdrop zIndex as compared to top overlay');

          // Make sure it's positioned above the middle overlay
          expect(helpers.zIndex(backdrop)).to.be.greaterThan(helpers.zIndex(overlay2), 'backdrop zIndex as compared to middle overlay');

          // Make sure it's positioned above the bottom overlay
          expect(helpers.zIndex(backdrop)).to.be.greaterThan(helpers.zIndex(overlay1), 'backdrop zIndex as compared to bottom overlay');

          // Hide middle overlay
          overlay2.hide();

          helpers.next(function() {
            // Make sure the backdrop is visible
            expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility when middle overlay hidden');

            // Make sure it's positioned under the top overlay
            expect(helpers.zIndex(backdrop)).to.be.lessThan(helpers.zIndex(overlay3), 'backdrop zIndex as compared to top overlay');

            // Make sure it's positioned above the bottom overlay
            expect(helpers.zIndex(backdrop)).to.be.greaterThan(helpers.zIndex(overlay1), 'backdrop zIndex as compared to bottom overlay');

            // Hide the bottom overlay
            overlay1.hide();

            helpers.next(function() {
              // Make sure the backdrop is visible
              expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility when bottom overlay hidden');

              // Make sure it's positioned under the top overlay
              expect(helpers.zIndex(backdrop)).to.be.lessThan(helpers.zIndex(overlay3), 'backdrop zIndex as compared to top overlay');

              // Hide the top overlay
              overlay3.hide();

              helpers.next(function() {
                // Make sure the backdrop is hidden
                expect(backdropOpen(backdrop)).to.equal(false, 'backdrop visibility when all overlays hidden');

                done();
              });
            });
          });
        });
      });

      it('should position the backdrop under the topmost overlay that does have a backdrop', function(done) {
        overlay1 = new Overlay();
        overlay1.show();
        helpers.target.appendChild(overlay1);

        // make two non modal overlays
        overlay2 = new OverlayNonModal();
        overlay2.show();
        helpers.target.appendChild(overlay2);

        overlay3 = new OverlayNonModal();
        overlay3.show();
        helpers.target.appendChild(overlay3);

        helpers.next(function() {
          var backdrop = document.querySelector('.coral3-Backdrop');
          expect(backdrop).to.not.be.null;

          // Make sure the backdrop is visible
          expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility initially');

          expect(helpers.zIndex(backdrop)).to.equal(helpers.zIndex(overlay1) - 1, 'backdrop should be behind the modal dialog 1');

          overlay3.hide();

          helpers.next(function() {
            expect(helpers.zIndex(backdrop)).to.equal(helpers.zIndex(overlay1) - 1, 'backdrop shouldstill be behind the modal dialog 1');
            done();
          });

        });
      });

      it('should hide backdrop when removed from the DOM while visible, show it again when reattached', function(done) {
        overlay.show();

        helpers.next(function() {
          var backdrop = document.querySelector('.coral3-Backdrop');
          expect(backdrop).to.not.be.null;

          // Make sure the backdrop is visible
          expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility when overlay shown');

          // Remove from the DOM
          helpers.target.removeChild(overlay);

          helpers.next(function() {
            // Make sure the backdrop is hidden
            expect(backdropOpen(backdrop)).to.equal(false, 'backdrop visibility when overlay removed from DOM');

            // Add back to the DOM
            helpers.target.appendChild(overlay);

            helpers.next(function() {
              // Make sure the backdrop is visible
              expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility when overlay appended to DOM');

              done();
            });
          });
        });
      });

      it('should be considered top most when attached as visible', function(done) {
        // Add a overlay to the DOM, then make it visible
        overlay1 = new Overlay();
        helpers.target.appendChild(overlay1);
        overlay1.show();

        // Create a overlay, make it visible, but don't add it to the DOM
        overlay2 = new Overlay();
        overlay2.show();

        helpers.next(function() {
          // Add the visible overlay
          helpers.target.appendChild(overlay2);

          helpers.next(function() {
            // It should now be on top
            expect(helpers.zIndex(overlay2)).to.be.greaterThan(helpers.zIndex(overlay1));

            overlay2.hide();

            helpers.next(function() {
              var backdrop = document.querySelector('.coral3-Backdrop');
              expect(backdrop).to.not.be.null;

              expect(helpers.zIndex(overlay1)).to.be.greaterThan(helpers.zIndex(backdrop));

              // Clean up
              overlay1.hide();
              overlay2.hide();

              helpers.next(function() {
                // Wait for clean up to be complete
                done();
              });
            });
          });
        });
      });

      it('should hide when done closing', function(done) {
        // Temporarily change the fade time to 1ms
        var FADETIME = Coral.mixin.overlay.FADETIME;
        Coral.mixin.overlay.FADETIME = 0;

        helpers.next(function() {
          overlay1.show();
          helpers.next(function() {
            overlay.hide();

            // Test if hidden after 10ms
            setTimeout(function() {
              expect(overlay.open).to.be.false;
              expect(overlay.style.display).to.equal('none');

              // Restore fade time
              Coral.mixin.overlay.FADETIME = FADETIME;
              helpers.next(function() {
                // Wait for clean up to be complete
                done();
              });
            }, 101);
          });
        });
      });
    });
  });
});
