Project: Browser-Only MOSIP-Compatible Proof-of-Age QR Demo
1. Overview
Build a fully client-side web application that:
Accepts a user’s Name and Date of Birth.
Generates a MOSIP-style Verifiable Credential (VC) proving the user is over 18.
Encodes the VC into a PixelPass QR code.
Provides a verification page that:


Opens the camera to scan a QR code, or
Lets the user upload a QR image,
Validates the signature entirely in the browser.


No backend services, servers, or Docker containers are required.
 This is a prototype for demonstration purposes and not a production identity system.

2. Goals & Non-Goals
Goals
End-to-end issuance and verification entirely in the browser.
MOSIP-compatible QR format using PixelPass encoding.
Digital signature using Ed25519 for authenticity.
Two simple pages:
Create: capture name & DOB, display/download QR.
Verify: camera or file upload, display verification result.


Non-Goals
Production-grade key management or secure trust anchors.
Integration with national MOSIP registries or revocation services.
Persistent storage of user data.



3. Functional Requirements
Create Page (/create)
Inputs:
Name (text)
Date of Birth (date picker)


Logic:
Compute if DOB indicates age ≥18.


Construct VC payload:

 {
  "iss": "DemoIssuer",
  "iat": <timestamp>,
  "exp": <timestamp + 1 year>,
  "over18": true,
}


Sign payload using Ed25519 private key (demo key bundled or generated on load).
Encode signed payload as MOSIP PixelPass QR.


Outputs:


Render QR code on page.
Button to download QR image.


Verify Page (/verify)
Inputs:


Camera stream (live scan) or
File upload (PNG/JPG of QR).


Logic:


Decode QR via @mosip/pixelpass.
Verify Ed25519 signature using embedded or hard-coded issuer public key.
Check exp and over18 fields.


Outputs:


Display verification status: Valid / Invalid.
Show decoded claims (name, over18 flag, issue date).



4. Technical Stack
Component
Technology / Library
UI framework
React (or plain HTML/JS)
QR encode/decode
@mosip/pixelpass
Signature (Ed25519)
@noble/ed25519 or WebCrypto
QR scanning
@zxing/browser
Build/deploy
Static site (Vercel / Netlify / GitHub Pages)


5. Security Considerations
Private key is bundled or generated at runtime—not production secure.
Demo issuer’s public key is hard-coded for verification.
No personally identifiable information is stored or sent to servers.



6. Test Cases
ID
Scenario
Steps
Expected Result
TC1
Age ≥18 issuance
Enter DOB 2000-01-01, name “Alice” → Generate QR
QR displays; decoded payload has "over18": true.
TC2
Age <18 blocked
Enter DOB 2010-01-01 → Generate
Error “User not over 18”; no QR created.
TC3
Valid QR verification (camera)
Use camera to scan QR from TC1
“Valid credential”; shows name Alice, over18 true.
TC4
Valid QR verification (upload)
Upload PNG of QR from TC1
Same as TC3.
TC5
Tampered QR
Edit QR payload bytes and present to verify page
Verification fails with “Invalid signature”.
TC6
Expired credential
Change system date >1 year after issuance → Verify
App shows “Credential expired”.
TC7
Offline capability
Disconnect network, refresh app, generate and verify a credential
All features continue to work.


7. Deployment
Serve as a static site—no backend.
Hosting : Vercel



8. Future Enhancements
Integrate with Inji Certify for real MOSIP trust.
Add revocation/issuance registry when moving beyond prototype.