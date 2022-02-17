// screen resolution
let w = 1600;
let h = 900;
let picW = w;
let picH = h;

// variables for the serial communication
var serial;          // variable to hold an instance of the serialport library
var portName = '/dev/cu.usbmodem1451';  // fill in your serial port name here
let fromSerial = 0;

// for loaded images
let images = [];	// 2 dimentional array
images[0] = [];		// for saving the frame images of the starry night animation
images[1] = [];		// for saving the frame images of the first shooting star animation
images[2] = [];		// for saving the frame images of the second shooting star animation
images[3] = [];		// for saving the frame images of the third shooting star animation
let stickers = [];
let quotes = [];

let ui_bg;
let ui_yesTri;
let ui_noTri;
let ui_nod = [];
let ui_shake = [];
let ui_twitter = [];
let ui_match;

// for the loaded sound file
let bgm;
let flameSnd;

// for the custom fonts
let font_luthier, font_roboto_light, font_roboto_bold;

// YES/NO objects
let yesNod;
let noShake;

let cam;	// webcam
let pic;	// saves the surprise picture(user's picture + stickers + quote)

// for the serial communication
let blowNum;	// the number that the user blows (max: 3)

// Starry night sky & shooting stars
let f;
let alpha;
let textAlpha;
let showPicTimer;
let fileName;

// state 3 - 7
let dy, rs, ra;
let frameCnt_picMotion;
let ans;
let frameCnt_selMotion;

let frameCnt_twMotion;
let frameCnt_twAlpha;
let tw1X, tw1X1, tw1X2;
let tw2X, tw2X1, tw2X2;

// to manage the stage of the UI 
/* 
state<3: User is blowing out the lights
state==3: shows the surprise picture
state==4: Asks if the user wants to download the picture
state==5: Asks if the user agrees with uploading the picture to Twitter
state==6: Uploads the picture to Twitter & shows the url
state==7: Waiting for being lighted 
*/
let state;

// variables for face tracking
let ctracker;

let preX, preY;
let checkNod = [];
let checkShake = [];
let iNod;
let iShake;
let numZeroHor;
let numZeroVer;
let cntInRow = 2;
let validNum = 2;
let validNod;
let validShake;

// variables for twitter uploading
let socket;
let picUrl;
let comp;

// variables for uploading animation
let upldStars = [];

let upldStar_initX, upldStar_initY;
let l;
let upldStar_dx, upldStar_dy;
let theta;
let maxTail;

// variables for showing the image url
let qrcode;
let div;
let showUrlTimer;

function preload() {

	for (let i = 1; i < 6; i++) {
		let path = 'images/decos/deco' + nf(i, 2) + '.png';
		stickers.push(loadImage(path));
	}

	for (let i = 1; i < 4; i++) {
		let path = 'images/decos/quote' + nf(i, 2) + '.png';
		quotes.push(loadImage(path));
	}

	for (let i = 0; i < 30; i++) {
		let path = 'images/state0/TwinklingStars_000' + nf(i, 2) + '.png';
		images[0].push(loadImage(path));
	}

	for (let i = 11; i < 36; i++) {
		let path = 'images/state1/ShootingStarEdit2_000' + i.toString() + '.png';
		images[1].push(loadImage(path));
	}

	for (let i = 58; i < 96; i++) {
		let path = 'images/state2/ShootingStarEdit2_00' + nf(i, 3) + '.png';
		images[2].push(loadImage(path));
	}

	for (let i = 113; i < 221; i++) { //221
		let path = 'images/state3/ShootingStarEdit2_00' + i.toString() + '.png';
		images[3].push(loadImage(path));
	}

	ui_bg = loadImage('images/UI/bg.png');

	ui_yesTri = loadImage('images/UI/yes_tri.png');
	ui_noTri = loadImage('images/UI/no_tri.png');
	ui_nod.push(loadImage('images/UI/head_down.png'));
	ui_nod.push(loadImage('images/UI/head_up.png'));
	ui_shake.push(loadImage('images/UI/head_left.png'));
	ui_shake.push(loadImage('images/UI/head_right.png'));
	ui_twitter.push(loadImage('images/UI/twitter01.png'));
	ui_twitter.push(loadImage('images/UI/twitter02.png'));
	ui_match = loadImage('images/UI/match.png');

	bgm = loadSound('sounds/wish04.mp3');
	flameSnd = loadSound('sounds/flame.mp3');

	font_luthier = loadFont('fonts/Luthier-Italic.ttf');
	font_roboto_light = loadFont('fonts/RobotoCondensed-Light.ttf');
	font_roboto_light_italic = loadFont('fonts/RobotoCondensed-LightItalic.ttf');
	font_roboto_bold = loadFont('fonts/RobotoCondensed-Bold.ttf');

}

