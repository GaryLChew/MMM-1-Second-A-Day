/* global Module */

/* Magic Mirror
 * Module: MMM-1-Second-A-Day
 *
 * By Gary Chew and Kyle Stadelmann
 */
const RECORD_TRANSITION_TIME = 2000;

Module.register('MMM-1-Second-A-Day',
{
	defaults:
	{
		driveDestination: ''
    },

	start: function()
	{
		Log.info('Starting module: ' + this.name);
		this.sendSocketNotification('START', this.config);
		this.recordStatus = "STATUS_NOT_RECORDED";
		this.numStreakDays = 0;
		this.numTotalClips = 0;
		this.webcamVideoSrcObject = null;
	},

	getStyles: function() {
		return ["MMM-1-Second-A-Day.css"]
	},

	getDom: function() {
		const wrapper = document.createElement("div");
		const reminder = document.createElement("p");
		switch(this.recordStatus) {
			case "STATUS_NOT_RECORDED":
				reminder.innerHTML = "You haven't yet recorded today's clip.<br/>" +
					"Say \"Hey Mirror, record a clip!\"";
				break;
			case "STATUS_RECORDING_IN_PROGRESS":
				reminder.innerHTML = "Recording...";

				const webcamVideoContainer = document.createElement("div");
				webcamVideoContainer.id = "webcamVideoContainer";
				wrapper.appendChild(webcamVideoContainer);

				const webcamVideo = document.createElement("video");
				webcamVideo.autoplay = true;
				webcamVideo.id = "webcamVideo";
				webcamVideo.srcObject = this.webcamVideoSrcObject
				webcamVideoContainer.appendChild(webcamVideo);
				break;
			case "STATUS_RECORDING_COMPLETE":
				reminder.innerHTML = "You have completed recording today's clip!";
				break;
		}
		wrapper.appendChild(reminder);

		// const streak = document.createElement("p");
		// streak.innerHTML = this.numStreakDays + "-day streak";
		// wrapper.appendChild(streak);

		const summary = document.createElement("p");
		summary.innerHTML = this.numTotalClips + " total days recorded, starting from " + "January 27th, 2013";
		wrapper.appendChild(summary);

		return wrapper;
	},
	notificationReceived: function(notification, payload, sender) {
		Log.info("MMM-1-Second-A-Day notificationReceived");
		switch(notification) {
			case "RECORD_CLIP":
				this.recordClip();
				break;
			case "COMPILE_CLIPS":
				this.sendSocketNotification("COMPILE_CLIPS");
				break;
			case "UPLOAD_COMPILATIONS":
				this.sendSocketNotification("UPLOAD_COMPILATIONS", this.config.driveDestination);
				break;
		}
    },
    socketNotificationReceived: function(notification, payload) {
	    Log.info("MMM-1-Second-A-Day socketNotificationReceived");
	    // TODO: Reset at end of day
		switch(notification) {
			case "RECORD_STATUS_UPDATE":
				Log.info("Received status update!");
				this.recordStatus = payload.recordStatus;
				this.numStreakDays = 0;
				this.numTotalClips = payload.clipFileNames.length;
				this.updateDom(RECORD_TRANSITION_TIME);
				break;
			default:
				Log.error("Unhandled socketNotification")
				break;
		}
    },
	recordClip: function () {
		const self = this;
		navigator.mediaDevices.getUserMedia({video: true}).then(function (stream) {
			self.recordStatus = "STATUS_RECORDING_IN_PROGRESS";
			self.webcamVideoSrcObject = stream;
			self.updateDom(RECORD_TRANSITION_TIME);

			setTimeout(() => {
				const blob_reader = new FileReader();
				const blobs = [];
				blob_reader.addEventListener("load", function (ev) {
					self.sendSocketNotification("SAVE_CLIP", ev.currentTarget.result);
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
			}, RECORD_TRANSITION_TIME);

		});
	}
});
