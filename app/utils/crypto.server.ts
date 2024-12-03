import crypto from "crypto";
import { Buffer } from "buffer";

const algorithm = 'aes-256-ctr';
const secretKey = process.env.SHOPIFY_API_SECRET || '';
const secretKeyTrimmed = secretKey.substring(0, 32);
const iv = crypto.randomBytes(16);

/**
 *
 * Description
 *
 * @param  {string} value - value to encrypt
 * @return {string} - string with iv & appended encrypted value
 * @example
 *
 * const encrypted = encrypt('someValue');
 * console.log(encrypted);
 * // 4b6b82ccae7981a2fb18778bee7e05c6.4b6b82ccae7981a2fb18778bee7e05c64b6b82ccae7981a2fb18778bee7e05c6
 *
 */
const encrypt = (value?: string) => {
  console.log("log: middleware: crypto: encrypt");
  if (!value) return;
  console.log("log: middleware: crypto: encrypt: value:", value);
  console.log("log: middleware: crypto: encrypt: algorithm:", algorithm);
  console.log(
    "log: middleware: crypto: encrypt: secretKeyTrimmed:",
    secretKeyTrimmed
  );
  console.log("log: middleware: crypto: encrypt: iv:", iv);
  const cipher = crypto.createCipheriv(algorithm, secretKeyTrimmed, iv);
  const encrypted = Buffer.concat([cipher.update(value), cipher.final()]);
  const ivWithEncryptedString = `${iv.toString("hex")}.${encrypted.toString(
    "hex"
  )}`;
  console.log("log: middleware: crypto: encrypt: cipher:", cipher);
  console.log("log: middleware: crypto: encrypt: encrypted:", encrypted);
  console.log(
    "log: middleware: crypto: encrypt: ivWithEncryptedString:",
    ivWithEncryptedString
  );
  return ivWithEncryptedString;
};

/**
 *
 * Description
 *
 * @param  {string} value - value to encrypt
 * @return {string} - encypted value
 * @example
 *
 * const encryptedValue = '4b6b82ccae7981a2fb18778bee7e05c6.4b6b82ccae7981a2fb18778bee7e05c64b6b82ccae7981a2fb18778bee7e05c6';
 * const decryptedValue = decrypt(encryptedValue)
 * console.log(decryptedValue);
 * // "someValue"
 *
 */
const decrypt = (value?: string) => {
  console.log("log: middleware: crypto: decrypt");
  if (!value) return;
  console.log("log: middleware: crypto: decrypt: value:", value);
  if (value.includes("shpat_")) return value;
  const [iv, content] = value.split(".");
  console.log("log: middleware: crypto: decrypt: iv:", iv);
  console.log("log: middleware: crypto: decrypt: content:", content);
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKeyTrimmed,
    Buffer.from(iv, "hex")
  );
  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(content, "hex")),
    decipher.final(),
  ]);
  const decrpytedString = decrpyted.toString();
  console.log("log: middleware: crypto: decrypt: decipher:", decipher);
  console.log("log: middleware: crypto: decrypt: decrpyted:", decrpyted);
  console.log(
    "log: middleware: crypto: decrypt: decrpytedString:",
    decrpytedString
  );
  return decrpytedString;
};

export { encrypt, decrypt };
