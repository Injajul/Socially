import User from "../models/user.model.js";
import uploadToCloudinary from "../helper/uploadToCloudinary.js";
import deleteFromCloudinary from "../helper/deleteFromCloudinary.js";
import Post from "../models/post.model.js";
import { users } from "@clerk/clerk-sdk-node";

export const createUser = async (req, res) => {
  try {
    const { bio } = req.body;
    const clerkId = req.auth.userId;

    if (!clerkId)
      return res.status(400).json({ message: "clerkId is required" });

    // Fetch user info from Clerk
    const clerkUser = await users.getUser(clerkId);

    if (!clerkUser)
      return res.status(404).json({ message: "Clerk user not found" });

    // Check if user already exists
    let user = await User.findOne({ clerkId });

    // Upload cover image if exists
    let coverImageUrl = null;
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.path, {
        folder: "visionversity/users",
      });
      coverImageUrl = uploadResult.secure_url;
    }

    if (user) {
      return res.status(200).json({ message: "User already exists", user });
    }

    // Create new user
    const newUser = await User.create({
      clerkId: clerkId,
      fullName:
        clerkUser.firstName +
        (clerkUser.lastName ? " " + clerkUser.lastName : ""),
      email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
      profileImage: clerkUser.imageUrl,
      bio: bio || "",
      coverImage: coverImageUrl || "",
    });

    return res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error in createUser:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const clerkId = req.auth.userId;

    // Fetch user with selected fields and populate only necessary info
    const user = await User.findOne({ clerkId })
      .select(
        "clerkId fullName profileImage email bio coverImage followers following likedPosts savedPosts uploadedPosts"
      )
      .populate({
        path: "followers following",
        select: "clerkId fullName coverImage profileImage",
      })
      .populate({
        path: "likedPosts savedPosts uploadedPosts",
        select: "caption media createdAt", // only relevant post info
      })
      .lean(); // returns plain JS object, not Mongoose document

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { clerkId } = req.params;
    const { bio } = req.body;

    // Find the user first
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If user uploaded a new cover image
    if (req.file) {
      // If previous coverImage exists → delete it from Cloudinary
      if (user.coverImage) {
        await deleteFromCloudinary(user.coverImage);
      }

      // Upload new image to Cloudinary
      const uploadResult = await uploadToCloudinary(req.file.path, {
        folder: "visionversity/users", // You can rename this folder for your app
      });

      // Save Cloudinary URL
      user.coverImage = uploadResult.secure_url;
    }

    // Update bio (or any other text fields)
    if (bio) {
      user.bio = bio;
    }

    // Save updates
    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// export const handleClerkWebhook = async (req, res) => {
//   try {
//     const event = req.event; // This comes from verifyClerkWebhook middleware
//     const { type, data } = event;

//     switch (type) {
//       case "user.deleted":
//         const clerkId = data.id;

//         // Find the user
//         const user = await User.findOne({ clerkId });
//         if (user) {
//           // Delete cover image from Cloudinary if exists
//           if (user.coverImage) {
//             try {
//               await deleteFromCloudinary(user.coverImage);
//             } catch (err) {
//               console.warn("Failed to delete Cloudinary image:", err.message);
//             }
//           }

//           // Delete user from MongoDB
//           await User.deleteOne({ clerkId });
//           console.log(`Deleted user ${clerkId} from MongoDB`);
//         }

//         break;
//       default:
//         console.log("Unhandled Clerk webhook event:", type);
//     }

//     res.status(200).json({ message: "Webhook processed" });
//   } catch (error) {
//     console.error("Error handling webhook:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };
// export const handleClerkWebhook = async (req, res) => {
//   try {
//     const event = req.event; // This comes from verifyClerkWebhook middleware
//     const { type, data } = event;

//     switch (type) {
//       case "user.deleted":
//         const clerkId = data.id;

//         // Find the user
//         const user = await User.findOne({ clerkId });
//         if (user) {
//           // Delete cover image from Cloudinary if exists
//           if (user.coverImage) {
//             try {
//               await deleteFromCloudinary(user.coverImage);
//             } catch (err) {
//               console.warn("Failed to delete Cloudinary image:", err.message);
//             }
//           }

