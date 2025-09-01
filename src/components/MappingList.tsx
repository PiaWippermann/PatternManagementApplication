import React, { useEffect, useState, useCallback } from 'react';
import { useDiscussionData } from '../context/DiscussionDataContext';
import CommentComponent from './Comment';
import { PatternSolutionMapping, SolutionImplementation, Pattern, PageInfo, ListData } from '../types/DiscussionData';
import { SimpleDiscussion } from '../types/GitHub';
import CommentCreator from './CommentCreator';
import { Comment } from '../types/GitHub';

type MappingListProps = {
    linkedNumbers: number[];
    sourceNumber: number;
    sourceCategory: "patterns" | "solutionImplementations"
};

const MappingList: React.FC<MappingListProps> = ({ linkedNumbers, sourceNumber, sourceCategory }) => {
    const { loading, error, ids, fetchDiscussionDetailsByNumber, fetchMappingDiscussionByNumber, fetchDiscussionList, addOrUpdateMappingData } = useDiscussionData();

    const [mappingDiscussions, setMappingDiscussions] = useState<(PatternSolutionMapping | undefined)[]>([]);
    const [mappingTargetDetails, setMappingTargetDetails] = useState<{ [key: number]: { details: SolutionImplementation | Pattern | undefined, isVisible: boolean } }>({});
    const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<Pattern | SolutionImplementation | undefined>(undefined);
    const [creationList, setCreationList] = useState<SimpleDiscussion[]>([]);
    const [creationPageInfo, setCreationPageInfo] = useState<PageInfo | null>(null);
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

    const handleCreationListFetched = useCallback((data: ListData) => {
        setCreationList(data.discussions);
        setCreationPageInfo(data.pageInfo);
    }, []);

    // This useEffect will run when `isCreating` or the pagination state changes
    useEffect(() => {
        // Only run this effect when the "Create new mapping" view is active
        if (isCreating && ids.patternCategoryId && ids.solutionImplementationCategoryId) {
            const targetType = sourceCategory === 'patterns' ? 'solutionImplementations' : 'patterns';
            const targetCategoryId = targetType === 'patterns' ? ids.patternCategoryId : ids.solutionImplementationCategoryId;
            const currentCursor = creationPageHistory[currentCreationPageIndex];
            fetchDiscussionList(targetCategoryId, currentCursor, handleCreationListFetched);
        }
    }, [isCreating, ids, currentCreationPageIndex, creationPageHistory, fetchDiscussionList, handleCreationListFetched, sourceCategory]);


    const handleMappingClick = async (discussion: PatternSolutionMapping | undefined) => {
        if (!discussion) return;

        // Get a reference to the existing details for this discussion number
        const existingDetails = mappingTargetDetails[discussion.number];

        if (existingDetails) {
            // Create a new object for the updated details, change only visibility
            const updatedDetails = {
                ...existingDetails,
                isVisible: !existingDetails.isVisible,
            };

            // Create a new object for the entire mappingTargetDetails state
            setMappingTargetDetails(prevDetails => ({
                ...prevDetails,
                [discussion.number]: updatedDetails, // Update discussion details
            }));

        } else {
            // No existing details, fetch them
            setIsLoadingDetails(true);
            const details = await fetchDiscussionDetailsByNumber(ids.solutionImplementationCategoryId, discussion.number);
            setIsLoadingDetails(false);

            // Create a new object to represent the state update
            setMappingTargetDetails(prevDetails => ({
                ...prevDetails,
                [discussion.number]: {
                    isVisible: true,
                    details
                },
            }));
        }
    };

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
        const discussionDetails = await fetchDiscussionDetailsByNumber(ids.solutionImplementationCategoryId, discussionNumber);
        setSelectedItem(discussionDetails);
    };

    const onAddedComment = (discussionId: string, comment: Comment) => {
        const updatedDiscussions = mappingDiscussions.map(discussion => {
            if (discussion && discussion.id === discussionId) {
                return {
                    ...discussion,
                    comments: {
                        ...discussion.comments,
                        nodes: [...(discussion.comments?.nodes || []), comment]
                    }
                };
            }
            return discussion;
        });

        setMappingDiscussions(updatedDiscussions);

        const updatedMappingData = updatedDiscussions.find(d => d?.id === discussionId);
        if (updatedMappingData) {
            addOrUpdateMappingData(updatedMappingData);
        }
    };

    // Check if the current state is "creating"
    // Then show the creation UI with a list of discussions and the option to show details
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

    // Check if the current state is "loading"
    if (loading && mappingDiscussions.length === 0) {
        return <p>Loading mappings content...</p>;
    }

    // Check if the current state is "error"
    if (error) {
        return <p>Error loading mappings: {error}</p>;
    }

    // Check if there are no mapping discussions
    if (mappingDiscussions.length === 0) {
        return (
            <div>
                <p>No mappings found.</p>
                <button onClick={() => setIsCreating(true)}>Create new mapping</button>
            </div>
        );
    }

    // In this case mappingDiscussions is not empty and we show the list
    // Option to get details for each mapping including comments
    return (
        <div className="mapping-list-container">
            <button onClick={() => setIsCreating(true)}>+ Create new mapping</button>
            <ul>
                {mappingDiscussions.map((discussion) => (
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

                                        <ul>
                                            {discussion?.comments.nodes.map((comment) => (
                                                <li key={comment.id} className="comment-item">
                                                    <CommentComponent commentData={comment} />
                                                </li>
                                            ))}
                                            <li className="comment-item">
                                                <CommentCreator
                                                    discussionId={discussion?.id}
                                                    onCommentSubmit={(comment) => {
                                                        if (discussion?.id) {
                                                            onAddedComment(discussion.id, comment);
                                                        }
                                                    }}
                                                />
                                            </li>
                                        </ul>
                                    </>
                                )}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MappingList;