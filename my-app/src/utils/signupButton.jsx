import { useAuth0 } from "@auth0/auth0-react";

const SignupButton = ({ className = "" }) => {
  const { loginWithRedirect } = useAuth0();

  return (
    <button
      onClick={() =>
        loginWithRedirect({
          authorizationParams: {
            screen_hint: "signup",
          },
        })
      }
      className={`nav-btn nav-btn-primary ${className}`}
    >
      Sign Up
    </button>
  );
};

export default SignupButton;
