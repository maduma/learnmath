var views = [ 'auth', 'menu', 'conf', 'play', 'report'];
var currentView = 'auth';
var uid = '';
var uids = [];
var works = {
  'add' : ['1:5', '1:10', '1:15', '1:20']
}
/*
  'sub' : ['1:5', '6:10', '11:15', '1:20'],
  'mul' : ['1:5', '6', '7', '8', '9', '10']
};
*/
var exercise;
var op = '';
var range = '';
var countdown = 0;
var exTime = 10;
var countdownId = 0;
var correct = 0;
var wrong = 0;
var total = 0;
var solution = '';
var answer = '';
var inGame = false;
var oriStat = 1000;

/*
 * Works
 */
 
function AddExercise(min, max) {
  this.allQ = [];
  for (var i = min; i < max; i++) {
    for (var j = min; j < max; j++) {
      this.allQ.push({
        question: i + ' + ' + j,
        solution: i + j,
        correct: 0,
        wrong: 0
      });
    }
  }
  this.min = min;
  this.max = max;
  this.currentQ;
}

function getProb(q) {
  if (q.correct != 0) {
    return Math.round(oriStat / (q.correct + 1));
  }
  return oriStat;
}

AddExercise.prototype.load = function() {
  for (var q in this.allQ) {
    var correct = localStorage.getItem(uid + ':' + this.allQ[q].question + '_correct');
    if (correct) {
      console.log('load ', this.allQ[q].question, '_correct');
      this.allQ[q].correct = parseInt(correct);
    }
    var wrong = localStorage.getItem(uid + ':' + this.allQ[q].question + '_wrong');
    if (wrong) {
      console.log('load ', this.allQ[q].question, '_wrong');
      this.allQ[q].wrong = parseInt(wrong);
    }
  }
}

AddExercise.prototype.save = function() {
  for (var q in this.allQ) {
    localStorage.setItem(uid + ':' + this.allQ[q].question + '_correct', this.allQ[q].correct);
    localStorage.setItem(uid + ':' + this.allQ[q].question + '_wrong', this.allQ[q].wrong);
  }
}

AddExercise.prototype.nextQuestion = function() {
  var stat = Math.floor(Math.random() * this.totalStat());
  console.log(stat);
  var q = this.find(stat);
  console.log(q);
  this.currentQ = q;
}

AddExercise.prototype.totalStat = function() {
  var totalS = 0;
  for (var q in this.allQ) {
    totalS = totalS + getProb(this.allQ[q]);
  }
  return totalS;
}

AddExercise.prototype.find = function(s) {
  var totalS = 0;  
  for (var q in this.allQ) {
    totalS = totalS + getProb(this.allQ[q]);
    if (totalS > s) {
      return this.allQ[q];
    }
  }
}

AddExercise.prototype.toHtml = function() {
  var index = 0;
  var html = [];
  html.push('<table class="report">');
  html.push('<tr><td>+</td>');
  for (var i = this.min; i < this.max; i++) {
    html.push('<td>' + i + '</td>');
  }
  html.push('</tr>');
  for (var i = this.min; i < this.max; i++) {
    html.push('<tr><td>' + i + '</td>');
    for (var j = this.min; j < this.max; j++) {
      html.push('<td>');
      html.push(this.allQ[index].correct + ':' + this.allQ[index].wrong);
      index++;
      html.push('</td>');
    }
    html.push('</tr>');
  }
  html.push('</table>');
  return html.join('');
}

AddExercise.prototype.toHtmlStat = function() {
  var index = 0;
  var html = [];
  html.push('<table class="reportStat">');
  html.push('<tr><td>+</td>');
  for (var i = this.min; i < this.max; i++) {
    html.push('<td>' + i + '</td>');
  }
  html.push('</tr>');
  for (var i = this.min; i < this.max; i++) {
    html.push('<tr><td>' + i + '</td>');
    for (var j = this.min; j < this.max; j++) {
      html.push('<td>');
      html.push(getProb(this.allQ[index]));
      index++;
      html.push('</td>');
    }
    html.push('</tr>');
  }
  html.push('</table>');
  return html.join('');
}

/*
 * UI
 */

function changeView(view) {
  views.forEach(function(e, i, a) { if (e !== view) { $('div#' + e).hide(); } });
  $('div#' + view).fadeIn();
  currentView = view;
  console.log("changeView: " + view);
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

function countdownStep() {
  countdown = countdown - 1;
  $('div#timer').html(countdown);
  if (countdown == 0) { 
    stopExercice();
    exercise.save();
    $('div#resultTable').html(exercise.toHtml());
    $('div#statTable').html(exercise.toHtmlStat());
    changeView('report');
  }
}

function startExercice() {
  countdown = exTime;
  console.log('Start');
  $('div#timer').html(countdown);
  $('button#start').unbind('click');
  $('button#start').click(stopExercice);
  $('button#start').html('Stop');
  countdownId = setInterval(countdownStep, 1000);
  exercise = new AddExercise(1, 5);
  exercise.load();
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

function nextQuestion(result) {
  console.log('result: ' + result);
  if (result == 'correct') {
    correct++;
    exercise.currentQ.correct++;
  } else if (result == 'wrong') {
    exercise.currentQ.wrong++;
    wrong++;
  }
  exercise.nextQuestion();
  $('span#question').html(exercise.currentQ.question);
  $('span#answer').html('?');
  solution = exercise.currentQ.solution + '';
  answer = '';
}

/*
 * Controllers
 */

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

function ctrlConf() {
  updateRange();
  $('div#conf select#op').change(function(){ updateRange(); });
  $('button#play').click(function(){ changeView('play'); });
}

function ctrlPlay() {
  $('button#start').click(startExercice);
}

function bindNumpad() {
  $('div#numpad button').click(function() {
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
  
  // Bind Ctrls
  ctrlCommon();
  ctrlAuth();
  ctrlMenu();
  ctrlConf();
  ctrlPlay();
  ctrlNumpad();

  // Authenticate User
  changeView('auth');
});
