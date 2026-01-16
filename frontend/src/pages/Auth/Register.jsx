import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Loader from '../../components/Loader'
import { setCredentials } from '../../redux/features/auth/authSlice'
import { toast } from 'react-toastify'
import { useRegisterMutation } from '../../redux/Api/usersApiSlice'
import { FaEnvelope, FaLock, FaLockOpen, FaUser } from 'react-icons/fa'

const Register = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmedPassword, setConfirmedPassword] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [register, { isLoading }] = useRegisterMutation()
  const { userInfo } = useSelector((state) => state.auth)

  const { search } = useLocation()
  const sp = new URLSearchParams(search)
  const redirect = sp.get('redirect') || '/'

  useEffect(() => {
    if (userInfo) {
      navigate(redirect)
    }
  }, [navigate, redirect, userInfo])

  const submitForm = async (e) => {
    e.preventDefault()

    if (password !== confirmedPassword) {
      toast.error('Password does not match')
      return
    }

    try {
      const res = await register({ username, email, password }).unwrap()
      dispatch(setCredentials({ ...res }))
      toast.success('Registration successful')
      navigate(redirect)
    } catch (err) {
      toast.error(err?.data?.message || 'Registration failed')
    }
  }

  const inputBase =
    'w-full p-2.5 pl-10 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'

  const iconBase = 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'

  return (
    <section className="pl-[10rem] flex flex-wrap bg-purple-500 min-h-screen">
      <div className="mr-[4rem] mt-[5rem]">
        <h2 className="text-2xl font-semibold mb-4 text-white">
          Register 📝
        </h2>

        <form onSubmit={submitForm} className="w-[40rem]">
          <div className="my-[2rem]">
            <label className="block mb-2 text-sm font-medium text-white">
              Username
            </label>
            <div className="relative">
              <FaUser className={iconBase} />
              <input
                type="text"
                placeholder="John"
                className={inputBase}
                value={username}
                required
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="my-[2rem]">
            <label className="block mb-2 text-sm font-medium text-white">
              Email
            </label>
            <div className="relative">
              <FaEnvelope className={iconBase} />
              <input
                type="email"
                placeholder="john@gmail.com"
                className={inputBase}
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="my-[2rem]">
            <label className="block mb-2 text-sm font-medium text-white">
              Password
            </label>
            <div className="relative">
              <FaLock className={iconBase} />
              <input
                type="password"
                placeholder="••••••••"
                className={inputBase}
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="my-[2rem]">
            <label className="block mb-2 text-sm font-medium text-white">
              Confirm Password
            </label>
            <div className="relative">
              <FaLockOpen className={iconBase} />
              <input
                type="password"
                placeholder="••••••••"
                className={inputBase}
                value={confirmedPassword}
                required
                onChange={(e) => setConfirmedPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            disabled={isLoading}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-5 py-2.5 transition disabled:opacity-50"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>

          {isLoading && <Loader />}
        </form>

        <div className="mt-4">
          <p className="text-white">
            Already have an account?{' '}
            <Link
              to={redirect ? `/login?redirect=${redirect}` : '/login'}
              className="text-orange-400 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>

      <img
        src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1170&q=80"
        alt="TMcod"
        className="h-auto w-[30%] md:w-[25%] sm:w-[20%] xl:block ml-[3rem] object-cover rounded-lg"
      />
    </section>
  )
}

export default Register
