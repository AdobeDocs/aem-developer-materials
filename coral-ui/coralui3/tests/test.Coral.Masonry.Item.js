describe('Coral.Masonry.Item', function() {
  'use strict';

  this.timeout(5000);

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral.Masonry).to.have.property('Item');
    });
  });

  function testInstance(item) {
    expect(item.classList.contains('coral3-Masonry-item')).to.be.true;
    expect(item.getAttribute('tabindex')).to.equal('-1');
  }

  describe('instantiation', function() {

    it('should be possible using new', function() {
      var item = new Coral.Masonry.Item();
      testInstance(item);
    });

    it('should be possible using createElement', function() {
      var item = document.createElement('coral-masonry-item');
      testInstance(item);
    });

    it('should be possible using markup', function(done) {
      helpers.build(window.__html__['Coral.Masonry.Item.text-article.html'], function(item) {
        testInstance(item);
        done();
      });
    });

  });

  describe('API', function() {

    var item;
    beforeEach(function() {
      item = new Coral.Masonry.Item();
    });

    describe('#selected', function() {

      it('should be false by default', function() {
        expect(item).to.have.property('selected', false);
        expect(item.hasAttribute('selected')).to.be.false;
        expect(item.classList.contains('is-selected')).to.be.false;
      });

      it('should toggle attribute and class', function(done) {
        item.selected = true;

        helpers.next(function() { // sync
          expect(item.hasAttribute('selected')).to.be.true;
          expect(item.classList.contains('is-selected')).to.be.true;
          done();
        });
      });

    });

  });

  describe('DOM mutation', function() {

    var m;

    beforeEach(function() {
      m = new Coral.Masonry();
      helpers.target.appendChild(m);
    });

    describe('append', function() {

      it('should add the is-managed class', function(done) {
        var item = new Coral.Masonry.Item();
        m.appendChild(item);

        helpers.masonryLayouted(m, function() {
          expect(item.classList.contains('is-managed')).to.be.true;
          done();
        });
      });

      it('should transition from is-beforeInserting to is-inserting', function(done) {
        helpers.build(window.__html__['Coral.Masonry.Item.style-insert.html'], function() {
          var item = new Coral.Masonry.Item();
          item.textContent = 'some text';
          m.appendChild(item);

          window.setTimeout(function() { // wait until the transition has started
            // TODO find out why commenting out the line below fails the test in FF
            // expect(item.classList.contains('is-beforeInserting')).to.be.false;
            expect(item.classList.contains('is-inserting')).to.be.true;

            var fontSize = parseInt(window.getComputedStyle(item).fontSize, 10);

            // Check if transition has started
            expect(fontSize).to.be.above(0);
            expect(fontSize).to.be.below(100);
            done();
          }, 100);
        });
      });

      it('should remove the is-inserting class after the insert transition has been finished', function(done) {
        var item = new Coral.Masonry.Item();
        m.appendChild(item);

        helpers.next(function() { // TODO find out why this is necessary
          helpers.transitionEnd(item, function() {
            expect(item.classList.contains('is-inserting')).to.be.false;
            done();
          });
        });
      });

    });

    describe('remove', function() {

      var item;

      beforeEach(function(done) {
        item = new Coral.Masonry.Item();
        m.appendChild(item);

        helpers.transitionEnd(item, function() {
          done();
        });
      });

      it('should temporarily add the item again with the is-removing class', function(done) {
        m.removeChild(item);

        helpers.next(function() { // polyfill detachedCallback
          expect(item.parentNode).to.equal(m);
          helpers.next(function() { // sync changes inside detachedCallback
            expect(item.classList.contains('is-removing')).to.be.true;
            done();
          });
        });
      });

      it('should remove the item after the transition', function(done) {
        m.removeChild(item);

        helpers.next(function() { // TODO find out why this is necessary
          helpers.transitionEnd(item, function() {
            helpers.next(function() { // polyfill detachedCallback
              helpers.next(function() { // sync changes in detachedCallback
                expect(item.parentNode).to.equal(null);
                ['is-managed', 'is-beforeInserting', 'is-inserting', 'is-removing'].forEach(function(className) {
                  expect(item.classList.contains(className)).to.be.false;
                });
                done();
              });
            });
          });
        });
      });

    });

  });

  describe('internal API', function() {

    var item;
    beforeEach(function() {
      item = new Coral.Masonry.Item();
    });

    describe('#_updateDragAction', function() {

      var handle;

      beforeEach(function() {
        
        handle = document.createElement('div');
        handle.setAttribute('coral-masonry-draghandle', '');
        item.appendChild(handle);
      });

      it('should allow to initialize drag action', function() {
        item._updateDragAction(true);
        expectEnabled(item, handle);
      });

      it('should allow to use the item itself as the handle', function() {
        item.setAttribute('coral-masonry-draghandle', '');
        item.innerHTML = '';
        item._updateDragAction(true);
        expectEnabled(item, item);
      });

      it('should allow to destroy drag action', function() {
        item._updateDragAction(true);
        item._updateDragAction(false);
        expectDisabled(item, handle);
      });

      it('should disable drag action if handle cannot be found', function() {
        handle.parentNode.removeChild(handle);
        item._updateDragAction(true);
        expectDisabled(item, handle);
      });

      function expectEnabled(item, handle) {
        expect(item._dragAction).to.not.be.null;
        expect(handle.classList.contains('u-coral-openHand')).to.be.true;
      }

      function expectDisabled(item, handle) {
        expect(item._dragAction).to.be.null;
        expect(handle.classList.contains('u-coral-openHand')).to.be.false;
      }

    });

  });

});
