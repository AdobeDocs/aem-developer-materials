describe('Coral.SelectList.Item', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral.SelectList).to.have.property('Item');
    });
  });

  describe('Instantiation', function() {
    function testDefaultInstance(el) {
      expect(el.classList.contains('coral3-SelectList-item')).to.be.true;
      expect(el.hasAttribute('value')).to.be.false;
      expect(el.getAttribute('role')).to.equal('option');
    }

    it('should be possible using new', function() {
      var el = new Coral.SelectList.Item();
      testDefaultInstance(el);
    });

    it('should be possible using createElement', function() {
      var el = document.createElement('coral-selectlist-item');
      testDefaultInstance(el);
    });

    it('should be possible using markup', function(done) {
      helpers.build('<coral-selectlist-item></coral-selectlist-item>', function(el) {
        testDefaultInstance(el);
        done();
      });
    });
  });

  describe('value property', function() {
    it('should return textContent if not explictly set', function() {
      var el = new Coral.SelectList.Item();
      el.textContent = 'Test 123';

      expect(el.value).to.equal('Test 123');
      expect(el.hasAttribute('value')).to.be.false;
    });

    it('should reflect an explicitly set string value', function() {
      var el = new Coral.SelectList.Item();
      el.value = 'Test 123';

      expect(el.value).to.equal('Test 123');
      expect(el.getAttribute('value')).to.equal('Test 123');
    });
  });

  describe('content property', function() {
    it('should reference the item', function() {
      var el = new Coral.SelectList.Item();
      expect(el.content).to.equal(el);
    });
  });
});
