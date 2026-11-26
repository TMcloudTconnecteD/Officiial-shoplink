import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FaCheck, FaEdit, FaSearch, FaTimes, FaTrash, FaUsers } from "react-icons/fa";
import Loader from "../../components/Loader";
import Messages from "../../components/Messages";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "../../redux/Api/usersApiSlice";
import AdminMenu from "./AdminMenu";
import "./AdminWorkspace.css";

const getUserRole = (user) => {
  if (user.isSuperAdmin) return "Super admin";
  if (user.isAdmin && user.isSeller) return "Shop admin";
  if (user.isAdmin) return "Administrator";
  return "Customer";
};

const UserList = () => {
  const { data: users = [], isLoading, error } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [search, setSearch] = useState("");
  const [editableUserId, setEditableUserId] = useState(null);
  const [editableUserName, setEditableUserName] = useState("");
  const [editableUserEmail, setEditableUserEmail] = useState("");

  const visibleUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => [
      user.username,
      user.email,
      user._id,
      getUserRole(user),
    ].filter(Boolean).join(" ").toLowerCase().includes(query));
  }, [search, users]);

  const saveUser = async (id) => {
    try {
      await updateUser({
        userId: id,
        username: editableUserName.trim(),
        email: editableUserEmail.trim(),
      }).unwrap();
      setEditableUserId(null);
      toast.success("User updated");
    } catch (errorResult) {
      toast.error(errorResult?.data?.message || errorResult.message || "Could not update user");
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm("Delete this user account? This cannot be undone.")) return;
    try {
      await deleteUser(id).unwrap();
      toast.success("User deleted");
    } catch (errorResult) {
      toast.error(errorResult?.data?.message || errorResult.message || "Could not delete user");
    }
  };

  const beginEdit = (user) => {
    setEditableUserId(user._id);
    setEditableUserName(user.username || "");
    setEditableUserEmail(user.email || "");
  };

  return (
    <div className="admin-workspace admin-users">
      <AdminMenu />
      <header className="admin-workspace__header">
        <div>
          <p className="admin-workspace__eyebrow">People & access</p>
          <h1>Users</h1>
          <p className="admin-workspace__description">Review marketplace accounts and maintain accurate user details.</p>
        </div>
        <div className="admin-workspace__summary">
          <div className="admin-workspace__stat"><span>All accounts</span><strong>{users.length}</strong></div>
          <div className="admin-workspace__stat"><span>Shop admins</span><strong>{users.filter((user) => user.isAdmin && user.isSeller).length}</strong></div>
          <div className="admin-workspace__stat"><span>Customers</span><strong>{users.filter((user) => !user.isAdmin).length}</strong></div>
        </div>
      </header>

      <label className="admin-workspace__search">
        <FaSearch aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, email, account ID or role"
          aria-label="Search users"
        />
      </label>

      {isLoading ? <div className="admin-workspace__loading"><Loader /></div>
        : error ? (
          <Messages variant="danger">{error?.data?.message || error.error}</Messages>
        ) : visibleUsers.length === 0 ? (
          <div className="admin-workspace__empty">
            <FaUsers aria-hidden="true" />
            <h2>{search ? "No matching users" : "No users found"}</h2>
            <p>{search ? "Try a different name, email, ID, or role." : "User accounts will appear here."}</p>
          </div>
        ) : (
          <div className="admin-workspace__table-wrap">
            <table className="admin-workspace__table">
              <thead>
                <tr><th>Account</th><th>Email</th><th>Access level</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {visibleUsers.map((user) => {
                  const isEditing = editableUserId === user._id;
                  return (
                    <tr key={user._id}>
                      <td>
                        {isEditing ? (
                          <input aria-label="Username" value={editableUserName} onChange={(event) => setEditableUserName(event.target.value)} />
                        ) : (
                          <div className="admin-user-identity"><strong>{user.username || "Unnamed user"}</strong><small>{user._id}</small></div>
                        )}
                      </td>
                      <td>
                        {isEditing
                          ? <input aria-label="Email" type="email" value={editableUserEmail} onChange={(event) => setEditableUserEmail(event.target.value)} />
                          : user.email || "—"}
                      </td>
                      <td><span className={`admin-status ${user.isSuperAdmin ? "admin-status--super" : user.isAdmin ? "admin-status--admin" : "admin-status--neutral"}`}>{getUserRole(user)}</span></td>
                      <td>
                        <div className="admin-user-actions">
                          {isEditing ? (
                            <>
                              <button type="button" className="admin-icon-action admin-icon-action--save" aria-label="Save user" onClick={() => saveUser(user._id)}><FaCheck /></button>
                              <button type="button" className="admin-icon-action" aria-label="Cancel editing" onClick={() => setEditableUserId(null)}><FaTimes /></button>
                            </>
                          ) : (
                            <button type="button" className="admin-icon-action" aria-label={`Edit ${user.username || "user"}`} onClick={() => beginEdit(user)}><FaEdit /></button>
                          )}
                          {!user.isAdmin && !isEditing && (
                            <button type="button" className="admin-icon-action admin-icon-action--danger" aria-label={`Delete ${user.username || "user"}`} onClick={() => removeUser(user._id)}><FaTrash /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
};

export default UserList;
