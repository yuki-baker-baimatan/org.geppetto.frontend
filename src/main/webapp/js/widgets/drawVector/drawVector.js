/*******************************************************************************
 * The MIT License (MIT)
 *
 * Copyright (c) 2011, 2013 OpenWorm.
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
 * Popup Widget
 *
 * @module Widgets/Popup
 * @author Jesus R. Martinez (jesus@metacell.us)
 */
define(function (require) {

    var Widget = require('widgets/Widget');
    var $ = require('jquery');

    return Widget.View.extend({

        /**
         * Initialize the popup widget
         */
        initialize: function (options) {
            this.id = options.id;
            this.name = options.name;
            this.visible = options.visible;
            this.render();
            this.setSize(615, 615);
            this.customHandlers = [];
            //set class pop up
            $("#" + this.id).addClass("drawVector");
            $("#" + this.id).append("<div id='canvasarea'><canvas id='c' width='700' height='700'></canvas><div id='mouseX'></div> <div id='mouseY'></div></div>");
            this.canvas = new fabric.Canvas('c', {selection: false});
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

            var line = this.makeLine([this.xOrigin, this.yOrigin + this.axisHeight, this.xOrigin + this.axisWidth, this.yOrigin + this.axisHeight]);

            this.canvas.add(line);

            this.canvas.add(
                this.makeControlPoint(line.get('x1'), line.get('y1'), null, line),
                this.makeControlPoint(line.get('x2'), line.get('y2'), line, null)
            );
        },


        //Factory functions

        makeControlPoint: function (left, top, lLine, rLine) {
            var controlPoint = new fabric.Circle({
                left: left,
                top: top,
                strokeWidth: 2,
                radius: 4,
                fill: '#fff',
                hasControls: false,
                hasBorders: false,
                targetFindTolerance: 6,
                stroke: '#666'
            });

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

        makeLine: function (coords) {
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

        makeSquare: function (left, top) {
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
            return y * this.maxY / this.axisHeight;
        },

        getNormalizedToXAxis: function (x) {
            return x * this.maxX / this.axisWidth;
        },

        // Given a X in the screen coordinate give 1st quadrant cartesian coordinates
        xScreenToXCart: function (px) {
            return this.getNormalizedToXAxis(px - this.xOrigin);
        },

        // Given a Y in the screen coordinate give 1st quadrant cartesian coordinates
        yScreenToYCart: function (py) {
            return this.getNormalizedToYAxis(-(py - this.axisHeight - this.yOrigin));
        },

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

        setupHandlers: function () {

            //Events handlers
        	var that=this;
            that.canvas.on('mouse:move', function (e) {
                var pointer = that.canvas.getPointer(event.e);
                $("#mouseX").html(that.xScreenToXCart(pointer.x));
                $("#mouseY").html(that.yScreenToYCart(pointer.y));
                that.canvas.forEachObject(function (o) {
                    o.setCoords();
                });
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
                var pointer = that.canvas.getPointer(event.e);
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

            });

            that.canvas.on('mouse:over', function (e) {
                var p = e.target
                if (p instanceof fabric.Circle) {
                    p.fill = "red";
                    that.canvas.renderAll();
                }
                else if (p instanceof fabric.Line) {
                    if (!p.grid) {
                        p.centerSquare = that.makeSquare(p.getCenterPoint().x, p.getCenterPoint().y);
                        that.canvas.add(p.centerSquare);
                        p.centerSquare.bringToFront();
                        that.canvas.renderAll();
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
                        //imposes the right constraint
                        if (controlPoint.left > that.xOrigin + that.axisWidth) {
                            controlPoint.left = that.xOrigin + that.axisWidth;
                        }
                        else if (controlPoint.left > controlPoint.rLine.rControlPoint.left) {
                            controlPoint.left = controlPoint.rLine.rControlPoint.left;
                        }
                        controlPoint.rLine.set({'x1': controlPoint.left, 'y1': controlPoint.top});
                    }
                }

                that.canvas.renderAll();
            });

            that.canvas.on('object:selected', function (e) {
                var clicked = e.target;
                var pointer = that.canvas.getPointer(event.e);
                if (clicked instanceof fabric.Line) {

                    //the clicked line will end at the mouse coordinates
                    clicked.set({'x2': pointer.x, 'y2': pointer.y});

                    //we take the coordinates of the original end of the clicked line
                    var circle2X = clicked.rControlPoint.left;
                    var circle2Y = clicked.rControlPoint.top;

                    //we create a new line starting from where we clicked and ending at the end of the original clicked line
                    var newLine = that.makeLine([pointer.x, pointer.y, circle2X, circle2Y]);
                    newLine.lControlPoint = clicked.rControlPoint;
                    that.canvas.add(newLine);

                    //we add a new circle as a control point between the clicked line and the newly created one
                    var newControlPoint = that.makeControlPoint(newLine.get('x2'), newLine.get('y2'), newLine, clicked.rControlPoint.rLine);
                    that.canvas.add(newControlPoint);

                    //let's update the original control point to link the two segments
                    clicked.rControlPoint.set({'left': pointer.x, 'top': pointer.y});
                    clicked.rControlPoint.lLine = clicked;
                    clicked.rControlPoint.rLine = newLine;

                    //let's bring all control point to the front (so that lines don't go on top of them)
                    newControlPoint.bringToFront();
                    clicked.rControlPoint.bringToFront();

                }
                that.canvas.renderAll();
                that.canvas.calcOffset();
            });
        },

        buildAxisAndGrid: function () {
            var grid = 50;
            for (var i = 0; i <= (this.axisWidth / grid); i++) {
                //X grid lines
                this.canvas.add(new fabric.Line([i * grid + this.xOrigin, this.yOrigin, i * grid + this.xOrigin, this.axisHeight + this.yOrigin], {
                    stroke: '#ccc',
                    hasControls: false,
                    hasBorders: false,
                    selectable: false,
                    evented: false,
                    grid: true
                }));

                //Y grid lines
                this.canvas.add(new fabric.Line([0 + this.xOrigin, i * grid + this.yOrigin, this.axisWidth + this.xOrigin, i * grid + this.yOrigin], {
                    stroke: '#ccc',
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

            //Y axis
            this.canvas.add(new fabric.Line([this.xOrigin, this.yOrigin - 10, this.xOrigin, this.axisHeight + this.yOrigin], {
                stroke: "#fc6320",
                hasControls: false,
                hasBorders: false,
                selectable: false,
                strokeWidth: 2
            })).bringToFront();

            //Y axis
            this.canvas.add(new fabric.Line([this.xOrigin, this.axisHeight + this.yOrigin, this.xOrigin + this.axisWidth + 10, this.axisHeight + this.yOrigin], {
                stroke: "#fc6320",
                hasControls: false,
                hasBorders: false,
                selectable: false,
                strokeWidth: 2
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
        }
        ,

        zoom: function (e) {
            var evt = window.event || e;
            var delta = evt.detail ? evt.detail * (-120) : evt.wheelDelta;
            var curZoom = canvas.getZoom(), newZoom = curZoom + delta / 4000,
                x = e.offsetX, y = e.offsetY;
            //applying zoom values.
            canvas.zoomToPoint({x: x, y: y}, newZoom);
            if (e != null)e.preventDefault();
            return false;
        }
        ,

        downloadSVG: function () {
            var element = document.createElement('a');
            element.setAttribute('href', 'data:application/octet-stream,' + encodeURIComponent(canvas.toSVG()));
            element.setAttribute('download', "vector.svg");

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        }

    });
});



