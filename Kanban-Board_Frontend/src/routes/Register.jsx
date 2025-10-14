import { useState } from "react";
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

    try {
      await axios.post("http://localhost:8080/api/auth/register", {
        username,
        email,
        password,
        confirmPassword,
      });

      // Rejestracja przebiegła pomyślnie
      navigate("/login");
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError("Błąd podczas rejestracji"); // fallback error
      }
    }
  };

  return (
    <FormWrapper title="Rejestracja">
      <form onSubmit={handleSubmit}>
        <Input
          label="Nazwa użytkownika"
          required
          minLength={3}
          maxLength={20}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          label="Adres email"
          type="email"
          required
          maxLength={40}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Hasło"
          type="password"
          required
          minLength={8}
          maxLength={64}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          label="Potwierdź hasło"
          type="password"
          required
          minLength={8}
          maxLength={64}
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
