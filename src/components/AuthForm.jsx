import React, { useState } from "react";
import InputField from "./InputField";
import { useNavigate } from "react-router-dom";
import "./styles/Authform.css";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Пароли не совпадают!");
      return;
    }

    const dataToSend = {
      username: formData.username,
      password: formData.password,
    };

    console.log("Отправка данных:", dataToSend);

    navigate("/mainpage");
  };

  return (
    <div className="text-center">
      <header className="fixed top-0 left-0 w-full h-[30px] bg-neutral-700 text-white flex items-center py-0 px-[20px] text-[1.4rem]">
        <p>Dream Analyzer</p>
      </header>
      <div className="bg-neutral-700 p-[30px] rounded-[12px] w-[350px] flex flex-col grow">
        <h2 className="text-white mb-[25px] text-[1.5rem] text-center">
          {isLogin ? "Вход" : "Регистрация"}
        </h2>
        <form onSubmit={handleSubmit} className="h-full">
          <div></div>
          <InputField
            type="username"
            name="username"
            placeholder="Введите логин"
            value={formData.username}
            onChange={handleChange}
          />
          <InputField
            type="password"
            name="password"
            placeholder="Введите пароль"
            value={formData.password}
            onChange={handleChange}
          />
          {!isLogin && (
            <InputField
              type="password"
              name="confirmPassword"
              placeholder="Подтвердите пароль"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          )}
          <button
            type="submit"
            className="w-68 p-[10px] bg-emerald-500 hover:bg-emerald-600 border-none text-white text-[16px] rounded-[6px] cursor-pointer transition duration-300"
          >
            {isLogin ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>
        <p
          className="text-neutral-400 cursor-pointer mt-[25px] text-[14px] hover:underline"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "Нет аккаунта? Зарегистрируйтесь"
            : "Уже есть аккаунт? Войдите"}
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
