import { Link } from "react-router-dom";
import { FaGift, FaHistory } from "react-icons/fa";
import Loader from "../../components/Loader";
import { useGetRewardsQuery } from "../../redux/Api/marketingApiSlice";
import "./ShopLinkRewards.css";

const ShopLinkRewards = () => {
  const { data, isLoading, error } = useGetRewardsQuery(undefined, {
    pollingInterval: 60000,
    refetchOnFocus: true,
  });

  if (isLoading) return <main className="shoplink-rewards"><Loader /></main>;
  if (error || !data?.user) {
    return (
      <main className="shoplink-rewards">
        <section className="shoplink-rewards__error" role="alert">
          <h1>ShopLink Rewards</h1>
          <p>We couldn't load your rewards right now. Please try again.</p>
        </section>
      </main>
    );
  }

  const balance = Number(data.user.pointsBalance || 0);
  const available = Number(data.user.availablePoints ?? balance);
  const progressPoints = balance % 1000;
  const pointsToNext = 1000 - progressPoints;
  const progress = (progressPoints / 1000) * 100;

  return (
    <main className="shoplink-rewards">
      <header className="shoplink-rewards__hero">
        <span className="shoplink-rewards__eyebrow"><FaGift aria-hidden="true" /> SHOPLINK REWARDS</span>
        <h1>ShopLink Rewards</h1>
        <p className="shoplink-rewards__tagline">Your points, your perks.</p>
        <p>Use your points on products from any ShopLink shop. Every 10 points are worth KES 1.</p>
        <div className="shoplink-rewards__balance">
          <strong>{balance.toLocaleString()}</strong>
          <span>points in your wallet</span>
        </div>
        <div
          className="shoplink-rewards__progress"
          role="progressbar"
          aria-label="Progress toward your next KES 100 reward"
          aria-valuenow={progressPoints}
          aria-valuemin={0}
          aria-valuemax={1000}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <p className="shoplink-rewards__milestone">
          {progressPoints.toLocaleString()} / 1000 points — {pointsToNext.toLocaleString()} to your next 100 KES off 🎉
        </p>
        <p className="shoplink-rewards__available">
          {available.toLocaleString()} points available to use
          {balance > available ? ` · ${Number(data.user.pointsReserved).toLocaleString()} reserved on unpaid orders` : ""}
        </p>
      </header>

      <section className="shoplink-rewards__history">
        <div className="shoplink-rewards__section-heading">
          <div>
            <span><FaHistory aria-hidden="true" /> POINTS WALLET</span>
            <h2>Transaction history</h2>
          </div>
          <Link to="/student-friendly">Referral rewards</Link>
        </div>
        {data.transactions?.length ? (
          <div className="shoplink-rewards__transactions">
            {data.transactions.map((transaction) => {
              const label = transaction.type === "spent"
                ? "Points spent"
                : transaction.type === "refunded"
                  ? "Points refunded"
                  : "Points earned";
              const sign = transaction.type === "spent" ? "-" : "+";
              return (
                <article key={transaction._id}>
                  <div>
                    <strong>{label}</strong>
                    <span>{transaction.description}</span>
                    <time dateTime={transaction.createdAt}>{new Date(transaction.createdAt).toLocaleString()}</time>
                    {transaction.order && (
                      <Link to={`/order/${transaction.order._id}`}>Order {transaction.order._id}</Link>
                    )}
                  </div>
                  <strong className={`shoplink-rewards__points shoplink-rewards__points--${transaction.type}`}>
                    {sign}{Number(transaction.points).toLocaleString()}
                  </strong>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="shoplink-rewards__empty">Your points activity will appear here as you shop, refer friends, and confirm orders.</p>
        )}
      </section>

      {!data.rewardProgramEnabled && (
        <p className="shoplink-rewards__notice" role="status">
          Rewards are temporarily paused. Your points are safe, but checkout redemption is unavailable right now.
        </p>
      )}
    </main>
  );
};

export default ShopLinkRewards;
