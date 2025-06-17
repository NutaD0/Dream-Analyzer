import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcryptjs";

// Создаем подключение к базе данных
const dbPromise = open({
  filename: "./dream_analyzer.db",
  driver: sqlite3.Database,
});

// Инициализация базы данных
async function initDatabase() {
  const db = await dbPromise;

  // Создаем таблицу пользователей
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Функция для регистрации пользователя
async function registerUser(username, password) {
  try {
    const db = await dbPromise;
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.run("INSERT INTO users (username, password) VALUES (?, ?)", [
      username,
      hashedPassword,
    ]);
    return true;
  } catch (error) {
    console.error("Ошибка при регистрации:", error);
    return false;
  }
}

// Функция для проверки пользователя при входе
async function verifyUser(username, password) {
  try {
    const db = await dbPromise;
    const user = await db.get("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (!user) return false;

    const isValid = await bcrypt.compare(password, user.password);
    return isValid;
  } catch (error) {
    console.error("Ошибка при проверке пользователя:", error);
    return false;
  }
}

initDatabase();

export { registerUser, verifyUser };
