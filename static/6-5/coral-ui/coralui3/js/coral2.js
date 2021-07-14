(function ($) {

  var CLASS_ACTIVE = "is-active";

  CUI.Accordion = new Class(/** @lends CUI.Accordion# */{
    toString: 'Accordion',
    extend: CUI.Widget,

    /**
     @extends CUI.Widget
     @classdesc A widget for both accordions and collapsibles

     @desc Creates a new accordion or collapsible
     @constructs

     @param {Object} options                               Widget options.
     @param {Mixed}  [options.active=false]                Index of the initial active tab of the accordion or one of true/false for collapsibles
     @param {boolean} [options.disabled=false]             Set the disabled state of the widget.
     @param {String} [options.iconClassCollapsed="coral-Icon--chevronRight"]
     @param {String} [options.iconClassDisabled="coral-Icon--chevronDown"]
     */
    construct: function (options) {
      this._parseAttributes();
      this._setAccordion();
      this._setListeners();
      this._makeAccessible();
      this._updateDOMForDisabled();
    },

    defaults: {
      active: false,
      disabled: false,
      iconClassCollapsed: 'coral-Icon--chevronRight',
      iconClassExpanded: 'coral-Icon--chevronDown'
    },

    isAccordion: false,

    _parseAttributes: function () {
      var iconClassCollapsed = this.$element.attr('data-icon-class-collapsed');
      if (iconClassCollapsed) {
        this.options.iconClassCollapsed = iconClassCollapsed;
      }
      var iconClassExpanded = this.$element.attr('data-icon-class-expanded');
      if (iconClassExpanded) {
        this.options.iconClassExpanded = iconClassExpanded;
      }
    },

    _setAccordion: function () {
      var $element = this.$element;
      // determines the type of component that it is building
      this.isAccordion = (!$element.hasClass("coral-Collapsible")) && ($element.data("init") !== "collapsible");

      if (this.isAccordion) {
        // adds the required class
        $element.addClass("coral-Accordion");

        var activeIndex = $element.children("." + CLASS_ACTIVE).index();
        if (this.options.active !== false) {
          activeIndex = this.options.active;
        } else {
          // saves the element with the active class as the active element
          this.options.active = activeIndex;
        }
        $element.children().each(function (index, element) {
          this._initElement(element, index != activeIndex);
        }.bind(this));
      } else {

        // checks if the element has the active class.
        this.options.active = $element.hasClass(CLASS_ACTIVE);
        this._initElement($element, !this.options.active);
      }
    },

    _setListeners: function () {
      // header selector
      var selector = this.isAccordion ? '> .coral-Accordion-item > .coral-Accordion-header' : '> .coral-Collapsible-header';
      this.$element.on('click', selector, this._toggle.bind(this));

      this.$element.on("change:active", this._changeActive.bind(this));

      // Prevent text selection on header
      var selectstartSelector = this.isAccordion ? '.coral-Accordion-header' : '.coral-Collapsible-header';
      this.$element.on("selectstart", selectstartSelector, function (event) {
        event.preventDefault();
      });

      this.on('change:disabled', function (event) {
        this._updateDOMForDisabled();
      }.bind(this));
    },

    /**
     * Updates styles and attributes to match the current disabled option value.
     * @ignore */
    _updateDOMForDisabled: function () {
      if (this.options.disabled) {
        this.$element.addClass('is-disabled').attr('aria-disabled', true)
          .find('[role=tab], > [role=button]').removeAttr('tabindex').attr('aria-disabled', true);
      } else {
        this.$element.removeClass('is-disabled').attr('aria-disabled', false)
          .find('[role=tab], > [role=button]').each(function (index, element) {
            var elem = $(element);
            elem.removeAttr('aria-disabled').attr('tabindex', elem.is('[aria-selected=true][aria-controls], [aria-expanded][aria-controls]') ? 0 : -1);
          });
      }
    },

    _toggle: function (event) {
      if (this.options.disabled) {
        return;
      }
      var el = $(event.target).closest(this._getCollapsibleSelector()),
        isCurrentlyActive = el.hasClass(CLASS_ACTIVE),
        active = (isCurrentlyActive) ? false : ((this.isAccordion) ? el.index() : true);
      this.setActive(active);
    },
    _changeActive: function () {
      if (this.isAccordion) {
        this._collapse(this.$element.children("." + CLASS_ACTIVE));
        if (this.options.active !== false) {
          var activeElement = this.$element.children().eq(this.options.active);
          this._expand(activeElement);
        }
      } else {
        if (this.options.active) {
          this._expand(this.$element);
        } else {
          this._collapse(this.$element);
        }
      }
    },
    setActive: function (active) {
      if (active !== this.options.active) {
        this.options.active = active;
        this._changeActive();
      }
    },
    _initElement: function (element, collapse) {
      element = $(element);

      // Add correct header
      if (this._getHeaderElement(element).length === 0) this._prependHeaderElement(element);
      if (this._getHeaderIconElement(element).length === 0) this._prependHeaderIconElement(element);

      // adds the content class
      if (this._getContentElement(element).length === 0) this._prependContentElement(element);

      // adds the corresponding container class
      element.addClass(this.isAccordion ? 'coral-Accordion-item' : 'coral-Collapsible');

      var header = this._getHeaderElement(element),
        content = this._getContentElement(element),
        icon = this._getHeaderIconElement(element);

      // move the heading before the collapsible content
      header.prependTo(element);

      // Set correct initial state
      if (collapse) {
        element.removeClass(CLASS_ACTIVE);
        if (!icon.hasClass("coral-Icon")) {
          icon.addClass("coral-Icon coral-Icon--sizeXS");
        }
        icon.removeClass(this.options.iconClassExpanded).addClass(this.options.iconClassCollapsed);
        content.hide();
      } else {
        element.addClass(CLASS_ACTIVE);
        if (!icon.hasClass("coral-Icon")) {
          icon.addClass("coral-Icon coral-Icon--sizeXS");
        }
        icon.removeClass(this.options.iconClassCollapsed).addClass(this.options.iconClassExpanded);
        content.show();
      }
    },
    _collapse: function (el) {
      var header = this._getHeaderElement(el),
        content = this._getContentElement(el),
        icon = this._getHeaderIconElement(el);

      icon.removeClass(this.options.iconClassExpanded).addClass(this.options.iconClassCollapsed);

      content.slideUp({
        duration: "fast",
        complete: function () {
          el.removeClass(CLASS_ACTIVE); // remove the active class after animation so that background color doesn't change during animation
          el.trigger("deactivate");
        },
        progress: function (animation, progress, remainingMs) {
          el.trigger("collapse", {animation: animation, progress: progress, remainingMs: remainingMs});
        }
      });

      // update WAI-ARIA accessibility properties
      if (this.isAccordion) {
        header.attr({
          "tabindex": header.is(document.activeElement) ? 0 : -1,
          "aria-selected": false
        });
      } else {
        header.attr({
          "aria-expanded": false
        });
      }
      content.attr({
        "aria-hidden": true,
        "aria-expanded": false
      });
    },
    _expand: function (el) {
      var header = this._getHeaderElement(el),
        content = this._getContentElement(el),
        icon = this._getHeaderIconElement(el);

      el.addClass(CLASS_ACTIVE);
      icon.removeClass(this.options.iconClassCollapsed).addClass(this.options.iconClassExpanded);

      content.slideDown({
        duration: "fast",
        complete: function () {
          el.trigger("activate");
        },
        progress: function (animation, progress, remainingMs) {
          el.trigger("expand", {animation: animation, progress: progress, remainingMs: remainingMs});
        }
      });

      // update WAI-ARIA accessibility properties
      if (this.isAccordion) {
        header.attr({
          "tabindex": 0,
          "aria-selected": true
        });
      } else {
        header.attr({
          "aria-expanded": true
        });
      }
      content.attr({
        "aria-hidden": false,
        "aria-expanded": true
      }).show();
    },
    /** @ignore */
    _getCollapsibleSelector: function () {
      return this.isAccordion ? '.coral-Accordion-item' : '.coral-Collapsible';
    },
    /** @ignore */
    _getHeaderElement: function (el) {
      var selector = this.isAccordion ? '> .coral-Accordion-header' : '> .coral-Collapsible-header';
      return el.find(selector);
    },
    /** @ignore */
    _getHeaderFirstElement: function (el) {
      var selector = this.isAccordion ? '> .coral-Accordion-header:first' : '> .coral-Collapsible-header:first';
      return el.find(selector);
    },
    /** @ignore */
    _prependHeaderElement: function (el) {
      var className = this.isAccordion ? 'coral-Accordion-header' : 'coral-Collapsible-header';
      el.prepend("<h3 class=\"" + className + "\">&nbsp;</h3>");
    },
    /** @ignore */
    _getHeaderIconElement: function (el) {
      var selector = this.isAccordion ? '> .coral-Accordion-header > i' : '> .coral-Collapsible-header > i';
      return el.find(selector);
    },
    /** @ignore */
    _prependHeaderIconElement: function (el) {
      this._getHeaderElement(el).prepend("<i></i>");
    },
    /** @ignore */
    _getContentElement: function (el) {
      var selector = this.isAccordion ? '> .coral-Accordion-content' : '> .coral-Collapsible-content';
      return el.find(selector);
    },
    /** @ignore */
    _prependContentElement: function (el) {
      var className = this.isAccordion ? 'coral-Accordion-content' : 'coral-Collapsible-content';
      el.prepend("<div class=\"" + className + "\"></div>");
    },
    /**
     * adds accessibility attributes and features
     * per the WAI-ARIA Accordion widget design pattern:
     * http://www.w3.org/WAI/PF/aria-practices/#accordion
     * @private
     */
    _makeAccessible: function () {
      var idPrefix = 'accordion-' + new Date().getTime() + '-',
        section, header, content, isActive, panelId;
      if (this.isAccordion) {

        this.$element.attr({
          "role": "tablist" // accordion container has the role="tablist"
        });

        this.$element.children(".coral-Accordion-item").each(function (i, e) {
          var section = $(e),
            header = section.find("> .coral-Accordion-header:first"),
            isActive = section.hasClass(CLASS_ACTIVE),
            panelId = idPrefix + 'panel-' + i,
            content = header.next("div");

          section.attr({
            "role": "presentation" // collapsible containers have the role="presentation"
          });

          header.attr({
            "role": "tab", // accordion headers should have the role="tab"
            "id": header.attr("id") || idPrefix + "tab-" + i, // each tab needs an id
            "aria-controls": panelId, // the id for the content wrapper this header controls
            "aria-selected": isActive, // an indication of the current state
            "tabindex": (isActive ? 0 : -1)
          });

          content.attr({
            "role": "tabpanel", // the content wrapper should have the role="tabpanel"
            "id": panelId, // each content wrapper needs a unique id
            "aria-labelledby": header.attr("id"), // the content wrapper is labelled by its header
            "aria-expanded": isActive, // an indication of the current state
            "aria-hidden": !isActive // hide/show content to assistive technology
          });
        });

      } else {
        idPrefix = 'collapsible-' + new Date().getTime() + '-';
        section = this.$element;
        header = this._getHeaderFirstElement(section);
        isActive = section.hasClass(CLASS_ACTIVE);
        panelId = idPrefix + 'panel';
        content = header.next("div");

        header.attr({
          "role": "button", // the header should have the role="button"
          "id": header.attr("id") || idPrefix + "heading", // each header needs an id
          "aria-controls": panelId, // the id for the content wrapper this header controls
          "aria-expanded": isActive, // an indication of the current state
          "tabindex": 0
        });

        content.attr({
          "id": panelId, // each content wrapper needs a unique id
          "aria-labelledby": header.attr("id"), // the content wrapper is labelled by its header
          "aria-expanded": isActive, // an indication of the current state
          "aria-hidden": !isActive // hide/show content to assistive technology
        });
      }

      // handle keydown events from focusable descendants
      this.$element.on('keydown', ':focusable', this._onKeyDown.bind(this));

      // handle focusin/focusout events from focusable descendants
      this.$element.on('focusin.accordion', ':focusable', this._onFocusIn.bind(this));
      this.$element.on('focusout.accordion', '.coral-Accordion-header:focusable', this._onFocusOut.bind(this));

      this.$element.on('touchstart.accordion, mousedown.accordion', '.coral-Accordion-header:focusable', this._onMouseDown.bind(this));
    },

    /**
     * keydown event handler, which defines the keyboard behavior of the accordion control
     * per the WAI-ARIA Accordion widget design pattern:
     * http://www.w3.org/WAI/PF/aria-practices/#accordion
     * @private
     */
    _onKeyDown: function (event) {
      var el = $(event.currentTarget).closest(this._getCollapsibleSelector()),
        header = this._getHeaderFirstElement(el),
        isHead = $(event.currentTarget).is(header),
        keymatch = true;

      switch (event.which) {
        case 13: //enter
        case 32: //space
          if (isHead) {
            header.trigger('click');
          } else {
            keymatch = false;
          }
          break;
        case 33: //page up
        case 37: //left arrow
        case 38: //up arrow
          if ((isHead && this.isAccordion) || (event.which === 33 && (event.metaKey || event.ctrlKey))) {
            // If the event.target is an accordion heading, or the key command is CTRL + PAGE_UP,
            // focus the previous accordion heading, or if none exists, focus the last accordion heading.
            if (this._getHeaderFirstElement(el.prev()).focus().length === 0) {
              this.$element.find("> .coral-Accordion-item:last > .coral-Accordion-header:first").focus();
            }
          } else if (!isHead && (event.metaKey || event.ctrlKey)) {
            // If the event.target is not a collapsible heading,
            // and the key command is CTRL + UP or CTRL + LEFT, focus the collapsible heading.
            header.focus();
          } else {
            keymatch = false;
          }
          break;
        case 34: //page down
        case 39: //right arrow
        case 40: //down arrow
          if (isHead && this.isAccordion) {
            // If the event.target is an accordion heading,
            // focus the next accordion heading, or if none exists, focus the first accordion heading.
            if (this._getHeaderFirstElement(el.next()).focus().length === 0) {
              this.$element.find("> .coral-Accordion-item:first > .coral-Accordion-header:first").focus();
            }
          } else if (!isHead && event.which === 34 && (event.metaKey || event.ctrlKey)) {
            // If the event.target is not a collapsible heading,
            // and the key command is CTRL + PAGE_DOWN, focus the collapsible heading.
            header.focus();
          } else {
            keymatch = false;
          }
          break;
        case 36: //home
          if (isHead && this.isAccordion) {
            this.$element.find("> .coral-Accordion-item:first > .coral-Accordion-header:first").focus();
          } else {
            keymatch = false;
          }
          break;
        case 35: //end
          if (isHead && this.isAccordion) {
            this.$element.find("> .coral-Accordion-item:last > .coral-Accordion-header:first").focus();
          } else {
            keymatch = false;
          }
          break;
        default:
          keymatch = false;
          break;
      }

      if (keymatch === true) {
        event.preventDefault();
      }
    },
    /**
     * focusin event handler, used to update tabindex properties on accordion headers
     * and to display focus style on headers.
     * @private
     */
    _onFocusIn: function (event) {
      var el = $(event.currentTarget).closest(this._getCollapsibleSelector()),
        header = this._getHeaderFirstElement(el),
        isHead = $(event.currentTarget).is(header);
      if (this.options.disabled) return;
      if (isHead) {
        if (this.isAccordion) {
          this.$element.find("> .coral-Accordion-item > .coral-Accordion-header[role=tab]").attr('tabindex', -1);
        }
        if (!header.data('collapsible-mousedown')) {
          // el.addClass(':focus');
          el.focus();
        } else {
          header.removeData('collapsible-mousedown');
        }
      }
      header.attr('tabindex', 0);
    },
    /**
     * focusout event handler, used to clear the focus style on headers.
     * @private
     */
    _onFocusOut: function (event) {
      var el = $(event.currentTarget).closest(this._getCollapsibleSelector()),
        header = this._getHeaderFirstElement(el),
        isHead = $(event.currentTarget).is(header);
      if (isHead) {
        el.blur().removeData('collapsible-mousedown');
        // el.removeClass(':focus').removeData('collapsible-mousedown');
      }
    },
    /**
     * mousedown event handler, used flag
     * @private
     */
    _onMouseDown: function (event) {
      var el = $(event.currentTarget).closest(this._getCollapsibleSelector()),
        header = this._getHeaderFirstElement(el),
        isHead = $(event.currentTarget).is(header);
      if (isHead) {
        header.data('collapsible-mousedown', true);
      }
    }

    /**
     Triggered when the accordion is activated

     @name CUI.Accordion#activate
     @event

     @param {Object} evt                    Event object
     */

    /**
     Triggered when the accordion is deactivated

     @name CUI.Accordion#deactivate
     @event

     @param {Object} evt                    Event object
     */

    /**
     Triggered while the accordion is expanding after each step of the animation

     @name CUI.Accordion#expand
     @event

     @param {Object} evt                    Event object

     @param options
     @param {Promise} options.animation     The animation promise
     @param {Number} options.progress       The progress
     @param {Number} options.remainingMs    The remaining time of the animation in milliseconds
     */

    /**
     Triggered while the accordion is collapsing after each step of the animation

     @name CUI.Accordion#collapse
     @event

     @param {Object} evt                    Event object

     @param options
     @param {Promise} options.animation     The animation promise
     @param {Number} options.progress       The progress
     @param {Number} options.remainingMs    The remaining time of the animation in milliseconds
     */

  });

  CUI.Widget.registry.register("accordion", CUI.Accordion);

// Data API
  $(document).on("cui-contentloaded.data-api", function (e) {
    CUI.Accordion.init($("[data-init~=accordion],[data-init~=collapsible]", e.target));
  });
}(window.jQuery));

(function ($) {
  CUI.Alert = new Class(/** @lends CUI.Alert# */{
    toString: 'Alert',
    extend: CUI.Widget,

    /**
      @extends CUI.Widget
      @classdesc An optionally closeable alert message.

      @desc Creates a new alert
      @constructs

      @param {Object} options                               Component options
      @param {String} [options.heading=Type, capitalized]   Title of the alert
      @param {String} options.content                       Content of the alert
      @param {Boolean} options.closeable                     Array of button descriptors
      @param {String} [options.size=small]                  Size of the alert. Either large or small.
      @param {String} [options.type=error]                  Type of alert to display. One of error, notice, success, help, or info
    */
    construct: function (options) {
      // Catch clicks to dismiss alert
      this.$element.delegate('[data-dismiss="alert"]', 'click.dismiss.alert', this.hide);

      // Add alert class to give styling
      this.$element.addClass('coral-Alert');

      // Listen to changes to configuration
      this.$element.on('change:heading', this._setHeading.bind(this));
      this.$element.on('change:content', this._setContent.bind(this));
      this.$element.on('change:type', this._setType.bind(this));
      this.$element.on('change:closeable', this._setCloseable.bind(this));
      this.$element.on('change:size', this._setSize.bind(this));

      // Read in options "set" by markup so we don't override the values they set
      for (var typeKey in this._types) {
        if (this.$element.hasClass(this._types[typeKey]["class"])) {
          this.options.type = typeKey;
          return false;
        }
      }

      for (var sizeKey in this._sizes) {
        if (this.$element.hasClass(this._sizes[sizeKey])) {
          this.options.size = sizeKey;
          return false;
        }
      }

      this._setCloseable();
      this._setType();
      this._setSize();
      this._setHeading();
      this._setContent();

    },

    defaults: {
      type: 'error',
      size: 'small',
      heading: undefined,
      visible: true,
      closeable: true
    },

    _types: {
      "error" : { "class": "coral-Alert--error", "iconClass": "coral-Icon--alert"},
      "notice" : { "class":  "coral-Alert--notice", "iconClass": "coral-Icon--alert"},
      "success" : { "class":  "coral-Alert--success", "iconClass": "coral-Icon--checkCircle"},
      "help" : { "class":  "coral-Alert--help", "iconClass": "coral-Icon--helpCircle"},
      "info" : { "class":  "coral-Alert--info", "iconClass": "coral-Icon--infoCircle"}
    },

    _sizes: {
      "small" : "",
      "large" : "coral-Alert--large"
    },

    /** @ignore */
    _setContent: function () {
      if (typeof this.options.content === 'string') {
        this.$element.find('div').html(this.options.content);
      }
    },

    /** @ignore */
    _setHeading: function () {
      if (typeof this.options.heading === 'string') {
        this.$element.find('strong').html(this.options.heading);
      }
    },

    /** @ignore */
    _setType: function () {
      if (this._isValidType(this.options.type)) {
        var icon = this.$element.find('> .coral-Icon');
        for (var key in this._types) {
           this.$element.removeClass(this._types[key]["class"]);
           icon.removeClass(this._types[key]["iconClass"]);
        }
        this.$element.addClass(this._types[this.options.type]["class"]);
        var iconClass = this._types[this.options.type]["iconClass"];
        icon.addClass(iconClass);
      }

    },

    /** @ignore */
    _setSize: function () {
      if (this._isValidSize(this.options.size)) {
        if (this.options.size === 'small') {
          this.$element.removeClass(this._sizes['large']);
        }
        else {
          this.$element.addClass(this._sizes['large']);
        }
      }
    },

    /** @ignore */
    _setCloseable: function () {
      var el = this.$element.find('.coral-Alert-closeButton');
      if (!el.length && this.options.closeable) {
        // Add the close element if it's not present
        this.$element.prepend('<button class="coral-MinimalButton coral-Alert-closeButton" title="Close" data-dismiss="alert"><i class="coral-Icon coral-Icon--sizeXS coral-Icon--close coral-MinimalButton-icon"></i></button>');
      }
      else {
        el[this.options.closeable ? 'show' : 'hide']();
      }
    },

    /** @ignore */
    _isValidType: function (value) {
      return typeof value == 'string' && this._types.hasOwnProperty(value);
    },

    /** @ignore */
    _isValidSize: function (value) {
      return typeof value == 'string' && this._sizes.hasOwnProperty(value);
    },

    /** @ignore */
    _fixType: function (value) {
      return this._isValidType(value) ? value : this.defaults.type;
    },

    /** @ignore */
    _fixHeading: function (value) {
      return value === undefined ? this._fixType(this.options.type).toUpperCase() : value;
    }

  });

  CUI.Widget.registry.register('alert', CUI.Alert);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on('click.alert.data-api', '[data-dismiss="alert"]', function (evt) {
      $(evt.currentTarget).parent().hide();
      evt.preventDefault();
    });
  }
}(window.jQuery));

(function ($) {
  CUI.CharacterCount = new Class(/** @lends CUI.CharacterCount# */{
    toString: 'CharacterCount',
    extend: CUI.Widget,

    /**
     @extends CUI.Widget
     @classdesc Give visual feedback of the maximum length for textfields/textarea to the user.
     <p>This widget will not restrict the
     user to the max length given: The user can enter as much text
     as he/she wants and will only get visual feedback.</p>
     <p>For textareas some browsers count newline characters differently: While they count as 2 chars in the browsers builtin maxlength support,
     they only count as 1 char in this widget.</p>

     @desc Create a character count for a textfield or textarea.
     @constructs

     @param {Object} options Component options
     @param {Object} [options.related] The related Textfield or TextArea for this component.
     @param {String} [options.maxlength] Maximum length for the Textfield/Textarea (will be read from markup if given)
     */
    construct: function (options) {

      this.$input = $(this.options.related);

      if (this.$input.attr("maxlength")) {
        this.options.maxlength = this.$input.attr("maxlength");
      }
      this.$input.removeAttr("maxlength"); // Remove so that we can do our own error handling

      this.$input.on("input", this._render.bind(this));
      this.$element.on("change:maxlength", this._render.bind(this));
      this.$element.attr("aria-live", "polite");

      this._render();

    },

    defaults: {
      maxlength: null
    },

    /**
     * @private
     * @return {Number} [description]
     */
    _getLength: function () {
      return this.$input.is("input,textarea") ? this.$input.val().length :
        this.$input.text().length;
    },

    _render: function () {
      var len = this._getLength(),
        exceeded = this.options.maxlength ? (len > this.options.maxlength) : false;

      this.$input.toggleClass("is-invalid", exceeded);
      this.$element.toggleClass("is-invalid", exceeded);

      this.$element.text(this.options.maxlength ? (this.options.maxlength - len) : len);
    }
  });

  CUI.Widget.registry.register("character-count", CUI.CharacterCount);

  // Data API
  $(document).on("cui-contentloaded.data-api", function (e) {
    CUI.CharacterCount.init($("[data-init~=character-count]", e.target));
  });
}(window.jQuery));



(function ($) {
  "use strict";

  function getNext($collection, current) {
    var currentIndex = current ? $collection.index(current) : -1;

    if (currentIndex === -1 || currentIndex === $collection.length - 1) {
      // current one was not found or current one is the last one
      return $collection.eq(0);
    }
    else {
      // current one was found => return next one
      return $collection.eq(currentIndex + 1);
    }
  }

  CUI.CycleButton = new Class(/** @lends CUI.CycleButton# */{
    toString: "CycleButton",
    extend: CUI.Widget,

    /**
     @extends CUI.Widget
     @classdesc
     A component that show the current active item. Only one item can be active at the same time.
     When clicked, the next item of the active is shown and the click is triggered at that next item instead.
     If the last item is clicked, then the first item is shown and triggered accordingly.

     @desc Creates a new instance
     @constructs

     @param {Object} options Widget options
     */
    construct: function () {
      // Currently doesn't support form submission
      // When you need it please raise the issue in the mailing first, as the
      // feature should not be necessarily implemented in this component

      this.$element.on("click", ".coral-CycleButton-button", function (e) {
        if (e._cycleButton) {
          return;
        }

        e.stopImmediatePropagation();
        e.preventDefault();

        var buttons = $(e.delegateTarget).find(".coral-CycleButton-button");
        var next    = getNext(buttons, this);

        buttons.removeClass("is-active");
        next.addClass("is-active").focus();

        var click = $.Event("click", {
          _cycleButton: true
        });
        next.trigger(click);
      });
    }
  });

  CUI.Widget.registry.register("cyclebutton", CUI.CycleButton);

  // Data API
  $(document).on("cui-contentloaded.data-api", function (e) {
    CUI.CycleButton.init($("[data-init~='cyclebutton']", e.target));
  });
}(window.jQuery));

/**
 HTTP Utility functions used by CoralUI widgets

 @namespace
 */
CUI.util.HTTP = {
  /**
   * Checks whether the specified status code is OK.
   * @static
   * @param {Number} status The status code
   * @return {Boolean} True if the status is OK, else false
   */
  isOkStatus: function(status) {
    try {
      return (String(status).indexOf("2") === 0);
    } catch (e) {
      return false;
    }
  },

  /**
   * Returns <code>true</code> if HTML5 Upload is supported
   * @return {Boolean} HTML5 Upload support status
   */
  html5UploadSupported: function() {
    var xhr = new XMLHttpRequest();
    return !! (
      xhr && ('upload' in xhr) && ('onprogress' in xhr.upload)
    );
  }
};

