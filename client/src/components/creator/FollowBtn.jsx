import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useAuth } from "@clerk/clerk-react";
import { toggleFollow } from "../../redux/slices/userSlice";

const FollowBtn = ({ userId }) => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const { currentAuthUser, loading } = useSelector((state) => state.user);

  const [localLoading, setLocalLoading] = useState(false);

  // Directly compute following state from Redux
  const isFollowing =
    currentAuthUser?.following?.some(
      (f) => f._id?.toString() === userId?.toString()
    ) || false;

  const handleToggleFollow = async () => {
    if (!currentAuthUser) {
      toast.error("Please log in to follow users.");
      return;
    }

    setLocalLoading(true);
    try {
      const token = await getToken();
      await dispatch(toggleFollow({ userId, token })).unwrap();
    } catch (error) {
      toast.error(error?.message || "Failed to update follow status.");
    } finally {
      setLocalLoading(false);
    }
  };

  if (!currentAuthUser || currentAuthUser._id === userId) return null; // hide if same user

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      onClick={handleToggleFollow}
      disabled={localLoading || loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors duration-200 shadow-md
        ${
          isFollowing
            ? "bg-gray-300 text-gray-900 hover:bg-gray-400"
            : "bg-blue-600 text-white hover:bg-blue-700"
        } ${localLoading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span>{isFollowing ? "Following" : "Follow"}</span>
    </motion.button>
  );
};

export default FollowBtn;
