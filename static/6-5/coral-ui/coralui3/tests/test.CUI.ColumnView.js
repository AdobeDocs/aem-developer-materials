describe("CUI.ColumnView", function() {

  beforeEach(function() {
    $.fx.off = true; // turn off jQuery animations to ease testing
  });

  afterEach(function() {
    $.fx.off = false;
  });

  var testData = {
    "_links": {
      "self": { "href": "base/build/tests/fixtures/data.CUI.ColumnView.json", "title": "Data" }
    },
    "_embedded": {
      "items": [{
        "_links": {
          "self": {
            "href": "base/build/tests/fixtures/data.CUI.ColumnView.json",
            "title": "More Data"
          }
        },
        "icon": "folder",
        "hasChildren": true
      },{
        "_links": {
          "self": {
            "href": "embedded.json",
            "title": "Embedded Data"
          }
        },
        "_embedded": {
          "items": [
            {
              "_links": {
                "self": {
                  "href": "base/build/tests/fixtures/data.CUI.ColumnView.json",
                  "title": "Data"
                }
              },
              "icon": "folder",
              "hasChildren": true
            },{
              "_links": {
                "self": {
                  "href": "base/build/tests/fixtures/data.CUI.ColumnView.json",
                  "title": "Data"
                }
              },
              "icon": "folder",
              "hasChildren": true
            },{
              "_links": {
                "self": {
                  "href": "base/build/tests/fixtures/data.CUI.ColumnView.json",
                  "title": "Data"
                }
              },
              "icon": "folder",
              "hasChildren": true
            }
          ]
        },
        "icon": "folder",
        "hasChildren": true
      },{
        "_links": {
          "self": {
            "href": "base/build/tests/fixtures/data.CUI.ColumnView.json",
            "title": "File Data"
          }
        },
        "icon": "file"
      },{
        "_links": {
          "self": {
            "href": "base/build/tests/fixtures/data.CUI.ColumnView.json",
            "title": "Thumbnail Data"
          }
        },
        "image": "images/previews/preview-small.png"
      }]
    }
  };

  describe("definition", function() {
    it("should be defined in the CUI namespace", function() {
      expect(CUI).to.have.property("ColumnView");
    });
    it("should be defined on jQuery object", function() {
      var div = $("<div/>");
      expect(div).to.have.property("columnView");
    });
  });

  describe("functionality", function() {
    it("should create its own markup", function() {
      var div = $("<div/>").columnView();
      expect(div).to.have.class("coral-ColumnView");
    });
    it("should select items when they are clicked", function() {
      var div = $("<div/>").columnView();
      var columnView = div.data('columnView');

      columnView.setData(testData, true);
      var item = div.find(".coral-ColumnView-item").eq(1);
      item.click();

      expect(item).to.have.class("is-active");
      expect(item).to.not.have.class("is-selected");

      var secondItem = div.find(".coral-ColumnView-item").eq(2);
      secondItem.click();

      expect(item).to.not.have.class("is-active");
      expect(item).to.not.have.class("is-selected");
      expect(secondItem).to.have.class("is-active");
      expect(secondItem).to.not.have.class("is-selected");
    });
    it("should deselect items when they are reclicked", function() {
      var div = $("<div/>").columnView();
      var columnView = div.data('columnView');

      columnView.setData(testData, true);
      var item = div.find(".coral-ColumnView-item").eq(1);
      item.click();

      expect(item).to.have.class("is-active");
      expect(item).to.not.have.class("is-selected");

      item.click();

      expect(item).to.not.have.class("is-active");
      expect(item).to.not.have.class("is-selected");
    });
    it("should remove content from childColumns if item is deselected (clicked twice) ", function() {
      var div = $("<div/>").columnView();
      var columnView = div.data('columnView');

      columnView.setData(testData, true);
      var item = div.find(".coral-ColumnView-item").eq(1);

      //after first click the second column should be filled with content
      item.click();
      expect($(div.find('.coral-ColumnView-column')[1]).html().length > 0).to.be.true;

       //after second click the second column should not have data no more
      item.click();
      expect($(div.find('.coral-ColumnView-column')[1]).html().length === 0).to.be.true;

      //after third click the second column should be filled with content again
      item.click();
      expect($(div.find('.coral-ColumnView-column')[1]).html().length > 0).to.be.true;

    });
    it("should check items when their icons are clicked", function() {
      var div = $("<div/>").columnView({multiselect: true});
      var columnView = div.data('columnView');

      expect(div).to.have.class("coral-ColumnView--multiselect");

      columnView.setData(testData, true);
      var item = div.find(".coral-ColumnView-item").eq(1);
      item.find(".coral-ColumnView-icon").click();

      expect(item).to.have.class("is-active");
      expect(item).to.have.class("is-selected");

      var secondItem = div.find(".coral-ColumnView-item").eq(2);
      secondItem.find(".coral-ColumnView-icon").click();

      expect(item).to.have.class("is-active");
      expect(item).to.have.class("is-selected");
      expect(secondItem).to.have.class("is-active");
      expect(secondItem).to.have.class("is-selected");
    });
    it("should support single column mode", function() {
      var div = $("<div/>").columnView({single: true});

      expect(div).to.have.class("coral-ColumnView--single");
    });
    it("should load the next column", function(done) {
      var div = $("<div/>").columnView();
      var columnView = div.data('columnView');

      columnView.setSource("base/build/tests/fixtures/content.CUI.ColumnView.json").done(function() {
        $(document).ajaxComplete(function(event, request) {
          setTimeout(function() {
            try {
              var newColumn = div.find(".coral-ColumnView-column:eq(1)");

              expect(newColumn.length).to.equal(1);
              expect(newColumn.find(".coral-ColumnView-item").length).to.equal(3);
              done();
            } catch (e) {
              done(e);
            }
          }, 60);
        });
        div.find(".coral-ColumnView-item:eq(2)").click();
      }).fail(function() {
        done("could not load content.CUI.ColumnView.json");
      });
    });
    it("should not load the next column if the data is already available", function() {
      var div = $("<div/>").columnView();
      var columnView = div.data('columnView');

      columnView.setData(testData, true);
      div.find(".coral-ColumnView-item:eq(1)").click();

      var newColumn = div.find(".coral-ColumnView-column:eq(1)");

      expect(newColumn.length).to.equal(1);
      expect(newColumn.find(".coral-ColumnView-item").length).to.equal(3);
    });
    it("should load more items when the column is scrolled", function(done) {
      var div = $("<div/>").columnView();
      var columnView = div.data('columnView');

      columnView.setSource("base/build/tests/fixtures/content.CUI.ColumnView.json").done(function() {
        try {
          var items = div.find(".coral-ColumnView-item");
          expect(items.length).to.equal(3);

          div.find(".coral-ColumnView-column-content").scrollTop(999).scroll();

          setTimeout(function() {
            try {
              items = div.find(".coral-ColumnView-item");
              expect(items.length).to.equal(7);
              done();
            } catch (e) {
              done(e);
            }
          }, 100);
        } catch (e) {
          done(e);
        }
      }).fail(function() {
        done("could not load content.CUI.ColumnView.json");
      });
    });
  });

  var testRenderOfTestData = function(div) {
    var items = div.find(".coral-ColumnView-item");
    expect(items.length).to.equal(4);

    // test labels
    expect(items.eq(0)).to.have.text("More Data");
    expect(items.eq(1)).to.have.text("Embedded Data");
    expect(items.eq(2)).to.have.text("File Data");
    expect(items.eq(3)).to.have.text("Thumbnail Data");

    // test icons
    expect(items.eq(0).find(".coral-Icon--folder").length).not.to.equal(0);
    expect(items.eq(1).find(".coral-Icon--folder").length).not.to.equal(0);
    expect(items.eq(2).find(".coral-Icon--file").length).not.to.equal(0);
    expect(items.eq(3).find("img")).to.have.attr("src", "images/previews/preview-small.png");

    // test hasChildren class
    expect(items.eq(0)).to.have.class("coral-ColumnView-item--hasChildren");
    expect(items.eq(1)).to.have.class("coral-ColumnView-item--hasChildren");
    expect(items.eq(2)).to.not.have.class("coral-ColumnView-item--hasChildren");
    expect(items.eq(3)).to.not.have.class("coral-ColumnView-item--hasChildren");

    // test data
    expect(items.eq(0)).to.have.data('href', 'base/build/tests/fixtures/data.CUI.ColumnView.json');
    expect(items.eq(0).data('data')).to.deep.equal(testData._embedded.items[0]);
    expect(items.eq(1)).to.have.data('href', 'embedded.json');
    expect(items.eq(1).data('data')).to.deep.equal(testData._embedded.items[1]);
    expect(items.eq(2)).to.have.data('href', 'base/build/tests/fixtures/data.CUI.ColumnView.json');
    expect(items.eq(2).data('data')).to.deep.equal(testData._embedded.items[2]);
    expect(items.eq(3)).to.have.data('href', 'base/build/tests/fixtures/data.CUI.ColumnView.json');
    expect(items.eq(3).data('data')).to.deep.equal(testData._embedded.items[3]);
  };

  describe("api", function() {
    it("should support setData", function() {
      var div = $("<div/>").columnView();
      var columnView = div.data('columnView');

      columnView.setData(testData, true);
      testRenderOfTestData(div);
    });

    it("should support setSource", function(done) {
      var div = $("<div/>").columnView();
      var columnView = div.data('columnView');

      columnView.setSource("base/build/tests/fixtures/data.CUI.ColumnView.json").done(function() {
        try {
          testRenderOfTestData(div);
          done();
        } catch (e) {
          done(e);
        }
      }).fail(function() {
        done("could not load data.CUI.ColumnView.json");
      });
    });

    it("should return selected items", function() {
      var div = $("<div/>").columnView({multiselect: true});
      var columnView = div.data('columnView');

      columnView.setData(testData, true);

      var items = div.find(".coral-ColumnView-item");

      items.eq(1).click();
      var selected = columnView.getSelectedItems();
      expect(selected.length).to.equal(1);
      expect(selected[0].checked).to.be.false;
      expect(selected[0].data).to.equal(testData._embedded.items[1]);

      items.eq(2).click();
      selected = columnView.getSelectedItems();
      expect(selected.length).to.equal(1);
      expect(selected[0].checked).to.be.false;
      expect(selected[0].data).to.equal(testData._embedded.items[2]);

      items.eq(3).find(".coral-ColumnView-icon").click();
      selected = columnView.getSelectedItems();
      expect(selected.length).to.equal(2);
      expect(selected[0].checked).to.be.true;
      expect(selected[1].checked).to.be.true;
      expect(selected[0].data).to.equal(testData._embedded.items[2]);
      expect(selected[1].data).to.equal(testData._embedded.items[3]);
    });

    it("should return breadcrumb items", function() {
      var div = $("<div/>").columnView();
      var columnView = div.data('columnView');

      columnView.setData(testData, true);

      for (var i=0; i < 5; i++) {
        div.find(".coral-ColumnView-column").eq(i).find(".coral-ColumnView-item").eq(0).click();
      }

      var breadcrumbs = columnView.getBreadcrumbItems();

      expect(breadcrumbs.length).to.equal(4);

      for (i=0; i < 4; i++) {
        expect(breadcrumbs[i].checked).to.be.false;
        expect(breadcrumbs[i].data).to.deep.equal(testData._embedded.items[0]);
      }
    });

    it("should return the target column", function() {
      var div = $("<div/>").columnView({multiselect: true});
      var columnView = div.data('columnView');

      columnView.setData(testData, true);

      for (var i=0; i < 5; i++) {
        div.find(".coral-ColumnView-column").eq(i).find(".coral-ColumnView-item").eq(0).click();
      }
      div.find(".coral-ColumnView-column").eq(3).find(".coral-ColumnView-item").eq(1).click();

      var target = columnView.getTargetColumn();

      expect(target).to.deep.equal(testData._embedded.items[1]);

      div.find(".coral-ColumnView-column").eq(4).find(".coral-ColumnView-icon").click();

      target = columnView.getTargetColumn();

      expect(target).to.deep.equal(testData._embedded.items[1]);
    });

    it("should set the next column", function() {
      var div = $("<div/>").columnView();
      var columnView = div.data('columnView');

      columnView.setData(testData, false);

      var columns = div.find(".coral-ColumnView-column");
      expect(columns.length).to.equal(0);

      columnView.setNextColumn("base/build/tests/fixtures/data.CUI.ColumnView.json");

      columns = div.find(".coral-ColumnView-column");
      expect(columns.length).to.equal(1);
      expect(columns.eq(0).data('data')).to.deep.equal(testData);
    });

    it("should set the previous column", function() {
      var div = $("<div/>").columnView();
      var columnView = div.data('columnView');

      columnView.setData(testData, true);

      columnView.setPreviousColumn("embedded.json");

      var columns = div.find(".coral-ColumnView-column");
      expect(columns.length).to.equal(2);
      expect(columns.eq(0).data('data')).to.deep.equal(testData._embedded.items[1]);
    });

    it("should render a column", function() {
      var div = $("<div/>").columnView();
      var columnView = div.data('columnView');

      columnView.setData(testData, false);

      var $column = columnView.renderColumn("embedded.json");

      expect($column).to.exist;
      var $content = $column.children(".coral-ColumnView-column-content");
      expect($content.length).to.equal(1);
      expect($content.find(".coral-ColumnView-item").length).to.equal(3);
    });

    describe("#renderItem()", function() {
      it("should render an item with icon and children", function() {
        var div = $("<div/>").columnView();
        var columnView = div.data('columnView');

        var $item = columnView.renderItem(testData._embedded.items[0]);

        expect($item).to.exist;
        expect($item).to.have.class("coral-ColumnView-item--hasChildren");

        var $icon = $item.find(".coral-ColumnView-icon");
        expect($icon).to.exist;
        expect($icon.find(".coral-Icon--folder").length).not.to.equal(0);

        var $label = $item.find(".coral-ColumnView-label");
        expect($label).to.exist;
        expect($label).to.have.text(testData._embedded.items[0]._links.self.title);
      });

      it("should render an item with preview and no children", function() {
        var div = $("<div/>").columnView();
        var columnView = div.data('columnView');

        var $item = columnView.renderItem(testData._embedded.items[3]);

        expect($item).to.exist;
        expect($item).to.not.have.class("coral-ColumnView-item--hasChildren");

        var $icon = $item.find(".coral-ColumnView-icon");
        expect($icon).to.exist;
        expect($icon.find("img")).to.have.attr("src", testData._embedded.items[3].image);

        var $label = $item.find(".coral-ColumnView-label");
        expect($label).to.exist;
        expect($label).to.have.text(testData._embedded.items[3]._links.self.title);
      });
    });

    describe("#renderPreview()", function() {
      it("should render a preview with an icon", function() {
        var div = $("<div/>").columnView();
        var columnView = div.data('columnView');

        var $preview = $("<div/>").append(columnView.renderPreview({
          "properties": [
            {"label": "simple label", "value": "simple value"},
            {"label": "icon label", "icon": "check", "value": "icon value"}
          ],
          "preview": {
            "icon": "file"
          }
        }));

        expect($preview).to.exist;

        var $icon = $preview.find(".coral-ColumnView-preview-icon");
        expect($icon).to.exist;
        expect($icon.find(".coral-Icon--file").length).not.to.equal(0);

        var $labels = $preview.find(".coral-ColumnView-preview-label");
        expect($labels.length).to.equal(2);
        expect($labels.eq(0)).to.have.text("simple label");
        expect($labels.eq(1)).to.have.text("icon label");

        var $values = $preview.find(".coral-ColumnView-preview-value");
        expect($values.length).to.equal(2);
        expect($values.eq(0)).to.have.text("simple value");
        expect($values.eq(0).find(".coral-Icon").length).to.equal(0);
        expect($values.eq(1)).to.have.text("icon value");
        expect($values.eq(1).find(".coral-Icon--check").length).not.to.equal(0);
      });
      it("should render a preview with an image", function() {
        var div = $("<div/>").columnView();
        var columnView = div.data('columnView');

        var $preview = $("<div/>").append(columnView.renderPreview({
          "properties": [
            {"label": "simple label", "value": "simple value"},
            {"label": "icon label", "icon": "check", "value": "icon value"}
          ],
          "preview": {
            "image": "images/previews/preview8.png"
          }
        }));

        expect($preview).to.exist;

        var $icon = $preview.find(".coral-ColumnView-preview-icon");
        expect($icon).to.exist;
        expect($icon.find("img")).to.have.attr("src", "images/previews/preview8.png");

        var $labels = $preview.find(".coral-ColumnView-preview-label");
        expect($labels.length).to.equal(2);
        expect($labels.eq(0)).to.have.text("simple label");
        expect($labels.eq(1)).to.have.text("icon label");

        var $values = $preview.find(".coral-ColumnView-preview-value");
        expect($values.length).to.equal(2);
        expect($values.eq(0)).to.have.text("simple value");
        expect($values.eq(0).find(".coral-Icon").length).to.equal(0);
        expect($values.eq(1)).to.have.text("icon value");
        expect($values.eq(1).find(".coral-Icon--check").length).not.to.equal(0);
      });
    });

    describe("navigation", function() {

      var createItemFinder = function(hrefs) {
        var index = 0;
        return function(data, $column) {
          var href = hrefs[index];
          if (href) {
            var item = $.grep(data._embedded.items, function(item) {
              return item._links.self.href === href;
            })[0];
            if (item) index++;
            return item;
          } else {
            return false;
          }
        };
      };

      it("should navigate with pre-loaded data", function(done) {
        var div = $("<div/>").columnView();
        var columnView = div.data('columnView');

        columnView.setData(testData, true);

        columnView.navigate(createItemFinder([
          "base/build/tests/fixtures/data.CUI.ColumnView.json",
          "base/build/tests/fixtures/data.CUI.ColumnView.json",
          "embedded.json"
        ])).done(function() {
          try {
            expect(div.children().length).to.equal(4);
            expect(div.children().eq(0).find(".is-active").index()).to.equal(0);
            expect(div.children().eq(1).find(".is-active").index()).to.equal(0);
            expect(div.children().eq(2).find(".is-active").index()).to.equal(1);
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("should load more data when needed", function(done) {
        var div = $("<div/>").columnView();
        var columnView = div.data('columnView');

        columnView.setSource("base/build/tests/fixtures/content.CUI.ColumnView.json").done(function() {
          columnView.navigate(createItemFinder([
            "embedded.json",
            "base/build/tests/fixtures/data.CUI.ColumnView.json"
          ])).done(function() {
            try {
              expect(div.children().length).to.equal(3);
              expect(div.children().eq(0).find(".is-active").index()).to.equal(4);
              expect(div.children().eq(1).find(".is-active").index()).to.equal(0);
              done();
            } catch (e) {
              done(e);
            }
          });
        });
      });

      it("should support starting from a specified column", function(done) {
        var div = $("<div/>").columnView();
        var columnView = div.data('columnView');

        columnView.setSource("base/build/tests/fixtures/content.CUI.ColumnView.json").done(function() {
          div.find(".coral-ColumnView-item:eq(2)").click();
          columnView.navigate(createItemFinder(["embedded.json"]), div.find(".coral-ColumnView-column:eq(1)")).done(function() {
            try {
              expect(div.children().length).to.equal(3);
              expect(div.children().eq(1).find(".is-active").index()).to.equal(4);
              done();
            } catch (e) {
              done(e);
            }
          });
        });
      });

      it("should cancel all navigation", function(done) {
        var div = $("<div/>").columnView();
        var columnView = div.data('columnView');

        columnView.setSource("base/build/tests/fixtures/content.CUI.ColumnView.json").done(function() {
          columnView.navigate(createItemFinder([
            "embedded.json",
            "base/build/tests/fixtures/data.CUI.ColumnView.json"
          ])).fail(function() {
            try {
              expect(div.children().length).to.equal(1);
              done();
            } catch (e) {
              done(e);
            }
          });
          columnView.cancelNavigation();
        });
      });

      it("should cancel a specific request", function(done) {
        var div = $("<div/>").columnView();
        var columnView = div.data('columnView');

        columnView.setSource("base/build/tests/fixtures/content.CUI.ColumnView.json").done(function() {
          var deferred = columnView.navigate(createItemFinder([
            "embedded.json",
            "base/build/tests/fixtures/data.CUI.ColumnView.json"
          ])).fail(function() {
            try {
              expect(div.children().length).to.equal(1);
              done();
            } catch (e) {
              done(e);
            }
          });
          try {
            expect(deferred.navigationId).to.be.a('number');
          } catch (e) {
            done(e);
          }
          columnView.cancelNavigation(deferred.navigationId);
        });
      });
    });

    describe("#addItem()", function() {
      it("should add an item by data", function() {
        var div = $("<div/>").columnView();
        var columnView = div.data('columnView');

        columnView.setData(testData, true);
        columnView.addItem({
          "_links": {
            "self": {
              "href": "#nothing-here",
              "title": "Added Item"
            }
          },
          "icon": "folder",
          "hasChildren": true
        }, "base/build/tests/fixtures/data.CUI.ColumnView.json");

        expect(div.find(".coral-ColumnView-item").length).to.equal(5);

        var $item = div.find(".coral-ColumnView-item:eq(4)");
        expect($item).to.have.data("href", "#nothing-here");
        expect($item).to.have.class("coral-ColumnView-item--hasChildren");

        var $icon = $item.find(".coral-ColumnView-icon");
        expect($icon).to.exist;
        expect($icon.find(".coral-Icon--folder").length).not.to.equal(0);

        var $label = $item.find(".coral-ColumnView-label");
        expect($label).to.exist;
        expect($label).to.have.text("Added Item");
      });

      it("should add an item by jQuery object", function() {
        var div = $("<div/>").columnView();
        var columnView = div.data('columnView');

        columnView.setData(testData, true);

        columnView.addItem($("<span/>").text("Added Item"), div.children().eq(0));

        expect(div.find(".coral-ColumnView-column-content:eq(0)").children().length).to.equal(5);

        var $item = div.find(".coral-ColumnView-column-content:eq(0)").children().eq(4);
        expect($item[0].tagName).to.equal("SPAN");
        expect($item).to.have.text("Added Item");
      });

      it("should add an item to a different column", function() {
        var div = $("<div/>").columnView();
        var columnView = div.data('columnView');

        columnView.setData(testData, true);
        div.children().eq(0).find(".coral-ColumnView-item:eq(1)").click();
        div.children().eq(1).find(".coral-ColumnView-item:eq(2)").click();

        columnView.addItem($("<span>Added Item</span>"), "embedded.json");

        expect(div.children().eq(1).children().children().length).to.equal(4);
        var $item = div.children().eq(1).children().children().eq(3);
        expect($item[0].tagName).to.equal("SPAN");
        expect($item).to.have.text("Added Item");

        columnView.addItem({
          "_links": {
            "self": {
              "href": "#nothing-here",
              "title": "Added Item"
            }
          },
          "icon": "folder",
          "hasChildren": true
        }, div.children().eq(2));

        expect(div.children().eq(2).find(".coral-ColumnView-item").length).to.equal(5);

        $item = div.children().eq(2).find(".coral-ColumnView-item:eq(4)");
        expect($item).to.have.data("href", "#nothing-here");
        expect($item).to.have.class("coral-ColumnView-item--hasChildren");

        var $icon = $item.find(".coral-ColumnView-icon");
        expect($icon).to.exist;
        expect($icon.find(".coral-Icon--folder").length).not.to.equal(0);

        var $label = $item.find(".coral-ColumnView-label");
        expect($label).to.exist;
        expect($label).to.have.text("Added Item");
      });

      it("should add an item at the beginning", function() {
        var div = $("<div/>").columnView();
        var columnView = div.data('columnView');

        columnView.setData(testData, true);
        div.children().eq(0).find(".coral-ColumnView-item:eq(1)").click();
        div.children().eq(1).find(".coral-ColumnView-item:eq(2)").click();

        columnView.addItem({
          "_links": {
            "self": {
              "href": "#nothing-here",
              "title": "Added Item"
            }
          },
          "icon": "folder",
          "hasChildren": true
        }, "embedded.json", 0);

        expect(div.children().eq(1).children().children().length).to.equal(4);
        var $item = div.children().eq(1).find(".coral-ColumnView-item:eq(0)");

        expect($item).to.have.data("href", "#nothing-here");
        expect($item).to.have.class("coral-ColumnView-item--hasChildren");

        var $icon = $item.find(".coral-ColumnView-icon");
        expect($icon).to.exist;
        expect($icon.find(".coral-Icon--folder").length).not.to.equal(0);

        var $label = $item.find(".coral-ColumnView-label");
        expect($label).to.exist;
        expect($label).to.have.text("Added Item");
      });

      it("should add an item in the middle", function() {
        var div = $("<div/>").columnView();
        var columnView = div.data('columnView');

        columnView.setData(testData, true);
        div.children().eq(0).find(".coral-ColumnView-item:eq(1)").click();
        div.children().eq(1).find(".coral-ColumnView-item:eq(2)").click();

        columnView.addItem({
          "_links": {
            "self": {
              "href": "#nothing-here",
              "title": "Added Item"
            }
          },
          "icon": "folder",
          "hasChildren": true
        }, "embedded.json", 2);

        expect(div.children().eq(1).children().children().length).to.equal(4);
        var $item = div.children().eq(1).find(".coral-ColumnView-item:eq(2)");

        expect($item).to.have.data("href", "#nothing-here");
        expect($item).to.have.class("coral-ColumnView-item--hasChildren");

        var $icon = $item.find(".coral-ColumnView-icon");
        expect($icon).to.exist;
        expect($icon.find(".coral-Icon--folder").length).not.to.equal(0);

        var $label = $item.find(".coral-ColumnView-label");
        expect($label).to.exist;
        expect($label).to.have.text("Added Item");
      });

      it("should add an item to the active column", function() {
        var div = $("<div/>").columnView();
        var columnView = div.data('columnView');

        columnView.setData(testData, true);
        div.children().eq(0).find(".coral-ColumnView-item:eq(1)").click();
        div.children().eq(1).find(".coral-ColumnView-item:eq(2)").click();

        columnView.addItem({
          "_links": {
            "self": {
              "href": "#nothing-here",
              "title": "Added Item"
            }
          },
          "icon": "folder",
          "hasChildren": true
        });

        expect(div.children().eq(1).children().children().length).to.equal(4);
        var $item = div.children().eq(1).find(".coral-ColumnView-item").last();

        expect($item).to.have.data("href", "#nothing-here");
        expect($item).to.have.class("coral-ColumnView-item--hasChildren");

        var $icon = $item.find(".coral-ColumnView-icon");
        expect($icon).to.exist;
        expect($icon.find(".coral-Icon--folder").length).not.to.equal(0);

        var $label = $item.find(".coral-ColumnView-label");
        expect($label).to.exist;
        expect($label).to.have.text("Added Item");
      });

    });

    it("should be destroyable", function() {
      var div = $("<div/>").columnView();
      var columnView = div.data('columnView');

      expect(columnView).to.exist;

      // calls the destroy method
      columnView.destroy();

      // object is not obtainable from the element
      expect(div.data('columnView')).not.to.exist;
      // inner data does not exist anymore
      expect(columnView._data).to.be.undefined;
      expect(columnView.$element).to.be.undefined;
      // markup is preserved
      expect(div).to.have.class('coral-ColumnView');
    });

  });

  describe("events", function() {
    it("should trigger coral-columnview-load", function(done) {
      var div = $("<div/>").columnView();
      var columnView = div.data('columnView');

      div.on('coral-columnview-load', function(event, href, data) {
        try {
          expect(event.type).to.equal("coral-columnview-load");
          expect(href).to.equal("base/build/tests/fixtures/data.CUI.ColumnView.json");
          expect(data).to.deep.equal(testData);
          done();
        } catch (e) {
          done(e);
        }
      });

      columnView.setSource("base/build/tests/fixtures/data.CUI.ColumnView.json");
    });

    it("should trigger coral-columnview-item-select on item click", function(done) {
      var div = $("<div/>").columnView();
      var columnView = div.data('columnView');

      columnView.setData(testData, true);

      var selectedItem = div.find(".coral-ColumnView-item:eq(1)");

      div.on('coral-columnview-item-select', function(event, data, item) {
        try {
          expect(event.type).to.equal("coral-columnview-item-select");
          expect(data).to.deep.equal(testData._embedded.items[1]);
          // should be a full coral-ColumnView-item
          expect(item.prop('outerHTML')).to.deep.equal(selectedItem.prop('outerHTML'));
          expect(item.data('href')).to.equal("embedded.json");
          done();
        } catch (e) {
          done(e);
        }
      });

      selectedItem.click();
    });

    it("should trigger coral-columnview-item-select on icon click", function(done) {
      var div = $("<div/>").columnView({multiselect: true});
      var columnView = div.data('columnView');

      columnView.setData(testData, true);

      var selectedItem = div.find(".coral-ColumnView-icon:eq(1)");

      div.on('coral-columnview-item-select', function(event, data, item) {
        try {
          expect(event.type).to.equal("coral-columnview-item-select");
          expect(data).to.deep.equal(testData._embedded.items[1]);
          // should be a full coral-ColumnView-item
          expect(item.prop('outerHTML')).to.deep.equal(selectedItem.closest('.coral-ColumnView-item').prop('outerHTML'));
          expect(item.data('href')).to.equal("embedded.json");
          done();
        } catch (e) {
          done(e);
        }
      });

      selectedItem.click();
    });
  });

});
