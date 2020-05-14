const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = './modules/MMM-1-Second-A-Day/gdrive_auth/token.json';
const CREDENTIAL_PATH = './modules/MMM-1-Second-A-Day/gdrive_auth/credentials.json';

// Global variables overwritten in the exported upload function
let uploadFileName;
let uploadFilePath;
const MIME_FILE_TYPE = 'video/webm';

/**
 * Uploads the file given by path to user's google drive with name 'name'
 * @param {String} name Name of future file in google drive.
 * @param {String} path The path to the file we are uploading.
 */
module.exports = (name, path) => {
    uploadFileName = name;
    uploadFilePath = path;

    // Load client secrets from a local file.
    fs.readFile(CREDENTIAL_PATH, (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Drive API.
        authorize(JSON.parse(content), uploadUniqueFile);
    });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Checks to make sure the requested file upload isn't already in the drive, 
 * before calling uploadFile() to upload it.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function uploadUniqueFile(auth) {
    const drive = google.drive({version: 'v3', auth});
    drive.files.list({
        pageSize: 1000,
        fields: 'nextPageToken, files(id, name)',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const files = res.data.files;

        // Check each of the 1000 files to make sure we haven't already uploaded this
        for (i =0; i < files.length; i++) {
            if (files[i].name === uploadFileName) {
                console.log(files[i].name + " is already in google drive, ignoring upload.");
                return;
            }
        }

        uploadFile(auth);
    });
  }

/**
* Uploads a file to google drive.
*/ 
function uploadFile(auth) {
    const drive = google.drive({version: 'v3', auth});
    const fileMetadata = {
        'name': uploadFileName,
        //parents: ['']
    };
    const media = {
        mimeType: MIME_FILE_TYPE,
        body: fs.createReadStream(uploadFilePath)
    };
    drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
    }, (err, file) => {
        if (err) {
            // Handle error
            console.error(err);
        } else {
            console.log('Finished uploading ' + uploadFileName);
        }
    });
}