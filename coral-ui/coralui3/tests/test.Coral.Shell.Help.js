describe('Coral.Shell.Help', function() {
  'use strict';

  var htmlSnippet = '<coral-shell-help></coral-shell-help>';

  describe('Namespace', function() {
    it('should be defined in the Coral.Shell namespace', function() {
      expect(Coral.Shell).to.have.property('Help');
    });
  });

  describe('Instantiation', function() {
    it('should support creation from markup', function(done) {
      helpers.build(htmlSnippet, function(el) {
        expect(el instanceof Coral.Shell.Help).to.equal(true);
        done();
      });
    });

    it('should support creation from js', function() {
      var help = new Coral.Shell.Help();
      expect(help instanceof Coral.Shell.Help).to.equal(true);
    });

    it('should create a help component with predefined items', function(done) {
      helpers.build(window.__html__['Coral.Shell.Help.html'], function(el) {
        expect(el.items.length).to.equal(6);
        done();
      });
    });
  });

  describe('API', function() {
    describe('#items', function() {
      it('should return the Help Menu items', function(done) {
        helpers.build(htmlSnippet, function(el) {
          expect(el.items instanceof Coral.Collection).to.equal(true);
          done();
        });
      });

      it('Setting Help Menu items should have no effect', function(done) {
        helpers.build(htmlSnippet, function(el) {
          var items = el.items;

          el.items = new Coral.Collection();
          expect(el.items).to.equal(items);
          done();
        });
      });
    });

    describe('#placeholder', function() {
      it('should have a placeholder attribute', function(done) {
        helpers.build(htmlSnippet, function(el) {
          expect(el.placeholder).to.equal('Search for Help');
          done();
        });
      });

      it('should have a placeholder attribute initialized with the correct value', function(done) {
        helpers.build('<coral-shell-help placeholder="placeholder"></coral-shell-help>', function(el) {
          expect(el.placeholder).to.equal('placeholder');
          done();
        });
      });
    });
  });

  describe('Markup', function() {
    describe('#showError()', function() {
      it('should display an Error Message on "showError" function call', function(done) {
        helpers.build(htmlSnippet, function(el) {
          var resultMessage = el._elements.resultMessage;
          var expectedResultMessage = Coral.templates.Shell.helpSearchError().querySelector('.coral3-Shell-help-resultMessage-heading').textContent;

          el.showError();
          expect(el._elements.resultMessage.hidden).to.equal(false);
          expect(resultMessage.querySelector('.coral3-Shell-help-resultMessage-heading').textContent).to.equal(expectedResultMessage);
          done();
        });
      });
    });

    describe('#showResults()', function() {
      it('should show search results on "showResults" function call', function(done) {
        var resultItems = [
          {
            'tags': [
              'Marketing Cloud',
              'Analytics',
              'Target'
            ],
            'title': 'Customer Attributes',
            'href': 'https://marketing.adobe.com/resources/help/en_US/mcloud/attributes.html'
          },
          {
            'tags': [
              'Marketing Cloud'
            ],
            'title': 'About data file and data sources for customer attributes',
            'href': 'https://marketing.adobe.com/resources/help/en_US/mcloud/crs_data_file.html'
          }
        ];

        var total = 1111;
        var allResultsURL = 'http://coralui.corp.adobe.com';

        helpers.build(htmlSnippet, function(el) {
          el.showResults(resultItems, total, allResultsURL);

          expect(el._elements.results.hidden).to.equal(false);
          expect(el._elements.results.lastChild.target).to.equal('_blank');
          done();
        });
      });

      it('should display a "no results message" on "showResults" function call with an array and total = 0', function(done) {
        helpers.build(htmlSnippet, function(el) {
          el.showResults([], 0);
          var resultMessage = el._elements.resultMessage;
          var expectedResultMessage = Coral.templates.Shell.noHelpResults().querySelector('.coral3-Shell-help-resultMessage-heading').textContent;

          expect(el._elements.resultMessage.hidden).to.equal(false);
          expect(resultMessage.querySelector('.coral3-Shell-help-resultMessage-heading').textContent).to.equal(expectedResultMessage);
          done();
        });
      });
    });
  });

  describe('User Interaction', function() {
    describe('search', function() {
      it('should perform a search', function(done) {
        var searchSpy = sinon.spy();

        helpers.build(window.__html__['Coral.Shell.Help.html'], function(el) {
          var search = el.querySelector('coral-search');
          el.on('coral-shell-help:search', searchSpy);
          search.value = 'customer';

          helpers.next(function() {
            search.trigger('coral-search:submit');
            helpers.next(function() {
              expect(searchSpy.called).to.equal(true);
              expect(searchSpy.args[0][0].detail.value).to.equal('customer');
              expect(el._elements.loading.hidden).to.equal(false);
              done();
            });
          });
        });
      });

      it('it should clear loading spinner on clear button click', function(done) {
        helpers.build(window.__html__['Coral.Shell.Help.html'], function(el) {
          var search = el.querySelector('coral-search');

          search.value = 'customer';
          helpers.next(function() {
            search.querySelector('[handle=clearButton]').click();
            helpers.next(function() {
              expect(el._elements.loading.hidden).to.equal(true);
              done();
            });
          });
        });
      });
    });
  });
});
