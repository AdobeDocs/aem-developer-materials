describe('Coral.Checkbox', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Checkbox');
      expect(Coral.Checkbox).to.have.property('Label');
    });
  });

  describe('Instantiation', function() {
    it('should be possible using new', function(done) {
      var checkbox = new Coral.Checkbox();
      helpers.next(function() {
        ['disabled', 'readonly', 'invalid', 'required', 'checked'].forEach(function(attr) {
          expect(checkbox.hasAttribute(attr)).to.be.false;
        });
        expect(checkbox.classList.contains('coral3-Checkbox')).to.be.true;
        expect(helpers.classCount(checkbox)).to.equal(1);
        done();
      });
    });

    it('should be possible to clone the element using markup', function(done) {
      helpers.build(window.__html__['Coral.Checkbox.fromElement.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible to clone the element without label element using markup', function(done) {
      helpers.build(window.__html__['Coral.Checkbox.withContent.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible to clone the element with label using markup', function(done) {
      helpers.build(window.__html__['Coral.Checkbox.withLabel.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible to clone using js', function(done) {
      var el = new Coral.Checkbox();
      el.label.innerHTML = 'Test';
      helpers.target.appendChild(el);

      helpers.next(function() {
        helpers.testComponentClone(el, done);
      });
    });

  });

  describe('Markup', function() {
    it('should be possible using markup', function() {
      helpers.build('<coral-checkbox></coral-checkbox>', function(el) {
        expect(el.classList.contains('coral3-Checkbox')).to.be.true;
      });
    });

    it('should be possible using markup with text', function() {
      helpers.build('<coral-checkbox>Checkbox</coral-checkbox>', function(el) {
        expect(el.classList.contains('coral3-Checkbox')).to.be.true;
        expect(el.label.textContent).to.equal('Checkbox');
      });
    });

    it('should be possible using markup with content zone', function() {
      helpers.build('<coral-checkbox><coral-checkbox-label>Checkbox</coral-checkbox-label></coral-checkbox>', function(el) {
        expect(el.classList.contains('coral3-Checkbox')).to.be.true;
        expect(el.label.textContent).to.equal('Checkbox');
      });
    });

  });

  describe('API', function() {
    it('should have defaults', function() {
      var el = new Coral.Checkbox();

      expect(el.checked).to.be.false;
      expect(el.disabled).to.be.false;
      expect(el.name).to.equal('');
      expect(el.value).to.equal('on');
    });

    describe('#value', function() {
      it('should reflect value changes', function(done) {
        var checkbox = new Coral.Checkbox();
        checkbox.value = 'yes';

        helpers.next(function() {
          expect(checkbox._elements.input.value).to.equal('yes');
          done();
        });
      });
    });

    describe('#checked', function() {
      it('should reflect checked value', function(done) {
        var checkbox = new Coral.Checkbox();
        checkbox.checked = true;

        helpers.next(function() {
          expect(checkbox.checked).to.be.true;
          expect(checkbox._elements.input.checked).to.be.true;
          expect(checkbox.hasAttribute('checked')).to.be.true;
          done();
        });
      });

      it('should reflect unchecked value', function(done) {
        var checkbox = new Coral.Checkbox();
        checkbox.checked = false;

        helpers.next(function() {
          expect(checkbox.checked).to.be.false;
          expect(checkbox._elements.input.checked).to.be.false;
          expect(checkbox.hasAttribute('checked')).to.be.false;
          done();
        });
      });

      it('should handle manipulating checked attribute', function(done) {
        var el = new Coral.Checkbox();
        el.setAttribute('checked', '');

        helpers.next(function() {
          expect(el._elements.input.checked).to.be.true;
          expect(el.checked).to.be.true;

          el.removeAttribute('checked');

          helpers.next(function() {
            expect(el._elements.input.checked).to.be.false;
            expect(el.checked).to.be.false;
            done();
          });
        });
      });
    });

    describe('#indeterminate', function() {
      it('should reflect indeterminate value', function(done) {
        var checkbox = new Coral.Checkbox();
        expect(checkbox._elements.input.indeterminate).to.be.false;

        checkbox.indeterminate = true;

        helpers.next(function() {
          expect(checkbox._elements.input.indeterminate).to.be.true;
          expect(checkbox._elements.input.hasAttribute('aria-checked', 'mixed')).to.be.true;
          done();
        });
      });

      it('should not affect checked state when indeterminate state is changed', function(done) {
        var checkbox = new Coral.Checkbox();
        checkbox.checked = true;
        checkbox.indeterminate = true;

        helpers.next(function() {
          expect(checkbox._elements.input.checked, 'when indeterminate is set').to.be.true;
          expect(checkbox.checked).to.be.true;

          checkbox.indeterminate = false;

          helpers.next(function() {
            expect(checkbox._elements.input.checked, 'after indeterminate is changed to false').to.be.true;
            expect(checkbox.checked).to.be.true;
            done();
          });
        });
      });

      it('should not affect indeterminate state when checked state is changed', function(done) {
        var checkbox = new Coral.Checkbox();
        checkbox.indeterminate = true;
        checkbox.checked = true;

        helpers.next(function() {
          expect(checkbox.indeterminate).to.be.true;
          expect(checkbox._elements.input.indeterminate, 'when checked is set').to.be.true;

          checkbox.checked = false;

          helpers.next(function() {
            expect(checkbox.indeterminate).to.be.true;
            expect(checkbox._elements.input.indeterminate, 'after checked is changed to false').to.be.true;
            done();
          });
        });
      });

      it('should be removed on user interaction', function(done) {
        var checkbox = new Coral.Checkbox();
        helpers.target.appendChild(checkbox);

        checkbox.indeterminate = true;

        checkbox._elements.input.click();
        helpers.next(function() {
          expect(checkbox.indeterminate).to.be.false;
          expect(checkbox._elements.input.indeterminate).to.be.false;
          expect(checkbox.checked).to.be.true;
          expect(checkbox.hasAttribute('checked')).to.be.true;
          done();
        });
      });
    });

    describe('#disabled', function() {
      it('should reflect disabled value', function(done) {
        var el = new Coral.Checkbox();
        el.disabled = true;

        helpers.next(function() {
          expect(el._elements.input.disabled).to.be.true;
          done();
        });
      });

      it('should reflect enabled value', function(done) {
        var el = new Coral.Checkbox();
        el.disabled = false;

        helpers.next(function() {
          expect(el._elements.input.disabled).to.be.false;
          done();
        });
      });

      it('should handle manipulating disabled attribute', function(done) {
        var el = new Coral.Checkbox();
        el.setAttribute('disabled', '');

        helpers.next(function() {
          expect(el._elements.input.disabled).to.be.true;
          expect(el.disabled).to.be.true;

          el.removeAttribute('disabled');

          helpers.next(function() {
            expect(el._elements.input.disabled).to.be.false;
            expect(el.disabled).to.be.false;
            done();
          });
        });
      });
    });

    describe('#label', function() {
      it('should show label when content is not empty', function(done) {
        helpers.build(window.__html__['Coral.Checkbox.withLabel.html'], function(el) {
          expect(el._elements.labelWrapper.hidden).to.equal(false);
          done();
        });
      });

      it('should hide label when content set to empty', function(done) {
        var checkbox = new Coral.Checkbox();
        helpers.target.appendChild(checkbox);
        checkbox.label.innerHTML = 'Test';
        checkbox.show();

        helpers.next(function() {
          expect(checkbox._elements.labelWrapper.hidden).to.equal(false);

          checkbox.label.innerHTML = '';
          helpers.next(function() {
            expect(checkbox._elements.labelWrapper.hidden).to.equal(true);
            done();
          });
        });
      });

      it('should hide label when content set to empty when not in DOM', function(done) {
        var checkbox = new Coral.Checkbox();
        helpers.target.appendChild(checkbox);
        checkbox.label.innerHTML = 'Test';
        checkbox.show();

        helpers.next(function() {
          expect(checkbox._elements.labelWrapper.hidden).to.equal(false);

          helpers.target.removeChild(checkbox);
          checkbox.label.innerHTML = '';

          /*
            Note: this must be async, otherwise IE 9 will not get a mutation at all

            // This does not work in IE 9
            window.checkbox = checkbox
            checkbox.parentNode.removeChild(checkbox)
            checkbox.label.innerHTML = '';
            document.body.appendChild(checkbox)
          */
          helpers.next(function() {
            helpers.target.appendChild(checkbox);

            helpers.next(function() {
              expect(checkbox._elements.labelWrapper.hidden).to.equal(true);
              done();
            });
          });
        });
      });
    });

    describe('#rendering', function() {
      it('should render chechbox with only one input, checkbox, span and label element', function(done) {
        var checkbox = new Coral.Checkbox();
        helpers.target.appendChild(checkbox);

        helpers.next(function() {
          expectCheckboxChildren(done);
        });
      });

      it('should render clone of a chechbox with only one input, checkbox, span and label element', function(done) {
        var checkbox = new Coral.Checkbox();
        helpers.target.appendChild(checkbox);

        helpers.target.appendChild(checkbox.cloneNode());

        helpers.target.removeChild(checkbox);

        helpers.next(function() {
          expectCheckboxChildren(done);
        });
      });

      function expectCheckboxChildren(done) {
        helpers.next(function() {
          expect(helpers.target.querySelectorAll('coral-checkbox-label').length).to.equal(1);
          expect(helpers.target.querySelectorAll('input[handle="input"]').length).to.equal(1);
          expect(helpers.target.querySelectorAll('span[handle="checkbox"]').length).to.equal(1);
          expect(helpers.target.querySelectorAll('label[handle="labelWrapper"]').length).to.equal(1);
          done();
        });
      }
    });

    describe('#trackingElement', function() {
      it('should default to empty string', function() {
        var el = new Coral.Checkbox();
        expect(el.trackingElement).to.equal('');
        expect(el.label.textContent).to.equal('');
      });

      it('should default to the name when available', function() {
        var el = new Coral.Checkbox();

        el.name = 'item1';
        el.label.textContent = 'My checkbox';
        expect(el.trackingElement).to.equal('item1=on');

        el.label.textContent = '  My content   with spaces';
        expect(el.trackingElement).to.equal('item1=on');

        el.name = '';
        expect(el.trackingElement).to.equal('My content with spaces');

        el.trackingElement = 'Check me';
        expect(el.trackingElement).to.equal('Check me', 'Respects the user set value when available');
      });

      it('should default to the content when name is not provided', function() {
        var el = new Coral.Checkbox();

        el.label.textContent = 'My checkbox';
        expect(el.trackingElement).to.equal('My checkbox');

        el.label.textContent = '  My content   with spaces';
        expect(el.trackingElement).to.equal('My content with spaces');

        el.trackingElement = 'Check me';
        expect(el.trackingElement).to.equal('Check me', 'Respects the user set value when available');
      });

      it('should strip the html out of the content', function() {
        var el = new Coral.Checkbox();

        el.label.innerHTML = 'My <b>c</b>heckbox';
        expect(el.trackingElement).to.equal('My checkbox');
      });
    });
  });

  describe('Events', function() {
    var checkbox;
    var changeSpy;
    var preventSpy;

    beforeEach(function() {
      changeSpy = sinon.spy();
      preventSpy = sinon.spy();

      checkbox = new Coral.Checkbox();
      helpers.target.appendChild(checkbox);

      // changeSpy and preventSpy for event bubble
      Coral.events.on('change', function(event) {

        // target must always be the switch and not the input
        expect(event.target.tagName).to.equal('CORAL-CHECKBOX');

        changeSpy();

        if (event.defaultPrevented) {
          preventSpy();
        }
      });

      expect(changeSpy.callCount).to.equal(0);
    });

    afterEach(function() {
      Coral.events.off('change');
    });

    it('should trigger change on click', function(done) {
      checkbox._elements.input.click();
      helpers.next(function() {
        expect(preventSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(1);
        expect(checkbox.checked).to.be.true;
        expect(checkbox.hasAttribute('checked')).to.be.true;
        done();
      });
    });

    it('should trigger change on indeterminate set', function(done) {
      checkbox.indeterminate = true;

      expect(checkbox.indeterminate).to.be.true;
      expect(checkbox.checked).to.be.false;

      checkbox._elements.input.click();
      helpers.next(function() {
        expect(preventSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(1);
        expect(checkbox.checked).to.be.true;
        expect(checkbox.indeterminate).to.be.false;
        expect(checkbox.hasAttribute('checked')).to.be.true;
        done();
      });
    });

    it('should not trigger change event, when checked property', function(done) {
      checkbox.checked = true;
      helpers.next(function() {
        expect(preventSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('should trigger change event, when clicked', function(done) {
      expect(checkbox.checked).to.be.false;
      checkbox._elements.input.click();
      helpers.next(function() {
        expect(checkbox.checked).to.be.true;
        expect(preventSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(1);
        done();
      });
    });

    it('should not trigger change event if value changed', function(done) {
      checkbox.value = 'value';
      helpers.next(function() {
        expect(preventSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);
        done();
      });
    });
  });

  describe('in a form', function() {

    var checkbox;

    beforeEach(function() {
      var form = document.createElement('form');
      form.id = 'testForm';
      helpers.target.appendChild(form);

      checkbox = new Coral.Checkbox();
      checkbox.name = 'formCheckbox';
      form.appendChild(checkbox);
    });

    it('should include the internal input value when checked', function(done) {
      checkbox.checked = true;
      expectFormSubmitContentToEqual([{name:'formCheckbox', value: 'on'}], done);
    });

    it('should not include the internal input value when not checked', function(done) {
      // default is not checked
      expectFormSubmitContentToEqual([], done);
    });

    it('should not include the internal input value when not named', function(done) {
      checkbox.name = '';
      expectFormSubmitContentToEqual([], done);
    });

    it('should include the new value if the value was changed', function(done) {
      checkbox.value = 'kittens';
      checkbox.checked = true;
      expectFormSubmitContentToEqual([{name:'formCheckbox', value: 'kittens'}], done);
    });

    function expectFormSubmitContentToEqual(expectedValue, done) {
      helpers.next(function() {
        var form = document.getElementById('testForm');
        expect(helpers.serializeArray(form)).to.deep.equal(expectedValue);
        done();
      });
    }
  });

  describe('Implementation Details', function() {

    describe('#formField', function() {
      helpers.testFormField(window.__html__['Coral.Checkbox.fromElement.html'], {
        value: 'on',
        default: 'on'
      });
    });

    it('should hide/show label depending on the content', function(done) {
      var el = new Coral.Checkbox();

      helpers.next(function() {
        expect(el._elements.labelWrapper.hidden).to.equal(true, 'The wrapper must be hidden since there are no contents');

        el.label.textContent = 'Label content';

        helpers.next(function() {
          expect(el._elements.labelWrapper.hidden).to.equal(false, 'The wrapper must be visible');

          done();
        });
      });
    });

    it('should allow replacing the content zone', function(done) {
      var el = new Coral.Checkbox();

      var label = new Coral.Checkbox.Label();
      label.textContent = 'Content';

      helpers.next(function() {
        expect(el._elements.labelWrapper.hidden).to.be.true;
        el.label = label;

        helpers.next(function() {
          expect(el._elements.labelWrapper.hidden).to.be.false;

          done();
        });
      });
    });

    it('should support click()', function() {
      var el = new Coral.Checkbox();
      var changeSpy = sinon.spy();
      el.on('change', changeSpy);
      el.click();
      expect(el.checked).to.be.true;
      expect(changeSpy.callCount).to.equal(1);
      el.click();
      expect(el.checked).to.be.false;
      expect(changeSpy.callCount).to.equal(2);
      el.indeterminate = true;
      el.click();
      expect(el.checked).to.be.true;
      expect(el.indeterminate).to.be.false;
      expect(changeSpy.callCount).to.equal(3);
      el.indeterminate = true;
      el.click();
      expect(el.checked).to.be.false;
      expect(el.indeterminate).to.be.false;
      expect(changeSpy.callCount).to.equal(4);
    });
  });

  describe('Tracking', function() {
    var trackerFnSpy;

    beforeEach(function () {
      trackerFnSpy = sinon.spy();
      Coral.tracking.addListener(trackerFnSpy);
    });

    afterEach(function () {
      Coral.tracking.removeListener(trackerFnSpy);
    });

    it('should have tracking enabled by default at component level', function() {
      var el = new Coral.Checkbox();
      helpers.target.appendChild(el);

      expect(el.tracking).to.equal(Coral.Component.tracking.ON, 'Tracking should be enabled by default.');
    });

    it('should call the tracker callback fn once when a click is triggered', function() {
      var el = new Coral.Checkbox();
      helpers.target.appendChild(el);
      el.click();

      expect(trackerFnSpy.callCount).to.equal(1, 'Track event should have been called only once.');
    });

    it('should call the tracker callback fn with custom trackData properties: trackingfeature and trackingelement', function(done) {
      var el = new Coral.Checkbox();
      el.setAttribute('trackingfeature', 'sites');
      el.setAttribute('trackingelement', 'rail toggle');

      helpers.target.appendChild(el);
      helpers.next(function() {
        el.click();

        expect(el.trackingElement).to.equal('rail toggle');
        expect(el.trackingFeature).to.equal('sites');

        var spyCall = trackerFnSpy.getCall(0);
        var trackData = spyCall.args[0];
        expect(trackData).to.have.property('rootFeature', 'sites');
        expect(trackData).to.have.property('rootElement', 'rail toggle');

        done();
      });
    });

    it('should not call the tracker callback fn when component has tracking=off attribute', function() {
      var el = new Coral.Checkbox();
      el.setAttribute('tracking', Coral.Component.tracking.OFF);
      helpers.target.appendChild(el);
      el.click();

      expect(trackerFnSpy.callCount).to.equal(0, 'Tracking was performed while being disabled.');
    });

    it('should call the tracker callback fn twice when checking and unchecking the checkbox', function(done) {
      helpers.build('<coral-checkbox value="kittens" trackingfeature="feature name" trackingelement="element name">\n' +
        '                CoralUI Rocks\n' +
        '            </coral-checkbox>', function(el) {

        el.click();
        el.click();

        expect(trackerFnSpy.callCount).to.equal(2, 'Track event should have been called twice.');

        var spyCall = trackerFnSpy.getCall(0);
        expect(spyCall.args.length).to.equal(4);
        var trackData = spyCall.args[0];
        expect(trackData).to.have.property('targetType', 'checkbox');
        expect(trackData).to.have.property('targetElement', 'element name');
        expect(trackData).to.have.property('eventType', 'checked');
        expect(trackData).to.have.property('rootElement', 'element name');
        expect(trackData).to.have.property('rootFeature', 'feature name');
        expect(trackData).to.have.property('rootType', 'checkbox');
        expect(spyCall.args[1]).to.be.an.instanceof(MouseEvent);
        expect(spyCall.args[2]).to.be.an.instanceof(Coral.Checkbox);

        spyCall = trackerFnSpy.getCall(1);
        expect(spyCall.args.length).to.equal(4);
        trackData = spyCall.args[0];
        expect(trackData).to.have.property('targetType', 'checkbox');
        expect(trackData).to.have.property('targetElement', 'element name');
        expect(trackData).to.have.property('eventType', 'unchecked');
        expect(trackData).to.have.property('rootElement', 'element name');
        expect(trackData).to.have.property('rootFeature', 'feature name');
        expect(trackData).to.have.property('rootType', 'checkbox');
        expect(spyCall.args[1]).to.be.an.instanceof(MouseEvent);
        expect(spyCall.args[2]).to.be.an.instanceof(Coral.Checkbox);

        done();
      });
    });

    it('should fallback to the default trackingElement when not specified', function(done) {
      helpers.build('<coral-checkbox value="kittens" trackingfeature="feature name">CoralUI Rocks</coral-checkbox>', function(el) {
        el.click();

        expect(trackerFnSpy.callCount).to.equal(1, 'Track event should have been called once.');

        var spyCall = trackerFnSpy.getCall(0);
        expect(spyCall.args.length).to.equal(4);
        var trackData = spyCall.args[0];
        expect(trackData).to.have.property('targetType', 'checkbox');
        expect(trackData).to.have.property('targetElement', 'CoralUI Rocks');
        expect(trackData).to.have.property('eventType', 'checked');
        expect(trackData).to.have.property('rootElement', 'CoralUI Rocks');
        expect(trackData).to.have.property('rootFeature', 'feature name');
        expect(trackData).to.have.property('rootType', 'checkbox');
        expect(spyCall.args[1]).to.be.an.instanceof(MouseEvent);
        expect(spyCall.args[2]).to.be.an.instanceof(Coral.Checkbox);
        done();
      });
    });

    it('should pick the "name" atttribute as targetElement and rootElement', function(done) {
      helpers.build('<coral-checkbox name="checkboxName" value="kittens" trackingfeature="feature name">CoralUI Rocks</coral-checkbox>', function(el) {
        el.click();

        expect(trackerFnSpy.callCount).to.equal(1, 'Track event should have been called once.');

        var spyCall = trackerFnSpy.getCall(0);
        expect(spyCall.args.length).to.equal(4);
        var trackData = spyCall.args[0];
        expect(trackData).to.have.property('targetType', 'checkbox');
        expect(trackData).to.have.property('targetElement', 'checkboxName=kittens');
        expect(trackData).to.have.property('eventType', 'checked');
        expect(trackData).to.have.property('rootElement', 'checkboxName=kittens');
        expect(trackData).to.have.property('rootFeature', 'feature name');
        expect(trackData).to.have.property('rootType', 'checkbox');
        expect(spyCall.args[1]).to.be.an.instanceof(MouseEvent);
        expect(spyCall.args[2]).to.be.an.instanceof(Coral.Checkbox);
        done();
      });
    });
  });
});
