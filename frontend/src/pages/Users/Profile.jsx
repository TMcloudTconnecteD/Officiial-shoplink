import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import { setCredentials } from "../../redux/features/auth/authSlice";
import {
  useChangePasswordMutation,
  useGetCurrentUserProfileQuery,
  useProfileMutation,
} from "../../redux/Api/usersApiSlice";

const PasswordInput = ({ label, value, onChange, visible, onToggle, autoComplete }) => (
  <label className="mb-4 block text-sm font-medium text-slate-700">
    {label}
    <span className="mt-1 flex rounded-lg border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-emerald-400">
      <input
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        className="w-full rounded-l-lg px-3 py-3 outline-none"
        required
      />
      <button
        type="button"
        onClick={onToggle}
        className="px-3 text-slate-600"
        aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
        aria-pressed={visible}
      >
        {visible ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
      </button>
    </span>
  </label>
);

const Profile = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { data: currentProfile, isLoading: loadingProfile, error: profileError } = useGetCurrentUserProfileQuery();
  const [updateProfile, { isLoading: savingProfile }] = useProfileMutation();
  const [changePassword, { isLoading: savingPassword }] = useChangePasswordMutation();

  const [username, setUsername] = useState(userInfo?.username || "");
  const [email, setEmail] = useState(userInfo?.email || "");
  const [monthlyReminder, setMonthlyReminder] = useState(Boolean(userInfo?.monthlyPasswordReminderEnabled));
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    if (!currentProfile) return;
    setUsername(currentProfile.username || "");
    setEmail(currentProfile.email || "");
    setMonthlyReminder(Boolean(currentProfile.monthlyPasswordReminderEnabled));
  }, [currentProfile]);

  const submitProfile = async (event) => {
    event.preventDefault();
    try {
      const updatedProfile = await updateProfile({
        username,
        email,
        monthlyPasswordReminderEnabled: monthlyReminder,
      }).unwrap();
      dispatch(setCredentials({ ...userInfo, ...updatedProfile }));
      toast.success("Account settings saved.");
    } catch (error) {
      toast.error(error?.data?.message || "Could not save account settings.");
    }
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("The new passwords do not match.");
      return;
    }
    try {
      const result = await changePassword({ currentPassword, newPassword }).unwrap();
      toast.success(result.message || "Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error?.data?.message || "Could not update your password.");
    }
  };

  if (loadingProfile && !currentProfile) return <div className="mx-auto mt-32"><Loader /></div>;
  if (profileError && !currentProfile) {
    return <main className="mx-auto mt-32 max-w-3xl px-4" role="alert">Could not load your account settings. Please refresh and try again.</main>;
  }

  return (
    <main className="mx-auto mt-24 grid max-w-5xl gap-6 px-4 pb-12 md:grid-cols-2">
      <section className="rounded-2xl bg-white p-6 shadow-lg">
        <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Your account</p>
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">Account settings</h1>
        <form onSubmit={submitProfile}>
          <label className="mb-4 block text-sm font-medium text-slate-700">
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3"
              autoComplete="username"
              required
            />
          </label>
          <label className="mb-4 block text-sm font-medium text-slate-700">
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3"
              autoComplete="email"
              required
            />
          </label>
          <label className="mb-6 flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={monthlyReminder}
              onChange={(event) => setMonthlyReminder(event.target.checked)}
              className="mt-1"
            />
            <span>
              <strong className="block text-slate-900">Remind me to change my password monthly</strong>
              We’ll send one in-app reminder about every 30 days while this is enabled.
            </span>
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={savingProfile} className="rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white disabled:opacity-60">
              {savingProfile ? "Saving…" : "Save account settings"}
            </button>
            <Link to="/my-orders" className="font-semibold text-emerald-800 underline">My Orders</Link>
          </div>
        </form>
      </section>

      <section className="h-fit rounded-2xl bg-white p-6 shadow-lg">
        <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Security</p>
        <h2 className="mb-2 text-2xl font-semibold text-slate-900">Change password</h2>
        <p className="mb-6 text-sm text-slate-600">Your password is stored as a secure hash and can’t be viewed here.</p>
        <form onSubmit={submitPassword}>
          <PasswordInput
            label="Current password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            visible={showCurrentPassword}
            onToggle={() => setShowCurrentPassword((visible) => !visible)}
            autoComplete="current-password"
          />
          <PasswordInput
            label="New password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            visible={showNewPassword}
            onToggle={() => setShowNewPassword((visible) => !visible)}
            autoComplete="new-password"
          />
          <PasswordInput
            label="Confirm new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            visible={showNewPassword}
            onToggle={() => setShowNewPassword((visible) => !visible)}
            autoComplete="new-password"
          />
          <button type="submit" disabled={savingPassword} className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-60">
            {savingPassword ? "Updating…" : "Update password"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default Profile;
