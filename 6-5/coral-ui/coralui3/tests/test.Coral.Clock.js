describe('Coral.Clock', function() {
  'use strict';

  function keyPress(key, el) {
    var code = Coral.Keys.keyToCode(key);

    var event = document.createEvent('Event');
    event.initEvent('keypress', true, true);
    event.keyCode = code;
    event.charCode = key;
    event.view = window;
    event.altKey = false;
    event.ctrlKey = false;
    event.shiftKey = false;
    event.metaKey = false;

    el.dispatchEvent(event);

    return event;
  }

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Clock');
    });
    it('should define the variants in an enum', function() {
      expect(Coral.Clock.variant).to.exist;
      expect(Coral.Clock.variant.DEFAULT).to.equal('default');
      expect(Coral.Clock.variant.QUIET).to.equal('quiet');
      expect(Object.keys(Coral.Clock.variant).length).to.equal(2);
    });
  });

  describe('API', function() {
    var el;

    beforeEach(function() {
      el = new Coral.Clock();
      helpers.target.appendChild(el);
    });

    afterEach(function() {
      el = null;
    });

    describe('#name', function() {
      it('should have empty string as default', function() {
        expect(el.name).to.equal('');
        expect(el._elements.input.name).to.equal('');
        expect(el._elements.minutes.name).to.equal('');
        expect(el._elements.hours.name).to.equal('');
      });

      it('should submit nothing when name is not specified', function(done) {
        // we wrap first the select
        var form = document.createElement('form');
        form.appendChild(el);
        helpers.target.appendChild(form);

        // we need to wait a frame because wrap detaches the elements
        helpers.next(function() {

          el.value = '11:32';

          expect(el._elements.input.name).to.equal('');
          expect(el._elements.minutes.name).to.equal('');
          expect(el._elements.hours.name).to.equal('');

          var values = helpers.serializeArray(form);

          expect(values.length).to.equal(0);
          done();
        });
      });

      it('should set the name to the hidden input', function() {
        el.name = 'clock';
        expect(el.name).to.equal('clock');
        expect(el._elements.input.name).to.equal('clock');
        expect(el._elements.minutes.name).to.equal('');
        expect(el._elements.hours.name).to.equal('');
      });

      it('should submit the one single value', function(done) {
        // we wrap first the select
        var form = document.createElement('form');
        form.appendChild(el);
        helpers.target.appendChild(form);

        // we need to wait a frame because wrap detaches the elements
        helpers.next(function() {
          el.name = 'clock';
          el.value = '10:45';

          expect(el.name).to.equal('clock');
          expect(el._elements.input.name).to.equal('clock');
          expect(el._elements.minutes.name).to.equal('');
          expect(el._elements.hours.name).to.equal('');

          // the native has the correct value
          expect(el._elements.input.value).to.equal('10:45');

          expect(helpers.serializeArray(form)).to.deep.equal([{
            name: 'clock',
            value: '10:45'
          }]);

          done();
        });
      });
    });

    describe('#value', function() {
      it('should default to empty', function() {
        expect(el.value).to.equal('');
        expect(el._elements.input.value).to.equal('');
        expect(el._elements.minutes.value).to.equal('');
        expect(el._elements.hours.value).to.equal('');
      });

      it('should be settable', function(done) {
        el.value = '11:34';

        expect(el.value).to.equal('11:34');

        helpers.next(function() {
          expect(el._elements.hours.value).to.equal('11');
          expect(el._elements.minutes.value).to.equal('34');

          done();
        });
      });

      it('should accept empty string', function(done) {
        el.value = '11:34';

        expect(el.value).to.equal('11:34');

        helpers.next(function() {
          expect(el._elements.hours.value).to.equal('11');
          expect(el._elements.minutes.value).to.equal('34');

          el.value = '';

          expect(el.value).to.equal('');

          helpers.next(function() {
            expect(el._elements.minutes.value).to.equal('');
            expect(el._elements.hours.value).to.equal('');

            done();
          });
        });
      });

      it('should accept 24h time', function(done) {
        el.value = '23:34';

        expect(el.value).to.equal('23:34');

        helpers.next(function() {
          expect(el._elements.hours.value).to.equal('23');
          expect(el._elements.minutes.value).to.equal('34');
          done();
        });
      });

      it('should ignore invalid values', function() {
        el.value = '23h34';
        expect(el.value).to.equal('');

        el.value = '23:36';
        expect(el.value).to.equal('23:36');

        el.value = 'a';
        expect(el.value).to.equal('');

        el.value = '11:62';
        expect(el.value).to.equal('');

        el.value = '26:34';
        expect(el.value).to.equal('');

        el.value = '05:15';
        expect(el.value).to.equal('05:15');

        el.value = '1:12';
        expect(el.value).to.equal('');
      });

      it('should reset value if a Date object is given', function(done) {
        el.value = '05:15';

        el.value = new Date();
        expect(el.value).to.equal('');

        helpers.next(function() {
          expect(el._elements.minutes.value).to.equal('');
          expect(el._elements.hours.value).to.equal('');

          done();
        });
      });

      it('should reset value if a moment object is given', function(done) {
        el.value = '05:15';

        el.value = moment();
        expect(el.value).to.equal('');

        helpers.next(function() {
          expect(el._elements.minutes.value).to.equal('');
          expect(el._elements.hours.value).to.equal('');

          done();
        });
      });

      it('should update textContent of _elements.valueAsText element', function(done) {
        el.value = '15:15';

        helpers.next(function() {
          expect(el._elements.valueAsText.textContent).to.equal('15:15');

          done();
        });
      });
    });

    describe('#disabled', function() {
      it('should have false as default', function() {
        expect(el.disabled).to.be.false;
        expect(el._elements.minutes.disabled).to.be.false;
        expect(el._elements.hours.disabled).to.be.false;
      });

      it('should not submit when disabled is not specified', function(done) {
        // we wrap first the select
        var form = document.createElement('form');
        form.appendChild(el);
        helpers.target.appendChild(form);

        // we need to wait a frame because wrap detaches the elements
        helpers.next(function() {

          el.name = 'clock';
          el.disabled = true;
          el.value = '11:32';

          expect(el._elements.input.name).to.equal('clock');

          // disabling takes one frame
          helpers.next(function() {

            expect(el._elements.minutes.disabled).to.be.true;
            expect(el._elements.hours.disabled).to.be.true;
            expect(el._elements.input.disabled).to.be.true;

            var values = helpers.serializeArray(form);

            expect(values.length).to.equal(0);
            done();
          });
        });
      });
    });

    describe('#readonly', function() {});

    describe('#valueAsDate', function() {
      it('should default to null', function() {
        expect(el.valueAsDate).to.be.null;
      });

      it('should accept dates', function() {
        var newDate = new Date();
        el.valueAsDate = newDate;
        expect(moment(newDate).isSame(el.valueAsDate, 'hour')).to.be.true;
        expect(moment(newDate).isSame(el.valueAsDate, 'minute')).to.be.true;
      });

      it('should reject date strings', function() {
        el.valueAsDate = '2000-02-20';

        expect(el.value).to.equal('');
        expect(el.valueAsDate).to.be.null;
        expect(el._elements.minutes.value).to.equal('');
        expect(el._elements.hours.value).to.equal('');
      });

      it('should be able to clear the value', function() {
        el.valueAsDate = new Date();
        expect(el.value).not.to.equal('');

        el.valueAsDate = '';
        expect(el.value).to.equal('');
        expect(el.valueAsDate).to.be.null;
      });

      it('should not accept moment values', function() {
        el.valueAsDate = moment();

        expect(el.value).to.equal('');
        expect(el._elements.minutes.value).to.equal('');
        expect(el._elements.hours.value).to.equal('');
      });
    });

    describe('#valueFormat', function() {
      it('should default to HH:mm', function() {
        expect(el.valueFormat).to.equal('HH:mm');
      });

      it('should support different formats', function() {
        el.value = '00:05';
        el.valueFormat = 'H m';
        expect(el.value).to.equal('0 5');

        el.value = '15 15';
        el.valueFormat = 'h';
        expect(el.value).to.equal('3');

        el.valueFormat = 'm';
        expect(el.value).to.equal('15');
      });

      it('should reset to default when setting to empty string', function() {
        el.value = '08:03';
        el.valueFormat = 'h-m';
        expect(el.value).to.equal('8-3');

        el.valueFormat = '';
        expect(el.valueFormat).to.equal('HH:mm');
        expect(el.value).to.equal('08:03');
      });

      it('should support AM/PM', function() {
        el.value = '15:15';
        el.valueFormat = 'hh-mm a';
        expect(el.value).to.equal('03-15 pm');

        el.valueFormat = '';
        el.value = '03:15';
        el.valueFormat = 'hh-mm A';
        expect(el.value).to.equal('03-15 AM');

        el.valueFormat = 'a hh:mm';
        expect(el.value).to.equal('am 03:15');
      });
    });

    describe('#displayFormat', function() {
      it('should update textContent of _elements.valueAsText element', function(done) {
        el.value = '15:15';

        helpers.next(function() {
          expect(el._elements.valueAsText.textContent).to.equal('15:15');

          el.displayFormat = 'hh:mm a';

          helpers.next(function() {
            expect(el._elements.valueAsText.textContent).to.equal('03:15 pm');

            el.displayFormat = 'h:mm A';

            helpers.next(function() {
              expect(el._elements.valueAsText.textContent).to.equal('3:15 PM');

              done();
            });
          });
        });
      });
    });

    describe('#variant', function() {
      it('should be set to "default" by default', function() {
        expect(el.variant).to.equal(Coral.Clock.variant.DEFAULT, '"default" should be set');
      });

      it('should be possible to set the variant', function(done) {
        expect(el.classList.contains('coral3-Clock--quiet')).to.be.false;

        expect(el.variant).to.equal(Coral.Clock.variant.DEFAULT, '"default" should be set');

        expect(el._elements.hours.variant).to.equal(Coral.Clock.variant.DEFAULT, '"default" should be set tp the hours input variant');
        expect(el._elements.minutes.variant).to.equal(Coral.Clock.variant.DEFAULT, '"default" should be set tp the minutes input variant');
        expect(el._elements.period.variant).to.equal(Coral.Clock.variant.DEFAULT, '"default" should be set tp the period input variant');

        // change the variant to quiet
        el.variant = Coral.Clock.variant.QUIET;

        expect(el.variant).to.equal(Coral.Clock.variant.QUIET, '"quiet" should be set');
        expect(el._elements.hours.variant).to.equal(Coral.Clock.variant.QUIET, '"quiet" should be set tp the hours input variant');
        expect(el._elements.minutes.variant).to.equal(Coral.Clock.variant.QUIET, '"quiet" should be set tp the minutes input variant');
        expect(el._elements.period.variant).to.equal(Coral.Clock.variant.QUIET, '"quiet" should be set tp the period input variant');

        helpers.next(function() {
          expect(el.classList.contains('coral3-Clock--quiet')).to.be.true;
          done();
        });
      });
    });

    describe('#focus()', function() {
      it('should set focus to hours input if no other descendant has focus', function() {
        // set focus to element
        el.focus();
        // document focus should be hours input
        expect(document.activeElement).to.equal(el._elements.hours);
        // explicitly move focus to minutes input
        el._elements.minutes.focus();
        // set focus to element again
        el.focus();
        // document focus should remain on minutes input
        expect(document.activeElement).to.equal(el._elements.minutes);
      });

      it('should not recieve focus when disabled', function(done) {
        // disable element
        el.disabled = true;

        helpers.next(function() {
          // set focus to element
          el.focus();
          // document focus should remain on document.body
          expect(document.activeElement).to.not.equal(el._elements.hours);

          done();
        });
      });
    });

    describe('#labelledby', function() {
      var label;
      var labelId = 'clock-label';

      before(function() {
        label = document.createElement('label');
        label.id = labelId;
        label.appendChild(document.createTextNode('Clock Label'));
        helpers.target.insertBefore(label, el);
      });

      after(function() {
        label = null;
      });

      it('property should default to null', function() {
        expect(el.labelledBy).to.be.null;
        expect(el.getAttribute('aria-labelledby')).to.be.null;
      });

      it('should include _elements.valueAsText.id in the the aria-labelledby attribute when a value is set', function(done) {
        el.value = '13:25';
        helpers.next(function(){
          expect(el.labelledBy).to.be.null;
          expect(el.getAttribute('aria-labelledby')).to.equal(el._elements.valueAsText.id);
          done();
        });
      });

      it('should combine labelledby and _elements.valueAsText.id in the aria-labelledby attribute', function(done) {
        el.value = '13:25';
        el.labelledBy = labelId;
        helpers.next(function(){
          expect(el.labelledBy).to.equal(labelId);
          expect(el.getAttribute('aria-labelledby')).to.equal(labelId + ' ' + el._elements.valueAsText.id);
          done();
        });
      });
    });
  });

  describe('Markup', function() {
    describe('#name', function() {});
    describe('#value', function() {});

    describe('#valueAsDate', function() {
      it('should be ignored as an attribute', function(done) {
        helpers.build(window.__html__['Coral.Clock.valueasdate.html'], function(el) {
          expect(el.value).to.equal('');
          expect(el.valueAsDate).to.be.null;

          done();
        });
      });
    });

    describe('#displayFormat', function() {
      it('should default to HH:mm', function(done) {
        helpers.build(window.__html__['Coral.Clock.value.html'], function(el) {
          expect(el.displayFormat).to.equal('HH:mm');
          expect(el._elements.hours.value).to.equal('11');
          expect(el._elements.minutes.value).to.equal('32');
          expect(el._elements.valueAsText.textContent).to.equal('11:32');

          done();
        });
      });

      it('should support different formats (1)', function(done) {
        helpers.build(window.__html__['Coral.Clock.base.html'], function(el) {
          el.value = '00:05';
          el.displayFormat = 'H m';

          helpers.next(function() {
            expect(el._elements.hours.value).to.equal('0');
            expect(el._elements.minutes.value).to.equal('5');
            expect(el._elements.valueAsText.textContent).to.equal('0 5');

            done();
          });
        });
      });

      it('should support different formats (2)', function(done) {
        helpers.build(window.__html__['Coral.Clock.base.html'], function(el) {
          el.value = '15:15';
          el.displayFormat = 'h';

          helpers.next(function() {
            expect(el._elements.hours.value).to.equal('3');
            expect(el._elements.valueAsText.textContent).to.equal('3');

            done();
          });
        });
      });

      it('should support different formats (3)', function(done) {
        helpers.build(window.__html__['Coral.Clock.base.html'], function(el) {
          el.value = '15:15';
          el.displayFormat = 'm';

          helpers.next(function() {
            expect(el._elements.minutes.value).to.equal('15');
            expect(el._elements.valueAsText.textContent).to.equal('15');

            done();
          });
        });
      });

      it('should reset to default when setting to empty string', function(done) {
        helpers.build(window.__html__['Coral.Clock.displayformat.html'], function(el) {
          expect(el._elements.hours.value).to.equal('2');
          expect(el._elements.minutes.value).to.equal('2');

          el.displayFormat = '';
          helpers.next(function() {
            expect(el.displayFormat).to.equal('HH:mm');
            expect(el._elements.hours.value).to.equal('02');
            expect(el._elements.minutes.value).to.equal('02');
            expect(el._elements.valueAsText.textContent).to.equal('02:02');

            done();
          });
        });
      });

      it('should show the AM/PM selector', function() {
        helpers.build(window.__html__['Coral.Clock.periodpm.html'], function(el) {
          expect(el._elements.hours.value).to.equal('02');
          expect(el._elements.minutes.value).to.equal('02');

          expect(el._elements.period.hidden).to.be.false;
          expect(el._elements.period.value).to.equal('pm');
          expect(el._elements.valueAsText.textContent).to.equal('02:02 PM');
        });
      });

      it('should switch from PM to AM', function(done) {
        helpers.build(window.__html__['Coral.Clock.periodpm.html'], function(el) {
          // Open coral-select overlay
          el.querySelector('button').click();
          
          // Select AM
          el.querySelector('coral-selectlist-item:first-child').click();

          helpers.next(function() {
            expect(el.value).to.equal('02:02');
            expect(el._elements.hours.value).to.equal('02');
            expect(el._elements.minutes.value).to.equal('02');
            expect(el._elements.valueAsText.textContent).to.equal('02:02 AM');

            done();
          });
        });
      });

      it('should switch from AM to PM', function(done) {
        helpers.build(window.__html__['Coral.Clock.periodam.html'], function(el) {
          // Open coral-select overlay
          el.querySelector('button').click();
          
          // Select PM
          el.querySelector('coral-selectlist-item:last-child').click();

          helpers.next(function() {
            expect(el.value).to.equal('14:02');
            expect(el._elements.hours.value).to.equal('02');
            expect(el._elements.minutes.value).to.equal('02');
            expect(el._elements.valueAsText.textContent).to.equal('02:02 PM');

            done();
          });
        });
      });

      it('should allow AM/PM lowercase and uppercase format', function(done) {
        helpers.build(window.__html__['Coral.Clock.periodpm.html'], function(el) {
          var items = el._elements.period.items.getAll();
          var am = Coral.i18n.get('am');
          var pm = Coral.i18n.get('pm');

          expect(items[0].textContent).to.equal(am.toUpperCase());
          expect(items[1].textContent).to.equal(pm.toUpperCase());

          el.displayFormat = 'hh:mm a';

          // We need 2 frames  before the am/pm selector is updated because the sync call is wrapped in Coral.commons.ready
          helpers.next(function() {
            helpers.next(function() {
              expect(items[0].textContent).to.equal(am);
              expect(items[1].textContent).to.equal(pm);
              expect(el._elements.valueAsText.textContent).to.equal('02:02 pm');

              done();
            });
          });
        });
      });

      it('should support changing the value with AM/PM set', function(done) {
        helpers.build(window.__html__['Coral.Clock.periodpm.html'], function(el) {
          el._elements.hours.value = '03';
          el._elements.hours.dispatchEvent(new Event('change', {
            'bubbles': true
          }));

          helpers.next(function() {
            expect(el._elements.hours.value).to.equal('03');
            expect(el.value).to.equal('15:02');
            expect(el._elements.valueAsText.textContent).to.equal('03:02 PM');

            done();
          });
        });
      });

      it('should stay empty when value is empty and AM/PM is set', function(done) {
        helpers.build(window.__html__['Coral.Clock.periodam.html'], function(el) {
          el.value = '';

          // Open coral-select overlay
          el.querySelector('button').click();
          
          // Select PM
          el.querySelector('coral-selectlist-item:last-child').click();

          helpers.next(function() {
            expect(el.value).to.equal('');
            expect(el._elements.hours.value).to.equal('');
            expect(el._elements.minutes.value).to.equal('');
            expect(el._elements.valueAsText.textContent).to.equal('');

            done();
          });
        });
      });

      it('should not change display nor value if AM/PM is set but hours format is 24 hours clock', function(done) {
        helpers.build(window.__html__['Coral.Clock.value.html'], function(el) {
          el.displayFormat = 'HH:mm A';

          // Open coral-select overlay
          el.querySelector('button').click();
        
          // Select PM
          el.querySelector('coral-selectlist-item:last-child').click();

          helpers.next(function() {
            expect(el.value).to.equal('11:32');
            expect(el._elements.hours.value).to.equal('11');
            expect(el._elements.minutes.value).to.equal('32');
            expect(el._elements.valueAsText.textContent).to.equal('11:32 AM');

            done();
          });
        });
      });
    });

    describe('#valueFormat', function() {});
    describe('#required', function() {});
    describe('#invalid', function() {});
    describe('#labelledby', function() {
      it('should combine labelledby and _elements.valueAsText.id in the aria-labelledby attribute', function(done) {
        helpers.build(window.__html__['Coral.Clock.labelledby.html'], function(el) {
          var clock = document.getElementById('clock');
          var label = document.getElementById('clock-label');

          expect(clock.labelledBy).to.equal(label.id);
          expect(clock.getAttribute('aria-labelledby')).to.equal(label.id + ' ' + clock._elements.valueAsText.id);

          clock.removeAttribute('labelledby');
          helpers.next(function() {
            expect(clock.labelledBy).to.be.null;
            expect(clock.getAttribute('aria-labelledby')).to.equal(clock._elements.valueAsText.id);

            done();
          });
        });
      });
    });
    describe('#disabled', function() {});
    describe('#readonly', function() {});
    describe('#hidden', function() {});
  });

  describe('Events', function() {
    describe('change', function() {
      it('should NOT trigger a change event when the value property is programmatically set', function(done) {
        var changeSpy = sinon.spy();
        helpers.target.addEventListener('change', changeSpy);

        helpers.build(window.__html__['Coral.Clock.base.html'], function(el) {

          el.value = '12:00';

          expect(changeSpy.callCount).to.equal(0);
          done();
        });
      });

      it('should NOT trigger a change event when the valueAsDate property is programmatically set', function(done) {
        var changeSpy = sinon.spy();
        helpers.target.addEventListener('change', changeSpy);

        helpers.build(window.__html__['Coral.Clock.base.html'], function(el) {
          el.valueAsDate = new Date(Date.UTC(0, 0, 0, 11, 32));

          expect(changeSpy.callCount).to.equal(0);
          done();
        });
      });

      it('should NOT trigger a change event when the same time is selected', function(done) {
        var changeSpy = sinon.spy();
        helpers.target.addEventListener('change', changeSpy);

        helpers.build(window.__html__['Coral.Clock.value.html'], function(el) {
          el._elements.minutes.value = '32';
          el._elements.minutes.trigger('change');

          expect(changeSpy.callCount).to.equal(0);
          done();
        });
      });

      it('should trigger a change event when the minutes are changed', function(done) {
        helpers.build(window.__html__['Coral.Clock.value.html'], function(el) {
          var changeSpy = sinon.spy();

          el.on('change', changeSpy);

          el._elements.minutes.value = '30';
          el._elements.minutes.trigger('change');

          expect(el.value.split(':')[1]).to.equal('30');
          expect(changeSpy.callCount).to.equal(1);
          done();
        });
      });

      it('should trigger a change event when the hours are changed', function(done) {
        helpers.build(window.__html__['Coral.Clock.value.html'], function(el) {
          var changeSpy = sinon.spy();

          el.on('change', changeSpy);

          el._elements.hours.value = '10';
          el._elements.hours.trigger('change');

          expect(el.value.split(':')[0]).to.equal('10');
          expect(changeSpy.callCount).to.equal(1);
          done();
        });
      });

      it('should trigger a change event when a field is cleared', function(done) {
        helpers.build(window.__html__['Coral.Clock.value.html'], function(el) {
          var changeSpy = sinon.spy();

          el.on('change', changeSpy);

          el._elements.hours.value = '';
          el._elements.hours.trigger('change');

          expect(el.value).to.equal('');
          expect(changeSpy.callCount).to.equal(1);

          el._elements.minutes.value = '';
          el._elements.minutes.trigger('change');

          expect(el.value).to.equal('');
          expect(changeSpy.callCount).to.equal(1);
          done();
        });
      });

      it('should trigger change when a full time was added', function(done) {
        helpers.build(window.__html__['Coral.Clock.base.html'], function(el) {
          var changeSpy = sinon.spy();

          el.on('change', changeSpy);

          el._elements.hours.value = '15';
          el._elements.hours.trigger('change');

          expect(el.value).to.equal('');
          expect(changeSpy.callCount).to.equal(0);

          el._elements.minutes.value = '10';
          el._elements.minutes.trigger('change');

          expect(el.value).to.equal('15:10');
          expect(changeSpy.callCount).to.equal(1);
          done();
        });
      });

      it('should trigger change when the period is changed', function(done) {
        helpers.build(window.__html__['Coral.Clock.periodpm.html'], function(el) {
          var changeSpy = sinon.spy();

          el.on('change', changeSpy);

          // Open coral-select overlay
          el.querySelector('button').click();
          
          // Select AM
          el.querySelector('coral-selectlist-item:first-child').click();

          helpers.next(function() {
            expect(changeSpy.callCount).to.equal(1);

            done();
          });
        });
      });
    });
  });

  describe('Implementation Details', function() {

    describe('#formField', function() {
      helpers.testFormField(window.__html__['Coral.Clock.value.html'], {
        value: '05:04'
      });
    });

    it('should allow numeric values to be typed', function(done) {
      helpers.build(window.__html__['Coral.Clock.base.html'], function(el) {
        expect(el.value).to.equal('');

        // this key will be stopped and never make it to the input
        var event = keyPress('1', el._elements.hours);

        expect(el.value).to.equal('');

        expect(event.defaultPrevented).to.be.false;
        done();
      });
    });

    // TODO: skipped until CUI-6126 is resolved
    it.skip('should be possible to clone using markup', function(done) {
      helpers.build(window.__html__['Coral.Clock.full.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    // TODO: skipped until CUI-6126 is resolved
    it.skip('should be possible to clone using javascript instantiation', function(done) {
      var el = new Coral.Clock();

      el.value = '17:40';

      helpers.target.appendChild(el);

      helpers.testComponentClone(el, done);
    });
  });
});
