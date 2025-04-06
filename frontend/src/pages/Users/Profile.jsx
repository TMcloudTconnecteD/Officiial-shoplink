import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader';
import { setCredentials } from '../../redux/features/auth/authSlice';
import { Link } from 'react-router-dom';
import { useProfileMutation } from '../../redux/Api/usersApiSlice';

const Profile = () => {
        const [username, setUsername] = useState('')
        const [email, setEmail] = useState('')
        const [password, setPassword] = useState('')
        const [confirmedPassword, setConfirmedPassword] = useState('')

    const {userInfo} = useSelector(state => state.auth)
    const [updateProfile, {isLoading: loadingUpdateProfile}] = useProfileMutation()
  
  useEffect(() => {
    setUsername(userInfo.username)
    setEmail(userInfo.email)

  
   
  }, [userInfo.email, userInfo.username])

  const dispatch = useDispatch()

  const submitForm = async(e) => {
        e.preventDefault()
        if (password !== confirmedPassword) {
            toast.error('Pass Code does not match!')
            
        } else {
            try {
                const res = await updateProfile({_id: userInfo._id, username, email, password}).unwrap()
                dispatch(setCredentials({...res}))
                toast.success('profile update successful✔')
            } catch (error) {
                toast.error(error?.data?.message || error.message)
                
            }
        }


  }
  
    return (
    <div className='container mx-auto p-4 mt-[10rem] '>
        <div className="flex justify-center align-center md:space-x-4 bg-black p-4 rounded-lg shadow-lg">
           <div className="md:w-1/3 ">
           
           <h2 className="text-2xl text-orange-500 font-semibold mb-4">Update Profile!🐾</h2>

<form onSubmit={submitForm} >
    <div className="mb-4">
        <label  className="block text-orange-500 mb-2">User Name</label>
    <input type="text"
           placeholder='name'
           className='form-input p-4 rounded-sm w-full'
           value={username}
           onChange={e => setUsername(e.target.value)} />
    
    </div>

    <div className="mb-4">
        <label  className="block text-orange-500 mb-2">Email Address</label>
    <input type="email"
           placeholder='@gmail.com'
           className='form-input p-4 rounded-sm w-full'
           value={email}
           onChange={e => setEmail(e.target.value)} />
    
    </div>

    <div className="mb-4">
        <label  className="block text-orange-500 mb-2">Pass Code</label>
    <input type="password"
           placeholder='!@123>>..'
           className='form-input p-4 rounded-sm w-full'
           value={password}
           onChange={e => setPassword(e.target.value)} />
    
    </div>

    <div className="mb-4">
        <label  className="block text-orange-500 mb-2">Confirm Pass Code</label>
    <input type="password"
           placeholder='!@123>>..'
           className='form-input p-4 rounded-sm w-full'
           value={confirmedPassword}
           onChange={e => setConfirmedPassword(e.target.value)} />
    
    </div>

    <div className="flex justify-between">
        <button type='submit'
                className='bg-orange-500 text-white px-4 rounded hover:bg-blue-200'>
                        Update
                </button>

                <Link to = '/user-orders' 
                      className='bg-orange-500 text-white py-2 px-4 rounded hover:bg-purple-700 '>
                        My Orders..✈
                </Link>
    </div>

</form>

           </div>

           {loadingUpdateProfile &&<Loader />}
        </div>

    </div>
  )
}

export default Profile;