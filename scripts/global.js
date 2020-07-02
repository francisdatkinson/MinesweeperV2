//BUGS

// on win, unrevealed tiles which are revealed do not show adjacency count


function baseColour() {
	var output = [random(255), random(255), random(255)];
	var total = output[0] + output[1] + output[2];
	if (total > 500) {
		return baseColour();
	}
	else {
		return output[0] + "," + output[1] + "," + output[2];
	}
}
var baseColour = baseColour();
var boxCount = 150;
var mineCount = Math.floor(boxCount*0.16);
// var mineCount = 5;	
var first = true;
var flags = mineCount;
var elapsed = 0;
var flagDigits = flags.toString().split("");
var red = "rgb(244,121,80)";
var green = "rgb(80,244,151)";
var maxClock = false;
var fieldsCleared;
var test = 0;

$(document).ready(function() {
	init();
});

function random(max) {
	return Math.floor((Math.random() * max));
}
function getLastDigit(number) {
	return number.toString().split('').pop();
}

function colour(base) {
	var tolerance = 50;
	if (base == null) {
		return colour(baseColour);
	}
	else {
		rgb = base.replace(/[^\d,]/g, '').split(','); // this works
		primary = rgb[0];
		for (var i = 0; i < rgb.length; i++) {
			if (rgb[i] > primary) {
				primary = rgb[i];
			}
		}
		rgb[rgb.indexOf(primary)] = (rgb[rgb.indexOf(primary)] - (-tolerance/2)) - random(tolerance);
		return rgb;
	}
}

function layMines() {
	$(".box").removeClass("mine");
	var mines = [];
	for (var i = 0; i < mineCount; i++) {
		var test = random(boxCount + 1);
		if (mines.indexOf(test) > -1) {
			i--;
		}
		else {
			mines.push(test);
			$("#box" + test).addClass("mine");
		}
	}
}

function getColour(target) {
	rgb = target.css("background-color").replace(/[^\d,]/g, '').split(',');
	return rgb;
}
function init() {
	var grid = $(".grid");
	var box = "";

	grid.empty();
	footerSetup();

	for (var i = 1; i <= boxCount; i++) {
		box = "<div class='box' id='box" + i + "'><p class='adjacent'></p></div>";
		grid.append(box);
		var rgb = colour();
		$("#box" + i).css("background-color", "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")");
	}
	var box1 = $("#box1");
	var base = box1.css("background-color");


	$(".wrapper, .winner, .settings, .settingsHead, .footer").css("border-color", base);
	$("body, .wrapper, .settingsButton").css("background-color", "rgba(" + getColour(box1)[0] + "," + getColour(box1)[1] + "," + getColour(box1)[2] + ", 0.5)");
	$(".winner").css("background-color", "rgba(" + getColour(box1)[0] + "," + getColour(box1)[1] + "," + getColour(box1)[2] + ", 0.7)");
	$("hr, .settingsBody span, .setButton").css("background-color", base);
	$(".box").css("height", $(".box").width());
	$(".winner").css("top", (($(".footer").offset().top / 2) - 45) + "px");
	layMines();

	for (var i = 1; i <= 4; i++) {
		var rgb = colour();
		$(".diff" + i).css("background-color", "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")");
	}

	$(".box").click(function(e) {
		if (first == true) {
			startClock();
			first = false;
		}
		else {
			// do nothing
		}
		if (!$(this).hasClass("flagged")) {
			adjacency($(this));
		}
		console.log(flags);
	});
	$(".box").hover(function() {
		$(this).css("opacity", "0.5");
	}, function() {
		$(this).css("opacity", 1);
	});

	$(".box").contextmenu(function(e) {
		e.preventDefault();
		if ($(this).hasClass("flagged")) {
			$(this).removeClass("flagged");
			flags++;
		}
		else if (flags > 0 && !$(this).hasClass("checked")) {
			$(this).addClass("flagged");
			flags--;
			checkWin();
		}
		else {
			flash($(this), red);
		}
		flagDigits = flags.toString().split("");
		if (flagDigits.length < 2) {
			zero($("#flagNumOne"));
			setNumber($("#flagNumTwo"), flagDigits[0]);
		}
		else {
			setNumber($("#flagNumOne"), flagDigits[0]);
			setNumber($("#flagNumTwo"), flagDigits[1]);
		}
	});



	// settings pane

	$(".settings").css("height", $(".wrapper").css("height"));


	$(".settingsButton").hover(function() {
		$(this).toggleClass("down");
	});

	$(".settingsButton").click(function() {
		$(".settings").slideToggle();
	});


	// $(".setButton").hover(function() {
	// 	$(this).css("")
	// });
}

