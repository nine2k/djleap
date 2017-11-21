var canvas, ctx, source, context1, context2, analyser1, analyser2, fbc_array1, fbc_array2, rads,
    center_x, center_y, radius, radius_old, deltarad, shockwave,
    bars, bar_x, bar_y, bar_x_term, bar_y_term, bar_width,
    bar_height, react_x, react_y, intensity, rot, inputURL1, inputURL2,
    JSONPThing, JSONResponse, soundCloudTrackName, audio1, audio2, pause,
    artist1, title1, img_url1, artist2, title2, img_url2, isSeeking, beat1, beat2, beat3, beat4, beat5, tempo1, tempo2, delay1, delay2;

var client_id = "8df0d68fcc1920c92fc389b89e7ce20f";

var audio1ready = false;
var audio2ready = false;

bars = 200;
react_x = 0;
react_y = 0;
radius = 0;
deltarad = 0;
shockwave = 0;
rot = 0;
intensity = 0;
pause = 1;
isSeeking = 0;

function initPage() {
    canvas = document.getElementById("visualizer_render");
    ctx = canvas.getContext("2d");

    //resize_canvas();

    document.getElementById("artwork1").style.opacity = 0;
    document.getElementById("artwork2").style.opacity = 0;

    audio1 = document.getElementById("audio1");
    audio1.crossOrigin = "anonymous";
    audio1.controls = true;
    audio1.loop = false;
    audio1.autoplay = false;
    audio2 = document.getElementById("audio2");
    audio2.crossOrigin = "anonymous";
    audio2.controls = true;
    audio2.loop = false;
    audio2.autoplay = false;

    beat1 = document.getElementById("beat1");
    beat2 = document.getElementById("beat2");
    beat3 = document.getElementById("beat3");
    beat4 = document.getElementById("beat4");
    beat5 = document.getElementById("beat5");

    context1 = new AudioContext();
    analyser1 = context1.createAnalyser();
    // route audio playback
    source1 = context1.createMediaElementSource(audio1);
    source1.connect(analyser1);
    analyser1.connect(context1.destination);

    fbc_array1 = new Uint8Array(analyser1.frequencyBinCount);

    context2 = new AudioContext();
    analyser2 = context2.createAnalyser();
    // route audio playback
    source2 = context2.createMediaElementSource(audio2);
    source2.connect(analyser2);
    analyser2.connect(context2.destination);

    fbc_array2 = new Uint8Array(analyser2.frequencyBinCount);

    frameLooper();
}

function resize_canvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

(function() {
    var mouseTimer = null,
        cursorVisible = true;

    function disappearCursor() {
        mouseTimer = null;
        document.body.style.cursor = "none";
        document.getElementById("hideBody").style.opacity = 0;
        cursorVisible = false;
    }

    document.onmousemove = function() {
        if (mouseTimer) {
            window.clearTimeout(mouseTimer);
        }
        if (!cursorVisible) {
            document.body.style.cursor = "default";
            document.getElementById("hideBody").style.opacity = 100;
            cursorVisible = true;
        }
        mouseTimer = window.setTimeout(disappearCursor, 3000);
    };
})();



function getJSON(url, callback) {
    JSONPThing = document.createElement("script");
    JSONPThing.type = "text/javascript";
    JSONPThing.src = url + "&callback=" + callback.name;
    document.body.appendChild(JSONPThing);
}

function userJSONCallback1(data) {
    document.body.removeChild(JSONPThing); // required
    JSONPThing = null;

    var user_id = data.id;
    artist1 = data.username;

    var tracks = "https://api.soundcloud.com/users/" + user_id + "/tracks.json?client_id=" + client_id + "&limit=200";

    getJSON(tracks, tracksJSONCallback1); // continues in tracksJSONCallback
}

function userJSONCallback2(data) {
    document.body.removeChild(JSONPThing); // required
    JSONPThing = null;

    var user_id = data.id;
    artist2 = data.username;

    var tracks = "https://api.soundcloud.com/users/" + user_id + "/tracks.json?client_id=" + client_id + "&limit=200";

    getJSON(tracks, tracksJSONCallback2); // continues in tracksJSONCallback
}

