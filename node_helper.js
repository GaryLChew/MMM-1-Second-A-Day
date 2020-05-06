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
});