function flash(box, colour) {
	var original = box.css("background-color");
	setTimeout(function() {
		box.css("background-color", colour);
	}, 0);
	setTimeout(function() {
		box.css("background-color", original);
	}, 300);
}

$(document).ready(function() {
	$("#reset").click(function() {
		setTimeout(function() {
			$(".box").css("opacity", "0");
		}, 0);
		setTimeout(function() {
			location.reload();
		}, 200);		
	});
});
function adjacency(box) {
	var thisBox = box.attr("id").split("box");
	var thisBox = parseInt(thisBox[1]);
	var adjacent = 0;
	var almostValid = [];
	var validBoxes = [];
	var soNearlyValid = [];
	var adjacentCol = ["248,255,173", "255,239,173", "255,205,173", "255,174,173", "254,133,134", "255,98,99", "255,63,64", "255,16,18"];

	var prelimValid = [thisBox - 11, thisBox - 10, thisBox - 9, thisBox - 1, thisBox - -1, thisBox - -9, thisBox - -10, thisBox - -11];


	for (var i = 0; i < prelimValid.length; i++) { // out of map glitch
		if (prelimValid[i] > 0 && prelimValid[i] <= boxCount) {
			almostValid.push(prelimValid[i]);
		}
	}
	if (getLastDigit(thisBox) == 1) { // marco polo glitch for 1s
		for (var i = 0; i < almostValid.length; i++) { 
			if (getLastDigit(almostValid[i]) !== "0") {
				soNearlyValid.push(almostValid[i]);
			}
		}
	}
	else if (getLastDigit(thisBox) == 0) { // marco polo glitch for 0s
		for (var i = 0; i < almostValid.length; i++) { 
			if (getLastDigit(almostValid[i]) !== "1") {
				soNearlyValid.push(almostValid[i]);
			}
		}
	}
	else {
		for (var i = 0; i < almostValid.length; i++) {
			soNearlyValid.push(almostValid[i]);
		}	
	}


	for (var i = 0; i < soNearlyValid.length; i++) { // stack overflow error
		if ($("#box" + soNearlyValid[i]).hasClass("checked")) {
			// do nothing
		}
		else {
			validBoxes.push(soNearlyValid[i]);
		}
	}

	for (var i = 0; i < validBoxes.length; i++) { // calculate adjacency
		if ($("#box" + validBoxes[i]).attr("class").indexOf("mine") > -1) {
			adjacent++;
		}
	}
	box.addClass("checked");
	$(".checked").css("background-color", $(".wrapper").css("background-color"));
	

	if (box.hasClass("flagged")) { // case flagged
		flash(box, red);
	}
	else if (box.hasClass("mine")) { // case mine
		stopClock();
		setTimeout(function() {
			$(".box, .mine").css("opacity", "0");
		}, 0);
		setTimeout(function() {
			$(".mine").addClass("exploded");
			$(".box").animate({opacity: "1"}, 2000);
		}, 500);
		$(".box").off("click");
	}
	else if (adjacent == 0) { // case recursive
		// box.find("p").hide();
		for (var i = 0; i < validBoxes.length; i++) {
			adjacency($("#box" + validBoxes[i]));
			checkWin();
		}
	}
	else { // case has 1+ adjacent
		// box.css("background-color", "rgba(" + adjacentCol[adjacent] + ",1)"); different colours for different adjacencies
		box.find($(".adjacent")).text(adjacent);
		checkWin();
	}
	
	
}
function stopClock() {
	finalTime = elapsed + 70;
	$(".clock, .clock2").toggle();

	finalTime = finalTime.toString().split("");

	console.log(finalTime);

	setNumber($(".clock2 #numFive"), finalTime[finalTime.length - 1]);
	setNumber($(".clock2 #numFour"), finalTime[finalTime.length - 2]);
	setNumber($(".clock2 #numThree"), finalTime[finalTime.length - 3]);
	setNumber($(".clock2 #numTwo"), finalTime[finalTime.length - 4]);
	setNumber($(".clock2 #numOne"), finalTime[finalTime.length - 5]);

	blink($(".clock2"), 0.5);
}
function checkWin() {
	if ($(".mine").filter(".flagged").length == mineCount) { // case win
		stopClock();

		console.log("winner winner");
		$(".checked").css("background-color", $(".wrapper").css("background-color"));
		$(".box").off("click");
		flash($(".box"), green);


		console.log(finalTime);
		$(".winner").show();
		blink($(".winner"), 0);
		fieldsCleared++;
	}
}

