import { useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Input from "../components/InputField.jsx";
import axios from "axios";
import FormWrapper from "../components/FormWrapper.jsx";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Hasła nie są zgodne.");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/auth/register", {
        username,
        email,
        password,
      });

      // Rejestracja przebiegła pomyślnie
      navigate("/login");
    } catch (err) {
      // Błąd podczas rejestracji
      setError(err.response.data.message || "Błąd podczas rejestracji");
    }
  };

  return (
    <FormWrapper title="Rejestracja">
      <form onSubmit={handleSubmit}>
        <Input
          label="Nazwa użytkownika"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          label="Adres email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Hasło"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          label="Potwierdź hasło"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Zarejestruj się
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <p className="mt-4 text-sm text-center">
        Posiadasz już konto?{" "}
        <Link to="/login" className="text-blue-600 hover:underline">
          Zaloguj się
        </Link>
      </p>
    </FormWrapper>
  );
};

export default Register;
