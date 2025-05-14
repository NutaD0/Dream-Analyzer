import React from "react";
import "./styles/InputField.css";

const InputField = ({ type, name, placeholder, value, onChange }) => {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-[94%] text-white p-[10px] mb-[25px] border-none rounded-[6px] text-[16px] bg-neutral-800"
      required
    />
  );
};

export default InputField;
