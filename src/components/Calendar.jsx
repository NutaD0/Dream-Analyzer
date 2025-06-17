import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "./styles/Calendar.css";
import { format } from "date-fns";

const API_URL = "http://localhost:3001/api";

function DreamCalendar() {
  const [date, setDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dreamTitle, setDreamTitle] = useState("");
  const [dreamDescription, setDreamDescription] = useState("");
  const [savedDreams, setSavedDreams] = useState([]);
  const [isDreamOpen, setIsDreamOpen] = useState(false);
  const [activeDream, setActiveDream] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchDreams(userId);
    }
  }, []);

  const fetchDreams = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/dreams/${userId}`);
      const data = await response.json();
      if (data.success) {
        console.log("Received dreams from server:", data.dreams);
        const formattedDreams = data.dreams.map((dream) => ({
          ...dream,
          date: dream.dream_date,
        }));
        setSavedDreams(formattedDreams);
      }
    } catch (error) {
      console.error("Ошибка при загрузке снов:", error);
      setError("Не удалось загрузить сны");
    }
  };

  const openDream = () => {
    setIsDreamOpen(true);
  };

  const closeDream = () => {
    setIsDreamOpen(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDreamTitle("");
    setDreamDescription("");
    setError("");
  };

  const saveDream = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("Ошибка: пользователь не авторизован");
      return;
    }

    if (!dreamTitle.trim() || !dreamDescription.trim()) {
      setError("Заполните все поля");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const formattedDate = format(date, "dd.MM.yyyy");
      const response = await fetch(`${API_URL}/dreams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          title: dreamTitle,
          description: dreamDescription,
          dreamDate: formattedDate,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const newDream = {
          title: dreamTitle,
          description: dreamDescription,
          dream_date: formattedDate,
          date: formattedDate,
        };
        setSavedDreams((prevDreams) => [...prevDreams, newDream]);
        closeModal();
      } else {
        setError(data.error || "Ошибка при сохранении сна");
      }
    } catch (error) {
      console.error("Ошибка при сохранении сна:", error);
      setError("Не удалось сохранить сон");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dark bg-neutral-800 min-h-screen text-white items-center flex justify-center flex-col overflow-y-auto">
      <div className="flex w-1/2 flex-col">
        <h1 className="flex justify-start text-3xl">Выберите дату</h1>
        <p className="flex justify-end">
          Выбранная дата: {format(date, "dd.MM.yyyy")}
        </p>
      </div>
      <Calendar onChange={setDate} value={date} />
      <button
        onClick={openModal}
        className="bg-neutral-700 py-3 px-2 rounded-md transition duration-200 mt-5 w-1/2 hover:bg-emerald-500 hover:text-black"
      >
        Написать сон
      </button>

      <h1 className="text-xl pt-5">Список сохраненных снов:</h1>

      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-neutral-900/80 flex justify-center items-center">
          <div className="bg-neutral-700 p-6 rounded-lg w-1/3">
            <h2 className="text-xl text-white mb-4">Запишите ваш сон</h2>

            {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

            <input
              type="text"
              className="w-full mb-4 p-2 bg-neutral-800 text-white rounded-md"
              placeholder="Заголовок сна"
              value={dreamTitle}
              onChange={(e) => setDreamTitle(e.target.value)}
              disabled={isLoading}
            />

            <textarea
              className="w-full mb-4 p-2 bg-neutral-800 text-white rounded-md"
              placeholder="Описание сна"
              rows="4"
              value={dreamDescription}
              onChange={(e) => setDreamDescription(e.target.value)}
              disabled={isLoading}
            />

            <div className="flex justify-end">
              <button
                onClick={saveDream}
                disabled={isLoading}
                className="bg-emerald-500 text-black py-2 px-4 rounded-md transition duration-200 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Сохранение..." : "Сохранить"}
              </button>
              <button
                onClick={closeModal}
                disabled={isLoading}
                className="bg-neutral-600 text-white py-2 px-4 rounded-md ml-2 transition duration-200 hover:bg-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col w-full items-center h-70 overflow-y-auto">
        {savedDreams.map((dream, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveDream(dream);
              setIsDreamOpen(true);
            }}
            className="mt-3 w-1/2 bg-neutral-700 py-3 px-4 rounded-md text-white transition duration-200 hover:bg-neutral-600"
          >
            <div className="flex justify-between items-center">
              <span>{dream.title}</span>
              <span className="text-sm text-neutral-400">{dream.date}</span>
            </div>
          </button>
        ))}
      </div>

      {isDreamOpen && activeDream && (
        <div className="fixed top-0 left-0 w-full h-full bg-neutral-900/80 flex justify-center items-center">
          <div className="bg-neutral-700 p-6 rounded-lg w-1/3">
            <h2 className="text-xl text-white mb-2">{activeDream.title}</h2>
            <p className="text-neutral-400 mb-4">
              Дата: {activeDream.dream_date || activeDream.date}
            </p>

            <div className="w-full mb-4 p-2 bg-neutral-800 text-white rounded-md break-all">
              {activeDream.description}
            </div>

            <div className="flex justify-end">
              <button
                onClick={closeDream}
                className="bg-neutral-600 text-white py-2 px-4 rounded-md ml-2 transition duration-200 hover:bg-neutral-500"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DreamCalendar;
