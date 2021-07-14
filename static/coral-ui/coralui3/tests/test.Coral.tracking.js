describe('Coral.tracking', function() {
  'use strict';

  var ComponentTestForTrackComponent;
  var ComponentTestForTrackComponentItem;

  before(function() {
    ComponentTestForTrackComponent = Coral.register({
      tagName: 'coral-component-test-for-track',
      name: 'ComponentTestForTrackComponent',

      events: {
        'click': '_onClick',
        'click coral-component-test-for-track-item': '_onClickItem',
      },

      _onClick: function (event) {
        event.stopPropagation();

        this._trackEvent('click', 'componenttestfortrackcomponent', event);
      },

      _onClickItem: function(event) {
        event.stopPropagation();

        var item = event.matchedTarget;
        this._trackEvent('click', 'componenttestfortrackcomponent-item', event, item);
      }
    });

    ComponentTestForTrackComponentItem = Coral.register({
      tagName: 'coral-component-test-for-track-item',
      name: 'ComponentTestForTrackComponent.Item'
    });

  });

  describe('API', function() {

    it('should register three distinct trackers', function() {
      var trackerFnSpy1 = sinon.spy();
      var trackerFnSpy2 = sinon.spy();
      var trackerFnSpy3 = sinon.spy();

      Coral.tracking.addListener(trackerFnSpy1);
      Coral.tracking.addListener(trackerFnSpy2);
      Coral.tracking.addListener(trackerFnSpy3);

      var component = new Coral.ComponentTestForTrackComponent();
      component.click();

      expect(trackerFnSpy1.callCount).to.equal(1, 'Track callback 1 should be called three times.');
      expect(trackerFnSpy2.callCount).to.equal(1, 'Track callback 2 should be called three times.');
      expect(trackerFnSpy3.callCount).to.equal(1, 'Track callback 3 should be called three times.');

      Coral.tracking.removeListener(trackerFnSpy1);
      Coral.tracking.removeListener(trackerFnSpy2);
      Coral.tracking.removeListener(trackerFnSpy3);
    });

    it('should throw an exception when adding a tracker that doesn\'t have a callback function', function() {
      expect(function() { Coral.tracking.addListener(); }).to.throw('Tracker must be a function callback.');
    });

    it('should throw an exception when adding a second tracker with the same name previously used is added', function() {
      var trackerCallback = function() {};
      Coral.tracking.addListener(trackerCallback);
      expect(function() { Coral.tracking.addListener(trackerCallback); }).to.throw('Tracker callback cannot be added twice.');
      Coral.tracking.removeListener(trackerCallback);
    });

    it('should notify trackers when they exist', function() {
      var notifySpy = sinon.spy(Coral.tracking, 'track');
      var trackerCallback = function() {};
      Coral.tracking.addListener(trackerCallback);

      var component = new Coral.ComponentTestForTrackComponent();
      component.click();

      expect(notifySpy.callCount).to.equal(1, 'track was not called.');
      expect(notifySpy.getCall(0).returnValue).to.be.true;

      Coral.tracking.removeListener(trackerCallback);
      component.click();

      expect(notifySpy.callCount).to.equal(2, 'track was not called twice.');
      expect(notifySpy.getCall(1).returnValue).to.be.false;

      notifySpy.restore();
    });

  });

  describe('Component', function() {

    var trackerFnSpy;

    beforeEach(function() {
      trackerFnSpy = sinon.spy();
      Coral.tracking.addListener(trackerFnSpy);
    });

    afterEach(function() {
      Coral.tracking.removeListener(trackerFnSpy);
      trackerFnSpy = null;
    });

    it('should have tracking enabled by default at component level', function() {
      var component = new Coral.ComponentTestForTrackComponent();
      expect(component.tracking).to.equal(Coral.Component.tracking.ON, 'Tracking should be enabled by default.');
    });

    it('should call tracker callback fn once when the component is clicked', function() {
      var component = new Coral.ComponentTestForTrackComponent();
      component.click();

      expect(trackerFnSpy.callCount).to.equal(1, 'Track callback should be called once.');
    });

    it('should not call the tracker callback fn when component has tracking=off attribute', function() {
      var component = new Coral.ComponentTestForTrackComponent();
      component.setAttribute('tracking', Coral.Component.tracking.OFF);
      component.click();

      expect(trackerFnSpy.callCount).to.equal(0, 'Tracking was performed while being disabled.');
    });

    it('should call the tracker callback fn with parameters: trackData, event, component, childComponent', function() {
      var component = new Coral.ComponentTestForTrackComponent();
      component.click();

      var spyCall = trackerFnSpy.getCall(0);
      var trackData = spyCall.args[0];

      expect(spyCall.args.length).to.equal(4);
      expect(trackData).to.be.an.instanceof(Object);
      expect(Object.keys(trackData)).to.have.lengthOf(6);
      expect(spyCall.args[1]).to.be.an.instanceof(MouseEvent);
      expect(spyCall.args[2]).to.be.an.instanceof(Coral.ComponentTestForTrackComponent);
      expect(spyCall.args[3]).to.be.an.undefined;
    });

    it('should call the tracker callback fn with trackData object as the first parameter and it contains all expected properties', function() {
      var component = new Coral.ComponentTestForTrackComponent();
      component.click();

      var spyCall = trackerFnSpy.getCall(0);
      var trackData = spyCall.args[0];

      expect(trackData).to.have.property('targetType');
      expect(trackData).to.have.property('targetElement');
      expect(trackData).to.have.property('eventType');
      expect(trackData).to.have.property('rootElement');
      expect(trackData).to.have.property('rootFeature');
      expect(trackData).to.have.property('rootType');
    });

    it('should call the tracker callback fn with custom trackData properties: trackingfeature and trackingelement', function() {
      var component = new Coral.ComponentTestForTrackComponent();
      component.setAttribute('trackingfeature', 'feature name');
      component.setAttribute('trackingelement', 'some element');
      component.click();

      var spyCall = trackerFnSpy.getCall(0);
      expect(spyCall.args[0]).to.have.property('rootFeature', 'feature name');
      expect(spyCall.args[0]).to.have.property('rootElement', 'some element');
    });

    it('should call tracker callback fn with the expected track data when the component is clicked', function() {
      var component = new Coral.ComponentTestForTrackComponent();
      component.click();

      var spyCall = trackerFnSpy.getCall(0);
      expect(spyCall.args[0]).to.have.property('targetType', 'componenttestfortrackcomponent');
      expect(spyCall.args[0]).to.have.property('targetElement', '');
      expect(spyCall.args[0]).to.have.property('eventType', 'click');
      expect(spyCall.args[0]).to.have.property('rootFeature', '');
      expect(spyCall.args[0]).to.have.property('rootElement', '');
      expect(spyCall.args[0]).to.have.property('rootType', 'componenttestfortrackcomponent');
    });

    it('should call tracker callback fn with different track data for multiple components of the same type', function() {
      var component1 = new Coral.ComponentTestForTrackComponent();
      component1.setAttribute('trackingfeature', 'a');
      component1.setAttribute('trackingelement', 'b');

      var component2 = new Coral.ComponentTestForTrackComponent();
      component2.setAttribute('trackingfeature', 'aa');
      component2.setAttribute('trackingelement', 'bb');

      var component3 = new Coral.ComponentTestForTrackComponent();
      component3.setAttribute('trackingfeature', 'aaa');
      component3.setAttribute('trackingelement', 'bbb');

      component1.click();
      component2.click();
      component3.click();

      expect(trackerFnSpy.callCount).to.equal(3, 'Track callback should have been called three times.');

      var spyCall;
      spyCall = trackerFnSpy.getCall(0);
      expect(spyCall.args[0]).to.have.property('rootFeature', 'a');
      expect(spyCall.args[0]).to.have.property('rootElement', 'b');

      spyCall = trackerFnSpy.getCall(1);
      expect(spyCall.args[0]).to.have.property('rootFeature', 'aa');
      expect(spyCall.args[0]).to.have.property('rootElement', 'bb');

      spyCall = trackerFnSpy.getCall(2);
      expect(spyCall.args[0]).to.have.property('rootFeature', 'aaa');
      expect(spyCall.args[0]).to.have.property('rootElement', 'bbb');

    });

  });

  function makeEl(markup) {
    var el = document.createElement('div');
    el.innerHTML = markup;
    helpers.target.appendChild(el);
    return el;
  }

  describe('Component with child', function() {

    var trackerFnSpy;

    beforeEach(function() {
      trackerFnSpy = sinon.spy();
      Coral.tracking.addListener(trackerFnSpy);
    });

    afterEach(function() {
      Coral.tracking.removeListener(trackerFnSpy);
      trackerFnSpy = null;
    });

    it('should call tracker callback fn with expected trackData when the root component is clicked', function(done) {
      var el = makeEl(window.__html__['Coral.tracking.componentChild.html']);

      Coral.commons.ready(el, function() {
        var rootComponent = el.firstElementChild;
        rootComponent.click();

        expect(trackerFnSpy.callCount).to.equal(1, 'Track callback should have been called once.');
        var spyCall = trackerFnSpy.getCall(0);
        var trackData = spyCall.args[0];

        expect(trackData).to.have.property('targetType', 'componenttestfortrackcomponent');
        expect(trackData).to.have.property('targetElement', 'rail toggle');
        expect(trackData).to.have.property('eventType', 'click');
        expect(trackData).to.have.property('rootElement', 'rail toggle');
        expect(trackData).to.have.property('rootFeature', 'sites');
        expect(trackData).to.have.property('rootType', 'componenttestfortrackcomponent');

        done();
      });
    });

    it('should call tracker callback fn with expected trackData when first child component item is clicked', function(done) {
      var el = makeEl(window.__html__['Coral.tracking.componentChild.html']);

      Coral.commons.ready(el, function() {
        var rootComponent = el.firstElementChild;
        var childComponent = rootComponent.firstElementChild;
        childComponent.click();

        expect(trackerFnSpy.callCount).to.equal(1, 'Track callback should have been called once.');
        var spyCall = trackerFnSpy.getCall(0);
        var trackData = spyCall.args[0];

        expect(trackData).to.have.property('targetType', 'componenttestfortrackcomponent-item');
        expect(trackData).to.have.property('targetElement', 'first item');
        expect(trackData).to.have.property('eventType', 'click');
        expect(trackData).to.have.property('rootElement', 'rail toggle');
        expect(trackData).to.have.property('rootFeature', 'sites');
        expect(trackData).to.have.property('rootType', 'componenttestfortrackcomponent');

        done();
      });
    });

    it('should fallback targetElement to root value in targetData when the child component item being clicked doesn\'t have a targetElement value set', function(done) {
      var el = makeEl(window.__html__['Coral.tracking.componentChild.html']);

      Coral.commons.ready(el, function() {
        var rootComponent = el.firstElementChild;
        var childComponent = rootComponent.lastElementChild;
        childComponent.click();

        expect(trackerFnSpy.callCount).to.equal(1, 'Track callback should have been called once.');
        var spyCall = trackerFnSpy.getCall(0);
        var trackData = spyCall.args[0];

        expect(trackData).to.have.property('targetType', 'componenttestfortrackcomponent-item');
        expect(trackData).to.have.property('targetElement', 'rail toggle');
        expect(trackData).to.have.property('eventType', 'click');
        expect(trackData).to.have.property('rootElement', 'rail toggle');
        expect(trackData).to.have.property('rootFeature', 'sites');
        expect(trackData).to.have.property('rootType', 'componenttestfortrackcomponent');

        done();
      });
    });

  });



});
