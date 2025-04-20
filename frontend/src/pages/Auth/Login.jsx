import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLoginMutation } from '../../redux/api/usersApiSlice'
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
  if(userInfo) {
    navigate(redirect)

  }

},
[navigate, redirect, userInfo]
)









const handleSubmit = async (e) => {
    e.preventDefault()
 
    try {
        const res = await login({ email, password }).unwrap()
        console.log(res)
        dispatch(setCredentials({...res}))
        navigate(redirect)


    } catch (error) {
        toast.error(error?.data?.message || error.error)
    }


}

  return (
    <div className='bg-black ' >
        <section className='pl-[10rem] pr-[2rem] flex flex-nowrap items-center justify-between  w-full  ' >
            <div className='mr-[4rem] mt-[5rem]'>
               <h2 className='text-2xl font-semibold mb-4 ' >Sign In</h2>
               <form onSubmit={handleSubmit} className='container w-[40rems]' >
                <div className='my-[2rem]'>
                    <label htmlFor="email"
                    className='block tect-sm font-medium text-white'>Email Address</label>
                    <input type="email"
                    placeholder='xyz@gmail.com' 
                    id='email'
                    className='mt-1 p-2 border rounded w-full'
                    value={email}
                    onChange={e => setEmail(e.target.value)}/>
                </div>

                <div className='my-[2rem]'>
                    <label htmlFor="password"
                    className='block tect-sm font-medium text-white'>Secret Pass</label>
                    <input type="password"

                    placeholder='Password' 

                    id='password'
                    className='mt-1 p-2 border rounded w-full'
                    value={password}
                    onChange={e => setPassword(e.target.value)}/>
                </div>

                <button 
                disabled = {isLoading} type='submit' 
                className='bg-pink-500 text-white px-4 py-2 rounded cursor-pointer  my-[1rem ] '

                >
                    {isLoading ? 'Signing in...' : 'Sign In'}

                </button>
                {isLoading && 
                <Loader />
                }

                </form> 
                <div className="mt-4">
                    <p className="text-white">
                        <i>New Customer? </i>{' '}
                        <Link to = {redirect ? `/register?redirect=${redirect}` : '/register'}
                        className='text-pink-500 hover:underline'>Register
                        </Link>

                    </p>
                </div>

            </div>
            <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
             alt="TMcod"
             className='h-auto w-[30%] md:w-[25%] sm:w-[20%] xl:block ml-[3rem] object-cover rounded-lg' />


        </section>


    </div>
  )
}

export default Login;