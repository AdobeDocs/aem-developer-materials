/* jshint -W117 */ // for helpers
describe('Coral.keys', function() {
  'use strict';

  var next = helpers.next;

  it('should have a numeric keycode', function() {
    var spy = sinon.spy();
    Coral.keys.on('a', spy);
    helpers.keypress('a');
    expect(spy.args[0][0].keyCode).to.be.a('number');
    Coral.keys.on('return', spy);
    helpers.keypress('return');
    expect(spy.args[1][0].keyCode).to.be.a('number');
  });

  it('should support single key shortcuts', function() {
    var spy = sinon.spy();
    Coral.keys.on('a', spy);
    helpers.keypress('a');
    expect(spy.callCount).to.equal(1);
    helpers.keypress('a');
    expect(spy.callCount).to.equal(2);
  });

  it('should not explode when keyevent originates from an element that is not in the DOM', function() {
    var childBSpy = sinon.spy();
    var parentASpy = sinon.spy();
    var parentBSpy = sinon.spy();

    var div = document.createElement('div');
    helpers.target.appendChild(div);

    var keys = new Coral.Keys(helpers.target);

    keys.on('b', function(event) {
      // Remove the node
      event.target.parentNode.removeChild(event.target);
      childBSpy();
    });

    Coral.keys.on('a', parentASpy);
    Coral.keys.on('b', parentBSpy);

    helpers.keypress('b', div);

    // We should get the event locally
    expect(childBSpy.callCount).to.equal(1, 'childBSpy call count after B keypress');
    // We should still be able to get the keycombo event globally
    expect(parentBSpy.callCount).to.equal(1, 'parentBSpy call count after B keypress');

    helpers.keypress('a');

    // We should get other keycombos without interference as a result of removing the target
    expect(parentASpy.callCount).to.equal(1, 'parentASpy call count after A keypress');
  });

  it('should support key combinations with modifiers', function() {
    var spies = {};
    spies.a = sinon.spy();
    spies.shiftA = sinon.spy();
    spies.ctrlShiftA = sinon.spy();
    spies.commandCtrlShiftA = sinon.spy();
    spies.commandCtrlAltShiftA = sinon.spy();
    spies.meta = sinon.spy();

    Coral.keys.on('command+c', spies.meta);

    helpers.keydown('c', null, ['meta'], 91);
    helpers.keyup('c', null);

    expect(spies.meta.callCount).to.equal(1, 'Command+C keypress count');

    helpers.keydown('c', null, ['meta'], 224);
    helpers.keyup('c', null);

    expect(spies.meta.callCount).to.equal(2, 'Command+C keypress count');

    Coral.keys.on('a', spies.a);
    Coral.keys.on('shift+a', spies.shiftA);
    Coral.keys.on('ctrl+shift+a', spies.ctrlShiftA);
    Coral.keys.on('command+ctrl+shift+a', spies.commandCtrlShiftA);
    Coral.keys.on('command+ctrl+alt+shift+a', spies.commandCtrlAltShiftA);

    helpers.keydown('a');
    helpers.keyup('a');

    expect(spies.a.callCount).to.equal(1, 'A keypress count');
    expect(spies.shiftA.callCount).to.equal(0, 'Shift+A keypress count');
    expect(spies.ctrlShiftA.callCount).to.equal(0, 'Ctrl+Shift+A keypress count');
    expect(spies.commandCtrlShiftA.callCount).to.equal(0, 'Command+Ctrl+Shift+A keypress count');
    expect(spies.commandCtrlAltShiftA.callCount).to.equal(0, 'Command+Ctrl+Alt+Shift+A keypress count');

    helpers.keydown('shift');
    helpers.keydown('a', null, ['shift']);
    helpers.keyup('a');
    helpers.keyup('shift');

    expect(spies.a.callCount).to.equal(1, 'A keypress count');
    expect(spies.shiftA.callCount).to.equal(1, 'Shift+A keypress count');
    expect(spies.ctrlShiftA.callCount).to.equal(0, 'Ctrl+Shift+A keypress count');
    expect(spies.commandCtrlShiftA.callCount).to.equal(0, 'Command+Ctrl+Shift+A keypress count');
    expect(spies.commandCtrlAltShiftA.callCount).to.equal(0, 'Command+Ctrl+Alt+Shift+A keypress count');

    helpers.keydown('shift');
    helpers.keydown('control');
    helpers.keydown('a', null, ['shift', 'control']);
    helpers.keyup('a');
    helpers.keyup('shift');
    helpers.keyup('control');

    expect(spies.a.callCount).to.equal(1, 'A keypress count');
    expect(spies.shiftA.callCount).to.equal(1, 'Shift+A keypress count');
    expect(spies.ctrlShiftA.callCount).to.equal(1, 'Ctrl+Shift+A keypress count');
    expect(spies.commandCtrlShiftA.callCount).to.equal(0, 'Command+Ctrl+Shift+A keypress count');
    expect(spies.commandCtrlAltShiftA.callCount).to.equal(0, 'Command+Ctrl+Alt+Shift+A keypress count');

    helpers.keydown('command');
    helpers.keydown('shift');
    helpers.keydown('control');
    helpers.keydown('a', null, ['command', 'shift', 'control']);
    helpers.keyup('a');
    helpers.keyup('shift');
    helpers.keyup('control');
    helpers.keyup('command');

    expect(spies.a.callCount).to.equal(1, 'A keypress count');
    expect(spies.shiftA.callCount).to.equal(1, 'Shift+A keypress count');
    expect(spies.ctrlShiftA.callCount).to.equal(1, 'Ctrl+Shift+A keypress count');
    expect(spies.commandCtrlShiftA.callCount).to.equal(1, 'Command+Ctrl+Shift+A keypress count');
    expect(spies.commandCtrlAltShiftA.callCount).to.equal(0, 'Command+Ctrl+Alt+Shift+A keypress count');

    helpers.keydown('alt');
    helpers.keydown('command');
    helpers.keydown('shift');
    helpers.keydown('control');
    helpers.keydown('a', null, ['alt', 'command', 'shift', 'control']);
    helpers.keyup('a');
    helpers.keyup('shift');
    helpers.keyup('control');
    helpers.keyup('command');
    helpers.keyup('alt');

    expect(spies.a.callCount).to.equal(1, 'A keypress count');
    expect(spies.shiftA.callCount).to.equal(1, 'Shift+A keypress count');
    expect(spies.ctrlShiftA.callCount).to.equal(1, 'Ctrl+Shift+A keypress count');
    expect(spies.commandCtrlShiftA.callCount).to.equal(1, 'Command+Ctrl+Shift+A keypress count');
    expect(spies.commandCtrlAltShiftA.callCount).to.equal(1, 'Command+Ctrl+Alt+Shift+A keypress count');



  });

  it('should unbind a single key listener', function() {
    var spy = sinon.spy();
    Coral.keys.on('a', spy);
    helpers.keydown('a');
    helpers.keyup('a');
    expect(spy.callCount).to.equal(1);
    Coral.keys.off('a', spy);
    helpers.keydown('a');
    helpers.keyup('a');
    expect(spy.callCount).to.equal(1);
  });

  it('should unbind all listeners for a key', function() {
    var spy1 = sinon.spy();
    var spy2 = sinon.spy();
    Coral.keys.on('a', spy1);
    Coral.keys.on('a', spy2);
    helpers.keydown('a');
    helpers.keyup('a');
    expect(spy1.callCount).to.equal(1);
    expect(spy2.callCount).to.equal(1);
    Coral.keys.off('a');
    helpers.keydown('a');
    helpers.keyup('a');
    expect(spy1.callCount).to.equal(1);
    expect(spy2.callCount).to.equal(1);
  });

  it('should unbind multiple key combinations with modifiers', function() {
    var spies = {};
    spies.a = sinon.spy();
    spies.shiftA = sinon.spy();
    spies.ctrlShiftA = sinon.spy();
    spies.commandCtrlShiftA = sinon.spy();
    spies.commandCtrlAltShiftA = sinon.spy();

    Coral.keys.on('a', spies.a);
    Coral.keys.on('shift+a', spies.shiftA);
    Coral.keys.on('ctrl+shift+a', spies.ctrlShiftA);
    Coral.keys.on('command+ctrl+shift+a', spies.commandCtrlShiftA);
    Coral.keys.on('command+ctrl+alt+shift+a', spies.commandCtrlAltShiftA);

    function pressKeys() {
      helpers.keydown('a');
      helpers.keyup('a');

      helpers.keydown('shift');
      helpers.keydown('a', null, ['shift']);
      helpers.keyup('a');
      helpers.keyup('shift');

      helpers.keydown('shift');
      helpers.keydown('control');
      helpers.keydown('a', null, ['shift', 'control']);
      helpers.keyup('a');
      helpers.keyup('shift');
      helpers.keyup('control');

      helpers.keydown('command');
      helpers.keydown('shift');
      helpers.keydown('control');
      helpers.keydown('a', null, ['command', 'shift', 'control']);
      helpers.keyup('a');
      helpers.keyup('shift');
      helpers.keyup('control');
      helpers.keyup('command');

      helpers.keydown('alt');
      helpers.keydown('command');
      helpers.keydown('shift');
      helpers.keydown('control');
      helpers.keydown('a', null, ['alt', 'command', 'shift', 'control']);
      helpers.keyup('a');
      helpers.keyup('shift');
      helpers.keyup('control');
      helpers.keyup('command');
      helpers.keyup('alt');
    }

    function testSpies() {
      expect(spies.a.callCount).to.equal(1, 'A keypress count');
      expect(spies.shiftA.callCount).to.equal(1, 'Shift+A keypress count');
      expect(spies.ctrlShiftA.callCount).to.equal(1, 'Ctrl+Shift+A keypress count');
      expect(spies.commandCtrlShiftA.callCount).to.equal(1, 'Command+Ctrl+Shift+A keypress count');
      expect(spies.commandCtrlAltShiftA.callCount).to.equal(1, 'Command+Ctrl+Alt+Shift+A keypress count');
    }

    pressKeys();
    testSpies();

    Coral.keys.off('a', spies.a);
    Coral.keys.off('shift+a', spies.shiftA);
    Coral.keys.off('ctrl+shift+a', spies.ctrlShiftA);
    Coral.keys.off('command+ctrl+shift+a', spies.commandCtrlShiftA);
    Coral.keys.off('command+ctrl+alt+shift+a', spies.commandCtrlAltShiftA);

    pressKeys();
    testSpies();
  });

  it('should support fancy modifier keys', function() {
    var sequence = '';
    Coral.keys.on('⌃+a', function() {
      sequence += 'a';
    });
    Coral.keys.on('⌥+b', function() {
      sequence += 'b';
    });
    Coral.keys.on('⇧+c', function() {
      sequence += 'c';
    });
    Coral.keys.on('⌘+d', function() {
      sequence += 'd';
    });

    helpers.keydown('control');
    helpers.keydown('a', null, ['control']);
    helpers.keyup('a');
    helpers.keyup('control');

    helpers.keydown('option');
    helpers.keydown('b', null, ['alt']);
    helpers.keyup('b');
    helpers.keyup('option');

    helpers.keydown('shift');
    helpers.keydown('c', null, ['shift']);
    helpers.keyup('c');
    helpers.keyup('shift');

    helpers.keydown('command');
    helpers.keydown('d', null, ['command']);
    helpers.keyup('d');
    helpers.keyup('command');

    expect(sequence).to.equal('abcd');
  });

  it('should support listeners on F keys', function() {
    var sequence = '';

    function makeSequencer(index) {
      return function() {
        sequence += '.' + index;
      };
    }

    // Add listeners for each F key
    for (var i = 1; i <= 19; i++) {
      Coral.keys.on('f' + i, makeSequencer(i));
    }

    // Trigger a keypress on each F key
    for (var j = 1; j <= 19; j++) {
      helpers.keypress(111 + j);
    }

    expect(sequence).to.equal('.1.2.3.4.5.6.7.8.9.10.11.12.13.14.15.16.17.18.19');
  });

  it('should support non-alphanumeric keys', function() {
    var sequence = '';
    var characters = ['plus', 'minus', '+', ',', '.', '/', '=', ';', '\'', ']', '\\'];

    function makeSequencer(character) {
      return function() {
        sequence += character;
      };
    }

    characters.forEach(function(character) {
      Coral.keys.on(character, makeSequencer(character));
      helpers.keypress(character);
    });

    expect(sequence).to.equal('plusminus+,./=;\']\\');

    characters.forEach(function(character) {
      Coral.keys.off(character);
      helpers.keypress(character);
    });

    expect(sequence).to.equal('plusminus+,./=;\']\\');

    // Test the key "[" separately because the key charcode which is generated with the keyhelper is reserved inside
    // the implementation with the modifier key 91
    sequence = '';
    Coral.keys.on('[', makeSequencer('['));
    helpers.keypress(221, null, null, '[');
    expect(sequence).to.equal('[');
  });

  it('should support whitespace keys', function() {
    var enterSpy = sinon.spy();
    var spaceSpy = sinon.spy();
    Coral.keys.on('enter', enterSpy);
    Coral.keys.on('space', spaceSpy);
    Coral.keys.on(' ', spaceSpy);

    helpers.keypress(32); // space
    expect(spaceSpy.callCount).to.equal(2, 'Space key was pressed');

    helpers.keypress(13); // enter
    expect(enterSpy.callCount).to.equal(1, 'Enter key was pressed');
  });

  it('should support both the top row of number keys and the numeric keypad', function() {
    // An array of pairs of identical keys
    var keys = [
      [96, 48],
      [97, 49],
      [98, 50],
      [99, 51],
      [100, 52],
      [101, 53],
      [102, 54],
      [103, 55],
      [104, 56],
      [105, 57]
    ];

    var i;
    var spies = [];
    function makeSpy(i) {
      var spy = spies[i] = sinon.spy();
      return spy;
    }

    // Add a listener for each number
    for (i = 0; i < keys.length; i++) {
      Coral.keys.on(i, makeSpy(i));
    }

    // Trigger a keypress on each key for a given number
    for (i = 0; i < keys.length; i++) {
      helpers.keypress(keys[i][0]);
      helpers.keypress(keys[i][1]);
    }

    for (i = 0; i < keys.length; i++) {
      expect(spies[i].callCount).to.equal(2, 'Spy ' + i + ' should be called twice');
    }
  });

  it('should not trigger handlers when an event originates from an input', function(done) {
    var spy = sinon.spy();
    Coral.keys.on('a', spy);

    helpers.build(window.__html__['Coral.keys.inputs.html'], function(snippet) {
      // Trigger key events
      helpers.keypress('a', document.getElementById('input_text'));
      expect(spy.callCount).to.equal(0, 'Call count after A keypress in input');

      helpers.keypress('a', document.getElementById('textarea'));
      expect(spy.callCount).to.equal(0, 'Call count after A keypress in textarea');

      helpers.keypress('a', document.getElementById('select'));
      expect(spy.callCount).to.equal(0, 'Call count after A keypress in select');

      helpers.keypress('a', document.getElementById('editable'));
      expect(spy.callCount).to.equal(0, 'Call count after A keypress in contenteditable');

      done();
    });
  });

  it('should trigger handler when an event originates from an input if key is escape', function(done) {
    var spy = sinon.spy();
    Coral.keys.on('escape', spy);

    helpers.build(window.__html__['Coral.keys.inputs.html'], function() {
      // Trigger key events
      helpers.keypress('escape', document.getElementById('input_text'));
      expect(spy.callCount).to.equal(1, 'Call count after ESC keypress in input');

      helpers.keypress('escape', document.getElementById('textarea'));
      expect(spy.callCount).to.equal(2, 'Call count after ESC keypress in textarea');

      helpers.keypress('escape', document.getElementById('select'));
      expect(spy.callCount).to.equal(3, 'Call count after ESC keypress in select');

      helpers.keypress('escape', document.getElementById('editable'));
      expect(spy.callCount).to.equal(4, 'Call count after ESC keypress in contenteditable');

      done();
    });
  });

  it('should initialize itself only when called with new', function() {
    var noop = function() {};

    var keysNoInit = Coral.Keys(window);
    expect(function() {
      keysNoInit.on('a', noop);
    }).to.throw(Error, null, 'Instance created without new should throw');

    var keysWithNew = new Coral.Keys(window);
    expect(function() {
      keysWithNew.on('a', noop);
    }).to.not.throw(Error, null, 'Instance created with new should not throw');

    var keysWithInit = Coral.Keys(window);
    keysWithInit.init();
    expect(function() {
      keysWithInit.on('a', noop);
    }).to.not.throw(Error, null, 'Instance created without new but with init called should not throw');

    // Clean up
    keysWithNew.destroy();
    keysWithInit.destroy();
  });

  it('should throw when not passed element to scope', function() {

    expect(function() {
      Coral.Keys();
    }).to.throw(Error, null);
  });

  it('should set context correctly', function() {
    var obj = {};
    var keys = new Coral.Keys(document.body, {
      context: obj
    });
    keys.on('a', function() {
      expect(this).to.equal(obj);
    });

    // Trigger a key event on the document
    helpers.keypress('a');

    keys.destroy();
  });

  it('should be chainable', function() {
    var keys = Coral.Keys(document.documentElement);
    var noop = function() {};

    expect(keys.init()).to.equal(keys);
    expect(keys.on('a', noop)).to.equal(keys);
    expect(keys.off('a', noop)).to.equal(keys);
    expect(keys.reset()).to.equal(keys);
    expect(keys.destroy()).to.equal(keys);
  });

  it('should support a map of keyCombos to handlers', function() {
    var aSpy = sinon.spy();
    var bSpy = sinon.spy();

    var keys = new Coral.Keys(document.documentElement);

    keys.on({
      'a': aSpy,
      'b': bSpy
    });

    helpers.keypress('a');
    expect(aSpy.callCount).to.equal(1, 'A spy call count after A keypress');
    expect(bSpy.callCount).to.equal(0, 'B spy call count after A keypress');

    helpers.keypress('b');
    expect(aSpy.callCount).to.equal(1, 'A spy call count after A keypress');
    expect(bSpy.callCount).to.equal(1, 'B spy call count after A keypress');
  });

  it('should support a map of keyCombos to handlers with delegation', function(done) {
    helpers.build(window.__html__['Coral.keys.keyComboMapWithDelegation.html'], function(snippet) {
      var aSpy = sinon.spy();
      var bSpy = sinon.spy();

      var keys = new Coral.Keys(snippet);

      keys.on({
        'a': aSpy,
        'b': bSpy
      }, '#someDiv');

      helpers.keypress('a', snippet);
      expect(aSpy.callCount).to.equal(0, 'A spy call count after A keypress on outer element');
      helpers.keypress('b', snippet);
      expect(bSpy.callCount).to.equal(0, 'B spy call count after A keypress on outer element');

      helpers.keypress('a', document.getElementById('someDiv'));
      expect(aSpy.callCount).to.equal(1, 'A spy call count after A keypress on delegate');
      helpers.keypress('b', document.getElementById('someDiv'));
      expect(bSpy.callCount).to.equal(1, 'B spy call count after A keypress on delegate');

      done();
    });
  });

  it('should support event namespaces', function() {
    var aSpy = sinon.spy();
    var aSpyNS = sinon.spy();
    var otherASpyNS = sinon.spy();

    var keys = new Coral.Keys(document.documentElement);

    keys.on('a', aSpy);
    keys.on('a.myNS', aSpyNS);
    keys.on('a.myNS', otherASpyNS);

    helpers.keypress('a');
    expect(aSpy.callCount).to.equal(1, 'A spy call count after first A keypress');
    expect(aSpyNS.callCount).to.equal(1, 'Namespaced A spy call count after first A keypress');
    expect(otherASpyNS.callCount).to.equal(1, 'Other namespaced A spy call count after first A keypress');

    // Remove only one namespaced listener
    keys.off('a.myNS', aSpyNS);

    helpers.keypress('a');
    expect(aSpy.callCount).to.equal(2, 'A spy call count after off(a.myNS, aSpyNS) and second A keypress');
    expect(aSpyNS.callCount).to.equal(1, 'Namespaced A spy call count after off(a.myNS, aSpyNS) and second A keypress');
    expect(otherASpyNS.callCount).to.equal(2, 'Other namespaced A spy call count after off(a.myNS, aSpyNS) and second A keypress');

    // Remove a non-namespaced A event
    keys.off('a', aSpy);

    helpers.keypress('a');
    expect(aSpy.callCount).to.equal(2, 'A spy call count after off(a, aSpy) and third A keypress');
    expect(otherASpyNS.callCount).to.equal(3, 'Other namespaced A spy call count after off(a, aSpy) and third A keypress');

    // Remove all A events
    keys.off('a');

    helpers.keypress('a');
    expect(aSpy.callCount).to.equal(2, 'A spy call count after off(a) and fourth A keypress');
    expect(aSpyNS.callCount).to.equal(1, 'Namespaced A spy call count after off(a) and fourth A keypress');
    expect(otherASpyNS.callCount).to.equal(3, 'Other namespaced A spy call count after off(a) and fourth A keypress');

    keys.destroy();
  });

  it('should remove all listeners for a given namespace when provided with only the namespace', function() {
    var aSpyNS = sinon.spy();
    var bSpyNS = sinon.spy();
    var aSpy = sinon.spy();

    var keys = new Coral.Keys(document.documentElement);

    keys.on('a', aSpy);
    keys.on('a.myNS', aSpyNS);
    keys.on('b.myNS', bSpyNS);

    helpers.keypress('a');
    expect(aSpy.callCount).to.equal(1, 'Non-namespaced A spy call count after A keypress');
    expect(aSpyNS.callCount).to.equal(1, 'A spy call count after A keypress');

    helpers.keypress('b');
    expect(bSpyNS.callCount).to.equal(1, 'B spy call count after B keypress');

    // Remove all events for a given namespace, irrespective of key combo
    keys.off('.myNS');

    helpers.keypress('a');
    expect(aSpy.callCount).to.equal(2, 'Non-namespaced A spy call count after off called with .myNS and A keypress');
    expect(aSpyNS.callCount).to.equal(1, 'A spy call count after off called with .myNS and A keypress');

    helpers.keypress('b');
    expect(bSpyNS.callCount).to.equal(1, 'B spy call count after off called with .myNS and B keypress');

    keys.destroy();
  });

  it('should support custom filter functions', function(done) {
    helpers.build(window.__html__['Coral.keys.filter.html'], function(snippet) {
      var filterSpy = sinon.spy();
      var handlerSpy = sinon.spy();
      var keys = new Coral.Keys(snippet, {
        filter: function(event) {
          filterSpy();
          // Don't register keypresses triggered on a div
          return event.target.tagName !== 'DIV';
        }
      });

      keys.on('a', handlerSpy);

      helpers.keypress('a', document.getElementById('someDiv'));
      expect(filterSpy.callCount).to.equal(1, 'Filter call count after first keypress');
      expect(handlerSpy.callCount).to.equal(0, 'Handler call count after keypress on element that fails filter test');

      helpers.keypress('a', document.getElementById('someSpan'));
      expect(filterSpy.callCount).to.equal(2, 'Filter call count after second keypress');
      expect(handlerSpy.callCount).to.equal(1, 'Handler call count after keypress on element that passes filter test');

      keys.destroy();

      done();
    });
  });

  it('should support event delegation', function(done) {
    var spy = sinon.spy();

    Coral.keys.on('a', '#delegateDiv', spy);

    helpers.build(window.__html__['Coral.keys.delegation.html'], function(snippet) {
      // Trigger a key event on the document
      helpers.keypress('a');
      expect(spy.callCount).to.equal(0);

      // Trigger a key event on another div
      helpers.keypress('a', document.getElementById('someOtherDiv'));
      expect(spy.callCount).to.equal(0);

      // Trigger a key event on the target div
      helpers.keypress('a', document.getElementById('delegateDiv'));
      expect(spy.callCount).to.equal(1);

      done();
    });
  });

  it('should set original keys that triggered the event', function() {
    var spy = sinon.spy();
    Coral.keys.on('c-s', spy);
    Coral.keys.on('t', spy);
    Coral.keys.on('shift+q', spy);

    helpers.keypress('c');
    helpers.keypress('s');
    expect(spy.callCount).to.equal(1);
    expect(spy.args[0][0].keys).to.equal('c-s');

    spy.reset();
    helpers.keypress('t');
    expect(spy.callCount).to.equal(1);
    expect(spy.args[0][0].keys).to.equal('t');

    spy.reset();
    helpers.keydown('q', null, ['shift']);
    expect(spy.callCount).to.equal(1);
    expect(spy.args[0][0].keys).to.equal('shift+q');
  });

  it('should set event.matchedTarget correctly', function(done) {
    var spy = sinon.spy();

    var keys = new Coral.Keys(document.body);

    var matchedTarget;
    keys.on('a', '#delegateDiv', function(event) {
      matchedTarget = event.matchedTarget;
      spy();
    });

    helpers.build(window.__html__['Coral.keys.delegation.html'], function(snippet) {
      // Trigger a key event on the document
      helpers.keypress('a', document.getElementById('delegateDiv'));

      expect(spy.callCount).to.equal(1);
      expect(matchedTarget).to.equal(document.getElementById('delegateDiv'));

      keys.destroy();

      done();
    });
  });

  it('should unbind delegated events', function(done) {
    var globalSpy = sinon.spy();
    var otherSpy = sinon.spy();
    var delegateSpy = sinon.spy();

    Coral.keys.on('a', globalSpy);
    Coral.keys.on('a', otherSpy);
    Coral.keys.on('a', '#delegateDiv', delegateSpy);

    helpers.build(window.__html__['Coral.keys.delegation.html'], function(snippet) {
      // Trigger a key event on the document
      helpers.keypress('a');
      expect(globalSpy.callCount).to.equal(1);
      expect(delegateSpy.callCount).to.equal(0);

      // Trigger a key event on another div
      helpers.keypress('a', document.getElementById('someOtherDiv'));
      expect(globalSpy.callCount).to.equal(2);
      expect(delegateSpy.callCount).to.equal(0);

      // Remove the other global event listener
      // This is to see if the delegate listener or other global listener is blown away
      Coral.keys.off('a', otherSpy);

      // Trigger a key event on the target div
      helpers.keypress('a', document.getElementById('delegateDiv'));
      expect(globalSpy.callCount).to.equal(3);
      expect(delegateSpy.callCount).to.equal(1);

      // Remove delegate event listener
      // This is to see if the global listener is blown away
      Coral.keys.off('a', '#delegateDiv', delegateSpy);

      // Trigger a key event on the target div
      helpers.keypress('a', document.getElementById('delegateDiv'));
      expect(globalSpy.callCount).to.equal(4);
      expect(delegateSpy.callCount).to.equal(1);

      done();
    });
  });

  it('should support event data', function() {
    var keys = new Coral.Keys(document.documentElement);

    var obj = {};
    keys.on('a', obj, function(event) {
      expect(event.data).to.equal(obj);
    });

    helpers.keypress('a');
  });

  it('should support event data with delegation', function(done) {
    helpers.build(window.__html__['Coral.keys.dataWithDelegation.html'], function(snippet) {
      var spy = sinon.spy();

      var keys = new Coral.Keys(snippet);
      var obj = {};
      keys.on('a', '#someDiv', obj, function(event) {
        spy();
        expect(event.data).to.equal(obj);
      });

      // Trigger on the outer element
      helpers.keypress('a', snippet);
      expect(spy.callCount).to.equal(0);

      // Trigger on the delegate element
      helpers.keypress('a', document.getElementById('someDiv'));
      expect(spy.callCount).to.equal(1);

      done();
    });
  });

  it('should scope events to a given element', function(done) {
    helpers.build(window.__html__['Coral.keys.scoped.html'], function(snippet) {
      var spy = sinon.spy();

      var keys = new Coral.Keys(snippet);
      keys.on('a', spy);

      // Trigger a key event on the document
      helpers.keypress('a');
      expect(spy.callCount).to.equal(0);

      // Trigger a key event on the div itself
      helpers.keypress('a', snippet);

      expect(spy.callCount).to.equal(1);

      // Trigger a key event on a child of the div
      helpers.keypress('a', snippet.firstElementChild);

      expect(spy.callCount).to.equal(2);

      // Remove the listener
      keys.off('a', spy);

      // Trigger a few keypresses
      helpers.keypress('a', snippet);
      helpers.keypress('a', snippet.firstElementChild);

      expect(spy.callCount).to.equal(2);

      done();
    });
  });

  it('should allow event delegation to immediate children', function(done) {
    helpers.build(window.__html__['Coral.keys.scoped.html'], function(snippet) {
      var spy = sinon.spy();

      var keys = new Coral.Keys(snippet);
      keys.on('a', '> div', spy);

      // Trigger a key event on the document
      helpers.keypress('a');
      expect(spy.callCount).to.equal(0);

      // Trigger a key event on the div itself
      helpers.keypress('a', snippet);
      expect(spy.callCount).to.equal(0);

      // Trigger a key event on the inner child
      helpers.keypress('a', document.getElementById('inner'));
      expect(spy.callCount).to.equal(0);

      // Trigger a key event on the inner child
      helpers.keypress('a', document.getElementById('outer'));
      expect(spy.callCount).to.equal(1);

      done();
    });
  });

  describe('should support keys property for Coral.Component / Coral.register', function() {
    it('should support keyboard event listeners', function() {
      var spy = sinon.spy();
      var Keyboarder = Coral.register({
        tagName: 'coral-keyboarder',
        name: 'Keyboarder',
        events: {
          'key:a': '_handleAPressed',
          // Make sure it's possible to remove inherited keycombos
          'key:b': null,
          'key:c': undefined,
          'key:d': false
        },
        _handleAPressed: spy
      });

      var keyboarder = new Keyboarder();

      document.body.appendChild(keyboarder);

      helpers.keypress('a', keyboarder);
      expect(spy.callCount).to.equal(1, 'Call count after A pressed');

      keyboarder.parentNode.removeChild(keyboarder);
    });

    it('should support listening to global keyboard events only when attached', function(done) {
      var spy = sinon.spy();
      var KeyboarderGlobal = Coral.register({
        tagName: 'coral-keyboarder-global',
        name: 'KeyboarderGlobal',
        events: {
          'global:key:esc': '_handleEscape'
        },
        _handleEscape: spy
      });

      var keyboarder = new KeyboarderGlobal();

      helpers.keypress('esc');
      expect(spy.callCount).to.equal(0, 'Count after triggering escape keypress before in DOM');

      document.body.appendChild(keyboarder);

      next(function() {
        helpers.keypress('esc');
        expect(spy.callCount).to.equal(1, 'Count after triggering escape keypress when in DOM');

        keyboarder.parentNode.removeChild(keyboarder);

        next(function() {
          helpers.keypress('esc');
          expect(spy.callCount).to.equal(1, 'Count after triggering escape keypress when remove from DOM');

          document.body.appendChild(keyboarder);

          next(function() {
            helpers.keypress('esc');
            expect(spy.callCount).to.equal(2, 'Count after triggering escape keypress when added back to DOM');

            keyboarder.parentNode.removeChild(keyboarder);
            done();
          });
        });
      });
    });

    it('should support keyboard event listeners with delegation', function() {
      var spy = sinon.spy();
      var KeyboarderDelegate = Coral.register({
        tagName: 'coral-keyboarder-delegate',
        name: 'KeyboarderDelegate',
        events: {
          'key:a input': '_handleAPressed'
        },
        _handleAPressed: spy,
        _render: function() {
          this._elements.input = document.createElement('input');
          this.appendChild(this._elements.input);
        }
      });

      var keyboarder = new KeyboarderDelegate();

      document.body.appendChild(keyboarder);

      // Test events on element
      helpers.keypress('a', keyboarder);
      expect(spy.callCount).to.equal(0, 'Count after triggering event on parent');

      // Test events on child
      helpers.keypress('a', keyboarder._elements.input);
      expect(spy.callCount).to.equal(1, 'Count after triggering event on delegated child');

      keyboarder.parentNode.removeChild(keyboarder);
    });
  });

  it('should support focus shifting away from element on keydown but before keyup (CUI-3319)', function() {
    var div = document.createElement('div');
    helpers.target.appendChild(div);

    var keys = new Coral.Keys(div);
    var spy = sinon.spy();

    keys.on('return', spy);

    // Simulates the event handler shifting focus to something other than the element on keydown
    // but before keyup. When the keyup occurs, Coral.keys needs to properly clear out the "return"
    // key from its key registry.
    helpers.keydown('return', div);
    helpers.keyup('return', document.body);

    helpers.keydown('down', div);
    // If "return" wasn't properly cleared, this keyup would make the "return" event trigger again.
    helpers.keyup('down', div);

    expect(spy.callCount).to.equal(1);
  });

  describe('sequences', function() {
    it('should support two key sequences', function() {
      var spy = sinon.spy();
      Coral.keys.on('a-b', spy);
      helpers.keypress('a');
      helpers.keypress('b');
      expect(spy.callCount).to.equal(1);
    });

    it('should support three key sequences', function() {
      var spy = sinon.spy();
      Coral.keys.on('a-b-c', spy);
      helpers.keypress('a');
      helpers.keypress('b');
      helpers.keypress('c');
      expect(spy.callCount).to.equal(1);
    });

    it('should support the Konami code', function() {
      var spy = sinon.spy();
      Coral.keys.on('up-up-down-down-left-right-b-a', spy);
      helpers.keypress('up');
      helpers.keypress('up');
      helpers.keypress('down');
      helpers.keypress('down');
      helpers.keypress('left');
      helpers.keypress('right');
      helpers.keypress('b');
      helpers.keypress('a');
      expect(spy.callCount).to.equal(1);
    });

    it('should support key sequences in succession without timeout', function() {
      var spy = sinon.spy();
      Coral.keys.on('a-b', spy);

      helpers.keypress('a');
      expect(spy.callCount).to.equal(0);
      helpers.keypress('b');
      expect(spy.callCount).to.equal(1);

      spy.reset();
      helpers.keypress('b');
      expect(spy.callCount).to.equal(0);

      spy.reset();
      helpers.keypress('a');
      helpers.keypress('b');
      expect(spy.callCount).to.equal(1);
    });

    it('should support key sequences with combinations', function() {
      var spy = sinon.spy();
      Coral.keys.on('ctrl+n-1', spy);
      helpers.keydown('control');
      helpers.keydown('n', null, ['control']);
      helpers.keyup('a');
      helpers.keyup('control');
      helpers.keypress('1');
      expect(spy.callCount).to.equal(1);
    });

    it('should support key sequences with combinations when modifier released first', function() {
      var spy = sinon.spy();
      Coral.keys.on('ctrl+n-1', spy);
      helpers.keydown('control');
      helpers.keydown('n', null, ['control']);
      helpers.keyup('control');
      helpers.keyup('a');
      helpers.keypress('1');
      expect(spy.callCount).to.equal(1);
    });

    describe('removing sequence listeners', function() {
      it('should support adding/removing key sequence listeners by name', function() {
        var spy = sinon.spy();
        Coral.keys.on('a-b', spy);
        helpers.keypress('a');
        helpers.keypress('b');
        expect(spy.callCount).to.equal(1);

        spy.reset();
        Coral.keys.off('a-b');
        helpers.keypress('a');
        helpers.keypress('b');
        expect(spy.callCount).to.equal(0);
      });

      it('should support adding/removing key sequence listeners with namespaces', function() {
        var spy = sinon.spy();
        Coral.keys.on('a-b.myNS', spy);
        helpers.keypress('a');
        helpers.keypress('b');
        expect(spy.callCount).to.equal(1);

        spy.reset();
        Coral.keys.off('.myNS');
        helpers.keypress('a');
        helpers.keypress('b');
        expect(spy.callCount).to.equal(0);
      });

      it('should support adding/removing key sequence listeners with namespace and by name', function() {
        var spy = sinon.spy();
        Coral.keys.on('a-b.myNS', spy);
        helpers.keypress('a');
        helpers.keypress('b');
        expect(spy.callCount).to.equal(1);

        spy.reset();
        Coral.keys.off('a-b.myNS');
        helpers.keypress('a');
        helpers.keypress('b');
        expect(spy.callCount).to.equal(0);
      });
    });
  });
});
