import { useState } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";
import Input from "../components/InputField.jsx";
import FormWrapper from "../components/FormWrapper.jsx";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);

  const [cookie, setCookie] = useCookies(["token"]);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          username,
          password,
        }
      );

      const { accessToken, tokenType } = response.data;

      if (!accessToken) {
        setStatus("Brak tokenu w odpowiedzi serwera.");
        return;
      }

      if (tokenType && tokenType.toLowerCase() === "bearer") {
        setCookie("token", accessToken, { path: "/", maxAge: 30 * 60 });
      }

      navigate("/boards");
    } catch (err) {
      const backendMessage =
        err.response?.data?.message ||
        err.response?.data ||
        "Wystąpił błąd podczas logowania. Spróbuj ponownie.";

      setStatus(backendMessage);
    }
  };

  return (
    <FormWrapper title="Login">
      <form onSubmit={handleSubmit}>
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

      {status && (
        <p className="text-red-500 mt-3 text-center font-light">{status}</p>
      )}

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
