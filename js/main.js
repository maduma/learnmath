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
    
    /*
     * Authenticate User
     */
    changeView('auth');
});