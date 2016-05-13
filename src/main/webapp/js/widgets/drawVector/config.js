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
 * Loads draw vector scripts
 *
 * @author mcantarelli
 */
/*
 * Configure what dependencies are needed for each library
 */

require.config({
    /*
     * Values in here are for dependencies that more than one module/script requires and/or needs.
     * E.G. If depenedency it's used more than once, it goes in here.
     */
    paths: {
        'fabric': "widgets/drawVector/vendor/fabric.min",
    },

});

/*
 * Libraries used by draw vector widget
 */
var libraries = [];
libraries.push("fabric");


/*
 * Load libraries, and CSS after libraries are loaded
 */
require(libraries, function (flot, math) {
//	console.log(math.parser());
    window.math = math;
    loadCss("geppetto/js/widgets/drawVector/drawVector.css");
});	

define(function(require) {
	return function(GEPPETTO) {

	};
});
