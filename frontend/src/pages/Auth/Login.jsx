import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLoginMutation } from '../../redux/Api/usersApiSlice'
import { setCredentials } from '../../redux/features/auth/authSlice'
import { toast } from 'react-toastify'
import Loader from '../../components/Loader'

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
      toast.error(error?.data?.message || error.error)
    }
  }

  const inputBase =
    'mt-1 p-2 border border-gray-300 rounded w-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500'

  return (
    <div className="bg-black min-h-screen">
      <section className="pl-[10rem] pr-[2rem] flex flex-nowrap items-center justify-between w-full">
        <div className="mr-[4rem] mt-[5rem]">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="w-[40rem]">
            <div className="my-[2rem]">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white"
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
              />
            </div>

            <div className="my-[2rem]">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white"
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
              />
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded cursor-pointer my-[1rem] disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            {isLoading && <Loader />}
          </form>

          <div className="mt-4">
            <p className="text-white">
              <i>New Customer? </i>{' '}
              <Link
                to={
                  redirect
                    ? `/register?redirect=${redirect}`
                    : '/register'
                }
                className="text-pink-500 hover:underline"
              >
                Register
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
    </div>
  )
}

export default Login
