describe('Coral.Search', function() {
  'use strict';

  function testInstance(instance, done) {
    expect(instance.classList.contains('coral-DecoratedTextfield')).to.be.true;
    expect(instance._elements.input).to.exist;
    expect(instance.getAttribute('icon')).to.equal('search');

    helpers.next(function() {
      expect(instance.hasAttribute('disabled')).to.be.false;
      expect(instance.hasAttribute('invalid')).to.be.false;
      expect(instance.hasAttribute('name')).to.be.false;
      expect(instance.hasAttribute('required')).to.be.false;
      expect(instance.hasAttribute('placeholder')).to.be.false;
      expect(instance.hasAttribute('value')).to.be.false;
      expect(helpers.classCount(instance)).to.equal(2);
      done();
    });
  }

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Search');
    });
  });

  describe('Instantiation', function() {
    it('should be possible using new', function(done) {
      var ni = new Coral.Search();
      testInstance(ni, done);
    });

    it('should be possible using createElement', function(done) {
      var ni = document.createElement('coral-search');
      testInstance(ni, done);
    });

    it('should be possible using markup', function(done) {
      var defaultMarkup = '<coral-search></coral-search>';

      helpers.build(defaultMarkup, function(ni) {
        testInstance(ni, done);
      });
    });
  });

  describe('API', function() {
    var el;
    beforeEach(function() {
      el = new Coral.Search();
      helpers.target.appendChild(el);
    });

    afterEach(function() {
      el = null;
    });

    describe('#icon', function() {
      it('should default to "search"', function() {
        expect(el.icon).to.equal('search');
      });

      it('should set icon', function() {
        el.icon = 'launch';
        expect(el._elements.icon.icon).to.equal('launch');
      });

      it('should hide icon when not set', function() {
        el.icon = '';
        expect(el._elements.icon.hidden).to.equal(true);
      });
    });

    describe('#variant', function() {
      it('should default to "default', function() {
        expect(el.variant).to.equal(Coral.Search.variant.DEFAULT);
        expect(el._elements.input.variant).to.equal(Coral.Search.variant.DEFAULT);
      });

      it('should set the variant', function(done) {
        el.variant = Coral.Search.variant.QUIET;
        expect(el.variant).to.be.equal(Coral.Search.variant.QUIET);

        helpers.next(function() {
          expect(el._elements.input.variant).to.equal(Coral.Search.variant.QUIET);

          done();
        });
      });

      // this test should fail in case the variant values of the textfield stop matching the ones that the search has
      it('should match the internal variant values', function() {
        expect(Coral.Search.variant.QUIET).to.equal(Coral.Textfield.variant.QUIET);
        expect(Coral.Search.variant.DEFAULT).to.equal(Coral.Textfield.variant.DEFAULT);
      });
    });

    describe('#maxlength', function() {
      it('should default to -1', function() {
        expect(el.maxLength).to.equal(-1, 'Default should be -1');
      });

      it('should set field maxlength to 10', function(done) {
        el.maxLength = 10;

        expect(el.maxLength).to.equal(10);
        helpers.next(function() {
          expect(el._elements.input.getAttribute('maxlength')).to.equal('10');
          done();
        });
      });

      it('should not allow setting -1', function(done) {
        el.maxLength = 20;
        expect(el.maxLength).to.equal(20);

        try {
          el.maxLength = -1;
        }
        catch (e) {
          done();
        }
      });

      it('should allow setting a string', function(done) {
        el.maxLength = '17';
        expect(el.maxLength).to.equal(17);

        helpers.next(function() {
          expect(el._elements.input.getAttribute('maxlength')).to.equal('17');
          done();
        });
      });
    });
  });

  describe('clearInput', function() {
    it('should clear text value', function(done) {
      var instance = new Coral.Search();
      instance._elements.input.value = 'dummy text';
      instance._clearInput();
      expect(instance._elements.input.value).to.equal('');
      done();
    });
  });


  it('should submit the one single value', function(done) {
    var el = new Coral.Search();
    // we wrap first the select
    var form = document.createElement('form');
    form.appendChild(el);
    helpers.target.appendChild(form);

    // we need to wait a frame because wrap detaches the elements
    helpers.next(function() {
      el.name = 'search';
      el._elements.input.value = 'dummy text';

      expect(helpers.serializeArray(form)).to.deep.equal([{
        name: 'search',
        value: 'dummy text'
      }]);

      done();
    });
  });
});
