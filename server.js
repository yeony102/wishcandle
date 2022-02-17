let imgPath;
let imgUrl;

let express = require('express');
let app = express();
let server = app.listen(3000);

app.use(express.static('public'));

console.log("The wish server is running");

let socket = require('socket.io');
let io = socket(server);
io.sockets.on('connection', newConnection);

console.log("Twit bot is starting");

let Twit = require('twit');
let config = require('./config');
let t = new Twit(config);

let fs = require('fs');

const BitlyClient = require('bitly');
const bitly = BitlyClient('a720cc141eb20dea72ac47bf6b5530ebbbb99267');

function newConnection(socket) {
    console.log(socket.id);

    socket.on('image', imageDownloaded);

    function imageDownloaded(data) {

        imgPath = "downloaded/" + data.file;

        console.log(imgPath);
        console.log('Uploading to twitter');

        tweetIt();
    }
}

function tweetIt() {
    let params = {
        encoding: 'base64'
    }

    let b64 = fs.readFileSync(imgPath, params);

    t.post('media/upload', { media_data: b64 }, uploaded);

    function uploaded(err, data, response) {
        if (err) console.log(err);
        else {

            let id = data.media_id_string;
            let tw = {
                status: '',
                media_ids: [id]
            }
            //			console.log(data);

            t.post('statuses/update', tw, tweeted);
        }
    }

}

function tweeted(err, data, response) {
    if (err) {
        console.log("Something went wrong!");
    } else {
        console.log("It worked!");
        //	console.log(data);
        imgUrl = data.entities.media[0].media_url;
        console.log(imgUrl);

        bitly.shorten(imgUrl).then(function (result) {
            bitUrl = result.data.url;
            console.log(bitUrl);

            io.sockets.emit('bitly', bitUrl);
        })
            .catch(function (error) {
                console.error(error);
            });
    }
}