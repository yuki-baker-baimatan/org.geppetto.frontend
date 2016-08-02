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



define(function (require) {
	return function (GEPPETTO) {
		//Logo initialization 
		GEPPETTO.ComponentFactory.addComponent('LOGO', {logo: 'gpt-gpt_logo'}, document.getElementById("geppettologo"));

		//Control panel initialization
		GEPPETTO.ComponentFactory.addComponent('CONTROLPANEL', {}, document.getElementById("controlpanel"));

		//Spotlight initialization
		GEPPETTO.ComponentFactory.addComponent('SPOTLIGHT', {}, document.getElementById("spotlight"));

		//Spotlight initialization
		GEPPETTO.ComponentFactory.addComponent('FOREGROUND', {}, document.getElementById("foreground-toolbar"));
		
		//Loading spinner initialization
		GEPPETTO.on('show_spinner', function(label) {
			GEPPETTO.ComponentFactory.addComponent('LOADINGSPINNER', {show : true, keyboard : false, text: label, logo: "gpt-gpt_logo"}, document.getElementById("modal-region"));	
		});
		
		
		//Function to illustrate how panel component works
		GEPPETTO.showingPanelConcept = function(){
			var handleClick = function(){
				console.log('handling click');
			};
			var handleTouchTap = function(){
				console.log('handling touch tap');
			};
			
			var panelChildren = [];
			panelChildren.push(GEPPETTO.ComponentFactory.getComponent('APPBAR',{id:'appBar', title:'App Bar',  handleClick: handleClick, handleTouchTap: handleTouchTap}));
			panelChildren.push(GEPPETTO.ComponentFactory.getComponent('RAISEDBUTTON',{id:'raisedButton', label:'OK', handleClick: handleClick}));
			
//			var panelComponent = GEPPETTO.ComponentFactory.addComponent('PANEL', {id: "RunControl", name:"Run Control"});
//			panelComponent.addChildren(panelChildren);
			GEPPETTO.ComponentFactory.addComponent('PANEL', {id: "RunControlInit", name:"Run Control", items: panelChildren});
		};
		
		GEPPETTO.showingPanelConcept();
		
	};
});