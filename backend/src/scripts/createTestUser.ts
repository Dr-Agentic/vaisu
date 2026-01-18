import { fileURLToPath } from 'url';

import { userRepository } from '../repositories/userRepository.js';
import { authUtils } from '../utils/auth.js';

async function createTestUser() {
  const email = 'test@example.com';
  const password = 'Password123!';

  console.log(`Checking if user ${email} exists...`);
  try {
    const existingUser = await userRepository.getUserByEmail(email);

    if (existingUser) {
      console.log('User already exists. Updating password...');
      const passwordHash = await authUtils.hashPassword(password);
      await userRepository.updateUser(existingUser.userId, {
        passwordHash,
        status: 'active',
        emailVerified: true,
        failedLoginAttempts: 0,
        lockedUntil: undefined,
      });
      console.log('User updated successfully.');
    } else {
      console.log('Creating new test user...');
      const passwordHash = await authUtils.hashPassword(password);
      await userRepository.createUser({
        email,
        firstName: 'Test',
        lastName: 'User',
        passwordHash,
      });

      // Get the user to update status to active
      const newUser = await userRepository.getUserByEmail(email);
      if (newUser) {
        await userRepository.updateUser(newUser.userId, {
          status: 'active',
          emailVerified: true,
        });
      }
      console.log('User created successfully.');
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    process.exit(1);
  }
  console.log('Done.');
  process.exit(0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createTestUser();
}
