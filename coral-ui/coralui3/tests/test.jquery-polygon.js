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

describe('jquery-polygon', function() {
  'use strict';

  var EPSILON = 0.000000001;

  describe('jQuery api', function () {
    it('should be defined on jQuery object', function () {
      var div = $('<div/>');
      expect(div).to.have.property('polygon');
    });
  });

  describe('api', function () {

    var $polygon, polygon;

    beforeEach(function () {
      $polygon = $('<div/>').polygon();
      polygon = $polygon.data('polygon');
    });

    afterEach(function () {
      $polygon = null;
      polygon = null;
    });

    describe('pointsToVectors()', function () {
      it('should handle empty cases', function () {
        expect(typeof(polygon.pointsToVectors())).to.equal('undefined');
        expect(polygon.pointsToVectors([])).to.eql([]);
      });

      it('should handle point cases', function () {
        expect(polygon.pointsToVectors({w: 1, h: 5})).to.eql([1, 5]);
        expect(polygon.pointsToVectors({x: 1, y: 5})).to.eql([1, 5]);
      });

      it('should handle array cases', function () {
        expect(polygon.pointsToVectors([{w: 1, h: 5}])).to.eql([[1, 5]]);
        expect(polygon.pointsToVectors([{x: 1, y: 5}])).to.eql([[1, 5]]);
      });
    });

    describe('filterLineSegmentsNextToPointAndSortByDistance()', function () {
      it('should handle empty case', function () {
        expect(polygon.filterLineSegmentsNextToPointAndSortByDistance([0,0], [])).to.eql([]);
      });

      it('should handle simple case', function () {
        var simpleLine = [[0, 0], [2, 0]];
        expect(polygon.filterLineSegmentsNextToPointAndSortByDistance([1,1], [simpleLine])).to.eql([{
          projection: [1,0],
          distance: 1,
          line: simpleLine
        }]);
      });
      it('should handle line sorting by distance asc', function () {
        var simpleLine = [[0, 0], [2, 0]];
        var zero5line = [[0, 0.5], [2, 0.5]];
        var result = polygon.filterLineSegmentsNextToPointAndSortByDistance([1,1], [simpleLine, zero5line]);

        expect(result[0].distance).to.equal(0.5);
        expect(result[0].line).to.eql(zero5line);
        expect(result[1].distance).to.equal(1);
        expect(result[1].line).to.eql(simpleLine);
      });

      it('should filter lines where projection is not in segment (point not beside line segment)', function () {
        var simpleLine = [[0, 0], [2, 0]];
        var farOutLine = [[0.5, 2], [1, 5]];
        var result = polygon.filterLineSegmentsNextToPointAndSortByDistance([1,1], [simpleLine, farOutLine]);

        expect(result[0].line).to.eql(simpleLine);
        expect(result.length).to.equal(1);

      });
    });

    describe('projectPointOntoLine()', function () {

      it('should handle l1=l2 edge case', function () {
        var result = polygon.projectPointOntoLine([-4,5], [3,0] , [3, 0]);
        expect(result[0]).to.be.closeTo(3, 6);
        expect(result[1]).to.be.closeTo(0, 6);
      });

      it('should handle zero division in orthogonal construction edge case', function () {
        var result = polygon.projectPointOntoLine([1,1], [3,0] , [0, 0]);
        expect(result[0]).to.be.closeTo(1, 6);
        expect(result[1]).to.be.closeTo(0, 6);

        result = polygon.projectPointOntoLine([1,1], [0,3] , [0, 0]);
        expect(result[0]).to.be.closeTo(0, 6);
        expect(result[1]).to.be.closeTo(1, 6);
      });

      it('should handle example data', function () {
        var result = polygon.projectPointOntoLine([-4,5], [3,0] , [0, -5]);
        expect(result[0]).to.be.closeTo(57/17, EPSILON);
        expect(result[1]).to.be.closeTo(10/17, EPSILON);
      });
    });

    describe('isWithin()', function () {

      it('should handle boundary interior tests', function () {
        expect(polygon.isWithin(1,1,1)).to.be.ok;
        expect(polygon.isWithin(1,1,2)).to.be.ok;
        expect(polygon.isWithin(1,2,2)).to.be.ok;

        expect(polygon.isWithin(2,1,1)).to.be.ok;
        expect(polygon.isWithin(2,2,1)).to.be.ok;

        expect(polygon.isWithin(1,0.9,1)).to.be.not.ok;
        expect(polygon.isWithin(1,1.1,1)).to.be.not.ok;
        expect(polygon.isWithin(1,0.9,2)).to.be.not.ok;
        expect(polygon.isWithin(1,2.1,2)).to.be.not.ok;

        expect(polygon.isWithin(2,0.9,1)).to.be.not.ok;
        expect(polygon.isWithin(2,2.1,1)).to.be.not.ok;
      });

      it('should handle normal case', function () {
        expect(polygon.isWithin(1,10,1)).to.be.not.ok;
        expect(polygon.isWithin(1,1.5,2)).to.be.ok;
        expect(polygon.isWithin(1,0,-5)).to.be.ok;
      });
    });

    describe('isPointInsideOrOnEdgeOfPolygon()', function () {

      it('should handle simple cases', function () {
        expect(polygon.isPointInsideOrOnEdgeOfPolygon([0.5, 0.5], [[0,0], [0.5, 1], [1, 0]])).to.be.ok;

        expect(polygon.isPointInsideOrOnEdgeOfPolygon([-0.5, 0.5], [[0,0], [0.5, 1], [1, 0]])).to.be.not.ok;
      });

      it('should handle example real case which fails if vector components become too large', function () {
        expect(polygon.isPointInsideOrOnEdgeOfPolygon([281, 78], [[228,42],[265,96],[487,432],[0,432]])).to.be.not.ok;
      });

      it('should handle vertex case', function () {
        expect(polygon.isPointInsideOrOnEdgeOfPolygon([0.5, 1], [[0,0], [0.5, 1], [1, 0]])).to.be.ok;

        expect(polygon.isPointInsideOrOnEdgeOfPolygon([0, 0], [[0,0], [0.5, 1], [1, 0]])).to.be.ok;
      });

      it('should handle parallel line vertex cases', function () {
        expect(polygon.isPointInsideOrOnEdgeOfPolygon([1, 0], [[0,0], [0.5, 1], [1, 0]])).to.be.ok;
        expect(polygon.isPointInsideOrOnEdgeOfPolygon([0, 0], [[0,0], [0.5, 1], [1, 0]])).to.be.ok;
      });

      it('should handle point on parallel line case', function () {
        expect(polygon.isPointInsideOrOnEdgeOfPolygon([0.25, 0], [[0,0], [0.5, 1], [1, 0]])).to.be.ok;
      });
    });

    describe('isPointOnLineSegment()', function () {

      it('should handle integer case', function () {
        expect(polygon.isPointOnLineSegment([2, 2], [1, 1], [3, 3])).to.be.ok;
      });

      it('should handle non-integer case', function () {

        expect(polygon.isPointOnLineSegment([3,0], [57/17,10/17], [0,-5])).to.be.ok;
      });

      it('should be false on near-misses', function () {

        // point outside of line
        expect(polygon.isPointOnLineSegment([3,0.5], [57/17,10/17], [-4,5])).to.not.be.ok;

        // point outside of segment
        expect(polygon.isPointOnLineSegment([57/17,10/17], [3,0], [-4,5])).to.not.be.ok;

      });

      it('should handle near values', function () {
        var p = [206.95384615384617,77.99999999999994];
        var l1 = [0, 432];
        var l2 = [228, 42];

        var projection = polygon.projectPointOntoLine(p, l1, l2);
        var pToProj = [projection[0] - p[0], projection[1] - p[1]];
        expect(polygon.vectorNorm(pToProj)).to.be.closeTo(0, EPSILON);

        expect(polygon.isPointOnLineSegment(p, l1, l2)).to.be.ok;
      });
    });

    describe('intersectSegments()', function () {

      it('should handle simple case', function () {
        var result = polygon.intersectSegments([[0, 1], [0, -1]], [[-4, 0], [1,0]]);
        expect(result).to.eql([0,  0]);
      });

      it('should handle real example case', function () {
        // this fails with 2^52 instead of -60,000,000
        var result = polygon.intersectSegments([[0, 432], [228, 42]], [[-60000000, 78], [281, 78]]);
        expect(result[0]).to.be.closeTo(206.95384615659714, EPSILON);
        expect(result[1]).to.be.closeTo(78, EPSILON);
      });

      it('should handle edge case', function () {
        var result = polygon.intersectSegments([[0, 1], [0, 0]], [[-4, 0], [1,0]]);
        expect(result).to.eql([0,  0]);
      });

      it('should handle parallel distinct line cases', function () {
        var result = polygon.intersectSegments([[0, 1], [0, 0]], [[1, 1], [1,0]]);
        expect(result).to.eql(null);

        result = polygon.intersectSegments([[0, 1], [0.5, 1.5]], [[1, 1], [1.5,1.5]]);
        expect(result).to.eql(null);
      });

      describe('parallel same line cases', function () {
        it('should handle outside cases', function () {
          var result = polygon.intersectSegments([[0, 4], [0, 3]], [[0, 1], [0, -2]]);
          expect(result).to.eql(null);

          result = polygon.intersectSegments([[0, 1], [0, -2]], [[0, 4], [0, 3]]);
          expect(result).to.eql(null);
        });

        it('should handle inside cases', function () {
          var result = polygon.intersectSegments([[0, 4], [0, 1]], [[0, 3], [0, 2]]);
          expect(result).to.eql([[0,3], [0,2]]);

          result = polygon.intersectSegments([[0, 3], [0, 2]], [[0, 4], [0, 1]]);
          expect(result).to.eql([[0,3], [0,2]]);

        });

        it('should handle overlapping cases', function () {
          var result = polygon.intersectSegments([[0, 4], [0, 0]], [[0, 5], [0, 3]]);
          expect(result).to.eql([[0,4], [0, 3]]);

          result = polygon.intersectSegments([[0, 0], [0, 4]], [[0, 5], [0, 3]]);
          expect(result).to.eql([[0,4], [0, 3]]);

          result = polygon.intersectSegments([[0, 0], [0, 4]], [[0, 3], [0, 5]]);
          expect(result).to.eql([[0,4], [0, 3]]);

          result = polygon.intersectSegments([[0, 5], [0, 3]], [[0, 4], [0, 0]]);
          expect(result).to.eql([[0,3], [0, 4]]);

          result = polygon.intersectSegments([[0, 3], [0, 5]], [[0, 4], [0, 0]]);
          expect(result).to.eql([[0,3], [0, 4]]);

          result = polygon.intersectSegments([[0, 3], [0, 5]], [[0, 0], [0, 4]]);
          expect(result).to.eql([[0,3], [0, 4]]);

          result = polygon.intersectSegments([[0, 5], [0, 3]], [[0, 0], [0, 4]]);
          expect(result).to.eql([[0,3], [0, 4]]);

        });

      });

      it('should handle several point cases', function () {
        var result = polygon.intersectSegments([[1, 1], [1, 1]], [[1, 2], [1,-2]]);
        expect(result).to.eql([1, 1]);

        result = polygon.intersectSegments([[1, 1], [1, 1]], [[1, 1], [1,1]]);
        expect(result).to.eql([1, 1]);

        result = polygon.intersectSegments([[1, 13], [1, 0.4]], [[1, 1], [1,1]]);
        expect(result).to.eql([1, 1]);

        result = polygon.intersectSegments([[1, 1], [1, 1]], [[2, 1], [2,5]]);
        expect(result).to.eql(null);

        result = polygon.intersectSegments([[2, 1], [2,5]], [[1, 1], [1, 1]]);
        expect(result).to.eql(null);

        result = polygon.intersectSegments([[2, 2], [2,2]], [[1, 1], [1, 1]]);
        expect(result).to.eql(null);
      });
    });

    describe('intersectLines()', function () {

      it('should handle simple case', function () {
        var result = polygon.intersectLines([[0, 1], [0, 0]], [[-4, 0], [1,0]]);
        expect(result).to.eql([0,  0]);
      });

      it('should handle real world case', function () {
        var l1 = [0, 432];
        var l2 = [228, 42];

        // extreme input:
        var result = polygon.intersectLines([[-60000000, 78], [281, 78]], [[0, 432], [228, 42]]);

        var projection = polygon.projectPointOntoLine(result, l1, l2);
        var resultToProj = [projection[0] - result[0], projection[1] - result[1]];
        expect(polygon.vectorNorm(resultToProj)).to.be.closeTo(0, EPSILON);
      });

      it('should handle parallel distinct line cases', function () {
        var result = polygon.intersectLines([[0, 1], [0, 0]], [[1, 1], [1,0]]);
        expect(result).to.eql(null);

        result = polygon.intersectLines([[0, 1], [0.5, 1.5]], [[1, 1], [1.5,1.5]]);
        expect(result).to.eql(null);
      });

      it('should handle parallel same line cases', function () {
        var result = polygon.intersectLines([[0, 4], [0, 3]], [[0, 1], [0,-2]]);
        expect(result).to.eql(true);

        result = polygon.intersectLines([[0, 4], [-0.5, 3.5]], [[-1, 3], [-1.5,2.5]]);
        expect(result).to.eql(true);
      });

      it('should handle several point cases', function () {
        var result = polygon.intersectLines([[1, 1], [1, 1]], [[1, 2], [1,-2]]);
        expect(result).to.eql([1, 1]);

        result = polygon.intersectLines([[1, 1], [1, 1]], [[1, 1], [1,1]]);
        expect(result).to.eql([1, 1]);

        result = polygon.intersectLines([[1, 13], [1, 0.4]], [[1, 1], [1,1]]);
        expect(result).to.eql([1, 1]);

        result = polygon.intersectLines([[1, 1], [1, 1]], [[2, 1], [2,5]]);
        expect(result).to.eql(null);

        result = polygon.intersectLines([[2, 1], [2,5]], [[1, 1], [1, 1]]);
        expect(result).to.eql(null);

        result = polygon.intersectLines([[2, 2], [2,2]], [[1, 1], [1, 1]]);
        expect(result).to.eql(null);
      });
    });

    describe('vectorNorm()', function () {

      it('should handle some simple cases', function () {
        expect(polygon.vectorNorm([2, 2])).to.be.closeTo(Math.sqrt(8), EPSILON);
        expect(polygon.vectorNorm([1, 1])).to.be.closeTo(Math.sqrt(2), EPSILON);
        expect(polygon.vectorNorm([5.3, 32.1])).to.be.closeTo(Math.sqrt(5.3*5.3 + 32.1*32.1), EPSILON);
      });
    });
  });
});
