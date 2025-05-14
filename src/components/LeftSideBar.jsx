import { Link } from "react-router-dom";
import "./styles/LeftSideBar.css";

function LeftSideBar() {
  const clearStorage = () => {
    localStorage.clear(); // Очищает весь localStorage
    console.log("LocalStorage has been cleared!");
    window.location.reload(); // Перезагружает страницу, чтобы изменения вступили в силу
  };
  return (
    <>
      <div id="left-header">
        <p>Dream Analyzer</p>
      </div>
      <div id="left-side-container">
        <div id="btns-container">
          <Link to="/mainpage" className="left-menu-btns">
            Chat
          </Link>
          <Link to="/calendar" className="left-menu-btns">
            Calendar
          </Link>
          <Link to="/contacts" className="left-menu-btns">
            Contacts
          </Link>
          <Link to="/faq" className="left-menu-btns">
            FAQ
          </Link>
          <Link to="/authpage" className="left-menu-btns">
            Log out
          </Link>
        </div>
      </div>
      <div className="flex flex-row py-0 px-[10px] my-[10px] mx-0 h-[65%] items-end">
        <button
          className="p-[8px] text-[0.9rem] text-left bg-neutral-800 text-white rounded-[10px] border-none w-full hover:cursor-pointer hover:bg-neutral-700"
          onClick={clearStorage}
        >
          Clear storage
        </button>
      </div>
    </>
  );
}

export default LeftSideBar;
