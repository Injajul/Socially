import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  getUserPosts,
  deletePostThunk, // 👈 import the thunk
} from "../../redux/slices/postSlice";
import FollowBtn from "../creator/FollowBtn";
import PostModal from "./PostModal";
import { useAuth } from "@clerk/clerk-react";
const ProfilePage = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { userPosts, loading, error, userInfo } = useSelector(
    (state) => state.posts
  );
    const { currentAuthUser } = useSelector((state) => state.user);
  console.log("userPosts", userPosts);
  console.log("userInfo", userInfo);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (userId) dispatch(getUserPosts(userId));
  }, [dispatch, userId]);

  // 👇 handle click on post
  const handlePostClick = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPost(null);
    setIsModalOpen(false);
  };

  // 👇 delete post logic
  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const token = await getToken();
        await dispatch(deletePostThunk({ postId, token })).unwrap();
        // optional feedback
        alert("Post deleted successfully");
        // if modal is open for this post, close it
        if (selectedPost?._id === postId) closeModal();
      } catch (err) {
        console.error("Delete failed:", err);
        alert(err);
      }
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading profile...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );

  if (!userPosts?.length)
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500">
        <p>No posts yet.</p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto pt-10">
      {/* 🧑‍💼 Profile Header */}
      <div className="flex items-center gap-6 px-4">
        <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
          {userInfo?.coverImage ? (
            <img
              src={userInfo.coverImage}
              alt={userInfo.fullName}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-gray-600 text-3xl font-semibold">
              {userInfo?.fullName?.charAt(0) || "U"}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {userInfo?.fullName}
          </h2>
          <FollowBtn userId={userInfo?._id} />
        </div>
      </div>

      {/* 🧾 User Stats */}
      <div className="px-4 mt-4">
        <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <span className="font-semibold">{userPosts.length}</span> posts
          </p>
          <p>
            <span className="font-semibold">
              {userInfo?.followersCount || 0}
            </span>{" "}
            followers
          </p>
          <p>
            <span className="font-semibold">
              {userInfo?.followingCount || 0}
            </span>{" "}
            following
          </p>
        </div>
      </div>

      <div className="border-t border-gray-300 my-6"></div>

      {/* 🖼️ Posts Grid */}
      <div className="grid grid-cols-3 gap-4 px-2">
        {userPosts.map((post) => (
          <div key={post._id} className="flex flex-col items-center">
            <div
              className="relative group cursor-pointer overflow-hidden w-full rounded-lg"
              onClick={() => handlePostClick(post)} // 👈 modal trigger
            >
              {post.media[0].type === "video" ? (
                <video
                  src={post.media[0].url}
                  className="object-cover w-full h-40 sm:h-52 md:h-64 rounded-lg"
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={post.media[0].url}
                  alt="post"
                  className="object-cover w-full h-40 sm:h-52 md:h-64 rounded-lg"
                />
              )}

              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition flex justify-center items-center gap-6 text-white text-sm font-medium backdrop-blur-sm">
                <p>❤️ {post.likesCount}</p>
                <p>💬 {post.commentsCount}</p>
              </div>
            </div>
            {/* ✅ Only show buttons if this profile belongs to the logged-in user */}
            {currentAuthUser?._id === post.user?._id && (
              <div className="flex w-full gap-3 mt-3">
                <button
                  onClick={() => navigate(`/update/${post._id}`)}
                  className="px-4 py-1.5 flex-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(post._id)}
                  className="px-4 py-1.5 flex-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-500 transition"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 🔥 Post Modal */}
      {isModalOpen && selectedPost && (
        <PostModal post={selectedPost} onClose={closeModal} />
      )}
    </div>
  );
};

export default ProfilePage;
