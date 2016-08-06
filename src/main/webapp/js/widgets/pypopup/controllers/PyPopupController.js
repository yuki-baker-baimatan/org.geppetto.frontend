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
 * Controller class for popup widget. Use to make calls to widget from inside Geppetto.
 *
 * @author Jesus R Martinez (jesus@metacell.us)
 */
define(function (require) {
    var PyPopup = require('widgets/pypopup/PyPopup');
    var AWidgetController = require('widgets/AWidgetController');

    /**
     * @exports Widgets/Popup/PopupsController
     */
    return AWidgetController.View.extend({

        initialize: function () {
            this.widgets = Array();
            this.history = [];
        },

        /**
         * Creates popup widget
         */
        addPyPopupWidget: function () {
            //look for a name and id for the new widget
            var id = this.getAvailableWidgetId("PyPopup", this.widgets);
            var name = id;

            //create popup widget
//            function takarras(out_type, out_data){
//                // do_something
//            	console.log('taka')
//            }
//            var command = id + " = PyPopupWidget()";
//            var kernel = $("#pyConsoleFrame")[0].contentWindow.IPython.notebook.kernel;
//            kernel.execute(command, takarras);
//            kernel.execute(id, takarras);
            
            var nb = $("#pyConsoleFrame")[0].contentWindow.Jupyter.notebook;
            // create cell below this one
            nb.insert_cell_below();
            // select cell below (the one we have created)
            var cell = nb.select_next().get_selected_cell();
            // set text in the cell
            cell.set_text(id + " = PyPopupWidget(id='" + id + "', name='" + name  + "')\n" + id + "\n" + id +".subscribe()");
            // execute cell
            cell.execute();
            
            return null;
            
            
        },

        subscribe: function(){
        	//This needs to be changed but we need to know where the views are stores in jupyter
            var p = window[name] = jptWidget;

//            	var p = window[name] = new PyPopup({id: id, name: name, visible: true, controller: this});	

            p.setSize(394,490);
            //create help command for plot
            p.help = function () {
                return GEPPETTO.Console.getObjectCommands(id);
            };

            //store in local stack
            this.widgets.push(p);


            GEPPETTO.WidgetsListener.subscribe(this, id);

            //add commands to console autocomplete and help option
            GEPPETTO.Console.updateHelpCommand(p, id, this.getFileComments("geppetto/js/widgets/pypopup/PyPopup.js"));

            //update tags for autocompletion
            GEPPETTO.Console.updateTags(p.getId(), p);

            return p;
        },
        
        /**
         * Receives updates from widget listener class to update popup widget(s)
         *
         * @param {WIDGET_EVENT_TYPE} event - Event that tells widgets what to do
         */
        update: function (event) {
            //delete popup widget(s)
            if (event == GEPPETTO.WidgetsListener.WIDGET_EVENT_TYPE.DELETE) {
                this.removeWidgets();
            }
        }
    });
});