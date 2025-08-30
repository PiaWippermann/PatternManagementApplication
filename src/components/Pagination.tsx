import React from 'react';
import './Pagination.module.scss';

type PaginationProps = {
    onPageChange: (cursor: string | null) => void;
    prevCursor: string | null;
    nextCursor: string | null;
    hasNextPage: boolean;
    loading: boolean;
};

const Pagination: React.FC<PaginationProps> = ({
    onPageChange,
    prevCursor,
    nextCursor,
    hasNextPage,
    loading
}) => {
    const isBackDisabled = prevCursor === undefined || loading;

    return (
        <div className="pagination-container">
            <button
                className="pagination-button"
                onClick={() => onPageChange(prevCursor)}
                disabled={isBackDisabled}
            >
                Back
            </button>

            <button
                className="pagination-button"
                onClick={() => onPageChange(nextCursor)}
                disabled={!hasNextPage || loading}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;