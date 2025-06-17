import { useState, useRef, useEffect } from "react";
import "./styles/RightSideBar.css";

const API_URL = "http://localhost:3001/api";

function RightSideBar() {
  const [inputValue, setValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const [userId, setUserId] = useState(null);

  // Загружаем userId из localStorage при монтировании
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
      // Загружаем историю сообщений
      fetchChatHistory(storedUserId);
    }
  }, []);

  const fetchChatHistory = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/chat/history/${userId}`);
      const data = await response.json();
      if (data.success) {
        setMessages(
          data.messages.map((msg) => ({
            text: msg.message,
            sender: msg.is_bot ? "bot" : "user",
          }))
        );
        setShowWelcome(false);
      }
    } catch (error) {
      console.error("Ошибка при загрузке истории:", error);
    }
  };

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const onClickSendButton = async () => {
    if (!userId) {
      setErrorMessage("Ошибка: пользователь не авторизован");
      return;
    }

    if (inputValue.trim() === "") {
      setErrorMessage("Вы должны что-то написать!");
      setValue("");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      // Добавляем сообщение пользователя
      const newMessages = [...messages, { text: inputValue, sender: "user" }];
      setMessages(newMessages);
      setValue("");
      setShowWelcome(false);

      // Отправляем сообщение на сервер
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputValue,
          userId: userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Добавляем ответ бота
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: data.response, sender: "bot" },
        ]);
      } else {
        setErrorMessage(data.error || "Ошибка при получении ответа");
      }
    } catch (error) {
      console.error("Ошибка при отправке сообщения:", error);
      setErrorMessage("Ошибка при отправке сообщения. Попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onClickSendButton();
    }
  };

  useEffect(() => {
    chatContainerRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen w-full m-auto">
      <div id="chat-container" className="flex-1 overflow-y-auto p-4 pt-10">
        <div id="chat-messages" className="flex flex-col mx-auto w-1/2">
          {showWelcome && (
            <div
              id="welcome-text"
              className="text-[3rem] m-auto text-white mt-90"
            >
              <h1>Давайте поговорим о ваших снах...</h1>
            </div>
          )}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message px-4 py-2 my-2 max-w-[70%] rounded-xl ${
                msg.sender === "user"
                  ? "bg-neutral-700 text-white self-end rounded-br-none p-2"
                  : "bg-neutral-600 text-white self-start rounded-bl-none p-2"
              } break-words`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={chatContainerRef}></div>
        </div>
      </div>
      <div
        id="input-bar"
        className="flex-col flex items-center gap-0 pb-12 m-auto"
      >
        <div className="flex items-center gap-4 m-auto">
          <input
            disabled={isLoading}
            id="input-place"
            type="text"
            placeholder="Напишите о своем сне..."
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            className="flex-1 w-[740px] m-auto items-center border-none text-white bg-neutral-700 p-4 rounded"
          />
          <button
            id="input-button"
            onClick={onClickSendButton}
            disabled={isLoading}
            className="bg-neutral-700 text-white p-4 rounded-md transition duration-200 hover:bg-emerald-500 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Отправка..." : "Отправить"}
          </button>
        </div>
        <div>
          {errorMessage && (
            <p
              className="errors text-[14px] pt-[2px]"
              style={{ color: "#9b9b9b" }}
            >
              {errorMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RightSideBar;
