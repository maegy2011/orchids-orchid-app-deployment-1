import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function isLegacySha256Hash(hash: string): boolean {
  return /^[a-f0-9]{64}$/.test(hash);
}

export async function migrateLegacyHash(password: string, legacyHash: string): Promise<string | null> {
  const crypto = await import("crypto");
  const sha256Hash = crypto.createHash("sha256").update(password).digest("hex");
  
  if (sha256Hash === legacyHash) {
    return hashPassword(password);
  }
  return null;
}

export interface PasswordValidationResult {
  valid: boolean;
  error?: string;
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
  if (password.length < 8) {
    return { valid: false, error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل" };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل" };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "كلمة المرور يجب أن تحتوي على رقم واحد على الأقل" };
  }

  return { valid: true };
}
