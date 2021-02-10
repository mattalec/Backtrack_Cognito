// get temp user info from URL
function getFromURL() {
		var currentURL = String(window.location);
		if (currentURL.split('?').length > 1) {
			currentURL = currentURL.split('?')[1] ;
			currentURL = currentURL.split('=');
			window.Username = currentURL[1].split('&')[0];
			window.tempPass = currentURL[2].split('&')[0]; 
			window.userType = currentURL[3]
			console.log('User: '+Username); 
			console.log('Temporary Password: '+tempPass); 
			console.log('User Type: '+userType);
			document.getElementById('InputUsername').innerHTML = Username;
		}
}


// check both passwords are the same
function passwordChecker() {
	var Password = document.getElementById('InputPassword').value;
	var Password2 = document.getElementById('InputPassword2').value;
	if ((Password == Password2)) {
		return true
	} else {
		alert('your passwords do not match, please try again')
		return false
	}
}

// Confirm user Password
function confirmPasswordButton() {
	if (userType == 'a') {
		var poolData = {
		UserPoolId : _config.cognito_admin.userPoolId,
		ClientId : _config.cognito_admin.clientId,
		};
	} else {
		var poolData = {
			UserPoolId : _config.cognito_user.userPoolId,
			ClientId : _config.cognito_user.clientId,
		};	
	}

	console.log(poolData);

	if (passwordChecker()) {

		var Password = document.getElementById('InputPassword').value;

		AWS.config.region = 'eu-west-2'; // Region
		AWS.config.credentials = new AWS.CognitoIdentityCredentials({
		   IdentityPoolId: '...'
		});
		AWS.config.update({accessKeyId: 'anything', secretAccessKey: 'anything'});

		const params = {
			ClientId: poolData['ClientId'],
			//UserPoolId: poolData['UserPoolId'],
			AuthFlow: 'USER_PASSWORD_AUTH',
			AuthParameters: {
				USERNAME: Username,
				PASSWORD: tempPass,
			},
		}

		var cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({region: 'eu-west-2'});
		cognitoIdentityServiceProvider.initiateAuth(params, function(err,data) {
			if (err) {
			  	console.log(err, err.stack)
			} else {
			  	console.log(data);

				const paramsResponse = {
					ChallengeName: 'NEW_PASSWORD_REQUIRED',
					ClientId: poolData['ClientId'],
					ChallengeResponses: {
						USERNAME: Username,
						PASSWORD: tempPass,
						NEW_PASSWORD: Password,
					},
					Session: data.Session
				}

				cognitoIdentityServiceProvider.respondToAuthChallenge(paramsResponse, function(err,data) {
					if (err) {
						console.log(err, err.stack);
						alert(JSON.stringify(err.message));
					} else {
	        			location.replace('file:///C:/Users/alec/Desktop/work/BT_USERID/login_page.html');
					};
				})
			}     
		});

	}
}