const bcrypt = require('bcrypt');
const { query } = require('../../database/db');

class User {
  // Create new user
  static async create({ email, password, full_name }) {
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    const result = query.run(
      `INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)`,
      [email, password_hash, full_name || null]
    );

    return {
      id: result.lastInsertRowid,
      email,
      full_name
    };
  }

  // Find user by email
  static findByEmail(email) {
    return query.get(`SELECT * FROM users WHERE email = ?`, [email]);
  }

  // Find user by ID
  static findById(id) {
    return query.get(`SELECT * FROM users WHERE id = ?`, [id]);
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update subscription
  static updateSubscription(userId, { subscription_status, subscription_id, stripe_customer_id }) {
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
  static sanitize(user) {
    if (!user) return null;
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }
}

module.exports = User;