(function ($) {
  CUI.FileUpload = new Class(/** @lends CUI.FileUpload# */{
    toString: 'FileUpload',
    extend: CUI.Widget,

    /**
     Triggered when a file is selected and accepted into the queue

     @name CUI.FileUpload#fileselected
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when a selected file is rejected before upload

     @name CUI.FileUpload#filerejected
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {String} evt.message            The reason why the file has been rejected
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when the internal upload queue changes (file added, file uploaded, etc.)

     @name CUI.FileUpload#queuechanged
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {String} evt.operation          The operation on the queue (ADD or REMOVE)
     @param {int} evt.queueLength           The number of items in the queue
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when selected files list is processed

     @name CUI.FileUpload#filelistprocessed
     @event

     @param {Object} evt                    Event object
     @param {int} evt.addedCount            The number of files that have been added to the processing list
     @param {int} evt.rejectedCount         The number of files that have been rejected
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when upload of a file starts

     @name CUI.FileUpload#fileuploadstart
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {Object} evt.originalEvent      The original upload event
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when upload of a file progresses

     @name CUI.FileUpload#fileuploadprogress
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {Object} evt.originalEvent      The original upload event (from which the upload ratio can be calculated)
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when upload of a file is completed (for non-HTML5 uploads only, regardless of success status)

     @name CUI.FileUpload#fileuploadload
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {String} evt.content            The server response to the upload request, which needs to be analyzed to determine if upload was successful
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when upload of a file succeeded

     @name CUI.FileUpload#fileuploadsuccess
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {Object} evt.originalEvent      The original upload event
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when upload of a file failed

     @name CUI.FileUpload#fileuploaderror
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {Object} evt.originalEvent      The original upload event
     @param {String} evt.message            The reason why the file upload failed
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when upload of a file has been cancelled

     @name CUI.FileUpload#fileuploadcanceled
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {Object} evt.originalEvent      The original upload event
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when dragging into a drop zone

     @name CUI.FileUpload#dropzonedragenter
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.originalEvent      The original mouse drag event
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when dragging over a drop zone

     @name CUI.FileUpload#dropzonedragover
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.originalEvent      The original mouse drag event
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when dragging out of a drop zone

     @name CUI.FileUpload#dropzonedragleave
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.originalEvent      The original mouse drag event
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when dropping files in a drop zone

     @name CUI.FileUpload#dropzonedrop
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.originalEvent      The original mouse drop event
     @param {FileList} evt.files            The list of dropped files
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     @extends CUI.Widget
     @classdesc A file upload widget

     @desc Creates a file upload field
     @constructs

     @param {Object}   options                                    Component options
     @param {String}   [options.name="file"]                      (Optional) name for an underlying form field.
     @param {String}   [options.placeholder=null]                 Define a placeholder for the input field
     @param {String}   [options.uploadUrl=null]                   URL where to upload the file. (If none is provided, the wigdet is disabled)
     @param {String}   [options.uploadUrlBuilder=null]            Upload URL builder
     @param {boolean}  [options.disabled=false]                   Is this component disabled?
     @param {boolean}  [options.multiple=false]                   Can the user upload more than one file?
     @param {int}      [options.sizeLimit=null]                   File size limit
     @param {Array}    [options.mimeTypes=[]]                     Mime types allowed for uploading (proper mime types, wildcard "*" and file extensions are supported)
     @param {boolean}  [options.autoStart=false]                  Should upload start automatically once the file is selected?
     @param {String}   [options.fileNameParameter=null]           Name of File name's parameter
     @param {boolean}  [options.useHTML5=true]                    (Optional) Prefer HTML5 to upload files (if browser allows it)
     @param {Mixed}    [options.dropZone=null]                    (Optional) jQuery selector or DOM element to use as dropzone (if browser allows it)
     @param {Object}   [options.events={}]                        (Optional) Event handlers
     */
    construct: function (options) {
      // Adjust DOM to our needs
      this._render();

      this.inputElement.on("change", function (event) {
        if (this.options.disabled) {
          return;
        }
        this._onFileSelectionChange(event);
      }.bind(this));

      this._makeAccessible();
    },

    defaults: {
      name: "file",
      placeholder: null,
      uploadUrl: null,
      uploadUrlBuilder: null,
      disabled: false,
      multiple: false,
      sizeLimit: null,
      mimeTypes: [], // Default case: no restriction on mime types
      autoStart: false,
      fileNameParameter: null,
      useHTML5: true,
      dropZone: null,
      events: {}
    },

    inputElement: null,
    $inputContainer: null,
    fileNameElement: null,
    uploadQueue: [],

    /** @ignore */
    _render: function () {
      var self = this;

      // container for the input
      this.$inputContainer = this.$element.find(".coral-FileUpload-trigger");

      // Get the input element
      this.inputElement = this.$inputContainer.find(".coral-FileUpload-input");

      // Read configuration from markup
      this._readDataFromMarkup();

      if (!CUI.util.HTTP.html5UploadSupported()) {
        this.options.useHTML5 = false;
      }

      this._createMissingElements();

      // Register event handlers
      if (this.options.events) {
        if (typeof this.options.events === "object") {
          for (var name in this.options.events) {
            this._registerEventHandler(name, this.options.events[name]);
          }
        }
      }

      // Register drop zone
      if (this.options.useHTML5) {
        this._registerDropZone();
      } else {
        this.options.dropZone = null;
      }

      if (!this.options.placeholder) {
        this.options.placeholder = this.inputElement.attr("placeholder");
      }

      if (this.options.autoStart) {
        this._registerEventHandler("fileselected", function (event) {
          event.fileUpload.uploadFile(event.item);
        });
      }

      // URL built via JavaScript function
      if (this.options.uploadUrlBuilder) {
        this.options.uploadUrl = this.options.uploadUrlBuilder(this);
      }

      if (!this.options.uploadUrl || /\$\{.+\}/.test(this.options.uploadUrl)) {
        this.options.disabled = true;
      }

      this._update();
    },

    /** @ignore */
    _makeAccessible: function() {
      if (this.$inputContainer.is('button')) {
        var $span = $('<span>'),
            attributes = this.$inputContainer.prop('attributes');

        // loop through <button> attributes and apply them on <span>
        $.each(attributes, function() {
            $span.attr(this.name, this.value);
        });

        $span.insertBefore(this.$inputContainer);
        $span.append(this.$inputContainer.children());

        this.$inputContainer.remove();
        this.$inputContainer = $span;
      }

      if ((this.inputElement.attr('id') && $('label[for="' + this.inputElement.attr('id') + '"]').length === 0) || this.inputElement.closest('label').text().trim().length === 0) {
        if (this.inputElement.is('[title]:not([aria-label]):not([aria-labelledby])')) {
          if (!this.inputElement.attr('id')) {
            this.inputElement.attr('id', CUI.util.getNextId());
          }
          var $label = $('<label>'),
              $target = this.$element.find('.coral-FileUpload-trigger .coral-Icon');
          if (!$target.length) {
              $target = this.$element.find('.coral-FileUpload-trigger input');
          }

          $label.attr('for', this.inputElement.attr('id'))
            .text(this.inputElement.attr('title'));

          if (this.inputElement.closest('.coral-Icon').length) {
            $label.addClass('u-coral-screenReaderOnly');
          }

          $target.after($label);
        }
      }

      this.inputElement
        .on("focusin.cui-fileupload focusout.cui-fileupload", this._toggleIsFocused.bind(this));
    },

    /** @ignore */
    _toggleIsFocused: function(event) {
      this.$inputContainer.toggleClass('is-focused', event.type === 'focusin');
    },

    _registerDropZone: function () {
      var self = this;

      if (!self.options.dropZone) {
        // No dropZone specified, a default one that wraps the whole fileupload is then created
        self.$element.addClass("coral-FileUpload--dropSupport");

        self.options.dropZone = self.$element;
      }

      // Try to get the drop zone via a jQuery selector
      try {
        self.options.dropZone = $(self.options.dropZone);
      } catch (e) {
        delete self.options.dropZone;
      }

      if (self.options.dropZone) {
        self.options.dropZone
            .on("dragenter", function (e) {
              if (self._isActive()) {

                if (e.stopPropagation) {
                  e.stopPropagation();
                }
                if (e.preventDefault) {
                  e.preventDefault();
                }

                self.$element.trigger({
                  type: "dropzonedragenter",
                  originalEvent: e,
                  fileUpload: self
                });
              }

              return false;
            })
          .on("dragover", function (e) {
            if (self._isActive()) {
              self.isDragOver = true;

              if (e.stopPropagation) {
                e.stopPropagation();
              }
              if (e.preventDefault) {
                e.preventDefault();
              }

              self.$element.trigger({
                type: "dropzonedragover",
                originalEvent: e,
                fileUpload: self
              });
            }

            return false;
          })
          .on("dragleave", function (e) {
            if (self._isActive()) {
              if (e.stopPropagation) {
                e.stopPropagation();
              }
              if (e.preventDefault) {
                e.preventDefault();
              }

              self.isDragOver = false;

              window.setTimeout(function () {
                if (!self.isDragOver) {
                  self.$element.trigger({
                    type: "dropzonedragleave",
                    originalEvent: e,
                    fileUpload: self
                  });
                }
              }, 1);
            }

            return false;
          })
          .on("drop", function (e) {
            if (self._isActive()) {
              if (e.stopPropagation) {
                e.stopPropagation();
              }
              if (e.preventDefault) {
                e.preventDefault();
              }

              var files = e.originalEvent.dataTransfer.files;

              self.$element.trigger({
                type: "dropzonedrop",
                originalEvent: e,
                files: files,
                fileUpload: self
              });

              self._onFileSelectionChange(e, files);
            }

            return false;
          })
        ;
      }
    },

    _registerEventHandler: function (name, handler) {
      this.$element.on(name, handler);
    },

    _createMissingElements: function () {
      var self = this;

      var multiple = self.options.useHTML5 && self.options.multiple;
      if (self.inputElement.length === 0) {
        self.inputElement = $("<input/>", {
          type: "file",
          'class': 'coral-FileUpload-input',
          name: self.options.name,
          multiple: multiple
        });
        self.$inputContainer.prepend(self.inputElement);
      } else {
        self.inputElement.attr("multiple", multiple);
      }
    },

    /** @ignore */
    _readDataFromMarkup: function () {
      var self = this;
      if (this.inputElement.attr("name")) {
        this.options.name = this.inputElement.attr("name");
      }
      if (this.inputElement.attr("placeholder")) {
        this.options.placeholder = this.inputElement.attr("placeholder");
      }
      if (this.inputElement.data("placeholder")) {
        this.options.placeholder = this.inputElement.data("placeholder");
      }
      if (this.inputElement.attr("disabled") || this.inputElement.data("disabled")) {
        this.options.disabled = true;
      }
      if (this.inputElement.attr("multiple") || this.inputElement.data("multiple")) {
        this.options.multiple = true;
      }
      if (this.inputElement.data("uploadUrl")) {
        this.options.uploadUrl = this.inputElement.data("uploadUrl");
      }
      if (this.inputElement.data("uploadUrlBuilder")) {
        this.options.uploadUrlBuilder = CUI.util.buildFunction(this.inputElement.data("uploadUrlBuilder"), ["fileUpload"]);
      }
      if (this.inputElement.data("mimeTypes")) {
        this.options.mimeTypes = this.inputElement.data("mimeTypes");
      }
      if (this.inputElement.data("sizeLimit")) {
        this.options.sizeLimit = this.inputElement.data("sizeLimit");
      }
      if (this.inputElement.data("autoStart")) {
        this.options.autoStart = true;
      }
      if (this.inputElement.data("usehtml5")) {
        this.options.useHTML5 = this.inputElement.data("usehtml5") === true;
      }
      if (this.inputElement.data("dropzone")) {
        this.options.dropZone = this.inputElement.data("dropzone");
      }
      if (this.inputElement.data("fileNameParameter")) {
        this.options.fileNameParameter = this.inputElement.data("fileNameParameter");
      }
      var inputElementHTML = this.inputElement.length ? this.inputElement.get(0) : undefined;
      if (inputElementHTML) {
        $.each(inputElementHTML.attributes, function (i, attribute) {
          var match = /^data-event-(.*)$/.exec(attribute.name);
          if (match && match.length > 1) {
            var eventHandler = CUI.util.buildFunction(attribute.value, ["event"]);
            if (eventHandler) {
              self.options.events[match[1]] = eventHandler.bind(self);
            }
          }
        });
      }
    },

    /** @ignore */
    _update: function () {
      if (this.options.placeholder) {
        this.inputElement.attr("placeholder", this.options.placeholder);
      }

      if (this.options.disabled) {
        this.$element.addClass("is-disabled");
        this.$inputContainer.addClass("is-disabled");
        this.inputElement.attr("disabled", "disabled");
      } else {
        this.$element.removeClass("is-disabled");
        this.$inputContainer.removeClass("is-disabled");
        this.inputElement.removeAttr("disabled");
      }
    },

    /** @ignore */
    _onFileSelectionChange: function (event, files) {
      var addedCount = 0, rejectedCount = 0;
      if (this.options.useHTML5) {
        files = files || event.target.files;
        for (var i = 0; i < files.length; i++) {
          if (this._addFile(files[i])) {
            addedCount++;
          } else {
            rejectedCount++;
          }
        }
      } else {
        if (this._addFile(event.target)) {
          addedCount++;
        } else {
          rejectedCount++;
        }
      }

      this.$element.trigger({
        type: "filelistprocessed",
        addedCount: addedCount,
        rejectedCount: rejectedCount,
        fileUpload: this
      });
    },

    /** @ignore */
    _addFile: function (file) {
      var self = this;

      var fileName,
        fileMimeType;
      if (this.options.useHTML5) {
        fileName = file.name;
        fileMimeType = file.type;
      } else {
        fileName = $(file).attr("value") || file.value;
      }

      fileMimeType = fileMimeType || CUI.FileUpload.MimeTypes.getMimeTypeFromFileName(fileName);

      if (fileName.lastIndexOf("\\") !== -1) {
        fileName = fileName.substring(fileName.lastIndexOf("\\") + 1);
      }

      // if no autostart is used we need to set fileNameParameter as an additional form input field
      // to be submitted with the form.
      if (self.options.fileNameParameter && !this.options.autoStart) {
        if (!self.fileNameElement) {
          // check if there is already a form input field defined to store the parameter
          self.fileNameElement = $("input[name=\"" + self.options.fileNameParameter + "\"]");
          if (self.fileNameElement.length === 0) {
            // create and append
            self.fileNameElement = $("<input/>", {
              type: "hidden",
              name: self.options.fileNameParameter
            });
            self.fileNameElement.appendTo(self.$element);
          }
        }
        self.fileNameElement.val(fileName);
      }

      if (!self._getQueueItemByFileName(fileName)) {
        var item = {
          fileName: fileName
        };
        if (this.options.useHTML5) {
          item.file = file;
          item.fileSize = file.size;

          // Check file size
          if (self.options.sizeLimit && file.size > self.options.sizeLimit) {
            self.$element.trigger({
              type: "filerejected",
              item: item,
              message: "File is too big",
              fileUpload: self
            });
            return false;
          }
        }

        // Check file mime type against allowed mime types
        if (!self._checkMimeTypes(fileMimeType)) {
          self.$element.trigger({
            type: "filerejected",
            item: item,
            message: "File mime type is not allowed",
            fileUpload: self
          });
          return false;
        }

        // Add item to queue
        self.uploadQueue.push(item);
        self.$element.trigger({
          type: "queuechanged",
          item: item,
          operation: "ADD",
          queueLength: self.uploadQueue.length,
          fileUpload: self
        });

        self.$element.trigger({
          type: "fileselected",
          item: item,
          fileUpload: self
        });

        return true;
      }

      return false;
    },

    /** @ignore */
    _checkMimeTypes: function (fileMimeType) {
      function isMimeTypeAllowed(fileMimeType, allowedMimeType) {
        var mimeTypeRegEx = /(.+)\/(.+)$/,      // "text/plain"
          fileExtensionRegEx = /\.(.+)$/,     // ".txt"
          shortcutRegEx = /.*/,               // "text"
          isAllowed = false;

        if (allowedMimeType === "*" || allowedMimeType === ".*" || allowedMimeType === "*/*") {
          // Explicit wildcard case: allow any file
          isAllowed = true;
        } else if (!fileMimeType || !fileMimeType.match(mimeTypeRegEx)) {
          // File mime type is erroneous
          isAllowed = false;
        } else if (allowedMimeType.match(mimeTypeRegEx)) {
          // Proper mime type case: directly compare with file mime type
          isAllowed = (fileMimeType === allowedMimeType);
        } else if (allowedMimeType.match(fileExtensionRegEx)) {
          // File extension case: map extension to proper mime type and then compare
          isAllowed = (fileMimeType === CUI.FileUpload.MimeTypes[allowedMimeType]);
        } else if (allowedMimeType.match(shortcutRegEx)) {
          // "Shortcut" case: only compare first part of the file mime type with the shortcut
          isAllowed = (fileMimeType.split("/")[0] === allowedMimeType);
        }
        return isAllowed;
      }

      var length = this.options.mimeTypes.length,
        i;

      if (length === 0) {
        // No restriction has been defined (default case): allow any file
        return true;
      } else {
        // Some restrictions have been defined
        for (i = 0; i < length; i += 1) {
          if (isMimeTypeAllowed(fileMimeType, this.options.mimeTypes[i])) {
            return true;
          }
        }
        // The file mime type matches none of the mime types allowed
        return false;
      }

    },

    /** @ignore */
    _getQueueIndex: function (fileName) {
      var index = -1;
      $.each(this.uploadQueue, function (i, item) {
        if (item.fileName === fileName) {
          index = i;
          return false;
        }
      });
      return index;
    },

    /** @ignore */
    _getQueueItem: function (index) {
      return index > -1 ? this.uploadQueue[index] : null;
    },

    /** @ignore */
    _getQueueItemByFileName: function (fileName) {
      return this._getQueueItem(this._getQueueIndex(fileName));
    },

    /**
     Upload a file item

     @param {Object} item                   Object representing a file item
     */
    uploadFile: function (item) {
      var self = this;

      if (self.options.useHTML5) {
        item.xhr = new XMLHttpRequest();
        item.xhr.addEventListener("loadstart", function (e) {
          self._onUploadStart(e, item);
        }, false);
        item.xhr.addEventListener("load", function (e) {
          self._onUploadLoad(e, item);
        }, false);
        item.xhr.addEventListener("error", function (e) {
          self._onUploadError(e, item);
        }, false);
        item.xhr.addEventListener("abort", function (e) {
          self._onUploadCanceled(e, item);
        }, false);

        var upload = item.xhr.upload;
        upload.addEventListener("progress", function (e) {
          self._onUploadProgress(e, item);
        }, false);

        // TODO: encoding of special characters in file names
        var file = item.file;
        var fileName = item.fileName;
        if (window.FormData) {
          var f = new FormData();
          if (self.options.fileNameParameter) {
            // Custom file and file name parameter
            f.append(self.inputElement.attr("name"), file);
            f.append(self.options.fileNameParameter || "fileName", fileName);
          } else {
            f.append(fileName, file);
          }
          f.append("_charset_", "utf-8");
          if(item["parameters"] !== null && item["parameters"] !== undefined) {
            item.parameters.forEach(function(additionalParam) {
              f.append(additionalParam.name, additionalParam.value);
            });
          }
          item.xhr.open("POST", self.options.uploadUrl + "?:ck=" + new Date().getTime(), true);
          item.xhr.send(f);
        } else {
          item.xhr.open("PUT", self.options.uploadUrl + "/" + fileName, true);
          item.xhr.send(file);
        }

      } else {
        var $body = $(document.body);

        // Build an iframe
        var iframeName = "upload-" + new Date().getTime();
        var $iframe = $("<iframe/>", {
          name: iframeName,
          "class": "coral-FileUpload-iframe"
        }).appendTo($body);

        // Build a form
        var $form = $("<form/>", {
          method: "post",
          enctype: "multipart/form-data",
          action: self.options.uploadUrl,
          target: iframeName,
          "class": "coral-FileUpload-form"
        }).appendTo($body);

        var $charset = $("<input/>", {
          type: "hidden",
          name: "_charset_",
          value: "utf-8"
        });
        $form.prepend($charset);
        if(item["parameters"] !== null && item["parameters"] !== undefined) {
          item.parameters.forEach(function(additionalParam) {
            var $param = $("<input/>", {
              type: "hidden",
              name: additionalParam.name,
              value: additionalParam.value
            });
            $form.prepend($param);
          });
        }

        // Define value of the file name element
        if (this.options.fileNameParameter) {
          this.fileNameElement = $("<input/>", {
            type: "hidden",
            name: this.options.fileNameParameter,
            value: item.fileName
          });
          $form.prepend(this.fileNameElement);
        }

        $iframe.one("load", function () {
          var content = this.contentWindow.document.body.innerHTML;
          self.inputElement.appendTo(self.$inputContainer);
          $form.remove();
          $iframe.remove();

          self.$element.trigger({
            type: "fileuploadload",
            item: item,
            content: content,
            fileUpload: self
          });
        });

        self.inputElement.prependTo($form);
        $form.submit();
      }
    },

    /**
     Cancel upload of a file item

     @param {Object} item                   Object representing a file item
     */
    cancelUpload: function (item) {
      item.xhr.abort();
    },

    /** @ignore */
    _onUploadStart: function (e, item) {
      this.$element.trigger({
        type: "fileuploadstart",
        item: item,
        originalEvent: e,
        fileUpload: this
      });
    },

    /** @ignore */
    _onUploadProgress: function (e, item) {
      // Update progress bar
      this.$element.trigger({
        type: "fileuploadprogress",
        item: item,
        originalEvent: e,
        fileUpload: this
      });
    },

    /** @ignore */
    _onUploadLoad: function (e, item) {
      var request = e.target;
      if (request.readyState === 4) {
        this._internalOnUploadLoad(e, item, request.status, request.responseText);
      }
    },

    /** @ignore */
    _internalOnUploadLoad: function (e, item, requestStatus, responseText) {
      if (CUI.util.HTTP.isOkStatus(requestStatus)) {
        this.$element.trigger({
          type: "fileuploadsuccess",
          item: item,
          originalEvent: e,
          fileUpload: this
        });
      } else {
        this.$element.trigger({
          type: "fileuploaderror",
          item: item,
          originalEvent: e,
          message: responseText,
          fileUpload: this
        });
      }

      // Remove file name element if needed
      if (this.fileNameElement) {
        this.fileNameElement.remove();
      }

      // Remove queue item
      this.uploadQueue.splice(this._getQueueIndex(item.fileName), 1);
      this.$element.trigger({
        type: "queuechanged",
        item: item,
        operation: "REMOVE",
        queueLength: this.uploadQueue.length,
        fileUpload: this
      });
    },

    /** @ignore */
    _onUploadError: function (e, item) {
      this.$element.trigger({
        type: "fileuploaderror",
        item: item,
        originalEvent: e,
        fileUpload: this
      });
    },

    /** @ignore */
    _onUploadCanceled: function (e, item) {
      this.$element.trigger({
        type: "fileuploadcanceled",
        item: item,
        originalEvent: e,
        fileUpload: this
      });
    },

    /** @ignore */
    _isActive: function () {
      return !this.inputElement.is(':disabled');
    }

  });

  CUI.Widget.registry.register("fileupload", CUI.FileUpload);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function (e) {
      CUI.FileUpload.init($("[data-init~='fileupload']", e.target));
    });
  }

}(window.jQuery));

(function ($) {
  CUI.FileUpload.MimeTypes =
  {
    ".123": "application/vnd.lotus-1-2-3",
    ".3dml": "text/vnd.in3d.3dml",
    ".3g2": "video/3gpp2",
    ".3gp": "video/3gpp",
    ".a": "application/octet-stream",
    ".aab": "application/x-authorware-bin",
    ".aac": "audio/x-aac",
    ".aam": "application/x-authorware-map",
    ".aas": "application/x-authorware-seg",
    ".abw": "application/x-abiword",
    ".acc": "application/vnd.americandynamics.acc",
    ".ace": "application/x-ace-compressed",
    ".acu": "application/vnd.acucobol",
    ".acutc": "application/vnd.acucorp",
    ".adp": "audio/adpcm",
    ".aep": "application/vnd.audiograph",
    ".afm": "application/x-font-type1",
    ".afp": "application/vnd.ibm.modcap",
    ".ai": "application/postscript",
    ".aif": "audio/x-aiff",
    ".aifc": "audio/x-aiff",
    ".aiff": "audio/x-aiff",
    ".air": "application/vnd.adobe.air-application-installer-package+zip",
    ".ami": "application/vnd.amiga.ami",
    ".apk": "application/vnd.android.package-archive",
    ".application": "application/x-ms-application",
    ".apr": "application/vnd.lotus-approach",
    ".asc": "application/pgp-signature",
    ".asf": "video/x-ms-asf",
    ".asm": "text/x-asm",
    ".aso": "application/vnd.accpac.simply.aso",
    ".asx": "video/x-ms-asf",
    ".atc": "application/vnd.acucorp",
    ".atom": "application/atom+xml",
    ".atomcat": "application/atomcat+xml",
    ".atomsvc": "application/atomsvc+xml",
    ".atx": "application/vnd.antix.game-component",
    ".au": "audio/basic",
    ".avi": "video/x-msvideo",
    ".aw": "application/applixware",
    ".azf": "application/vnd.airzip.filesecure.azf",
    ".azs": "application/vnd.airzip.filesecure.azs",
    ".azw": "application/vnd.amazon.ebook",
    ".bat": "application/x-msdownload",
    ".bcpio": "application/x-bcpio",
    ".bdf": "application/x-font-bdf",
    ".bdm": "application/vnd.syncml.dm+wbxml",
    ".bh2": "application/vnd.fujitsu.oasysprs",
    ".bin": "application/octet-stream",
    ".bmi": "application/vnd.bmi",
    ".bmp": "image/bmp",
    ".book": "application/vnd.framemaker",
    ".box": "application/vnd.previewsystems.box",
    ".boz": "application/x-bzip2",
    ".bpk": "application/octet-stream",
    ".btif": "image/prs.btif",
    ".bz": "application/x-bzip",
    ".bz2": "application/x-bzip2",
    ".c": "text/x-c",
    ".c4d": "application/vnd.clonk.c4group",
    ".c4f": "application/vnd.clonk.c4group",
    ".c4g": "application/vnd.clonk.c4group",
    ".c4p": "application/vnd.clonk.c4group",
    ".c4u": "application/vnd.clonk.c4group",
    ".cab": "application/vnd.ms-cab-compressed",
    ".car": "application/vnd.curl.car",
    ".cat": "application/vnd.ms-pki.seccat",
    ".cc": "text/x-c",
    ".cct": "application/x-director",
    ".ccxml": "application/ccxml+xml",
    ".cdbcmsg": "application/vnd.contact.cmsg",
    ".cdf": "application/x-netcdf",
    ".cdkey": "application/vnd.mediastation.cdkey",
    ".cdx": "chemical/x-cdx",
    ".cdxml": "application/vnd.chemdraw+xml",
    ".cdy": "application/vnd.cinderella",
    ".cer": "application/pkix-cert",
    ".cgm": "image/cgm",
    ".chat": "application/x-chat",
    ".chm": "application/vnd.ms-htmlhelp",
    ".chrt": "application/vnd.kde.kchart",
    ".cif": "chemical/x-cif",
    ".cii": "application/vnd.anser-web-certificate-issue-initiation",
    ".cil": "application/vnd.ms-artgalry",
    ".cla": "application/vnd.claymore",
    ".class": "application/java-vm",
    ".clkk": "application/vnd.crick.clicker.keyboard",
    ".clkp": "application/vnd.crick.clicker.palette",
    ".clkt": "application/vnd.crick.clicker.template",
    ".clkw": "application/vnd.crick.clicker.wordbank",
    ".clkx": "application/vnd.crick.clicker",
    ".clp": "application/x-msclip",
    ".cmc": "application/vnd.cosmocaller",
    ".cmdf": "chemical/x-cmdf",
    ".cml": "chemical/x-cml",
    ".cmp": "application/vnd.yellowriver-custom-menu",
    ".cmx": "image/x-cmx",
    ".cod": "application/vnd.rim.cod",
    ".com": "application/x-msdownload",
    ".conf": "text/plain",
    ".cpio": "application/x-cpio",
    ".cpp": "text/x-c",
    ".cpt": "application/mac-compactpro",
    ".crd": "application/x-mscardfile",
    ".crl": "application/pkix-crl",
    ".crt": "application/x-x509-ca-cert",
    ".csh": "application/x-csh",
    ".csml": "chemical/x-csml",
    ".csp": "application/vnd.commonspace",
    ".css": "text/css",
    ".cst": "application/x-director",
    ".csv": "text/csv",
    ".cu": "application/cu-seeme",
    ".curl": "text/vnd.curl",
    ".cww": "application/prs.cww",
    ".cxt": "application/x-director",
    ".cxx": "text/x-c",
    ".daf": "application/vnd.mobius.daf",
    ".dataless": "application/vnd.fdsn.seed",
    ".davmount": "application/davmount+xml",
    ".dcr": "application/x-director",
    ".dcurl": "text/vnd.curl.dcurl",
    ".dd2": "application/vnd.oma.dd2+xml",
    ".ddd": "application/vnd.fujixerox.ddd",
    ".deb": "application/x-debian-package",
    ".def": "text/plain",
    ".deploy": "application/octet-stream",
    ".der": "application/x-x509-ca-cert",
    ".dfac": "application/vnd.dreamfactory",
    ".dic": "text/x-c",
    ".diff": "text/plain",
    ".dir": "application/x-director",
    ".dis": "application/vnd.mobius.dis",
    ".dist": "application/octet-stream",
    ".distz": "application/octet-stream",
    ".djv": "image/vnd.djvu",
    ".djvu": "image/vnd.djvu",
    ".dll": "application/x-msdownload",
    ".dmg": "application/octet-stream",
    ".dms": "application/octet-stream",
    ".dna": "application/vnd.dna",
    ".doc": "application/msword",
    ".docm": "application/vnd.ms-word.document.macroenabled.12",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".dot": "application/msword",
    ".dotm": "application/vnd.ms-word.template.macroenabled.12",
    ".dotx": "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
    ".dp": "application/vnd.osgi.dp",
    ".dpg": "application/vnd.dpgraph",
    ".dsc": "text/prs.lines.tag",
    ".dtb": "application/x-dtbook+xml",
    ".dtd": "application/xml-dtd",
    ".dts": "audio/vnd.dts",
    ".dtshd": "audio/vnd.dts.hd",
    ".dump": "application/octet-stream",
    ".dvi": "application/x-dvi",
    ".dwf": "model/vnd.dwf",
    ".dwg": "image/vnd.dwg",
    ".dxf": "image/vnd.dxf",
    ".dxp": "application/vnd.spotfire.dxp",
    ".dxr": "application/x-director",
    ".ecelp4800": "audio/vnd.nuera.ecelp4800",
    ".ecelp7470": "audio/vnd.nuera.ecelp7470",
    ".ecelp9600": "audio/vnd.nuera.ecelp9600",
    ".ecma": "application/ecmascript",
    ".edm": "application/vnd.novadigm.edm",
    ".edx": "application/vnd.novadigm.edx",
    ".efif": "application/vnd.picsel",
    ".ei6": "application/vnd.pg.osasli",
    ".elc": "application/octet-stream",
    ".eml": "message/rfc822",
    ".emma": "application/emma+xml",
    ".eol": "audio/vnd.digital-winds",
    ".eot": "application/vnd.ms-fontobject",
    ".eps": "application/postscript",
    ".epub": "application/epub+zip",
    ".es3": "application/vnd.eszigno3+xml",
    ".esf": "application/vnd.epson.esf",
    ".et3": "application/vnd.eszigno3+xml",
    ".etx": "text/x-setext",
    ".exe": "application/x-msdownload",
    ".ext": "application/vnd.novadigm.ext",
    ".ez": "application/andrew-inset",
    ".ez2": "application/vnd.ezpix-album",
    ".ez3": "application/vnd.ezpix-package",
    ".f": "text/x-fortran",
    ".f4v": "video/x-f4v",
    ".f77": "text/x-fortran",
    ".f90": "text/x-fortran",
    ".fbs": "image/vnd.fastbidsheet",
    ".fdf": "application/vnd.fdf",
    ".fe_launch": "application/vnd.denovo.fcselayout-link",
    ".fg5": "application/vnd.fujitsu.oasysgp",
    ".fgd": "application/x-director",
    ".fh": "image/x-freehand",
    ".fh4": "image/x-freehand",
    ".fh5": "image/x-freehand",
    ".fh7": "image/x-freehand",
    ".fhc": "image/x-freehand",
    ".fig": "application/x-xfig",
    ".fli": "video/x-fli",
    ".flo": "application/vnd.micrografx.flo",
    ".flv": "video/x-flv",
    ".flw": "application/vnd.kde.kivio",
    ".flx": "text/vnd.fmi.flexstor",
    ".fly": "text/vnd.fly",
    ".fm": "application/vnd.framemaker",
    ".fnc": "application/vnd.frogans.fnc",
    ".for": "text/x-fortran",
    ".fpx": "image/vnd.fpx",
    ".frame": "application/vnd.framemaker",
    ".fsc": "application/vnd.fsc.weblaunch",
    ".fst": "image/vnd.fst",
    ".ftc": "application/vnd.fluxtime.clip",
    ".fti": "application/vnd.anser-web-funds-transfer-initiation",
    ".fvt": "video/vnd.fvt",
    ".fzs": "application/vnd.fuzzysheet",
    ".g3": "image/g3fax",
    ".gac": "application/vnd.groove-account",
    ".gdl": "model/vnd.gdl",
    ".geo": "application/vnd.dynageo",
    ".gex": "application/vnd.geometry-explorer",
    ".ggb": "application/vnd.geogebra.file",
    ".ggt": "application/vnd.geogebra.tool",
    ".ghf": "application/vnd.groove-help",
    ".gif": "image/gif",
    ".gim": "application/vnd.groove-identity-message",
    ".gmx": "application/vnd.gmx",
    ".gnumeric": "application/x-gnumeric",
    ".gph": "application/vnd.flographit",
    ".gqf": "application/vnd.grafeq",
    ".gqs": "application/vnd.grafeq",
    ".gram": "application/srgs",
    ".gre": "application/vnd.geometry-explorer",
    ".grv": "application/vnd.groove-injector",
    ".grxml": "application/srgs+xml",
    ".gsf": "application/x-font-ghostscript",
    ".gtar": "application/x-gtar",
    ".gtm": "application/vnd.groove-tool-message",
    ".gtw": "model/vnd.gtw",
    ".gv": "text/vnd.graphviz",
    ".gz": "application/x-gzip",
    ".h": "text/x-c",
    ".h261": "video/h261",
    ".h263": "video/h263",
    ".h264": "video/h264",
    ".hbci": "application/vnd.hbci",
    ".hdf": "application/x-hdf",
    ".hh": "text/x-c",
    ".hlp": "application/winhlp",
    ".hpgl": "application/vnd.hp-hpgl",
    ".hpid": "application/vnd.hp-hpid",
    ".hps": "application/vnd.hp-hps",
    ".hqx": "application/mac-binhex40",
    ".htke": "application/vnd.kenameaapp",
    ".htm": "text/html",
    ".html": "text/html",
    ".hvd": "application/vnd.yamaha.hv-dic",
    ".hvp": "application/vnd.yamaha.hv-voice",
    ".hvs": "application/vnd.yamaha.hv-script",
    ".icc": "application/vnd.iccprofile",
    ".ice": "x-conference/x-cooltalk",
    ".icm": "application/vnd.iccprofile",
    ".ico": "image/x-icon",
    ".ics": "text/calendar",
    ".ief": "image/ief",
    ".ifb": "text/calendar",
    ".ifm": "application/vnd.shana.informed.formdata",
    ".iges": "model/iges",
    ".igl": "application/vnd.igloader",
    ".igs": "model/iges",
    ".igx": "application/vnd.micrografx.igx",
    ".iif": "application/vnd.shana.informed.interchange",
    ".imp": "application/vnd.accpac.simply.imp",
    ".ims": "application/vnd.ms-ims",
    ".in": "text/plain",
    ".ipk": "application/vnd.shana.informed.package",
    ".irm": "application/vnd.ibm.rights-management",
    ".irp": "application/vnd.irepository.package+xml",
    ".iso": "application/octet-stream",
    ".itp": "application/vnd.shana.informed.formtemplate",
    ".ivp": "application/vnd.immervision-ivp",
    ".ivu": "application/vnd.immervision-ivu",
    ".jad": "text/vnd.sun.j2me.app-descriptor",
    ".jam": "application/vnd.jam",
    ".jar": "application/java-archive",
    ".java": "text/x-java-source",
    ".jisp": "application/vnd.jisp",
    ".jlt": "application/vnd.hp-jlyt",
    ".jnlp": "application/x-java-jnlp-file",
    ".joda": "application/vnd.joost.joda-archive",
    ".jpe": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".jpgm": "video/jpm",
    ".jpgv": "video/jpeg",
    ".jpm": "video/jpm",
    ".js": "application/javascript",
    ".json": "application/json",
    ".kar": "audio/midi",
    ".karbon": "application/vnd.kde.karbon",
    ".kfo": "application/vnd.kde.kformula",
    ".kia": "application/vnd.kidspiration",
    ".kil": "application/x-killustrator",
    ".kml": "application/vnd.google-earth.kml+xml",
    ".kmz": "application/vnd.google-earth.kmz",
    ".kne": "application/vnd.kinar",
    ".knp": "application/vnd.kinar",
    ".kon": "application/vnd.kde.kontour",
    ".kpr": "application/vnd.kde.kpresenter",
    ".kpt": "application/vnd.kde.kpresenter",
    ".ksh": "text/plain",
    ".ksp": "application/vnd.kde.kspread",
    ".ktr": "application/vnd.kahootz",
    ".ktz": "application/vnd.kahootz",
    ".kwd": "application/vnd.kde.kword",
    ".kwt": "application/vnd.kde.kword",
    ".latex": "application/x-latex",
    ".lbd": "application/vnd.llamagraphics.life-balance.desktop",
    ".lbe": "application/vnd.llamagraphics.life-balance.exchange+xml",
    ".les": "application/vnd.hhe.lesson-player",
    ".lha": "application/octet-stream",
    ".link66": "application/vnd.route66.link66+xml",
    ".list": "text/plain",
    ".list3820": "application/vnd.ibm.modcap",
    ".listafp": "application/vnd.ibm.modcap",
    ".log": "text/plain",
    ".lostxml": "application/lost+xml",
    ".lrf": "application/octet-stream",
    ".lrm": "application/vnd.ms-lrm",
    ".ltf": "application/vnd.frogans.ltf",
    ".lvp": "audio/vnd.lucent.voice",
    ".lwp": "application/vnd.lotus-wordpro",
    ".lzh": "application/octet-stream",
    ".m13": "application/x-msmediaview",
    ".m14": "application/x-msmediaview",
    ".m1v": "video/mpeg",
    ".m2a": "audio/mpeg",
    ".m2v": "video/mpeg",
    ".m3a": "audio/mpeg",
    ".m3u": "audio/x-mpegurl",
    ".m4u": "video/vnd.mpegurl",
    ".m4v": "video/x-m4v",
    ".ma": "application/mathematica",
    ".mag": "application/vnd.ecowin.chart",
    ".maker": "application/vnd.framemaker",
    ".man": "text/troff",
    ".mathml": "application/mathml+xml",
    ".mb": "application/mathematica",
    ".mbk": "application/vnd.mobius.mbk",
    ".mbox": "application/mbox",
    ".mc1": "application/vnd.medcalcdata",
    ".mcd": "application/vnd.mcd",
    ".mcurl": "text/vnd.curl.mcurl",
    ".mdb": "application/x-msaccess",
    ".mdi": "image/vnd.ms-modi",
    ".me": "text/troff",
    ".mesh": "model/mesh",
    ".mfm": "application/vnd.mfmp",
    ".mgz": "application/vnd.proteus.magazine",
    ".mht": "message/rfc822",
    ".mhtml": "message/rfc822",
    ".mid": "audio/midi",
    ".midi": "audio/midi",
    ".mif": "application/vnd.mif",
    ".mime": "message/rfc822",
    ".mj2": "video/mj2",
    ".mjp2": "video/mj2",
    ".mlp": "application/vnd.dolby.mlp",
    ".mmd": "application/vnd.chipnuts.karaoke-mmd",
    ".mmf": "application/vnd.smaf",
    ".mmr": "image/vnd.fujixerox.edmics-mmr",
    ".mny": "application/x-msmoney",
    ".mobi": "application/x-mobipocket-ebook",
    ".mov": "video/quicktime",
    ".movie": "video/x-sgi-movie",
    ".mp2": "audio/mpeg",
    ".mp2a": "audio/mpeg",
    ".mp3": "audio/mpeg",
    ".mp4": "video/mp4",
    ".mp4a": "audio/mp4",
    ".mp4s": "application/mp4",
    ".mp4v": "video/mp4",
    ".mpa": "video/mpeg",
    ".mpc": "application/vnd.mophun.certificate",
    ".mpe": "video/mpeg",
    ".mpeg": "video/mpeg",
    ".mpg": "video/mpeg",
    ".mpg4": "video/mp4",
    ".mpga": "audio/mpeg",
    ".mpkg": "application/vnd.apple.installer+xml",
    ".mpm": "application/vnd.blueice.multipass",
    ".mpn": "application/vnd.mophun.application",
    ".mpp": "application/vnd.ms-project",
    ".mpt": "application/vnd.ms-project",
    ".mpy": "application/vnd.ibm.minipay",
    ".mqy": "application/vnd.mobius.mqy",
    ".mrc": "application/marc",
    ".ms": "text/troff",
    ".mscml": "application/mediaservercontrol+xml",
    ".mseed": "application/vnd.fdsn.mseed",
    ".mseq": "application/vnd.mseq",
    ".msf": "application/vnd.epson.msf",
    ".msh": "model/mesh",
    ".msi": "application/x-msdownload",
    ".msl": "application/vnd.mobius.msl",
    ".msty": "application/vnd.muvee.style",
    ".mts": "model/vnd.mts",
    ".mus": "application/vnd.musician",
    ".musicxml": "application/vnd.recordare.musicxml+xml",
    ".mvb": "application/x-msmediaview",
    ".mwf": "application/vnd.mfer",
    ".mxf": "application/mxf",
    ".mxl": "application/vnd.recordare.musicxml",
    ".mxml": "application/xv+xml",
    ".mxs": "application/vnd.triscape.mxs",
    ".mxu": "video/vnd.mpegurl",
    ".n-gage": "application/vnd.nokia.n-gage.symbian.install",
    ".nb": "application/mathematica",
    ".nc": "application/x-netcdf",
    ".ncx": "application/x-dtbncx+xml",
    ".ngdat": "application/vnd.nokia.n-gage.data",
    ".nlu": "application/vnd.neurolanguage.nlu",
    ".nml": "application/vnd.enliven",
    ".nnd": "application/vnd.noblenet-directory",
    ".nns": "application/vnd.noblenet-sealer",
    ".nnw": "application/vnd.noblenet-web",
    ".npx": "image/vnd.net-fpx",
    ".nsf": "application/vnd.lotus-notes",
    ".nws": "message/rfc822",
    ".o": "application/octet-stream",
    ".oa2": "application/vnd.fujitsu.oasys2",
    ".oa3": "application/vnd.fujitsu.oasys3",
    ".oas": "application/vnd.fujitsu.oasys",
    ".obd": "application/x-msbinder",
    ".obj": "application/octet-stream",
    ".oda": "application/oda",
    ".odb": "application/vnd.oasis.opendocument.database",
    ".odc": "application/vnd.oasis.opendocument.chart",
    ".odf": "application/vnd.oasis.opendocument.formula",
    ".odft": "application/vnd.oasis.opendocument.formula-template",
    ".odg": "application/vnd.oasis.opendocument.graphics",
    ".odi": "application/vnd.oasis.opendocument.image",
    ".odp": "application/vnd.oasis.opendocument.presentation",
    ".ods": "application/vnd.oasis.opendocument.spreadsheet",
    ".odt": "application/vnd.oasis.opendocument.text",
    ".oga": "audio/ogg",
    ".ogg": "audio/ogg",
    ".ogv": "video/ogg",
    ".ogx": "application/ogg",
    ".onepkg": "application/onenote",
    ".onetmp": "application/onenote",
    ".onetoc": "application/onenote",
    ".onetoc2": "application/onenote",
    ".opf": "application/oebps-package+xml",
    ".oprc": "application/vnd.palm",
    ".org": "application/vnd.lotus-organizer",
    ".osf": "application/vnd.yamaha.openscoreformat",
    ".osfpvg": "application/vnd.yamaha.openscoreformat.osfpvg+xml",
    ".otc": "application/vnd.oasis.opendocument.chart-template",
    ".otf": "application/x-font-otf",
    ".otg": "application/vnd.oasis.opendocument.graphics-template",
    ".oth": "application/vnd.oasis.opendocument.text-web",
    ".oti": "application/vnd.oasis.opendocument.image-template",
    ".otm": "application/vnd.oasis.opendocument.text-master",
    ".otp": "application/vnd.oasis.opendocument.presentation-template",
    ".ots": "application/vnd.oasis.opendocument.spreadsheet-template",
    ".ott": "application/vnd.oasis.opendocument.text-template",
    ".oxt": "application/vnd.openofficeorg.extension",
    ".p": "text/x-pascal",
    ".p10": "application/pkcs10",
    ".p12": "application/x-pkcs12",
    ".p7b": "application/x-pkcs7-certificates",
    ".p7c": "application/pkcs7-mime",
    ".p7m": "application/pkcs7-mime",
    ".p7r": "application/x-pkcs7-certreqresp",
    ".p7s": "application/pkcs7-signature",
    ".pas": "text/x-pascal",
    ".pbd": "application/vnd.powerbuilder6",
    ".pbm": "image/x-portable-bitmap",
    ".pcf": "application/x-font-pcf",
    ".pcl": "application/vnd.hp-pcl",
    ".pclxl": "application/vnd.hp-pclxl",
    ".pct": "image/x-pict",
    ".pcurl": "application/vnd.curl.pcurl",
    ".pcx": "image/x-pcx",
    ".pdb": "application/vnd.palm",
    ".pdf": "application/pdf",
    ".pfa": "application/x-font-type1",
    ".pfb": "application/x-font-type1",
    ".pfm": "application/x-font-type1",
    ".pfr": "application/font-tdpfr",
    ".pfx": "application/x-pkcs12",
    ".pgm": "image/x-portable-graymap",
    ".pgn": "application/x-chess-pgn",
    ".pgp": "application/pgp-encrypted",
    ".pic": "image/x-pict",
    ".pkg": "application/octet-stream",
    ".pki": "application/pkixcmp",
    ".pkipath": "application/pkix-pkipath",
    ".pl": "text/plain",
    ".plb": "application/vnd.3gpp.pic-bw-large",
    ".plc": "application/vnd.mobius.plc",
    ".plf": "application/vnd.pocketlearn",
    ".pls": "application/pls+xml",
    ".pml": "application/vnd.ctc-posml",
    ".png": "image/png",
    ".pnm": "image/x-portable-anymap",
    ".portpkg": "application/vnd.macports.portpkg",
    ".pot": "application/vnd.ms-powerpoint",
    ".potm": "application/vnd.ms-powerpoint.template.macroenabled.12",
    ".potx": "application/vnd.openxmlformats-officedocument.presentationml.template",
    ".ppa": "application/vnd.ms-powerpoint",
    ".ppam": "application/vnd.ms-powerpoint.addin.macroenabled.12",
    ".ppd": "application/vnd.cups-ppd",
    ".ppm": "image/x-portable-pixmap",
    ".pps": "application/vnd.ms-powerpoint",
    ".ppsm": "application/vnd.ms-powerpoint.slideshow.macroenabled.12",
    ".ppsx": "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptm": "application/vnd.ms-powerpoint.presentation.macroenabled.12",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".pqa": "application/vnd.palm",
    ".prc": "application/x-mobipocket-ebook",
    ".pre": "application/vnd.lotus-freelance",
    ".prf": "application/pics-rules",
    ".ps": "application/postscript",
    ".psb": "application/vnd.3gpp.pic-bw-small",
    ".psd": "image/vnd.adobe.photoshop",
    ".psf": "application/x-font-linux-psf",
    ".ptid": "application/vnd.pvi.ptid1",
    ".pub": "application/x-mspublisher",
    ".pvb": "application/vnd.3gpp.pic-bw-var",
    ".pwn": "application/vnd.3m.post-it-notes",
    ".pwz": "application/vnd.ms-powerpoint",
    ".py": "text/x-python",
    ".pya": "audio/vnd.ms-playready.media.pya",
    ".pyc": "application/x-python-code",
    ".pyo": "application/x-python-code",
    ".pyv": "video/vnd.ms-playready.media.pyv",
    ".qam": "application/vnd.epson.quickanime",
    ".qbo": "application/vnd.intu.qbo",
    ".qfx": "application/vnd.intu.qfx",
    ".qps": "application/vnd.publishare-delta-tree",
    ".qt": "video/quicktime",
    ".qwd": "application/vnd.quark.quarkxpress",
    ".qwt": "application/vnd.quark.quarkxpress",
    ".qxb": "application/vnd.quark.quarkxpress",
    ".qxd": "application/vnd.quark.quarkxpress",
    ".qxl": "application/vnd.quark.quarkxpress",
    ".qxt": "application/vnd.quark.quarkxpress",
    ".ra": "audio/x-pn-realaudio",
    ".ram": "audio/x-pn-realaudio",
    ".rar": "application/x-rar-compressed",
    ".ras": "image/x-cmu-raster",
    ".rcprofile": "application/vnd.ipunplugged.rcprofile",
    ".rdf": "application/rdf+xml",
    ".rdz": "application/vnd.data-vision.rdz",
    ".rep": "application/vnd.businessobjects",
    ".res": "application/x-dtbresource+xml",
    ".rgb": "image/x-rgb",
    ".rif": "application/reginfo+xml",
    ".rl": "application/resource-lists+xml",
    ".rlc": "image/vnd.fujixerox.edmics-rlc",
    ".rld": "application/resource-lists-diff+xml",
    ".rm": "application/vnd.rn-realmedia",
    ".rmi": "audio/midi",
    ".rmp": "audio/x-pn-realaudio-plugin",
    ".rms": "application/vnd.jcp.javame.midlet-rms",
    ".rnc": "application/relax-ng-compact-syntax",
    ".roff": "text/troff",
    ".rpm": "application/x-rpm",
    ".rpss": "application/vnd.nokia.radio-presets",
    ".rpst": "application/vnd.nokia.radio-preset",
    ".rq": "application/sparql-query",
    ".rs": "application/rls-services+xml",
    ".rsd": "application/rsd+xml",
    ".rss": "application/rss+xml",
    ".rtf": "application/rtf",
    ".rtx": "text/richtext",
    ".s": "text/x-asm",
    ".saf": "application/vnd.yamaha.smaf-audio",
    ".sbml": "application/sbml+xml",
    ".sc": "application/vnd.ibm.secure-container",
    ".scd": "application/x-msschedule",
    ".scm": "application/vnd.lotus-screencam",
    ".scq": "application/scvp-cv-request",
    ".scs": "application/scvp-cv-response",
    ".scurl": "text/vnd.curl.scurl",
    ".sda": "application/vnd.stardivision.draw",
    ".sdc": "application/vnd.stardivision.calc",
    ".sdd": "application/vnd.stardivision.impress",
    ".sdkd": "application/vnd.solent.sdkm+xml",
    ".sdkm": "application/vnd.solent.sdkm+xml",
    ".sdp": "application/sdp",
    ".sdw": "application/vnd.stardivision.writer",
    ".see": "application/vnd.seemail",
    ".seed": "application/vnd.fdsn.seed",
    ".sema": "application/vnd.sema",
    ".semd": "application/vnd.semd",
    ".semf": "application/vnd.semf",
    ".ser": "application/java-serialized-object",
    ".setpay": "application/set-payment-initiation",
    ".setreg": "application/set-registration-initiation",
    ".sfd-hdstx": "application/vnd.hydrostatix.sof-data",
    ".sfs": "application/vnd.spotfire.sfs",
    ".sgl": "application/vnd.stardivision.writer-global",
    ".sgm": "text/sgml",
    ".sgml": "text/sgml",
    ".sh": "application/x-sh",
    ".shar": "application/x-shar",
    ".shf": "application/shf+xml",
    ".si": "text/vnd.wap.si",
    ".sic": "application/vnd.wap.sic",
    ".sig": "application/pgp-signature",
    ".silo": "model/mesh",
    ".sis": "application/vnd.symbian.install",
    ".sisx": "application/vnd.symbian.install",
    ".sit": "application/x-stuffit",
    ".sitx": "application/x-stuffitx",
    ".skd": "application/vnd.koan",
    ".skm": "application/vnd.koan",
    ".skp": "application/vnd.koan",
    ".skt": "application/vnd.koan",
    ".sl": "text/vnd.wap.sl",
    ".slc": "application/vnd.wap.slc",
    ".sldm": "application/vnd.ms-powerpoint.slide.macroenabled.12",
    ".sldx": "application/vnd.openxmlformats-officedocument.presentationml.slide",
    ".slt": "application/vnd.epson.salt",
    ".smf": "application/vnd.stardivision.math",
    ".smi": "application/smil+xml",
    ".smil": "application/smil+xml",
    ".snd": "audio/basic",
    ".snf": "application/x-font-snf",
    ".so": "application/octet-stream",
    ".spc": "application/x-pkcs7-certificates",
    ".spf": "application/vnd.yamaha.smaf-phrase",
    ".spl": "application/x-futuresplash",
    ".spot": "text/vnd.in3d.spot",
    ".spp": "application/scvp-vp-response",
    ".spq": "application/scvp-vp-request",
    ".spx": "audio/ogg",
    ".src": "application/x-wais-source",
    ".srx": "application/sparql-results+xml",
    ".sse": "application/vnd.kodak-descriptor",
    ".ssf": "application/vnd.epson.ssf",
    ".ssml": "application/ssml+xml",
    ".stc": "application/vnd.sun.xml.calc.template",
    ".std": "application/vnd.sun.xml.draw.template",
    ".stf": "application/vnd.wt.stf",
    ".sti": "application/vnd.sun.xml.impress.template",
    ".stk": "application/hyperstudio",
    ".stl": "application/vnd.ms-pki.stl",
    ".str": "application/vnd.pg.format",
    ".stw": "application/vnd.sun.xml.writer.template",
    ".sus": "application/vnd.sus-calendar",
    ".susp": "application/vnd.sus-calendar",
    ".sv4cpio": "application/x-sv4cpio",
    ".sv4crc": "application/x-sv4crc",
    ".svd": "application/vnd.svd",
    ".svg": "image/svg+xml",
    ".svgz": "image/svg+xml",
    ".swa": "application/x-director",
    ".swf": "application/x-shockwave-flash",
    ".swi": "application/vnd.arastra.swi",
    ".sxc": "application/vnd.sun.xml.calc",
    ".sxd": "application/vnd.sun.xml.draw",
    ".sxg": "application/vnd.sun.xml.writer.global",
    ".sxi": "application/vnd.sun.xml.impress",
    ".sxm": "application/vnd.sun.xml.math",
    ".sxw": "application/vnd.sun.xml.writer",
    ".t": "text/troff",
    ".tao": "application/vnd.tao.intent-module-archive",
    ".tar": "application/x-tar",
    ".tcap": "application/vnd.3gpp2.tcap",
    ".tcl": "application/x-tcl",
    ".teacher": "application/vnd.smart.teacher",
    ".tex": "application/x-tex",
    ".texi": "application/x-texinfo",
    ".texinfo": "application/x-texinfo",
    ".text": "text/plain",
    ".tfm": "application/x-tex-tfm",
    ".tgz": "application/x-gzip",
    ".tif": "image/tiff",
    ".tiff": "image/tiff",
    ".tmo": "application/vnd.tmobile-livetv",
    ".torrent": "application/x-bittorrent",
    ".tpl": "application/vnd.groove-tool-template",
    ".tpt": "application/vnd.trid.tpt",
    ".tr": "text/troff",
    ".tra": "application/vnd.trueapp",
    ".trm": "application/x-msterminal",
    ".tsv": "text/tab-separated-values",
    ".ttc": "application/x-font-ttf",
    ".ttf": "application/x-font-ttf",
    ".twd": "application/vnd.simtech-mindmapper",
    ".twds": "application/vnd.simtech-mindmapper",
    ".txd": "application/vnd.genomatix.tuxedo",
    ".txf": "application/vnd.mobius.txf",
    ".txt": "text/plain",
    ".u32": "application/x-authorware-bin",
    ".udeb": "application/x-debian-package",
    ".ufd": "application/vnd.ufdl",
    ".ufdl": "application/vnd.ufdl",
    ".umj": "application/vnd.umajin",
    ".unityweb": "application/vnd.unity",
    ".uoml": "application/vnd.uoml+xml",
    ".uri": "text/uri-list",
    ".uris": "text/uri-list",
    ".urls": "text/uri-list",
    ".ustar": "application/x-ustar",
    ".utz": "application/vnd.uiq.theme",
    ".uu": "text/x-uuencode",
    ".vcd": "application/x-cdlink",
    ".vcf": "text/x-vcard",
    ".vcg": "application/vnd.groove-vcard",
    ".vcs": "text/x-vcalendar",
    ".vcx": "application/vnd.vcx",
    ".vis": "application/vnd.visionary",
    ".viv": "video/vnd.vivo",
    ".vor": "application/vnd.stardivision.writer",
    ".vox": "application/x-authorware-bin",
    ".vrml": "model/vrml",
    ".vsd": "application/vnd.visio",
    ".vsf": "application/vnd.vsf",
    ".vss": "application/vnd.visio",
    ".vst": "application/vnd.visio",
    ".vsw": "application/vnd.visio",
    ".vtu": "model/vnd.vtu",
    ".vxml": "application/voicexml+xml",
    ".w3d": "application/x-director",
    ".wad": "application/x-doom",
    ".wav": "audio/x-wav",
    ".wax": "audio/x-ms-wax",
    ".wbmp": "image/vnd.wap.wbmp",
    ".wbs": "application/vnd.criticaltools.wbs+xml",
    ".wbxml": "application/vnd.wap.wbxml",
    ".wcm": "application/vnd.ms-works",
    ".wdb": "application/vnd.ms-works",
    ".wiz": "application/msword",
    ".wks": "application/vnd.ms-works",
    ".wm": "video/x-ms-wm",
    ".wma": "audio/x-ms-wma",
    ".wmd": "application/x-ms-wmd",
    ".wmf": "application/x-msmetafile",
    ".wml": "text/vnd.wap.wml",
    ".wmlc": "application/vnd.wap.wmlc",
    ".wmls": "text/vnd.wap.wmlscript",
    ".wmlsc": "application/vnd.wap.wmlscriptc",
    ".wmv": "video/x-ms-wmv",
    ".wmx": "video/x-ms-wmx",
    ".wmz": "application/x-ms-wmz",
    ".wpd": "application/vnd.wordperfect",
    ".wpl": "application/vnd.ms-wpl",
    ".wps": "application/vnd.ms-works",
    ".wqd": "application/vnd.wqd",
    ".wri": "application/x-mswrite",
    ".wrl": "model/vrml",
    ".wsdl": "application/wsdl+xml",
    ".wspolicy": "application/wspolicy+xml",
    ".wtb": "application/vnd.webturbo",
    ".wvx": "video/x-ms-wvx",
    ".x32": "application/x-authorware-bin",
    ".x3d": "application/vnd.hzn-3d-crossword",
    ".xap": "application/x-silverlight-app",
    ".xar": "application/vnd.xara",
    ".xbap": "application/x-ms-xbap",
    ".xbd": "application/vnd.fujixerox.docuworks.binder",
    ".xbm": "image/x-xbitmap",
    ".xdm": "application/vnd.syncml.dm+xml",
    ".xdp": "application/vnd.adobe.xdp+xml",
    ".xdw": "application/vnd.fujixerox.docuworks",
    ".xenc": "application/xenc+xml",
    ".xer": "application/patch-ops-error+xml",
    ".xfdf": "application/vnd.adobe.xfdf",
    ".xfdl": "application/vnd.xfdl",
    ".xht": "application/xhtml+xml",
    ".xhtml": "application/xhtml+xml",
    ".xhvml": "application/xv+xml",
    ".xif": "image/vnd.xiff",
    ".xla": "application/vnd.ms-excel",
    ".xlam": "application/vnd.ms-excel.addin.macroenabled.12",
    ".xlb": "application/vnd.ms-excel",
    ".xlc": "application/vnd.ms-excel",
    ".xlm": "application/vnd.ms-excel",
    ".xls": "application/vnd.ms-excel",
    ".xlsb": "application/vnd.ms-excel.sheet.binary.macroenabled.12",
    ".xlsm": "application/vnd.ms-excel.sheet.macroenabled.12",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xlt": "application/vnd.ms-excel",
    ".xltm": "application/vnd.ms-excel.template.macroenabled.12",
    ".xltx": "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
    ".xlw": "application/vnd.ms-excel",
    ".xml": "application/xml",
    ".xo": "application/vnd.olpc-sugar",
    ".xop": "application/xop+xml",
    ".xpdl": "application/xml",
    ".xpi": "application/x-xpinstall",
    ".xpm": "image/x-xpixmap",
    ".xpr": "application/vnd.is-xpr",
    ".xps": "application/vnd.ms-xpsdocument",
    ".xpw": "application/vnd.intercon.formnet",
    ".xpx": "application/vnd.intercon.formnet",
    ".xsl": "application/xml",
    ".xslt": "application/xslt+xml",
    ".xsm": "application/vnd.syncml+xml",
    ".xspf": "application/xspf+xml",
    ".xul": "application/vnd.mozilla.xul+xml",
    ".xvm": "application/xv+xml",
    ".xvml": "application/xv+xml",
    ".xwd": "image/x-xwindowdump",
    ".xyz": "chemical/x-xyz",
    ".zaz": "application/vnd.zzazz.deck+xml",
    ".zip": "application/zip",
    ".zir": "application/vnd.zul",
    ".zirz": "application/vnd.zul",
    ".zmm": "application/vnd.handheld-entertainment+xml"
  };

  /**
   Returns the mime type corresponding to the given file name's extension

   @param {String}                   fileName Name of the file
   */
  CUI.FileUpload.MimeTypes.getMimeTypeFromFileName = function (fileName) {
    var fileExtensionMatch = fileName.match(/.+(\..+)/);

    return (fileExtensionMatch ?
      CUI.FileUpload.MimeTypes[fileExtensionMatch[1]] :
      undefined);
  };
}(window.jQuery));

