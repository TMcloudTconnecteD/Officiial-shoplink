import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaArrowRight, FaGift, FaSignInAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { useGetRewardsQuery } from "../redux/Api/marketingApiSlice";

const StudentFriendly = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data, isLoading, error } = useGetRewardsQuery(undefined, { skip: !userInfo });
  const [referralCopied, setReferralCopied] = useState(false);

  const copyReferralLink = async () => {
    const url = `${window.location.origin}/register?ref=${encodeURIComponent(data.user.referralCode)}`;
    try {
      await navigator.clipboard.writeText(url);
      setReferralCopied(true);
      toast.success("Referral link copied");
    } catch (copyError) {
      console.error("Could not copy the referral link:", copyError);
      toast.error("Could not copy your referral link");
    }
  };

  if (!userInfo) {
    return (
      <main className="marketing-page">
        <header className="marketing-page__hero">
          <span className="marketing-eyebrow"><FaGift aria-hidden="true" /> ShopLink rewards</span>
          <h1>Good things come back around.</h1>
          <p>Earn points when you shop and invite friends. Sign in to see your rewards and referral link.</p>
          <Link className="marketing-page__copy" to="/login?redirect=%2Fstudent-friendly">
            <FaSignInAlt aria-hidden="true" /> Sign in to view rewards <FaArrowRight aria-hidden="true" />
          </Link>
        </header>
      </main>
    );
  }

  if (isLoading) return <main className="marketing-page"><p>Loading rewards…</p></main>;
  if (error || !data?.user) {
    return (
      <main className="marketing-page">
        <section className="marketing-page__section">
          <h1>Rewards are taking a breather</h1>
          <p role="alert">We couldn’t load your rewards right now. Please try again in a moment.</p>
        </section>
      </main>
    );
  }
  const points = data.user.pointsBalance || 0;
  const pointsToNextReward = 1000 - points;
  const progress = Math.min((points / 1000) * 100, 100);
  const availableRewardCount = (data.rewardCredits || []).filter((credit) => credit.status === "available").length;
  const rewardsEnabled = data.rewardProgramEnabled !== false;

  const getCreditStatus = (status) => {
    if (status === "available") return rewardsEnabled ? "Ready — applied automatically at checkout" : "Saved — temporarily unavailable while rewards are paused";
    if (status === "disabled") return "Disabled by ShopLink — not available for checkout";
    if (status === "reserved") return "Applied to an order — final redemption follows payment";
    if (status === "redeemed") return "Redeemed";
    return "Status unavailable";
  };

  return (
    <main className="marketing-page">
      <header className="marketing-page__hero">
        <span className="marketing-eyebrow">ShopLink rewards</span>
        <h1>Student Friendly</h1>
        <p>Earn points when you shop and invite friends. Your rewards stay in the app—never cash.</p>
        <p>Every paid order earns 10 points. A friend earns their regular points, and you earn 100 points when they complete their first paid order.</p>
        <span className="marketing-page__balance">{points} points</span>
        <div
          className="marketing-page__reward-progress"
          role="progressbar"
          aria-label="Progress toward your next KES 100 reward"
          aria-valuenow={points}
          aria-valuemin={0}
          aria-valuemax={1000}
        >
          <div className="marketing-page__reward-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p>
          {!rewardsEnabled
            ? "The rewards program is paused. Your points and vouchers are safe; new rewards and checkout use will resume when it is re-enabled."
            : availableRewardCount
              ? `You have ${availableRewardCount} KES 100 reward${availableRewardCount === 1 ? "" : "s"} ready. Earn ${pointsToNextReward} more points to unlock another.`
              : `${pointsToNextReward} more points until your next KES 100 reward.`}
        </p>
      </header>

      <section className="marketing-page__section">
        <h2>Invite a friend</h2>
        <p>Share your code. You earn 100 points when a referred friend completes their first paid order; they earn the usual shopping points.</p>
        <p><strong>Your code:</strong> {data.user.referralCode}</p>
        <button type="button" className="marketing-page__copy" onClick={copyReferralLink}>
          {referralCopied ? "Link copied" : "Copy referral link"}
        </button>
        {data.referrals?.length > 0 && (
          <ul>
            {data.referrals.map((referral) => (
              <li key={referral._id}>
                {referral.referredUser?.username || "Friend"} — {referral.status === "converted" ? "first order completed" : "waiting for first order"}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="marketing-page__section">
        <h2>Your automatic rewards</h2>
        <p>Every 1,000 points automatically unlocks a KES 100 in-app discount. At checkout, ShopLink applies one available reward linked to your account email—no code entry is needed. It can cover an order completely, leaving KES 0 to pay.</p>
        {!rewardsEnabled && <p role="status">Rewards are temporarily paused. Your balance and voucher history are preserved, but vouchers cannot be issued or used until the program resumes.</p>}
        <div className="marketing-page__voucher-grid">
          {(data.rewardCredits || []).map((credit) => (
            <article className="marketing-page__voucher" key={credit._id}>
              <strong>KES {credit.discountAmount} off your next order</strong>
              <code>{credit.code}</code>
              <span>{getCreditStatus(credit.status)}</span>
            </article>
          ))}
          {!data.rewardCredits?.length && <p>Your first KES 100 in-app reward will appear here when you reach 1,000 points.</p>}
        </div>
      </section>
    </main>
  );
};

export default StudentFriendly;
