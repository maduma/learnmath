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
var exeTime = 180;
var defaultProba = 1000;
var bet = false;
var lsTag = 'learnmath:'
var wallet = 0.0;
var minMoney = 2;
var isLoaded = false;
var texe = 0;
var resLimit = 25;
var perLimit = 88;
var bonusLimit = 96;
var gain = 0;
var reports = [];

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
    console.log($(this).attr('id'));
    op = $(this).val();
    console.log('op:', op);
    $.mobile.changePage('#' + op + 'Exe', { transition: 'fade'});
  });
}

function bindAddExe() {
  $('input.addExe').click( function(event) {
    var range = $(this).val().split(':');
    var id =$(this).attr('id');
    console.log('addExe:', range);
    exe = new AddExercise(id, parseInt(range[0]), parseInt(range[1]) + 1, parseFloat(range[2]), parseFloat(range[3]));
    $.mobile.changePage('#play', { transition: 'fade'});
  });
}

function bindSubExe() {
  $('input.subExe').click( function(event) {
    var range = $(this).val().split(':');
    var id =$(this).attr('id');
    console.log('subExe:', range);
    exe = new SubExercise(id, parseInt(range[0]), parseInt(range[1]) + 1, parseFloat(range[2]), parseFloat(range[3]));
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

function ExeReport(label, correct, wrong, state, time, gain) {
  this.label = label;
  this.timestamp = new Date().getTime();
  this.correct = correct;
  this.wrong = wrong;
  this.total = correct + wrong;
  var percent = 100;
  if (correct + wrong !=0 ) {
    percent = Math.round(correct / (correct + wrong) * 100);
  }
  this.percent = percent;
  this.state = state;
  this.time = time;
  this.gain = gain;
}

function AddExercise(id, min, max, gain, initEuro) {
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
  this.id = id;
  this.euro = initEuro;
  this.gain = gain;
  this.min = min;
  this.max = max;
  this.current;
  this.load();
  console.log('new Add', min, max, gain, initEuro);
}

AddExercise.prototype.load = function() {
  var euro = localStorage.getItem(lsTag + uid + ':' + this.id + 'Euro');
  if (euro) { this.euro = parseFloat(euro); }
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
  localStorage.setItem(lsTag + uid + ':' + this.id + 'Euro', this.euro);
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
        console.log('nextQuestion', this.current);
        return this.current;
      }
      console.log('same question. passing');
      return this.nextQuestion();
    }
  }
}

// Sub Exercice

function SubExercise(id, min, max, gain, initEuro) {
  this.allQ = [];
  for (var i = min; i < max; i++) {
    for (var j = min; j < max; j++) {
      if (i >= j ) {
        this.allQ.push({
          question: i + ' - ' + j,
          solution: (i - j).toString(),
          correct: 0,
          wrong: 0
        });
      }
    }
  }
  this.id = id;
  this.euro = initEuro;
  this.gain = gain;
  this.min = min;
  this.max = max;
  this.current;
  this.load();
  console.log('new Sub', min, max, gain, initEuro);
}

SubExercise.prototype = new AddExercise();        // inherit AddExe
SubExercise.prototype.constructor = SubExercise;  // correct the constructor pointer because it points to SubExercise


// Virtual Numeric Keyboard

function Numpad() {
  this.answer = '';
  this.handler;
  this.enabled = false;
  this.exe;
  
  var that = this;
  $('div#numpad button').click(function() {
    if (!that.enabled) { return; }
    that.enabled = false;
    var digit = $(this).attr('id').substring(1);
    that.answer = that.answer + digit;
    $('span#answer').html(that.answer);
    if (that.exe.solution == that.answer) {
      that.exe.correct++;
      $('span#answer').delay(500).fadeOut(function() {
        that.handler('correct');
      }).fadeIn(100);
    } else if (that.exe.solution.search(that.answer) == 0) {
      that.enabled = true;
      return;
    } else {
      that.exe.wrong++;
      $('span#answer').
        fadeOut(function() { $(this).html(that.exe.solution).css('color', 'red'); }).
        fadeIn().delay(500).fadeOut(function() { $(this).css('color', 'black'); that.handler('wrong'); }).
        fadeIn(100);
    }
  });
}

