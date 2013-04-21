var views = [ 'auth', 'menu', 'conf', 'play', 'report'];
var currentView = 'auth';
var uid = '';
var uids = [];

function changeView(view) {
    views.forEach(function(e, i, a) { if (e !== view) { $('div#' + e).hide(); } });
    $('div#' + view).fadeIn();
    currentView = view;
    console.log("changeView: " + view);
}

function ctrlAuth() {
    $('div#auth li').each(function(i) {
        uids.push($(this).attr('id'));
        $(this).click(function(){
            uid = $(this).attr('id');
            $('span#uid').html(uid);
            changeView('menu');
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

/*
 * Main
 */

$( document ).ready(function() {
    console.log("Document Ready.");
    //views.forEach(function(e, i, a) { setTimeout( function() { changeView(e); }, 2000 * (i + 1)); });
    
    /*
     * controllers
     */
    ctrlAuth();
    ctrlMenu();
    
    /*
     * Authenticate User
     */
    changeView('auth');
});