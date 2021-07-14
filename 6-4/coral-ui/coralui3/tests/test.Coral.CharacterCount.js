describe('Coral.CharacterCount', function() {
  'use strict';

  var input, characterCount;

  describe('instantiation', function() {
    it('should be possible using new', function(done) {
      var defaultCharacterCount = new Coral.CharacterCount();
      expect(defaultCharacterCount.classList.contains('coral3-CharacterCount')).to.be.true;
      helpers.next(function() {
        expect(defaultCharacterCount).to.have.property('target');
        expect(defaultCharacterCount).to.have.property('maxLength');
        expect(defaultCharacterCount.target).to.equal(Coral.CharacterCount.target.PREVIOUS);
        expect(defaultCharacterCount.maxLength).to.be.null;
        done();
      });
    });

    it('should be possible using createElement', function(done) {
      var defaultCharacterCount = document.createElement('coral-charactercount');
      expect(defaultCharacterCount.classList.contains('coral3-CharacterCount')).to.be.true;
      helpers.next(function() {
        expect(defaultCharacterCount).to.have.property('target');
        expect(defaultCharacterCount).to.have.property('maxLength');
        expect(defaultCharacterCount.target).to.equal(Coral.CharacterCount.target.PREVIOUS);
        expect(defaultCharacterCount.maxLength).to.be.null;
        done();
      });
    });

    it('should be possible using markup', function(done) {
      var defaultCharacterCount = helpers.build('<coral-charactercount></coral-charactercount>', function() {
        expect(defaultCharacterCount).to.have.property('target');
        expect(defaultCharacterCount).to.have.property('maxLength');
        expect(defaultCharacterCount.target).to.equal(Coral.CharacterCount.target.PREVIOUS);
        expect(defaultCharacterCount.maxLength).to.be.null;
        done();
      });
    });

    it('should be possible to clone using markup', function(done) {
      helpers.build('<coral-charactercount></coral-charactercount>', function(defaultCharacterCount) {
        helpers.testComponentClone(defaultCharacterCount, done);
      });
    });

    it('should be possible to clone using js', function(done) {
      var defaultCharacterCount = new Coral.CharacterCount();
      helpers.target.appendChild(defaultCharacterCount);
      helpers.next(function() {
        helpers.testComponentClone(defaultCharacterCount, done);
      });
    });
  });

  describe('behavior', function() {

    var typeValue = function(value){
      input.value = value;

      var event = document.createEvent('Event');
      event.initEvent('input', true, true);
      input.dispatchEvent(event);
    };

    beforeEach(function(){
      input = new Coral.Textfield();
      input.id = 'example-input';
      helpers.target.appendChild(input);

      characterCount = new Coral.CharacterCount();
      helpers.target.appendChild(characterCount);
      characterCount.target = '#example-input';
    });

    afterEach(function(){
      input = null;
      characterCount = null;
    });

    it('should reduce counter for each character entered when maxLength not null', function() {
      characterCount.maxLength = 12;

      typeValue('12345');
      expect(characterCount.innerHTML).to.equal('7');
    });

    it('should reach 0 when characters entered == maxLength', function(){
      characterCount.maxLength = 4;

      typeValue('qwer');
      expect(characterCount.innerHTML).to.equal('0');
    });

    it('should show a negative value when characters entered > maxLength', function(){
      characterCount.maxLength = 2;

      typeValue('123');
      expect(characterCount.innerHTML).to.equal('-1');
    });

    it('it should add is-invalid when character entered > maxLength', function(){
      characterCount.maxLength = 3;

      expect(input.classList.contains('is-invalid')).to.be.false;
      expect(characterCount.classList.contains('is-invalid')).to.be.false;

      typeValue('1234');
      expect(input.classList.contains('is-invalid')).to.be.true;
      expect(characterCount.classList.contains('is-invalid')).to.be.true;
    });

    it('should start counter at 0 when maxLength is null', function(done) {
      helpers.next(function() {
        expect(characterCount.innerHTML).to.equal('0');
        done();
      });
    });

    it('should increment counter for each character entered when maxLength is null', function(){
      typeValue('98765432');
      expect(characterCount.innerHTML).to.equal('8');
    });
  });
});
