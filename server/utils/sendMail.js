let emailAuth;

try {
  emailAuth = require('../config/email');
} catch (e) {
  emailAuth = require('../config/email.example');
}

const mailgun = require('mailgun-js')(emailAuth.mailgun.auth);

let from_who = emailAuth.default_from; //Your sending email address


module.exports = async function sendMAil(mail, rand) {
  // const link = 'http://localhost:3000/api/v1/auth/validate?mail=' + mail + '&id=' + rand;
  const link = 'http://app.wikonnect.org/auth/validate?mail=' + mail + '&id=' + rand;
  let data = {
    from: from_who,
    to: Buffer.from(mail, 'base64').toString('ascii'),
    subject: 'Hello from Mailgun',
    html: 'Hello, This is not a plain-text email, I wanted to test some spicy Mailgun sauce in NodeJS! <br><a href=' + link + '>Password reset link here</a>'
  };

  //Invokes the method to send emails given the above data with the helper library
  mailgun.messages().send(data, function (err, body) {
    //If there is an error, render the error page
    if (err) {
      console.log('got an error: ', err);
      return err.message;
    }
    //Else we can greet    and leave
    else {
      //Here "submitted.jade" is the view file for this landing page
      //We pass the variable "email" from the url parameter in an object rendered by Jade
      console.log(('submitted', { email: mail }));
      console.log(body);
      return body;
    }
  });
};