describe('Coral.FileUpload.Item', function() {
  'use strict';

  //Fake file
  var file = {
    name: 'file.png',
    value: 'file.png',
    size: 10000000,
    type: 'image/png'
  };

  //Fake event to be used on a change event of the file input: _onInputChange(event)
  var event = {
    stopPropagation: function() {},
    target: {
      files: [file]
    }
  };

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral.FileUpload).to.have.property('Item');
    });
  });

  describe('attributes', function() {
    describe('#file', function() {
      it('should expose file properties', function() {
        var item = new Coral.FileUpload.Item(file);
        expect(item.file.name).to.equal(file.name);
        expect(item.file.size).to.equal(file.size);
        expect(item.file.type).to.equal(file.type);
      });

      it('should be readonly', function() {
        var item = new Coral.FileUpload.Item(file);
        item.file = '';
        expect(item.file.name).to.equal(file.name);
        expect(item.file.size).to.equal(file.size);
        expect(item.file.type).to.equal(file.type);
      });
    });

    describe('#parameters', function() {
      it('should set additional parameters that have name and value property', function() {
        var item = new Coral.FileUpload.Item(file);
        expect(Array.isArray(item.parameters)).to.be.true;
        expect(item.parameters.length).to.equal(0);
        item.parameters = [
          {
            name: 'name',
            value: 'value'
          }
        ];
        expect(item.parameters.length).to.equal(1);
        expect(item.parameters[0].name).to.equal('name');
        expect(item.parameters[0].value).to.equal('value');
      });

      it('should not allow additional parameters without name and value or not an array', function() {
        var item = new Coral.FileUpload.Item(file);
        item.parameters = {
          x: 'name',
          y: 'value'
        };
        expect(item.parameters.length).to.equal(0);
      });
    });

    describe('#withCredentials', function() {
      it('should be false by default and of type boolean', function() {
        var item = new Coral.FileUpload.Item(file);
        expect(item.withCredentials).to.be.false;
        item.withCredentials = true;
        expect(item.withCredentials).to.be.true;
        item.withCredentials = 'false';
        expect(item.withCredentials).to.be.true;
      });
    });

    describe('#timeout', function() {
      it('should be 0 by default and of type number', function() {
        var item = new Coral.FileUpload.Item(file);
        expect(item.timeout).to.equal(0);
        item.timeout = 2000;
        expect(item.timeout).to.equal(2000);
        item.timeout = '';
        expect(item.timeout).to.equal(2000);
      });
    });

    describe('#responseType', function() {
      it('should be Coral.FileUpload.Item.responseType.TEXT by default and only accept related enum', function() {
        var item = new Coral.FileUpload.Item(file);
        expect(item.responseType).to.equal(Coral.FileUpload.Item.responseType.TEXT);
        item.responseType = Coral.FileUpload.Item.responseType.BLOB;
        expect(item.responseType).to.equal(Coral.FileUpload.Item.responseType.BLOB);
        item.responseType = '';
        expect(item.responseType).to.equal(Coral.FileUpload.Item.responseType.BLOB);
      });
    });

    describe('#readyState', function() {
      it('should be 0 by default and readonly', function() {
        var item = new Coral.FileUpload.Item(file);
        expect(item.readyState).to.equal(0);
        item.readyState = 200;
        expect(item.readyState).to.equal(0);
      });
    });

    describe('#response', function() {
      it('should be null by default and readonly', function() {
        var item = new Coral.FileUpload.Item(file);
        expect(item.response).to.equal(null);
        item.response = 'response';
        expect(item.response).to.equal(null);
      });
    });

    describe('#responseText', function() {
      it('should be empty string by default and readonly', function() {
        var item = new Coral.FileUpload.Item(file);
        expect(item.responseText).to.equal('');
        item.responseText = 'response';
        expect(item.responseText).to.equal('');
      });
    });

    describe('#responseXML', function() {
      it('should be null by default and readonly', function() {
        var item = new Coral.FileUpload.Item(file);
        expect(item.responseXML).to.equal(null);
        item.responseXML = 'response';
        expect(item.responseXML).to.equal(null);
      });
    });

    describe('#statusText', function() {
      it('should be empty string by default and readonly', function() {
        var item = new Coral.FileUpload.Item(file);
        expect(item.statusText).to.equal('');
        item.statusText = 'response';
        expect(item.statusText).to.equal('');
      });
    });

    describe('#_xhr', function() {
      it('should reflect xhr properties', function(done) {
        var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
          fileUpload._onInputChange(event);
          fileUpload.upload(file.name);
          helpers.next(function() {
            var item = fileUpload.uploadQueue[0];
            expect(item._xhr.timeout).to.equal(item.timeout);
            expect(item._xhr.responseType).to.equal(item.responseType);
            expect(item._xhr.withCredentials).to.equal(item.withCredentials);
            expect(item._xhr.response).to.equal(item.response);
            expect(item._xhr.responseText).to.equal(item.responseText);
            expect(item._xhr.status).to.equal(item.status);
            expect(item._xhr.statusText).to.equal(item.statusText);
            done();
          });
        });
      });
    });
  });

  describe('helpers', function() {
    describe('_isMimeTypeAllowed', function() {
      it('should be able to reject files based on their mimetype', function() {
        var item = new Coral.FileUpload.Item(file);
        var acceptedMimeType = 'text/plain, .jpg, application';
        expect(item._isMimeTypeAllowed(acceptedMimeType)).to.be.false;
      });

      it('should allow wildcard mime type', function() {
        var item = new Coral.FileUpload.Item(file);
        expect(item._isMimeTypeAllowed('*')).to.be.true;
        expect(item._isMimeTypeAllowed('.*')).to.be.true;
        expect(item._isMimeTypeAllowed('*/*')).to.be.true;
        expect(item._isMimeTypeAllowed('image/*')).to.be.true;
        expect(item._isMimeTypeAllowed('audio/*')).to.be.false;
        expect(item._isMimeTypeAllowed('video/*')).to.be.false;
      });
  
      it('should allow multiple mimetypes for a single file extension', function() {
        var item1 = new Coral.FileUpload.Item({type: 'text/csv'});
        var item2 = new Coral.FileUpload.Item({type: 'application/vnd.ms-excel'});
        var item3 = new Coral.FileUpload.Item({type: 'application/ms-excel'});
        
        expect(item1._isMimeTypeAllowed('.csv')).to.be.true;
        expect(item2._isMimeTypeAllowed('.csv')).to.be.true;
        expect(item3._isMimeTypeAllowed('.csv')).to.be.false;
      });
    });
  });
});
