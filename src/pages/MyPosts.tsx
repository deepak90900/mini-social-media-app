import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

interface Post {
  id: string;
  imageUrl: string;
  username: string;
  likes: number;
  comments: number;
  userLiked: boolean;
}

const MyPosts: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchMyPosts = async () => {
      if (!user) return;

      try {
        const postsCollection = collection(db, "posts");
        const q = query(postsCollection, where("userId", "==", user.uid)); // Match by user ID
        const querySnapshot = await getDocs(q);
        const myPosts: Post[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          userLiked: false,
        })) as Post[];
        setPosts(myPosts);
      } catch (error) {
        console.error("Error fetching my posts:", error);
      }
    };

    fetchMyPosts();
  }, [user]);

  const handleLike = async (postId: string) => {
    if (!user) {
      alert("Please log in to like posts.");
      return;
    }

    const postRef = doc(db, "posts", postId);
    try {
      await updateDoc(postRef, { likes: increment(1) });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, likes: post.likes + 1, userLiked: true }
            : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">My Posts</h1>
      <div className="flex flex-col items-center">
        {posts.length === 0 ? (
          <p>You have not posted anything yet.</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="w-80 bg-white rounded shadow-md p-4 mb-4"
            >
              <img
                src={post.imageUrl}
                alt="Post"
                className="w-full h-40 object-cover rounded mb-2"
              />
              <p className="font-semibold">{post.username}</p>
              <div className="flex justify-between mt-2">
                <span>{post.likes} Likes</span>
                <button
                  onClick={() => handleLike(post.id)}
                  className={`text-sm ${
                    post.userLiked ? "text-blue-500" : "text-gray-500"
                  } cursor-pointer`}
                >
                  Like
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyPosts;
