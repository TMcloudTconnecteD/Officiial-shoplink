import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLoginMutation } from '../../redux/Api/usersApiSlice'
import { setCredentials } from '../../redux/features/auth/authSlice'
import { toast } from 'react-toastify'
import Loader from '../../components/Loader'
import './Login.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [login, { isLoading }] = useLoginMutation()
  const { userInfo } = useSelector(state => state.auth)

  const { search } = useLocation()
  const sp = new URLSearchParams(search)
  const redirect = sp.get('redirect') || '/'

  useEffect(() => {
    if (userInfo) {
      navigate(redirect)
    }
  }, [navigate, redirect, userInfo])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await login({ email, password }).unwrap()
      dispatch(setCredentials({ ...res }))
      navigate(redirect)
    } catch (error) {
      const message = error?.data?.message
        || (error?.error === 'Failed to fetch'
          ? 'ShopLink could not reach the sign-in service. Check your connection and try again.'
          : error?.error)
        || 'Unable to sign in. Please try again.';
      toast.error(message);
    }
  }

  const inputBase =
    'login-input'

  return (
    <div className="login-page">
      <section className="login-card">
        <div className="login-panel">
          <p className="login-eyebrow">Welcome back</p>
          <h1 className="login-title">Sign in to ShopLink</h1>
          <p className="login-description">Shop local, track your orders, and save your favorites.</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label
                htmlFor="email"
                className="login-label"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="xyz@gmail.com"
                className={inputBase}
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="login-field">
              <label
                htmlFor="password"
                className="login-label"
              >
                Secret Pass
              </label>
              <input
                type="password"
                id="password"
                placeholder="Password"
                className={inputBase}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <div className="login-actions">
              <button
                disabled={isLoading}
                type="submit"
                className="login-submit"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>

              {isLoading && <Loader />}
            </div>
          </form>

          <div className="login-links">
            <p>
              New to ShopLink?{' '}
              <Link
                to={redirect ? `/register?redirect=${redirect}` : '/register'}
                className="login-link"
              >
                Register
              </Link>
            </p>
            <div>
              <a
                href="/clerk-auth?mode=signin"
                className="login-clerk-link"
              >
                Sign in with Clerk
              </a>
            </div>
          </div>
        </div>

        <div className="login-visual">
          <img
            src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1170&q=80"
            alt="Laptop displaying a code editor"
          />
          <div className="login-visual-caption">
            <strong>Everything you need, close by.</strong>
            <span>Discover local shops and products in one place.</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Login
