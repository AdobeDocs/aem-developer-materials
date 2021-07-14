/* global helpers:true */
describe('Coral.AnchorList', function() {
  'use strict';

  it('should be defined in the Coral namespace', function() {
    expect(Coral).to.have.property('List');
    expect(Coral).to.have.property('ButtonList');
    expect(Coral).to.have.property('AnchorList');
  });

  it('should support creation from markup', function(done) {
    helpers.build('<coral-list>', function(el) {
      expect(el instanceof Coral.List).to.equal(true);
      done();
    });
  });

  it('should support creation from markup', function(done) {
    helpers.build('<coral-buttonlist>', function(el) {
      expect(el instanceof Coral.ButtonList).to.equal(true);
      done();
    });
  });

  it('should support creation from markup', function(done) {
    helpers.build('<coral-anchorlist>', function(el) {
      expect(el instanceof Coral.AnchorList).to.equal(true);
      done();
    });
  });

  it('should support co-existing anchor/button/list items', function(done) {
    helpers.build(window.__html__['Coral.List.mixed.html'], function(el) {
      expect(el.items.length).to.equal(3);
      done();
    });
  });

  it('should be possible via cloneNode using markup', function() {
      helpers.cloneComponent(window.__html__['Coral.List.mixed.html']);
  });

  it('should focus on the first selectable element, thus ignoring the hidden elements', function(done) {
    helpers.build(window.__html__['Coral.List.hidden.html'], function(el) {
      el.focus();
      var expectedFocusedElement = document.getElementById('firstSelectableElement');

      expect(expectedFocusedElement).to.equal(document.activeElement);

      done();
    });
  });

  describe('when first element is focused and up key is pressed', function() {
    it('should move focus on the last selectable element, thus ignoring the hidden elements', function(done) {
      helpers.build(window.__html__['Coral.List.hidden.html'], function(el) {
        el.focus();

        helpers.keypress('up', document.activeElement);

        helpers.next(function() {
          var expectedFocusedElement = document.getElementById('lastSelectableElement');

          expect(expectedFocusedElement).to.equal(document.activeElement);

          done();
        });
      });
    });
  });



  describe('Tracking', function () {
    var trackerFnSpy;

    beforeEach(function () {
      trackerFnSpy = sinon.spy();
      Coral.tracking.addListener(trackerFnSpy);
    });

    afterEach(function () {
      Coral.tracking.removeListener(trackerFnSpy);
    });

    describe('AnchorList', function() {

      it('should call the tracker callback with the expected trackData parameters when an item is clicked', function (done) {
        helpers.build(window.__html__['Coral.AnchorList.tracking.html'], function (el) {
          var items = el.items.getAll();
          items[0].click();

          expect(trackerFnSpy.callCount).to.equal(1, 'Track callback should have been called only once.');

          var spyCall = trackerFnSpy.getCall(0);
          var trackData = spyCall.args[0];
          expect(trackData).to.have.property('targetType', 'anchorlist-item');
          expect(trackData).to.have.property('targetElement', 'element name');
          expect(trackData).to.have.property('eventType', 'click');
          expect(trackData).to.have.property('rootFeature', 'feature name');
          expect(trackData).to.have.property('rootElement', 'element name');
          expect(trackData).to.have.property('rootType', 'anchorlist');

          done();
        });
      });

      it('should call the tracker callback with the expected trackData parameters when an annotated item is clicked', function (done) {
        helpers.build(window.__html__['Coral.AnchorList.tracking.html'], function (el) {
          var items = el.items.getAll();
          items[1].click();

          expect(trackerFnSpy.callCount).to.equal(1, 'Track callback should have been called only once.');

          var spyCall = trackerFnSpy.getCall(0);
          var trackData = spyCall.args[0];
          expect(trackData).to.have.property('targetType', 'anchorlist-item');
          expect(trackData).to.have.property('targetElement', 'New stuff');
          expect(trackData).to.have.property('eventType', 'click');
          expect(trackData).to.have.property('rootFeature', 'feature name');
          expect(trackData).to.have.property('rootElement', 'element name');
          expect(trackData).to.have.property('rootType', 'anchorlist');

          done();
        });
      });

    });

    describe('ButtonList', function() {

      it('should call the tracker callback with the expected trackData parameters when an item is clicked', function (done) {
        helpers.build(window.__html__['Coral.ButtonList.tracking.html'], function (el) {
          var items = el.items.getAll();
          items[0].click();

          expect(trackerFnSpy.callCount).to.equal(1, 'Track callback should have been called only once.');

          var spyCall = trackerFnSpy.getCall(0);
          var trackData = spyCall.args[0];
          expect(trackData).to.have.property('targetType', 'buttonlist-item');
          expect(trackData).to.have.property('targetElement', 'element name');
          expect(trackData).to.have.property('eventType', 'click');
          expect(trackData).to.have.property('rootFeature', 'feature name');
          expect(trackData).to.have.property('rootElement', 'element name');
          expect(trackData).to.have.property('rootType', 'buttonlist');

          done();
        });
      });

      it('should call the tracker callback with the expected trackData parameters when an annotated item is clicked', function (done) {
        helpers.build(window.__html__['Coral.ButtonList.tracking.html'], function (el) {
          var items = el.items.getAll();
          items[1].click();

          expect(trackerFnSpy.callCount).to.equal(1, 'Track callback should have been called only once.');

          var spyCall = trackerFnSpy.getCall(0);
          var trackData = spyCall.args[0];
          expect(trackData).to.have.property('targetType', 'buttonlist-item');
          expect(trackData).to.have.property('targetElement', 'New stuff');
          expect(trackData).to.have.property('eventType', 'click');
          expect(trackData).to.have.property('rootFeature', 'feature name');
          expect(trackData).to.have.property('rootElement', 'element name');
          expect(trackData).to.have.property('rootType', 'buttonlist');

          done();
        });
      });

    });

  });

});
