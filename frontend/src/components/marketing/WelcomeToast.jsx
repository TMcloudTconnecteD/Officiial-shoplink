import { useEffect } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useGetPromoSettingsQuery, useGetWelcomeToastQuery, useLogPromoEventMutation } from "../../redux/Api/marketingApiSlice";
import { promoEnabled, reportPromoEvent } from "./marketingUtils";

const WelcomeToast = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const customer = userInfo && !userInfo.isAdmin && !userInfo.isSuperAdmin;
  const { data: settings } = useGetPromoSettingsQuery();
  const enabled = promoEnabled(settings, "welcomeToast");
  const { data } = useGetWelcomeToastQuery(undefined, { skip: !customer || !enabled });
  const [logEvent] = useLogPromoEventMutation();

  useEffect(() => {
    if (data?.show) {
      toast.info(`Hi ${data.name}! ${data.shopCount} shops added products this week.`, {
        toastId: `shoplink-welcome-${userInfo?._id}`,
        autoClose: 6000,
        onOpen: () => reportPromoEvent(logEvent, "welcomeToast", "impression"),
        onClick: () => reportPromoEvent(logEvent, "welcomeToast", "click"),
      });
    }
  }, [data, logEvent, userInfo?._id]);

  return null;
};

export default WelcomeToast;
