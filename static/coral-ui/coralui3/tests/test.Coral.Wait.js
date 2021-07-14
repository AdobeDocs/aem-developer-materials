describe('Coral.Wait', function() {
  'use strict';


  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Wait');
    });

    it('should define the variants in an enum', function() {
      expect(Coral.Wait.variant).to.exist;
      expect(Coral.Wait.variant.DEFAULT).to.equal('default');
      expect(Coral.Wait.variant.DOTS).to.equal('dots');
      expect(Object.keys(Coral.Wait.variant).length).to.equal(2);
    });

    it('should define the sizes in an enum', function() {
      expect(Coral.Wait.size).to.exist;
      expect(Coral.Wait.size.SMALL).to.equal('S');
      expect(Coral.Wait.size.MEDIUM).to.equal('M');
      expect(Coral.Wait.size.LARGE).to.equal('L');
      expect(Object.keys(Coral.Wait.size).length).to.equal(3);
    });
  });

  describe('instantiation', function() {
    it('should be possible using new', function(done) {
      var wait = new Coral.Wait();
      expect(wait.classList.contains('coral3-Wait')).to.be.true;

      helpers.next(function() {
        expect(wait.hasAttribute('centered')).to.be.false;
        expect(wait.hasAttribute('variant')).to.be.false;
        expect(wait.hasAttribute('size')).to.be.false;
        expect(wait.classList.contains('coral3-Wait--centered')).to.be.false;
        expect(wait.classList.contains('coral3-Wait--large')).to.be.false;
        expect(wait.classList.contains('coral3-Wait--medium')).to.be.false;
        done();
      });
    });
  });

  describe('markup', function() {

    describe('centered attribute', function() {

      it('should be initially false', function(done) {
        var markup = '<coral-wait></coral-wait>';
        helpers.build(markup, function(wait) {
          expect(wait.centered).to.be.false;
          expect(wait.hasAttribute('centered')).to.be.false;
          done();
        });
      });

      it('should set centered', function(done) {
        var markup = '<coral-wait centered></coral-wait>';
        helpers.build(markup, function(wait) {
          expect(wait.centered).to.be.true;
          expect(wait.getAttribute('centered')).to.equal('');
          expect(wait.classList.contains('coral3-Wait--centered')).to.be.true;
          expect(wait.classList.contains('coral3-Wait')).to.be.true;
          done();
        });
      });

      it('should transform centered to html5 attribute boolean', function(done) {
        var markup = '<coral-wait centered="false"></coral-wait>';
        helpers.build(markup, function(wait) {
          expect(wait.centered).to.be.true;
          expect(wait.getAttribute('centered')).to.equal('');
          expect(wait.classList.contains('coral3-Wait--centered')).to.be.true;
          expect(wait.classList.contains('coral3-Wait')).to.be.true;
          done();
        });
      });
    });

    describe('size attribute', function() {

      it('should default to size small', function(done) {
        var markup = '<coral-wait></coral-wait>';
        helpers.build(markup, function(wait) {
          expect(wait.size).to.equal(Coral.Wait.size.SMALL);
          expect(wait.classList.contains('coral3-Wait')).to.be.true;
          expect(wait.classList.contains('coral3-Wait--large')).to.be.false;
          expect(wait.classList.contains('coral3-Wait--medium')).to.be.false;
          done();
        });
      });

      it('should be able to set to large', function(done) {
        var markup = '<coral-wait size="L"></coral-wait>';
        helpers.build(markup, function(wait) {
          expect(wait.size).to.equal(Coral.Wait.size.LARGE);
          expect(wait.classList.contains('coral3-Wait--large')).to.be.true;
          expect(wait.classList.contains('coral3-Wait--medium')).to.be.false;
          expect(wait.classList.contains('coral3-Wait')).to.be.true;
          done();
        });
      });

      it('should be able to set to medium', function(done) {
        var markup = '<coral-wait size="M"></coral-wait>';
        helpers.build(markup, function(wait) {
          expect(wait.size).to.equal(Coral.Wait.size.MEDIUM);
          expect(wait.classList.contains('coral3-Wait--medium')).to.be.true;
          expect(wait.classList.contains('coral3-Wait--large')).to.be.false;
          expect(wait.classList.contains('coral3-Wait')).to.be.true;
          done();
        });
      });
    });

    describe('#variant', function() {

      it('should default to Coral.Wait.variant.DEFAULT', function(done) {
        var markup = '<coral-wait></coral-wait>';
        helpers.build(markup, function(el) {
          expect(el.variant).to.equal(Coral.Wait.variant.DEFAULT);
          expect(el.hasAttribute('variant')).to.be.false;
          expect(el.classList.contains('coral3-Wait')).to.be.true;
          done();
        });
      });

      it('should set the new variant', function(done) {
        var markup = '<coral-wait variant="dots"></coral-wait>';
        helpers.build(markup, function(el) {
          expect(el.variant).to.equal('dots');
          expect(el.variant).to.equal(Coral.Wait.variant.DOTS);
          expect(el.getAttribute('variant')).to.equal('dots');
          // these need an extra frame to pass in IE11
          helpers.next(function() {
            expect(el.classList.contains('coral3-Wait--dots')).to.be.true;
            expect(el.classList.contains('coral3-Wait')).to.be.true;
            done();
          });
        });
      });

      it('should not add class for empty variant', function(done) {
        var markup = '<coral-wait variant=""></coral-wait>';
        helpers.build(markup, function(el) {
          expect(el.variant).to.equal(Coral.Wait.variant.DEFAULT);
          expect(el.getAttribute('variant')).to.equal('');
          expect(el.classList.contains('coral3-Wait')).to.be.true;
          done();
        });
      });

      it('should not add class for invalid variant', function(done) {
        var markup = '<coral-wait variant="invalidvariant"></coral-wait>';
        helpers.build(markup, function(el) {
          expect(el.variant).to.equal(Coral.Wait.variant.DEFAULT);
          expect(el.getAttribute('variant')).to.equal('invalidvariant');
          expect(el.classList.contains('coral3-Wait')).to.be.true;
          done();
        });
      });

      it('should remove variant classnames when variant changes', function(done) {
        var markup = '<coral-wait variant="dots"></coral-wait>';
        helpers.build(markup, function(el) {

          expect(el.classList.contains('coral3-Wait--dots')).to.be.true;

          el.variant = Coral.Wait.variant.DEFAULT;

          // these need an extra frame to pass in IE11
          helpers.next(function() {
            expect(el.classList.contains('coral3-Wait--dots')).to.be.false;
            done();
          });
        });
      });
    });
  });

  describe('API', function() {
    describe('#centered', function() {
      it('should default to false', function(done) {
        var wait = new Coral.Wait();
        expect(wait.centered).to.be.false;
        expect(wait.className).to.equal('coral3-Wait');

        helpers.next(function() {
          expect(wait.classList.contains('coral3-Wait--centered')).to.be.false;
          expect(wait.classList.contains('coral3-Wait')).to.be.true;
          done();
        });
      });

      it('should be centered', function(done) {
        var wait = new Coral.Wait();
        wait.centered = true;

        helpers.next(function() {
          expect(wait.classList.contains('coral3-Wait--centered')).to.be.true;
          expect(wait.classList.contains('coral3-Wait')).to.be.true;
          done();
        });
      });
    });

    describe('#size', function() {
      it('should default to small', function(done) {
        var wait = new Coral.Wait();
        expect(wait.size).to.equal(Coral.Wait.size.SMALL);
        expect(wait.className).to.equal('coral3-Wait');

        helpers.next(function() {
          expect(wait.classList.contains('coral3-Wait--large')).to.be.false;
          expect(wait.classList.contains('coral3-Wait--medium')).to.be.false;
          expect(wait.classList.contains('coral3-Wait')).to.be.true;
          done();
        });
      });

      it('can be set to large', function(done) {
        var wait = new Coral.Wait();
        wait.size = Coral.Wait.size.LARGE;

        helpers.next(function() {
          expect(wait.classList.contains('coral3-Wait--large')).to.be.true;
          expect(wait.classList.contains('coral3-Wait--medium')).to.be.false;
          expect(wait.classList.contains('coral3-Wait')).to.be.true;
          done();
        });
      });

      it('can be set to large', function(done) {
        var wait = new Coral.Wait();
        wait.size = Coral.Wait.size.MEDIUM;

        helpers.next(function() {
          expect(wait.classList.contains('coral3-Wait--large')).to.be.false;
          expect(wait.classList.contains('coral3-Wait--medium')).to.be.true;
          expect(wait.classList.contains('coral3-Wait')).to.be.true;
          done();
        });
      });
    });

    describe('#hidden', function() {
      it('should default to false', function() {
        var wait = new Coral.Wait();
        expect(wait.hidden).to.be.false;
        expect(wait.hasAttribute('hidden')).to.be.false;
      });

      it('should hide component on false', function(done) {
        var waitFragment = '<coral3-Wait></coral3-Wait>';
        helpers.build(waitFragment, function(wait) {
          wait.hidden = true;
          expect(wait.hidden).to.be.true;

          helpers.next(function() {
            expect(wait.hasAttribute('hidden')).to.be.true;
            expect(getComputedStyle(wait).getPropertyValue('display')).to.equal('none');
            done();
          });
        });
      });
    });

    it('should be able to set large and centered at the same time', function(done) {
      var wait = new Coral.Wait();
      wait.size = Coral.Wait.size.LARGE;
      wait.centered = true;
      expect(wait.size).to.equal(Coral.Wait.size.LARGE);
      expect(wait.centered).to.be.true;

      helpers.next(function() {
        expect(wait.classList.contains('coral3-Wait--centered')).to.be.true;
        expect(wait.classList.contains('coral3-Wait--large')).to.be.true;
        expect(wait.classList.contains('coral3-Wait')).to.be.true;
        done();
      });
    });

    it('should be able to set medium and centered at the same time', function(done) {
      var wait = new Coral.Wait();
      wait.size = Coral.Wait.size.MEDIUM;
      wait.centered = true;
      expect(wait.size).to.equal(Coral.Wait.size.MEDIUM);
      expect(wait.centered).to.be.true;

      helpers.next(function() {
        expect(wait.classList.contains('coral3-Wait--centered')).to.be.true;
        expect(wait.classList.contains('coral3-Wait--medium')).to.be.true;
        expect(wait.classList.contains('coral3-Wait')).to.be.true;
        done();
      });
    });

  });
});
