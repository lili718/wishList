function checkForm() {
    let errors = [];
    //Check first name validation
    let firstName = document.getElementById("firstName");
    if (firstName.value.length < 1) {
        firstName.style.border = "2px solid red";
        let nameError = "Missing first name.";
        errors.push(nameError);
    }
    else {
        firstName.style.border = "1px solid #aaa";
    }

    let lastName = document.getElementById("lastName");
    if (lastName.value.length < 1) {
        lastName.style.border = "2px solid red";
        let nameError = "Missing last name.";
        errors.push(nameError);
    }
    else {
        lastName.style.border = "1px solid #aaa";
    }

    let userName = document.getElementById("username");
    if (userName.value.length < 1) {
        userName.style.border = "2px solid red";
        let nameError = "Missing user name.";
        errors.push(nameError);
    }
    else {
        userName.style.border = "1px solid #aaa";
    }

    //Check email address regex validation
    let userEmail = document.getElementById("email");
    let emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    if (emailRegex.test(userEmail.value) == false) {
        userEmail.style.border = "2px solid red";
        let emailError = "Invalid or missing email address.";
        errors.push(emailError);
    }
    else {
        userEmail.style.border = "1px solid #aaa";
    }

    //Check password length
    let userPassword = document.getElementById("password");
    if ((userPassword.value.length < 10) || (userPassword.value.length > 20)) {
        userPassword.style.border = "2px solid red";
        let passLenError = "Password must be between 10 and 20 characters.";
        errors.push(passLenError);
    }
    else {
        userPassword.style.border = "1px solid #aaa";
    }

    //Check for lowercase letter
    let lowerRegex = /[a-z]/;
    if (lowerRegex.test(userPassword.value) == false) {
        userPassword.style.border = "2px solid red";
        let lowerError = "Password must contain at least one lowercase character.";
        errors.push(lowerError);
    }
    else {
        userPassword.style.border = "1px solid #aaa";
    }

    //Check for uppercase letter
    let upperRegex = /[A-Z]/;
    if (upperRegex.test(userPassword.value) == false) {
        userPassword.style.border = "2px solid red";
        let upperError = "Password must contain at least one uppercase character.";
        errors.push(upperError);
    }
    else {
        userPassword.style.border = "1px solid #aaa";
    }

    //Check for digit in password
    let numRegex = /[0-9]/;
    if (numRegex.test(userPassword.value) == false) {
        userPassword.style.border = "2px solid red";
        let numError = "Password must contain at least one digit.";
        errors.push(numError);
    }
    else {
        userPassword.style.border = "1px solid #aaa";
    }

    let userConfirm = document.getElementById("passwordConfirm");
    if (userPassword.value != userConfirm.value) {
        userPassword.style.border = "2px solid red";
        userConfirm.style.border = "2px solid red";
        let confirmErr = "Password and confirmation password don't match.";
        errors.push(confirmErr);
    }
    else {
        userConfirm.style.border = "1px solid #aaa";
    }

    if (errors.length > 0) {
        let divList = "<ul>";
        for (var i = 0; i < errors.length; i++) {
            divList += "<li>" + errors[i] + "</li>";
        }
        divList += "</ul>";
        document.getElementById("formErrors").innerHTML = divList;
        document.getElementById("formErrors").style.display = "block";
    }
    else {
        document.getElementById("formErrors").style.display = "none";
        let formData = '{"firstName":"' + firstName.value + '","lastName":"' + lastName.value + '", "userName":' +
            '"' + userName.value + '","userEmail":"' + userEmail.value + '", "userPassword":"' + userPassword.value + '"}';
        let JSONform = JSON.parse(formData);
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.status === 200) {
                let message = document.getElementById("message");
                message.innerHTML = "<h3>Account successfully created!</h3>" +
                    "<p>Return to our homepage to sign in successfully!</p>";
            }
        }
        xhr.open("POST", "./register", true);
        xhr.send(JSONform);
    }
}

document.getElementById("submit").addEventListener("click", function(event) {
    checkForm();
    event.preventDefault();
});