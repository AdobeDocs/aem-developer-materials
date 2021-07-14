describe('CUI.PathBrowser', function() {

  var $pathBrowser, $pathBrowserInput,
    $pathBrowserWithPicker, $picker,
    pathBrowser;

  var PATHBROWSER = '' +
    '<div class="coral-DecoratedTextfield" data-placeholder="Choose path" data-root-path="/">' +
    '<input class="js-coral-pathbrowser-input coral-DecoratedTextfield-input coral-Textfield" value="" type="text" name="path">' +
    '</div>';

  var PATHBROWSER_WITHPICKER = '' +
    '<div class="coral-InputGroup" data-placeholder="Provide path" data-root-path="/">' +
    '<input class="coral-InputGroup-input js-coral-pathbrowser-input coral-Textfield" value="" type="text" name="path-withpicker">' +
    '<div class="coral-InputGroup-button">' +
    '<button class="coral-Button coral-Button--square js-coral-pathbrowser-button" type="button" title="Path Picker">' +
    '<i class="coral-Icon coral-Icon--sizeS coral-Icon--folderSearch"></i>' +
    '</button>' +
    '</div>' +
    '</div>';

  var OPTIONS = [
    "amphibians",
    "birds",
    "fish",
    "invertibrates",
    "mammals",
    "reptiles"
  ];

  beforeEach(function() {
    $pathBrowser = $(PATHBROWSER).pathBrowser({
      options: OPTIONS
    }).appendTo(document.body);
    $pathBrowserInput = $pathBrowser.find('.js-coral-pathbrowser-input');
    pathBrowser = $pathBrowser.data('pathBrowser');
  });

  afterEach(function() {
    $pathBrowser.remove();
    $pathBrowser = null;
    pathBrowser = null;
  });

  it('should be defined in CUI namespace', function() {
    expect(CUI).to.have.property('PathBrowser');
  });

  it('should be defined on jQuery object', function() {
    var div = $('<div/>');
    expect(div).to.have.property('pathBrowser');
  });

  it('should lookup function from registry by key for relevant options', function() {
    var name = 'dummy.handler'; // The handler name for lookup
    var opts = {
      'optionLoader': name,
      'optionValueReader': name,
      'optionTitleReader': name,
      'autocompleteCallback': name,
      'optionRenderer': name
    };
    var dummy = sinon.spy();
    var config = {
      name: name,
      handler: dummy
    };
    var count = 0;

    // Register handlers for relevant options
    for (var index in opts) {
      if (opts.hasOwnProperty(index)) {
        CUI.PathBrowser.register(index, config);
      }
    }

    // Set up a pathbrowser with registry functions defined via String keys
    var $pb = $(PATHBROWSER).pathBrowser($.extend({}, opts, {
      "options": OPTIONS
    })).appendTo(document.body);

    pathBrowser = $pb.data('pathBrowser');

    for (index in opts) {
      count++;
      if (opts.hasOwnProperty(index)) {
        pathBrowser[index](); // Call the spy
      }
    }

    $pb.remove();

    // Expect the spy to have been called for each option.
    expect(dummy.callCount === count).to.be.true;
  });

  it('should be possible to pass handlers as functions via options API', function() {
    var dummy = sinon.spy();
    var opts = {
      'optionLoader': dummy,
      'optionValueReader': dummy,
      'optionTitleReader': dummy,
      'autocompleteCallback': dummy,
      'optionRenderer': dummy
    };
    var count = 0;

    // Set up a pathbrowser with registry functions defined via String keys
    var $pb = $(PATHBROWSER).pathBrowser($.extend({}, opts, {
      "options": OPTIONS
    })).appendTo(document.body);

    pathBrowser = $pb.data('pathBrowser');

    for (var index in opts) {
      count++;
      if (opts.hasOwnProperty(index)) {
        pathBrowser[index](); // Call the spy
      }
    }

    $pb.remove();

    // Expect the spy to have been called for each option.
    expect(dummy.callCount === count).to.be.true;
  });

  describe('api', function() {

    beforeEach(function() {
      pathBrowser.setSelectedIndex(-1);
    });

    it('should set the input element value if options.value !== null', function() {
      var initialValue = '/an/initial/value';
      var $pathBrowserValue = $(PATHBROWSER).pathBrowser({
          options: OPTIONS,
          value: initialValue
        }).appendTo(document.body),
        $pathBrowserValueInput = $pathBrowserValue.find('.js-coral-pathbrowser-input');

      expect($pathBrowserValueInput.val()).to.equal(initialValue);
      $pathBrowserValue.remove();
    });

    it('should be possible to change the input element value', function() {
      var newValue = '/new/value';
      expect($pathBrowserInput.val()).to.equal('');
      pathBrowser.set('value', newValue);
      expect($pathBrowserInput.val()).to.equal(newValue);
    });

    describe('getSelectedIndex()', function() {

      it('should return the correct selectedIndex memory value', function() {
        var i = 1000;
        pathBrowser.selectedIndex = i; // Set directly
        expect(pathBrowser.getSelectedIndex(i)).to.equal(i);
      });
    });

    describe('setSelectedIndex(index)', function() {

      it('should correctly set the selectedIndex property', function() {
        var i = 0; // "amphibians"
        pathBrowser.setSelectedIndex(i);
        expect(pathBrowser.getSelectedIndex()).to.equal(i);
      });

      it('should prompt a change in the input value if different index >= 0 provided', function() {
        var preVal = $pathBrowserInput.val(); // empty string

        pathBrowser.setSelectedIndex(1); // "birds"
        expect(preVal).not.to.equal($pathBrowserInput.val());
      });
    });
  });

  it('should mark input element disabled if options.disabled === true', function(done) {
    var $pathBrowserDisabled = $(PATHBROWSER).pathBrowser({
        options: OPTIONS,
        disabled: true
      }).appendTo(document.body),
      $pathBrowserDisabledInput = $pathBrowserDisabled.find('.js-coral-pathbrowser-input');

    expect($pathBrowserDisabled.hasClass("is-disabled")).to.be.true;
    expect($pathBrowserDisabledInput.prop('disabled')).to.be.true;
    $pathBrowserDisabled.remove();
    done();
  });

  describe('picker UI', function() {

    beforeEach(function() {
      $pathBrowserWithPicker = $(PATHBROWSER_WITHPICKER).pathBrowser({
        options: OPTIONS,
        pickerSrc: "/base/build/tests/fixtures/column.html",
        pickerTitle: "Testing picker"
      }).appendTo(document.body);
      $picker = $(document.body).find('.coral-Pathbrowser-picker');
      $pathBrowserInput = $pathBrowserWithPicker.find('.js-coral-pathbrowser-input');
      pathBrowser = $pathBrowserWithPicker.data('pathBrowser');
    });

    afterEach(function() {
      $pathBrowserWithPicker.remove();
      $picker.remove();
      $('.coral-Modal-backdrop').remove();
    });

    it('should show the picker modal on button click', function(done) {
      $pathBrowserWithPicker.find('.js-coral-pathbrowser-button').click(); // Launch UI

      setTimeout(function() {
        expect($(document.body).hasClass('coral-Modal.is-open')).to.be.true;
        done();
      }, 300);
    });

    it('should hide the picker modal on cancel button click', function(done) {
      $pathBrowserWithPicker.find('.js-coral-pathbrowser-button').click(); // Launch UI

      setTimeout(function() {
        $picker.find('.js-coral-pathbrowser-cancel').click(); // Cancel
        expect($(document.body).hasClass('coral-Modal.is-open')).to.be.false;
        done();
      }, 300);
    });

    it('should communicate the selected value and close picker on Enter keypress', function(done) {
      var e = $.Event("keypress");
      var spy = sinon.spy();

      e.which = 13;
      $pathBrowserWithPicker.find('.js-coral-pathbrowser-button').click(); // Launch UI
      $picker.on('coral-pathbrowser-picker-confirm', spy);

      setTimeout(function() {
        expect($(document.body).hasClass('coral-Modal.is-open')).to.be.true; // Picker open before
        $pathBrowserWithPicker.trigger(e); // Simulate Enter press
        expect(spy.called).to.be.true; // Picker confirm event fired
        expect($(document.body).hasClass('coral-Modal.is-open')).to.be.false; // Picker closed after
        done();
      }, 300);
    });

    it('should disable picker confirm button for invalid CUI.ColumnView item selection', function(done) {
      $pathBrowserWithPicker.find('.js-coral-pathbrowser-button').click(); // Launch UI

      setTimeout(function() {
        var $confirm = $picker.find('.js-coral-pathbrowser-confirm');
        var $invalidItem = $picker.find('[data-invalid="true"]');

        expect($confirm.prop('disabled') === false).to.be.true; // Confirm button enabled before
        $invalidItem.click();
        expect($confirm.prop('disabled') === true).to.be.true; // Confirm button disabled after
        done();
      }, 300);
    });

    it('should set the title of the picker modal heading when options.pickerTitle is set', function(done) {
      $pathBrowserWithPicker.find('.js-coral-pathbrowser-button').click(); // Launch UI

      setTimeout(function() {
        expect($picker.find('.coral-Modal-title').text()).to.equal("Testing picker");
        done();
      }, 300);
    });

    it('should fetch picker data on initial picker button click', function(done) {
      expect(pathBrowser.picker.columnView === undefined).to.be.true; // No column view available

      $pathBrowserWithPicker.find('.js-coral-pathbrowser-button').click(); // Launch UI

      setTimeout(function() {
        expect(pathBrowser.picker.columnView === undefined).to.be.false; // Column data loaded
        done();
      }, 300);
    });

    it('should maintain the picked path for subsequent input blur, if option was selected previously via autocomplete', function() {
      var p = "/the/picked/path",
        o = "/amphibians",
        clock = sinon.useFakeTimers();

      // Select option via autocomplete
      $pathBrowserInput.val("/").trigger('input');
      clock.tick(100000); // Wait for CUI.PathBrowser dropdown to show
      pathBrowser.dropdownList.$element.find(':first-child').click();
      expect(pathBrowser.getSelectedIndex()).to.equal(0);
      expect($pathBrowserInput.val()).to.equal(o); // Intermediate value; selected option

      // Select path via Picker
      $picker.trigger($.Event('coral-pathbrowser-picker-confirm', {
        "selectedValue": p
      }));

      // Blur input
      $pathBrowserInput.trigger('blur');
      clock.tick(100000); // Wait for CUI.PathBrowser blur handling
      expect(pathBrowser.getSelectedIndex()).to.equal(-1);
      expect($pathBrowserInput.val()).to.equal(p); // Input value same as picked value
      clock.restore();
    });

  });
});