function tracksJSONCallback1(data) {
    document.body.removeChild(JSONPThing); // required
    JSONPThing = null;

    // go through each object (track) in array (data)
    for (var i = 0; i < data.length; i++) {
        var track = data[i];
        // check each track with the name (input URL)
        if (track.permalink == soundCloudTrackName) {
            inputURL1 = track.stream_url + "?client_id=" + client_id;
            title1 = track.title;
            img_url1 = track.artwork_url;
            tempo1 = track.bpm;

            var inputURL2 = document.getElementById("input_URL2").value;
            if (inputURL2.search("soundcloud.com") != -1 && inputURL2.search("api.soundcloud.com") == -1) { // is it a regular old soundcloud link
                var splitBySlash = inputURL2.replace(/http:\/\/|https:\/\//gi, "").split("/"); // get rid of "http://" / "https://" in front of url and then split by slashes
                if (splitBySlash.length == 3) { // make sure there's an actual song included at the end
                    var soundCloudUserURL = "http://" + splitBySlash[0] + "/" + splitBySlash[1];
                    soundCloudTrackName = splitBySlash[2];
                    var apiResovleURL = "https://api.soundcloud.com/resolve.json?url=" + soundCloudUserURL + "&client_id=" + client_id;
                    getJSON(apiResovleURL, userJSONCallback2); // continues in userJSONCallback
                } else if (splitBySlash.legnth == 2) { // there's a user but no song
                    // do whatever here
                } else {
                    // do whatever here
                }
            }
            break;
        }
    }
}

function tracksJSONCallback2(data) {
    document.body.removeChild(JSONPThing); // required
    JSONPThing = null;

    // go through each object (track) in array (data)
    for (var i = 0; i < data.length; i++) {
        var track = data[i];
        // check each track with the name (input URL)
        if (track.permalink == soundCloudTrackName) {
            inputURL2 = track.stream_url + "?client_id=" + client_id;
            title2 = track.title;
            img_url2 = track.artwork_url;
            tempo2 = track.bpm;

            initMp3Player();
            break;
        }
    }
}

function handleButton() {

	document.getElementById("statustext1").innerHTML = '';
	document.getElementById("statustext2").innerHTML = '';

    var inputURL1 = document.getElementById("input_URL1").value;
    if (inputURL1.search("soundcloud.com") != -1 && inputURL1.search("api.soundcloud.com") == -1) { // is it a regular old soundcloud link
        var splitBySlash = inputURL1.replace(/http:\/\/|https:\/\//gi, "").split("/"); // get rid of "http://" / "https://" in front of url and then split by slashes
        if (splitBySlash.length == 3) { // make sure there's an actual song included at the end
            var soundCloudUserURL = "http://" + splitBySlash[0] + "/" + splitBySlash[1];
            soundCloudTrackName = splitBySlash[2];
            var apiResovleURL = "https://api.soundcloud.com/resolve.json?url=" + soundCloudUserURL + "&client_id=" + client_id;
            getJSON(apiResovleURL, userJSONCallback1); // continues in userJSONCallback
        } else if (splitBySlash.legnth == 2) { // there's a user but no song
            // do whatever here
        } else {
            // do whatever here
        }
    }
}

function handleButtonStop() {
    $('audio').each(function(i) {
        this.pause();
    });
}

function autoSelect1() {
    document.getElementById("input_URL1").select();
}

function autoSelect2() {
    document.getElementById("input_URL2").select();
}

function initMp3Player() {

    audio1.src = inputURL1;
    audio2.src = inputURL2;

    pause = 0;

	document.getElementById("statustext1").innerHTML += 'Loading...<br/>';
    audio1.load();
    document.getElementById("statustext2").innerHTML += 'Loading...<br/>';
    audio2.load();

    document.getElementById("artistname1").innerHTML = artist1;
    document.getElementById("songname1").innerHTML = title1;
    document.getElementById("artwork1").src = img_url1;

    document.getElementById("artwork1").style.opacity = 100;
    document.getElementById("artwork1").style.border = "5px solid #71f4f7";
    document.getElementById("artwork1").style.padding = "1px";

    document.getElementById("artistname2").innerHTML = artist2;
    document.getElementById("songname2").innerHTML = title2;
    document.getElementById("artwork2").src = img_url2;

    document.getElementById("artwork2").style.opacity = 100;
    document.getElementById("artwork2").style.border = "5px solid #f174eb";
    document.getElementById("artwork2").style.padding = "1px";
}

function onaudio1ready() {
    audio1ready = true;/*
    if (audio2ready) {
    	document.getElementById("title").children[0].innerText = 'DJ Leap ft. SoundCloud'
        audio1.play();
        audio2.play();
    }*/
    document.getElementById("statustext1").innerHTML += '...Loaded<br/>';

    document.getElementById("statustext1").innerHTML += 'Analyzing...<br/>';
    tempo1 = null;
    tempo2 = null;
    get_bpm(inputURL1, audio1, 1);
}

function onaudio2ready() {
    audio2ready = true;/*
    if (audio1ready) {
    	document.getElementById("title").children[0].innerText = 'DJ Leap ft. SoundCloud'
        audio1.play();
        audio2.play();
    }*/
    document.getElementById("statustext2").innerHTML += '...Loaded<br/>';
}

function frameLooper() {
    resize_canvas(); // for some reason i have to resize the canvas every update or else the framerate decreases over time

    var grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grd.addColorStop(0, "rgba(180, 140, 230, 1)");
    grd.addColorStop(1, "rgba(102, 102, 255, 1)");

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255, 255, 255, " + (intensity * 0.0000125 - 0.4) + ")";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    rot = rot + intensity * 0.0000001;

    react_x = 0;
    react_y = 0;

    intensity = 0;

    analyser1.getByteFrequencyData(fbc_array1);
    analyser2.getByteFrequencyData(fbc_array2);

    for (var i = 0; i < bars; i++) {
        rads = Math.PI * 2 / bars;

        bar_x = center_x;
        bar_y = center_y;

        bar_height = Math.min(99999, Math.max((fbc_array1[i] * 2 - 200), 0));
        bar_width = bar_height * 0.02;

        bar_x_term = center_x + Math.cos(rads * i + rot) * (radius + bar_height);
        bar_y_term = center_y + Math.sin(rads * i + rot) * (radius + bar_height);

        ctx.save();

        var lineColor1 = "rgb(" + fbc_array1[i].toString() + ", " + 255 + ", " + 255 + ")";

        ctx.strokeStyle = lineColor1;
        ctx.lineWidth = bar_width;
        ctx.beginPath();
        ctx.moveTo(bar_x, bar_y);
        ctx.lineTo(bar_x_term, bar_y_term);
        ctx.stroke();

        react_x += Math.cos(rads * i + rot) * (radius + bar_height);
        react_y += Math.sin(rads * i + rot) * (radius + bar_height);

        intensity += bar_height;
    }

    for (var i = 0; i < bars; i++) {
        rads = Math.PI * 2 / bars;

        bar_x = center_x;
        bar_y = center_y;

        bar_height = Math.min(99999, Math.max((fbc_array2[i] * 2 - 200), 0));
        bar_width = bar_height * 0.02;

        bar_x_term = center_x + Math.cos(rads * i + rot) * (radius + bar_height);
        bar_y_term = center_y + Math.sin(rads * i + rot) * (radius + bar_height);

        ctx.save();

        var lineColor2 = "rgb(" + 255 + ", " + fbc_array2[i].toString() + ", " + 255 + ")";

        ctx.strokeStyle = lineColor2;
        ctx.lineWidth = bar_width;
        ctx.beginPath();
        ctx.moveTo(bar_x, bar_y);
        ctx.lineTo(bar_x_term, bar_y_term);
        ctx.stroke();

        react_x += Math.cos(rads * i + rot) * (radius + bar_height);
        react_y += Math.sin(rads * i + rot) * (radius + bar_height);

        intensity += bar_height;
    }

    center_x = canvas.width / 2 - (react_x * 0.007);
    center_y = canvas.height / 2 - (react_y * 0.007);

    radius_old = radius;
    radius = 25 + (intensity * 0.002);
    deltarad = radius - radius_old;

    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.beginPath();
    ctx.arc(center_x, center_y, radius + 2, 0, Math.PI * 2, false);
    ctx.fill();

    // shockwave effect
    shockwave += 60;

    ctx.lineWidth = 15;
    ctx.strokeStyle = "rgb(255, 255, 255)";
    ctx.beginPath();
    ctx.arc(center_x, center_y, shockwave + radius, 0, Math.PI * 2, false);
    ctx.stroke();


    if (deltarad > 10) {
        shockwave = 0;

        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        rot = rot + 0.4;
    }


    window.requestAnimationFrame(frameLooper);
}



var previousFrame = null;

var paused = false;
var pauseOnGesture = false;


// Setup Leap loop with frame callback function
var controllerOptions = {
    enableGestures: true
};

var leftHandId = null;
var rightHandId = null;
var rightHandStatus = [false, false, false, false, false];
var rightHandChanged = false;

// to use HMD mode:
// controllerOptions.optimizeHMD = true;

Leap.loop(controllerOptions, function(frame) {

    rightHandChanged = false;

    if (paused) {
        return; // Skip this update
    }

    // Display Frame object data
    //var frameOutput = document.getElementById("frameData");

    var frameString = "Frame ID: " + frame.id + "<br />" +
        "Timestamp: " + frame.timestamp + " &micro;s<br />" +
        "Hands: " + frame.hands.length + "<br />" +
        "Fingers: " + frame.fingers.length + "<br />" +
        "Tools: " + frame.tools.length + "<br />" +
        "Gestures: " + frame.gestures.length + "<br />";

    // Frame motion factors
    if (previousFrame && previousFrame.valid) {
        var translation = frame.translation(previousFrame);
        frameString += "Translation: " + vectorToString(translation) + " mm <br />";

        var rotationAxis = frame.rotationAxis(previousFrame);
        var rotationAngle = frame.rotationAngle(previousFrame);
        frameString += "Rotation axis: " + vectorToString(rotationAxis, 2) + "<br />";
        frameString += "Rotation angle: " + rotationAngle.toFixed(2) + " radians<br />";

        var scaleFactor = frame.scaleFactor(previousFrame);
        frameString += "Scale factor: " + scaleFactor.toFixed(2) + "<br />";
    }
    //frameOutput.innerHTML = "<div style='width:300px; float:left; padding:5px'>" + frameString + "</div>";

    // Display Hand object data
    //var handOutput = document.getElementById("handData");
    var handString = "";
    if (frame.hands.length > 0) {
        for (var i = 0; i < frame.hands.length; i++) {
            var hand = frame.hands[i];

            handString += "<div style='width:300px; float:left; padding:5px'>";
            handString += "Hand ID: " + hand.id + "<br />";
            handString += "Type: " + hand.type + " hand" + "<br />";
            handString += "Direction: " + vectorToString(hand.direction, 2) + "<br />";
            handString += "Palm position: " + vectorToString(hand.palmPosition) + " mm<br />";
            handString += "Grab strength: " + hand.grabStrength + "<br />";
            handString += "Pinch strength: " + hand.pinchStrength + "<br />";
            handString += "Confidence: " + hand.confidence + "<br />";
            handString += "Arm direction: " + vectorToString(hand.arm.direction()) + "<br />";
            handString += "Arm center: " + vectorToString(hand.arm.center()) + "<br />";
            handString += "Arm up vector: " + vectorToString(hand.arm.basis[1]) + "<br />";

            if (hand.type == "right") {
                rightHandId = hand.id;
            } else {
                leftHandId = hand.id;
            }

            // Hand motion factors
            if (previousFrame && previousFrame.valid) {
                var translation = hand.translation(previousFrame);
                handString += "Translation: " + vectorToString(translation) + " mm<br />";

                var rotationAxis = hand.rotationAxis(previousFrame, 2);
                var rotationAngle = hand.rotationAngle(previousFrame);
                handString += "Rotation axis: " + vectorToString(rotationAxis) + "<br />";
                if (hand.type == "left") {
                    var audio1 = document.getElementById("audio1");
                    var audio2 = document.getElementById("audio2");
                    audio2.volume = (rotationAxis[2] + 1) / 2;
                    audio1.volume = 1 - audio2.volume;
                }
                handString += "Rotation angle: " + rotationAngle.toFixed(2) + " radians<br />";

                var scaleFactor = hand.scaleFactor(previousFrame);
                handString += "Scale factor: " + scaleFactor.toFixed(2) + "<br />";
            }

            // IDs of pointables associated with this hand
            if (hand.pointables.length > 0) {
                var fingerIds = [];
                for (var j = 0; j < hand.pointables.length; j++) {
                    var pointable = hand.pointables[j];
                    fingerIds.push(pointable.id);
                }
                if (fingerIds.length > 0) {
                    handString += "Fingers IDs: " + fingerIds.join(", ") + "<br />";
                }
            }

            handString += "</div>";
        }
    } else {
        handString += "No hands";
    }
    //handOutput.innerHTML = handString;

    // Display Pointable (finger and tool) object data
    //var pointableOutput = document.getElementById("pointableData");
    var pointableString = "";
    if (frame.pointables.length > 0) {
        var fingerTypeMap = ["Thumb", "Index finger", "Middle finger", "Ring finger", "Pinky finger"];
        var boneTypeMap = ["Metacarpal", "Proximal phalanx", "Intermediate phalanx", "Distal phalanx"];
        for (var i = 0; i < frame.pointables.length; i++) {
            var pointable = frame.pointables[i];

            pointableString += "<div style='width:250px; float:left; padding:5px'>";

            if (pointable.tool) {
                pointableString += "Pointable ID: " + pointable.id + "<br />";
                pointableString += "Classified as a tool <br />";
                pointableString += "Length: " + pointable.length.toFixed(1) + " mm<br />";
                pointableString += "Width: " + pointable.width.toFixed(1) + " mm<br />";
                pointableString += "Direction: " + vectorToString(pointable.direction, 2) + "<br />";
                pointableString += "Tip position: " + vectorToString(pointable.tipPosition) + " mm<br />"
                pointableString += "</div>";
            } else {
                pointableString += "Pointable ID: " + pointable.id + "<br />";
                pointableString += "Type: " + fingerTypeMap[pointable.type] + "<br />";
                pointableString += "Belongs to hand with ID: " + pointable.handId + "<br />";
                pointableString += "Classified as a finger<br />";
                pointableString += "Length: " + pointable.length.toFixed(1) + " mm<br />";
                pointableString += "Width: " + pointable.width.toFixed(1) + " mm<br />";
                pointableString += "Direction: " + vectorToString(pointable.direction, 2) + "<br />";
                pointableString += "Extended?: " + pointable.extended + "<br />";
                pointable.bones.forEach(function(bone) {
                    pointableString += boneTypeMap[bone.type] + " bone <br />";
                    pointableString += "Center: " + vectorToString(bone.center()) + "<br />";
                    pointableString += "Direction: " + vectorToString(bone.direction()) + "<br />";
                    pointableString += "Up vector: " + vectorToString(bone.basis[1]) + "<br />";
                });
                pointableString += "Tip position: " + vectorToString(pointable.tipPosition) + " mm<br />";
                pointableString += "</div>";

                if (pointable.handId == rightHandId) {
                    if ((pointable.extended != rightHandStatus[pointable.type]) && (pointable.extended == true))
                        rightHandChanged = true;
                    rightHandStatus[pointable.type] = pointable.extended;
                }

                if ((pointable.handId == leftHandId) && (!pointable.extended) && (previousFrame != null) && (pointable.type == 0))
                    if (previousFrame.pointables.length != 0)
                        if (previousFrame.pointables.length > i && previousFrame.pointables[i].extended) {
                            var audio1 = document.getElementById("audio1");
                            var audio2 = document.getElementById("audio2");
                            if (audio1.volume < audio2.volume)
                                var audio = audio1;
                            else
                                var audio = audio2;
                            if (audio.paused)
                                audio.play();
                            else
                                audio.pause();
                        }

            }
        }
    } else {
        pointableString += "<div>No pointables</div>";
    }
    //pointableOutput.innerHTML = pointableString;

    // Display Gesture object data
    //var gestureOutput = document.getElementById("gestureData");
    var gestureString = "";
    if (frame.gestures.length > 0) {
        if (pauseOnGesture) {
            togglePause();
        }
        for (var i = 0; i < frame.gestures.length; i++) {
            var gesture = frame.gestures[i];
            gestureString += "Gesture ID: " + gesture.id + ", " +
                "type: " + gesture.type + ", " +
                "state: " + gesture.state + ", " +
                "hand IDs: " + gesture.handIds.join(", ") + ", " +
                "pointable IDs: " + gesture.pointableIds.join(", ") + ", " +
                "duration: " + gesture.duration + " &micro;s, ";

            switch (gesture.type) {
                case "circle":
                    gestureString += "center: " + vectorToString(gesture.center) + " mm, " +
                        "normal: " + vectorToString(gesture.normal, 2) + ", " +
                        "radius: " + gesture.radius.toFixed(1) + " mm, " +
                        "progress: " + gesture.progress.toFixed(2) + " rotations";
                    break;
                case "swipe":
                    gestureString += "start position: " + vectorToString(gesture.startPosition) + " mm, " +
                        "current position: " + vectorToString(gesture.position) + " mm, " +
                        "direction: " + vectorToString(gesture.direction, 1) + ", " +
                        "speed: " + gesture.speed.toFixed(1) + " mm/s";
                    break;
                case "screenTap":
                case "keyTap":
                    gestureString += "position: " + vectorToString(gesture.position) + " mm";
                    break;
                default:
                    gestureString += "unkown gesture type";
            }
            gestureString += "<br />";
        }
    } else {
        gestureString += "No gestures";
    }
    //gestureOutput.innerHTML = gestureString;

    if (rightHandChanged) {
        if (rightHandStatus.equals([true, false, false, false, false])) {
            if (beat1.paused)
                beat1.play();
            else
                beat1.pause();
        }
        /* else if (rightHandStatus.equals([false, true, true, false, false])) {
				  		if (beat2.paused)
							beat2.play();
						else
							beat2.pause();
				  	}
				  	else if (rightHandStatus.equals([true, true, true, false, false])) {
				  		if (beat3.paused)
							beat3.play();
						else
							beat3.pause();
				  	}
				  	else if (rightHandStatus.equals([false, true, true, true, true])) {
				  		if (beat4.paused)
							beat4.play();
						else
							beat4.pause();
				  	}
				  	else if (rightHandStatus.equals([true, true, true, true, true])) {
				  		if (beat5.paused)
							beat5.play();
						else
							beat5.pause();
				  	} */
    }

    // Store frame for motion functions
    previousFrame = frame;
});

function vectorToString(vector, digits) {
    if (typeof digits === "undefined") {
        digits = 1;
    }
    return "(" + vector[0].toFixed(digits) + ", " +
        vector[1].toFixed(digits) + ", " +
        vector[2].toFixed(digits) + ")";
}

function togglePause() {
    paused = !paused;
}

function pauseForGestures() {
    if (document.getElementById("pauseOnGesture").checked) {
        pauseOnGesture = true;
    } else {
        pauseOnGesture = false;
    }
}

function getPeaks(data) {

  // What we're going to do here, is to divide up our audio into parts.

  // We will then identify, for each part, what the loudest sample is in that
  // part.

  // It's implied that that sample would represent the most likely 'beat'
  // within that part.

  // Each part is 0.5 seconds long - or 22,050 samples.

  // This will give us 60 'beats' - we will only take the loudest half of
  // those.

  // This will allow us to ignore breaks, and allow us to address tracks with
  // a BPM below 120.

  var partSize = 22050,
      parts = data[0].length / partSize,
      peaks = [];

  for (var i = 0; i < parts; i++) {
    var max = 0;
    for (var j = i * partSize; j < (i + 1) * partSize; j++) {
      var volume = Math.max(Math.abs(data[0][j]), Math.abs(data[1][j]));
      if (!max || (volume > max.volume)) {
        max = {
          position: j,
          volume: volume
        };
      }
    }
    peaks.push(max);
  }

  // We then sort the peaks according to volume...

  peaks.sort(function(a, b) {
    return b.volume - a.volume;
  });

  // ...take the loundest half of those...

  peaks = peaks.splice(0, peaks.length * 0.5);

  // ...and re-sort it back based on position.

  peaks.sort(function(a, b) {
    return a.position - b.position;
  });

  return peaks;
}

function getIntervals(peaks) {

  var groups = [];

  peaks.forEach(function(peak, index) {
    for (var i = 1; (index + i) < peaks.length && i < 3; i++) {
      var group = {
        tempo: (60 * 44100) / (peaks[index + i].position - peak.position),
        count: 1,
        firstbeat: peak.position
      };

      while (group.tempo < 90) {
        group.tempo *= 2;
      }

      while (group.tempo > 180) {
        group.tempo /= 2;
      }

      group.tempo = Math.round(group.tempo);

      if (!(groups.some(function(interval) {
        return (interval.tempo === group.tempo ? interval.count++ : 0);
      }))) {
        groups.push(group);
      }
    }
  });
  return groups;
}

function get_bpm(url, audio, no) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {

        // Create offline context
        var OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        var offlineContext = new OfflineContext(2, audio.duration * 44100, 44100);

        offlineContext.decodeAudioData(request.response, function(buffer) {

          // Create buffer source
          var source = offlineContext.createBufferSource();
          source.buffer = buffer;

          // Beats, or kicks, generally occur around the 100 to 150 hz range.
          // Below this is often the bassline.  So let's focus just on that.

          // First a lowpass to remove most of the song.

          var lowpass = offlineContext.createBiquadFilter();
          lowpass.type = "lowpass";
          lowpass.frequency.value = 250;
          lowpass.Q.value = 1;

          // Run the output of the source through the low pass.

          source.connect(lowpass);

          // Now a highpass to remove the bassline.

          var highpass = offlineContext.createBiquadFilter();
          highpass.type = "highpass";
          highpass.frequency.value = 100;
          highpass.Q.value = 1;

          // Run the output of the lowpass through the highpass.

          lowpass.connect(highpass);

          // Run the output of the highpass through our offline context.

          highpass.connect(offlineContext.destination);

          // Start the source, and render the output into the offline conext.

          source.start(0);
          offlineContext.startRendering();
        });

        offlineContext.oncomplete = function(e) {
          var buffer = e.renderedBuffer;
          var peaks = getPeaks([buffer.getChannelData(0), buffer.getChannelData(1)]);
          var groups = getIntervals(peaks);

          var top = groups.sort(function(intA, intB) {
            return intB.count - intA.count;
          }).splice(0, 5);

          if (no == 1) {
	          tempo1 = top[0];
	          document.getElementById("statustext1").innerHTML += '...Finished analyzing. ' + Math.round(tempo1.tempo) + ' BPM.<br/>';
	          document.getElementById("statustext2").innerHTML += 'Analyzing...<br/>';
	          get_bpm(inputURL2, audio2, 2);
	      }
	      else {
	      	  tempo2 = top[0];
	      	  document.getElementById("statustext2").innerHTML += '...Finished analyzing. ' + Math.round(tempo2.tempo) + ' BPM.<br/>';
	      	  syncaudios();
	      	  audio1.play();
			  audio2.play();
		  }
        };
    };
    request.send();
}

