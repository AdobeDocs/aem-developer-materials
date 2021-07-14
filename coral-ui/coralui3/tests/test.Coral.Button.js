describe('Coral.Button', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Button');
      expect(Coral.Button).to.have.property('Label');
    });

    it('should define the variants in an enum', function() {
      expect(Coral.Button.variant).to.exist;
      expect(Coral.Button.variant.DEFAULT).to.equal('secondary'); // backwards compat
      expect(Coral.Button.variant.SECONDARY).to.equal('secondary');
      expect(Coral.Button.variant.PRIMARY).to.equal('primary');
      expect(Coral.Button.variant.WARNING).to.equal('warning');
      expect(Coral.Button.variant.QUIET).to.equal('quiet');
      expect(Coral.Button.variant.MINIMAL).to.equal('minimal');
      expect(Object.keys(Coral.Button.variant).length).to.equal(7);
    });

    it('should define the iconPositions in an enum', function() {
      expect(Coral.Button.iconPosition).to.exist;
      expect(Coral.Button.iconPosition.LEFT).to.equal('left');
      expect(Coral.Button.iconPosition.RIGHT).to.equal('right');
      expect(Object.keys(Coral.Button.iconPosition).length).to.equal(2);
    });
  });

  describe('Instantiation', function() {
    it('should be possible using new', function(done) {
      var button = new Coral.Button();
      expect(button.classList.contains('coral3-Button')).to.be.true;
      helpers.next(function() {
        expect(button.hasAttribute('block')).to.be.false;
        expect(button.hasAttribute('icon')).to.be.false;
        expect(button.hasAttribute('variant')).to.be.true;
        expect(button.classList.contains('coral3-Button')).to.be.true;
        done();
      });
    });

    it('should not blow away loose HTML', function(done) {
      helpers.build('<button is="coral-button"><span>Add</span></button>', function(button) {
        expect(button.label.innerHTML).to.equal('<span>Add</span>');
        done();
      });
    });

    it('should be possible to clone using markup', function(done) {
      helpers.build('<button is="coral-button">Add</button>', function(button) {
        helpers.testComponentClone(button, done);
      });
    });

    it('should be possible to clone a button with size attribute using markup', function(done) {
      helpers.build('<button is="coral-button" size="L">Add</button>', function(button) {
        helpers.testComponentClone(button, done);
      });
    });

    it('should be possible to clone a button with icon attribute using markup', function(done) {
      helpers.build('<button is="coral-button" icon="add">Add</button>', function(button) {
        helpers.testComponentClone(button, done);
      });
    });

    it('should be possible to clone a button with icon and size attribute using markup', function(done) {
      helpers.build('<button is="coral-button" icon="add" size"L">Add</button>', function(button) {
        helpers.testComponentClone(button, done);
      });
    });

    it('should be possible to clone a button with quiet attribute using markup', function(done) {
      helpers.build('<button is="coral-button" variant="quiet">Add</button>', function(button) {
        helpers.testComponentClone(button, done);
      });
    });

    it('should be possible to clone a button using js', function(done) {
      var button = new Coral.Button();
      button.label.textContent = 'Add Button';
      helpers.target.appendChild(button);
      helpers.next(function() {
        helpers.testComponentClone(button, done);
      });
    });

    it('should be possible to clone a button with a specific size using js', function(done) {
      var button = new Coral.Button();
      button.size = 'L';
      button.label.textContent = 'Add Button';
      helpers.target.appendChild(button);
      helpers.next(function() {
        helpers.testComponentClone(button, done);
      });
    });

    it('should be possible to clone a button with an icon using js', function(done) {
      var button = new Coral.Button();
      button.icon = 'add';
      button.label.textContent = 'Add Button';
      helpers.target.appendChild(button);
      helpers.next(function() {
        helpers.testComponentClone(button, done);
      });
    });

    it('should be possible to clone a button with a variant using js', function(done) {
      var button = new Coral.Button();
      button.variant = 'quiet';
      button.label.textContent = 'Quiet Button';
      helpers.target.appendChild(button);
      helpers.next(function() {
        helpers.testComponentClone(button, done);
      });
    });
  });

  describe('Markup', function() {

    describe('#hidden', function() {

      it('should hide component on false', function(done) {
        var markup = '<button is="coral-button" hidden></button>';
        helpers.build(markup, function(button) {
          expect(getComputedStyle(button).display).to.equal('none');
          expect(button.hasAttribute('hidden')).to.be.true;
          done();
        });
      });
    });

    describe('#label', function() {

      it('should be initially empty', function(done) {
        var markup = '<button is="coral-button" hidden></button>';
        helpers.build(markup, function(button) {
          expect(button.label.textContent).to.equal('', 'label.textContent');
          expect(button.textContent).to.equal('');
          expect(button.classList.contains('coral3-Button')).to.be.true;
          done();
        });
      });

      it('should use the existing nodes as the initial label value', function(done) {
        var markup = '<button is="coral-button">Button</button>';
        helpers.build(markup, function(button) {
          expect(button.label.innerHTML).to.equal('Button');
          done();
        });
      });

      it('should resync the icon once the label is modified', function(done) {
        var markup = '<button is="coral-button" icon="add">Add</button>';
        helpers.build(markup, function(button) {
          expect(button.icon).to.equal('add');
          expect(button.label.innerHTML).to.equal('Add');
          expect(button.hasAttribute('icon', 'add')).to.be.true;
          expect(button._getIconElement()).to.exist;
          expect(button._getIconElement().parentNode).not.to.be.null;

          button.label.textContent = 'Hello';

          helpers.next(function() {
            expect(button.textContent).to.equal('Hello');
            expect(button.classList.contains('coral3-Button')).to.be.true;
            expect(button.icon).to.equal('add');
            done();
          }); // end next frame
        }); // end build
      }); // end it

      it('should change to square if the label is removed', function(done) {
        var markup = '<button is="coral-button" icon="add">Add</button>';
        helpers.build(markup, function(button) {
          expect(button.icon).to.equal('add');
          expect(button.label.innerHTML).to.equal('Add');
          expect(button.hasAttribute('icon', 'add')).to.be.true;
          expect(button._getIconElement()).to.exist;
          expect(button._getIconElement().parentNode).not.to.be.null;

          button.label.textContent = '';

          helpers.next(function() {
            expect(button.textContent).to.equal('');
            expect(button.classList.contains('coral3-Button')).to.be.true;
            expect(button.icon).to.equal('add');
            done();
          }); // end next frame
        }); // end build
      }); // end it

      it('should remove square if the label is added', function(done) {
        var markup = '<button is="coral-button" icon="add"></button>';
        helpers.build(markup, function(button) {
          expect(button.icon).to.equal('add');
          expect(button.label.innerHTML).to.equal('');
          expect(button.hasAttribute('icon', 'add')).to.be.true;
          expect(button._getIconElement()).to.exist;
          expect(button._getIconElement().parentNode).not.to.be.null;

          button.label.textContent = 'Add';

          helpers.next(function() {
            expect(button.textContent).to.equal('Add');
            expect(button.classList.contains('coral3-Button')).to.be.true;
            expect(button.icon).to.equal('add');
            done();
          }); // end next frame
        }); // end build
      }); // end it

    }); // end describe label

    describe('#icon', function() {

      it('should be initially empty', function(done) {
        var markup = '<button is="coral-button"></button>';
        helpers.build(markup, function(button) {
          expect(button.icon).to.equal('');
          expect(button._getIconElement().parentNode).to.be.null;
          expect(button.hasAttribute('icon')).to.be.false;
          expect(button.classList.contains('coral3-Button')).to.be.true;
          done();
        });
      });

      it('should set a new icon', function(done) {
        var markup = '<button is="coral-button" icon="add"></button>';
        helpers.build(markup, function(button) {
          expect(button.icon).to.equal('add');
          expect(button.hasAttribute('icon', 'add')).to.be.true;
          expect(button.textContent).to.equal('');
          // for some reason IE needs another frame
          helpers.next(function() {
            expect(button._getIconElement()).to.exist;
            expect(button._getIconElement().icon).to.equal('add');
            expect(button.classList.contains('coral3-Button')).to.be.true;
            done();
          });
        });
      });

      it('should not be square when there is a label', function(done) {
        var markup = '<button is="coral-button" icon="add">Add</button>';
        helpers.build(markup, function(button) {
          expect(button.icon).to.equal('add');
          expect(button.label.innerHTML).to.equal('Add');
          expect(button.hasAttribute('icon', 'add')).to.be.true;
          expect(button.textContent).to.equal('Add');
          expect(button._getIconElement()).to.exist;
          expect(button._getIconElement().icon).to.equal('add');

          // for some reason IE needs another frame
          helpers.next(function() {
            expect(button.classList.contains('coral3-Button')).to.be.true;
            done();
          });
        });
      });

      it('should have default icon alt text when there is no label', function(done) {
        var markup = '<button is="coral-button" icon="add"></button>';
        helpers.build(markup, function(button) {
          expect(button.icon).to.equal('add');
          expect(button.label.innerHTML).to.equal('');
          expect(button.hasAttribute('icon', 'add')).to.be.true;
          expect(button._elements.icon).to.exist;
          expect(button._elements.icon.icon).to.equal('add');
          expect(button._elements.icon.alt).to.equal('');
          expect(button._elements.icon.getAttribute('aria-label')).to.equal('add');

          // for some reason IE needs another frame
          helpers.next(function() {
            expect(button.classList.contains('coral3-Button')).to.be.true;
            done();
          });
        });
      });

      it('should not have icon alt text when there is a label', function(done) {
        var markup = '<button is="coral-button" icon="add">Add</button>';
        helpers.build(markup, function(button) {
          expect(button.icon).to.equal('add');
          expect(button.label.innerHTML).to.equal('Add');
          expect(button.hasAttribute('icon', 'add')).to.be.true;
          expect(button.textContent).to.equal('Add');
          expect(button._elements.icon).to.exist;
          expect(button._elements.icon.icon).to.equal('add');
          expect(button._elements.icon.alt).to.equal('');
          expect(button._elements.icon.getAttribute('aria-label')).to.be.null;

          // for some reason IE needs another frame
          helpers.next(function() {
            expect(button.classList.contains('coral3-Button')).to.be.true;
            done();
          });
        });
      });

      it('should remove icon alt text if the label is added', function(done) {
        var markup = '<button is="coral-button" icon="add"></button>';
        helpers.build(markup, function(button) {
          expect(button.icon).to.equal('add');
          expect(button.label.innerHTML).to.equal('');
          expect(button.hasAttribute('icon', 'add')).to.be.true;
          expect(button._elements.icon).to.exist;
          expect(button._elements.icon.parentNode).not.to.be.null;
          expect(button._elements.icon.alt).to.equal('');
          expect(button._elements.icon.getAttribute('aria-label')).to.equal('add');

          button.label.textContent = 'Add';

          helpers.next(function() {
            expect(button.textContent).to.equal('Add');
            expect(button.classList.contains('coral3-Button')).to.be.true;
            expect(button.icon).to.equal('add');
            expect(button._elements.icon.alt).to.equal('');
            expect(button._elements.icon.getAttribute('aria-label')).to.be.null;
            done();
          }); // end next frame
        }); // end build
      }); // end it

      it('should restore default icon alt text if the label is removed', function(done) {
        var markup = '<button is="coral-button" icon="add">Add</button>';
        helpers.build(markup, function(button) {
          expect(button.label.innerHTML).to.equal('Add');
          expect(button.hasAttribute('icon', 'add')).to.be.true;
          expect(button.icon).to.equal('add');
          expect(button._elements.icon.alt).to.equal('');
          expect(button._elements.icon.getAttribute('aria-label')).to.be.null;

          button.label.innerHTML = '';

          helpers.next(function() {
            expect(button.textContent).to.equal('');
            expect(button.classList.contains('coral3-Button')).to.be.true;
            expect(button.icon).to.equal('add');
            expect(button._elements.icon.alt).to.equal('');
            expect(button._elements.icon.getAttribute('aria-label')).to.equal('add');
            done();
          }); // end next frame
        }); // end build
      }); // end it

      it('should not create a new icon if the value is updated', function(done) {
        var markup = '<button is="coral-button" icon="add">Add</button>';
        helpers.build(markup, function(button) {
          expect(button.label.innerHTML).to.equal('Add');
          expect(button.hasAttribute('icon', 'add')).to.be.true;
          expect(button.icon).to.equal('add');
          expect(button._elements.icon.alt).to.equal('');
          expect(button._elements.icon.getAttribute('aria-label')).to.be.null;

          // icon is updated
          button.icon = 'share';
          button.label.innerHTML = '';
          expect(button._getIconElement()).to.exist;
          expect(button._getIconElement().icon).to.equal('share');

          helpers.next(function() {
            expect(button._elements.icon.alt).to.equal('');
            expect(button._elements.icon.getAttribute('aria-label')).to.equal('share');
            expect(button.classList.contains('coral3-Button')).to.be.true;
            done();
          });
        });
      });

      it('should hide the icon element once the icon is set to empty string', function(done) {
        var markup = '<button is="coral-button" icon="add"></button>';
        helpers.build(markup, function(button) {
          expect(button.icon).to.equal('add');
          expect(button.hasAttribute('icon', 'add')).to.be.true;
          expect(button._getIconElement().parentNode).not.to.be.null;

          button.icon = '';

          helpers.next(function() {

            expect(button._getIconElement()).to.exist;
            expect(button._getIconElement().icon).to.equal('');
            expect(button._getIconElement().parentNode).to.be.null;
            expect(button.classList.contains('coral3-Button')).to.be.true;
            done();
          });
        });
      });
    }); // end describe icon

    describe('#iconsize', function() {
      it('should be initially the default', function(done) {
        var markup = '<button is="coral-button"></button>';
        helpers.build(markup, function(button) {
          expect(button.iconSize).to.equal(Coral.Icon.size.SMALL);
          expect(button.hasAttribute('iconsize')).to.be.false;
          done();
        });
      });

      it('should set the new iconsize', function(done) {
        var markup = '<button is="coral-button" iconsize="L" icon="add"></button>';
        helpers.build(markup, function(button) {
          expect(button.iconSize).to.equal(Coral.Icon.size.LARGE);
          expect(button.hasAttribute('iconsize', 'L')).to.be.true;
          expect(button._getIconElement().icon).to.equal('add');
          expect(button._getIconElement().size).to.equal(Coral.Icon.size.LARGE);
          done();
        });
      });

      it('should discard invalid iconsize', function(done) {
        var markup = '<button is="coral-button" iconsize="megalarge" icon="add"></button>';
        helpers.build(markup, function(button) {
          expect(button.iconSize).to.equal(Coral.Icon.size.SMALL);
          expect(button.hasAttribute('iconsize', 'megalarge')).to.be.true;
          expect(button._getIconElement().icon).to.equal('add');
          expect(button._getIconElement().size).to.equal(Coral.Icon.size.SMALL);
          done();
        });
      });
    });

    describe('#iconposition', function() {
      it('should generate icon per default on left when not defined', function(done) {
        var markup = '<button is="coral-button" icon="add"></button>';
        helpers.build(markup, function(button) {
          expect(button.iconPosition).to.equal(Coral.Button.iconPosition.LEFT);
          expect(button.firstElementChild.tagName).to.equal('CORAL-ICON');
          done();
        });
      });

      it('should generate icon on the left when defined in iconposition', function(done) {
        var markup = '<button is="coral-button" icon="add" iconposition="left"></button>';
        helpers.build(markup, function(button) {
          expect(button.firstElementChild.tagName).to.equal('CORAL-ICON');
          done();
        });
      });

      it('should generate icon on the right when defined in iconposition', function(done) {
        var markup = '<button is="coral-button" icon="add" iconposition="right"></button>';
        helpers.build(markup, function(button) {
          expect(button.firstElementChild.tagName).to.equal('CORAL-BUTTON-LABEL');
          done();
        });
      });

      it('should move icon on the left iconposition is changed on runtime', function(done) {
        var markup = '<button is="coral-button" icon="add" iconposition="RIGHT"></button>';
        helpers.build(markup, function(button) {
          button.iconPosition = 'LEFT';
          expect(button.firstElementChild.tagName).to.equal('CORAL-ICON');
          done();
        });
      });
    });

    describe('#size', function() {
      it('should move icon on the left iconposition is changed on runtime', function(done) {
        var markup = '<button is="coral-button" icon="add" iconposition="right"></button>';
        helpers.build(markup, function(button) {
          button.iconPosition = Coral.Button.iconPosition.LEFT;
          expect(button.firstElementChild.tagName).to.equal('CORAL-ICON');
          done();
        });
      });

      it('should default to "left" when the attribute is removed', function(done) {
        var markup = '<button is="coral-button" icon="add" iconposition="right"></button>';
        helpers.build(markup, function(button) {
          button.removeAttribute('iconposition');
          expect(button.iconPosition).to.equal(Coral.Button.iconPosition.LEFT);
          expect(button.firstElementChild.tagName).to.equal('CORAL-ICON');
          done();
        });
      });
    });

    describe('#size', function() {
      it('should default to medium', function(done) {
        var markup = '<button is="coral-button"></button>';
        helpers.build(markup, function(button) {
          expect(button.size).to.equal(Coral.Button.size.MEDIUM);
          expect(button.classList.contains('coral3-Button--large')).to.be.false;
          expect(button.classList.contains('coral3-Button')).to.be.true;
          done();
        });
      });

      it('should set the size modifier', function(done) {
        var markup = '<button is="coral-button" size="L"></button>';
        helpers.build(markup, function(button) {
          expect(button.size).to.equal(Coral.Button.size.LARGE);

          // these need an extra frame to pass in IE11
          helpers.next(function() {
            expect(button.classList.contains('coral3-Button--large')).to.be.true;
            expect(button.classList.contains('coral3-Button')).to.be.true;
            done();
          });
        });
      });
    });

    describe('#block', function() {

      it('should be initially false', function(done) {
        var markup = '<button is="coral-button"></button>';
        helpers.build(markup, function(button) {
          expect(button.block).to.be.false;
          expect(button.hasAttribute('block')).to.be.false;

          // these need an extra frame to pass in IE11
          helpers.next(function() {
            expect(button.classList.contains('coral3-Button--block')).to.be.false;
            expect(button.classList.contains('coral3-Button')).to.be.true;
            done();
          });
        });
      });

      it('should set the size modifier', function(done) {
        var markup = '<button is="coral-button" block></button>';
        helpers.build(markup, function(button) {
          expect(button.block).to.be.true;
          expect(button.hasAttribute('block')).to.be.true;

          // these need an extra frame to pass in IE11
          helpers.next(function() {
            expect(button.classList.contains('coral3-Button--block')).to.be.true;
            expect(button.classList.contains('coral3-Button')).to.be.true;
            done();
          });
        });
      });

      it('should behave like an attribute boolean', function(done) {
        var markup = '<button is="coral-button" block="false"></button>';
        helpers.build(markup, function(button) {
          expect(button.block).to.be.true;
          expect(button.hasAttribute('block')).to.be.true;
          // these need an extra frame to pass in IE11
          helpers.next(function() {
            expect(button.classList.contains('coral3-Button--block')).to.be.true;
            expect(button.classList.contains('coral3-Button')).to.be.true;
            done();
          });
        });
      });
    });

    describe('#variant', function() {

      it('should be initially Coral.Button.variant.DEFAULT', function(done) {
        var markup = '<button is="coral-button"></button>';
        helpers.build(markup, function(button) {
          expect(button.variant).to.equal(Coral.Button.variant.DEFAULT);
          expect(button.hasAttribute('variant')).to.be.true;
          expect(button.classList.contains('coral3-Button')).to.be.true;
          done();
        });
      });

      it('should set the new variant', function(done) {
        var markup = '<button is="coral-button" variant="primary"></button>';
        helpers.build(markup, function(button) {
          expect(button.variant).to.equal('primary');
          expect(button.variant).to.equal(Coral.Button.variant.PRIMARY);
          expect(button.hasAttribute('variant', 'primary')).to.be.true;
          // these need an extra frame to pass in IE11
          helpers.next(function() {
            expect(button.classList.contains('coral3-Button--primary')).to.be.true;
            expect(button.classList.contains('coral3-Button')).to.be.true;
            done();
          });
        });
      });

      it('should add the default class if variant is empty', function(done) {
        var markup = '<button is="coral-button" variant=""></button>';
        helpers.build(markup, function(button) {
          expect(button.variant).to.equal(Coral.Button.variant.DEFAULT);
          expect(button.hasAttribute('variant', Coral.Button.variant.DEFAULT)).to.be.true;
          expect(button.classList.contains('coral3-Button')).to.be.true;
          done();
        });
      });

      it('should go back to default variant for invalid variant', function(done) {
        var markup = '<button is="coral-button" variant="invalidvariant"></button>';
        helpers.build(markup, function(button) {
          expect(button.variant).to.equal(Coral.Button.variant.DEFAULT);
          expect(button.hasAttribute('variant', Coral.Button.variant.DEFAULT)).to.be.true;
          expect(button.classList.contains('coral3-Button')).to.be.true;
          done();
        });
      });

      it('should remove variant classnames when variant changes', function(done) {
        var markup = '<button is="coral-button" variant="primary"></button>';
        helpers.build(markup, function(button) {

          expect(button.classList.contains('coral3-Button--primary')).to.be.true;

          button.variant = Coral.Button.variant.WARNING;

          // these need an extra frame to pass in IE11
          helpers.next(function() {
            expect(button.classList.contains('coral3-Button--warning')).to.be.true;
            expect(button.classList.contains('coral3-Button--primary')).to.be.false;
            done();
          });
        });
      });
    });

    describe('#selected', function() {

      it('should default to false', function(done) {
        var markup = '<button is="coral-button"></button>';

        helpers.build(markup, function(button) {
          expect(button.selected).to.be.false;
          expect(button.classList.contains('is-selected')).to.be.false;
          expect(button.hasAttribute('selected')).to.be.false;

          done();
        });
      });

      it('should be settable', function(done) {
        var markup = '<button is="coral-button" selected></button>';

        helpers.build(markup, function(button) {
          expect(button.selected).to.be.true;
          expect(button.hasAttribute('selected')).to.be.true;

          // we wait for the sync
          helpers.next(function() {
            expect(button.classList.contains('is-selected')).to.be.true;

            done();
          });
        });
      });
    });

    it('should accept all attributes at once', function(done) {
      var markup = '<button is="coral-button" icon="share" variant="primary" size="L" block>Share</button>';
      helpers.build(markup, function(button) {
        expect(button.size).to.equal(Coral.Button.size.LARGE);
        expect(button.block).to.be.true;
        expect(button.variant).to.equal(Coral.Button.variant.PRIMARY);
        expect(button.icon).to.equal('share');

        // these need an extra frame to pass in IE11
        helpers.next(function() {
          expect(button.classList.contains('coral3-Button--large')).to.be.true;
          expect(button.classList.contains('coral3-Button--block')).to.be.true;
          expect(button.classList.contains('coral3-Button--primary')).to.be.true;
          expect(button._getIconElement()).to.exist;
          expect(button._getIconElement().icon).to.equal('share');
          expect(button.textContent).to.equal('Share');
          expect(button.classList.contains('coral3-Button')).to.be.true;
          done();
        });
      });
    }); // end variant
  }); // end describe markup

  describe('API', function() {

    describe('#icon', function() {

      it('should default to empty string', function(done) {
        var button = new Coral.Button();
        expect(button.icon).to.equal('');
        helpers.next(function() {
          expect(button._getIconElement().parentNode).to.be.null;
          done();
        });
      });

      it('should set the new icon', function(done) {
        var button = new Coral.Button();

        button.icon = 'add';

        helpers.next(function() {
          expect(button.hasAttribute('icon')).to.be.false;

          helpers.next(function() {
            expect(button._getIconElement().classList.contains('coral3-Icon--add')).to.be.true;
            done();
          });
        });
      });

      it('should convert everything to string', function(done) {
        var button = new Coral.Button();
        button.icon = 5;
        expect(button.icon).to.equal('5');
        button.icon = false;
        expect(button.icon).to.equal('false');
        button.icon = true;
        expect(button.icon).to.equal('true');

        helpers.next(function() {
          expect(button.icon).to.equal('true');
          expect(button.hasAttribute('icon')).to.be.false;
          expect(button._getIconElement()).not.to.be.null;
          expect(button._getIconElement().classList.contains('coral3-Icon--true')).to.be.true;
          done();
        });
      });

      it('should remove the icon with empty string', function(done) {
        var button = new Coral.Button();
        button.icon = 'add';

        expect(button._getIconElement().icon).to.equal('add');

        button.icon = '';

        helpers.next(function() {
          expect(button.icon).to.equal('');
          expect(button._getIconElement().parentNode).to.be.null;
          done();
        });
      });

      it('should remove the icon with null', function(done) {
        var button = new Coral.Button();
        button.icon = 'add';

        expect(button._getIconElement().icon).to.equal('add');

        button.icon = null;

        helpers.next(function() {
          expect(button.icon).to.equal('');
          expect(button._getIconElement().parentNode).to.be.null;
          done();
        });
      });

      it('should remove the icon with undefined', function(done) {
        var button = new Coral.Button();
        button.icon = 'add';

        expect(button._getIconElement().icon).to.equal('add');

        button.icon = undefined;

        helpers.next(function() {
          expect(button.icon).to.equal('');
          expect(button._getIconElement().parentNode).to.be.null;
          done();
        });
      });
    });

    describe('#iconSize', function() {

      it('should default to Coral.Icon.size.SMALL', function(done) {
        var button = new Coral.Button();
        button.icon = 'add';
        expect(button.iconSize).to.equal(Coral.Icon.size.SMALL);

        helpers.next(function() {
          expect(button._getIconElement().size).to.equal(Coral.Icon.size.SMALL);
          done();
        });
      });

      it('should sync the iconSize correctly', function(done) {
        var button = new Coral.Button();
        button.iconSize = Coral.Icon.size.LARGE;
        button.icon = 'add';

        expect(button._getIconElement().size).to.equal(Coral.Icon.size.LARGE);

        helpers.next(function() {
          expect(button._getIconElement().classList.contains('coral3-Icon--sizeL')).to.be.true;
          done();
        });
      });

      it('should set the new size even if icon is not set', function() {
        var button = new Coral.Button();

        button.iconSize = Coral.Icon.size.LARGE;
        expect(button.iconSize).to.equal(Coral.Icon.size.LARGE);
      });

      it('should set the new size', function(done) {
        var button = new Coral.Button();

        button.icon = 'add';
        button.iconSize = Coral.Icon.size.LARGE;
        expect(button.iconSize).to.equal(Coral.Icon.size.LARGE);

        helpers.next(function() {
          expect(button._getIconElement().size).to.equal(Coral.Icon.size.LARGE);
          done();
        });
      });

      it('should accept lowercase values', function(done) {
        var button = new Coral.Button();

        button.icon = 'add';
        button.iconSize = Coral.Icon.size.LARGE.toLowerCase();
        expect(button.iconSize).to.equal(Coral.Icon.size.LARGE);

        expect(button._getIconElement().size).to.equal(Coral.Icon.size.LARGE);

        helpers.next(function() {
          expect(button._getIconElement().classList.contains('coral3-Icon--sizeL')).to.be.true;
          done();
        });
      });

      it('should be set with an attribute', function(done) {
        var button = new Coral.Button();

        button.icon = 'add';

        button.setAttribute('iconsize', Coral.Icon.size.LARGE);
        expect(button.iconSize).to.equal(Coral.Icon.size.LARGE);

        helpers.next(function() {
          expect(button.hasAttribute('iconsize', 'L')).to.be.true;
          expect(button._getIconElement().size).to.equal(Coral.Icon.size.LARGE);
          done();
        });
      });

      it('should discard values not part of the enum', function() {
        var button = new Coral.Button();

        // this value will be accepted
        button.iconSize = 'XS';
        // all these will be discarded
        button.iconSize = 'megalarge';
        button.iconSize = null;
        button.iconSize = -1;
        expect(button.iconSize).to.equal(Coral.Icon.size.EXTRA_SMALL);
      });

      it('should discard unknonwn attribute', function() {
        var button = new Coral.Button();

        button.setAttribute('size', 'megalarge');
        expect(button.iconSize).to.equal(Coral.Icon.size.SMALL);
      });

      it('should keep the size after the icon is changed', function(done) {
        var button = new Coral.Button();

        button.icon = 'add';
        button.iconSize = 'L';

        expect(button._getIconElement().icon).to.equal('add');
        expect(button._getIconElement().size).to.equal('L');

        button.icon = 'delete';

        expect(button.icon).to.equal('delete');
        expect(button.iconSize).to.equal('L');
        expect(button._getIconElement().size).to.equal('L');
        expect(button._getIconElement().icon).to.equal('delete');

        helpers.next(function() {
          expect(button._getIconElement().classList.contains('coral3-Icon--sizeL')).to.be.true;
          done();
        });
      });
    });

    describe('#iconPosition', function() {
      it('should default to left', function() {
        var button = new Coral.Button();
        expect(button.iconPosition).to.equal(Coral.Button.iconPosition.LEFT);
      });
    });

    describe('#selected', function() {

      it('should default to false', function() {
        var button = new Coral.Button();

        expect(button.selected).to.be.false;
        expect(button.classList.contains('is-selected')).to.be.false;
        expect(button.hasAttribute('selected')).to.be.false;
      });

      it('should be settable', function(done) {
        var button = new Coral.Button();

        button.selected = true;

        expect(button.selected).to.be.true;

        expect(button.hasAttribute('selected')).to.be.true;

        // we wait for the sync to kick in
        helpers.next(function() {
          expect(button.classList.contains('is-selected')).to.be.true;

          done();
        });
      });
    });

    describe('#trackingElement', function() {
      it('should default to empty string', function() {
        var button = new Coral.Button();
        expect(button.trackingElement).to.equal('');
        expect(button.label.textContent).to.equal('');
        expect(button.icon).to.equal('');
      });

      it('should default to the content when available', function() {
        var button = new Coral.Button();

        button.label.textContent = 'My button';
        expect(button.trackingElement).to.equal('My button');

        button.label.textContent = '  My content   with spaces';
        expect(button.trackingElement).to.equal('My content with spaces');

        button.trackingElement = 'create';

        expect(button.trackingElement).to.equal('create', 'Respects the user set value when available');
      });

      it('should strip the html out of the content', function() {
        var button = new Coral.Button();

        button.label.innerHTML = 'My <b>b</b>utton';
        expect(button.trackingElement).to.equal('My button');
      });

      it('should default to the icon when there is no content', function() {
        var button = new Coral.Button();
        button.icon = 'add';

        expect(button.trackingElement).to.equal('add');
      });
    });
  });

  describe('Tracking', function() {
    var trackerFnSpy;

    beforeEach(function() {
      trackerFnSpy = sinon.spy();
      Coral.tracking.addListener(trackerFnSpy);
    });

    afterEach(function() {
      Coral.tracking.removeListener(trackerFnSpy);
    });


    it('should have tracking enabled by default at component level', function() {
      var button = new Coral.Button();
      helpers.target.appendChild(button);

      expect(button.tracking).to.equal(Coral.Component.tracking.ON, 'Tracking should be enabled by default.');
    });

    it('should call the tracker callback fn when a click is triggered', function() {
      var button = new Coral.Button();
      helpers.target.appendChild(button);
      button.click();

      expect(trackerFnSpy.callCount).to.equal(1, 'Track event should be called once.');
    });

    it('should call the tracker callback fn with at least four parameters: trackData, event, component, childComponent', function() {
      var button = new Coral.Button();
      helpers.target.appendChild(button);
      button.click();

      var spyCall = trackerFnSpy.getCall(0);
      expect(spyCall.args.length).to.equal(4);
      var trackData = spyCall.args[0];
      expect(trackData).to.have.property('targetType');
      expect(trackData).to.have.property('eventType');
      expect(trackData).to.have.property('rootElement');
      expect(trackData).to.have.property('rootFeature');
      expect(trackData).to.have.property('rootType');
      expect(spyCall.args[1]).to.be.an.instanceof(MouseEvent);
      expect(spyCall.args[2]).to.be.an.instanceof(Coral.Button);
    });

    it('should call the tracker callback fn with custom trackData properties: trackingfeature and trackingelement', function() {
      var button = new Coral.Button();
      button.setAttribute('trackingfeature', 'sites');
      button.setAttribute('trackingelement', 'rail toggle');
      helpers.target.appendChild(button);
      button.click();

      var spyCall = trackerFnSpy.getCall(0);
      var trackData = spyCall.args[0];
      expect(trackData).to.have.property('rootFeature', 'sites');
      expect(trackData).to.have.property('rootElement', 'rail toggle');
    });

    it('should not call the tracker callback fn when component has tracking=off attribute', function() {
      var button = new Coral.Button();
      button.setAttribute('tracking', Coral.Component.tracking.OFF);
      helpers.target.appendChild(button);
      button.click();

      expect(trackerFnSpy.callCount).to.equal(0, 'Tracking was performed while being disabled.');
    });

    it('should not call the tracker callback fn when component tracking=off', function() {
      var button = new Coral.Button();
      helpers.target.appendChild(button);
      button.tracking = Coral.Component.tracking.OFF;
      button.click();

      expect(trackerFnSpy.callCount).to.equal(0, 'Tracking was performed while being disabled.');
    });

    it('should fallback to the default trackingElement when not specified', function(done) {
      helpers.build('<button is="coral-button" icon="add" size"L" trackingfeature="feature name">Button contents</button>', function(el) {
        el.click();

        expect(trackerFnSpy.callCount).to.equal(1, 'Track event should have been called once.');

        var spyCall = trackerFnSpy.getCall(0);
        expect(spyCall.args.length).to.equal(4);
        var trackData = spyCall.args[0];
        expect(trackData).to.have.property('targetType', 'button');
        expect(trackData).to.have.property('eventType', 'click');
        expect(trackData).to.have.property('rootElement', 'Button contents');
        expect(trackData).to.have.property('rootFeature', 'feature name');
        expect(trackData).to.have.property('rootType', 'button');
        expect(spyCall.args[1]).to.be.an.instanceof(MouseEvent);
        expect(spyCall.args[2]).to.be.an.instanceof(Coral.Button);
        done();
      });
    });

    it('should fallback to the icon property when trackingElement is not specified', function(done) {
      helpers.build('<button is="coral-button" icon="add" size"L" trackingfeature="feature name"></button>', function(el) {
        el.click();
        var spyCall = trackerFnSpy.getCall(0);

        var trackData = spyCall.args[0];
        expect(trackData).to.have.property('targetType', 'button');
        expect(trackData).to.have.property('eventType', 'click');
        expect(trackData).to.have.property('rootElement', 'add');
        expect(trackData).to.have.property('rootFeature', 'feature name');
        expect(trackData).to.have.property('rootType', 'button');
        expect(spyCall.args[1]).to.be.an.instanceof(MouseEvent);
        expect(spyCall.args[2]).to.be.an.instanceof(Coral.Button);
        done();
      });
    });

    it('should fallback empty string when the button has an invalid label', function(done) {
      var button = new Coral.Button();
      button.label = undefined;
      button.click();

      var spyCall = trackerFnSpy.getCall(0);

      var trackData = spyCall.args[0];
      expect(trackData).to.have.property('targetElement', '');
      expect(trackData).to.have.property('targetType', 'button');
      expect(trackData).to.have.property('eventType', 'click');
      expect(trackData).to.have.property('rootElement', '');
      expect(trackData).to.have.property('rootFeature', '');
      expect(trackData).to.have.property('rootType', 'button');
      expect(spyCall.args[1]).to.be.an.instanceof(MouseEvent);
      expect(spyCall.args[2]).to.be.an.instanceof(Coral.Button);
      done();
    });
  });
});
