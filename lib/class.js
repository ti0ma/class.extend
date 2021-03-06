(function(Class){
  // NodeJS
  if (typeof exports == "object" && typeof module == "object"){
    module.exports = Class();
  }
  // AMD (RequireJS)
  else if (typeof define == "function" && define.amd){
    return define([], Class);
  }
  // Global
  else{
    window.Class = Class();
  }
})(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

  // The base Class implementation
  // Here we can be able to add, trigger and remove GLOBAL events (soooo sweet =)
  var Class = function(){
    // references used across instance
    var target = this
      , observers = {};

    target.global_event = {};

    // add an event listener
    target.global_event.on = function(event, listener){
      // push listerner to list of observers
      (observers[event] || (observers[event] = [])).push(listener);
    };

    // trigger a given event
    target.global_event.trigger = function(event, data){
      for (
        // cycle through all listerners for a given event
        var value = observers[event], key = 0;
        value && key < value.length;
      ){
        // call listener and pass data
        value[key++](data);
      }
    };

    // remove (a single or all) event listener
    target.global_event.off = function (event, listener) {
      for (
        // get index of the given listener
        value = observers[event] || [];
        // find all occurrences
        listener && (key = value.indexOf(listener)) > -1;
      ){
        // remove the listener
        value.splice(key, 1);
      }

      // assign the new list
      observers[event] = listener ? value : [];
    };
  };

  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;

    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;

            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];

            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);
            this._super = tmp;

            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }


    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this._initEvents && this.init ){
        this._initEvents.apply(this, arguments);
        this.init.apply(this, arguments);
      }
    }

    // Populate our constructed prototype object
    Class.prototype = prototype;

    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;

    return Class;
  };

  // Instance own event management
  Class = Class.extend({
    observers: null,

    _initEvents: function () {
      this.observers = {};
    },

    // add an event listener
    on: function(event, listener){
      // Checking for event existance
      this.observers[event] || (this.observers[event] = []);
      // Adding listener
      this.observers[event].push(listener);
    },

    // trigger a given event
    trigger: function(event, data){
      var value = this.observers[event] || []
        , key = 0;
      for (;value && key < value.length;key++){
        value[key].apply(this, data);
      }
    },

    // remove (a single or all) event listener
    off: function (event, listener) {
      var value = this.observers[event] || []
        , key;
      for (;listener && (key = value.indexOf(listener)) > -1;){
        // remove the listener
        value.splice(key, 1);
      }

      // assign the new list
      this.observers[event] = listener ? value : [];
    }
  });

  return Class;
});