function blink(element, opacity) {
	var original = $(".wrapper").css("background-color");

	setTimeout(function() {
		element.css("opacity", opacity);
	}, 0);
	setTimeout(function() {
		element.css("opacity", "1");
	}, 500);

	setInterval(function() {
		setTimeout(function() {
			element.css("opacity", opacity);
		}, 0);
		setTimeout(function() {
			element.css("opacity", "1");
		}, 500);
	}, 1000);
}

function footerSetup() {
	$(".numbers").empty();
	$(".letter").empty();
	var number = "";
	var reset = "";
	var letter = "";
	var r = $(".letterR");
	var e = $(".letterE");
	var s = $(".letterS");
	var t = $(".letterT");
	var f = $(".letterF");
	var l = $(".letterL");
	var a = $(".letterA");
	var g = $(".letterG");
	var p = $(".letterP");
	var n = $(".letterN");

	for (var i = 1; i < 21; i++) {
		letter += "<div class='pixel' id='pixel" + i + "'></div>";
	}

	for (var i = 1; i < 16; i++) {
		number += "<div class='smallBox' id='smallBox" + i + "'></div>";
	}

	$(".letter").append(letter);
	$(".numbers").append(number);
	zero($("#numOne, #numTwo, #numThree, #numFour, #numFive"));


	if (flagDigits.length < 2) {
		zero($("#flagNumOne"));
		setNumber($("#flagNumTwo"), flagDigits[0]);
	}
	else {
		setNumber($("#flagNumOne"), flagDigits[0]);
		setNumber($("#flagNumTwo"), flagDigits[1]);
	}

	makeR(r);
	makeE(e);
	makeS(s);
	makeT(t);
	makeF(f);
	makeL(l);
	makeA(a);
	makeG(g);
	makeP(p);
	makeN(n);
}

function setNumber(number, digit) {
	if (digit == "0") {
		zero(number);
	}
	else if (digit == "1") {
		one(number);
	}
	else if (digit == "2") {
		two(number);
	}
	else if (digit == "3") {
		three(number);
	}
	else if (digit == "4") {
		four(number);
	}
	else if (digit == "5") {
		five(number);
	}
	else if (digit == "6") {
		six(number);
	}
	else if (digit == "7") {
		seven(number);
	}
	else if (digit == "8") {
		eight(number);
	}
	else if (digit == "9") {
		nine(number);
	}
	else {
		zero(number);
	}


}

