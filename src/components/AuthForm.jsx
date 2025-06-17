import React, { useState } from "react";
import InputField from "./InputField";
import { useNavigate } from "react-router-dom";
import "./styles/Authform.css";

const API_URL = "http://localhost:3001/api";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Пароли не совпадают!");
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? "/login" : "/register";
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (isLogin) {
          localStorage.setItem("userId", data.userId);
          navigate("/mainpage");
        } else {
          setIsLogin(true);
          setError("Регистрация успешна! Теперь вы можете войти.");
        }
      } else {
        setError(data.error || "Произошла ошибка");
      }
    } catch (err) {
      setError("Не удалось подключиться к серверу");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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
        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="h-full">
          <div></div>
          <InputField
            type="text"
            name="username"
            placeholder="Введите логин"
            value={formData.username}
            onChange={handleChange}
            disabled={isLoading}
          />
          <InputField
            type="password"
            name="password"
            placeholder="Введите пароль"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
          />
          {!isLogin && (
            <InputField
              type="password"
              name="confirmPassword"
              placeholder="Подтвердите пароль"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
            />
          )}
          <button
            type="submit"
            className="w-68 p-[10px] bg-emerald-500 hover:bg-emerald-600 border-none text-white text-[16px] rounded-[6px] cursor-pointer transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading
              ? "Загрузка..."
              : isLogin
              ? "Войти"
              : "Зарегистрироваться"}
          </button>
        </form>
        <p
          className="text-neutral-400 cursor-pointer mt-[25px] text-[14px] hover:underline"
          onClick={() => {
            setIsLogin(!isLogin);
            setError("");
          }}
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
