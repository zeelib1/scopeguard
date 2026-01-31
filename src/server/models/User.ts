import bcrypt from 'bcrypt';
import { query } from '../../database/db';
import { User as UserType } from '../../types';

interface CreateUserParams {
  email: string;
  password: string;
  full_name?: string;
}

interface UpdateSubscriptionParams {
  subscription_status?: string;
  subscription_id?: string;
  stripe_customer_id?: string;
}

interface SanitizedUser {
  id: number;
  email: string;
  name: string;
}

class User {
  // Create new user
  static async create({ email, password, full_name }: CreateUserParams): Promise<SanitizedUser> {
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    const result = query.run(
      `INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)`,
      [email, password_hash, full_name || null]
    );

    return {
      id: Number(result.lastInsertRowid),
      email,
      name: full_name || email
    };
  }

  // Find user by email
  static findByEmail(email: string): UserType | undefined {
    return query.get<UserType>(`SELECT * FROM users WHERE email = ?`, [email]);
  }

  // Find user by ID
  static findById(id: number): UserType | undefined {
    return query.get<UserType>(`SELECT * FROM users WHERE id = ?`, [id]);
  }

  // Verify password
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update subscription
  static updateSubscription(userId: number, { subscription_status, subscription_id, stripe_customer_id }: UpdateSubscriptionParams) {
    return query.run(
      `UPDATE users 
       SET subscription_status = ?, 
           subscription_id = ?, 
           stripe_customer_id = ?
       WHERE id = ?`,
      [subscription_status, subscription_id, stripe_customer_id, userId]
    );
  }

  // Get user without sensitive data
  static sanitize(user: UserType | undefined): SanitizedUser | null {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name
    };
  }
}

export default User;
