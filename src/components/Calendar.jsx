import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "./styles/Calendar.css";
import { format } from "date-fns";

function DreamCalendar() {
  const [date, setDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dreamTitle, setDreamTitle] = useState("");
  const [dreamDescription, setDreamDescription] = useState("");
  const [savedDreams, setSavedDreams] = useState([]);
  const [isDreamOpen, setIsDreamOpen] = useState(false);
  const [activeDream, setActiveDream] = useState(null);

  useEffect(() => {
    const savedDreams = localStorage.getItem("dreams");
    console.log("Loaded dreams from localStorage:", savedDreams);
    if (savedDreams) {
      setSavedDreams(JSON.parse(savedDreams));
    }
  }, []);

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
  };

  const saveDream = () => {
    const formattedDate = format(date, "dd.MM.yyyy");
    const dream = {
      title: dreamTitle,
      description: dreamDescription,
      date: formattedDate,
    };

    localStorage.setItem(formattedDate, JSON.stringify(dream));

    setSavedDreams((prevSavedDreams) => [...prevSavedDreams, dream]);

    closeModal();
  };

  useEffect(() => {
    if (savedDreams.length > 0) {
      console.log("Saving dreams to localStorage:", savedDreams);
      localStorage.setItem("dreams", JSON.stringify(savedDreams));
    }
  }, [savedDreams]);

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

            <input
              type="text"
              className="w-full mb-4 p-2 bg-neutral-800 text-white rounded-md"
              placeholder="Заголовок сна"
              value={dreamTitle}
              onChange={(e) => setDreamTitle(e.target.value)}
            />

            <textarea
              className="w-full mb-4 p-2 bg-neutral-800 text-white rounded-md"
              placeholder="Описание сна"
              rows="4"
              value={dreamDescription}
              onChange={(e) => setDreamDescription(e.target.value)}
            />

            <div className="flex justify-end">
              <button
                onClick={saveDream}
                className="bg-emerald-500 text-black py-2 px-4 rounded-md transition duration-200 hover:bg-emerald-600"
              >
                Сохранить
              </button>
              <button
                onClick={closeModal}
                className="bg-neutral-600 text-white py-2 px-4 rounded-md ml-2 transition duration-200 hover:bg-neutral-500"
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
            {dream.title}
          </button>
        ))}
      </div>

      {isDreamOpen && activeDream && (
        <div className="fixed top-0 left-0 w-full h-full bg-neutral-900/80 flex justify-center items-center">
          <div className="bg-neutral-700 p-6 rounded-lg w-1/3">
            <h2 className="text-xl text-white mb-4">
              Сон: {activeDream.title}, Дата: {activeDream.date}
            </h2>

            <div className="w-full mb-4 p-2 bg-neutral-800 text-white rounded-md">
              {activeDream.title}
            </div>

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
