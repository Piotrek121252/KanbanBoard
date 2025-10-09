import React, { useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

const InputField = ({ label, type = "text", ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="mb-3">
      {label && <label className="block text-sm mb-1">{label}</label>}

      <div className="relative">
        <input
          type={inputType}
          className="w-full border rounded px-3 py-2 pr-9 focus:ring focus:ring-blue-400 outline-none text-black"
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
          </button>
        )}
      </div>
    </div>
  );
};

export default InputField;
