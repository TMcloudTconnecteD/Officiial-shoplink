import React, { useEffect, useState } from 'react'
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import { useGetUsersQuery, useDeleteUserMutation,  useUpdateUserMutation} from '../../redux/Api/usersApiSlice';
import Messages from '../../components/Messages';
import { FaCheck, FaEdit, FaTimes, FaTrash } from 'react-icons/fa';

const UserList = () => {


    const { data: users, refetch, isLoading, error } = useGetUsersQuery();
    const [deleteUser] = useDeleteUserMutation();
    const [updateUser] = useUpdateUserMutation();


    const [editableUserId, setEditableUserId] = useState(null);
    const [editableUserName, setEditableUserName] = useState('')
    const [editableUserEmail, setEditableUserEmail] = useState('')

    useEffect(() => {
        refetch();
        

    }, [refetch])

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await deleteUser(id);
                console.log('User deleted successfully');
                toast.success('User deleted successfully');



            } catch (error) {
                console.log('Error deleting user:', error);
                toast.error(error?.data?.message || error.message);


            }


        }


    }
 const toggleEdit = (id, username, email) => {
        setEditableUserId(id);
        setEditableUserName(username);
        setEditableUserEmail(email);



 }

const updateHandler = async (id) => {
    try {
        await updateUser({
            userId: id,
            username: editableUserName,
            email: editableUserEmail,



        })

        setEditableUserId(null);
        refetch()


    } catch  (err) {
        toast.error(err?.data?.message || err.error);

    }


}


  return (
    <div className='p-4 bg-purple-300'>
        <h1 className="text-2xl font-semibold mb-4">Users</h1>

    {isLoading ? 
    ( <Loader /> )
     : error ?(
     <Messages variant='danger' > 
            {error?.data?.message || error.error}

    </Messages> 
        ) : (

        <div className='flex flex-col md:flex-row'>
            {/* admin menu */}
            <table className='w-full md:w-4/5 mx-auto'>
                <thead>
                    <tr>
                        <th className='text-left px-4 py-2'>ID</th>
                        <th className='text-left px-4 py-2'>NAME</th>
                        <th className='text-left px-4 py-2'>EMAIL</th>
                        <th className='text-left px-4 py-2'>ADMIN</th>
                        
                    </tr>


                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id}>
                            <td className="px-4 py-2">{user._id}</td>
                            <td className="px-4 py-2">{editableUserId === user._id ? (
                                <div className="flex items-center">
                                    <input type="text"
                                    value={editableUserName} 
                                    onChange={ (e) => setEditableUserName(e.target.value)}
                                    className='w-full p-2 border rounded-lg '/>

                                    <button onClick={() => updateHandler(user._id)}
                                      className="ml-2 bg-blue-500 text-white py-2 px-4 rounded-lg" >
                                    <FaCheck />
                                    </button>
                                    
                                </div>
                            ):( 
                                <div className="flex items-center">
                                    {user.username}{''}
                                    <button onClick={() => toggleEdit(user._id, user.username, user.email)}>
                                        <FaEdit className='ml-[1rem]' />

                                    </button>
                                    </div>


                            )}
                            
                            
                            </td>
                            <td className="px-5 py-2">
                                {editableUserId === user._id ? (
                                    <div className="flex items-center">
                                        <input type="text" 
                                                value={editableUserEmail}
                                                onChange={ (e) => setEditableUserEmail(e.target.value)}
                                                className='w-full p-2 border rounded-lg'/ > 
                                                    <button onChange={() => updateHandler(user._id)}
                                                        className='ml-2 bg-blue-500 text-white py-2 px-4 rounded-lg' >
                                                            <FaCheck />
                                                        </button>
                                        
                                        


                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        {user.email}
                                        <button onClick={() => toggleEdit(user._id, user.username, user.email)}>
                                            <FaEdit className='ml-[1rem]' />

                                        </button>


                                    </div>
                                )}

                            </td>
                            <td className="px-4 py-2">
                                    {user.isAdmin ? (
                                        <FaCheck className='text-green-500' />

                                    ):(
                                        <FaTimes className='text-red-500' />

                                    )}

                            </td>

                                    <td className="px-4 py-2">
                                        {!user.isAdmin && (
                                            <div className="flex">
                                                <button onClick={() => deleteHandler(user._id)} className='bg-red-600 hover:bg-0range-200 text-white font-bold py-2 px-4 rounded'>
                                                    <FaTrash />

                                                </button>

                                            </div>
                                        )
}
                                    </td>

                        </tr>


                    ))
}
                </tbody>

            </table>
        </div>
    )


}
    </div>
  )
}

export default UserList; 