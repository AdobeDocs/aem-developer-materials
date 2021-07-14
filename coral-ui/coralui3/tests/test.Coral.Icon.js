describe('Coral.Icon', function() {
  'use strict';

  var helpers = window.helpers;

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Icon');
    });

    it('should define the sizes in an enum', function() {
      expect(Coral.Icon.size).to.exist;
      expect(Coral.Icon.size.EXTRA_EXTRA_SMALL).to.equal('XXS');
      expect(Coral.Icon.size.EXTRA_SMALL).to.equal('XS');
      expect(Coral.Icon.size.SMALL).to.equal('S');
      expect(Coral.Icon.size.MEDIUM).to.equal('M');
      expect(Coral.Icon.size.LARGE).to.equal('L');
      expect(Coral.Icon.size.EXTRA_LARGE).to.equal('XL');
      expect(Coral.Icon.size.EXTRA_EXTRA_LARGE).to.equal('XXL');
      expect(Object.keys(Coral.Icon.size).length).to.equal(7);
    });
  });

  describe('instantiation', function() {
    it('should be possible using new', function(done) {
      var icon = new Coral.Icon();
      expect(icon.classList.contains('coral3-Icon')).to.be.true;

      helpers.next(function() {
        expect(icon.classList.contains('coral3-Icon--sizeS')).to.be.true;
        expect(icon.classList.contains('coral3-Icon--null')).to.be.false;
        expect(icon.classList.contains('coral3-Icon--undefined')).to.be.false;
        done();
      });
    });

    it('should be possible using createElement', function(done) {
      var icon = document.createElement('coral-icon');
      expect(icon.classList.contains('coral3-Icon')).to.be.true;

      helpers.next(function() {
        expect(icon.classList.contains('coral3-Icon--sizeS')).to.be.true;
        expect(icon.classList.contains('coral3-Icon--null')).to.be.false;
        expect(icon.classList.contains('coral3-Icon--undefined')).to.be.false;
        done();
      });
    });

    it('should be possible using markup', function(done) {
      var icon = helpers.build('<coral-icon></coral-icon>', function() {
        expect(icon.classList.contains('coral3-Icon')).to.be.true;
        expect(icon.classList.contains('coral3-Icon--sizeS')).to.be.true;
        expect(icon.classList.contains('coral3-Icon--null')).to.be.false;
        expect(icon.classList.contains('coral3-Icon--undefined')).to.be.false;
        done();
      });
    });

    it('should be possible to clone using markup', function(done) {
      helpers.build('<coral-icon icon="add" size="L"></coral-icon>', function(icon) {
        helpers.testComponentClone(icon, done);
      });
    });

    it('should be possible to clone using js', function(done) {
      var icon = new Coral.Icon();
      icon.icon = 'add';
      icon.size = 'L';
      helpers.target.appendChild(icon);
      helpers.next(function() {
        helpers.testComponentClone(icon, done);
      });
    });
  });

  describe('markup', function() {

    describe('#icon', function() {

      it('should be empty string initially', function(done) {
        var icon = helpers.build('<coral-icon></coral-icon>', function() {
          expect(helpers.classCount(icon)).to.equal(2);
          expect(icon.icon).to.equal('');
          done();
        });
      });

      it('should set the new icon', function(done) {
        var icon = helpers.build('<coral-icon icon="add"></coral-icon>', function() {
          expect(icon.icon).to.equal('add');
          expect(icon.getAttribute('icon')).to.equal('add');
          expect(icon.size).to.equal(Coral.Icon.size.SMALL);
          expect(icon.classList.contains('coral3-Icon--add')).to.equal.true;
          expect(helpers.classCount(icon)).to.equal(3);
          done();
        });
      });

      it('should not have class for empty icon', function(done) {
        var icon = helpers.build('<coral-icon icon=""></coral-icon>', function() {
          expect(icon.icon).to.equal('');
          expect(icon.getAttribute('icon')).to.equal('');
          expect(icon.size).to.equal(Coral.Icon.size.SMALL);
          expect(icon.classList.contains('coral3-Icon--')).to.equal.false;
          expect(helpers.classCount(icon)).to.equal(2);
          done();
        });
      });

      it('should support arbitrary relative URLs', function(done) {
        var icon = helpers.build('<coral-icon icon="image.png"></coral-icon>', function() {
          expect(icon.icon).to.equal('image.png');
          expect(icon._elements.image).to.be.set;
          expect(icon._elements.image.getAttribute('src')).to.equal('image.png');
          done();
        });
      });

      it('should support arbitrary relative URLs with paths', function(done) {
        var icon = helpers.build('<coral-icon icon="../image.png"></coral-icon>', function() {
          expect(icon.icon).to.equal('../image.png');
          expect(icon._elements.image).to.be.set;
          expect(icon._elements.image.getAttribute('src')).to.equal('../image.png');
          done();
        });
      });

      it('should support root relative URLs', function(done) {
        var icon = helpers.build('<coral-icon icon="/image.png"></coral-icon>', function() {
          expect(icon.icon).to.equal('/image.png');
          expect(icon._elements.image).to.be.set;
          expect(icon._elements.image.getAttribute('src')).to.equal('/image.png');
          done();
        });
      });

      it('should support arbitrary absolute URLs', function(done) {
        var icon = helpers.build('<coral-icon icon="http://localhost/image.png"></coral-icon>', function() {
          expect(icon.icon).to.equal('http://localhost/image.png');
          expect(icon._elements.image).to.be.set;
          expect(icon._elements.image.getAttribute('src')).to.equal('http://localhost/image.png');
          done();
        });
      });
    });

    describe('#size', function() {

      it('should be initially Coral.Icon.size.SMALL', function(done) {
        var icon = helpers.build('<coral-icon></coral-icon>', function() {
          expect(icon.size).to.equal(Coral.Icon.size.SMALL);
          expect(icon.hasAttribute('size')).to.be.true;
          expect(helpers.classCount(icon)).to.equal(2);
          done();
        });
      });

      it('should set the new size', function(done) {
        var icon = helpers.build('<coral-icon size="M"></coral-icon>', function() {
          expect(icon.size).to.equal('M');
          expect(icon.size).to.equal(Coral.Icon.size.MEDIUM);
          expect(icon.getAttribute('size')).to.equal('M');
          expect(icon.classList.contains('coral3-Icon--sizeM')).to.be.true;
          expect(helpers.classCount(icon)).to.equal(2);
          done();
        });
      });

      it('should default empty to default', function(done) {
        var icon = helpers.build('<coral-icon size=""></coral-icon>', function() {
          expect(icon.size).to.equal(Coral.Icon.size.SMALL);
          expect(icon.classList.contains('coral3-Icon--sizeS')).to.be.true;
          expect(helpers.classCount(icon)).to.equal(2);
          done();
        });
      });

      it('should default invalid values to default', function(done) {
        var icon = helpers.build('<coral-icon size="megalarge"></coral-icon>', function() {
          expect(icon.size).to.equal(Coral.Icon.size.SMALL);
          expect(icon.getAttribute('size')).to.equal(Coral.Icon.size.SMALL);
          expect(icon.classList.contains('coral3-Icon--sizeS')).to.be.true;
          expect(helpers.classCount(icon)).to.equal(2);
          done();
        });
      });

      it('should accept lowercase values', function(done) {
        var icon = helpers.build('<coral-icon size="l"></coral-icon>', function() {
          expect(icon.size).to.equal(Coral.Icon.size.LARGE);
          expect(icon.getAttribute('size')).to.equal(Coral.Icon.size.LARGE);
          expect(icon.classList.contains('coral3-Icon--sizeL')).to.be.true;
          expect(helpers.classCount(icon)).to.equal(2);
          done();
        });
      });
    });

    describe('#hidden', function() {
      it('should hide component on false', function(done) {
        var icon = helpers.build('<coral-icon size="l" hidden></coral-icon>', function() {
          expect(icon.hasAttribute('hidden')).to.be.true;
          expect(window.getComputedStyle(icon).display).to.equal('none');
          done();
        });
      });
    });
  });

  describe('API', function() {

    describe('#icon', function() {
      it('should default to null', function(done) {
        var icon = new Coral.Icon();
        expect(icon.icon).to.equal('');
        expect(icon.className).to.equal('coral3-Icon');

        helpers.next(function() {
          expect(icon.classList.contains('coral3-Icon--')).to.be.false;
          expect(icon.classList.contains('coral3-Icon--null')).to.be.false;
          expect(icon.classList.contains('coral3-Icon--undefined')).to.be.false;
          expect(helpers.classCount(icon)).to.equal(2);
          done();
        });
      });

      it('should set the new icon', function(done) {
        var icon = new Coral.Icon();

        icon.icon = 'add';

        helpers.next(function() {
          expect(icon.hasAttribute('icon')).to.be.true;
          expect(icon.classList.contains('coral3-Icon--add')).to.be.true;
          expect(helpers.classCount(icon)).to.equal(3);
          done();
        });
      });

      it('should trim the value', function(done) {
        var icon = new Coral.Icon();

        icon.icon = ' add ';

        helpers.next(function() {
          expect(icon.hasAttribute('icon')).to.be.true;
          expect(icon.classList.contains('coral3-Icon--add')).to.be.true;
          expect(helpers.classCount(icon)).to.equal(3);
          done();
        });
      });

      it('should convert everything to a string', function(done) {
        var icon = new Coral.Icon();
        icon.icon = 5;
        expect(icon.icon).to.equal('5');
        icon.icon = false;
        expect(icon.icon).to.equal('false');
        icon.icon = true;
        expect(icon.icon).to.equal('true');

        helpers.next(function() {
          expect(icon.icon).to.equal('true');
          expect(icon.hasAttribute('icon')).to.be.true;
          expect(icon.classList.contains('coral3-Icon--true')).to.be.true;
          expect(helpers.classCount(icon)).to.equal(3);
          done();
        });
      });

      it('should set with an attribute', function(done) {
        var icon = new Coral.Icon();

        icon.setAttribute('icon', 'add');

        helpers.next(function() {
          expect(icon.getAttribute('icon')).to.equal('add');
          expect(icon.classList.contains('coral3-Icon--add')).to.be.true;
          expect(helpers.classCount(icon)).to.equal(3);
          done();
        });
      });

      it('should not leave class traces', function(done) {
        var icon = new Coral.Icon();
        icon.classList.add('coral3-Icon--test');
        expect(icon.classList.contains('coral3-Icon--test')).to.be.true;

        icon.icon = 'adobeSocial';
        icon.icon = 'add';

        helpers.next(function() {
          expect(icon.classList.contains('coral3-Icon--add')).to.be.true;
          expect(helpers.classCount(icon)).to.equal(3);
          done();
        });
      });

      it('should remove the icon with null', function(done) {
        var icon = new Coral.Icon();
        icon.icon = 'add';

        helpers.next(function() {
          expect(icon.classList.contains('coral3-Icon--add')).to.be.true;
          expect(helpers.classCount(icon)).to.equal(3);

          icon.icon = null;

          helpers.next(function() {
            expect(icon.icon).to.equal('');
            expect(icon.classList.contains('coral3-Icon--')).to.be.false;
            expect(icon.classList.contains('coral3-Icon--null')).to.be.false;
            expect(icon.classList.contains('coral3-Icon--undefined')).to.be.false;
            expect(helpers.classCount(icon)).to.equal(2);
            done();
          });
        });
      });

      it('should remove the icon with undefined', function(done) {
        var icon = new Coral.Icon();
        icon.icon = 'add';

        helpers.next(function() {
          expect(icon.classList.contains('coral3-Icon--add')).to.be.true;
          expect(helpers.classCount(icon)).to.equal(3);

          icon.icon = undefined;

          helpers.next(function() {
            expect(icon.icon).to.equal('');
            expect(icon.classList.contains('coral3-Icon--null')).to.be.false;
            expect(icon.classList.contains('coral3-Icon--undefined')).to.be.false;
            expect(helpers.classCount(icon)).to.equal(2);
            done();
          });
        });
      });

      it('should remove the icon with empty string', function(done) {
        var icon = new Coral.Icon();
        icon.icon = 'add';

        helpers.next(function() {
          expect(icon.classList.contains('coral3-Icon--add')).to.be.true;
          expect(helpers.classCount(icon)).to.equal(3);

          icon.icon = '';

          helpers.next(function() {
            expect(icon.icon).to.equal('');
            expect(icon.classList.contains('coral3-Icon--')).to.be.false;
            expect(icon.classList.contains('coral3-Icon--null')).to.be.false;
            expect(icon.classList.contains('coral3-Icon--undefined')).to.be.false;
            expect(helpers.classCount(icon)).to.equal(2);
            done();
          });
        });
      });

      it('should remove the icon when the attribute is removed', function(done) {
        var icon = new Coral.Icon();
        icon.setAttribute('icon', 'add');

        helpers.next(function() {
          expect(icon.getAttribute('icon')).to.equal('add');
          expect(icon.classList.contains('coral3-Icon--add')).to.be.true;
          expect(helpers.classCount(icon)).to.equal(3);

          icon.removeAttribute('icon');

          helpers.next(function() {
            expect(icon.icon).to.equal('');
            expect(helpers.classCount(icon)).to.equal(2);
            done();
          });
        });
      });
    });

    describe('#size', function() {

      it('should default to Coral.Icon.size.SMALL', function(done) {
        var icon = new Coral.Icon();
        expect(icon.size).to.equal(Coral.Icon.size.SMALL);
        expect(icon.className).to.equal('coral3-Icon');

        helpers.next(function() {
          expect(icon.classList.contains('coral3-Icon--sizeS')).to.be.true;
          expect(helpers.classCount(icon)).to.equal(2);
          done();
        });
      });

      it('should set the new size', function(done) {
        var icon = new Coral.Icon();

        icon.size = Coral.Icon.size.LARGE;
        expect(icon.size).to.equal(Coral.Icon.size.LARGE);

        helpers.next(function() {
          expect(icon.classList.contains('coral3-Icon--sizeL')).to.be.true;
          expect(helpers.classCount(icon)).to.equal(2);
          done();
        });
      });

      it('should accept lowercase values', function(done) {
        var icon = new Coral.Icon();

        icon.size = Coral.Icon.size.LARGE.toLowerCase();
        expect(icon.size).to.equal(Coral.Icon.size.LARGE);

        helpers.next(function() {
          expect(icon.classList.contains('coral3-Icon--sizeL')).to.be.true;
          expect(helpers.classCount(icon)).to.equal(2);
          done();
        });
      });

      it('should be set with an attribute', function(done) {
        var icon = new Coral.Icon();

        icon.setAttribute('size', Coral.Icon.size.LARGE);
        expect(icon.size).to.equal(Coral.Icon.size.LARGE);

        helpers.next(function() {
          expect(icon.getAttribute('size')).to.equal('L');
          expect(icon.classList.contains('coral3-Icon--sizeL')).to.be.true;
          expect(helpers.classCount(icon)).to.equal(2);
          done();
        });
      });

      it('should discard values not part of the enum', function(done) {
        var icon = new Coral.Icon();

        // this value will be accepted
        icon.size = 'XS';
        // all these will be discarded
        icon.size = 'megalarge';
        icon.size = null;
        icon.size = -1;
        expect(icon.size).to.equal(Coral.Icon.size.EXTRA_SMALL);

        helpers.next(function() {
          expect(icon.classList.contains('coral3-Icon--sizeXS')).to.be.true;
          expect(helpers.classCount(icon)).to.equal(2);
          done();
        });
      });

      it('should discard unknonwn attribute', function(done) {
        var icon = new Coral.Icon();

        icon.setAttribute('size', 'megalarge');
        expect(icon.size).to.equal(Coral.Icon.size.SMALL);

        helpers.next(function() {
          expect(icon.getAttribute('size')).to.equal('megalarge');
          expect(icon.classList.contains('coral3-Icon--sizeS')).to.be.true;
          expect(helpers.classCount(icon)).to.equal(2);
          done();
        });
      });

      it('should not remove unknonwn size classes', function(done) {
        var icon = new Coral.Icon();
        icon.classList.add('coral3-Icon--sizeME');

        icon.size = 'XS';
        expect(icon.size).to.equal(Coral.Icon.size.EXTRA_SMALL);

        helpers.next(function() {
          expect(icon.classList.contains('coral3-Icon--sizeXS')).to.be.true;
          expect(icon.classList.contains('coral3-Icon--sizeME')).to.be.true;
          expect(helpers.classCount(icon)).to.equal(3);
          done();
        });
      });
    });

    describe('#alt', function() {
      it('should be empty string initially', function(done) {
        var icon = helpers.build('<coral-icon></coral-icon>', function() {
          expect(icon.alt).to.equal('');
          done();
        });
      });

      it('should add an aria-label equal to the value of the alt property', function(done) {
        var icon = new Coral.Icon();

        icon.icon = 'add';
        icon.alt = 'Add Item';

        helpers.next(function() {
          expect(icon.alt).to.equal('Add Item');
          expect(icon.getAttribute('aria-label')).to.equal('Add Item');
          done();
        });
      });

      it('should add an aria-label equal to the value of the icon property when not set and when no title attribute is present', function(done) {
        var icon = new Coral.Icon();

        icon.icon = 'add';

        helpers.next(function() {
          expect(icon.getAttribute('aria-label')).to.equal('add');
          done();
        });
      });

      it('should add an aria-label equal to the value of the title attribute property when not set and when a title attribute is present', function(done) {
        var icon = new Coral.Icon();

        icon.icon = 'add';
        icon.setAttribute('title', 'Add Item');

        helpers.next(function() {
          expect(icon.getAttribute('aria-label')).to.equal('Add Item');
          done();
        });
      });

      it('should have no aria-label attribute when explicitly set to an empty string', function(done) {
        var icon = new Coral.Icon();

        icon.icon = 'add';
        icon.setAttribute('title', 'Add Item');
        icon.setAttribute('alt', '');

        helpers.next(function() {
          expect(icon.hasAttribute('aria-label')).to.be.false;
          done();
        });
      });

      it('should have role="img" when icon property is not a URL', function(done) {
        var icon = new Coral.Icon();

        icon.icon = 'add';
        icon.alt = 'Add Item';

        helpers.next(function() {
          expect(icon.getAttribute('role')).to.equal('img');
          done();
        });
      });

      it('should have role="presentation" when icon property is a URL', function(done) {
        var icon = new Coral.Icon();

        icon.icon = 'image.png';

        helpers.next(function() {
          expect(icon.getAttribute('role')).to.equal('presentation');
          expect(icon._elements.image.getAttribute('alt')).to.equal('');
          done();
        });
      });

      it('should update alt text on child image when icon property is a URL', function(done) {
        var icon = new Coral.Icon();

        icon.icon = 'image.png';
        icon.alt = 'Add Item';

        helpers.next(function() {
          expect(icon.getAttribute('role')).to.equal('presentation');
          expect(icon._elements.image.getAttribute('alt')).to.equal('Add Item');
          done();
        });
      });

      it('should set alt text on child image to value of title attribute empty string when icon property is a URL and alt is null', function(done) {
        var icon = new Coral.Icon();

        icon.icon = 'image.png';
        icon.title = 'Add Item';

        helpers.next(function() {
          expect(icon.getAttribute('role')).to.equal('presentation');
          expect(icon._elements.image.getAttribute('alt')).to.equal('Add Item');
          done();
        });
      });

      it('should set alt text on child image to an empty string when icon property is a URL and alt is an empty string', function(done) {
        var icon = new Coral.Icon();

        icon.icon = 'image.png';
        icon.title = 'Add Item';
        // Setting alt = '' as a property is somewhate problematic.
        // The default behavior will use the title or icon name as alt text when no alt attribute is present.
        icon.alt = '';

        helpers.next(function() {
          expect(icon.getAttribute('role')).to.equal('presentation');
          expect(icon._elements.image.getAttribute('alt')).to.equal(icon.title);
          // By setting alt = '' explicitly using setAttribute, we can override the default behavior and instead use an empty string for alt text.
          icon.setAttribute('alt', '');
          helpers.next(function() {
            expect(icon._elements.image.getAttribute('alt')).to.equal('');
            done();
          });
        });
      });
    });
  });
});
