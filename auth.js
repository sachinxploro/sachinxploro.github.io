/**
 * MSAL.js Authentication Handler
 * Documentation: https://github.com/AzureAD/microsoft-authentication-library-for-js
 */

const msalConfig = {
    auth: {
        // TODO: Replace with your Application (client) ID from Azure Portal
        clientId: "d9051dac-005c-4352-b9e3-58aaf47061c3",
        // TODO: Replace with your Directory (tenant) ID or "common" for multi-tenant
        authority: "https://login.microsoftonline.com/aa947143-f10f-46fc-a1e0-b2e5cba0bbaa",
        // Must match the Redirect URI registered in Azure Portal
        redirectUri: window.location.origin
    },
    cache: {
        cacheLocation: "sessionStorage", // Options: "sessionStorage" or "localStorage"
        storeAuthStateInCookie: false
    }
};

// Create the main MSAL instance
const myMSALObj = new msal.PublicClientApplication(msalConfig);

// Optimization: If this page is loaded in a popup (during login), hide the UI
if (window.opener && window !== window.opener) {
    document.documentElement.style.display = "none";
}

let username = "";

/**
 * Initialize MSAL and handle the redirect flow
 */
async function initializeMsal() {
    try {
        // Initialize the instance (required for MSAL.js v3+)
        if (myMSALObj.initialize) {
            await myMSALObj.initialize();
        }
        
        // Handle redirect promise (checks if page loaded from a login redirect)
        const response = await myMSALObj.handleRedirectPromise();
        
        if (response) {
            handleResponse(response);
        } else if (!window.opener) {
            // Check if user is already signed in via cache
            const currentAccounts = myMSALObj.getAllAccounts();
            if (currentAccounts.length > 0) {
                username = currentAccounts[0].username;
                updateUI(currentAccounts[0]);
            }
        }
    } catch (error) {
        console.error("MSAL Initialization Error:", error);
    }
}

// Run initialization immediately
initializeMsal();

/**
 * Handle the successful login response
 */
function handleResponse(response) {
    if (response !== null) {
        username = response.account.username;
        updateUI(response.account);
    }
}

/**
 * Sign In function (using Popup)
 */
async function signIn() {
    try {
        const loginRequest = {
            scopes: ["User.Read"] // Request permission to read user profile
        };
        
        const response = await myMSALObj.loginPopup(loginRequest);
        handleResponse(response);
    } catch (error) {
        console.error("Login Error:", error);
    }
}

/**
 * Sign Out function
 */
async function signOut() {
    const logoutRequest = {
        account: myMSALObj.getAccountByUsername(username),
        postLogoutRedirectUri: msalConfig.auth.redirectUri
    };

    await myMSALObj.logoutPopup(logoutRequest);
    window.location.reload();
}

/**
 * Update UI elements based on auth state
 */
function updateUI(account) {
    console.log("User logged in:", account);

    // Hide Login button, Show User/Logout
    document.getElementById("loginItem").style.display = "none";
    document.getElementById("userItem").style.display = "inline-block";

    // Display user name
    document.getElementById("userName").textContent = `Hi, ${account.name}`;
}

// Attach Event Listeners
const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
    loginBtn.addEventListener("click", (e) => { e.preventDefault(); signIn(); });
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => { e.preventDefault(); signOut(); });
}