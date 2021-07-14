describe('Coral.Shell.Menu', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral.Shell).to.have.property('Menu');
    });
  });

  describe('Instantiation', function() {
    it('should support creation from markup', function(done) {
      helpers.build('<coral-shell-menu>', function(el) {
        expect(el).to.be.an.instanceof(Coral.Shell.Menu);
        done();
      });
    });
  });

  describe('API', function() {
    describe('#placement', function() {});
    describe('#from', function() {});
    describe('#full', function() {});
    describe('#top', function() {});
    describe('#focusOnShow', function() {});
    describe('#returnFocus', function() {});
    describe('#open', function() {});
  });

  describe('Markup', function() {
    describe('#placement', function() {});
    describe('#from', function() {});
    describe('#full', function() {});
    describe('#top', function() {});
    describe('#focusOnShow', function() {});
    describe('#returnFocus', function() {});
    describe('#open', function() {});
  });

  describe('Events', function() {
    describe('#coral-overlay:beforeopen', function() {});
    describe('#coral-overlay:beforeclose', function() {});
    describe('#coral-overlay:open', function() {});
    describe('#coral-overlay:close', function() {});
  });

  describe('User Interaction', function() {});

  describe('Implementation Details', function() {
    it('should not close for clicks on elements that are subsequently removed', function (done) {
      helpers.build(window.__html__['Coral.Shell.MenuBar.base.html'], function(el) {
        // since the snippet has a div as the parent we need to search for the item
        var menu = el.querySelector('coral-shell-menu');

        var clickTarget = document.createElement('div');

        clickTarget.addEventListener('click', function() {
          if (clickTarget.parentNode) {
            clickTarget.parentNode.removeChild(clickTarget);
          }
        });

        menu.appendChild(clickTarget);
        menu.open = true;

        expect(menu.childElementCount).to.equal(1, 'The menu should contain one element.');

        helpers.next(function() {
          clickTarget.click();

          helpers.next(function() {
            expect(menu.childElementCount).to.equal(0, 'Zero child elements should be in the menu overlay');
            expect(menu.open).to.equal(true, 'The menu should stay open');
            done();
          });
        });
      });
    });
  });
});