function makeR(letter) {
	spellMe(letter.find($("#pixel1, #pixel2, #pixel3, #pixel4, #pixel5, #pixel9, #pixel13, #pixel17")));
}
function makeE(letter) {
	spellMe(letter.find($("#pixel1, #pixel2, #pixel3, #pixel4, #pixel5, #pixel9, #pixel10, #pixel11, #pixel12, #pixel8, #pixel13, #pixel17, #pixel18, #pixel19, #pixel20")));
}
function makeS(letter) {
	spellMe(letter.find($("#pixel1, #pixel2, #pixel3, #pixel4, #pixel5, #pixel9, #pixel10, #pixel11, #pixel12, #pixel16, #pixel17, #pixel18, #pixel19, #pixel20")));
}
function makeT(letter) {
	spellMe(letter.find($("#pixel1, #pixel5, #pixel9, #pixel10, #pixel11, #pixel12, #pixel13, #pixel17, #pixel18, #pixel19, #pixel20")));
}
function makeF(letter) {
	spellMe(letter.find($("#pixel1, #pixel2, #pixel3, #pixel4, #pixel5, #pixel9, #pixel10, #pixel11, #pixel12, #pixel13, #pixel17, #pixel21")));
}
function makeL(letter) {
	spellMe(letter.find($("#pixel1, #pixel5, #pixel9, #pixel13, #pixel17, #pixel18, #pixel19, #pixel20")));
}
function makeA(letter) {
	spellMe(letter.find($("#pixel1, #pixel2, #pixel3, #pixel8, #pixel9, #pixel10, #pixel11, #pixel12, #pixel13, #pixel16, #pixel17, #pixel18, #pixel19, #pixel20, #pixel21")));
}
function makeG(letter) {
	spellMe(letter.find($("#pixel1, #pixel2, #pixel3, #pixel4, #pixel5, #pixel9, #pixel11, #pixel12, #pixel13, #pixel16, #pixel17, #pixel18, #pixel19, #pixel20")));
}
// function makeI(letter) {
// 	spellMe(letter.find($("#pixel1, #pixel2, #pixel3, #pixel4, #pixel7, #pixel11, #pixel15, #pixel17, #pixel18, #pixel20, #pixel19")));
// }
function makeN(letter) {
	spellMe(letter.find($("#pixel1, #pixel4, #pixel5, #pixel8, #pixel9, #pixel12, #pixel13, #pixel16, #pixel17, #pixel21, #pixel20, #pixel21, #pixel6, #pixel11")));
}
function makeP(letter) {
	spellMe(letter.find($("#pixel1, #pixel2, #pixel3, #pixel4, #pixel5, #pixel8, #pixel9, #pixel10, #pixel11, #pixel12, #pixel13, #pixel17")));
}


function zero(number) {
	switchMe(number, number.find($("#smallBox1, #smallBox2, #smallBox3, #smallBox4, #smallBox6, #smallBox7, #smallBox9, #smallBox10, #smallBox12, #smallBox13, #smallBox14, #smallBox15")));
}
function one(number) {
	switchMe(number, number.find($("#smallBox1, #smallBox2, #smallBox5, #smallBox8, #smallBox11, #smallBox13, #smallBox14, #smallBox15")));
}
function two(number) {
	switchMe(number, number.find($("#smallBox1, #smallBox2, #smallBox3, #smallBox6, #smallBox7, #smallBox8, #smallBox9, #smallBox10, #smallBox13, #smallBox14, #smallBox15")));
}
function three(number) {
	switchMe(number, number.find($("#smallBox1, #smallBox2, #smallBox3, #smallBox6, #smallBox7, #smallBox8, #smallBox9, #smallBox12, #smallBox13, #smallBox14, #smallBox15")));
}
function four(number) {
	switchMe(number, number.find($("#smallBox5, #smallBox3, #smallBox6, #smallBox9, #smallBox7, #smallBox10, #smallBox11, #smallBox12, #smallBox15")));
}
function five(number) {
	switchMe(number, number.find($("#smallBox1, #smallBox2, #smallBox3, #smallBox4, #smallBox7, #smallBox8, #smallBox9, #smallBox12, #smallBox13, #smallBox14, #smallBox15")));
}
function six(number) {
	switchMe(number, number.find($("#smallBox1, #smallBox2, #smallBox3, #smallBox4, #smallBox7, #smallBox8, #smallBox9, #smallBox10, #smallBox12, #smallBox13, #smallBox14, #smallBox15")));
}
function seven(number) {
	switchMe(number, number.find($("#smallBox1, #smallBox2, #smallBox3, #smallBox6, #smallBox8, #smallBox11, #smallBox14")));
}
function eight(number) {
	switchMe(number, number.find($("#smallBox1, #smallBox2, #smallBox3, #smallBox4, #smallBox6, #smallBox7, #smallBox8, #smallBox9, #smallBox10, #smallBox12, #smallBox13, #smallBox14, #smallBox15")));
}
function nine(number) {
	switchMe(number, number.find($("#smallBox1, #smallBox2, #smallBox3, #smallBox4, #smallBox6, #smallBox7, #smallBox8, #smallBox9, #smallBox12, #smallBox13, #smallBox14, #smallBox15")));
}


