import React, { useState } from 'react';
import styles from "./Comment.module.scss";
import { createDiscussionComment } from '../api/githubQueries';
import { Comment } from '../types/GitHub';

export default function CommentCreator({
    discussionId,
}: {
    discussionId: string | undefined;
}) {
    const [commentText, setCommentText] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (discussionId && commentText.trim()) {
            // post this comment for the given discussionId
            const commentResponse = await createDiscussionComment(discussionId, commentText);
            // onCommentSubmit(commentResponse);
            setCommentText('');
        }
    };

    return (
        <form className={styles.commentCard} onSubmit={handleSubmit}>
            <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment"
                className={styles.body}
            />
            <button type="submit" className={styles.submitButton}>
                Kommentar erstellen
            </button>
        </form>
    );
}