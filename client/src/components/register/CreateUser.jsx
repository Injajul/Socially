import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createUser } from "../../redux/slices/userSlice";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FiUpload, FiX } from "react-icons/fi";
import { useAuth } from "@clerk/clerk-react";
function CreateUser() {
  const { getToken } = useAuth();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    bio: "",
    coverImage: null,
  });

  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.bio.trim()) newErrors.bio = "Bio is required";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      if (file && file.size > 10 * 1024 * 1024) {
        toast.error("Image size must be less than 10MB");
        return;
      }
      setFormData((prev) => ({ ...prev, coverImage: file }));
      setPreview(file ? URL.createObjectURL(file) : null);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, coverImage: null }));
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors in the form");
      return;
    }

    const userData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) userData.append(key, value);
    });

    try {
      const token = await getToken();
      await dispatch(createUser({ formData, token })).unwrap();
      toast.success("Account created successfully!");
      setFormData({ bio: "", coverImage: null });
      setPreview(null);
      navigate("/");
    } catch (err) {
      toast.error(err || "Failed to create account");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-l from-[#174336] via-[#203a43] to-[#174336] p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full p-8 sm:p-10"
      >
        <h2 className="text-xl md:text-3xl font-extrabold text-center bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-8">
          Create Your Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Write your bio here..."
              rows="4"
              className={`w-full p-3 rounded-lg bg-gray-900/40 border ${
                errors.bio ? "border-red-400" : "border-white/20"
              } text-gray-100 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 placeholder-gray-400 transition-all`}
            />
            {errors.bio && (
              <p className="text-red-400 text-sm mt-1">{errors.bio}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Upload Cover Image
            </label>
            <div className="relative flex flex-col items-center justify-center w-full border-2 border-dashed border-white/20 rounded-xl bg-gray-900/40 p-6 hover:bg-gray-900/60 transition-all duration-300 cursor-pointer">
              {!preview ? (
                <>
                  <FiUpload className="w-10 h-10 text-emerald-400 mb-2" />
                  <p className="text-gray-300 text-sm">
                    Drag & Drop or Click to Upload
                  </p>
                  <input
                    type="file"
                    name="coverImage"
                    accept="image/*"
                    onChange={handleChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </>
              ) : (
                <div className="relative w-full">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-white/20"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            type="submit"
            className="w-full py-3 mt-4 font-semibold text-lg text-white rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Account"}
          </motion.button>

          <p className="text-center text-gray-400 text-sm mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-emerald-400 hover:text-emerald-300 underline"
            >
              Log in
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}

export default CreateUser;
