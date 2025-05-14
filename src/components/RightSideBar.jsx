import { useState, useRef, useEffect } from "react";
import "./styles/RightSideBar.css";

function RightSideBar() {
  const [inputValue, setValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const chatContainerRef = useRef(null);
  const [isInputDisabled, setIsInputDisabled] = useState(false);

  // Загружаем сообщения из localStorage при монтировании
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    console.log("Loaded messages from localStorage:", savedMessages);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
      setShowWelcome(false);
    }
  }, []);

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const onClickSendButton = () => {
    if (inputValue.trim() === "") {
      setErrorMessage("You should type anything!");
      setValue("");
    } else {
      const newMessages = [...messages, { text: inputValue, sender: "user" }];

      setIsInputDisabled(true);

      setTimeout(() => {
        //задержка сообщений
        setMessages(newMessages);
      }, 500);
      setValue("");
      setErrorMessage("");
      setShowWelcome(false);

      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: "This is a bot response!", sender: "bot" },
        ]);
        setIsInputDisabled(false);
      }, 1000);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onClickSendButton();
    }
  };

  // Сохраняем сообщения в localStorage при каждом изменении
  useEffect(() => {
    if (messages.length > 0) {
      console.log("Saving messages to localStorage:", messages);
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

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
              <h1>Let's talk about your dreams...</h1>
            </div>
          )}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message px-4 py-2 my-2 max-w-[70%] rounded-xl ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white self-end rounded-br-none p-2"
                  : "bg-gray-200 text-black self-start rounded-bl-none p-2"
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
            disabled={isInputDisabled}
            id="input-place"
            type="text"
            placeholder="Send me your dream"
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            className="flex-1 w-[740px] m-auto items-center border-none text-white bg-neutral-700 p-4 rounded"
          />
          <button
            id="input-button"
            onClick={onClickSendButton}
            className="bg-neutral-700 text-white p-4 rounded-md transition duration-200 hover:bg-emerald-500 hover:text-black"
          >
            Send
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
