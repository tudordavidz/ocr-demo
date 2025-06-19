import { DatabaseService } from '../src/services/database';
import * as path from 'path';
import * as fs from 'fs';

// Test database setup
const TEST_DB_PATH = ':memory:'; // Use in-memory database for tests

let testDb: DatabaseService;

beforeEach(async () => {
  // Initialize test database before each test
  testDb = new DatabaseService(TEST_DB_PATH);
});

afterEach(async () => {
  // Clean up after each test
  if (testDb) {
    await testDb.close();
  }
});

// Clean up test uploads directory
afterAll(() => {
  const testUploadsDir = path.join(__dirname, '../uploads');
  if (fs.existsSync(testUploadsDir)) {
    fs.rmSync(testUploadsDir, { recursive: true, force: true });
  }
});
