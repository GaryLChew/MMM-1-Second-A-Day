'use strict';
const NodeHelper = require('node_helper');

module.exports = NodeHelper.create({
    start: function() {
        console.log("Starting node helper for: " + this.name);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "SAVE_1_SECOND_VIDEO") {
            console.log("Node helper received SAVE_1_SECOND_VIDEO");
            this.save1SecondVideo(payload);
        }
        if (notification === "COMPILE_VIDEOS") {
            console.log("Node helper received COMPILE_VIDEOS");
            this.compileVideos();
        }
    },

    save1SecondVideo : function(blob) {
        const fs = require('fs');
        const filePath = './modules/MMM-1-Second-A-Day/videos/1-second-videos/';
        const fileName = 'video';
        const fileExtension = 'webm';
        const fileFullName = filePath + fileName + (Math.round(Math.random() * 9999999999) + 888888888) + '.' + fileExtension;
        fs.mkdirSync(filePath, { recursive: true });
        fs.writeFile(fileFullName, Buffer.from(blob), {}, err => {
            if(err){
                console.error(err)
                return
            }
            console.log('video saved')
        })
    },

    compileVideos: function () {
		const ffmpeg = require('fluent-ffmpeg');
		const fs = require('fs');

		const PATH_TO_VIDEOS = './modules/MMM-1-Second-A-Day/videos/1-second-videos/';
		const PATH_TO_COMPILATIONS ='./modules/MMM-1-Second-A-Day/videos/compilations/';

		var command = ffmpeg();

		filenames = fs.readdirSync(PATH_TO_VIDEOS);
		filenames.forEach(function(filename) {
  		// add each video file to ffmpeg command
  			command.addInput(PATH_TO_VIDEOS + filename);
		});

		// call ffmpeg merge command
		command
  			.on('error', function(err) {
    			console.log('An error occurred: ' + err.message);
  			})
  			.on('end', function() {
    			console.log('Merging finished !');
  			})
  			.mergeToFile('merged.webm', PATH_TO_COMPILATIONS);
	},
});