function syncaudios() {
	if (tempo1 != tempo2) {
		document.getElementById("statustext1").innerHTML += 'BPM difference detected. Main track remains speed.<br/>';
		document.getElementById("statustext2").innerHTML += 'BPM difference detected. Adjust playback rate to ' + Math.round(tempo1.tempo/tempo2.tempo * 1000) / 1000 + 'x <br/>';
		audio2.playbackRate = tempo1.tempo/tempo2.tempo;
	}
}

function syncbeats() {
	delay1 = 0;
	delay2 = 0;
	if (tempo1.firstbeat > tempo2.firstbeat) {
		var interval = 60 * 44100 / tempo1.tempo;
		document.getElementById("statustext1").innerHTML += 'Beats mis-match detected. Main track remains beats.<br/>';
		document.getElementById("statustext2").innerHTML += 'Beats mis-match detected. Delay for ' + Math.round((tempo1.firstbeat - tempo2.firstbeat) % interval / 44100 * 1000) / 1000 + 's<br/>';
		delay2 = (tempo1.firstbeat - tempo2.firstbeat) % interval / 44100 * 1000;
	} else if (tempo1.firstbeat < tempo2.firstbeat) {
		var interval = 60 * 44100 / tempo1.tempo;
		document.getElementById("statustext1").innerHTML += 'Beats mis-match detected. Delay for ' + Math.round((tempo2.firstbeat - tempo1.firstbeat) % interval / 44100 * 1000) / 1000 + 's<br/>';
		document.getElementById("statustext2").innerHTML += 'Beats mis-match detected. Secondary track remains beats.<br/>';
		delay1 = (tempo2.firstbeat - tempo1.firstbeat) % interval / 44100 * 1000;
	}
	audio1.pause();
	audio2.pause();
	setTimeout(function(){audio1.play();}, delay1);
	setTimeout(function(){audio2.play();}, delay2);
}
