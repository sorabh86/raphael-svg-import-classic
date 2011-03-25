/*
* Raphael SVG Import 0.0.1 - Extension to Raphael JS
*
* Copyright (c) 2009 Wout Fierens
* Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
* 
* 
* 2010-10-05 modifications by Jonas Olmstead
* - added support for radial and linear gradients
* - added support for paths
* - removed prototype.js dependencies (I can't read that stuff)
* - changed input parameter to svg xml file
* - added support for text elements
* - added support for reading groups into flat structure
* - svg elements returned as a set
*
*/
Raphael.fn.importSVG = function (svgXML) {
  try {
    this.parseElement = function(elShape) {
      var attr = {"stroke-width": 0, "fill":"#000"};
      if (elShape.attributes){
        for (var i = elShape.attributes.length - 1; i >= 0; --i){
          attr[elShape.attributes[i].name] = elShape.attributes[i].value;
        }
      }
      var shape, style;
      switch(elShape.nodeName) {
        case "svg":
        case "g":
          // pass the id to the first child, parse the children
          var groupId = elShape.getAttribute('id');
          if (groupId && elShape.childNodes.length) {
            elShape.childNodes.item(1).setAttribute('id', groupId);
          }
          for (var i = 0; i < elShape.childNodes.length; ++i) {
            this.parseElement(elShape.childNodes.item(i));
          }
          return;
        break;
        case "rect":
          shape = this.rect();
        break;
        case "circle":
          shape = this.circle();
        break;
        case "ellipse":
          shape = this.ellipse();
        break;
        case "path":
          shape = this.path(attr.d);
          delete attr.d;
        break;
        case "polygon":
          shape = this.polygon(attr.points);
          delete attr.points;
        break;
        case "image":
          shape = this.image();
        break;
        case "text":
          shape = this.text(attr.x, attr.y, elShape.text || elShape.textContent);
          shape.attr("stroke","none");
          shape.origFontPt = parseInt(attr["font-size"], 10);
        break;
        default:
          return;
      }

      // apply matrix transformation
      var matrix = attr.transform;
      if (matrix) {
        matrix = matrix.substring(7, matrix.length-1).split(', ');
        shape.matrix(+matrix[0], +matrix[1], +matrix[2], +matrix[3]);
        shape.translate(matrix[4], matrix[5]);
        delete attr.transform;
      }

      shape.attr(attr);

      // assign an arbitrary id
      var nodeID = elShape.getAttribute("id");
      if (nodeID) {
        shape.node.id = nodeID;
      }

      myNewSet.push(shape);
      return shape;
    };

    var elSVG = svgXML.getElementsByTagName("svg")[0];
    elSVG.normalize();
    var myNewSet = this.set();
    this.parseElement(elSVG);
  } catch (error) {
    console.log("The SVG data you entered was invalid! (" + error + ")");
  }

  return myNewSet;
};


// extending raphael with a polygon function
Raphael.fn.polygon = function(pointString) {
  var poly = ['M'],
      point = pointString.split(' ');

  for(var i=0; i < point.length; i++) {
     var c = point[i].split(',');
     for(var j=0; j < c.length; j++) {
        var d = parseFloat(c[j]);
        if (d)
          poly.push(d);
     };
     if (i == 0)
      poly.push('L');
  }
  poly.push('Z');

  return this.path(poly);
};
