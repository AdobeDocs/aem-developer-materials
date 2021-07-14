/* global Typekit */
/* jshint -W033,-W116 */
(function(window, undefined) {
  "use strict"

  var typeKitId = 'ruf7eed';

  if (window.Coral && window.Coral.options && window.Coral.options.typeKitId) {
    typeKitId = window.Coral.options.typeKitId;
  }

  var config = {
    kitId: typeKitId,
    scriptTimeout: 3000
  };

  if (!window.Typekit) { // we load the typescript only once
    var h = document.getElementsByTagName("html")[0];
    h.className += " wf-loading";
    var t = setTimeout(function() {
      h.className = h.className.replace(/(\s|^)wf-loading(\s|$)/g, " ");
      h.className += " wf-inactive";
    }, config.scriptTimeout);
    var tk = document.createElement("script"),
      d = false;

    // Always load over https
    tk.src = 'https://use.typekit.net/' + config.kitId + '.js'
    tk.type = "text/javascript";
    tk.async = "true";
    tk.onload = tk.onreadystatechange = function() {
      var a = this.readyState;
      if (d || a && a !== "complete" && a !== "loaded") {
        return;
      }
      d = true;
      clearTimeout(t);
      try {
        Typekit.load(config);
      } catch (b) {}
    };
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(tk, s);
  }

}(this));

/*!
 * jQuery UI Core @VERSION
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 */

/*
  Note: This code has been lifted directly from jQuery UI
  https://github.com/jquery/jquery-ui/blob/master/ui/core.js
*/
(function ($) {

  // selectors
  function focusable( element, isTabIndexNotNaN ) {
    var map, mapName, img,
      nodeName = element.nodeName.toLowerCase();
    if ( "area" === nodeName ) {
      map = element.parentNode;
      mapName = map.name;
      if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
        return false;
      }
      img = $( "img[usemap='#" + mapName + "']" )[ 0 ];
      return !!img && visible( img );
    }
    return ( /^(input|select|textarea|button|object)$/.test( nodeName ) ?
      !element.disabled :
      "a" === nodeName ?
        element.href || isTabIndexNotNaN :
        isTabIndexNotNaN) &&
      // the element and all of its ancestors must be visible
      visible( element );
  }

  function visible( element ) {
    return $.expr.filters.visible( element ) &&
      !$( element ).parents().addBack().filter(function() {
        return $.css( this, "visibility" ) === "hidden";
      }).length;
  }

  $.extend( $.expr[ ":" ], {
    data: $.expr.createPseudo ?
      $.expr.createPseudo(function( dataName ) {
        return function( elem ) {
          return !!$.data( elem, dataName );
        };
      }) :
      // support: jQuery <1.8
      function( elem, i, match ) {
        return !!$.data( elem, match[ 3 ] );
      },

    focusable: function( element ) {
      return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
    },

    tabbable: function( element ) {
      var tabIndex = $.attr( element, "tabindex" ),
        isTabIndexNaN = isNaN( tabIndex );
      return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
    }
  });

}(jQuery));

/*!
 * jQuery UI Position b3a9b13a218cd90b7cf67be5d5f8ad6e76c557b0
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/position/
 */

//>>label: Position
//>>group: UI Core
//>>description: Positions elements relative to other elements.
//>>docs: http://api.jqueryui.com/position/
//>>demos: http://jqueryui.com/position/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {
( function() {

$.ui = $.ui || {};

var cachedScrollbarWidth, supportsOffsetFractions,
	max = Math.max,
	abs = Math.abs,
	round = Math.round,
	rhorizontal = /left|center|right/,
	rvertical = /top|center|bottom/,
	roffset = /[\+\-]\d+(\.[\d]+)?%?/,
	rposition = /^\w+/,
	rpercent = /%$/,
	_position = $.fn.position;

// Support: IE <=9 only
supportsOffsetFractions = function() {
	var element = $( "<div>" )
			.css( "position", "absolute" )
			.appendTo( "body" )
			.offset( {
				top: 1.5,
				left: 1.5
			} ),
		support = element.offset().top === 1.5;

	element.remove();

	supportsOffsetFractions = function() {
		return support;
	};

	return support;
};

function getOffsets( offsets, width, height ) {
	return [
		parseFloat( offsets[ 0 ] ) * ( rpercent.test( offsets[ 0 ] ) ? width / 100 : 1 ),
		parseFloat( offsets[ 1 ] ) * ( rpercent.test( offsets[ 1 ] ) ? height / 100 : 1 )
	];
}

function parseCss( element, property ) {
	return parseInt( $.css( element, property ), 10 ) || 0;
}

function getDimensions( elem ) {
	var raw = elem[ 0 ];
	if ( raw.nodeType === 9 ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: 0, left: 0 }
		};
	}
	if ( $.isWindow( raw ) ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: elem.scrollTop(), left: elem.scrollLeft() }
		};
	}
	if ( raw.preventDefault ) {
		return {
			width: 0,
			height: 0,
			offset: { top: raw.pageY, left: raw.pageX }
		};
	}
	return {
		width: elem.outerWidth(),
		height: elem.outerHeight(),
		offset: elem.offset()
	};
}

$.position = {
	scrollbarWidth: function() {
		if ( cachedScrollbarWidth !== undefined ) {
			return cachedScrollbarWidth;
		}
		var w1, w2,
			div = $( "<div style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>" ),
			innerDiv = div.children()[ 0 ];

		$( "body" ).append( div );
		w1 = innerDiv.offsetWidth;
		div.css( "overflow", "scroll" );

		w2 = innerDiv.offsetWidth;

		if ( w1 === w2 ) {
			w2 = div[ 0 ].clientWidth;
		}

		div.remove();

		return ( cachedScrollbarWidth = w1 - w2 );
	},
	getScrollInfo: function( within ) {
		var overflowX = within.isWindow || within.isDocument ? "" :
				within.element.css( "overflow-x" ),
			overflowY = within.isWindow || within.isDocument ? "" :
				within.element.css( "overflow-y" ),
			hasOverflowX = overflowX === "scroll" ||
				( overflowX === "auto" && within.width < within.element[ 0 ].scrollWidth ),
			hasOverflowY = overflowY === "scroll" ||
				( overflowY === "auto" && within.height < within.element[ 0 ].scrollHeight );
		return {
			width: hasOverflowY ? $.position.scrollbarWidth() : 0,
			height: hasOverflowX ? $.position.scrollbarWidth() : 0
		};
	},
	getWithinInfo: function( element ) {
		var withinElement = $( element || window ),
			isWindow = $.isWindow( withinElement[ 0 ] ),
			isDocument = !!withinElement[ 0 ] && withinElement[ 0 ].nodeType === 9,
			hasOffset = !isWindow && !isDocument;
		return {
			element: withinElement,
			isWindow: isWindow,
			isDocument: isDocument,
			offset: hasOffset ? $( element ).offset() : { left: 0, top: 0 },
			scrollLeft: withinElement.scrollLeft(),
			scrollTop: withinElement.scrollTop(),
			width: withinElement.outerWidth(),
			height: withinElement.outerHeight()
		};
	}
};

$.fn.position = function( options ) {
	if ( !options || !options.of ) {
		return _position.apply( this, arguments );
	}

	// make a copy, we don't want to modify arguments
	options = $.extend( {}, options );

	var atOffset, targetWidth, targetHeight, targetOffset, basePosition, dimensions,
		target = $( options.of ),
		within = $.position.getWithinInfo( options.within ),
		scrollInfo = $.position.getScrollInfo( within ),
		collision = ( options.collision || "flip" ).split( " " ),
		offsets = {};

	dimensions = getDimensions( target );
	if ( target[ 0 ].preventDefault ) {
		// force left top to allow flipping
		options.at = "left top";
	}
	targetWidth = dimensions.width;
	targetHeight = dimensions.height;
	targetOffset = dimensions.offset;
	// clone to reuse original targetOffset later
	basePosition = $.extend( {}, targetOffset );

	// force my and at to have valid horizontal and vertical positions
	// if a value is missing or invalid, it will be converted to center
	$.each( [ "my", "at" ], function() {
		var pos = ( options[ this ] || "" ).split( " " ),
			horizontalOffset,
			verticalOffset;

		if ( pos.length === 1 ) {
			pos = rhorizontal.test( pos[ 0 ] ) ?
				pos.concat( [ "center" ] ) :
				rvertical.test( pos[ 0 ] ) ?
					[ "center" ].concat( pos ) :
					[ "center", "center" ];
		}
		pos[ 0 ] = rhorizontal.test( pos[ 0 ] ) ? pos[ 0 ] : "center";
		pos[ 1 ] = rvertical.test( pos[ 1 ] ) ? pos[ 1 ] : "center";

		// calculate offsets
		horizontalOffset = roffset.exec( pos[ 0 ] );
		verticalOffset = roffset.exec( pos[ 1 ] );
		offsets[ this ] = [
			horizontalOffset ? horizontalOffset[ 0 ] : 0,
			verticalOffset ? verticalOffset[ 0 ] : 0
		];

		// reduce to just the positions without the offsets
		options[ this ] = [
			rposition.exec( pos[ 0 ] )[ 0 ],
			rposition.exec( pos[ 1 ] )[ 0 ]
		];
	} );

	// normalize collision option
	if ( collision.length === 1 ) {
		collision[ 1 ] = collision[ 0 ];
	}

	if ( options.at[ 0 ] === "right" ) {
		basePosition.left += targetWidth;
	} else if ( options.at[ 0 ] === "center" ) {
		basePosition.left += targetWidth / 2;
	}

	if ( options.at[ 1 ] === "bottom" ) {
		basePosition.top += targetHeight;
	} else if ( options.at[ 1 ] === "center" ) {
		basePosition.top += targetHeight / 2;
	}

	atOffset = getOffsets( offsets.at, targetWidth, targetHeight );
	basePosition.left += atOffset[ 0 ];
	basePosition.top += atOffset[ 1 ];

	return this.each( function() {
		var collisionPosition, using,
			elem = $( this ),
			elemWidth = elem.outerWidth(),
			elemHeight = elem.outerHeight(),
			marginLeft = parseCss( this, "marginLeft" ),
			marginTop = parseCss( this, "marginTop" ),
			collisionWidth = elemWidth + marginLeft + parseCss( this, "marginRight" ) + scrollInfo.width,
			collisionHeight = elemHeight + marginTop + parseCss( this, "marginBottom" ) + scrollInfo.height,
			position = $.extend( {}, basePosition ),
			myOffset = getOffsets( offsets.my, elem.outerWidth(), elem.outerHeight() );

		if ( options.my[ 0 ] === "right" ) {
			position.left -= elemWidth;
		} else if ( options.my[ 0 ] === "center" ) {
			position.left -= elemWidth / 2;
		}

		if ( options.my[ 1 ] === "bottom" ) {
			position.top -= elemHeight;
		} else if ( options.my[ 1 ] === "center" ) {
			position.top -= elemHeight / 2;
		}

		position.left += myOffset[ 0 ];
		position.top += myOffset[ 1 ];

		// if the browser doesn't support fractions, then round for consistent results
		if ( !supportsOffsetFractions() ) {
			position.left = round( position.left );
			position.top = round( position.top );
		}

		collisionPosition = {
			marginLeft: marginLeft,
			marginTop: marginTop
		};

		$.each( [ "left", "top" ], function( i, dir ) {
			if ( $.ui.position[ collision[ i ] ] ) {
				$.ui.position[ collision[ i ] ][ dir ]( position, {
					targetWidth: targetWidth,
					targetHeight: targetHeight,
					elemWidth: elemWidth,
					elemHeight: elemHeight,
					collisionPosition: collisionPosition,
					collisionWidth: collisionWidth,
					collisionHeight: collisionHeight,
					offset: [ atOffset[ 0 ] + myOffset[ 0 ], atOffset [ 1 ] + myOffset[ 1 ] ],
					my: options.my,
					at: options.at,
					within: within,
					elem: elem
				} );
			}
		} );

		if ( options.using ) {
			// adds feedback as second argument to using callback, if present
			using = function( props ) {
				var left = targetOffset.left - position.left,
					right = left + targetWidth - elemWidth,
					top = targetOffset.top - position.top,
					bottom = top + targetHeight - elemHeight,
					feedback = {
						target: {
							element: target,
							left: targetOffset.left,
							top: targetOffset.top,
							width: targetWidth,
							height: targetHeight
						},
						element: {
							element: elem,
							left: position.left,
							top: position.top,
							width: elemWidth,
							height: elemHeight
						},
						horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
						vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
					};
				if ( targetWidth < elemWidth && abs( left + right ) < targetWidth ) {
					feedback.horizontal = "center";
				}
				if ( targetHeight < elemHeight && abs( top + bottom ) < targetHeight ) {
					feedback.vertical = "middle";
				}
				if ( max( abs( left ), abs( right ) ) > max( abs( top ), abs( bottom ) ) ) {
					feedback.important = "horizontal";
				} else {
					feedback.important = "vertical";
				}
				options.using.call( this, props, feedback );
			};
		}

		elem.offset( $.extend( position, { using: using } ) );
	} );
};

$.ui.position = {
	fit: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
				outerWidth = within.width,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = withinOffset - collisionPosLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
				newOverRight;

			// element is wider than within
			if ( data.collisionWidth > outerWidth ) {
				// element is initially over the left side of within
				if ( overLeft > 0 && overRight <= 0 ) {
					newOverRight = position.left + overLeft + data.collisionWidth - outerWidth - withinOffset;
					position.left += overLeft - newOverRight;
				// element is initially over right side of within
				} else if ( overRight > 0 && overLeft <= 0 ) {
					position.left = withinOffset;
				// element is initially over both left and right sides of within
				} else {
					if ( overLeft > overRight ) {
						position.left = withinOffset + outerWidth - data.collisionWidth;
					} else {
						position.left = withinOffset;
					}
				}
			// too far left -> align with left edge
			} else if ( overLeft > 0 ) {
				position.left += overLeft;
			// too far right -> align with right edge
			} else if ( overRight > 0 ) {
				position.left -= overRight;
			// adjust based on position and margin
			} else {
				position.left = max( position.left - collisionPosLeft, position.left );
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
				outerHeight = data.within.height,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = withinOffset - collisionPosTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
				newOverBottom;

			// element is taller than within
			if ( data.collisionHeight > outerHeight ) {
				// element is initially over the top of within
				if ( overTop > 0 && overBottom <= 0 ) {
					newOverBottom = position.top + overTop + data.collisionHeight - outerHeight - withinOffset;
					position.top += overTop - newOverBottom;
				// element is initially over bottom of within
				} else if ( overBottom > 0 && overTop <= 0 ) {
					position.top = withinOffset;
				// element is initially over both top and bottom of within
				} else {
					if ( overTop > overBottom ) {
						position.top = withinOffset + outerHeight - data.collisionHeight;
					} else {
						position.top = withinOffset;
					}
				}
			// too far up -> align with top
			} else if ( overTop > 0 ) {
				position.top += overTop;
			// too far down -> align with bottom edge
			} else if ( overBottom > 0 ) {
				position.top -= overBottom;
			// adjust based on position and margin
			} else {
				position.top = max( position.top - collisionPosTop, position.top );
			}
		}
	},
	flip: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.left + within.scrollLeft,
				outerWidth = within.width,
				offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = collisionPosLeft - offsetLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
				myOffset = data.my[ 0 ] === "left" ?
					-data.elemWidth :
					data.my[ 0 ] === "right" ?
						data.elemWidth :
						0,
				atOffset = data.at[ 0 ] === "left" ?
					data.targetWidth :
					data.at[ 0 ] === "right" ?
						-data.targetWidth :
						0,
				offset = -2 * data.offset[ 0 ],
				newOverRight,
				newOverLeft;

			if ( overLeft < 0 ) {
				newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;
				if ( newOverRight < 0 || newOverRight < abs( overLeft ) ) {
					position.left += myOffset + atOffset + offset;
				}
			} else if ( overRight > 0 ) {
				newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;
				if ( newOverLeft > 0 || abs( newOverLeft ) < overRight ) {
					position.left += myOffset + atOffset + offset;
				}
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.top + within.scrollTop,
				outerHeight = within.height,
				offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = collisionPosTop - offsetTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
				top = data.my[ 1 ] === "top",
				myOffset = top ?
					-data.elemHeight :
					data.my[ 1 ] === "bottom" ?
						data.elemHeight :
						0,
				atOffset = data.at[ 1 ] === "top" ?
					data.targetHeight :
					data.at[ 1 ] === "bottom" ?
						-data.targetHeight :
						0,
				offset = -2 * data.offset[ 1 ],
				newOverTop,
				newOverBottom;
			if ( overTop < 0 ) {
				newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;
				if ( newOverBottom < 0 || newOverBottom < abs( overTop ) ) {
					position.top += myOffset + atOffset + offset;
				}
			} else if ( overBottom > 0 ) {
				newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
				if ( newOverTop > 0 || abs( newOverTop ) < overBottom ) {
					position.top += myOffset + atOffset + offset;
				}
			}
		}
	},
	flipfit: {
		left: function() {
			$.ui.position.flip.left.apply( this, arguments );
			$.ui.position.fit.left.apply( this, arguments );
		},
		top: function() {
			$.ui.position.flip.top.apply( this, arguments );
			$.ui.position.fit.top.apply( this, arguments );
		}
	}
};

} )();

return $.ui.position;

} ) );

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */

(function() {
  'use strict';

  // initialize moment
  if (typeof moment !== 'undefined') {
    moment.locale(document.documentElement.lang || window.navigator.language || 'en');
  }

}());

window["Coral"] = window["Coral"] || {};
window["Coral"]["templates"] = window["Coral"]["templates"] || {};
window["Coral"]["templates"]["commons"] = window["Coral"]["templates"]["commons"] || {};
window["Coral"]["templates"]["commons"]["resizeListener"] = (function anonymous(data_0
/**/) {
    var data = data_0;
    var el0 = document.createElement("object");
    el0.setAttribute("aria-hidden", "true");
    el0.setAttribute("tabindex", "-1");
    el0.setAttribute("style", "display:block; position:absolute; top:0; left:0; height:100%; width:100%; opacity:0; overflow:hidden; z-index:-100;");
    el0.textContent = "​";
    return el0;
});
/*
 ADOBE CONFIDENTIAL

 Copyright 2014 Adobe Systems Incorporated
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
(function() {
  // A polyfill for HTMLElement.hidden property

  var testEl = document.createElement('div');

  if ('hidden' in testEl) {
    return;
  }

  Object.defineProperty(HTMLElement.prototype, 'hidden', {
    get: function() {
      return this.hasAttribute('hidden');
    },
    set: function set(v) {
      if (v) {
        this.setAttribute('hidden', '');
      } else {
        this.removeAttribute('hidden');
      }
    },
    configurable: true
  });
})();

/*! @source https://developer.mozilla.org/en/docs/Web/API/Element/matches */
(function() {
  // A polyfill for Element.matches property

  if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.matchesSelector ||
      Element.prototype.mozMatchesSelector ||
      Element.prototype.msMatchesSelector ||
      Element.prototype.oMatchesSelector ||
      Element.prototype.webkitMatchesSelector ||
      function(s) {
        var matches = (this.document || this.ownerDocument).querySelectorAll(s),
          i = matches.length;
        while (--i >= 0 && matches.item(i) !== this) {}
        return i > -1;
      };
  }
})();

/*! @source http://codegists.com/snippet/javascript/closest-polyfilljs_monochromer_javascript */
(function() {
  //closest polyfill
  if (!Element.prototype.closest) {
    Element.prototype.closest = function(selector) {
      var node = this;

      while (node) {
        if (node.matches(selector)) return node;
        else node = node.parentElement;
      }
      return null;
    };
  }
})();

/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
// @version 0.7.24
"undefined"==typeof WeakMap&&!function(){var e=Object.defineProperty,t=Date.now()%1e9,n=function(){this.name="__st"+(1e9*Math.random()>>>0)+(t++ +"__")};n.prototype={set:function(t,n){var o=t[this.name];return o&&o[0]===t?o[1]=n:e(t,this.name,{value:[t,n],writable:!0}),this},get:function(e){var t;return(t=e[this.name])&&t[0]===e?t[1]:void 0},"delete":function(e){var t=e[this.name];return!(!t||t[0]!==e)&&(t[0]=t[1]=void 0,!0)},has:function(e){var t=e[this.name];return!!t&&t[0]===e}},window.WeakMap=n}(),function(e){function t(e){E.push(e),b||(b=!0,m(o))}function n(e){return window.ShadowDOMPolyfill&&window.ShadowDOMPolyfill.wrapIfNeeded(e)||e}function o(){b=!1;var e=E;E=[],e.sort(function(e,t){return e.uid_-t.uid_});var t=!1;e.forEach(function(e){var n=e.takeRecords();r(e),n.length&&(e.callback_(n,e),t=!0)}),t&&o()}function r(e){e.nodes_.forEach(function(t){var n=v.get(t);n&&n.forEach(function(t){t.observer===e&&t.removeTransientObservers()})})}function i(e,t){for(var n=e;n;n=n.parentNode){var o=v.get(n);if(o)for(var r=0;r<o.length;r++){var i=o[r],a=i.options;if(n===e||a.subtree){var d=t(a);d&&i.enqueue(d)}}}}function a(e){this.callback_=e,this.nodes_=[],this.records_=[],this.uid_=++_}function d(e,t){this.type=e,this.target=t,this.addedNodes=[],this.removedNodes=[],this.previousSibling=null,this.nextSibling=null,this.attributeName=null,this.attributeNamespace=null,this.oldValue=null}function s(e){var t=new d(e.type,e.target);return t.addedNodes=e.addedNodes.slice(),t.removedNodes=e.removedNodes.slice(),t.previousSibling=e.previousSibling,t.nextSibling=e.nextSibling,t.attributeName=e.attributeName,t.attributeNamespace=e.attributeNamespace,t.oldValue=e.oldValue,t}function u(e,t){return y=new d(e,t)}function c(e){return N?N:(N=s(y),N.oldValue=e,N)}function l(){y=N=void 0}function f(e){return e===N||e===y}function p(e,t){return e===t?e:N&&f(e)?N:null}function w(e,t,n){this.observer=e,this.target=t,this.options=n,this.transientObservedNodes=[]}if(!e.JsMutationObserver){var m,v=new WeakMap;if(/Trident|Edge/.test(navigator.userAgent))m=setTimeout;else if(window.setImmediate)m=window.setImmediate;else{var h=[],g=String(Math.random());window.addEventListener("message",function(e){if(e.data===g){var t=h;h=[],t.forEach(function(e){e()})}}),m=function(e){h.push(e),window.postMessage(g,"*")}}var b=!1,E=[],_=0;a.prototype={observe:function(e,t){if(e=n(e),!t.childList&&!t.attributes&&!t.characterData||t.attributeOldValue&&!t.attributes||t.attributeFilter&&t.attributeFilter.length&&!t.attributes||t.characterDataOldValue&&!t.characterData)throw new SyntaxError;var o=v.get(e);o||v.set(e,o=[]);for(var r,i=0;i<o.length;i++)if(o[i].observer===this){r=o[i],r.removeListeners(),r.options=t;break}r||(r=new w(this,e,t),o.push(r),this.nodes_.push(e)),r.addListeners()},disconnect:function(){this.nodes_.forEach(function(e){for(var t=v.get(e),n=0;n<t.length;n++){var o=t[n];if(o.observer===this){o.removeListeners(),t.splice(n,1);break}}},this),this.records_=[]},takeRecords:function(){var e=this.records_;return this.records_=[],e}};var y,N;w.prototype={enqueue:function(e){var n=this.observer.records_,o=n.length;if(n.length>0){var r=n[o-1],i=p(r,e);if(i)return void(n[o-1]=i)}else t(this.observer);n[o]=e},addListeners:function(){this.addListeners_(this.target)},addListeners_:function(e){var t=this.options;t.attributes&&e.addEventListener("DOMAttrModified",this,!0),t.characterData&&e.addEventListener("DOMCharacterDataModified",this,!0),t.childList&&e.addEventListener("DOMNodeInserted",this,!0),(t.childList||t.subtree)&&e.addEventListener("DOMNodeRemoved",this,!0)},removeListeners:function(){this.removeListeners_(this.target)},removeListeners_:function(e){var t=this.options;t.attributes&&e.removeEventListener("DOMAttrModified",this,!0),t.characterData&&e.removeEventListener("DOMCharacterDataModified",this,!0),t.childList&&e.removeEventListener("DOMNodeInserted",this,!0),(t.childList||t.subtree)&&e.removeEventListener("DOMNodeRemoved",this,!0)},addTransientObserver:function(e){if(e!==this.target){this.addListeners_(e),this.transientObservedNodes.push(e);var t=v.get(e);t||v.set(e,t=[]),t.push(this)}},removeTransientObservers:function(){var e=this.transientObservedNodes;this.transientObservedNodes=[],e.forEach(function(e){this.removeListeners_(e);for(var t=v.get(e),n=0;n<t.length;n++)if(t[n]===this){t.splice(n,1);break}},this)},handleEvent:function(e){switch(e.stopImmediatePropagation(),e.type){case"DOMAttrModified":var t=e.attrName,n=e.relatedNode.namespaceURI,o=e.target,r=new u("attributes",o);r.attributeName=t,r.attributeNamespace=n;var a=e.attrChange===MutationEvent.ADDITION?null:e.prevValue;i(o,function(e){if(e.attributes&&(!e.attributeFilter||!e.attributeFilter.length||e.attributeFilter.indexOf(t)!==-1||e.attributeFilter.indexOf(n)!==-1))return e.attributeOldValue?c(a):r});break;case"DOMCharacterDataModified":var o=e.target,r=u("characterData",o),a=e.prevValue;i(o,function(e){if(e.characterData)return e.characterDataOldValue?c(a):r});break;case"DOMNodeRemoved":this.addTransientObserver(e.target);case"DOMNodeInserted":var d,s,f=e.target;"DOMNodeInserted"===e.type?(d=[f],s=[]):(d=[],s=[f]);var p=f.previousSibling,w=f.nextSibling,r=u("childList",e.target.parentNode);r.addedNodes=d,r.removedNodes=s,r.previousSibling=p,r.nextSibling=w,i(e.relatedNode,function(e){if(e.childList)return r})}l()}},e.JsMutationObserver=a,e.MutationObserver||(e.MutationObserver=a,a._isPolyfilled=!0)}}(self),function(e){"use strict";if(!window.performance||!window.performance.now){var t=Date.now();window.performance={now:function(){return Date.now()-t}}}window.requestAnimationFrame||(window.requestAnimationFrame=function(){var e=window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame;return e?function(t){return e(function(){t(performance.now())})}:function(e){return window.setTimeout(e,1e3/60)}}()),window.cancelAnimationFrame||(window.cancelAnimationFrame=function(){return window.webkitCancelAnimationFrame||window.mozCancelAnimationFrame||function(e){clearTimeout(e)}}());var n=function(){var e=document.createEvent("Event");return e.initEvent("foo",!0,!0),e.preventDefault(),e.defaultPrevented}();if(!n){var o=Event.prototype.preventDefault;Event.prototype.preventDefault=function(){this.cancelable&&(o.call(this),Object.defineProperty(this,"defaultPrevented",{get:function(){return!0},configurable:!0}))}}var r=/Trident/.test(navigator.userAgent);if((!window.CustomEvent||r&&"function"!=typeof window.CustomEvent)&&(window.CustomEvent=function(e,t){t=t||{};var n=document.createEvent("CustomEvent");return n.initCustomEvent(e,Boolean(t.bubbles),Boolean(t.cancelable),t.detail),n},window.CustomEvent.prototype=window.Event.prototype),!window.Event||r&&"function"!=typeof window.Event){var i=window.Event;window.Event=function(e,t){t=t||{};var n=document.createEvent("Event");return n.initEvent(e,Boolean(t.bubbles),Boolean(t.cancelable)),n},window.Event.prototype=i.prototype}}(window.WebComponents),window.CustomElements=window.CustomElements||{flags:{}},function(e){var t=e.flags,n=[],o=function(e){n.push(e)},r=function(){n.forEach(function(t){t(e)})};e.addModule=o,e.initializeModules=r,e.hasNative=Boolean(document.registerElement),e.isIE=/Trident/.test(navigator.userAgent),e.useNative=!t.register&&e.hasNative&&!window.ShadowDOMPolyfill&&(!window.HTMLImports||window.HTMLImports.useNative)}(window.CustomElements),window.CustomElements.addModule(function(e){function t(e,t){n(e,function(e){return!!t(e)||void o(e,t)}),o(e,t)}function n(e,t,o){var r=e.firstElementChild;if(!r)for(r=e.firstChild;r&&r.nodeType!==Node.ELEMENT_NODE;)r=r.nextSibling;for(;r;)t(r,o)!==!0&&n(r,t,o),r=r.nextElementSibling;return null}function o(e,n){for(var o=e.shadowRoot;o;)t(o,n),o=o.olderShadowRoot}function r(e,t){i(e,t,[])}function i(e,t,n){if(e=window.wrap(e),!(n.indexOf(e)>=0)){n.push(e);for(var o,r=e.querySelectorAll("link[rel="+a+"]"),d=0,s=r.length;d<s&&(o=r[d]);d++)o["import"]&&i(o["import"],t,n);t(e)}}var a=window.HTMLImports?window.HTMLImports.IMPORT_LINK_TYPE:"none";e.forDocumentTree=r,e.forSubtree=t}),window.CustomElements.addModule(function(e){function t(e,t){return n(e,t)||o(e,t)}function n(t,n){return!!e.upgrade(t,n)||void(n&&a(t))}function o(e,t){b(e,function(e){if(n(e,t))return!0})}function r(e){N.push(e),y||(y=!0,setTimeout(i))}function i(){y=!1;for(var e,t=N,n=0,o=t.length;n<o&&(e=t[n]);n++)e();N=[]}function a(e){_?r(function(){d(e)}):d(e)}function d(e){e.__upgraded__&&!e.__attached&&(e.__attached=!0,e.attachedCallback&&e.attachedCallback())}function s(e){u(e),b(e,function(e){u(e)})}function u(e){_?r(function(){c(e)}):c(e)}function c(e){e.__upgraded__&&e.__attached&&(e.__attached=!1,e.detachedCallback&&e.detachedCallback())}function l(e){for(var t=e,n=window.wrap(document);t;){if(t==n)return!0;t=t.parentNode||t.nodeType===Node.DOCUMENT_FRAGMENT_NODE&&t.host}}function f(e){if(e.shadowRoot&&!e.shadowRoot.__watched){g.dom&&console.log("watching shadow-root for: ",e.localName);for(var t=e.shadowRoot;t;)m(t),t=t.olderShadowRoot}}function p(e,n){if(g.dom){var o=n[0];if(o&&"childList"===o.type&&o.addedNodes&&o.addedNodes){for(var r=o.addedNodes[0];r&&r!==document&&!r.host;)r=r.parentNode;var i=r&&(r.URL||r._URL||r.host&&r.host.localName)||"";i=i.split("/?").shift().split("/").pop()}console.group("mutations (%d) [%s]",n.length,i||"")}var a=l(e);n.forEach(function(e){"childList"===e.type&&(M(e.addedNodes,function(e){e.localName&&t(e,a)}),M(e.removedNodes,function(e){e.localName&&s(e)}))}),g.dom&&console.groupEnd()}function w(e){for(e=window.wrap(e),e||(e=window.wrap(document));e.parentNode;)e=e.parentNode;var t=e.__observer;t&&(p(e,t.takeRecords()),i())}function m(e){if(!e.__observer){var t=new MutationObserver(p.bind(this,e));t.observe(e,{childList:!0,subtree:!0}),e.__observer=t}}function v(e){e=window.wrap(e),g.dom&&console.group("upgradeDocument: ",e.baseURI.split("/").pop());var n=e===window.wrap(document);t(e,n),m(e),g.dom&&console.groupEnd()}function h(e){E(e,v)}var g=e.flags,b=e.forSubtree,E=e.forDocumentTree,_=window.MutationObserver._isPolyfilled&&g["throttle-attached"];e.hasPolyfillMutations=_,e.hasThrottledAttached=_;var y=!1,N=[],M=Array.prototype.forEach.call.bind(Array.prototype.forEach),O=Element.prototype.createShadowRoot;O&&(Element.prototype.createShadowRoot=function(){var e=O.call(this);return window.CustomElements.watchShadow(this),e}),e.watchShadow=f,e.upgradeDocumentTree=h,e.upgradeDocument=v,e.upgradeSubtree=o,e.upgradeAll=t,e.attached=a,e.takeRecords=w}),window.CustomElements.addModule(function(e){function t(t,o){if("template"===t.localName&&window.HTMLTemplateElement&&HTMLTemplateElement.decorate&&HTMLTemplateElement.decorate(t),!t.__upgraded__&&t.nodeType===Node.ELEMENT_NODE){var r=t.getAttribute("is"),i=e.getRegisteredDefinition(t.localName)||e.getRegisteredDefinition(r);if(i&&(r&&i.tag==t.localName||!r&&!i["extends"]))return n(t,i,o)}}function n(t,n,r){return a.upgrade&&console.group("upgrade:",t.localName),n.is&&t.setAttribute("is",n.is),o(t,n),t.__upgraded__=!0,i(t),r&&e.attached(t),e.upgradeSubtree(t,r),a.upgrade&&console.groupEnd(),t}function o(e,t){Object.__proto__?e.__proto__=t.prototype:(r(e,t.prototype,t["native"]),e.__proto__=t.prototype)}function r(e,t,n){for(var o={},r=t;r!==n&&r!==HTMLElement.prototype;){for(var i,a=Object.getOwnPropertyNames(r),d=0;i=a[d];d++)o[i]||(Object.defineProperty(e,i,Object.getOwnPropertyDescriptor(r,i)),o[i]=1);r=Object.getPrototypeOf(r)}}function i(e){e.createdCallback&&e.createdCallback()}var a=e.flags;e.upgrade=t,e.upgradeWithDefinition=n,e.implementPrototype=o}),window.CustomElements.addModule(function(e){function t(t,o){var s=o||{};if(!t)throw new Error("document.registerElement: first argument `name` must not be empty");if(t.indexOf("-")<0)throw new Error("document.registerElement: first argument ('name') must contain a dash ('-'). Argument provided was '"+String(t)+"'.");if(r(t))throw new Error("Failed to execute 'registerElement' on 'Document': Registration failed for type '"+String(t)+"'. The type name is invalid.");if(u(t))throw new Error("DuplicateDefinitionError: a type with name '"+String(t)+"' is already registered");return s.prototype||(s.prototype=Object.create(HTMLElement.prototype)),s.__name=t.toLowerCase(),s["extends"]&&(s["extends"]=s["extends"].toLowerCase()),s.lifecycle=s.lifecycle||{},s.ancestry=i(s["extends"]),a(s),d(s),n(s.prototype),c(s.__name,s),s.ctor=l(s),s.ctor.prototype=s.prototype,s.prototype.constructor=s.ctor,e.ready&&v(document),s.ctor}function n(e){if(!e.setAttribute._polyfilled){var t=e.setAttribute;e.setAttribute=function(e,n){o.call(this,e,n,t)};var n=e.removeAttribute;e.removeAttribute=function(e){o.call(this,e,null,n)},e.setAttribute._polyfilled=!0}}function o(e,t,n){e=e.toLowerCase();var o=this.getAttribute(e);n.apply(this,arguments);var r=this.getAttribute(e);this.attributeChangedCallback&&r!==o&&this.attributeChangedCallback(e,o,r)}function r(e){for(var t=0;t<_.length;t++)if(e===_[t])return!0}function i(e){var t=u(e);return t?i(t["extends"]).concat([t]):[]}function a(e){for(var t,n=e["extends"],o=0;t=e.ancestry[o];o++)n=t.is&&t.tag;e.tag=n||e.__name,n&&(e.is=e.__name)}function d(e){if(!Object.__proto__){var t=HTMLElement.prototype;if(e.is){var n=document.createElement(e.tag);t=Object.getPrototypeOf(n)}for(var o,r=e.prototype,i=!1;r;)r==t&&(i=!0),o=Object.getPrototypeOf(r),o&&(r.__proto__=o),r=o;i||console.warn(e.tag+" prototype not found in prototype chain for "+e.is),e["native"]=t}}function s(e){return g(M(e.tag),e)}function u(e){if(e)return y[e.toLowerCase()]}function c(e,t){y[e]=t}function l(e){return function(){return s(e)}}function f(e,t,n){return e===N?p(t,n):O(e,t)}function p(e,t){e&&(e=e.toLowerCase()),t&&(t=t.toLowerCase());var n=u(t||e);if(n){if(e==n.tag&&t==n.is)return new n.ctor;if(!t&&!n.is)return new n.ctor}var o;return t?(o=p(e),o.setAttribute("is",t),o):(o=M(e),e.indexOf("-")>=0&&b(o,HTMLElement),o)}function w(e,t){var n=e[t];e[t]=function(){var e=n.apply(this,arguments);return h(e),e}}var m,v=(e.isIE,e.upgradeDocumentTree),h=e.upgradeAll,g=e.upgradeWithDefinition,b=e.implementPrototype,E=e.useNative,_=["annotation-xml","color-profile","font-face","font-face-src","font-face-uri","font-face-format","font-face-name","missing-glyph"],y={},N="http://www.w3.org/1999/xhtml",M=document.createElement.bind(document),O=document.createElementNS.bind(document);m=Object.__proto__||E?function(e,t){return e instanceof t}:function(e,t){if(e instanceof t)return!0;for(var n=e;n;){if(n===t.prototype)return!0;n=n.__proto__}return!1},w(Node.prototype,"cloneNode"),w(document,"importNode"),document.registerElement=t,document.createElement=p,document.createElementNS=f,e.registry=y,e["instanceof"]=m,e.reservedTagList=_,e.getRegisteredDefinition=u,document.register=document.registerElement}),function(e){function t(){i(window.wrap(document)),window.CustomElements.ready=!0;var e=window.requestAnimationFrame||function(e){setTimeout(e,16)};e(function(){setTimeout(function(){window.CustomElements.readyTime=Date.now(),window.HTMLImports&&(window.CustomElements.elapsed=window.CustomElements.readyTime-window.HTMLImports.readyTime),document.dispatchEvent(new CustomEvent("WebComponentsReady",{bubbles:!0}))})})}var n=e.useNative,o=e.initializeModules;e.isIE;if(n){var r=function(){};e.watchShadow=r,e.upgrade=r,e.upgradeAll=r,e.upgradeDocumentTree=r,e.upgradeSubtree=r,e.takeRecords=r,e["instanceof"]=function(e,t){return e instanceof t}}else o();var i=e.upgradeDocumentTree,a=e.upgradeDocument;if(window.wrap||(window.ShadowDOMPolyfill?(window.wrap=window.ShadowDOMPolyfill.wrapIfNeeded,window.unwrap=window.ShadowDOMPolyfill.unwrapIfNeeded):window.wrap=window.unwrap=function(e){return e}),window.HTMLImports&&(window.HTMLImports.__importsParsingHook=function(e){e["import"]&&a(wrap(e["import"]))}),"complete"===document.readyState||e.flags.eager)t();else if("interactive"!==document.readyState||window.attachEvent||window.HTMLImports&&!window.HTMLImports.ready){var d=window.HTMLImports&&!window.HTMLImports.ready?"HTMLImportsLoaded":"DOMContentLoaded";window.addEventListener(d,t)}else t()}(window.CustomElements);
/*
 * classList.js: Cross-browser full element.classList implementation.
 * 1.1.20150312
 *
 * By Eli Grey, http://eligrey.com
 * License: Dedicated to the public domain.
 *   See https://github.com/eligrey/classList.js/blob/master/LICENSE.md
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */

(function () {
  "use strict";

  var testElement = document.createElement("_");

  testElement.classList.add("c1", "c2");

  // Polyfill for IE 10/11 and Firefox <26, where classList.add and
  // classList.remove exist but support only one argument at a time.
  if (!testElement.classList.contains("c2")) {
    var createMethod = function(method) {
      var original = DOMTokenList.prototype[method];

      DOMTokenList.prototype[method] = function(token) {
        var i, len = arguments.length;

        for (i = 0; i < len; i++) {
          token = arguments[i];
          original.call(this, token);
        }
      };
    };
    createMethod('add');
    createMethod('remove');
  }

  testElement.classList.toggle("c3", false);

  // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
  // support the second argument.
  if (testElement.classList.contains("c3")) {
    var _toggle = DOMTokenList.prototype.toggle;

    DOMTokenList.prototype.toggle = function(token, force) {
      if (1 in arguments && !this.contains(token) === !force) {
        return force;
      } else {
        return _toggle.call(this, token);
      }
    };

  }

  testElement = null;
}());

(function(global) {
  // The next ID we'll use for scoped delegation
  var lastID = 0;

  /*
    Matches selectors that are scoped, such as:
      > selector
      :scope > selector
  */
  var scopedSelectorRegex = /^\s*(>|:scope\s*>)/;

  /**
    Check if the first array contains every element in the second array

    @ignore
  */
  function contains(set, subSet) {
    for (var i = 0; i < subSet.length; i++) {
      if (set.indexOf(subSet[i]) === -1) {
        return false;
      }
    }
    return true;
  }

  /**
    Check if the provided selector is scoped (has context)

    @ignore
  */
  function isScoped(selector) {
    return selector && scopedSelectorRegex.test(selector);
  }

  /**
    Replaces the stopPropagation() method of an event object

    @ignore
  */
  function ventStopPropagation() {
    this._ventPropagationStopped = true;
    Event.prototype.stopPropagation.call(this);
  }

  /**
    Replaces the stopImmediatePropagation() method of an event object

    @ignore
  */
  function ventStopImmediatePropagation() {
    this._ventImmediatePropagationStopped = true;
    Event.prototype.stopImmediatePropagation.call(this);
  }

  /**
    Get the right method to match selectors on

    @ignore
  */
  var matchesSelector = (function() {
    var proto = Element.prototype;
    var matchesSelector = (
      proto.matches ||
      proto.matchesSelector ||
      proto.webkitMatchesSelector ||
      proto.mozMatchesSelector ||
      proto.msMatchesSelector ||
      proto.oMatchesSelector
    );

    if (!matchesSelector) {
      throw new Error('Vent: Browser does not support matchesSelector');
    }

    return matchesSelector;
  }());

  /**
    @class Vent
    @classdesc DOM event delegation

    @param {HTMLElement|String} elementOrSelector
      The element or selector indicating the element to use as the delegation root.
  */
  function Vent(elementOrSelector) {
    if (this === global) {
      throw new Error('Vent must be invoked with the new keyword');
    }

    var root;
    if (typeof elementOrSelector === 'string') {
      root = document.querySelector(elementOrSelector);
    }
    else {
      root = elementOrSelector;
    }

    // Store a reference to the root element
    // This is the node at which we'll listen to events
    this.root = root;

    // Map of event names to array of events
    // Don't inherit from Object so we don't collide with properties on its prototype
    this._listenersByType = Object.create(null);

    /*
      A list of all of the listener objects tracked by this instance
      Each item takes the following form:
      {
        eventName: String,
        handler: Function,
        namespaces: Array<string>,
        selector: String | null,
        useCapture: Boolean,
        isScoped: Boolean
      }
    */
    this._allListeners = [];

    // Ensure listeners always execute in the scope of this instance
    this._executeCaptureListeners = this._executeCaptureListeners.bind(this);
    this._executeBubbleListeners = this._executeBubbleListeners.bind(this);

    // All Vent instances get an ID
    this._id = this._id || lastID++;
  }

  /**
    Check if the listener should fire on the given rooted target

    @ignore
  */
  Vent.prototype._listenerMatchesRootTarget = function(listener, target) {
    return (
      // When no selector is provided
      listener.selector === null &&
      (
        // Execute if we've landed on the root
        target === this.root
      )
    );
  };

  /**
    Check if the listener should fire on the given delegated target

    @ignore
  */
  Vent.prototype._listenerMatchesDelegateTarget = function(listener, target) {
    return (
      // document does not support matches()
      target !== document &&
      // Don't bother with delegation on the root element
      target !== this.root &&
      // Check if the event is delegated
      listener.selector !== null &&
      // Only execute  if the selector matches
      (
        // Check if the selector has context
        listener.isScoped ?
        // Run the match using the root element's ID
        matchesSelector.call(target, '[__vent-id__="'+this._id+'"] '+listener.selector)
        // Run the match without context
        : matchesSelector.call(target, listener.selector)
      )
    );
  };

  /**
    Check if the listener matches the given event phase

    @ignore
  */
  Vent.prototype._listenerMatchesEventPhase = function(listener, useCapture) {
    // Check if the event is the in right phase
    return (listener.useCapture === useCapture);
  };

  /**
    This function is responsible for checking if listeners should be executed for the current event

    @ignore
  */
  Vent.prototype._executeListenersAtElement = function(target, listeners, event, useCapture) {
    var listener;
    var returnValue;

    // Execute each listener that meets the criteria
    executeListeners: for (var listenerIndex = 0; listenerIndex < listeners.length; listenerIndex++) {
      listener = listeners[listenerIndex];

      if (
        // Do not process events on disabled items #1
        !(event.type === 'click' && target.disabled === true)
        &&
        // Check if the target element matches for this listener
        (
          this._listenerMatchesRootTarget(listener, target) ||
          this._listenerMatchesDelegateTarget(listener, target)
        ) &&
        this._listenerMatchesEventPhase(listener, useCapture)
      ) {
        // Store the target that matches the event currently
        event.matchedTarget = target;

        // Call handlers in the scope of the delegate target, passing the event along
        returnValue = listener.handler.call(target, event);

        // Prevent default and stopPropagation if the handler returned false
        if (returnValue === false) {
          event.preventDefault();
          event.stopPropagation();
        }

        if (event._ventImmediatePropagationStopped) {
          // Do not process any more event handlers and stop bubbling
          break executeListeners;
        }
      } // end if
    } // end executeListeners
  };

  /**
    Handles all events added with Vent

    @private
    @memberof Vent
  */
  Vent.prototype._executeCaptureListeners = function(event) {
    var listeners = this._listenersByType[event.type];

    if (!listeners) {
      throw new Error('Vent: _executeListeners called in response to '+event.type+', but we are not listening to it');
    }

    if (listeners.length) {
      // Get a copy of the listeners
      // Without this, removing an event inside of a callback will cause errors
      listeners = listeners.slice();

      // Decorate the event object so we know when stopPropagation is called
      this._decorateEvent(event);

      // Get the event's path through the DOM
      var eventPath = this._getPath(event);

      // Simulate the capture phase by trickling down the target list
      trickleDown: for (var eventPathIndex = eventPath.length - 1; eventPathIndex >= 0; eventPathIndex--) {
        if (!listeners.length) {
          // Stop trickling down if there are no more listeners to execute
          break trickleDown;
        }

        var currentTargetElement = eventPath[eventPathIndex];
        this._executeListenersAtElement(currentTargetElement, listeners, event, true);

        // Stop if a handler told us to stop trickling down the DOM
        if (
          event._ventImmediatePropagationStopped ||
          event._ventPropagationStopped
        ) {
          // Stop simulating trickle down
          break trickleDown;
        }
      }
    }

    // Clean up after Vent
    // We'll be re-decorating the event object in the bubble phase, if the event gets there
    this._undecorateEvent(event);
  };

  /**
    Handles all events added with Vent

    @private
    @memberof Vent
  */
  Vent.prototype._executeBubbleListeners = function(event) {
    var listeners = this._listenersByType[event.type];

    if (!listeners) {
      throw new Error('Vent: _executeListeners called in response to '+event.type+', but we are not listening to it');
    }

    if (listeners.length) {
      // Get a copy of the listeners
      // Without this, removing an event inside of a callback will cause errors
      listeners = listeners.slice();

      // Decorate the event object so we know when stopPropagation is called
      this._decorateEvent(event);

      /*
        Figure out if the bubble phase should be simulated

        Both focus and blur do not bubble:
          https://developer.mozilla.org/en-US/docs/Web/Events/focus
          https://developer.mozilla.org/en-US/docs/Web/Events/blur

        However, focusin, focusout, change, and other events do.
      */
      var shouldBubble = event.type !== 'focus' && event.type !== 'blur';

      // Re-use the event path as calculated during the capture phase
      var eventPath = this._getPath(event);

      // If listeners remain and propagation was not stopped, simulate the bubble phase by bubbling up the target list
      bubbleUp: for (var eventPathIndex = 0; eventPathIndex < eventPath.length; eventPathIndex++) {
        if (!listeners.length) {
          // Stop bubbling up if there are no more listeners to execute
          break bubbleUp;
        }

        var currentTargetElement = eventPath[eventPathIndex];
        this._executeListenersAtElement(currentTargetElement, listeners, event, false);

        // Stop simulating the bubble phase if a handler told us to
        if (
          event._ventImmediatePropagationStopped ||
          event._ventPropagationStopped
        ) {
          break bubbleUp;
        }

        // If the event shouldn't bubble, only simulate it on the target
        if (!shouldBubble) {
          break bubbleUp;
        }
      }
    }

    // Clean up after Vent
    this._undecorateEvent(event);

    // Clear the path
    event['_ventPath'+this._id] = null;
  };

  /**
    Override stopPropagation/stopImmediatePropagation so we know if we should stop processing events
  */
  Vent.prototype._decorateEvent = function(event) {
    event.stopPropagation = ventStopPropagation;
    event.stopImmediatePropagation = ventStopImmediatePropagation;
  };

  /**
    Restore the normal stopPropagation methods
  */
  Vent.prototype._undecorateEvent = function(event) {
    event.stopPropagation = Event.prototype.stopPropagation;
    event.stopImmediatePropagation = Event.prototype.stopImmediatePropagation;
  };

  /**
    Restore the normal stopPropagation methods
  */
  Vent.prototype._getPath = function(event) {
    if (event['_ventPath'+this._id]) {
      return event['_ventPath'+this._id];
    }

    // If the event was fired on a text node, delegation should assume the target is its parent
    var target = event.target;
    if (target.nodeType === Node.TEXT_NODE) {
      target = target.parentNode;
    }

    // Build an array of the DOM tree between the root and the element that dispatched the event
    // The HTML specification states that, if the tree is modified during dispatch, the event should bubble as it was before
    // Building this list before we dispatch allows us to simulate that behavior
    var pathEl = target;
    var eventPath = [];
    buildPath: while (pathEl && pathEl !== this.root) {
      eventPath.push(pathEl);
      pathEl = pathEl.parentNode;
    }
    eventPath.push(this.root);

    event['_ventPath'+this._id] = eventPath;

    return eventPath;
  };

  /**
    Add an event listener.
    @memberof Vent

    @param {String} eventName
      The event name to listen for, including optional namespace(s).
    @param {String} [selector]
      The selector to use for event delegation.
    @param {Function} handler
      The function that will be called when the event is fired.
    @param {Boolean} [useCapture]
      Whether or not to listen during the capturing or bubbling phase.

    @returns {Vent} this, chainable.
  */
  Vent.prototype.on = function(eventName, selector, handler, useCapture) {
    if (typeof selector === 'function') {
      useCapture = handler;
      handler = selector;
      selector = null;
    }

    if (typeof handler !== 'function') {
      throw new Error('Vent: Cannot add listener with non-function handler');
    }

    // Be null if every falsy (undefined or empty string passed)
    if (!selector) {
      selector = null;
    }


    if (typeof useCapture === 'undefined') {
      // Force useCapture for focus and blur events
      if (eventName === 'focus' || eventName === 'blur') {
        // true by default for focus and blur events only
        useCapture = true;
      }
      else {
        // false by default
        // This matches the HTML API
        useCapture = false;
      }
    }

    // Extract namespaces
    var namespaces = null;
    var dotIndex = eventName.indexOf('.');
    if (dotIndex !== -1) {
      namespaces = eventName.slice(dotIndex+1).split('.');
      eventName = eventName.slice(0, dotIndex);
    }

    // Get/create the list for the event type
    var listenerList = this._listenersByType[eventName];
    if (!listenerList) {
      listenerList = this._listenersByType[eventName] = [];

      // Add the actual listener
      this.root.addEventListener(eventName, this._executeCaptureListeners, true);
      this.root.addEventListener(eventName, this._executeBubbleListeners, false);
    }

    // Set the special ID attribute if the selector is scoped
    var listenerIsScoped = isScoped(selector);
    if (listenerIsScoped) {
      // Normalize selectors so they don't use :scope
      selector = selector.replace(scopedSelectorRegex, '>');

      // Store a unique ID and set a special attribute we'll use to scope
      this.root.setAttribute('__vent-id__', this._id);
    }

    // Create an object with the event's information
    var eventObject = {
      eventName: eventName,
      handler: handler,
      namespaces: namespaces,
      selector: selector,
      useCapture: useCapture,
      isScoped: listenerIsScoped
    };

    // Store relative to the current type and with everyone else
    listenerList.push(eventObject);
    this._allListeners.push(eventObject);
  };

  /**
    Remove an event listener.
    @memberof Vent

    @param {String} [eventName]
      The event name to stop listening for, including optional namespace(s).
    @param {String} [selector]
      The selector that was used for event delegation.
    @param {Function} [handler]
      The function that was passed to <code>on()</code>.
    @param {Boolean} [useCapture]
      Only remove listeners with <code>useCapture</code> set to the value passed in.

    @returns {Vent} this, chainable.
  */
  Vent.prototype.off = function(eventName, selector, handler, useCapture) {
    if (typeof selector === 'function') {
      useCapture = handler;
      handler = selector;
      selector = null;
    }

    // Be null if not provided
    if (typeof eventName === 'undefined') {
      eventName = null;
    }

    if (typeof selector === 'undefined') {
      selector = null;
    }

    if (typeof handler === 'undefined') {
      handler = null;
    }

    if (typeof useCapture === 'undefined') {
      useCapture = null;
    }

    // Extract namespaces
    var namespaces = null;
    if (eventName) {
      var dotIndex = eventName.indexOf('.');
      if (dotIndex !== -1) {
        namespaces = eventName.slice(dotIndex+1).split('.');
        eventName = eventName.slice(0, dotIndex);
      }
    }

    // Be null
    if (eventName === '') {
      eventName = null;
    }

    var listener;
    var index;
    var listeners = this._allListeners;
    for (var i = 0; i < listeners.length; i++) {
      listener = listeners[i];

      if (
        (eventName === null || listener.eventName === eventName) &&
        (selector === null || listener.selector === selector) &&
        (handler === null || listener.handler === handler) &&
        (useCapture === null || listener.useCapture === useCapture) &&
        (
          // Remove matching listeners, regardless of namespace
          namespaces === null ||
          // Listener matches all specified namespaces
          (listener.namespaces && contains(listener.namespaces, namespaces))
        )
      ) {
        // Remove the listeners info
        this._allListeners.splice(i, 1);

        // Array length changed, so check the same index on the next iteration
        i--;

        // Get index in listenersByType map
        if (!this._listenersByType[listener.eventName]) {
          throw new Error('Vent: Missing listenersByType for '+listener.eventName);
        }

        // Find the event info in the other lookup list
        index = this._listenersByType[listener.eventName].indexOf(listener);
        if (index !== -1) {
          var mapList = this._listenersByType[listener.eventName];

          // Remove from the map
          mapList.splice(index, 1);

          // Check if we've removed all the listeners for this event type
          if (mapList.length === 0) {
            // Remove the actual listener, if necessary
            this.root.removeEventListener(listener.eventName, this._executeCaptureListeners, true);
            this.root.removeEventListener(listener.eventName, this._executeBubbleListeners, false);

            // Avoid using delete operator for performance
            this._listenersByType[listener.eventName] = null;
          }
        }
        else {
          throw new Error('Vent: Event existed in allEvents, but did not exist in listenersByType');
        }
        // Don't stop now! We want to remove all matching listeners, so continue to loop
      }
    }

    return this;
  };

  if (typeof CustomEvent === 'function') {
    // Use native CustomEvent on platforms that support it
    // Note: defaultPrevented will not be set correctly if CustomEvent is polyfilled

    /**
      Dispatch a custom event at the root element.
      @memberof Vent

      @param {String} eventName
        The name of the event to dispatch.
      @param {Object} [options]
        CustomEvent options.
      @param {Object} [options.bubbles=true]
        Whether the event should bubble.
      @param {Object} [options.cancelable=true]
        Whether the event should be cancelable.
      @param {Object} [options.detail]
        Data to pass to handlers as <code>event.detail</code>
    */
    Vent.prototype.dispatch = function(eventName, options) {
      options = options || {};

      if (typeof options.bubbles === 'undefined') {
        options.bubbles = true;
      }

      if (typeof options.cancelable === 'undefined') {
        options.cancelable = true;
      }

      var event = new CustomEvent(eventName, options);
      this.root.dispatchEvent(event);

      return event;
    };
  }
  else {
    // Use createEvent for old browsers
    Vent.prototype.dispatch = function(eventName, options) {
      options = options || {};

      if (typeof options.bubbles === 'undefined') {
        options.bubbles = true;
      }

      if (typeof options.cancelable === 'undefined') {
        options.cancelable = true;
      }

      var event = document.createEvent('CustomEvent');
      event.initCustomEvent(eventName, options.bubbles, options.cancelable, options.detail);

      // Dispatch the event, checking the return value to see if preventDefault() was called
      var defaultPrevented = !this.root.dispatchEvent(event);

      // Check if the defaultPrevented status was correctly stored back to the event object
      if (defaultPrevented !== event.defaultPrevented) {
        // dispatchEvent() doesn't correctly set event.defaultPrevented in IE 9
        // However, it does return false if preventDefault() was called
        // Unfortunately, the returned event's defaultPrevented property is read-only
        // We need to work around this such that (patchedEvent instanceof Event) === true
        // First, we'll create an object that uses the event as its prototype
        // This gives us an object we can modify that is still technically an instanceof Event
        var patchedEvent = Object.create(event);

        // Next, we set the correct value for defaultPrevented on the new object
        // We cannot simply assign defaultPrevented, it causes a "Invalid Calling Object" error in IE 9
        // For some reason, defineProperty doesn't cause this
        Object.defineProperty(patchedEvent, 'defaultPrevented', { value: defaultPrevented });

        return patchedEvent;
      }

      return event;
    };
  }

  /**
    Destroy this instance, removing all events and references.
    @memberof Vent
  */
  Vent.prototype.destroy = function() {
    if (this.destroyed) {
      // Instance is already destroyed, do nothing
      return;
    }

    // Remove all events
    this.off();

    // Remove all references
    this._listenersByType = null;
    this._allListeners = null;
    this.root = null;
    this.destroyed = true;
  };

  // Expose globally
  global.Vent = Vent;
}(window));

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
/* global Vent: true */
/**
  The main Coral namespace.
  @namespace
*/
var Coral = window.Coral = window.Coral || {};
Coral.strings = Coral.strings || {};
Coral.strings['generic'] = Coral.strings['generic'] || {};
Coral.events = new Vent(window);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
/**
  The Coral utility belt.
  @namespace
*/
Coral.commons = Coral.commons || {};

/**
  Copy the properties from all provided objects into the first object.

  @param {Object} dest
    The object to copy properties to
  @param {...Object} source
    An object to copy properties from. Additional objects can be passed as subsequent arguments.

  @returns {Object}
    The destination object, <code>dest</code>

  @memberof Coral.commons
  @static
*/
Coral.commons.extend = function() {
  'use strict';
  var dest = arguments[0];
  for (var i = 1, ni = arguments.length; i < ni; i++) {
    var source = arguments[i];
    for (var prop in source) {
      dest[prop] = source[prop];
    }
  }
  return dest;
};

/**
  Copy the properties from the source object to the destination object, but calls the callback if the property is
  already present on the destination object.

  @param {Object} dest
    The object to copy properties to
  @param {...Object} source
    An object to copy properties from. Additional objects can be passed as subsequent arguments.
  @param {Coral.commons~handleCollision} [handleCollision]
    Called if the property being copied is already present on the destination.
    The return value will be used as the property value.

  @returns {Object}
    The destination object, <code>dest</code>

  @memberof Coral.commons
  @static
*/
Coral.commons.augment = function() {
  'use strict';
  var dest = arguments[0];
  var handleCollision;
  var argCount = arguments.length;
  var lastArg = arguments[argCount - 1];

  if (typeof lastArg === 'function') {
    handleCollision = lastArg;

    // Don't attempt to augment using the last argument
    argCount--;
  }

  for (var i = 1; i < argCount; i++) {
    var source = arguments[i];

    for (var prop in source) {
      if (typeof dest[prop] !== 'undefined') {
        if (typeof handleCollision === 'function') {
          // Call the handleCollision callback if the property is already present
          var ret = handleCollision(dest[prop], source[prop], prop, dest, source);
          if (typeof ret !== 'undefined') {
            dest[prop] = ret;
          }
        }
      // Otherwise, do nothing
      }
      else {
        dest[prop] = source[prop];
      }
    }
  }

  return dest;
};

/**
  Called when a property already exists on the destination object.

  @callback Coral.commons~handleCollision

  @param {*} oldValue
    The value currently present on the destination object.
  @param {*} newValue
    The value on the destination object.
  @param {*} prop
    The property that collided.
  @param {*} dest
    The destination object.
  @param {*} source
    The source object.

  @returns {*} The value to use. If <code>undefined</code>, the old value will be used.
*/

/**
  Return a new object with the swapped keys and values of the provided object.

  @param {Object} obj
    The object to copy.

  @returns {Object}
    An object with its keys as the values and values as the keys of the source object.

  @memberof Coral.commons
  @static
*/
Coral.commons.swapKeysAndValues = function(obj) {
  'use strict';

  var map = {};
  for (var key in obj) {
    map[obj[key]] = key;
  }
  return map;
};

/**
  Execute the provided callback on the next animation frame.
  @function
  @param {Function} callback
    The callback to execute.
*/
Coral.commons.nextFrame = (window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame || window.msRequestAnimationFrame ||
  function(callback) {'use strict'; return window.setTimeout(callback, 1000 / 60); }).bind(window);


/**
  Execute the callback once a CSS transition has ended.

  @callback Coral.commons~transitionEndCallback
  @param event
    The event passed to the callback.
  @param {HTMLElement} event.target
    The DOM element that was affected by the CSS transition.
  @param {Boolean} event.cssTransitionSupported
    Whether CSS transitions are supported by the browser.
  @param {Boolean} event.transitionStoppedByTimeout
    Whether the CSS transition has been ended by a timeout (should only happen as a fallback).
 */

/**
  Execute the provided callback once a CSS transition has ended. This method listens for the next transitionEnd event on
  the given DOM element. It cannot be used to listen continuously on transitionEnd events.

  @param {HTMLElement} element
    The DOM element that is affected by the CSS transition.
  @param {Coral.commons~transitionEndCallback} callback
    The callback to execute.
 */
Coral.commons.transitionEnd = function(element, callback) {
  'use strict';
  
  var propertyName;
  var hasTransitionEnded = false;
  var transitionEndEventName = null;
  var transitions = {
    'transition': 'transitionend',
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'MSTransition': 'msTransitionEnd'
  };
  var transitionEndTimeout = null;
  var onTransitionEnd = function(event) {
    var transitionStoppedByTimeout = (typeof event === 'undefined');

    if (!hasTransitionEnded) {
      hasTransitionEnded = true;

      clearTimeout(transitionEndTimeout);

      // Remove event listener (if any was used by the current browser)
      element.removeEventListener(transitionEndEventName, onTransitionEnd);

      // Call callback with specified element
      callback({
        target: element,
        cssTransitionSupported: true,
        transitionStoppedByTimeout: transitionStoppedByTimeout
      });
    }
  };

  // Find transitionEnd event name used by browser
  for (propertyName in transitions) {
    if (element.style[propertyName] !== undefined) {
      transitionEndEventName = transitions[propertyName];
      break;
    }
  }

  if (transitionEndEventName !== null) {
    // Register on transitionEnd event
    element.addEventListener(transitionEndEventName, onTransitionEnd);
    
    // Catch IE 10/11 sometimes not performing the transition at all => set timeout for this case
    transitionEndTimeout = setTimeout(onTransitionEnd, parseFloat(element.style.transitionDuration || 0) + 100);
  }
};

/**
  Execute the provided callback when all web components are ready.

  @param {HTMLElement} parent
    The element to check readiness of
  @param {Function} callback
    The callback to execute.
*/
(function() {
  'use strict';

  // Array used to tracked pending inits while waiting for the WebComponentsReady event.
  var initQueue = [];

  // Track whether web components are ready
  var webComponentsReady = false;

  window.addEventListener('WebComponentsReady', function handleWebComponentsReady() {
    webComponentsReady = true;

    var entry;
    for (var i = 0, initQueueCount = initQueue.length; i < initQueueCount; i++) {
      entry = initQueue[i];
      initElement(entry.element, entry.callback);
    }

    // we make sure no items are referenced
    initQueue.splice(0, initQueueCount);

    window.removeEventListener('WebComponentsReady', handleWebComponentsReady);
  });

  /**
    Forces the given element to be upgraded and then calls the callback.

    @param {HTMLElement} element
      The element to initialize.
    @param {Function} callback
      The callback to execute once it is initialized.
  */
  function initElement(element, callback) {
    window.CustomElements.upgradeAll(element);

    // As the createdCallbacks of inner web components are not called synchronously by CustomElements.upgradeAll(...) we
    // have to wait until all createdCallbacks of sub components have been called. see test: it('should be possible to
    // check child components using Coral.commons.ready() method inside of _initialize() method', ...)
    Coral.commons.nextFrame(function(){
      callback(element);
    });
  }

  /**
    Execute the callback once a component and sub-components are [ready]{@link Coral.commons.ready}.

    @callback Coral.commons~readyCallback
    @param {HTMLElement} element
      The element that is ready.
  */

  /**
    Checks, if a Coral components and all nested components are ready, which means their
    <code>_initialize</code> and <code>_render</code> methods have been called. If so, the provided callback function is executed

    @param {HTMLElement} element
      The element that should be watched for ready events.
    @param {Coral.commons~readyCallback} callback
      The callback to call when all components are ready.
  */
  Coral.commons.ready = function(element, callback) {
    if (typeof element === 'function') {
      callback = element;
      element = window;
    }

    // if the webcomponents are ready we call the callback immediatelly
    if (webComponentsReady) {
      initElement(element, callback);
    }
    // otherwise we queue the rest to make sure that the WebComponentsReady has been triggered
    else {
      initQueue.push({
        element: element,
        callback: callback
      });
    }
  };
}());

/**
  Assign an object given a nested path

  @param {Object} root
    The root object on which the path should be traversed.
  @param {String} path
    The path at which the object should be assignment.
  @param {String} obj
    The object to assign at path.

  @throws Will throw an error if the path is not present on the object.
*/
Coral.commons.setSubProperty = function(root, path, obj) {
  'use strict';

  var nsParts = path.split('.');
  var curObj = root;

  if (nsParts.length === 1) {
    // Assign immediately
    curObj[path] = obj;
    return;
  }

  // Make sure we can assign at the requested location
  while (nsParts.length > 1) {
    var part = nsParts.shift();
    if (curObj[part]) {
      curObj = curObj[part];
    }
    else {
      throw new Error('Coral.commons.setSubProperty: could not set ' + path + ', part ' + part + ' not found');
    }
  }

  // Do the actual assignment
  curObj[nsParts.shift()] = obj;
};

/**
  Get the value of the property at the given nested path.

  @param {Object} root
    The root object on which the path should be traversed.
  @param {String} path
    The path of the sub-property to return.

  @returns {*}
    The value of the provided property.

  @throws Will throw an error if the path is not present on the object.
*/
Coral.commons.getSubProperty = function(root, path) {
  'use strict';

  var nsParts = path.split('.');
  var curObj = root;

  if (nsParts.length === 1) {
    // Return property immediately
    return curObj[path];
  }

  // Make sure we can assign at the requested location
  while (nsParts.length) {
    var part = nsParts.shift();
    // The property might be undefined, and that's OK if it's the last part
    if (nsParts.length === 0 || typeof curObj[part] !== 'undefined') {
      curObj = curObj[part];
    }
    else {
      throw new Error('Coral.commons.getSubProperty: could not get ' + path + ', part ' + part + ' not found');
    }
  }

  return curObj;
};

(function() {
  /* jshint validthis: true */
  'use strict';

  /**
    Apply a mixin to the given object.

    @param {Object}
      The object to apply the mixin to.
    @param {Object|Function} mixin
      The mixin to apply.
    @param {Object} options
      An objcet to pass to functional mixins.

    @ignore
  */
  function applyMixin(target, mixin, options) {
    var mixinType = typeof mixin;

    if (mixinType === 'function') {
      mixin(target, options);
    }
    else if (mixinType === 'object' && mixin !== null) {
      Coral.commons.extend(target, mixin);
    }
    else {
      throw new Error('Coral.commons.mixin: Cannot mix in ' + mixinType + ' to ' + target.toString());
    }
  }

  /**
    Mix a set of mixins to a target object.

    @param {Object} target
      The target prototype or instance on which to apply mixins.
    @param {Object|Coral~mixin|Array<Object|Coral~mixin>} mixins
      A mixin or set of mixins to apply.
    @param {Object} options
      An object that will be passed to functional mixins as the second argument (options).
  */
  Coral.commons.mixin = function(target, mixins, options) {
    if (Array.isArray(mixins)) {
      for (var i = 0; i < mixins.length; i++) {
        applyMixin(target, mixins[i], options);
      }
    }
    else {
      applyMixin(target, mixins, options);
    }
  };

  /**
    A functional mixin.

    @callback Coral~mixin

    @param {Object} target
      The target prototype or instance to apply the mixin to.
    @param {Object} options
      Options for this mixin.
    @param {Coral~PropertyDescriptor.properties} options.properties
      The properties object as passed to {@link Coral.register}. This can be modified in place.
  */
}());

(function() {
  'use strict';

  var nextID = 0;

  /**
    Get a unique ID.

    @memberof Coral.commons
    @static
    @returns {String} unique identifier.
  */
  Coral.commons.getUID = function() {
    return 'coral-id-' + (nextID++);
  };
}());

(function() {
  'use strict';

  function noop() {
  }

  function returnFirst(first, second) {
    return function returnFirst() {
      var ret = first.apply(this, arguments);
      second.apply(this, arguments);
      return ret;
    };
  }

  /**
    Check if the provided object is a function

    @ignore

    @param {*} object
      The object to test

    @returns {Boolean} Whether the provided object is a function.
  */
  function isFunction(object) {
    return typeof object === 'function';
  }

  /**
    Call all of the provided functions, in order, returning the return value of the specified function.

    @param {...Function} func
      A function to call
    @param {Number} [nth=0]
      A zero-based index indicating the noth argument to return the value of.
      If the nth argument is not a function, <code>null</code> will be returned.

    @returns {Function} The aggregate function.
  */
  Coral.commons.callAll = function() {
    var nth = arguments[arguments.length - 1];
    if (typeof nth !== 'number') {
      nth = 0;
    }

    // Get the function whose value we should return
    var funcToReturn = arguments[nth];

    // Only use arguments that are functions
    var functions = Array.prototype.filter.call(arguments, isFunction);

    if (functions.length === 2 && nth === 0) {
      // Most common usecase: two valid functions passed
      return returnFirst(functions[0], functions[1]);
    }
    else if (functions.length === 1) {
      // Common usecase: one valid function passed
      return functions[0];
    }
    else if (functions.length === 0) {
      // Fail case: no valid functions passed
      return noop;
    }

    if (typeof funcToReturn !== 'function') {
      // If the argument at the provided index wasn't a function, just return the value of the first valid function
      funcToReturn = functions[0];
    }

    return function() {
      var finalRet;
      var ret;
      var func;

      // Skip first arg
      for (var i = 0; i < functions.length; i++) {
        func = functions[i];
        ret = func.apply(this, arguments);

        // Store return value of desired function
        if (func === funcToReturn) {
          finalRet = ret;
        }
      }
      return finalRet;
    };
  };
}());

(function() {
  'use strict';

  // Adaptation of http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/
  function ResizeEventTrigger() {
    // User agent toggles
    var isIE = navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/Edge/);
    this.useNativeResizeSupport = document.attachEvent && !isIE;
  }

  var resizeListenerObject;
  function getResizeListenerObject() {
    if (!resizeListenerObject) {
      resizeListenerObject = Coral.templates.commons.resizeListener.call();
    }
    return resizeListenerObject.cloneNode(true);
  }

  ResizeEventTrigger.prototype._addTriggerElement = function(element, listenerFunction) {
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }

    var obj = getResizeListenerObject();
    element._resizeTriggerElement = obj;

    obj.onload = function(e) {
      var contentDocument = this.contentDocument;
      var defaultView = contentDocument.defaultView;
      var documentElement = contentDocument.documentElement;

      defaultView._originalElement = element;
      defaultView._listenerFunction = listenerFunction;
      defaultView.addEventListener('resize', listenerFunction);

      // CUI-6523 Set lang and document title to avoid automated accessibility testing failures.
      documentElement.lang = 'en';
      contentDocument.title = '\u200b';

      // Call one initial resize for all browsers
      // Required, as in WebKit this callback adding the event listeners is called too late. Layout has already finished.
      listenerFunction({
        target: defaultView
      });
    };

    obj.type = 'text/html';

    // InternetExplorer is picky about the order of "obj.data = ..." and element.appendChild(obj) so make sure to get it right
    element.appendChild(obj);
    obj.data = 'about:blank';
  };

  ResizeEventTrigger.prototype._removeTriggerElement = function(element) {
    if (!element._resizeTriggerElement) {
      return;
    }

    var triggerElement = element._resizeTriggerElement;

    // processObjectLoadedEvent might never have been called
    if (triggerElement.contentDocument && triggerElement.contentDocument.defaultView) {
      triggerElement.contentDocument.defaultView.removeEventListener('resize', triggerElement.contentDocument.defaultView._listenerFunction);
    }

    element._resizeTriggerElement = !element.removeChild(element._resizeTriggerElement);
  };

  ResizeEventTrigger.prototype._fireResizeListeners = function(event) {
    var targetElement = event.target || event.srcElement;

    var trigger = targetElement._originalElement || targetElement;
    trigger._resizeListeners.forEach(function(fn) {
      fn.call(trigger, event);
    });
  };

  /**
    Adds a resize listener to the given element.

    @param {HTMLElement} element
      The element to add the resize event to.
    @param {Function} callback
      The resize callback.
  */
  ResizeEventTrigger.prototype.addResizeListener = function(element, callback) {
    if (!element) {
      return;
    }

    if (this.useNativeResizeSupport) {
      element.addEventListener('resize', callback);
      return;
    }

    // The array may still exist, so we check its length too
    if (!element._resizeListeners || element._resizeListeners.length === 0) {
      element._resizeListeners = [];
      this._addTriggerElement(element, this._fireResizeListeners.bind(this));
    }

    element._resizeListeners.push(callback);
  };

  /**
    Removes a resize listener from the given element.

    @param {HTMLElement} element
      The element to remove the resize event from.
    @param {Function} callback
      The resize callback.
  */
  ResizeEventTrigger.prototype.removeResizeListener = function(element, callback) {
    if (!element) {
      return;
    }

    if (this.useNativeResizeSupport) {
      element.removeEventListener('resize', callback);
      return;
    }

    // resizeListeners and resizeTrigger must be present
    if (!element._resizeListeners || !element._resizeTriggerElement) {
      return;
    }

    var fnIndex = element._resizeListeners.indexOf(callback);

    // Don't remove the function unless it is already registered
    if (fnIndex === -1) {
      return;
    }

    element._resizeListeners.splice(fnIndex, 1);

    if (!element._resizeListeners.length) {
      this._removeTriggerElement(element);
    }
  };

  /**
    Bind static methods
  */
  var resizeEvent = new ResizeEventTrigger();
  Coral.commons.addResizeListener = resizeEvent.addResizeListener.bind(resizeEvent);
  Coral.commons.removeResizeListener = resizeEvent.removeResizeListener.bind(resizeEvent);
}());

(function() {
  'use strict';
  
  var focusableElements = [
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'a[href]',
    'area[href]',
    'summary',
    'iframe',
    'object',
    'embed',
    'audio[controls]',
    'video[controls]',
    '[contenteditable]'
  ];
  
  /**
    Focusable elements are defined by https://www.w3.org/TR/html5/editing.html#focus-management.
    Caution: the selector doesn't verify if elements are visible.
    
    @const
    @type {String}
    
    @memberof Coral.commons
    @static
  */
  Coral.commons.FOCUSABLE_ELEMENT_SELECTOR = focusableElements.join(',');
  
  focusableElements.push('[tabindex]');
  
  /**
    Tabbable elements are defined by https://www.w3.org/TR/html5/editing.html#sequential-focus-navigation-and-the-tabindex-attribute.
    Caution: the selector doesn't verify if elements are visible.
   
    @const
    @type {String}
    
    @memberof Coral.commons
    @static
  */
  Coral.commons.TABBABLE_ELEMENT_SELECTOR = focusableElements.join(':not([tabindex="-1"]),');
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
/**
  Property value transform functions.
  @namespace
*/
Coral.transform = {};

/**
  Transform the provided value into a boolean. Follows the behavior of JavaScript thruty/falsy.

  @param {*} value
    The value to convert to Boolean.

  @returns {Boolean} The corresponding boolean value.
*/
Coral.transform.boolean = function(value) {
  'use strict';
  return !!value;
};

/**
  Transform the provided value into a boolean. Follows the behavior of the HTML specification, in which the existence of
  the attribute indicates <code>true</code> regardless of the attribute's value.

  @param {*} value
    The value to convert to Boolean.

  @returns {Boolean} The corresponding boolean value.
*/
Coral.transform.booleanAttr = function(value) {
  'use strict';
  return !(value === null || typeof value === 'undefined');
};

/**
  Transforms the provided value into a floating point number.

  @param {*} value
    The value to convert to a Number.

  @returns {?Number} The corresponding number or <code>null</code> if the passed value cannot be converted to a number.
*/
Coral.transform.number = function(value) {
  'use strict';

  value = parseFloat(value);
  return isNaN(value) ? null : value;
};


/**
  Transforms the provided value into a floating number. The conversion is strict in the sense that if non numeric values
  are detected, <code>null</code> is returned instead.

  @param {*} value
    The value to be converted to a Number.

  @retuns {?Number} The corresponding number or <code>null</code> if the passed value cannot be converted to number.
*/
Coral.transform.float = function(value) {
  'use strict';

  if (/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value)) {
    return Number(value);
  }

  return null;
};

/**
  Transform the provided value into a string. When given <code>null</code> or <code>undefined</code> it will be
  converted to an empty string("").

  @param {*} value
    The value to convert to String.

  @returns {String} The corresponding string value.
*/
Coral.transform.string = function(value) {
  'use strict';
  if (value === null || typeof value === 'undefined') {
    return '';
  }
  return typeof value === 'string' ? value : String(value);
};

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
/**
  Property value validators
  @namespace
*/
Coral.validate = {};

/**
  Signature of the function used to validate new input. It accepts a newValue and an oldValue which are used to
  determine if the newValue is valid.

  @callback Coral.validate~validationFunction

  @param {*} newValue
    The new value to validate.
  @param {*} oldValue
    The existing value.

  @returns {Boolean} <code>true</code> if the validation succeeded, otherwise <code>false</code>.
*/

/**
  Ensures that the value has changed.

  @param {*} newValue
    The new value.
  @param {*} oldValue
    The existing value.

  @returns {Boolean} <code>true</code> if the values are different.
*/
Coral.validate.valueMustChange = function(newValue, oldValue) {
  'use strict';

  // We can use exact equality here as validation functions are called after transform. Thus, the input value will be
  // converted to the same type as a stored value
  return newValue !== oldValue;
};

/**
  Ensures that the new value is within the enumeration. The enumeration can be given as an array of values or as a
  key/value Object. Take into consideration that enumerations are case sensitive.

  @example // Enumeration as Array
Coral.validate.enumeration(['xs', 's', 'm', 'l']);
  @example // Enumeration as Object
Coral.validate.enumeration({EXTRA_SMALL : 'xs', SMALL : 's', MEDIUM : 'm', LARGE : 'l'});
  @param {Object} enumeration
    Object that represents an enum.

  @returns {Coral.validate~validationFunction}
    a validation function that ensures that the given value is within the enumeration.
*/
Coral.validate.enumeration = function(enumeration) {
  'use strict';

  // Reverses the enumeration, so that we can check that the variable new value exists inside
  var enumReversed = Coral.commons.swapKeysAndValues(enumeration);

  // Returns a new function that matches the newValue, oldValue signature
  return function(newValue, oldValue) {
    return typeof enumReversed[newValue] !== 'undefined';
  };
};

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
/**
  Property descriptor factory factories
  @namespace
*/
Coral.property = {};

/**
  A factory that creates descriptor factories that proxy a local property/attribute to a sub-property.
  This factory should be used when you need the property of an sub-object to be set or queued for sync when a local
  property changes.
  This is especially useful for setting the innerHTML or other properties of sub-elements.

  @param {Coral~PropertyDescriptor} descriptor
    The property descriptor
  @param {String} path
    The path under <code>this</code> to proxy to. For instance, <code>_elements.header.innerHTML</code> would proxy
    to the <code>innerHTML</code> of the element with the handle <code>header</code>
  @param {Boolean} [needsDOMSync=false]
    Whether the property set should happen asynchronously on the next animation frame.

  @returns {Function} The descriptor factory.
*/
Coral.property.proxy = function(descriptor) {
  'use strict';

  // Store the path
  var path = descriptor.path;

  function setProxy(value, silent) {
    /* jshint validthis: true */
    Coral.commons.setSubProperty(this, path, value);
  }

  function getProxy() {
    /* jshint validthis: true */
    return Coral.commons.getSubProperty(this, path);
  }

  var functionalDescriptor = function(proto, propName) {
    var tempPropName = '_' + propName;

    if (descriptor.needsDOMSync) {
      // If a sync needs to happen, define a method
      descriptor.sync = function() {
        Coral.commons.setSubProperty(this, path, this[tempPropName]);

        // Use undefined here, not null
        this[tempPropName] = undefined;
      };

      descriptor.set = function(value, silent) {
        this[tempPropName] = value;
      };

      descriptor.get = function() {
        // Return the temporary variable if it's set, otherwise get the property we're proxying
        return typeof this[tempPropName] === 'undefined' ?
          Coral.commons.getSubProperty(this, path) : this[tempPropName];
      };
    }
    else {
      // If we don't need to sync, simply delegate to the property
      // @todo test if it's faster to compose a function with new Function()
      descriptor.set = setProxy;
      descriptor.get = getProxy;
      descriptor.sync = null;
    }

    return descriptor;
  };

  // Override by default
  // Store this on the function so Coral.register can check it
  functionalDescriptor.override = typeof descriptor.override !== 'undefined' ? descriptor.override : true;

  // Return a function that sets up the property
  return functionalDescriptor;
};

/**
  A factory that creates descriptor factories that proxy a local property/attribute to a sub-element's attribute.

  This is useful when you want to proxy a property/attrubute to a sub-element as an attribute set/removal.
  For instance, you may want to proxy the <code>aria-labelledby</code> property of a field component to the actual
  input inside of the component for accessibility purposes.

  When using this property factory, be sure to specify a property name not implemented by the browser already.

  @param {Coral~PropertyDescriptor} descriptor
    The property descriptor.
  @param {String} descriptor.attribute
    The attribute to proxy.
  @param {String} descriptor.handle
    The handle of the element to proxy the attribute to.
*/
Coral.property.proxyAttr = function(descriptor) {
  'use strict';

  var attribute = descriptor.attribute;
  var handle = descriptor.handle;

  var functionalDescriptor = function(proto, propName) {
    return Coral.commons.extend({
      attribute: attribute,
      set: function(value) {
        // Both false and null should remove the attribute
        // This supports the behavior of Coral.transform.boolean as well as non-transformed attributes
        // Any other value, including empty string, should set it
        this._elements[handle][value === false || value === null ? 'removeAttribute' : 'setAttribute'](attribute, value);
      },
      get: function() {
        return this._elements[handle].getAttribute(attribute);
      }
    }, descriptor);
  };

  // Override by default
  // Store this on the function so Coral.register can check it
  functionalDescriptor.override = typeof descriptor.override !== 'undefined' ? descriptor.override : true;

  return functionalDescriptor;
};

/**
  A factory that creates descriptor factories for content zones.

  @param {Coral~PropertyDescriptor} descriptor
    The property descriptor.
  @param {String} descriptor.handle
    The handle of the element to proxy the attribute to.
  @param {String} [descriptor.tagName]
    The tag name to expect. If not provided, any tag will be accepted.
  @param {Function} [descriptor.set]
    Executed after the property is set.
  @param {Function} [descriptor.get]
    An alternate getter. If not provided, the element specified by the handle will be returned.
  @param {Function} [descriptor.insert]
    The method that inserts the content zone into the element.
  @param {Booelean} defaultContentZone
    Set to true if this is the default content zone that {@link Coral.Component#render} moves orphaned elements into.
*/
Coral.property.contentZone = function(descriptor) {
  'use strict';

  var handle = descriptor.handle;
  var expectedTagName = descriptor.tagName;
  var additionalSetter = descriptor.set;
  var alternateGetter = descriptor.get;
  var insert = descriptor.insert;

  var functionalDescriptor = function(proto, propName) {
    if (descriptor.defaultContentZone) {
      // Alias the setter/getter to the content zone's property
      Object.defineProperty(proto, 'defaultContentZone', {
        set: function(value) {
          this[propName] = value;
        },
        get: function() {
          return this[propName];
        }
      });
    }

    // Combine the provided descriptor with the factory's properties
    // Give precidence to the factory's properties
    return Coral.commons.extend({}, descriptor, {
      contentZone: true,
      set: function(value) {
        var oldNode;

        if (!!value) {
          if (!(value instanceof HTMLElement)) {
            throw new Error('DOMException: Failed to set the "' + propName + '" property on "' + this.toString() +
              '": The provided value is not of type "HTMLElement".');
          }

          if (expectedTagName && value.tagName.toLowerCase() !== expectedTagName) {
            throw new Error('DOMException: Failed to set the "' + propName + '" property on "' + this.toString() +
              '": The new ' + propName + ' element is of type "' + value.tagName + '". It must be a "' +
              expectedTagName.toUpperCase() + '" element.');
          }

          oldNode = this._elements[handle];

          // Replace the existing element
          if (insert) {
            // Remove old node
            if (oldNode && oldNode.parentNode) {
              oldNode.parentNode.removeChild(oldNode);
            }
            // Insert new node
            insert.call(this, value);
          }
          else {
            if (oldNode && oldNode.parentNode) {
              console.warn(this._componentName + ' does not define an insert method for content zone ' + handle + ', falling back to replace.');
              // Old way -- assume we have an old node
              this._elements[handle].parentNode.replaceChild(value, this._elements[handle]);
            }
            else {
              console.error(this._componentName + ' does not define an insert method for content zone ' + handle + ', falling back to append.');
              // Just append, which may introduce bugs, but at least doesn't crazy
              this.appendChild(value);
            }
          }
        }
        else {
          // we need to remove the content zone if it exists
          oldNode = this._elements[handle];
          if (oldNode && oldNode.parentNode) {
            oldNode.parentNode.removeChild(oldNode);
          }
        }

        // Re-assign the handle to the new element
        this._elements[handle] = value;

        // Invoke the setter
        if (typeof additionalSetter === 'function') {
          additionalSetter.call(this, value);
        }
      },
      get: alternateGetter || function() {
        return this._elements[handle];
      }
    });
  };

  return functionalDescriptor;
};

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
/* global module: true, exports: true */
var Coral = window.Coral = window.Coral || {};

// CommonJS and Node.js module support
if (typeof exports !== 'undefined') {
  // Support Node.js specific `module.exports` (which can be a function)
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = Coral;
  }
  // But always support CommonJS module 1.1.1 spec, Coral is an object
  exports = Coral;
}

/**
  A property descriptor.

  @typedef {Object} Coral~PropertyDescriptor
  @property {Function} [transform=null]
    The value transformation function. Values passed to setters will be ran through this function first.
  @property {Function} [attributeTransform=transform]
    The value transformation function for attribute. The value given by <code>attributeChangedCallback</code> will be
    ran through this function first before passed to setters.
  @property {Coral.validate~validationFunction} [validate={@link Coral.validate.valueMustChange}]
    The value validation function. A validation function that takes two arguments, <code>newValue</code> and
    <code>oldValue</code>, returning true if the setter should run or false if not.
  @property {String|Function} [trigger=null]
    The name of the event to trigger after this property changes, or a {Function} to call that will trigger the event.
    The function is passed the <code>newValue</code> and <code>oldValue</code>.
  @property {String|Function} [triggerBefore=null]
    The name of the event to trigger before this property changes, a {Function} to call that will trigger the event,
    or <code>true</code> to set the name automatically. The function is passed the <code>newValue</code> and
    <code>oldValue</code> and must return the Event object for <code>preventDefault()</code> to work within handlers. If
    set to <code>true</code>, {@link Coral~PropertyDescriptor} must be a string with a colon in it, such as
    <code>coral-component:change</code>, which results in <code>coral-component:beforechange</code>. If set to
    <code>false</code>, no event will be triggered before the setter is ran.
  @property {String} [attribute=propName]
    The name of the attribute corresponding to this property. If not provided, the property name itself will be used.
    If <code>null</code> is provided, the property will not be set by a corresponding attribute.
  @property {Boolean} [reflectAttribute=false]
    Whether this property should be reflected as an attribute when changed. This is useful when you want to style CSS
    according to the property's existence or value.
  @property {Function} [sync=null]
    The method to be called when this property's value should be synced to the DOM.
  @property {String|Array.<String>} [alsoSync=null]
    A property or list of properties that should be synced after this property is synced.
  @property {Function} [set={@link Coral~defaultSet}]
    The setter for this property.
  @property {Function} [get={@link Coral~defaultGet}]
    The getter for this property.
  @property {Boolean} [override=false]
    Whether this property descriptor should completely override. If <code>false</code>, this descriptor will augment
    the existing descriptor. See {@link Coral.register.augmentProperties} for details.
  @property {Boolean} [contentZone=false]
    Whether this property represents a content zone. Content zones are treated differently when set() is invoked such
    that the provided value is passed to the content zone's set() method.
*/
(function() {
  'use strict';

  // These properties won't be treated as methods
  var specialProperties = {
    extend: true,
    properties: true,
    events: true,
    _elements: true,
    name: true,
    tagName: true,
    baseTagName: true,
    className: true
  };

  function noop() {
  }
  function passThrough(value) {
    return value;
  }

  /**
    Creates an array with validation functions for the given properties. If no validate is specified, then the default
    validator is used.
    @ignore
  */
  function makeValidate(descriptor) {
    if (!descriptor.validate) {
      return [Coral.validate.valueMustChange];
    }

    if (Array.isArray(descriptor.validate)) {
      return descriptor.validate;
    }

    return [descriptor.validate];
  }

  /**
    Make a attribute reflect function for the given property. If the property is not reflected, return a noop.
    @ignore
  */
  function makeReflect(propName, descriptor) {
    if (!descriptor.reflectAttribute) {
      return noop;
    }

    var attrName = descriptor.attribute || propName;

    return function doReflect(value, silent) {
      // Reflect the property
      if (value === false || value === null) {
        // Non-truthy attributes should be destroyed
        this.removeAttribute(attrName);
      }
      else {
        // Boolean true for a value just means the property should exist
        if (value === true) {
          value = '';
        }

        // Only perform the set if the attribute is of a different value
        // This avoids triggering mutation observers unnecessarily
        if (this.getAttribute(attrName) !== value) {
          this.setAttribute(attrName, value);
        }
      }
    };
  }

  /**
    Make an event trigger function for the given property. If no event should be triggered, return a noop.
    @ignore
  */
  function makeTrigger(trigger) {
    if (!trigger) {
      return noop;
    }

    if (typeof trigger === 'function') {
      return trigger;
    }

    var eventName = trigger;

    return function doTrigger(newValue, oldValue) {
      // Trigger an event that has the new and old values under detail
      return this.trigger(eventName, {
        oldValue: oldValue,
        value: newValue
      });
    };
  }

  /**
    Make a queue sync function for the given property. If nothing needs to be synced, return a noop.
    @ignore
  */
  function makeQueueSync(propName, descriptor) {
    var propList = descriptor.alsoSync;
    var sync = descriptor.sync;

    if (!sync && !propList) {
      return noop;
    }

    if (propList) {
      // Other properties in addition to ours
      if (Array.isArray(propList)) {
        propList.unshift(propName);
      }
      else {
        propList = [propName, propList];
      }
      return function doMultiSync(value) {
        // Sync the list of properties
        this._queueSync.apply(this, propList);
      };
    }

    return function doSync(value) {
      // Sync the property
      this._queueSync(propName);
    };
  }

  /**
    Create and store the methods back to the property descriptor, then store the descriptor on the prototype.
    This enables overriding descriptor parts.

    @ignore
  */
  function storeDescriptor(proto, propName, descriptor) {
    // triggerBefore can be function, boolean, or string
    var triggerBeforeValue;
    if (typeof descriptor.triggerBefore === 'function' || typeof descriptor.triggerBefore === 'string') {
      // Directly use string or function, makeTrigger will do the rest
      triggerBeforeValue = descriptor.triggerBefore;
    }
    else if (descriptor.triggerBefore === true) {
      // Automatically set name based on descriptor.trigger
      if (typeof descriptor.trigger === 'string' && descriptor.trigger.indexOf(':') !== -1) {
        triggerBeforeValue = descriptor.trigger.replace(':', ':before');
      }
      else {
        throw new Error('Coral.register: Cannot automatically set "before" event name unless descriptor.trigger ' +
          'is a string that conatins a colon');
      }
    }

    // Use provided setter, or make a setter that sets a "private" underscore-prefixed variable
    descriptor.set = descriptor.set || makeBasicSetter(propName);

    // Use provided getter, or make a getter that returns a "private" underscore-prefixed variable
    descriptor.get = descriptor.get || makeBasicGetter(propName);

    // Store methods
    var inheritedMethods = descriptor._methods;
    descriptor._methods = {};

    // store references to inherited methods in descriptor._methods
    if (inheritedMethods) {
      for (var methodName in inheritedMethods) {
        descriptor._methods[methodName] = inheritedMethods[methodName];
      }
    }

    descriptor._methods.triggerBefore = makeTrigger(triggerBeforeValue);
    descriptor._methods.trigger = makeTrigger(descriptor.trigger);
    descriptor._methods.transform = descriptor.transform || passThrough;
    descriptor._methods.attributeTransform = descriptor.attributeTransform || passThrough;
    descriptor._methods.reflectAttribute = makeReflect(propName, descriptor);
    descriptor._methods.queueSync = makeQueueSync(propName, descriptor);

    // We need to store the list of validators back on the descriptor as we modify this inside of makeValidate
    descriptor._methods.validate = makeValidate(descriptor);

    // Store reverse mapping of attribute -> property
    if (descriptor.attribute) {
      proto._attributes[descriptor.attribute] = propName;
    }
    else {
      // Remove the mapping in case it was overridden
      proto._attributes[descriptor.attribute] = null;
    }

    // Store the descriptor
    proto._properties[propName] = descriptor;
  }

  /**
    Create a generic getter.

    @param {String} propName
      The property name whose getter should be invoked.

    @ignore
  */
  function makeGetter(propName) {
    return function getter() {
      // Invoke the original getter
      return this._properties[propName].get.call(this);
    };
  }

  /**
    Create a genertic setter.

    @param {String} propName
      The name of the property.

    @alias Coral.register.makeSetter

    @returns {Function} The setter function.
  */
  function makeSetter(propName) {
    return function setter(value, silent) {
      var descriptor = this._properties[propName];
      var methods = descriptor._methods;

      // Transform the value, passing the default
      // The default value cannot be cached in the outer closure as that would prevent monkey-patching
      var newValue = methods.transform.call(this, value, this._properties[propName].default);

      // Store the old value before the setter is invoked
      var oldValue = this[propName];

      // Performs all the validations until one of them fails
      var self = this;
      var failed = methods.validate.some(function(validator) {
        return !validator.call(self, newValue, oldValue);
      });

      // If a validation failed then we return
      if (failed) {
        return;
      }

      if (!silent) {
        var event = methods.triggerBefore.call(this, newValue, oldValue);
        if (event && event.defaultPrevented) {
          // Allow calls to preventDefault() to stop events
          return;
        }
      }

      // Invoke the original setter
      descriptor.set.call(this, newValue, silent);

      // Reflect the attribute
      methods.reflectAttribute.call(this, newValue);

      // Queue property sync. Do this before trigger, in case an event listener wants to unroll the sync queue
      methods.queueSync.call(this);

      // Trigger an event
      if (!silent) {
        methods.trigger.call(this, newValue, oldValue);
      }

      // Store that this prop has been set
      // This is used during initialization when deciding whether to apply default values
      this._setProps[propName] = true;
    };
  }

  function makeBasicGetter(propName) {
    var tempVarName = '_' + propName;

    /**
      Gets the corresponding underscore prefixed "private" property by the same name.

      @function Coral~defaultGet
      @returns The prefixed property
    */
    return function getter() {
      return this[tempVarName];
    };
  }

  function makeBasicSetter(propName) {
    var tempVarName = '_' + propName;

    /**
      Sets the corresponding underscore prefixed "private" property by the same name.

      @param {*} value  The value to set
      @function Coral~defaultSet
    */
    return function setter(value) {
      this[tempVarName] = value;
    };
  }

  /**
    Define a set of {@link Coral~PropertyDescriptors} on the passed object

    @param {Object} proto
      The object to define properties on, usually a prototype.
    @param {Object.<String, Coral~PropertyDescriptor>} properties
      A map of property names to their corresponding descriptors.

    @alias Coral.register.defineProperties
  */
  function defineProperties(proto, properties) {
    // Loop over properties and define them on the prototype
    for (var propName in properties) {
      if (!properties[propName]) {
        // Skip properties that were removed to avoid redefinition
        continue;
      }
      defineProperty(proto, propName, properties[propName]);
    }
  }

  /**
    Define a single {@link Coral~PropertyDescriptors} on the passed object

    @param {Object} proto
      The object to define properties on, usually a prototype.
    @param {String} propName
      The name of the property.
    @param {Coral~PropertyDescriptor} descriptor
      A property descriptor

    @alias Coral.register.defineProperty
  */
  function defineProperty(proto, propName, descriptor) {
    // Handle mixin case
    if (typeof descriptor === 'function') {
      // Let descriptor apply itself to the prototype
      // This allows it to add methods
      // Use its return value as the actual descriptor
      descriptor = descriptor(proto, propName);

      // If nothing is returned, we're done with this property
      if (!descriptor) {
        throw new Error('Coral.register.defineProperty: Property function did not return a descriptor for ' + propName);
      }
    }

    // Store the associated methods
    storeDescriptor(proto, propName, descriptor);

    // Create the generic setters and getters for this property
    // Store them back so we can access them for silent sets
    // These do not need to be overridden as they delegate to this._properties._methods
    var actualSetter = descriptor._methods.set = makeSetter(propName);
    var actualGetter = descriptor._methods.get = makeGetter(propName);

    // Define the property
    Object.defineProperty(proto, propName, {
      // All properties are enumerable
      enumerable: true,
      // No properties are configurable
      configurable: false,
      set: actualSetter,
      get: actualGetter
    });
  }

  var tagPrototypes = {};
  /**
    Memoized getProtoTypeOf for HTML tags
    @ignore
  */
  function getPrototypeOfTag(tagName) {
    tagPrototypes[tagName] = tagPrototypes[tagName] || Object.getPrototypeOf(document.createElement(tagName));
    return tagPrototypes[tagName];
  }

  /**
    Register a Coral component, setting up inheritance, mixins, properties, and the associated custom element.

    @memberof Coral
    @static

    @param {Object} options
      Component options.
    @param {String} options.name
      Name of the constructor (i.e. 'Accordion.Item'). The constructor will be available under 'Coral' at the path
      specified by the name.
    @param {String} options.tagName
      Name of the new element (i.e 'coral-component').
    @param {String} [options.baseTagName = (none)]
      Name of the tag to extend (i.e. 'button'). This is only required when extending an existing HTML element such that
      the <code>&lt;button is="custom-element"&gt;</code> style will be used.
    @param {Object} [options.extend = Coral.Component]
      Base class of the component. When extending an existing HTML element, this should match the interface implemented
      by the tag -- that is, for <code>baseTagName: 'button'</code> you should pass
      <code>extend: HTMLButtonElement</code>.
    @param {Array.<Object|Coral~mixin>} [options.mixins]
      Mixin or {Array} of mixins to add. Mixins can be an {Object} or a {Coral~mixin}.
    @param {Object.<String, Coral~PropertyDescriptor>} [options.properties]
      A map of property names to their corresponding descriptors.
    @param {Object} [options.events]
      Map of the events and their handler.
    @param {Object} [options._elements]
      Map of elements and their locations used for caching.
  */
  Coral.register = function(options) {
    // Throw away options.extend if baseTagName provided and the prototype isn't part of Coral.Component
    if (options.extend && !options.extend.prototype._methods) {
      options.extend = Coral.Component;
    }

    // Extend Coral.Component if nothing is provided
    var extend = options.extend || Coral.Component;

    // We'll use the prototype of the argument passed constructor we're extending
    var baseComponentProto = extend.prototype;
    var actualPrototype = baseComponentProto;

    // Use passed or be an empty object so mixins can add properties to components that don't define any
    // Don't modify the passed properties object directly
    var properties = options.properties ? Coral.commons.extend({}, options.properties) : {};

    if (options.baseTagName) {
      // If we're extending a base tag, we need to use its prototype, not the Component's
      actualPrototype = getPrototypeOfTag(options.baseTagName);
    }

    // Setup the prototype chain
    var proto = Object.create(
      actualPrototype
    );

    // Store a reference to the next component's prototype in the chain
    // This allows us to crawl up the component prototype chain later
    proto._proto = baseComponentProto;

    if (options.baseTagName) {
      var protoChain = [];

      // Build the prototype chain
      var curBaseProto = baseComponentProto;
      while (curBaseProto && curBaseProto._methods) {
        protoChain.unshift(curBaseProto);
        curBaseProto = curBaseProto._proto;
      }

      // Iterate over the prototype chain and mix all the methods in
      while (curBaseProto = protoChain.shift()) {
        for (var methodName in curBaseProto._methods) {
          proto[methodName] = curBaseProto[methodName];
        }
      }

      // Note that we'll already get a flattened list of properties from _properties
      // So we don't have to do something similar there
    }

    // Create attribute -> property mappings and the property descriptor map
    // Do this before we mixin/override properties as storeDescriptor() will write back to _attributes and _properties
    proto._attributes = Coral.commons.extend({}, baseComponentProto._attributes);
    proto._properties = {};

    // Define and inherit events from parent class
    proto._events = Coral.commons.extend({}, baseComponentProto._events, options.events);

    // Define and inherit sub-elements from parent class
    proto._elements = Coral.commons.extend({}, baseComponentProto._elements, options._elements);

    // Store the name on the prototype
    // the toString method of Coral.Component uses this
    proto._componentName = options.name;

    // CSS className
    proto._className = options.className;

    // Add methods to the prototype, and store them in an object for easy access
    // We'll use this object when extending base tagnames later
    var _methods = proto._methods = {};
    for (var method in options) {
      if (!specialProperties[method]) {
        proto[method] = _methods[method] = options[method];
      }
    }

    // Add mixins to the prototype
    // Do this before combining properties to allow seemless modification of properties overridden by mixins
    if (options.mixins) {
      Coral.commons.mixin(
        proto,
        // A single Object, Function, or Array thereof
        options.mixins,
        {
          // Pass properties so functional mixins can augment them
          properties: properties
        }
      );
    }

    // Store and override property descriptors
    Coral.commons.augment(proto._properties, baseComponentProto._properties, properties, function(existingDesc, newDesc, propName) {
      // Drop properties that are not defined
      if (!newDesc) {
        return null;
      }

      // The child component (newDesc) determines whether to ignore the base component's descriptor
      if (newDesc.override === true) {
        // The new component wants to ignore the base component's descriptor
        return newDesc;
      }

      // Combine and override as necessary
      // The order of arguments seems backwards because we use this method in Coral.register.augmentProperties
      // This makes it so the existing setter is called first
      // It also makes it so the new descriptor will override other properties
      var combinedDesc = Coral.commons.augment(
        // Don't modify the existing descriptor
        {},
        newDesc,
        existingDesc,
        handleAugmentPropertyCollision
      );

      // Store the new methods and descriptor
      storeDescriptor(proto, propName, combinedDesc);

      // The property is already defined, so tell defineProperties not to define it again
      properties[propName] = undefined;

      // storeDescriptor() already stored the descriptor, but we have to return it anyway
      return combinedDesc;
    });

    // Removed properties that have been removed by inheriting components
    for (var propName in proto._properties) {
      if (!proto._properties[propName]) {
        delete proto._properties[propName];
      }
    }

    // Define properties last
    // This allows mixins to merge and modify properties
    if (options.baseTagName) {
      // Define ALL properties as we don't pick up any from the prototype
      defineProperties(proto, proto._properties);
    }
    else {
      // Define just the new properties
      defineProperties(proto, properties);
    }

    // The options to be passed to registerElement
    var registrationOptions = {
      prototype: proto
    };

    if (options.baseTagName) {
      // When a base tag is provided, we need to tell registerElement
      registrationOptions.extends = options.baseTagName;
    }

    // Register the element
    // This returns a constructor
    var Constructor = document.registerElement(options.tagName, registrationOptions);

    // Assign the constructor at the correct location within the Coral namespace
    Coral.commons.setSubProperty(Coral, options.name, Constructor);

    return Constructor;
  };

  // Expose globally
  Coral.register.defineProperties = defineProperties;
  Coral.register.defineProperty = defineProperty;

  /**
    Augment a set of property descriptors with another set.
    The <code>dest</code> property descriptors map is modified in place.
    The individual property descriptors (values of <code>dest</code>) are not modified.

    @param {Object<String,Coral~PropertyDescriptor>} dest
      The set of property descriptors to agument.
    @param {Object<String,Coral~PropertyDescriptor>} source
      The set of property descriptors to use.
    @param {Coral.commons~handleCollision} [handleCollision]
      Called if the descriptor property being copied is already present on the destination.
      The return value will be used as the property value.
      By default, if <code>sync</code> or <code>set</code> collides, both provided methods will be called.
      By default, if any other descriptor property collides, the destination's value will be used.
  */
  Coral.register.augmentProperties = function(dest, source, handleCollision) {
    Coral.commons.augment(dest, source, function(existingDesc, newDesc, propName) {
      // The mixin target (dest) determines whether to ignore the mixin's properties
      if (existingDesc.override === true) {
        // The mixin target (dest) wants to ignore the mixin's descriptor
        return existingDesc;
      }

      // Deep-augment individual property descriptor properties
      var combinedDesc = Coral.commons.augment(
        // Don't modify the existing descriptor
        {},
        existingDesc,
        newDesc,
        handleCollision || handleAugmentPropertyCollision
      );

      return combinedDesc;
    });
  };

  /**
    Default collision handler when augmenting properties
    @ignore
  */
  function handleAugmentPropertyCollision(destValue, sourceValue, descPropName) {
    switch (descPropName) {
    case 'sync':
    case 'set':
      // Use both methods
      return callBoth(sourceValue, destValue);
    default:
      // Use component's value
      return destValue;
    }
  }

  /**
    Return a function that calls both functions and ignores their return values
    @ignore
  */
  function callBoth(first, second) {
    return function() {
      first.apply(this, arguments);
      second.apply(this, arguments);
    };
  }
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
/**
  Mixins for Coral components.
  @namespace
*/
Coral.mixin = Coral.mixin || {};

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';
  /* jshint -W040 */

  /**
    A map of modifier names to their corresponding keycodes.
    @ignore
  */
  /* jshint -W015 */
  var modifierCodes = {
    '⇧': 16, 'shift': 16,
    '⌥': 18, 'alt': 18, 'option': 18,
    '⌃': 17, 'ctrl': 17, 'control': 17,
    '⌘': 91, 'cmd': 91, 'command': 91, 'meta': 91
  };

  /**
    Used to check if a key is a modifier.
    @ignore
  */
  var modifierCodeMap = {
    16: true,
    17: true,
    18: true,
    91: true
  };

  /**
    A list of modifier event property names in sorted key code order. Used to add keycodes for modifiers.
    @ignore
  */
  var modifierEventPropertyNames = [
    'shiftKey',
    'ctrlKey',
    'altKey',
    'metaKey'
  ];

  /**
    A map of key codes to normalize. These are duplicate keys such as the number pad.
    @ignore
  */
  var normalizedCodes = {
    // Numpad 0-9
    '96': 48,
    '97': 49,
    '98': 50,
    '99': 51,
    '100': 52,
    '101': 53,
    '102': 54,
    '103': 55,
    '104': 56,
    '105': 57
  };

  var specialKeyCodes = {
    'backspace': 8,
    'tab': 9,
    'return': 13,
    'enter': 13,
    'pause': 19,
    'capslock': 20,
    'esc': 27,
    'escape': 27,
    'space': 32,
    'pageup': 33,
    'pagedown': 34,
    'end': 35,
    'home': 36,
    'left': 37,
    'up': 38,
    'right': 39,
    'down': 40,
    'insert': 45,
    'del': 46,
    'delete': 46,
    ';': 186,
    '=': 187,
    '*': 106,
    'plus': 107,
    'minus': 189,
    '.': 190,
    'period': 190,
    '/': 191,
    'f1': 112,
    'f2': 113,
    'f3': 114,
    'f4': 115,
    'f5': 116,
    'f6': 117,
    'f7': 118,
    'f8': 119,
    'f9': 120,
    'f10': 121,
    'f11': 122,
    'f12': 123,
    'f13': 124,
    'f14': 125,
    'f15': 126,
    'f16': 127,
    'f17': 128,
    'f18': 129,
    'f19': 130,
    'numlock': 144,
    'scroll': 145,
    ',': 188,
    '`': 192,
    '[': 219,
    '\\': 220,
    ']': 221,
    '\'': 222
  };

  // Match a namespaced event, such as ctrl+r.myNS
  var namespaceRE = /(.*?)(\..+)$/;
  // Match a selector that requires context
  var needsContextRE = /^[\x20\t\r\n\f]*[>+~]/;

  /**
    The set of tags to ignore hot keys when focused within for the default filter.

    @ignore
  */
  var restrictedTagNames = {
    'INPUT': true,
    'SELECT': true,
    'TEXTAREA': true
  };

  /**
    The default keycombo event filter function. Ignores key combos triggered on input, select, and textarea.

    @function Coral.Keys.filterInputs

    @param event
      The event passed

    @returns {Boolean} True, if event.target is not editable and event.target.tagname is not restricted
  */
  function filterInputs(event) {
    var target = event.target;
    var tagName = target.tagName;
    var isContentEditable = target.isContentEditable;
    var isRestrictedTag = restrictedTagNames[tagName];
    return !isContentEditable && !isRestrictedTag;
  }

  /**
    Convert a key to its character code representation.

    @function Coral.Keys.keyToCode

    @param {String} key
      The key character that needs to be converted. If the String contains more than one character, an error will be
      produced.

    @returns {Number} The character code of the given String.
  */
  function keyToCode(key) {
    key = key.toLowerCase();

    // Map special string representations to their character code equivalent
    var code = specialKeyCodes[key] || modifierCodes[key];

    if (!code && key.length > 1) {
      throw new Error('Coral.Keys: Key ' + key + ' not recognized');
    }

    // Return the special code from the map or the char code repesenting the character
    return code || key.toUpperCase().charCodeAt(0);
  }

  /**
    Normalize duplicate codes.
    @ignore
  */
  function normalizeCode(code) {
    return normalizedCodes[code] || code;
  }

  /**
    Convert a combination of keys separated by + into the corresponding code string.
    @ignore
  */
  function keyComboToCodeString(keyCombo) {
    return keyCombo
      // Convert to string so numbers are supported
      .toString()
      .split('+')
      .map(keyToCode)
      // Sort keys for easy comparison
      .sort()
      .join('+');
  }

  /**
    Handle key combination events.

    @class Coral.Keys
    @param {*} elOrSelector
      The selector or element to listen for keyboard events on. This should be the common parent of all
      elements you wish to listen for events on.
    @param {Object} [options]
      Options for this combo handler.
    @param {Function} [options.context]
      The desired value of the <code>this</code> keyword context when executing listeners. Defaults to the element on
      which the event is listened for.
    @param {Function} [options.preventDefault=false]
      Whether to prevent the default behavior when a key combo is matched.
    @param {Function} [options.stopPropagation=false]
      Whether to stop propagation when a key combo is matched.
    @param {Function} [options.filter={@link Coral.Keys.filterInputs}]
      The filter function for keyboard events. This can be used to stop events from being triggered when they originate
      from specific elements.
  */
  function makeComboHandler(elOrSelector, options) {
    options = options || {};

    if (typeof elOrSelector === 'undefined') {
      throw new Error('Coral.Keys: Cannot create a combo handler for ' + elOrSelector);
    }

    // Cache the element object
    var el = typeof elOrSelector === 'string' ? document.querySelector(elOrSelector) : elOrSelector;

    // Use provided context
    var context = options.context;

    /**
      The filter function to use when evaluating keypresses
    */
    var filter = options.filter || filterInputs;

    /**
      Whether to prevent default
    */
    var preventDefault = options.preventDefault || false;

    /**
      Whether to stop propagation and prevent default
    */
    var stopPropagation = options.stopPropagation || false;

    /**
      A map of key code combinations to arrays of listener functions
      @ignore
    */
    var keyListeners;

    /**
      A an array of key sequences objects
      @ignore
    */
    var keySequences;

    /**
      The sorted array of currently pressed keycodes
      @ignore
    */
    var currentKeys;

    /**
      The joined string representation of currently pressed keycodes
      @ignore
    */
    var currentKeyCombo;

    /**
      The timeout that cooresponds to sequences
      @ignore
    */
    var sequenceTimeout;

    function handleKeyDown(event) {
      clearTimeout(sequenceTimeout);
      sequenceTimeout = setTimeout(resetSequence, Coral.Keys.sequenceTime);

      // Store pressed key in array
      var key = normalizeCode(event.keyCode);

      // Don't do anything when a modifier is pressed
      if (modifierCodeMap[key]) {
        return;
      }

      if (currentKeys.indexOf(key) === -1) {
        currentKeys.push(key);

        setCurrentKeyCombo(event);
      }

      executeListeners.call(this, event);

      // Workaround: keyup events are never triggered while the command key is down, so reset the list of keys
      if (event.metaKey) {
        reset();
      }

      if (!event.target.parentNode) {
        // Workaround: keyup events are never triggered if the element does not have a parent node
        reset();
      }
    }

    function setCurrentKeyCombo(event) {
      // Build string for modifiers
      var currentModifiers = [];
      for (var i = 0; i < modifierEventPropertyNames.length; i++) {
        var propName = modifierEventPropertyNames[i];

        if (event[propName]) {
          currentModifiers.push(modifierCodes[propName.slice(0, -3)]);
        }
      }

      // Store current key combo
      currentKeyCombo = currentKeys.concat(currentModifiers).sort().join('+');
    }

    function handleKeyUp(event) {
      var key = normalizeCode(event.keyCode);

      if (modifierCodeMap[key]) {
        // Workaround: keyup events are not triggered when command key is down on Mac, so if the command key is
        // released, consider all keys released
        // Test: comment this out, press K, press L, press Command, release L, release Command, then release K -- L is
        // triggered. This also prevents handlers for related key combos to be triggered
        // Test: comment this out, press Control, press Alt, press A, press S, release Alt, release S -- Control+A is
        // triggered
        reset();

        // We don't ever want to execute handlers when a modifier is released, and we can't since they don't end up in
        // currentKeys. If we weren't doing the index check below, that could result in key combo handlers for ctrl+r to
        // be triggered when someone released alt first after triggering ctrl+alt+r. In any case, return to avoid the
        // uselss extra work
        return;
      }

      // Remove key from array
      var index = currentKeys.indexOf(key);
      if (index !== -1) {
        currentKeys.splice(index, 1);

        // If too many keys are pressed, then one is removed, make sure to check for a match
        setCurrentKeyCombo(event);
        executeListeners.call(this, event, true);
      }
    }

    function processSequences() {
      var activeSequenceListeners = [];

      // Check each sequence's state
      keySequences.forEach(function(sequence) {
        if (sequence.parts[sequence.currentPart] === currentKeyCombo) {
          // If the current key combo in the sequence was pressed, increment the pointer
          sequence.currentPart++;
        }
        else {
          // Reset the sequence if a key was encountered out of sequence
          sequence.currentPart = 0;
        }

        if (sequence.currentPart === sequence.parts.length) {
          // If we've reached the end of the sequence, add it to the list of active sequences
          activeSequenceListeners.push(sequence);

          // Reset the sequence's state so it can be triggered again
          sequence.currentPart = 0;
        }
      });

      return activeSequenceListeners;
    }

    function executeListeners(event, keyup) {
      // Don't do anything if we don't have any keys pressed
      if (!currentKeyCombo) {
        return;
      }

      // Evaluate whether we should filter this keypress
      if (!filter(event)) {
        return;
      }

      var target = (event.target || event.srcElement);
      var doc = Object.prototype.toString.call(this) === '[object Window]' ? this.document : this;

      var listeners = [];

      // Execute listeners associated with the current key combination
      var comboListeners = keyListeners[currentKeyCombo];

      var sequenceListeners;
      if (!keyup) {
        // Process sequences and get listeners associated with the current sequence
        // Don't do this on keyup as this breaks sequences with modifiers
        sequenceListeners = processSequences();
      }

      if (comboListeners && comboListeners.length) {
        listeners = listeners.concat(comboListeners);
      }

      if (sequenceListeners && sequenceListeners.length) {
        listeners = listeners.concat(sequenceListeners);
      }

      if (listeners && listeners.length) {
        for (var i = 0; i < listeners.length; i++) {
          var listener = listeners[i];

          // Perform event delegation
          if (listener.selector) {
            var matches;
            var selector = '';
            
            // This allows us to match when the delegation selector includes context
            if (listener.needsContext) {
              doc.id = doc.id || Coral.commons.getUID();
              selector = '#' + doc.id + ' ';
            }
  
            matches = Array.prototype.indexOf.call(doc.querySelectorAll(selector + listener.selector), target) >= 0;
            
            // Skip if the originating element doesn't match the selector
            if (!matches) {
              continue;
            }
          }

          // Add data to event object
          if (typeof listener.data !== undefined) {
            event.data = listener.data;
          }

          // Add matchedTarget
          event.matchedTarget = target;

          listener.listener.call(context || doc, event);
        }

        // Don't do the default thing
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }
      }
    }

    /**
      Add a key combo listener.

      @function on
      @memberof Coral.Keys#
      @param {String} keyCombo
        The key combination to listen for, such as <code>'ctrl-f'</code>.
      @param {String} [selector]
        A selector to use for event delegation.
      @param {String} [data]
        Data to pass to listeners as <code>event.data</code>.
      @param {Function} listener
        The listener to execute when this key combination is pressed. Executes on keydown, or, if too many keys are
        pressed and one is released, resulting in the correct key combination, executes on keyup.

      @returns {Coral.Keys} this, chainable.
    */
    function on(keyCombo, selector, data, listener) {
      // keyCombo can be a map of keyCombos to handlers
      if (typeof keyCombo === 'object') {
        // ( keyCombo-Object, selector, data )
        if (typeof selector !== 'string') {
          // ( keyCombo-Object, data )
          // ( keyCombo-Object, null, data )
          data = data || selector;
          selector = undefined;
        }
        for (var combo in keyCombo) {
          this.on(combo, selector, data, keyCombo[combo]);
        }
        return this;
      }

      if (typeof data === 'undefined' && typeof listener === 'undefined') {
        // ( keyCombo, listener )
        listener = selector;
        data = selector = undefined;
      }
      else if (typeof listener === 'undefined') {
        if (typeof selector === 'string') {
          // ( keyCombo, selector, listener )
          listener = data;
          data = undefined;
        }
        else {
          // ( keyCombo, data, listener )
          listener = data;
          data = selector;
          selector = undefined;
        }
      }

      if (typeof listener !== 'function') {
        throw new Error('Coral.Keys: Cannot add listener of type ' + (typeof listener));
      }

      var namespace;
      var namespaceMatch = namespaceRE.exec(keyCombo);
      if (namespaceMatch) {
        keyCombo = namespaceMatch[1];
        namespace = namespaceMatch[2];
      }

      // Determine if this selector needs context when evaluating event delegation
      // A selector needs context when it includes things like >, ~, :first-child, etc
      var needsContext = selector ? needsContextRE.test(selector) : false;

      // Check if the stirng is a sequence or a keypress
      if (keyCombo.toString().indexOf('-') !== -1) {
        // It's a sequence!

        // Divide it into its parts and convert to a code string
        var sequenceParts = keySequenceStringToArray(keyCombo);

        // Store the listener and associated information in the list for this sequence
        keySequences.push({
          originalString: keyCombo,
          currentPart: 0,
          parts: sequenceParts,
          needsContext: needsContext,
          selector: selector,
          listener: listener,
          data: data,
          namespace: namespace
        });
      }
      else {
        // It's a key combo!
        keyCombo = keyComboToCodeString(keyCombo);

        var listeners = keyListeners[keyCombo] = keyListeners[keyCombo] || [];

        // Store the listener and associated information in the list for this keyCombo
        listeners.push({
          // Determine if this selector needs context when evaluating event delegation
          // A selector needs context when it includes things like >, ~, :first-child, etc
          needsContext: selector ? needsContextRE.test(selector) : false,
          selector: selector,
          listener: listener,
          data: data,
          namespace: namespace
        });
      }

      return this;
    }

    function keySequenceStringToArray(keyCombo) {
      return keyCombo.toString().split('-').map(keyComboToCodeString);
    }

    function offByKeyComboString(keyComboString, namespace, selector, listener) {
      var i;
      var listeners = keyListeners[keyComboString];

      if (listeners && listeners.length) {
        if (typeof selector === 'undefined' && typeof listener === 'undefined' && typeof namespace === 'undefined') {
          // Unbind all listeners for this key combo
          listeners.length = 0;
        }
        else if (typeof listener === 'undefined') {
          // Unbind all listeners of a specific selector and or namespace
          for (i = 0; i < listeners.length; i++) {
            // This comparison works because selector and namespace are undefined by default
            if (listeners[i].selector === selector && listeners[i].namespace === namespace) {
              listeners.splice(i, 1);
              i--;
            }
          }
        }
        else {
          // Unbind a specific listener, optionally on a specific selector and specific namespace
          for (i = 0; i < listeners.length; i++) {
            if (listeners[i].listener === listener &&
              listeners[i].selector === selector &&
              listeners[i].namespace === namespace) {
              listeners.splice(i, 1);
              i--;
            }
          }
        }
      }
    }

    /**
      Remove a key combo listener.

      @function off
      @memberof Coral.Keys#
      @param {String} keyCombo
        The key combination to listen for, such as <code>'ctrl-f'</code>.
      @param {String} [selector]
        A selector to use for event delegation.
      @param {Function} listener
        The listener that was passed to on.

      @returns {Coral.Keys} this, chainable.
    */
    function off(keyCombo, selector, listener) {
      if (typeof listener === 'undefined') {
        listener = selector;
        selector = undefined;
      }

      var i;
      var namespace;
      var namespaceMatch = namespaceRE.exec(keyCombo);
      if (namespaceMatch) {
        keyCombo = namespaceMatch[1];
        namespace = namespaceMatch[2];
      }

      if (keyCombo === '' && namespace !== undefined) {
        // If we have a namespace by no keyCombo, remove all events of the namespace for each key combo
        for (keyCombo in keyListeners) {
          offByKeyComboString(keyCombo, namespace, selector, listener);
        }

        // Remove sequences
        for (i = 0; i < keySequences.length; i++) {
          if (keySequences[i].namespace === namespace) {
            keySequences.splice(i, 1);
            i--;
          }
        }

        return this;
      }

      if (keyCombo.indexOf('-') !== -1) {
        // Unbind a specific key sequence listener, optionally on a specific selector and specific namespace
        for (i = 0; i < keySequences.length; i++) {
          if (
            (keyCombo === undefined || keySequences[i].originalString === keyCombo) &&
            (listener === undefined || keySequences[i].listener === listener) &&
            (selector === undefined || keySequences[i].selector === selector) &&
            (namespace === undefined || keySequences[i].namespace === namespace)
          ) {
            keySequences.splice(i, 1);
            i--;
          }
        }
      }
      else {
        keyCombo = keyComboToCodeString(keyCombo);

        offByKeyComboString(keyCombo, namespace, selector, listener);
      }

      return this;
    }

    function resetSequence() {
      clearTimeout(sequenceTimeout);
      keySequences.forEach(function(sequence) {
        // Reset each sequence
        sequence.currentPart = 0;
      });
    }

    /**
      Reset the state of this instance. This resets the currently pressed keys.

      @function reset
      @memberof Coral.Keys#

      @returns {Coral.Keys} this, chainable.
    */
    function reset() {
      // Only reset variables related to currently pressed keys
      // Don't mess with sequences
      currentKeys = [];
      currentKeyCombo = '';

      return this;
    }

    /**
      Initialize an instance created without the <code>new</code> keyword or revive a destroyed instance. This method
      will be called automatically if an instance is created with <code>new Coral.keys</code>, but otherwise will not be
      called.

      @function init
      @param {Boolean} globalsOnly
        Whether only global listeners should be added
      @memberof Coral.Keys#

      @returns {Coral.Keys} this, chainable.
    */
    function init(globalsOnly) {
      if (!globalsOnly) {
        // Reset all variable states
        currentKeys = [];
        currentKeyCombo = '';
        keyListeners = {};
        keySequences = [];
  
        el.addEventListener('keydown', handleKeyDown);
      }
      
      // Watching on capture so it is immune to stopPropagation(). It's very important this event
      // is handled so key entries previously added on keydown can be cleared out.
      // If multiple identical EventListeners are registered on the same EventTarget with the same parameters the
      // duplicate instances are discarded. They do not cause the EventListener to be called twice.
      window.addEventListener('keyup', handleKeyUp, true);
      window.addEventListener('focus', reset);

      return this;
    }

    /**
      Destroy this instance. This removes all event listeners, references, and state.

      @function destroy
      @param {Boolean} globalsOnly
        Whether only global listeners should be removed
      @memberof Coral.Keys#

      @returns {Coral.Keys} this, chainable.
    */
    function destroy(globalsOnly) {
      if (!globalsOnly) {
        keyListeners = null;
        currentKeys = null;
        currentKeyCombo = null;
  
        el.removeEventListener('keydown', handleKeyDown);
      }
  
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('focus', reset);

      return this;
    }

    // @todo is this insane?
    if (this instanceof makeComboHandler) {
      // Initialize immediately if new keyword used
      init();
    }


    return {
      on: on,
      off: off,
      reset: reset,
      init: init,
      destroy: destroy
    };
  }

  Coral.Keys = makeComboHandler;

  Coral.Keys.filterInputs = filterInputs;

  Coral.Keys.keyToCode = keyToCode;

  /**
    The time allowed between keypresses for a sequence in miliseconds
    @type Number
    @default 1500
  */
  Coral.Keys.sequenceTime = 1500;

  /**
    A key listener for global hotkeys.

    @static
    @type Coral.keys
  */
  // Register against the documentElement, <html>, so event delegation works
  Coral.keys = new Coral.Keys(document.documentElement, {
    // Don't let global hotkeys trigger default actions
    stopPropagation: true,
    preventDefault: true
  });

}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    Enum for locale values.
    @enum {String}
    @memberof Coral.i18n
  */
  var locales = {
    /** English (U.S.) */
    'en': 'en-US',
    /** English (U.S.)*/
    'en-us': 'en-US',
    /** German (Germany)*/
    'de': 'de-DE',
    /** German (Germany)*/
    'de-de': 'de-DE',
    /** Spanish (Spain)*/
    'es': 'es-ES',
    /** Spanish (Spain)*/
    'es-es': 'es-ES',
    /** French (France)*/
    'fr': 'fr-FR',
    /** French (France)*/
    'fr-fr': 'fr-FR',
    /** Italian (Italy)*/
    'it': 'it-IT',
    /** Italian (Italy)*/
    'it-it': 'it-IT',
    /** Japanese (Japan)*/
    'ja': 'ja-JP',
    /** Japanese (Japan)*/
    'ja-jp': 'ja-JP',
    /** Korean (Korea)*/
    'ko': 'ko-KR',
    /** Korean (Korea)*/
    'ko-kr': 'ko-KR',
    /** Dutch (Netherlands)*/
    'nl': 'nl-NL',
    /** Dutch (Netherlands)*/
    'nl-nl': 'nl-NL',
    /** Portuguese (Brazil) */
    'pt': 'pt-BR',
    /** Portuguese (Brazil) */
    'pt-br': 'pt-BR',
    /** Simplified Chinese */
    'zh-cn': 'zh-CN',
    /** Simplified Chinese */
    'zh-hans-cn': 'zh-CN',
    /** Simplified Chinese */
    'zh-hans': 'zh-CN',
    /** Traditional Chinese */
    'zh-tw': 'zh-TW',
    /** Traditional Chinese */
    'zh-hant-tw': 'zh-TW',
    /** Traditional Chinese */
    'zh-hant': 'zh-TW'
  };

  /**
    I18n service for CoralUI.

    @class Coral.i18n
    @classdesc An I18n service to get/set localized strings.
    @param {Object} [options]
      Options for this combo handler.
    @param {String} [options.locale]
      The <code>locale</code> property defines the locale of the I18nProvider.
      @ignore
  */
  var I18nProvider = function(options) {
    options = options || {};

    if (options.locale) {
      this._locale = options.locale;
    }
  };

  I18nProvider.prototype._locale = 'en-US';

  /**
    Coral.i18n current locale value.
    @member {Coral.i18n.locales} locale
    @memberof Coral.i18n
  */
  Object.defineProperty(I18nProvider.prototype, 'locale', {
    set: function(newLocale) {
      this._locale = newLocale;
    },
    get: function() {
      return this._locale;
    }
  });

  /**
    evaluate
    @type {RegExp}
    @ignore
  */
  I18nProvider.prototype._evaluate = /(\{.+?\})/g;

  /**
    Sets a localized string.

    @function set
    @param {String} key the key to set
    @param {String} value the value associated with the given key.
    @memberof Coral.i18n
    @example
    Coral.i18n.set('English string', 'Translated string');
Coral.i18n.set('English string: {0}', 'Translated string: {0}');
Coral.i18n.set('English string: {0}, {1}, and {2}', 'Translated string: {2}, {0}, and {1}');
Coral.i18n.set('English string: {name}', 'Translated string: {name}');
Coral.i18n.set('English string: {name1}, {name2}, and {name3}', 'Translated string: {name3}, {name1}, and {name2}');
  */

  /**
    Sets multiple localized strings.

    @function set
    @param {Array<String, String>} map  a key-value map to add to the strings dictionary.
    @memberof Coral.i18n
    @example
    Coral.i18n.set([
      ['English string 1', 'Translated string 1'],
      ['English string 2', 'Translated string 2'],
      ['English string 1 with {0} items','Translated string 1 with {0} items'],
      ['English string 2 with {0} items','Translated string 2 with {0} items'],
      ['English string 1: {0}, {1}, and {2}','Translated string 1: {2}, {0}, and {1}'],
      ['English string 2: {0}, {1}, and {2}','Translated string 2: {2}, {0}, and {1}'],
      ['English string 1: {name}', 'Translated string 1: {name}'],
      ['English string 2: {name}', 'Translated string 2: {name}'],
      ['English string 1: {name1}, {name2}, and {name3}', 'Translated string 1: {name3}, {name1}, and {name2}'],
      ['English string 2: {name1}, {name2}, and {name3}', 'Translated string 2: {name3}, {name1}, and {name2}']
    ]);
   */

   /**
    Sets a localized string, using translation hint.

    @function set
    @param {String} key the key to set
    @param {String} value the value associated with the given key.
    @param {String} translation_hint the translation hint associated with the given key.
    @memberof Coral.i18n
    @example
    Coral.i18n.set('English string', 'Translated string 1', 'Translation hint 1');
Coral.i18n.set('English string', 'Translated string 2', 'Translation hint 2');
Coral.i18n.set('English string with {0} items' , 'Translated string 1 with {0} items', 'Translation hint 1');
Coral.i18n.set('English string with {0} items' , 'Translated string 2 with {0} items', 'Translation hint 2');
Coral.i18n.set('English string: {0}, {1}, and {2}', 'Translated string 1: {2}, {0}, and {1}', 'Translation hint 1');
Coral.i18n.set('English string: {0}, {1}, and {2}', 'Translated string 2: {2}, {0}, and {1}', 'Translation hint 2');
Coral.i18n.set('English string: {name}', 'Translated string 1: {name}', 'Translation hint 1');
Coral.i18n.set('English string: {name}', 'Translated string 2: {name}', 'Translation hint 2');
Coral.i18n.set('English string: {name1}, {name2}, and {name3}', 'Translated string 1: {name3}, {name1}, and {name2}', 'Translation hint 1');
Coral.i18n.set('English string: {name1}, {name2}, and {name3}', 'Translated string 2: {name3}, {name1}, and {name2}', 'Translation hint 2');
  */

  /**
    Sets multiple localized strings, using translation hints.

    @function set
    @param {Array<String, String, String>} map  a key-value object map to add to the strings dictionary.
    @memberof Coral.i18n
    @example
    Coral.i18n.set([
      ['English string', 'Translated string 1', 'Translation hint 1'],
      ['English string', 'Translated string 2', 'Translation hint 2'],
      ['English string with {0} items', 'Translated string 1 with {0} items', 'Translation hint 1'],
      ['English string with {0} items', 'Translated string 2 with {0} items', 'Translation hint 2'],
      ['English string with {0}, {1} and {2} items', 'Translated string 1 with {0}, {1} and {2} items', 'Translation hint 1'],
      ['English string with {0}, {1} and {2} items', 'Translated string 2 with {0}, {1} and {2} items', 'Translation hint 2'],
      ['English string: {name}', 'Translated string 1: {name}', 'Translation hint 1'],
      ['English string: {name}', 'Translated string 2: {name}', 'Translation hint 2'],
      ['English string: {name1}, {name2}, and {name3}', 'Translated string 1: {name3}, {name1}, and {name2}', 'Translation hint 1'],
      ['English string: {name1}, {name2}, and {name3}', 'Translated string 2: {name3}, {name1}, and {name2}', 'Translation hint 2']
    ]);
   */

  I18nProvider.prototype.set = function() {
    Coral.strings['generic'][this._locale] = Coral.strings['generic'][this._locale] || {};

    var key, value, translationHint;
    if (arguments.length === 0) {
      // Return empty string if called without arguments
      return '';
    }
    else if (arguments.length === 1) {
      if (!arguments[0]) {
        throw new Error('Coral.i18n.set: Single argument must be an array of arrays of key/value/(translation hint).');
      }
      // multiple keys
      else if (typeof arguments[0] === 'object' && (typeof arguments[0][0] === 'object')) {
        for (var i=0; i < arguments[0].length; i++) {
          key = arguments[0][i][0];
          value = arguments[0][i][1];
          translationHint = arguments[0][i][2];

          if (translationHint) {
            key = key + '/[translation hint:' + translationHint.replace(/&period;/g, '.') + ']';
          }
          Coral.strings['generic'][this._locale][key] = value;
        }
      }
      else {
        throw new Error('Coral.i18n.set: Single argument must be an array of key-value pairs.');
      }
    }
    // single key, no translation hint
    else if (arguments.length === 2) {
      if (typeof arguments[0] === 'string' && !!arguments[0] && typeof arguments[1] === 'string' && !!arguments[1] ) {
        key = arguments[0];
        value = arguments[1];
        Coral.strings['generic'][this._locale][key] = value;
      }
      else {
        throw new Error('Coral.i18n.set: Both arguments must be non-empty string values.');
      }
    }
    // single key, with translation hint
    else if (arguments.length === 3) {
      if (typeof arguments[0] === 'string' && typeof arguments[1] === 'string' && typeof arguments[2] === 'string') {
        key = arguments[0];
        value = arguments[1];
        translationHint = arguments[2];

        if (translationHint !== 'null') {
          key = key + '/[translation hint:' + translationHint.replace(/&period;/g, '.') + ']';
        }

        Coral.strings['generic'][this._locale][key] = value;
      }
      else {
        throw new Error('Coral.i18n.set: All arguments must be of string type.');
      }
    }
    else {
      throw new Error('Coral.i18n.set: Too many arguments provided.');
    }

    return this;
  };

  /**
    Gets a localized string, using named arguments, and translation hint.

    @function get
    @param {String} key the key of the string to retrieve
    @param {Object} args one more named arguments
    @param {String} translation_hint context information for translators
    @returns {String} the localized string with arguments
    @memberof Coral.i18n
    @example
    Coral.i18n.get('English string: {name}', { name: 'foo' }, 'Translation hint 1'); // => 'Translated string 1: foo'
Coral.i18n.get('English string: {name}', { name: 'foo' }, 'Translation hint 2'); // => 'Translated string 2: foo'
Coral.i18n.get('English string: {name1}, {name2}, and {name3}', { name1: 'foo', name2: 'bar', name3: 'qux' }, 'Translation hint 1'); // => 'Translated string 1: qux, foo, and bar'
Coral.i18n.get('English string: {name1}, {name2}, and {name3}', { name1: 'foo', name2: 'bar', name3: 'qux' }, 'Translation hint 2'); // => 'Translated string 2: qux, foo, and bar'
  */

  /**
    Gets a localized string, using arguments, and translation hint.

    @function get
    @param {String} key the key of the string to retrieve
    @param {String} args one more arguments
    @param {String} translation_hint context information for translators
    @returns {String} the localized string with arguments
    @memberof Coral.i18n
    @example
    Coral.i18n.get('English string: {0}', 10, 'Translation hint 1'); // => 'Translated string 1: 10')
Coral.i18n.get('English string: {0}', 10, 'Translation hint 2'); // => 'Translated string 2: 10')
Coral.i18n.get('English string: {0}, {1}, and {2}', 10, 20, 30, 'Translation hint 1'); // => 'Translated string 1: 30, 10, and 20'
Coral.i18n.get('English string: {0}, {1}, and {2}', 10, 20, 30, 'Translation hint 2'); // => 'Translated string 2: 30, 10, and 20'
  */

  /**
    Gets a localized string, using translation hint.

    @function get
    @param {String} key the key of the string to retrieve
    @param {String} translation_hint context information for translators
    @returns {String} the localized string
    @memberof Coral.i18n
    @example
    Coral.i18n.get('English string', 'Translation hint 1'); // => 'Translated string 1'
Coral.i18n.get('English string', 'Translation hint 2'); // => 'Translated string 2'
  */  

  /**
    Gets a localized string, using named arguments.

    @function get
    @param {String} key the key of the string to retrieve
    @param {Object} args one more named arguments
    @returns {String} the localized string with arguments
    @memberof Coral.i18n
    @example
    Coral.i18n.get('English string: {name}', { name: 'foo' }); // => 'Translated string: foo'
Coral.i18n.get('English string: {name1}, {name2}, and {name3}', { name1: 'foo', name2: 'bar', name3: 'qux' }); // => 'Translated string: qux, foo, and bar'
  */

  /**
    Gets a localized string, using arguments.

    @function get
    @param {String} key the key of the string to retrieve
    @param {String} args one more arguments
    @returns {String} the localized string with arguments
    @memberof Coral.i18n
    @example
    Coral.i18n.get('English string: {0}', 10); // => 'Translated string: 10'
Coral.i18n.get('English string: {0}, {1}, and {2}', 10, 20, 30); // => 'Translated string: 30, 10, and 20'
  */
  /**
    Gets a localized string.

    @function get
    @param {String} key the key of the string to retrieve
    @returns {String} the localized string
    @memberof Coral.i18n
    @example
    Coral.i18n.get('English string'); // => 'Translated String'
  */

  I18nProvider.prototype.get = function() {
    if (arguments.length === 0) {
      // Return empty string if called without arguments
      return '';
    }

    // The first argument is always the key
    // Aladdin server stores periods in keys as HTML entities, so we need to match this
    var key = arguments[0].replace('.', '&period;');

    // The number of required variables can be determined by parsing the string
    var placeholderMatches = key.match(this._evaluate);
    var variablePlaceholderCount = placeholderMatches ? placeholderMatches.length : 0;

    // The hint we'll use to translate
    var translationHint = '';

    var variables = {};
    var variableCount = 0;
    var i;

    // Verify the number of provided arguments matches the placeholder count
    if (arguments[1] !== null && typeof arguments[1] === 'object') {
      variables = arguments[1];

      // Check if provided variables object is complete
      var placeholderName = '';
      for (i = 0; i < placeholderMatches.length; i++) {
        placeholderName = placeholderMatches[i].slice(1).slice(0, -1);
        if (variables[placeholderName] === null || typeof variables[placeholderName] === 'undefined') {
          throw new Error('Coral.i18n.get: Named key "'+placeholderName+'" not present in provided object.');
        }
      }

      // If an additional argument is present, it's the translation hint
      if (typeof arguments[2] === 'string') {
        translationHint = arguments[2];
      }
    }
    else {
      // Assume no translation hint
      variableCount = arguments.length - 1;

      if (variableCount === variablePlaceholderCount + 1) {
        // If we've got an extra argument, assume it's a translation hint
        translationHint = arguments[arguments.length - 1];
      }
      else if (variableCount !== variablePlaceholderCount) {
        throw new Error('Coral.i18n.get: Number of variable placeholders ('+variablePlaceholderCount+') does not match number of variables ('+variableCount+').');
      }

      // Build variables object
      for (i = 0; i < variableCount; i++) {
        variables[i] = arguments[i + 1];
      }
    }

    // Include translation hint
    if (translationHint) {
      key = key + '/[translation hint:' + translationHint + ']';
    }

    // Fetch the string
    var str = key;
    for (var component in Coral.strings) {
      if (typeof Coral.strings[component] !== 'undefined' &&
          typeof Coral.strings[component][this._locale] !== 'undefined') {
        str = Coral.strings[component][this._locale][key] || str;
      }
    }

    // Optimization for a string with no placeholder
    if (variablePlaceholderCount === 0) { // e.g. Coral.i18n.get('English string');
      return str;
    }

    // Replace all variables
    return str.replace(this._evaluate, function(placeholderName) {
      placeholderName = placeholderName.slice(1).slice(0, -1);
      return variables[placeholderName];
    });

    // @todo use .toLocaleString(Coral.i18n.locale) in a future release
  };

  // sets default locale, based on document lang attribute, if it exists, or en-US otherwise
  var docLang = document.documentElement.lang.toLowerCase();
  var locale = locales[docLang] || 'en-US';

  /**
    A Coral I18n service
    @namespace
  */
  Coral.i18n = new I18nProvider({ locale: locale });
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
/* global Vent: true */
/* jshint -W064 */
(function() {
  'use strict';

  // Used to split events by type/target
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // Enum value is referenced for speed
  var ELEMENT_NODE = Node.ELEMENT_NODE;

  /**
    Return the method corresponding to the method name or the function, if passed.

    @ignore
  */
  function getListenerFromMethodNameOrFunction(obj, eventName, methodNameOrFunction) {
    // Try to get the method
    if (typeof methodNameOrFunction === 'function') {
      return methodNameOrFunction;
    }
    else if (typeof methodNameOrFunction === 'string') {
      if (!obj[methodNameOrFunction]) {
        throw new Error('Coral.Component: Unable to add ' + eventName + ' listener for ' + obj.toString() +
          ', method ' + methodNameOrFunction + ' not found');
      }

      var listener = obj[methodNameOrFunction];

      if (typeof listener !== 'function') {
        throw new Error('Coral.Component: Unable to add ' + eventName + ' listener for ' + obj.toString() +
          ', listener is a ' + (typeof listener) + ' but should be a function');
      }

      return listener;
    }
    else if (methodNameOrFunction) {
      // If we're passed something that's truthy (like an object), but it's not a valid method name or a function, get
      // angry
      throw new Error('Coral.Component: Unable to add ' + eventName + ' listener for ' + obj.toString() + ', ' +
        methodNameOrFunction + ' is neither a method name or a function');
    }

    return null;
  }

  /**
    @class Coral.Component
    @classdesc The base element for all Coral components
    @extends HTMLElement
  */
  Coral.Component = function() {
    throw new Error('Coral.Component is not meant to be invoked directly. Inherit from its prototype instead.');
  };

  // Inherit from HTMLElement
  Coral.Component.prototype = Object.create(HTMLElement.prototype);

  // Store a reference to properties
  Coral.Component.prototype._properties = {};

  /**
    Return this component's name.

    @ignore
  */
  Coral.Component.prototype.toString = function() {
    return 'Coral.' + this._componentName;
  };

  /**
    Events map. Key is Backbone-style event description, value is string indicating method name or function. Handlers
    are always called with <code>this</code> as the element.

    @type {Object}
    @protected
  */
  Coral.Component.prototype._events = {

  };

  /**
    Called when the component is being constructed. This method applies the CSS class, renders the component, binds
    events, and sets initial property values.

    {@link Coral.Component#_initialize} is called after the above operations are complete.
    @protected
  */
  Coral.Component.prototype.createdCallback = function() {
    // We have to add toString directly on the instance or it doesn't work in IE 9
    // A side-effect of this is that toString cannot be overridden
    if (this.toString !== Coral.Component.prototype.toString) {
      this.toString = Coral.Component.prototype.toString;
    }

    // Track which properties have been set
    // This is used when setting defaults
    this._setProps = {};

    this._syncQueue = [];

    // Make sure context is correct when called by nextFrame
    this._syncDOM = this._syncDOM.bind(this);

    // Create a Vent instance to handle local events
    this._vent = new Vent(this);

    // Apply the class name
    if (this._className) {
      this.classList.add.apply(this.classList, this._className.split(' '));
    }

    // Create the elements property before the template. Templates that use handle="someName" attrs will need this
    this._elements = {};

    // Render template, if necessary
    if (typeof this._render === 'function') {
      this._render();
    }

    var prop;
    var attr;
    var value;
    var descriptor;
    var methods;

    // A hash where all the content zone names are stored using the tagName as key and property as value
    this._contentZones = {};

    // A list of attribute values indexed by property name
    // prop -> attrValue
    var attrValues = {};

    // Build a cache of attribute values provided via the markup and check for content zones
    for (prop in this._properties) {
      descriptor = this._properties[prop];

      if (descriptor.contentZone) {
        // Check if the tag name is unique
        if (this._contentZones[descriptor.tagName]) {
          console.warn('Coral.Component: content zone for "%s" is already defined', descriptor.tagName);
        }

        // Add the prop to the hash
        this._contentZones[descriptor.tagName] = prop;
      }

      // Use the attribute name specified by the map
      attr = descriptor.attribute || prop;

      // Fetch the attribute corresponding to the property from the element
      attrValues[prop] = this.getAttribute(attr);
    }

    // Apply default values for all properties and their associated attributes
    for (prop in this._properties) {
      descriptor = this._properties[prop];
      methods = descriptor._methods;

      // Get the attribute value from the cache
      value = attrValues[prop];

      if (value !== null) {
        // Since the value is loaded as an attribute, it needs to be transformed from its attribute value
        if (methods.attributeTransform) {
          value = methods.attributeTransform.call(this, value, descriptor.default);
        }

        // Run the value transform function
        if (descriptor.transform) {
          value = methods.transform.call(this, value, descriptor.default);
        }

        // Check if the value valdiates
        if (methods.validate) {
          for (var i = 0; i < methods.validate.length; i++) {
            // Don't pass the old value
            if (!methods.validate[i].call(this, value)) {
              // If it fails validation, we'll use the default
              value = null;
              break;
            }
          }
        }
      }

      if (value === null) {
        // If the property has already been set in another setter, don't apply the default
        if (this._setProps[prop]) {
          continue;
        }

        // If the default is a function we call it
        if (typeof descriptor.default === 'function') {
          // Call method if the default value is a method
          value = descriptor.default.call(this);
        }
        else {
          // Otherwise we set it from the descriptor directly
          value = descriptor.default;
        }

        // If the value that came out of the default is undefined,
        // this means that the property does not really have a default value
        // so we continue in order to avoid setting it
        if (typeof value === 'undefined') {
          continue;
        }
      }

      // Invoke the setter silently so we don't trigger "change" events on initialization
      this.set(prop, value, true);
    }

    this._delegateEvents();

    // Call the initialize method, if necessary
    if (typeof this._initialize === 'function') {
      this._initialize();
    }

    // Add MutationObserver for content zones
    if (Object.keys(this._contentZones).length) {
      // Watch for childlist modifications
      this._observer = new MutationObserver(this._handleContentZones.bind(this));
      this._observer.observe(this, {
        childList: true,
        subtree: false // don't care about nested stuff
      });
    }

    // Trigger ready event
    this._componentReady = true;
  };

  /**
    Detects when items are added and removed to make sure that the state of the content zone is accurate.

    @param {Array.<MutationRecord>} records

    @private
  */
  Coral.Component.prototype._handleContentZones = function(records) {
    var record;
    var addedNodes;
    var removedNodes;
    var node;
    var tagName;
    var propertyName;

    for (var i = 0, recordsCount = records.length; i < recordsCount; i++) {
      record = records[i];

      addedNodes = record.addedNodes;
      removedNodes = record.removedNodes;

      // Handle removed nodes
      for (var k = 0, removedNodesCount = removedNodes.length; k < removedNodesCount; k++) {
        node = removedNodes[k];

        // only bother with element nodes
        if (node.nodeType === ELEMENT_NODE) {
          tagName = node.tagName.toLowerCase();

          // we use the content zone hash to check if there is an item assigned
          propertyName = this._contentZones[tagName];

          // the content zone needs to be cleared if it matches the previous item; while calling the insert, content
          // zones are removed and added again in the correct location triggering a mutation
          if (propertyName && this[propertyName] === node && node.parentNode === null) {
            this[propertyName] = undefined;
          }
        }
      }

      // Handle added nodes
      for (var j = 0, addedNodesCount = addedNodes.length; j < addedNodesCount; j++) {
        node = addedNodes[j];

        // only bother with element nodes
        if (node.nodeType === ELEMENT_NODE) {
          tagName = node.tagName.toLowerCase();

          // check if the added node matches a content zone; use the content zone hash to find if the tag name exists
          propertyName = this._contentZones[tagName];

          // we update the content zone if the value is different than the current
          if (propertyName && this[propertyName] !== node) {
            // assign to content zone
            this[propertyName] = node;
          }
        }
      }
    }
  };

  /**
    Called after the element has been constructed, template rendered, and attributes applied.

    @function _initialize
    @protected
    @memberof Coral.Component#
  */

  /**
    The CSS class name to apply to the element.

    @type {String}
    @member _className
    @protected
    @memberof Coral.Component#
  */

  /**
    Called during construction, is responsible for rendering any required sub-elements.

    @function _render
    @protected
    @memberof Coral.Component#
  */

  /**
    The filter function for keyboard events. By default, any child element can trigger keyboard events. You can pass
    {@link Coral.Keys.filterInputs} to avoid listening to key events triggered from within inputs.

    @function _filterKeys
    @protected
    @memberof Coral.Component#
  */
  Coral.Component.prototype._filterKeys = function() {
    return true;
  };

  /**
    Called when this element is inserted into the DOM.

    @fires Coral.Component#coral-component:attached
    @private
  */
  Coral.Component.prototype.attachedCallback = function() {
    this.trigger('coral-component:attached');

    // A component that is in the DOM should respond to global events
    this._delegateGlobalEvents();
  };

  /**
    Called when this element is removed from the DOM.

    @fires Coral.Component#coral-component:detached
    @private
  */
  Coral.Component.prototype.detachedCallback = function() {
    this.trigger('coral-component:detached');

    // A component that isn't in the DOM should not be responding to global events
    this._undelegateGlobalEvents();
  };

  /**
    Apply attribute changes by invoking setters. This creates a one-way relationship between attributes and properties.
    Changing an attribute updates the property, but changing the property does not update the attribute.

    @private
  */
  Coral.Component.prototype.attributeChangedCallback = function(attrName, oldValue, newValue) {
    // Use the property name from the attribute map, otherwise just set the property by the same name
    var propName = this._attributes[attrName] || attrName;

    // Case 1: We are handling sets/gets for this property
    var descriptor = this._properties[propName];
    if (typeof descriptor !== 'undefined') {
      if (descriptor.attribute === null) {
        // Don't set properties that have explicitly asked to have no corresponding attribute
        return;
      }

      ['attributeTransform', 'transform'].forEach(function(v) {
        // Use the stored methods
        var transform = descriptor._methods[v];
        if (transform) {
          newValue = transform.call(this, newValue, descriptor.default);
        }
      }, this);

      // Don't bother with the setter unless the value changed
      if (newValue !== this[propName]) {
        // Just invoke setter
        this[propName] = newValue;
      }
    }

    // Case 2: We have a passive setter for this attribute
    if (this._properties['_' + propName]) {
      this._properties['_' + propName].set.call(this, newValue);
    }
  };

  /**
    Queue a DOM sync for the next animation frame. In order for this to work as expected, sync methods should never
    rely on the result of another value being synced.

    @protected
  */
  Coral.Component.prototype._queueSync = function() {
    for (var i = 0, ni = arguments.length; i < ni; i++) {
      var propName = arguments[i];

      // Check if a sync is already queued
      var currentIndex = this._syncQueue.indexOf(propName);
      if (currentIndex !== -1) {
        // Move to the bottom of the queue.
        // This is necessary if a sync has already been queued for a property,
        // but another property sync is queued and specifies that this sync should come later.
        // This happens when Button.text is synced, as it wants to sync icon afterwards
        this._syncQueue.splice(currentIndex, 1);
      }

      // Queue the sync
      this._syncQueue.push(propName);
    }

    if (!this._syncPending) {
      Coral.commons.nextFrame(this._syncDOM);
      this._syncPending = true;
    }
  };

  /**
    Sync the specified property to the DOM.

    @param {String} propName
      The name of the property to sync.
    @param {Boolean} [leaveInQueue=false]
      Whether the property should be left in the queue.

    @protected
  */
  Coral.Component.prototype._syncProp = function(propName, leaveInQueue) {
    // De-queue each sync operation
    var method = this._properties[propName].sync;
    if (method) {
      method.call(this);
    }
    else {
      console.warn('Coral.Component: sync method for %s is not defined', propName);
    }

    if (!leaveInQueue) {
      var index = this._syncQueue.indexOf(propName);
      if (index !== -1) {
        this._syncQueue.splice(index, 1);
      }
    }
  };

  /**
    Sync all changed properties to the DOM.

    @protected
  */
  Coral.Component.prototype._syncDOM = function() {
    var propName;

    // De-queue each sync operation
    while (propName = this._syncQueue.shift()) {
      // Sync the property, and avoid removing it because we already have
      this._syncProp(propName, true);
    }

    this._syncPending = false;
  };

  /**
    Add local event and key combo listeners for this component, store global event/key combo listeners for later.

    @private

    @returns {Coral.Component} this, chainable.
  */
  Coral.Component.prototype._delegateEvents = function() {
    /*
      Add listeners to new event
        - Include in hash
      Add listeners to existing event
        - Override method and use super
      Remove existing event
        - Pass null
    */
    var match;
    var eventName;
    var eventInfo;
    var listener;
    var selector;
    var elements;
    var isGlobal;
    var isKey;
    var isResize;
    var isCapture;

    for (eventInfo in this._events) {
      listener = this._events[eventInfo];

      // Extract the event name and the selector
      match = eventInfo.match(delegateEventSplitter);
      eventName = match[1] + '.CoralComponent';
      selector = match[2];

      if (selector === '') {
        // instead of null because the key module checks for undefined
        selector = undefined;
      }

      // Try to get the method corresponding to the value in the map
      listener = getListenerFromMethodNameOrFunction(this, eventName, listener);

      if (listener) {
        // Always execute in the context of the object
        // @todo is this necessary? this should be correct anyway
        listener = listener.bind(this);

        // Check if the listener is on the window
        isGlobal = eventName.indexOf('global:') === 0;
        if (isGlobal) {
          eventName = eventName.substr(7);
        }

        // Check if the listener is a capture listener
        isCapture = eventName.indexOf('capture:') === 0;
        if (isCapture) {
          // @todo Limitation: It should be possible to do capture:global:, but it isn't
          eventName = eventName.substr(8);
        }

        // Check if the listener is a key listener
        isKey = eventName.indexOf('key:') === 0;
        if (isKey) {
          if (isCapture) {
            throw new Error('Coral.Keys does not currently support listening to key events with capture');
          }
          eventName = eventName.substr(4);
        }

        // Check if the listener is a resize listener
        isResize = eventName.indexOf('resize') === 0;
        if (isResize) {
          if (isCapture) {
            throw new Error('Coral.commons.addResizeListener does not currently support listening to resize event with capture');
          }
        }

        if (isGlobal) {
          // Store for adding/removal
          if (isKey) {
            this._globalKeys = this._globalKeys || [];
            this._globalKeys.push({
              keyCombo: eventName,
              selector: selector,
              listener: listener
            });
          }
          else {
            this._globalEvents = this._globalEvents || [];
            this._globalEvents.push({
              eventName: eventName,
              selector: selector,
              listener: listener,
              isCapture: isCapture
            });
          }
        }
        else {
          // Events on the element itself
          if (isKey) {
            // Create the keys instance only if its needed
            this._keys = this._keys || new Coral.Keys(this, {
                filter: this._filterKeys,
                // Execute key listeners in the context of the element
                context: this
              });

            // Add listener locally
            this._keys.on(eventName, selector, listener);
          }
          else if (isResize) {
            if (selector) {
              elements = document.querySelectorAll(selector);
              for (var i = 0; i < elements.length; ++i) {
                Coral.commons.addResizeListener(elements[i], listener);
              }
            }
            else {
              Coral.commons.addResizeListener(this, listener);
            }
          }
          else {
            this._vent.on(eventName, selector, listener, isCapture);
          }
        }
      }
    }
  };

  /**
    Remove global event listeners for this component.

    @private

    @returns {Coral.Component} this, chainable.
  */
  Coral.Component.prototype._undelegateGlobalEvents = function() {
    var i;
    if (this._globalEvents) {
      // Remove global event listeners
      for (i = 0; i < this._globalEvents.length; i++) {
        var event = this._globalEvents[i];
        Coral.events.off(event.eventName, event.selector, event.listener, event.isCapture);
      }
    }

    if (this._globalKeys) {
      // Remove global key listeners
      for (i = 0; i < this._globalKeys.length; i++) {
        var key = this._globalKeys[i];
        Coral.keys.off(key.keyCombo, key.selector, key.listener);
      }
    }
    
    if (this._keys) {
      this._keys.destroy(true);
    }

    return this;
  };

  /**
    Add global event listeners for this component.

    @private

    @returns {Coral.Component} this, chainable.
  */
  Coral.Component.prototype._delegateGlobalEvents = function() {
    var i;
    if (this._globalEvents) {
      // Add global event listeners
      for (i = 0; i < this._globalEvents.length; i++) {
        var event = this._globalEvents[i];
        Coral.events.on(event.eventName, event.selector, event.listener, event.isCapture);
      }
    }

    if (this._globalKeys) {
      // Add global key listeners
      for (i = 0; i < this._globalKeys.length; i++) {
        var key = this._globalKeys[i];
        Coral.keys.on(key.keyCombo, key.selector, key.listener);
      }
    }
    
    if (this._keys) {
      this._keys.init(true);
    }

    return this;
  };

  /**
    Add an event listener.

    @param {String} eventName
      The event name to listen for.
    @param {String} [selector]
      The selector to use for event delegation.
    @param {Function} func
      The function that will be called when the event is triggered.
    @param {Boolean} [useCapture=false]
      Whether or not to listen during the capturing or bubbling phase.

    @returns {Coral.Component} this, chainable.
  */
  Coral.Component.prototype.on = function(eventName, selector, func, useCapture) {
    this._vent.on(eventName, selector, func, useCapture);
    return this;
  };

  /**
    Remove an event listener.

    @param {String} eventName
      The event name to stop listening for.
    @param {String} [selector]
      The selector that was used for event delegation.
    @param {Function} func
      The function that was passed to <code>on()</code>.
    @param {Boolean} [useCapture]
      Only remove listeners with <code>useCapture</code> set to the value passed in.

    @returns {Coral.Component} this, chainable.
  */
  Coral.Component.prototype.off = function(eventName, selector, func, useCapture) {
    this._vent.off(eventName, selector, func, useCapture);
    return this;
  };

  /**
    Trigger an event.

    @param {String} eventName
      The event name to trigger.
    @param {Object} [props]
      Additional properties to make available to handlers as <code>event.detail</code>.
    @param {Boolean} [bubbles=true]
      Set to <code>false</code> to prevent the event from bubbling.
    @param {Boolean} [cancelable=true]
      Set to <code>false</code> to prevent the event from being cancelable.

    @returns {CustomEvent} CustomEvent object
  */
  Coral.Component.prototype.trigger = function(eventName, props, bubbles, cancelable) {
    // When 'bubbles' is not set, then default to true:
    bubbles = bubbles || bubbles === undefined;

    // When 'cancelable' is not set, then default to true:
    cancelable = cancelable || cancelable === undefined;

    // CustomEvent is polyfilled for IE via Polymer:
    // https://github.com/Polymer/CustomElements/blob/master/src/boot.js#L84-L93
    var event = new CustomEvent(eventName, {
      bubbles: bubbles,
      cancelable: cancelable,
      detail: props
    });

    // default value in case the dispatching fails
    var defaultPrevented = false;

    try {
      // leads to NS_ERROR_UNEXPECTED in Firefox
      // https://bugzilla.mozilla.org/show_bug.cgi?id=329509
      defaultPrevented = !this.dispatchEvent(event);
    } catch (e) {}

    // Check if the defaultPrevented status was correctly stored back to the event object
    if (defaultPrevented !== event.defaultPrevented) {
      // dispatchEvent() doesn't correctly set event.defaultPrevented in IE 9
      // However, it does return false if preventDefault() was called
      // Unfortunately, the returned event's defaultPrevented property is read-only
      // We need to work around this such that (patchedEvent instanceof Event) === true
      // First, we'll create an object that uses the event as its prototype
      // This gives us an object we can modify that is still technically an instanceof Event
      var patchedEvent = Object.create(event);

      // Next, we set the correct value for defaultPrevented on the new object
      // We cannot simply assign defaultPrevented, it causes a "Invalid Calling Object" error in IE 9
      // For some reason, defineProperty doesn't cause this
      Object.defineProperty(patchedEvent, 'defaultPrevented', {
        value: defaultPrevented
      });

      return patchedEvent;
    }

    return event;
  };

  /**
    Non-destructively remove this element. It can be re-added by simply appending it to the document again.
    It will be garbage collected if there are no more references to it.
  */
  Coral.Component.prototype.remove = function() {
    if (this.parentNode) {
      // Just remove the element from its parent. This will automatically invoke detachedCallback
      this.parentNode.removeChild(this);
    }
  };

  /**
    @ignore
    @private
  */
  Coral.Component.prototype._doSet = function(property, value, silent) {
    // Get property descriptor from constructor. Property descriptors are stored on constructor with methods
    // dereferenced to actual functions
    var descriptor = this._properties && this._properties[property];

    if (descriptor) {
      if (descriptor.contentZone && !(value instanceof HTMLElement) && this[property].set) {
        // If the property is a content zone and the passed value is not a HTML element,
        // assume we're setting multiple properties of the existing content zone with an object
        this[property].set(value);
      }
      // In case the Content Zone is not a Coral.Component, we still want to be able to set the new values into it
      else if (descriptor.contentZone && !(value instanceof HTMLElement) && typeof value === 'object' && this[property] instanceof HTMLElement) {
        Object.keys(value).forEach(function(prop) {
          this[prop] = value[prop];
        }, this[property]);
      }
      else if (descriptor._methods && descriptor._methods.set) {
        // Call and pass true silent
        // Use the actual setter method instead of the original method so events are triggered etc
        descriptor._methods.set.call(this, value, !!silent);
      }
      else {
        this[property] = value;
      }
    }
    else {
      // Simply set the property if it doesn't exist or has no setter
      this[property] = value;
    }
  };

  /**
    Set a single property.

    @name Coral.Component#set
    @function

    @param {String} property
      The name of the property to set.
    @param {*} value
      The value to set the property to.
    @param {Boolean} silent
      If true, events should not be triggered as a result of this set.

    @returns {Coral.Component} this, chainable.
  */

  /**
    Set multiple properties.

    @name Coral.Component#set
    @function

    @param {Object.<String, *>} properties
      An object of property/value pairs to set.
    @param {Boolean} silent
      If true, events should not be triggered as a result of this set.

    @returns {Coral.Component} this, chainable.
  */
  Coral.Component.prototype.set = function(propertyOrProperties, valueOrSilent, silent) {
    var property;
    var properties;
    var value;

    if (typeof propertyOrProperties === 'string') {
      // Set a single property
      property = propertyOrProperties;
      value = valueOrSilent;
      this._doSet(property, value, silent);
    }
    else {
      properties = propertyOrProperties;
      silent = valueOrSilent;

      // Set a map of properties
      for (property in properties) {
        value = properties[property];

        this._doSet(property, value, silent);
      }
    }

    return this;
  };

  /**
    Get the value of a property.

    @param {String} property
      The name of the property to fetch the value of.

    @returns {*} Property value.
  */
  Coral.Component.prototype.get = function(property) {
    return this[property];
  };

  /**
    Show this component.

    @returns {Coral.Component} this, chainable
  */
  Coral.Component.prototype.show = function() {
    if (!this.hidden) {
      return this;
    }

    this.hidden = false;
    return this;
  };

  /**
    Hide this component.

    @returns {Coral.Component} this, chainable
  */
  Coral.Component.prototype.hide = function() {
    if (this.hidden) {
      return this;
    }

    this.hidden = true;
    return this;
  };

  // Copy all methods for baseTagName-style inheritance
  Coral.Component.prototype._methods = {};
  for (var prop in Coral.Component.prototype) {
    if (Coral.Component.prototype.hasOwnProperty(prop)) {
      Coral.Component.prototype._methods[prop] = Coral.Component.prototype[prop];
    }
  }

  /**
    Whether this component is hidden or not.

    @name hidden
    @type {Boolean}
    @default false
    @htmlattribute hidden
    @htmlattributereflected
    @memberof Coral.Component#
  */

  /**
    Triggered when the component is attached to the DOM.

    @event Coral.Component#coral-component:attached
    @deprecated since 1.14.0, use <code>MutationObserver</code> instead.

    @param {Object} event
      Event object.
  */

  /**
    Triggered when the component is detached to the DOM.

    @event Coral.Component#coral-component:detached
    @deprecated since 1.14.0, use <code>MutationObserver</code> instead.

    @param {Object} event
      Event object.
  */

  /**
    Triggerred when the component has been upgraded and is ready for use.

    @event Coral.Component#coral-component:ready
    @deprecated since 1.9.0, use <code>Coral.commons.ready()</code> instead.

    @param {Object} event
      Event object.
  */
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  Coral.register( /** @lends Coral.Shell */ {
    /**
      @class Coral.Shell
      @classdesc The outer shell component
      @extends Coral.Component
      @htmltag coral-shell
    */
    name: 'Shell',
    tagName: 'coral-shell',
    className: 'coral3-Shell',

    properties: {
      /**
        The outer shell content zone.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Shell#
      */
      'content': Coral.property.contentZone({
        handle: 'content',
        tagName: 'coral-shell-content',
        defaultContentZone: true,
        insert: function(content) {
          this.appendChild(content);
        }
      })
    },

    /** @ignore */
    _render: function() {
      // we need to search for an existing content zone
      var content = this._elements.content = this.querySelector('coral-shell-content');

      // when the content zone was not created, we need to make sure that everyhing is added inside it as a content
      if (content === null) {
        var fragment = document.createDocumentFragment();

        // since it was not provided we need to create it
        content = this._elements.content = document.createElement('coral-shell-content');

        fragment.appendChild(content);

        // move the contents of the item into the content zone
        while (this.firstChild) {
          content.appendChild(this.firstChild);
        }

        this.appendChild(fragment);
      }
    }
  });
  
  /**
    @class Coral.Shell.Content
    @classdesc The Shell content
    @htmltag coral-shell-content
    @extends HTMLElement
  */
  Coral.Shell.Content = function() {
    return document.createElement('coral-shell-content');
  };
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    Regex used to remove the modifier classes. Size related classes are not matched this regex.

    @ignore
  */
  var ICON_REGEX = /[\s?]coral-Icon--(?!size(XXS|XS|S|M|L))\w+/g;

  /**
    Regex used to match URLs. Assume it's a URL if it has a slash, colon, or dot.

    @ignore
  */
  var URL_REGEX = /\/|:|\./g;

  /**
    Regex used to split camel case icon names into more screen-reader friendly alt text.

    @ignore
  */
  var SPLIT_CAMELCASE_REGEX = /([a-z0-9])([A-Z])/g;

  /**
    Icons can be rendered in different sizes. It follows the shirt sizing naming convention to help you remember them
    easily.

    @enum {String}
    @memberof Coral.Icon
  */
  var size = {
    /** Extra extra small size icon, typically 9px size. */
    EXTRA_EXTRA_SMALL: 'XXS',
    /** Extra small size icon, typically 12px size. */
    EXTRA_SMALL: 'XS',
    /** Small size icon, typically 18px size. This is the default size. */
    SMALL: 'S',
    /** Medium size icon, typically 24px size. */
    MEDIUM: 'M',
    /** Large icon, typically 36px size. */
    LARGE: 'L',
    /** Extra large icon, typically 48px size. */
    EXTRA_LARGE: 'XL',
    /** Extra extra large icon, typically 72px size. */
    EXTRA_EXTRA_LARGE: 'XXL'
  };

  // icon's base classname
  var CLASSNAME = 'coral-Icon';

  // builds an array containing all possible size classnames. this will be used to remove classnames when the size
  // changes
  var ALL_SIZE_CLASSES = [];
  for (var sizeValue in size) {
    ALL_SIZE_CLASSES.push(CLASSNAME + '--size' + size[sizeValue]);
  }

  Coral.register( /** @lends Coral.Icon# */ {
    /**
      @class Coral.Icon
      @classdesc An Icon component
      @extends Coral.Component
      @htmltag coral-icon
    */
    name: 'Icon',
    tagName: 'coral-icon',
    className: CLASSNAME,

    properties: {
      /**
        Icon name accordion to the CloudUI Icon sheet.

        @type {String}
        @default ""
        @htmlattribute icon
        @htmlattributereflected
        @memberof Coral.Icon#
      */
      'icon': {
        default: '',
        reflectAttribute: true,
        transform: function(value) {
          // we need to trim posible values because classList does not support trailing whitespaces
          return Coral.transform.string(value).trim();
        },
        sync: function() {
          // removes the old class.
          this.className = this.className.replace(ICON_REGEX, '').trim();

          // sets the desired icon
          if (this.icon) {
            // Detect if it's a URL
            if (this.icon.match(URL_REGEX)) {
              // Note that we're an image so we hide the font-related goodies
              this.classList.add('is-image');

              // Create an image and add it to the icon
              var img = this._elements.image = this._elements.image || document.createElement('img');
              img.className = this._className + '-image';
              img.src = this.icon;
              this.appendChild(img);
            }
            else {
              if (this._elements.image && this._elements.image.parentNode === this) {
                // Remove image related stuff
                this.removeChild(this._elements.image);
                this.classList.remove('is-image');
              }
              this.classList.add(this._className + '--' + this._icon);
            }
          }
        },
        alsoSync: 'alt'
      },

      /**
        Size of the icon. It accepts both lower and upper case sizes.

        @type {Coral.Icon.size}
        @default Coral.Icon.size.SMALL
        @htmlattribute size
        @htmlattributereflected
        @memberof Coral.Icon#
      */
      'size': {
        default: size.SMALL,
        reflectAttribute: true,
        transform: function(value) {
          return typeof value === 'string' ? value.toUpperCase() : value;
        },
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(size)
        ],
        sync: function() {
          // removes all the existing sizes
          this.classList.remove.apply(this.classList, ALL_SIZE_CLASSES);
          // adds the new size
          this.classList.add(this._className + '--size' + this.size);
        }
      },

      /**
        Alternative text to identify the icon for accessibility.
        <p>When no <code>alt</code> attribute is provided, the icon will fallback to using either the <code>title</code> attribute or icon name as alternative text for accessibility. However, by explicitly setting the <code>alt</code> attribute to an empty string in markup or by using the <code>setAttribute</code> method, one can override the default behavior to avoid redundancy or to indicate that the icon is purely decorative in elements like labelled icon buttons.</p>

        @type {String}
        @htmlattribute alt
        @htmlattributereflected
        @memberof Coral.Icon#
      */
      'alt': {
        reflectAttribute: true,
        transform: Coral.transform.string,
        get: function() {
          return this._alt || '';
        },
        sync: function() {
          this._updateAltText();
        }
      }
    },

    /**
      Updates the aria-label or img alt attribute depending on value of alt, title or icon.
      @protected
    */
    _updateAltText: function() {
      var isImage = this.classList.contains('is-image');

      // If alt has explicitly been set to null, remove all attributes
      if (!this._alt) {
        this.removeAttribute('aria-label');
        if (isImage) {
          this._elements.image.setAttribute('alt', '');
        }
      }

      // Fall back to the title attribute, then the icon name
      var altText = !!this._alt || this.hasAttribute('alt') ? this.alt : this.getAttribute('title') || (isImage ? '' : this.icon.replace(SPLIT_CAMELCASE_REGEX, '$1 $2').toLowerCase());

      // If no other role has been set, provide the appropriate
      // role depending on whether or not the icon is an arbitrary image URL.
      var role = this.getAttribute('role');
      var roleOverride = (role && (role !== 'presentation' && role !== 'img'));
      if (!roleOverride) {
        this.setAttribute('role', isImage ? 'presentation' : 'img');
      }

      // Set accessibility attributes accordingly
      if (isImage) {
        this.removeAttribute('aria-label');
        this._elements.image.setAttribute('alt', altText);
      }
      else if (altText === '') {
        this.removeAttribute('aria-label');
        if (!roleOverride) {
          this.removeAttribute('role');
        }
      }
      else {
        this.setAttribute('aria-label', altText);
      }
    },

    /** @ignore */
    _initialize: function() {
      this._queueSync();
    },

    /** @ignore */
    attributeChangedCallback: function(attrName, oldValue, newValue) {
      attrName = attrName.toLowerCase();
      if (attrName === 'title') {
        this._updateAltText();
        return;
      }

      // Call top level attributeChangedCallback, which sets internal property values
      Coral.Component.prototype.attributeChangedCallback.apply(this, arguments);

      // In cases where the alt attribute has been removed or set to an empty string,
      // for example, when the alt property is undefined and we add the attribute alt=''
      // to explicitly override the default behavior, or when we remove an alt attribute
      // thus restoring the default behavior, we make sure to update the alt text.
      if (attrName === 'alt' && (newValue === null || (oldValue === null && newValue === ''))) {
        this._updateAltText();
      }
    }
  });

  // exports the sizes enumeration
  Coral.Icon.size = size;
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    Enum for button variant values.

    @enum {String}
    @memberof Coral.Button
  */
  var variant = {
    /** A button that is meant to grab the user's attention. */
    CTA: 'cta',
    /** A button that indicates that the button's action is the primary action. */
    PRIMARY: 'primary',
    /** A default, gray button */
    SECONDARY: 'secondary',
    /** An alias to secondary, included for backwards compatibility. */
    DEFAULT: 'secondary',
    /** A button with no border or background. */
    QUIET: 'quiet',
    /** A button that indicates that the button's action is dangerous. */
    WARNING: 'warning',
    /** A minimal button with no background or border. */
    MINIMAL: 'minimal'
  };

  // the button's base classname
  var CLASSNAME = 'coral-Button';

  // builds an array containing all possible variant classnames. this will be used to remove classnames when the variant
  // changes
  var ALL_VARIANT_CLASSES = [];
  for (var variantValue in variant) {
    ALL_VARIANT_CLASSES.push(CLASSNAME + '--' + variant[variantValue]);
  }

  /**
    Enumeration representing button sizes.

    @memberof Coral.Button
    @enum {String}
  */
  var size = {
    /** A medium button is the default, normal sized button. */
    MEDIUM: 'M',
    /** A large button, which is larger than a medium button. */
    LARGE: 'L'
  };

  /**
    Enumeration representing the icon position inside the button.

    @memberof Coral.Button
    @enum {String}
  */
  var iconPosition = {
    /** Position should be right of the button label. */
    RIGHT: 'right',
    /** Position should be left of the button label. */
    LEFT: 'left'
  };

  Coral.register( /** @lends Coral.Button# */ {
    /**
      @class Coral.Button
      @classdesc A Button component
      @htmltag coral-button
      @htmlbasetag button
      @extends Coral.Component
      @extends HTMLButtonElement
    */
    name: 'Button',
    tagName: 'coral-button',
    baseTagName: 'button',
    extend: HTMLButtonElement,
    className: CLASSNAME,

    events: {
      'mousedown': '_onMouseDown'
    },

    properties: {
      /**
        The label of the button.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Button#
      */
      'label': Coral.property.contentZone({
        handle: 'label',
        tagName: 'coral-button-label',
        defaultContentZone: true,
        insert: function(label) {
          this.appendChild(label);
        }
      }),

      /**
        Position of the icon relative to the label. If no <code>iconPosition</code> is provided, it will be set on the
        left side by default.

        @type {Coral.Button.iconPosition}
        @default Coral.Button.iconPosition.LEFT
        @htmlattribute iconposition
        @htmlattributereflected
        @memberof Coral.Button#
      */
      'iconPosition': {
        attribute: 'iconposition',
        reflectAttribute: true,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(iconPosition)
        ],
        transform: function(value) {
          // defaults the icon positon to LEFT in case the attribute is removed or null is set
          return value !== null ? value : iconPosition.LEFT;
        },
        get: function() {
          // if the value is not explicitely set, we assume that it is LEFT
          return typeof this._iconPosition === 'undefined' ? iconPosition.LEFT : this._iconPosition;
        },
        set: function(value) {
          this._iconPosition = value;

          if (this.icon) {
            this._updateIcon(this.icon);
          }
        }
      },

      /**
        Specifies the icon name used inside the button. See {@link Coral.Icon} for valid icon names.

        @type {String}
        @default ""
        @htmlattribute icon
        @memberof Coral.Button#

        @see {@link Coral.Icon}
      */
      'icon': {
        get: function() {
          var iconElement = this._elements.icon;
          return iconElement ? iconElement.icon : '';
        },
        set: function(value) {
          this._updateIcon(value);
        }
      },

      /**
        Size of the icon. It accepts both lower and upper case sizes.

        @type {Coral.Icon.size}
        @default Coral.Icon.size.SMALL
        @htmlattribute iconsize
        @memberof Coral.Button#

        @see {@link Coral.Icon#size}
      */
      'iconSize': {
        attribute: 'iconsize',
        get: function() {
          var iconElement = this._elements.icon;
          return iconElement ? iconElement.size : Coral.Icon.size.SMALL;
        },
        set: function(value) {
          this._getIconElement().size = value;
        }
      },

      /**
        The size of the button. It accepts both lower and upper case sizes. Currently only "M" (the default) and "L"
        are available.

        @type {Coral.Button.size}
        @default Coral.Button.size.MEDIUM
        @htmlattribute size
        @htmlattributereflected
        @memberof Coral.Button#
      */
      'size': {
        default: size.MEDIUM,
        reflectAttribute: true,
        transform: function(value) {
          return typeof value === 'string' ? value.toUpperCase() : value;
        },
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(size)
        ],
        set: function(newSize) {
          this._size = newSize;

          this.classList.toggle(CLASSNAME + '--large', this.size === size.LARGE);
        }
      },

      /**
        Whether the button is selected.

        @type {Boolean}
        @default false
        @htmlattribute selected
        @htmlattributereflected
        @memberof Coral.Button#
      */
      'selected': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        set: function(selected) {
          this._selected = selected;

          this.classList.toggle('is-selected', this.selected);
        }
      },

      /**
        Expands the button to the full width of the parent.

        @type {Boolean}
        @default false
        @htmlattribute block
        @htmlattributereflected
        @memberof Coral.Button#
      */
      'block': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        set: function(block) {
          this._block = block;

          this.classList.toggle(this._className + '--block', this.block);
        }
      },

      /**
        The button's variant.

        @type {Coral.Button.variant}
        @default Coral.Button.variant.SECONDARY
        @htmlattribute variant
        @htmlattributereflected
        @memberof Coral.Button#
      */
      'variant': {
        default: variant.SECONDARY,
        reflectAttribute: true,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(variant)
        ],
        set: function(variant) {
          this._variant = variant;

          // removes every existing variant
          this.classList.remove.apply(this.classList, ALL_VARIANT_CLASSES);

          this.classList.add(this._className + '--' + this.variant);
        }
      }
    },

    /** @ignore */
    _updateIcon: function(value) {
      var iconElement = this._getIconElement();
      iconElement.icon = value;

      // removes the icon element from the DOM.
      if (this.icon === '') {
        iconElement.remove();
      }
      // add or adjust the icon. Add it back since it was blown away by textContent
      else if (!iconElement.parentNode || this._iconPosition) {
        // insertBefore with <code>null</code> appends
        this.insertBefore(iconElement, this.iconPosition === iconPosition.LEFT ? this.firstChild : null);
      }

      // makes sure the button is correctly annotated
      this._makeAccessible();
    },

    /**
      Forces button to receive focus on mousedown
      @param {MouseEvent} event mousedown event
      @ignore
    */
    _onMouseDown: function(event) {
      var target = event.matchedTarget;

      // Wait a frame or button won't receive focus in Safari.
      Coral.commons.nextFrame(function() {
        if (target !== document.activeElement) {
          target.focus();
        }
      });
    },

    /**
      Sets the correct accessibility annotations on the icon element.

      @protected
    */
    _makeAccessible: function() {
      var hasLabel = this.label.textContent.length > 0;

      // when the button has a icon, we need to make sure it is labelled correctly
      if (this.icon !== '') {
        // in case there is a label, we set alt='' to treat the icon as decorative. if this is not the case, we remove
        // the alt which causes the icon to provide its default behavior
        this._elements.icon[hasLabel ? 'setAttribute' : 'removeAttribute']('alt', '');
      }
    },

    /** @ignore */
    _initialize: function() {
      // Listen for mutations
      this._observer = new MutationObserver(this._makeAccessible.bind(this));

      // Watch for changes to the label element
      this._observer.observe(this.label, {
        childList: true, // Catch changes to childList
        characterData: true, // Catch changes to textContent
        subtree: true // Monitor any child node
      });
    },

    /** @ignore */
    _getIconElement: function() {
      if (!this._elements.icon) {
        this._elements.icon = document.createElement('coral-icon');
      }
      return this._elements.icon;
    },

    /** @ignore */
    _render: function() {
      // Create a temporary fragment
      var fragment = document.createDocumentFragment();

      // Create or fetch the label element.
      var label = this.querySelector('coral-button-label') || document.createElement('coral-button-label');

      // Remove it so we can process children
      if (label.parentNode) {
        this.removeChild(label);
      }

      // Process remaining elements as necessary
      while (this.firstChild) {
        var child = this.firstChild;

        if (child.tagName === 'CORAL-ICON') {
          // Conserve existing icon element to content
          this._elements.icon = child;
          fragment.appendChild(child);
        }
        else {
          // Move anything else into the label
          label.appendChild(child);
        }
      }

      // Add the frag to the component
      this.appendChild(fragment);

      // Assign the content zones, moving them into place in the process
      this.label = label;
    }
  });

  /**
    @class Coral.Button.Label
    @classdesc The Button label content
    @htmltag coral-button-label
    @extends HTMLElement
  */
  Coral.Button.Label = function() {
    return document.createElement('coral-button-label');
  };

  // exports the variants enumeration
  Coral.Button.variant = variant;
  Coral.Button.size = size;
  Coral.Button.iconPosition = iconPosition;
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  Coral.register( /** @lends Coral.Shell.Header */ {
    /**
      @class Coral.Shell.Header
      @classdesc The shell header component
      @extends Coral.Component
      @htmltag coral-shell-header
    */
    name: 'Shell.Header',
    tagName: 'coral-shell-header',
    className: 'coral3-Shell-header',

    events: {
      'global:coral-overlay:beforeopen': '_handleMenuBeforeOpenOrClose',
      'global:coral-overlay:beforeclose': '_handleMenuBeforeOpenOrClose'
    },

    properties: {
      /**
        The label of the panel.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Shell.Header#
      */
      'home': Coral.property.contentZone({
        handle: 'home',
        tagName: 'coral-shell-header-home',
        insert: function(content) {
          // a11y
          this._enableHomeAccessibility(content);
          this.appendChild(content);
        }
      }),

      /**
        The main content zone of the panel.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Shell.Header#
      */
      'content': Coral.property.contentZone({
        handle: 'content',
        tagName: 'coral-shell-header-content',
        defaultContentZone: true,
        insert: function(content) {
          this.appendChild(content);
        }
      }),

      /**
        The content zone where the actions are placed.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Shell.Header#
      */
      'actions': Coral.property.contentZone({
        handle: 'actions',
        tagName: 'coral-shell-header-actions',
        insert: function(content) {
          this.appendChild(content);
        }
      })
    },

    /**
      Just before a menu is open or closed, we check that the zIndex of the Header is correct so that it animates
      below the header.

      @ignore
    */
    _handleMenuBeforeOpenOrClose: function(event) {
      var target = event.target;

      // header only changes zIndex due to menus
      if (target.tagName === 'CORAL-SHELL-MENU') {
        var self = this;
        // we need one frame to make sure the zIndex is already set
        Coral.commons.nextFrame(function() {
          self.style.zIndex = parseInt(target.style.zIndex, 10) + 100;
        });
      }
    },
    
    /** @private */
    _enableHomeAccessibility: function(home) {
      home.setAttribute('role', 'heading');
      home.setAttribute('aria-level', '2');
    },
    
    /** @ignore */
    _render: function() {
      var fragment = document.createDocumentFragment();

      // fetches or creates the sub-elements
      var home = this._elements.home = this.querySelector('coral-shell-header-home') ||
        document.createElement('coral-shell-header-home');
      var actions = this._elements.actions = this.querySelector('coral-shell-header-actions') ||
        document.createElement('coral-shell-header-actions');
      var content = this._elements.content = this.querySelector('coral-shell-header-content') ||
        document.createElement('coral-shell-header-content');

      // a11y
      this._enableHomeAccessibility(home);
      
      fragment.appendChild(home);
      fragment.appendChild(actions);
      fragment.appendChild(content);

      // moves everything to the main content zone
      while (this.firstChild) {
        content.appendChild(this.firstChild);
      }

      this.appendChild(fragment);
    },

    /** @ignore */
    _initialize: function() {
      // appheader only exists on dark theme
      this.classList.add('coral--dark');
    }
  });
  
  /**
    @class Coral.Shell.Header.Home
    @classdesc The Shell Header home
    @htmltag coral-shell-header-home
    @extends HTMLElement
  */
  Coral.Shell.Header.Home = function() {
    return document.createElement('coral-shell-header-home');
  };
  
  /**
    @class Coral.Shell.Header.Actions
    @classdesc The Shell Header actions
    @htmltag coral-shell-header-actions
    @extends HTMLElement
  */
  Coral.Shell.Header.Actions = function() {
    return document.createElement('coral-shell-header-actions');
  };
  
  /**
    @class Coral.Shell.Header.Content
    @classdesc The Shell Header content
    @htmltag coral-shell-header-content
    @extends HTMLElement
  */
  Coral.Shell.Header.Content = function() {
    return document.createElement('coral-shell-header-content');
  };
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  Coral.register( /** @lends Coral.Shell.HomeAnchor */ {
    /**
      @class Coral.Shell.HomeAnchor
      @classdesc The home anchor button for the shell
      @extends HTMLAnchorElement
      @htmltag coral-shell-homeanchor
    */
    name: 'Shell.HomeAnchor',
    tagName: 'coral-shell-homeanchor',
    baseTagName: 'a',
    extend: HTMLAnchorElement,
    className: 'coral3-Shell-homeAnchor',

    properties: {
      /**
        The label of the anchor.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Shell.HomeAnchor#
      */
      'label': Coral.property.contentZone({
        handle: 'label',
        tagName: 'coral-shell-homeanchor-label',
        defaultContentZone: true,
        insert: function(content) {
          this.appendChild(content);
        }
      }),

      /**
        Specifies the icon name used in the anchor. See {@link Coral.Icon} for valid icon names.

        @type {String}
        @default ""
        @htmlattribute icon
        @memberof Coral.Shell.HomeAnchor#
      */
      'icon': {
        get: function() {
          return this._elements.icon.icon;
        },
        set: function(value) {
          this._elements.icon.icon = value;
        },
        sync: function() {
          // removes the icon element from the DOM.
          if (this.icon === '') {
            this._elements.icon.remove();
          }
          // adds the icon back since it was blown away by textContent
          else if (!this._elements.icon.parentNode) {
            this.insertBefore(this._elements.icon, this.firstChild);
          }
        }
      }
    },

    /** @ignore */
    _render: function() {
      var fragment = document.createDocumentFragment();

      // Label
      var label = this._elements.label = this.querySelector('coral-shell-homeanchor-label') ||
        document.createElement('coral-shell-homeanchor-label');

      // Move any remaining elements into the label
      while (this.firstChild) {
        var child = this.firstChild;

        if (child.nodeType === Node.TEXT_NODE) {
          // Move text elements to the label
          label.appendChild(child);
        }
        else if (child.tagName === 'CORAL-ICON') {
          // Conserve existing icon element to content
          this._elements.icon = child;
          fragment.appendChild(child);
        }
        else {
          // Remove anything else
          this.removeChild(child);
        }
      }

      if (!this._elements.icon) {
        // creates the icon. it is not added to the DOM
        this._elements.icon = document.createElement('coral-icon');
        // all icons are medium by default
        this._elements.icon.size = Coral.Icon.size.MEDIUM;
        // add className, that is owned by this component
        this._elements.icon.className += ' coral3-Shell-homeAnchor-icon';
      }

      fragment.appendChild(label);
      this.appendChild(fragment);
    }
  });

  /**
    @class Coral.Shell.HomeAnchor.Label
    @classdesc The Shell HomeAnchor label content
    @htmltag coral-shell-homeanchor-label
    @extends HTMLElement
  */
  Coral.Shell.HomeAnchor.Label = function() {
    return document.createElement('coral-shell-homeanchor-label');
  };
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
     Unique id used to idenfity the collection.

     @private
   */
  var nextID = 0;

  /**
     Attribute used to identify the items of a collection.

     @private
   */
  var COLLECTION_ID = 'coral-collection-id-';

  /**
    Selector used to determine if nested items should be allowed.

    @private
  */
  var SCOPE_SELECTOR = ':scope > ';

  /** @private */
  function getTagSelector(tag, nativeTag) {
    return nativeTag ? (nativeTag + '[is="' + tag + '"]') : tag;
  }

  /** @private */
  function listToArray(list) {
    for (var res = [], i = 0, listCount = res.length = list.length; i < listCount; i++) {
      res[i] = list[i];
    }
    return res;
  }

  /**
    Helper function used to determine if the item should be filtered. If the filter is <code>undefined</code>, then the
    item will pass the filter.

    @param {HTMLElement} item
      The item that should be filtered.
    @param {Function} filter
      Function used to filter the item

    @returns {Boolean} true if the item passes the filter, otherwise false.

    @private
  */
  function filterItem(item, filter) {
    return typeof filter !== 'function' || filter(item);
  }

  /**
    The Collection API as used as an interface to manipulate item collections within the components.

    @param {HTMLElement} options.host
      The element that hosts the collection.
    @param {String} options.itemTagName
      The tag name of the elements that constitute a collection item.
    @param {String} options.itemBaseTagName
      The optional base tag name of the elements that constitute a collection item. This is required for elements that
      extend native elements, like Button.
    @param {String} [options.itemSelector]
      Optional, derived from itemTagName and itemBaseTagName by default. Used to query the host element for its
      collection items.
    @param {HTMLElement} [options.container]
      Optional element that wraps the collection. Defines where the new items will be added when <code>add</code> method
      is called. Is the same as options.host by default.
    @param {Coral.Collection~filter} [options.filter]
      Optional function used to filter the results.
    @param {Coral.Collection~onItemAdded} [options.onItemAdded]
      Function called once an item is added to the DOM. If the Collection has been configured to handle the items
      automatically, the callback will be called once the collection detects that the item has been added to the DOM and
      not synchronously with <code>add()</code>.
    @param {Coral.Collection~onItemRemoved} [options.onItemRemoved]
      Function called once an item is removed from the DOM. If the Collection has been configured to handle the items
      automatically, the callback will be called once the collection detects that the item has been removed from the DOM
      not synchronously with <code>add()</code>.
    @param {Coral.Collection~onCollectionChange} [options.onCollectionChange]
      Function called after there has been a change in the collection. This allows components to handle state changes
      after an item(s) has been added or removed. This callback will only be called if the Collection is configured to
      handle the items automatically.
      is <code>true</code>.

    @interface
  */
  Coral.Collection = function(options) {
    options = options || {};

    // we create an unique collection identifier
    this._id = nextID++;

    this._host = options.host;
    this._itemTagName = options.itemTagName;
    this._itemBaseTagName = options.itemBaseTagName;
    this._itemSelector = options.itemSelector || getTagSelector(this._itemTagName, this._itemBaseTagName);

    // the container where the new items are added
    this._container = options.container || this._host;
    this._filter = options.filter;

    // internal variable to determine if collection events will be handled internally
    this._handleItems = false;

    // we provide support for the :scope selector and swap it for an id
    if (this._itemSelector && this._itemSelector.indexOf(SCOPE_SELECTOR) === 0) {
      this._container.id = this._container.id || (COLLECTION_ID + this._id);
      // we create a special selector to make sure that the items are direct children of the container. given that
      // :scope is not fully supported by all browsers, we use an id to query
      this._allItemsSelector = this._itemSelector.replace(SCOPE_SELECTOR, '#' + this._container.id + ' > ');

      // we remove the :scope from the selector to be able to use it to determine if the item matches the collection
      this._itemSelector = this._itemSelector.replace(SCOPE_SELECTOR, '');
      // in case they match, we enable this optimization
      if (this._itemSelector === this._itemTagName) {
        this._useItemTagName = this._itemSelector.toUpperCase();
      }
    }
    // live collections are not supported when nested items is used
    else {
      this._allItemsSelector = this._itemSelector;

      // live collections can only be used when a tagname is used to query the items
      if (this._container && this._allItemsSelector === this._itemTagName) {
        this._liveCollection = true;
        this._useItemTagName = this._allItemsSelector.toUpperCase();
      }
    }

    this._onItemAdded = options.onItemAdded;
    this._onItemRemoved = options.onItemRemoved;
    this._onCollectionChange = options.onCollectionChange;
  };

  var properties = {
    /**
      Number of items inside the Collection.

      @type {Number}
      @default 0
      @memberof Coral.Collection#
    */
    'length': {
      get: function() {
        return this.getAll().length;
      }
    }
  };

  Coral.Collection.prototype = Object.create(Object.prototype, properties);
  Coral.Collection.prototype._properties = properties;

  /**
    Adds an item to the Collection. The item can be either a <code>HTMLElement</code> or an Object with the item
    properties. If the index is not provided the element appended to the end. If <code>options.onItemAdded</code> was
    provided, it will be called after the element is added from the DOM.

    @param {HTMLElement|Object} item
      The item to add to the Collection.
    @param {HTMLElement} [insertBefore]
      Existing item used as a reference to insert the new item before. If the value is <code>null</code>, then the new
      item will be added at the end.

    @fires Coral.Collection#coral-collection:add

    @returns {HTMLElement} the item added.
   */
  Coral.Collection.prototype.add = function(item, insertBefore) {
    // container and itemtagname are the minimum options that need to be provided to automatically handle this function
    if (this._container && this._itemTagName) {
      if (!(item instanceof HTMLElement)) {
        // creates an instance of an item from the object
        if (this._itemBaseTagName) {
          item = document.createElement(this._itemBaseTagName, this._itemTagName).set(item, true);
        }
        else {
          item = document.createElement(this._itemTagName).set(item, true);
        }
      }

      // inserts the element in the specified container
      this._container.insertBefore(item, insertBefore || null);

      // when items are handled automatically there is no need to call this immediatelly
      if (!this._handleItems && typeof this._onItemAdded === 'function' && this._host && filterItem(item, this._filter)) {
        this._onItemAdded.call(this._host, item);
      }

      return item;
    }

    throw new Error('Please provide host and itemTagName or override add() to provide your own implementation.');
  };

  /**
    Removes all the items from the Collection.

    @returns {Array.<HTMLElement>} an Array with all the removed items.
   */
  Coral.Collection.prototype.clear = function() {
    var items = this.getAll();

    var removed = [];

    for (var i = items.length - 1; i > -1; i--) {
      removed.push(this.remove(items[i]));
    }

    return removed;
  };

  /**
    Returns an array with all the items inside the Collection. Each element is of type <code>HTMLElement</code>.

    @returns {Array.<HTMLElement>} an Array with all the items inside the collection.
   */
  Coral.Collection.prototype.getAll = function() {
    // in order to perform the automatic getAll query, the _host and _allItemsSelector must be provided
    if (this._container && this._allItemsSelector) {
      var items = this._liveCollection ?
        // instead of querying the DOM, we just convert the live collection to an array, this way we obtain a
        // "snapshot" of the DOM
        listToArray(this._container.getElementsByTagName(this._allItemsSelector)) :
        listToArray(this._container.querySelectorAll(this._allItemsSelector));

      if (this._filter) {
        items = items.filter(this._filter);
      }

      return items;
    }

    throw new Error('Please provide host and itemTagName or override getAll() to provide your own implementation.');
  };

  /**
    Removes the given item from the Collection. If <code>options.onItemRemoved</code> was provided, it will be called
    after the element is removed from the DOM.

    @param {HTMLElement} item
      The item to add to the Collection.

    @fires Coral.Collection#coral-collection:remove

    @returns {HTMLElement} the item removed.
   */
  Coral.Collection.prototype.remove = function(item) {
    if (item.parentNode) {
      item.parentNode.removeChild(item);

      // when items are handled automatically there is no need to call this immediatelly
      if (!this._handleItems && typeof this._onItemRemoved === 'function' && this._host && filterItem(item, this._filter)) {
        this._onItemRemoved.call(this._host, item);
      }
    }

    return item;
  };

  /**
    Returns the first item of the collection.

    @returns {?HTMLElement} the first item of the collection.
  */
  Coral.Collection.prototype.first = function() {
    // Use getAll() so filter() is applied
    return this.getAll()[0] || null;
  };

  /**
    Returns the last item of the collection.

    @returns {?HTMLElement} the last item of the collection.
  */
  Coral.Collection.prototype.last = function() {
    // Use getAll() so filter() is applied
    var all = this.getAll();
    return all[all.length - 1] || null;
  };

  /**
    Checks if the given Node belongs to the current collection. It is said that a Node belongs to a given collection
    if it passes <code>options.filter</code> and it matches <code>options.itemSelector</code>. Text nodes cannot be
    part of a collection.

    @param {Node} node
      The node to check if it belongs to the collection.

    @returns {Boolean} true if the node is part of the collection, otherwise false.

    @protected
  */
  Coral.Collection.prototype._isPartOfCollection = function(node) {
    // we exclude Text nodes as they cannot be part of the collection. Text nodes do not implement matches and tagName
    return !(node instanceof Text) &&
      filterItem(node, this._filter) &&
      // this is an optimization to avoid using matches
      (this._useItemTagName ? this._useItemTagName === node.tagName : node.matches(this._itemSelector));
  };

  /**
    Handles the attachment of an item to the collection. It triggers automatically the collection event.

    @param {HTMLElement} item
      The item that was attached to the collection.

    @fires Coral.Collection#coral-collection:add

    @protected
  */
  Coral.Collection.prototype._onItemAttached = function(item) {
    // if options.onItemAdded was provided, we call the function
    if (typeof this._onItemAdded === 'function') {
      this._onItemAdded.call(this._host, item);
    }

    // the usage of trigger assumes that the host is a coral component
    this._host.trigger('coral-collection:add', {
      item: item
    });
  };

  /**
    Handles the detachment of a item to the collection. It triggers automatically the collection event.

    @param {HTMLElement} item
      The item that was detached of the collection

    @fires Coral.Collection#coral-collection:remove

    @protected
  */
  Coral.Collection.prototype._onItemDetached = function(item) {
    // if options.onItemRemoved was provided, we call the function
    if (typeof this._onItemRemoved === 'function') {
      this._onItemRemoved.call(this._host, item);
    }

    // the usage of trigger assumes that the host is a coral component
    this._host.trigger('coral-collection:remove', {
      item: item
    });
  };

  /**
    Enables the automatic detection of collection items. The collection will take care of triggering the appropiate
    collection event when an item is added or removed, as well the related callbacks. Components can decide to skip the
    initialization of the starting items by providing <code>skipInitialItems</code> as <code>false</code>.

    @param {Boolean} [skipInitialItems=false]
      If <code>true</code>, <code>onItemAdded</code> will be called for every starting item. A collection event will not
      be triggered for these items.

    @protected
  */
  Coral.Collection.prototype._startHandlingItems = function(skipInitialItems) {
    if (this._host && this._container) {
      // we reuse the observer if it already exists, this way we do not need to disconnect it if this function is called
      // again
      this._observer = this._observer || new MutationObserver(this._handleMutation.bind(this));

      // this changes the way that _onItemAdded and _onItemRemoved behave, since they well be delayed until a mutation
      // detects them
      this._handleItems = true;

      // we need to wait for the container to be ready to be sure that host component is ready to handle the items
      Coral.commons.ready(this._container, function() {

        this._observer.observe(this._container, {
          // we only need to observe for items that were added and removed, no need to check attributes and contents
          childList: true,
          // we need to listen to subtree mutations as items may not be direct children
          subtree: true
        });

        // by default we handle the initial items unless otherwise indicated
        if (skipInitialItems !== true) {
          // since we are handling the items for the component, we need to make sure the _onItemAdded is called for the
          // initial items. collection events will not be triggered for these items as they represent the initial state
          var items;
          var itemCount = 0;

          if (typeof this._onItemAdded === 'function' || typeof this._onCollectionChange === 'function') {
            items = this.getAll();
            itemCount = items.length;
          }

          if (typeof this._onItemAdded === 'function') {
            for (var i = 0; i < itemCount; i++) {
              this._onItemAdded.call(this._host, items[i]);
            }
          }

          // we only call the _onCollectionChange callback if there are items inside the collection
          if (itemCount > 0 && typeof this._onCollectionChange === 'function') {
            this._onCollectionChange.call(this._host, items, []);
          }
        }
      }.bind(this));
    }
    else {
      throw new Error('Please provide options.host and/or options.container to enable handling the items.');
    }
  };

  /**
    Stops handling the items.

    @protected
  */
  Coral.Collection.prototype._stopHandlingItems = function() {
    if (this._observer) {
      this._observer.disconnect();
    }
  };

  /**
    Handles every time that an element is added or removed from the <code>options.container</code>. By default the
    collection events will be triggered. If <code>options.onItemAdded</code> or <code>options.onItemRemoved</code> were
    provided, they will be called where it applies.

    @param Array.<Object> mutations
      Array that contains the <code>MutationRecord> relevant to every registered mutation.

    @protected
  */
  Coral.Collection.prototype._handleMutation = function(mutations) {
    var mutation;
    var mutationsCount = mutations.length;
    var item;
    var addedNodes;
    var addedNodesCount;
    var removedNodes;
    var removedNodesCount;
    var validAddedNodes = [];
    var validRemovedNodes = [];

    // we need to count every addition and removal to notify the component that the collection changed
    var itemChanges = 0;
    for (var i = 0; i < mutationsCount; i++) {
      mutation = mutations[i];

      addedNodes = mutation.addedNodes;
      addedNodesCount = addedNodes.length;
      for (var j = 0; j < addedNodesCount; j++) {
        item = addedNodes[j];

        // filters the item
        if (this._isPartOfCollection(item)) {
          itemChanges++;
          validAddedNodes.push(item);
          this._onItemAttached(item);
        }
      }

      removedNodes = mutation.removedNodes;
      removedNodesCount = removedNodes.length;
      for (var k = 0; k < removedNodesCount; k++) {
        item = removedNodes[k];

        // filters the item
        if (this._isPartOfCollection(item)) {
          itemChanges++;
          validRemovedNodes.push(item);
          this._onItemDetached(item);
        }
      }
    }

    // if changes were done to the collection we need to notify the component. we do this after all the mutations were
    // processed to make sure we only do it once
    if (itemChanges !== 0 && typeof this._onCollectionChange === 'function' && this._host) {
      this._onCollectionChange.call(this._host, validAddedNodes, validRemovedNodes);
    }
  };

  /**
    Triggered when an item is added to the Collection. Collection events are not synchronous so the DOM may reflect
    a different reality although every addition or removal will be reported.

    @event Coral.Collection#coral-collection:add

    @param {Object} event
      Event object.
    @param {HTMLElement} event.detail.item
      The item that was added.
  */

  /**
    Triggered when an item is removed from a Collection. Collection events are not synchronous so the DOM may reflect
    a different reality although every addition or removal will be reported.

    @event Coral.Collection#coral-collection:remove

    @param {Object} event
      Event object.
    @param {HTMLElement} event.detail.item
      The item that was removed.
  */

  /**
    Signature of the function called to determine if an element should be included in the collection. If the function
    returns <code>true</code> for the given element it will be part of the collection, otherwise it will be excluded.

    @callback Coral.Collection~filter

    @param {HTMLElement} element
      The item to check whether it should be part of the collection.

    @returns {Boolean} true if should be part of the collection, otherwise false.
  */

  /**
    Signature of the function called when ever an item is added to the collection.

    @callback Coral.Collection~onItemAdded

    @param {HTMLElement} item
      The item that was added to the collection.
  */

  /**
    Signature of the function called when ever an item is removed from the collection.

    @callback Coral.Collection~onItemRemoved

    @param {HTMLElement} item
      The item that was added to the collection.
  */

  /**
    Signature of the function called when there is a change in the collection. The items that where added and removed
    will be provided.

    @callback Coral.Collection~onCollectionChange

    @param {Array.<HTMLElement>} addedNodes
      An array that contains the items that were added to the collection.
    @param {Array.<HTMLElement>} removedNodes
      An array that contains the items that were removed from the collection.
  */
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /** @private */
  function listToArray(list) {
    for (var res = [], i = 0, listCount = res.length = list.length; i < listCount; i++) {
      res[i] = list[i];
    }
    return res;
  }

  /**
    Private Collection capable of handling non-nested items with a selected attribute. It is useful to manage the
    internal state of selection. It currently does not support options.filter for the selection related functions.

    @extends Coral.Collection
    @protected
  */
  Coral.SelectableCollection = function(options) {
    // calls the 'super' constructor
    Coral.Collection.apply(this, arguments);

    if (this._filter) {
      console.warn('Coral.SelectableCollection does not support the options.filter');
    }

    // disabled items will not be a selection candicate although hidden items might
    this._selectableItemSelector = this._itemSelector + ':not([disabled])';
    this._selectedItemSelector = this._itemSelector + '[selected]';
    this._deselectAllExceptSelector = this._selectedItemSelector;
  };

  Coral.SelectableCollection.prototype = Object.create(Coral.Collection.prototype);

  /**
    Returns the first selectable item. Items that are disabled quality for selection. On the other hand, hidden items
    can be selected as this is the default behavior in HTML. Please note that an already selected item could be
    returned, since the selection could be toggled.

    @returns {HTMLElement}
      an item whose selection could be toggled.

    @protected
  */
  Coral.SelectableCollection.prototype._getFirstSelectable = function() {
    return this._host.querySelector(this._selectableItemSelector) || null;
  };

  /**
    Returns the last selectable item. Items that are disabled quality for selection. On the other hand, hidden items
    can be selected as this is the default behavior in HTML. Please note that an already selected item could be
    returned, since the selection could be toggled.

    @returns {HTMLElement}
      an item whose selection could be toggled.

    @protected
  */
  Coral.SelectableCollection.prototype._getLastSelectable = function() {
    var items = this._host.querySelectorAll(this._selectableItemSelector);
    return items[items.length - 1] || null;
  };

  /**
    Returns the first item that is selected in the Collection. It allows to configure the attribute used for selection
    so that components that use 'selected' and 'active' can share the same implementation.

    @param {String} [selectedAttribute=selected]
      the attribute that will be used to check for selection.

    @returns HTMLElment the first selected item.

    @protected
  */
  Coral.SelectableCollection.prototype._getFirstSelected = function(selectedAttribute) {
    var selector = this._selectedItemSelector;

    if (typeof selectedAttribute === 'string') {
      selector = selector.replace('[selected]', '[' + selectedAttribute + ']');
    }

    return this._host.querySelector(selector) || null;
  };

  /**
    Returns the last item that is selected in the Collection. It allows to configure the attribute used for selection
    so that components that use 'selected' and 'active' can share the same implementation.

    @param {String} [selectedAttribute=selected]
      the attribute that will be used to check for selection.

    @returns HTMLElment the last selected item.

    @protected
  */
  Coral.SelectableCollection.prototype._getLastSelected = function(selectedAttribute) {
    var selector = this._selectedItemSelector;

    if (typeof selectedAttribute === 'string') {
      selector = selector.replace('[selected]', '[' + selectedAttribute + ']');
    }

    // last-of-type did not work so we need to query all
    var items = this._host.querySelectorAll(selector);
    return items[items.length - 1] || null;
  };

  /**
    Returns an array that contains all the items that are selected.

    @param {String} [selectedAttribute=selected]
      the attribute that will be used to check for selection.

    @protected

    @returns Array.<HTMLElement> an array with all the selected items.
  */
  Coral.SelectableCollection.prototype._getAllSelected = function(selectedAttribute) {
    var selector = this._selectedItemSelector;

    if (typeof selectedAttribute === 'string') {
      selector = selector.replace('[selected]', '[' + selectedAttribute + ']');
    }

    return listToArray(this._host.querySelectorAll(selector));
  };

  /**
    Deselects all the items except the first selected item in the Collection. By default the <code>selected</code>
    attribute will be removed. The attribute to remove is configurable via the <code>selectedAttribute</code> parameter.
    The selected attribute will be removed no matter if the item is <code>disabled</code> or <code>hidden</code>.

    @param {String} [selectedAttribute=selected]
      the attribute that will be used to check for selection. This attribute will be removed from the matching elements.

    @protected
  */
  Coral.SelectableCollection.prototype._deselectAllExceptFirst = function(selectedAttribute) {
    var selector = this._deselectAllExceptSelector;
    var attributeToRemove = selectedAttribute || 'selected';

    if (typeof selectedAttribute === 'string') {
      selector = selector.replace('[selected]', '[' + selectedAttribute + ']');
    }

    // we select all the selected attributes except the last one
    var items = this._host.querySelectorAll(selector);
    var itemsCount = items.length;

    // ignores the first item of the list, everything else is deselected
    for (var i = 1; i < itemsCount; i++) {
      // we use remoteAttribute since we do not know if the element is upgraded
      items[i].removeAttribute(attributeToRemove);
    }
  };

  /**
    Deselects all the items except the last selected item in the Collecton. By default the <code>selected</code>
    attribute will be removed. The attribute to remove is configurable via the <code>selectedAttribute</code> parameter.

    @param {String} [selectedAttribute=selected]
      the attribute that will be used to check for selection. This attribute will be removed from the matching elements.

    @protected
  */
  Coral.SelectableCollection.prototype._deselectAllExceptLast = function(selectedAttribute) {
    var selector = this._deselectAllExceptSelector;
    var attributeToRemove = selectedAttribute || 'selected';

    if (typeof selectedAttribute === 'string') {
      selector = selector.replace('[selected]', '[' + selectedAttribute + ']');
    }

    // we query for all matching items with the given attribute
    var items = this._host.querySelectorAll(selector);
    // we ignore the last item
    var itemsCount = items.length - 1;

    for (var i = 0; i < itemsCount; i++) {
      // we use remoteAttribute since we do not know if the element is upgraded
      items[i].removeAttribute(attributeToRemove);
    }
  };

  /**
    Deselects all the items by removing the provided attribute from the item. By default the <code>selected</code>
    attribute will be removed. The attribute to remove is configurable via the <code>selectedAttribute</code> parameter.

    @name Coral.SelectableCollection#_deselectAllExcept
    @function

    @param {String} [selectedAttribute=selected]
      the attribute that will be used to check for selection. This attribute will be removed from the matching elements.

    @protected
  */

  /**
    Deselects all the items except the given item. The provided attribute will be remove from all matching items. By
    default the <code>selected</code> attribute will be removed. The attribute to remove is configurable via the
    <code>selectedAttribute</code> parameter.

    @name Coral.SelectableCollection#_deselectAllExcept
    @function

    @param {HTMLElement} [item]
      The item to keep selected. If the item is not provided, all elements will be deselected.

    @param {String} [selectedAttribute=selected]
      the attribute that will be used to check for selection. This attribute will be removed from the matching elements.

    @protected
  */
  Coral.SelectableCollection.prototype._deselectAllExcept = function(itemOrSelectedAttribute, selectedAttribute) {
    // if no selectedAttribute we use the unmodified selector as default
    var selector = this._deselectAllExceptSelector;

    var item;
    var attributeToRemove;
    // an item was not provided so we use it as 'selectedAttribute'
    if (typeof itemOrSelectedAttribute === 'string') {
      item = null;
      attributeToRemove = itemOrSelectedAttribute || 'selected';
      selector = selector.replace('[selected]', '[' + attributeToRemove + ']');
    }
    else {
      item = itemOrSelectedAttribute;
      attributeToRemove = selectedAttribute || 'selected';

      if (typeof selectedAttribute === 'string') {
        selector = selector.replace('[selected]', '[' + attributeToRemove + ']');
      }
    }

    // we query for all matching items with the given attribute
    var items = this._host.querySelectorAll(selector);
    var itemsCount = items.length;

    for (var i = 0; i < itemsCount; i++) {
      // we use remoteAttribute since we do not know if the element is upgraded
      if (item !== items[i]) {
        items[i].removeAttribute(attributeToRemove);
      }
    }
  };
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  // Make sure the namespace exists
  Coral.Shell = Coral.Shell || {};

  Coral.register( /** @lends Coral.Shell.Workspaces */ {
    /**
      @class Coral.Shell.Workspaces
      @classdesc The Shell's workspaces component
      @extends Coral.Component
      @htmltag coral-shell-workspaces
    */
    name: 'Shell.Workspaces',
    tagName: 'coral-shell-workspaces',
    className: 'coral3-Shell-workspaces',

    events: {
      'coral-shell-workspace:_selected [is="coral-shell-workspace"]': '_handleSelected',
      'key:down [is="coral-shell-workspace"]': '_focusNextItem',
      'key:right [is="coral-shell-workspace"]': '_focusNextItem',
      'key:left [is="coral-shell-workspace"]': '_focusPreviousItem',
      'key:up [is="coral-shell-workspace"]': '_focusPreviousItem',
      'key:pageup [is="coral-shell-workspace"]': '_focusPreviousItem',
      'key:pagedown [is="coral-shell-workspace"]': '_focusNextItem',
      'key:home [is="coral-shell-workspace"]': '_focusFirstItem',
      'key:end [is="coral-shell-workspace"]': '_focusLastItem'
    },

    properties: {
      /**
        The item collection.
        See {@link Coral.Collection} for more details.

        @type {Coral.Collection}
        @readonly
        @memberof Coral.Shell.Workspaces#
      */
      'items': {
        get: function() {
          // Construct the collection on first request:
          if (!this._items) {
            this._items = new Coral.Collection({
              host: this,
              itemTagName: 'coral-shell-workspace',
              itemBaseTagName: 'a',
              onItemAdded: this._selectLastSelected
            });
          }

          return this._items;
        },
        set: function() {}
      }
    },

    /**
      Returns true if the event is at the matched target.
      @todo this should be moved to Coral.Component

      @private
    */
    _eventIsAtTarget: function(event) {
      var target = event.target;
      var listItem = event.matchedTarget;

      var isAtTarget = (target === listItem);

      if (isAtTarget) {
        // Don't let arrow keys etc scroll the page
        event.preventDefault();
        event.stopPropagation();
      }

      return isAtTarget;
    },

    /** @private */
    _focusNextItem: function(event) {
      if (!this._eventIsAtTarget(event)) {
        return;
      }

      var target = event.matchedTarget;
      if (target.nextElementSibling) {
        target.nextElementSibling.focus();
      }
      else {
        this.items.first().focus();
      }
    },

    /** @private */
    _focusPreviousItem: function(event) {
      if (!this._eventIsAtTarget(event)) {
        return;
      }

      var target = event.matchedTarget;
      if (target.previousElementSibling) {
        target.previousElementSibling.focus();
      }
      else {
        this.items.last().focus();
      }
    },

    /** @private */
    _focusFirstItem: function(event) {
      if (!this._eventIsAtTarget(event)) {
        return;
      }
      this.items.first().focus();
    },

    /** @private */
    _focusLastItem: function(event) {
      if (!this._eventIsAtTarget(event)) {
        return;
      }

      this.items.last().focus();
    },

    /** @private */
    _startObserving: function() {
      this._observer.observe(this, {
        // Only watch the childList
        // Items will tell us if selected/value/content changes
        childList: true
      });
    },

    /** @private */
    _stopObserving: function() {
      this._observer.disconnect();
    },

    /** @private */
    _handleMutation: function() {
      // Select the last selected item
      this._selectLastSelected();
    },

    /** @private */
    _showAll: function() {
      this._elements.resultMessage.hidden = true;

      // Show all items
      this.items.getAll().forEach(function(item) {
        item.hidden = false;
      });
    },

    /** @private */
    _handleSelected: function(event) {
      // stops the propagation of the vent because it is considered to be private
      event.stopImmediatePropagation();

      // Get the new and old selections
      var selection = event.target;
      var oldSelection = this._selectedItem;

      this._selectOnly(selection);

      this.trigger('coral-shell-workspaces:change', {
        selection: selection,
        oldSelection: oldSelection
      });
    },

    /** @private */
    _selectFirst: function() {
      this._selectOnly(this.items.first());
    },

    /** @private */
    _selectOnly: function(selectedItem) {
      var self = this;

      // Hide other items
      this.items.getAll().forEach(function(item) {
        if (item === selectedItem) {
          // Store as selected
          self._selectedItem = item;
        }
        item[(item === selectedItem) ? 'setAttribute' : 'removeAttribute']('selected', '');
      });
    },

    /** @private */
    _selectLastSelected: function() {
      var lastSelected;
      this.items.getAll().forEach(function(item) {
        if (item.hasAttribute('selected')) {
          lastSelected = item;
        }
      });

      this._selectOnly(lastSelected);
    },

    /** @ignore */
    _initialize: function() {
      // Listen for mutations
      this._observer = new MutationObserver(this._handleMutation.bind(this));
      this._startObserving();

      this._selectLastSelected();
    }

    /**
      Triggered when the selected workspace has changed.

      @event Coral.Shell.Workspaces#coral-shell-workspaces:change

      @param {Object} event Event object
      @param {Object} event.detail
      @param {HTMLElement} event.detail.oldSelection
        The prior selected workspace item.
      @param {HTMLElement} event.detail.selection
        The newly selected workspace item.
    */
  });

  Coral.register( /** @lends Coral.Shell.Workspace */ {
    /**
      @class Coral.Shell.Workspace
      @classdesc The Shell's workspace item component
      @extends Coral.Component
      @htmltag coral-shell-workspace
    */
    name: 'Shell.Workspace',
    tagName: 'coral-shell-workspace',
    className: 'coral3-Shell-workspaces-workspace',
    baseTagName: 'a',

    events: {
      'click': '_select'
    },

    properties: {
      /**
        Whether this workspace is selected.

        @type {Boolean}
        @default false
        @htmlattribute selected
        @htmlattributereflected
        @memberof Coral.Shell.Workspace#
      */
      'selected': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        trigger: function() {
          // Trigger a different event based on selected state
          this.trigger(this.selected ? 'coral-shell-workspace:_selected' : 'coral-shell-workspace:_deselected');
        },
        set: function(value) {
          this._selected = value;

          // Do this synchronously to avoid transition on color
          this.classList.toggle('is-selected', this.selected);
        }
      }
    },

    /** @private */
    _select: function() {
      this.selected = true;
    },

    /** @ignore */
    _render: function() {
      // @todo template
    }

    /**
      Triggered when a workspace was selected.

      @event Coral.Shell.Workspace#coral-shell-workspace:_selected

      @param {Object} event Event object
      @private
    */

    /**
      Triggered when a workspace was deselected.

      @event Coral.Shell.Workspace#coral-shell-workspace:_deselected

      @param {Object} event Event object
      @private
    */
  });
}());

window["Coral"] = window["Coral"] || {};
window["Coral"]["templates"] = window["Coral"]["templates"] || {};
window["Coral"]["templates"]["Shell"] = window["Coral"]["templates"]["Shell"] || {};
window["Coral"]["templates"]["Shell"]["solutionSwitcher"] = (function anonymous(data_0
/**/) {
  var data = data_0;
  var el0 = this["icon"] = document.createElement("coral-icon");
  el0.setAttribute("size", "L");
  el0.setAttribute("handle", "icon");
  el0.className += " coral3-Shell-solution-icon";
  return el0;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or resolutionion of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  Coral.register( /** @lends Coral.Shell.SolutionSwitcher */ {
    /**
      @class Coral.Shell.SolutionSwitcher
      @classdesc The Shell's solution switcher component
      @extends Coral.Component
      @htmltag coral-shell-solutionswitcher
    */
    name: 'Shell.SolutionSwitcher',
    tagName: 'coral-shell-solutionswitcher',
    className: 'coral3-Shell-solutionSwitcher',

    properties: {
      /**
        The item collection.
        See {@link Coral.Collection} for more details.
        
        @type {Coral.Collection}
        @readonly
        @memberof Coral.Shell.SolutionsSwitcher#
      */
      'items': {
        get: function() {
          // Construct the collection on first request
          if (!this._items) {
            this._items = new Coral.Collection({
              host: this,
              itemTagName: 'coral-shell-solutions'
            });
          }
      
          return this._items;
        },
        set: function() {}
      }
    },
  
    /** @private */
    _initialize: function() {
      var self = this;
      
      // force dark theme
      self.classList.add('coral--dark');

      // Listen for mutations
      var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          for (var i = 0; i < mutation.addedNodes.length; i++) {
            var addedNode = mutation.addedNodes[i];
            // Move non secondary solutions to the container
            if (addedNode.tagName === 'CORAL-SHELL-SOLUTIONS' && !addedNode.hasAttribute('secondary')) {
              self._elements.container.appendChild(addedNode);
            }
          }
        });
      });
  
      observer.observe(self, {
        // Only care about direct children
        childList: true
      });
    },

    /** @ignore */
    _render: function() {
      var container = this._elements.container = document.createElement('div');
      container.className = 'coral-Shell-solutions-container';
  
      // Move non secondary solutions to the container
      Array.prototype.forEach.call(this.querySelectorAll('coral-shell-solutions:not([secondary])'), function(item) {
        container.appendChild(item);
      });
  
      // Put the container as first child
      this.insertBefore(container, this.firstChild);
    }
  });

  Coral.register( /** @lends Coral.Shell.Solutions */ {
    /**
      @class Coral.Shell.Solutions
      @classdesc The Shell's solution list
      @extends Coral.Component
      @htmltag coral-shell-solutions
    */
    name: 'Shell.Solutions',
    tagName: 'coral-shell-solutions',
    className: 'coral3-Shell-solutions',

    properties: {
      /**
        The item collection.
        See {@link Coral.Collection} for more details.

        @type {Coral.Collection}
        @readonly
        @memberof Coral.Shell.Solutions#
      */
      'items': {
        get: function() {
          // Construct the collection on first request:
          if (!this._items) {
            this._items = new Coral.Collection({
              host: this,
              itemTagName: 'coral-shell-solution',
              itemBaseTagName: 'a'
            });
          }

          return this._items;
        },
        set: function() {}
      },

      /**
        Whether the solution list is secondary.

        @type {Boolean}
        @default false
        @memberof Coral.Shell.Solutions#
        @instance
      */
      'secondary': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        sync: function() {
          this.classList.toggle(this._className + '--secondary', this.secondary);
        }
      }
    }
  });

  Coral.register( /** @lends Coral.Shell.Solution */ {
    /**
      @class Coral.Shell.Solution
      @classdesc The Shell's solution item
      @extends Coral.Component
      @htmltag coral-shell-solution
    */
    name: 'Shell.Solution',
    tagName: 'coral-shell-solution',
    className: 'coral3-Shell-solution',
    baseTagName: 'a',
    extend: HTMLAnchorElement,

    properties: {
      /**
        Specifies the icon name used inside the button.

        @type {String}
        @default ""
        @htmlattribute icon
        @memberof Coral.Shell.Solution#

        @see {@link Coral.Icon}
      */
      'icon': {
        set: function(value) {
          this._elements.icon.icon = value;
        },
        get: function() {
          return this._elements.icon.icon;
        }
      },

      /**
        The solution's label content zone.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Shell.Solution#
      */
      'label': Coral.property.contentZone({
        handle: 'label',
        tagName: 'coral-shell-solution-label',
        defaultContentZone: true,
        insert: function(content) {
          this.appendChild(content);
        }
      }),

      /**
        Whether a solution is linked or not

        @type {Boolean}
        @default false
        @htmlattributereflected
        @memberof Coral.Shell.Solution#
      */
      'linked': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        sync: function() {
          this.classList.toggle(this._className + '--linked', this.linked);
        }
      }
    },

    /** @ignore */
    _render: function() {
      var fragment = document.createDocumentFragment();

      fragment.appendChild(Coral.templates.Shell.solutionSwitcher.call(this._elements));

      var label = this._elements.label = this.querySelector('coral-shell-solution-label') ||
        document.createElement('coral-shell-solution-label');
      fragment.appendChild(this._elements.label);

      // Move any remaining elements into the content sub-component
      while (this.firstChild) {
        // @todo this copies line break text nodes, which is ugly
        label.appendChild(this.firstChild);
      }

      this.appendChild(fragment);
    }
  });
  
  /**
    @class Coral.Shell.Solution.Label
    @classdesc The Shell Solution label
    @htmltag coral-shell-solution-label
    @extends HTMLElement
  */
  Coral.Shell.Solution.Label = function() {
    return document.createElement('coral-shell-solution-label');
  };
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
/* global Vent: true */
(function() {
  /* jshint validthis: true */
  'use strict';

  // The tab capture element that lives at the top of the body
  var topTabCaptureEl;
  var bottomTabCaptureEl;

  // A reference to the backdrop element
  var backdropEl;

  // The starting zIndex for overlays
  var startZIndex = 10000;

  // Tab keycode
  var TAB_KEY = 9;

  /**
    Focus trap options.
    @memberof Coral.mixin.overlay
    @enum {String}
  */
  var trapFocus = {
    /** Focus is trapped such that the use cannot focus outside of the overlay. */
    ON: 'on',
    /** The user can focus outside the overlay as normal. */
    OFF: 'off'
  };

  /**
    Return focus options.

    @memberof Coral.mixin.overlay
    @enum {String}
  */
  var returnFocus = {
    /** When the overlay is closed, the element that was focused before the it was shown will be focused again. */
    ON: 'on',
    /** Nothing will be focused when the overlay is closed. */
    OFF: 'off'
  };

  /**
    Focus behavior options.

    @memberof Coral.mixin.overlay
    @enum {String}
  */
  var focusOnShow = {
    /** When the overlay is opened, it will be focused. */
    ON: 'on',
    /** The overlay will not focus itself when opened. */
    OFF: 'off'
  };

  // A stack interface for overlays
  var _overlays = [];
  var overlays = {
    pop: function(instance) {
      // Get overlay index
      var index = this.indexOf(instance);

      if (index === -1) {
        return null;
      }

      // Get the overlay
      var overlay = _overlays[index];

      // Remove from the stack
      _overlays.splice(index, 1);

      // Return the passed overlay or the found overlay
      return overlay;
    },

    push: function(instance) {
      // Pop overlay
      var overlay = this.pop(instance) || {
          instance: instance
        };

      // Get the new highest zIndex
      var zIndex = this.getHighestZIndex() + 10;

      // Store the zIndex
      overlay.zIndex = zIndex;
      instance.style.zIndex = zIndex;

      // Push it
      _overlays.push(overlay);

      if (overlay.backdrop) {
        // If the backdrop is shown, we'll need to reposition it
        // Generally, a component will not call _pushOverlay unnecessarily
        // However, attachedCallback is asynchronous in polyfilld environments,
        // so _pushOverlay will be called when shown and when attached
        doRepositionBackdrop();
      }

      return overlay;
    },

    indexOf: function(instance) {
      // Loop over stack
      // Find overlay
      // Return index
      for (var i = 0; i < _overlays.length; i++) {
        if (_overlays[i].instance === instance) {
          return i;
        }
      }
      return -1;
    },

    get: function(instance) {
      // Get overlay index
      var index = this.indexOf(instance);

      // Return overlay
      return index === -1 ? null : _overlays[index];
    },

    top: function() {
      var length = _overlays.length;
      return length === 0 ? null : _overlays[length - 1];
    },

    getHighestZIndex: function() {
      var overlay = this.top();
      return overlay ? overlay.zIndex : startZIndex;
    },

    some: function() {
      return _overlays.some.apply(_overlays, arguments);
    },

    forEach: function() {
      return _overlays.forEach.apply(_overlays, arguments);
    }
  };

  /**
    Hide the backdrop if no overlays are using it.
  */
  function hideOrRepositionBackdrop() {
    if (!backdropEl || !backdropEl._isOpen) {
      // Do nothing if the backdrop isn't shown
      return;
    }

    // Loop over all overlays
    var keepBackdrop = overlays.some(function(overlay) {
      // Check for backdrop usage
      if (overlay.backdrop) {
        return true;
      }
    });

    if (!keepBackdrop) {
      // Hide the backdrop
      doBackdropHide();
    }
    else {
      // Reposition the backdrop
      doRepositionBackdrop();
    }

    // Hide/create the document-level tab capture element as necessary
    // This only applies to modal overlays (those that have backdrops)
    var top = overlays.top();
    if (!top || !(top.instance.trapFocus === trapFocus.ON && top.instance._requestedBackdrop)) {
      hideDocumentTabCaptureEls();
    }
    else if (top && top.instance.trapFocus === trapFocus.ON && top.instance._requestedBackdrop) {
      createDocumentTabCaptureEls();
    }
  }

  /**
    Actually reposition the backdrop to be under the topmost overlay.
  */
  function doRepositionBackdrop() {
    // Position under the topmost overlay
    var top = overlays.top();

    if (top) {

      // The backdrop, if shown, should be positioned under the topmost overlay that does have a backdrop
      for (var i = _overlays.length - 1; i > -1; i--) {
        if (_overlays[i].backdrop) {
          backdropEl.style.zIndex = _overlays[i].zIndex - 1;
          break;
        }
      }

      // ARIA: Set hidden properly
      hideEverythingBut(top.instance);
    }
  }

  /**
    Cancel the backdrop hide mid-animation.
  */
  var fadeTimeout;
  function cancelBackdropHide() {
    clearTimeout(fadeTimeout);
  }

  /**
    Actually hide the backdrop.
  */
  function doBackdropHide() {
    document.body.classList.remove('u-coral-noscroll');

    // Start animation
    Coral.commons.nextFrame(function() {
      backdropEl.classList.remove('is-open');

      cancelBackdropHide();
      fadeTimeout = setTimeout(function() {
        backdropEl.style.display = 'none';
      }, Coral.mixin.overlay.FADETIME);
    });

    // Set flag for testing
    backdropEl._isOpen = false;

    // Wait for animation to complete
    showEverything();
  }

  /**
    Actually show the backdrop.
  */
  function doBackdropShow(zIndex, instance) {
    document.body.classList.add('u-coral-noscroll');

    if (!backdropEl) {
      backdropEl = document.createElement('div');
      backdropEl.className = 'coral3-Backdrop';
      document.body.appendChild(backdropEl);

      backdropEl.addEventListener('click', handleBackdropClick);
    }

    // Show just under the provided zIndex
    // Since we always increment by 10, this will never collide
    backdropEl.style.zIndex = zIndex - 1;

    // Set flag for testing
    backdropEl._isOpen = true;

    // Start animation
    backdropEl.style.display = '';
    Coral.commons.nextFrame(function() {
      // Add the class on the next animation frame so backdrop has time to exist
      // Otherwise, the animation for opacity will not work.
      backdropEl.classList.add('is-open');

      cancelBackdropHide();
    });

    hideEverythingBut(instance);
  }

  /**
    Handles clicks to the backdrop, calling backdropClickedCallback for every overlay
  */
  function handleBackdropClick(event) {
    overlays.forEach(function(overlay) {
      if (typeof overlay.instance.backdropClickedCallback === 'function') {
        overlay.instance.backdropClickedCallback(event);
      }
    });
  }

  /**
    Set aria-hidden on every immediate child except the one passed, which should not be hidden.
  */
  function hideEverythingBut(instance) {
    // ARIA: Hide all the things
    var children = document.body.children;
    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      // If it's not a parent of or not the instance itself, it needs to be hidden
      if (child !== instance && !child.contains(instance)) {
        var currentAriaHidden = child.getAttribute('aria-hidden');
        if (currentAriaHidden) {
          // Store the previous value of aria-hidden if present
          // Don't blow away the previously stored value
          child._previousAriaHidden = child._previousAriaHidden || currentAriaHidden;
          if (currentAriaHidden === 'true') {
            // It's already true, don't bother setting
            continue;
          }
        }
        else {
          // Nothing is hidden by default, store that
          child._previousAriaHidden = 'false';
        }

        // Hide it
        child.setAttribute('aria-hidden', 'true');
      }
    }

    // Always show ourselves
    instance.setAttribute('aria-hidden', 'false');
  }

  /**
    Show or restore the aria-hidden state of every child of body.
  */
  function showEverything() {
    // ARIA: Show all the things
    var children = document.body.children;
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      // Restore the previous aria-hidden value
      child.setAttribute('aria-hidden', child._previousAriaHidden || 'false');
    }
  }

  /**
    Create the global tab capture element.
  */
  function createDocumentTabCaptureEls() {
    if (!topTabCaptureEl) {
      topTabCaptureEl = document.createElement('div');
      topTabCaptureEl.setAttribute('coral-tabcapture', '');
      topTabCaptureEl.tabIndex = 0;
      document.body.insertBefore(topTabCaptureEl, document.body.firstChild);
      topTabCaptureEl.addEventListener('focus', function(event) {
        var top = overlays.top();
        if (top && top.instance.trapFocus === trapFocus.ON) {
          // Focus on the first tabbable element of the top overlay
          Array.prototype.some.forEach.call(top.instance.querySelectorAll(Coral.commons.TABBABLE_ELEMENT_SELECTOR), function(item) {
            if (item.offsetParent !== null && !item.hasAttribute('coral-tabcapture')) {
              item.focus();
              return true;
            }
          });
        }
      });

      bottomTabCaptureEl = document.createElement('div');
      bottomTabCaptureEl.setAttribute('coral-tabcapture', '');
      bottomTabCaptureEl.tabIndex = 0;
      document.body.appendChild(bottomTabCaptureEl);
      bottomTabCaptureEl.addEventListener('focus', function(event) {
        var top = overlays.top();
        if (top && top.instance.trapFocus === trapFocus.ON) {
          var tabbableElement = Array.prototype.filter.call(top.instance.querySelectorAll(Coral.commons.TABBABLE_ELEMENT_SELECTOR), function(item) {
            return item.offsetParent !== null && !item.hasAttribute('coral-tabcapture');
          }).pop();
  
          // Focus on the last tabbable element of the top overlay
          if (tabbableElement) {
            tabbableElement.focus();
          }
        }
      });
    }
    else {
      if (document.body.firstElementChild !== topTabCaptureEl) {
        // Make sure we stay at the very top
        document.body.insertBefore(topTabCaptureEl, document.body.firstChild);
      }

      if (document.body.lastElementChild !== bottomTabCaptureEl) {
        // Make sure we stay at the very bottom
        document.body.appendChild(bottomTabCaptureEl);
      }
    }

    // Make sure the tab capture elemenst are shown
    topTabCaptureEl.style.display = 'inline';
    bottomTabCaptureEl.style.display = 'inline';
  }

  /**
    Called after all overlays are hidden and we shouldn't capture the first tab into the page.
  */
  function hideDocumentTabCaptureEls() {
    if (topTabCaptureEl) {
      topTabCaptureEl.style.display = 'none';
      bottomTabCaptureEl.style.display = 'none';
    }
  }

  // Properties to add to the object
  var properties = {
    /**
      Whether to trap tabs and keep them within the overlay.

      @type {Coral.mixin.overlay.trapFocus}
      @default Coral.mixin.overlay.trapFocus.OFF
      @htmlattribute trapfocus
      @memberof Coral.mixin.overlay#
    */
    'trapFocus': {
      attribute: 'trapfocus',
      default: trapFocus.OFF,
      validate: Coral.validate.enumeration(trapFocus),
      set: function(value) {
        if (value === trapFocus.ON) {
          // Give ourselves tabIndex if we are not focusable
          if (this.tabIndex < 0) {
            this.tabIndex = 0;
          }

          // Create elements
          this._elements.topTabCapture = document.createElement('div');
          this._elements.topTabCapture.setAttribute('coral-tabcapture', 'top');
          this._elements.topTabCapture.tabIndex = 0;
          this.insertBefore(this._elements.topTabCapture, this.firstElementChild);
          this._elements.intermediateTabCapture = document.createElement('div');
          this._elements.intermediateTabCapture.setAttribute('coral-tabcapture', 'intermediate');
          this._elements.intermediateTabCapture.tabIndex = 0;
          this.appendChild(this._elements.intermediateTabCapture);
          this._elements.bottomTabCapture = document.createElement('div');
          this._elements.bottomTabCapture.setAttribute('coral-tabcapture', 'bottom');
          this._elements.bottomTabCapture.tabIndex = 0;
          this.appendChild(this._elements.bottomTabCapture);

          // Add listeners
          this._handleTabCaptureFocus = this._handleTabCaptureFocus.bind(this);
          this._handleRootKeypress = this._handleRootKeypress.bind(this);
          this._vent.on('keydown', this._handleRootKeypress);
          this._vent.on('focus', '[coral-tabcapture]', this._handleTabCaptureFocus);
        }
        else {
          // Don't just put this in an else, check if we currently have it disabled
          // so we only attempt to remove elements if we were previously capturing tabs
          if (this.trapFocus === trapFocus.ON) {
            // Remove elements
            this.removeChild(this._elements.topTabCapture);
            this.removeChild(this._elements.intermediateTabCapture);
            this.removeChild(this._elements.bottomTabCapture);
            this._elements.topTabCapture = null;
            this._elements.intermediateTabCapture = null;
            this._elements.bottomTabCaptureEl = null;

            // Remove listeners
            this._vent.off('keydown', this._handleRootKeypress);
            this._vent.off('focus', '[coral-tabcapture]', this._handleTabCaptureFocus);
          }
        }

        this._trapFocus = value;
      }
    },

    /**
      Whether to return focus to the previously focused element when closed.

      @type {Coral.mixin.overlay.returnFocus}
      @default Coral.mixin.overlay.returnFocus.OFF
      @htmlattribute returnfocus
      @memberof Coral.mixin.overlay#
    */
    'returnFocus': {
      attribute: 'returnfocus',
      default: returnFocus.OFF,
      validate: Coral.validate.enumeration(returnFocus),
    },

    /**
      Whether to focus the overlay, when opened or not (default=['off']{@link Coral.mixin.overlay.focusOnShow}).

      If set to ['on']{@link Coral.mixin.overlay.focusOnShow}, the overlay itself will get focus.
      This property also accepts an instance of HTMLElement or a selector like ':first-child' or 'button:last-of-type'
      and will focus the first element found inside the overlay instead of the overlay itself.

      @type {Coral.mixin.overlay.focusOnShow|HTMLElement|String}
      @default [Coral.mixin.overlay.focusOnShow.OFF]{@link Coral.mixin.overlay.focusOnShow}
      @htmlattribute focusonshow
      @memberof Coral.mixin.overlay#
    */
    'focusOnShow': {
      attribute: 'focusonshow',
      default: focusOnShow.OFF,
      validate: [
        Coral.validate.valueMustChange,
        function(value) {
          return typeof value === 'string' || value instanceof HTMLElement;
        }
      ]
    },

    /**
      Whether this overlay is open or not.

      @type {Boolean}
      @default false
      @htmlattribute open
      @htmlattributereflected
      @memberof Coral.mixin.overlay#
      @fires Coral.mixin.overlay#coral-overlay:open
      @fires Coral.mixin.overlay#coral-overlay:close
      @fires Coral.mixin.overlay#coral-overlay:beforeopen
      @fires Coral.mixin.overlay#coral-overlay:beforeclose
    */
    'open': {
      default: false,
      reflectAttribute: true,
      transform: Coral.transform.boolean,
      attributeTransform: Coral.transform.booleanAttr,
      triggerBefore: function(newValue, oldValue) {
        // We have to manually implement triggerBefore since we can trigger multiple events
        return this.trigger(newValue ? 'coral-overlay:beforeopen' : 'coral-overlay:beforeclose');
      },
      set: function(value, silent) {
        // We need to store the value here as we're not using the default setter
        this._open = value;
        this._openSilently = !!silent;

        // Set synchronously as it does not affect rendering
        if (this.open) {
          // Set aria-hidden false before we show
          // Otherwise, screen readers will not announce
          this.setAttribute('aria-hidden', 'false');
        }
        else {
          // Doesn't matter when we set aria-hidden true (nothing being announced)
          this.setAttribute('aria-hidden', 'true');
        }

        // Synchronous operations
        if (this.parentNode) {
          // Don't do anything if we're not in the DOM yet
          // This prevents errors related to allocating a zIndex we don't need
          if (this.open) {
            // Do this check afterwards as we may have been appended inside of _show()

            // Set z-index
            this._pushOverlay();

            if (this.returnFocus === returnFocus.ON) {
              // Store the element that currently has focus, or the element that was passed to returnFocusTo()
              this._elementToFocusWhenHidden = this._elementToFocusWhenHidden || (document.activeElement === document.body ? null : document.activeElement);
            }
          }
          else {
            // Release zIndex
            this._popOverlay();

            if (this.returnFocus === returnFocus.ON && this._elementToFocusWhenHidden) {
              if (document.activeElement && !this.contains(document.activeElement)) {
                // Don't return focus if the user focused outside of the overlay
                return;
              }

              // IE will throw if you try to focus on a non-focusable or hidden element
              // Catch these errors so we recover gracefully
              try {
                // Return focus, ignoring tab capture if it's an overlay
                this._elementToFocusWhenHidden._ignoreTabCapture = true;
                this._elementToFocusWhenHidden.focus();
                this._elementToFocusWhenHidden._ignoreTabCapture = false;
              } catch (error) {}

              // Drop the reference to avoid memory leaks
              this._elementToFocusWhenHidden = null;
            }
          }
        }
      },
      sync: function() {
        var self = this;

        if (this.open) {
          if (this.trapFocus === trapFocus.ON) {
            // Make sure tab capture elements are positioned correctly
            if (
              // Tab capture elements are no longer at the bottom
              this._elements.topTabCapture !== this.firstElementChild ||
              this._elements.bottomTabCapture !== this.lastElementChild ||
              // Tab capture elements have been separated
              this._elements.bottomTabCapture.previousElementSibling !== this._elements.intermediateTabCapture
            ) {
              this.insertBefore(this._elements.intermediateTabCapture, this.firstElementChild);
              this.appendChild(this._elements.intermediateTabCapture);
              this.appendChild(this._elements.bottomTabCapture);
            }
          }

          // The default style should be display: none for overlays
          // Show ourselves first for centering calculations etc
          this.style.display = 'block';

          Coral.commons.nextFrame(function() {
            self.classList.add('is-open');

            var openComplete = function() {
              if (self.open && !self._openSilently) {
                self.trigger('coral-overlay:open');
              }
            };

            if (self._overlayAnimationTime) {
              // Wait for animation to complete
              Coral.commons.transitionEnd(self, openComplete);
            }
            else {
              // Execute immediately
              openComplete();
            }
          });

          // Focus on the overlay itself, announcing it
          // Pressing the tab key will then focus on the next focusable element inside of it
          if (this.focusOnShow === focusOnShow.ON) {
            this.focus();
          }
          else if (this.focusOnShow !== focusOnShow.OFF) {
            var selectedElement = (this.focusOnShow instanceof HTMLElement) ? this.focusOnShow : this.querySelector(this.focusOnShow);
            if (selectedElement) {
              selectedElement.focus();
            }
          }
        }
        else {
          // Fade out
          Coral.commons.nextFrame(function() {
            self.classList.remove('is-open');

            var closeComplete = function() {
              if (!self.open) {
                // Hide self
                self.style.display = 'none';

                if (!self._openSilently) {
                  self.trigger('coral-overlay:close');
                }
              }
            };

            if (self._overlayAnimationTime) {
              // Wait for animation to complete
              Coral.commons.transitionEnd(self, closeComplete);
            }
            else {
              // Execute immediately
              closeComplete();
            }
          });
        }
      }
    }

    /**
      The time it takes for the overlay to animate opening/closing.
      This value should match the CSS animation time for the overlay in question.

      @name _overlayAnimationTime
      @type {Number}
      @default 0
      @protected
      @memberof Coral.mixin.overlay#
    */
  };

  var methods = {
    detachedCallback: function() {
      if (this.open) {
        // Release zIndex as we're not in the DOM any longer
        // When we're re-added, we'll get a new zIndex
        this._popOverlay();

        if (this._requestedBackdrop) {
          // Mark that we'll need to show the backdrop when attached
          this._showBackdropOnAttached = true;
        }
      }
    },

    attachedCallback: function() {
      if (this.open) {
        this._pushOverlay();

        if (this._showBackdropOnAttached) {
          // Show the backdrop again
          this._showBackdrop();
        }
      }
    },

    /**
      Open the overlay and set the z-index accordingly.

      @returns {Coral.Component} this, chainable
      @memberof Coral.mixin.overlay#
    */
    show: function() {
      this.open = true;

      return this;
    },

    /**
      Close the overlay.

      @returns {Coral.Component} this, chainable
      @memberof Coral.mixin.overlay#
    */
    hide: function() {
      this.open = false;

      return this;
    },

    /**
      Set the element that focus should be returned to when the overlay is hidden.

      @param {HTMLElement} element
        The element to return focus to. This must be a DOM element, not a jQuery object or selector.

      @returns {Coral.Component} this, chainable
      @memberof Coral.mixin.overlay#
    */
    returnFocusTo: function(element) {
      if (this.returnFocus === returnFocus.OFF) {
        // Switch on returning focus if it's off
        this.returnFocus = returnFocus.ON;
      }

      // If the element is not focusable,
      if (element.offsetParent === null || !element.matches(Coral.commons.FOCUSABLE_ELEMENT_SELECTOR)) {

        // add tabindex so that it is programmatically focusable.
        element.setAttribute('tabindex', -1);

        // On blur, restore element to its prior, not-focusable state
        var tempVent = new Vent(element);
        tempVent.on('blur.afterFocus', function(event) {

          // Wait a frame before testing whether focus has moved to an open overlay or to some other element.
          Coral.commons.nextFrame(function() {

            // If overlay remains open, don't remove tabindex event handler until after it has been closed
            var top = overlays.top();
            if (top && top.instance.contains(document.activeElement)) {
              return;
            }
            tempVent.off('blur.afterFocus');
            event.matchedTarget.removeAttribute('tabindex');
          });
        }, true);
      }

      this._elementToFocusWhenHidden = element;
      return this;
    },

    /**
      Check if this overlay is the topmost.

      @protected
      @memberof Coral.mixin.overlay#
    */
    _isTopOverlay: function() {
      var top = overlays.top();
      return top && top.instance === this;
    },

    /**
      Push the overlay to the top of the stack.

      @protected
      @memberof Coral.mixin.overlay#
    */
    _pushOverlay: function() {
      overlays.push(this);
    },

    /**
      Remove the overlay from the stack.

      @protected
      @memberof Coral.mixin.overlay#
    */
    _popOverlay: function() {
      overlays.pop(this);

      // Automatically hide the backdrop if required
      hideOrRepositionBackdrop();
    },

    /**
      Show the backdrop.

      @protected
      @memberof Coral.mixin.overlay#
    */
    _showBackdrop: function() {
      var overlay = overlays.get(this);

      // Overlay is not tracked unless the component is in the DOM
      // Hence, we need to check
      if (overlay) {
        overlay.backdrop = true;
        doBackdropShow(overlay.zIndex, this);
      }

      // Mark on the instance that the backdrop has been requested for this overlay
      this._requestedBackdrop = true;

      // Mark that the backdrop was requested when not attached to the DOM
      // This allows us to know whether to push the overlay when the component is attached
      if (!this.parentNode) {
        this._showBackdropOnAttached = true;
      }

      if (this.trapFocus === trapFocus.ON) {
        createDocumentTabCaptureEls();
      }
    },

    /**
      Show the backdrop.

      @protected
      @memberof Coral.mixin.overlay#
    */
    _hideBackdrop: function() {
      var overlay = overlays.get(this);

      if (overlay) {
        overlay.backdrop = false;

        // If that was the last overlay using the backdrop, hide it
        hideOrRepositionBackdrop();
      }

      // Mark on the instance that the backdrop is no longer needed
      this._requestedBackdrop = false;
    },

    /**
      Handles keypresses on the root of the overlay and marshalls focus accordingly.

      @protected
    */
    _handleRootKeypress: function(event) {
      if (event.target === this && event.keyCode === TAB_KEY) {
        // Skip the top tabcapture and focus on the first focusable element
        this._focusOn('first');

        // Stop the normal tab behavior
        event.preventDefault();
      }
    },

    /**
      Handles focus events on tab capture elements.

      @protected
      @memberof Coral.mixin.overlay#
    */
    _handleTabCaptureFocus: function(event) {
      // Avoid moving around if we're trying to focus on coral-tabcapture
      if (this._ignoreTabCapture) {
        this._ignoreTabCapture = false;
        return;
      }

      // Focus on the correct tabbable element
      var target = event.target;
      var which = (target === this._elements.intermediateTabCapture ? 'first' : 'last');

      this._focusOn(which);
    },

    /**
      Focus on the first or last element.

      @param {String} which
        one of "first" or "last"
      @protected
    */
    _focusOn: function(which) {
      var tabTarget;
      if (which === 'first' || which === 'last') {
        tabTarget = Array.prototype.filter.call(this.querySelectorAll(Coral.commons.TABBABLE_ELEMENT_SELECTOR), function(item) {
          return item.offsetParent !== null && !item.hasAttribute('coral-tabcapture');
        })[which === 'first' ? 'shift' : 'pop']();
        
        if (tabTarget) {
          tabTarget.focus();
        }
      }
      else {
        this.focus();
      }
    }
  };

  /**
    Make an object an overlay (prototype or instance).
    @mixin
  */
  Coral.mixin.overlay = function(object, options) {
    // Augment property descriptors
    Coral.register.augmentProperties(options.properties, properties);

    // Add methods
    Coral.commons.augment(object, methods, function(objectMethod, mixinMethod, prop) {
      if (prop === 'hide' || prop === 'show') {
        return mixinMethod;
      }
      return Coral.commons.callAll(mixinMethod, objectMethod);
    });
  };

  // Expose methods on prototype so they may be called by implementing components
  Coral.mixin.overlay.prototype = methods;

  // The time it should take for overlays to fade in milliseconds
  // Important: This should be greater than or equal to the CSS transition time
  Coral.mixin.overlay.FADETIME = 350;

  /**
    Called when the overlay is clicked.

    @function backdropClickedCallback
    @memberof Coral.mixin.overlay#
    @protected
  */

  /**
    Triggerred before the component is opened with <code>show()</code> or <code>instance.open = true</code>.

    @event Coral.mixin.overlay#coral-overlay:beforeopen

    @param {Object} event
      Event object.
    @param {Function} event.preventDefault
      Call to stop the overlay from opening.
  */

  /**
    Triggerred after the overlay is opened with <code>show()</code> or <code>instance.open = true</code>

    @event Coral.mixin.overlay#coral-overlay:open

    @param {Object} event
      Event object.
  */

  /**
    Triggerred before the component is closed with <code>hide()</code> or <code>instance.open = false</code>.

    @event Coral.mixin.overlay#coral-overlay:beforeclose

    @param {Object} event
      Event object.
    @param {Function} event.preventDefault
      Call to stop the overlay from closing.
  */

  /**
    Triggerred after the component is closed with <code>hide()</code> or <code>instance.open = false</code>

    @event Coral.mixin.overlay#coral-overlay:close

    @param {Object} event
      Event object.
  */

  Coral.mixin.overlay.trapFocus = trapFocus;
  Coral.mixin.overlay.returnFocus = returnFocus;
  Coral.mixin.overlay.focusOnShow = focusOnShow;
}());

window["Coral"] = window["Coral"] || {};
window["Coral"]["templates"] = window["Coral"]["templates"] || {};
window["Coral"]["templates"]["Shell"] = window["Coral"]["templates"]["Shell"] || {};
window["Coral"]["templates"]["Shell"]["menubaritem"] = (function anonymous(data_0
/**/) {
  var data = data_0;
  var el0 = this["shellMenuButton"] = document.createElement("button","coral-button");
  el0.setAttribute("is", "coral-button");
  el0.setAttribute("variant", "minimal");
  el0.setAttribute("iconsize", "S");
  el0.className += " coral3-Shell-menu-button";
  el0.setAttribute("handle", "shellMenuButton");
  var el1 = document.createTextNode("\n  ");
  el0.appendChild(el1);
  var el2 = this["shellMenuButtonLabel"] = document.createElement("coral-button-label");
  el2.setAttribute("handle", "shellMenuButtonLabel");
  el0.appendChild(el2);
  var el3 = document.createTextNode("\n");
  el0.appendChild(el3);
  return el0;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  Coral.register( /** @lends Coral.Shell.MenuBar */ {
    /**
      @class Coral.Shell.MenuBar
      @classdesc Shell menubar
      @extends Coral.Component
      @htmltag coral-shell-menubar
    */
    name: 'Shell.MenuBar',
    tagName: 'coral-shell-menubar',
    className: 'coral3-Shell-menubar',

    properties: {
      /**
        The item collection.

        See {@link Coral.Collection} for more details.

        @type {Coral.Collection}
        @readonly
        @memberof Coral.Shell.MenuBar#
      */
      'items': {
        get: function() {
          // Construct the collection on first request:
          if (!this._items) {
            this._items = new Coral.Collection({
              host: this,
              itemTagName: 'coral-shell-menubar-item'
            });
          }

          return this._items;
        },
        set: function() {}
      }
    },

    /** @ignore */
    _initialize: function() {
      // @todo watch for added items, reset open status
    }
  });

  /**
    Enum for menubar item iconVariant.
    @enum {String}
    @memberof Coral.Shell.MenuBar.Item
  */
  var iconVariant = {
    /** A default menubar item */
    DEFAULT: 'default',
    /** A round image as menubar item */
    CIRCLE: 'circle'
  };

  // the Menubar Item's base classname
  var CLASSNAME = 'coral3-Shell-menubar-item';

  // Builds a string containing all possible iconVariant classnames. This will be used to remove classnames when the variant
  // changes
  var ALL_ICON_VARIANT_CLASSES = [];
  for (var variantValue in iconVariant) {
    ALL_ICON_VARIANT_CLASSES.push(CLASSNAME + '--' + iconVariant[variantValue]);
  }

  Coral.register( /** @lends Coral.Shell.MenuBar.Item */ {
    /**
      @class Coral.Shell.MenuBar.Item
      @classdesc Shell menubar item
      @extends Coral.Component
      @htmltag coral-shell-menubar-item
    */
    name: 'Shell.MenuBar.Item',
    tagName: 'coral-shell-menubar-item',
    className: CLASSNAME,

    events: {
      'click [handle="shellMenuButton"]': '_handleButtonClick',

      // it has to be global because the menus are not direct children
      'global:coral-overlay:close': '_handleOverlayEvent',
      'global:coral-overlay:open': '_handleOverlayEvent'
    },

    properties: {
      /**
        Specifies the icon name used inside the menu item.
        See {@link Coral.Icon} for valid icon names.

        @type {String}
        @default ""
        @htmlattribute icon
        @memberof Coral.Shell.MenuBar.Item#

        @see {@link Coral.Icon}
      */
      'icon': {
        set: function(value) {
          this._elements.shellMenuButton.icon = value;
        },
        get: function() {
          return this._elements.shellMenuButton.icon;
        }
      },

      /**
        Size of the icon. It accepts both lower and upper case sizes.

        @type {Coral.Icon.size}
        @default Coral.Icon.size.SMALL
        @htmlattribute iconsize
        @memberof Coral.Shell.MenuBar.Item#

        @see {@link Coral.Icon#size}
      */
      'iconSize': {
        attribute: 'iconsize',
        set: function(value) {
          this._elements.shellMenuButton.iconSize = value;
        },
        get: function() {
          return this._elements.shellMenuButton.iconSize;
        }
      },

      /**
        The menubar item's iconVariant.
        @type {Coral.Shell.MenuBar.Item.iconVariant}
        @default Coral.Shell.MenuBar.Item.iconVariant.DEFAULT
        @htmlattribute iconvariant
        @memberof Coral.Shell.MenuBar.Item#
      */
      'iconVariant': {
        default: iconVariant.DEFAULT,
        attribute: 'iconvariant',
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(iconVariant)
        ],
        sync: function() {
          // removes all the existing variants
          this.classList.remove.apply(this.classList, ALL_ICON_VARIANT_CLASSES);
          // adds the new variant
          if (this.variant !== Coral.Shell.MenuBar.Item.iconVariant.DEFAULT) {
            this.classList.add(CLASSNAME + '--' + this.iconVariant);
          }
        }
      },

      /**
        The notification badge content.

        @type {String}
        @default ""
        @htmlattribute badge
        @memberof Coral.Shell.MenuBar.Item#
      */
      'badge': {
        set: function(value) {
          if (!value || value === '0') {
            // Non-truthy values shouldn't show
            // null, empty string, 0, etc
            this._elements.shellMenuButton.removeAttribute('badge', value);
          }
          else {
            this._elements.shellMenuButton.setAttribute('badge', value);
          }
        },
        get: function() {
          return this._elements.shellMenuButton.getAttribute('badge');
        }
      },

      /**
        Whether the menu is open or not.

        @type {Boolean}
        @default false
        @htmlattribute open
        @htmlattributereflected
        @memberof Coral.Shell.MenuBar.Item#

        @fires Coral.Shell.MenuBar.Item#coral-shell-menubar-item:open
        @fires Coral.Shell.MenuBar.Item#coral-shell-menubar-item:close
      */
      'open': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        validate: [
          Coral.validate.valueMustChange,
          function(newValue, oldValue) {
            // if we want to open the dialog we need to make sure there is a valid menu
            return !newValue || this._getMenu() !== null;
          }
        ],
        trigger: function(newValue, oldValue) {
          return this.trigger(newValue ? 'coral-shell-menubar-item:open' : 'coral-shell-menubar-item:close');
        },
        set: function(value) {
          this._open = value;

          // Open the target menu
          var menu = this._getMenu();
          if (menu) {
            menu.open = this.open;
          }
        }
      },

      /**
        The menubar item's label content zone.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Shell.MenuBar.Item#
      */
      'label': Coral.property.contentZone({
        handle: 'shellMenuButtonLabel',
        tagName: 'coral-button-label',
        defaultContentZone: true,
        insert: function(content) {
          this._elements.shellMenuButtonLabel.appendChild(content);
        }
      }),

      /**
        The menu that this menu item should show. If a CSS selector is provided, the first matching element will be
        used.

        @type {?HTMLElement|String}
        @default null
        @htmlattribute menu
        @memberof Coral.Shell.MenuBar.Item#
      */
      'menu': {
        default: null
      }
    },

    /** @private */
    _handleOverlayEvent: function(event) {
      var target = event.target;

      // matches the open state of the target in case it was open separately
      if (target === this._getMenu()) {
        this.open = target.open;
      }
    },

    /** @ignore */
    _handleButtonClick: function(event) {
      this.open = !this.open;
    },

    /** @ignore */
    _getMenu: function(targetValue) {
      // Use passed target
      targetValue = targetValue || this.menu;

      if (targetValue instanceof Node) {
        // Just return the provided Node
        return targetValue;
      }

      // Dynamically get the target node based on target
      var newTarget = null;
      if (typeof targetValue === 'string') {
        newTarget = document.querySelector(targetValue);
      }

      return newTarget;
    },

    /** @ignore */
    _render: function() {
      // Move everything into the button
      var fragment = Coral.templates.Shell.menubaritem.call(this._elements);

      // Move component content into the content
      while (this.firstChild) {
        // @todo this copies line break text nodes, which is ugly
        this.label.appendChild(this.firstChild);
      }

      this.appendChild(fragment);
    }

    /**
      Triggerred after the overlay is opened with <code>show()</code> or <code>instance.open = true</code>

      @event Coral.Shell.MenuBar.Item#coral-shell-menubar-item:open

      @param {Object} event
        Event object.
    */

    /**
      Triggerred after the component is closed with <code>hide()</code> or <code>instance.open = false</code>

      @event Coral.Shell.MenuBar.Item#coral-shell-menubar-item:close

      @param {Object} event
        Event object.
    */
  });

  // exports the variants enumeration
  Coral.Shell.MenuBar.Item.iconVariant = iconVariant;

}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  var CLASSNAME = 'coral3-Shell-menu';

  /**
    Overlay placement values.

    @enum {Object}
    @memberof Coral.Shell.Menu
  */
  var placement = {
    /** Anchor to the right of the page. */
    RIGHT: 'right',
    /** Anchor at the top of the page. */
    TOP: 'top'
  };

  var ALL_PLACEMENT_CLASSES = [];
  for (var placementValue in placement) {
    ALL_PLACEMENT_CLASSES.push(CLASSNAME + '--' + placement[placementValue]);
  }

  /**
    Overlay animation directions.

    @enum {Object}
    @memberof Coral.Shell.Menu
  */
  var from = {
    /** Animate in from the right. */
    RIGHT: 'right',
    /** Animate in from the top. */
    TOP: 'top'
  };

  var ALL_FROM_CLASSES = [];
  for (var fromValue in from) {
    ALL_FROM_CLASSES.push(CLASSNAME + '--' + from[fromValue]);
  }

  /**
    Lowercase the passed string if it's a string, passthrough if not.

    @ignore
  */
  function transformLowercase(alignment) {
    // Just pass through non-strings
    return typeof alignment === 'string' ? alignment.toLowerCase() : alignment;
  }

  Coral.register( /** @lends Coral.Shell.Menu# */ {
    /**
      @class Coral.Shell.Menu
      @classdesc Shell menu
      @extends Coral.Component
      @extends Coral.mixin.overlay
      @htmltag coral-shell-menu
    */
    name: 'Shell.Menu',
    tagName: 'coral-shell-menu',
    className: CLASSNAME,

    mixins: [
      Coral.mixin.overlay
    ],

    events: {
      'click [coral-close]': '_handleCloseClick',
      'global:key:escape': '_handleGlobalEscape',
      'global:capture:click': '_handleGlobalClick'
    },

    properties: {
      /**
        The side of the page the overlay should be anchored to.

        @type {Coral.Shell.Menu.placement}
        @default Coral.Shell.Menu.placement.RIGHT
        @htmlattribute placement
        @memberof Coral.Shell.Menu#
      */
      'placement': {
        default: placement.RIGHT,
        transform: transformLowercase,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(placement)
        ],
        sync: function() {
          this.classList.remove.apply(this.classList, ALL_PLACEMENT_CLASSES);
          this.classList.add(this._className + '--placement-' + this.placement);
        }
      },

      /**
        The direction the overlay should animate from.

        @type {Coral.Shell.Menu.from}
        @default Coral.Shell.Menu.from.TOP
        @htmlattribute from
        @memberof Coral.Shell.Menu#
      */
      'from': {
        default: from.TOP,
        transform: transformLowercase,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(from)
        ],
        sync: function() {
          this.classList.remove.apply(this.classList, ALL_FROM_CLASSES);
          this.classList.add(this._className + '--from-' + this.from);
        }
      },

      /**
        Whether the overlay should use all available space.

        @type {Boolean}
        @default false
        @htmlattribute full
        @memberof Coral.Shell.Menu#
      */
      'full': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        sync: function() {
          this.classList.toggle(this._className + '--full', this.full);
        }
      },

      /**
        Whether the overlay should always be on top.

        @type {Boolean}
        @default false
        @htmlattribute full
        @memberof Coral.Shell.Menu#
      */
      'top': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr
      },

      // JSDoc inherited
      'focusOnShow': {
        default: 'on'
      },

      // JSDoc inherited
      'returnFocus': {
        default: 'on'
      },

      // JSDoc inherited
      'open': {
        set: function() {
          if (this.top) {
            // Be higher than the next highest overlay
            this.style.zIndex = parseInt(this.style.zIndex, 10) + 20;
          }
        },
        sync: function() {
          if (this.open && this.focusOnShow === Coral.mixin.overlay.focusOnShow.ON) {
            var self = this;
            Coral.commons.transitionEnd(this, function() {
              var input = self.querySelector('input, textarea, select');
              if (input) {
                input.focus();
              }
              else {
                self.focus();
              }
            });
          }
        }
      }
    },

    // This must match the CSS transition time
    _overlayAnimationTime: 400,

    /** @ignore */
    _handleGlobalEscape: function() {
      // checks that it is the top most overlay before closing
      if (this.open && this._isTopOverlay()) {
        this.open = false;
      }
    },

    /**
      @todo this is duplicated between ovelay components, maybe this should be in a mixin

      @ignore
    */
    _handleCloseClick: function(event) {
      var dismissTarget = event.matchedTarget;
      var dismissValue = dismissTarget.getAttribute('coral-close');
      if (!dismissValue || this.matches(dismissValue)) {
        this.hide();
        event.stopPropagation();
      }
    },

    /**
      Makes sure that the menu is closed when outside is clicked.

      @private
    */
    _handleGlobalClick: function(event) {
      var eventTarget = event.target;

      // since this component does not have a target property like most overlays, we need to figure it if
      // @todo: introduce target to be able to remove this behavior
      var item = eventTarget.closest('coral-shell-menubar-item');

      // in case the target was clicked, we need to ignore the event
      if (item && this === item._getMenu()) {
        return;
      }
      else if (this.open && !this.contains(eventTarget)) {
        // Close if we are open and the click was outside of the target and outside of the popover
        this.hide();
      }
    }
  });
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  // Key code
  var SPACE = 32;

  Coral.register( /** @lends Coral.AnchorButton# */ {
    /**
      @class Coral.AnchorButton
      @classdesc A Link component rendering as a button.
      @htmltag coral-anchorbutton
      @htmlbasetag a
      @extends Coral.Component
      @extends HTMLAnchorElement
    */
    name: 'AnchorButton',
    tagName: 'coral-anchorbutton',
    baseTagName: 'a',
    extend: HTMLAnchorElement,
    className: Coral.Button.prototype._className,

    events: {
      'keydown': '_onKeyDown',
      'keyup': '_onKeyUp'
    },

    properties: Coral.commons.extend({}, Coral.Button.prototype._properties, {

      /**
        The label of the button.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Button#
      */
      'label': Coral.property.contentZone({
        handle: 'label',
        tagName: 'coral-anchorbutton-label',
        defaultContentZone: true,
        insert: function(label) {
          this.appendChild(label);
        }
      }),

      /**
        Disables the button from user interaction.

        @type {Boolean}
        @default false
        @htmlattribute disabled
        @htmlattributereflected
        @memberof Coral.AnchorButton#
      */
      'disabled': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        sync: function() {
          this.classList.toggle('is-disabled', this.disabled);
          this.setAttribute('tabindex', this.disabled ? '-1' : '0');
          this.setAttribute('aria-disabled', this.disabled);
        }
      }
    }),

    // since we do not properly extend Coral.Button we need to copy some private methods
    _makeAccessible: Coral.Button.prototype._makeAccessible,
    _getIconElement: Coral.Button.prototype._getIconElement,
    _updateIcon: Coral.Button.prototype._updateIcon,

    /**
      Keyboard handling per the WAI-ARIA button widget design pattern:
      https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_button_role

      @ignore
    */
    _onKeyDown: function(event) {
      if (event.keyCode === SPACE) {
        event.preventDefault();
        this.click();
        this.classList.add('is-selected');
      }
    },

    /** @ignore */
    _onKeyUp: function(event) {
      if (event.keyCode === SPACE) {
        event.preventDefault();
        this.classList.remove('is-selected');
      }
    },

    /** @ignore */
    _onClick: function(event) {
      if (this.disabled) {
        event.preventDefault();
      }
    },

    /**
      Initializes the AnchorButton. It adds the required accessibility features for it to behave like a button.

      @ignore
    */
    _initialize: function() {
      Coral.Button.prototype._initialize.call(this);
      this.setAttribute('role', 'button');
      this.setAttribute('tabindex', '0');
      // cannot use the events hash because events on disabled items are not reported
      this.addEventListener('click', this._onClick.bind(this));
    },

    /** @ignore */
    _render: function() {
      // Create a temporary fragment
      var fragment = document.createDocumentFragment();

      // Create or fetch the label element.
      var label = this.querySelector('coral-anchorbutton-label') || document.createElement('coral-anchorbutton-label');

      // Move any remaining elements into the label
      while (this.firstChild) {
        var child = this.firstChild;

        if (child.nodeType === Node.TEXT_NODE) {
          // Move text elements to the label
          label.appendChild(child);
        }
        else if (child.tagName === 'CORAL-ICON') {
          // Conserve existing icon element to content
          this._elements.icon = child;
          fragment.appendChild(child);
        }
        else {
          // Remove anything else
          this.removeChild(child);
        }
      }

      // Add the frag to the component
      this.appendChild(fragment);

      // Assign the content zones, moving them into place in the process
      this.label = label;
    }
  });

  /**
    @class Coral.AnchorButton.Label
    @classdesc The AnchorButton label content
    @htmltag coral-anchorbutton-label
    @extends HTMLElement
  */
  Coral.AnchorButton.Label = function() {
    return document.createElement('coral-anchorbutton-label');
  };
}());

window["Coral"] = window["Coral"] || {};
window["Coral"]["templates"] = window["Coral"]["templates"] || {};
window["Coral"]["templates"]["Shell"] = window["Coral"]["templates"]["Shell"] || {};
window["Coral"]["templates"]["Shell"]["user"] = (function anonymous(data_0
/**/) {
  var data = data_0;
  var el0 = this["container"] = document.createElement("div");
  el0.className += " coral3-Shell-user-container";
  el0.setAttribute("handle", "container");
  var el1 = document.createTextNode("\n  ");
  el0.appendChild(el1);
  var el2 = this["image"] = document.createElement("div");
  el2.className += " coral3-Shell-user-image";
  el2.setAttribute("handle", "image");
  var el3 = document.createTextNode("\n    ");
  el2.appendChild(el3);
  var el4 = this["avatar"] = document.createElement("coral-icon");
  el4.className += " coral3-Shell-user-avatar";
  el4.setAttribute("size", "L");
  el4.setAttribute("handle", "avatar");
  el2.appendChild(el4);
  var el5 = document.createTextNode("\n  ");
  el2.appendChild(el5);
  el0.appendChild(el2);
  var el6 = document.createTextNode("\n");
  el0.appendChild(el6);
  return el0;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  // Make sure the namespace exists
  Coral.Shell = Coral.Shell || {};

  /**
    Avatar assets should use one of those provided, when no asset is set

    @enum {String}
    @memberof Coral.Shell.User#
  */
  var avatar = {
    /** Default avatar, show user icon from icon font. */
    DEFAULT: 'user'
  };

  Coral.register( /** @lends Coral.Shell.User */ {
    /**
      @class Coral.Shell.User
      @classdesc The Shell's user component
      @extends Coral.Component
      @htmltag coral-shell-user
    */
    name: 'Shell.User',
    tagName: 'coral-shell-user',
    className: 'coral3-Shell-user',

    properties: {
      /**
        Specifies the asset used inside the avatar view.
        See {@link Coral.Icon} for valid usage and icon names.

        @type {String}
        @default user (Shows a placeholder user icon from the icon font)
        @memberof Coral.Shell.User#
        @htmlattribute avatar

        @see {@link Coral.Icon}
      */
      'avatar': {
        default: avatar.DEFAULT,
        sync: function() {
          // sets the desired asset
          this._elements.avatar.icon = this._avatar;
        }
      },

      /**
        The name content zone of the user-menu.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Shell.User#
      */
      'name': Coral.property.contentZone({
        handle: 'name',
        tagName: 'coral-shell-user-name',
        insert: function(content) {
          this._elements.container.appendChild(content);
        }
      }),

      /**
        The heading content zone of the user-menu.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Shell.User#
      */
      'heading': Coral.property.contentZone({
        handle: 'heading',
        tagName: 'coral-shell-user-heading',
        insert: function(content) {
          this._elements.container.appendChild(content);
        }
      }),

      /**
        The subheading content zone of the user-menu.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Shell.User#
      */
      'subheading': Coral.property.contentZone({
        handle: 'subheading',
        tagName: 'coral-shell-user-subheading',
        insert: function(content) {
          this._elements.container.appendChild(content);
        }
      }),

      /**
        The main content zone of the user-menu.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Shell.User#
      */
      'content': Coral.property.contentZone({
        handle: 'content',
        tagName: 'coral-shell-user-content',
        defaultContentZone: true,
        insert: function(content) {
          this.appendChild(content);
        }
      }),

      /**
        The footer content zone of the user-menu.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Shell.User#
      */
      'footer': Coral.property.contentZone({
        handle: 'footer',
        tagName: 'coral-shell-user-footer',
        insert: function(content) {
          this.appendChild(content);
        }
      })
    },

    /** @ignore */
    _render: function() {
      var fragment = document.createDocumentFragment();
      fragment.appendChild(Coral.templates.Shell.user.call(this._elements));

      var name = this._elements.name = this.querySelector('coral-shell-user-name') ||
        document.createElement('coral-shell-user-name');
      this._elements.container.appendChild(name);

      var heading = this._elements.heading = this.querySelector('coral-shell-user-heading') ||
        document.createElement('coral-shell-user-heading');
      this._elements.container.appendChild(heading);

      var subheading = this._elements.subheading = this.querySelector('coral-shell-user-subheading') ||
        document.createElement('coral-shell-user-subheading');
      this._elements.container.appendChild(subheading);

      var content = this._elements.content = this.querySelector('coral-shell-user-content') ||
        document.createElement('coral-shell-user-content');
      fragment.appendChild(content);

      var footer = this._elements.footer = this.querySelector('coral-shell-user-footer') ||
        document.createElement('coral-shell-user-footer');
      fragment.appendChild(footer);

      this.appendChild(fragment);
    }
  });
  
  /**
    @class Coral.Shell.User.Name
    @classdesc The Shell User name
    @htmltag coral-shell-user-name
    @extends HTMLElement
  */
  Coral.Shell.User.Name = function() {
    return document.createElement('coral-shell-user-name');
  };
  
  /**
    @class Coral.Shell.User.Heading
    @classdesc The Shell User heading
    @htmltag coral-shell-user-heading
    @extends HTMLElement
  */
  Coral.Shell.User.Heading = function() {
    return document.createElement('coral-shell-user-heading');
  };
  
  /**
    @class Coral.Shell.User.Subheading
    @classdesc The Shell User subheading
    @htmltag coral-shell-user-subheading
    @extends HTMLElement
  */
  Coral.Shell.User.Subheading = function() {
    return document.createElement('coral-shell-user-subheading');
  };
  
  /**
    @class Coral.Shell.User.Content
    @classdesc The Shell User content
    @htmltag coral-shell-user-content
    @extends HTMLElement
  */
  Coral.Shell.User.Content = function() {
    return document.createElement('coral-shell-user-content');
  };
  
  /**
    @class Coral.Shell.User.Footer
    @classdesc The Shell User footer
    @htmltag coral-shell-user-footer
    @extends HTMLElement
  */
  Coral.Shell.User.Footer = function() {
    return document.createElement('coral-shell-user-footer');
  };

  // exports the avator enumeration
  Coral.Shell.User.avatar = avatar;
}());

window["Coral"] = window["Coral"] || {};
window["Coral"]["templates"] = window["Coral"]["templates"] || {};
window["Coral"]["templates"]["List"] = window["Coral"]["templates"]["List"] || {};
window["Coral"]["templates"]["List"]["item"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = this["icon"] = document.createElement("coral-icon");
  el0.setAttribute("size", "S");
  el0.className += " coral3-BasicList-item-icon";
  el0.setAttribute("handle", "icon");
  frag.appendChild(el0);
  var el1 = document.createTextNode("\n");
  frag.appendChild(el1);
  var el2 = this["outerContainer"] = document.createElement("div");
  el2.className += " coral3-BasicList-item-outerContainer";
  el2.setAttribute("handle", "outerContainer");
  var el3 = document.createTextNode("\n  ");
  el2.appendChild(el3);
  var el4 = this["contentContainer"] = document.createElement("div");
  el4.className += " coral3-BasicList-item-contentContainer";
  el4.setAttribute("handle", "contentContainer");
  el2.appendChild(el4);
  var el5 = document.createTextNode("\n");
  el2.appendChild(el5);
  frag.appendChild(el2);
  return frag;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    Boolean enumeration for List keyboard interaction state.

    @enum {String}
    @memberof Coral.List#
  */
  var interaction = {
    /** Keyboard interaction is enabled. */
    ON: 'on',
    /** Keyboard interaction is disabled. */
    OFF: 'off'
  };

  Coral.register( /** @lends Coral.List */ {
    /**
      @class Coral.List
      @classdesc A list of interactive items
      @extends Coral.Component
      @htmltag coral-list
    */
    name: 'List',
    tagName: 'coral-list',
    className: 'coral3-BasicList',
    itemTagName: 'coral-list-item',

    events: {
      'capture:mouseenter [coral-list-item]': '_onItemMouseEnter',
      'key:down [coral-list-item]': '_focusNextItem',
      'key:right [coral-list-item]': '_focusNextItem',
      'key:left [coral-list-item]': '_focusPreviousItem',
      'key:up [coral-list-item]': '_focusPreviousItem',
      'key:pageup [coral-list-item]': '_focusPreviousItem',
      'key:pagedown [coral-list-item]': '_focusNextItem',
      'key:home [coral-list-item]': '_focusFirstItem',
      'key:end [coral-list-item]': '_focusLastItem'
    },

    properties: {
      /**
        The item collection.
        See {@link Coral.Collection} for more details.

        @type {Coral.Collection}
        @readonly
        @memberof Coral.List#
      */
      'items': {
        get: function() {
          // Construct the collection on first request:
          if (!this._items) {
            this._items = new Coral.Collection({
              itemTagName: this.itemTagName,
              itemBaseTagName: this.itemBaseTagName,
              itemSelector: '[coral-list-item]',
              host: this
            });
          }

          return this._items;
        },
        set: function() {}
      },

      /**
        Whether interaction with the component is enabled.

        @type {Coral.List.interaction}
        @default Coral.List.interaction.ON
        @htmlattribute interaction
        @memberof Coral.List#
      */
      'interaction': {
        default: interaction.ON,
        attribute: 'interaction',
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(interaction)
        ]
      }
    },

    /** @private */
    _onItemMouseEnter: function(event) {
      // Do not try to focus on disabled items
      if (!event.matchedTarget.hasAttribute('disabled') && this.interaction === Coral.List.interaction.ON) {
        event.matchedTarget.focus();
      }
    },

    /**
      Returns true if the event is at the matched target.

      @todo this should be moved to Coral.Component
      @private
    */
    _eventIsAtTarget: function(event) {
      var target = event.target;
      var listItem = event.matchedTarget;

      var isAtTarget = (target === listItem);

      if (isAtTarget) {
        // Don't let arrow keys etc scroll the page
        event.preventDefault();
        event.stopPropagation();
      }

      return isAtTarget;
    },

    /** @private */
    _focusFirstItem: function() {
      if (this.interaction === Coral.List.interaction.OFF || !this._eventIsAtTarget(event)) {
        return;
      }

      var items = this._getSelectableItems();
      items[0].focus();
    },

    /** @private */
    _focusLastItem: function() {
      if (this.interaction === Coral.List.interaction.OFF || !this._eventIsAtTarget(event)) {
        return;
      }

      var items = this._getSelectableItems();
      items[items.length - 1].focus();
    },

    /** @private */
    _focusNextItem: function(event) {
      if (this.interaction === Coral.List.interaction.OFF || !this._eventIsAtTarget(event)) {
        return;
      }

      var target = event.matchedTarget;
      var items = this._getSelectableItems();
      var index = items.indexOf(target);

      if (index === -1) {
        // Invalid state
        return;
      }

      if (index < items.length - 1) {
        items[index + 1].focus();
      }
      else {
        items[0].focus();
      }
    },

    /** @private */
    _focusPreviousItem: function(event) {
      if (this.interaction === Coral.List.interaction.OFF || !this._eventIsAtTarget(event)) {
        return;
      }

      var target = event.matchedTarget;
      var items = this._getSelectableItems();
      var index = items.indexOf(target);

      if (index === -1) {
        // Invalid state
        return;
      }

      if (index > 0) {
        items[index - 1].focus();
      }
      else {
        items[items.length - 1].focus();
      }
    },

    /** @private */
    _getSelectableItems: function() {
      return this.items.getAll().filter(function(item) {
        return !item.hasAttribute('hidden') && !item.hasAttribute('disabled');
      });
    },
  });

  Coral.register( /** @lends Coral.List.Item */ {
    /**
      @class Coral.List.Item
      @classdesc A list item
      @extends Coral.Component
      @htmltag coral-list-item
    */
    name: 'List.Item',
    tagName: 'coral-list-item',
    className: 'coral3-BasicList-item',

    properties: {
      /**
        The content of the help item.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.List.Item#
      */
      'content': Coral.property.contentZone({
        handle: 'content',
        tagName: 'coral-list-item-content',
        defaultContentZone: true,
        insert: function(content) {
          this._elements.contentContainer.appendChild(content);
        }
      }),

      /**
        Whether this item is disabled.

        @default false
        @type {Boolean}
        @htmlattribute disabled
        @htmlattributereflected
        @memberof Coral.AnchorList.Item#
      */
      'disabled': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        sync: function() {
          if (this.disabled) {
            this.setAttribute('aria-disabled', 'true');
          }
          else {
            this.removeAttribute('aria-disabled');
          }
        }
      },

      /**
        The icon to display.

        @type {String}
        @default ""
        @htmlattribute icon
        @memberof Coral.Button#

        @see {@link Coral.Icon}
      */
      'icon': {
        default: '',
        validate: [], // Don't do validation so setter runs
        get: function() {
          return this._elements.icon.icon;
        },
        set: function(value) {
          this._elements.icon.icon = value;

          // Hide if no icon
          this._elements.icon.hidden = this._elements.icon.icon === '';
        }
      }
    },

    /** @ignore */
    _render: function() {

      // Create a temporary fragment
      var fragment = document.createDocumentFragment();

      // Render the template
      fragment.appendChild(Coral.templates.List.item.call(this._elements));

      // Fetch or create the content content zone element
      var content = this.querySelector('coral-list-item-content') || document.createElement('coral-list-item-content');

      // Cleanup template elements (supporting cloneNode)
      Array.prototype.filter.call(this.children, function(child) {
        return (child.hasAttribute('handle'));
      }).forEach(function(handleItem) {
        this.removeChild(handleItem);
      }.bind(this));

      // Move any remaining elements into the content sub-component
      while (this.firstChild) {
        content.appendChild(this.firstChild);
      }

      // Assign the content zones, moving them into place in the process
      this.content = content;

      // Add the frag to the component
      this.appendChild(fragment);
    },

    /** @ignore */
    _initialize: function() {
      // The attribute that makes different types of list items co-exist
      // This is also used for event delegation
      this.setAttribute('coral-list-item', '');
    }
  });

  Coral.register( /** @lends Coral.List.Item.Content */ {
    /**
      @class Coral.List.Item.Content
      @classdesc The content of a list item
      @extends Coral.Component
      @htmltag coral-list-item-content
    */
    name: 'List.Item.Content',
    tagName: 'coral-list-item-content',
    className: 'coral3-BasicList-item-content'
  });

  // exposes the enum globally
  Coral.List.interaction = interaction;
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  Coral.register( /** @lends Coral.AnchorList */ {
    /**
      @class Coral.AnchorList
      @classdesc A list of interactive anchors
      @extends Coral.List
      @htmltag coral-anchorlist
    */
    name: 'AnchorList',
    tagName: 'coral-anchorlist',
    className: 'coral3-BasicList coral3-AnchorList',

    extend: Coral.List,
    itemTagName: 'coral-anchorlist-item',
    itemBaseTagName: 'a'
  });

  Coral.register( /** @lends Coral.AnchorList.Item */ {
    /**
      @class Coral.AnchorList.Item
      @classdesc An anchor list item
      @extends HTMLAnchorElement
      @extends Coral.List.Item
      @htmltag coral-anchorlist-item
    */
    name: 'AnchorList.Item',
    tagName: 'coral-anchorlist-item',
    baseTagName: 'a',
    className: 'coral3-BasicList-item coral3-AnchorList-item',

    extend: Coral.List.Item,

    events: {
      'click': '_onClick'
    },

    properties: {
      // JSDoc inherited
      'disabled': {
        sync: function(disabled) {
          if (this.disabled) {
            // It's not tabbable anymore
            this.tabIndex = -1;
          }
          else {
            // Now it's tabbable
            this.tabIndex = 0;
          }
        }
      }
    },

    /** @private */
    _onClick: function(event) {
      // Support disabled property
      if (this.disabled) {
        event.preventDefault();
      }
    }
  });
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  Coral.register( /** @lends Coral.ButtonList */ {
    /**
      @class Coral.ButtonList
      @classdesc A list of interactive buttons
      @extends Coral.List
      @htmltag coral-buttonlist
    */
    name: 'ButtonList',
    tagName: 'coral-buttonlist',
    className: 'coral3-BasicList coral3-ButtonList',

    extend: Coral.List,
    itemTagName: 'coral-buttonlist-item',
    itemBaseTagName: 'button'
  });

  Coral.register( /** @lends Coral.ButtonList.Item */ {
    /**
      @class Coral.ButtonList.Item
      @classdesc An button list item
      @extends HTMLButtonElement
      @extends Coral.BaseList.Item
      @htmltag coral-buttonlist-item
    */
    name: 'ButtonList.Item',
    tagName: 'coral-buttonlist-item',
    baseTagName: 'button',
    className: 'coral3-BasicList-item coral3-ButtonList-item',

    extend: Coral.List.Item,

    properties: {
      // Don't try to define disabled as HTMLButtonElement already does
      'disabled' : null
    }
  });
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  // https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories
  var LABELLABLE_ELEMENTS_SELECTOR = 'button,input:not([type=hidden]),keygen,meter,output,progress,select,textarea';
  // _onInputChange is only triggered on non-hidden inputs
  var TARGET_INPUT_SELECTOR = 'input:not([type=hidden])';

  var properties = {
    /**
      Whether this field is disabled or not.

      @type {Boolean}
      @default false
      @htmlattribute disabled
      @htmlattributereflected
      @memberof Coral.mixin.formField#
    */
    'disabled': {
      default: false,
      reflectAttribute: true,
      transform: Coral.transform.boolean,
      attributeTransform: Coral.transform.booleanAttr,
      sync: function() {
        this.setAttribute('aria-disabled', this.disabled);
      }
    },

    /**
      Whether the current value of this field is invalid or not.

      @type {Boolean}
      @default false
      @htmlattribute invalid
      @htmlattributereflected
      @memberof Coral.mixin.formField#
    */
    'invalid': {
      default: false,
      reflectAttribute: true,
      transform: Coral.transform.boolean,
      attributeTransform: Coral.transform.booleanAttr,
      sync: function() {
        this.setAttribute('aria-invalid', this.invalid);
      }
    },

    /**
      Name used to submit the data in a form.

      @type {String}
      @default ""
      @htmlattribute name
      @htmlattributereflected
      @memberof Coral.mixin.formField#
    */
    'name': {
      default: '',
      reflectAttribute: true,
      transform: Coral.transform.string
    },

    /**
      Whether this field is readOnly or not. Indicating that the user cannot modify the value of the control.
      This is ignored for checkbox, radio or fileupload.

      @type {Boolean}
      @default false
      @htmlattribute readonly
      @htmlattributereflected
      @memberof Coral.mixin.formField#
    */
    'readOnly': {
      default: false,
      reflectAttribute: true,
      attribute: 'readonly',
      transform: Coral.transform.boolean,
      attributeTransform: Coral.transform.booleanAttr,
      sync: function() {
        this.setAttribute('aria-readonly', this.readOnly);
      }
    },

    /**
      Whether this field is required or not.

      @type {Boolean}
      @default false
      @htmlattribute required
      @htmlattributereflected
      @memberof Coral.mixin.formField#
    */
    'required': {
      default: false,
      reflectAttribute: true,
      transform: Coral.transform.boolean,
      attributeTransform: Coral.transform.booleanAttr,
      sync: function() {
        this.setAttribute('aria-required', this.required);
      }
    },

    /**
      This field's current value.

      @type {String}
      @default ""
      @htmlattribute value
      @memberof Coral.mixin.formField#

      @fires Coral.mixin.formField#change
    */
    'value': {
      default: '',
      transform: Coral.transform.string
    },

    /**
      Reference to a space delimited set of ids for the HTML elements that provide a label for the formField.
      Implementers should override this method to ensure that the appropriate descendant elements are labelled using the
      <code>aria-labelledby</code> attribute. This will ensure that the component is properly identified for
      accessibility purposes. It reflects the <code>aria-labelledby</code> attribute to the DOM.

      @type {?String}
      @default null
      @htmlattribute labelledby
      @memberof Coral.mixin.formField#
    */
    'labelledBy': {
      attribute: 'labelledby',
      transform: Coral.transform.string,
      get: function() {
        return this._getLabellableElement().getAttribute('aria-labelledby');
      },
      set: function(value) {
        // gets the element that will get the label assigned. the _getLabellableElement method should be overriden to
        // allow other bevaviors.
        var element = this._getLabellableElement();
        // we get and assign the it that will be passed around
        var elementId = element.id = element.id || Coral.commons.getUID();

        var currentLabelledBy = element.getAttribute('aria-labelledby');

        // we clear the old label asignments
        if (currentLabelledBy && currentLabelledBy !== value) {
          this._updateForAttributes(currentLabelledBy, elementId, true);
        }

        if (value) {
          element.setAttribute('aria-labelledby', value);
          if (element.matches(LABELLABLE_ELEMENTS_SELECTOR)) {
            this._updateForAttributes(value, elementId);
          }
        }
        else {
          // since no labelledby value was set, we remove everything
          element.removeAttribute('aria-labelledby');
        }
      }
    }
  };

  // Methods to add
  var methods = {
    /**
      Gets the element that should get the label. In case none of the valid labelelable items are found, the component
      will be labelled instead.

      @protected
      @memberof Coral.mixin.formField#

      @returns {HTMLElement} the labellable element.
    */
    _getLabellableElement: function() {
      var element = this.querySelector(LABELLABLE_ELEMENTS_SELECTOR);

      // Use the found element or the container
      return element || this;
    },

    /**
      Gets the internal input that the mixin.formField would watch for change. By default, it searches if the
      <code>_getLabellableElement()</code> is an input. Components can override this function to be able to provide a
      different implementation. In case the value is <code>null</code>, the change event will be handled no matter
      the input that produced it.

      @protected
      @memberof Coral.mixin.formField#

      @return {HTMLElement} the input to watch for changes.
    */
    _getTargetChangeInput: function() {
      // we use this._targetChangeInput as an internal cache to avoid querying the DOM again every time
      return this._targetChangeInput ||
        // assignment returns the value
        (this._targetChangeInput = this._getLabellableElement().matches(TARGET_INPUT_SELECTOR) ?
          this._getLabellableElement() : null);
    },

    /**
      Function called whenever the target component triggers a change event. <code>_getTargetChangeInput</code> is used
      internally to determine if the input belongs to the component. If the component decides to override this function,
      the default from the mixin will not be called.

      @protected
      @memberof Coral.mixin.formField#
    */
    _onInputChange: function(event) {
      // stops the current event
      event.stopPropagation();

      this[this._componentTargetProperty] = event.target[this._eventTargetProperty];

      // Explicitly re-emit the change event after the property has been set
      if (this._triggerChangeEvent) {
        this.trigger('change');
      }
    },

    /**
      Resets the formField when a reset is triggered on the parent form.

      @protected
      @memberof Coral.mixin.formField#
    */
    _onFormReset: function(event) {
      if (event.target.contains(this)) {
        this.reset();
      }
    },

    /**
      We capture every input change and validate that it belongs to our target input. If this is the case,
      <code>_onInputChange</code> will be called with the same event.

      @protected
      @memberof Coral.mixin.formField#
    */
    _onTargetInputChange: function(event) {
      var targetInput = this._getTargetChangeInput();
      // if the targetInput is null we still call _onInputChange to be backwards compatible
      if (targetInput === event.target || targetInput === null) {
        // we call _onInputChange since the target matches
        this._onInputChange(event);
      }
    },

    /**
      A utility method for adding the appropriate <code>for</code> attribute to any <code>label</code> elements
      referenced by the <code>labelledBy</code> property value.

      @param {String} labelledBy
        The value of the <code>labelledBy<code> property providing a space-delimited list of the <code>id</code>
        attributes for elements that label the formField.
      @param {String} elementId
        The <code>id</code> of the formField or one of its descendants that should be labelled by
        <code>label</code> elements referenced by the <code>labelledBy</code> property value.
      @param {Boolean} remove
        Whether the existing <code>for</code> attributes should be removed.

      @protected
      @memberof Coral.mixin.formField#
    */
    _updateForAttributes: function(labelledBy, elementId, remove) {
      // labelledby contains whitespace sparated items, so we need to separate each individual id
      var labelIds = labelledBy.split(/\s+/);
      // we update the 'for' attribute for every id.
      labelIds.forEach(function(currentValue) {
        var labelElement = document.getElementById(currentValue);
        if (labelElement && labelElement.tagName === 'LABEL') {
          var forAttribute = labelElement.getAttribute('for');

          if (remove) {
            // we just remove it when it is our target
            if (forAttribute === elementId) {
              labelElement.removeAttribute('for');
            }
          }
          else {
            // if we do not have to remove, it does not matter the current value of the label, we can set it in every
            // case
            labelElement.setAttribute('for', elementId);
          }
        }
      });
    },

    /**
      Clears the <code>value</code> of formField to the default value.
    */
    clear: function() {
      this.value = '';
    },

    /**
      Resets the <code>value</code> to the initial value.
    */
    reset: function() {
      // since the 'value' property is not reflected, form components use it to restore the initial value. When a
      // component has support for values, this method needs to be overwritten
      this.value = Coral.transform.string(this.getAttribute('value'));
    }
  };

  // Events to add
  var events = {
    'capture:change input': '_onTargetInputChange',
    'global:reset': '_onFormReset'
  };

  // The properties whose set/get methods must be implemented by the component we're mixed into
  var requiredPropertySet = [
    'name',
    'value'
  ];

  // Props we should not add if we inhert from HTMLInputElement
  var defaultProps = [
    'disabled',
    'name',
    'required',
    'readOnly',
    'value'
  ];

  // Basic properties to add to the prototype
  var basicProperties = {
    /**
      Target property inside the component that will be updated when a change event is triggered.

      @type {String}
      @default "value"
      @protected
      @memberof Coral.mixin.formField#
    */
    _componentTargetProperty: 'value',

    /**
      Target property that will be taken from <code>event.target</code> and set into
      {@link Coral.mixin.formField#_componentTargetProperty} when a change event is triggered.

      @type {String}
      @default "value"
      @protected
      @memberof Coral.mixin.formField#
    */
    _eventTargetProperty: 'value',


    /**
      Whether the change event needs to be triggered when {@link Coral.mixin.formField#_onInputChange} is called.

      @type {Boolean}
      @default true
      @protected
      @memberof Coral.mixin.formField#
    */
    _triggerChangeEvent: true
  };

  /**
    Configure a component to have the basic properties that are expected inside a form.

    @class
  */
  Coral.mixin.formField = function(prototype, options) {
    // Add methods
    Coral.commons.augment(prototype, methods, function(objectMethod, mixinMethod, propName) {
      // Use the provided methods if overridden
      if (propName === 'reset' ||
        propName === 'clear' ||
        propName === '_onTargetInputChange' ||
        propName === '_onInputChange' ||
        propName === '_getTargetChangeInput' ||
        propName === '_getLabellableElement') {
        return objectMethod;
      }
      return Coral.commons.callAll(mixinMethod, objectMethod);
    });

    // Define events, letting the object override the mixin
    prototype._events = Coral.commons.augment({}, prototype._events, events);

    // Define basic properties, letting the object override the mixin
    Coral.commons.augment(prototype, basicProperties);

    // Only try to include properties that are not defined in this or any parent prototype
    var targetProperties = {};
    var prop;

    // Check if the prototype inherits from HTMLInputElement
    var skipDefaultProps = false;
    var curProto = prototype;
    while (curProto) {
      if (curProto === HTMLInputElement.prototype || curProto === HTMLTextAreaElement.prototype) {
        skipDefaultProps = true;
        break;
      }
      curProto = Object.getPrototypeOf(curProto);
    }

    for (prop in properties) {
      // Skip properties implemented by HTMLInputElement if necessary
      if (skipDefaultProps && defaultProps.indexOf(prop) !== -1) {
        continue;
      }
      targetProperties[prop] = properties[prop];
    }

    // Property sync is not reinforced if they were not added
    if (!skipDefaultProps) {
      // Throw if required set methods are not implemented
      requiredPropertySet.forEach(function(propName) {
        if (!targetProperties[propName]) {
          // Do not complain if it is already implemented
          return;
        }

        if (
          !options.properties[propName] ||
          typeof options.properties[propName].set !== 'function' ||
          typeof options.properties[propName].get !== 'function'
        ) {
          throw new Error('Coral.mixin.formField: You must implement properties.' + propName +
            '.set() and properties.' + propName + '.get()');
        }
      });
    }

    // Augment property descriptors
    Coral.register.augmentProperties(options.properties, targetProperties);
  };

  /**
    Triggered when the value has changed. This event is only triggered by user interaction.

    @event Coral.mixin.formField#change

    @param {Object} event
      Event object.
  */
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    Enum for textfield variant values.
    @enum {String}
    @memberof Coral.Textfield
  */
  var variant = {
    /** A default textfield */
    DEFAULT: 'default',
    /** A textfield with no border or background. */
    QUIET: 'quiet'
  };

  // the textfield's base classname
  var CLASSNAME = 'coral3-Textfield';

  // Builds a string containing all possible variant classnames. This will be used to remove classnames when the variant
  // changes
  var ALL_VARIANT_CLASSES = [];
  for (var variantValue in variant) {
    ALL_VARIANT_CLASSES.push(CLASSNAME + '--' + variant[variantValue]);
  }

  Coral.register( /** @lends Coral.Textfield# */ {
    /**
      @class Coral.Textfield
      @classdesc A Textfield component
      @htmltag coral-textfield
      @htmlbasetag input
      @extends Coral.Component
      @extends Coral.mixin.formField
    */
    name: 'Textfield',
    tagName: 'coral-textfield',
    baseTagName: 'input',
    extend: HTMLInputElement,
    className: CLASSNAME,

    mixins: [
      Coral.mixin.formField
    ],

    properties: {
      // JSDoc inherited
      'invalid': {
        sync: function() {
          this.classList.toggle('is-invalid', this.invalid);
        }
      },
      /**
        The textfield's variant.
        @type {Coral.Textfield.variant}
        @default Coral.Textfield.variant.DEFAULT
        @htmlattribute variant
        @memberof Coral.Textfield#
      */
      'variant': {
        default: variant.DEFAULT,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(variant)
        ],
        sync: function() {
          // removes every existing variant
          this.classList.remove.apply(this.classList, ALL_VARIANT_CLASSES);

          if (this.variant !== Coral.Textfield.variant.DEFAULT) {
            this.classList.add(this._className + '--' + this.variant);
          }
        }
      }
    }
  });

  // exports the variants enumeration
  Coral.Textfield.variant = variant;
}());

window["Coral"] = window["Coral"] || {};
window["Coral"]["strings"] = window["Coral"]["strings"] || {};
window["Coral"]["strings"]["coralui-component-search"] = {"it-IT":{"Clear search":"Azzera ricerca"},"ja-JP":{"Clear search":"検索をクリア"},"es-ES":{"Clear search":"Borrar búsqueda"},"ko-KR":{"Clear search":"검색 지우기"},"zh-CN":{"Clear search":"清除搜索"},"zh-TW":{"Clear search":"清除搜尋"},"pt-BR":{"Clear search":"Limpar busca"},"nl-NL":{"Clear search":"Zoekopdracht wissen"},"en-US":{"Clear search":"Clear search"},"de-DE":{"Clear search":"Suche löschen"},"fr-FR":{"Clear search":"Effacer la recherche"}};
window["Coral"] = window["Coral"] || {};
window["Coral"]["templates"] = window["Coral"]["templates"] || {};
window["Coral"]["templates"]["search"] = window["Coral"]["templates"]["search"] || {};
window["Coral"]["templates"]["search"]["base"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = this["icon"] = document.createElement("coral-icon");
  el0.className += " coral-DecoratedTextfield-icon";
  el0.setAttribute("size", "S");
  el0.setAttribute("handle", "icon");
  frag.appendChild(el0);
  var el1 = document.createTextNode("\n");
  frag.appendChild(el1);
  var el2 = this["input"] = document.createElement("input","coral-textfield");
  el2.setAttribute("type", "text");
  el2.className += " coral-DecoratedTextfield-input coral3-Search-input";
  el2.setAttribute("is", "coral-textfield");
  el2.setAttribute("handle", "input");
  frag.appendChild(el2);
  var el3 = document.createTextNode("\n");
  frag.appendChild(el3);
  var el4 = this["clearButton"] = document.createElement("button","coral-button");
  el4.setAttribute("type", "button");
  el4.setAttribute("aria-label", Coral["i18n"]["get"]('Clear search'));
  el4.setAttribute("is", "coral-button");
  el4.setAttribute("variant", "minimal");
  el4.setAttribute("icon", "close");
  el4.setAttribute("iconsize", "XS");
  el4.className += " coral-DecoratedTextfield-button";
  el4.setAttribute("handle", "clearButton");
  frag.appendChild(el4);
  return frag;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    Enum for search variant values.

    @enum {String}
    @memberof Coral.Search
  */
  var variant = {
    /** A default, gray search input */
    DEFAULT: 'default',
    /** A search with no border, no background, no glow */
    QUIET: 'quiet'
  };

  Coral.register( /** @lends Coral.Search# */ {
    /**
      @class Coral.Search
      @classdesc A Search component
      @extends Coral.Component
      @extends Coral.mixin.formField
      @htmltag coral-search
    */
    name: 'Search',
    tagName: 'coral-search',
    className: 'coral3-Search coral-DecoratedTextfield',

    mixins: [
      Coral.mixin.formField
    ],

    events: {
      // @todo use Coral.keys when key combos don't interfere with single key execution
      'keydown [handle=input]': '_onEnterKey',
      'keyup [handle=input]': '_onKeyUp',

      // @todo use coralinternalinput from Autocomplete
      'input [handle=input]': '_triggerInputEvent',

      'key:escape [handle=input]': '_clearInput',
      'click [handle=clearButton]:not(:disabled)': '_clearInput'
    },

    properties: {
      // JSDoc inherited
      'value': {
        get: function() {
          return this._elements.input.value;
        },
        set: function(value) {
          // sets the value immediately so it is picked up in form submits
          this._elements.input.value = value;
        }
      },

      // JSDoc inherited
      'name': {
        get: function() {
          return this._elements.input.name;
        },
        set: function(value) {
          this._elements.input.name = value;
        }
      },

      // JSDoc inherited
      'disabled': {
        sync: function() {
          this.classList.toggle('is-disabled', this.disabled);

          this._elements.input.disabled = this.disabled;
          this._elements.clearButton.disabled = this.disabled;
        }
      },

      // JSDoc inherited
      'invalid': {
        sync: function() {
          this.classList.toggle('is-invalid', this.invalid);

          this._elements.input.classList.toggle('is-invalid', this.invalid);
          this._elements.input.setAttribute('aria-invalid', this.invalid);
        }
      },

      // JSDoc inherited
      'required': {
        sync: function() {
          this._elements.input.required = this.required;
        }
      },

      // JSDoc inherited
      'labelledBy': {
        sync: function() {
          // in case the user focuses the buttons, he will still get a notion of the usage of the component
          if (this.labelledBy) {
            this.setAttribute('aria-labelledby', this.labelledBy);
          }
          else {
            this.removeAttribute('aria-labelledby');
          }
        }
      },

      /**
        Short hint that describes the expected value of the Search. It is displayed when the Search is empty.

        @type {String}
        @default ""
        @htmlattribute placeholder
        @htmlattributereflected
        @memberof Coral.Search#
      */
      'placeholder': {
        default: '',
        reflectAttribute: true,
        transform: Coral.transform.string,
        get: function() {
          return this._elements.input.placeholder;
        },
        set: function(value) {
          this._elements.input.placeholder = value;
        }
      },

      /**
        Max length for the Input field.

        @type {Long}
        @htmlattribute maxlength
        @htmlattributereflected
        @memberof Coral.Search#
      */
      'maxLength' : {
        attribute: 'maxlength',
        reflectAttribute: true,
        set: function(value) {
          this._elements.input.maxLength = value;
        },
        get: function() {
          return this._elements.input.maxLength;
        }
      },

      /**
        This sets the left icon on the search component.

        @type {String}
        @default "search"
        @htmlattribute icon
        @htmlattributereflected
        @memberof Coral.Search#
      */
      'icon': {
        default: 'search',
        validate: [], // Let Icon handle this
        reflectAttribute: true,
        set: function(icon) {
          this._elements.icon.icon = icon;

          // Hide if no icon provided
          this._elements.icon.hidden = !this._elements.icon.icon;
        },
        get: function() {
          return this._elements.icon.icon;
        }
      },

      /**
        The search's variant.

        @type {Coral.Search.variant}
        @default Coral.Search.variant.DEFAULT
        @htmlattribute variant
        @memberof Coral.Search#
      */
      'variant': {
        default: variant.DEFAULT,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(variant)
        ],
        sync: function() {
          // provide the variant internally
          this._elements.input.variant = this.variant;
        }
      }
    },

    /** @ignore */
    _triggerInputEvent: function() {
      this.trigger('coral-search:input');
    },

    /**
      Handles the up action by steping up the Search. It prevents the default action.

      @ignore
    */
    _onEnterKey: function(event) {
      if (event.which === 13) {
        event.preventDefault();

        // stops interaction if the search is disabled
        if (this.disabled) {
          return;
        }

        this.trigger('coral-search:submit');
      }
    },

    /**
      Handles the keydown action.

      @ignore
    */
    _onKeyUp: function(event) {
      this._updateClearButton();
    },

    /**
      Updates the clear button's display status.

      @ignore
    */
    _updateClearButton: function() {
      if (this._elements.input.value === '') {
        this._elements.clearButton.style.display = 'none';
      }
      else {
        this._elements.clearButton.style.display = '';
      }
    },

    /**
      Clears the text in the input box.

      @ignore
    */
    _clearInput: function(event) {
      this._elements.input.value = '';
      this._updateClearButton();
      this._elements.input.focus();

      // If we've been cleared, trigger the event
      this.trigger('coral-search:clear');
    },

    /**
      Modified to target the input instead of the button.

      @private
    */
    _getLabellableElement: function() {
      return this._elements.input;
    },

    /** @ignore */
    _initialize: function() {
      this._updateClearButton();
    },

    /** @ignore */
    _render: function() {
      this.appendChild(Coral.templates.search.base.call(this._elements));
    }

    /**
      Triggerred when input is given.

      @event Coral.Search#coral-search:input

      @param {Object} event
        Event object.
    */

    /**
      Triggerred when the user presses enter.

      @event Coral.Search#coral-search:submit

      @param {Object} event
        Event object.
    */

    /**
      Triggerred when the search is cleared.

      @event Coral.Search#coral-search:clear

      @param {Object} event
        Event object.
    */
  });

  // exports the variants enumeration
  Coral.Search.variant = variant;
}());

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    Enum for wait variant values.

    @enum {String}
    @memberof Coral.Wait
  */
  var variant = {
    /** The default variant. */
    DEFAULT: 'default',
    /** A dot styled wait. */
    DOTS: 'dots'
  };

  /**
    Enumeration representing wait indicator sizes.

    @memberof Coral.Wait
    @enum {String}
  */
  var size = {
    /** A small wait indicator. This is the default size. */
    SMALL: 'S',
    /** A medium wait indicator. */
    MEDIUM: 'M',
    /** A large wait indicator. */
    LARGE: 'L'
  };


  // the waits's base classname
  var CLASSNAME = 'coral3-Wait';

  // builds a string containing all possible variant classnames. this will be used to remove classnames when the variant
  // changes
  var ALL_VARIANT_CLASSES = [];
  for (var variantValue in variant) {
    ALL_VARIANT_CLASSES.push(CLASSNAME + '--' + variant[variantValue]);
  }

  Coral.register( /** @lends Coral.Wait# */ {
    /**
      @class Coral.Wait
      @classdesc A Wait component
      @extends Coral.Component
      @htmltag coral-wait
    */
    name: 'Wait',
    tagName: 'coral-wait',
    className: CLASSNAME,
    properties: {

      /**
        The size of the wait indicator. Currently 'S' (the default), 'M' and 'L' are available.
        See {@link Coral.Wait.size}
        @type {Coral.Wait.size}
        @default Coral.Wait.size.SMALL
        @htmlattribute size
        @memberof Coral.Wait#
      */
      'size': {
        default: size.SMALL,
        transform: function(value) {
          return typeof value === 'string' ? value.toUpperCase() : value;
        },
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(size)
        ],
        set: function(value) {
          this._size = value;

          // large css change
          this.classList.toggle(this._className + '--large', this.size === size.LARGE);

          // medium css change
          this.classList.toggle(this._className + '--medium', this.size === size.MEDIUM);
        }
      },

      /**
        Whether the component is centered or not. The container needs to have the style <code>position: relative</code>
        for the centering to work correctly.

        @type {Boolean}
        @default false
        @htmlattribute centered
        @htmlattributereflected
        @memberof Coral.Wait#
      */
      'centered': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        sync: function() {
          this.classList.toggle(this._className + '--centered', this.centered);
        }
      },

      /**
        The wait's variant.

        @type {Coral.Wait.variant}
        @default Coral.Wait.variant.DEFAULT
        @htmlattribute variant
        @memberof Coral.Wait#
      */
      'variant': {
        default: variant.DEFAULT,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(variant)
        ],
        set: function(value) {
          this._variant = value;

          // removes every existing variant
          this.classList.remove.apply(this.classList, ALL_VARIANT_CLASSES);

          if (this.variant !== variant.DEFAULT) {
            this.classList.add(this._className + '--' + this.variant);
          }
        }
      }
    }
  });

  // expose enumerations
  Coral.Wait.size = size;
  Coral.Wait.variant = variant;
}());

window["Coral"] = window["Coral"] || {};
window["Coral"]["strings"] = window["Coral"]["strings"] || {};
window["Coral"]["strings"]["coralui-component-shell-help"] = {"en-US":{"Search for Help":"Search for Help","Searching Help…":"Searching Help…","Error fetching results":"Error fetching results","No results found":"No results found","See all {0} results":"See all {0} results"},"fr-FR":{"Search for Help":"Rechercher de l’aide","Searching Help…":"Recherche dans l’aide…","Error fetching results":"Erreur lors de la récupération des résultats","No results found":"Aucun résultat trouvé","See all {0} results":"Voir les {0} résultats"},"de-DE":{"Search for Help":"Nach Hilfe suchen","Searching Help…":"Suche nach Hilfe …","Error fetching results":"Fehler beim Abruf von Ergebnissen","No results found":"Keine Ergebnisse gefunden","See all {0} results":"Alle {0} Ergebnisse anzeigen"},"it-IT":{"Search for Help":"Cerca informazioni nell'Aiuto","Searching Help…":"Ricerca aiuto…","Error fetching results":"Errore durante il recupero dei risultati","No results found":"Nessun risultato trovato","See all {0} results":"Visualizza tutti i {0} risultati"},"es-ES":{"Search for Help":"Buscar ayuda","Searching Help…":"Buscando ayuda…","Error fetching results":"Error al obtener los resultados","No results found":"No se han encontrado resultados","See all {0} results":"Ver los {0} resultados"},"pt-BR":{"Search for Help":"Procurar nas seções de Ajuda","Searching Help…":"Pesquisando ajuda…","Error fetching results":"Erro ao obter resultados","No results found":"Nenhum resultado encontrado","See all {0} results":"Ver todos os resultados de {0}"},"ja-JP":{"Search for Help":"ヘルプを検索","Searching Help…":"ヘルプを検索中…","Error fetching results":"結果を取得中にエラーが発生しました","No results found":"結果が見つかりませんでした","See all {0} results":"すべての {0} 結果を確認"},"ko-KR":{"Search for Help":"도움말 검색","Searching Help…":"도움말 검색 중…","Error fetching results":"결과를 가져오는 중 오류 발생","No results found":"결과를 찾을 수 없습니다","See all {0} results":"총 {0}개 결과 보기"},"zh-CN":{"Search for Help":"搜索帮助","Searching Help…":"正在搜索帮助…","Error fetching results":"获取结果时出错","No results found":"找不到任何结果","See all {0} results":"查看全部 {0} 个结果"},"zh-TW":{"Search for Help":"搜尋說明","Searching Help…":"正在搜尋說明…","Error fetching results":"擷取結果時發生錯誤","No results found":"找不到結果","See all {0} results":"查看全部 {0} 個結果"},"nl-NL":{"Search for Help":"Zoeken naar hulp","Searching Help…":"Hulp zoeken…","Error fetching results":"Fout bij ophalen resultaten","No results found":"Geen resultaten gevonden","See all {0} results":"Alle {0} resultaten bekijken"}};
window["Coral"] = window["Coral"] || {};
window["Coral"]["templates"] = window["Coral"]["templates"] || {};
window["Coral"]["templates"]["Shell"] = window["Coral"]["templates"]["Shell"] || {};
window["Coral"]["templates"]["Shell"]["help"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0 = typeof data_0 === "undefined" ? {} : data_0;
  data = data_0;
  
var labelId = Coral.commons.getUID();

  data_0 = data;
  var el1 = document.createTextNode("\n");
  frag.appendChild(el1);
  var el2 = document.createElement("label");
  el2.className += " u-coral-screenReaderOnly";
  el2.id = labelId;
  el2.textContent = Coral["i18n"]["get"]('Search for Help');
  frag.appendChild(el2);
  var el3 = document.createTextNode("\n");
  frag.appendChild(el3);
  var el4 = this["search"] = document.createElement("coral-search");
  el4.className += " coral3-Shell-help-search";
  el4.setAttribute("handle", "search");
  el4.setAttribute("placeholder", Coral["i18n"]["get"]('Search for Help'));
  el4.setAttribute("labelledby", labelId);
  frag.appendChild(el4);
  var el5 = document.createTextNode("\n");
  frag.appendChild(el5);
  var el6 = this["items"] = document.createElement("div");
  el6.className += " coral3-Shell-help-items";
  el6.setAttribute("handle", "items");
  frag.appendChild(el6);
  var el7 = document.createTextNode("\n");
  frag.appendChild(el7);
  var el8 = this["results"] = document.createElement("coral-anchorlist");
  el8.className += " coral3-Shell-help-results";
  el8.setAttribute("handle", "results");
  el8.setAttribute("hidden", "");
  frag.appendChild(el8);
  var el9 = document.createTextNode("\n");
  frag.appendChild(el9);
  var el10 = this["resultMessage"] = document.createElement("div");
  el10.className += " coral3-Shell-help-resultMessage";
  el10.setAttribute("handle", "resultMessage");
  el10.setAttribute("hidden", "");
  frag.appendChild(el10);
  var el11 = document.createTextNode("\n");
  frag.appendChild(el11);
  var el12 = this["loading"] = document.createElement("div");
  el12.className += " coral3-Shell-help-loading";
  el12.setAttribute("handle", "loading");
  el12.setAttribute("hidden", "");
  var el13 = document.createTextNode("\n  ");
  el12.appendChild(el13);
  var el14 = document.createElement("coral-wait");
  el14.setAttribute("size", "S");
  el14.className += " coral3-Shell-help-loading-wait";
  el12.appendChild(el14);
  var el15 = document.createTextNode("\n  ");
  el12.appendChild(el15);
  var el16 = document.createElement("span");
  el16.className += " coral-Heading--2 coral3-Shell-help-loading-info";
  el16.textContent = Coral["i18n"]["get"]('Searching Help…');
  el12.appendChild(el16);
  var el17 = document.createTextNode("\n");
  el12.appendChild(el17);
  frag.appendChild(el12);
  return frag;
});

window["Coral"]["templates"]["Shell"]["helpResult"] = (function anonymous(data_0
/**/) {
  var data = data_0;
  var el0 = document.createElement("coral-list-item-content");
  var el1 = document.createTextNode(data_0["title"]+"\n");
  el0.appendChild(el1);
  var el2 = document.createElement("div");
  el2.className += " coral3-Shell-help-result-description";
  el2.textContent = data_0["description"];
  el0.appendChild(el2);
  var el3 = document.createTextNode("\n");
  el0.appendChild(el3);
  return el0;
});

window["Coral"]["templates"]["Shell"]["helpSearchError"] = (function anonymous(data_0
/**/) {
  var data = data_0;
  var el0 = document.createElement("div");
  el0.className += " coral3-Shell-help-resultMessage-container";
  var el1 = document.createTextNode("\n  ");
  el0.appendChild(el1);
  var el2 = document.createElement("div");
  el2.className += " coral-Heading--1 coral3-Shell-help-resultMessage-heading";
  el2.textContent = Coral["i18n"]["get"]('Error fetching results');
  el0.appendChild(el2);
  var el3 = document.createTextNode("\n");
  el0.appendChild(el3);
  return el0;
});

window["Coral"]["templates"]["Shell"]["noHelpResults"] = (function anonymous(data_0
/**/) {
  var data = data_0;
  var el0 = document.createElement("div");
  el0.className += " coral3-Shell-help-resultMessage-container";
  var el1 = document.createTextNode("\n  ");
  el0.appendChild(el1);
  var el2 = document.createElement("div");
  el2.className += " coral-Heading--1 coral3-Shell-help-resultMessage-heading";
  el2.textContent = Coral["i18n"]["get"]('No results found');
  el0.appendChild(el2);
  var el3 = document.createTextNode("\n");
  el0.appendChild(el3);
  return el0;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  Coral.register( /** @lends Coral.Shell.Help */ {
    /**
      @class Coral.Shell.Help
      @classdesc The Shell's help component
      @extends Coral.AnchorList
      @htmltag coral-shell-help
    */
    name: 'Shell.Help',
    tagName: 'coral-shell-help',
    className: 'coral3-BasicList coral3-AnchorList coral3-Shell-help',
    extend: Coral.AnchorList,

    events: {
      'coral-search:clear': '_showItems',
      'coral-search:submit': '_performSearch'
    },

    properties: {
      /**
        The item collection.
        See {@link Coral.Collection} for more details.

        @type {Coral.Collection}
        @readonly
        @memberof Coral.Shell.Help#
      */
      'items': {
        get: function() {
          // Construct the collection on first request:
          if (!this._items) {
            this._items = new Coral.Collection({
              host: this,
              itemTagName: 'coral-shell-help-item',
              itemBaseTagName: 'a',
              container: this._elements.items
            });
          }

          return this._items;
        },
        set: function() {}
      },

      /**
        The search field placeholder.

        @type {String}
        @default ""
        @htmlattribute placeholder
        @memberof Coral.Shell.Help#
      */
      'placeholder': {
        set: function(value) {
          this._elements.search.placeholder = value;
        },
        get: function() {
          return this._elements.search.placeholder;
        }
      }
    },

    /** @private */
    _moveItems: function() {
      var self = this;
      self.id = self.id || Coral.commons.getUID();
      Array.prototype.forEach.call(self.querySelectorAll('#' + self.id + ' > a[is="coral-shell-help-item"]'), function(item) {
        self._elements.items.appendChild(item);
      });
    },

    /** @private */
    _performSearch: function(event) {
      event.stopPropagation();

      // Show loading
      this._elements.items.hidden = true;
      this._elements.loading.hidden = false;
      this._elements.resultMessage.hidden = true;
      this._elements.results.hidden = true;

      // Trigger event
      var searchTerm = this._elements.search.value;
      this.trigger('coral-shell-help:search', {
        value: searchTerm
      });
    },

    /** @private */
    _showItems: function(event) {
      event.stopPropagation();

      // Hide search results
      this._elements.results.hidden = true;

      // Hide loading
      this._elements.loading.hidden = true;

      // Hide no-results
      this._elements.resultMessage.hidden = true;

      // Show items
      this._elements.items.hidden = false;
    },

    /** @ignore */
    _render: function() {
      var fragment = Coral.templates.Shell.help.call(this._elements);

      // Move the stuff into the right place
      this._moveItems();

      this.appendChild(fragment);
    },

    /**
      Indicate to the user that an error has occurred
    */
    showError: function() {
      // Hide loading
      this._elements.loading.hidden = true;

      this._elements.resultMessage.innerHTML = '';

      this._elements.resultMessage.appendChild(Coral.templates.Shell.helpSearchError());

      this._elements.resultMessage.hidden = false;
    },

    /**
      Show a set of search results.

      @param {Array.<Coral.Shell.Help~result>} results
        A set of search result objects.
      @param {Number} total
        The total number of results.
      @param {String} allResultsURL
        The URL at which all results will be displayed.
    */
    showResults: function(results, total, allResultsURL) {
      var self = this;

      // Hide loading
      this._elements.loading.hidden = true;

      if (!results || total === 0) {
        // Clear existing result message
        this._elements.resultMessage.innerHTML = '';
        // Indicate to the user that no results were found
        this._elements.resultMessage.appendChild(Coral.templates.Shell.noHelpResults());
        // Show result message
        this._elements.resultMessage.hidden = false;
      }
      else {
        // Clear existing results
        this._elements.results.innerHTML = '';
         // Populate results
        results.forEach(function(result) {
          // Tweak: make the space between bullets larger with a non-breaking space
          var separator = '&nbsp; &bull; &nbsp;';
          var description = result.tags.join(separator);

          var item = new Coral.AnchorList.Item().set({
            href: result.href,
            target: result.target
          });

          // @todo move to set() above when CUI-4391 fixed
          item.content = Coral.templates.Shell.helpResult({
            title: result.title,
            description: description
          });

          self._elements.results.appendChild(item);
        });

        // Show results
        this._elements.results.hidden = false;

        // Show total
        if (total > 1) {
          var seeAllItem = new Coral.AnchorList.Item().set({
            href: allResultsURL,
            content: {
              innerHTML: Coral.i18n.get('See all {0} results', total)
            },
            target: '_blank'
          });

          seeAllItem.classList.add('coral-Link', 'coral3-Shell-help-allResults');

          this._elements.results.appendChild(seeAllItem);
        }
      }
    }

    /**
      A search result object.

      @typedef {Object} Coral.Shell.Help~result

      @property {String} title
        The title of the search result.
      @property {String} href
        The URL of the search result.
      @property {String} target
        This property specifies where to display the search result. Use this property only if the href property is present.
      @property {Array.<String>} tags
        A set of tags associated with the search result.
    */

    /**
      Triggered when the user submits a search term

      @event Coral.Shell.Help#coral-shell-help:search

      @param {Object} event
        Event object.
      @param {HTMLElement} event.detail.value
        The user-provided input value aka the search-term
    */
  });

  Coral.register( /** @lends Coral.Shell.Help.Item */ {
    /**
      @class Coral.Shell.Help.Item
      @classdesc The Shell's help item component
      @extends Coral.AnchorList.Item
      @htmltag coral-shell-help-item
    */
    name: 'Shell.Help.Item',
    tagName: 'coral-shell-help-item',
    className: 'coral3-BasicList-item coral3-AnchorList-item coral3-Shell-help-item',
    baseTagName: 'a',
    extend: Coral.AnchorList.Item
  });
}());

window["Coral"] = window["Coral"] || {};
window["Coral"]["strings"] = window["Coral"]["strings"] || {};
window["Coral"]["strings"]["coralui-component-shell-orgswitcher"] = {"en-US":{"Search Organizations":"Search Organizations","No organizations found&period;":"No organizations found."},"fr-FR":{"Search Organizations":"Rechercher des organisations","No organizations found&period;":"Aucune organisation trouvée."},"de-DE":{"Search Organizations":"Organisationen durchsuchen","No organizations found&period;":"Keine Organisationen gefunden."},"it-IT":{"Search Organizations":"Cerca organizzazioni","No organizations found&period;":"Nessuna organizzazione trovata."},"es-ES":{"Search Organizations":"Buscar organizaciones","No organizations found&period;":"No se ha encontrado ninguna organización."},"pt-BR":{"Search Organizations":"Procurar organizações","No organizations found&period;":"Nenhuma organização encontrada."},"ja-JP":{"Search Organizations":"組織を検索","No organizations found&period;":"組織が見つかりませんでした。"},"ko-KR":{"Search Organizations":"조직 검색","No organizations found&period;":"조직을 찾을 수 없습니다."},"zh-CN":{"Search Organizations":"搜索组织","No organizations found&period;":"找不到任何组织。"},"zh-TW":{"Search Organizations":"搜尋組織","No organizations found&period;":"找不到組織。"},"nl-NL":{"Search Organizations":"Organisaties zoeken","No organizations found&period;":"Geen organisaties gevonden."}};
window["Coral"] = window["Coral"] || {};
window["Coral"]["templates"] = window["Coral"]["templates"] || {};
window["Coral"]["templates"]["Shell"] = window["Coral"]["templates"]["Shell"] || {};
window["Coral"]["templates"]["Shell"]["orgSwitcher"] = (function anonymous(data_0
/**/) {
  var frag = document.createDocumentFragment();
  var data = data_0 = typeof data_0 === "undefined" ? {} : data_0;
  data = data_0;
  
var labelId = Coral.commons.getUID();

  data_0 = data;
  var el1 = document.createTextNode("\n");
  frag.appendChild(el1);
  var el2 = document.createElement("label");
  el2.className += " u-coral-screenReaderOnly";
  el2.id = labelId;
  el2.textContent = Coral["i18n"]["get"]('Search Organizations');
  frag.appendChild(el2);
  var el3 = document.createTextNode("\n");
  frag.appendChild(el3);
  var el4 = this["search"] = document.createElement("coral-search");
  el4.className += " coral3-Shell-orgSwitcher-search";
  el4.setAttribute("variant", "quiet");
  el4.setAttribute("handle", "search");
  el4.setAttribute("placeholder", Coral["i18n"]["get"]('Search Organizations'));
  el4.setAttribute("labelledby", labelId);
  frag.appendChild(el4);
  var el5 = document.createTextNode("\n");
  frag.appendChild(el5);
  var el6 = this["items"] = document.createElement("div");
  el6.className += " coral3-Shell-orgSwitcher-items";
  el6.setAttribute("handle", "items");
  frag.appendChild(el6);
  var el7 = document.createTextNode("\n");
  frag.appendChild(el7);
  var el8 = this["resultMessage"] = document.createElement("div");
  el8.className += " coral3-Shell-orgSwitcher-resultMessage";
  el8.setAttribute("handle", "resultMessage");
  el8.setAttribute("hidden", "");
  var el9 = document.createTextNode("\n  ");
  el8.appendChild(el9);
  var el10 = document.createElement("div");
  el10.className += " coral3-Shell-orgSwitcher-resultMessage-container";
  var el11 = document.createTextNode("\n    ");
  el10.appendChild(el11);
  var el12 = document.createElement("div");
  el12.className += " coral-Heading--1 coral3-Shell-orgSwitcher-resultMessage-heading";
  el12.textContent = Coral["i18n"]["get"]('No organizations found.');
  el10.appendChild(el12);
  var el13 = document.createTextNode("\n  ");
  el10.appendChild(el13);
  el8.appendChild(el10);
  var el14 = document.createTextNode("\n");
  el8.appendChild(el14);
  frag.appendChild(el8);
  return frag;
});
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function() {
  'use strict';

  /**
    Minimum number of entries required to show search control.

    @type {Number}
    @ignore
  */
  var SEARCH_VISIBLITY_THRESHOLD = 6;

  // Make sure the namespace exists
  Coral.Shell = Coral.Shell || {};

  Coral.register( /** @lends Coral.Shell.OrgSwitcher */ {
    /**
      @class Coral.Shell.OrgSwitcher
      @classdesc The Shell's organization switcher component
      @extends Coral.List
      @htmltag coral-shell-orgswitcher
    */
    name: 'Shell.OrgSwitcher',
    tagName: 'coral-shell-orgswitcher',
    className: 'coral3-BasicList coral3-Shell-orgSwitcher',
    extend: Coral.List,

    itemTagName: 'coral-shell-organization',

    events: {
      'coral-search:clear': '_showAll',
      'coral-search:input': '_performSearch',
      'coral-search:submit': '_selectFirst',
      'coral-shell-organization:_selected': '_handleSelected'
    },

    properties: {
      /**
        The item collection.
        See {@link Coral.Collection} for more details.

        @type {Coral.Collection}
        @readonly
        @memberof Coral.Shell.OrgSwitcher#
      */
      'items': {
        get: function() {
          // Construct the collection on first request:
          if (!this._items) {
            this._items = new Coral.Collection({
              host: this,
              itemTagName: 'coral-shell-organization',
              itemSelector: 'coral-shell-organization, coral-shell-suborganization',
              container: this._elements.items,
              onItemAdded: this._selectLastSelected
            });
          }

          return this._items;
        },
        set: function() {}
      },

      /**
        The search field placeholder.

        @type {String}
        @htmlattribute placeholder
        @memberof Coral.Shell.OrgSwitcher#
      */
      'placeholder': {
        set: function(value) {
          this._elements.search.placeholder = value;
        },
        get: function() {
          return this._elements.search.placeholder;
        }
      },

      /**
        Content zone where the buttons are located.

        @type {HTMLElement}
        @contentzone
        @memberof Coral.Shell.OrgSwitcher#
      */
      'footer': Coral.property.contentZone({
        handle: 'footer',
        tagName: 'coral-shell-orgswitcher-footer',
        insert: function(content) {
          this.appendChild(content);
        }
      })
    },

    /** @private */
    _getSelectableItems: function() {
      return Coral.List.prototype._getSelectableItems.call(this).filter(function(item) {
        return !item.items || item.items.length === 0;
      });
    },

    /** @ignore */
    _initialize: function() {
      // Listen for mutations
      this._observer = new MutationObserver(this._handleMutation.bind(this));
      this._observer.observe(this, {
        // Only watch the childList
        // Items will tell us if selected changes
        childList: true,
        subtree: true
      });

      this._selectLastSelected();
    },

    /** @ignore */
    _render: function() {
      var fragment = Coral.templates.Shell.orgSwitcher.call(this._elements);

      // Move the stuff into the right place
      this._moveItems();

      // Create/move content zone
      var footer = this._elements.footer = this.querySelector('coral-shell-orgswitcher-footer') ||
        document.createElement('coral-shell-orgswitcher-footer');
      fragment.appendChild(footer);

      this.appendChild(fragment);
    },

    /** @private */
    _handleMutation: function() {
      // Move all items into the right place
      this._moveItems();

      // Select the last selected item
      this._selectLastSelected();

      // if mincountforsearch is set and number of organizations are less than or equal to it, hide the search
      if (this.items.length <= SEARCH_VISIBLITY_THRESHOLD) {
        this._elements.search.hide();
      }
      else {
        this._elements.search.show();
      }
    },

    /** @private */
    _showAll: function(event) {
      event.stopPropagation();

      this._elements.resultMessage.hidden = true;

      // Show all items
      this.items.getAll().forEach(function(item) {
        item.hidden = false;

        if (item.items) {
          // Show all sub-items
          item.items.getAll().forEach(function(item) {
            item.hidden = false;
          });
        }
      });
    },

    /** @private */
    _performSearch: function(event) {
      event.stopPropagation();

      var searchTerm = this._elements.search.value.toLowerCase();

      this._elements.resultMessage.hidden = true;

      // Hide items that don't match
      var resultCount = 0;
      this.items.getAll().forEach(function(item) {
        var matched = item.content.textContent.toLowerCase().indexOf(searchTerm) !== -1;

        var childMatched = false;
        if (item.items) {
          item.items.getAll().forEach(function(item) {
            var matched = item.content.textContent.toLowerCase().indexOf(searchTerm) !== -1;
            childMatched = childMatched || matched;

            item.hidden = !matched;
          });
        }

        matched = matched || childMatched;
        item.hidden = !matched;

        if (matched) {
          resultCount++;
        }
      });

      if (resultCount === 0) {
        this._elements.resultMessage.hidden = false;
      }
    },

    /** @private */
    _handleSelected: function(event) {
      // stops the propagation of the vent because it is considered to be private
      event.stopImmediatePropagation();

      // Get the new and old selections
      var selection = event.target;
      var oldSelection = this._selectedItem;

      // Select the new item
      this._selectOnly(selection);

      this.trigger('coral-shell-orgswitcher:change', {
        selection: selection,
        oldSelection: oldSelection
      });
    },

    /** @private */
    _selectFirst: function(event) {
      event.stopPropagation();

      this._selectOnly(this.items.first());
    },

    /** @private */
    _selectOnly: function(selectedItem) {
      var self = this;
      // Hide other items
      this.items.getAll().forEach(function(item) {
        if (item === selectedItem) {
          // Store as selected
          self._selectedItem = item;
        }

        if (item.contains(selectedItem)) {
          // The selected item is a child of this element, do nothing
          return;
        }

        // If we end up here, this item shouldn't be selected
        item.removeAttribute('selected');
      });
    },

    /** @private */
    _selectLastSelected: function() {
      var lastSelected;
      this.items.getAll().forEach(function(item) {
        if (item.hasAttribute('selected')) {
          lastSelected = item;
        }
      });

      this._selectOnly(lastSelected);
    },

    /** @private */
    _moveItems: function() {
      var self = this;
      self.id = self.id || Coral.commons.getUID();
      Array.prototype.forEach.call(self.querySelectorAll('#' + self.id + ' > coral-shell-organization'), function(item) {
        self._elements.items.appendChild(item);
      });
    }

    /**
      Triggered when the selected organization has changed.

      @event Coral.Shell.OrgSwitcher#coral-shell-orgswitcher:change

      @param {Object} event Event object
      @param {Object} event.detail
      @param {HTMLElement} event.detail.oldSelection
        The prior selected organization item.
      @param {HTMLElement} event.detail.selection
        The newly selected organization item.
    */
  });

  Coral.register( /** @lends Coral.Shell.Organization */ {
    /**
      @class Coral.Shell.Organization
      @classdesc The Shell's organization switcher item component
      @extends Coral.List.Item
      @htmltag coral-shell-organization
    */
    name: 'Shell.Organization',
    tagName: 'coral-shell-organization',
    className: 'coral3-BasicList-item coral3-Shell-orgSwitcher-item',
    extend: Coral.List.Item,

    events: {
      'click': '_select',
      'key:enter': '_select',
      'key:space': '_select',
      'coral-shell-organization:_selected coral-shell-suborganization': '_handleSelected'
    },

    properties: {
      /**
        Whether this organization is selected.

        @type {Boolean}
        @default false
        @htmlattribute selected
        @htmlattributereflected
        @memberof Shell.Organization#
      */
      'selected': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        trigger: function() {
          // Trigger a different event based on selected state
          this.trigger(this.selected ? 'coral-shell-organization:_selected' : 'coral-shell-organization:_deselected');
        },
        get: function() {
          return this._selected;
        },
        set: function(selected) {
          this._selected = selected;
          this.classList.toggle('is-selected', selected);
          this._elements.checkmark.hidden = !selected;

          if (this.items) {
            var childIsSelected = this.items.getAll().some(function(item) {
              return item.hasAttribute('selected');
            });

            this.classList.toggle('is-child-selected', childIsSelected);

            if (!selected) {
              // Always de-select children when de-selected
              this._selectNone();
            }
          }
        }
      },

      /**
        The item collection.
        See {@link Coral.Collection} for more details.

        @type {Coral.Collection}
        @readonly
        @memberof Coral.Shell.Organization#
      */
      'items': {
        get: function() {
          // Construct the collection on first request:
          if (!this._items) {
            this._items = new Coral.Collection({
              host: this,
              itemTagName: 'coral-shell-suborganization',
              container: this._elements.items,
              onItemAdded: this._selectLastSelected,
              onItemRemoved: this._setParentness
            });
          }

          return this._items;
        },
        set: function() {}
      },

      /**
        The name of this organization.

        @type {String}
        @default ""
        @htmlattribute name
        @htmlattributereflected
        @memberof Shell.Organization#
      */
      'name': {
        default: '',
        reflectAttribute: true
      }
    },

    /** @ignore */
    _initialize: function() {
      // Call superclass method
      Coral.List.Item.prototype._initialize.call(this);

      if (this.items) {
        // Listen for mutations
        this._observer = new MutationObserver(this._handleMutation.bind(this));
        this._observer.observe(this, {
          // Only watch the childList
          // Items will tell us if selected changes
          childList: true
        });

        this._selectLastSelected();
      }
    },

    /** @ignore */
    _render: function() {
      Coral.List.Item.prototype._render.call(this);

      var checkmark = this._elements.checkmark = new Coral.Icon().set({
        icon: 'check',
        size: 'XS'
      });
      checkmark.classList.add('coral3-Shell-orgSwitcher-item-checkmark');
      this.appendChild(checkmark);

      var items = this._elements.items = document.createElement('div');
      items.className = 'coral3-Shell-orgSwitcher-subitems';
      this.appendChild(items);

      // Set the icon size
      this._elements.icon.size = 'M';
      // Add the className, owned by this component
      this._elements.icon.className += ' coral3-Shell-orgSwitcher-item-icon';

      this._moveItems();

      // Check if a child is selected
      if (this.items) {
        var childIsSelected = this.items.getAll().some(function(item) {
          return item.hasAttribute('selected');
        });

        if (childIsSelected) {
          // Silently be selected if a child is
          this.set('selected', true, true);
        }
      }
    },

    /** @private */
    _setParentness: function() {
      var hasChildren = this.items.getAll().length !== 0;

      if (hasChildren) {
        this.removeAttribute('role');
        this.removeAttribute('tabindex');
      }
      else {
        // Be accessible
        this.setAttribute('role', 'button');
        this.setAttribute('tabindex', 0);
      }

      this.classList.toggle('is-parent', hasChildren);
    },

    /** @private */
    _handleMutation: function() {
      // Move all items into the right place
      this._moveItems();

      // Select the last selected item
      this._selectLastSelected();
    },

    /** @private */
    _handleSelected: function(event) {
      // Silently be selected if a child is
      this.set('selected', true, true);

      this._selectOnly(event.target);
    },

    /** @private */
    _select: function(event) {
      if (this.items.getAll().length !== 0) {
        // You can't be selected if you have sub-organizations
        return;
      }

      if (event._coralShellOrganizationSelected) {
        // Set selected silently so the outer component doesn't know
        this.set('selected', true, true);
        return;
      }

      this.selected = true;
    },

    /** @private */
    _selectOnly: function(selectedItem) {
      // Hide other items
      this.items.getAll().forEach(function(item) {
        item[(item === selectedItem) ? 'setAttribute' : 'removeAttribute']('selected', '');
      });
    },

    /** @private */
    _selectNone: function(selectedItem) {
      this.items.getAll().forEach(function(item) {
        item.removeAttribute('selected');
      });
    },

    /** @private */
    _selectLastSelected: function() {
      var lastSelected;
      this.items.getAll().forEach(function(item) {
        if (item.hasAttribute('selected')) {
          lastSelected = item;
        }
      });

      this._selectOnly(lastSelected);

      this._setParentness();
    },

    /** @private */
    _moveItems: function() {
      var self = this;
      Array.prototype.forEach.call(self.querySelectorAll('coral-shell-suborganization'), function(item) {
        self._elements.items.appendChild(item);
      });
    }

    /**
      Triggered when an organization was selected.

      @event Coral.Shell.Organization#coral-shell-organization:_selected

      @param {Object} event Event object
      @private
    */

    /**
      Triggered when an organization was deselected.

      @event Coral.Shell.Organization#coral-shell-organization:_deselected

      @param {Object} event Event object
      @private
    */
  });

  Coral.register( /** @lends Coral.Shell.Suborganization */ {
    /**
      @class Coral.Shell.Suborganization
      @classdesc The Shell's organization switcher sub-item component
      @extends Coral.Shell.Organization
      @htmltag coral-shell-suborganization
    */
    name: 'Shell.Suborganization',
    tagName: 'coral-shell-suborganization',
    className: 'coral3-BasicList-item coral3-Shell-orgSwitcher-subitem',
    extend: Coral.Shell.Organization,

    properties: {
      'items': {
        override: true
      }
    },

    /** @private */
    _select: function(event) {
      // Mark that a selection has already occurred
      event._coralShellOrganizationSelected = true;

      this.selected = true;
    },

    /** @ignore */
    _render: function() {
      Coral.Shell.Organization.prototype._render.call(this);

      // Set the icon size
      this._elements.icon.size = 'S';
      // Add the className, owned by this component
      this._elements.icon.className += ' coral3-Shell-orgSwitcher-subitem-icon';

      // Be accessible
      this.setAttribute('role', 'button');
      this.setAttribute('tabindex', 0);
    }
  });
  
  /**
    @class Coral.Shell.OrgSwitcher.Footer
    @classdesc The Shell Org Switcher footer
    @htmltag coral-shell-orgswitcher-footer
    @extends HTMLElement
  */
  Coral.Shell.OrgSwitcher.Footer = function() {
    return document.createElement('coral-shell-orgswitcher-footer');
  };
}());
