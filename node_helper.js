'use strict';
const NodeHelper = require('node_helper');
const fs = require('fs');
const moment = require('moment');

const PATH_TO_CLIPS = './modules/MMM-1-Second-A-Day/videos/clips/';
const PATH_TO_COMPILATIONS ='./modules/MMM-1-Second-A-Day/videos/compilations/';

module.exports = NodeHelper.create({
    start: function() {
        console.log("Starting node helper for: " + this.name);
    },

	notificationReceived: function(notification, payload, sender) {
	},

    socketNotificationReceived: function(notification, payload) {
    	const self = this;
		switch(notification) {
			case "START":
				console.log("Starting node helper socket notification");
				self.sendSocketNotification("RECORD_STATUS_UPDATE", {
					recordStatus: "STATUS_NOT_RECORDED",
					clipFileNames: fs.readdirSync(PATH_TO_CLIPS)
				});
				break;
			case "SAVE_CLIP":
				this.saveClip(payload);
				break;
			case "COMPILE_CLIPS":
				this.compileClips();
				break;
			case "UPLOAD_COMPILATIONS":
				this.uploadCompilations(payload);
				break;
			case "":
				break;
		}
    },

    saveClip : function(blob) {
    	const self = this;
		const currTime = moment().format('YYYY[_]MM[_]DD');
		const fileName = 'clip_' + currTime;
        const fileExtension = 'webm';
        const fileFullName = PATH_TO_CLIPS + fileName + '.' + fileExtension;
        fs.mkdirSync(PATH_TO_CLIPS, { recursive: true });
        fs.writeFile(fileFullName, Buffer.from(blob), {}, err => {
            if(err){
                console.error(err)
                return
            }
            console.log('video saved')
			self.sendSocketNotification("RECORD_STATUS_UPDATE", {
				recordStatus: "STATUS_RECORDING_COMPLETE",
				clipFileNames: fs.readdirSync(PATH_TO_CLIPS)
			});
        })
    },

    compileClips: function () {
		const fs = require('fs');
		const ffmpeg = require('fluent-ffmpeg');
		const moment = require('moment');
		const currTime = moment().format('YYYY[_]MM[_]DD');
		const fileExtension = 'webm';
		const mergeFileName = 'compilation_' + currTime + '.' + fileExtension;

		const command = ffmpeg();

		let filenames = fs.readdirSync(PATH_TO_CLIPS);
		filenames.forEach(function(filename) {
			// add each video file to ffmpeg command
  			command.addInput(PATH_TO_CLIPS + filename);
		});

	    // create file path for compilation
		fs.mkdirSync(PATH_TO_COMPILATIONS, { recursive: true });

		console.log('Compiling videos to ' + mergeFileName + '...');
		// call ffmpeg merge command
		command
  			.on('error', function(err) {
    			console.log('An error occurred: ' + err.message);
  			})
  			.on('end', function() {
    			console.log('Video compilation finished !');
  			})
  			.mergeToFile(PATH_TO_COMPILATIONS + mergeFileName);
	},

	uploadCompilations: function (destination) {
		const uploadUniqueFile = require('./upload.js');
		const fs = require('fs');
		
		let filenames = fs.readdir(PATH_TO_COMPILATIONS, function(err, files) {
			if (err) 
				console.error(err);
			else {
				files.forEach(function(file) {
					console.log("Uploading " + file);
					uploadUniqueFile(file, PATH_TO_COMPILATIONS+file, destination);
				});
			}
		});
	}
});
