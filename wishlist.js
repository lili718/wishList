//client-side JS code
window.fbAsyncInit = function() {
        FB.init({
          appId      : '508801150074502',
          cookie     : true,
          xfbml      : true,
          version    : 'v6.0'
        });

        FB.AppEvents.logPageView();   

      };

      (function(d, s, id){
         var js, fjs = d.getElementsByTagName(s)[0];
         if (d.getElementById(id)) {return;}
         js = d.createElement(s); js.id = id;
         js.src = "https://connect.facebook.net/en_US/sdk.js";
         fjs.parentNode.insertBefore(js, fjs);
       }(document, 'script', 'facebook-jssdk'));

FB.login(function(response){
  // handle the response 
    if (response.status === 'connected') {
    // Logged into your webpage and Facebook.
    } 
    else {
    // The person is not logged into your webpage or we are unable to tell. 
    }
    //scope is any additional info we want thats not default
    //defaul: id, first_name, last_name, middle_name, name, name_format, picture, short_name
}), {scope: 'public_profile,email'};

FB.logout(function(response) {
   // Person is now logged out
});

//google Signin
gapi.load('auth2', function(){
    gapi.auth2.init();
});

function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  //console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  //console.log('Name: ' + profile.getName());
  //console.log('Image URL: ' + profile.getImageUrl());
  //console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
}