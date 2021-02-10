// setting user variables
function refreshAdminCheckbox() {
	if (document.getElementById('admin').checked) {
    window.inputEmail = document.getElementsByName("inputEmail")[0].value;
    window.inputGname = document.getElementById("fname").value;
    window.inputFname = document.getElementById("lname").value;
	} else {
    window.inputEmail = document.getElementsByName("inputEmail")[1].value;
    window.Username = document.getElementById("inputUsername").value;
	};
}

// device user add email button
function showHideUserLogin() {
	if (document.getElementById('require_login').checked) {
		document.getElementById('userlogin').style.display='block';
	} else {
		document.getElementById('userlogin').style.display='none';
	};
}

// device username populate username field
function prePopulate() {
	var loc = document.getElementById('LocId').value;
	var serial = document.getElementById('id').value;
	document.getElementById('inputUsername').value = serial+'@'+loc;
};




// 'Create User' button 
// adminCreateUser() sends user temp password, user in 'FORCE_CHANGE_PASSWORD' state
function registerButtonPasswordless() {
	refreshAdminCheckbox(); //get user attributes

	var userAddPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
	var attributeList = [];
	
	var confirmEmail = {
		Name: 'email_verified',
		Value: 'true'
	};
	var dataEmail = {
		Name : 'email', 
		Value : inputEmail, 
	};

	var attributeConfirmEmail = new AmazonCognitoIdentity.CognitoUserAttribute(confirmEmail);
	var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
	attributeList.push(attributeEmail);
	attributeList.push(attributeConfirmEmail);

	if (document.getElementById('admin').checked) {

		let data_given_name = {
			Name : 'given_name', 
			Value : inputGname, 
		};
		let data_family_name = {
			Name : 'family_name', 
			Value : inputFname, 
		};

		var attributeGivenName = new AmazonCognitoIdentity.CognitoUserAttribute(data_given_name);
		var attributeFamilyName = new AmazonCognitoIdentity.CognitoUserAttribute(data_family_name);
		var param_username = inputEmail;
		attributeList.push(attributeFamilyName);
		attributeList.push(attributeGivenName);

	} else {
	
		let data_username = {
			Name: 'preferred_username',
			Value: Username,
		};

		var attributeUsername = new AmazonCognitoIdentity.CognitoUserAttribute(data_username);
		var param_username = Username;
		attributeList.push(attributeUsername);

	};

	// initialising authentication flow variables
	var identityId;
	var idToken;
	var access;
	var secret;
	var adminUsername;

	AWS.config.update({
		region: 'eu-west-2', // Region
		credentials: new AWS.CognitoIdentityCredentials({
	    	IdentityPoolId: 'eu-west-2:c4d29c65-efbf-42a4-ba92-bb733decc57f',
		})
	});

	// get logged in user credentials
	var adminPoolData = {
		UserPoolId : _config.cognito_admin.userPoolId,
		ClientId : _config.cognito_admin.clientId,
	}
	var adminPool = new AmazonCognitoIdentity.CognitoUserPool(adminPoolData);

	var cognitouser = adminPool.getCurrentUser();
	if (cognitouser != null) {
		cognitouser.getSession(function(err, result) {
			if (result) {
				adminUsername = result.accessToken.payload['username'];
				idToken = result.getIdToken().getJwtToken();
				console.log('regular idToken from getSession() call'+idToken);
			}
		})
	}

	var cognitoidentity = new AWS.CognitoIdentity()
    var params = {
        IdentityPoolId: 'eu-west-2:c4d29c65-efbf-42a4-ba92-bb733decc57f',
        Logins: {
            'cognito-idp.eu-west-2.amazonaws.com/eu-west-2_XSJdzh39k': idToken
        }                        
    };

	cognitoidentity.getId(params, function(err, data) {
    	if (err) {
    		console.log(err, err.stack)
    	} else {
			var identityId = data.IdentityId;
			console.log('identity Id token from getId() call for admin users'+identityId);
			paramsCred = {
    			CustomRoleArn: "arn:aws:iam::227758139159:role/ADMIN_PERMISSION",
        		IdentityId: identityId,
       			Logins: {
            		'cognito-idp.eu-west-2.amazonaws.com/eu-west-2_XSJdzh39k': idToken
        		}                        
			};
			cognitoidentity.getCredentialsForIdentity(paramsCred, function(err, data) {
				if (err) {
					console.log(err, err.stack)
				} else {
					console.log(data);
					access = data.Credentials['AccessKeyId'];
					secret = data.Credentials['SecretKey'];
					session = data.Credentials['SessionToken'];
					// update cognito config with proof of current admin role session
					AWS.config.update({accessKeyId: access, secretAccessKey: secret, sessionToken: session});

					var params = {
						UserPoolId: poolData['UserPoolId'],
						Username: param_username,
						DesiredDeliveryMediums: ["EMAIL"],
						ForceAliasCreation: false,
						MessageAction: 'SUPPRESS',
						UserAttributes: attributeList,
					};
					console.log("Sending params to cognito: "+JSON.stringify(params));

					var cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({region: 'eu-west-2'});
					cognitoIdentityServiceProvider.adminCreateUser(params, function(error, data) {
						if (error) {
							console.log('Error adding user to cognito: ' + error, error.stack);
						} else {
							console.log(data);
						}
					});

					// waiting 3 seconds and repeating adminCreateUser call,
					// with MessageAction: 'RESEND', rather than 'SUPPRESS', 
					// as user needs to be present in user pool before requesting cognito to email user temp credentials
					setTimeout(function() {
						var params = {
						UserPoolId: poolData['UserPoolId'],
						Username: param_username,//.replace("@", "-"),
						DesiredDeliveryMediums: ["EMAIL"],
						ForceAliasCreation: false,
						MessageAction: 'RESEND',
						UserAttributes: attributeList,
						};
						var cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({region: 'eu-west-2'});
						cognitoIdentityServiceProvider.adminCreateUser(params, function(error, data) {
							if (error) {
								console.log('Error sending message to user: ' + error, error.stack);
							} else {
								alert('an email has been sent to the created user')
								console.log(data);
							}
						});
					;}, 3000);

					// add user to group ADMINS (giving access to adminCreateUser) if he has been registered in admin pool
					var paramsGroup = {
						GroupName: 'ADMINS',
						UserPoolId: adminPoolData['UserPoolId'],
						Username: param_username
					};

					cognitoIdentityServiceProvider.adminAddUserToGroup(paramsGroup, function(err, data) {
						if (err) console.log(err, err.stack);
						else console.log(data);
					});
				}
			});

	    }
	});
}