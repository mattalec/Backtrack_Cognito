// setting globals
var devicePoolData = {
  UserPoolId: _config.cognito_user.userPoolId, 
  ClientId: _config.cognito_user.clientId,
};
var adminPoolData = {
  UserPoolId: _config.cognito_admin.userPoolId, 
  ClientId: _config.cognito_admin.clientId,
};

// 'sign in' button
function signingIn() {
  signInButton(devicePoolData);
  signInButton(adminPoolData);
  setTimeout(function() {
    alert('incorrect username or password')
  }, 1000);
}

// User must be verified before password reset and will receive code through email
function forgotpasswordbutton() {
  var userType = prompt('are you an "admin" or a "device" user?: (please input e.g. device)').toLowerCase()
  if (userType == 'admin') {
    runForgotPassword(adminPoolData);
  } else if (userType == 'device') {
    runForgotPassword(devicePoolData);
  } else {alert('please input either "admin" or "device"')};
}

function signInButton(poolData) {
  // setting parameters in accepted format
  let Username = document.getElementById('InputUsername').value;
  let Password = document.getElementById('InputPassword').value;
  var authenticationData = {
  	Username: Username,
  	Password: Password,
  };
  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  var userData = {
      Username: Username,
      Pool: userPool,
  };

  // attempting to sign in user
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.authenticateUser(authenticationDetails, {
  	onSuccess: function (result) {
    	var accessToken = result.getAccessToken().getJwtToken();
      location.replace('user_profile.html');
  	},
  	onFailure: function(err) {
    	console.log(err.Message);
  	}
  });
}

function runForgotPassword(pooltype) {
  var Username = document.getElementById('InputUsername').value;
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(pooltype);
  var userData = {
    Username: Username,
    Pool: userPool,
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.forgotPassword({
    onSuccess: function(result) {
      console.log(JSON.stringify(result));
    },
    onFailure: function(err) {
      alert(err);
      console.log(err);
    },
    inputVerificationCode(){
      var verificationCode = prompt('Please input verification code sent to your email address ' ,'');
      var newPassword = prompt('Enter new password ' ,'');
      cognitoUser.confirmPassword(verificationCode, newPassword, {
        onFailure(err) {
          console.log(err);
        },
        onSuccess() {
          alert('Change in password successful');

        },
      });          
    }
  });
}
