describe('Coral.Shell', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Shell');
    });
  });

  describe('API', function() {
    var el;

    beforeEach(function(done) {
      el = new Coral.Shell();
      helpers.target.appendChild(el);
      Coral.commons.ready(el, function() {
        done();
      });
    });

    afterEach(function() {
      el = null;
    });

    describe('#content', function() {
      it('should be defined', function() {
        expect(el.content).to.exist;
      });

      it('should be a content zone', function() {
        el.content.appendChild(document.createElement('button'));
        expect(el.content.children.length).not.to.equal(0);
      });
    });
  });

  describe('Markup', function() {
    describe('#content', function() {
      it('should created if not provided', function(done) {
        helpers.build(window.__html__['Coral.Shell.base.html'], function(el) {
          expect(el.children.length).to.equal(1);
          expect(el.content).to.exist;
          expect(el.content).to.equal(el.children[0]);
          expect(el.content.textContent.trim()).to.equal('This is the content.');

          done();
        });
      });

      it('should keep an existing content if provided', function(done) {
        helpers.build(window.__html__['Coral.Shell.content.html'], function(el) {
          expect(el.children.length).to.equal(2);
          expect(el.content).to.equal(el.children[1]);

          done();
        });
      });
    });
  });
});
