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
var exeTime = 20;
var defaultProba = 1000;
var bet = false;
var lsTag = 'learnmath:'
var wallet = 0.0;
var minMoney = 2;
var isLoaded = false;
var texe = 0;
var resLimit = 5;
var perLimit = 90;
var gain = 0;

/*
 * Binding
 */

function bindAuth() {
  if (uid) { 
    $('input#' + uid).prop('checked', true).checkboxradio( "refresh" );
  }
  $('input.auth').click( function(event) {
    uid = $(this).val();
    localStorage.setItem(lsTag + 'uid', uid); 
    console.log('uid:', uid);
    $.mobile.changePage('#home', { transition: 'fade'});
  });
}

function bindConfOp() {
  $('input.confOp').click( function(event) {
    op = $(this).val();
    console.log('op:', op);
    $.mobile.changePage('#addExe', { transition: 'fade'});
  });
}

function bindAddExe() {
  $('input.addExe').click( function(event) {
    var range = $(this).val().split(':');
    console.log('addExe:', range);
    exe = new AddExercise(parseInt(range[0]), parseInt(range[1]) + 1);
    $.mobile.changePage('#play', { transition: 'fade'});
  });
}

function bindPlay() {
  $('input#bet').click( function(event) {
    bet = $(this).prop('checked');
    if (bet && wallet < minMoney) {
      bet = false;
      $('input#bet').prop('checked', bet).checkboxradio('refresh');
      $.mobile.changePage('#noEnouthMoney', { role: "dialog" });
    }
    console.log(bet);
  });
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
  this.current;
  this.load();
}

AddExercise.prototype.load = function() {
  for (var i in this.allQ) {
    var correct = localStorage.getItem(lsTag + uid + ':' + this.allQ[i].question + '_correct');
    if (correct) {
      this.allQ[i].correct = parseInt(correct);
    }
    var wrong = localStorage.getItem(lsTag + uid + ':' + this.allQ[i].question + '_wrong');
    if (wrong) {
      this.allQ[i].wrong = parseInt(wrong);
    }    
  }
}

AddExercise.prototype.save = function() {
  for (var i in this.allQ) {
    localStorage.setItem(lsTag + uid + ':' + this.allQ[i].question + '_correct', this.allQ[i].correct);
    localStorage.setItem(lsTag + uid + ':' + this.allQ[i].question + '_wrong', this.allQ[i].wrong);
  }
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
      if (!this.current || this.current.question != this.allQ[i].question) {
        this.current = this.allQ[i]
        return this.current;
      }
      console.log('same question. passing');
      this.nextQuestion();
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
      $('span#answer').delay(500).fadeOut(function() {
        that.handler('correct');
      }).fadeIn(100);
    }
    if (that.solution.search(that.answer) == 0) {
      return;
    } else {
      that.enabled = false;
      that.exe.wrong++;
      $('span#answer').
        fadeOut(function() { $(this).html(that.solution).css('color', 'red'); }).
        fadeIn().delay(500).fadeOut(function() { $(this).css('color', 'black'); that.handler('wrong'); }).
        fadeIn(100);
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

// Global functions

function loadLocalStorage() {
  if (isLoaded) { return; }
  isLoaded = true;
  uid = localStorage.getItem(lsTag + 'uid');
  wallet = parseFloat(localStorage.getItem(lsTag + 'wallet'));
  if (!wallet) { wallet = 0.0; }
  texe = parseInt(localStorage.getItem(lsTag + 'texe'));
  if (!texe) { texe = 0; }
  console.log("load uid", uid);
}

function startGame() {
  console.log("game started");
  numpad.enabled = true;
  score('start');
  $('#homeBt').addClass('ui-disabled');
  $('#backBt').addClass('ui-disabled');
  $('#bet').checkboxradio('disable');
}

function stopGame(status) {
  gain = 0;
  console.log("game stoped:", status);
  numpad.enabled = false;
  $('#homeBt').removeClass('ui-disabled');
  $('#backBt').removeClass('ui-disabled');
  $('#bet').checkboxradio('enable');
  exe.save();
  if (status == "end") {
    if (correct + wrong < resLimit) {
      $.mobile.changePage('#noEnouthRes', { role: "dialog" });
      return;
    }
    texe++;
    var percent = 100;
    if (correct + wrong !=0 ) { percent = Math.round(correct / (correct + wrong) * 100); }
    if (percent >= perLimit) { 
      wallet = wallet + 0.1;
      gain = 0.1;
      if (percent >= 98) {
        wallet = wallet + 0.1;
        gain = 0.2;
      }
    }
    localStorage.setItem(lsTag + 'wallet', wallet);
    localStorage.setItem(lsTag + 'texe', texe);
    $.mobile.changePage('#home', { transition: 'flip' });
  }
}

function score(status) {
  console.log("score:", status);
  if (status == 'correct') {
    correct++;
  } else if (status == 'wrong') {
    wrong ++;
  } else if (status == 'start') {
    correct = 0;
    wrong = 0;
  }
  $('span#scoreCorrect').html(correct);
  $('span#scoreWrong').html(wrong);
  var percent = 100;
  if (correct + wrong !=0 ) { percent = Math.round(correct / (correct + wrong) * 100); }
  $('span#scorePercent').html(percent);
  var nq = exe.nextQuestion();
  if (countdown.enabled) {
    numpad.setExe(nq);
  }
} 

/* 
 * Main
 */

// Page before show event
$( document ).on('pagebeforeshow', '#home', function(event) {
  console.log('#home pagebeforeshow');
  $('span#uid-home').html(uid);
  $('span#gain-home').html(gain.toFixed(2));
  $('span#wallet-home').html(wallet.toFixed(2));
  $('span#texe-home').html(texe);
  $('span#ttime-home').html(Math.floor(texe * exeTime  / 3600) + 'h' +
    Math.floor(texe * exeTime / 60) + 'min');
  $('span#correct-home').html(correct);
  $('span#wrong-home').html(wrong);
  var percent = 100;
  if (correct + wrong !=0 ) { percent = Math.round(correct / (correct + wrong) * 100); }
  $('span#percent-home').html(percent + '%');
  if (percent < 90) {
    $('span#percent-home').css('color', 'red');
  } else {
    $('span#percent-home').css('color', 'green');
  }
});

// Individual page init (jquery mobile)

$( document ).on('pageinit', '#home', function() {
  loadLocalStorage();
  if (!uid) {
    $.mobile.changePage('#auth');
  }
  console.log('pageinit home');
});

$( document ).on('pageinit', '#auth', function() {
  loadLocalStorage();
  bindAuth();
  console.log('pageinit auth');
});
 
$( document ).on('pageinit', '#confOp', function() {
  loadLocalStorage();
  bindConfOp();
  console.log('pageinit confOp');
  if (!uid) {
    $.mobile.changePage('#auth');
  }
});

$( document ).on('pageinit', '#addExe', function() {
  loadLocalStorage();
  bindAddExe();
  console.log('pageinit addExe');
  if (!uid) {
    $.mobile.changePage('#auth');
  } else if (!op) {
    $.mobile.changePage('#confOp');
  }
});

$( document ).on('pageinit', '#play', function() {
  loadLocalStorage();
  bindPlay();
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