function init() {

	state = 0;
	blowNum = 0;

	f = [0, 0, 0, 0];

	alpha = 255;
	textAlpha = 255;
	showPicTimer = -1;

	dy = h / 2;
	rs = 1;
	ra = 0;

	frameCnt_picMotion = 0;
	frameCnt_twMotion = 0;
	ans = -1;
	frameCnt_selMotion = 0;

	frameCnt_twAlpha = 0;
	tw1X1 = w * 0.2;
	tw1X2 = w * 0.35;
	tw2X1 = w * 0.74;
	tw2X2 = w * 0.59;

	tw1X = tw1X1;
	tw2X = tw2X1;

	yesNod = new YesOrNo(ui_yesTri, ui_nod[1], ui_nod, w * 0.367, h * 0.57, true);  // 444, 422
	noShake = new YesOrNo(ui_noTri, ui_nod[1], ui_shake, w * 0.567, h * 0.57, false);  // 737, 422

	preX = -1;
	preY = -1;
	checkNod = [];
	checkShake = [];
	iNod = 0;
	iShake = 0;
	numZeroHor = 0;
	numZeroVer = 0;
	validNod = 0;
	validShake = 0;

	comp = false;

	l = 150;

	upldStars = [];
	upldStars.push({ x: 0, y: -l });

	upldStar_initX = 0;
	upldStar_initY = -l;
	upldStar_dx = 0;
	upldStar_dy = 0;
	theta = 0;
	maxTail = 30;

	showUrlTimer = -1;

}

function createQR() {

	div = createDiv("");
	div.id("qrcode");
	div.style("width", "256px");
	div.style("height", "256px");
	div.style("padding", "2px");
	div.position((w / 2 - 130), (h / 2 - 130));    // w/2-128, h/2-180
	qrcode = new QRCode("qrcode");

}

function setup() {

	state = 7;

	socket = io.connect('http://localhost:3000');
	socket.on('bitly', picUploaded);

	frameRate(24);

	createCanvas(w, h);
	pixelDensity(2);

	angleMode(DEGREES);

	pic = createGraphics(w, h);
	cam = createCapture(VIDEO);
	cam.size(picW, picH);
	cam.hide();

	// setup the camera for face tracking
	let trackingCam = createCapture(VIDEO);
	trackingCam.size(400, 300);
	trackingCam.position(0, h);
	trackingCam.hide();

	// setup tracker
	ctracker = new clm.tracker();
	ctracker.init(pModel);
	ctracker.start(trackingCam.elt);

	// setup for the serial communcation
	serial = new p5.SerialPort();       		// make a new instance of the serialport library
	serial.on('connected', serverConnected); 	// callback for connecting to the server
	serial.on('open', portOpen);        		// callback for the port opening
	serial.on('data', serialEvent);     		// callback for when new data arrives
	serial.on('error', serialError);    		// callback for errors
	serial.on('close', portClose);      		// callback for the port closing

	serial.list();                      // list the serial ports
	serial.open(portName);              // open a serial port

}

function draw() {

	push();
	imageMode(CENTER);
	image(ui_bg, w / 2, h / 2, w, h);
	pop();

	if (state < 3) starAnim();
	else if (state == 3) showPic();
	else if (state == 4) doYouWannaDownload();
	else if (state == 5) areYouOkWithUploading();
	else if (state == 6) showUrl();
	else if (state == 7) lightTheCandles();

}

function lightTheCandles() {

	push();
	imageMode(CENTER);
	noTint();
	image(ui_match, w / 2, h * 0.53, 300, 302.14);
	textAlign(CENTER);
	fill(255);
	textSize(50);
	textFont(font_roboto_light);
	text("Strike the match & Light the closest candle", w / 2, h * 0.2);
	pop();
}

function showUrl() {

	if (comp) {	// uploading finished. Shows the URL
		push();
		textAlign(CENTER);
		fill(255);
		textSize(30);
		textFont(font_roboto_light);
		text("Now, you can download your picture from", w / 2, h * 0.3);
		textSize(20);
		text("twitter.com/@WishCandle", w / 2, h * 0.9);
		fill(246, 247, 147);
		textSize(45);
		textFont(font_roboto_bold);
		text(picUrl, w / 2, h * 0.7);
		pop();

		if (showUrlTimer < 0) {
			showUrlTimer = millis();
			div.style("background-color", "white");
			qrcode.makeCode(picUrl);
		}
		else if ((millis() - showUrlTimer) > 40000) {
			div.remove();
			serial.write("R");
			console.log("Sent R");
			state++;  // state 6 -> 7
		}
	}
	else {	// uploading
		push();
		textAlign(CENTER);
		fill(255);
		textSize(35);
		textFont(font_roboto_light);
		text("Uploading...", w / 2, h / 2);

		uploadingAnim();

		pop();
	}
}

