import React, { useEffect, useState, useCallback } from 'react';
import { useDiscussionData } from '../context/DiscussionDataContext';
import Comment from './Comment';
import { PatternSolutionMapping, SolutionImplementation, Pattern, PageInfo, ListData } from '../types/DiscussionData';
import { SimpleDiscussion } from '../types/GitHub';
import CommentCreator from './CommentCreator';

type MappingListProps = {
    linkedNumbers: number[];
    sourceNumber: number;
    sourceCategory: "patterns" | "solutionImplementations"
};

const MappingList: React.FC<MappingListProps> = ({ linkedNumbers, sourceNumber, sourceCategory }) => {
    const { loading, error, ids, fetchDiscussionDetailsByNumber, fetchMappingDiscussionByNumber, fetchDiscussionList } = useDiscussionData();

    // State data for mapping discussions
    const [mappingDiscussions, setMappingDiscussions] = useState<(PatternSolutionMapping | undefined)[]>([]);

    // Details for a target discussion indicated for a given mapping disussion number
    const [mappingTargetDetails, setMappingTargetDetails] = useState<{ [key: number]: { details: SolutionImplementation | Pattern | undefined, isVisible: boolean } }>({});

    // Loading state
    const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);

    // 💡 State variables for creation view
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<Pattern | SolutionImplementation | undefined>(undefined);
    const [creationList, setCreationList] = useState<SimpleDiscussion[]>([]);
    const [creationPageInfo, setCreationPageInfo] = useState<PageInfo | null>(null);

    // 💡 Pagination for creation view
    const [creationPageHistory, setCreationPageHistory] = useState<Array<string | null>>([null]);
    const [currentCreationPageIndex, setCurrentCreationPageIndex] = useState<number>(0);

    // Initial loading of mapping discussions
    useEffect(() => {
        const loadMappedDiscussions = async () => {
            if (!linkedNumbers || linkedNumbers.length === 0) {
                setMappingDiscussions([]);
                return;
            }
            const fetchPromises = linkedNumbers.map(discussionNumber => fetchMappingDiscussionByNumber(discussionNumber));
            try {
                const allDiscussions = await Promise.all(fetchPromises);
                const validDiscussions = allDiscussions.filter(discussion => discussion !== null);
                setMappingDiscussions(validDiscussions);
            } catch (error) {
                console.error("Error loading linked discussions:", error);
            }
        };
        loadMappedDiscussions();
    }, [linkedNumbers, fetchMappingDiscussionByNumber]);

    // 💡 Callback for loading the creation list
    const handleCreationListFetched = useCallback((data: ListData) => {
        setCreationList(data.discussions);
        setCreationPageInfo(data.pageInfo);
    }, []);

    // 💡 useEffect that loads the list for creation
    useEffect(() => {
        if (!isCreating || !ids.patternCategoryId || !ids.solutionImplementationCategoryId) return;

        const targetType = sourceCategory === 'patterns' ? 'solutionImplementations' : 'patterns';
        const targetCategoryId = targetType === 'patterns' ? ids.patternCategoryId : ids.solutionImplementationCategoryId;
        const currentCursor = creationPageHistory[currentCreationPageIndex];

        fetchDiscussionList(targetCategoryId, currentCursor, handleCreationListFetched);
    }, [isCreating, currentCreationPageIndex, creationPageHistory, ids, fetchDiscussionList, handleCreationListFetched, sourceCategory]);


    // handleMappingClick and other logic...
    const handleMappingClick = async (discussion: PatternSolutionMapping | undefined) => {
        // ...existing code...
    };

    // 💡 Pagination handler for creation view
    const handleCreationNextPage = () => {
        const nextCursor = creationPageInfo?.endCursor || null;
        if (nextCursor) {
            setCreationPageHistory(prev => [...prev, nextCursor]);
            setCurrentCreationPageIndex(prev => prev + 1);
        }
    };

    const handleCreationPrevPage = () => {
        setCurrentCreationPageIndex(prev => prev - 1);
    };

    const showDiscussionDetails = async (discussionNumber: number) => {
        // Fetch the discussion details and store the result in the selectedItem
        const discussionDetails = await fetchDiscussionDetailsByNumber(ids.solutionImplementationCategoryId, discussionNumber);
        setSelectedItem(discussionDetails);
    };

    const onAddedComment = async (comment: Comment) => {
        // Add the comment to the mapping discussion and update it to the state

    }

    if (loading && mappingDiscussions.length === 0) {
        return <p>Loading mappings content...</p>;
    }
    if (error) {
        return <p>Error loading mappings: {error}</p>;
    }
    if (mappingDiscussions.length === 0) {
        return (
            <div>
                <p>No mappings found.</p>
                <button onClick={() => setIsCreating(true)}>Create new mapping</button>
            </div>
        );
    }

    // Conditional rendering for creation view
    if (isCreating) {
        if (selectedItem) {
            return (
                <div>
                    <h2>{selectedItem.title}</h2>
                    <span>{selectedItem.description}</span>
                    <button>Create Mapping</button>
                    <button onClick={() => setSelectedItem(undefined)}>Back to selection</button>
                </div>
            );
        }

        const targetType = sourceCategory === 'patterns' ? 'Solution Implementations' : 'Patterns';
        const isPrevDisabled = currentCreationPageIndex === 0;
        const isNextDisabled = !creationPageInfo?.hasNextPage;

        return (
            <div>
                <h2>Select a {targetType} to map</h2>
                {loading && <p>Loading list...</p>}
                {!loading && creationList.length === 0 && <p>No items found.</p>}
                {!loading && creationList.length > 0 && (
                    <ul>
                        {creationList.map(item => (
                            <li key={item.number} onClick={() => showDiscussionDetails(item.number)}>
                                {item.title}
                            </li>
                        ))}
                    </ul>
                )}
                <div className="pagination-controls">
                    <button onClick={handleCreationPrevPage} disabled={isPrevDisabled}>Back</button>
                    <button onClick={handleCreationNextPage} disabled={isNextDisabled}>Next</button>
                </div>
                <button onClick={() => setIsCreating(false)}>Cancel</button>
            </div>
        );
    }

    return (
        <div className="mapping-list-container">
            {mappingDiscussions.length === 0 ? (
                <div>
                    <p>No mappings found.</p>
                    <button onClick={() => setIsCreating(true)}>Create new mapping</button>
                </div>
            ) : (
                <>
                    <button onClick={() => setIsCreating(true)}>+ Create new mapping</button>
                    <ul>
                        {mappingDiscussions.map((discussion) => (

                            // ... Ihre Rendering-Logik für die bestehenden Mappings
                            <li key={discussion?.id} className="mapping-item" onClick={() => handleMappingClick(discussion)}>
                                <span className="mapping-title">{discussion?.title}</span>
                                {discussion && mappingTargetDetails[discussion?.number] && mappingTargetDetails[discussion?.number].isVisible && (
                                    <div className="linked-details-container">
                                        {isLoadingDetails ? (
                                            <p>Lade Details...</p>
                                        ) : (
                                            <>
                                                <h3>{mappingTargetDetails[discussion?.number].details?.title}</h3>
                                                <p>{mappingTargetDetails[discussion?.number].details?.description}</p>
                                            </>
                                        )}
                                    </div>
                                )}
                                <ul>
                                    {discussion?.comments.nodes.map((comment) => (
                                        <li key={comment.id} className="comment-item">
                                            <Comment commentData={comment} />
                                        </li>
                                    ))}
                                    <li className="comment-item">
                                        <CommentCreator discussionId={discussion?.id} />
                                    </li>
                                </ul>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default MappingList;