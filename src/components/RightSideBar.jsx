import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import "./styles/RightSideBar.css";

const API_URL = "http://localhost:3001/api";

function RightSideBar() {
  const [inputValue, setValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [messages, setMessages] = useState([]);
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
      }
    } catch (error) {
      console.error("Ошибка при загрузке истории:", error);
    }
  };

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const onClickSendButton = async (event) => {
    if (event) {
      event.preventDefault();
    }

    if (isLoading) {
      return;
    }

    if (!userId) {
      setErrorMessage("Ошибка: пользователь не авторизован");
      return;
    }

    if (inputValue.trim() === "") {
      setErrorMessage("Вы должны что-то написать!");
      setValue("");
      return;
    }

    const userMessage = inputValue;
    setValue("Ожидаю ответа от нейросети...");
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Добавляем сообщение пользователя
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: userMessage, sender: "user" },
      ]);

      // Отправляем сообщение на сервер
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
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
        setValue("");
      } else {
        setErrorMessage(data.error || "Ошибка при получении ответа");
        setValue("");
      }
    } catch (error) {
      console.error("Ошибка при отправке сообщения:", error);
      setErrorMessage("Ошибка при отправке сообщения. Попробуйте позже.");
      setValue("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onClickSendButton(event);
    }
  };

  // Эффект для автоматической прокрутки к последнему сообщению
  useEffect(() => {
    if (chatContainerRef.current) {
      const chatContainer = document.getElementById("chat-container");
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  const LoadingIndicator = () => (
    <div className="flex items-center space-x-2 p-4 bg-neutral-600 text-white self-start rounded-bl-none rounded-xl max-w-[70%]">
      <div
        className="w-2 h-2 bg-white rounded-full animate-bounce"
        style={{ animationDelay: "0ms" }}
      ></div>
      <div
        className="w-2 h-2 bg-white rounded-full animate-bounce"
        style={{ animationDelay: "150ms" }}
      ></div>
      <div
        className="w-2 h-2 bg-white rounded-full animate-bounce"
        style={{ animationDelay: "300ms" }}
      ></div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-full m-auto">
      <div id="chat-container" className="flex-1 overflow-y-auto p-4 pt-10">
        <div
          id="chat-messages"
          className="flex flex-col mx-auto w-1/2 max-w-[800px] min-w-[300px]"
        >
          {messages.map((msg, index) => (
            <div
              key={`${msg.sender}-${index}`}
              className={`chat-message px-4 py-2 my-2 max-w-[70%] rounded-xl ${
                msg.sender === "user"
                  ? "bg-neutral-700 text-white self-end rounded-br-none p-2"
                  : "bg-neutral-600 text-white self-start rounded-bl-none p-2"
              } break-words whitespace-pre-wrap`}
            >
              <ReactMarkdown
                components={{
                  h3: ({ node, ...props }) => (
                    <h3 className="text-2xl font-bold mb-4" {...props} />
                  ),
                  h4: ({ node, ...props }) => (
                    <h4 className="text-xl font-bold mb-3" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-bold" {...props} />
                  ),
                  p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-5 mb-4 space-y-2" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="leading-relaxed" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol
                      className="list-decimal pl-5 mb-4 space-y-2"
                      {...props}
                    />
                  ),
                  br: () => <br className="mb-2" />,
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          ))}
          {isLoading && <LoadingIndicator />}
          <div ref={chatContainerRef}></div>
        </div>
      </div>
      <div
        id="input-bar"
        className="flex-col flex items-center gap-0 pb-12 m-auto"
      >
        <form
          onSubmit={onClickSendButton}
          className="flex items-center gap-4 m-auto"
        >
          <input
            disabled={isLoading}
            id="input-place"
            type="text"
            placeholder={
              isLoading
                ? "Ожидаю ответа от нейросети..."
                : "Напишите о своем сне..."
            }
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            className="flex-1 w-[740px] m-auto items-center border-none text-white bg-neutral-700 p-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            id="input-button"
            type="submit"
            disabled={isLoading}
            className="bg-neutral-700 text-white p-4 rounded-md transition duration-200 hover:bg-emerald-500 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
          >
            {isLoading ? "Ожидание..." : "Отправить"}
          </button>
        </form>
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
