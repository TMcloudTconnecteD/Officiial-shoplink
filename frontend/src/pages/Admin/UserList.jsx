import React, { useEffect, useState } from "react";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "../../redux/Api/usersApiSlice";
import Messages from "../../components/Messages";
import { FaCheck, FaEdit, FaTimes, FaTrash } from "react-icons/fa";

const UserList = () => {
  const { data: users, refetch, isLoading, error } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const [editableUserId, setEditableUserId] = useState(null);
  const [editableUserName, setEditableUserName] = useState("");
  const [editableUserEmail, setEditableUserEmail] = useState("");

  useEffect(() => {
    refetch();
  }, [refetch]);

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await deleteUser(id);
        toast.success("User deleted successfully");
      } catch (error) {
        toast.error(error?.data?.message || error.message);
      }
    }
  };

  const toggleEdit = (id, username, email) => {
    setEditableUserId(id);
    setEditableUserName(username);
    setEditableUserEmail(email);
  };

  const updateHandler = async (id) => {
    try {
      await updateUser({
        userId: id,
        username: editableUserName,
        email: editableUserEmail,
      });
      setEditableUserId(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-purple-300 via-purple-400 to-purple-500 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center text-white drop-shadow-lg">
        Users
      </h1>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Messages variant="danger">
          {error?.data?.message || error.error}
        </Messages>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full max-w-5xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">NAME</th>
                <th className="text-left px-4 py-3">EMAIL</th>
                <th className="text-left px-4 py-3">ADMIN</th>
                <th className="text-left px-4 py-3">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b last:border-b-0 hover:bg-purple-50"
                >
                  {/* ID */}
                  <td className="px-4 py-3">{user._id}</td>

                  {/* Editable Username */}
                  <td className="px-4 py-3">
                    {editableUserId === user._id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editableUserName}
                          onChange={(e) => setEditableUserName(e.target.value)}
                          className="w-full p-2 border rounded-lg"
                        />
                        <button
                          onClick={() => updateHandler(user._id)}
                          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
                        >
                          <FaCheck />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {user.username}
                        <button
                          onClick={() =>
                            toggleEdit(user._id, user.username, user.email)
                          }
                        >
                          <FaEdit className="text-gray-600 hover:text-blue-600" />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Editable Email */}
                  <td className="px-4 py-3">
                    {editableUserId === user._id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editableUserEmail}
                          onChange={(e) => setEditableUserEmail(e.target.value)}
                          className="w-full p-2 border rounded-lg"
                        />
                        <button
                          onClick={() => updateHandler(user._id)}
                          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
                        >
                          <FaCheck />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {user.email}
                        <button
                          onClick={() =>
                            toggleEdit(user._id, user.username, user.email)
                          }
                        >
                          <FaEdit className="text-gray-600 hover:text-blue-600" />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Admin status */}
                  <td className="px-4 py-3">
                    {user.isAdmin ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaTimes className="text-red-500" />
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    {!user.isAdmin && (
                      <button
                        onClick={() => deleteHandler(user._id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserList;
