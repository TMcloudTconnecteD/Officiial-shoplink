import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loader from "../../components/Loader";
import { useGetCurrentUserProfileQuery } from "../../redux/Api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";

const AdminRoutes = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const {
    data: currentProfile,
    isLoading,
    isFetching,
    isError,
  } = useGetCurrentUserProfileQuery(undefined, { skip: !userInfo, refetchOnMountOrArgChange: true });

  useEffect(() => {
    if (!currentProfile || !userInfo) return;
    const roleChanged = (
      Boolean(currentProfile.isAdmin) !== Boolean(userInfo.isAdmin)
      || Boolean(currentProfile.isSuperAdmin) !== Boolean(userInfo.isSuperAdmin)
      || Boolean(currentProfile.isSeller) !== Boolean(userInfo.isSeller)
    );
    if (roleChanged) {
      dispatch(setCredentials({ ...userInfo, ...currentProfile, token: userInfo.token }));
    }
  }, [currentProfile, dispatch, userInfo]);

  if (!userInfo) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const profile = currentProfile || userInfo;
  if (profile.isAdmin || profile.isSuperAdmin) return <Outlet />;
  if (isLoading || (isFetching && !currentProfile)) return <Loader label="Verifying administrator access" />;
  if (isError && (userInfo.isAdmin || userInfo.isSuperAdmin)) return <Outlet />;

  return <Navigate to="/" replace />;
};

export default AdminRoutes;
