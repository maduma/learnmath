/*
 * Global properties
 */

var uid;       // username
var op;        // operation (add,sub,...)
var exe;       // exercise Object
var numpad;    // numpad Object
var countdown; // countdown Object

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

// Virtual Numeric Keyboard

function Numpad() {
  this.question = '9 + 7';
  this.answer = '';
  this.solution = '16';
  this.handler;
  this.enabled = true;
  
  var that = this;
  $('div#numpad button').click(function() {
    if (!that.enabled) { return; }
    var digit = $(this).attr('id').substring(1);
    that.answer = that.answer + digit;
    $('span#answer').html(that.answer);
    if (that.solution == that.answer) {
      that.enabled = false;
      if (that.handler) { that.handler('correct'); }
    }
    if (that.solution.search(that.answer) == 0) {
      return;
    } else {
      that.enabled = false;
      if (that.handler) { that.handler('correct'); }
    }
  });
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
  if (this.stopHandler) { this.stopHandler(); }
  this.currentTime = this.startTime;
  this.display();
  $(this.stopSelector).button('disable');
  $(this.startSelector).button('enable');
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
  countdown = new Countdown(10);

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
