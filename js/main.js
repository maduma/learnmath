var views = [ 'auth', 'menu', 'conf', 'play', 'report'];
var currentView = 'auth';
var uid = '';
var uids = [];
var works = {
	'add' : ['1:5', '6:10', '11:15', '1:20'],
	'sub' : ['1:5', '6:10', '11:15', '1:20'],
	'mul' : ['1:5', '6', '7', '8', '9', '10']
};
var op = '';
var range = '';
var countdown = 300;
var countdownId = 0;
var correct = 0;
var total = 0;
var solution = '';
var answer = '';
var inGame = false;

function changeView(view) {
	views.forEach(function(e, i, a) { if (e !== view) { $('div#' + e).hide(); } });
	$('div#' + view).fadeIn();
	currentView = view;
	console.log("changeView: " + view);
}

function ctrlCommon() {
	$('span#home').click(function(){ changeView('menu'); });
}

function ctrlAuth() {
	$('div#auth li').each(function(i) {
		uids.push($(this).attr('id'));
		$(this).click(function(){
			uid = $(this).attr('id');
			$('span#uid').html('Bonjour ' + uid);
			changeView('conf');
		});
	});
	console.log("Uids: " + uids);
}

function ctrlMenu() {
	$('div#menu li').each(function(i) {
		var v = $(this).attr('id');
		$(this).click(function(){
			changeView(v);
		});
	});
}

function updateRange() {
	op = $('div#conf select#op').val();
	var elem = $('div#conf select#range');
	elem.empty();
	var choices = works[op];
	choices.forEach(function(e, i, a) {
		elem.append('<option value="' + e + '">' + e + '</option>');
	});
	elem.show();
	console.log('Op: ' + op);
	console.log('Choices: ' + choices);
}

function ctrlConf() {
	updateRange();
	$('div#conf select#op').change(function(){ updateRange(); });
	$('button#play').click(function(){ changeView('play'); });
}

function countdownStep() {
	countdown = countdown - 1;
	$('div#timer').html(countdown);
	if (countdown == 0) { 
		stopExercice();
	}
}

function startExercice() {
	console.log('Start');
	$('button#start').unbind('click');
	$('button#start').click(stopExercice);
	$('button#start').html('Stop');
	countdownId = setInterval(countdownStep, 1000);
	nextQuestion();
	inGame = true;
}

function stopExercice() {
	console.log('Stop');
	$('button#start').unbind('click');
	clearInterval(countdownId);
	$('button#start').click(startExercice);
	$('button#start').html('Start');
	inGame = false;
}

function ctrlPlay() {
	$('div#timer').html(countdown);
	$('button#start').click(startExercice);
}

function nextQuestion(result) {
	console.log('result: ' + result);
	if (result == 'correct') {
		correct = correct + 1;
		if (correct == 3) {
			stopExercice();
			changeView('report');
		}
	}
	$('span#question').html('1232 + 12');
	$('span#answer').html('?');
    solution = 1244 + '';
	answer = '';
}

function proceedAnswer(result) {
	console.log("answer: " + result);
	inGame = false;
    $('span#answer').fadeOut(function() {
		$(this).html(result);
		$(this).fadeIn(function() {
			inGame = true;
			nextQuestion(result);
		});
	});	
}

function ctrlNumpad() {
	$('div#numpad button').click(function() {
			if (!inGame) { return; }
			digit = $(this).attr('id').substring(2);
			answer = answer + digit;
			$('span#answer').html(answer);
			if (solution == answer) { 
				proceedAnswer('correct');
			}
			if (solution.search(answer) == 0) {
				return;
			} else {
				proceedAnswer('wrong');
			}
	});
}

/*
 * Main
 */

$( document ).ready(function() {
	console.log("Document Ready.");
	//views.forEach(function(e, i, a) { setTimeout( function() { changeView(e); }, 2000 * (i + 1)); });

	/*
	 * controllers
	 */
	ctrlCommon();
	ctrlAuth();
	ctrlMenu();
	ctrlConf();
	ctrlPlay();
    ctrlNumpad();

	/*
	 * Authenticate User
	 */
	changeView('auth');
});
