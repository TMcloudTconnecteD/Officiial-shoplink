import { FaArrowLeft } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const PageBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/") return null;

  const goBack = () => {
    if (location.key === "default" || window.history.state?.idx === 0) {
      navigate("/");
      return;
    }
    navigate(-1);
  };

  return (
    <div className="page-backbar">
      <button type="button" className="page-back-button" onClick={goBack}>
        <FaArrowLeft aria-hidden="true" />
        <span>Back</span>
      </button>
    </div>
  );
};

export default PageBackButton;
