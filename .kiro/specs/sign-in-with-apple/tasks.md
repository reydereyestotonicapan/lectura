# Implementation Plan: Sign In with Apple

## Overview

All changes are confined to the mobile app (`mobile/`). The implementation installs two Expo packages, adds a `generateNonce` utility, wires the Apple OAuth credential into the existing Firebase sign-in flow, and renders the Apple button conditionally on iOS. No backend changes are required.

## Tasks

- [x] 1. Install dependencies and update app configuration
  - Run `npx expo install expo-apple-authentication expo-crypto` in the `mobile/` directory
  - Add `"expo-apple-authentication"` to the `plugins` array in `mobile/app.json` (after the existing plugins)
  - Verify `expo-crypto` is listed in `mobile/package.json` dependencies
  - _Requirements: 8.1, 8.2_

- [x] 2. Add Apple OAuth provider export to `firebase.ts`
  - [x] 2.1 Export `appleProvider` from `mobile/src/auth/firebase.ts` (or wherever `firebaseAuth` is initialised)
    - Import `OAuthProvider` from `firebase/auth`
    - Export `export const appleProvider = new OAuthProvider('apple.com');`
    - _Requirements: 3.2_

- [x] 3. Implement `generateNonce` utility
  - [x] 3.1 Create `mobile/src/utils/generateNonce.ts` with the `generateNonce` function
    - Produce a 32-character lowercase hex `rawNonce` using `Math.random()`
    - Compute `hashedNonce` via `Crypto.digestStringAsync(SHA256, rawNonce)`
    - Return `{ rawNonce, hashedNonce }`
    - Export the `NoncePayload` interface
    - _Requirements: 1.1, 1.2_

  - [ ]* 3.2 Write property test for `generateNonce` — Property 1: Nonce integrity
    - **Property 1: Nonce integrity** — for any generated pair, `sha256(rawNonce) === hashedNonce`
    - **Validates: Requirements 1.2**
    - Mock `expo-crypto` to return a deterministic hash and assert the output matches

  - [ ]* 3.3 Write property test for `generateNonce` — Property 2: Nonce uniqueness
    - **Property 2: Nonce uniqueness** — two independently generated nonces are distinct
    - **Validates: Requirements 1.3, 1.4**
    - Call `generateNonce()` twice and assert `rawNonce` and `hashedNonce` differ

- [x] 4. Implement `handleAppleSignIn` handler in `LoginScreen`
  - [x] 4.1 Add `appleAvailable` state and `isAvailableAsync` check to `LoginScreen.tsx`
    - Import `expo-apple-authentication`
    - Add `const [appleAvailable, setAppleAvailable] = useState(false);`
    - Add `useEffect(() => { AppleAuthentication.isAvailableAsync().then(setAppleAvailable); }, []);`
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 4.2 Implement `handleAppleSignIn` in `LoginScreen.tsx`
    - Call `generateNonce()` to obtain `rawNonce` and `hashedNonce`
    - Call `AppleAuthentication.signInAsync` with `hashedNonce` and `FULL_NAME`/`EMAIL` scopes
    - Guard against `null` `identityToken` — show generic error alert and return
    - Build `OAuthProvider('apple.com').credential({ idToken, rawNonce })`
    - Call `signInWithCredential(firebaseAuth, oauthCredential)`
    - Call `userCredential.user.getIdToken()` to get the Firebase ID token
    - Call `firebaseLogin(firebaseIdToken)` from `api/auth.ts`
    - Call `signIn(token, user)` from `AuthContext`
    - Catch `ERR_REQUEST_CANCELED` silently (no alert)
    - Catch all other errors and show `Alert.alert('Error', 'No se pudo iniciar sesión con Apple. Inténtalo de nuevo.')`
    - Reset `isLoading` to `false` in the `finally` block
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.4_

  - [ ]* 4.3 Write property test for `handleAppleSignIn` — Property 3: Cancel is silent
    - **Property 3: Cancel is silent** — when Apple throws `ERR_REQUEST_CANCELED`, no `Alert.alert` is called and `isLoading` resets to `false`
    - **Validates: Requirements 4.1, 4.2, 4.3**
    - Mock `expo-apple-authentication` to throw `{ code: 'ERR_REQUEST_CANCELED' }`
    - Assert `Alert.alert` was not called and loading state is `false`

  - [ ]* 4.4 Write property test for `handleAppleSignIn` — Property 4: Auth state consistency
    - **Property 4: Auth state consistency** — after a successful sign-in, `isAuthenticated === true`, `user !== null`, and `token !== null`
    - **Validates: Requirements 3.6, 3.7**
    - Mock all dependencies to return valid data and assert `AuthContext.signIn` was called with a non-null token and user

- [x] 5. Render the Apple Sign-In button in `LoginScreen.tsx`
  - [x] 5.1 Add the `AppleAuthenticationButton` to the JSX of `LoginScreen.tsx`
    - Render conditionally: `{appleAvailable && <AppleAuthentication.AppleAuthenticationButton ... />}`
    - Use `buttonType={SIGN_IN}`, `buttonStyle={BLACK}`, `cornerRadius={Radii.lg}`, `onPress={handleAppleSignIn}`
    - Add `appleBtn` style: `{ width: '100%', height: 50, marginTop: 12 }`
    - _Requirements: 2.2, 2.3, 2.4_

  - [ ]* 5.2 Write property test for button visibility — Property 5: Button visibility
    - **Property 5: Button visibility** — the Apple button is not rendered when `isAvailableAsync()` returns `false`
    - **Validates: Requirements 2.2, 2.3**
    - Render `LoginScreen` with `isAvailableAsync` mocked to `false` and assert the button is absent from the tree

- [x] 6. Checkpoint — Ensure all tests pass
  - Run the mobile test suite and confirm all unit and property tests pass. Ask the user if any questions arise.

- [x] 7. Verify backend API compatibility (no code changes)
  - [x] 7.1 Confirm `firebaseLogin` in `mobile/src/api/auth.ts` sends `{ firebase_token }` regardless of provider
    - Read the existing `firebaseLogin` function and assert its call signature is unchanged
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 7.2 Write property test for backend compatibility — Property 6: Backend compatibility
    - **Property 6: Backend compatibility** — `firebaseLogin(appleToken)` and `firebaseLogin(googleToken)` produce the same request shape
    - **Validates: Requirements 7.1, 7.2, 7.3**
    - Mock `axios.post` and assert both calls send `{ firebase_token: <string> }` to the same endpoint

- [ ] 8. Final checkpoint — Ensure all tests pass
  - Run the full mobile test suite. Ensure all tests pass. Ask the user if any questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- All changes are in `mobile/` — no Laravel/backend files are modified
- The backend already handles Apple-originated Firebase tokens identically to Google tokens (Requirement 7)
- Apple Sign-In requires a physical iOS device for manual end-to-end verification; automated tests cover all unit-testable paths
- `expo-apple-authentication` and `expo-crypto` are first-party Expo packages compatible with the managed workflow (Expo 54)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "3.1"] },
    { "id": 1, "tasks": ["3.2", "3.3", "4.1"] },
    { "id": 2, "tasks": ["4.2"] },
    { "id": 3, "tasks": ["4.3", "4.4", "5.1"] },
    { "id": 4, "tasks": ["5.2", "7.1"] },
    { "id": 5, "tasks": ["7.2"] }
  ]
}
```
