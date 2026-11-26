import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FaArrowRight, FaCopy } from "react-icons/fa";
import { useGetPromoSettingsQuery, useGetRewardsQuery, useLogPromoEventMutation } from "../../redux/Api/marketingApiSlice";
import { promoEnabled, reportPromoEvent } from "./marketingUtils";

const ReferralRibbon = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const customer = userInfo && !userInfo.isAdmin && !userInfo.isSuperAdmin;
  const { data: settings } = useGetPromoSettingsQuery();
  const enabled = promoEnabled(settings, "referralRibbon");
  const { data } = useGetRewardsQuery(undefined, { skip: !customer || !enabled });
  const [logEvent] = useLogPromoEventMutation();

  useEffect(() => {
    if (customer && enabled && data?.user?.referralCode) {
      reportPromoEvent(logEvent, "referralRibbon", "impression");
    }
  }, [customer, data?.user?.referralCode, enabled, logEvent]);

  if (!customer || !enabled || !data?.user?.referralCode) return null;

  const referralUrl = `${window.location.origin}/register?ref=${encodeURIComponent(data.user.referralCode)}`;
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      toast.success("Referral link copied");
      reportPromoEvent(logEvent, "referralRibbon", "click");
    } catch (error) {
      console.error("Could not copy referral link:", error);
      toast.error("Could not copy the referral link. Please copy it from Student Friendly.");
    }
  };

  return (
    <aside className="marketing-referral-ribbon">
      <p>Refer a friend. You both get rewarded.</p>
      <div>
        <button type="button" onClick={copyLink}><FaCopy aria-hidden="true" /> Copy link</button>
        <Link to="/student-friendly" onClick={() => reportPromoEvent(logEvent, "referralRibbon", "click")}>
          See rewards <FaArrowRight aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
};

export default ReferralRibbon;
