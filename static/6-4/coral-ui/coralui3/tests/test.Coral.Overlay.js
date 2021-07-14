describe('Coral.Overlay', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined in the Coral namespace', function() {
      expect(Coral).to.have.property('Overlay');
    });

    it('should define the align in an enum', function() {
      expect(Coral.Overlay.align).to.exist;
      expect(Coral.Overlay.align.LEFT_TOP).to.equal('left top');
      expect(Coral.Overlay.align.LEFT_CENTER).to.equal('left center');
      expect(Coral.Overlay.align.LEFT_BOTTOM).to.equal('left bottom');
      expect(Coral.Overlay.align.CENTER_TOP).to.equal('center top');
      expect(Coral.Overlay.align.CENTER_CENTER).to.equal('center center');
      expect(Coral.Overlay.align.CENTER_BOTTOM).to.equal('center bottom');
      expect(Coral.Overlay.align.RIGHT_TOP).to.equal('right top');
      expect(Coral.Overlay.align.RIGHT_CENTER).to.equal('right center');
      expect(Coral.Overlay.align.RIGHT_BOTTOM).to.equal('right bottom');
      expect(Object.keys(Coral.Overlay.align).length).to.equal(9);
    });

    it('should define the collision in an enum', function() {
      expect(Coral.Overlay.collision).to.exist;
      expect(Coral.Overlay.collision.FLIP).to.equal('flip');
      expect(Coral.Overlay.collision.FIT).to.equal('fit');
      expect(Coral.Overlay.collision.FLIP_FIT).to.equal('flipfit');
      expect(Coral.Overlay.collision.NONE).to.equal('none');
      expect(Object.keys(Coral.Overlay.collision).length).to.equal(4);
    });

    it('should define the target in an enum', function() {
      expect(Coral.Overlay.target).to.exist;
      expect(Coral.Overlay.target.PREVIOUS).to.equal('_prev');
      expect(Coral.Overlay.target.NEXT).to.equal('_next');
      expect(Object.keys(Coral.Overlay.target).length).to.equal(2);
    });

    it('should define the placement in an enum', function() {
      expect(Coral.Overlay.placement).to.exist;
      expect(Coral.Overlay.placement.LEFT).to.equal('left');
      expect(Coral.Overlay.placement.RIGHT).to.equal('right');
      expect(Coral.Overlay.placement.BOTTOM).to.equal('bottom');
      expect(Coral.Overlay.placement.TOP).to.equal('top');
      expect(Object.keys(Coral.Overlay.placement).length).to.equal(4);
    });

    it('should define the interaction in an enum', function() {
      expect(Coral.Overlay.interaction).to.exist;
      expect(Coral.Overlay.interaction.ON).to.equal('on');
      expect(Coral.Overlay.interaction.OFF).to.equal('off');
      expect(Object.keys(Coral.Overlay.interaction).length).to.equal(2);
    });
  });

  describe('API', function() {
    var overlay;
    var targetOther;
    var targetNext;
    var targetPrev;

    // Setup tests
    beforeEach(function() {
      // Create a target after the the overlay
      targetPrev = helpers.overlay.createStaticTarget();

      // Create a new overlay
      overlay = new Coral.Overlay();
      helpers.target.appendChild(overlay);

      // Create a target before the overlay
      targetNext = helpers.overlay.createStaticTarget();

      // Create a target elsewhere
      targetOther = helpers.overlay.createFloatingTarget();
      targetOther.setAttribute('id', 'overlay-targetOther');
    });

    afterEach(function() {
      // Close the overlay
      overlay.open = false;
      // Remove it from the DOM
      overlay.remove();

      if (targetNext.parentNode) {
        targetNext.parentNode.removeChild(targetNext);
      }

      if (targetOther.parentNode) {
        targetOther.parentNode.removeChild(targetOther);
      }

      // we clear all the variables
      overlay = null;
      targetNext = null;
      targetOther = null;
    });

    describe('#focusOnShow', function() {
      it('should default to ON', function() {
        expect(overlay.focusOnShow).to.equal(Coral.mixin.overlay.focusOnShow.ON);
      });
    });

    describe('#placement', function() {
      it('should set alignAt and alignMy correctly for top', function() {
        overlay.placement = 'top';
        expect(overlay.alignMy).to.equal('center bottom');
        expect(overlay.alignAt).to.equal('center top');
      });

      it('should set alignAt and alignMy correctly for bottom', function() {
        overlay.placement = 'bottom';
        expect(overlay.alignMy).to.equal('center top');
        expect(overlay.alignAt).to.equal('center bottom');
      });

      it('should set alignAt and alignMy correctly for left', function() {
        overlay.placement = 'left';
        expect(overlay.alignMy).to.equal('right center');
        expect(overlay.alignAt).to.equal('left center');
      });

      it('should set alignAt and alignMy correctly for right', function() {
        overlay.placement = 'right';
        expect(overlay.alignMy).to.equal('left center');
        expect(overlay.alignAt).to.equal('right center');
      });
    });

    describe('#target', function() {
      it('should support DOM elements', function() {
        overlay.target = targetOther;

        expect(overlay._getTarget()).to.equal(targetOther);
      });

      it('should support _prev', function() {
        overlay.target = '_prev';

        expect(overlay._getTarget()).to.equal(targetPrev);
      });

      it('should support _next', function() {
        overlay.target = '_next';

        expect(overlay._getTarget()).to.equal(targetNext);
      });

      it('should support CSS selectors', function() {
        overlay.target = '#overlay-targetOther';

        expect(overlay._getTarget()).to.equal(targetOther);
      });

      it('should store null when null provided', function() {
        overlay.target = null;

        expect(overlay._getTarget()).to.equal(null);
      });
    });

    describe('#show()/hide()', function() {
      // @todo: skipped due to some fails in firefox (CUI-4086)
      it.skip('should open and close the overlay when show()/hide() called', function(done) {
        var target = helpers.overlay.createFloatingTarget();

        overlay.set({
          innerHTML: 'Overlay content',
          target: target
        });
        expect(overlay.open).to.be.false;

        overlay.show();

        helpers.next(function() {
          expect(overlay.open).to.be.true;

          overlay.hide();

          helpers.next(function() {
            expect(overlay.open).to.be.false;
            done();
          });
        });
      });

      // @todo: skipped due to some fails in firefox (CUI-4086)
      it.skip('should set the appropriate value for aria-hidden attribute when the overlay is shown/hidden', function(done) {
        overlay.set({
          innerHTML: 'Overlay content',
          target: targetOther
        });

        // Coral.overlay should apply aria-hidden right away
        expect(overlay.getAttribute('aria-hidden')).to.equal('true');

        overlay.show();
        helpers.next(function() {
          expect(overlay.getAttribute('aria-hidden')).to.equal('false');

          overlay.hide();
          helpers.next(function() {
            expect(overlay.getAttribute('aria-hidden')).to.equal('true');
            done();
          });
        });
      });
    });
  });

  describe('Markup', function() {
    afterEach(function() {
      // we hide any existing overlay if available
      var overlay = helpers.target.querySelector('coral-overlay');
      if (overlay) {
        overlay.open = false;
      }
    });

    describe('#focusOnShow', function() {
      it('should try to focus the overlay', function(done) {
        helpers.build(window.__html__['Coral.Overlay.base.html'], function(el) {

          var spy = sinon.spy(el, 'focus');

          el.on('coral-overlay:open', function() {
            helpers.next(function() {
              expect(spy.callCount).to.equal(1);
              expect(document.activeElement).to.equal(document.body, 'Focus remains in the body, as the component is not focusable');

              done();
            });
          });

          el.show();
        });
      });

      it('should focus the overlay when no element is focusable (trapfocus=on)', function(done) {
        helpers.build(window.__html__['Coral.Overlay.trapFocus.on.html'], function(el) {

          el.on('coral-overlay:open', function() {
            helpers.next(function() {
              expect(document.activeElement).to.equal(el, 'Overlay itself should be focused');

              done();
            });
          });

          el.show();
        });
      });

      it('should focus the focussable descendent', function(done) {
        helpers.build(window.__html__['Coral.Overlay.coral-close.html'], function(el) {
          el.show();

          expect(el.open).to.equal(true, 'open before close clicked');
          el.querySelector('#closeButton').click();
          expect(el.open).to.equal(false, 'open after close clicked');

          done();
        });
      });
    });

    // @todo maybe this test should be part of a mixin
    describe('#[coral-close]', function() {
      it('should hide when any element with [coral-close] clicked', function(done) {
        helpers.build(window.__html__['Coral.Overlay.coral-close.html'], function(el) {
          el.show();

          expect(el.open).to.equal(true, 'open before close clicked');
          el.querySelector('#closeButton').click();
          expect(el.open).to.equal(false, 'open after close clicked');

          done();
        });
      });

      it('should only hide if selector matches value of [coral-close], should not let events bubble', function(done) {
        helpers.build(window.__html__['Coral.Overlay.coral-close.id.html'], function(el) {
          el.show();

          var spy = sinon.spy();
          helpers.target.addEventListener('click', spy);

          expect(el.open).to.equal(true, 'open before close clicked');

          // Click the button that should do nothing
          el.querySelector('#closeOtherOverlay').click();
          expect(el.open).to.equal(true, 'open after close clicked');
          expect(spy.callCount).to.equal(1, 'click event bubble count');

          spy.reset();

          // Click the button that should close the overlay
          el.querySelector('#closeMyOverlay').click();
          expect(el.open).to.equal(false, 'open after close clicked');
          expect(spy.callCount).to.equal(0, 'click event bubble count');

          done();
        });
      });
    });
  });
});
