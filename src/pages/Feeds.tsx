import React, { useEffect, useState, useCallback } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  increment,
  addDoc,
  setDoc,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import CreatePost from "../components/CreatePost";

interface Post {
  id: string;
  imageUrl: string;
  username: string;
  likes: number;
  comments: number;
  userLiked: boolean;
  userSaved: boolean;
}

interface Comment {
  id: string;
  text: string;
  username: string;
  createdAt: any;
  replies?: Reply[];
}

interface Reply {
  id: string;
  text: string;
  username: string;
  createdAt: any;
}

const Feeds: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [newReply, setNewReply] = useState<{ [key: string]: string }>({});
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const fetchPosts = useCallback(async () => {
    if (isFetching) return;
    setIsFetching(true);
    setLoading(true);

    try {
      const postsCollection = collection(db, "posts");
      let q = query(postsCollection, orderBy("likes", "desc"), limit(2));
      if (lastDoc) {
        q = query(
          postsCollection,
          orderBy("likes", "desc"),
          startAfter(lastDoc),
          limit(5)
        );
      }
      const querySnapshot = await getDocs(q);
      const newPosts: Post[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        userLiked: false,
        userSaved: false,
      })) as Post[];

      setPosts((prevPosts) => {
        const ids = new Set(prevPosts.map((p) => p.id));
        const uniqueNewPosts = newPosts.filter((p) => !ids.has(p.id));
        return [...prevPosts, ...uniqueNewPosts];
      });

      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts. Please refresh the page.");
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [lastDoc, isFetching]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchComments = async (postId: string) => {
    try {
      const commentsCollection = collection(db, `posts/${postId}/comments`);
      const querySnapshot = await getDocs(commentsCollection);
      const postComments: Comment[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];

      for (let comment of postComments) {
        const repliesCollection = collection(
          db,
          `posts/${postId}/comments/${comment.id}/replies`
        );
        const repliesSnapshot = await getDocs(repliesCollection);
        const commentReplies: Reply[] = repliesSnapshot.docs.map(
          (replyDoc) => ({
            id: replyDoc.id,
            ...replyDoc.data(),
          })
        ) as Reply[];
        comment.replies = commentReplies;
      }

      setComments((prev) => ({ ...prev, [postId]: postComments }));
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments.");
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      toast.warn("Please log in to like posts.");
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
      toast.success("Post liked!");
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Unable to like post. Please try again.");
    }
  };

  const handleSave = async (postId: string) => {
    if (!user) {
      toast.warn("Please log in to save posts.");
      return;
    }

    const saveRef = doc(db, `users/${user.uid}/savedPosts`, postId);
    try {
      await setDoc(saveRef, { postId });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, userSaved: true } : post
        )
      );
      toast.success("Post saved!");
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("Unable to save post. Please try again.");
    }
  };

  const handleComment = async (postId: string) => {
    if (!user) {
      toast.warn("Please log in to comment on posts.");
      return;
    }

    const commentText = newComment[postId];
    if (!commentText) return;

    const commentsCollection = collection(db, `posts/${postId}/comments`);
    try {
      await addDoc(commentsCollection, {
        text: commentText,
        username: user.displayName || user.email,
        createdAt: serverTimestamp(),
      });
      setNewComment((prev) => ({ ...prev, [postId]: "" }));
      fetchComments(postId);
      toast.success("Comment added!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment. Please try again.");
    }
  };

  const handleReply = async (postId: string, commentId: string) => {
    if (!user) {
      toast.warn("Please log in to reply.");
      return;
    }

    const replyText = newReply[commentId];
    if (!replyText) return;

    const repliesCollection = collection(
      db,
      `posts/${postId}/comments/${commentId}/replies`
    );
    try {
      await addDoc(repliesCollection, {
        text: replyText,
        username: user.displayName || user.email,
        createdAt: serverTimestamp(),
      });
      setNewReply((prev) => ({ ...prev, [commentId]: "" }));
      fetchComments(postId);
      toast.success("Reply added!");
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error("Failed to add reply. Please try again.");
    }
  };

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100 ||
      loading
    )
      return;
    fetchPosts();
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Feeds</h1>
      <CreatePost />
      <div className="flex flex-col items-center">
        {posts.map((post) => (
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
              <button
                onClick={() => handleSave(post.id)}
                className={`text-sm ${
                  post.userSaved ? "text-green-500" : "text-gray-500"
                } cursor-pointer ml-4`}
              >
                {post.userSaved ? "Saved" : "Save"}
              </button>
              <button
                onClick={() => fetchComments(post.id)}
                className="text-sm text-gray-500 cursor-pointer ml-4"
              >
                View Comments
              </button>
            </div>

            {comments[post.id] && (
              <div className="mt-4">
                {comments[post.id].map((comment) => (
                  <div
                    key={comment.id}
                    className="p-2 bg-gray-200 rounded mb-2"
                  >
                    <p className="text-sm font-semibold">{comment.username}</p>
                    <p className="text-sm">{comment.text}</p>

                    {comment.replies &&
                      comment.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="p-1 bg-gray-300 rounded mb-1 ml-4"
                        >
                          <p className="text-xs font-semibold">
                            {reply.username}
                          </p>
                          <p className="text-xs">{reply.text}</p>
                        </div>
                      ))}

                    {user && (
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Add a reply..."
                          value={newReply[comment.id] || ""}
                          onChange={(e) =>
                            setNewReply({
                              ...newReply,
                              [comment.id]: e.target.value,
                            })
                          }
                          className="w-full p-1 border rounded mb-1 text-xs"
                        />
                        <button
                          onClick={() => handleReply(post.id, comment.id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs"
                        >
                          Reply
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {user && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment[post.id] || ""}
                  onChange={(e) =>
                    setNewComment({ ...newComment, [post.id]: e.target.value })
                  }
                  className="w-full p-2 border rounded mb-2"
                />
                <button
                  onClick={() => handleComment(post.id)}
                  className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                >
                  Comment
                </button>
              </div>
            )}
          </div>
        ))}
        {loading && <p>Loading more posts...</p>}
      </div>
    </div>
  );
};

export default Feeds;
