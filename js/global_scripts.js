// setting pooldata in case ShowHideInfo() is not clicked
window.poolData = {
	UserPoolId : _config.cognito_user.userPoolId,
	ClientId : _config.cognito_user.clientId,
}

function uncheck() {
    // Uncheck all checkboxes on page load    
	$(':checkbox:checked').prop('checked',false);
}

// To change from device field to admin field and visa versa
function showHideInfo() {
	if (document.getElementById('admin').checked) {
		document.getElementById('admininfo').style.display='block';
		document.getElementById('userinfo').style.display='none';
		window.poolData = {
			UserPoolId : _config.cognito_admin.userPoolId,
			ClientId : _config.cognito_admin.clientId,
			};	
	} else {
		document.getElementById('admininfo').style.display='none';
		document.getElementById('userinfo').style.display='block';
		window.poolData = {
			UserPoolId : _config.cognito_user.userPoolId,
			ClientId : _config.cognito_user.clientId,
		};
	};
	console.log('user pool id: '+poolData['UserPoolId']);
	console.log('client id: '+poolData['ClientId']);
}


function sign_out() {
	var poolData = getCurrUserPool();
	var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
	var cognitoUser = userPool.getCurrentUser();

	if (cognitoUser != null) {
		cognitoUser.signOut();
		location.replace('login_page.html')
	}
}

// gets the userpool of the logged in user
function getCurrUserPool() {
	var account_type='user';
	var poolData = {
		UserPoolId : _config.cognito_user.userPoolId,
		ClientId : _config.cognito_user.clientId,
	};
	var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
	var cognitoUser = userPool.getCurrentUser();
	
	// if user
	if (cognitoUser == null) {
		account_type='admin';		
		var poolData = {
			UserPoolId : _config.cognito_admin.userPoolId,
			ClientId : _config.cognito_admin.clientId,
		};	
		var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
		var cognitoUser = userPool.getCurrentUser();
		if (cognitoUser == null) {
			location.replace('login_page.html');
		}
	}
	console.log('account type: '+account_type);
	return poolData;
}