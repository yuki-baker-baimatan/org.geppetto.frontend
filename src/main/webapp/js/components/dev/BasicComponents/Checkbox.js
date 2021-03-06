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

	var React = require('react');
	
    var Checkbox = React.createClass({
    	  getInitialState: function () {
    		    return {
    		        value: (this.props.sync_value == 'true')
    		     };
    		  },
    	  handleChange: function(event) {
    		  this.setState({value: event.target.checked});
    	      this.props.handleChange(event.target.value);
    	  },
    	  componentWillReceiveProps: function(nextProps) {
    		  this.setState({
    			  value: (nextProps.sync_value == 'true')
    		  });
    		},
  	  
        render: function(){
            return (
            		<p className={"checkboxContainer"}>
            		<input type="checkbox" id={this.props.id} checked={this.state.value} onChange={this.handleChange}/>
            		<label htmlFor={this.props.id}/>
            		</p>
    		);
        }
    });
    
    return Checkbox;
});