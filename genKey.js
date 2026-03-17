const crypto = require('crypto');
const fs = require('fs');

// Tạo cặp khóa RSA 2048 bits
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  },
});

// Ghi ra file
fs.writeFileSync('private.pem', privateKey);
fs.writeFileSync('public.pem', publicKey);

console.log("-----------------------------------------");
console.log("✅ Đã tạo thành công 2 file mã hóa:");
console.log("1. private.pem (Dùng để ký Token)");
console.log("2. public.pem  (Dùng để xác thực Token)");
console.log("-----------------------------------------");