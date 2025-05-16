import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordPolicyService {
  validatePasswordStrength(password: string): boolean {
    // At least 12 characters with uppercase, lowercase, number, special char
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    return strongPasswordRegex.test(password);
  }

  generateSecurePassword(): string {
    // Generate a random secure password
    const length = 16;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let password = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    // Ensure it meets requirements by adding specific types if needed
    if (!/[a-z]/.test(password)) password = password.slice(0, -1) + 'a';
    if (!/[A-Z]/.test(password)) password = password.slice(0, -1) + 'A';
    if (!/\d/.test(password)) password = password.slice(0, -1) + '5';
    if (!/[!@#$%^&*()_+]/.test(password))
      password = password.slice(0, -1) + '!';

    return password;
  }
}
