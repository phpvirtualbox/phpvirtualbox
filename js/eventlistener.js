/**
 * 
 * @fileOverview Event listener singleton. Provides vboxEventListener
 * @author Ian Moore (imoore76 at yahoo dot com)
 * @version $Id: eventlistener.js 596 2015-04-19 11:50:53Z imoore76 $
 * @copyright Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
 */

/**
 * vboxEventListener
 * 
 * Polls vboxwebsrv for pending events and triggers
 * events on $('#vboxPane')
 * 
 * @namespace vboxEventListener
 */
var vboxEventListener = {
	
	// Timeout
	timeout: 20,
	
	// Not initially running
	_running: false,
	
	// persistent request data
	_persist: {},

	// List of machines to subscribe to at runtime
	_subscribeList: [],
	
	// Watchdog to make sure vboxEventListener is still
	// running and attempting to get events
	_watchdog: {
		lastRun: 0,
		start: function() {
			window.setInterval(function() {
			if(vboxEventListener._running && 
					((new Date().getTime()/1000) - vboxEventListener._watchdog.lastRun > vboxEventListener.timeout)) {
				phpVirtualBoxFailure(' (EventListener watchdog failure)');
				vboxEventListener.stop();
				window.clearInterval(vboxEventListener._watchdog.timer);
			} 
			}, vboxEventListener.timeout)
		},
		stop: function() {
			window.clearInterval(vboxEventListener._watchdog.timer);
		}
	},
		
	// Since VirtualBox handles to event listener objects are persistent,
	// calls using the same handle should be synchronous
	_requestQueue: {
		
		requests: [],
		running: false,
		
		// run timer
		timer: window.setInterval(function(){
			vboxEventListener._requestQueue.run();
		}, 5000), // 5 seconds
		
		// Add a request to the queue
		addReq: function(q) {
			
			var d = $.Deferred();
			
			vboxEventListener._requestQueue.requests.push({'request':q,'deferred':d});
			vboxEventListener._requestQueue.run();
			
			return d.promise();
		},
		
		// Run through the queue
		run : function() {
			
			// Already running through queue
			if(vboxEventListener._requestQueue.running) return;
			
			vboxEventListener._requestQueue.running = true;
			vboxEventListener._requestQueue.runReq();
			
		},
		
		// Run a single request, removing it from the queue
		runReq: function() {
			var r = vboxEventListener._requestQueue.requests.shift();
			if(r) {
				$.when(r.request())
					.done(r.deferred.resolve)
					.fail(r.deferred.reject)
					.always(vboxEventListener._requestQueue.runReq);
			} else {
				vboxEventListener._requestQueue.running = false;
			}
		}
		
	},
	
	/**
	 *  Start event listener loop
	 *  @param {Array} vmlist - list of VM ids to subscribe to
	 */
	start: function(vmlist) {
		
		// Already started?
		if(vboxEventListener._running) return;
		
		// Get timeout if exists
		if($('#vboxPane').data('vboxConfig').eventListenerTimeout)
			vboxEventListener.timeout = $('#vboxPane').data('vboxConfig').eventListenerTimeout;
		
		vboxEventListener._running = true;
		
		var started = $.Deferred();
		
		// Subscribe to events and start main loop
		$.when(vboxAjaxRequest('subscribeEvents',{vms:vmlist})).done(function(d) {
			vboxEventListener._persist = d.persist;
			$.when(vboxEventListener._getEvents()).done(function(){
				vboxEventListener._watchdog.start();
				started.resolve();
			});
		});
		
		return started.promise();
		
	},
	
	/**
	 * Subscribe to a single machine's events. This should happen
	 * 
	 * @param {String} vmid - ID of VM to subscribe to
	 */
	subscribeVMEvents: function(vmid) {
		
		// Push into list
		vboxEventListener._subscribeList.push(vmid);
		
		// Add subscription request to queue
		return vboxEventListener._requestQueue.addReq(function(){
			
			if(!vboxEventListener._subscribeList.length) return;
			
			var vms = vboxEventListener._subscribeList.concat();
			vboxEventListener._subscribeList = [];
			
			var vmEvents = $.Deferred();
			$.when(vboxAjaxRequest('machineSubscribeEvents', {'vms':vms},{'persist':vboxEventListener._persist})).done(function(d){
				// Always set persistent request data
				vboxEventListener._persist = d.persist;
			}).always(function(){
				vmEvents.resolve();
			});
			return vmEvents.promise();
		});
		
	},
	
	/**
	 *  Stop event listener loop and unsubscribe from events
	 */
	stop: function() {
		
		if(!vboxEventListener._running)
			return;
		
		window.clearTimeout(vboxEventListener._running);
		vboxEventListener._running = false;
		
		vboxEventListener._watchdog.stop();
		
		// Unsubscribe from events. Returns a deferred object
		return vboxEventListener._requestQueue.addReq(function(){
			return vboxAjaxRequest('unsubscribeEvents', {}, {'persist':vboxEventListener._persist});
		});
		
	},
	
	/**
	 * Main loop - get pending events
	 */
	_getEvents: function(){

		// Don't do anything if we aren't running anymore
		if(!vboxEventListener._running) return;
		
		// Add to queue
		return vboxEventListener._requestQueue.addReq(function(){
			
			return $.when(new Date().getTime(), vboxAjaxRequest('getEvents',{}, {'persist':vboxEventListener._persist})).done(function(lastTime,d) {
				
				// Don't do anything if this is not running
				if(!vboxEventListener._running) return;
				
				// Check for valid result
				if(!d || !d.success) {
					if(vboxEventListener._running)
						phpVirtualBoxFailure();
					return;
				}
				
				
				// Check key to make sure this isn't a stale
				// response from a previously selected server
				if(!d.key || (d.key != $('#vboxPane').data('vboxConfig').key)) return;
				
				// Tell the watch dog that we were run
				vboxEventListener._watchdog.lastRun = (new Date().getTime() / 1000);
				
				// Always set persistent request data
				vboxEventListener._persist = d.persist;
				
				// Loop through each event triggering changes
				if(d.responseData && d.responseData.length) {
									
					// Trigger each event individually
					for(var i = 0; i < d.responseData.length; i++) {
						
						// Trigger raw vbox events
						$('#vboxPane').trigger('vbox' + d.responseData[i].eventType, [d.responseData[i]]);
						
					}
					
					// Trigger event list queue
					$('#vboxPane').trigger('vboxEvents', [d.responseData]);
					
				}
				
				// Wait at most 3 seconds
				var wait = Math.min(3000,3000 - ((new Date().getTime()) - lastTime));
				if(wait <= 0) {
					vboxEventListener._running = true;
					vboxEventListener._getEvents();
				} 
				else { 
					vboxEventListener._running = window.setTimeout(vboxEventListener._getEvents, wait);
				}
				
			});

		});
	}
};

// Stop event listener on window unload
$(document).ready(function() {
	$(window).on('unload',function() {
		vboxEventListener.stop();
	});	
});
