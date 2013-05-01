/*

r.pipe(users).pipe(view)

*/

Bootic.Pipe = (function ($) {
  "use strict";
  
  function noop (item, promise) {
    promise.resolve(item)
  }
  
  var Pipe = Bootic.BasicObject.extend({
    
    preInitialize: function () {
      var options = arguments[arguments.length - 1];
      if(typeof options == 'object' && 'logger' in options) {
        this.logger = options.logger
      } else {
        this.logger = new Bootic.Logger()
      }
    },
    
    toString: function () {
      return 'Bootic.Pipe'
    },
    
    add: function (item) {
      var filterPromise = $.Deferred(),
          self = this;
      
      this.logger.info('adding ' + item)
      this.trigger('adding', item)
      
      filterPromise.done(function (item) {
        if(!item) throw new Error("Make sure your _add method resolves the promise with an item as argument")
        
        var addPromise = $.Deferred()
        addPromise.done(function (item, evtName) {
          self.logger.info('added ' + item)
          self.trigger(evtName || 'add', item)
        })
        self.logger.info('filter ' + item)
        self._add(item, addPromise)
      })
      
      this.addFilter(item, filterPromise)
      
      return filterPromise
    },
    
    remove: function (item) {
      var removePromise = $.Deferred(),
          self = this;
      
      this.logger.info('removing ' + item)
      this.trigger('removing', item)
      
      removePromise.done(function (item, evtName) {
        if(!item) throw new Error("Make sure your _remove method resolves the promise with an item as argument")
        
        self.logger.info('removed ' + item)
        self.trigger(evtName || 'remove', item)
      })
      
      this._remove(item, removePromise)
      
      return removePromise
    },
    
    pipe: function (other) {
      this.logger.info('piped ' + this + ' to ' + other)
      this._pipe(other)
      this.on('add', function (item) {
        other.add(item)
      }).on('remove', function (item) {
        other.remove(item)
      })
      return other
    },
    
    addFilter: noop,
    _add: noop,
    _remove: noop,
    _pipe: $.noop
  })
  
  $.extend(Pipe.prototype, Bootic.Events)
  
  return Pipe
  
})(jQuery);