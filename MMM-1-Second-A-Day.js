/* global Module */

/* Magic Mirror
 * Module: MMM-1-Second-A-Day
 *
 * By Gary Chew and Kyle Stadelmann
 */

Module.register('MMM-1-Second-A-Day',
{
	defaults:
	{

    },

	start: function()
	{
	  Log.info('Starting module: ' + this.name);
	  this.sendSocketNotification('START', this.config);
	},

    notificationReceived: function(notification, payload, sender) {
        if (notification === "RECORD") {
            this.sendSocketNotification(notification, payload);
        }
    },

    socketNotificationReceived: function(notification, payload) {
	    Log.info("core socketNotif received");
    },

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");
		var h = document.createElement("h1");
		h.innerHTML = "hello test!"
		wrapper.appendChild(h);

		return wrapper;
	}
});