(function ($) {
  // @polyfill ie
  var REG_EXP = new RegExp('[^\\d.-]', 'g');

  CUI.NumberInput = new Class(/** @lends CUI.NumberInput# */{
    toString: 'NumberInput',
    extend: CUI.Widget,

    /**
     @extends CUI.Widget
     @classdesc A number input widget with increment and decrement buttons.

     @desc Creates a Number Input object
     @constructs
     @param {Object} options Component options
     @param {numberic} [options.min=NaN] (Optional) Minimum value allowed for input.
     @param {numberic} [options.max=NaN] (Optional) Maximum value allowed for input.
     @param {numberic} [options.step=1] Amount increment/decrement for input.
     @param {numberic} [options.defaultValue=0] Fallback value in case the input is empty at the beginning.
     @param {boolean} [options.hasError=false] Set the error state of the widget.
     @param {boolean} [options.disabled=false] Set the disabled state of the widget.
     */

    construct: function (options) {

      this._initMarkup();
      this._setListeners();
      this._setAttributes();
      this._makeAccessible();

    },

    defaults: {
      defaultValue: 0,
      max: null,
      min: null,
      step: 1,
      hasError: false,
      disabled: false
    },

    /**
     Increments value by step amount
     */
    increment: function () {
      if (this._isNumber()) {
        var value = this.getValue(),
            precision = this._getPrecision();
        value += this.getStep();
        value = value > this.getMax() ? this.getMax() : value;
        if (precision > 0) {
          value = parseFloat(value.toFixed(precision));
        }
        this.setValue(value);
      }
    },

    /**
     Decrements value by step amount
     */
    decrement: function () {
      if (this._isNumber()) {
        var value = this.getValue(),
            precision = this._getPrecision();
        value -= this.getStep();
        value = value < this.getMin() ? this.getMin() : value;
        if (precision > 0) {
          value = parseFloat(value.toFixed(precision));
        }
        this.setValue(value);
      }
    },

    /**
     Sets the value, which triggers the change event.  Note that value will be
     limited to the range defined by the min and max properties.
     @param value {numberic} The input value to set.
     */
    setValue: function (value) {
      this.$input.val(value);
      this.$input.trigger('change');
    },

    /**
     Sets the minimum value allowed.
     @param value {numberic} The min value to set.
     */
    setMin: function (value) {
      this.set('min', value);
      if (this.$input.attr('aria-valuemin')) {
        this.$input.attr('aria-valuemin', this.options.min); //a11y
      }

      this.$input.attr('min', this.options.min);
    },

    /**
     Sets the maximum value allowed.
     @param value {numberic} The max value to set.
     */
    setMax: function (value) {
      this.set('max', value);
      if (this.$input.attr('aria-valuemax')) {
        this.$input.attr('aria-valuemax', this.options.max); //a11y
      }

      this.$input.attr('max', this.options.max);
    },


    /**
     Sets the step value for increment and decrement.
     @param value {numberic} The step value to set.
     */
    setStep: function (value) {
      this.set('step', value);

      if (this.options.step !== 1 && this.$input.attr('step') !== this.options.step) {
        this.$input.attr('step', this.options.step);
      }
    },

    /**
     Attempts to return parseFloat for value.
     Does not attempt to parse null, undefined, or empty string.
     @return The current input value.
     */
    getValue: function () {
      var result = this.$input.val();
      if (typeof result == 'undefined' ||
        result == null ||
        result.length < 1) {
        result = '';
      } else {
        result = parseFloat(result);
      }
      return isNaN(result) ? '' : result;
    },

    /**
     @return The minimum input value allowed.
     */
    getMin: function () {
      return parseFloat(this.options.min);
    },

    /**
     @return The maximum input value allowed.
     */
    getMax: function () {
      return parseFloat(this.options.max);
    },

    /**
     @return The current increment/decrement step amount .
     */
    getStep: function () {
      return parseFloat(this.options.step);
    },

    /** @ignore */
    _initMarkup: function () {
      this.$element.addClass('coral-NumberInput');

      // get the input, and correct the input type depending on the platform
      this.$input = this.$element.find('.js-coral-NumberInput-input');
      this._switchInputType(this.$input);

      this.$decrementElement = this.$element.find('.js-coral-NumberInput-decrementButton');
      this.$incrementElement = this.$element.find('.js-coral-NumberInput-incrementButton');

      this.$liveRegion = $('<span/>')
        .addClass('u-coral-screenReaderOnly')
        .attr({
               'aria-live': 'assertive'
              }).insertAfter(this.$input);
    },

    /** @ignore */
    _liveRegionTimeout: null,
    /** @ignore */
    _clearLiveRegionTimeout: null,
    /** @ignore */
    _updateLiveRegion: function (value) {
      var self = this,
          val = value;

      clearTimeout(this._liveRegionTimeout);
      clearTimeout(this._clearLiveRegionTimeout);

      if (val === undefined || val.length === 0) {
        this.$liveRegion.text('');
      } else {
        this._liveRegionTimeout = setTimeout(function () {
          self.$liveRegion.text(val);
          self._clearLiveRegionTimeout = setTimeout(function () {
            self.$liveRegion.text('');
          }, 2000);
        }, 200);
      }
    },

    /** @ignore */
    _setListeners: function () {
      this.$input.on('change.cui-numberinput', this._changeHandler.bind(this));

      this.on('beforeChange:step', this._optionBeforeChangeHandler.bind(this));

      this.on('beforeChange:min', this._optionBeforeChangeHandler.bind(this));

      this.on('beforeChange:max', this._optionBeforeChangeHandler.bind(this));

      this.on('change:disabled', this._toggleDisabled.bind(this));

      this.on('change:hasError', this._toggleError.bind(this));

      this.on('click.cui-numberinput', 'button', this._clickIncrementOrDecrement.bind(this));

      this.on('keydown.cui-numberinput', 'input, button', this._keyDown.bind(this))
        .on('keypress.cui-numberinput, paste.cui-numberinput', 'input', this._keyPress.bind(this))
        .on('focusin.cui-numberinput', 'input, button', this._focusIn.bind(this))
        .on('focusout.cui-numberinput', 'input, button', this._focusOut.bind(this));
    },

    /** @ignore */
    _setAttributes: function () {

      if (this.$input.attr('max')) {
        this.setMax(this.$input.attr('max'));
      } else if ($.isNumeric(this.options.max)) {
        this.setMax(this.options.max);
      }

      if (this.$input.attr('min')) {
        this.setMin(this.$input.attr('min'));
      } else if ($.isNumeric(this.options.min)) {
        this.setMin(this.options.min);
      }

      if (this.$element.attr("error")) {
        this.options.hasError = true;
      }

      this.setStep(this.$input.attr('step') || this.options.step);

      this.setValue(this.$input.val() !== '' ? this.$input.val() : this.options.defaultValue);

      if (this.$element.attr('disabled') || this.$element.attr('data-disabled')) {
        this._toggleDisabled();
      }

      if (this.$element.hasClass('is-invalid') || this.$element.attr('data-error')) {
        this.set('hasError', true);
      }
    },

    /** @ignore */
    _makeAccessible: function () {
      var valueNow = this.getValue(),
          input = this.$input.get(0),
          useAriaSpinbuttonRole = input.type === 'text';

      // Determine if input[type=number] is fully supported;
      // if not, implement the WAI-ARIA design pattern for a spinbutton.
      if (!useAriaSpinbuttonRole) {
        if (typeof input.stepUp === 'function') {
          try {
            // IE10-11 triggers an INVALID_STATE_ERR
            // when the stepUp or stepDown method is called.
            input.stepUp();
            input.value = valueNow;
          } catch (err) {
            // If an error is caught,
            // implement the WAI-ARIA 'spinbutton' design pattern.
            useAriaSpinbuttonRole = true;
          }
        } else {
          useAriaSpinbuttonRole = true;
        }
      }

      if (useAriaSpinbuttonRole) {
        this.$input.attr({
          'role': 'spinbutton',
          'aria-valuenow': valueNow,
          'aria-valuetext': valueNow,
          'aria-valuemax': this.options.max,
          'aria-valuemin': this.options.min
        });
      }

      this.$incrementElement.add(this.$decrementElement)
        .attr('tabindex', -1)
        .filter('[title]:not([aria-label])')
        .each(function (i, button) {
          var $button = $(button);
          if ($.trim($button.text()).length === 0) {
            $button.append('<span class="u-coral-screenReaderOnly">' + $button.attr('title') + '</span>');
          }
        });
    },

    /** @ignore */
    _changeHandler: function (event) {
        var isSpinbutton = this.$input.is('[role="spinbutton"]');
        this._checkMinMaxViolation();
        this._adjustValueLimitedToRange();
        this._checkValidity();

        var valueNow = this.getValue();

        this.$input.attr({
          'aria-valuenow': isSpinbutton ? valueNow : null,
          'aria-valuetext': valueNow
        });  //a11y

        if (isSpinbutton && this.$input.is(':focus')) {
          this._updateLiveRegion('');
        } else {
          this._updateLiveRegion(valueNow);
        }
      },

    /** @ignore */
    _keyDown: function (event) {
      var incrementOrDecrement,
          focusInput = false,
          captureEvent = false;
      switch (event.which) {
        case 33: // pageup
        case 38: // up
          incrementOrDecrement = this.increment;
          focusInput = true;
          captureEvent = true;
          break;
        case 34: // pagedown
        case 40: // down
          incrementOrDecrement = this.decrement;
          focusInput = true;
          captureEvent = true;
          break;
        case 35: // end
          if (this.options.max !== null) {
            this.setValue(this.options.max);
          }
          focusInput = true;
          captureEvent = true;
          break;
        case 36: // home
          if (this.options.min !== null) {
            this.setValue(this.options.min);
          }
          focusInput = true;
          captureEvent = true;
          break;
      }

      if (captureEvent) {
        event.preventDefault(); //Prevents change in caret position
        event.stopImmediatePropagation();
      }

      if (incrementOrDecrement) {
        incrementOrDecrement.call(this);
      }

      // Set focus to input
      if (focusInput &&  !this.$input.is(document.activeElement)) {
        this.$input.trigger('focus');
      }
    },

    /**
      Prevents from entering non-digit characters

      @polyfill ie
      @ignore
    */
    _keyPress: function(event) {
      // Checking for 'event.which' in FF
      var newValue = this.$input.val() + String.fromCharCode(event.which || event.keyCode);
      if (newValue !== newValue.replace(REG_EXP, '')) {
        event.preventDefault();
      }
    },

    /** @ignore */
    _focusIn: function (event) {
      this.$element.addClass('is-focused');
    },

    /** @ignore */
    _focusOut: function (event) {
      this.$element.removeClass('is-focused');
      this._updateLiveRegion('');
    },

    /** @ignore */
    _clickIncrementOrDecrement: function (event) {
      var incrementOrDecrement,
          $currentTarget = $(event.currentTarget);
      if ($currentTarget.is(this.$incrementElement)) {
        incrementOrDecrement = this.increment;
      } else if ($currentTarget.is(this.$decrementElement)) {
        incrementOrDecrement = this.decrement;
      }
      if (incrementOrDecrement) {
        if (!$currentTarget.is(document.activeElement)) {
          $currentTarget.trigger('focus');
        }
        incrementOrDecrement.call(this);
      }
    },

    /** @ignore */
    _adjustValueLimitedToRange: function () {
      var value = this.getValue(),
          precision = this._getPrecision();

      if (!isNaN(value)) {
        if (value > this.getMax()) {
          value = this.getMax();
        } else if (value < this.getMin()) {
          value = this.getMin();
        }
        if (precision > 0) {
          value = parseFloat(value.toFixed(precision));
        }
      }
      this.$input.val(value);
    },

    /** @ignore */
    _checkMinMaxViolation: function () {
      var hasFocus = false;

      if (this._isNumber()) {
        this.$incrementElement.removeAttr('disabled');
        this.$decrementElement.removeAttr('disabled');

        if (this.options.max !== null && this.getValue() >= this.getMax()) {
          hasFocus = this.$incrementElement.is(document.activeElement);
          this.$incrementElement.attr('disabled', 'disabled');
        } else if (this.options.min !== null && this.getValue() <= this.getMin()) {
          hasFocus = this.$decrementElement.is(document.activeElement);
          this.$decrementElement.attr('disabled', 'disabled');
        }

        if (hasFocus) {
          this.$input.trigger('focus');
        }
      }
    },

    _checkValidity: function() {
      if (this.$input.val() === '' && this.options.defaultValue !== null) {
        this.set('hasError', false);
      } else {
        this.set('hasError', this.getValue() !== this._getSnappedValue());
      }
    },

    /** @ignore */
    _getSnappedValue:function(value) {
      var rawValue = value === undefined ? this.getValue() : value,
          snappedValue = rawValue,
          min = this.getMin(),
          max = this.getMax(),
          step = this.getStep(),
          remainder,
          precision = this._getPrecision();

      remainder = ((rawValue - (isNaN(min) ? 0 : min)) % step);

      if (Math.abs(remainder) * 2 >= step) {
        snappedValue = (rawValue - remainder) + step;
      } else {
        snappedValue = rawValue - remainder;
      }

      if (!isNaN(min) && !isNaN(max)) {
        if (snappedValue < min) {
          snappedValue = min;
        } else if (snappedValue > max) {
          snappedValue = min + Math.floor((max - min) / step) * step;
        }
      }

      // correct floating point behavior by rounding to step precision
      if (precision > 0) {
        snappedValue = parseFloat(snappedValue.toFixed(precision));
      }

      return snappedValue;
    },

    /** @ignore */
    _getPrecision: function() {
      var value = this.getValue(),
          step = this.getStep(),
          regex = /^(?:-?\d+)(?:\.(\d+))?$/g,
          valuePrecision = value.toString().replace(regex, '$1').length,
          stepPrecision = step.toString().replace(regex, '$1').length;

      return valuePrecision > stepPrecision ? valuePrecision : stepPrecision;
    },

    /** @ignore */
    _switchInputType: function ($input) {
      var correctType = 'number';

      // IE10-11 Bug, if the min is too high we get wrong validations from the ConstraintValidationAPI
      var isIE = window.navigator.userAgent.indexOf('MSIE 10.0') !== -1 ||
        !!window.navigator.userAgent.match(/Trident\/7\./);
      if (isIE) {
        $input.get(0).type = 'text';
        return;
      }

      if ($input.get(0).type === correctType) return;

      $input
        .detach()
        .attr('type', correctType)
        .insertBefore(this.$element.children(':last'));
    },

    /** @ignore */
    _isNumber: function () {
      return !isNaN(this.$input.val());
    },

    /** @ignore */
    _optionBeforeChangeHandler: function (event) {
      if (isNaN(parseFloat(event.value))) {
        // console.error('CUI.NumberInput cannot set option \'' + event.option + '\' to NaN value');
        event.preventDefault();
      } else {
        this.$input.attr(event.option, event.value);
      }
    },

    /** @ignore */
    _toggleDisabled: function () {
      if (this.options.disabled) {
        this.$incrementElement.attr('disabled', 'disabled');
        this.$decrementElement.attr('disabled', 'disabled');
        this.$input.attr('disabled', 'disabled');
      } else {
        this.$incrementElement.removeAttr('disabled');
        this.$decrementElement.removeAttr('disabled');
        this.$input.removeAttr('disabled');
      }
    },

    /** @ignore */
    _toggleError: function () {
      if (this.options.hasError) {
        this.$element.addClass('is-invalid');
        this.$input.addClass('is-invalid').attr('aria-invalid', true);
      } else {
        this.$element.removeClass('is-invalid');
        this.$input.removeClass('is-invalid').removeAttr('aria-invalid');
      }
    }
  });

  CUI.Widget.registry.register("numberinput", CUI.NumberInput);

  // Data API
  $(document).on("cui-contentloaded.data-api", function (e) {
    CUI.NumberInput.init($("[data-init~=numberinput]", e.target));
  });

}(window.jQuery));

