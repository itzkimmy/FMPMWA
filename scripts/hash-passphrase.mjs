import bcrypt from "bcryptjs";

const passphrase = process.argv[2];

if (!passphrase) {
  console.error("Usage: node scripts/hash-passphrase.mjs <passphrase>");
  process.exit(1);
}

const hash = bcrypt.hashSync(passphrase, 10);
console.log("\nGenerated PASSPHRASE_HASH:");
console.log(hash);
console.log("\nAdd this to your .env.local file:");
console.log(`PASSPHRASE_HASH="${hash.replace(/\$/g, "\\$")}"\n`);
