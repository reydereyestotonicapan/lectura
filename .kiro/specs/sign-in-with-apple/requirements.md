# Requirements Document

## Introduction

Sign In with Apple adds Apple's native OAuth provider as a third authentication option in the Lectura (gRafé) mobile app, alongside the existing email/password and Google Sign-In flows. The mobile app obtains an Apple credential, exchanges it for a Firebase ID token, and sends that token to the existing Laravel backend endpoint to receive a Sanctum token. All new code lives in the mobile app — no backend changes are required.

## Glossary

- **LoginScreen**: The React Native screen component that renders the sign-in UI and orchestrates authentication flows.
- **AuthContext**: The React context that manages authentication state, exposing `signIn(token, user)` and `signOut()`.
- **Apple_Auth**: The `expo-apple-authentication` module that provides the native Apple Sign-In sheet.
- **Firebase_Auth**: The Firebase Authentication SDK used to exchange Apple credentials for a Firebase ID token.
- **Backend_API**: The Laravel API endpoint `POST /api/auth/firebase-login` that verifies Firebase tokens and returns Sanctum tokens.
- **Nonce_Generator**: The utility function `generateNonce()` responsible for producing cryptographic nonce pairs.
- **Apple_Button**: The `AppleAuthentication.AppleAuthenticationButton` component rendered in the login UI.
- **Sanctum_Token**: The Laravel Sanctum bearer token returned by the backend upon successful authentication.
- **Firebase_UID**: The unique identifier assigned by Firebase to a user, derived from the Apple user ID.
- **identityToken**: The signed JWT returned by Apple's identity services, used to construct a Firebase credential.
- **rawNonce**: A 32-character random lowercase hex string passed to Firebase to prevent replay attacks.
- **hashedNonce**: The SHA-256 digest of the `rawNonce`, passed to Apple during sign-in.

---

## Requirements

### Requirement 1: Nonce Generation

**User Story:** As a mobile app, I want to generate a cryptographic nonce pair for each sign-in attempt, so that Apple identity tokens cannot be replayed by an attacker.

#### Acceptance Criteria

1. WHEN the Apple Sign-In flow is initiated, THE Nonce_Generator SHALL produce a `rawNonce` that is a 32-character lowercase hexadecimal string.
2. WHEN the Apple Sign-In flow is initiated, THE Nonce_Generator SHALL produce a `hashedNonce` that is the SHA-256 digest of the `rawNonce`.
3. WHEN two nonce pairs are generated independently, THE Nonce_Generator SHALL produce distinct `rawNonce` values with overwhelming probability.
4. WHEN two nonce pairs are generated independently, THE Nonce_Generator SHALL produce distinct `hashedNonce` values with overwhelming probability.

---

### Requirement 2: Apple Sign-In Button Availability

**User Story:** As a mobile app user on iOS, I want to see a "Sign In with Apple" button on the login screen, so that I can authenticate using my Apple ID.

#### Acceptance Criteria

1. WHEN the LoginScreen mounts, THE LoginScreen SHALL call `Apple_Auth.isAvailableAsync()` to determine whether Apple Sign-In is supported on the current device.
2. WHEN `Apple_Auth.isAvailableAsync()` returns `true`, THE LoginScreen SHALL render the Apple_Button.
3. WHEN `Apple_Auth.isAvailableAsync()` returns `false`, THE LoginScreen SHALL NOT render the Apple_Button.
4. THE Apple_Button SHALL use the `SIGN_IN` button type and `BLACK` button style consistent with Apple's Human Interface Guidelines.

---

### Requirement 3: Apple Sign-In Flow — Happy Path

**User Story:** As a mobile app user, I want to sign in with my Apple ID, so that I can access the app without creating a separate account.

#### Acceptance Criteria

1. WHEN a user taps the Apple_Button, THE LoginScreen SHALL set `isLoading` to `true` and call `Apple_Auth.signInAsync()` with the `hashedNonce` and requesting `FULL_NAME` and `EMAIL` scopes.
2. WHEN Apple returns a valid `identityToken`, THE LoginScreen SHALL construct a Firebase `OAuthProvider` credential using the `identityToken` and `rawNonce`.
3. WHEN the Firebase `OAuthProvider` credential is constructed, THE LoginScreen SHALL call `Firebase_Auth.signInWithCredential()` to obtain a Firebase `UserCredential`.
4. WHEN a Firebase `UserCredential` is obtained, THE LoginScreen SHALL call `userCredential.user.getIdToken()` to retrieve a Firebase ID token.
5. WHEN a Firebase ID token is obtained, THE LoginScreen SHALL POST it to the Backend_API as the `firebase_token` field.
6. WHEN the Backend_API returns a Sanctum_Token and user object, THE LoginScreen SHALL call `AuthContext.signIn(token, user)` to update the authentication state.
7. WHEN `AuthContext.signIn(token, user)` is called successfully, THE LoginScreen SHALL navigate the user to the main application.

