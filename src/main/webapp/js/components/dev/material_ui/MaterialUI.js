/*******************************************************************************
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

define(function(require, exports, module) {

// Not needed as tap-event-pluging is embedded together with react and the addons
//	var injectTapEventPlugin = require("./react-tap-event-plugin");
//	injectTapEventPlugin();
	
	var React = require('react');
	var ReactDOM = require('react-dom');
	
	var ReactAddonsCreateFragment = require('react-addons-create-fragment');
	var ReactAddonsTransitionGroup = require('react-addons-transition-group');
	
	var matui = require('./material-ui');
	var MuiThemeProvider = matui.MuiThemeProvider;
	
	
	var AppBar = React.createClass({

        render: function(){
            return (
        		<MuiThemeProvider>
        			<matui.AppBar title={this.props.title} iconClassNameRight="muidocs-icon-navigation-expand-more" onTitleTouchTap={this.props.handleTouchTap} onClick={this.props.handleClick}/>
        		</MuiThemeProvider>	
    		);
        }
    });
    
    var RaisedButton = React.createClass({
    	render: function(){
            return (
            		<input type="button" className={"waves-effect waves-light bttn"} onClick={this.props.handleClick} value={this.props.label} />
            );
        }
    	
//        render: function(){
//            return (
//        		<MuiThemeProvider>
//        			<matui.RaisedButton label={this.props.label} onClick={this.props.handleClick}/>
//        		</MuiThemeProvider>	
//    		);
//        }
    });
    
    var TextField = React.createClass({
    	getInitialState: function() {
    	    return {value: this.props.sync_value};
    	  },
    	  handleChange: function(event) {
    	    this.setState({value: event.target.value});
    	    this.props.handleChange(event.target.value);
    	  },
	
	    render: function(){
	        return (
	    		<input type="text" id={this.props.id} value={this.state.value} onChange={this.handleChange}/>
			);
	    }
  	
//    	
//        render: function(){
//            return (
//        		<MuiThemeProvider>
//        			<matui.TextField id={this.props.id} hintText={this.props.hintText} value={this.props.sync_value}/>
//        		</MuiThemeProvider>	
//    		);
//        }
    });
    
    var Checkbox = React.createClass({
        render: function(){
            return (
            		<input type="checkbox" id={this.props.id} value={this.props.sync_value}/>
    		);
        }
    });

    
    module.exports= {
    	AppBar: AppBar,
    	RaisedButton: RaisedButton,
    	Checkbox: Checkbox,
    	TextField: TextField
    }
});
