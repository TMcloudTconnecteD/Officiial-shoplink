import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaArrowRight, FaEnvelope, FaGift, FaLock, FaStore, FaUser } from "react-icons/fa";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { useRegisterMutation } from "../../redux/Api/usersApiSlice";
import "./Register.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const redirect = params.get("redirect") || "/";
  const referralCode = params.get("ref") || "";
  const [register, { isLoading }] = useRegisterMutation();

  useEffect(() => {
    if (userInfo) navigate(redirect);
  }, [navigate, redirect, userInfo]);

  const submitForm = async (event) => {
    event.preventDefault();
    if (password !== confirmedPassword) {
      toast.error("Those passwords don’t match yet.");
      return;
    }

    try {
      const response = await register({ username, email, password, referralCode }).unwrap();
      dispatch(setCredentials({ ...response }));
      toast.success("You’re in. Welcome to ShopLink!");
      navigate(redirect);
    } catch (error) {
      toast.error(error?.data?.message || "We couldn’t create your account. Try again.");
    }
  };

  return (
    <main className="register-page">
      <section className="register-card">
        <div className="register-card__intro">
          <Link className="register-brand" to="/" aria-label="ShopLink home">
            <span className="register-brand__mark">S</span>
            <span>ShopLink</span>
          </Link>
          <span className="register-card__eyebrow"><FaStore aria-hidden="true" /> Your campus marketplace</span>
          <h1>Good finds.<br /><span>Good people.</span></h1>
          <p>Find your next favorite shop, right around the corner.</p>
          {referralCode && (
            <div className="register-invite">
              <span><FaGift aria-hidden="true" /></span>
              <p><strong>A friend saved you a spot.</strong><br />Join the neighborhood.</p>
            </div>
          )}
          <div className="register-card__note">
            <span className="register-card__note-icon"><FaStore aria-hidden="true" /></span>
            <span><strong>Fresh finds. Local shops.</strong></span>
          </div>
        </div>

        <div className="register-form-panel">
          <div className="register-form-panel__heading">
            <span>Welcome to ShopLink</span>
            <h2>Create your account</h2>
            <p>Your next favorite is one tap away.</p>
          </div>

          <form className="register-form" onSubmit={submitForm}>
            <label>
              Your name
              <span className="register-input">
                <FaUser aria-hidden="true" />
                <input
                  type="text"
                  placeholder="What should we call you?"
                  autoComplete="username"
                  value={username}
                  required
                  onChange={(event) => setUsername(event.target.value)}
                />
              </span>
            </label>

            <label>
              Email address
              <span className="register-input">
                <FaEnvelope aria-hidden="true" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  required
                  onChange={(event) => setEmail(event.target.value)}
                />
              </span>
            </label>

            <div className="register-form__passwords">
              <label>
                Password
                <span className="register-input">
                  <FaLock aria-hidden="true" />
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    minLength={6}
                    value={password}
                    required
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </span>
              </label>
              <label>
                Confirm password
                <span className="register-input">
                  <FaLock aria-hidden="true" />
                  <input
                    type="password"
                    placeholder="Type it again"
                    autoComplete="new-password"
                    minLength={6}
                    value={confirmedPassword}
                    required
                    onChange={(event) => setConfirmedPassword(event.target.value)}
                  />
                </span>
              </label>
            </div>

            <button type="submit" className="register-submit" disabled={isLoading}>
              {isLoading ? "Creating your account…" : <>Create account <FaArrowRight aria-hidden="true" /></>}
            </button>
            {isLoading && <Loader label="Creating your account" />}
          </form>

          <p className="register-login">
            Already on ShopLink? <Link to={`/login?redirect=${encodeURIComponent(redirect)}`}>Log in</Link>
          </p>
          <a
            href={`/clerk-auth?mode=signup${referralCode ? `&ref=${encodeURIComponent(referralCode)}` : ""}`}
            className="register-clerk"
          >
            Continue with secure sign-up
          </a>
        </div>
      </section>
    </main>
  );
};

export default Register;
