import "./styles/MainPage.css";
import LeftSideBar from "./LeftSideBar";

function MainPage({ children }) {
  return (
    <div id="main-container">
      <div id="left-side">
        <LeftSideBar />
      </div>
      <div id="right-side">{children}</div>
    </div>
  );
}

export default MainPage;
