import React, { useEffect } from 'react';
import { SignIn, SignUp, useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';
import syncClerkUser from '../../utils/clerkSync';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/features/auth/authSlice';

const ClerkAuth = () => {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const qp = new URLSearchParams(location.search);
  const mode = qp.get('mode') || 'signin';
  const pathname = location.pathname || '';
  const isSsoCallback = pathname === '/clerk-auth/sso-callback' || pathname.endsWith('/sso-callback') || pathname.includes('sso-callback');

  useEffect(() => {
    if (isSsoCallback) {
      const redirectTarget = mode === 'signup' ? '/register' : '/login';
      navigate(redirectTarget, { replace: true });
      return;
    }

    const doSync = async () => {
      if (isSignedIn && user) {
        try {
          const token = await getToken({ template: 'standard' }).catch(() => null);

          const payload = {
            email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || user.email || '',
            username: user.firstName || user.fullName || user.username || user.email || 'clerk-user',
            clerkId: user.id || null,
          };

          const res = await syncClerkUser(payload, token);
          if (res) {
            dispatch(setCredentials(res));
            navigate('/');
          }
        } catch (err) {
          console.error('Clerk sync error', err);
        }
      }
    };
    doSync();
  }, [isSignedIn, user, getToken, dispatch, navigate, isSsoCallback, mode]);

  if (isSsoCallback) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-slate-600">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl p-6 bg-white rounded shadow">
        {mode === 'signup' ? <SignUp routing="path" path="/clerk-auth" /> : <SignIn routing="path" path="/clerk-auth" />}
      </div>
    </div>
  );
};

export default ClerkAuth;
