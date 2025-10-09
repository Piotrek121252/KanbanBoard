import { useState } from "react";
import axios from "axios";
import Input from "../components/InputField.jsx";
import FormWrapper from "../components/FormWrapper.jsx";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await axios.post("http://localhost:8080/api/auth/login", {
        username,
        password,
      });

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Błąd logowania");
    }
  };

  return (
    <FormWrapper title="Login">
      <form>
        <Input
          label="Nazwa użytkownika"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          label="Hasło"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Zaloguj się
        </button>
      </form>

      {error && <p className="text-red-500 mt-2 text-center">{error}</p>}

      <p className="mt-4 text-sm text-center">
        Nie posiadasz jeszcze konta?{" "}
        <Link to="/register" className="text-blue-600 hover:underline">
          Zarejestruj się
        </Link>
      </p>
    </FormWrapper>
  );
};

export default Login;
