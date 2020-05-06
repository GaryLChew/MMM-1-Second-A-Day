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

	record1SecondVideo: function (self) {
		navigator.mediaDevices.getUserMedia({audio: true, video: true}).then(function (stream) {
			const blob_reader = new FileReader();
			const blobs = [];
			blob_reader.addEventListener("load", function (ev) {
				self.sendSocketNotification("SAVE_1_SECOND_VIDEO", ev.currentTarget.result);
				if (blobs.length) {
					ev.currentTarget.readAsArrayBuffer(blobs.shift());
				}
			});

			const recorder = new MediaRecorder(stream);
			recorder.addEventListener("dataavailable", function (ev) {
				if (blob_reader.readyState != 1) {
					blob_reader.readAsArrayBuffer(ev.data);
				} else {
					blobs.push(ev.data);
				}
			});

			recorder.start();
			setTimeout(() => recorder.stop(), 1000);
		});
	}, notificationReceived: function(notification, payload, sender) {
	    const self = this;
        if (notification === "RECORD_1_SECOND_VIDEO") {
            this.record1SecondVideo(self);
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