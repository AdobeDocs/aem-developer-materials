/* global helpers:true */
describe('Coral.Shell.User', function() {
  'use strict';

  it('should be defined in the Coral.Shell namespace', function() {
    expect(Coral.Shell).to.have.property('User');
  });


  describe('instantiation', function() {
    it('should be possible using new', function() {
      var user = new Coral.Shell.User();
      expect(user.classList.contains('coral3-Shell-user')).to.be.true;
    });

    it('should be possible using createElement', function() {
      var user = document.createElement('coral-shell-user');
      expect(user.classList.contains('coral3-Shell-user')).to.be.true;
    });

    it('should be possible using markup', function(done) {
      helpers.build('<coral-shell-user>', function(el) {
        expect(el instanceof Coral.Shell.User).to.equal(true);
        done();
      });
    });

    it.skip('should be possible to clone using markup', function(done) {
      helpers.build('<coral-shell-user>', function(user) {
        helpers.testComponentClone(user, done);
      });
    });

    it.skip('should be possible to clone using js', function(done) {
      var user = new Coral.Shell.User();
      helpers.target.appendChild(user);
      helpers.next(function() {
        helpers.testComponentClone(user, done);
      });
    });
  });

  describe('markup', function() {

    describe('#avatar', function() {

      it('should be default value initially', function(done) {
        var user = helpers.build('<coral-shell-user></coral-shell-user>', function() {
          expect(user.avatar).to.equal(Coral.Shell.User.avatar.DEFAULT);
          expect(user._elements.avatar.classList.contains('coral3-Shell-user-avatar')).to.be.true;
          done();
        });
      });

      it('should set the new avatar', function(done) {
        var user = helpers.build('<coral-shell-user avatar="http://wwwimages.adobe.com/content/dam/Adobe/en/leaders/images/138x138/adobe-leaders-shantanu-narayen-138x138.jpg"></coral-shell-user>', function() {
          expect(user.avatar).to.equal('http://wwwimages.adobe.com/content/dam/Adobe/en/leaders/images/138x138/adobe-leaders-shantanu-narayen-138x138.jpg');
          expect(user._elements.avatar.classList.contains('coral3-Shell-user-avatar')).to.be.true;
          done();
        });
      });

      it('should allow empty avatar', function(done) {
        var user = helpers.build('<coral-shell-user avatar=""></coral-shell-user>', function() {
          expect(user.avatar).to.equal('');
          expect(user.hasAttribute('avatar')).to.be.true;
          expect(user._elements.avatar.classList.contains('coral3-Shell-user-avatar')).to.be.true;
          done();
        });
      });

      it('should support arbitrary relative URLs', function(done) {
        var user = helpers.build('<coral-shell-user avatar="image.png"></coral-shell-user>', function() {
          expect(user.avatar).to.equal('image.png');
          expect(user._elements.avatar.icon).to.equal('image.png');
          done();
        });
      });

      it('should support arbitrary relative URLs with paths', function(done) {
        var user = helpers.build('<coral-shell-user avatar="../image.png"></coral-shell-user>', function() {
          expect(user.avatar).to.equal('../image.png');
          expect(user._elements.avatar.icon).to.equal('../image.png');
          done();
        });
      });

      it('should support root relative URLs', function(done) {
        var user = helpers.build('<coral-shell-user avatar="/image.png"></coral-shell-user>', function() {
          expect(user.avatar).to.equal('/image.png');
          expect(user._elements.avatar.icon).to.equal('/image.png');
          done();
        });
      });

      it('should support arbitrary absolute URLs', function(done) {
        var user = helpers.build('<coral-shell-user avatar="http://localhost/image.png"></coral-shell-user>', function() {
          expect(user.avatar).to.equal('http://localhost/image.png');
          expect(user._elements.avatar.icon).to.equal('http://localhost/image.png');
          done();
        });
      });
    });
  });

  describe('API', function() {

    describe('#avatar', function() {
      it('should default to avatar.DEFAULT', function() {
        var user = new Coral.Shell.User();
        expect(user.avatar).to.equal(Coral.Shell.User.avatar.DEFAULT);
        expect(user._elements.avatar.classList.contains('coral3-Shell-user-avatar')).to.be.true;
      });

      it('should set the new avatar', function(done) {
        var user = new Coral.Shell.User();
        user.avatar = 'image.png';

        helpers.next(function() {
          expect(user._elements.avatar.icon).to.equal('image.png');
          done();
        });
      });

      it('should set the avatar back to default', function(done) {
        var user = new Coral.Shell.User();
        user.avatar = 'image.png';

        helpers.next(function() {
          user.avatar = Coral.Shell.User.avatar.DEFAULT;

          helpers.next(function() {
            expect(user.avatar).to.equal(Coral.Shell.User.avatar.DEFAULT);

            done();
          });
        });
      });

      it('should set the avatar to null when the attribute is removed', function(done) {
        var user = new Coral.Shell.User();
        user.setAttribute('avatar', 'image.png');

        helpers.next(function() {
          expect(user._elements.avatar.icon).to.equal('image.png');
          user.removeAttribute('avatar');

          helpers.next(function() {
            expect(user.avatar).to.equal(null);
            done();
          });
        });
      });
    });
  });
});
