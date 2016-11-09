//--- firebase Auth
var platform;
var version;
var uuid;
var name;
var screen_w;
var screen_h;
var screen_color;


function signInAnonymously() {
    // [START authanon]
    firebase.auth().signInAnonymously().catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode === 'auth/operation-not-allowed') {
            alert('You must enable Anonymous auth in the Firebase Console.');
        } else {
            console.error(error);
        }
        // [END_EXCLUDE]
    }).then(function() {
            myUserId = firebase.auth().currentUser.uid;
            localStorage.setItem('myUserId',myUserId);
            console.log('User ['+ myUserId +'] is signed in.');
            writeUserData(myUserId);
        }
    );
    // [END authanon]
};

function AuthState(){
    // Listening for auth state changes.
    // [START authstatelistener]
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            myUserId = uid;
            // [START_EXCLUDE]
            //console.log(JSON.stringify(user, null, '  '));
            console.log('User is signed in.');

            // [END_EXCLUDE]
        } else {
            // User is signed out.
            // [START_EXCLUDE]
            console.log('User is signed out.');
            // [END_EXCLUDE]
        }
    });
    // [END authstatelistener]
};

function logout(){
    firebase.auth().signOut();
};

//-- save data firebase

function writeUserData(uuid, platform, version,screen_w, screen_h, screen_color){
firebase.database().ref('users/' + uuid).set({
        uuid: uuid,
        platform:platform,
        version:version,
        screen_w:screen_w,
        screen_h:screen_h,
        screen_color:screen_h
    });
}

function sendData(uuid, name, last_name, email, phone) {
    // A post entry.
    var postData = {
        uuid: uuid,
        name: name,
        last_name: last_name,
        email: email,
        phone: phone
    };

    // Get a key for a new Post.
    var newPostKey = firebase.database().ref().child('contacts').push().key;

    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {};
    updates['/contacts/' + newPostKey] = postData;
    updates['/user-contacts/' + uuid + '/' + newPostKey] = postData;

    return firebase.database().ref().update(updates);
}

function deleteContactUser(uuid, contacts){
    $.each(contacts, function( i, key ) {
        firebase.database().ref().child('/user-contacts/' + uuid + '/' + key).remove();
    });
}

// get data firebase
function getContact(){
    var list = $('#contact .contact-list');
        list.empty();
    var my_contacts = firebase.database().ref('user-contacts/' + uuid);
    my_contacts.on('child_added', function(data) {
        printContact(data.val(), data.key);
        console.log('child_added');
    });
    my_contacts.on('child_changed', function(data) {
        updateContact(data.val(), data.key);
        console.log('child_changed');
    });
    my_contacts.on('child_removed', function(data) {
        removeContact(data.key);
        console.log('child_remove');
    });
}

//-- update DOM
function printContact(contact, index){


        var list = $('#contact .contact-list');
        var list2 = $('#delete .contact-list-delete');

        var li = $('<li>');
            li.addClass('mdl-list__item mdl-list__item--two-line');
            li.attr('data-contact-index',index);
        var li2 = $('<li>');
            li2.addClass('mdl-list__item');
            li2.attr('data-contact-index',index);

        var span_content = $('<span>');
            span_content.addClass('mdl-list__item-primary-content');
        var avatar = $('<i>');
            avatar.addClass('material-icons mdl-list__item-avatar')
                  .text('person');
        var span_name = $('<span>');
            span_name.addClass('contact-name');
            span_name.text(contact.name+' '+contact.last_name);
        var span_email = $('<span>');
            span_email.addClass('mdl-list__item-sub-title');
            span_email.addClass('contact-email');
            span_email.text(contact.email);

        var clone_span_content = span_content.clone();
            var clone_avatar = avatar.clone();
            var clone_span_name = span_name.clone();

            clone_span_content.append(clone_avatar ,clone_span_name);
            span_content.append(avatar ,span_name, span_email);



            li.append(span_content);
        var span_action = $('<span>');
            span_action.addClass('mdl-list__item-secondary-content');
        var link = $('<a>');
            link.addClass('mdl-list__item-secondary-action');
            link.addClass('contact-phone');
            link.attr('href', 'tel:'+contact.phone);
        var icon = $('<i>');
            icon.addClass('material-icons');
            icon.text('phone');
            link.append(icon);
            span_action.append(link);
            li.append(span_action);
            list.append(li);

        var span_input = $('<span>');
            span_input.addClass('mdl-list__item-secondary-action');
            span_input.css({'margin-right': '40px' });
        var label = $('<label>');
            label.addClass('mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect');

        var input = $('<input>');
            input.addClass('mdl-checkbox__input contact');
            input.attr('type', 'checkbox');
            input.attr('value', index);
            input.attr('name', 'contact[]');


            label.append(input);
            span_input.append(label);
            li2.append(span_input, clone_span_content);
            list2.append(li2);

            setTimeout(function() {
                componentHandler.upgradeDom('MaterialCheckbox');

                $(".contact-list-delete input:checkbox").on("change", function() {
                    updateCounter();
                });

            }, 0);



}

