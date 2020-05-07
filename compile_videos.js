const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

const PATH_TO_VIDEOS = './videos/'

var command = ffmpeg();

filenames = fs.readdirSync(PATH_TO_VIDEOS)
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
  .mergeToFile('merged.webm', './');
