import React from 'react';
import './Pagination.module.scss';

type PaginationProps = {
    onPrevPage: () => void;
    onNextPage: () => void;
    hasNextPage: boolean;
    isBackDisabled: boolean;
    loading: boolean;
};

const Pagination: React.FC<PaginationProps> = ({
    onPrevPage,
    onNextPage,
    hasNextPage,
    isBackDisabled,
    loading
}) => {
    return (
        <div className="pagination-container">
            <button
                className="pagination-button"
                onClick={onPrevPage}
                disabled={isBackDisabled || loading}
            >
                Back
            </button>

            <button
                className="pagination-button"
                onClick={onNextPage}
                disabled={!hasNextPage || loading}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;