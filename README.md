# 🎫 Browser-Only MOSIP-Compatible Zero-Knowledge Proof-of-Age QR Demo

A fully client-side web application that generates and verifies zero-knowledge proofs for age verification (18+) using MOSIP-compatible QR codes.

## ✨ Features

- **🔐 Zero-Knowledge Proofs** - Prove age without revealing birth date
- **🛡️ Privacy-Preserving** - Personal details remain hidden during verification
- **📱 MOSIP-compatible QR format** - Uses PixelPass encoding
- **🔒 Cryptographic Security** - Browser-based ZK proof generation and verification
- **📷 Camera QR scanning** - Live verification via camera
- **📁 File upload support** - Verify QR codes from images
- **⚡ Offline capable** - Works without internet after loading

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

## 📖 How It Works

### Create ZK Proof (`/create`)
1. Enter your name and date of birth
2. System validates you are 18+ years old
3. Generates a zero-knowledge proof of age
4. Encodes ZK proof into MOSIP PixelPass QR code
5. Display QR and download option

### Verify ZK Proof (`/verify`)
1. Scan QR code with camera OR upload image file
2. Decode QR using MOSIP PixelPass
3. Verify zero-knowledge proof cryptographically
4. Check expiration and age claim (without revealing birth date)
5. Display verification result with privacy protection

## 🆚 **ZK Proofs vs Traditional Signatures**

| **Aspect** | **Traditional Signatures** | **Zero-Knowledge Proofs** |
|------------|----------------------------|----------------------------|
| **Privacy** | ❌ Full credential visible | ✅ Only necessary claims visible |
| **Birth Date** | ❌ Always revealed | ✅ Never revealed |
| **Exact Age** | ❌ Calculable from DOB | ✅ Hidden (only ≥18 known) |
| **Data Minimization** | ❌ Over-sharing | ✅ Selective disclosure |
| **Verifier Knowledge** | "Alice, born 2000-01-01, age 24" | "Someone over 18" |
| **Trust Model** | Signature validates data | Proof validates claim |
| **Compliance** | GDPR concerns | GDPR-friendly |

## 🔍 **ZK Proof Contents**

**What's in the QR code:**
```json
{
  "zkProof": {
    "proof": {...},           // Cryptographic proof
    "publicSignals": [
      "1",                    // over18 claim (1=true)
      "2024",                 // current year (public)
      "18",                   // minimum age (public)  
      "0x1a2b3c..."          // commitment hash
    ]
  },
  "metadata": {
    "iss": "ZKDemoIssuer",
    "name": "Alice",          // Could also be hidden
    "iat": 1234567890,
    "exp": 1266103890
  },
  "commitment": "0xabc123..." // Hash of private inputs
}
```

**What verifiers see:** ✅ Age claim + proof validity  
**What verifiers DON'T see:** ❌ Birth date, exact age, birth year

## 🛠️ Technical Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + TypeScript + Vite |
| QR Encoding | @mosip/pixelpass |
| Zero-Knowledge Proofs | Custom browser-based implementation |
| QR Scanning | @zxing/browser |
| Styling | CSS3 with modern gradients |

## 🔒 Zero-Knowledge Proof Details

### **🛡️ Privacy Features**
- **Birth date never revealed** - Only proves "over 18" claim
- **Exact age hidden** - Verifiers can't calculate actual age
- **Cryptographic commitments** - Private data is hashed and hidden
- **Selective disclosure** - Only necessary claims are shared

### **🔬 Technical Implementation**
- **Browser-based ZK proofs** - No server-side computation required
- **Simplified SNARK structure** - Demonstrates ZK proof concepts
- **MOSIP compatibility** - Uses standard PixelPass QR encoding
- **Cryptographic integrity** - Tamper-evident proof validation

### **⚠️ Demo Limitations**
This is a **DEMO for educational purposes only!**

- ZK proof implementation is simplified (NOT production-grade Circom circuits)
- No real trust anchor integration or ceremony
- No revocation checking or registry services
- Demo issuer only (not government-backed)
- Production systems would use full Circom circuits with trusted setup
- Real implementations need formal verification and security audits

## 📱 Test Cases

### ✅ Supported Scenarios
- [x] Age ≥18 ZK proof generation
- [x] Age <18 rejection
- [x] Valid ZK proof verification (camera)
- [x] Valid ZK proof verification (upload)
- [x] ZK proof tampering detection
- [x] Expiration checking
- [x] Privacy-preserving verification
- [x] Offline functionality

### 🧪 Testing Zero-Knowledge Proofs

**Basic Flow:**
1. Open the app at `http://localhost:5173`
2. Navigate to **Create** page
3. Enter name: "Alice" and DOB: "2000-01-01"
4. Generate ZK proof and download QR
5. Navigate to **Verify** page
6. Upload the QR image or scan with camera
7. ✅ Verify the ZK proof shows as valid (**birth date hidden!**)

**Privacy Verification:**
- ✅ Verifier sees: "Alice is over 18"
- ❌ Verifier cannot see: Birth date, exact age, or birth year
- ✅ Only the necessary claim is revealed

**Test Different Scenarios:**
- Try with different ages (18+, under 18)
- Test QR scanning vs file upload
- Verify that tampered QRs are rejected
- Check expiration handling

## 📁 Project Structure

```
src/
├── components/
│   └── Navigation.tsx       # App navigation
├── pages/
│   ├── CreatePage.tsx       # ZK proof creation
│   └── VerifyPage.tsx       # ZK proof verification
├── utils/
│   ├── zkProof.ts          # Zero-knowledge proof generation/verification
│   └── zkQr.ts             # MOSIP PixelPass QR handling for ZK proofs
└── types/
    └── mosip-pixelpass.d.ts # Type definitions
```

## 🚀 Deployment

This is a static site that can be deployed to:
- ✅ Vercel (recommended)
- ✅ Netlify
- ✅ GitHub Pages
- ✅ Any static hosting service

```bash
npm run build
# Deploy the `dist/` folder
```

## 🔮 Future Enhancements

### **🏗️ Production ZK Implementation**
- [ ] **Full Circom circuits** - Replace simplified proofs with production circuits
- [ ] **Trusted setup ceremony** - Generate proper proving/verification keys
- [ ] **Advanced circuits** - Age ranges, multiple claims, selective disclosure
- [ ] **Recursive proofs** - Composition of multiple ZK proofs

### **🌐 MOSIP Integration** 
- [ ] **Inji Certify integration** - Real government trust anchors
- [ ] **Revocation registry** - On-chain or off-chain revocation checking
- [ ] **Trust framework** - Integration with national identity systems
- [ ] **Interoperability** - Cross-border ZK credential verification

### **🚀 Advanced Features**
- [ ] **Multiple credential types** - Education, health, finance proofs
- [ ] **Biometric ZK proofs** - Privacy-preserving biometric matching  
- [ ] **Anonymous credentials** - Full anonymity with selective disclosure
- [ ] **Decentralized identity** - Self-sovereign identity with ZK proofs

### **🔧 Technical Improvements**
- [ ] **WebAssembly optimization** - Faster proof generation in browser
- [ ] **Mobile SDKs** - Native iOS/Android ZK proof libraries
- [ ] **Formal verification** - Mathematical proof of circuit correctness
- [ ] **Performance optimization** - Reduce proof size and generation time

## 📄 License

This project is for educational and demonstration purposes only.

---

Built with ❤️ for MOSIP ecosystem demonstration