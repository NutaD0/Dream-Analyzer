import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Конфигурация DeepSeek
const DEEPSEEK_API_KEY = "sk-38b095d54a2644349b9ef5afd3c4638d";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// Создаем подключение к базе данных
const dbPromise = open({
  filename: path.join(__dirname, "dream_analyzer.db"),
  driver: sqlite3.Database,
});

// Инициализация базы данных
async function initDatabase() {
  const db = await dbPromise;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Создаем таблицу для сообщений чата
  await db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      message TEXT NOT NULL,
      is_bot BOOLEAN NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Создаем таблицу для снов
  await db.exec(`
    CREATE TABLE IF NOT EXISTS dreams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      dream_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
}

// Инициализируем базу данных при запуске
initDatabase();

// Регистрация пользователя
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = await dbPromise;
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.run("INSERT INTO users (username, password) VALUES (?, ?)", [
      username,
      hashedPassword,
    ]);
    res.json({ success: true });
  } catch (error) {
    console.error("Ошибка при регистрации:", error);
    res.status(400).json({
      success: false,
      error: "Пользователь с таким именем уже существует",
    });
  }
});

// Вход пользователя
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = await dbPromise;
    const user = await db.get("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Неверное имя пользователя или пароль",
      });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: "Неверное имя пользователя или пароль",
      });
    }

    res.json({ success: true, userId: user.id });
  } catch (error) {
    console.error("Ошибка при входе:", error);
    res.status(500).json({
      success: false,
      error: "Внутренняя ошибка сервера",
    });
  }
});

// Обработка сообщений чата
app.post("/api/chat", async (req, res) => {
  try {
    const { message, userId } = req.body;
    const db = await dbPromise;

    // Сохраняем сообщение пользователя
    await db.run(
      "INSERT INTO chat_messages (user_id, message, is_bot) VALUES (?, ?, ?)",
      [userId, message, false]
    );

    // Отправляем запрос к DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "Вы - специализированный анализатор снов. ВАЖНО: Вы можете ТОЛЬКО анализировать сны и давать их интерпретацию. Запрещено отвечать на любые другие темы. Если пользователь спрашивает о чем-то, не связанном со снами, ответьте: 'Извините, я могу только анализировать сны. Пожалуйста, расскажите мне о вашем сне для интерпретации.'\n\nПри анализе снов используйте следующий формат с HTML-разметкой:\n\n<h3>Анализ сна:</h3>\n\n<h4>1) Основные символы и их значение:</h4>\n<ul>\n<li>[Перечислите символы и их значения]</li>\n</ul>\n\n<h4>2) Общий эмоциональный фон сна:</h4>\n<ul>\n<li>[Опишите эмоции]</li>\n</ul>\n\n<h4>3) Возможная интерпретация:</h4>\n<ul>\n<li>[Дайте интерпретацию]</li>\n</ul>\n\n<h4>4) Рекомендации:</h4>\n<ul>\n<li>[Предложите рекомендации]</li>\n</ul>",
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        presence_penalty: 0.6,
        frequency_penalty: 0.3,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Обрабатываем различные типы ошибок
      let errorMessage = "Ошибка при обращении к API";

      if (data.error?.message === "Insufficient Balance") {
        errorMessage =
          "Недостаточно средств на балансе API. Пожалуйста, пополните счет.";
      } else if (data.error?.message) {
        errorMessage = data.error.message;
      }

      // Сохраняем сообщение об ошибке как ответ бота
      await db.run(
        "INSERT INTO chat_messages (user_id, message, is_bot) VALUES (?, ?, ?)",
        [userId, errorMessage, true]
      );

      return res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }

    let botResponse = data.choices[0].message.content;

    // Форматируем ответ, заменяя HTML-теги на соответствующие переносы строк
    botResponse = botResponse
      .replace(/<h3>/g, "\n### ")
      .replace(/<\/h3>/g, "\n\n")
      .replace(/<h4>/g, "\n#### ")
      .replace(/<\/h4>/g, "\n")
      .replace(/<ul>/g, "")
      .replace(/<\/ul>/g, "")
      .replace(/<li>/g, "\n- ")
      .replace(/<\/li>/g, "")
      .replace(/<strong>/g, "**")
      .replace(/<\/strong>/g, "**")
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/\n{3,}/g, "\n\n") // Убираем лишние переносы строк
      .replace(/\n\s*\n\s*\n/g, "\n\n") // Убираем множественные пустые строки
      .replace(/^\s+|\s+$/g, "") // Убираем пробелы в начале и конце
      .replace(/\n- /g, "\n- ") // Убираем лишний перенос перед элементами списка
      .replace(/\n\n- /g, "\n- ") // Убираем двойной перенос перед элементами списка
      .replace(/\n\n\n/g, "\n\n") // Убираем тройные переносы
      .replace(/\n#### /g, "\n\n#### ") // Добавляем перенос перед заголовками
      .trim();

    // Сохраняем ответ бота
    await db.run(
      "INSERT INTO chat_messages (user_id, message, is_bot) VALUES (?, ?, ?)",
      [userId, botResponse, true]
    );

    res.json({ success: true, response: botResponse });
  } catch (error) {
    console.error("Ошибка при обработке сообщения:", error);

    // Сохраняем сообщение об ошибке как ответ бота
    try {
      await db.run(
        "INSERT INTO chat_messages (user_id, message, is_bot) VALUES (?, ?, ?)",
        [
          req.body.userId,
          "Произошла ошибка при обработке сообщения. Пожалуйста, попробуйте позже.",
          true,
        ]
      );
    } catch (dbError) {
      console.error("Ошибка при сохранении сообщения об ошибке:", dbError);
    }

    res.status(500).json({
      success: false,
      error: "Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.",
    });
  }
});

// Получение истории сообщений
app.get("/api/chat/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const db = await dbPromise;

    const messages = await db.all(
      "SELECT * FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC",
      [userId]
    );

    res.json({ success: true, messages });
  } catch (error) {
    console.error("Ошибка при получении истории:", error);
    res.status(500).json({
      success: false,
      error: "Ошибка при получении истории сообщений",
    });
  }
});

// Сохранение сна
app.post("/api/dreams", async (req, res) => {
  try {
    const { userId, title, description, dreamDate } = req.body;
    const db = await dbPromise;

    await db.run(
      "INSERT INTO dreams (user_id, title, description, dream_date) VALUES (?, ?, ?, ?)",
      [userId, title, description, dreamDate]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Ошибка при сохранении сна:", error);
    res.status(500).json({
      success: false,
      error: "Ошибка при сохранении сна",
    });
  }
});

// Получение снов пользователя
app.get("/api/dreams/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const db = await dbPromise;

    const dreams = await db.all(
      "SELECT * FROM dreams WHERE user_id = ? ORDER BY dream_date DESC",
      [userId]
    );

    res.json({ success: true, dreams });
  } catch (error) {
    console.error("Ошибка при получении снов:", error);
    res.status(500).json({
      success: false,
      error: "Ошибка при получении снов",
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
