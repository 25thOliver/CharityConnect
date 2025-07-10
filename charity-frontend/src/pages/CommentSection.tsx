import React, { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CommentData, apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Props {
  campaignId: number;
  user: any;
  initialComments: CommentData[];
  onCommentAdded?: () => void;
}

const CommentSection: React.FC<Props> = ({ campaignId, user, initialComments, onCommentAdded }) => {
  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

 const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignId || !user || !newComment.trim()) return;

    const text = newComment.trim();
    setIsLoading(true);

    try {
      // Send comment
      await apiService.postComment({ campaign: campaignId, text });
      console.log('Comment posted 😊');

      // Retrieve fresh comments (including the new one)
      const updatedComments = await apiService.getComments(campaignId);
      console.log('Fetched comments:', updatedComments); // Confirm your API returns the latest
      setComments(updatedComments); // This ensures UI refreshes

    } catch (error) {
      console.error('post comment error', error);
      toast({ title: 'Failed to post comment', description: 'Please try again', variant: 'destructive' });
    } finally {
      setNewComment('');
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-10 space-y-6">
      <h2 className="text-xl font-semibold">Community Comments</h2>

      {user ? (
        <form onSubmit={submitComment} className="space-y-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            required
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Posting...' : 'Post Comment'}
          </Button>
        </form>
      ) : (
        <p className="text-muted-foreground">Sign in to leave a comment.</p>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="border p-4 rounded bg-muted/10">
              <p className="font-semibold">{comment.donor_name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(comment.created_at).toLocaleString()}
              </p>
              <p className="mt-1">{comment.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
