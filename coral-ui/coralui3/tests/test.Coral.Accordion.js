describe('Coral.Accordion', function() {
  'use strict';

  // Assert whether an item is properly active or inactive.
  var assertActiveness = function(item, isSelected) {
    var content = item._elements.acContent;
    var header = item._elements.acHeader;

    // make sure that the CSS3 transition is executed
    item._onCollapsed();

    if (isSelected) {
      expect(item.classList.contains('is-selected')).to.be.true;
      expect(header.getAttribute('aria-selected')).to.equal('true');
      expect(header.getAttribute('aria-expanded')).to.equal('true');
      expect(content.getAttribute('aria-hidden')).to.equal('false');
      expect(parseInt(getComputedStyle(content).height)).to.be.above(0);
      expect(getComputedStyle(content).display).to.equal('block');
    }
    else {
      expect(item.classList.contains('is-selected')).to.be.false;
      expect(header.getAttribute('aria-expanded')).to.equal('false');
      expect(header.getAttribute('aria-selected')).to.equal('false');
      expect(content.getAttribute('aria-hidden')).to.equal('true');
    }
  };

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Accordion');
      expect(Coral.Accordion).to.have.property('Item');
      expect(Coral.Accordion.Item).to.have.property('Label');
      expect(Coral.Accordion.Item).to.have.property('Content');
    });

    it('should define the variants in an enum', function() {
      expect(Coral.Accordion.variant).to.exist;
      expect(Coral.Accordion.variant.DEFAULT).to.equal('default');
      expect(Coral.Accordion.variant.QUIET).to.equal('quiet');
      expect(Coral.Accordion.variant.LARGE).to.equal('large');
      expect(Object.keys(Coral.Accordion.variant).length).to.equal(3);
    });
  });

  helpers.testSelectionList(Coral.Accordion, Coral.Accordion.Item);

  describe('API', function() {

    it('should expand collapsible in accordion', function(done) {
      helpers.build(window.__html__['Coral.Accordion.base.html'], function(el) {
        var secondItem = el.items.getAll()[1];
        secondItem.selected = true;
        helpers.next(function() {
          assertActiveness(secondItem, true);
          done();
        });
      });
    });

    it('should update the active panel on selection changing', function(done) {
      helpers.build(window.__html__['Coral.Accordion.selected.first.html'], function(el) {
        expect(el.items.getAll()[0]).equal(el.selectedItem);
        var secondItem = el.items.getAll()[1];
        secondItem.selected = true;
        helpers.next(function() {
          assertActiveness(secondItem, true);
          expect(secondItem).equal(el.selectedItem);
          done();
        });
      });
    });

    describe('#coral-interactive', function() {

      it('should expand collapsible in accordion', function(done) {
        helpers.build(window.__html__['Coral.Accordion.label.interaction.html'], function(el) {
          var secondItem = el.items.getAll()[1];
          secondItem.selected = true;
          helpers.next(function() {
            assertActiveness(secondItem, true);
            done();
          });
        });
      });

      it('should expand collapsible in accordion while clicking the item label', function(done) {
        helpers.build(window.__html__['Coral.Accordion.label.interaction.html'], function(el) {
          var firstItem = el.items.getAll()[0];
          var secondItem = el.items.getAll()[1];
          secondItem._elements.label.click();

          helpers.next(function() {
            assertActiveness(secondItem, true);

            firstItem._elements.label.click();

            helpers.next(function() {
              assertActiveness(firstItem, true);
              done();
            });
          });
        });
      });

      it('should not expand collapsible in accordion while clicking on a checkbox in the item label', function(done) {
        helpers.build(window.__html__['Coral.Accordion.label.interaction.html'], function(el) {
          var firstItem = el.items.getAll()[0];
          var forthItem = el.items.getAll()[3];
          forthItem._elements.label.click();

          helpers.next(function() {
            assertActiveness(forthItem, true);

            var checkbox = firstItem.querySelector('input[type="checkbox"]');
            expect(checkbox).to.exist;

            checkbox.click();

            helpers.next(function() {
              assertActiveness(forthItem, true);
              expect(checkbox.checked).to.be.true;

              done();
            });
          });
        });
      });

      it('should expand collapsible in accordion while clicking on the chevron while a child tag has the coral-interactive attribute in the item label', function(done) {
        helpers.build(window.__html__['Coral.Accordion.label.interaction.html'], function(el) {
          var firstItem = el.items.getAll()[0];
          var chevron = firstItem.querySelector('[handle="icon"]');

          expect(chevron).to.exist;

          chevron.click();

          helpers.next(function() {
            assertActiveness(firstItem, false);

            chevron.click();

            helpers.next(function() {
              assertActiveness(firstItem, true);
              done();
            });
          });
        });
      });

      it('should not expand collapsible in accordion while clicking on a button in the item label', function(done) {
        helpers.build(window.__html__['Coral.Accordion.label.interaction.html'], function(el) {
          var secondItem = el.items.getAll()[1];
          var forthItem = el.items.getAll()[3];
          forthItem._elements.label.click();

          helpers.next(function() {
            assertActiveness(forthItem, true);

            var button = secondItem.querySelector('button');
            expect(button).to.exist;

            button.click();

            helpers.next(function() {
              assertActiveness(forthItem, true);
              done();
            });
          });
        });
      });

      it('should not expand collapsible in accordion while clicking on a anchor in the item label', function(done) {
        helpers.build(window.__html__['Coral.Accordion.label.interaction.html'], function(el) {
          var secondItem = el.items.getAll()[1];
          var forthItem = el.items.getAll()[3];
          secondItem._elements.label.click();

          helpers.next(function() {
            assertActiveness(secondItem, true);

            var anchor = forthItem.querySelector('a');
            expect(anchor).to.exist;

            anchor.click();

            helpers.next(function() {
              assertActiveness(secondItem, true);
              done();
            });
          });
        });
      });

      it('should not expand collapsible in accordion while interacting with a textarea in the item label', function(done) {
        helpers.build(window.__html__['Coral.Accordion.label.interaction.html'], function(el) {
          var secondItem = el.items.getAll()[1];
          var fifthItem = el.items.getAll()[4];
          secondItem._elements.label.click();

          helpers.next(function() {
            assertActiveness(secondItem, true);

            var textarea = fifthItem.querySelector('textarea');
            expect(textarea).to.exist;

            textarea.click();
            textarea.focus();
            textarea.blur();

            helpers.next(function() {
              assertActiveness(secondItem, true);

              done();
            });
          });
        });
      });

      it('should not expand collapsible in accordion while clicking on a radio in the item label', function(done) {
        helpers.build(window.__html__['Coral.Accordion.label.interaction.html'], function(el) {
          var secondItem = el.items.getAll()[1];
          var eighthItem = el.items.getAll()[7];
          secondItem._elements.label.click();

          helpers.next(function() {
            assertActiveness(secondItem, true);

            var firstRadioInput = eighthItem.querySelector('input[type="radio"]');
            firstRadioInput.click();

            helpers.next(function() {
              assertActiveness(secondItem, true);
              expect(firstRadioInput.checked).to.be.true;
              done();
            });
          });
        });
      });
    });
  });

  describe('User Interaction', function() {
    it('should expand panel in accordion when header is clicked', function(done) {
      helpers.build(window.__html__['Coral.Accordion.base.html'], function(el) {
        var secondItem = el.items.getAll()[1];
        secondItem._elements.label.click();
        helpers.next(function() {
          assertActiveness(secondItem, true);
          done();
        });
      });
    });

    it('should collapse expanded panel in accordion when header is clicked', function(done) {
      helpers.build(window.__html__['Coral.Accordion.selected.first.html'], function(el) {
        var firstItem = el.items.getAll()[0];
        expect(firstItem).equal(el.selectedItem);
        firstItem._elements.label.click();
        helpers.next(function() {
          expect(null).equal(el.selectedItem);
          assertActiveness(firstItem, false);
          done();
        });
      });
    });

    it('should not update the active panel when a disabled panel is clicked', function(done) {
      helpers.build(window.__html__['Coral.Accordion.selected.first.html'], function(el) {
        var firstItem = el.items.getAll()[0];
        var secondItem = el.items.getAll()[1];
        secondItem.disabled = true;
        secondItem.click();
        helpers.next(function() {
          assertActiveness(firstItem, true);
          assertActiveness(secondItem, false);
          expect(firstItem).equal(el.selectedItem);
          done();
        });
      });
    });
  });

  describe('Implementation Details', function() {
    describe('accessibility', function() {
      it('should have role=tablist', function(done) {
        helpers.build(window.__html__['Coral.Accordion.base.html'], function(el) {
          expect(el.getAttribute('role')).to.equal('tablist');
          expect(el.querySelectorAll('[role=presentation]').length).equal(3);
          expect(el.querySelectorAll('div[role=tabpanel]').length).equal(3);

          expect(el.querySelector('[role=tab]').getAttribute('aria-controls'))
            .equal(el.querySelector('div[role=tabpanel]').getAttribute('id'));

          expect(el.querySelector('div[role=tabpanel]').getAttribute('aria-labelledby'))
            .equal(el.querySelector('[role=tab]').getAttribute('id'));

          done();
        });
      });
    });

    describe('animation', function () {
      it('should adapt styling after collapsing out', function(done) {
        helpers.build(window.__html__['Coral.Accordion.base.html'], function(el) {
          var secondItem = el.items.getAll()[1];
          secondItem._selected = true;
          secondItem._onCollapsed();
          expect(secondItem._elements.acContent.classList.contains('is-collapsing')).to.be.false;
          expect(secondItem._elements.acContent.classList.contains('is-closed')).to.be.false;
          expect(secondItem._elements.acContent.classList.contains('is-open')).to.be.true;
          expect(secondItem._elements.acContent.style.height).to.be.equal('');
          done();
        });
      });

      it('should adapt styling after collapsing in', function(done) {
        helpers.build(window.__html__['Coral.Accordion.base.html'], function(el) {
          var secondItem = el.items.getAll()[1];
          secondItem._selected = false;
          secondItem._onCollapsed();
          expect(secondItem._elements.acContent.classList.contains('is-collapsing')).to.be.false;
          expect(secondItem._elements.acContent.classList.contains('is-closed')).to.be.true;
          expect(secondItem._elements.acContent.classList.contains('is-open')).to.be.false;
          expect(secondItem._elements.acContent.style.height).to.be.equal('0px');
          done();
        });
      });
    });

    describe('cloning', function() {
      it('should be possible to clone using markup', function(done) {
        helpers.build(window.__html__['Coral.Accordion.base.html'], function(accordion) {
          helpers.testComponentClone(accordion, done);
        });
      });

      it('should be possible to clone a nested accordion using markup', function(done) {
        helpers.build(window.__html__['Coral.Accordion.nested.html'], function(accordion) {
          helpers.testComponentClone(accordion, done);
        });
      });

      it('should be possible to clone a nested in content accordion using markup', function(done) {
        helpers.build(window.__html__['Coral.Accordion.nested.content.html'], function(accordion) {
          helpers.testComponentClone(accordion, done);
        });
      });

      it('should be possible to clone using js', function(done) {
        var accordion = new Coral.Accordion();
        helpers.target.appendChild(accordion);

        helpers.next(function() {
          helpers.testComponentClone(accordion, done);
        });
      });

      it('should be possible to clone an an instance with interactive components and elements in the item label', function(done) {
        helpers.build(window.__html__['Coral.Accordion.label.interaction.html'], function(accordion) {
          helpers.testComponentClone(accordion, done);
        });
      });
    });
  });
});
