import { useAuth0 } from "@auth0/auth0-react";

const LogoutButton = ({ className = "" }) => {
  const { logout } = useAuth0();

  return (
    <button
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
      className={`nav-btn nav-btn-outline ${className}`}
    >
      Log Out
    </button>
  );
};

export default LogoutButton;
