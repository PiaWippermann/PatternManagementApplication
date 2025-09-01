import React, { useState } from 'react';
import styles from "./Comment.module.scss";
import { createDiscussionComment } from '../api/githubQueries';
import { Comment } from '../types/GitHub';

export default function CommentCreator({
    discussionId,
    onCommentSubmit
}: {
    discussionId: string | undefined;
    onCommentSubmit: (comment: Comment) => void;
}) {
    const [commentText, setCommentText] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (discussionId && commentText.trim()) {
            // Call the API to create a comment
            const commentResponse = await createDiscussionComment(discussionId, commentText);

            console.log("Comment created:", commentResponse);

            // Pass the created comment back to the parent component by calling the onCommentSubmit callback
            onCommentSubmit(commentResponse);

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