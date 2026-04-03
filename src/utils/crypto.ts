import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const secret = process.env.JWT_SECRET || 'katiani-styles-secret-key';
const key = crypto.scryptSync(secret, 'salt', 32);
const iv = Buffer.alloc(16, 0); // In a real app, use a unique IV per encryption

export const encrypt = (text: string) => {
  if (!text) return '';
  try {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  } catch (err) {
    console.error('Encryption error:', err);
    return text;
  }
};

export const decrypt = (text: string) => {
  if (!text) return '';
  try {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    // If it's not encrypted, return as is
    return text;
  }
};
