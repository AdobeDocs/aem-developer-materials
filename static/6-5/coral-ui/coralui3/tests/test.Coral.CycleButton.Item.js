describe('Coral.CycleButton.Item', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('CycleButton');
      expect(Coral.CycleButton).to.have.property('Item');
    });
    it('should define the displayMode in an enum', function() {
      expect(Coral.CycleButton.Item.displayMode).to.exist;
      expect(Coral.CycleButton.Item.displayMode).to.contain.all.keys(Coral.CycleButton.displayMode);
      expect(Coral.CycleButton.Item.displayMode.INHERIT).to.equal('inherit');
      expect(Object.keys(Coral.CycleButton.Item.displayMode).length).to.equal(4);
    });
  });

  describe('API', function() {
    var el;

    beforeEach(function () {
      el = new Coral.CycleButton.Item();
      helpers.target.appendChild(el);
    });
    afterEach(function () {
      el = null;
    });

    describe('#displayMode', function () {
      it('should exist', function () {
        // check for existence of the key, since using 'to.exist' fails when an existing property equals undefined
        expect('displayMode' in el).to.be.true;
      });

      it('should have default set to inherit', function () {
        expect(el.displayMode).to.equal(Coral.CycleButton.Item.displayMode.INHERIT);
      });

      it('should not accept invalid value', function () {
        el.displayMode = Coral.CycleButton.displayMode.ICON;
        el.displayMode = 'invalid';
        expect(el.displayMode).to.equal(Coral.CycleButton.Item.displayMode.ICON);
      });
    });

    describe('#icon', function () {
      it('should exist', function () {
        expect('icon' in el).to.be.true;
      });
    });

    describe('#trackingElement', function() {

      it('should exist', function() {
        expect('trackingElement' in el).to.be.true;
      });

      it('should default to empty string', function() {
        expect(el.trackingElement).to.equal('');
        expect(el.content.textContent).to.equal('');
        expect(el.icon).to.equal('');
      });

      it('should default to the contents when available', function() {
        el.content.textContent = 'Contents';
        expect(el.trackingElement).to.equal('Contents');

        el.content.textContent = ' Contents with  spaces ';
        expect(el.trackingElement).to.equal('Contents with spaces');

        el.trackingElement = 'user';

        expect(el.trackingElement).to.equal('user', 'Respects the user set value when available');
      });

      it('should strip the html out of the content', function() {
        el.content.innerHTML = 'My <b>C</b>ontent';
        expect(el.trackingElement).to.equal('My Content');
      });

      it('should default to the icon when there is no content', function() {
        el.icon = 'add';
        expect(el.trackingElement).to.equal('add');
      });
    });
  });

  describe('Instantiation', function() {
    it('should be possible to clone the element using markup', function(done) {
      helpers.build('<coral-cyclebutton-item id="btn1" icon="viewCard">Card</coral-cyclebutton-item>', function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible via cloneNode using js', function(done) {
      var el = new Coral.CycleButton.Item();
      helpers.next(function() {
        helpers.testComponentClone(el, done);
      });
    });
  });
});
