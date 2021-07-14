/*global helpers:true */
/*jshint camelcase:false */
describe('Coral.Drawer', function () {
  'use strict';
  
  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Drawer');
    });
  });

  describe('attributes', function() {

    it('should be closed by default', function(done) {
      var drawer = helpers.build(window.__html__['Coral.Drawer.default.html'], function() {
        expect(drawer.open).to.be.false;
        expect(drawer._elements.slider.style.height).to.equal('0px');
        done();
      });
    });

    it('should update icon accordingly (open=false and direction=down)', function(done) {
      var drawer = helpers.build(window.__html__['Coral.Drawer.default.html'], function() {
        expect(drawer.open).to.be.false;
        expect(drawer.direction).to.equal('down');
        drawer._updateIcon();
        helpers.next(function() {
          expect(drawer._elements.toggle.icon).to.equal('chevronDown');
          done();
        });
      });
    });

    it('should update icon accordingly (open=true and direction=down)', function(done) {
      var drawer = helpers.build(window.__html__['Coral.Drawer.default.html'], function() {
        expect(drawer.open).to.be.false;
        expect(drawer.direction).to.equal('down');
        drawer.open = true;
        drawer._updateIcon();
        helpers.next(function() {
          expect(drawer._elements.toggle.icon).to.equal('chevronUp');
          done();
        });
      });
    });

    it('should update icon accordingly (open=false and direction=up)', function(done) {
      var drawer = helpers.build(window.__html__['Coral.Drawer.default.html'], function() {
        expect(drawer.open).to.be.false;
        expect(drawer.direction).to.equal('down');
        drawer.direction = 'up';
        drawer._updateIcon();
        helpers.next(function() {
          expect(drawer._elements.toggle.icon).to.equal('chevronUp');
          done();
        });
      });
    });

    it('should update icon accordingly (open=true and direction=up)', function(done) {
      var drawer = helpers.build(window.__html__['Coral.Drawer.default.html'], function() {
        expect(drawer.open).to.be.false;
        expect(drawer.direction).to.equal('down');
        drawer.direction = 'up';
        drawer.open = true;
        drawer._updateIcon();
        helpers.next(function() {
          expect(drawer._elements.toggle.icon).to.equal('chevronDown');
          done();
        });
      });
    });

    it('should set direction class up', function(done) {
      var drawer = helpers.build(window.__html__['Coral.Drawer.default.html'], function() {
        expect(drawer.direction).to.equal('down');
        expect(drawer.classList.contains('coral3-Drawer--down')).to.be.true;
        drawer.direction = 'up';
        helpers.next(function() {
          expect(drawer.classList.contains('coral3-Drawer--up')).to.be.true;
          done();
        });
      });
    });

    it('should set direction class down', function(done) {
      var drawer = helpers.build(window.__html__['Coral.Drawer.up.html'], function() {
        expect(drawer.direction).to.equal('up');
        expect(drawer.classList.contains('coral3-Drawer--up')).to.be.true;
        drawer.direction = 'down';
        helpers.next(function() {
          expect(drawer.classList.contains('coral3-Drawer--down')).to.be.true;
          done();
        });
      });
    });

    it('should disable the button and set the class name is-disable and aria-disabled', function(done) {
      var drawer = helpers.build(window.__html__['Coral.Drawer.default.html'], function() {
        expect(drawer.disabled).to.be.false;
        drawer.disabled = true;
        helpers.next(function() {
          expect(drawer.classList.contains('is-disabled')).to.be.true;
          expect(drawer.getAttribute('aria-disabled')).to.equal('true');
          expect(drawer._elements.toggle.disabled).to.be.true;
          drawer.disabled = false;
          helpers.next(function() {
            done();
          });
        });
      });
    });

    it('should open the drawer if open is set to true', function(done) {
      var drawer = helpers.build(window.__html__['Coral.Drawer.default.html'], function() {
        drawer.open = true;
        helpers.next(function() {
          expect(drawer.getAttribute('aria-expanded')).to.equal('true');
          // Transition needs an extra frame to complete
          helpers.next(function() {
            expect(drawer._elements.slider.style.height).to.not.equal('0px');
            done();
          });
        });
      });
    });

    it('should close the drawer if open is set to false', function(done) {
      var drawer = helpers.build(window.__html__['Coral.Drawer.open.html'], function() {
        drawer.open = false;
        helpers.next(function() {
          expect(drawer.getAttribute('aria-expanded')).to.equal('false');
          // Transition needs an extra frame to complete
          helpers.next(function() {
            expect(drawer._elements.slider.style.height).to.equal('0px');
            done();
          });
        });
      });
    });

    it('should use the innerHTML of the drawer to set its content', function(done) {
      var drawer = helpers.build(window.__html__['Coral.Drawer.default.html'], function() {
        expect(drawer._elements.content.innerHTML).to.equal('<textarea></textarea>');
        done();
      });
    });
  });

  describe('events', function() {
    it('should trigger coral-drawer:open', function(done) {
      var drawer = helpers.build(window.__html__['Coral.Drawer.default.html'], function() {
        drawer.on('coral-drawer:open', function() {
          expect(drawer._elements.slider.style.height).to.not.equal('0px');
          done();
        });
        drawer.open = true;
      });
    });

    it('should trigger coral-drawer:close', function(done) {
      var drawer = helpers.build(window.__html__['Coral.Drawer.open.html'], function() {
        drawer.on('coral-drawer:close', function() {
          expect(drawer._elements.slider.style.height).to.equal('0px');
          done();
        });
        drawer.open = false;
      });
    });

    it('should toggle coral-drawer on toggle click', function(done) {
      var drawer = helpers.build(window.__html__['Coral.Drawer.open.html'], function() {
        drawer._elements.toggle.click();
        helpers.next(function() {
          expect(drawer.open).to.be.false;
          done();
        });
      });
    });
  });
});
