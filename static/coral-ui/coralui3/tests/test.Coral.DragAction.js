/*global helpers:true */
/*jshint camelcase:false */
describe('Coral.DragAction', function() {
  'use strict';

  // Mock for dragging
  function dragTo(dragAction, x, y) {
    var action = function(type, x, y) {
      dragAction[type]({
        pageX: x,
        pageY: y,
        preventDefault: function() {
        },
        target: {}
      });
    };
    action('_dragStart', 0, 0);
    action('_drag', x, y);
    action('_dragEnd', x, y);
  }

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('DragAction');
    });
  });

  describe('instance', function() {

    it('should initialize an instance of Coral.DragAction', function(done) {
      var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {
        new Coral.DragAction(dragElement);
        
        expect(dragElement.dragAction._dragElement).to.equal(dragElement);
        expect(dragElement.classList.contains('u-coral-openHand')).to.be.true;
        done();
      });
    });

    it('should destroy the Coral.DragAction instance', function(done) {
      var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {
        
        var dragAction = new Coral.DragAction(dragElement);
        
        var dragElementEvents = dragAction._dragEvents;
        var dragElementEventCount = dragElementEvents._allListeners.length;
        var windowEventCount = Coral.events._allListeners.length;

        dragAction.destroy();
        // mousestart, touchstart
        expect(dragElementEvents._allListeners.length).to.equal(dragElementEventCount - 2);
        // touchmove, mousemove, touchend, mouseend
        expect(Coral.events._allListeners.length).to.equal(windowEventCount - 4);
        done();
      });
    });

    it('should destroy the Coral.DragAction instance and restore the dragElement position', function(done) {
      var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {

        var dragAction = new Coral.DragAction(dragElement);
        var initialPosition = {
          top: dragElement.offsetTop,
          left: dragElement.offsetLeft
        };

        dragTo(dragAction, 100, 100);

        dragAction.destroy(true);

        expect(dragElement.offsetTop).to.equal(initialPosition.top);
        expect(dragElement.offsetLeft).to.equal(initialPosition.left);

        done();
      });
    });
  });

  describe('instance attributes', function() {

    describe('#dragElement', function() {

      it('should throw an error is dragElement is not passed', function(done) {
        var error = null;
        try {
          new Coral.DragAction();
        }
        catch (e) {
          error = e;
        }
        expect(error.message).to.equal('Coral.DragAction: dragElement is missing');
        done();
      });

      it('should set a DOM dragElement', function(done) {
        var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {
          var dragAction = new Coral.DragAction(dragElement);
          expect(dragAction._dragElement).to.equal(dragElement);
          expect(dragElement.classList.contains('u-coral-openHand')).be.true;
          done();
        });
      });

      it('should set the dragAction instance to the dragElement', function(done) {
        var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {
          var dragAction = new Coral.DragAction(dragElement);
          expect(dragElement.dragAction).to.equal(dragAction);
          done();
        });
      });

      it('should set a dragElement using a selector', function(done) {
        var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {
          var dragAction = new Coral.DragAction(dragElement);
          expect(dragAction._dragElement).to.equal(dragElement);
          expect(dragElement.classList.contains('u-coral-openHand')).to.be.true;
          done();
        });
      });

      it('should return the dragElement', function(done) {
        var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {
          var dragAction = new Coral.DragAction(dragElement);

          expect(dragElement).to.equal(dragAction.dragElement);
          expect(dragAction.dragElement).to.equal(dragAction._dragElement);
          done();
        });
      });

      it('should not be possible to set the dragElement', function(done) {
        var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {
          var dragAction = new Coral.DragAction(dragElement);

          dragAction.dragElement = '';

          expect(dragAction.dragElement).to.equal(dragElement);
          done();
        });
      });
    });

    describe('#dropZone', function() {

      it('should set a DOM dropZone', function(done) {
        var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {
          var dropElement = helpers.build(window.__html__['Coral.DragAction.drop.html'], function() {
            var dragAction = new Coral.DragAction(dragElement);
            dragAction.dropZone = dropElement;
            expect(dragAction._dropZones.length).to.equal(1);
            expect(dragAction._dropZones[0]).to.equal(dropElement);
            done();
          });
        });
      });

      it('should set a dropZone using a selector', function(done) {
        var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {
          var dropElement = helpers.build(window.__html__['Coral.DragAction.drop.html'], function() {
            var dragAction = new Coral.DragAction(dragElement);
            dragAction.dropZone = '.drop';
            expect(dragAction._dropZones.length).to.equal(1);
            expect(dragAction._dropZones[0]).to.equal(dropElement);
            done();
          });
        });
      });

      it('should set a dropZone using a NodeList', function(done) {
        var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {
          var dropElement = helpers.build(window.__html__['Coral.DragAction.drop.html'], function() {
            var dragAction = new Coral.DragAction(dragElement);
            dragAction.dropZone = document.querySelectorAll('.drop');
            expect(dragAction._dropZones.length).to.equal(1);
            expect(dragAction._dropZones[0]).to.equal(dropElement);
            done();
          });
        });
      });

      it('should return the dropZone', function(done) {
        var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {
          var dropElement = helpers.build(window.__html__['Coral.DragAction.drop.html'], function() {
            var dragAction = new Coral.DragAction(dragElement);
            dragAction.dropZone = dropElement;
            expect(dropElement).to.equal(dragAction.dropZone);
            expect(dragAction.dropZone).to.equal(dragAction._dropZone);
            done();
          });
        });
      });
    });

    describe('#handle', function() {

      it('should set a DOM as handle', function(done) {
        var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {
          var handleElement = helpers.build(window.__html__['Coral.DragAction.handle.html'], function() {
            var dragAction = new Coral.DragAction(dragElement);
            dragAction.handle = handleElement;
            expect(dragAction._handles.length).to.equal(1);
            expect(dragAction._handles[0]).to.equal(handleElement);
            done();
          });
        });
      });

      it('should set a handle using a selector', function(done) {
        var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {
          var handleElement = helpers.build(window.__html__['Coral.DragAction.handle.html'], function() {
            var dragAction = new Coral.DragAction(dragElement);
            dragAction.handle = '.handle';
            expect(dragAction._handles.length).to.equal(1);
            expect(dragAction._handles[0]).to.equal(handleElement);
            done();
          });
        });
      });

      it('should set a handle using a NodeList', function(done) {
        var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {
          var handleElement = helpers.build(window.__html__['Coral.DragAction.handle.html'], function() {
            var dragAction = new Coral.DragAction(dragElement);
            dragAction.handle = document.querySelectorAll('.handle');
            expect(dragAction._handles.length).to.equal(1);
            expect(dragAction._handles[0]).to.equal(handleElement);
            done();
          });
        });
      });

      it('should return the handle', function(done) {
        var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {
          var handleElement = helpers.build(window.__html__['Coral.DragAction.handle.html'], function() {
            var dragAction = new Coral.DragAction(dragElement);
            dragAction.handle = handleElement;
            expect(handleElement).to.equal(dragAction.handle);
            expect(dragAction.handle).to.equal(dragAction._handle);
            done();
          });
        });
      });
    });

    describe('#axis', function() {

      it('should set axis to horizontal', function(done) {
        var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {
          var dragAction = new Coral.DragAction(dragElement);
          dragAction.axis = 'horizontal';
          expect(dragAction.axis).to.equal('horizontal');
          done();
        });
      });

      it('should not accept other values than horizontal, vertical or default', function(done) {
        var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {
          var dragAction = new Coral.DragAction(dragElement);
          dragAction.axis = 'diagonale';
          expect(dragAction.axis).to.equal(Coral.DragAction.axis.FREE);
          done();
        });
      });

      it('should restrict the drag element to the horizontal axis', function(done) {
        var eventSpy = sinon.spy();

        var container = helpers.build(window.__html__['Coral.DragAction.container.html'], function() {
          var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {

            container.appendChild(dragElement);
            var dragAction = new Coral.DragAction(dragElement);
            dragAction.axis = 'horizontal';
            var expectedPosition = {
              left: dragElement.offsetLeft + 1000,
              top: dragElement.offsetTop
            };

            dragElement.addEventListener('coral-dragaction:dragend', eventSpy);
            dragTo(dragAction, 1000, 1000);

            var detail = eventSpy.args[0][0].detail;
            expect(dragElement.classList.contains('is-dragging')).to.be.false;
            expect(document.body.classList.contains('u-coral-closedHand')).to.be.false;
            expect(eventSpy.callCount).to.equal(1);
            expect(detail.dragElement).to.equal(dragElement);
            expect(detail.pageX).to.equal(1000);
            expect(detail.pageY).to.equal(1000);
            expect(dragElement.offsetTop).to.equal(expectedPosition.top);
            expect(dragElement.offsetLeft).to.equal(expectedPosition.left);
            done();
          });
        });
      });

      it('should restrict the drag element to the vertical axis', function(done) {
        var eventSpy = sinon.spy();

        var container = helpers.build(window.__html__['Coral.DragAction.container.html'], function() {
          var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {

            container.appendChild(dragElement);
            var dragAction = new Coral.DragAction(dragElement);
            dragAction.axis = 'vertical';
            var expectedPosition = {
              left: dragElement.offsetLeft,
              top: dragElement.offsetTop + 1000
            };

            dragElement.addEventListener('coral-dragaction:dragend', eventSpy);
            dragTo(dragAction, 1000, 1000);

            var detail = eventSpy.args[0][0].detail;
            expect(document.body.classList.contains('u-coral-closedHand')).to.be.false;
            expect(dragElement.classList.contains('is-dragging')).to.be.false;
            expect(eventSpy.callCount).to.equal(1);
            expect(detail.dragElement).to.equal(dragElement);
            expect(detail.pageX).to.equal(1000);
            expect(detail.pageY).to.equal(1000);
            expect(dragElement.offsetTop).to.equal(expectedPosition.top);
            expect(dragElement.offsetLeft).to.equal(expectedPosition.left);
            done();
          });
        });
      });
    });

    describe('#scroll', function() {

      it('should set scroll to true', function(done) {
        var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {
          var dragAction = new Coral.DragAction(dragElement);
          dragAction.scroll = true;
          expect(dragAction.scroll).to.be.true;
          done();
        });
      });
    });

    describe('#containment', function() {

      it('should set containment to true', function(done) {
        var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {
          var dragAction = new Coral.DragAction(dragElement);
          dragAction.containment = true;
          expect(dragAction.containment).to.be.true;
          done();
        });
      });

      it('should contain the drag element and set the new position', function(done) {
        var eventSpy = sinon.spy();

        var container = helpers.build(window.__html__['Coral.DragAction.container.html'], function() {
          var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {

            container.appendChild(dragElement);
            var dragAction = new Coral.DragAction(dragElement);
            dragAction.containment = true;
            var expectedPosition = {
              left: container.offsetLeft,
              top: container.offsetTop
            };

            dragElement.addEventListener('coral-dragaction:dragend', eventSpy);
            dragTo(dragAction, -1000, -1000);

            var detail = eventSpy.args[0][0].detail;
            expect(document.body.classList.contains('u-coral-closedHand')).to.be.false;
            expect(dragElement.classList.contains('is-dragging')).to.be.false;
            expect(eventSpy.callCount).to.equal(1);
            expect(detail.dragElement).to.equal(dragElement);
            expect(detail.pageX).to.equal(-1000);
            expect(detail.pageY).to.equal(-1000);
            expect(dragElement.offsetTop).to.equal(expectedPosition.top);
            expect(dragElement.offsetLeft).to.equal(expectedPosition.left);
            done();
          });
        });
      });

      it('should contain the drag element in the bottom right', function(done) {
        var eventSpy = sinon.spy();

        var container = helpers.build(window.__html__['Coral.DragAction.container.html'], function() {
          var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {

            container.appendChild(dragElement);
            var dragAction = new Coral.DragAction(dragElement);
            dragAction.containment = true;
            var expectedPosition = {
              left: container.offsetLeft + 150,
              top: container.offsetTop + 150
            };

            dragElement.addEventListener('coral-dragaction:dragend', eventSpy);
            dragTo(dragAction, 1000, 1000);

            var detail = eventSpy.args[0][0].detail;
            expect(document.body.classList.contains('u-coral-closedHand')).to.be.false;
            expect(dragElement.classList.contains('is-dragging')).to.be.false;
            expect(eventSpy.callCount).to.equal(1);
            expect(detail.dragElement).to.equal(dragElement);
            expect(detail.pageX).to.equal(1000);
            expect(detail.pageY).to.equal(1000);
            expect(dragElement.offsetTop).to.equal(expectedPosition.top);
            expect(dragElement.offsetLeft).to.equal(expectedPosition.left);
            done();
          });
        });
      });

      it('should contain the drag element in the bottom left', function(done) {
        var eventSpy = sinon.spy();

        var container = helpers.build(window.__html__['Coral.DragAction.container.html'], function() {
          var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {

            container.appendChild(dragElement);
            var dragAction = new Coral.DragAction(dragElement);
            dragAction.containment = true;
            var expectedPosition = {
              left: container.offsetLeft,
              top: container.offsetTop + 150
            };

            dragElement.addEventListener('coral-dragaction:dragend', eventSpy);
            dragTo(dragAction, -1000, 1000);

            var detail = eventSpy.args[0][0].detail;
            expect(document.body.classList.contains('u-coral-closedHand')).to.be.false;
            expect(dragElement.classList.contains('is-dragging')).to.be.false;
            expect(eventSpy.callCount).to.equal(1);
            expect(detail.dragElement).to.equal(dragElement);
            expect(detail.pageX).to.equal(-1000);
            expect(detail.pageY).to.equal(1000);
            expect(dragElement.offsetTop).to.equal(expectedPosition.top);
            expect(dragElement.offsetLeft).to.equal(expectedPosition.left);
            done();
          });
        });
      });

      it('should contain the drag element in the top left', function(done) {
        var eventSpy = sinon.spy();

        var container = helpers.build(window.__html__['Coral.DragAction.container.html'], function() {
          var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {

            container.appendChild(dragElement);
            var dragAction = new Coral.DragAction(dragElement);
            dragAction.containment = true;
            var expectedPosition = {
              left: container.offsetLeft,
              top: container.offsetTop
            };

            dragElement.addEventListener('coral-dragaction:dragend', eventSpy);
            dragTo(dragAction, -1000, -1000);

            var detail = eventSpy.args[0][0].detail;
            expect(dragElement.classList.contains('u-coral-closeHand')).to.be.false;
            expect(dragElement.classList.contains('is-dragging')).to.be.false;
            expect(eventSpy.callCount).to.equal(1);
            expect(detail.dragElement).to.equal(dragElement);
            expect(detail.pageX).to.equal(-1000);
            expect(detail.pageY).to.equal(-1000);
            expect(dragElement.offsetTop).to.equal(expectedPosition.top);
            expect(dragElement.offsetLeft).to.equal(expectedPosition.left);
            done();
          });
        });
      });

      it('should contain the drag element in the top right', function(done) {
        var eventSpy = sinon.spy();

        var container = helpers.build(window.__html__['Coral.DragAction.container.html'], function() {
          var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {

            container.appendChild(dragElement);
            var dragAction = new Coral.DragAction(dragElement);
            dragAction.containment = true;
            var expectedPosition = {
              left: container.offsetLeft + 150,
              top: container.offsetTop
            };

            dragElement.addEventListener('coral-dragaction:dragend', eventSpy);
            dragTo(dragAction, 1000, -1000);

            var detail = eventSpy.args[0][0].detail;
            expect(dragElement.classList.contains('u-coral-closeHand')).to.be.false;
            expect(dragElement.classList.contains('is-dragging')).to.be.false;
            expect(eventSpy.callCount).to.equal(1);
            expect(detail.dragElement).to.equal(dragElement);
            expect(detail.pageX).to.equal(1000);
            expect(detail.pageY).to.equal(-1000);
            expect(dragElement.offsetTop).to.equal(expectedPosition.top);
            expect(dragElement.offsetLeft).to.equal(expectedPosition.left);
            done();
          });
        });
      });
    });
  });

  describe('events', function() {

    it('should trigger coral-dragaction:dragstart', function(done) {
      var eventSpy = sinon.spy();

      var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {

        var dragAction = new Coral.DragAction(dragElement);
        dragElement.addEventListener('coral-dragaction:dragstart', eventSpy);
        dragAction._dragStart({
          pageX: 0,
          pageY: 0,
          preventDefault: function() {
          },
          target: {}
        });
        
        var detail = eventSpy.args[0][0].detail;
        expect(document.body.classList.contains('u-coral-closedHand')).to.be.true;
        expect(dragElement.classList.contains('is-dragging')).to.be.true;
        expect(eventSpy.callCount).to.equal(1);
        expect(detail.dragElement).to.equal(dragElement);
        expect(detail.pageX).to.equal(0);
        expect(detail.pageY).to.equal(0);
        done();
      });
    });

    it('should trigger coral-dragaction:dragstart once', function(done) {
      var eventSpy = sinon.spy();

      var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {

        var dragAction = new Coral.DragAction(dragElement);
        dragAction.handle = [];
        dragElement.addEventListener('coral-dragaction:dragstart', eventSpy);
        dragElement.dispatchEvent(new MouseEvent('mousedown'));
        expect(eventSpy.callCount).to.equal(1);
        done();
      });
    });

    it('should trigger coral-dragaction:drop', function(done) {
      var eventSpy = sinon.spy();

      var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {

        var dragAction = new Coral.DragAction(dragElement);
        dragAction.dropZone = 'body';
        dragElement.addEventListener('coral-dragaction:drop', eventSpy);
        dragTo(dragAction, 20, 20);

        var detail = eventSpy.args[0][0].detail;
        expect(detail.dragElement).to.equal(dragElement);
        expect(detail.pageX).to.equal(20);
        expect(detail.pageY).to.equal(20);
        expect(detail.dropElement).to.equal(document.body);
        expect(eventSpy.callCount).to.equal(1);
        done();
      });
    });

    it('should not trigger coral-dragaction:drop', function(done) {
      var eventSpy = sinon.spy();

      var dropZone = helpers.build(window.__html__['Coral.DragAction.drop.html'], function() {
        var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {

          var dragAction = new Coral.DragAction(dragElement);
          dragAction.dropZone = dropZone;
          dragElement.addEventListener('coral-dragaction:drop', eventSpy);
          dragTo(dragAction, -1000, -1000);

          expect(eventSpy.callCount).to.equal(0);
          done();
        });
      });
    });

    it('should trigger coral-dragaction:drag', function(done) {
      var eventSpy = sinon.spy();

      var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {

        var dragAction = new Coral.DragAction(dragElement);
        dragAction.dropZone = 'body';
        var expectedPosition = {
          left: dragElement.offsetLeft + 50,
          top: dragElement.offsetTop + 50
        };

        dragElement.addEventListener('coral-dragaction:drag', eventSpy);
        dragTo(dragAction, 50, 50);

        var detail = eventSpy.args[0][0].detail;
        expect(dragElement.classList.contains('u-coral-closeHand')).to.be.false;
        expect(dragElement.classList.contains('is-dragging')).to.be.false;
        expect(eventSpy.callCount).to.equal(1);
        expect(detail.dragElement).to.equal(dragElement);
        expect(detail.pageX).to.equal(50);
        expect(detail.pageY).to.equal(50);
        expect(dragElement.offsetTop).to.equal(expectedPosition.top);
        expect(dragElement.offsetLeft).to.equal(expectedPosition.left);
        done();
      });
    });

    it('should trigger coral-dragaction:dragend', function(done) {
      var eventSpy = sinon.spy();

      var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {

        var dragAction = new Coral.DragAction(dragElement);
        dragElement.addEventListener('coral-dragaction:dragend', eventSpy);
        dragTo(dragAction, 50, 50);

        var detail = eventSpy.args[0][0].detail;
        expect(dragElement.classList.contains('u-coral-closeHand')).to.be.false;
        expect(dragElement.classList.contains('is-dragging')).to.be.false;
        expect(eventSpy.callCount).to.equal(1);
        expect(detail.dragElement).to.equal(dragElement);
        expect(detail.pageX).to.equal(50);
        expect(detail.pageY).to.equal(50);
        done();
      });
    });
  });
  
  describe('Implementation Details', function() {
    it('should set the position to "relative" if not pre-defined while dragging', function(done) {
      var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {
        var dragAction = new Coral.DragAction(dragElement);
        
        dragAction._dragStart({
          pageX: 0,
          pageY: 0,
          preventDefault: function() {
          },
          target: {}
        });
        
        expect(getComputedStyle(dragElement).position).to.equal('relative');
        done();
      });
    });
  
    it('should not override the position if pre-defined while dragging', function(done) {
      var dragElement = helpers.build(window.__html__['Coral.DragAction.base.html'], function() {
        var dragAction = new Coral.DragAction(dragElement);
  
        dragElement.style.position = 'absolute';
      
        dragAction._dragStart({
          pageX: 0,
          pageY: 0,
          preventDefault: function() {
          },
          target: {}
        });
      
        expect(getComputedStyle(dragElement).position).to.equal('absolute');
        done();
      });
    });
  });
});