function spellMe(pixels) {
	pixels.css("background-color", "rgb(" + baseColour + ")");
	$(".decimal").css("background-color", "rgb(" + baseColour + ")");
}

function switchMe(number, smallBoxes) {
	$(number.find(".smallBox")).css("background-color", "transparent");
	smallBoxes.css("background-color", "rgb(" + baseColour + ")");
}
function increment(scale, number) {
	setTimeout(function() {
		one(number);
	}, 10*scale);
	setTimeout(function() {
		two(number);
	}, 20*scale);
	setTimeout(function() {
		three(number);
	}, 30*scale);
	setTimeout(function() {
		four(number);
	}, 40*scale);
	setTimeout(function() {
		five(number);
	}, 50*scale);
	setTimeout(function() {
		six(number);
	}, 60*scale);
	setTimeout(function() {
		seven(number);
	}, 70*scale);
	setTimeout(function() {
		eight(number);
	}, 80*scale);
	setTimeout(function() {
		nine(number);
	}, 90*scale);
	setTimeout(function() {
		zero(number);
	}, 100*scale);


	setInterval(function() {
		setTimeout(function() {
			one(number);
		}, 10*scale);
		setTimeout(function() {
			two(number);
		}, 20*scale);
		setTimeout(function() {
			three(number);
		}, 30*scale);
		setTimeout(function() {
			four(number);
		}, 40*scale);
		setTimeout(function() {
			five(number);
		}, 50*scale);
		setTimeout(function() {
			six(number);
		}, 60*scale);
		setTimeout(function() {
			seven(number);
		}, 70*scale);
		setTimeout(function() {
			eight(number);
		}, 80*scale);
		setTimeout(function() {
			nine(number);
		}, 90*scale);
		setTimeout(function() {
			zero(number);
		}, 100*scale);
	}, 100*scale);
}

function startClock() {

	setTimeout(function() {
		elapsed++;
		// console.log(elapsed);
	}, 10);
	setInterval(function() {
		setTimeout(function() {
			elapsed++;
		}, 10);
		// console.log(elapsed);
	}, 10);

	var units = $(".clock #numThree");
	var tens = $(".clock #numTwo");
	var hundreds = $(".clock #numOne");
	var tenths = $(".clock #numFour");
	var hundredths = $(".clock #numFive");

	increment(1,hundredths);
	increment(10,tenths);
	increment(100,units);
	increment(1000,tens);
	increment(10000,hundreds);
}

function winner() {
	setTimeout(function() {
		$(".winner").fadeIn(500);
	}, 0);
	setTimeout(function() {
		$(".winner").fadeOut(500);
	}, 500);
	setInterval(function() {
		setTimeout(function() {
			$(".winner").fadeIn(500);
		}, 0);
		setTimeout(function() {
			$(".winner").fadeOut(500);
		}, 500);
	}, 1000);
}

$(document).ready(function() {
	$(".date").text(new Date().getFullYear());
});