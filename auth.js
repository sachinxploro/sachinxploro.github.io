/**
 * MSAL.js Authentication Handler
 * Documentation: https://github.com/AzureAD/microsoft-authentication-library-for-js
 */

const msalConfig = {
  auth: {
    // TODO: Replace with your Application (client) ID from Azure Portal
    clientId: "986b1fb0-7e71-40a9-a12f-e683a1a38c6c",
    // TODO: Replace with your Directory (tenant) ID or "common" for multi-tenant
    authority:
      "https://login.microsoftonline.com/6c09b7e9-1f03-4ab7-85c0-ec02bb2e0bf2",
    // Dedicated popup callback page (must be registered in Azure Portal)
    redirectUri: `${window.location.origin}/auth-popup.html`,
    // Keep logout on the main site
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage", // Options: "sessionStorage" or "localStorage"
    storeAuthStateInCookie: false,
  },
};

// Create the main MSAL instance
const myMSALObj = new msal.PublicClientApplication(msalConfig);

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
    } else {
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
const msalInitPromise = initializeMsal();

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
    // Ensure MSAL is initialized before attempting to login
    await msalInitPromise;

    const loginRequest = {
      scopes: ["User.Read"], // Request permission to read user profile
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
  // Ensure MSAL is initialized before attempting to logout
  await msalInitPromise;

  const logoutRequest = {
    account: myMSALObj.getAccountByUsername(username),
    postLogoutRedirectUri: msalConfig.auth.postLogoutRedirectUri,
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
  loginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    signIn();
  });
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    signOut();
  });
}
