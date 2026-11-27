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
          <p>Earn points when you shop and invite friends. Create an account to start earning and track your rewards.</p>
          <div className="marketing-page__signup-actions">
            <Link className="marketing-page__signup-cta" to="/register?redirect=%2Fstudent-friendly">
              <span className="marketing-page__signup-icon"><FaGift aria-hidden="true" /></span>
              <span><strong>Sign up &amp; get rewards</strong><small>It’s free. Start earning with your next order.</small></span>
              <FaArrowRight className="marketing-page__signup-arrow" aria-hidden="true" />
            </Link>
            <p>Already have an account? <Link to="/login?redirect=%2Fstudent-friendly"><FaSignInAlt aria-hidden="true" /> Sign in</Link></p>
          </div>
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
  const pointsToNextReward = 1000 - (points % 1000);
  const progress = ((points % 1000) / 1000) * 100;
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
        <p>Earn points when you shop and invite friends. Use points at checkout on products from any ShopLink shop.</p>
        <p>Every paid order earns 10 points. A friend earns their regular points, and you earn 100 points when they complete their first paid order.</p>
        <span className="marketing-page__balance">{points} points</span>
        <p><Link to="/my-rewards">Open your ShopLink Rewards wallet</Link></p>
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
              ? `You have ${availableRewardCount} earlier KES 100 reward${availableRewardCount === 1 ? "" : "s"} ready. ${pointsToNextReward} points until the next KES 100 off milestone.`
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
        <h2>Your reward credits</h2>
        <p>Each point is worth KES 0.10. Choose how many points to use at checkout, or use the maximum available. Any earlier KES 100 reward credits remain available and can still be applied when you do not select points.</p>
        {!rewardsEnabled && <p role="status">Rewards are temporarily paused. Your balance and voucher history are preserved, but redemption is unavailable until the program resumes.</p>}
        <div className="marketing-page__voucher-grid">
          {(data.rewardCredits || []).map((credit) => (
            <article className="marketing-page__voucher" key={credit._id}>
              <strong>KES {credit.discountAmount} off your next order</strong>
              <code>{credit.code}</code>
              <span>{getCreditStatus(credit.status)}</span>
            </article>
          ))}
          {!data.rewardCredits?.length && <p>Earlier reward credits, if any, will appear here. You can now choose how many wallet points to use at checkout.</p>}
        </div>
      </section>
    </main>
  );
};

export default StudentFriendly;
