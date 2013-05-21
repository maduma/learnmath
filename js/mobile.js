/*
 * Global properties
 */

var uid;                 // username
var op;                  // operation (add,sub,...)
var exe;                 // exercise Object
var numpad;              // numpad Object
var countdown;           // countdown Object
var correct = 0;             // score
var wrong = 0;               // score
var exeTime = 300;
var defaultProba = 1000;

/*
 * Binding
 */

function bindAuth() {
  $('input.auth').click( function(event) {
    uid = $(this).val();
    console.log('uid:', uid);
    $.mobile.changePage('#confOp', { transition: 'slidedown'});
  });
}

function bindConfOp() {
  $('input.confOp').click( function(event) {
    op = $(this).val();
    console.log('op:', op);
    $.mobile.changePage('#addExe', { transition: 'slidedown'});
  });
}

function bindAddExe() {
  $('input.addExe').click( function(event) {
    var range = $(this).val().split(':');
    console.log('addExe:', range);
    exe = new AddExercise(parseInt(range[0]), parseInt(range[1]) + 1);
    $.mobile.changePage('#play', { transition: 'slidedown'});
  });
}

function bindPlay() {
}

/*
 * Custom object
 */


// Addition Exercise

function AddExercise(min, max) {
  this.allQ = [];
  for (var i = min; i < max; i++) {
    for (var j = min; j < max; j++) {
      this.allQ.push({
        question: i + ' + ' + j,
        solution: (i + j).toString(),
        correct: 0,
        wrong: 0
      });
    }
  }
  this.min = min;
  this.max = max;
}

AddExercise.prototype.getProba = function(q) {
  if (q.correct != 0) {
    return Math.round(defaultProba / (q.correct + 1));
  }
  return defaultProba;
}

AddExercise.prototype.totalProba = function() {
  var total = 0;
  for (var i in this.allQ) {
    total = total + this.getProba(this.allQ[i]);
  }
  return total; 
}

AddExercise.prototype.nextQuestion = function() {
  var proba = Math.floor(Math.random() * this.totalProba());
  var probaSum = 0;
  for (var i in this.allQ) {
    probaSum = probaSum + this.getProba(this.allQ[i])
    if (probaSum > proba) {
      return this.allQ[i];
    }
  }
}

// Virtual Numeric Keyboard

function Numpad() {
  this.question;
  this.answer = '';
  this.solution;
  this.handler;
  this.enabled = false;
  this.exe;
  
  var that = this;
  $('div#numpad button').click(function() {
    if (!that.enabled) { return; }
    var digit = $(this).attr('id').substring(1);
    that.answer = that.answer + digit;
    $('span#answer').html(that.answer);
    if (that.solution == that.answer) {
      that.enabled = false;
      that.exe.correct++;
      $('span#answer').fadeOut(800, function() {
        that.handler('correct');
      }).fadeIn(200);
    }
    if (that.solution.search(that.answer) == 0) {
      return;
    } else {
      that.enabled = false;
      that.exe.wrong++;
      $('span#answer').
        fadeOut(function() { $('span#answer').html(that.solution); }).
        fadeIn().animate({color: 'red', 'font-size': '150%'}, 700).
        animate({'font-size': '100%'}, 700).
        fadeOut(function() { that.handler('wrong'); }).css('color', 'black').
        fadeIn();
    }
  });
}

Numpad.prototype.setExe = function(exe) {
  this.exe = exe;
  this.question = exe.question;
  this.solution = exe.solution;
  this.answer = '';
  $('span#question').html(this.question);
  $('span#answer').html(this.answer);
  numpad.enabled = true;
}

// Countdown

function Countdown(startTime) {
  this.timerId;
  this.currentTime = startTime;
  this.startTime = startTime;
  this.startHandler;
  this.stopHandler;
  this.clockSelector = 'span#clock';
  this.startSelector = 'button#start';
  this.stopSelector = 'button#stop';
  this.enabled = false;
  
  this.display();
  $(this.startSelector).button('enable');
  $(this.stopSelector).button('disable');

  var that = this;
  $(this.startSelector).click(function() {
    that.start();
  });
  $(this.stopSelector).click(function() {
    that.stop();
  });
}

Countdown.prototype.display = function() {
  var min = Math.floor(this.currentTime / 60);
  min = min < 10 ? '0' + min : min;
  var sec = this.currentTime % 60;
  sec = sec < 10 ? '0' + sec : sec;
  $(this.clockSelector).html(min + ':' + sec);
}

Countdown.prototype.start = function() {
  var that = this;

  $(this.startSelector).button('disable');
  $(this.stopSelector).button('enable');
  this.currentTime = this.startTime;
  this.enabled = true;
  this.timerId = setInterval(function() {
    that.currentTime--;
    that.display();
    if (that.currentTime == 0) {
      that.stop();
    }
  }, 1000);
  if (this.startHandler) { this.startHandler(); }
}

Countdown.prototype.stop = function() {
  console.log('Stop countdown');
  clearInterval(this.timerId);
  this.enabled = false;
  if (this.stopHandler) { 
    if (this.currentTime == 0) {
      this.stopHandler('end');
    } else {
      this.stopHandler('abort');
    }
  }
  this.currentTime = this.startTime;
  this.display();
  $(this.stopSelector).button('disable');
  $(this.startSelector).button('enable');
}

// handler

function startGame() {
  console.log("game started");
  numpad.enabled = true;
  score('start');
}

function stopGame(status) {
  console.log("game stoped:", status);
  numpad.enabled = false;
}

function score(status) {
  console.log("score:", status);
  if (status == 'correct') {
    correct++;
  } else if (status == 'wrong') {
    wrong ++;
  }
  $('span#scoreCorrect').html(correct);
  $('span#scoreWrong').html(wrong);
  $('span#scorePercent').html(Math.floor(correct / (correct + wrong) * 100));
  var nq = exe.nextQuestion();
  console.log("nexQ:", nq);
  if (countdown.enabled) {
    numpad.setExe(nq);
  }
} 

/* 
 * Main
 */

// Individual page init (jquery mobile)
 
$( document ).delegate('#auth', 'pageinit', function() {
  console.log('pageinit auth');
});
 
$( document ).delegate('#confOp', 'pageinit', function() {
  console.log('pageinit confOp');
  if (!uid) {
    $.mobile.changePage('#auth');
  }
});

$( document ).delegate('#addExe', 'pageinit', function() {
  console.log('pageinit addExe');
  if (!uid) {
    $.mobile.changePage('#auth');
  } else if (!op) {
    $.mobile.changePage('#confOp');
  }
});

$( document ).delegate('#play', 'pageinit', function() {
  console.log('pageinit play');
  numpad = new Numpad();
  numpad.handler = score;
  countdown = new Countdown(exeTime);
  countdown.startHandler = startGame;
  countdown.stopHandler = stopGame;

  if (!uid) {
    $.mobile.changePage('#auth');
  } else if (!op) {
    $.mobile.changePage('#confOp');
  } else if (!exe) {
    $.mobile.changePage('#addExe');
  }
});

// main page init

$( document ).ready(function() {
  console.log("Document Ready.");
  bindAuth();
  bindConfOp();
  bindAddExe();
  bindPlay();
});