function areYouOkWithUploading() {
	push();
	imageMode(CENTER);
	translate(w / 2, dy);
	rotate(ra);
	image(pic, 0, 0, picW / rs, picH / rs);
	pop();

	image(ui_twitter[0], tw1X, h * 0.108, 98, 81);  // y=81
	image(ui_twitter[1], tw2X, h * 0.212, 73, 60); // y=162

	push();
	textAlign(CENTER);
	fill(255, frameCnt_twAlpha);
	textSize(25);
	textFont(font_roboto_light);
	text("We can send the picture to you via Twitter", w / 2, h * 0.38); //278
	textSize(35);
	textFont(font_roboto_bold);
	text("Are you OK with uploading your picture to Twitter?", w / 2, h * 0.45);  //342
	pop();

	//transition effect of Twitter logos
	if (frameCnt_picMotion < 13) {

		rs = map(frameCnt_picMotion, 0, 12, 3, 6);
		dy = map(frameCnt_picMotion, 0, 12, h / 4, h / 6);
		ra = map(frameCnt_picMotion, 0, 12, 0, -10);

		tw1X = map(frameCnt_picMotion, 0, 12, tw1X1, tw1X2);
		tw2X = map(frameCnt_picMotion, 0, 12, tw2X1, tw2X2);

		frameCnt_picMotion++;

	}
	// transition effect of the text
	else if (frameCnt_twMotion < 13) {

		if (frameCnt_twAlpha < 255) {
			frameCnt_twAlpha = map(frameCnt_twMotion, 0, 12, 0, 255);
		}

		frameCnt_twMotion++;

		// Nod and Shake animations are paused until all the other transition effects finish
		yesNod.displayText();
		noShake.displayText();
		yesNod.pause();
		noShake.pause();

	}
	else {

		yesNod.displayText();
		noShake.displayText();

		if (ans < 0) {		// waiting for the user's answer  
			yesNod.animate();
			noShake.animate();
			analyseHeadMotion();
		}
		else {	// when the user answered
			if (frameCnt_selMotion < 24) {
				if (ans == 0) {
					yesNod.animate();
					yesNod.bounce(ans);
					noShake.pause();
				}
				else if (ans == 1) {
					yesNod.pause();
					noShake.animate();
					noShake.bounce(ans);
				}
				frameCnt_selMotion++;
			}
			else {
				if (ans == 0) {	// if the answer is yes
					uploadPicAndGenerateUrl();
					frameCnt_picMotion = 0;
					frameCnt_selMotion = 0;
					yesNod.init();
					noShake.init();
					ans = -1;
					state++	// state 5 -> 6
				}
				else if (ans == 1) {   // if the answer is no: state 5 -> 7
					div.remove();
					serial.write("R");
					console.log("Sent R");
					state = 7;
				}
			}
		}

	}
}

function doYouWannaDownload() {
	push();
	imageMode(CENTER);
	translate(w / 2, dy);
	noTint();
	image(pic, 0, 0, picW / rs, picH / rs);
	pop();

	//transition animation
	if (frameCnt_picMotion < 24) {
		rs = map(frameCnt_picMotion, 0, 23, 1, 3);
		dy = map(frameCnt_picMotion, 0, 23, h / 2, h / 4);

		frameCnt_picMotion++;
	}
	else {
		push();
		textAlign(CENTER);
		textSize(35);
		fill(255);
		textFont(font_roboto_bold);
		text("Would you like to receive this picture?", w / 2, h / 2);
		pop();

		yesNod.displayText();
		noShake.displayText();

		if (ans < 0) {	// waiting for the user's answer 
			yesNod.animate();
			noShake.animate();
			analyseHeadMotion();
		}
		else {	// when the user answered
			if (frameCnt_selMotion < 24) {	// an animation for the answer
				if (ans == 0) {	// if the answer is yes, the yes arrow bounces
					yesNod.animate();
					yesNod.bounce(ans);
					noShake.pause();
				}
				else if (ans == 1) {	// if the answer is yes, the no arrow bounces
					yesNod.pause();
					noShake.animate();
					noShake.bounce(ans);
				}
				frameCnt_selMotion++;
			}
			else {	// the animation for the answer finished
				if (ans == 0) {	// if the answer is yes
					frameCnt_picMotion = 0;
					frameCnt_selMotion = 0;
					yesNod.init();
					noShake.init();
					ans = -1;
					state++		// state 4 -> 5
				}
				else if (ans == 1) {   // if the answer is no: state 4 -> 7
					div.remove();
					serial.write("R");
					console.log("Sent R");
					state = 7;
				}
			}
		}
	}
}



