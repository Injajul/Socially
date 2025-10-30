import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAllUser } from "../../redux/slices/userSlice"; 

const AllUsers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { users, loading, error } = useSelector((state) => state.user);
  console.log(" users", users);
  useEffect(() => {
    dispatch(fetchAllUser());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading users...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        No users found.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6 dark:text-gray-100">
        All Users
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {users.map((user) => (
          <div
            key={user._id}
            onClick={() => navigate(`/profile/${user._id}`)}
            className="cursor-pointer bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition p-4 flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden mb-3 bg-gray-200">
              {user.coverImage ? (
                <img
                  src={user.coverImage}
                  alt={user.fullName}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600 text-2xl font-semibold">
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {user.fullName}
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
              {user.bio || "No bio available"}
            </p>

            <div className="flex justify-center gap-3 mt-3 text-xs text-gray-500">
              <span>{user.followers?.length || 0} followers</span>
              <span>•</span>
              <span>{user.following?.length || 0} following</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllUsers;