(function ($) {

  // Instance id counter:
  var datepicker_guid = 0;

  CUI.Datepicker = new Class(/** @lends CUI.Datepicker# */{
    toString: 'Datepicker',
    extend: CUI.Widget,

    /**
     @extends CUI.Widget
     @classdesc A datepicker widget

     <pre>
     Currently there are the following data options:
     data-init="datepicker"         Inits the datepicker widget after page load
     data-disabled                  Sets field to "disabled" if given (with any non-empty value)
     data-required                  Sets field to "required" if given (with any non-empty value)
     data-stored-format             Sets the format of the date for transferring it to the server
     data-displayed-format          Sets the format of the date for displaying it to the user
     data-force-html-mode           Force to HTML mode and never use a native Date widget, if given (with any non-empty value)
     data-day-names                 JSON-array-data with the short names of all week days, starting with Sunday
     data-month-names               JSON-array-data with the names of all months, starting with January
     data-head-format               Defines headline format, default is "MMMM YYYY".
     data-start-day                 Defines the start day of the week, 0 = Sunday, 1 = Monday, etc.

     Additionally the type (date, time, datetime) and value are read from the &lt;input&gt; field.
     </pre>

     @desc Creates a datepicker from a div element
     @constructs

     @param {Object}  options                                                     Component options
     @param {Array}   [options.monthNames=english names]                          Array of strings with the name for each month with January at index 0 and December at index 11
     @param {Array}   [options.dayNames=english names]                            Array of strings with the name for each weekday with Sun at index 0 and Sat at index 6
     @param {String}  [options.type="date"]                                       Type of picker, supports date, datetime, datetime-local and time
     @param {integer} [options.startDay=0]                                        Defines the start day for the week, 0 = Sunday, 1 = Monday etc.
     @param {boolean} [options.disabled=false]                                    Is this widget disabled?
     @param {String}  [options.displayedFormat="YYYY-MM-DD[T]HH:mm[Z]"]           Displayed date (userfriendly), default is 2012-10-20 20:35
     @param {String}  [options.storedFormat="YYYY-MM-DD[T]HH:mmZ"]                Storage Date format, is never shown to the user, but transferred to the server
     @param {String}  [options.required=false]                                    Is a value required?
     @param {String}  [options.hasError=false]                                    True to display widget as erroneous, regardless if the value is required or not.
     @param {String}  [options.minDate]                                           Defines the start date of selection range. Dates earlier than minDate are not selectable.
     It must be expressed in officialDateFormat (YYYY-MM-DD) or as "today".
     @param {String}  [options.maxDate]                                           Defines the end date of selection range. Dates later than maxDate are not selectable.
     It must be expressed in officialDateFormat (YYYY-MM-DD) or as "today".
     @param {String}  [options.headFormat="MMMM YYYY"]                            Defines calendar headline format, default is "MMMM YYYY"
     @param {boolean} [options.forceHTMLMode=false]                               Force to HTML mode and never use a native Date widget, if given (with any non-empty value)
     @param {String}  [options.selectedDateTime]                                  Defines what date/time will be selected when the calendar is rendered. If nothing is specified it will be
     considerend today or current time.
     */

    defaults: {
      monthNames: null,
      dayNames: null,
      format: null,
      type: "date",
      selectedDateTime: null,
      startDay: 0,
      disabled: false,
      displayedFormat: null,
      storedFormat: null,
      headFormat: "MMMM YYYY",
      forceHTMLMode: false,
      required: false,
      hasError: false,
      minDate: null,
      maxDate: null
    },

    displayDateTime: null,
    pickerShown: false,

    construct: function () {
      this.guid = (datepicker_guid += 1);
      this._readOptionsFromMarkup();
      this._parseOptions();
      this._setupMomentJS();
      this._adjustMarkup();
      this._findElements();
      this._constructPopover();
      this._initialize();
    },

    _readOptionsFromMarkup: function () {
      var options = this.options;
      var element = this.$element;
      var $input = $(element.find("input").filter("[type^=date],[type=time]"));
      if ($input.length !== 0) {
        options.type = $input.attr("type");
      }

      [
        [ "disabled", "disabled", asBoolean ],
        [ "required", "required", asBoolean ],
        [ "displayed-format", "displayedFormat", ifDefined],
        [ "stored-format", "storedFormat", ifDefined],
        [ "force-html-mode", "forceHTMLMode", ifDefined],
        [ "day-names", "dayNames", ifTruthy],
        [ "month-names", "monthNames", ifTruthy ],
        [ "head-format", "headFormat", ifTruthy],
        [ "start-day", "startDay", asNumber],
        [ "min-date", "minDate", ifDefined],
        [ "max-date", "maxDate", ifDefined]
      ].map(function (attr) {
          var name = attr[0], field = attr[1], processor = attr[2];
          processor(element.data(name), field, options);
        });
    },

    _parseOptions: function () {
      var options = this.options;
      options.monthNames = options.monthNames || CUI.Datepicker.monthNames;
      options.dayNames = options.dayNames || CUI.Datepicker.dayNames;

      options.isDateEnabled =
        (options.type === "date") ||
          (options.type === "datetime") ||
          (options.type === "datetime-local");

      options.isTimeEnabled =
        (options.type === "time") ||
          (options.type === "datetime") ||
          (options.type === "datetime-local");

      var i = document.createElement("input");
      i.setAttribute("type", options.type);
      options.supportsInputType = i.type !== "text";

      if (options.minDate !== null) {
        if (options.minDate === "today") {
          options.minDate = moment().startOf("day");
        } else {
          if (moment(options.minDate, OFFICIAL_DATE_FORMAT).isValid()) {
            options.minDate = moment(options.minDate, OFFICIAL_DATE_FORMAT);
          } else {
            options.minDate = null;
          }
        }
      }

      if (options.maxDate !== null) {
        if (options.maxDate === "today") {
          options.maxDate = moment().startOf("day");
        } else {
          if (moment(options.maxDate, OFFICIAL_DATE_FORMAT).isValid()) {
            options.maxDate = moment(options.maxDate, OFFICIAL_DATE_FORMAT);
          } else {
            options.maxDate = null;
          }
        }
      }

      options.storedFormat = options.storedFormat || (options.type === "time" ? OFFICIAL_TIME_FORMAT : OFFICIAL_DATETIME_FORMAT);
      options.displayedFormat = options.displayedFormat || (options.type === "time" ? OFFICIAL_TIME_FORMAT : DISPLAY_FORMAT);
      options.useNativeControls = options.forceHTMLMode;

      if ((!options.forceHTMLMode) &&
        IS_MOBILE_DEVICE &&
        options.supportsInputType) {
        options.useNativeControls = true;
      }

      // If HTML5 input is used, then force to use the official format.
      if (options.useNativeControls) {
        if (options.type === 'date') {
          options.displayedFormat = OFFICIAL_DATE_FORMAT;
        } else if (options.type === 'time') {
          options.displayedFormat = OFFICIAL_TIME_FORMAT;
        } else {
          options.displayedFormat = OFFICIAL_DATETIME_FORMAT;
        }
      }
    },

    _setupMomentJS: function () {
      // Generate a language name for this picker to not overwrite any existing
      // moment.js language definition
      this.options.language = LANGUAGE_NAME_PREFIX + new Date().getTime();

      moment.locale(this.options.language, {
        months: this.options.monthNames,
        weekdaysMin: this.options.dayNames
      });
    },

    _adjustMarkup: function () {
      var $element = this.$element;

      if (!this.options.useNativeControls) {
        var id = "popguid" + this.guid;
        var idQuery = "#" + id + ".coral-Popover";
        this.$popover = $('body').find(idQuery);
        if (this.$popover.length === 0) {
          $('body').append(HTML_POPOVER.replace("%ID%", id));
          this.$popover = $('body').find(idQuery);
          if (this.options.isDateEnabled) {
            this.$popover.find(".coral-Popover-content").append(HTML_CALENDAR);
          }
        }
      } else {
        // Show native control
        this.$popover = [];
      }

      var $hiddenInput = $element.find("input[type=hidden]");

      // Always include hidden field
      if ($hiddenInput.length === 0) {
        // We prepend otherwise the InputGroup will not give round corners to the button last button
        $element.prepend("<input type=\"hidden\">");
      } else {
        // Moves it to the beginning
        $element.prepend($hiddenInput);
      }

      if (!$element.find("input[type=hidden]").attr("name")) {
        var name = $element.find("input").not("[type=hidden]").attr("name");
        $element.find("input[type=hidden]").attr("name", name);
        $element.find("input").not("[type=hidden]").removeAttr("name");
      }
    },

    _findElements: function () {
      this.$input = this.$element.find('input').not("[type=hidden]");
      this.$hiddenInput = this.$element.find('input[type=hidden]');
      this.$openButton = this.$element.find('button');
    },

    _constructPopover: function () {
      if (this.$popover.length) {
        this.popover = new Popover({
          $element: this.$popover,
          $trigger: this.$openButton,
          options: this.options,
          setDateTimeCallback: this._popoverSetDateTimeCallback.bind(this),
          hideCallback: this._popoverHideCallback.bind(this)
        });
      }
    },

    _initialize: function () {

      // we need to listen for disabled changes during
      this.on('change:disabled', this._toggleDisabled.bind(this));

      if (this.options.useNativeControls) {
        this.displayDateTime = this.options.selectedDateTime = moment(this.$input.val(), this.options.displayedFormat);
        this.$openButton.hide();
      } else {
        this._switchInputTypeToText(this.$input);
      }

      this.$openButton.on('click', this._clickHandler.bind(this));
      this.$input.on("change" + (IS_MOBILE_DEVICE ? " blur" : ""), this._inputChangedHandler.bind(this));

      // Reading input value for the first time. There may be a storage format:
      if (!this.options.selectedDateTime) {
        this._readInputVal([this.options.storedFormat, this.options.displayedFormat]);
      }

      // Set the selected date and time:
      this._setDateTime(this.options.selectedDateTime, true);
    },

    _readInputVal: function (format) {
      var value = this.$input.eq(0).val();
      if (value !== '') {
        var date = moment(value, format || this.options.displayedFormat);
        if (!date || !date.isValid()) {
          // Fallback: Try automatic guess if none of our formats match
          date = moment(new Date(value));
        }
        this.displayDateTime = this.options.selectedDateTime = date;
        if (date !== null && date.isValid()) {
          this.displayDateTime = this.options.selectedDateTime = date;
        }
      } else {
        this.displayDateTime = null;
      }
    },

    _updateState: function () {

      this._toggleDisabled();

      if (this.options.hasError ||
        (!this.options.selectedDateTime && this.options.required) ||
        (this.options.selectedDateTime && !this.options.selectedDateTime.isValid())
        ) {
        this.$element.addClass("is-invalid");
        this.$element.find("input").addClass("is-invalid");
      } else {
        this.$element.removeClass("is-invalid");
        this.$element.find("input").removeClass("is-invalid");
      }
    },

    _toggleDisabled: function() {
      if (this.options.disabled) {
        this.$element.find("input,button").attr("disabled", "disabled");
        this._hidePicker();
      } else {
        this.$element.find("input,button").removeAttr("disabled");
      }
    },

    _popoverSetDateTimeCallback: function () {
      this._setDateTime.apply(this, arguments);
      if (this.options.isTimeEnabled === false) {
        this._hidePicker();
      }
    },

    _popoverHideCallback: function () {
      this.pickerShown = false;
      this.$element.find("input").removeClass("is-highlighted");
    },

    _switchInputTypeToText: function ($input) {
      var $parent = $input.parent();
      $input.detach().attr('type', 'text').prependTo($parent);
    },

    _openNativeInput: function () {
      this.$input.trigger("click");
    },

    _clickHandler: function (event) {
      // ignores the click if the component is disabled
      if (this.options.disabled) {
        return;
      }

      if (this.pickerShown) {
        this._hidePicker();
      } else {
        // The time-out is a work-around for CUI.Popover issue #1307. Must
        // be taken out once that is fixed:
        var self = this;
        setTimeout(function () {
          self._openPicker();
        }, 100);
      }
    },

    _inputChangedHandler: function () {
      if (this.options.disabled) {
        return;
      }

      var newDate;
      if (this.$input.val() !== '') {
        newDate = moment(this.$input.val(), this.options.displayedFormat);
        this.options.hasError = newDate !== null && !isDateInRange(newDate, this.options.minDate, this.options.maxDate);
      } else {
        this.options.hasError = false;
      }
      this._setDateTime(newDate, true); // Set the date, but don't trigger a change event
    },

    _keyPress: function () {
      if (this.pickerShown) {
        // TODO: Keyboard actions
      }
    },

    _openPicker: function () {
      if (this.options.useNativeControls) {
        this._openNativeInput();
      } else {
        this._readInputVal();
        this._showPicker();
      }
    },

    _showPicker: function () {
      if (!this.pickerShown) {
        this.$element.find("input").addClass("is-highlighted");
        this.popover.show(this.displayDateTime);
        this.pickerShown = true;
      }
    },

    _hidePicker: function () {
      if (this.pickerShown) {
        this.$element.find("input").removeClass("is-highlighted");
        this.popover.hide();
        this.pickerShown = false;
      }
    },

    /**
     * Sets a new datetime object for this picker
     * @private
     */
    _setDateTime: function (date, silent) {
      this.options.selectedDateTime = this.displayDateTime = date;

      if (!date) {
        this.$input.val(""); // Clear for null values
      } else if (date.isValid()) {
        this.$input.val(date.locale(this.options.language).format(this.options.displayedFormat)); // Set only valid dates
      }

      var storage = (date && date.isValid()) ? date.locale('en').format(this.options.storedFormat) : ""; // Force to english for storage format!
      this.$hiddenInput.val(storage);

      this._updateState();

      // Trigger a change even on the input
      if (!silent) {
        this.$input.trigger('change');
      }

      // Always trigger a change event on the hidden input, since we're not listening to it internally
      this.$hiddenInput.trigger('change');
    }
  });

  CUI.Datepicker.monthNames = [
    "January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December"
  ];

  CUI.Datepicker.dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  CUI.Widget.registry.register("datepicker", CUI.Datepicker);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function (e) {
      CUI.Datepicker.init($("[data-init~=datepicker]", e.target));
    });
  }

  /**
   * Governs the generation and the interaction of the calendar and
   * time selects.
   *
   * @private
   */
  var Popover = new Class({
    toString: 'Popover',
    extend: Object,

    construct: function (options) {
      this.$element = options.$element;
      this.options = options.options;
      this.setDateTimeCallback = options.setDateTimeCallback;
      this.hideCallback = options.hideCallback;

      this.$element.popover();
      this.popover = this.$element.data("popover");
      this.popover.set({
        pointAt: options.$trigger,
        pointFrom: "bottom"
      });

      this._setupListeners();
    },

    /**
     * Public to CUI.Datepicker.
     * Allows the main component to request the calendar pop-up to be shown.
     */
    show: function (displayDateTime) {
      this.displayDateTime = displayDateTime;
      this._renderCalendar();
      if (this.options.isTimeEnabled) {
        this._renderTime();
      }
      this.popover.show();
    },

    /**
     * Public to CUI.Datepicker.
     * Allows the main component to request the calendar pop-up to be hidden.
     */
    hide: function () {
      this.popover.hide();
    },

    /**
     * Register event handlers.
     *
     * @private
     */
    _setupListeners: function () {

      // Pop show-hide:
      this.popover.on("hide", this._popupHideHandler.bind(this));

      // Calendar navigation
      this.$element.find(".coral-DatePicker-calendar").on("swipe", this._swipeHandler.bind(this));
      this.$element.on("mousedown", ".coral-DatePicker-nextMonth", this._mouseDownNextHandler.bind(this));
      this.$element.on("mousedown", ".coral-DatePicker-prevMonth", this._mouseDownPrevHandler.bind(this));

      if (this.options.isTimeEnabled) {
        // for Desktop
        this.$element.on("selected", ".coral-DatePicker-hour, .coral-DatePicker-minute", this._dropdownChangedHandler.bind(this));
        // for Mobile
        this.$element.on("change", ".coral-DatePicker-hour, .coral-DatePicker-minute", this._dropdownChangedHandler.bind(this));
      }
    },

    _popupHideHandler: function (event) {
      this.hideCallback();
    },

    _swipeHandler: function (event) {
      var d = event.direction,
        year = this.displayDateTime.year(),
        month = this.displayDateTime.month();
  
      var displayDateTime = moment([year, month, 1]);
      
      if (d === "left") {
        displayDateTime.add(1, 'months');
        this.displayDateTime = normalizeDate(displayDateTime);
        this._renderCalendar("left");
      } else if (d === "right") {
        displayDateTime.subtract(1, 'months');
        this.displayDateTime = normalizeDate(displayDateTime);
        this._renderCalendar("right");
      }
    },

    _mouseDownNextHandler: function (event) {
      event.preventDefault();
      if (this.displayDateTime) {
        var displayDateTime = moment([this.displayDateTime.year(), this.displayDateTime.month(), 1]);
        displayDateTime.add(1, 'months');
        this.displayDateTime = normalizeDate(displayDateTime);
        this._renderCalendar("left");
      }
    },

    _mouseDownPrevHandler: function (event) {
      event.preventDefault();
      if (this.displayDateTime) {
        var displayDateTime = moment([this.displayDateTime.year(), this.displayDateTime.month(), 1]);
        displayDateTime.subtract(1, 'months');
        this.displayDateTime = normalizeDate(displayDateTime);
        this._renderCalendar("right");
      }
    },

    _dropdownChangedHandler: function () {
      var hours = this._getHoursFromDropdown();
      var minutes = this._getMinutesFromDropdown();
      if (!this.options.selectedDateTime) {
        this.options.selectedDateTime = moment();
      }
      var date = this.options.selectedDateTime.hours(hours).minutes(minutes);
      this.setDateTimeCallback(date);
    },

    _tableMouseDownHandler: function (event) {
      event.preventDefault();
      var date = moment($(event.target).data("date"), OFFICIAL_DATETIME_FORMAT);
      if (this.options.isTimeEnabled) {
        var h = this._getHoursFromDropdown();
        var m = this._getMinutesFromDropdown();
        date.hours(h).minutes(m);
      }
      this.setDateTimeCallback(date);
      this._renderCalendar();
    },

    _renderCalendar: function (slide) {
      var displayDateTime = this.displayDateTime;
      if (!displayDateTime || !displayDateTime.isValid()) {
        this.displayDateTime = displayDateTime = moment();
      }

      var displayYear = displayDateTime.year();
      var displayMonth = displayDateTime.month() + 1;

      var table = this._renderOneCalendar(displayMonth, displayYear);

      var $calendar = this.$element.find(".coral-DatePicker-calendar");

      table.on("mousedown", "a", this._tableMouseDownHandler.bind(this));

      if ($calendar.find("table").length > 0 && slide) {
        this._slideCalendar(table, (slide === "left"));
      } else {
        $calendar.find("table").remove();
        $calendar.find(".coral-DatePicker-calendarSlidingContainer").remove();
        $calendar.find(".coral-DatePicker-calendarBody").append(table);
      }
    },

    _renderOneCalendar: function (month, year) {
      var heading = moment([year, month - 1, 1]).locale(this.options.language).format(this.options.headFormat);
      var title = $('<div class="coral-DatePicker-calendarHeader"><h2 class="coral-Heading coral-Heading--2">' + heading + '</h2></div>').
        append($("<button class=\"coral-MinimalButton coral-DatePicker-nextMonth\">&#x203A;</button>")).
        append($("<button class=\"coral-MinimalButton coral-DatePicker-prevMonth\">&#x2039;</button>"));
      var $calendar = this.$element.find(".coral-DatePicker-calendar");
      var header = $calendar.find(".coral-DatePicker-calendarHeader");
      if (header.length > 0) {
        header.replaceWith(title);
      } else {
        $calendar.prepend(title);
      }

      var table = $("<table>");
      table.data("date", year + "/" + month);

      var html = "<tr>";
      var day = null;
      for (var i = 0; i < 7; i++) {
        day = (i + this.options.startDay) % 7;
        var dayName = this.options.dayNames[day];
        html += "<th><span>" + dayName + "</span></th>";
      }
      html += "</tr>";
      table.append("<thead>" + html + "</thead>");

      var firstDate = moment([year, month - 1, 1]);
      var monthStartsAt = (firstDate.day() - this.options.startDay) % 7;
      if (monthStartsAt < 0) monthStartsAt += 7;

      html = "";
      var today = moment();

      for (var w = 0; w < 6; w++) {
        html += "<tr>";
        for (var d = 0; d < 7; d++) {
          day = (w * 7 + d) - monthStartsAt;
          var displayDateTime = moment([year, month - 1]);
          // we use add() since 'day' could be a negative value
          displayDateTime.add(day, 'days');
          
          var isCurrentMonth = (displayDateTime.month() + 1) === parseFloat(month);
          var cssClass = "";

          if (isSameDay(displayDateTime, today)) {
            cssClass += " today";
          }

          if (isSameDay(displayDateTime, this.options.selectedDateTime)) {
            cssClass += " selected";
          }

          if (isCurrentMonth && isDateInRange(displayDateTime, this.options.minDate, this.options.maxDate)) {
            html += "<td class=\"" + cssClass + "\"><a href=\"#\" data-date=\"" + displayDateTime.locale(this.options.language).format(OFFICIAL_DATETIME_FORMAT) + "\">" + displayDateTime.date() + "</a></td>";
          } else {
            html += "<td class=\"" + cssClass + "\"><span>" + displayDateTime.date() + "</span></td>";
          }
        }
        html += "</tr>";
      }
      table.append("<tbody>" + html + "</tbody>");

      return table;
    },

    _slideCalendar: function (newtable, isLeft) {

      var containerClass = "coral-DatePicker-calendarSlidingContainer";
      this.$element.find(".coral-DatePicker-calendarSlidingContainer table").stop(true, true);
      this.$element.find(".coral-DatePicker-calendarSlidingContainer").remove();

      var oldtable = this.$element.find("table");
      var width = oldtable.width();
      var height = oldtable.height();

      var container = $("<div class=\"coral-DatePicker-calendarSlidingContainer\">");

      container.css({"display": "block",
        "position": "relative",
        "width": width + "px",
        "height": height + "px",
        "overflow": "hidden"});

      this.$element.find(".coral-DatePicker-calendarBody").append(container);
      container.append(oldtable).append(newtable);
      oldtable.css({"position": "absolute", "left": 0, "top": 0});
      oldtable.after(newtable);
      newtable.css({"position": "absolute", "left": (isLeft) ? width : -width, "top": 0});

      oldtable.animate({"left": (isLeft) ? -width : width}, TABLE_ANIMATION_SPEED, function () {
        oldtable.remove();
      });

      newtable.animate({"left": 0}, TABLE_ANIMATION_SPEED, function () {
        if (container.parents().length === 0) {
          // We already were detached!
          return;
        }
        newtable.css({"position": "relative", "left": 0, "top": 0});
        newtable.detach();
        this.$element.find(".coral-DatePicker-calendarBody").append(newtable);
        container.remove();
      }.bind(this));
    },

    _renderTime: function () {

      // datepicker should set the current time as default when no time is set
      var selectedTime = this.options.selectedDateTime || moment();
      var html = $(HTML_CLOCK_ICON);

      // Hours
      var hourSelect = $('<select class="coral-Select-select"></select>');
      for (var h = 0; h < 24; h++) {
        var hourOption = $('<option>' + padSingleDigit(h) + '</option>');
        if (selectedTime && h === selectedTime.hours()) {
          hourOption.attr('selected', 'selected');
        }
        hourSelect.append(hourOption);
      }
      var hourDropdown = $(HTML_HOUR_DROPDOWN).append(hourSelect);

      // Minutes
      var minuteSelect = $('<select class="coral-Select-select"></select>');
      for (var m = 0; m < 60; m++) {
        var minuteOption = $('<option>' + padSingleDigit(m) + '</option>');
        if (selectedTime && m === selectedTime.minutes()) {
          minuteOption.attr('selected', 'selected');
        }
        minuteSelect.append(minuteOption);
      }
      var minuteDropdown = $(HTML_MINUTE_DROPDOWN).append(minuteSelect);

      $(hourDropdown).css(STYLE_POSITION_RELATIVE);
      $(hourDropdown).find('coral-Select').css(STYLE_DROPDOWN_SELECT);
      $(minuteDropdown).css(STYLE_POSITION_RELATIVE);
      $(minuteDropdown).find('coral-Select').css(STYLE_DROPDOWN_SELECT);

      html.append(hourDropdown, $("<span>:</span>"), minuteDropdown);

      if (this.$element.find(".coral-DatePicker-timeControls").length === 0) {
        this.$element.find(".coral-Popover-content").append(html);
      } else {
        this.$element.find(".coral-DatePicker-timeControls").empty().append(html.children());
      }

      // Set up dropdowns
      $(hourDropdown).select();
      $(minuteDropdown).select();
    },

    _getHoursFromDropdown: function () {
      return parseInt(this.$element.find('.coral-DatePicker-timeControls .coral-DatePicker-hour .coral-Select-select').val(), 10);
    },

    _getMinutesFromDropdown: function () {
      return parseInt(this.$element.find('.coral-DatePicker-timeControls .coral-DatePicker-minute .coral-Select-select').val(), 10);
    }

  });

  /**
   * Static
   */

  function padSingleDigit(s) {
    if (s < 10) return "0" + s;
    return s;
  }

  function ifDefined(value, field, options) {
    if (value !== undefined) {
      options[field] = value;
    }
  }

  function asBoolean(value, field, options) {
    options[field] = value ? true : false;
  }

  function ifTruthy(value, field, options) {
    options[field] = value || options[field];
  }

  function asNumber(value, field, options) {
    if (value !== undefined) {
      options[field] = value * 1;
    }
  }

  function normalizeDate(date) {
    if (!date) return null;
    return moment([date.year(), date.month(), date.date()]);
  }

  function isDateInRange(date, startDate, endDate) {
    if (startDate === null && endDate === null) {
      return true;
    }
    if (startDate === null) {
      return date <= endDate;
    } else if (endDate === null) {
      return date >= startDate;
    } else {
      return (startDate <= date && date <= endDate);
    }
  }

  function isSameDay(d1, d2) {
    if (d1 && d2) {
      return d1.year() === d2.year() && d1.month() === d2.month() && d1.date() === d2.date();
    }
  }

  var
    IS_MOBILE_DEVICE = navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone|iPad|iPod/i),
    OFFICIAL_DATE_FORMAT = 'YYYY-MM-DD',
    OFFICIAL_TIME_FORMAT = 'HH:mm',
    OFFICIAL_DATETIME_FORMAT = 'YYYY-MM-DD[T]HH:mmZ',
    DISPLAY_FORMAT = 'YYYY-MM-DD HH:mm',
    LANGUAGE_NAME_PREFIX = 'coralui_',

    HTML_CALENDAR = [
      '<div class="coral-DatePicker-calendar">',
      '<div class="coral-DatePicker-calendarHeader"></div>',
      '<div class="coral-DatePicker-calendarBody"></div>',
      '</div>'
    ].join(''),
    HTML_POPOVER = [
      '<div class="coral-Popover coral-Popover--datepicker" style="display:none" id="%ID%">',
      '<div class="coral-Popover-content"></div>',
      '</div>'
    ].join(''),

    HTML_CLOCK_ICON = '<div class="coral-DatePicker-timeControls"><i class="coral-Icon coral-Icon--clock coral-Icon--small"></i></div>',
    HTML_HOUR_DROPDOWN = '<div class="coral-Select coral-DatePicker-hour"><button class="coral-Select-button coral-MinimalButton"><span class="coral-Select-button-text"></span></button></div>',
    HTML_MINUTE_DROPDOWN = '<div class="coral-Select coral-DatePicker-minute"><button class="coral-Select-button coral-MinimalButton"><span class="coral-Select-button-text"></span></button></div>',

    STYLE_POSITION_RELATIVE = {
      'position': 'relative'
    },
    STYLE_DROPDOWN_SELECT = {
      'position': 'absolute',
      'left': '1.5rem',
      'top': '1rem'
    },

    TABLE_ANIMATION_SPEED = 400;

}(window.jQuery));

(function ($) {
  CUI.Switch = new Class(/** @lends CUI.Switch# */{
    toString: 'Switch',
    extend: CUI.Widget,

    construct: function (options) {
      this._initMarkup();
      this._setListeners();
    },

    /** @ignore */
    _initMarkup: function () {

      //  This correct
      this._correctElementTagName();

      this.$input = this.$element.find('.coral-Switch-input');
      this.$onLabel = this.$element.find('.coral-Switch-onLabel');
      this.$offLabel = this.$element.find('.coral-Switch-offLabel');

      this._makeAccessible();
    },

    /**
      Replaces label element with a span element.

      If the $element is a label, both 'On' and 'Off'
      will be announced by screen readers along with any
      explicit label for the $input element, which is undesireable.
      @ignore
     */
    _correctElementTagName: function () {
      var $newElement, attributes;

      if (!this.$element.is('label')) {
        return;
      }

      $newElement = $('<span/>');

      attributes = this.$element.prop("attributes");

      // loop through $element attributes and apply them on $newElement
      $.each(attributes, function() {
          $newElement.attr(this.name, this.value);
      });

      $newElement.insertBefore(this.$element).append(this.$element.children());
      this.$element.remove();
      this.$element = $newElement;
    },

    /** @ignore */
    _makeAccessible: function() {
      var self = this,
          labelIDs,
          checked = self.$input.is(':checked'),
          isMacLike = /(mac|iphone|ipod|ipad)/i.test(window.navigator.platform),
          isFirefox = /firefox/i.test(window.navigator.userAgent);

      if (!this.$input.attr('id')) {
        this.$input.attr('id', CUI.util.getNextId());
      }

      if (!this.$offLabel.attr('id')) {
        this.$offLabel.attr('id', CUI.util.getNextId());
      }

      if (!this.$onLabel.attr('id')) {
        this.$onLabel.attr('id', CUI.util.getNextId());
      }

      if (!isMacLike) {
        this.$input.attr({
          'role': 'button',
          'aria-pressed': checked
        });
      }

      this.$offLabel.attr({
        'role': 'presentation',
        'aria-hidden': checked
      });

      this.$onLabel.attr({
        'role': 'presentation',
        'aria-hidden': !checked
      });

      if (this.$input.attr('aria-label') || (this.$input.attr('aria-labelledby') && $('#' + this.$input.attr('aria-labelledby').split(' ')[0]).length)) {
        return;
      }

      // check to see if the switch $element is wrapped in a label
      this.$labels = this.$element.closest('label');

      // If it is wrapped in a label, screen readers will announce both
      // 'On' and 'Off' along with any other label content, which can be pretty annoying.
      // This unwraps the switch $element and appends it as a sibling of the label.
      if (this.$labels.length === 1) {
        // Make sure that the label wrapping the switch $element is
        // explicitly associated with the $input using the for attribute.
        if (this.$labels.attr('for') !== this.$input.attr('id')) {
          this.$labels.attr('for', this.$input.attr('id'));
        }
        // If the label text comes before the switch $element,
        // insert the $element after the label,
        // otherwise insert the $element before the label.
        var beforeOrAfter = (this.$labels.contents()
          .filter(function() {
            return (this.nodeType === 3 && $.trim(this.nodeValue).length) || this.nodeType === 1;
          }).index(this.$element) === 0) ? 'Before' : 'After';
        this.$element['insert'+ beforeOrAfter](this.$labels);
      } else {
        this.$labels = $('label[for="' + this.$input.attr('id') + '"]').not(this.$offLabel).not(this.$onLabel);

        if (this.$labels.length === 0) {
          this.$labels = this.$labels.add(this.$offLabel).add(this.$onLabel);
        }

        if (this.$labels.length > 0) {
          labelIDs = [];

          this.$labels.each(function(i, label) {
            var $label = $(label),
                isOnLabel = $label.is(self.$onLabel),
                isOffLabel = $label.is(self.$offLabel);

            if (!$label.attr('id')) {
              $label.attr('id', CUI.util.getNextId());
            }

            if ((!isOnLabel && !isOffLabel) || (isOnLabel && checked) || (isOffLabel && !checked)) {
              labelIDs.push($label.attr('id'));
            }
          });

          if (labelIDs.length > 0) {
            this.$input.attr('aria-labelledby', labelIDs.join(' '));
          }
        }
      }

      // HACK: In Firefox on OSX, VoiceOver favors aria-describedby over label which is undesireable.
      if (isMacLike && isFirefox) {
        return;
      }
      this.$input.attr('aria-describedby', checked ? this.$onLabel.attr('id') : this.$offLabel.attr('id'));
    },

    /** @ignore */
    _setListeners: function () {
      this.$input.on('change', function(event) {
        var checked = this.$input.is(':checked'),
            onLabelId = this.$onLabel.attr('id'),
            offLabelId = this.$offLabel.attr('id'),
            ariaLabelledBy = this.$input.attr('aria-labelledby');

        if (ariaLabelledBy) {
          ariaLabelledBy = ariaLabelledBy.replace((checked ? offLabelId : onLabelId), (checked ? onLabelId : offLabelId));
          this.$input.attr('aria-labelledby', ariaLabelledBy);
        }

        this.$input
          .filter('[aria-describedby]').attr('aria-describedby', checked ? this.$onLabel.attr('id') : this.$offLabel.attr('id'))
          .filter('[aria-pressed]').attr('aria-pressed', checked);

        this.$onLabel.attr('aria-hidden', !checked);

        this.$offLabel.attr('aria-hidden', checked);

      }.bind(this));
      this.$input.trigger('change');
    },
  });

  CUI.Widget.registry.register("Switch", CUI.Switch);

  // Data API
  $(document).on("cui-contentloaded.data-api", function (e) {
    CUI.Switch.init($("[data-init~=switch], .coral-Switch", e.target));
  });

}(window.jQuery));

/*
 ADOBE CONFIDENTIAL

 Copyright 2013 Adobe Systems Incorporated
 All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and may be covered by U.S. and Foreign Patents,
 patents in process, and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.
 */
(function ($) {
  function cloneLeft(buttons) {
    return buttons.filter("[data-action=prev], [data-action=cancel]").first().addClass("u-coral-hidden")
      .clone(true).addClass("coral-Wizard-backButton").each(processButton);
  }

  function cloneRight(buttons) {
    return buttons.filter("[data-action=next]").first().addClass("u-coral-hidden")
      .clone(true).addClass("coral-Button--primary coral-Wizard-nextButton").each(processButton);
  }

  function cloneCancel(buttons) {
    return buttons.filter("[data-action=cancel]").first()
      .clone(true).addClass("coral-Button--quiet coral-Wizard-nextButton").each(processButton);
  }

  function processButton(i, el) {
    $(el).removeClass("u-coral-hidden").addClass("coral-Button");
  }

  function buildNav(wizard, sections) {
    var nav = wizard.children(".js-coral-Wizard-nav");

    if (nav.length === 0) {
      wizard.prepend(function () {
        nav = $(
          "<nav class=\"js-coral-Wizard-nav coral-Wizard-nav coral--dark coral-Background coral-Text\">" +
            "<ol class=\"coral-Wizard-steplist\"></ol>" +
          "</nav>");
        var ol = nav.children("ol");

        sections.map(function () {
          return $("<li class=\"js-coral-Wizard-steplist-item coral-Wizard-steplist-item\"></li>").
                      text($(this).data("stepTitle") || this.title).get(0);
        }).appendTo(ol);

        return nav;
      });
    }

    if (!nav.hasClass('coral--light')) {
      nav.addClass("coral--dark");
    }

    nav.find(".js-coral-Wizard-steplist-item:first").addClass("is-active");

    var buttons = sections.first().find(".js-coral-Wizard-step-control");

    nav.prepend(function () {
      return cloneLeft(buttons);
    }).append(function () {
      return cloneRight(buttons).add(cloneCancel(buttons).toggleClass("u-coral-hidden", true));
    });
  }

  function insertAfter(wizard, step, refStep) {
    var index = wizard.children(".js-coral-Wizard-step").index(refStep),
        refNavStep = wizard.children(".js-coral-Wizard-nav").find(".js-coral-Wizard-steplist-item").eq(index),
        navStep = refNavStep.clone().text(step.data("stepTitle") || step.attr("title")).removeClass("is-active is-stepped");

    hideStep(step);

    refNavStep.after(navStep);
    refStep.after(step);
  }

  function showNav(to) {
    if (to.length === 0) return;

    to.addClass("is-active").removeClass("is-stepped");

    to.prevAll(".js-coral-Wizard-steplist-item").addClass("is-stepped").removeClass("is-active");
    to.nextAll(".js-coral-Wizard-steplist-item").removeClass("is-active is-stepped");
  }

  function hideStep(step) {
    if (step && step.length) {
      step.addClass("u-coral-hidden");
    }
  }

  function showStep(step) {
    if (step && step.length) {
      step.removeClass("u-coral-hidden");
    }
  }

  function changeStep(wizard, to, from) {
    if (to.length === 0) return;

    hideStep(from);
    showStep(to);

    wizard.trigger("flexwizard-stepchange", [to, from]);
  }

  function controlWizard(wizard, action) {
    var nav = wizard.children(".js-coral-Wizard-nav");
    var from = wizard.children(".js-coral-Wizard-step:not(.u-coral-hidden)");
    var fromNav = nav.find(".js-coral-Wizard-steplist-item.is-active");

    var to, toNav;
    switch (action) {
      case "prev":
        to = from.prev(".js-coral-Wizard-step");
        toNav = fromNav.prev(".js-coral-Wizard-steplist-item");
        break;
      case "next":
        to = from.next(".js-coral-Wizard-step");
        toNav = fromNav.next(".js-coral-Wizard-steplist-item");
        break;
      case "cancel":
        return;
    }

    if (to.length === 0) return;

    var buttons = to.find(".js-coral-Wizard-step-control");

    cloneLeft(buttons).replaceAll(nav.children(".coral-Wizard-backButton"));
    cloneRight(buttons).replaceAll(nav.children(".coral-Wizard-nextButton:not([data-action=cancel])"));

    nav.children(".coral-Wizard-nextButton[data-action=cancel]").toggleClass("u-coral-hidden", to.prev(".js-coral-Wizard-step").length === 0);

    showNav(toNav);
    changeStep(wizard, to, from);
  }

  CUI.FlexWizard = new Class(/** @lends CUI.FlexWizard# */{
    toString: "FlexWizard",

    extend: CUI.Widget,

    /**
     @extends CUI.Widget
     @classdesc Wizard component
     @desc Creates a new wizard
     @constructs
     */
    construct: function (options) {
      var wizard = this.$element,
          steps = wizard.find(".js-coral-Wizard-step");

      buildNav(wizard, steps);

      wizard.on("click", ".js-coral-Wizard-step-control", function (e) {
        controlWizard(wizard, $(this).data("action"));
      });

      hideStep(steps);
      changeStep(wizard, steps.first());
    },

    /**
     Goes to the previous step. If there is no previous step, this method does nothing.
     */
    prevStep: function() {
      controlWizard(this.$element, "prev");
    },

    /**
     Goes to the next step. If there is no next step, this method does nothing.
     */
    nextStep: function() {
      controlWizard(this.$element, "next");
    },

    /**
     Adds the given step to the wizard.

     @param {HTMLElement|jQuery|String} step The step to be added
     @param {Number} [index] The index the step is added. If not passed, the step is added as the last one
     */
    add: function (step, index) {
      var wizard = this.$element;

      if (index === undefined) {
        this.addAfter(step, wizard.children(".js-coral-Wizard-step").last());
        return;
      }

      if (!step.jquery) {
        step = $(step);
      }

      step.addClass("js-coral-Wizard-step");
      insertAfter(wizard, step, wizard.children(".js-coral-Wizard-step").eq(index));
    },

    /**
     Adds the given step after the given reference step.

     @param {HTMLElement|jQuery|String} step The step to be added
     @param {HTMLElement|jQuery} refStep The reference step
     */
    addAfter: function (step, refStep) {
      var wizard = this.$element;

      if (!step.jquery) {
        step = $(step);
      }

      if (!refStep.jquery) {
        refStep = $(refStep);
      }

      step.addClass("js-coral-Wizard-step");
      insertAfter(wizard, step, refStep);
    },

    /**
     Removes the given step from the wizard. The step is detached from the
     DOM and returned. If the current step is removed, the resulting
     behaviour is undefined.

     @param {HTMLElement|jQuery} step The step to be removed
     @returns {jQuery} The removed step (as it was passed to the function)
     */
    remove: function(step) {
      var wizard = this.$element;
      var $step = step.jquery ? step : $(step);

      var index = wizard.children(".js-coral-Wizard-step").index($step);
      wizard.find(".js-coral-Wizard-steplist-item").eq(index).remove();
      $step.detach();

      return step;
    }
  });

  CUI.Widget.registry.register("flexwizard", CUI.FlexWizard);

  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function (e) {
      CUI.FlexWizard.init($("[data-init~=flexwizard]", e.target));
    });
  }
}(window.jQuery));

