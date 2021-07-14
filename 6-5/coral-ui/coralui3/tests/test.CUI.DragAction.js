describe('CUI.DragAction', function() {
  /**
   * HTML Fixture setup
   *
   * Creating container div which is as big as the current page. Removing it
   * after each test.
   */
  beforeEach(function () {
    $("<div>", {id: "fixtures"}).
      css({position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}).
      appendTo(document.body);
  });
  afterEach(function () {
    $("#fixtures").remove();
  });

  var mockDom = function () {
    var dom = {
      item   : $("<div>").css({width: 100, height: 100}),
      source : $("<div>").css({width: 200, height: 200, position: 'absolute', top: 0, left: 0}),
      target : $("<div>").css({width: 200, height: 200, position: 'absolute', top: 0, left: 200}),
    };

    dom.item.appendTo(dom.source);

    $("#fixtures").append(dom.source, dom.target);

    dom.targets = [dom.target];

    return dom;
  };

  var mockEvent = function (type, attributes) {
    // Triggering events with DragAction namespace, so that I do not need to
    // mock all the data that's needed by other event handlers, that are active
    // within the page, especially the ones of toe.js.
    return $.Event(type + ".coral-DragAction", attributes || {pageX: 1, pageY: 1});
  };


  it('should be defined in CUI namespace', function() {
    expect(CUI).to.have.property('DragAction');
  });

  describe('Events', function () {
    describe("attributes", function () {
      it("should contain the dragged item at `item`", function (done) {
        var dom = mockDom();

        dom.source.on("dragstart", function (e) {
          expect(e.item.jquery).to.be.ok;
          expect(e.item.length).to.equal(1);
          expect(e.item.get(0)).to.equal(dom.item.get(0));

          done();
        });

        new CUI.DragAction(mockEvent("touchstart"), dom.source, dom.item, dom.targets);
      });

      it("should contain the source container at `sourceElement`", function (done) {
        var dom = mockDom();

        dom.source.on("dragstart", function (e) {
          expect(e.sourceElement.jquery).to.be.ok;
          expect(e.sourceElement.length).to.equal(1);
          expect(e.sourceElement.get(0)).to.equal(dom.source.get(0));

          done();
        });

        new CUI.DragAction(mockEvent("touchstart"), dom.source, dom.item, dom.targets);
      });

      it("should contain the pointer coordinates at `pageX` and `pageY`", function (done) {
        var dom = mockDom();

        dom.source.on("dragstart", function (e) {
          expect(e.pageX).to.equal(1337);
          expect(e.pageY).to.equal(4711);

          done();
        });

        new CUI.DragAction(
          mockEvent("touchstart", {pageX: 1337, pageY: 4711}),
          dom.source, dom.item, dom.targets);
      });
    });

    describe("on source container", function () {
      it("should trigger dragstart", function (done) {
        var dom = mockDom();

        dom.source.on("dragstart", function (e) {
          expect(e.type).to.equal("dragstart");
          done();
        });

        new CUI.DragAction(mockEvent("touchstart"), dom.source, dom.item, dom.targets);
      });

      it("should trigger dragend", function (done) {
        var dom = mockDom();

        dom.source.on("dragend", function (e) {
          expect(e.type).to.equal("dragend");
          done();
        });

        new CUI.DragAction(mockEvent("touchstart"), dom.source, dom.item, dom.targets);

        $(document).trigger(mockEvent("touchend"));
      });
    });

    describe("on potential target container", function () {
      it("should trigger dragenter when moved into its boundaries", function (done) {
        var dom = mockDom();

        dom.target.on("dragenter", function (e) {
          expect(e.type).to.equal("dragenter");
          done();
        });

        new CUI.DragAction(mockEvent("touchstart"), dom.source, dom.item, dom.targets);

        $(document).trigger(mockEvent("touchmove", {pageX: 201, pageY: 1}));
      });

      it("should trigger dragover when moved within its boundaries", function (done) {
        var dom = mockDom();

        dom.target.on("dragover", function (e) {
          expect(e.type).to.equal("dragover");
          done();
        });

        new CUI.DragAction(mockEvent("touchstart"), dom.source, dom.item, dom.targets);

        $(document).trigger(mockEvent("touchmove", {pageX: 201, pageY: 1}));
        $(document).trigger(mockEvent("touchmove", {pageX: 202, pageY: 1}));
      });

      it("should trigger drop when dropped within its boundaries", function (done) {
        var dom = mockDom();

        dom.target.on("drop", function (e) {
          expect(e.type).to.equal("drop");
          done();
        });

        new CUI.DragAction(mockEvent("touchstart"), dom.source, dom.item, dom.targets);

        $(document).trigger(mockEvent("touchend", {pageX: 201, pageY: 1}));
      });

      it("should trigger dragleave when moved out of its boundaries", function (done) {
        var dom = mockDom();

        dom.target.on("dragleave", function (e) {
          expect(e.type).to.equal("dragleave");
          done();
        });

        new CUI.DragAction(mockEvent("touchstart"), dom.source, dom.item, dom.targets);

        $(document).trigger(mockEvent("touchmove", {pageX: 201, pageY: 1}));
        $(document).trigger(mockEvent("touchmove", {pageX: 199, pageY: 1}));
      });
    });

    describe("ordering", function () {
      it("should trigger in the following order: " +
         "dragstart, dragenter, dragover, drop, dragleave, dragend", function (done) {
        var dom = mockDom();

        var order = 0;

        $.each([
          {name : "dragstart", element: dom.source},
          {name : "dragenter", element: dom.target},
          {name : "dragover",  element: dom.target},
          {name : "drop",      element: dom.target},
          {name : "dragleave", element: dom.target},
          {name : "dragend",   element: dom.source}
        ], function (position, opt) {
          opt.element.on(opt.name, function (e) {
            expect(e.type).to.equal(opt.name);
            expect(order++).to.equal(position);
          });
        });

        dom.source.on("dragend", function (e) {
          expect(order).to.equal(6);
          done();
        });

        // triggers dragstart
        new CUI.DragAction(mockEvent("touchstart"), dom.source, dom.item, dom.targets);

        // triggers dragenter
        $(document).trigger(mockEvent("touchmove", {pageX: 200, pageY: 1}));

        // triggers dragover
        $(document).trigger(mockEvent("touchmove", {pageX: 210, pageY: 1}));

        // triggers drop, dragleave, and dragend
        $(document).trigger(mockEvent("touchend",  {pageX: 210, pageY: 1}));
      });
    });
  });


  describe("DOM interaction", function () {
    it("should add `is-dragging` class to dragged item", function (done) {
      var dom = mockDom();

      dom.source.on("dragstart", function () {
        expect(dom.item.is(".is-dragging")).to.be.true;
        done();
      });

      new CUI.DragAction(mockEvent("touchstart"), dom.source, dom.item, dom.targets); });

    it("should remove `is-dragging` class from dragged item after drag is finished", function (done) {
      var dom = mockDom();

      dom.source.on("dragend", function () {
        expect(dom.item.is(".is-dragging")).to.be.false;
        done();
      });

      new CUI.DragAction(mockEvent("touchstart"), dom.source, dom.item, dom.targets);

      $(document).trigger(mockEvent("touchend"));
    });
  });
});