Numpad.prototype.setExe = function(exe) {
  this.exe = exe;
  this.answer = '';
  $('span#question').html(this.exe.question);
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
  reports = JSON.parse(localStorage.getItem(lsTag + uid + ':reports'));
  if (!reports) { reports = []; }
}

function saveReports() {
  localStorage.setItem(lsTag + uid + ':reports', JSON.stringify(reports));
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
  if (status == "end") {
    if (correct + wrong < resLimit) {
      $.mobile.changePage('#noEnouthRes', { role: "dialog" });
      exe.save();
      reports.push(new ExeReport(exe.id, correct, wrong, 'late', exeTime, 0));
      saveReports();
      return;
    }
    texe++;
    var percent = 100;
    if (correct + wrong !=0 ) {
      percent = Math.round(correct / (correct + wrong) * 100);
    }
    if (percent >= perLimit) { 
      wallet = wallet + exe.gain;
      gain = exe.gain;
      exe.euro = exe.euro - exe.gain;
      if (percent >= bonusLimit) {
        wallet = wallet + exe.gain;
        gain = gain + exe.gain;
        exe.euro = exe.euro - exe.gain;
      }
    }
    localStorage.setItem(lsTag + 'wallet', wallet);
    localStorage.setItem(lsTag + 'texe', texe);
    $.mobile.changePage('#home', { transition: 'flip' });
    reports.push(new ExeReport(exe.id, correct, wrong, 'win', exeTime, gain));
    saveReports();
  } else {
    reports.push(new ExeReport(exe.id, correct, wrong, 'abort', exeTime, 0));
    saveReports();
  }
  if (exe.euro < 0.01) { exe.euro = 0; }
  exe.save();
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
  $('span#scorePercent').removeClass('percentBest percentGood percentBad');
  if (percent >= bonusLimit) {
    $('span#scorePercent').addClass('percentBest');    
  } else if (percent >= perLimit) {
    $('span#scorePercent').addClass('percentGood');    
  } else {
    $('span#scorePercent').addClass('percentBad');    
  }
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
  if (percent < perLimit) {
    $('span#percent-home').css('color', 'red');
  } else {
    $('span#percent-home').css('color', 'green');
  }
});

$( document ).on('pagebeforeshow', '#addExe', function(event) {
  $('input.addExe').each(function(i, e) {
    var id = $(e).attr('id');
    var euro = localStorage.getItem(lsTag + uid + ':'  + id + 'Euro');
    if (euro) {
      $('span#' + id + 'Euro').html(parseFloat(euro).toFixed(2));
    }
    if (parseFloat(euro) < 0.01) {
      $('input#' + id).checkboxradio('disable');
    } else {
      $('input#' + id).checkboxradio('enable');
    }
  });
});

$( document ).on('pagebeforeshow', '#subExe', function(event) {
  $('input.subExe').each(function(i, e) {
    var id = $(e).attr('id');
    var euro = localStorage.getItem(lsTag + uid + ':'  + id + 'Euro');
    if (euro) {
      $('span#' + id + 'Euro').html(parseFloat(euro).toFixed(2));
    }
    if (parseFloat(euro) < 0.01) {
      $('input#' + id).checkboxradio('disable');
    } else {
      $('input#' + id).checkboxradio('enable');
    }
  });
});

// Individual page init (jquery mobile)

$( document ).on('pageinit', '#home', function() {
  loadLocalStorage();
  if (!uid) {
    $.mobile.changePage('#auth');
  }
  console.log('pageinit home');
  $('div#home').on( 'swipeleft', function() {
    $.mobile.changePage('#confOp', { transition: 'slide'});
  });
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

$( document ).on('pageinit', '#subExe', function() {
  loadLocalStorage();
  bindSubExe();
  console.log('pageinit subExe');
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

$( document ).ready(function(){
  console.log('Document ready');
  $('body').on('touchmove', function(event) {
    event.preventDefault();
  });
});
