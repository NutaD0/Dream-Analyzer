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
          <Link to="/authpage" className="left-menu-btns">
            Log out
          </Link>
        </div>
      </div>
    </>
  );
}

export default LeftSideBar;
