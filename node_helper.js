'use strict';
const NodeHelper = require('node_helper');

module.exports = NodeHelper.create({
    start: function() {
        console.log("Starting node helper for: " + this.name);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "RECORD") {
            console.log("Received RECORD notification.");
            this.record();
        }
    },

    record : function() {
        captureCamera(function(camera) {
            var recorder = RecordRTC(camera, {
                type: 'video'
            });
            Log.info("recording");
            recorder.startRecording();

            recorder.stopRecording(() => {
                recorder.save('./video.webm');
            });

            // release camera on stopRecording
            recorder.camera = camera;

        });
    },


});

function captureCamera(callback) {
    navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(function(camera) {
        callback(camera);
    }).catch(function(error) {
        alert('Unable to capture your camera. Please check console logs.');
        console.error(error);
    });
}