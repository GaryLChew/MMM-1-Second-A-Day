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
		this.status = "STATUS_DEFAULT";
		this.hasRecordedToday = false;
		this.numStreakDays = 0;
		this.numTotalClips = 0;
		this.webcamVideoSrcObject = null;
		this.firstRecordedDate = null;
	},

	getStyles: function() {
		return ["MMM-1-Second-A-Day.css"]
	},

	getDom: function() {
		const wrapper = document.createElement("div");
		wrapper.id = 'MMM1SecondADayContainer';
		const statusText = document.createElement("p");
		wrapper.appendChild(statusText);
		console.log(this.status);
		switch(this.status) {
			case "STATUS_DEFAULT":
				statusText.innerHTML = this.hasRecordedToday ? "You have completed recording today's clip!" : "You haven't yet recorded today's clip.<br/>" +
					"Say \"Hey Mirror, record a clip!\"";
				break;
			case "STATUS_RECORDING":
				statusText.innerHTML = "Recording...";
				wrapper.appendChild(statusText);

				const webcamVideoContainer = document.createElement("div");
				webcamVideoContainer.id = "webcamVideoContainer";
				wrapper.appendChild(webcamVideoContainer);

				const webcamVideo = document.createElement("video");
				webcamVideo.autoplay = true;
				webcamVideo.id = "webcamVideo";
				webcamVideo.srcObject = this.webcamVideoSrcObject
				webcamVideoContainer.appendChild(webcamVideo);
				break;
			case "STATUS_COMPILING":
				statusText.innerHTML = "Compiling...";
				break;
			case "STATUS_UPLOADING":
				statusText.innerHTML = "Uploading...";
				break;
			case "STATUS_UPLOADED":
				statusText.innerHTML = "Uploaded!";
				break;

		}

		// const streak = document.createElement("p");
		// streak.innerHTML = this.numStreakDays + "-day streak";
		// wrapper.appendChild(streak);

		if (this.firstRecordedDate) {
			const summary = document.createElement("p");
			summary.innerHTML = this.numTotalClips + " total days recorded, starting from " + this.firstRecordedDate.toLocaleDateString() + ".";
			wrapper.appendChild(summary);
		}

		return wrapper;
	},
	notificationReceived: function(notification, payload, sender) {
		Log.info("MMM-1-Second-A-Day notificationReceived");
		switch(notification) {
			case "ALL_MODULES_STARTED":
				this.sendNotification('REGISTER_VOICE_MODULE', {
					mode: "RECORD",
					sentences: [
						"RECORD CLIP",
						"CREATE COMPILATION"
					]
				});
				break;
			case "VOICE_RECORD":
				if (sender.name === "MMM-voice"){
					this.checkCommands(payload);
				}
				break;
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
	    Log.info("MMM-1-Second-A-Day socketNotificationReceived: " + notification);
		switch(notification) {
			case "STATUS_UPDATE":
				this.status = payload.status;
				if (this.status === 'STATUS_DEFAULT') {
					this.numStreakDays = 0;
					this.numTotalClips = payload.clipFileNames.length;
					payload.clipFileNames.sort()
					const firstFileName = payload.clipFileNames[0];
					const firstRecordedDateString = firstFileName.slice(5, firstFileName.indexOf(".webm")).replace(/_/g, "/");
					this.firstRecordedDate = new Date(firstRecordedDateString);
				}

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
			self.status = "STATUS_RECORDING";
			// TODO: Reset at end of day
			self.hasRecordedToday = true;
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
	},

	checkCommands: function(data){
		if(/(RECORD)/g.test(data) && /(CLIP)/g.test(data)){
			console.log("Detected RECORD_CLIP command");
			this.sendNotification("RECORD_CLIP", '');
		} else if (/(CREATE)/g.test(data) && /(COMPILATION)/g.test(data)) {
			console.log("Detected COMPILE_CLIPS command");
			this.sendNotification("COMPILE_CLIPS", '');
		}
	}
});
