var uid;
var op;
var exe;
var numpad;

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
    exe = $(this).val();
    console.log('addExe:', exe);
    $.mobile.changePage('#play', { transition: 'slidedown'});
  });
}

function bindPlay() {
  $('button#start').click(function() {
  });
}

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

function Numpad(handler) {
  this.question = '9 + 7';
  this.answer = '';
  this.solution = '16';
  this.handler = handler;
  this.enabled = true;
  
  var that = this;
  $('div#numpad button').click(function() {
    if (!that.enabled) { return; }
    var digit = $(this).attr('id').substring(1);
    that.answer = that.answer + digit;
    $('span#answer').html(that.answer);
    if (that.solution == that.answer) {
      that.enabled = false;
      that.handler('correct');
    }
    if (that.solution.search(that.answer) == 0) {
      return;
    } else {
      that.enabled = false;
      that.handler('wrong');
    }
  });
}

function proceedAnswer(status) {
  console.log(status);
}

/* 
 * Main
 */
 
$( document ).delegate('#auth', 'pageinit', function() {
  console.log('pageinit auth');
});
 
$( document ).delegate('#confOp', 'pageinit', function() {
  console.log('pagechange confOp');
  if (!uid) {
    $.mobile.changePage('#auth');
  }
});

$( document ).delegate('#addExe', 'pageinit', function() {
  console.log('pagechagne addExe');
  if (!uid) {
    $.mobile.changePage('#auth');
  } else if (!op) {
    $.mobile.changePage('#confOp');
  }
});

$( document ).delegate('#play', 'pageinit', function() {
  console.log('pagechange play');
  if (!uid) {
    $.mobile.changePage('#auth');
  } else if (!op) {
    $.mobile.changePage('#confOp');
  } else if (!exe) {
    $.mobile.changePage('#addExe');
  }
});

$( document ).ready(function() {
  console.log("Document Ready.");
  bindAuth();
  bindConfOp();
  bindAddExe();
  bindPlay();
  numpad = new Numpad(proceedAnswer);
});
