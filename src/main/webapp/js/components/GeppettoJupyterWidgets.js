define(function(require, exports, module) {
	
	var React = require('react');
	var PanelComp = require('jsx!components/dev/panel/Panel');
	var ReactDOM = require('react-dom');
	//var $jParent = window.parent.jQuery.noConflict();
	require('vendor/jupyter/jupyter_widgets');
	var $ = require('jquery');
	
	var PanelView = jupyter_widgets.WidgetView.extend({
	    initialize: function (options) {
	        this.options = options || {};
	        this.componentItems = [];
	        
	        PanelView.__super__.initialize.apply(this, arguments);
	        this.listenTo(this.model, "refresh", this.changeCallback, this);
	        
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

        	
        	
        	 model.state_change.then(function() {
        		 
                 model.on("change:sync_value", function(){
                	 console.log("eoeoeo");
                	 //that.refresh();
//                	 Promise.all(this.itemsList.views).then(function(views) {
//                		 views.forEach(function(item) {
//                			 console.log("eoeoeo2");
//                		 });
//                	 });
                	 //this.render();
                	 
                	 //this.get('component').props.sync_value = model.get('sync_value');
                	 //this.trigger('refresh');
                	 
                	 //this.itemsList._models
                	 this.model.get("component").changeValue(3,'ll');

                	 this.componentItems = [];
                	 
                	 
//                	 this.itemsList.update(this.model.get("items"));
                	 var that = this;
                	 Promise.all(this.itemsList.views).then(function(views) {
//                		 for (var i = 0; i < views.length; i++){
//                			 views[i].getComponent().then(function(component) {
//                	             	model.set('component', component);
//                	         		that.componentItems.push(model.get('component'));
//                	         }).then(function(component) {
//                	        	 that.model.get("component").setChildren(that.componentItems);
//                	         	});
//                		 }

                		 Promise.all(views.map(function(currentView){
                			 return currentView.getComponent().then(function(component) {
	             	             	model.set('component', component);
	             	         		that.componentItems.push(model.get('component'));
	             	         		return component;
	             	         })
                			 })).then(function() {
                	        	 that.model.get("component").setChildren(that.componentItems);
                 	         	});
                	 });
                	 
                 }, that);
                 
                 


             });
        	
//        	 var componentView = this.create_child_view(model)
//            .then(function(view){
//            	return view.getComponent();
//            })
//            .then(function(component) {
//            	model.set('component', component);
//        		that.componentItems.push(model.get('component'));
//        	});
        	 var componentView = this.create_child_view(model)
             .then(function(view){
             	return view;
             });
        	 return componentView.then(function(view){
             	return view.getComponent();
               }).then(function(component) {
             	model.set('component', component);
         		that.componentItems.push(model.get('component'));
         		return componentView;
         	});
            
        },
        
        changeCallback: function(){
        	console.log('ese callback');
        },
        
        getComponent: function () {
	        var that = this;
	        this.model.trigger('refresh');
	        return Promise.all(this.itemsList.views).then(function(views) {
    	        return GEPPETTO.ComponentFactory.getComponent('PANEL', {id: that.model.get('widget_id'), name: that.model.get('widget_name'), items: that.componentItems, parentStyle: that.model.get('parentStyle')});
            });
            
	    },
        
//	    refresh: function(){
//	    	this.itemsList.remove();
//	    	this.itemsList.update(this.model.get("items"));
//	    	
//	    	this.componentItems
//	    	this.model.get("component").setChildren(componentItems);
//	    },
	    
	    // Render the view.
	    render: function() {
	    	//Serialize single instance
	    	//var items_promise = this.set_Items(this.model.get("items"));
	    	
	    	this.componentItems = [];
	    	
	    	this.itemsList = new jupyter_widgets.ViewList(this.add_item, null, this);
            this.itemsList.update(this.model.get("items"));
            

            var that = this;
            if (this.model.get("embedded") == false){
            	this.getComponent().then(function(component) {
            		that.model.set("component", GEPPETTO.ComponentFactory.renderComponent(component));
            		that.$el = $("#RunControl");
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
            
            this.model.on("change:items",function(model,value,options){
	        	console.log('vengata');
	        },this);
            
            
            
//            this.listenTo(this.model, "pako", function() {
//                console.log("peluu");
//            }, this);
	    }
	});
	
	var PanelModel = jupyter_widgets.WidgetModel.extend({
		defaults: _.extend({}, jupyter_widgets.WidgetModel.prototype.defaults, {
            _model_name: "PanelModel",
            _view_name: "PanelView",
            _model_module: "panel",
            _view_module: "panel",

            items: [],
            component: null
            
        }),
        
        initialize: function() {
        	PanelModel.__super__.initialize.apply(this);
        	//this.on('change:itemsList', this.value_changed, this);
        },
//        value_changed: function() {
//            console.log('changing itemsList');
//            console.log(this.get('items'));
//         }
	}, {
        serializers: _.extend({
            items: { deserialize: jupyter_widgets.unpack_models },
        }, jupyter_widgets.WidgetModel.serializers)
    });
	
	var ComponentModel = jupyter_widgets.WidgetModel.extend({
		defaults: _.extend({}, jupyter_widgets.WidgetModel.prototype.defaults, {
	        _model_name: 'ComponentModel',
	        _view_name: 'ComponentView',
	        _model_module: "component",
            _view_module: "component",
            
            sync_value: undefined,
            component: null
	    }),
	    
	    initialize: function() {
	    	ComponentModel.__super__.initialize.apply(this);
	    	this.on('change:sync_value', this.value_changed, this);
        },
        value_changed: function() {
            console.log('changing jar');
            console.log(this.get('sync_value'));
            
            this.get('component').props.sync_value = this.get('sync_value');
            //this.save_changes();
//            this.trigger("pako");
         },
	});
	
	var ComponentView = jupyter_widgets.WidgetView.extend({
	    initialize: function (options) {
	        this.options = options || {};
	    	//this.options.parent = options.parent;
	        ComponentView.__super__.initialize.apply(this, arguments);
	        this.listenTo(this.model, "refresh", this.changeCallback, this);
	    },

	    handleClick: function (view) {
	    	var data = {info : 'data sent'}; 
	    	view.send({event: 'click', data: data});
	    },
	    
        changeCallback: function(){
        	console.log('ese callback2');
        },
	    
	    getComponent: function () {
	    	var that = this;
	    	return Promise.resolve(GEPPETTO.ComponentFactory.getComponent(this.model.get('component_name'),{id:this.model.get('widget_id'), label:this.model.get('widget_name'), parentStyle:this.model.get('parentStyle'), sync_value: this.model.get('sync_value'), handleClick: this.handleClick.bind(null, this)}));
	    	
	    	
//	    	.then(
//	    			function(component){
//	    				that.model.set('component', component);
//	    				return that.model.get('component');
//	    			});
//	    	
	    },

	    // Render the view.
	    render: function() {
	       console.log('component view');
	    }
	});
	
	module.exports= {
		PanelView: PanelView,
		PanelModel: PanelModel,
		ComponentView: ComponentView,
		ComponentModel: ComponentModel
    };
});