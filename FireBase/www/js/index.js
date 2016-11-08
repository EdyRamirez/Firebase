//--- firebase Auth
var myUserId;

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
            console.log('User ['+ myUserId +'] is signed in.');
            writeUserData(myUserId);
            getContact();
        }
    );
    // [END authanon]
};

function logout(){
    firebase.auth().signOut();
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

//-- save data firebase

function writeUserData(userId) {
    firebase.database().ref('users/' + userId).set({
        uid: userId
    });
}

function sendData(uid, name, last_name, email, phone) {
    // A post entry.
    var postData = {
        uid: uid,
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
    updates['/user-contacts/' + uid + '/' + newPostKey] = postData;

    return firebase.database().ref().update(updates);
}

// get data firebase
function getContact(){
    var list = $('#contact .contact-list');
        list.empty();
    var my_contacts = firebase.database().ref('user-contacts/' + myUserId);
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
        var li = $('<li>');
            li.addClass('mdl-list__item mdl-list__item--two-line');
            li.attr('data-contact-index',index);
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


}

function updateContact(contact, index){

    var list = $('#contact .contact-list');
    var contact = list.find('*[data-contact-index="'+index+'"]');
    var name = contact.find('.contact-name');
    var email = contact.find('.contact-email');
    var phone = contact.find('.contact-phone');

    name.text(contact.name+' '+contact.last_name);
    email.text(contact.email);
    phone.attr('href', 'tel:'+contact.phone);
}

function removeContact(index){
    var list = $('#contact .contact-list');
        list.find('*[data-contact-index="'+index+'"]').remove();
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
    showPageAddContact();
});

$('#btn-add-contact').tap(function(){
    showPageAddContact();
});


function showPageAddContact(){

    var nav = {
        animation: 15,
        showPage: 1
    };

    PageTransitions.nextPage(nav);
}

$('.show-contact').tap(function(){
    showPageContact();
});

function showPageContact(){
    var nav = {
        animation: 15,
        showPage: -1
    };
    PageTransitions.nextPage(nav);
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
            sendData(myUserId, name, last_name, email, phone);
            cleanFormData();
            showPageContact();

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


var init = function(){
    signInAnonymously();
};

init();

