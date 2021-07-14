describe('CUI.Multifield', function() {
  /**
   * Forcing click event handling in tests, since they feature less fingers
   */
  var isTouch;
  before(function () {
    isTouch = CUI.util.isTouch;
    CUI.util.isTouch = false;
  });
  after(function () {
    CUI.util.isTouch = isTouch;
  });

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



  describe('definition', function() {
    it('should be defined in CUI namespace', function() {
      expect(CUI).to.have.property('Multifield');
    });

    it('should be defined on jQuery object', function() {
      var div = $('<div/>');
      expect(div).to.have.property('multifield');
    });
  });

  var HTML =
    "<div class=\"coral-Multifield\">" +
    "  <ol class=\"coral-Multifield-list js-coral-Multifield-list\">" +
    "    <li class=\"coral-Multifield-input js-coral-Multifield-input\">" +
    "      <input type=\"text\" class=\"coral-Textfield\" value=\"10000\">" +
    "    </li>" +
    "    <li class=\"coral-Multifield-input js-coral-Multifield-input\">" +
    "      <input type=\"text\" class=\"coral-Textfield\" value=\"20000\">" +
    "    </li>" +
    "    <li class=\"coral-Multifield-input js-coral-Multifield-input\">" +
    "      <input type=\"text\" class=\"coral-Textfield\" value=\"30000\">" +
    "    </li>" +
    "  </ol>" +
    "  <script type=\"text/html\" class=\"js-coral-Multifield-input-template\">" +
    "    <input type=\"text\" class=\"coral-Textfield\">" +
    "  </script>" +
    "</div>";

  describe("Initialization", function () {
    var expectElementIsMultifield = function (element) {
      // Test whether multifield was initialized properly
      expect(element.find(".js-coral-Multifield-add").length).to.equal(1);
      expect(element.find(".js-coral-Multifield-move")).not.to.empty;
      expect(element.find(".js-coral-Multifield-remove")).not.to.empty;
    };

    it("should be properly initialized using $().multifield()", function () {
      var element = $(HTML);

      element.multifield();

      expectElementIsMultifield(element);
    });

    it("should be properly initialized using JS Class API", function () {
      var element = $(HTML);

      var cycleButton = new CUI.Multifield({element: element});

      expectElementIsMultifield(element);
    });

    it("should be properly initialized using data-init on cui-contentloaded", function () {
      var element = $(HTML);

      element.attr("data-init", "multifield");

      $("#fixtures").append(element).trigger("cui-contentloaded");

      expectElementIsMultifield(element);
    });

    it("should add an ol node, if it's missing", function () {
      var element = $(
        "<div>" +
        "  <script type=\"text/html\" class=\"js-coral-Multifield-input-template\">" +
        "    <input type=\"text\" class=\"coral-Textfield\">" +
        "  </script>" +
        "</div>"
      ).multifield();

      // Adding a row, so that add and remove buttons are present
      element.find(".js-coral-Multifield-add").click();

      expectElementIsMultifield(element);
    });
  });

  describe("Interaction", function () {
    var buildElement = function (html) {
      return $(html || HTML).multifield().appendTo("#fixtures");
    };

    it("should add a new element based on the template when clicking (+)", function () {
      var element = buildElement();

      expect(element.find(".coral-Textfield").length).to.equal(3);

      element.find(".js-coral-Multifield-add").click();

      // adds element
      expect(element.find(".coral-Textfield").length).to.equal(4);

      // uses template - which has an empty value
      expect(element.find(".coral-Textfield").last().val()).to.be.empty;
    });

    it("should remove one element, when clicking (-)", function () {
      var element = buildElement();

      expect(element.find(".coral-Textfield").length).to.equal(3);

      element.find(".js-coral-Multifield-remove").eq(1).click();

      // removes element
      expect(element.find(".coral-Textfield").length).to.equal(2);

      expect(element.find(".coral-Textfield").eq(0).val()).to.equal("10000");
      expect(element.find(".coral-Textfield").eq(1).val()).to.equal("30000");
    });

    describe("drag'n'drop", function () {
      var trigger = function (types, options) {
        var pos, offset;

        if (options.at) {
          offset = options.at.offset();
        }
        else if (options.offset) {
          offset = options.offset;
        }
        else {
          offset = options.on.offset();
        }

        pos = {
          pageX: offset.left,
          pageY: offset.top
        };

        if (options.shiftY) {
          pos.pageY += options.shiftY;
        }
        if (options.shiftX) {
          pos.pageX += options.shiftX;
        }

        $.each(types.split(" "), function (i, type) {
          options.on.trigger($.Event(type, pos));
        });
      };

      it("should reorder elements", function () {
        var element = buildElement(),
          inputs  = element.find(".js-coral-Multifield-input");

        // Drag first element
        var handle = inputs.eq(0).find(".js-coral-Multifield-move");

        trigger("mousedown", {on: handle, at: inputs.eq(0)});

        // Expect drag'n'drop styling to be applied
        expect(inputs.eq(0).is(".is-dragging")).to.be.true;
        expect(inputs.eq(1).is(".coral-Multifield-input--dragAfter")).to.be.true;
        expect(inputs.eq(2).is(".coral-Multifield-input--dragAfter")).to.be.true;

        // Moving mouse to the upper left corner of third element, ergo between
        // second and third row.
        trigger("mousemove", {on: handle, at: inputs.eq(2)});

        // expect updated drag'n'drop styling
        expect(inputs.eq(0).is(".is-dragging")).to.be.true;
        expect(inputs.eq(1).is(".coral-Multifield-input--dragBefore")).to.be.true;
        expect(inputs.eq(2).is(".coral-Multifield-input--dragAfter")).to.be.true;

        // dropping element
        trigger("mouseup", {on: handle, at: inputs.eq(2)});

        // expect drag'n'drop styling to be removed
        expect(element.find(".is-dragging, " +
        ".coral-Multifield-input--dragBefore, " +
        ".coral-Multifield-input--dragAfter").length).to.equal(0);

        // expect elements to be reordered
        inputs = element.find(".js-coral-Multifield-input");
        expect(inputs.eq(0).find("input").val()).to.equal("20000");
        expect(inputs.eq(1).find("input").val()).to.equal("10000");
        expect(inputs.eq(2).find("input").val()).to.equal("30000");
      });

      it("should move elements to the beginning of the list", function () {
        var element = buildElement(),
          inputs  = element.find(".js-coral-Multifield-input");

        // Drag second element
        var handle = inputs.eq(1).find(".js-coral-Multifield-move");

        trigger("mousedown", {on: handle, at: inputs.eq(1)});

        // Moving mouse to the upper left corner of first element, ergo before
        // the first row and drop element
        trigger("mousemove mouseup", {on: handle, at: inputs.eq(0)});

        // expect elements to be reordered
        inputs = element.find(".js-coral-Multifield-input");
        expect(inputs.eq(0).find("input").val()).to.equal("20000");
        expect(inputs.eq(1).find("input").val()).to.equal("10000");
        expect(inputs.eq(2).find("input").val()).to.equal("30000");
      });

      it("should move elements to the end of the list", function () {
        var element = buildElement(),
          inputs  = element.find(".js-coral-Multifield-input");

        // Drag second element
        var handle = inputs.eq(1).find(".js-coral-Multifield-move");
        trigger("mousedown", {on: handle, at: inputs.eq(1)});

        // Moving mouse to the lower left corner of third element, ergo below
        // the last row and dropping element
        trigger("mousemove mouseup", {on: handle,
          at: inputs.eq(2),
          shiftY: inputs.eq(2).outerHeight() - 1});

        // expect elements to be reordered
        inputs = element.find(".js-coral-Multifield-input");
        expect(inputs.eq(0).find("input").val()).to.equal("10000");
        expect(inputs.eq(1).find("input").val()).to.equal("30000");
        expect(inputs.eq(2).find("input").val()).to.equal("20000");
      });
    });
  });
});