(function ($, window, undefined) {
/**
 HTTP Utility functions used by CoralUI colorpicker for color transformation

 @namespace
 */
CUI.util.color = {
    
    /**
     * Transforms a string color or part of color (r,g,b) into a hexa value
     * @static
     * @param {String} x The string color or part of color
     * @return {String} Hexa representation
     */
    hex : function (x) {
        return ("0" + parseInt(x, 10).toString(16)).slice(-2);
    },
    
    /**
     * Transforms a hexa color into RGB representation
     * @static
     * @param {String} hex The string color hexa representation
     * @return {Object} {r, g, b}
     */
    HexToRGB : function(hex) {
        hex = parseInt(((hex.indexOf("#") > -1) ? hex.substring(1) : hex), 16);
        return {
            r : hex >> 16,
            g : (hex & 0x00FF00) >> 8,
            b : (hex & 0x0000FF)
        };
    },
    
    /**
     * Transforms a rgba color into RGB representation
     * @static
     * @param {String} hex The string color rgba representation
     * @return {String} Hexa representation of the color
     */
    RGBAToHex : function(rgbaVal) {
        var rgba = rgbaVal.substring(rgbaVal.indexOf('(') + 1, rgbaVal.lastIndexOf(')')).split(/,\s*/);
        return '#' + this.hex(rgba[0]) + this.hex(rgba[1]) + this.hex(rgba[2]);
    },
    
    /**
     * Transforms a rgb color into hexa representation
     * @static
     * @param {Object} {r, g, b}
     * @return {String} The string color hexa representation
     */
    RGBToHex : function(rgb) {
        return '#' + this.hex(rgb.r) + this.hex(rgb.g) + this.hex(rgb.b);
    },
    
    /**
     * Transforms a cmyk color into RGB representation
     * @static
     * @param {Object} {c, m, y, k}
     * @return {Object} {r, g, b}
     */
    CMYKtoRGB : function (cmyk){
        var result = {r:0, g:0, b:0};
 
        var c = parseInt(cmyk.c, 10) / 100;
        var m = parseInt(cmyk.m, 10) / 100;
        var y = parseInt(cmyk.y, 10) / 100;
        var k = parseInt(cmyk.k, 10) / 100;
 
        result.r = 1 - Math.min( 1, c * ( 1 - k ) + k );
        result.g = 1 - Math.min( 1, m * ( 1 - k ) + k );
        result.b = 1 - Math.min( 1, y * ( 1 - k ) + k );
 
        result.r = Math.round( result.r * 255 );
        result.g = Math.round( result.g * 255 );
        result.b = Math.round( result.b * 255 );
 
        return result;
    },
 
    /**
     * Transforms a rgb color into cmyk representation
     * @static
     * @param {Object} {r, g, b}
     * @return {Object} {c, m, y, k}
     */
    RGBtoCMYK : function (rgb){
        var result = {c:0, m:0, y:0, k:0};
        
        if (parseInt(rgb.r, 10) === 0 && parseInt(rgb.g, 10) === 0 && parseInt(rgb.b, 10) === 0) {
            result.k = 100;
            return result;
        }
 
        var r = parseInt(rgb.r, 10) / 255;
        var g = parseInt(rgb.g, 10) / 255;
        var b = parseInt(rgb.b, 10) / 255;
 
        result.k = Math.min( 1 - r, 1 - g, 1 - b );
        result.c = ( 1 - r - result.k ) / ( 1 - result.k );
        result.m = ( 1 - g - result.k ) / ( 1 - result.k );
        result.y = ( 1 - b - result.k ) / ( 1 - result.k );
 
        result.c = Math.round( result.c * 100 );
        result.m = Math.round( result.m * 100 );
        result.y = Math.round( result.y * 100 );
        result.k = Math.round( result.k * 100 );
 
        return result;
    },
    
    /**
     * Corrects a hexa value, if it is represented by 3 or 6 characters with or without '#'
     * @static
     * @param {String} hex The string representation of the hexa value
     * @return {String} Hexa corrected string or empty string if tghe hex value is not valid
     */
    fixHex : function(hex) {
        if (hex.length === 3) {
            hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) +
                    hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
        }
        if (hex.indexOf("#") === -1) {
            hex = "#" + hex;
        }
        var isOk = /(^#[0-9A-F]{6})|(^#[0-9A-F]{3})$/i.test(hex);
        if (!isOk) {
            this.$element.find("[name=':hex']").val("");
            return "";
        }

        return hex;
    },
    
    /**
     * Compares string representations of 2 colors
     * @static
     * @param {String} c1 The string representation of the first color
     * @param {String} c2 The string representation of the seccond color
     * @return {Boolean} True if they are equal, false otherwise
     */
    isSameColor : function(c1, c2) {
        return c1 && c2 && (c1 === c2);
    },
    
    isValid : function(colorFormat, colorAsStr){
        if(colorAsStr.indexOf(colorFormat) != -1){
            return this.fixHex(this.RGBAToHex(colorAsStr)) !== "";
        }
        return false;
    }

};

}(jQuery, this));
(function ($) {

  var COLORPICKER_FOOTER_TEMPLATE = "<div class=\"coral-ButtonGroup navigation-bar\"></div>";
  var CLASSIC_PALETTE_BUTTON = "<button class='coral-ButtonGroup-item coral-Button coral-Button--secondary' id='classicButton'><i class=\"coral-Icon coral-Icon--viewGrid\"></i></button>";
  var EDIT_BUTTON = "<button class='coral-ButtonGroup-item coral-Button coral-Button--secondary' id='editButton'><i class=\"coral-Icon coral-Icon--edit\"></i></button>";
  var COLOR_SLIDER_BUTTON = "<button class='coral-ButtonGroup-item coral-Button coral-Button--secondary'><i class=\"coral-Icon coral-Icon--properties\"></i></button>";
  var EDIT_MODE = "editMode";
  var CLASSIC_MODE = "classicMode";

  CUI.Colorpicker = new Class(
    /** @lends CUI.Colorpicker# */
    {
      toString: 'Colorpicker',

      extend: CUI.Widget,

      defaults: {
        config: {
          colors: {},
          displayModes: {}
        },
        disabled: false,
        name: null,
        title: ""
      },

      palettePageSize: 3,
      colorShadeNo: 6,
      lowerLimit: 0,
      upperLimit: 0,
      colorNames: [],
      currentPage: 0,
      pages: 1,

      /**
       * @extends CUI.Widget
       * @classdesc Colorpicker will create markup after the template.
       *
       * @desc Creates a new colorpicker
       * @constructs
       */
      construct: function (options) {
        this._readDataFromMarkup();
        this._adjustMarkup();

        if (this.options.config === null ||
          this.options.config.colors.length === 0) {
          this.options.disabled = true;
        }
        if (!this.options.disabled &&
          (this.options.config.displayModes.classicPalette && this.options.config.displayModes.freestylePalette)) {
          this.options.disabled = true;
        }
        if (!this.options.disabled &&
          (this.options.config.displayModes.length === 0 || (!this.options.config.displayModes.classicPalette && !this.options.config.displayModes.freestylePalette))) {
          this.options.config.displayModes.classicPalette = true;
        }

        this.$openButton = this.$element
          .find('.coral-ColorPicker-button');
        this.$hiddenInput = this.$element.find("input[name='" +
          this.options.name + "']");

        if (this.$element.attr("value")) {
          var initialVal = this.$element.attr("value");
          if (CUI.util.color.isValid("rgba", initialVal) || CUI.util.color.isValid("rgb", initialVal)) {
            this._setColor(initialVal);
          } else {
            this.$element.removeAttr("value");
          }

        }

        if (this.options.disabled) {
          this.$element.find(">.coral-ColorPicker-button").attr("disabled",
            "disabled");
        } else {
          this.colorNames = [];
          $.each(this.options.config.colors,
            function (key, value) {
              this.colorNames.push(key);
            }.bind(this));
          $(document).off("tap." + this.options.name + " click." + this.options.name)
                     .on("tap." + this.options.name + " click." + this.options.name, function (event) {
                if (!this.keepShown) {
                  if (this.$popover.has(event.target).length === 0) {
                    this._hidePicker();
                  }
                }
              }.bind(this));

          this.$openButton.on("touchstart click", function (event) {
            try {
              if (!this.pickerShown) {
                this._openPicker();
              } else {
                this._hidePicker();
              }
              this.keepShown = true;
              setTimeout(function () {
                this.keepShown = false;
              }.bind(this), 200);
            } catch (e) {
//                                console.log(e.message);
            }

          }.bind(this));
        }

      },

      _readDataFromMarkup: function () {

        if (this.$element.data("disabled")) {
          this.options.disabled = true;
        }

        if (this.$element.data("name")) {
          this.options.name = this.$element.data("name");
        }

        if (this.$element.attr("title")) {
          this.options.title = this.$element.attr("title");
        }

        var el = this.$element;
        if (el.data('config') !== undefined) {
          this.options.config = {};
          this.options.config.colors = {};
          this.options.config.displayModes = {};
          if (el.data('config').colors) {
            this.options.config.colors = el.data('config').colors;
          } else {
            this.options.disabled = true;
          }
          if (el.data('config').pickerModes) {
            this.options.config.displayModes = el.data('config').pickerModes;
          }
        }
      },

      _adjustMarkup: function () {
        this.$popover = this.$element.find(".coral-Popover");

        if (this.$popover.length === 0) {
          this.$popover = $('<div class="coral-Popover"><div class="coral-ColorPicker-popover-inner coral-Popover-content"></div><div class="coral-ColorPicker-popover-arrow coral-Popover-arrow coral-Popover-arrow--up"></div></div>');

          this.$element
            .append(this.$popover);
          this.$element
            .find(".coral-ColorPicker-popover-inner")
            .append(
              '<div class="colorpicker-holder"><div class="palette-header"></div><div class="colorpicker-body"></div><div class="colorpicker-footer"></div></div>');
        }

        /*this.$popoverWidget = new CUI.Popover({
          element: this.$popover
        });*/

        if (this.$element.find("input[type=hidden]").length === 0) {
          this.$element.append("<input type=\"hidden\" name=\"" +
            this.options.name + "\">");
        }

        var $button = this.$element
          .find('.coral-ColorPicker-button');
        if ($button.attr('type') === undefined) {
          $button.attr('type', 'button');
        }

        $button.attr("data-toggle", "popover");
        $button.attr("data-point-from", "bottom");
      },

      _openPicker: function () {

        this._renderPicker(CLASSIC_MODE);
        this._renderPickerFooter();

        this.$popover.show();
        this.pickerShown = true;
      },

      _hidePicker: function () {
        this.lowerLimit = 0;
        this.upperLimit = 0;
        this.currentPage = 0;
        this.$element.removeClass("focus");
        this.$popover.hide();
        this.pickerShown = false;
      },

      //render color picker based on the palette mode
      _renderPicker: function (mode, slide, pageNo) {

        if (mode === CLASSIC_MODE && !this._calculatePaletteBoundaries(slide, pageNo)) {
          return;
        }

        var table = null;
        if (mode === CLASSIC_MODE) {
          table = this._renderPalette();
        } else {
          table = this._renderEditPalette();
        }

        var $picker = this.$element.find(".colorpicker-holder");
        var $palette_nav = $picker.find(".palette-navigator");
        var $picker_body = $picker.find(".colorpicker-body");

        if (slide && $picker.find("table").length > 0) {
          this._slidePicker(table, (slide === "left"));
        } else {
          //display selected color if any and selected page
          $picker.find("table").remove();
          $picker.find(".sliding-container").remove();
          if (mode === EDIT_MODE) {
            $picker_body.append(table);
            $palette_nav.remove();
            if (this.$hiddenInput.val() !== undefined && this.$hiddenInput.val().length > 0) {
              table.find("div.color").css("background", this.$hiddenInput.val());
              var hex = CUI.util.color.RGBAToHex(this.$hiddenInput.val());
              table.find("input[name=':hex']").val(hex);
              var rgb = CUI.util.color.HexToRGB(hex);
              this._fillRGBFields(rgb);
              var cmyk = CUI.util.color.RGBtoCMYK(rgb);
              this._fillCMYKFields(cmyk);
            }
          } else {
            if ($palette_nav.length > 0) {
              $palette_nav.before(table);
            } else {
              $picker_body.append(table);
              this._renderPaletteNavigation();
            }

          }

        }

      },
      //display navigation mode buttons and select the one corresponding to the current display mode
      _renderPickerFooter: function () {
        this.$element.find(".colorpicker-footer").html(
          COLORPICKER_FOOTER_TEMPLATE);
        if (this.options.config.displayModes !== undefined) {
          if (this.options.config.displayModes.classicPalette ||
            this.options.config.displayModes.freestylePalette) {
            var paletteButton = $(CLASSIC_PALETTE_BUTTON);
            paletteButton.addClass("is-selected");
            this.$element.find(".navigation-bar").append(
              paletteButton);
          }
          if (this.options.config.displayModes.edit) {
            this.$element.find(".navigation-bar").append(
              EDIT_BUTTON);
          } else {
            this.$element.find(".colorpicker-footer").remove();
            return;
          }
        }

        this.$element.find(".colorpicker-footer button")
                     .off("click.button").on("click.button", function (event) {
          event.stopPropagation();
          event.preventDefault();
          var $target = $(event.target);
          var $button = null;
          this.$element.find(
              ".navigation-bar > .is-selected")
            .removeClass("is-selected");
          if (event.target.nodeName === "BUTTON") {
            $target.addClass("is-selected");
            $button = $(event.target);
          } else {
            $target.parent().addClass(
              "is-selected");
            $button = $target.parent();
          }
          if ($button.attr("id") === "editButton") {
            this._renderPicker(EDIT_MODE);
          } else {
            this._renderPicker(CLASSIC_MODE, false, this.currentPage);
          }

        }.bind(this));
      },
      //function for palette navigation
      _calculatePaletteBoundaries: function (slide, pageNo) {
        var colorsPerPage = 0;
        if (this.options.config.displayModes.freestylePalette) {
          colorsPerPage = this.palettePageSize *
            this.colorShadeNo;
        } else {
          colorsPerPage = this.palettePageSize;
        }
        if (!slide) {
          if (pageNo !== undefined) {
            this.lowerLimit = colorsPerPage * pageNo;
            this.upperLimit = this.lowerLimit + colorsPerPage -
              1;
            this.currentPage = pageNo;
          } else {
            this.upperLimit += colorsPerPage - 1;
            this.lowerLimit = 0;
            this.currentPage = 0;
          }
        } else if (slide === "left") {
          pageNo = this.currentPage + 1;
          if (pageNo + 1 > this.pages) {
            return false;
          }
          this.lowerLimit = colorsPerPage * pageNo;
          this.upperLimit = this.lowerLimit + colorsPerPage - 1;
          this.currentPage = pageNo;
        } else {
          pageNo = this.currentPage - 1;
          if (pageNo < 0) {
            return false;
          }
          this.lowerLimit = colorsPerPage * pageNo;
          this.upperLimit = this.lowerLimit + colorsPerPage - 1;
          this.currentPage = pageNo;
        }
        return true;
      },
      //display navigation bullets
      _renderPaletteNavigation: function () {
        this.$element.find(".palette-navigator").remove();
        var navigator = $("<div>");
        navigator.addClass("palette-navigator");
        if (this.options.config.displayModes.classicPalette) {
          this.pages = Math.ceil(this.colorNames.length /
            this.palettePageSize);
        } else {
          this.pages = Math.ceil(this.colorNames.length /
            (this.palettePageSize * this.colorShadeNo));
        }
        if (this.pages > 1) {
          for (var i = 0; i < this.pages; i++) {
            navigator.append("<i class='dot coral-Icon coral-Icon--circle' page='" + i +
              "'></i>");
          }
        }
        this.$element.find(".colorpicker-body").append(navigator);
        this.$element.find("i[page='" + this.currentPage + "']")
          .addClass("is-active");

        // Move around
        this.$element.find(".colorpicker-body").on("swipe",
          function (event) {
            this._renderPicker(CLASSIC_MODE, event.direction === "left" ? "left" : "right");
          }.bind(this));
        this.$element.find(".dot").off("click.dot").on("click.dot", function (event) {
          event.stopPropagation();

          if (this.currentPage === parseInt($(event.target).attr("page"), 10)) {
            return;
          }

          this._renderPicker(CLASSIC_MODE, false, parseInt($(event.target).attr("page"), 10));
        }.bind(this));
      },

      _slidePicker: function (newtable, isLeft) {
        this.$element.find(".sliding-container table").stop(true,
          true);
        this.$element.find(".sliding-container").remove();

        var oldtable = this.$element.find("table");
        var width = oldtable.width();
        var height = oldtable.height();

        var container = $("<div class=\"sliding-container\">");

        container.css({
          "display": "block",
          "position": "relative",
          "width": width + "px",
          "height": height + "px",
          "overflow": "hidden"
        });

        this.$element.find(".palette-navigator").before(container);
        container.append(oldtable).append(newtable);
        oldtable.css({
          "position": "absolute",
          "left": 0,
          "top": 0
        });
        oldtable.after(newtable);
        newtable.css({
          "position": "absolute",
          "left": (isLeft) ? width : -width,
          "top": 0
        });

        var speed = 400;

        oldtable.animate({
          "left": (isLeft) ? -width : width
        }, speed, function () {
          oldtable.remove();
        });

        newtable.animate({
          "left": 0
        }, speed, function () {
          if (container.parents().length === 0)
            return; // We already were detached!
          newtable.css({
            "position": "relative",
            "left": 0,
            "top": 0
          });
          newtable.detach();
          this.$element.find(".palette-navigator").before(
            newtable);
          container.remove();
        }.bind(this));
      },
      //render the selected color name and hex code
      _renderPaletteHeader: function () {
        var title = $('<div class="palette-header"><div class="title"></div><div class="selection"></div></div>');
        var $picker = this.$element.find(".colorpicker-holder");
        if ($picker.find(".palette-header").length > 0) {
          $picker.find(".palette-header").replaceWith(title);
        } else {
          $picker.prepend(title);
        }
        $picker.find(".title").html(
          "<span>" + this.options.title + "</span>");
      },

      _renderPalette: function () {
        this._renderPaletteHeader();

        var table = $("<table>");
        var html = "";

        for (var i = 0; i < this.palettePageSize; i++) {
          html += "<tr>";
          var opacity = 0;
          var rgb = "";
          var cssClass = "";
          var shade = "";
          for (var sh = 0; sh < this.colorShadeNo; sh++) {
            if (this.options.config.displayModes.classicPalette) {
              //display colors with shades
              if (this.colorNames.length - 1 < i +
                this.lowerLimit) {
                html += "<td><a></a></td>";
              } else {
                rgb = CUI.util.color.HexToRGB(this.options.config.colors[this.colorNames[i +
                  this.lowerLimit]]);
                shade = "rgba(" + rgb.r + "," + rgb.g +
                  "," + rgb.b + "," +
                  (1 - opacity).toFixed(2) + ")";
                opacity += 0.16;
                if (CUI.util.color.isSameColor(shade,
                  this.$hiddenInput.val())) {
                  cssClass = "is-selected";
                  this._fillSelectedColor(this.colorNames[i + this.lowerLimit], CUI.util.color.RGBAToHex(shade));
                } else {
                  cssClass = "";
                }
                html += "<td class='filled'><a style='background-color:" +
                  shade +
                  "' color='" +
                  shade +
                  "' colorName='" +
                  this.colorNames[i + this.lowerLimit] +
                  "' class='" +
                  cssClass +
                  "'>" +
                  "</a></td>";
              }
            } else {
              //display colors without shades (freestyle)
              if (this.colorNames.length - 1 < i *
                this.colorShadeNo + sh) {
                html += "<td><a></a></td>";
              } else {
                rgb = CUI.util.color.HexToRGB(this.options.config.colors[this.colorNames[i *
                  this.colorShadeNo + sh]]);
                shade = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + 1 + ")";
                if (CUI.util.color.isSameColor(shade,
                  this.$hiddenInput.val())) {
                  cssClass = "is-selected";
                } else {
                  cssClass = "";
                }
                html += "<td class='filled'><a style='background-color:" +
                  shade +
                  "' color='" +
                  shade +
                  "' colorName='" +
                  this.colorNames[i *
                    this.colorShadeNo + sh] +
                  "' class='" +
                  cssClass +
                  "'>" +
                  "</a></td>";
              }
            }
          }
          html += "</tr>";
        }
        table.append("<tbody>" + html + "</tbody>");
        //click on a color box
        table.find("a").off("click.a").on("click.a", function (event) {
          event.stopPropagation();
          event.preventDefault();

          if (CUI.util.color.isSameColor(this.$hiddenInput
            .val(), $(event.target).attr(
            "color"))) {
            return;
          }


          var previousSelected =  this.$element.find("table").find(".is-selected");
          previousSelected.removeClass("is-selected");
          previousSelected.find("i").remove();

          var selected = $(event.target);
          selected.addClass("is-selected");
          selected.html('<i class="coral-Icon coral-Icon--check"></i>');
          $(event.target).addClass("is-selected");

          var colorName = $(event.target).attr("colorName") !== undefined ? $(event.target).attr("colorName") : "";
          this._fillSelectedColor(colorName, CUI.util.color.RGBAToHex($(event.target).attr("color")));

          this._setColor($(event.target).attr("color"));
        }.bind(this));
        var $navigator = this.$element.find(".palette-navigator");
        $navigator.find(".is-active").removeClass("is-active");
        $navigator.find("i[page='" + this.currentPage + "']").addClass("is-active");

        return table;
      },

      _fillSelectedColor: function (colorName, hexVal) {
        this.$element.find(".colorpicker-holder").find(".selection")
          .html(
            "<div><span>" +
              colorName +
              "</span><span>" +
              hexVal +
              "</span></div>");
      },
      //render edit mode screen
      _renderEditPalette: function () {
        var table = $("<table>");
        var html = "<tr>" +
          //hex color representation
          "<td colspan='2' rowspan='2' class='color-field'>" +
          "<div class='color'></div>" +
          "</td>" +
          "<td class='label'>HEX</td>" +
          "<td colspan='2'>" +
          "<input class='coral-Textfield' type='text' name=':hex'/>" +
          "</td>" +
          "<td colspan='2'>&nbsp;</td>" +
          "</tr>" +
          //RGB color representation in 3 input fields(r, g,b)
          "<tr>" +
          "<td class='label'>RGB</td>" +
          "<td>" +
          "<input class='coral-Textfield' type='text' name=':rgb_r'/>" +
          "</td>" +
          "<td>" +
          "<input class='coral-Textfield' type='text' name=':rgb_g'/>" +
          "</td>" +
          "<td>" +
          "<input class='coral-Textfield' type='text' name=':rgb_b'/>" +
          "</td>" +
          "<td>&nbsp;</td>" +
          "</tr>" +
          //CMYK color representation in 4 input fields(c,m,y,k)
          "<tr>" +
          "<td colspan='2'>&nbsp;</td>" +
          "<td class='label'>CMYK</td>" +
          "<td>" +
          "<input class='coral-Textfield' type='text' name=':cmyk_c'/>" +
          "</td>" +
          "<td>" +
          "<input class='coral-Textfield' type='text' name=':cmyk_m'/>" +
          "</td>" +
          "<td>" +
          "<input class='coral-Textfield' type='text' name=':cmyk_y'/" +
          "</td>" +
          "<td>" +
          "<input class='coral-Textfield' type='text' name=':cmyk_k'/>" +
          "</td>" +
          "</tr>" +
          //save button to store the color on the launcher
          "<tr>" +
          "<td colspan='3'>&nbsp;</td>" +
          "<td colspan='4'>" +
          "<button class='coral-Button coral-Button--primary'>Save Color</button>" +
          "</td>" +
          "</tr>";

        table.append("<tbody>" + html + "</tbody>");

        this.$element.find(".palette-header").remove();
        //input validations for change events
        table.find("input[name^=':rgb_']").each(function (index, element) {
          $(element).attr("maxlength", "3");
          $(element).on("blur", function (event) {
            var rgbRegex = /^([0]|[1-9]\d?|[1]\d{2}|2([0-4]\d|5[0-5]))$/;
            if (!rgbRegex.test($(event.target).val().trim()) || $("input:text[value=''][name^='rgb_']").length > 0) {
              $(event.target).val("");
              this._clearCMYKFields();
              this.$element.find("input[name=':hex']").val("");
              this.$element.find("div.color").removeAttr("style");
              return;
            }
            var rgb = {r: this.$element.find("input[name=':rgb_r']").val(), g: this.$element.find("input[name=':rgb_g']").val(), b: this.$element.find("input[name=':rgb_b']").val()};
            var cmyk = CUI.util.color.RGBtoCMYK(rgb);
            var hex = CUI.util.color.RGBToHex(rgb);
            this._fillCMYKFields(cmyk);
            this.$element.find("input[name=':hex']").val(hex);
            this.$element.find("div.color").css("background", hex);
          }.bind(this));
        }.bind(this));
        table.find("input[name^=':cmyk_']").each(function (index, element) {
          $(element).attr("maxlength", "3");
          $(element).on("blur", function (event) {
            var cmykRegex = /^[1-9]?[0-9]{1}$|^100$/;
            if (!cmykRegex.test($(event.target).val().trim()) || $("input:text[value=''][name^='cmyk_']").length > 0) {
              $(event.target).val("");
              this._clearRGBFields();
              this.$element.find("input[name=':hex']").val("");
              this.$element.find("div.color").removeAttr("style");
              return;
            }
            var cmyk = {c: this.$element.find("input[name=':cmyk_c']").val(), m: this.$element.find("input[name=':cmyk_m']").val(), y: this.$element.find("input[name=':cmyk_y']").val(), k: this.$element.find("input[name=':cmyk_k']").val()};
            var rgb = CUI.util.color.CMYKtoRGB(cmyk);
            var hex = CUI.util.color.RGBToHex(rgb);
            this.$element.find("input[name=':hex']").val(hex);
            this._fillRGBFields(rgb);
            this.$element.find("div.color").css("background", hex);
          }.bind(this));
        }.bind(this));
        table.find("input[name=':hex']").each(function (index, element) {
          $(element).attr("maxlength", "7");
          $(element).on("blur", function (event) {
            var hex = CUI.util.color.fixHex($(event.target).val().trim());
            if (hex.length === 0) {
              this._clearRGBFields();
              this._clearCMYKFields();
              this.$element.find("div.color").removeAttr("style");
              return;
            }
            var rgb = CUI.util.color.HexToRGB(hex);
            var cmyk = CUI.util.color.RGBtoCMYK(rgb);
            this._fillRGBFields(rgb);
            this._fillCMYKFields(cmyk);
            table.find("div.color").css("background", hex);
          }.bind(this));
        }.bind(this));

        table.on("click", "input, div",
          function (event) {
            event.stopPropagation();
            event.preventDefault();

          });
        table.on("click", "button",
          function (event) {
            event.stopPropagation();
            event.preventDefault();
            if (this.$element.find("input[name=':hex']").val() !== undefined && this.$element.find("input[name=':hex']").val().length > 0) {
              this._setColor(this.$element.find("input[name=':hex']").val());
            }
          }.bind(this));

        return table;
      },
      //set selected color on the launcher
      _setColor: function (color) {
        this.$hiddenInput.val(color);
        this.$openButton.css("background-color", this.$hiddenInput
          .val());
      },

      _fillRGBFields: function (rgb) {
        this.$element.find("input[name=':rgb_r']").val(rgb.r);
        this.$element.find("input[name=':rgb_g']").val(rgb.g);
        this.$element.find("input[name=':rgb_b']").val(rgb.b);
      },

      _clearRGBFields: function () {
        this.$element.find("input[name^=':rgb']").val("");
      },

      _fillCMYKFields: function (cmyk) {
        this.$element.find("input[name=':cmyk_c']").val(cmyk.c);
        this.$element.find("input[name=':cmyk_m']").val(cmyk.m);
        this.$element.find("input[name=':cmyk_y']").val(cmyk.y);
        this.$element.find("input[name=':cmyk_k']").val(cmyk.k);
      },

      _clearCMYKFields: function () {
        this.$element.find("input[name^=':cmyk']").val("");
      }

    });

  CUI.Widget.registry.register("colorpicker", CUI.Colorpicker);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function (e) {
      CUI.Colorpicker.init($("[data-init~=colorpicker]", e.target));
    });
  }
}(window.jQuery));


(function ($) {
  "use strict";

  var ns = ".coral-DragAction";

  /**
   * Find for the first parent that has an overflow of hidden, auto or scroll.
   * @ignore
   */
  function getViewContainer(element) {
    while (true) {
      var p = element.parent();

      if (p.length === 0) return p;
      if (p.is("body")) return p;

      var flow = p.css("overflow");
      if (flow === "hidden" || flow === "auto" || flow === "scroll") return p;

      element = p;
    }
  }

  function pagePosition(event) {
    var touch = {};
    if (event.originalEvent) {
      var o = event.originalEvent;
      if (o.changedTouches && o.changedTouches.length > 0) {
        touch = o.changedTouches[0];
      }
      if (o.touches && o.touches.length > 0) {
        touch = o.touches[0];
      }
    }

    return {
      x: touch.pageX || event.pageX,
      y: touch.pageY || event.pageY
    };
  }

  function within(x, y, element) {
    var offset = element.offset();
    return x >= offset.left && x < (offset.left + element.outerWidth()) &&
      y >= offset.top && y < offset.top + element.outerHeight();
  }


  CUI.DragAction = new Class(/** @lends CUI.DragAction# */{
    /**
     @classdesc

     @desc Constructs a new Drag Action. After the initialization the drag is performed immediatly.
     @constructs

     @param {Event} event The event that triggered the drag
     @param {jQuery} source The element that is the source of this drag
     @param {jQuery} dragElement The element that will be dragged
     @param {Array} dropZones An Array of elements that can be destinations for this drag
     @param {String} [restrictAxis] Restricts the drag movement to a particular axis. Value: ("horizontal" | "vertical")
     */
    construct: function (event, source, dragElement, dropZones, restrictAxis) {
      this.sourceElement = source;
      this.dragElement = dragElement;
      this.container = getViewContainer(dragElement);
      this.containerHeight = this.container.get(0).scrollHeight; // Save current container height before we start dragging
      this.dropZones = dropZones;
      this.axis = restrictAxis;
      this.scrollZone = 20; // Use 20px as scrolling zone, static for now

      this.dragStart(event);
    },

    currentDragOver: null,

    dragStart: function (event) {
      event.preventDefault();

      var p = this.dragElement.position();
      var pp = pagePosition(event);

      this.dragElement.css({
        "left": p.left,
        "top": p.top,
        "width": this.dragElement.width() + "px"
      }).addClass("is-dragging");

      this.dragStart = {x: pp.x - p.left, y: pp.y - p.top};

      $(document).on("touchmove" + ns + " mousemove" + ns, this.drag.bind(this));
      $(document).on("touchend" + ns + " mouseup" + ns, this.dragEnd.bind(this));

      this.sourceElement.trigger(this._createEvent("dragstart", event));

      this.drag(event);
    },

    drag: function (event) {
      event.preventDefault();

      var pos = pagePosition(event);

      // Need to scroll?
      if (this.container.is("body")) {
        if (pos.y - this.container.scrollTop() < this.scrollZone) {
          this.container.scrollTop(pos.y - this.scrollZone);
        }
        if (pos.y - this.container.scrollTop() > this.container.height() - this.scrollZone) {
          this.container.scrollTop(pos.y - this.container.height() - this.scrollZone);
        }
      } else {
        var oldTop = this.container.scrollTop();
        var t = this.container.offset().top + this.scrollZone;

        if (pos.y < t) {
          this.container.scrollTop(this.container.scrollTop() - (t - pos.y));
        }

        var h = this.container.offset().top + this.container.height() - this.scrollZone;

        if (pos.y > h) {
          var s = Math.min(this.container.scrollTop() + (pos.y - h), Math.max(this.containerHeight - this.container.height(), 0));
          this.container.scrollTop(s);
        }

        var newTop = this.container.scrollTop();
        this.dragStart.y += oldTop - newTop; // Correct drag start position after element scrolling
      }

      var newCss = {};
      if (this.axis !== "horizontal") {
        newCss.top = pos.y - this.dragStart.y;
      }
      if (this.axis !== "vertical") {
        newCss.left = pos.x - this.dragStart.x;
      }

      this.dragElement.css(newCss);

      this.triggerDrag(event);
    },

    dragEnd: function (event) {
      event.preventDefault();

      this.dragElement.removeClass("is-dragging");
      this.dragElement.css({top: "", left: "", width: ""});

      $(document).off(ns);

      this.triggerDrop(event);

      if (this.currentDragOver) {
        $(this.currentDragOver).trigger(this._createEvent("dragleave", event));
      }

      this.sourceElement.trigger(this._createEvent("dragend", event));
    },

    triggerDrag: function (event) {
      var dropElement = this._getCurrentDropZone(event);

      if (dropElement === this.currentDragOver) {
        if (this.currentDragOver) {
          $(this.currentDragOver).trigger(this._createEvent("dragover", event));
        }
        return;
      }

      if (this.currentDragOver) {
        $(this.currentDragOver).trigger(this._createEvent("dragleave", event));
      }

      this.currentDragOver = dropElement;

      if (this.currentDragOver) {
        $(this.currentDragOver).trigger(this._createEvent("dragenter", event));
      }
    },

    triggerDrop: function (event) {
      var dropElement = this._getCurrentDropZone(event);

      if (!dropElement) return;

      dropElement.trigger(this._createEvent("drop", event));
    },

    _getCurrentDropZone: function (event) {
      var pos = pagePosition(event);

      var dropElement = null;

      $.each(this.dropZones, function (index, value) {
        if (within(pos.x, pos.y, value)) {
          dropElement = value;
          return false;
        }
      });

      return dropElement;
    },

    _createEvent: function (name, fromEvent) {
      var pos = pagePosition(fromEvent);

      var event = jQuery.Event(name);
      event.pageX = pos.x;
      event.pageY = pos.y;
      event.sourceElement = this.sourceElement;
      event.item = this.dragElement;

      return event;
    }

  /**
   * Triggered on the drag source, when drag is started.
   *
   * @event CUI.DragAction#dragstart
   * @type {Object}
   *
   * @property {Number} pageX - Pointer position on x-axis
   * @property {Number} pageY - Pointer position on y-axis
   * @property {jQuery} sourceElement - container on from which the drag was initiated
   * @property {jQuery} item - element which is dragged
   */
  /**
   * Triggered on <em>a potential</em> drag target, when dragged element is
   * moved <strong>into</strong> the target's boundaries.
   *
   * @event CUI.DragAction#dragenter
   * @type {Object}
   *
   * @property {Number} pageX - Pointer position on x-axis
   * @property {Number} pageY - Pointer position on y-axis
   * @property {jQuery} sourceElement - container on from which the drag was initiated
   * @property {jQuery} item - element which is dragged
   */
  /**
   * Triggered on <em>a potential</em> drag target, when dragged element is
   * moved <strong>within</strong> the target's boundaries.
   *
   * @event CUI.DragAction#dragover
   * @type {Object}
   *
   * @property {Number} pageX - Pointer position on x-axis
   * @property {Number} pageY - Pointer position on y-axis
   * @property {jQuery} sourceElement - container on from which the drag was initiated
   * @property {jQuery} item - element which is dragged
   */
  /**
   * Triggered on <em>a potential</em> drag target, when dragged element is
   * moved <strong>out of</strong> the target's boundaries.
   *
   * @event CUI.DragAction#dragleave
   * @type {Object}
   *
   * @property {Number} pageX - Pointer position on x-axis
   * @property {Number} pageY - Pointer position on y-axis
   * @property {jQuery} sourceElement - container on from which the drag was initiated
   * @property {jQuery} item - element which is dragged
   */
  /**
   * Triggered on the drag target, when dragged element is dropped within the
   * target's boundaries.
   *
   * @event CUI.DragAction#drop
   * @type {Object}
   *
   * @property {Number} pageX - Pointer position on x-axis
   * @property {Number} pageY - Pointer position on y-axis
   * @property {jQuery} sourceElement - container on from which the drag was initiated
   * @property {jQuery} item - element which is dragged
   */
  /**
   * Triggered on the drag source, when drag is complete. This is always the
   * last event emitted by a DragAction.
   *
   * @event CUI.DragAction#dragend
   * @type {Object}
   *
   * @property {Number} pageX - Pointer position on x-axis
   * @property {Number} pageY - Pointer position on y-axis
   * @property {jQuery} sourceElement - container on from which the drag was initiated
   * @property {jQuery} item - element which is dragged
   */

  });
})(jQuery);

