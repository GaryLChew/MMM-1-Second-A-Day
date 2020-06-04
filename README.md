# MMM-1-Second-A-Day
This is a module for the [MagicMirror](https://github.com/MichMich/MagicMirror) platform.

Record daily 1-second-clips and automatically generate a 1-second-a-day video of your life.


## Configuration
[Sample MagicMirror repository w/ MMM-1-Second-A-Day set up](https://github.com/GaryLChew/SmartMirror)

The entry in config.js can look like the following. (NOTE: You only have to add the variables to config if want to change its standard value.)

```
{
	module: 'MMM-1-Second-A-Day',
	config:
	{
		driveDestination: 'YOUR_DRIVE_FOLDER'
	}
}
```

You must also integrate this module with your Google Drive in order to upload compilations online. See the "Google Drive Integration" section.

## Google Drive Integration
To properly set up uploading video compilations to Google Drive:
1. Follow this link: https://developers.google.com/drive/api/v3/quickstart/nodejs?
2. Ensure that you're logged into the desired google account in the top right of the web page.
3. In the dropdown under "Configure your OAuth client" select "Desktop app" and the press "Create".
4. Press "Download Client Configuration" and place file into the folder for this module.
5. Run command 'node upload.js' on command line, and follow steps.
6. Insert compilations into a specified folder. (Optional)
	1. On your browser open your Google Drive and go to the folder that you want to insert the compilations into.
	2. The link should be of the sort: https://drive.google.com/drive/u/0/folders/YOUR_DRIVE_FOLDER, paste YOUR_DRIVE_FOLDER into the module config.


## Dependencies
## Open Source Licenses
The MIT License (MIT)

Copyright (c) 2017 Gary Chew and Kyle Stadelmann

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