function updateContact(contact, index){

    var list = $('#contact .contact-list');
    var list2 = $('#delete .contact-list-delete');

    var item = list.find('*[data-contact-index="'+index+'"]');
    var name = item.find('.contact-name');
    var email = item.find('.contact-email');
    var phone = item.find('.contact-phone');

    var contact2 = list2.find('*[data-contact-index="'+index+'"]');
    var name2 = contact2.find('.contact-name');


    name.text(contact.name+' '+contact.last_name);
    name2.text(contact.name+' '+contact.last_name);
    email.text(contact.email);
    phone.attr('href', 'tel:'+contact.phone);
}

function removeContact(index){
    var list = $('#contact .contact-list');
        list.find('*[data-contact-index="'+index+'"]').remove();

    var list2 = $('#delete .contact-list-delete');
        list2.find('*[data-contact-index="'+index+'"]').remove();
}

//----- show toast

function showtoast(msg) {
    var notification = document.querySelector('.mdl-js-snackbar');
    var data = {
        message: msg
    };
    notification.MaterialSnackbar.showSnackbar(data);

};

//-- nav options
$('.show-add').tap(function(){
    $('#action-delete').addClass('hide');
    var pageId ='add';
    var animation = 66;
    var time = 3000;
    goPage(pageId, animation, time);
});

$('.show-contact').tap(function(){
    $('#action-delete').addClass('hide');
    var pageId ='contact';
    var animation = 66;
    var time = 3000;
    goPage(pageId, animation, time);
});

$('.show-delete').tap(function(){
    $('#action-delete').removeClass('hide');
    var pageId ='delete';
    var animation = 66;
    var time = 3000;
    goPage(pageId, animation, time);
});

function goPage(pageId, animation, time){
    var nav = {};
    var page = PageTransitions.findPage(pageId);
    var current = PageTransitions.getCurrentPage();
    nav.animation = animation;
    nav.showPage = page.index;
    nav.currentPage = current.index;

    setTimeout( PageTransitions.nextPage(nav), time);
}

//-- Action form add contact
$("#send").tap(function(){
    var active = $(this).attr('active');

    if(active == undefined) {
        $(this).attr('active', true);
        var name = $('#name').val();
        var last_name = $('#last_name').val();
        var email = $('#email').val();
        var phone = $('#phone').val();
        var msg = '';

        if (name != '' && email != '' && phone != '' && last_name) {
            sendData(uuid, name, last_name, email, phone);

            var list = $('#contact .contact-list');
            if(list.children().length == 0){
                getContact();
            }

            cleanFormData();
            var pageId ='contact';
            var animation = 15;
            var time = 3000;
            goPage(pageId, animation, time);

            msg = 'Succes';
        } else {
            msg = 'Error';
        }
        showtoast(msg);
        setTimeout(function(){
            $('#send').removeAttr('active');
        },1000);
    }

});

function cleanFormData(){
    $('#name').val('');
    $('#last_name').val('');
    $('#email').val('');
    $('#phone').val('');
}

$('#btn-delete-contact').tap(function(){
    var contacts = getCheck();
    if(contacts.length > 0){
        deleteContactUser(uuid, contacts);
        updateCounter();
    }
});

function getCheck(){
    var selected = [];
    $('.contact-list-delete input:checked').each(function() {
        selected.push($(this).attr('value'));
    });

    return selected;
}

function updateCounter() {
    var len = $(".contact-list-delete input[name='contact[]']:checked").length;
    if(len>0){
        $(".count-contact").text('('+len+') Contacto(s)');
    }
    else{
        $(".count-contact").text('(0) Contacto(s)');
    }
}


/*
$('.select_all').change(function() {
    var checkthis = $(this);
    var checkboxes = $(this).parent().next('ul').find("input[name='wpmm[]']");

    if(checkthis.is(':checked')) {
        checkboxes.attr('checked', true);
    } else {
        checkboxes.attr('checked', false);
    }
    updateCounter();
});
*/

function deviceInfo() {
    platform = device.platform;
    version = device.version;
    uuid = device.uuid;
    name = device.name;
    screen_w = screen.width;
    screen_h = screen.height;
    screen_color = screen.colorDepth;

    var my_contacts = firebase.database().ref('user/' + uuid + '/uuid');
    my_contacts.on('value', function (snapshot) {
        if (snapshot.val()) {
            getContact();
        } else {
            writeUserData(uuid, platform, version, screen_w, screen_h, screen_color);
        }
    });
    getContact();
}


function init() {
    document.addEventListener("deviceready", deviceInfo, true);
}

init();