//           // Delete user from MongoDB
//           await User.deleteOne({ clerkId });
//           console.log(`Deleted user ${clerkId} from MongoDB`);
//         }

//         break;

//       // You can handle other events here
//       case "user.created":
//         console.log("User created in Clerk:", data.id);
//         break;

//       case "user.updated":
//         console.log("User updated in Clerk:", data.id);
//         break;

//       default:
//         console.log("Unhandled Clerk webhook event:", type);
//     }

//     res.status(200).json({ message: "Webhook processed" });
//   } catch (error) {
//     console.error("Error handling webhook:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

export const handleClerkWebhook = async (req, res) => {
  try {
    const event = req.event;
    const { type, data } = event;
    console.log("🔔 Received Clerk webhook event:", event.type);


    if (type === "user.deleted") {
      const clerkId = data.id;

      // Find the user
      const user = await User.findOne({ clerkId });

      if (user) {
        // 1️⃣ Delete user's cover image from Cloudinary
        if (user.coverImage) {
          try {
            await deleteFromCloudinary(user.coverImage);
          } catch (err) {
            console.warn("Failed to delete Cloudinary image:", err.message);
          }
        }

        // 2️⃣ Remove references in other users' followers/following
        await User.updateMany(
          { followers: user._id },
          { $pull: { followers: user._id } }
        );
        await User.updateMany(
          { following: user._id },
          { $pull: { following: user._id } }
        );

        // 3️⃣ Remove references in posts liked/saved by others
        await Post.updateMany(
          { likes: user._id },
          { $pull: { likes: user._id } }
        );
        await Post.updateMany(
          { savedBy: user._id },
          { $pull: { savedBy: user._id } }
        );

        // 4️⃣ Delete all posts uploaded by the user (optional: delete media from Cloudinary)
        const uploadedPosts = await Post.find({ uploadedBy: user._id });
        for (const post of uploadedPosts) {
          // Delete media if needed
          for (const media of post.media) {
            try {
              await deleteFromCloudinary(media.url);
            } catch (err) {
              console.warn("Failed to delete post media:", err.message);
            }
          }
          await Post.deleteOne({ _id: post._id });
        }

        // 5️⃣ Finally, delete the user
        await User.deleteOne({ clerkId });
        console.log(`Deleted user ${clerkId} and all related data`);
      }
    } else {
      console.log("Unhandled Clerk webhook event:", type);
    }

    res.status(200).json({ message: "Webhook processed" });
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 })

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const toggleFollow = async (req, res) => {
  try {
    const { userId } = req.params; // person to follow/unfollow
    const clerkId = req.auth.userId; // logged-in user’s Clerk ID

    // find logged-in user
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser)
      return res.status(404).json({ message: "User not found" });

    // prevent following yourself
    if (currentUser._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself.",
      });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser)
      return res.status(404).json({ message: "Target user not found" });

    let isFollowing;

    // check if already following
    if (currentUser.following.includes(userId)) {
      // 🔹 Unfollow logic
      await Promise.all([
        User.findByIdAndUpdate(currentUser._id, {
          $pull: { following: userId },
        }),
        User.findByIdAndUpdate(userId, {
          $pull: { followers: currentUser._id },
        }),
      ]);

      isFollowing = false;
    } else {
      // 🔹 Follow logic
      await Promise.all([
        User.findByIdAndUpdate(currentUser._id, {
          $addToSet: { following: userId },
        }),
        User.findByIdAndUpdate(userId, {
          $addToSet: { followers: currentUser._id },
        }),
      ]);

      isFollowing = true;
    }

    const updatedUser = await User.findById(userId)
      .select("fullName profileImage followers following")
      .populate("followers", "fullName profileImage")
      .populate("following", "fullName profileImage");

    return res.status(200).json({
      success: true,
      message: isFollowing
        ? "Followed successfully."
        : "Unfollowed successfully.",
      isFollowing,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Toggle follow error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle follow.",
    });
  }
};