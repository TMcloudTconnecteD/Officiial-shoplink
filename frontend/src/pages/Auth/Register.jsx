import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';
import { setCredentials } from '../../redux/features/auth/authSlice';
import { toast } from 'react-toastify';
import { useRegisterMutation } from '../../redux/Api/usersApiSlice';
import { FaEnvelope, FaLock, FaLockOpen, FaUser } from 'react-icons/fa';


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
            if(userInfo) {
                navigate(redirect)
            }
        }, [ navigate, redirect , userInfo ])
 
            
const submitForm = async (e) => {
    e.preventDefault()
    if(password !== confirmedPassword) {
        toast.error('Password does not match')

    } else {
        try {
            const res = await register({ username, email, password }).unwrap()
            dispatch(setCredentials({ ...res }))
            navigate(redirect)
            toast.success('Registration successful')


        } catch (err) {
            console.log(err)
            toast.error(err.data.message)

        }


    }



}







  return (


    <section className='pl-[10rem] flex flex-wrap bg-purple-500'>
        <div className="mr-[4rem] mt-[5rem] " >
            <h2 className='text-2xl  font-semibold mb-4'>Register📝</h2>

        <form onSubmit={submitForm} 
        className='container w[40rem]'>
            <div className="my-[2rem]">
                <label htmlFor="name" className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>Username</label>
                <div className='relative'>
                <input  type="text" id="name" className="bg-gray-50 border border-gray-300 pl-10 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                placeholder="John"
                value={username}
                 
                required 
                onChange={(e) => setUsername(e.target.value)}
                />
                <FaUser className='absolute left-3 top-1/3 transform-translate-y-1/2' />

                </div>
            </div>

            <div className="my-[2rem]">
                <label htmlFor="email" className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>Email</label>
                <div className='relative'>
                <input  type="email" id="email" className="bg-gray-50 pl-10 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                placeholder=  "John@gmail.com" 

                value={email} 
                required 
                onChange={(e) => setEmail(e.target.value)}/>
                     <FaEnvelope  className='absolute left-3 top-1/3 transform-translate-y-1/2' />
                </div>
            </div>

            <div className="my-[2rem]">
                <label htmlFor="password" className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>Password</label>
                <div className='relative'>
                <input type="password" id="password" className="bg-gray-50 pl-10 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                placeholder="12@#GT..."
                value={password} 
                required 
                onChange={(e) => setPassword(e.target.value)}/>
                   <FaLock className='absolute left-3 top-1/3 transform-translate-y-1/2' />
                </div>
            </div>

            <div className="my-[2rem]">
                <label htmlFor="confirmePassword" className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>Confirm Pass Code</label>
                <div className='relative'>
                <input type="password" id="confirmpassword" className="bg-gray-50 border pl-10 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                placeholder="12@#GT..."

                value={confirmedPassword} 
                required 
                onChange={(e) => setConfirmedPassword(e.target.value)}/>
                         <FaLockOpen className='absolute left-3 top-1/3 transform-translate-y-1/2' />
                </div>

            </div>
            <button
            disabled={isLoading}
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 cursor-pointer my-[1rem]"
             > {
                isLoading ? 'registering...' : 'Register'

             } </button>
             { 
                isLoading && <Loader />

             }

           


            
        </form>


        <div className="mt-4">
            <p className="text-white">
                Already have an account? {''}
                 <Link to={redirect ? `/login?redirect=${redirect}` : '/login' }
                  className='text-orange-500 hover:underline'>Login</Link>
            </p>

        </div>

        </div>

        <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
             alt="TMcod"
             className='h-auto w-[30%] md:w-[25%] sm:w-[20%] xl:block ml-[3rem] object-cover rounded-lg' />


    </section>
  )
}

export default Register;