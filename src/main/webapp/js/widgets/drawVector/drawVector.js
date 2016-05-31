/*******************************************************************************
 * The MIT License (MIT)
 *
 * Copyright (c) 2011, 2016 OpenWorm.
 * http://openworm.org
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the MIT License
 * which accompanies this distribution, and is available at
 * http://opensource.org/licenses/MIT
 *
 * Contributors:
 *      OpenWorm - http://openworm.org/people.html
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 *******************************************************************************/
/**
 * Draw vector Widget
 *
 * @module Widgets/DrawVector
 * @author mcantarelli
 */
define(function (require) {

    var Widget = require('widgets/Widget');
    var $ = require('jquery');

    return Widget.View.extend({

        /**
         * Initialize the popup widget
         */
        initialize: function (options) {
            var that = this;
            this.id = options.id;
            this.name = options.name;
            this.visible = options.visible;
            this.render();
            this.setSize(615, 615);
            this.customHandlers = [];

            $("#" + this.id).addClass("drawVector");
            var canvasId = "canvas" + this.id;
            $("#" + this.id).append("<div id='canvasarea'><div class='drawPanel'><div class='mouseX'></div> <div class='mouseY'></div><div class='icon fa fa-save saveIcon'></div><div class='icon fa fa-line-chart vectorIcon'></div></div><canvas id='" + canvasId + "' width='700' height='700'></canvas></div>");
            $("#" + this.id + " .saveIcon").click(function () {
                GEPPETTO.Console.executeCommand(that.id + ".downloadSVG();");
            });
            $("#" + this.id + " .vectorIcon").click(function () {
                GEPPETTO.Console.executeCommand(that.id + ".getVector();");
            });

            this.canvas = new fabric.Canvas(canvasId, {selection: false});
            fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

            this.canvasWidth = 700;
            this.canvasHeight = 700;
            this.xOrigin = 50;
            this.yOrigin = 30;
            this.axisWidth = 500;
            this.axisHeight = 500;
            this.maxX = 10;
            this.maxY = 1;
            this.grid = 50;

            this.buildAxisAndGrid();
            this.setupHandlers();

            //this.enableZoom();

            //creates the fist vector
            var line = this.createVector([this.xOrigin, this.yOrigin + this.axisHeight, this.xOrigin + this.axisWidth, this.yOrigin + this.axisHeight]);

            this.canvas.add(line);

            this.canvas.add(
                this.createControlPoint(line.get('x1'), line.get('y1'), null, line),
                this.createControlPoint(line.get('x2'), line.get('y2'), line, null)
            );
        },


        //Factory functions

        createControlPoint: function (left, top, lLine, rLine) {
            var controlPoint = new fabric.Circle({
                left: left,
                top: top,
                strokeWidth: 2,
                radius: 4,
                fill: '#fff',
                hasControls: false,
                hasBorders: false,
                selectable: true,
                targetFindTolerance: 6,
                stroke: '#666'
            });

            //set the left line and right line links
            controlPoint.lLine = lLine;
            controlPoint.rLine = rLine;

            if (lLine) {
                lLine.rControlPoint = controlPoint;
            }
            if (rLine) {
                rLine.lControlPoint = controlPoint;
            }

            return controlPoint;
        },

        /**
         * This creates a vector
         * @param coords
         * @returns {*}
         */
        createVector: function (coords) {
            return new fabric.Line(coords, {
                fill: 'white',
                stroke: 'white',
                strokeWidth: 2,
                selectable: true,
                hasControls: false,
                hasBorders: false,
                hasRotatingPoint: false,
                lockMovementX: true,
                lockMovementY: true,
                perPixelTargetFind: true,
                hoverCursor: "crosshair"
            });
        },


        /**
         * This is the red square visualised at the center of a line
         * @param left
         * @param top
         * @returns {*}
         */
        createRedSquare: function (left, top) {
            return new fabric.Rect({
                left: left,
                top: top,
                strokeWidth: 2,
                width: 4,
                height: 4,
                fill: '#f00',
                hasControls: false,
                hasBorders: false,
                lockMovementX: true,
                lockMovementY: true,
                targetFindTolerance: 6,
                evented: false,
                hoverCursor: "crosshair"
            });
        },

        //Utility functions

        getNormalizedToYAxis: function (y) {
            var num = y * this.maxY / this.axisHeight;
            return Math.round(num * 1000) / 1000;
        },

        getNormalizedToXAxis: function (x) {
            var num = x * this.maxX / this.axisWidth;
            return Math.round(num * 1000) / 100;
        },

        // Given a X in the screen coordinate give 1st quadrant cartesian coordinates
        xScreenToXCart: function (px) {
            return this.getNormalizedToXAxis(px - this.xOrigin);
        },

        // Given a Y in the screen coordinate give 1st quadrant cartesian coordinates
        yScreenToYCart: function (py) {
            return this.getNormalizedToYAxis(-(py - this.axisHeight - this.yOrigin));
        },

        /**
         * Finds the closest point between two alternatives
         * @param from teh source from which to measure
         * @param pointA first candidate
         * @param pointB second candidate
         * @returns {*}
         */
        closer: function (from, pointA, pointB) {
            var dA = Infinity;
            var dB = Infinity;
            if (pointA) {
                dA = Math.hypot(pointA.left - from.x, from.y - pointA.top)
            }
            if (pointB) {
                dB = Math.hypot(pointB.left - from.x, from.y - pointB.top)
            }
            return dA < dB ? pointA : pointB;
        },

        /**
         * Adds the event handlers with the logic do add and remove control points and update the canvas
         */
        setupHandlers: function () {

            var that = this;

            that.canvas.on('mouse:over', function (e) {
                var p = e.target
                if (p instanceof fabric.Circle) {
                    //we color the control point in red
                    p.fill = "red";
                    that.canvas.renderAll();
                }
                else if (p instanceof fabric.Line) {
                    if (!p.grid) {
                        //we add a red square at the center of the line
                        p.centerSquare = that.createRedSquare(p.getCenterPoint().x, p.getCenterPoint().y);
                        that.canvas.add(p.centerSquare);
                        p.centerSquare.bringToFront();
                        that.canvas.renderAll();
                    }
                }
            });

            that.canvas.on('mouse:out', function (e) {
                var p = e.target
                if (p instanceof fabric.Circle) {
                    p.fill = "white";
                    that.canvas.renderAll();
                }
                else if (p instanceof fabric.Line) {
                    if (p.centerSquare) {
                        that.canvas.remove(p.centerSquare);
                        delete p.centerSquare;
                        that.canvas.renderAll();
                    }
                }
            });

            that.canvas.on('mouse:down', function (e) {
                if (!GEPPETTO.isKeyPressed("alt")) {
                    var pointer = that.canvas.getPointer(e.e);
                    var closest = null;
                    that.canvas.forEachObject(function (o) {
                        //search for the closest control point
                        if (o instanceof fabric.Circle) {
                            closest = that.closer(pointer, closest, o);
                        }
                    });
                    if (closest) {
                        closest.left = pointer.x;
                        closest.top = pointer.y;
                        that.canvas.fire('object:moving', {target: closest}, e);
                    }
                }
            });


            that.canvas.on('object:moving', function (e) {
                var controlPoint = e.target;
                //imposes the top movement constraints
                if (controlPoint.top < that.yOrigin) {
                    controlPoint.top = that.yOrigin;
                }
                else if (controlPoint.top > that.yOrigin + that.axisHeight) {
                    controlPoint.top = that.yOrigin + that.axisHeight;
                }
                //imposes the left movement constraint
                if (controlPoint.left < that.xOrigin) {
                    controlPoint.left = that.xOrigin;
                }
                if (controlPoint.left > that.xOrigin + that.axisWidth) {
                    controlPoint.left = that.xOrigin + that.axisWidth;
                }
                if (controlPoint.lLine) {

                    if (controlPoint.left < controlPoint.lLine.lControlPoint.left) {
                        controlPoint.left = controlPoint.lLine.lControlPoint.left;
                    }
                    if (controlPoint.rLine) {
                        //imposes the right movement constraint

                        if (controlPoint.left > controlPoint.rLine.rControlPoint.left) {
                            controlPoint.left = controlPoint.rLine.rControlPoint.left;
                        }
                        controlPoint.rLine.set({'x1': controlPoint.left, 'y1': controlPoint.top});
                    }
                    controlPoint.lLine.set({'x2': controlPoint.left, 'y2': controlPoint.top});

                }
                else {
                    if (controlPoint.rLine) {
                        //imposes the right movement constraint
                        if (controlPoint.left > that.xOrigin + that.axisWidth) {
                            controlPoint.left = that.xOrigin + that.axisWidth;
                        }
                        else if (controlPoint.left > controlPoint.rLine.rControlPoint.left) {
                            controlPoint.left = controlPoint.rLine.rControlPoint.left;
                        }
                        controlPoint.rLine.set({'x1': controlPoint.left, 'y1': controlPoint.top});
                    }
                }

                that.canvas.deactivateAll().renderAll();
            });

            that.canvas.on('object:selected', function (e) {
            	var clicked = e.target;
            	var pointer = that.canvas.getPointer(e.e);
                if (clicked instanceof fabric.Line) {
                    //the clicked line will end at the mouse coordinates
                    clicked.set({'x2': pointer.x, 'y2': pointer.y});

                    //we take the coordinates of the original end of the clicked line
                    var circle2X = clicked.rControlPoint.left;
                    var circle2Y = clicked.rControlPoint.top;

                    //we create a new line starting from where we clicked and ending at the end of the original clicked line
                    var newLine = that.createVector([pointer.x, pointer.y, circle2X, circle2Y]);
                    newLine.lControlPoint = clicked.rControlPoint;
                    that.canvas.add(newLine);

                    //we add a new circle as a control point between the clicked line and the newly created one
                    var newControlPoint = that.createControlPoint(newLine.get('x2'), newLine.get('y2'), newLine, clicked.rControlPoint.rLine);
                    that.canvas.add(newControlPoint);

                    //let's update the original control point to link the two segments
                    clicked.rControlPoint.set({'left': pointer.x, 'top': pointer.y});
                    clicked.rControlPoint.lLine = clicked;
                    clicked.rControlPoint.rLine = newLine;

                    //let's bring all control point to the front (so that lines don't go on top of them)
                    newControlPoint.bringToFront();
                    clicked.rControlPoint.bringToFront();
                }
                else if (clicked instanceof fabric.Circle) {
                    if (GEPPETTO.isKeyPressed("alt")) {
                        //we remove the control point
                        clicked.lLine.set('x2', clicked.rLine.get('x2'));
                        clicked.lLine.set('y2', clicked.rLine.get('y2'));
                        clicked.lLine.setCoords();
                        clicked.rLine.rControlPoint.lLine = clicked.lLine;
                        clicked.lLine.rControlPoint = clicked.rLine.rControlPoint;
                        that.canvas.remove(clicked.rLine);
                        that.canvas.remove(clicked);
                    }
                }
                that.canvas.deactivateAll().renderAll();
                that.canvas.calcOffset();
            });

            that.canvas.on('mouse:move', function (e) {
            	var pointer = that.canvas.getPointer(e.e);
                $("#" + that.id + " .mouseX").html("X: " + that.xScreenToXCart(pointer.x));
                $("#" + that.id + " .mouseY").html("Y: " + that.yScreenToYCart(pointer.y));
                that.canvas.forEachObject(function (o) {
                    o.setCoords();
                });
            });

        },

        /**
         * Adds to the canvas a grid and the two axis and labels
         */
        buildAxisAndGrid: function () {
            var grid = 50;
            for (var i = 0; i <= (this.axisWidth / grid); i++) {
                //X grid lines
                this.canvas.add(new fabric.Line([i * grid + this.xOrigin, this.yOrigin, i * grid + this.xOrigin, this.axisHeight + this.yOrigin], {
                    stroke: '#737373',
                    hasControls: false,
                    hasBorders: false,
                    selectable: false,
                    evented: false,
                    grid: true
                }));

                //Y grid lines
                this.canvas.add(new fabric.Line([0 + this.xOrigin, i * grid + this.yOrigin, this.axisWidth + this.xOrigin, i * grid + this.yOrigin], {
                    stroke: '#737373',
                    hasControls: false,
                    hasBorders: false,
                    selectable: false,
                    evented: false,
                    grid: true
                }))

                //x axis labels
                this.canvas.add(new fabric.Text(this.xScreenToXCart(i * grid + this.xOrigin).toString(), {
                    left: i * grid + this.xOrigin, //Take the block's position
                    top: this.yOrigin + this.axisHeight + 20,
                    fontFamily: 'Helvetica Neue',
                    fontSize: 14,
                    fontWeight: 200,
                    fill: '#fc6320',
                    hasControls: false,
                    hasBorders: false,
                    evented: false,
                    selectable: false
                }));

                //Y axis labels
                this.canvas.add(new fabric.Text(this.yScreenToYCart(i * grid + this.yOrigin).toString(), {
                    left: this.xOrigin - 20, //Take the block's position
                    top: i * grid + this.yOrigin,
                    fontFamily: 'Helvetica Neue',
                    fontSize: 14,
                    fontWeight: 200,
                    fill: '#fc6320',
                    evented: false,
                    hasControls: false,
                    hasBorders: false,
                    selectable: false
                }));
            }

            //X axis
            this.canvas.add(new fabric.Line([this.xOrigin, this.yOrigin - 10, this.xOrigin, this.axisHeight + this.yOrigin], {
                stroke: "#fc6320",
                hasControls: false,
                hasBorders: false,
                selectable: false,
                strokeWidth: 2,
                grid: true
            })).bringToFront();

            //Y axis
            this.canvas.add(new fabric.Line([this.xOrigin, this.axisHeight + this.yOrigin, this.xOrigin + this.axisWidth + 10, this.axisHeight + this.yOrigin], {
                stroke: "#fc6320",
                hasControls: false,
                hasBorders: false,
                selectable: false,
                strokeWidth: 2,
                grid: true
            })).bringToFront();

            //Y axis Arrow
            this.canvas.add(new fabric.Triangle({
                angle: 0,
                fill: '#fc6320',
                hasControls: false,
                hasBorders: false,
                top: this.yOrigin - 15,
                left: this.xOrigin,
                height: 15,
                width: 15,
                originX: 'center',
                originY: 'center',
                selectable: false
            }));

            //X axis Arrow
            this.canvas.add(new fabric.Triangle({
                angle: 90,
                fill: '#fc6320',
                hasControls: false,
                hasBorders: false,
                top: this.axisHeight + this.yOrigin,
                left: this.axisWidth + this.xOrigin + 15,
                height: 15,
                width: 15,
                originX: 'center',
                originY: 'center',
                selectable: false
            }));
        }
        ,

        /**
         * Used to apply Zooming on the canvas.
         */
        enableZoom: function () {
            var canvasarea = document.getElementById("canvasarea");
            if (canvasarea.addEventListener) {
                // IE9, Chrome, Safari, Opera
                canvasarea.addEventListener("mousewheel", zoom, false);
                // Firefox
                canvasarea.addEventListener("DOMMouseScroll", zoom, false);
            }
            // IE 6/7/8
            else canvasarea.attachEvent("onmousewheel", zoom);
            return this;
        },

        zoom: function (e) {
            var evt = window.event || e;
            var delta = evt.detail ? evt.detail * (-120) : evt.wheelDelta;
            var curZoom = canvas.getZoom(), newZoom = curZoom + delta / 4000,
                x = e.offsetX, y = e.offsetY;
            //applying zoom values.
            canvas.zoomToPoint({x: x, y: y}, newZoom);
            if (e != null)e.preventDefault();
            return false;
        },

        /**
         * Retrieves the vector in Cartesian coordinates and shows it in a popup
         */
        getVector: function () {
            var vector = [];
            var current = null;
            this.canvas.forEachObject(function (o) {
                if (o instanceof fabric.Circle && !o.lLine) {
                    current = o;
                }
            });
            while (current.rLine) {
                //we want to find the first control point, the one who doesn't have a line on its left
                vector.push([this.xScreenToXCart(current.left), this.yScreenToYCart(current.top)]);
                current = current.rLine.rControlPoint;
            }
            vector.push([this.xScreenToXCart(current.left), this.yScreenToYCart(current.top)]);
            alert(JSON.stringify(vector));
            return vector;
        },

        /**
         * Downloads an SVG for the current canvas
         */
        downloadSVG: function () {
            var element = document.createElement('a');

            this.canvas.forEachObject(function (o) {
                if (!o.grid && o instanceof fabric.Line) {
                    o.set('fill', 'black');
                    o.set('stroke', 'black');
                }
            });

            element.setAttribute('href', 'data:application/octet-stream,' + encodeURIComponent(this.canvas.toSVG()));
            element.setAttribute('download', "vector.svg");

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);

            this.canvas.forEachObject(function (o) {
                if (!o.grid && o instanceof fabric.Line) {
                    o.set('fill', 'white');
                    o.set('stroke', 'white');
                }
            });
        }

    });
});



