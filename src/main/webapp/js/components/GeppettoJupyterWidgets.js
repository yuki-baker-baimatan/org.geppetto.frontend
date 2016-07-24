define(function(require, exports, module) {
	
	var React = require('react');
	var PanelComp = require('jsx!components/dev/panel/Panel');
	var ReactDOM = require('react-dom');
//	var Widget = require('widgets/JupyterWidget');
	//var $jParent = window.parent.jQuery.noConflict();
	require('vendor/jupyter/jupyter_widgets');
	var $ = require('jquery');
	
	var PanelView = jupyter_widgets.WidgetView.extend({
	    initialize: function (options) {
	        this.options = options || {};
	    },

	    component: function () {
	        return new PanelComp(
	          {id: "RunControl", name:"Run Control"}
	        );
	    },

	    createFloatingPanel: function (component){
	        var containerId = component.props.id + "_container";
	        var containerName = component.props.name;

	        //create the dialog window for the widget
	        var dialog = $("<div id=" + containerId + " class='dialog' title='" + containerName + "'></div>").dialog(
	        {
	            resizable: true,
	            draggable: true,
	            top: 10,
	            height: 300,
	            width: 350,
	            close: function (event, ui) {
	                if (event.originalEvent &&
	                $(event.originalEvent.target).closest(".ui-dialog-titlebar-close").length) {
	                	$("#" + this.id).remove();
	                }
	            },
	            appendTo: ""
	        });

	        this.$el = $("#" + this.id);

	        var dialogParent = dialog.parent();
	        var that = this;

	        //add history
	        dialogParent.find("div.ui-dialog-titlebar").prepend("<div class='fa fa-history historyIcon'></div>");
	        dialogParent.find("div.historyIcon").click(function (event) {
	            that.showHistoryMenu(event);
	            event.stopPropagation();
	        });

	        //remove the jQuery UI icon
	        dialogParent.find("button.ui-dialog-titlebar-close").html("");
	        dialogParent.find("button").append("<i class='fa fa-close'></i>");
	        //Take focus away from close button
	        dialogParent.find("button.ui-dialog-titlebar-close").blur();	

	        return dialog.get(0);
	    },
	    
        set_kk: function(model){
        	return this.create_child_view(model).then(function(view) {
        		console.log(view);
        	});
        },
	    
	    // Render the view.
	    render: function() {
	    	var kk_promise = this.set_kk(this.model.get("kk"));
	    	
	    	
	    	console.log("kk_promise");
	    	console.log(kk_promise);
	        console.log(this.model.get('items'));
	        console.log(this.model.get('kk'));
	        console.log(this.model.get('value'));
	        
	        
	        var comp = React.createFactory(PanelComp)({id: "RunControl", name:"Run Control"});
	        var floatingPanel = this.createFloatingPanel(comp);
	        ReactDOM.render(comp, this.el);
	        
	    }
	});
	
	var PanelModel = jupyter_widgets.WidgetModel.extend({
		defaults: _.extend({}, jupyter_widgets.WidgetModel.prototype.defaults, {
            _model_name: "PanelModel",
            _view_name: "PanelView",
            _model_module: "panel",
            _view_module: "panel",

            kk: undefined,
            value: 'taka',
            items: [],
        }),
        
        initialize: function() {
        	PanelModel.__super__.initialize.apply(this);
        	this.on('change:items', this.value_changed, this);
	        this.on('change:value', this.value_changed, this);
        	
//            this.on("change:side", this.validate_orientation, this);
//            this.on("change:orientation", this.validate_side, this);
//            this.validate_orientation();
//            this.validate_side();
        },
        value_changed: function() {
            console.log('pakio');
            console.log(this.model.get('items'));
            console.log(this.model.get('value'));
         },
	}, {
        serializers: _.extend({
            kk: { deserialize: jupyter_widgets.unpack_models },
            items: { deserialize: jupyter_widgets.unpack_models },
        }, jupyter_widgets.WidgetModel.serializers)
    });
	
	
	var RaisedButtonView = jupyter_widgets.DOMWidgetView.extend({
	    initialize: function (options) {
	        this.options = options || {};
	    },

	    component: function () {
	        return new PanelComp(
	          {id: "RunControl", name:"Run Control"}
	        );
	    },

	    createFloatingPanel: function (component){
	        var containerId = component.props.id + "_container";
	        var containerName = component.props.name;

	        //create the dialog window for the widget
	        var dialog = $("<div id=" + containerId + " class='dialog' title='" + containerName + "'></div>").dialog(
	        {
	            resizable: true,
	            draggable: true,
	            top: 10,
	            height: 300,
	            width: 350,
	            close: function (event, ui) {
	                if (event.originalEvent &&
	                $(event.originalEvent.target).closest(".ui-dialog-titlebar-close").length) {
	                	$("#" + this.id).remove();
	                }
	            },
	            appendTo: ""
	        });

	        this.$el = $("#" + this.id);

	        var dialogParent = dialog.parent();
	        var that = this;

	        //add history
	        dialogParent.find("div.ui-dialog-titlebar").prepend("<div class='fa fa-history historyIcon'></div>");
	        dialogParent.find("div.historyIcon").click(function (event) {
	            that.showHistoryMenu(event);
	            event.stopPropagation();
	        });

	        //remove the jQuery UI icon
	        dialogParent.find("button.ui-dialog-titlebar-close").html("");
	        dialogParent.find("button").append("<i class='fa fa-close'></i>");
	        //Take focus away from close button
	        dialogParent.find("button.ui-dialog-titlebar-close").blur();	

	        return dialog.get(0);
	    },
	    
	    // Render the view.
	    render: function() {
	       console.log('raisedButton');
	       console.log(this.model.get('value'));
	        
	       
	       var comp = React.createFactory(PanelComp)({id: "ESEbuttonbueno", name:"ESEbuttonbueno"});
	       var floatingPanel = this.createFloatingPanel(comp);
	        ReactDOM.render(comp, this.el);
	    }
	});
	
	module.exports= {
		PanelView: PanelView,
		PanelModel: PanelModel,
		RaisedButtonView: RaisedButtonView
    };
});