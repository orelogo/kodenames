/*
Notes:
'data' is lazily imported from the html
'seedrandom' is also imported from html. it gives deterministic random #s based on a seed set in fire()
*/


var wordsSelected = [];
var cells = [];
var NUMBER_OF_WORDS = 25;
var spyMasterMode = false;
var sessionData = [];
var customData = [];

// these are the names of classes that will be applied to cells
// edit these styles in stlyes/styles.css
var RED_TEAM = "red-team";
var BLUE_TEAM = "blue-team";
var NEUTRAL = "neutral";
var BOMB = "bomb";
var GUESSED = "guessed";
var startTeam;

//init
$("#seed").keyup(function() {
	fire();
});

$("#gameMode").change(function() {
	fire();
});


$("#seed").val(Math.floor(Math.random() * 1000));
fire();

function fire() {
	//get seed and set the seed for randomizer
	var seed = document.getElementById("seed").value;
	Math.seedrandom(seed.toLowerCase());

	var option = $('#gameMode :selected').val();
	switch (option) {
		case 'englishUkrainian':
			sessionData = englishUkrainianData.slice(0);
			break;
		case 'spanish':
			sessionData = spanishData.slice(0);
			break;
		case '2knouns':
			sessionData = data.slice(0);
			break;
		case 'movies':
			sessionData = movieData.slice(0);
			break;
		case 'custom':
			if (customData.length === 0) {
				var customWordList = prompt("Please enter custom word list. The list will be saved until your refresh your browser. (The words MUST be delimanted by spaces). eg: cat dog mouse", "Enter words here");
				customData = customWordList.split(' ');
			}
			sessionData = customData.slice(0);
			break;
		default:
			sessionData = defaultData.slice(0);
	}

	wordsSelected = [];
	cells = [];
	spyMasterMode = false;
	document.getElementById("board").innerHTML = "";

	//fire new board
	updateScore();
	createNewGame();
}

//not used, but probably useful at some point
function removeItem(array, index) {
	if (index > -1) {
		// console.log("index: " + index + ", word: " + array[index] + " removed.");
		array.splice(index, 1);
	}
}

function createNewGame() {
	var trs = [];
	for (var i = 0; i < NUMBER_OF_WORDS; i++) {
		if (!trs[i % 5]) {
			trs[i % 5] = "";
		}
		var randomNumber = Math.floor(Math.random() * sessionData.length);
		var word = sessionData[randomNumber];
		removeItem(sessionData, randomNumber);
		wordsSelected.push(word);
		trs[i % 5] += "<div class=\"word\" id=\'" + i + "\' onclick=\"clicked(\'" + i + "\')\"><div><a href=\"#\"><span class=\"ada\"></span>" + word + "</a></div></div>";
	}
	//<a href="#"><span class="ada">Washington stimulates economic growth </span>Read me</a>
	for (var i = 0; i < trs.length; i++) {
		document.getElementById("board").innerHTML += '<div class="row">' + trs[i] + '</div>'
	}

	// create array of word cells
	for (var i = 0; i < 8; i++) {
		cells.push(RED_TEAM);
		cells.push(BLUE_TEAM);
	}

	// one team gets an extra cell
	if (Math.floor(Math.random() * data.length) % 2 === 0) {
		cells.push(RED_TEAM);
		startTeam = RED_TEAM
		$('#score-container').addClass('redStart').removeClass('blueStart');

	} else {
		cells.push(BLUE_TEAM);
		startTeam = BLUE_TEAM
		$('#score-container').addClass('blueStart').removeClass('redStart');
	}

	// add neutrals
	for (var i = 0; i < 7; i++) {
		cells.push(NEUTRAL);
	}

	// push the bomb
	cells.push(BOMB)

	//shuffle cells
	shuffle(cells);

	updateScore();
}

function clicked(value) {
  var elem = $("#" + value);

	if (spyMasterMode) {
		//spymaster mode
    if (elem.hasClass(GUESSED)) {
      elem.removeClass(GUESSED);
    } else {
		  elem.addClass(GUESSED);
    }
	} else {
		//guessers mode
		var word = wordsSelected[value];

    function doStuff() {
      if (elem.data('guessed')) {
        elem.removeClass(cells[value]);
        elem.data('guessed', false);
      } else {
        elem.addClass(cells[value]);
        elem.data('guessed', true);
      }
    }

		if (document.getElementById("confirm").checked) {
			if (window.confirm("Are sure you want to select '" + word + "'?")) {
        doStuff();
			}
		} else {
      doStuff();
		}
	}

	updateScore();
}

function updateScore() {
	var blueScore = 9;
	var redScore = 9;
	if (spyMasterMode) {
		blueScore = 0;
		redScore = 0;
		$('div.word').each(function() {
			if ($(this).hasClass(BLUE_TEAM)) {
				blueScore++;
			}
			if ($(this).hasClass(RED_TEAM)) {
				redScore++;
			}
		});
	} else {
		$('div.word').each(function() {
			if ($(this).hasClass(BLUE_TEAM)) {
				blueScore--;
			}
			if ($(this).hasClass(RED_TEAM)) {
				redScore--;
			}
		});

		if (startTeam == RED_TEAM) {
			blueScore--;
		} else {
			redScore--;
		}
	}
	$('#redScore').text(redScore);
	$('#blueScore').text(blueScore);
	if(redScore === 0){
		$('#redScore').text('Winner!');
	}
	if(blueScore === 0){
		$('#blueScore').text('Winner!');
	}
}

function spyMaster() {
	//TODO: randomize or organize tiles for easier comparing
  var elem;
  if (!spyMasterMode) {
    spyMasterMode = true;
    for (var i = 0; i < NUMBER_OF_WORDS; i++) {
      elem = $("#" + i);
      elem.addClass(cells[i]);
      if (elem.data('guessed')) {
        elem.addClass(GUESSED);
      }
    }
  } else {
    spyMasterMode = false;

    for (var i = 0; i < NUMBER_OF_WORDS; i++) {
      elem = $("#" + i);
      var toRemove = [GUESSED];

      if (!elem.data('guessed')) {
        toRemove.push(cells[i]);
      }

      elem.removeClass(toRemove.join(' '));
    }
  }
}

function shuffle(array) {
	var currentIndex = array.length,
		temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

//enable pressing 'Enter' on seed field
document.getElementById('seed').onkeypress = function(e) {
	if (!e) e = window.event;
	var keyCode = e.keyCode || e.which;
	if (keyCode == '13') {
		// Enter pressed
		fire();
		return false;
	}
}
