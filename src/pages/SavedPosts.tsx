import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

interface Post {
  id: string;
  imageUrl: string;
  username: string;
  likes: number;
  comments: number;
}

const SavedPosts: React.FC = () => {
  const { user } = useAuth();
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (!user) return;

      try {
        const savedPostsCollection = collection(
          db,
          `users/${user.uid}/savedPosts`
        );
        const savedPostsSnapshot = await getDocs(savedPostsCollection);
        const savedPostIds = savedPostsSnapshot.docs.map(
          (doc) => doc.data().postId
        );

        const posts: Post[] = [];
        for (let postId of savedPostIds) {
          const postRef = doc(db, "posts", postId);
          const postSnapshot = await getDoc(postRef);
          if (postSnapshot.exists()) {
            posts.push({ id: postSnapshot.id, ...postSnapshot.data() } as Post);
          }
        }

        setSavedPosts(posts);
      } catch (error) {
        console.error("Error fetching saved posts:", error);
      }
    };

    fetchSavedPosts();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Saved Posts</h1>
      <div className="flex flex-col items-center">
        {savedPosts.length === 0 ? (
          <p>No saved posts yet.</p>
        ) : (
          savedPosts.map((post) => (
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
                <span>{post.comments} Comments</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SavedPosts;