---

### Requirement 4: Apple Sign-In Flow — Cancellation

**User Story:** As a mobile app user, I want the app to handle my cancellation of the Apple sign-in sheet gracefully, so that I am returned to the login screen without any error messages.

#### Acceptance Criteria

1. WHEN the user cancels the Apple authentication sheet (error code `ERR_REQUEST_CANCELED`), THE LoginScreen SHALL NOT display any alert or error message.
2. WHEN the user cancels the Apple authentication sheet, THE LoginScreen SHALL reset `isLoading` to `false`.
3. WHEN the user cancels the Apple authentication sheet, THE LoginScreen SHALL leave the authentication state unchanged.

---

### Requirement 5: Apple Sign-In Flow — Error Handling

**User Story:** As a mobile app user, I want to receive clear feedback when Apple sign-in fails, so that I know I can retry.

#### Acceptance Criteria

1. IF Apple returns a credential with a `null` `identityToken`, THEN THE LoginScreen SHALL display a generic error alert and reset `isLoading` to `false`.
2. IF `Firebase_Auth.signInWithCredential()` throws an error, THEN THE LoginScreen SHALL display the alert "No se pudo iniciar sesión con Apple. Inténtalo de nuevo." and reset `isLoading` to `false`.
3. IF the Backend_API returns an HTTP 401 response, THEN THE LoginScreen SHALL clear the stored Sanctum_Token and call `AuthContext.signOut()` to return the user to the login screen.
4. WHEN any error occurs during the sign-in flow, THE LoginScreen SHALL reset `isLoading` to `false` in the `finally` block regardless of the error type.

---

### Requirement 6: Backend User Provisioning

**User Story:** As a new Apple user, I want the app to create my account automatically on first sign-in, so that I do not need to register separately.

#### Acceptance Criteria

1. WHEN the Backend_API receives a Firebase ID token from an Apple sign-in for a new user, THE Backend_API SHALL create a new user record with `name`, `email`, and `firebase_uid` populated from the Firebase token claims.
2. WHEN the Backend_API receives a Firebase ID token from an Apple sign-in for an existing user, THE Backend_API SHALL return the existing user record without creating a duplicate.
3. WHEN Apple omits `email` and `fullName` on repeat sign-ins, THE Backend_API SHALL use the Firebase-cached profile data (available in the Firebase ID token claims) to identify and return the existing user.
4. WHEN a social-only Apple user is created, THE Backend_API SHALL store a random bcrypt hash as the user's `password` field.

---

### Requirement 7: Backend API Compatibility

**User Story:** As the backend API, I want to handle Apple Sign-In tokens identically to Google Sign-In tokens, so that no backend code changes are required.

#### Acceptance Criteria

1. THE Backend_API SHALL accept Firebase ID tokens from Apple Sign-In using the same `POST /api/auth/firebase-login` endpoint used for Google Sign-In.
2. THE Backend_API SHALL verify Apple-originated Firebase ID tokens using the same `verifyIdToken()` method used for Google-originated tokens.
3. WHEN processing an Apple-originated Firebase ID token, THE Backend_API SHALL read `sub`, `email`, and `name` claims using the same logic applied to Google-originated tokens.

---

### Requirement 8: Mobile App Configuration

**User Story:** As a developer, I want the mobile app to be correctly configured for Apple Sign-In, so that the feature works in production builds.

#### Acceptance Criteria

1. THE `app.json` SHALL include `expo-apple-authentication` in the `plugins` array.
2. THE `app.json` SHALL include `expo-crypto` as a dependency for nonce hashing.
3. THE Firebase project SHALL have Apple configured as an enabled Sign-In provider with a valid Services ID, OAuth redirect domain, and Apple private key.
4. THE Apple Developer portal SHALL have Sign In with Apple capability enabled for the app's App ID `org.reydereyestotonicapan.grafe`.
