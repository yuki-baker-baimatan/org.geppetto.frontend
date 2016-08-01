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
	        this.componentItems = [];
	        
	        PanelView.__super__.initialize.apply(this, arguments);
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
	    
        add_item: function(model){
        	var that = this;
//        	return this.create_child_view(model)
//	            .then(function(view) {
//	            	//that.componentItems.push(view.getComponent());
//	            	view.getComponent().then(function(component) {
//	            		that.componentItems.push(component);
//	            	});
//	            	return view;
//	            	});
        	
        	return this.create_child_view(model)
            .then(function(view){
            	return view.getComponent();
            })
            .then(function(component) {
        		that.componentItems.push(component);
        	});
        },
        
        value_changed: function() {
        	console.log('jesulin');
        	console.log(this.model.get('value'));
        },
        
        getComponent: function () {
//	        return GEPPETTO.ComponentFactory.getComponent('PANEL', {id: "RunControl", name:"Run Control", items: this.componentItems});
	        
	        var that = this;
            return Promise.all(this.items.views).then(function(views) {
    	        return GEPPETTO.ComponentFactory.getComponent('PANEL', {id: "RunControl", name:"Run Control", items: that.componentItems});
            });
	    },
        
	    // Render the view.
	    render: function() {
	    	this.value_changed();
	    	//Serialize single instance
	    	//var items_promise = this.set_Items(this.model.get("items"));
	    	
	    	
	    	this.items = new jupyter_widgets.ViewList(this.add_item, null, this);
            this.items.update(this.model.get("items"));

            var that = this;
//            Promise.all(this.items.views).then(function(views) {
//	            GEPPETTO.ComponentFactory.renderComponent(that.getComponent());
//	            this.$el = $("#RunControl");
//            });    
            
            if (this.model.get("embedded") == false){
            	this.getComponent().then(function(component) {
            		GEPPETTO.ComponentFactory.renderComponent(component);
            		this.$el = $("#RunControl");
            	});
            }
//            var that = this;
//            Promise.all(this.items.views).then(function(views) {
////            	that.component = that.getComponent();
////    	        var floatingPanel = that.createFloatingPanel(that.component);
////    	        ReactDOM.render(that.component, that.el);
//    	        
//    	        GEPPETTO.ComponentFactory.addComponent('PANEL', {id: "RunControl", name:"Run Control", items: that.componentItems});
//    	        this.$el = $("#RunControl");
//    	        
//            });
	    }
	});
	
	var PanelModel = jupyter_widgets.WidgetModel.extend({
		defaults: _.extend({}, jupyter_widgets.WidgetModel.prototype.defaults, {
            _model_name: "PanelModel",
            _view_name: "PanelView",
            _model_module: "panel",
            _view_module: "panel",

            items: [],
        }),
        
        initialize: function() {
        	PanelModel.__super__.initialize.apply(this);
        	this.on('change:items', this.value_changed, this);
        },
        value_changed: function() {
            console.log('changing items');
            console.log(this.get('items'));
         },
	}, {
        serializers: _.extend({
            items: { deserialize: jupyter_widgets.unpack_models },
        }, jupyter_widgets.WidgetModel.serializers)
    });
	
	
	var ComponentView = jupyter_widgets.WidgetView.extend({
	    initialize: function (options) {
	        this.options = options || {};
	        ComponentView.__super__.initialize.apply(this, arguments);
	    },

	    handleClick: function (view) {
	    	var data = {info : 'data sent'}; 
	    	view.send({event: 'click', data: data});
	    },
	    
	    getComponent: function () {
//	    	var that = this;
//	    	return new Promise(function(resolve) {
//    	        return GEPPETTO.ComponentFactory.getComponent(that.model.get('component_name'),{id:that.model.get('widget_id'), label:that.model.get('widget_name'), parentStyle:that.model.get('parentStyle'), handleClick: that.handleClick.bind(null, that)});
//            });
	    	
	    	return Promise.resolve(GEPPETTO.ComponentFactory.getComponent(this.model.get('component_name'),{id:this.model.get('widget_id'), label:this.model.get('widget_name'), parentStyle:this.model.get('parentStyle'), handleClick: this.handleClick.bind(null, this)}));
	    },

	    // Render the view.
	    render: function() {
	       console.log('component view');
	       console.log(this.model.get('widget_id'));
//	       var floatingPanel = this.createFloatingPanel(comp);
	      //  ReactDOM.render(this.getComponent(), this.el);
	    }
	});
	
	module.exports= {
		PanelView: PanelView,
		PanelModel: PanelModel,
		ComponentView: ComponentView
    };
});