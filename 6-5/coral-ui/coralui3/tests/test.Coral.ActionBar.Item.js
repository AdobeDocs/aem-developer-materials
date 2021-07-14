describe('Coral.ActionBar.Item', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral.ActionBar).to.have.property('Item');
    });
  });

  describe('API', function() {
    // the select list item used in every test
    var el;

    beforeEach(function() {
      el = new Coral.ActionBar.Item();
      helpers.target.appendChild(el);
    });

    afterEach(function() {
      el = null;
    });

    describe('#content', function() {
      it('should default to empty string', function() {
        expect(el.content.innerHTML).to.equal('');
      });

      it('should support HTML content', function() {
        var htmlContent = '<button>Highlighted</button>';
        el.content.innerHTML = htmlContent;

        expect(el.content.innerHTML).to.equal(htmlContent);
        expect(el.innerHTML).to.equal(htmlContent);
      });

      it('should not be settable', function() {

        var newContent = new Coral.ActionBar.Item();
        el.content = newContent;

        expect(el.content).not.to.equal(newContent);
      });
    });
  });

  describe('Markup', function() {

    describe('#content', function() {
      it('should have content set to innerHTML if property not provided', function(done) {
        helpers.build(window.__html__['Coral.ActionBar.Item.base.html'], function(el) {
          expect(el.content.innerHTML).to.equal('<button>Delete</button>');
          done();
        });
      });
    });
  });
});
