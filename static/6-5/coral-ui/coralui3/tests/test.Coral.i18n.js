/* jshint -W117 */ // for helpers
/*jshint camelcase:false */ // for window.__html__
describe('Coral.i18n', function() {
  'use strict';

  before(function() {
    // Define test strings

    // single key, without arguments, without translation hints
    Coral.i18n.set('English string', 'Translated string');

    // single key, without arguments, with translation hints
    Coral.i18n.set('English string', 'Translated string 1', 'Translation hint 1');
    Coral.i18n.set('English string', 'Translated string 2', 'Translation hint 2');

    // single key, with arguments, without translation hints
    Coral.i18n.set('English string: {0}', 'Translated string: {0}');
    Coral.i18n.set('English string: {0}, {1}, and {2}', 'Translated string: {2}, {0}, and {1}');

    // single key, with arguments, with translation hints
    Coral.i18n.set('English string: {0}', 'Translated string 1: {0}', 'Translation hint 1');
    Coral.i18n.set('English string: {0}', 'Translated string 2: {0}', 'Translation hint 2');
    Coral.i18n.set('English string: {0}, {1}, and {2}', 'Translated string 1: {2}, {0}, and {1}', 'Translation hint 1');
    Coral.i18n.set('English string: {0}, {1}, and {2}', 'Translated string 2: {2}, {0}, and {1}', 'Translation hint 2');

    // single key, with named arguments, without translation hints
    Coral.i18n.set('English string: {name}', 'Translated string: {name}');
    Coral.i18n.set('English string: {name1}, {name2}, and {name3}', 'Translated string: {name3}, {name1}, and {name2}');

    // single key, with named arguments, with translation hints
    Coral.i18n.set('English string: {name}', 'Translated string 1: {name}', 'Translation hint 1');
    Coral.i18n.set('English string: {name}', 'Translated string 2: {name}', 'Translation hint 2');
    Coral.i18n.set('English string: {name1}, {name2}, and {name3}', 'Translated string 1: {name3}, {name1}, and {name2}', 'Translation hint 1');
    Coral.i18n.set('English string: {name1}, {name2}, and {name3}', 'Translated string 2: {name3}, {name1}, and {name2}', 'Translation hint 2');

    // multiple keys, without arguments, without translation hints
    Coral.i18n.set([
      ['English string 3', 'Translated string 3'],
      ['English string 4', 'Translated string 4']
    ]);

    // multiple keys, without arguments, with translation hints
    Coral.i18n.set([
      ['English string', 'Translated string 5', 'Translation hint 5'],
      ['English string', 'Translated string 6', 'Translation hint 6']
    ]);

    // multiple keys, with arguments, without translation hints
    Coral.i18n.set([
      ['English string 7: {0}','Translated string 7: {0}'],
      ['English string 8: {0}','Translated string 8: {0}']
    ]);

    Coral.i18n.set([
      ['English string 9: {0}, {1}, and {2}','Translated string 9: {2}, {0}, and {1}'],
      ['English string 10: {0}, {1}, and {2}','Translated string 10: {2}, {0}, and {1}']
    ]);

    // multiple key, with named arguments, without translation hints
    Coral.i18n.set([
      ['English string 11: {name}', 'Translated string 11: {name}'],
      ['English string 12: {name}', 'Translated string 12: {name}']
    ]);

    Coral.i18n.set([
      ['English string 13: {name1}, {name2}, and {name3}', 'Translated string 13: {name3}, {name1}, and {name2}'],
      ['English string 14: {name1}, {name2}, and {name3}', 'Translated string 14: {name3}, {name1}, and {name2}']
    ]);

    // multiple key, with arguments, with translation hints
    Coral.i18n.set([
      ['English string: {0}', 'Translated string 15: {0}', 'Translation hint 15'],
      ['English string: {0}', 'Translated string 16: {0}', 'Translation hint 16']
    ]);

    Coral.i18n.set([
      ['English string: {0}, {1}, and {2}', 'Translated string 17: {2}, {0}, and {1}', 'Translation hint 17'],
      ['English string: {0}, {1}, and {2}', 'Translated string 18: {2}, {0}, and {1}', 'Translation hint 18']
    ]);


    // multiple key, with named arguments, with translation hints
    Coral.i18n.set([
      ['English string: {name}', 'Translated string 19: {name}', 'Translation hint 19'],
      ['English string: {name}', 'Translated string 20: {name}', 'Translation hint 20']
    ]);

    Coral.i18n.set([
      ['English string: {name1}, {name2}, and {name3}', 'Translated string 21: {name3}, {name1}, and {name2}', 'Translation hint 21'],
      ['English string: {name1}, {name2}, and {name3}', 'Translated string 22: {name3}, {name1}, and {name2}', 'Translation hint 22']
    ]);
  });

  it('should exist', function() {
    expect(Coral.i18n).to.be.a('object');
    expect(Coral.i18n.locale).to.be.a('string');
    expect(Coral.i18n.set).to.be.a('function');
    expect(Coral.i18n.get).to.be.a('function');
  });

  describe('get', function() {
    it('should return empty string for no arguments', function() {
      expect(Coral.i18n.get()).to.equal('');
    });

    it('should support single key, without arguments, without translation hints', function() {
      expect(Coral.i18n.get('English string')).to.equal('Translated string');
    });

    it('should support single key, without arguments, with translation hints', function() {
      expect(Coral.i18n.get('English string', 'Translation hint 1')).to.equal('Translated string 1');
      expect(Coral.i18n.get('English string', 'Translation hint 2')).to.equal('Translated string 2');
    });

    it('should support single key, with arguments, without translation hints', function() {
      expect(Coral.i18n.get('English string: {0}', 10)).to.equal('Translated string: 10');
      expect(Coral.i18n.get('English string: {0}, {1}, and {2}', 10, 20, 30)).to.equal('Translated string: 30, 10, and 20');
    });

    it('should support single key, with arguments, with translation hints', function() {
      expect(Coral.i18n.get('English string: {0}', 10, 'Translation hint 1')).to.equal('Translated string 1: 10');
      expect(Coral.i18n.get('English string: {0}', 10, 'Translation hint 2')).to.equal('Translated string 2: 10');
      expect(Coral.i18n.get('English string: {0}, {1}, and {2}', 10, 20, 30, 'Translation hint 1')).to.equal('Translated string 1: 30, 10, and 20');
      expect(Coral.i18n.get('English string: {0}, {1}, and {2}', 10, 20, 30, 'Translation hint 2')).to.equal('Translated string 2: 30, 10, and 20');
    });

    it('should support single key, with named arguments, without translation hints', function() {
      expect(Coral.i18n.get('English string: {name}', { name: 'foo' })).to.equal('Translated string: foo');
      expect(Coral.i18n.get('English string: {name1}, {name2}, and {name3}', { name1: 'foo', name2: 'bar', name3: 'qux' })).to.equal('Translated string: qux, foo, and bar');
    });

    it('should support single key, with named arguments, with translation hints', function() {
      expect(Coral.i18n.get('English string: {name}', { name: 'foo' }, 'Translation hint 1')).to.equal('Translated string 1: foo');
      expect(Coral.i18n.get('English string: {name}', { name: 'foo' }, 'Translation hint 2')).to.equal('Translated string 2: foo');
      expect(Coral.i18n.get('English string: {name1}, {name2}, and {name3}', { name1: 'foo', name2: 'bar', name3: 'qux' }, 'Translation hint 1')).to.equal('Translated string 1: qux, foo, and bar');
      expect(Coral.i18n.get('English string: {name1}, {name2}, and {name3}', { name1: 'foo', name2: 'bar', name3: 'qux' }, 'Translation hint 2')).to.equal('Translated string 2: qux, foo, and bar');
    });

    it('should support multiple keys, without arguments, without translation hints', function() {
      expect(Coral.i18n.get('English string 3')).to.equal('Translated string 3');
      expect(Coral.i18n.get('English string 4')).to.equal('Translated string 4');
    });

    it('should support multiple keys, without arguments, with translation hints', function() {
      expect(Coral.i18n.get('English string', 'Translation hint 5')).to.equal('Translated string 5');
      expect(Coral.i18n.get('English string', 'Translation hint 6')).to.equal('Translated string 6');
    });

    it('should support multiple keys, with arguments, without translation hints', function() {
      expect(Coral.i18n.get('English string 7: {0}', 10)).to.equal('Translated string 7: 10');
      expect(Coral.i18n.get('English string 8: {0}', 20)).to.equal('Translated string 8: 20');
      expect(Coral.i18n.get('English string 9: {0}, {1}, and {2}', 10, 20, 30)).to.equal('Translated string 9: 30, 10, and 20');
      expect(Coral.i18n.get('English string 10: {0}, {1}, and {2}', 10, 20, 30)).to.equal('Translated string 10: 30, 10, and 20');
    });

    it('should support multiple keys, with named arguments, without translation hints', function() {
      expect(Coral.i18n.get('English string 11: {name}', { name: 'foo' })).to.equal('Translated string 11: foo');
      expect(Coral.i18n.get('English string 12: {name}', { name: 'foo' })).to.equal('Translated string 12: foo');
      expect(Coral.i18n.get('English string 13: {name1}, {name2}, and {name3}', { name1: 'foo', name2: 'bar', name3: 'qux' })).to.equal('Translated string 13: qux, foo, and bar');
      expect(Coral.i18n.get('English string 14: {name1}, {name2}, and {name3}', { name1: 'foo', name2: 'bar', name3: 'qux' })).to.equal('Translated string 14: qux, foo, and bar');
    });

    it('should support multiple keys, with arguments, with translation hints', function() {
      expect(Coral.i18n.get('English string: {0}', 10, 'Translation hint 15')).to.equal('Translated string 15: 10');
      expect(Coral.i18n.get('English string: {0}', 10, 'Translation hint 16')).to.equal('Translated string 16: 10');
      expect(Coral.i18n.get('English string: {0}, {1}, and {2}', 10, 20, 30, 'Translation hint 17')).to.equal('Translated string 17: 30, 10, and 20');
      expect(Coral.i18n.get('English string: {0}, {1}, and {2}', 10, 20, 30, 'Translation hint 18')).to.equal('Translated string 18: 30, 10, and 20');
    });

    it('should support multiple keys, with named arguments, with translation hints', function() {
      expect(Coral.i18n.get('English string: {name}', { name: 'foo' }, 'Translation hint 19')).to.equal('Translated string 19: foo');
      expect(Coral.i18n.get('English string: {name}', { name: 'foo' }, 'Translation hint 20')).to.equal('Translated string 20: foo');
      expect(Coral.i18n.get('English string: {name1}, {name2}, and {name3}', { name1: 'foo', name2: 'bar', name3: 'qux' }, 'Translation hint 21')).to.equal('Translated string 21: qux, foo, and bar');
      expect(Coral.i18n.get('English string: {name1}, {name2}, and {name3}', { name1: 'foo', name2: 'bar', name3: 'qux' }, 'Translation hint 22')).to.equal('Translated string 22: qux, foo, and bar');
    });

    it('should retrieve the key of a requested string if that key isn\'t in the dictionary', function() {
      expect(Coral.i18n.get('I am not registered')).to.equal('I am not registered');
    });
  });
});