(function ($, console) {
  "use strict";

  var addButton =
    "<button type=\"button\" class=\"js-coral-Multifield-add coral-Multifield-add coral-Button\">" +
    "Add field" +
    "</button>";

  var removeButton =
    "<button type=\"button\" class=\"js-coral-Multifield-remove coral-Multifield-remove coral-Button coral-Button--square coral-Button--quiet\">" +
      "<i class=\"coral-Icon coral-Icon--sizeS coral-Icon--delete coral-Button-icon\"></i>" +
    "</button>";

  var moveButton =
    "<button type=\"button\" class=\"js-coral-Multifield-move coral-Multifield-move coral-Button coral-Button--square coral-Button--quiet\">" +
      "<i class=\"coral-Icon coral-Icon--sizeS coral-Icon--moveUpDown coral-Button-icon\"></i>" +
    "</button>";

  var listTemplate =
    "<ol class=\"js-coral-Multifield-list coral-Multifield-list\"></ol>";

  var fieldTemplate =
    "<li class=\"js-coral-Multifield-input coral-Multifield-input\">" +
    "<div class=\"js-coral-Multifield-placeholder\"></div>" +
    removeButton +
    moveButton +
    "</li>";


  CUI.Multifield = new Class(/** @lends CUI.Multifield# */{
    toString: "Multifield",
    extend: CUI.Widget,

    /**
     @extends CUI.Widget

     @classdesc A composite field that allows you to add/reorder/remove multiple instances of a component.
     The component is added based on a template defined in a <code>&lt;script type=&quot;text/html&quot;&gt;</code> tag.
     The current added components are managed inside a <code>ol</code> element.

     @desc Creates a Multifield component.
     @constructs
     */
    construct: function (options) {
      this.script = this.$element.find(".js-coral-Multifield-input-template");
      this.ol = this.$element.children(".js-coral-Multifield-list");

      if (this.ol.length === 0) {
        this.ol = $(listTemplate).prependTo(this.$element);
      }

      this._adjustMarkup();
      this._addListeners();
    },

    /**
     * Enhances the markup required for multifield.
     * @private
     */
    _adjustMarkup: function () {
      this.$element.addClass("coral-Multifield");
      this.ol.children(".js-coral-Multifield-input").append(removeButton, moveButton);
      this.ol.after(addButton);
    },

    /**
     * Initializes listeners.
     * @private
     */
    _addListeners: function () {
      var self = this;

      this.$element.on("click", ".js-coral-Multifield-add", function (e) {
        var item = $(fieldTemplate);
        item.find(".js-coral-Multifield-placeholder").replaceWith(self.script.html().trim());
        item.appendTo(self.ol);
        $(self.ol).trigger("cui-contentloaded");
      });

      this.$element.on("click", ".js-coral-Multifield-remove", function (e) {
        $(this).closest(".js-coral-Multifield-input").remove();
      });

      this.$element
        .on("taphold mousedown", ".js-coral-Multifield-move", function (e) {
          e.preventDefault();

          var item = $(this).closest(".js-coral-Multifield-input");
          item.prevAll().addClass("coral-Multifield-input--dragBefore");
          item.nextAll().addClass("coral-Multifield-input--dragAfter");

          // Fix height of list element to avoid flickering of page
          self.ol.css({height: self.ol.height() + $(e.item).height() + "px"});
          new CUI.DragAction(e, self.$element, item, [self.ol], "vertical");
        })
        .on("dragenter", function (e) {
          self.ol.addClass("drag-over");
          self._reorderPreview(e);
        })
        .on("dragover", function (e) {
          self._reorderPreview(e);
        })
        .on("dragleave", function (e) {
          self.ol.removeClass("drag-over").children().removeClass("coral-Multifield-input--dragBefore coral-Multifield-input--dragAfter");
        })
        .on("drop", function (e) {
          self._reorder($(e.item));
          self.ol.children().removeClass("coral-Multifield-input--dragBefore coral-Multifield-input--dragAfter");
        })
        .on("dragend", function (e) {
          self.ol.css({height: ""});
        });
    },

    _reorder: function (item) {
      var before = this.ol.children(".coral-Multifield-input--dragAfter").first();
      var after = this.ol.children(".coral-Multifield-input--dragBefore").last();

      if (before.length > 0) item.insertBefore(before);
      if (after.length > 0) item.insertAfter(after);
    },

    _reorderPreview: function (e) {
      this.ol.children(":not(.is-dragging)").each(function () {
        var el = $(this);
        var isAfter = e.pageY < (el.offset().top + el.outerHeight() / 2);
        el.toggleClass("coral-Multifield-input--dragAfter", isAfter);
        el.toggleClass("coral-Multifield-input--dragBefore", !isAfter);
      });
    }
  });

  CUI.Widget.registry.register("multifield", CUI.Multifield);

  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function (e) {
      CUI.Multifield.init($("[data-init~=multifield]", e.target));
    });
  }
})(jQuery, window.console);

/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function (window, $, undefined) {

    // ========================= smartresize ===============================

    /*
     * smartresize: debounced resize event for jQuery
     *
     * latest version and complete README available on Github:
     * https://github.com/louisremi/jquery.smartresize.js
     *
     * Copyright 2011 @louis_remi
     * Licensed under the MIT license.
     */

    var $event = $.event,
            resizeTimeout;

    $event.special.smartresize = {
        setup:function () {
            $(this).bind("resize", $event.special.smartresize.handler);
        },
        teardown:function () {
            $(this).unbind("resize", $event.special.smartresize.handler);
        },
        handler:function (event, execAsap) {
            // Save the context
            var context = this,
                    args = arguments;

            // set correct event type
            event.type = "smartresize";

            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            resizeTimeout = setTimeout(function () {
                $event.dispatch.apply(context, args);
            }, execAsap === "execAsap" ? 0 : 10);
        }
    };

    $.fn.smartresize = function (fn) {
        return fn ? this.bind("smartresize", fn) : this.trigger("smartresize", ["execAsap"]);
    };

    // constructor
    $.CUIGridLayout = function (options, element, callback) {
        this.element = $(element);
        this._create(options);
        this._init(callback);
    };

    var $window = $(window);

    $.CUIGridLayout.settings = {
        colWidth: 240,
        gutterX: 15,
        gutterY: 15,
        marginLeft:0,
        marginRight:0,
        selector:"article"
//        itemClass:"macboard-card"
    };

    // TODO layout only takes image sizes into account; may fail when cards have differing "legends"

    $.CUIGridLayout.prototype = {

        option:function(options) {
            this.options = $.extend({}, $.CUIGridLayout.settings, options);
        },

        // sets up widget
        _create:function (options) {

            this.options = $.extend({}, $.CUIGridLayout.settings, options);

            this.items = [];

            this.itemsByPath = {};

            this.numCols = -1;

            this.pendingImages = 0;

            this.update();


            // bind resize method
            var self = this;
            $window.bind('smartresize.cui.gridlayout', function () {
                self.updateDimensions();
                self.layout();
            });

        },

        _init:function (callback) {
            this.updateDimensions();
            this.layout(callback);

            // Give browser a chance to lay out elements and calculate layout a second time after
            // all CSS is applied correctly by the browser. Without this second, timed calculation is sometimes wrong due
            // to race conditions with the rendering engine of the browser.
            setTimeout(function() {
                this.numCols = -1;
                this.updateDimensions();
                this.layout(callback);

                this.element.trigger($.Event("cui-gridlayout-initialized", {
                    "widget": this
                }));
            }.bind(this), 1);
        },

        update:function () {
            var items = [],
                itemsByPath = {};

            this.element.find(this.options.selector).each(function (i) {
                var $card = $(this);
                var $img = $("img", $card);
                if ($img.length === 0) {
                    $img = null;
                }
                var item = {
                    path: $card.data().path,
                    i:i,
                    $el:$card,
                    $img:$img
                };
                items.push(item);
                itemsByPath[item.path] = item;
            });

            this.items = items.sort(function (i1, i2) {
                var i1key = i1.$el.data("gridlayout-sortkey") || 0,
                    i2key = i2.$el.data("gridlayout-sortkey") || 0;

                return i2key - i1key || i1.i - i2.i;
            });
            this.itemsByPath = itemsByPath;
        },

        _imageLoaded: function() {

            if (--this.pendingImages === 0) {
//                console.log("all images loaded");
                // force relayout
                this.numCols = -1;
                this.layout();
            }

        },
        updateDimensions: function() {
            var self = this;
            this.items.every(function (i) {
                var $el = i.$el;

                i.w = $el.width();
                i.h = $el.height();

                // check if card has an image and if it's loaded
                if (i.$img) {
                    // Hack: Recalculate element size if browser has wrong values. This sometimes occurs with loaded
                    // images when the elements are not yet displayed on screen.
                    if (i.$img.width() > i.w) {
                        i.h = (i.h - i.$img.height()) + (i.$img.height() / i.$img.width() * i.w);
                    }

                    if (i.$img.height() === 0) {
                        // just assume 1:1 for now
                        i.h += i.w;
                        self.pendingImages++;
                        i.$img.on("load.cui.gridlayout", function() {
                            i.$img = null;
                            i.w = $el.width(); // Set width AND height to ensure proper ratio
                            i.h = $el.height();

//                            console.log("image loaded.", i);
                            self._imageLoaded();
                        });
                    } else {
                        // we don't need to know this info anymore
                        i.$img = null;
                    }
                }

                // debug
//                $("h4", i.$el).html("Card Nr " + i.i + " (" + i.w + "x" + i.h + ")");

                return true;
            });

        },

        layout:function () {
            var self = this;
            var $this = this.element;
            var colWidth = this.options.colWidth;
            var marginLeft = this.options.marginLeft;
            var marginRight = this.options.marginRight;
            var gx = this.options.gutterX;
            if ($this.width() === 0) {
          //need not to layout the div whose width is 0
                return;
            }
            // calculate # columns:
            // containerWidth = marginLeft + (colWidth + gx) * n - gx + marginRight;
            // use: "round" for avg width, "floor" for minimal width, "ceil" for maximal width
            var n = Math.floor(($this.width() - marginLeft - marginRight + gx) / (colWidth + gx));

            if (n < 1) n = 1; // Minimum 1 column!

            if (n == this.numCols) {
                // nothing to do. CSS takes care of the scaling
                return;
            }

            this.numCols = n;

            // calculate actual column width:
            // containerWidth = marginLeft + (cw + gx) * n - gx + marginRight;
            var cw =  (($this.width() - marginLeft - marginRight + gx) / n) - gx;

            // initialize columns
            var cols = [];
            var colHeights = [];
            while (cols.length < n) {
                cols.push([]);
                colHeights.push(0);
            }

            this.items.every(function (i) {
                // determine height of card, based on the ratio
                var height = (i.h / i.w) * cw;

                // find lowest column
                var min = colHeights[0];
                var best = 0;
                for (var c = 0; c < colHeights.length; c++) {
                    var h = colHeights[c];
                    if (h < min) {
                        min = h;
                        best = c;
                    }
                }

                // update columns and heights array
                cols[best].push(i);
                colHeights[best] += height + self.options.gutterY;
                return true;
            });

            // detach all the cards first
            $this.detach(this.options.selector);

            // remember old columns. because otherwise the
            // event handlers bound on the cards would be removed
            var $cols = $this.contents();

            // now fill up all the columns
            for (var c=0; c<cols.length; c++) {
                var $col = $('<div class="grid-'+n+'"></div>').appendTo($this);
                for (var j=0; j<cols[c].length; j++) {
                    $col.append(cols[c][j].$el);
                }
            }

            // remove old columns
            $cols.remove();

            $(document).trigger("cui-gridlayout-layout");
        },

        destroy: function() {
            $window.unbind("smartresize.cui.gridlayout");
            this.element.removeData("cuigridlayout");
        }
    };

    var logError = function (message) {
        if (window.console) {
            window.console.error(message);
        }
    };

    // plugin bridge
    $.fn.cuigridlayout = function (options, callback) {
        if (typeof options === 'string') {
            // call method
            var args = Array.prototype.slice.call(arguments, 1);

            this.each(function () {
                var instance = $.data(this, 'cuigridlayout');
                if (!instance) {
                    logError("cannot call methods on cuigridlayout prior to initialization; " +
                            "attempted to call method '" + options + "'");
                    return;
                }
                if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
                    logError("no such method '" + options + "' for cuigridlayout instance");
                    return;
                }
                // apply method
                instance[ options ].apply(instance, args);
            });
        } else {
            this.each(function () {
                var instance = $.data(this, 'cuigridlayout');
                if (instance) {
                    // apply options & init
                    instance.option(options);
                    instance._init(callback);
                } else {
                    // initialize new instance
                    $.data(this, 'cuigridlayout', new $.CUIGridLayout(options, this, callback));
                }
            });
        }
        // return jQuery object
        // so plugin methods do not have to
        return this;
    };
})(window, jQuery);


(function($, window, undefined) {

  var defaults = {
    "threshold": 200, // How often the resize and reflow events should be considered
    "applyClassToElement": undefined
  };

  // Utility functions to help calculating sizes
  var size = {
    "rem": function () {
      // This caches the rem value to calculate it only once, but might lead to wrong results if the font size gets changed
      if (size._rem === undefined) {
        size._rem = parseInt($("body").css("font-size"));
      }
      return size._rem;
    },
    "em": function (elem) {
      return parseFloat(elem.css("font-size"));
    }
  };

  // Adds and removes classes to the given element depending on the result of the associated functions.
  // Can be called with or without parameters:
  // When a breakpoints object is provided, the reflow listener gets setup to the given element.
  // The options parameter is optional, it allows to change the default settings.
  // When no parameters are provided it triggers a reflow event on the provided object.
  $.fn.reflow = function reflow(breakpoints, options) {
    return this.each(function reflowEach() {
      var elem = $(this),
        didApplyClassNames = false,
        scheduledReflowCheck = false,
        settings;

      if (breakpoints) {
        settings = $.extend({}, defaults, options);
        settings.applyClassToElement = settings.applyClassToElement || elem;

        function reflowEventHandler() {
          if (elem.is(":visible")) {
            if (!scheduledReflowCheck) {
              applyClassNames();
              scheduledReflowCheck = setTimeout(function reflowCheck() {
                scheduledReflowCheck = false;
                if (!didApplyClassNames && elem.is(":visible")) {
                  applyClassNames();
                }
              }, settings.threshold);
            } else {
              didApplyClassNames = false;
            }
          }
        }

        function applyClassNames() {
          didApplyClassNames = true;
          for (var className in breakpoints) {
            settings.applyClassToElement.toggleClass(className, breakpoints[className](elem, size));
          }
        }

        elem.on("reflow", reflowEventHandler);
        $(window).on("resize.reflow", reflowEventHandler);
      }

      elem.trigger("reflow");

    });
  }

}(jQuery, this));

(function ($, window, undefined) {
  var storageKey = 'cui-state',
    storageLoadEvent = 'cui-state-restore',
    store = {},
    loaded = false,
    $doc = $(document);

  /**
   * state object to enable UI page refresh stable states
   * TODO:
   *  - all states are global, lack of an auto restore mode which is aware of the URL
   *  - client side only (localStorage)
   *  - lack of an abstraction layer for the client side storage
   * @type {Object}
   */
  CUI.util.state = {

    /*saveForm: function (form, elem) {

     },*/

    config: {
      serverpersistence: true
    },

    /**
     * Persist attributes of a DOM node
     *
     * @param {String} selector
     * @param {String|Array} [attribute] single attribute or list of attributes to be saved. If null then all attributes will be saved
     * @param {Boolean} [autorestore]
     * @param {String} [customEvent] custom event name
     */
    save: function (selector, attribute, autorestore, customEvent) {
      var elem = $(selector),
        saveLoop = function (i, attr) {
          store.global[selector] = store.global[selector] || {};
          store.global[selector][attr] = store.global[selector][attr] || {};
          store.global[selector][attr].val = elem.attr(attr);
          store.global[selector][attr].autorestore = autorestore || false;
          store.global[selector][attr].customEvent = customEvent || null;
        };


      if (attribute) { // save single or multiple attributes
        if ($.isArray(attribute)) { // multiple values to save
          $.each(attribute, saveLoop);
        } else { // save all attributes
          saveLoop(0, attribute);
        }
      } else { // save all attributes
        // TODO
        // not supported yet because the browser implementation of Node.attributes is a mess
        // https://developer.mozilla.org/en-US/docs/DOM/Node.attributes
      }

      localStorage.setItem(storageKey, JSON.stringify(store));

      if (CUI.util.state.config.serverpersistence) {
        $.cookie(storageKey, JSON.stringify(store), {
          expires: 7,
          path: '/'
        });
      }
    },

    /**
     *
     * @param {String} [selector]
     * @param {Function} [filter] filter function for the attributes of the given selector
     */
    restore: function (selector, filter) {
      var check = filter || function () {
          return true;
        },
        sel,
        elem,
        selectorLoop = function (item, noop) {
          sel = item;
          elem = $(sel);

          if (store.global[sel]) {
            $.each(store.global[sel], restoreLoop);
          }
        },
        restoreLoop = function (attr, obj) {
          if (check(sel, attr, obj)) {
            elem.attr(attr, obj.val);

            if (obj.customEvent) {
              $doc.trigger(obj.customEvent, [elem, obj]);
            }

            $doc.trigger(storageLoadEvent, [elem, obj]);
          }
        };

      if (!loaded) {
        loaded = CUI.util.state.load();
      }


      if (selector) { // restore single selector
        selectorLoop(selector);
      } else { // restore everything
        $.each(store.global, selectorLoop);
      }
    },

    load: function () {
      var val = localStorage.getItem(storageKey);

      store = val ? JSON.parse(val) : {
        global: {}
      };

      return true;
    },

    // support for "temporary" storage that will be automatically cleared if
    // the browser session ends; currently uses a set/get pattern rather than
    // loading the entire thing on document ready. Also note that the data is currently
    // not sent to the server.

    setSessionItem: function(name, value, ns) {
      var key = name;
      if (ns) {
        key = name + ":" + ns;
      }
      sessionStorage.setItem(key, JSON.stringify(value));
    },

    getSessionItem: function(name, ns) {
      var key = name;
      if (ns) {
        key = name + ":" + ns;
      }
      var value = sessionStorage.getItem(key);
      if (value) {
        value = JSON.parse(value);
      }
      return value;
    },

    removeSessionItem: function(name, ns) {
      var key = name;
      if (ns) {
        key = name + ":" + ns;
      }
      sessionStorage.removeItem(key);
    },

    clearSessionItems: function(ns) {
      if (ns) {
        ns = ":" + ns;
        var keyCnt = sessionStorage.length;
        var toRemove = [ ];
        for (var k = 0; k < keyCnt; k++) {
          var keyToCheck = sessionStorage.key(k);
          var keyLen = keyToCheck.length;
          if (keyLen > ns.length) {
            if (keyToCheck.substring(keyLen - ns.length) === ns) {
              toRemove.push(keyToCheck);
            }
          }
        }
        var removeCnt = toRemove.length;
        for (var r = 0; r < removeCnt; r++) {
          sessionStorage.removeItem(toRemove[r]);
        }
      }
    }

  };

  $doc.ready(function () {
    CUI.util.state.restore(null, function (selector, attr, val) {
      if (val.autorestore) {
        return true;
      }

      return false;
    });
  });
}(jQuery, this));

/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

