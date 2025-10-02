import Input from "../components/InputField.jsx";
import Button from "../components/Button.jsx";
import FormWrapper from "../components/FormWrapper.jsx";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <FormWrapper title="Login">
      <form>
        <Input label="Email" type="email" required />
        <Input label="Password" type="password" required />
        <Button>Login</Button>
      </form>
      <p className="mt-4 text-sm text-center">
        Don’t have an account?{" "}
        <Link to="/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      </p>
    </FormWrapper>
  );
};

export default Login;
