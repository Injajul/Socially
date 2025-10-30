import React from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const UserSavedPosts = () => {
  const { currentAuthUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const savedPosts = currentAuthUser?.savedPosts || [];

  if (!savedPosts.length) {
    return (
      <p className="text-gray-400 text-center mt-10 text-lg">
        You haven’t liked any posts yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {savedPosts.map((post) => {
        const mediaUrl = post.media?.[0]?.url;

        return (
          <motion.div
            key={post._id}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate("/")}
            className="rounded-xl overflow-hidden bg-[#101826] border border-gray-800 hover:border-blue-600 hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            {/* Media */}
            <div className="relative w-full aspect-square bg-black flex items-center justify-center overflow-hidden">
              {mediaUrl ? (
                mediaUrl.endsWith(".mp4") ? (
                  <video
                    src={mediaUrl}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt="Liked media"
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="text-gray-500 text-sm">No media</div>
              )}
            </div>

            {/* Caption */}
            <div className="p-3">
              <p className="text-gray-200 text-sm line-clamp-3 whitespace-pre-wrap">
                {post.caption || "No caption provided."}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default UserSavedPosts;




