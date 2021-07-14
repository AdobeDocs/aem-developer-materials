describe('Coral.Tooltip', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined in Coral namespace', function() {
      expect(Coral).to.have.property('Tooltip');
      expect(Coral.Tooltip).to.have.property('Content');
    });

    it('should define the variants in an enum', function() {
      expect(Coral.Tooltip.variant).to.exist;
      expect(Coral.Tooltip.variant.INFO).to.equal('info');
      expect(Coral.Tooltip.variant.ERROR).to.equal('error');
      expect(Coral.Tooltip.variant.WARNING).to.equal('warning');
      expect(Coral.Tooltip.variant.SUCCESS).to.equal('success');
      expect(Coral.Tooltip.variant.INSPECT).to.equal('inspect');
      expect(Object.keys(Coral.Tooltip.variant).length).to.equal(5);
    });
  });

  describe('API', function() {
    describe('#delay', function() {
      it('should default to 500', function() {
        var tooltip = new Coral.Tooltip();
        helpers.target.appendChild(tooltip);
        expect(tooltip.delay).to.equal(500);
      });
    });

    describe('#variant', function() {
      it('should default to info', function() {
        var tooltip = new Coral.Tooltip();
        helpers.target.appendChild(tooltip);

        expect(tooltip.variant).to.equal(Coral.Tooltip.variant.INFO);
      });
    });

    describe('#content', function() {
      it('should set content', function(done) {
        var tooltip = new Coral.Tooltip();
        helpers.target.appendChild(tooltip);

        tooltip.content.innerHTML = 'Test';
        tooltip.show();

        Coral.commons.nextFrame(function() {
          expect(tooltip.textContent).to.equal('Test');
          done();
        });
      });
    });

    describe('#interaction', function() {
      it('should not open on target mouseenter when interaction="off"', function() {
        var target = helpers.createFloatingTarget();

        var tooltip = new Coral.Tooltip().set({
          content: {
            textContent: 'A tooltip'
          },
          target: target,
          placement: 'top',
          interaction: 'off',
          delay: 0
        });
        helpers.target.appendChild(tooltip);

        expect(tooltip.open).to.equal(false, 'tooltip closed initially');

        target.dispatchEvent(new Event('mouseenter'));
        expect(tooltip.open).to.equal(false, 'tooltip still closed after mouseenter on target');
      });

      it('should not open on target mouseenter when interaction="off"', function() {
        var target = helpers.createFloatingTarget();

        var tooltip = new Coral.Tooltip().set({
          content: {
            textContent: 'A tooltip'
          },
          target: target,
          placement: 'top',
          interaction: 'on',
          delay: 0
        });
        helpers.target.appendChild(tooltip);

        expect(tooltip.open).to.equal(false, 'tooltip closed initially');

        target.dispatchEvent(new Event('mouseenter'));
        expect(tooltip.open).to.equal(true, 'tooltip open after mouseenter on target');

        tooltip.open = false;
        tooltip.interaction = 'off';

        target.dispatchEvent(new Event('mouseenter'));
        expect(tooltip.open).to.equal(false, 'tooltip still closed after mouseenter on target');
      });
    });

    describe('#focusOnShow', function() {
      it('should default to "off"', function() {
        var tooltip = new Coral.Tooltip();
        helpers.target.appendChild(tooltip);

        expect(tooltip.focusOnShow).to.equal(Coral.mixin.overlay.focusOnShow.OFF);
      });
    });
  });

  describe('Markup', function() {});
  describe('Events', function() {});

  describe('User Interaction', function() {
    it('should not display the tooltip until the specified delay', function() {
      var target = helpers.createFloatingTarget();

      var tooltip = new Coral.Tooltip().set({
        target: target,
        placement: 'top',
        delay: 0
      });
      helpers.target.appendChild(tooltip);

      expect(tooltip.open).to.be.false;

      // trigger twice to check that timeout is cleared.
      target.dispatchEvent(new Event('mouseenter'));
      target.dispatchEvent(new Event('mouseenter'));
      expect(tooltip.open).to.be.true;
    });

    it('should open when target element is focused', function() {
      var target = helpers.createFloatingTarget();

      var tooltip = new Coral.Tooltip().set({
        content: {
          textContent: 'A tooltip'
        },
        target: target,
        placement: 'top',
        delay: 0
      });
      helpers.target.appendChild(tooltip);

      expect(tooltip.open).to.equal(false, 'tooltip closed initially');

      target.dispatchEvent(new Event('mouseenter'));
      expect(tooltip.open).to.equal(true, 'tooltip open after focusing on target');
    });

    it('should be hidden when focusout triggered on the target element', function(done) {
      var target = helpers.createFloatingTarget();

      var tooltip = new Coral.Tooltip().set({
        target: target,
        placement: 'top',
        delay: 0
      });
      helpers.target.appendChild(tooltip);

      expect(tooltip.open).to.be.false;

      tooltip.show();

      expect(tooltip.open).to.be.true;

      target.dispatchEvent(new Event('mouseleave'));
      Coral.commons.nextFrame(function() {
        expect(tooltip.open).to.be.false;
        done();
      });
    });

    it('should clear any remaining timeouts when focusout triggered on the target element', function(done) {
      var target = helpers.createFloatingTarget();

      var tooltip = new Coral.Tooltip().set({
        target: target,
        placement: 'top',
        delay: 0
      });
      helpers.target.appendChild(tooltip);

      expect(tooltip.open).to.be.false;

      tooltip.show();

      expect(tooltip.open).to.be.true;
      target.dispatchEvent(new Event('mouseenter'));
      target.dispatchEvent(new Event('mouseleave'));
      Coral.commons.nextFrame(function() {
        expect(tooltip.open).to.be.false;
        done();
      });
    });

    it('should clear all remaining timeouts when mouseout triggered on the target element', function(done) {
      var target = helpers.createFloatingTarget();

      var tooltip = new Coral.Tooltip().set({
        target: target,
        placement: 'top',
        delay: 0
      });
      helpers.target.appendChild(tooltip);

      expect(tooltip.open).to.be.false;

      tooltip.show();

      expect(tooltip.open).to.be.true;

      target.dispatchEvent(new Event('mouseenter'));
      target.dispatchEvent(new Event('mouseleave'));
      Coral.commons.nextFrame(function() {
        expect(tooltip.open).to.be.false;
        done();
      });
    });

  });

  describe('Implementation Details', function() {
    it('should remove and add target listeners when target changed', function() {
      var target = helpers.createStaticTarget();

      var tooltip = new Coral.Tooltip().set({
        content: {
          textContent: 'A tooltip'
        },
        placement: 'left',
        delay: 0
      });
      helpers.target.appendChild(tooltip);

      // Point at the old target
      tooltip.target = target;

      expect(tooltip.open).to.equal(false, 'tooltip closed initially');

      // Show via focus
      target.dispatchEvent(new Event('mouseenter'));

      expect(tooltip.open).to.equal(true, 'tooltip open after focusing on target');

      tooltip.hide();

      expect(tooltip.open).to.equal(false, 'tooltip closed after hide() called');

      // Set new target
      var newTarget = helpers.createStaticTarget();
      tooltip.target = newTarget;

      // Try to show via focus on the old target
      target.dispatchEvent(new Event('mouseenter'));

      expect(tooltip.open).to.equal(false, 'tooltip stays closed after clicking old target after target changed');

      // Show by focusing on the new target
      newTarget.dispatchEvent(new Event('mouseenter'));

      expect(tooltip.open).to.equal(true, 'tooltip open after clicking new target');
    });

    it('should support multiple tooltips on the same target', function() {
      var target = helpers.createFloatingTarget();

      var tooltipTop = new Coral.Tooltip().set({
        content: {
          textContent: 'A tooltip'
        },
        target: target,
        placement: 'top',
        delay: 0
      });
      helpers.target.appendChild(tooltipTop);

      var tooltipBottom = new Coral.Tooltip().set({
        content: {
          textContent: 'Another tooltip'
        },
        target: target,
        placement: 'bottom',
        delay: 0
      });
      helpers.target.appendChild(tooltipBottom);

      expect(tooltipTop.open).to.equal(false, 'tooltipTop closed initially');
      expect(tooltipBottom.open).to.equal(false, 'tooltipBottom closed initially');

      target.dispatchEvent(new Event('mouseenter'));
      expect(tooltipTop.open).to.equal(true, 'tooltipTop open after focusing on target');
      expect(tooltipBottom.open).to.equal(true, 'tooltipBottom open after focusing on target');
    });

    it('should not set the tabindex attribute on a target element which already has a tabindex attribute', function() {
      var target = helpers.createFloatingTarget();
      target.setAttribute('tabindex', 1);

      var tooltip = new Coral.Tooltip().set({
        target: target,
        variant: 'success'
      });
      helpers.target.appendChild(tooltip);

      expect(target.getAttribute('tabindex')).to.equal('1');
    });
  });
});
