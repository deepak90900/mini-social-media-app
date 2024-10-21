import React, { useState } from "react";
import { storage, db } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const CreatePost: React.FC = () => {
  const { user } = useAuth();
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handlePost = async () => {
    if (!user) {
      toast.warn("Please log in to create a post.");
      return;
    }

    if (!image) {
      toast.warn("Please select an image.");
      return;
    }

    setLoading(true);
    try {
      // Upload image to Firebase Storage
      const imageRef = ref(
        storage,
        `posts/${user.uid}/${Date.now()}_${image.name}`
      );
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      // Save post information to Firestore
      const postRef = collection(db, "posts");
      await addDoc(postRef, {
        imageUrl,
        username: user.displayName || user.email,
        userId: user.uid, // Add userId field based on your structure
        description,
        likes: 0,
        comments: 0,
        createdAt: serverTimestamp(),
      });

      toast.success("Post created successfully!");
      setImage(null);
      setDescription("");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow-md w-80 mx-auto mb-4">
      <h2 className="text-xl font-bold mb-2">Create Post</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="w-full mb-2"
      />
      <textarea
        placeholder="Add a description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded mb-2"
        rows={3}
      />
      <button
        onClick={handlePost}
        disabled={loading}
        className={`w-full p-2 ${
          loading ? "bg-gray-400" : "bg-blue-500"
        } text-white rounded hover:bg-blue-600`}
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </div>
  );
};

export default CreatePost;
