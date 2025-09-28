'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import withAuth from '@/components/withAuth';
import 'react-quill/dist/quill.snow.css';
import AlertModal from '@/components/AlertModal';

const PostDetailPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalMessage, setAlertModalMessage] = useState('');
  const [onModalClose, setOnModalClose] = useState<() => void>(() => () => {});

  const openAlertModal = (message: string, onClose?: () => void) => {
    setAlertModalMessage(message);
    setAlertModalOpen(true);
    if (onClose) {
      setOnModalClose(() => onClose);
    }
  };

  const categoryNames: { [key: string]: string } = {
    notice: '공지사항',
    general: '자유게시판',
    jobs: '채용공고',
    inquiry: '문의/건의',
  };

  useEffect(() => {
    if (!id) return;

    const fetchPostAndComments = async () => {
      setLoading(true);
      try {
        const postResponse = await fetch(`/api/posts/${id}`);
        if (!postResponse.ok) throw new Error('게시글을 찾을 수 없습니다.');
        const postData = await postResponse.json();
        setPost(postData);

        const commentsResponse = await fetch(`/api/posts/${id}/comments`);
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          setComments(commentsData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '삭제에 실패했습니다.');
      }
      openAlertModal('게시글이 삭제되었습니다.', () => router.push(`/community/${post.category}`));
    } catch (err: any) {
      openAlertModal(`오류: ${err.message}`);
    }
  };

  const handlePinToggle = async () => {
    try {
      const response = await fetch(`/api/posts/${id}/pin`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '고정 상태 변경에 실패했습니다.');
      }
      const { is_pinned } = await response.json();
      setPost({ ...post, is_pinned });
      openAlertModal(`게시글이 ${is_pinned ? '고정되었습니다' : '고정 해제되었습니다'}.`);
    } catch (err: any) {
      openAlertModal(`오류: ${err.message}`);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const response = await fetch(`/api/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ content: newComment }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '댓글 작성에 실패했습니다.');
      }
      const newCommentData = await response.json();
      setComments([...comments, newCommentData]);
      setNewComment('');
    } catch (err: any) {
      openAlertModal(`오류: ${err.message}`);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;
    try {
      const response = await fetch(`/api/posts/${id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '댓글 삭제에 실패했습니다.');
      }
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err: any) {
      openAlertModal(`오류: ${err.message}`);
    }
  };

  const handleStartEdit = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editingContent.trim()) return;
    try {
      const response = await fetch(`/api/posts/${id}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ content: editingContent }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '댓글 수정에 실패했습니다.');
      }
      const updatedComment = await response.json();
      setComments(comments.map(c => c.id === commentId ? updatedComment : c));
      handleCancelEdit();
    } catch (err: any) {
      openAlertModal(`오류: ${err.message}`);
    }
  };

  const canModifyPost = user && (user.id === post?.user_id || user.is_admin === 1);
  const showCommentForm = user && (post?.category !== 'inquiry' || (post?.category === 'inquiry' && user.is_admin === 1));

  if (loading || authLoading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Loading...</p></div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen"><p className="text-red-500">오류: {error}</p></div>;
  }

  if (!post) {
    return <div className="flex justify-center items-center min-h-screen"><p>게시글을 찾을 수 없습니다.</p></div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <AlertModal
        isOpen={alertModalOpen}
        onClose={() => {
          setAlertModalOpen(false);
          if (onModalClose) {
            onModalClose();
          }
        }}
        message={alertModalMessage}
      />
      <div className="bg-white dark:bg-gray-800 p-8 sm:p-12 rounded-xl shadow-lg">
        <div className="mb-8">
          <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-sm font-semibold px-3 py-1 rounded-full mb-4">
            {categoryNames[post.category] || post.category}
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-primary dark:text-blue-400 font-heading">{post.title}</h1>
          <div className="flex items-center text-gray-500 dark:text-gray-400 mt-4">
            <span className={post.author_is_admin ? 'font-bold text-red-500' : ''}>{post.author_name}</span>
            <span className="mx-2">·</span>
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
            {post.is_pinned === 1 && <span className="ml-4 text-yellow-500 font-bold">[고정됨]</span>}
          </div>
        </div>

        <div
          className="prose prose-lg max-w-none text-gray-800 dark:text-gray-200 leading-relaxed border-t dark:border-gray-700 pt-8 ql-editor"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="flex justify-between items-center mt-12 border-t dark:border-gray-700 pt-6">
            <button onClick={() => router.push(`/community/${post.category}`)} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                목록으로
            </button>
            <div className="flex gap-4">
                {user?.is_admin === 1 && (
                    <button onClick={handlePinToggle} className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                        {post.is_pinned ? '고정 해제' : '상단 고정'}
                    </button>
                )}
                {canModifyPost && (
                    <>
                        <button onClick={() => router.push(`/community/post/${id}/edit`)} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 font-bold py-2 px-6 rounded-lg transition-colors">수정</button>
                        <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">삭제</button>
                    </>
                )}
            </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 sm:p-12 rounded-xl shadow-lg mt-8">
        <h2 className="text-3xl font-bold text-primary dark:text-blue-400 mb-6">{post.category === 'inquiry' ? '답변' : '댓글'}</h2>
        
        <div className="space-y-6">
          {comments.map(comment => (
            <div key={comment.id} className={`p-4 rounded-lg ${comment.author_is_admin ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
              {editingCommentId === comment.id ? (
                <div>
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent transition-shadow mb-4"
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={handleCancelEdit} className="text-sm text-gray-600 dark:text-gray-300 py-1 px-3 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">취소</button>
                    <button onClick={() => handleUpdateComment(comment.id)} className="text-sm text-white bg-accent py-1 px-3 rounded-md hover:bg-opacity-90">저장</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center mb-2">
                    <p className={`font-semibold ${comment.author_is_admin ? 'text-red-500' : 'text-gray-800 dark:text-gray-100'}`}>{comment.author_name}</p>
                    <span className="text-gray-400 dark:text-gray-500 text-sm ml-auto">{new Date(comment.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                  {user && (user.id === comment.user_id || user.is_admin === 1) && (
                    <div className="flex justify-end gap-2 mt-2">
                      <button onClick={() => handleStartEdit(comment)} className="text-xs text-gray-500 dark:text-gray-400 hover:underline">수정</button>
                      <button onClick={() => handleDeleteComment(comment.id)} className="text-xs text-gray-500 dark:text-gray-400 hover:underline">삭제</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {comments.length === 0 && <p className="text-gray-500 dark:text-gray-400">아직 댓글이 없습니다.</p>}
        </div>

        {showCommentForm && (
          <form onSubmit={handleCommentSubmit} className="mt-8 pt-6 border-t dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">{post.category === 'inquiry' ? '답변 작성' : '댓글 작성'}</h3>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
              rows={4}
              placeholder={post.category === 'inquiry' ? '답변을 입력하세요.' : '댓글을 입력하세요.'}
              required
            />
            <div className="flex justify-end mt-4">
              <button type="submit" className="bg-accent hover:bg-opacity-90 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                {post.category === 'inquiry' ? '답변 등록' : '댓글 등록'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default withAuth(PostDetailPage);