function showPic() {
	noTint();
	push();
	imageMode(CENTER);
	translate(w / 2, h / 2);
	image(pic, 0, 0, picW, picH);
	pop();

	// it happens only once at the first execution of this function
	if (showPicTimer < 0) {
		// save the picture to the local driver
		fileName = nf(month(), 2) + nf(day(), 2) + nf(hour(), 2) + nf(minute(), 2) + nf(second(), 2) + ".jpg";
		save(fileName);

		// set a timer
		showPicTimer = millis();
	}
	else {
		let dur = millis() - showPicTimer;
		if (dur > 3000) {    // state 3 -> 4
			state++;
			frameRate(24);
		}
	}

}

function starAnim() {
	let i = state + 1;

	// the surprise picture starts to reveal
	if (i > 2 && f[i] > (images[i].length * 0.7)) {
		noTint();
		image(pic, 0, 0, w, h);
		tint(255, alpha);
	}
	// starry night animation
	if (f[0] < images[0].length) image(images[0][f[0]], 0, 0, w, h);
	else {
		let idx = f[0] - 2 * (f[0] - images[0].length + 1);	// this is for the reverse animation
		image(images[0][idx], 0, 0, w, h);
	}

	// repeat the starry night animation
	if (f[0] < (images[0].length * 2 - 2)) f[0]++;
	else f[0] = 1;

	// shooting star animations
	if (state < blowNum) {
		if (f[i] < images[i].length) {
			if (i > 2 && f[i] > (images[i].length * 0.7)) {
				tint(255, alpha);
				alpha = constrain(floor(alpha - (255 / ceil(images[i].length * 0.3))), 0, 255);
				console.log(alpha);
			}
			image(images[i][f[i]], 0, 0, w, h);
			f[i]++;
		}
		else state++;

	}

	// text fading
	if (state < blowNum) {
		if (i == 1 && textAlpha > 255 * 0.65) {
			textAlpha = floor(map(f[i], 0, floor((images[i].length - 1) / 2), 255, 255 * 0.65));
		}
		else if (i == 2 && textAlpha > 255 * 0.35) {
			textAlpha = floor(map(f[i], 0, floor((images[i].length - 1) / 2), 255 * 0.65, 255 * 0.35));
		}
		else if (i == 3 && textAlpha > 0) {
			textAlpha = floor(map(f[i], 0, floor((images[i].length - 1) / 2), 255 * 0.35, 0));
		}
	}

	textAlign(CENTER);
	textFont(font_luthier);
	textSize(45);
	fill(255, 255, 255, textAlpha);
	text("Make a wish and blow out the candles", w / 2, h * 0.1);

}

function uploadingAnim() {

	let diag = 2 * l * sin(theta / 2);
	let ang = (180 - theta) / 2;

	upldStar_dx = diag * sin(ang);
	upldStar_dy = diag * cos(ang);

	if (upldStars.length > 2) {
		for (let i = upldStars.length - 2; i > 0; i--) {
			upldStars[i].x = upldStars[i - 1].x;
			upldStars[i].y = upldStars[i - 1].y;
		}
	}
	upldStars[0].x = upldStar_initX + upldStar_dx;
	upldStars[0].y = upldStar_initY + upldStar_dy;

	push();
	translate(width / 2, height / 2);
	noStroke();
	for (let i = 0; i < upldStars.length; i++) {
		fill(246, 247, 147, map(i, 0, maxTail - 1, 200, 10));
		ellipse(upldStars[i].x, upldStars[i].y, map(i, 0, maxTail - 1, 20, 10));
	}
	pop();

	if (upldStars.length < maxTail)
		upldStars.push({ x: upldStars[upldStars.length - 1].x, y: upldStars[upldStars.length - 1].y });

	theta += 3;
}

function uploadPicAndGenerateUrl() {

	let data = {
		file: fileName
	}
	console.log('Sending: ' + data.file);

	socket.emit('image', data);

}


