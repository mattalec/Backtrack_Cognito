function getUserAttr() {
	// trying for device user signed in
	var poolData = {
		UserPoolId : _config.cognito_user.userPoolId,
		ClientId : _config.cognito_user.clientId,
	};
	var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
	var cognitoUser = userPool.getCurrentUser();

	// if user
	if (cognitoUser != null) {
		cognitoUser.getSession(function(err,session) {
			if (err) {
				alert(err);
				return;
			} else {
				console.log('session validity: '+session.isValid());
				document.getElementById('admininfo').style.display='none';
				document.getElementById('createUser').style.display='none';

				cognitoUser.getUserAttributes(function(err, result) {
					if (err) {
						console.log(err);
						return;
					} else {
						console.log(result);
						// [sub, email verified, preferred_username, email] 
						document.getElementById('username_value').innerHTML = result[2].getValue();										
						document.getElementById('email_value').innerHTML = result[3].getValue();
						return admin = false;
					}				
				});	
			}
		});
	} else {
		
		// if admin 
		poolData = {
			UserPoolId : _config.cognito_admin.userPoolId,
			ClientId : _config.cognito_admin.clientId,
		};	
		var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
		var cognitoUser = userPool.getCurrentUser();

		if (cognitoUser != null) {
			cognitoUser.getSession(function(err, result) {
				if (result) {
					console.log('You are now joining the identity pool.');

					// Add the User's Id Token to the Cognito credentials login map.
					AWS.config.credentials = new AWS.CognitoIdentityCredentials({
					  	IdentityPoolId: "eu-west-2:c4d29c65-efbf-42a4-ba92-bb733decc57f",
					  	Logins: {
					    	'cognito-idp.eu-west-2.amazonaws.com/eu-west-2_XSJdzh39k': result.getIdToken().getJwtToken()
					  	}					
					});

					console.log(result.getIdToken())
				} else {
					alert(err);
					return;
				}
				console.log('session validity: '+result.isValid());
				document.getElementById('userinfo').style.display='none';
				document.getElementById('createUser').style.display='block';

				cognitoUser.getUserAttributes(function(err, result) {
					if (err) {
						console.log(err);
						return;
					}
					console.log(result);
					// [sub, email verified, preferred_username, email] 
					document.getElementById('fname_value').innerHTML = result[2].getValue();
					document.getElementById('lname_value').innerHTML = result[3].getValue();
					document.getElementById('adminEmail_value').innerHTML = result[4].getValue();
					return admin = true;										
				});
			});
		} else {
			location.replace('login_page.html');
		}
	};
}