(function ($) {

  var DISPLAY_GRID = "grid";

  var DISPLAY_LIST = "list";

  var SELECTION_MODE_COUNT_SINGLE = "single";

  var SELECTION_MODE_COUNT_MULTI = "multiple";

  var DEFAULT_SELECTOR_CONFIG = {

    "itemSelector": "article",                      // selector for getting items
    "headerSelector": "header",                     // selector for headers
    "dataContainer": "grid-0",                      // class name of the data container
    "enableImageMultiply": true,                    // flag if images should be multiplied
    "view": {
      "selectedItem": {                           // defines what classes (cls) on what elements (selector; optional) are used to mark a selection
        "list": {
          "cls": "selected",
          "prv": "selected-prev"
        },
        "grid": {
          "cls": "selected",
          "prv": "selected-prev"
        }
      },
      "selectedItems": {                          // defines the selector that is used for determining the current selection; a resolver function may be specified that adjusts the selection (for exmaple by determining a suitable parent element)
        "list": {
          "selector": "article.selected"
        },
        "grid": {
          "selector": "article.selected"
        }
      }
    },
    "controller": {
      "selectElement": {                          // defines the selector that is used for installing the tap/click handlers
        "list": "article > i.select",
        /* "listNavElement": "article", */      // may be used to determine the element that is responsible for navigating in list view (required only if different from the Grid's select item)
        "grid": "article"
      },
      "moveHandleElement": {                      // defines the selector that is used to determine the object that is responsible for moving an item in list view
        "list": "article > i.move"
      },
      "targetToItem": {                           // defines methods that are used to resolve the event target of a tap/click event to a card view item
        "list": function ($target) {
          return $target.closest("article");
        },
        "grid": function ($target) {
          return $target.closest("article");
        },
        "header": function ($target) {
          return $target.closest("header");
        }
      },
      "gridSelect": {                             // defines the class that is used to trigger the grid selection mode
        "cls": "selection-mode"
      },
      "selectAll": {                              // defines the "select all" config (list view only)
        "selector": "header > i.select",
        "cls": "selected"
      },
      "sort": {                                   // defines the config for column sort
        "columnSelector": ".label > *"
      }
    }

  };

  var ensureItem = function (item) {
    if (item.jquery) {
      return item.data("cardView-item");
    }
    return item;
  };

  /**
   * @classdesc
   * Internal class that provides utility functionality to the card view.
   */
  var Utils = {

    /**
     * Check two jQuery objects for equality.
     * @param {jQuery} $1 first jQuery object
     * @param {jQuery} $2 second jQuery object
     * @return {boolean} True if both objects are considered equal
     */
    equals: function ($1, $2) {
      return ($1.length === $2.length) && ($1.length === $1.filter($2).length);
    },

    /**
     * Gets a CardView widget for the specified jQuery object.
     * @param {jQuery} $el The jQuery object
     * @return {CUI.CardView} The widget
     */
    getWidget: function ($el) {
      var widget;
      if ($el.length > 0) {
        widget = $($el[0]).data("cardView");
      }
      return widget;
    },

    /**
     * Mixes two objects so that for every missing property in object1 the properties of object2 are used. This is also done
     * for nested objects.
     * @param {object} Object 1
     * @param {object} Object 2
     * @return {object} The mixed object with all properties
     */
    mixObjects: function (object1, object2) {
      if (object1 === undefined) return object2;

      var result = {};
      for (var i in object2) {
        if (object1[i] === undefined) {
          result[i] = object2[i];
          continue;
        }
        var p = object1[i];

        // Go one step deeper in the object hierarchy if we find an object that is not a string.
        // Note: typeof returns "function" for functions, so no special testing for functions needed.
        if (typeof(object1[i]) == "object" && (!(object1[i] instanceof String))) {
          p = this.mixObjects(object1[i], object2[i]);
        }
        result[i] = p;
      }
      return result;
    },

    /**
     * Resolves each of the DOM elements in the specified jQuery object with a given
     * function into a new jQuery object.
     * @param {jQuery} $el The jQuery object to resolve
     * @param {Function} fn The resolver function
     * @return {jQuery} The resolved jQuery object
     */
    resolve: function ($el, fn) {
      var resolved = [ ];
      $el.each(function () {
        resolved.push.apply(resolved, fn($(this)).toArray());
      });
      return $(resolved);
    },

    /**
     * Multiplies the image with the provided color. This will insert a canvas element
     * before the img element.
     * @param {HTMLElement} $images image element to multiply with the color
     * @param {Number[]} color RGB array of values between 0 and 1
     */
    multiplyImages: function ($images, color) {
      // Filter out images where the multiply effect has already been inserted to the DOM, or images that aren't visible
      $images = $images.filter(function () {
        var $image = $(this);
        return !$image.is(".multiplied") && !$image.prev().is(".multiplied") && $image.is(":visible");
      });

      var imageMaxCounter = $images.length;
      var imageIteratorCounter = 0;

      function multiplyNextImage() {
        if (imageIteratorCounter < imageMaxCounter) {
          // Not adding the timeout for the first image will make it feel more reactive.
          multiplyOneImage($images[imageIteratorCounter]);

          imageIteratorCounter++;

          // But adding a timeout for the other images will make it non-blocking.
          setTimeout(multiplyNextImage, 0);
        }
      }

      function multiplyOneImage(image) {
        var width = image.naturalWidth,
          height = image.naturalHeight;

        // defer if image is not yet available
        if ((width === 0) && (height === 0)) {
          window.setTimeout(function () {
            multiplyOneImage(image);
          }, 200);
          return;
        }

        try {
          var canvas = $("<canvas width='" + width + "' height='" + height + "'></canvas>")[0];

          var context = canvas.getContext("2d");
          context.drawImage(image, 0, 0, width, height);

          var imageData = context.getImageData(0, 0, width, height);
          var data = imageData.data;

          for (var i = 0, l = data.length; i < l; i += 4) {
            data[i] *= color[0];
            data[i + 1] *= color[1];
            data[i + 2] *= color[2];
          }

          context.putImageData(imageData, 0, 0);

          // re-sizing of canvases are handled different in IE and Opera, thus we have to use an image
          $("<img class='" + image.className + " multiplied' " +
            "width='" + image.width + "' " +
            "src='" + canvas.toDataURL("image/png") + "'/>").insertBefore(image);

        } catch(err) {
          // CUI-2187: we have to catch the error produced by getImageDate, such that
          // it does not break the selection. When the error was produced, the navigation
          // was performed instead of selecting the card.
        }
      }

      multiplyNextImage();
    }
  };

  var ListItemAutoScroller = new Class(/** @lends CUI.CardView.ListItemAutoScroller# */{

    /**
     * The item element
     * @type jQuery
     * @private
     */
    $el: null,

    /**
     * The scrolling container element (with overflow auto/visible and position
     * absolute)
     * @type jQuery
     * @private
     */
    $containerEl: null,

    /**
     * Size of a scrolling step (= number of pixels that get scrolled per autoscrolling
     * 'tick'
     * @type Number
     * @private
     */
    stepSize: 0,

    /**
     * Timeout ID
     * @type Number
     * @private
     */
    iid: undefined,

    /**
     * @private
     */
    autoMoveOffset: 0,

    /**
     * The maximum value that is allowed for scrollTop while autoscrolling
     * @type Number
     * @private
     */
    maxScrollTop: 0,


    /**
     * @ignore
     * @name CUI.CardView.ListItemAutoScroller
     * @classdesc
     * Internal class that implements auto scrolling while moving cards in list view.
     *
     * @desc
     * Creates a new auto scroller.
     *
     * @constructs
     *
     * @param {jQuery} $el The jQuery container element of the card item that is moved
     * @param {Number} stepSize The step size (number of pixels scrolled per 'tick')
     * @param {Function} autoMoveFn Function that gets executed on every auto scroll
     *        "event". The function must actually reposition the item element to
     *        the coordinate specified as parameters (first parameter: x; second
     *        parameter: y
     */
    construct: function ($el, stepSize, autoMoveFn) {
      this.$el = $el;
      this.stepSize = stepSize;
      this.$containerEl = this._getScrollingContainer($el);
      var cont = this.$containerEl[0];
      this.maxScrollTop = Math.max(cont.scrollHeight - cont.clientHeight, 0);
      this.autoMoveFn = autoMoveFn;
    },

    /**
     * Gets a suitable container element that limits the scrolling area.
     * @param {jQuery} $el The card item's container element
     * @return {jQuery} The container element
     * @private
     */
    _getScrollingContainer: function ($el) {
      while (($el.length > 0) && !$el.is("body")) {
        var ovflY = $el.css("overflowY");
        var pos = $el.css("position");
        if (((ovflY === "auto") || (ovflY === "visible")) && (pos === "absolute")) {
          return $el;
        }
        $el = $el.parent();
      }
      return $(window);
    },

    /**
     * Checks if scrolling is necessary according to the item element's current position
     * and the scroll container's state and executes a single scrolling step by
     * adjusting the scroll container's scrollTop property if necessary.
     * @return {Boolean} True if scrolling occured; false if no scrolling was necessary
     * @private
     */
    _execute: function () {
      var cont = this.$containerEl[0];
      var clientHeight = cont.clientHeight;
      var scrollTop = cont.scrollTop;
      var offsetTop = $.isWindow(cont) ? 0 : this.$containerEl.offset().top;
      var itemTop = this.$el.offset().top - offsetTop;
      var itemBottom = itemTop + this.$el.height();
      var isAutoScroll = false;
      if (itemTop <= 0) {
        // auto scroll upwards
        if (scrollTop > 0) {
          scrollTop -= this.stepSize;
          this.autoMoveOffset = -this.stepSize;
          if (scrollTop < 0) {
            scrollTop = 0;
          }
          cont.scrollTop = scrollTop;
          isAutoScroll = true;
        }
      } else if (itemBottom >= clientHeight) {
        // auto scroll downwards
        if (scrollTop < this.maxScrollTop) {
          scrollTop += this.stepSize;
          this.autoMoveOffset = this.stepSize;
          if (scrollTop > this.maxScrollTop) {
            scrollTop = this.maxScrollTop;
          }
          cont.scrollTop = scrollTop;
          isAutoScroll = true;
        }
      }
      return isAutoScroll;
    },

    /**
     * Moves the card item's element by calculating its new position and calling
     * the function that was provided in the constructor as autoMoveFn.
     * @private
     */
    _autoMove: function () {
      if (this.autoMoveOffset && this.autoMoveFn) {
        var itemOffs = this.$el.offset();
        var itemTop = itemOffs.top + this.autoMoveOffset;
        this.autoMoveFn(itemOffs.left, itemTop);
      }
    },

    /**
     * Checks if autoscrolling is currently necessary; if so, the autoscrolling is
     * executed and a timer is started that will check again later if additional
     * auto scrolling is necessary (and execute again if so).
     */
    check: function () {
      var self = this;
      this.stop();
      var isAutoScroll = this._execute();
      if (isAutoScroll) {
        this.iid = window.setTimeout(function () {
          self.iid = undefined;
          self._autoMove();
        }, 50);
      }
    },

    /**
     * Stops autoscrolling.
     */
    stop: function () {
      if (this.iid !== undefined) {
        window.clearTimeout(this.iid);
        this.autoMoveOffset = 0;
        this.iid = undefined;
      }
    }

  });

  var ListItemMoveHandler = new Class(/** @lends CUI.CardView.ListItemMoveHandler# */{

    /**
     * The list's jQuery element
     * @type {jQuery}
     * @private
     */
    $listEl: null,

    /**
     * The moved item's jQuery element
     * @type {jQuery}
     * @private
     */
    $itemEl: null,

    /**
     * A jQuery element that contains all items of the list
     * @type {jQuery}
     * @private
     */
    $items: null,

    /**
     * The document
     * @type {jQuery}
     * @private
     */
    $doc: null,

    /**
     * The jQuery object that represents the card that is right before the moved card
     * just before the move; undefined, if the moved card is the first card of the list
     * @type {jQuery}
     * @private
     */
    $oldBefore: null,

    /**
     * The CSS class that is added to the item while it is moved
     * @type String
     * @private
     */
    dragCls: null,

    /**
     * Flag that determines if the horizontal position of an item should be fixed
     * while it is moved
     * @type {Boolean}
     * @private
     */
    fixHorizontalPosition: false,

    /**
     * The autoscroller module
     * @type {ListItemAutoScroller}
     * @private
     */
    autoScroller: null,

    /**
     * @ignore
     * @name CUI.CardView.ListItemMoveHandler
     *
     * @classdesc
     * Internal class that implements the reordering of cards in list view.
     *
     * @constructor
     * @desc
     * Creates a new handler for moving a item around in a list by drag &amp; drop (or
     * its touch counterpart).
     */
    construct: function (config) {
      var self = this;
      this.$listEl = config.$listEl;
      this.$itemEl = config.$itemEl;
      this.$items = config.$items;
      this.dragCls = config.dragCls;
      this.fixHorizontalPosition = (config.fixHorizontalPosition !== false);
      this.autoScroller = (config.autoScrolling ?
        new ListItemAutoScroller(this.$itemEl, 8, function (x, y) {
          self._autoMove(x, y);
        }) : undefined);
    },

    /**
     * Gets the page coordinates of the specified event, regardless if it is a mouse
     * or a touch event.
     * @param {Object} e The event
     * @return {{x: (Number), y: (Number)}} The page coordinates
     * @private
     */
    _getEventCoords: function (e) {
      if (!e.originalEvent.touches) {
        return {
          x: e.pageX,
          y: e.pageY
        };
      }
      return (e.originalEvent.touches.length > 0 ? {
        x: e.originalEvent.touches[0].pageX,
        y: e.originalEvent.touches[0].pageY
      } : e.originalEvent.changedTouches.length > 0 ? {
        x: e.originalEvent.changedTouches[0].pageX,
        y: e.originalEvent.changedTouches[0].pageY
      } : {
        x: e.pageX,
        y: e.pageY
      });
    },

    /**
     * Limits the specified coordinates to the list's real estate.
     * @param {Number} top vertical coordinate to limit
     * @param {Number} left horizontal coordinate to limit
     * @return {{top: *, left: *}}
     * @private
     */
    _limit: function (top, left) {
      if (left < this.listOffset.left) {
        left = this.listOffset.left;
      }
      if (top < this.listOffset.top) {
        top = this.listOffset.top;
      }
      var right = left + this.size.width;
      var bottom = top + this.size.height;
      var limitRight = this.listOffset.left + this.listSize.width;
      var limitBottom = this.listOffset - top + this.listSize.height;
      if (right > limitRight) {
        left = limitRight - this.size.width;
      }
      if (bottom > limitBottom) {
        top = limitBottom - this.size.height;
      }
      if (this.fixHorizontalPosition) {
        left = this.listOffset.left;
      }
      return {
        "top": top,
        "left": left
      };
    },

    /**
     * Gets the coordinates of the specified event in a device (mouse, touch) agnostic
     * way.
     * @param {Object} e The event
     * @return {{x: Number, y: Number}} The coordinates
     * @private
     */
    _getEventPos: function (e) {
      var evtPos = this._getEventCoords(e);
      return {
        x: evtPos.x - this.delta.left,
        y: evtPos.y - this.delta.top
      };
    },

    /**
     * Adjust the position of the moved item by limiting it to the containing list
     * and executing autoscrolling.
     * @param {Number} x The original x coordinate
     * @param {Number} y The original y coordinate
     * @private
     */
    _adjustPosition: function (x, y) {
      this.$itemEl.offset(this._limit(y, x));
      if (this.autoScroller) {
        this.autoScroller.check();
      }
    },

    /**
     * Changes the order of the items in the list if necessary.
     * @private
     */
    _changeOrderIfRequired: function () {
      var itemPos = this.$itemEl.offset();
      var hotX = itemPos.left + (this.size.width / 2);
      var hotY = itemPos.top + (this.size.height / 2);
      var $newTarget = null;
      // check if we are overlapping another item at least 50% -> then we will take
      // its position
      var isInsertBefore = false;
      for (var i = 0; i < this.$items.length; i++) {
        var $item = $(this.$items[i]);
        if (!Utils.equals($item, this.$itemEl)) {
          var offs = $item.offset();
          var width = $item.width();
          var height = $item.height();
          var bottom = offs.top + height;
          if ((hotX >= offs.left) && (hotX < offs.left + width) &&
            (hotY >= offs.top) && (hotY < bottom)) {
            isInsertBefore = ((hotY - offs.top) > (bottom - hotY));
            $newTarget = $item;
            break;
          }
        }
      }
      if ($newTarget) {
        var _offs = this.$itemEl.offset();
        if (isInsertBefore) {
          $newTarget.before(this.$itemEl);
        } else {
          $newTarget.after(this.$itemEl);
        }
        this.$itemEl.offset(_offs);
      }
    },

    /**
     * Callback for auto move (called by auto scroller implementation)
     * @param x {Number} The horizontal position
     * @param y {Number} The vertical position
     * @private
     */
    _autoMove: function (x, y) {
      this._adjustPosition(x, y);
      this._changeOrderIfRequired();
    },

    /**
     * Starts moving the list item.
     * @param {Object} e The event that starts the move
     */
    start: function (e) {
      this.$oldPrev = this.$itemEl.prev();
      this.$oldNext = this.$itemEl.next();

      var evtPos = this._getEventCoords(e);
      if (this.dragCls) {
        this.$itemEl.addClass(this.dragCls);
      }
      var self = this;
      this.$doc = $(document);
      this.$doc.on("touchmove.listview.drag mousemove.listview.drag",
        function (e) {
          self.move(e);
        });
      this.$doc.on("touchend.listview.drag mouseup.listview.drag",
        function (e) {
          self.end(e);
        });
      this.offset = this.$itemEl.offset();
      this.delta = {
        "left": evtPos.x - this.offset.left,
        "top": evtPos.y - this.offset.top
      };
      this.size = {
        "width": this.$itemEl.width(),
        "height": this.$itemEl.height()
      };
      this.listOffset = this.$listEl.offset();
      this.listSize = {
        "width": this.$listEl.width(),
        "height": this.$listEl.height()
      };
      e.stopPropagation();
      e.preventDefault();
      /*
       console.log("offset", this.offset, "delta", this.delta, "size", this.size,
       "listoffs", this.listOffset, "listsize", this.listSize);
       */
    },

    /**
     * Moves the card item.
     * @param {Object} e The event that is responsible for the move
     */
    move: function (e) {
      // console.log("move", e);
      var pos = this._getEventPos(e);
      this._adjustPosition(pos.x, pos.y);
      this._changeOrderIfRequired();
      e.stopPropagation();
      e.preventDefault();
    },

    /**
     * Finishes moving the card item.
     * @param {Object} e The event that is responsible for finishing the move
     */
    end: function (e) {
      var pos = this._getEventPos(e);
      this._adjustPosition(pos.x, pos.y);
      // console.log("end", e);
      if (this.dragCls) {
        this.$itemEl.removeClass(this.dragCls);
      }
      if (this.autoScroller) {
        this.autoScroller.stop();
      }
      this.$itemEl.css("position", "");
      this.$itemEl.css("top", "");
      this.$itemEl.css("left", "");
      this.$doc.off("touchmove.listview.drag");
      this.$doc.off("mousemove.listview.drag");
      this.$doc.off("touchend.listview.drag");
      this.$doc.off("mouseup.listview.drag");
      var $newPrev = this.$itemEl.prev();
      var $newNext = this.$itemEl.next();

      this.$itemEl.trigger($.Event("item-moved", {
        newPrev: $newPrev,
        newNext: $newNext,
        oldPrev: this.$oldPrev,
        oldNext: this.$oldNext,
        hasMoved: !Utils.equals($newPrev, this.$oldPrev)
      }));
      e.stopPropagation();
      e.preventDefault();
    }

  });

  /*
   * This class represents a single item in the list model.
   */
  var Item = new Class(/** @lends CUI.CardView.Item# */{

    /**
     * The jQuery object that represents the card
     * @type {jQuery}
     * @private
     */
    $itemEl: null,

    /**
     * @ignore
     * @name CUI.CardView.Item
     *
     * @classdesc
     * Internal class that represents a single card/list item in a card view's data
     * model.
     *
     * @constructor
     * @desc
     * Create a new card/list item.
     */
    construct: function ($itemEl) {
      this.$itemEl = $itemEl;
      this.reference();
    },

    /**
     * Get the card/list item's jQuery object.
     * @return {jQuery} The jQuery object
     */
    getItemEl: function () {
      return this.$itemEl;
    },

    /**
     * References the item's data model in the jQzery object.
     */
    reference: function () {
      this.$itemEl.data("cardView-item", this);
    }

  });

  var Header = new Class(/** @lends CUI.CardView.Header# */{

    /**
     * The jQuery object that represents the header
     * @type {jQuery}
     * @private
     */
    $headerEl: null,

    /**
     * The first item that follows the header
     * @type {CUI.CardView.Item}
     */
    itemRef: null,

    /**
     * @ignore
     * @name CUI.CardView.Header
     *
     * @classdesc
     * This class represents a list header (that is shown in list view only) in the
     * card view's data model.
     *
     * @constructor
     * @desc
     * Create a new list header.
     */
    construct: function ($headerEl, itemRef) {
      this.$headerEl = $headerEl;
      this.itemRef = itemRef;
    },

    /**
     * Get the jQuery object that is assosciated with the list header.
     * @return {jQuery} The associated jQuery object
     */
    getHeaderEl: function () {
      return this.$headerEl;
    },

    /**
     * Get the list item that follows the header directly.
     * @return {CUI.CardView.Item} The item
     */
    getItemRef: function () {
      return this.itemRef;
    },

    /**
     * Set the list item that follows the header directly.
     * @param {CUI.CardView.Item} itemRef The item
     */
    setItemRef: function (itemRef) {
      this.itemRef = itemRef;
    }

  });

  /**
   Handles resort according to columns
   */
  var ColumnSortHandler = new Class(/** @lends CUI.CardView.ColumnSortHandler# */{
    construct: function (options) {
      this.model = options.model;
      this.comparators = options.comparators;
      this.selectors = options.selectors;
      this.columnElement = options.columnElement;

      this.headerElement = options.columnElement.closest(this.selectors.headerSelector);
      var header = this.model.getHeaderForEl(this.headerElement);
      this.items = this.model.getItemsForHeader(header);

      this.isReverse = this.columnElement.hasClass("sort-asc"); // switch to reverse?
      this.toNatural = this.columnElement.hasClass("sort-desc"); // back to natural order?
      this.fromNatural = !this.headerElement.hasClass("sort-mode");

      this.comparator = null;

      // Choose the right comparator
      if (this.comparators) {
        for (var selector in this.comparators) {
          if (!this.columnElement.is(selector)) continue;
          this.comparator = this.comparators[selector];
        }
      }

      if (!this.comparator) this.comparator = this._readComparatorFromMarkup();
    },
    _readComparatorFromMarkup: function () {
      var selector = this.columnElement.data("sort-selector");
      var attribute = this.columnElement.data("sort-attribute");
      var sortType = this.columnElement.data("sort-type");
      var ignoreCase = this.columnElement.data("ignorecase");
      if (!selector && !attribute) return null;
      return new CUI.CardView.DefaultComparator(selector, attribute, sortType, ignoreCase);

    },
    _adjustMarkup: function () {
      // Adjust general mode class
      if (this.fromNatural) this.headerElement.addClass("sort-mode");
      if (this.toNatural) this.headerElement.removeClass("sort-mode");

      // Adjust column classes
      this.headerElement.find(this.selectors.controller.sort.columnSelector).removeClass("sort-asc sort-desc");
      this.columnElement.removeClass("sort-desc sort-asc");
      if (!this.toNatural) this.columnElement.addClass(this.isReverse ? "sort-desc" : "sort-asc");

      // Show or hide d&d elements
      var showMoveHandle = this.toNatural;
      $.each(this.items, function () {
        this.getItemEl().find(".move").toggle(showMoveHandle);
      });
    },
    sort: function () {
      if (!this.comparator && !this.toNatural) return;

      this._adjustMarkup();

      // Re-Sort items
      var items = this.items.slice(); // Make a copy before sorting
      // By default items are in their "natural" order, most probably defined by the user with d&d

      // Only sort if we have a comparator
      if (this.comparator) {
        this.comparator.setReverse(this.isReverse);
        var fn = this.comparator.getCompareFn();
        if (!this.toNatural) items.sort(fn);   // Only sort if we do not want to go back to natural order
      }

      // Adjust DOM
      var prevItem = this.headerElement; // Use header as starting point;
      $.each(this.items, function () {
        this.getItemEl().detach();
      }); // First: Detach all items

      // Now: reinsert in new order
      for (var i = 0; i < items.length; i++) {
        var item = items[i].getItemEl();
        prevItem.after(item);
        prevItem = item;
      }
    }
  });


  var DirectMarkupModel = new Class(/** @lends CUI.CardView.DirectMarkupModel# */{

    /**
     * The jQuery object that is the parent of the card view
     * @type {jQuery}
     * @private
     */
    $el: null,

    /**
     * List of items; original/current sorting order (without UI sorting applied)
     * @type {CUI.CardView.Item[]}
     * @private
     */
    items: null,

    /**
     * List of headers
     * @type {CUI.CardView.Header[]}
     * @private
     */
    headers: null,

    /**
     * CSS selector config
     * @type {Object}
     * @private
     */
    selectors: null,

    /**
     * @ignore
     * @name CUI.CardView.DirectMarkupModel
     *
     * @classdesc
     * This class represents a data model that is created via a selector from an
     * existing DOM.
     *
     * @constructor
     * @desc
     * Create a new data model.
     * @param {jQuery} $el The jQuery object that is the parent of the card view
     * @param {Object} selectors The CSS selector config
     */
    construct: function ($el, selectors) {
      this.$el = $el;
      this.items = [ ];
      this.selectors = selectors;
      var $items = this.$el.find(selectors.itemSelector);
      var itemCnt = $items.length;
      for (var i = 0; i < itemCnt; i++) {
        this.items.push(new Item($($items[i])));
      }
      this.headers = [ ];
      var $headers = this.$el.find(selectors.headerSelector);
      var headerCnt = $headers.length;
      for (var h = 0; h < headerCnt; h++) {
        var $header = $($headers[h]);
        var $itemRef = $header.nextAll(selectors.itemSelector);
        var itemRef = ($itemRef.length > 0 ?
          this.getItemForEl($($itemRef[0])) : undefined);
        this.headers.push(new Header($header, itemRef));
      }
    },

    /**
     * Initialize the data model.
     */
    initialize: function () {
      var self = this;
      this.$el.on("item-moved", this.selectors.itemSelector, function (e) {
        if (e.hasMoved) {
          self._reorder(e);
        }
      });
    },

    /**
     * Reorder the cards according to the specified event.
     * @param {Event} e The reordering event
     * @private
     */
    _reorder: function (e) {
      var itemToMove = this.getItemForEl($(e.target));
      var newBefore = this.getItemForEl(e.newPrev);
      var isHeaderInsert = false;
      var header;
      if (!newBefore) {
        header = this.getHeaderForEl(e.newPrev);
        if (header) {
          isHeaderInsert = true;
          var refPos = this.getItemIndex(header.getItemRef());
          if (refPos > 0) {
            newBefore = this.getItemAt(refPos - 1);
          }
        }
      }
      var oldPos = this.getItemIndex(itemToMove);
      this.items.splice(oldPos, 1);
      // if the item to move is directly following a header, the header's item ref
      // has to be updated
      var headerRef = this._getHeaderByItemRef(itemToMove);
      if (headerRef) {
        headerRef.setItemRef(this.getItemAt(oldPos));
      }
      var insertPos = (newBefore ? this.getItemIndex(newBefore) + 1 : 0);
      this.items.splice(insertPos, 0, itemToMove);
      if (isHeaderInsert) {
        header.setItemRef(itemToMove);
      }
      // console.log(itemToMove, newBefore, isHeaderInsert);
    },

    /**
     * Get the number of cards/list items.
     * @return {Number} The number of cards/list items
     */
    getItemCount: function () {
      return this.items.length;
    },

    /**
     * Get the card/list item that is at the specified list position.
     * @param {Number} pos The position
     * @return {CUI.CardView.Item} The item at the specified position
     */
    getItemAt: function (pos) {
      return this.items[pos];
    },

    /**
     * Get the list position of the specified card/list item.
     * @param {CUI.CardView.Item} item The item
     * @return {Number} The list position; -1 if the specified item is not a part of
     *         the list
     */
    getItemIndex: function (item) {
      for (var i = 0; i < this.items.length; i++) {
        if (item === this.items[i]) {
          return i;
        }
      }
      return -1;
    },

    /**
     * Get the card/list item that is associated with the specified jQuery object.
     * @param {jQuery} $el The jQuery object
     * @return {CUI.CardView.Item} The item; undefined if no item is associated with
     *         the specified jQuery object
     */
    getItemForEl: function ($el) {
      var itemCnt = this.items.length;
      for (var i = 0; i < itemCnt; i++) {
        var item = this.items[i];
        if (Utils.equals(item.getItemEl(), $el)) {
          return item;
        }
      }
      return undefined;
    },

    /**
     * <p>Inserts the specified card(s)/list item(s) at the given position.</p>
     * <p>Please note that you can specify multiple items either as an array of jQuery
     * objects or a single jQuery object that contains multiple DOM objects, each
     * representing an item.</p>
     * @param {jQuery|jQuery[]} $items The item(s) to insert
     * @param {Number} pos The position to insert
     * @param {Boolean} beforeHeader True if the items should added before headers (only
     *        applicable if the items are inserted directly at a position where also
     *        a header is present); needs to be false if the list has a single header
     *        that is placed at the top of the list
     */
    insertItemAt: function ($items, pos, beforeHeader) {
      if (!$.isArray($items)) {
        $items = $items.toArray();
      }
      for (var i = $items.length - 1; i >= 0; i--) {

        var $item = $items[i];
        if (!$item.jquery) {
          $item = $($item);
        }

        // adjust model
        var followupItem;
        var item = new Item($item);
        if ((pos === undefined) || (pos === null)) {
          this.items.push(item);
          pos = this.items.length - 1;
        } else {
          followupItem = this.items[pos];
          this.items.splice(pos, 0, item);
        }
        var insert = {
          "item": followupItem,
          "mode": "item"
        };

        // adjust header references if item is inserted directly behind a header
        var headerCnt = this.headers.length;
        for (var h = 0; h < headerCnt; h++) {
          var header = this.headers[h];
          if (header.getItemRef() === followupItem) {
            if (beforeHeader) {
              insert = {
                "item": header,
                "mode": "header"
              };
              break;
            } else {
              header.setItemRef(item);
            }
          }
        }

        // trigger event
        this.$el.trigger($.Event("change:insertitem", {
          "insertPoint": insert,
          "followupItem": followupItem,
          "item": item,
          "pos": pos,
          "widget": Utils.getWidget(this.$el),
          "moreItems": (i > 0)
        }));
      }
    },

    /**
     * Get the number of list headers.
     * @return {Number} The number of headers
     */
    getHeaderCount: function () {
      return this.headers.length;
    },

    /**
     * Get a list header by its position in the list of headers.
     * @param {Number} pos The list header
     * @return {CUI.CardView.Header} The list header at the specified position
     */
    getHeaderAt: function (pos) {
      return this.headers[pos];
    },

    /**
     * Get all list headers.
     * @return {CUI.CardView.Header[]} List headers
     */
    getHeaders: function () {
      var headers = [ ];
      headers.push.apply(headers, this.headers);
      return headers;
    },

    /**
     * Get the list header that is associated with the specified jQuery object.
     * @param {jQuery} $el The jQuery object
     * @return {CUI.CardView.Header} The list header; undefined if no header is
     *         associated with the jQuery object
     */
    getHeaderForEl: function ($el) {
      var headerCnt = this.headers.length;
      for (var h = 0; h < headerCnt; h++) {
        var header = this.headers[h];
        if (Utils.equals(header.getHeaderEl(), $el)) {
          return header;
        }
      }
      return undefined;
    },

    /**
     * Get the header that directly precedes the specified list item.
     * @param {CUI.CardView.Item} itemRef The item
     * @return {CUI.CardView.Header} header The header
     * @private
     */
    _getHeaderByItemRef: function (itemRef) {
      for (var h = 0; h < this.headers.length; h++) {
        if (this.headers[h].getItemRef() === itemRef) {
          return this.headers[h];
        }
      }
      return undefined;
    },

    /**
     * Get all list items that are preceded by the specified header.
     * @param header {CUI.CardView.Header} The header
     * @return {CUI.CardView.Item[]} The list items
     */
    getItemsForHeader: function (header) {
      // TODO does not handle empty headers yet
      var itemRef = header.getItemRef();
      var headerCnt = this.headers.length;
      var itemCnt = this.items.length;
      var itemsForHeader = [ ];
      var isInRange = false;
      for (var i = 0; i < itemCnt; i++) {
        var item = this.items[i];
        if (isInRange) {
          for (var h = 0; h < headerCnt; h++) {
            if (this.headers[h].getItemRef() === item) {
              isInRange = false;
              break;
            }
          }
          if (isInRange) {
            itemsForHeader.push(item);
          } else {
            break;
          }
        } else {
          if (item === itemRef) {
            isInRange = true;
            itemsForHeader.push(itemRef);
          }
        }
      }
      return itemsForHeader;
    },

    /**
     * Get the list items (data model) from their associated DOM objects.
     * @param {jQuery} $elements The jQuery object that specifies the items' DOM
     *        objects
     * @return {CUI.CardView.Item[]} List items
     */
    fromItemElements: function ($elements) {
      var items = [ ];
      $elements.each(function () {
        var item = $(this).data("cardView-item");
        if (item) {
          items.push(item);
        }
      });
      return items;
    },

    /**
     * Write back references to the data model to the respective DOM objects.
     */
    reference: function () {
      var itemCnt = this.items.length;
      for (var i = 0; i < itemCnt; i++) {
        this.items[i].reference();
      }
    },

    /**
     * Removes all items without triggering respective events.
     */
    removeAllItemsSilently: function () {
      this.items.length = 0;
      for (var h = 0; h < this.headers.length; h++) {
        this.headers[h].setItemRef(undefined);
      }
    }

  });

  var DirectMarkupView = new Class(/** @lends CUI.CardView.DirectMarkupView# */{

    /**
     * The jQuery object that is the parent of the card view
     * @type {jQuery}
     * @private
     */
    $el: null,

    /**
     * CSS selector config
     * @type {Object}
     * @private
     */
    selectors: null,

    /**
     * @ignore
     * @name CUI.CardView.DirectMarkupView
     *
     * @classdesc
     * This class represents a view for data represented by a DirectMarkupModel.
     *
     * @constructor
     * @desc
     * Create a new view.
     * @param {jQuery} $el The jQuery object that is the parent of the card view
     * @param {Object} selectors The CSS selector config
     */
    construct: function ($el, selectors) {
      this.$el = $el;
      this.selectors = selectors;
    },

    /**
     * Initializes the view.
     */
    initialize: function () {
      var self = this;
      this.$el.on("change:displayMode", function (e) {
        var oldMode = e.oldValue;
        var newMode = e.value;
        self.cleanupAfterDisplayMode(oldMode);
        self.prepareDisplayMode(newMode);
      });
      this.$el.on("change:insertitem", function (e) {
        self._onItemInserted(e);
      });
      this.$el.reflow({
        "small": function ($el, size) {
          return $el.width() > 40 * size.rem() && $el.width() < 50 * size.rem();
        },
        "xsmall": function ($el, size) {
          return $el.width() > 30 * size.rem() && $el.width() < 40 * size.rem();
        },
        "xxsmall": function ($el, size) {
          return $el.width() < 30 * size.rem();
        }
      });
    },

    /**
     * Handler that adjusts the view after a new card/list item has been inserted.
     * @param {Event} e The event
     * @private
     */
    _onItemInserted: function (e) {
      var $dataRoot = this.$el;
      if (this.selectors.dataContainer) {
        $dataRoot = $dataRoot.find("." + this.selectors.dataContainer);
      }
      var $item = e.item.getItemEl();
      var followupItem = e.followupItem;
      switch (this.getDisplayMode()) {
        case DISPLAY_LIST:
          if (!followupItem) {
            $dataRoot.append($item);
          } else {
            var insert = e.insertPoint;
            var item = insert.item;
            var $ref = (insert.mode === "item" ?
              item.getItemEl() : item.getHeaderEl());
            $ref.before($item);
          }
          break;
        case DISPLAY_GRID:
          if (!e.moreItems) {
            var widget = Utils.getWidget(this.$el);
            widget._restore();
            widget.layout();
          }
          break;
      }
    },

    /**
     * Get the current display mode (grid view/list view)
     * @return {String} The display mode; defined by constants prefixed by DISPLAY_
     */
    getDisplayMode: function () {
      return Utils.getWidget(this.$el).getDisplayMode();
    },

    /**
     * Set the selection state of the specified item.
     * @param {CUI.CardView.Item} item The item
     * @param {String} selectionState The selection state; currently supported:
     *        "selected", "unselected"
     */
    setSelectionState: function (item, selectionState) {
      var displayMode = this.getDisplayMode();
      var selectorDef = this.selectors.view.selectedItem[displayMode];
      var $itemEl = item.getItemEl();
      if (selectorDef.selector) {
        $itemEl = $itemEl.find(selectorDef.selector);
      }
      if (selectionState === "selected") {
        $itemEl
          .addClass(selectorDef.cls)
          .prev()
          .addClass(selectorDef.prv);
        if (displayMode === DISPLAY_GRID) {
          this._drawSelectedGrid(item);
        }
      } else if (selectionState === "unselected") {
        $itemEl
          .removeClass(selectorDef.cls)
          .prev()
          .removeClass(selectorDef.prv);
      }
    },

    /**
     * Get the selection state of the specified item.
     * @param {CUI.CardView.Item} item The item
     * @return {String} The selection state; currently supported: "selected",
     *         "unselected"
     */
    getSelectionState: function (item) {
      var selectorDef = this.selectors.view.selectedItem[this.getDisplayMode()];
      var $itemEl = item.getItemEl();
      if (selectorDef.selector) {
        $itemEl = $itemEl.find(selectorDef.selector);
      }
      var cls = selectorDef.cls.split(" ");
      for (var c = 0; c < cls.length; c++) {
        if (!$itemEl.hasClass(cls[c])) {
          return "unselected";
        }
      }
      return "selected";
    },

    /**
     * Get a list of currently selected items.
     * @return {jQuery} The list of selected items
     */
    getSelectedItems: function () {
      var selectorDef = this.selectors.view.selectedItems[this.getDisplayMode()];
      var $selectedItems = this.$el.find(selectorDef.selector);
      if (selectorDef.resolver) {
        $selectedItems = selectorDef.resolver($selectedItems);
      }
      return $selectedItems;
    },

    /**
     * <p>Restors the card view.</p>
     * <p>The container is purged and the cards are re-inserted in original order
     * (note that this is necessary, because the item elements get reordered for
     * card view; original order has to be restored for list view),</p>
     * @param {CUI.CardView.DirectMarkupModel} model The data model
     * @param {Boolean} restoreHeaders True if header objects should be restored as
     *        well (for list view)
     */
    restore: function (model, restoreHeaders) {
      var $container = $("<div class='" + this.selectors.dataContainer + "'>");
      this.$el.empty();
      this.$el.append($container);
      var itemCnt = model.getItemCount();
      for (var i = 0; i < itemCnt; i++) {
        $container.append(model.getItemAt(i).getItemEl());
      }
      if (restoreHeaders) {
        var headerCnt = model.getHeaderCount();
        for (var h = 0; h < headerCnt; h++) {
          var header = model.getHeaderAt(h);
          var $headerEl = header.getHeaderEl();
          var itemRef = header.getItemRef();
          if (itemRef) {
            itemRef.getItemEl().before($headerEl);
          } else {
            $container.append($headerEl);
          }
        }
      }
    },

    /**
     * Prepares the specified display mode (grid vs. list view).
     * @param {String} displayMode The display mode ({@link CUI.CardView.DISPLAY_GRID},
     *        {@link CUI.CardView.DISPLAY_LIST})
     */
    prepareDisplayMode: function (displayMode) {
      if (displayMode === DISPLAY_GRID) {
        this._drawAllSelectedGrid();
      }
    },

    /**
     * Clean up before the specified display mode is left.
     * @param {String} displayMode The display mode ({@link CUI.CardView.DISPLAY_GRID},
     *        {@link CUI.CardView.DISPLAY_LIST})
     */
    cleanupAfterDisplayMode: function (displayMode) {
      // not yet required; may be overridden
    },

    /**
     * Draw the multiplied version (used for displaying a selection) of the specified
     * image.
     * @param {jQuery} $image The image
     * @private
     */
    _drawImage: function ($image, $item) {
      if ($image.length === 0) {
        return;
      }

      if (this._colorFloat === undefined) {
        var color256 = $image.closest("a, .card", $item[0]).css("background-color");  // Let's grab the color from the card background

        if (!color256 || color256.indexOf("rgb(") < 0) {
            return;
        }

        this._colorFloat = $.map(color256.match(/(\d+)/g), function (val) { // RGB values between 0 and 1
          return val / 255;
        });
      }

      Utils.multiplyImages($image, this._colorFloat);
    },

    /**
     * Create the multiplied images for selected state (in grid view) for all cards.
     * @private
     */
    _drawAllSelectedGrid: function () {
      if (!this.selectors.enableImageMultiply) {
        return;
      }
      var self = this;

      $(this.selectors.view.selectedItems.grid.selector).each(function () {
        var $item = $(this);
        var $img = $item.find("img");

        self._drawImage($img, $item);
        $img.load(function () {
          self._drawImage($(this), $item);
        });
      });
    },

    /**
     * Create the multiplied image for the selected state of the specified card (in
     * grid view).
     * @param {CUI.CardView.Item} item The card/list item
     * @private
     */
    _drawSelectedGrid: function (item) {
      if (!this.selectors.enableImageMultiply) {
        return;
      }
      var self = this;
      var $item = item.getItemEl();
      var $img = $item.find("img");

      this._drawImage($img, $item);
      $img.load(function () {
        self._drawImage($(this), $item);
      });
    },

    /**
     * Removes all items from the view without triggering respective events.
     */
    removeAllItemsSilently: function () {
      this.$el.find(this.selectors.itemSelector).remove();
    }

  });

  var DirectMarkupController = new Class(/** @lends CUI.CardView.DirectMarkupController# */{

    /**
     * The jQuery object that is the parent of the card view
     * @type {jQuery}
     * @private
     */
    $el: null,

    /**
     * CSS selector config
     * @type {Object}
     * @private
     */
    selectors: null,

    /**
     * comparator config for list sorting
     * @type {Object}
     * @private
     */
    comparators: null,

    /**
     * The selection mode
     * @type {String}
     * @private
     */
    selectionModeCount: null,

    /**
     * @ignore
     * @name CUI.CardView.DirectMarkupController
     *
     * @classdesc
     * This class implements the controller for data represented by DirectMarkupModel
     * and displayed by DirectMarkupView.
     *
     * @constructor
     * @desc
     * Create a new controller.
     * @param {jQuery} $el The jQuery object that is the parent of the card view
     * @param {Object} selectors The CSS selector config
     * @param {Object} comparators The comparator config for column sorting
     */
    construct: function ($el, selectors, comparators) {
      this.$el = $el;
      this.selectors = selectors;
      this.comparators = comparators;
      this.selectionModeCount = SELECTION_MODE_COUNT_MULTI;
    },

    /**
     * Initializes the controller
     */
    initialize: function () {
      this.setDisplayMode(this.$el.hasClass("list") ? DISPLAY_LIST : DISPLAY_GRID);
      var self = this;

      // Selection
      this.$el.on("click.cardview.select",
        this.selectors.controller.selectElement.list, function (e) {
          var widget = Utils.getWidget(self.$el);
          if (widget.getDisplayMode() === DISPLAY_LIST) {
            var item = ensureItem(self.getItemElFromEvent(e));
            if (widget.toggleSelection(item)) {
              e.stopPropagation();
              e.preventDefault();
            }
          }
        });
      this.$el.on("click.cardview.select",
        this.selectors.controller.selectElement.grid, function (e) {
          var widget = Utils.getWidget(self.$el);
          if ((widget.getDisplayMode() === DISPLAY_GRID) &&
            widget.isGridSelectionMode()) {
            var item = ensureItem(self.getItemElFromEvent(e));
            if (widget.toggleSelection(item)) {
              e.stopPropagation();
              e.preventDefault();
            }
          }
        });
      // list header
      this.$el.on("click.cardview.selectall",
        this.selectors.controller.selectAll.selector, function (e) {
          var widget = Utils.getWidget(self.$el);
          if (widget.getDisplayMode() === DISPLAY_LIST) {
            var cls = self.selectors.controller.selectAll.cls;
            var $header = self.selectors.controller.targetToItem.header(
              $(e.target));
            var header = widget.getModel().getHeaderForEl($header);
            if ($header.hasClass(cls)) {
              widget.deselectAll(header);
            } else {
              widget.selectAll(header);
            }
          }
        });

      // list sorting
      this.$el.on("click.cardview.sort",
        this.selectors.headerSelector + " " + this.selectors.controller.sort.columnSelector, function (e) {

          var widget = Utils.getWidget(self.$el);
          var model = widget.getModel();

          // Trigger a sortstart event
          var event = $.Event("sortstart");
          $(e.target).trigger(event);
          if (event.isDefaultPrevented()) return;

          var sorter = new ColumnSortHandler({
            model: model,
            columnElement: $(e.target),
            comparators: self.comparators,
            selectors: self.selectors
          });
          sorter.sort();

          // Trigger an sortend event
          event = $.Event("sortend");
          $(e.target).trigger(event);
        });

      // Prevent text selection of headers!
      this.$el.on("selectstart.cardview", this.selectors.headerSelector + " " + this.selectors.controller.sort.columnSelector, function (e) {
        e.preventDefault();
      });

      // reordering
      this.$el.on("touchstart.cardview.reorder mousedown.cardview.reorder",
        this.selectors.controller.moveHandleElement.list, function (e) {
          var $itemEl = self.getItemElFromEvent(e);
          var handler = new ListItemMoveHandler({
            $listEl: self.$el,
            $itemEl: $itemEl,
            $items: $(self.selectors.itemSelector),
            dragCls: "dragging",
            autoScrolling: true
          });
          handler.start(e);
        });
      // handle select all state
      this.$el.on("change:selection", function (e) {
        if (e.moreSelectionChanges) {
          return;
        }
        self._adjustSelectAllState(e.widget);
      });
      this.$el.on("change:insertitem", function (e) {
        if (e.moreItems) {
          return;
        }
        self._adjustSelectAllState(e.widget);
      });
    },

    /**
     * Adjusts the state of the "select all" element of all list headers.
     * @param {CUI.CardView} widget The card view widget
     * @private
     */
    _adjustSelectAllState: function (widget) {
      var cls = this.selectors.controller.selectAll.cls;
      var selectionState = widget.getHeaderSelectionState();
      var headers = selectionState.headers;
      var headerCnt = headers.length;
      for (var h = 0; h < headerCnt; h++) {
        var header = headers[h];
        var $header = header.header.getHeaderEl();
        if (header.hasUnselected) {
          $header.removeClass(cls);
        } else {
          $header.addClass(cls);
        }
      }
    },

    /**
     * Resolves the target of the specified event to a jQuery element that represents
     * a card.
     * @param {Event} e The event
     * @return {jQuery} The jQuery object that represents a card
     */
    getItemElFromEvent: function (e) {
      var $target = $(e.target);
      var resolver = this.selectors.controller.targetToItem[this.getDisplayMode()];
      if ($.isFunction(resolver)) {
        return resolver($target);
      }
      return $target.find(resolver);
    },

    /**
     * Checks if selection mode is enabled for grid view.
     * @return {Boolean} True if selection mode is enabled
     */
    isGridSelect: function () {
      var selectorDef = this.selectors.controller.gridSelect;
      var $el = this.$el;
      if (selectorDef.selector) {
        $el = $el.find(selectorDef.selector);
      }
      return $el.hasClass(selectorDef.cls);
    },

    /**
     * Set selection mode for grid view.
     * @param {Boolean} isGridSelect True to turn selection mode on
     */
    setGridSelect: function (isGridSelect) {
      if (this.isGridSelect() !== isGridSelect) {
        var selectorDef = this.selectors.controller.gridSelect;
        var $el = this.$el;
        if (selectorDef.selector) {
          $el = $el.find(selectorDef.selector);
        }
        if (isGridSelect) {
          $el.addClass(selectorDef.cls);
        } else {
          $el.removeClass(selectorDef.cls);
          Utils.getWidget($el).clearSelection();
        }
        this.$el.trigger($.Event("change:gridSelect", {
          "widget": this.$el.data("cardView"),
          "oldValue": !isGridSelect,
          "value": isGridSelect
        }));
      }
    },

    /**
     * Get current display mode (grid/list view).
     * @return {String} Display mode ({@link CUI.CardView.DISPLAY_GRID},
     *         {@link CUI.CardView.DISPLAY_LIST})
     */
    getDisplayMode: function () {
      if (this.$el.hasClass("list")) {
        return DISPLAY_LIST;
      }
      if (this.$el.hasClass("grid")) {
        return DISPLAY_GRID;
      }
      return null;
    },

    /**
     * @return {boolean} true if this widget is currently in list mode and has a column sorting on any header applied
     */
    isColumnSorted: function () {
      return (this.getDisplayMode() == "list") && this.$el.find(this.selectors.headerSelector).filter(".sort-mode").length > 0;
    },

    /**
     * Set display mode.
     * @param {String} displayMode Display mode ({@link CUI.CardView.DISPLAY_GRID},
     *        {@link CUI.CardView.DISPLAY_LIST})
     */
    setDisplayMode: function (displayMode) {
      var oldValue = this.getDisplayMode();
      if (oldValue !== displayMode) {
        var widget = Utils.getWidget(this.$el);
        widget._restore(displayMode === DISPLAY_LIST);
        switch (displayMode) {
          case DISPLAY_GRID:
            this.$el.removeClass("list");
            this.$el.addClass("grid");
            if (oldValue !== null) {
              var selection = widget.getSelection();
              this.setGridSelect(selection.length > 0);
              widget.layout();
            }
            break;
          case DISPLAY_LIST:
            this.$el.cuigridlayout("destroy");
            this.$el.removeClass("grid");
            this.$el.addClass("list");
            break;
        }
        this.$el.trigger($.Event("change:displayMode", {
          "widget": this.$el.data("cardView"),
          "oldValue": oldValue,
          "value": displayMode
        }));
      }
    },

    /**
     * Get selection mode (single/multiple).
     * @return {String} The selection mode;
     *         {@link CUI.CardView.SELECTION_MODE_COUNT_SINGLE},
     *         {@link CUI.CardView.SELECTION_MODE_COUNT_MULTI}
     */
    getSelectionModeCount: function () {
      return this.selectionModeCount;
    },

    /**
     * Set selection mode (single/multiple).
     * @param {String} modeCount The selection mode;
     *         {@link CUI.CardView.SELECTION_MODE_COUNT_SINGLE},
     *         {@link CUI.CardView.SELECTION_MODE_COUNT_MULTI}
     */
    setSelectionModeCount: function (modeCount) {
      this.selectionModeCount = modeCount;
    }

  });

  var DirectMarkupAdapter = new Class(/** @lends CUI.CardView.DirectMarkupAdapter# */{

    /**
     * The jQuery object that is the parent of the card view
     * @type {jQuery}
     * @private
     */
    $el: null,

    /**
     * CSS selector config
     * @type {Object}
     * @private
     */
    selectors: null,

    /**
     * comparator config
     * @type {Object}
     * @private
     */
    comparators: null,

    /**
     * The model
     * @type {CUI.CardView.DirectMarkupModel}
     * @private
     */
    model: null,

    /**
     * The view
     * @type {CUI.CardView.DirectMarkupView}
     * @private
     */
    view: null,

    /**
     * The controller
     * @type {CUI.CardView.DirectMarkupController}
     * @private
     */
    controller: null,

    /**
     * @ignore
     * @name CUI.CardView.DirectMarkupAdapter
     *
     * @classdesc
     * Internal class that wires model, controller and view.
     *
     * @constructor
     * @desc
     * Create a new adapter.
     * @param {jQuery} $el The jQuery object that is the parent of the card view
     * @param {Object} selectors The CSS selector config
     */
    construct: function (selectors, comparators) {
      this.selectors = selectors;
      this.comparators = comparators;
    },

    /**
     * Initialize the adapter (and the wrapped model, view & controller).
     * @param {jQuery} $el The card view's parent element
     */
    initialize: function ($el) {
      this.$el = $el;
      this.setModel(new DirectMarkupModel($el, this.selectors));
      this.setView(new DirectMarkupView($el, this.selectors));
      this.setController(new DirectMarkupController($el, this.selectors, this.comparators));
      this.model.initialize();
      this.view.initialize();
      this.controller.initialize();
    },

    /**
     * Set the model.
     * @param {CUI.CardView.DirectMarkupModel} model The model
     */
    setModel: function (model) {
      this.model = model;
    },

    /**
     * Get the model.
     * @return {CUI.CardView.DirectMarkupModel} The model
     */
    getModel: function () {
      return this.model;
    },

    /**
     * Set the view.
     * @param {CUI.CardView.DirectMarkupView} view The view
     */
    setView: function (view) {
      this.view = view;
    },

    /**
     * Get the view.
     * @return {CUI.CardView.DirectMarkupView} The view
     */
    getView: function () {
      return this.view;
    },

    /**
     * Set the controller.
     * @param {CUI.CardView.DirectMarkupController} controller The controller
     */
    setController: function (controller) {
      this.controller = controller;
    },

    /**
     * Get the controller.
     * @return {CUI.CardView.DirectMarkupController} The controller
     */
    getController: function () {
      return this.controller;
    },

    /**
     * Check if the specified card/list item is selected.
     * @param {CUI.CardView.Item} item The card/item
     * @return {Boolean} True if it is selected
     */
    isSelected: function (item) {
      var selectionState = this.view.getSelectionState(item);
      return (selectionState === "selected");
    },

    /**
     * Set the selection state of zhe specified card/list item.
     * @param {CUI.CardView.Item} item The card/item
     * @param {Boolean} isSelected True if it is selected
     */
    setSelected: function (item, isSelected) {
      var selectionState = (isSelected ? "selected" : "unselected");
      this.view.setSelectionState(item, selectionState);
    },

    /**
     * Get a list of selected items
     * @param {Boolean} useModel True if {@link CUI.CardView.Item}s should be returned;
     *        false for jQuery objects
     * @return {CUI.CardView.Item[]|jQuery}
     */
    getSelection: function (useModel) {
      var selection = this.view.getSelectedItems();
      if (useModel === true) {
        selection = this.model.fromItemElements(selection);
      }
      return selection;
    },

    /**
     * Get the display mode.
     * @return {String} The display mode ({@link CUI.CardView.DISPLAY_GRID} or
     *         {@link CUI.CardView.DISPLAY_LIST})
     */
    getDisplayMode: function () {
      return this.controller.getDisplayMode();
    },

    /**
     * @return {boolean} true if this widget is currently in list mode and has a column sorting on any header applied
     */
    isColumnSorted: function () {
      return this.controller.isColumnSorted();
    },

    /**
     * Set the display mode.
     * @param {String} selectionMode The display mode ({@link CUI.CardView.DISPLAY_GRID}
     *        or {@link CUI.CardView.DISPLAY_LIST})
     */
    setDisplayMode: function (selectionMode) {
      this.controller.setDisplayMode(selectionMode);
    },

    /**
     * Check if selection mode is active in grid view.
     * @return {Boolean} True if selection mode is active
     */
    isGridSelectionMode: function () {
      return this.controller.isGridSelect();
    },

    /**
     * Set if selection mode is active in grid view.
     * @param {Boolean} isSelectionMdoe True if selection mode is active
     */
    setGridSelectionMode: function (isSelectionMode) {
      this.controller.setGridSelect(isSelectionMode);
    },

    /**
     * Get the general selection mode (single/multiple items)
     * @return {String} The selection mode
     *         ({@link CUI.CardView.SELECTION_MODE_COUNT_SINGLE},
     *         {@link CUI.CardView.SELECTION_MODE_COUNT_MULTI})
     */
    getSelectionModeCount: function () {
      return this.controller.getSelectionModeCount();
    },

    /**
     * Set the general selection mode (single/multiple items)
     * @param {String} modeCount The selection mode
     *        ({@link CUI.CardView.SELECTION_MODE_COUNT_SINGLE},
     *        {@link CUI.CardView.SELECTION_MODE_COUNT_MULTI})
     */
    setSelectionModeCount: function (modeCount) {
      this.controller.setSelectionModeCount(modeCount);
    },

    /**
     * Restores the opriginal DOM structure of the widget.
     * @param {Boolean} restoreHeaders True if list headers should also be restored
     *        (list view)
     * @protected
     */
    _restore: function (restoreHeaders) {
      this.view.restore(this.model, restoreHeaders);
      this.model.reference();
    },

    /**
     * Removes all items from the card view.
     */
    removeAllItems: function () {
      var widget = Utils.getWidget(this.$el);
      widget.clearSelection();
      this.model.removeAllItemsSilently();
      this.view.removeAllItemsSilently();
    }

  });

  CUI.CardView = new Class(/** @lends CUI.CardView# */{

    toString: 'CardView',

    extend: CUI.Widget,

    adapter: null,


    /**
     * @extends CUI.Widget
     * @classdesc
     * <p>A display of cards that can either be viewed as a grid or a list.</p>
     * <p>The display mode - grid or list view - can be changed programmatically
     * whenever required.</p>
     * <p>Grid view has two modes: navigation and selection, which can also be switched
     * programmatically. In navigation mode, the user can use cards to navigate
     * hierarchical structures ("to another stack of cards"). In selection mode, the
     * cards get selected on user interaction instead. List view combines both selection
     * and navigation modes.</p>
     * <p>The card view uses a data model internally that abstracts the cards. This
     * data model is currently not opened as API. Therefore you will often encounter
     * unspecified objects that represent cards in the data model. You can use them
     * interchangibly (for example, if one method returns a card data object, you can
     * pass it to another method that takes a card data object as a parameter), but
     * you shouldn't assume anything about their internals. You may use
     * {@link CUI.CardView#prepend}, {@link CUI.CardView#append} and
     * {@link CUI.CardView#removeAllItems} to manipulate the data model.</p>
     * <p>Please note that the current implementation has some limitiations which are
     * documented if known. Subsequent releases of CoralUI will remove those limitations
     * bit by bit.</p>
     * <p>The following example shows two cards in grid view:</p>
     *
     <div class="grid" data-toggle="cardview">
     <div class="grid-0">
     <article class="card-default">
     <i class="select"></i>
     <i class="move"></i>
     <a href="#">
     <span class="image">
     <img class="show-grid" src="images/preview.png" alt="">
     <img class="show-list" src="images/preview-small.png" alt="">
     </span>
     <div class="label">
     <h4>A card</h4>
     <p>Description</p>
     </div>
     </a>
     </article>
     <article class="card-default">
     <i class="select"></i>
     <i class="move"></i>
     <a href="#">
     <span class="image">
     <img class="show-grid" src="images/preview.png" alt="">
     <img class="show-list" src="images/preview-small.png" alt="">
     </span>
     <div class="label">
     <h4>Another card</h4>
     <p>See shell example page for more info.</p>
     </div>
     </a>
     </article>
     </div>
     </div>
     *
     * @example
     <caption>Instantiate with Class</caption>
     // Currently unsupported.
     *
     * @example
     <caption>Instantiate with jQuery</caption>
     // Currently unsupported.
     *
     * @example
     <caption>Markup</caption>
     &lt;div class="grid" data-toggle="cardview"&gt;
     &lt;div class="grid-0"&gt;
     &lt;article class="card-default"&gt;
     &lt;i class="select"&gt;&lt;/i&gt;
     &lt;i class="move"&gt;&lt;/i&gt;
     &lt;a href="#"&gt;
     &lt;span class="image"&gt;
     &lt;img class="show-grid" src="images/preview.png" alt=""&gt;
     &lt;img class="show-list" src="images/preview-small.png" alt=""&gt;
     &lt;/span&gt;
     &lt;div class="label"&gt;
     &lt;h4&gt;A card&lt;/h4&gt;
     &lt;p&gt;Description&lt;/p&gt;
     &lt;/div&gt;
     &lt;/a&gt;
     &lt;/article&gt;
     &lt;/div&gt;
     &lt;/div&gt;
     * @example
     <caption>Defining comparators for column sorting</caption>
     //  Define a selector for the column and then a comparator to be used for sorting
     // The comparator
     var comparatorConfig = {".label .main": new CUI.CardView.DefaultComparator(".label h4", null, false),
                   ".label .published": new CUI.CardView.DefaultComparator(".label .published", "data-timestamp", true)};
     new CUI.CardView({comparators: comparatorConfig})

     * @example
     <caption>Defining comparators via data API</caption>
     &lt;!-- Page header for list view --&gt;
     &lt;header class="card-page selectable movable"&gt;
     &lt;i class="select"&gt;&lt;/i&gt;
     &lt;i class="sort"&gt;&lt;/i&gt;
     &lt;div class="label"&gt;
     &lt;div class="main" data-sort-selector=".label h4"&gt;Title&lt;/div&gt;
     &lt;div class="published" data-sort-selector=".label .published .date" data-sort-attribute="data-timestamp" data-sort-type="numeric"&gt;Published&lt;/div&gt;
     &lt;div class="modified" data-sort-selector=".label .modified .date" data-sort-attribute="data-timestamp" data-sort-type="numeric"&gt;Modified&lt;/div&gt;
     &lt;div class="links" data-sort-selector=".label .links-number" data-sort-type="numeric"&gt;&lt;i class="icon-arrowright"&gt;Links&lt;/i&gt;&lt;/div&gt;
     &lt;/div&gt;
     &lt;/header&gt;
     &lt;!--
     Sorting is started when the user clicks on the corresponding column header.

     data-sort-selector   defines which part of the item to select for sorting
     data-sort-attribute  defines which attribute of the selected item element should be user for sorting. If not given, the inner text is used.
     data-sort-type       if set to "numeric", a numerical comparison is used for sorting, an alphabetical otherwise
     --&gt;

     * @example
     <caption>Switching to grid selection mode using API</caption>
     $cardView.cardView("toggleGridSelectionMode");
     *
     * @example
     <caption>Switching to grid selection mode using CSS contract</caption>
     $cardView.toggleClass("selection-mode");
     $cardView.find("article").removeClass("selected");
     *
     * @desc Creates a new card view.
     * @constructs
     *
     * @param {Object} [options] Component options
     * @param {Object} [options.selectorConfig]
     *        The selector configuration. You can also omit configuration values: Values not given will be used from
     *        the default selector configuration.
     * @param {String} options.selectorConfig.itemSelector
     *        The selector that is used to retrieve the cards from the DOM
     * @param {String} options.selectorConfig.headerSelector
     *        The selector that is used to retrieve the header(s) in list view from the
     *        DOM
     * @param {String} options.selectorConfig.dataContainer
     *        The class of the div that is used internally for laying out the cards
     * @param {Boolean} options.selectorConfig.enableImageMultiply
     *        Flag that determines if the images of cards should use the "multiply
     *        effect" for display in selected state
     * @param {Object} options.selectorConfig.view
     *        Configures the view of the CardView
     * @param {Object} options.selectorConfig.view.selectedItem
     *        Defines what classes on what elements are used to select a card
     * @param {Object} options.selectorConfig.view.selectedItem.list
     *        Defines the selection-related config in list view
     * @param {String} options.selectorConfig.view.selectedItem.list.cls
     *        Defines the CSS class that is used to select a card in list view
     * @param {String} [options.selectorConfig.view.selectedItem.list.selector]
     *        An additioonal selector if the selection class has to be set on a child
     *        element rather than the card's parent element
     * @param {Object} options.selectorConfig.view.selectedItem.grid
     *        Defines the selection-related config in grid view
     * @param {String} options.selectorConfig.view.selectedItem.grid.cls
     *        Defines the CSS class that is used to select a card in grid view
     * @param {String} [options.selectorConfig.view.selectedItem.grid.selector]
     *        An additioonal selector if the selection class has to be set on a child
     *        element rather than the card's parent element
     * @param {Object} options.selectorConfig.view.selectedItems
     *        Defines how to determine the currently selected cards
     * @param {Object} options.selectorConfig.view.selectedItems.list
     *        Defines how to determine the currently selected cards in list view
     * @param {String} options.selectorConfig.view.selectedItems.list.selector
     *        The selector that determines the DOM elements that represent all currently
     *        selected cards
     * @param {Function} [options.selectorConfig.view.selectedItems.list.resolver]
     *        A function that is used to calculate a card's parent element from the
     *        elements that are returned from the selector that is used for determining
     *        selected cards
     * @param {Object} options.selectorConfig.view.selectedItems.grid
     *        Defines how to determine the currently selected cards in grid view
     * @param {String} options.selectorConfig.view.selectedItems.grid.selector
     *        The selector that determines the DOM elements that represent all currently
     *        selected cards
     * @param {Function} [options.selectorConfig.view.selectedItems.grid.resolver]
     *        A function that is used to calculate a card's parent element from the
     *        elements that are returned from the selector that is used for determining
     *        selected cards
     * @param {Object} options.selectorConfig.controller
     *        Configures the controller of the CardView
     * @param {Object} options.selectorConfig.controller.selectElement
     *        The selector that defines the DOM element that is used for selecting
     *        a card (= targets for the respective click/tap handlers)
     * @param {String} options.selectorConfig.controller.selectElement.list
     *        The selector that defines the event targets for selecting a card in list
     *        view
     * @param {String} [options.selectorConfig.controller.selectElement.listNavElement]
     *        An additional selector that may be used to determine the element that is
     *        used for navigating in list view if it is different from the event target
     *        defined by options.selectorConfig.controller.selectElement.grid
     * @param {String} options.selectorConfig.controller.selectElement.grid
     *        The selector that defines the event targets for selecting a card in grid
     *        view
     * @param {Object} options.selectorConfig.controller.moveHandleElement
     *        The selector that defines the DOM elements that are used for moving
     *        cards in list view (= targets for the respective mouse/touch handlers)
     * @param {String} options.selectorConfig.controller.moveHandleElement.list
     *        The selector that defines the event targets for the handles that are used
     *        to move a card in list view
     * @param {Object} options.selectorConfig.controller.targetToItems
     *        Defines the mapping from event targets to cards
     * @param {Function|String} options.selectorConfig.controller.targetToItems.list
     *        A function that takes a jQuery object that represents the event target for
     *        selecting a card in list view and that has to return the jQuery object
     *        that represents the entire card; can optionally be a selector as well
     * @param {Function|String} options.selectorConfig.controller.targetToItems.grid
     *        A function that takes a jQuery object that represents the event target for
     *        selecting a card in grid view and that has to return the jQuery object t
     *        hat represents the entire card; can optionally be a selector as well
     * @param {Function|String} options.selectorConfig.controller.targetToItems.header
     *        A function that takes a jQuery object that represents the event target for
     *        the "select all" button of a header in list view and that has to return
     *        the jQuery object that represents the respective header; can optionally
     *        be a selector as well
     * @param {Object} options.selectorConfig.controller.gridSelect
     *        Defines the selection mode in grid view
     * @param {Object} options.selectorConfig.controller.gridSelect.cls
     *        Defines the class that is used to switch to selection mode in grid view
     * @param {Object} options.selectorConfig.controller.gridSelect.selector
     *        An additional selector that is used to define the child element where the
     *        selection mode class should be applied to/read from
     * @param {Object} options.selectorConfig.controller.selectAll
     *        Defines how to select all cards in list view
     * @param {Object} options.selectorConfig.controller.selectAll.selector
     *        The selector that is used to determine all "select all" buttons in a
     *        CardView
     * @param {Object} options.selectorConfig.controller.sort
     *        Defines selectors for the column sorting mechanism.
     * @param {Object} options.selectorConfig.controller.sort.columnSelector
     *        The selector for all column objects within the header
     * @param {Object} options.gridSettings
     *        Custom options for jQuery grid layout plugin.
     * @param {Object} options.selectorConfig.controller.selectAll.cls
     *        The class that has to be applied to each card if "select all" is invoked
     * @param {Object} [options.comparators]
     *        An associative array of comparators for column sorting: Every object attribute is a CSS selector
     *        defining one column and its value has to be of type CUI.CardView.DefaultComparator (or your own derived class)
     */
    construct: function (options) {
      // Mix given selector config with defaults: Use given config and add defaults, where no option is given
      var selectorConfig = Utils.mixObjects(options.selectorConfig, DEFAULT_SELECTOR_CONFIG);
      var comparators = options.comparators || null;

      this.adapter = new DirectMarkupAdapter(selectorConfig, comparators);
      this.adapter.initialize(this.$element);
      this.layout(options.gridSettings);
    },

    /*
     * Cleans up the component by removing any internal data and listeners. The component should be
     * used anymore after calling this method.
     *
     * @instance
     */
    destroy: function () {

      // removes every registered element
      this.$element.off();

      // removes the added components
      this.$element.removeData('cardView');
      if (this.$element.data('cuigridlayout')) {
        this.$element.data('cuigridlayout').destroy();
      }

      // removes the adapter reference
      this.adapter = null;

      // removes the element reference
      delete this.$element;
    },

    /**
     * Get the underlying data model.
     * @return {*} The underlying data model
     * @private
     */
    getModel: function () {
      return this.adapter.getModel();
    },

    /**
     * Set the underlying data model.
     * @param {*} model The underlying data model
     * @private
     */
    setModel: function (model) {
      this.adapter.setModel(model);
    },

    /**
     * Check if the specified item (part of the data model) is currently selected.
     * @param {*} item The item (data mode) to check
     * @return {Boolean} True if the specified item is selected
     * @private
     */
    isSelected: function (item) {
      return this.adapter.isSelected(item);
    },

    /**
     * Get the current display mode (grid or list view).
     * @return {String} The display mode; either {@link CUI.CardView.DISPLAY_GRID} or
     *         {@link CUI.CardView.DISPLAY_LIST}
     */
    getDisplayMode: function () {
      return this.adapter.getDisplayMode();
    },

    /**
     * @return {boolean} true if this widget is currently in list mode and has a column sorting on any header applied
     */
    isColumnSorted: function () {
      return this.adapter.isColumnSorted();
    },

    /**
     * @param {boolean} sortable     Set to true if this list should be sortable by click on column
     */
    setColumnSortable: function (sortable) {
      // TODO implement
    },

    /**
     * @return {boolean} True if this list is column sortable (does not say if it is currently sorted, use isColumnSorted() for this)
     */
    isColumnSortable: function () {
      // TODO implement
    },

    /**
     * Set the display mode (grid or list view).
     * @param {String} displayMode The display mode; either
     *        {@link CUI.CardView.DISPLAY_GRID} or {@link CUI.CardView.DISPLAY_LIST}
     */
    setDisplayMode: function (displayMode) {
      this.adapter.setDisplayMode(displayMode);
    },

    /**
     * Checks if selection mode is currently active in grid view.
     * @return {Boolean} True if selection mode is active
     */
    isGridSelectionMode: function () {
      return this.adapter.isGridSelectionMode();
    },

    /**
     * Set the selection mode in grid view.
     * @param {Boolean} isSelection True to switch grid selection mode on
     */
    setGridSelectionMode: function (isSelection) {
      this.adapter.setGridSelectionMode(isSelection);
    },

    /**
     * Toggle selection mode in grid view.
     */
    toggleGridSelectionMode: function () {
      this.setGridSelectionMode(!this.isGridSelectionMode());
    },

    getSelectionModeCount: function () {
      return this.adapter.getSelectionModeCount();
    },

    setSelectionModeCount: function (modeCount) {
      this.adapter.setSelectionModeCount(modeCount);
    },

    /**
     * <p>Select the specified item.</p>
     * <p>The second parameter should be used if multiple cards are selected/deselected
     * at once. It prevents some time consuming stuff from being executed more than
     * once.</p>
     * @param {jQuery|*} item The item to select; may either be from data model or a
     *        jQuery object
     * @param {Boolean} moreSelectionChanges True if there are more selection changes
     *        following directly
     */
    select: function (item, moreSelectionChanges) {
      // TODO implement beforeselect event
      item = ensureItem(item);
      var isSelected = this.adapter.isSelected(item);
      if (!isSelected) {
        if (this.getSelectionModeCount() === SELECTION_MODE_COUNT_SINGLE &&
          this.getSelection().length > 0) {
          this.clearSelection();
        }

        this.adapter.setSelected(item, true);
        this.$element.trigger($.Event("change:selection", {
          "widget": this,
          "item": item,
          "isSelected": true,
          "moreSelectionChanges": (moreSelectionChanges === true)
        }));
      }
    },

    /**
     * <p>Deselect the specified card.</p>
     * <p>The second parameter should be used if multiple cards are selected/deselected
     * at once. It prevents some time consuming stuff from being executed more than
     * once.</p>
     * @param {jQuery|*} item The item to deselect; may either be from data model or a
     *        jQuery object
     * @param {Boolean} moreSelectionChanges True if there are more selection changes
     *        following directly
     */
    deselect: function (item, moreSelectionChanges) {
      // TODO implement beforeselect event
      item = ensureItem(item);
      var isSelected = this.adapter.isSelected(item);
      if (isSelected) {
        this.adapter.setSelected(item, false);
        this.$element.trigger($.Event("change:selection", {
          "widget": this,
          "item": item,
          "isSelected": false,
          "moreSelectionChanges": moreSelectionChanges
        }));
      }
    },

    /**
     * <p>Toggle the selection state of the specified item.</p>
     * <p>The second parameter should be used if multiple cards are selected/deselected
     * at once. It prevents some time consuming stuff from being executed more than
     * once.</p>
     * @param {jQuery|*} item The item; may be either from data model or a jQuery object
     * @param {Boolean} moreSelectionChanges True if there are more selection changes
     *        following directly
     * @return {Boolean} True if the toggle requires the originating event (if any)
     *         to be stopped and to prevent browser's default behavior
     */
    toggleSelection: function (item, moreSelectionChanges) {
      item = ensureItem(item);

      // allow to cancel & stop the event
      var beforeEvent = $.Event("beforeselect", {

        selectionCancelled: false,

        stopEvent: false,

        item: item,

        cancelSelection: function (stopEvent) {
          this.selectionCancelled = true;
          this.stopEvent = (stopEvent === true);
        }
      });
      this.$element.trigger(beforeEvent);
      if (beforeEvent.selectionCancelled) {
        return beforeEvent.stopEvent;
      }

      var isSelected = this.isSelected(item);
      if (!isSelected &&
        (this.getSelectionModeCount() === SELECTION_MODE_COUNT_SINGLE) &&
        (this.getSelection().length > 0)) {
        this.clearSelection();
      }

      this.adapter.setSelected(item, !isSelected);
      this.$element.trigger($.Event("change:selection", {
        "widget": this,
        "item": item,
        "isSelected": !isSelected,
        "moreSelectionChanges": moreSelectionChanges
      }));
      return true;
    },

    /**
     * Gets the currently selected cards.
     * @param {Boolean} useModel True if items from the data model should be retured;
     *        false, if a jQuery object should be returned instead
     * @return {Array|jQuery} The selected items
     */
    getSelection: function (useModel) {
      return this.adapter.getSelection(useModel === true);
    },

    /**
     * Clears the current selection state by deselecting all selected cards.
     */
    clearSelection: function () {
      var selection = this.getSelection(true);
      var itemCnt = selection.length;
      var finalItem = (itemCnt - 1);
      for (var i = 0; i < itemCnt; i++) {
        this.deselect(selection[i], (i < finalItem));
      }
    },

    /**
     * @private
     */
    _headerSel: function (headers, selectFn, lastValidItemFn) {
      var model = this.adapter.getModel();
      if (headers == null) {
        headers = model.getHeaders();
      }
      if (!$.isArray(headers)) {
        headers = [ headers ];
      }
      var headerCnt = headers.length;
      for (var h = 0; h < headerCnt; h++) {
        var header = headers[h];
        if (header.jquery) {
          header = model.getHeaderForEl(header);
        }
        var itemsToSelect = model.getItemsForHeader(header);
        var itemCnt = itemsToSelect.length;
        for (var i = 0; i < itemCnt; i++) {
          selectFn.call(this,
            itemsToSelect[i], !lastValidItemFn(i, itemsToSelect));
        }
      }
    },

    /**
     * <p>Selects all cards.</p>
     * <p>If the headers parameter is specified, all items that are part of one
     * of the specified headers get selected. Items that are not assigned to one of the
     * specified headers are not changed.</p>
     * @param {Array} [headers] Header filter
     */
    selectAll: function (headers) {
      if (this.getSelectionModeCount() !== SELECTION_MODE_COUNT_MULTI) return;

      var self = this;
      this._headerSel(headers, this.select, function (i, items) {
        for (++i; i < items.length; i++) {
          if (!self.isSelected(items[i])) {
            return false;
          }
        }
        return true;
      });
    },

    /**
     * <p>Deselect all cards.</p>
     * <p>If the headers parameter is specified, all items that are part of one
     * of the specified headers get deselected. Items that are not assigned to one of
     * the specified headers are not changed.</p>
     * @param {Array} [headers] Header filter
     */
    deselectAll: function (headers) {
      var self = this;
      this._headerSel(headers, this.deselect, function (i, items) {
        for (++i; i < items.length; i++) {
          if (self.isSelected(items[i])) {
            return false;
          }
        }
        return true;
      });
    },

    /**
     * @private
     */
    getHeaderSelectionState: function () {
      var model = this.getModel();
      var curHeader = null;
      var state = {
        "selected": [ ],
        "hasUnselected": false,
        "headers": [ ]
      };
      var headerCnt = model.getHeaderCount();
      var itemCnt = model.getItemCount();
      for (var i = 0; i < itemCnt; i++) {
        var item = model.getItemAt(i);
        for (var h = 0; h < headerCnt; h++) {
          var header = model.getHeaderAt(h);
          if (header.getItemRef() === item) {
            curHeader = {
              "header": header,
              "selected": [ ],
              "hasUnselected": false
            };
            state.headers.push(curHeader);
            break;
          }
        }
        if (this.isSelected(item)) {
          if (curHeader !== null) {
            curHeader.selected.push(item);
          } else {
            state.selected.push(item);
          }
        } else {
          if (curHeader !== null) {
            curHeader.hasUnselected = true;
          } else {
            state.hasUnselected = true;
          }
        }
      }
      return state;
    },

    /**
     * Create and execute a layout of the cards if in grid view.
     */
    layout: function (settings) {
      if (this.getDisplayMode() !== DISPLAY_GRID) {
        return;
      }
      if (this.$element.data('cuigridlayout')) {
        this.$element.cuigridlayout("destroy");
      }
      this.$element.cuigridlayout(settings);
    },

    /**
     * Exexute a relayout of the cards if in grid view.
     */
    relayout: function () {
      if (this.getDisplayMode() !== DISPLAY_GRID) {
        return;
      }
      this.$element.cuigridlayout("layout");
    },

    /**
     * @protected
     */
    _restore: function (restoreHeaders) {
      this.adapter._restore(restoreHeaders);
    },

    /**
     * <p>Append the specified jQuery items as cards.</p>
     * <p>Note that if you are intending to add multiple cards at once, you should
     * either create a single jQuery object that matches the cards to append or an array
     * of jQuery objects, where each array element represents a single card.</p>
     * @param {jQuery|jQuery[]} $items The jQuery item(s) to append
     */
    append: function ($items) {
      this.adapter.getModel().insertItemAt($items, null, false);
    },

    /**
     * Prepend the specified jQuery items as cards.
     * @param {jQuery} $items The jQuery item(s) to prepend
     */
    prepend: function ($items) {
      this.adapter.getModel().insertItemAt($items, 0, false);
    },

    /**
     * Remove all cards from the view.
     */
    removeAllItems: function () {
      this.adapter.removeAllItems();
      if (this.getDisplayMode() === DISPLAY_GRID) {
        this.relayout();
      }
      this.$element.trigger($.Event("change:removeAll", {
        widget: this
      }));
    }

  });

  /** Comparator class for column sorting */
  CUI.CardView.DefaultComparator = new Class(/** @lends CUI.CardView.DefaultComparator# */{
    /**
     * This comparator can select any text or attribute of a given jQuery element and compares
     * it with a second item either numerical or alpahebtical
     *
     * @param {String}  selector   A CSS selector that matches the part of the item to be compared
     * @param {String}  attribute  The attribute of the item to be compared. If not given, the inner text of the item will be used for comparison.
     * @param {String}  type  "numeric" for numeric comparison, or "string" for alphabetical comparison
     */
    construct: function (selector, attribute, type, ignoreCase) {
      this.selector = selector;
      this.attribute = attribute;
      this.ignoreCase = ignoreCase;
      this.isNumeric = (type == "numeric");
      this.reverseMultiplier = 1;
    },
    /**
     * Changes the order of the sort algorithm
     * @param {boolean} True for reverse sorting, false for normal
     */
    setReverse: function (isReverse) {
      this.reverseMultiplier = (isReverse) ? -1 : 1;
    },
    /**
     * Compares two items according to the configuration
     * @return {integer} -1, 0, 1
     */
    compare: function (item1, item2) {
      var $item1 = item1.getItemEl();
      var $item2 = item2.getItemEl();
      var $e1 = (this.selector) ? $item1.find(this.selector) : $item1;
      var $e2 = (this.selector) ? $item2.find(this.selector) : $item2;
      var t1 = "";
      var t2 = "";
      if (!this.attribute) {
        t1 = (this.ignoreCase) ? $e1.text().toLowerCase() : $e1.text();
        t2 = (this.ignoreCase) ? $e2.text().toLowerCase() : $e2.text();
      } else if (this.attribute.substr(0, 5) == "data-") {
        t1 = $e1.data(this.attribute.substr(5));
        t2 = $e2.data(this.attribute.substr(5));
      } else {
        t1 = $e1.attr(this.attribute);
        t2 = $e2.attr(this.attribute);
      }

      if (this.isNumeric) {
        t1 = t1 * 1;
        t2 = t2 * 1;
        if (isNaN(t1)) t1 = 0;
        if (isNaN(t2)) t2 = 0;
      }

      if (t1 > t2) return 1 * this.reverseMultiplier;
      if (t1 < t2) return -1 * this.reverseMultiplier;
      return 0;
    },
    /**
     * Return the compare function for use in Array.sort()
     * @return {function} The compare function (bound to this object)
     */
    getCompareFn: function () {
      return this.compare.bind(this);
    }
  });


  /**
   * Display mode: grid view; value: "grid"
   * @type {String}
   */
  CUI.CardView.DISPLAY_GRID = DISPLAY_GRID;

  /**
   * Display mode: list view; value: "list"
   * @type {String}
   */
  CUI.CardView.DISPLAY_LIST = DISPLAY_LIST;

  /**
   * Single selection mode; value: "single"
   * @type {String}
   */
  CUI.CardView.SELECTION_MODE_COUNT_SINGLE = "single";

  /**
   * Multi selection mode; value: "multiple"
   * @type {String}
   */
  CUI.CardView.SELECTION_MODE_COUNT_MULTI = "multiple";

  /**
   * Utility method to get a {@link CUI.CardView} for the specified jQuery element.
   * @param {jQuery} $el The jQuery element to get the widget for
   * @return {CUI.CardView} The widget
   */
  CUI.CardView.get = function ($el) {
    var cardView = Utils.getWidget($el);
    if (!cardView) {
      cardView = Utils.getWidget($el.cardView());
    }
    return cardView;
  };

  CUI.Widget.registry.register("cardview", CUI.CardView);

  // Data API
  if (CUI.options.dataAPI) {
    $(function () {
      var cardViews = $('body').find('[data-toggle="cardview"]');
      for (var gl = 0; gl < cardViews.length; gl++) {
        var $cardView = $(cardViews[gl]);
        if (!$cardView.data("cardview")) {
          CUI.CardView.init($cardView);
        }
      }
    });
  }

  // additional JSdoc

  /**
   * Triggered when a new card has been inserted succesfully.
   * @name CUI.CardView#change:insertitem
   * @event
   * @param {Object} evt The event
   * @param {CUI.CardView} evt.widget The widget
   * @param {*} evt.item The inserted item (data model)
   */

  /**
   * Triggered when the grid selection mode changes.
   * @name CUI.CardView#change:gridSelect
   * @event
   * @param {Object} evt The event
   * @param {CUI.CardView} evt.widget The widget
   * @param {Boolean} evt.oldValue True if grid select mode was previously active
   * @param {Boolean} evt.value True if grid select mode is now active
   */

  /**
   * Triggered when the display mode (list/grid view) changes. Display modes are
   * defined by their respective String constants, see for example
   * {@link CUI.CardView.DISPLAY_GRID}.
   * @name CUI.CardView#change:displayMode
   * @event
   * @param {Object} evt The event
   * @param {CUI.CardView} evt.widget The widget
   * @param {String} evt.oldValue The old display mode
   * @param {String} evt.value The new display mode
   */

  /**
   * Triggered when the selection changes.
   * @name CUI.CardView#change:selection
   * @event
   * @param {Object} evt The event
   * @param {CUI.CardView} evt.widget The widget
   * @param {*} evt.item The card that is (de)selected (data model)
   * @param {Boolean} evt.isSelected True if the item is now selected
   * @param {Boolean} evt.moreSelectionChanges True if there are more selection changes
   *        following (multiple single selection changes can be treated as one big
   *        selection change)
   */

  /**
   * Triggered right before the selection changes if (and only if) the selection is
   * changed using {@link CUI.CardView#toggleSelection}. The selection change can be
   * vetoed by calling cancelSelection on the Event object.
   * @name CUI.CardView#beforeselect
   * @event
   * @param {Object} evt The event
   * @param {*} evt.item The card that is will get (de)selected (data model)
   * @param {Function} evt.changeSelection This function may be called to cancel the
   *        selection; if true is passed as an argument, the originating event (if
   *        applicable; for example if the selection change is triggered by a user
   *        interaction) is cancelled as well (no event propagation; no default browser
   *        behavior)
   */

  /**
   * Triggered after an item has been moved with drag&drop to a new place in the list by the user.
   * @name CUI.CardView#item-moved
   * @event
   * @param {Object} evt          The event
   * @param {Object} evt.oldPrev  The jQuery element that was previous to the item before dragging started, may be empty or a header
   * @param {Object} evt.oldNext  The jQuery element that was next to the item before dragging started, may be empty
   * @param {Object} evt.newPrev  The jQuery element that is now previous to the item, may be empty or a header
   * @param {Object} evt.newNext  The jQuery element that is now next to the item, may be empty
   * @param {boolean} evt.hasMoved  True if the item really moved or false if it has the some position after the drag action as before.
   */

  /**
   * Triggered right before a column sort action on the list is started (when the user clicks on a column). The client side
   * sorting can be vetoed by setting preventDefault() on the event object. The event target is set to the column header the user clicked on.
   * The sortstart event is always triggered, even if the column has no client side sort configuration.
   * @name CUI.CardView#sortstart
   * @event
   * @param {Object} evt The event
   */

  /**
   * Triggered right after a sorting action on the list has been finished (when the user has clicked on a column).
   * The event target is set to the column header the user clicked on. This event is always triggered, even if the column does not have
   * a client side sort configuration.
   * @name CUI.CardView#sortend
   * @event
   * @param {Object} evt The event
   */

  /**
   * Triggered when all cards are removed.
   * @name CUI.CardView#change:removeAll
   * @event
   * @param {Object} evt The event
   * @param {CUI.CardView} evt.widget The widget
   */

}(window.jQuery));