function analyseHeadMotion() {

	let positions = ctracker.getCurrentPosition();

	if (positions.length) {
		let dHor;
		let dVer;

		let x = positions[33][0];
		let y = positions[33][1];

		if (preX > 0) {
			if ((preX - x) > 0.5) dHor = -1;
			else if ((preX - x) < -0.5) dHor = 1;
			else dHor = 0;

			if ((preY - y) > 0.5) dVer = 1;
			else if ((preY - y) < -0.5) dVer = -1;
			else dVer = 0;

			// nod
			if (dVer == 0) {
				if (numZeroVer == 0) numZeroVer++;
				else {
					validNod = 0;
					iNod = 0;
					numZeroVer = 0;
				}
			}
			else {
				if (iNod == 0) {
					checkNod[iNod] = dVer;
					iNod++;
				}
				else if (iNod < cntInRow) {
					if (checkNod[iNod - 1] == dVer) {
						checkNod[iNod] = dVer;
						iNod++;
					}
					else {
						validNod = 0;
						checkNod[0] = dVer;
						iNod = 1;
					}
				}
				else {
					if (checkNod[cntInRow - 1] != dVer) {
						validNod++;
						iNod = 0;
						checkNod[iNod] = dVer;
					}
					else iNod++;
				}

				if (iNod > 50) {
					validNod = 0;
					iNod = 0;
				}
			}

			// shake
			if (dHor == 0) {
				if (numZeroHor == 0) numZeroHor++;
				else {
					validShake = 0;
					iShake = 0;
					numZeroHor = 0;
				}

			}
			else {
				if (iShake == 0) {
					checkShake[iShake] = dHor;
					iShake++;
				}
				else if (iShake < cntInRow) {
					if (checkShake[iShake - 1] == dHor) {
						checkShake[iShake] = dHor;
						iShake++;
					}
					else {
						validShake = 0;
						checkNod[0] = dHor;
						iShake = 1;
					}
				}
				else {
					if (checkShake[cntInRow - 1] != dHor) {
						validShake++;
						iShake = 0;
						checkShake[iShake] = dHor;
					}
					else iShake++;
				}

				if (iShake > 50) {
					validShake = 0;
					iShake = 0;
				}
			}

			// check if there were nodding motions
			if (validNod >= validNum) {
				console.log("YES");
				validNod = 0;
				iNod = 0;
				ans = 0;
			}
			// check if there were shaking motions
			if (validShake >= validNum) {
				console.log("NO");
				validShake = 0;
				iShake = 0;
				ans = 1;
			}
		}

		preX = x;
		preY = y;

	}
}

function genPic() {

	let rdm = floor(random(0, stickers.length));
	pic.image(cam.get(), 0, 0, w / 2, h / 2);
	pic.image(stickers[rdm], 0, 0, w / 2, h / 2);
	rdm = floor(random(0, quotes.length));
	pic.image(quotes[rdm], 0, 0, w / 2, h / 2);
}

function picUploaded(data) {
	picUrl = data;
	comp = true;
}

// temporarily substitutes the blowing out event
function mouseClicked() {

	console.log("clicked in state " + state);

	if (blowNum == 0) {
		genPic();
	}

	if (blowNum == 2) {
		bgm.play();
	}

	if (blowNum < 3) {
		blowNum++;
	}

	if (state == 4 || state == 5) {
		if (yesNod.isClicked(mouseX, mouseY)) ans = 0;
		else if (noShake.isClicked(mouseX, mouseY)) ans = 1;
	}

	if (state == 6) {
		div.remove();
		serial.write("R");
		console.log("Sent R");
		state++;
	}

}

function serialEvent() { // it happens when something arrives

	let stringFromSerial = serial.readLine();

	console.log(stringFromSerial);

	if (stringFromSerial.length > 0) {
		stringFromSerial = trim(stringFromSerial);
		let numFromSerial = Number(stringFromSerial);

		if (numFromSerial == 0) {
			frameRate(32);
			flameSnd.play();
			init();
			createQR();
		}

		else if (numFromSerial == 1) {
			blowNum = 1;
			genPic();
			console.log("blown once");
		}

		else if (numFromSerial == 2) {
			blowNum = 2;
			console.log("blown twice");
		}

		else if (numFromSerial == 3) {
			bgm.play();
			blowNum = 3;
			console.log("blown three times");
		}

	}
}

function serverConnected() {
	print('connected to server.');
}

function portOpen() {
	print('the serial port opened.');
}

function serialError(err) {
	print('Something went wrong with the serial port. ' + err);
}

function portClose() {
	print('The serial port closed.');
}
