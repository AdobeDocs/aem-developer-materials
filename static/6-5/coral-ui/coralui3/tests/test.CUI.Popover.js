describe('CUI.Popover', function() {

  var _popoverMinWidth = 150;

  var removeElements = function() {
    $('.target,.coral-Popover').remove();
  };

  after(function() {
    removeElements();
  });

  beforeEach(function(done) {
    // Necessary for positional tests to function consistently because the position of a popover changes
    // depending on where the target (e.g., a button the popover is point to) is in relation to the view pane.
    // This must run before each test because after each test mocha scrolls to the bottom of the document.
    window.scrollTo(0, 0);
    // Safari's scrollTo() works asynchronously so we have to wait until the next frame to proceed.
    setTimeout(done, 0);
  });

  describe('definition', function() {
    // 'definition' block is a temporary workaround for kmiyashiro/grunt-mocha/issues/22
    it('should be defined in CUI namespace', function() {
      expect(CUI).to.have.property('Popover');
    });

    it('should be defined on jQuery object', function() {
      var div = $('<div/>');
      expect(div).to.have.property('popover');
    });
  });

  describe('popover from plugin', function() {
    it('should have correct CSS classnames', function() {
      var el = $('<div/>').popover({
        pointAt: [100, 100]
      });
      expect(el).to.have.class('coral-Popover');
    });
  });

  describe('content option', function() {

    it('can set content through constructor', function() {

      var content = '<span>My content</span>';

      // creates a new element with the given content
      var el = new CUI.Popover({
          element: $('<div/>'),
          pointAt: [100, 100],
          content: content
      });

      // not sure if I should access $element directly
      expect(el.$element.html()).to.have.string(content);
    });

    it('can set content through jquery plugin constructor', function() {
      var content = '<span>My content</span>';

      var el = $('<div/>').popover({
        pointAt: [100, 100],
        content: content
      });

      // el.html() and content do not match exactly because the popover adds the tail as a child.
      expect(el.html()).to.have.string(content);
    });

    it('can set content through setter', function() {
      var content = '<span>My content</span>';

      var el = $('<div/>').popover({
        pointAt: [100, 100]
      });

      el.popover('set', 'content', content);

      // el.html() and content do not match exactly because the popover adds the tail as a child.
      expect(el.html()).to.have.string(content);
    });
  });

  describe('visibility', function() {
    var popover;

    beforeEach(function() {
      popover = new CUI.Popover({
        element: $('<div/>'),
        pointAt: [0, 0]
      });
    });

    after(function() {
      popover.$element.remove();
    });

    it('shows popover when show() is called', function() {
      popover.hide();
      popover.show();
      expect(popover.$element.css('display')).to.equal('block');
    });

    it('hides popover when hide() is called', function() {
      popover.show();
      popover.hide();
      expect(popover.$element.css('display')).to.equal('none');
    });

    it('shows when show() is called manually as a result of a click', function() {
      var $button = $('<button id="myButton" class="coral-Button">Toggle Popover</button>')
        .appendTo('body')
        .on('click', function() {
          popover.show();
        })
        .trigger('click');

      expect(popover.$element.css('display')).to.equal('block');
      $button.remove();
    });

    it('shows and hides when toggleVisibility() is called manually as a result of a click', function() {
      var $button = $('<button id="myButton" class="coral-Button">Toggle Popover</button>')
        .appendTo('body')
        .on('click', function() {
          popover.toggleVisibility();
        })
        .trigger('click');

      expect(popover.$element.css('display')).to.equal('block');
      $button.trigger('click');
      expect(popover.$element.css('display')).to.equal('none');
      $button.remove();
    });
  });

  describe('toogle visibility', function() {
    var popover;
    var $toggleButton;

    beforeEach(function() {
      $toggleButton = $('<button id="myToogleButton" class="coral-Button" data-target="#myTogglePopover" data-toggle="popover" data-point-from="top">Top</button>')
        .appendTo('body');

      popover = $('#myTogglePopover').data('popover');
      if (!popover) {
        popover = new CUI.Popover({
          element: $('<div id="myTogglePopover">').appendTo('body'),
          pointAt:'#myToogleButton',
          content: '<div class="u-coral-padding">Lorem ipsum hipstorum.</div>'
        });
      }
    });

    afterEach(function() {
      popover.$element.remove();
      $toggleButton.remove();
    });

    it('should show a popover when clicking a toggle button once', function() {
      expect(popover.$element.css('display')).to.equal('none');
      $toggleButton.trigger('click');
      expect(popover.$element.css('display')).to.equal('block');
    });

    it('should hide a popover when clicking a toggle button twice', function() {
      expect(popover.$element.css('display')).to.equal('none');
      $toggleButton.trigger('click');
      expect(popover.$element.css('display')).to.equal('block');
      $toggleButton.trigger('click');
      expect(popover.$element.css('display')).to.equal('none');
    });
  });

  describe('basic positioning', function() {
    var popoverWidth = _popoverMinWidth,
        popoverHeight = 150,
        popover,
        popoverEl;

    var _popoverBorderThickness;
    var _popoverOffsets;


    before(function() {
      popoverEl = $('<div/>');
      popoverEl.css({
        width: popoverWidth + 'px',
        height: popoverHeight + 'px'
      });
      $('body').append(popoverEl);

      popover = new CUI.Popover({
        element: popoverEl,
        pointAt: [_popoverMinWidth + 50, 200]
      });

      popover.show();

      // In firefox css('borderWidth') returns ''
      _popoverBorderThickness = parseInt(popover.$element.css('borderLeftWidth'), 10);
      _popoverOffsets = popover._popoverOffsets;
    });

    after(function() {
      removeElements();
    });

    var testAllSides = function(targetRect) {
      it('positions popover below', function() {
        popover.set('pointFrom', 'bottom');
        expect(popoverEl.offset()).to.eql({
          top: targetRect.top + targetRect.height + _popoverOffsets.topBottom.height,
          left: targetRect.left
        });
      });

      it('positions popover above', function() {
        popover.set('pointFrom', 'top');
        expect(popoverEl.offset()).to.eql({
          top: targetRect.top - popoverHeight - _popoverOffsets.topBottom.height - _popoverBorderThickness * 2,
          left: targetRect.left
        });
      });

      it('positions popover to the right', function() {
        popover.set('pointFrom', 'right');
        expect(popoverEl.offset()).to.eql({
          top: targetRect.top,
          left: targetRect.left + targetRect.width + _popoverOffsets.leftRight.width
        });
      });

      it('positions popover to the left', function() {
        popover.set('pointFrom', 'left');
        expect(popoverEl.offset()).to.eql({
          top: targetRect.top,
          left: targetRect.left - popoverWidth - _popoverOffsets.leftRight.width - _popoverBorderThickness * 2
        });
      });
    };


    describe('around target element', function() {
      var targetTop = 250,
          targetLeft = _popoverMinWidth + 100,
          targetWidth = 20,
          targetHeight = 20;
      var targetEl;

      before(function() {
        targetEl = $('<div class="target"/>');
        targetEl.css({
          position: 'absolute',
          top: targetTop + 'px',
          left: targetLeft + 'px',
          width: targetWidth + 'px',
          height: targetHeight + 'px'
        });

        $('body').append(targetEl);
        popover.set({
          pointAt: targetEl
        });
      });

      after(function() {
        popover.set({
          pointAt: [200, 200]
        });
        targetEl.remove();
      });

      // run test suite
      testAllSides({
        top: targetTop,
        left: targetLeft,
        width: targetWidth,
        height: targetHeight
      });
    });

    describe('around coordinate', function() {
      var targetX = _popoverMinWidth + 100,
          targetY = 250;

      beforeEach(function() {
        popover.set({
          pointAt: [targetX, targetY]
        });
      });

      // run test suite
      testAllSides({
        top: targetY,
        left: targetX,
        width: 0,
        height: 0
      });
    });
  });

  describe('edge flipping', function() {
    var popoverWidth = _popoverMinWidth,
        popoverHeight = 150,
        popover,
        popoverEl;

    before(function() {
      popoverEl = $('<div/>');
      popoverEl.css({
        width: popoverWidth + 'px',
        height: popoverHeight + 'px'
      });
      $('body').append(popoverEl);

      popover = new CUI.Popover({
        element: popoverEl,
        pointAt: [0, 0]
      });

      popover.show();
    });

    after(function() {
      removeElements();
    });

    it('flips popover horizontally when conflicting with the viewport left edge', function() {
      var positionLeft = 1;
      popover.set({
        pointAt: [positionLeft, 50],
        pointFrom: 'left'
      });

      // Because a gap is provided between popover ant pointAt, the popover would normally be positioned
      // outside the viewport if not flipped.
      expect(popoverEl.offset().left).to.be.above(positionLeft);
    });

    it('flips popover horizontally when conflicting with the viewport right edge', function() {
      var viewportWidth = $(window).width();
      popover.set({
        pointAt: [viewportWidth - 1, 50],
        pointFrom: 'right'
      });

      // Because a gap is provided for the tail to be placed between, the popover would normally be positioned
      // outside the viewport if not flipped.
      expect(popoverEl.offset().left).to.be.below(viewportWidth);
    });

    it('flips popover vertically when conflicting with the viewport top edge', function() {
      popover.set({
        pointAt: [50, 1],
        pointFrom: 'bottom'
      });

      // Because a gap is provided for the tail to be placed between, the popover would normally be positioned
      // outside the viewport if not flipped.
      expect(popoverEl.offset().top).to.be.above(1);
    });

    it('flips popover vertically when conflicting with the viewport bottom edge', function() {
      var viewportHeight = $(window).height();
      popover.set({
        pointAt: [50, viewportHeight - 1],
        pointFrom: 'bottom'
      });

      // Because a gap is provided for the tail to be placed between, the popover would normally be positioned
      // outside the viewport if not flipped.
      expect(popoverEl.offset().top).to.be.below(viewportHeight);
    });

    it('does not position the popover to be cropped by the top of the document (CUI-794)' , function() {
      // The popover will generally flip to whichever side of the target will show a larger portion of
      // the popover. However, we never want to position the popover in such a way that it's cropped by the
      // top or left of the document since the user, in this case, would not even be able to scroll to see
      // the rest of the popover.
      var viewportHeight = $(window).height();

      popoverEl.css({
        height: viewportHeight
      });

      popover.set({
        pointAt: [50, viewportHeight * 0.6],
        pointFrom: 'bottom'
      });

      expect(popoverEl.offset().top).to.be.above(viewportHeight / 2);

      popover.set({
        pointFrom: 'top'
      });

      expect(popoverEl.offset().top).to.be.above(viewportHeight / 2);
    });

    it('does not position the popover to be cropped by the left of the document (CUI-794)' , function() {
      // The popover will generally flip to whichever side of the target will show a larger portion of
      // the popover. However, we never want to position the popover in such a way that it's cropped by the
      // top or left of the document since the user, in this case, would not even be able to scroll to see
      // the rest of the popover.
      var viewportWidth = $(window).width();

      // Tweak popovers width/max-width to exceed window width
      var maxWidth = Math.max($(window).width() + 1, parseInt(popover.$element.css('max-width'), 10));
      var targetPositionLeft = parseInt(maxWidth * 0.6, 10);

      popoverEl.css({
        width: maxWidth + 'px',
        maxWidth: maxWidth + 'px'
      });

      popover.set({
        pointAt: [targetPositionLeft, 50],
        pointFrom: 'left'
      });

      expect(popoverEl.offset().left).to.be.above(viewportWidth / 2);

      popover.set({
        pointFrom: 'right'
      });

      expect(popoverEl.offset().left).to.be.above(viewportWidth / 2);
    });

  });

  describe('alignFrom', function() {
    var popoverEl,
        popover;
    before(function() {
      popoverEl = $('<div/>');
      popoverEl.css({
        width: '150px',
        height: '10px'
      });
      $('body').append(popoverEl);

      popover = new CUI.Popover({
        element: popoverEl,
        pointAt: [250, 100]
      });

      popover.show();
    });

    after(function() {
      removeElements();
    });

    it('supports left and right alignment', function() {
      popover.set('alignFrom', 'left');
      var alignLeftOffset = popoverEl.offset();
      expect(popoverEl.css('left')).to.have.string('px');
      // Doesn't work in Firefox since it reports the calculated value even though it's set to auto.
      //expect(popoverEl.css('right')).to.equal('auto');
      popover.set('alignFrom', 'right');
      var alignRightOffset = popoverEl.offset();
      // Doesn't work in Firefox since it reports the calculated value even though it's set to auto.
      //expect(popoverEl.css('left')).to.equal('auto');
      expect(popoverEl.css('right')).to.have.string('px');
      expect(alignLeftOffset).to.eql(alignRightOffset);
    });
  });

  describe('accessibility', function() {
    var popover,
        $trigger;

    before(function() {
      $trigger = $('<button id="myButton">Toggle Popover</button>')
      .appendTo('body')
      .on('click', function(event) {
        if (!$(event.target).is(document.activeElement)) {
          $(event.target).focus();
        }
        popover = $('#myPopover').data('popover');
        if (!popover) {
          popover = new CUI.Popover({
            element: $('<div id="myPopover">').appendTo('body'),
            pointAt:'#myButton',
            content: '<div class="u-coral-padding">Lorem ipsum hipstorum.</div>'
          });
        }
        popover.toggleVisibility();
      }).click();
    });

    after(function() {
      $trigger.remove();
      removeElements();
    });

    describe('WAI-ARIA: ', function() {

      it('attribute role="dialog"', function() {
        popover.show();
        expect(popover.$element.attr('role')).to.equal('dialog');
      });

      it('when visible, attribute aria-hidden="false"', function() {
        popover.show();
        expect(popover.$element.attr('aria-hidden')).to.equal('false');
      });

      it('when hidden, attribute aria-hidden="true"', function() {
        popover.hide();
        expect(popover.$element.attr('aria-hidden')).to.equal('true');
      });

      it('attribute aria-labelledby is the id of the first content region', function() {
        popover.show();
        var $contentElements = popover._getContentElement(popover.$element);
        expect(popover.$element.attr('aria-labelledby')).to.equal($contentElements.get(0).id);
      });

    });

    describe('focus management:', function() {

      describe('with no focusable children, ', function() {
        it('the $element receives focus.', function() {
          popover.hide();
          popover.set('content', '<div class="u-coral-padding">Lorem ipsum hipstorum.</div>');
          popover.show();
          expect(popover.$element.is(document.activeElement)).to.be.true;
        });
      });

      describe('toggle with no focusable children, ', function() {
        it('show dialog and receive focus.', function() {
          popover.hide();
          $trigger.click();
          expect(popover.$element.is(document.activeElement)).to.be.true;
        });
        it('toggle again and hide dialog.', function() {
          $trigger.click();
          expect(popover.$element.css('display')).to.equal('none');
        });
      });

      describe('with focusable children,', function() {
        it('the first tabbable element receives focus.', function() {
          popover.hide();
          popover.set('content', '<div class="u-coral-padding"><button id="firstButton">Focusable Button #1</button> Lorem ipsum hipstorum. <button id="secondButton">Focusable Button #2</button></div>');
          $trigger.click();
          expect($('#firstButton').is(document.activeElement)).to.be.true;
        });
      });

      describe('escape key', function() {
        var e = $.Event('keydown', {keyCode: 27, which: 27});
        it('hides popover and restores focus to trigger element', function() {
          popover.hide();
          $trigger.click();
          $(document.activeElement).trigger(e);
          expect($trigger.is(document.activeElement)).to.be.true;
        });

        it('hides the popover when neither trigger nor popover has focus', function() {
          popover.hide();
          $trigger.click();
          $(document.activeElement).blur();
          $(document.activeElement).trigger(e);
          expect($('body').is(document.activeElement)).to.be.true;
        });
      });

      describe('F6 key', function() {
        it('restores focus to document.', function() {
          var eF6 = $.Event('keydown', {keyCode: 117, which: 117}),
            eTab = $.Event('keydown', {keyCode: 9, which: 9});
          popover.hide();
          popover.set('content', '<div class="u-coral-padding"><button id="firstButton">Focusable Button #1</button> Lorem ipsum hipstorum. <button id="secondButton">Focusable Button #2</button></div>');
          $trigger.click();
          $(document.activeElement).trigger(eTab);
          $(document.activeElement).attr('tabindex','1').trigger(eF6);
          expect($trigger.is(document.activeElement)).to.be.true;
          expect(popover.$element.attr('aria-hidden')).to.equal('true');
          expect($(popover._lastFocused).attr('tabindex')).to.equal('-1');
          expect($(popover._lastFocused).data('cached-tabindex')).to.equal('1');
        });

        it('restores focus to last focused element within the popover dialog.', function() {
          var eF6 = $.Event('keydown', {keyCode: 117, which: 117}),
            lastFocused = popover._lastFocused;
          $(document.activeElement).trigger(eF6);
          expect(popover.$element.attr('aria-hidden')).to.equal('false');
          expect($(document.activeElement).is(lastFocused)).to.be.true;
          expect($(document.activeElement).attr('tabindex')).to.equal('1');
        });
      });
    });
  });

  describe('implementation details', function() {
    var popoverWidth = _popoverMinWidth,
      popoverHeight = 150,
      popover,
      popoverEl,
      innerWrapper,
      outerWrapper,
      pointAtElement;

    var _popoverBorderThickness;
    var _popoverOffsets;

    before(function() {

      popoverEl = $('<div/>');
      popoverEl.css({
        width: popoverWidth + 'px',
        height: popoverHeight + 'px'
      });

      $('body').append(popoverEl);

      outerWrapper = $('<div/>');
      outerWrapper.css({
        height: '200px',
        overflow: 'auto',
        position: 'relative'
      });
      $('body').append(outerWrapper);

      innerWrapper = $('<div/>');
      innerWrapper.css({
        height: '1000px',
        overflow: 'hidden'
      });
      outerWrapper.append(innerWrapper);

      pointAtElement = $('<div/>');
      pointAtElement.css({
        height: '10px',
        backgroundColor: 'red'
      });
      innerWrapper.append(pointAtElement);

      popover = new CUI.Popover({
        element: popoverEl,
        pointAt: pointAtElement
      });

      popover.show();

      // In firefox css('borderWidth') returns ''
      _popoverBorderThickness = parseInt(popover.$element.css('borderLeftWidth'), 10);
      _popoverOffsets = popover._popoverOffsets;
    });

    after(function() {
      outerWrapper.remove();
      removeElements();
    });

    it('does reposition the popover if there is a scroll event and popover is open (CUI-5227)' , function(done) {
      var oldYPosPointAt = pointAtElement.offset().top;
      var oldYPosPopover = popoverEl.offset().top;

      // now trigger a scroll
      outerWrapper.scrollTop(200);

      // wait some time for scroll event to trigger and popover to recalculate its position and layout
      window.setTimeout(function(){
        var newYPosPointAt = pointAtElement.offset().top;
        var newYPosPopover = popoverEl.offset().top;

        expect(oldYPosPointAt !== newYPosPointAt).to.equal(true, 'the element that the popover points to should have moved');
        expect(oldYPosPopover !== newYPosPopover).to.equal(true, 'the popover itself should have moved');
        done();
      }, 100);
    });
  });
});
