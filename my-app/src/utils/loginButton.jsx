import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = ({ className = "" }) => {
  const { loginWithRedirect } = useAuth0();

  return (
    <button
      onClick={() => loginWithRedirect()}
      className={`nav-btn nav-btn-outline ${className}`}
    >
      Login
    </button>
  );
};

export default LoginButton;
