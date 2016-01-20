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
 * Tree Visualiser Widget
 *
 * @author Adrian Quintana (adrian.perez@ucl.ac.uk)
 */
define(function (require) {

    var Widget = require('widgets/Widget');
    var Node = require('model/Node');
    var TreeVisualiserNode = require('widgets/treevisualiser/TreeVisualiserNode');
    var TreeVisualiserWrappedObject = require('widgets/treevisualiser/TreeVisualiserWrappedObject');

    return {
        TreeVisualiser: Widget.View.extend({

            datasets: [],

            initialize: function (options) {
                Widget.View.prototype.initialize.call(this, options);

                this.datasets = [];
                this.visible = options.visible;
                this.render();
                this.setSize(options.width, options.height);
            },

            setData: function (state, options, dataset) {
                // If no options specify by user, use default options
                if (options != null) {
                    $.extend(this.options, options);
                }

                if (state != null) {
                    return this.createDataset(state);
                }
                return null;
            },

            getDatasets: function () {
                return this.datasets;
            },

            createDataset: function (state) {
                var stateTreeVisualiserNode = this.createTreeVisualiserNode(state);
                stateTreeVisualiserNode.set({"children": this.createTreeVisualiserNodeChildren(state)});
                return {data: stateTreeVisualiserNode, isDisplayed: false};
            },

            createTreeVisualiserNode: function (state, formattedValue) {
                var tvOptions = {wrappedObj: state, formattedValue: formattedValue};
                var tvn = new TreeVisualiserNode(tvOptions);
                return tvn;
            },
            
            getFormattedValue: function(node, type, step){
            	var formattedValue = "";
            	switch (type) {
            		case GEPPETTO.Resources.PARAMETER_TYPE:
            		case GEPPETTO.Resources.STATE_VARIABLE_TYPE:
            			formattedValue = node.getInitialValues()[0].value.value + " " + node.getInitialValues()[0].value.unit.unit;
            			break;
            		case GEPPETTO.Resources.CONNECTION_TYPE:
                        //AQP: This is probably not needed as we are not going to show the connections
            			formattedValue = 'Connection';
            			break;
            		case GEPPETTO.Resources.DYNAMICS_TYPE:	
            			formattedValue = node.getInitialValues()[0].value.dynamics.expression.expression;
            			break;
            		case GEPPETTO.Resources.FUNCTION_TYPE:
                    	//AQP: Review this case!
            			formattedValue = "";
            			break;
            		case GEPPETTO.Resources.TEXT_TYPE:	
            			formattedValue = node.getInitialValues()[0].value.text;
            			break;
            		case GEPPETTO.Resources.POINTER_TYPE:
                    	//AQP: Add sth!
            			formattedValue = "Pointer";
            			break;
            		case GEPPETTO.Resources.STATE_VARIABLE_CAPABILITY:
                        if(node.getTimeSeries() != null && node.getTimeSeries().length>0)
                			formattedValue = node.getTimeSeries()[step] + " " + ((node.getUnit()!=null && node.getUnit()!="null")?(" " + node.getUnit()):"");
                        break;
            		default:
                    	throw "Unknown type";
            	}
            	return formattedValue;
            },

            convertVariableToTreeVisualiserNode: function (node) {
                if (node.getMetaType() == GEPPETTO.Resources.VARIABLE_NODE && node.getType().getMetaType() != GEPPETTO.Resources.HTML_TYPE) {
                	if (node.getType().getMetaType() == GEPPETTO.Resources.COMPOSITE_TYPE_NODE || node.getType().getMetaType() == GEPPETTO.Resources.ARRAY_TYPE_NODE){
                		if (node.getType().getSuperType() != undefined && node.getType().getSuperType().getId() == 'projection') {
                            var projectionChildren = node.getType().getChildren();
                            var numConnections = 0;
                            var projectionsChildrenNode = [];
                            for (var j = 0; j < projectionChildren.length; j++) {
                                if (projectionChildren[j].getTypes()[0].getSuperType() != undefined && projectionChildren[j].getTypes()[0].getSuperType().getId() == 'connection') {
                                    numConnections++;
                                }
                                else {
                                    projectionsChildrenNode.push(this.convertVariableToTreeVisualiserNode(projectionChildren[j]));
                                }
                            }

                            var treeVisualiserWrappedObject = new TreeVisualiserWrappedObject({
                                "name": "Number of Connections",
                                "id": "numberConnections",
                                "_metaType": ""
                            });
                            var tvOptions = {
                                wrappedObj: treeVisualiserWrappedObject,
                                formattedValue: numConnections
                            };
                            var tvn = new TreeVisualiserNode(tvOptions);
                            projectionsChildrenNode.push(tvn);

                            var projtvn = new TreeVisualiserNode({wrappedObj: node.getType()});
                            projtvn.set({"children": projectionsChildrenNode});
                            return projtvn;
                        }
                        else {
                            var tvn = this.createTreeVisualiserNode(node.getType());
                            tvn.set({"children": this.createTreeVisualiserNodeChildren(node.getType())});
                            return tvn;
                        }
                	}
                	else{
                		return this.createTreeVisualiserNode(node, this.getFormattedValue(node, node.getType().getMetaType()));
                	}
                }
                else if (node.getMetaType() == GEPPETTO.Resources.INSTANCE_NODE || node.getMetaType() == GEPPETTO.Resources.ARRAY_INSTANCE_NODE) {
                	var tvn;
                	if (node.hasCapability(GEPPETTO.Resources.STATE_VARIABLE_CAPABILITY)){
                		tvn = this.createTreeVisualiserNode(node, this.getFormattedValue(node, GEPPETTO.Resources.STATE_VARIABLE_CAPABILITY, 0));
                	}
                	else if (node.hasCapability(GEPPETTO.Resources.VISUAL_CAPABILITY)){
                		tvn = this.createTreeVisualiserNode(node, "VisualCapability");   		
                	}
                	else if (node.hasCapability(GEPPETTO.Resources.PARAMETER_CAPABILITY)){
                		tvn = this.createTreeVisualiserNode(node, "ParameterCapability");  
					}
                	else if (node.hasCapability(GEPPETTO.Resources.CONNECTION_CAPABILITY)){
                		tvn = this.createTreeVisualiserNode(node, "ConnectionCapability");  
                	}
                	else{
                		tvn = this.createTreeVisualiserNode(node);
                	}
                    tvn.set({"children": this.createTreeVisualiserNodeChildren(node)});
                    return tvn;
                }
            },

            createTreeVisualiserNodeChildren: function (state) {
                var children = [];
                if (state.getMetaType() == GEPPETTO.Resources.COMPOSITE_TYPE_NODE || state.getMetaType() == GEPPETTO.Resources.INSTANCE_NODE
                		|| state.getMetaType() == GEPPETTO.Resources.ARRAY_INSTANCE_NODE) {
                    for (var i = 0; i < state.getChildren().length; i++) {
                        var child = state.getChildren()[i];
                        var node = this.convertVariableToTreeVisualiserNode(child);
                        if (node != undefined)
                            children.push(node);
                    }
                }
                else if (state.getMetaType() == GEPPETTO.Resources.ARRAY_TYPE_NODE) {

                    // Size
                    var treeVisualiserWrappedObject = new TreeVisualiserWrappedObject({
                        "name": "Size",
                        "id": "size",
                        "_metaType": ""
                    });
                    var tvOptions = {wrappedObj: treeVisualiserWrappedObject, formattedValue: state.getSize()};
                    var tvn = new TreeVisualiserNode(tvOptions);
                    children.push(tvn);

                    // Array Type
                    var arraytypetvn = this.createTreeVisualiserNode(state.getType());
                    arraytypetvn.set({"children": this.createTreeVisualiserNodeChildren(state.getType())});
                    children.push(arraytypetvn);

                    //state.getDefaultValue()

                }
                else if (state.getMetaType() == GEPPETTO.Resources.VARIABLE_NODE) {
				    var node = this.convertVariableToTreeVisualiserNode(state);
				    if (node != undefined)
				        children.push(node);
                }
                
                return children;
            }
        })
    };

});