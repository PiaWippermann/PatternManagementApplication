import React, { useEffect, useState, useCallback } from 'react';
import { useDiscussionData } from '../context/DiscussionDataContext';
import CommentComponent from './Comment';
import { PatternSolutionMapping, SolutionImplementation, Pattern, ListData } from '../types/DiscussionData';
import { SimpleDiscussion } from '../types/GitHub';
import CommentCreator from './CommentCreator';
import { Comment, PageInfo } from '../types/GitHub';
import styles from './MappingList.module.scss';
import LoadingSpinner from './LoadingSpinner';
import Pagination from './Pagination';
import { createMapping } from '../api/githubMappings';
import { fetchDiscussionComments } from '../api/githubQueries';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";

type MappingListProps = {
    sourceDiscussion: Pattern | SolutionImplementation;
};

const MappingList: React.FC<MappingListProps> = ({ sourceDiscussion }) => {
    const { loading, error, ids, fetchDiscussionDetailsByNumber, fetchMappingDiscussionByNumber, fetchDiscussionList, addOrUpdateMappingData, addOrUpdatePatternData, addOrUpdateSolutionImplementationData } = useDiscussionData();

    // State to hold mapping discussions and their details which is the pattern or solution implementation discussion data
    // mappingDiscussions is always initialized with the mapping discussions given in the source discussion's mapping
    const [mappingDiscussions, setMappingDiscussions] = useState<(PatternSolutionMapping | undefined)[]>([]);
    // mappingTargetDetails holds the details of the target discussions for each mapping and is only populated when the mapping is expanded
    const [mappingTargetDetails, setMappingTargetDetails] = useState<{ [key: number]: { details: SolutionImplementation | Pattern | undefined, isVisible: boolean } }>({});

    // State variables for managing loading and creation states
    const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
    const [isInAddMappingMode, setIsInAddMappingMode] = useState<boolean>(false);
    const [isLoadingComments, setIsLoadingComments] = useState<{ [key: string]: boolean }>({});

    // State variables for managing selected item and creation pagination
    // Selected item is the detail view of a possibly new mapping
    const [selectedTargetOptionDetails, setSelectedTargetOptionDetails] = useState<Pattern | SolutionImplementation | undefined>(undefined);
    // Target mapping options list for the selection of a new mapping
    const [targetMappingOptionList, setTargetMappingOptionList] = useState<SimpleDiscussion[]>([]);
    // List and pagination info
    const [listPageInfo, setListPageInfo] = useState<PageInfo | null>(null);
    const [listPageHistory, setListPageHistory] = useState<Array<string | null>>([null]);
    const [currentListPageIndex, setCurrentListPageIndex] = useState<number>(0);

    // For loading target discussion list the target discussion category id is relevant
    // Get the source discussion category id
    const sourceDiscussionCategoryId = sourceDiscussion?.category.id;
    // TODO: get the target discussion categories from somewhere
    let targetDiscussionCategoryId: string;
    if (sourceDiscussionCategoryId == ids.patternCategoryId) {
        targetDiscussionCategoryId = ids.solutionImplementationCategoryId;
    } else {
        targetDiscussionCategoryId = ids.patternCategoryId;
    }

    // Initial loading of mapping discussions
    useEffect(() => {
        const loadMappedDiscussions = async () => {
            // Init the mapping discussions given by the source discussion's mapping property
            if (!sourceDiscussion || !sourceDiscussion.mappings || sourceDiscussion.mappings.length === 0) {
                setMappingDiscussions([]);
                return;
            }

            const fetchPromises = sourceDiscussion.mappings.map(discussionNumber => fetchMappingDiscussionByNumber(discussionNumber));
            try {
                const allDiscussions = await Promise.all(fetchPromises);
                const validDiscussions = allDiscussions.filter(discussion => discussion !== null);
                setMappingDiscussions(validDiscussions);
            } catch (error) {
                console.error("Error loading linked discussions:", error);
            }
        };

        loadMappedDiscussions();
    }, [sourceDiscussion, fetchMappingDiscussionByNumber]);

    const handletargetMappingOptionListFetched = useCallback((data: ListData) => {
        // 1. Get the numbers of all target discussions that are already linked via a mapping.
        // The target discussion is either the pattern or the solution implementation from the mapping.
        const mappedTargetNumbers = mappingDiscussions.map(mapping => {
            if (sourceDiscussion?.category.id === ids.patternCategoryId) {
                return mapping?.solutionImplementationDiscussionNumber;
            } else {
                return mapping?.patternDiscussionNumber;
            }
        }).filter(Boolean);

        // 2. Filter the new list to exclude discussions that are already mapped.
        const mappingOptions = data.discussions.filter(x => !mappedTargetNumbers.includes(x.number));

        // 3. Update the state with the filtered list and pagination info.
        setTargetMappingOptionList(mappingOptions);
        setListPageInfo(data.pageInfo);
    }, [mappingDiscussions, sourceDiscussion, ids]);

    // This useEffect will run when `isCreating` or the pagination state changes
    useEffect(() => {
        // Only run this effect when the "Create new mapping" view is active
        if (isInAddMappingMode && ids.patternCategoryId && ids.solutionImplementationCategoryId) {
            const currentCursor = listPageHistory[currentListPageIndex];
            fetchDiscussionList(targetDiscussionCategoryId, currentCursor, handletargetMappingOptionListFetched);
        }
    }, [isInAddMappingMode, ids, currentListPageIndex, listPageHistory, fetchDiscussionList, handletargetMappingOptionListFetched]);

    /**
     * 
     * @param discussion 
     * @returns 
     */
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
        const nextCursor = listPageInfo?.endCursor || null;
        if (nextCursor) {
            setListPageHistory(prev => [...prev, nextCursor]);
            setCurrentListPageIndex(prev => prev + 1);
        }
    };

    const handleCreationPrevPage = () => {
        setCurrentListPageIndex(prev => prev - 1);
    };

    const showDiscussionDetails = async (discussionNumber: number) => {
        const discussionDetails = await fetchDiscussionDetailsByNumber(ids.solutionImplementationCategoryId, discussionNumber);
        setSelectedTargetOptionDetails(discussionDetails);
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

    // MappingList.tsx

    const onLoadDiscussionComments = async (discussionId: string | undefined) => {
        if (!discussionId) return;

        // Set isLoadingComments for the current discussion
        setIsLoadingComments(prev => ({ ...prev, [discussionId]: true }));

        try {
            // Filter discussions to find the one to load comments for
            const discussionToUpdate = mappingDiscussions.find(d => d?.id === discussionId);
            const currentCursor = discussionToUpdate?.comments?.pageInfo?.endCursor || undefined;

            const comments = await fetchDiscussionComments(discussionId, 5, currentCursor);

            // Find the affected discussion and add the comments
            setMappingDiscussions(prevDiscussions => {
                return prevDiscussions.map(discussion => {
                    if (discussion && discussion.id === discussionId) {
                        // Merge the new comment nodes with the existing ones
                        const newNodes = [...(discussion.comments?.nodes || []), ...comments.nodes];

                        return {
                            ...discussion,
                            comments: {
                                nodes: newNodes,
                                pageInfo: comments.pageInfo // Update the pageInfo with the new one
                            }
                        };
                    }
                    return discussion;
                });
            });
        } catch (error) {
            console.error("Failed to load comments:", error);
        } finally {
            // Setze den Ladezustand für diese Diskussion auf false
            setIsLoadingComments(prev => ({ ...prev, [discussionId]: false }));
        }
    };

    const onCreateMapping = async (targetDiscussion: SolutionImplementation | Pattern) => {
        try {
            setIsLoadingDetails(true);

            const repositoryId = ids.repositoryId;
            console.log("Repository ID:", repositoryId);
            const categoryId = ids.patternSolutionMappingCategoryId;
            console.log("Mapping Category ID:", categoryId);

            if (!repositoryId || !categoryId) {
                console.error("Missing repository or mapping category ID");
                return;
            }

            // Check whether the source discussion is a pattern or a solution implementation
            let patternDiscussion = sourceDiscussion;
            let solutionImplementationDiscussion = targetDiscussion;

            if (!patternDiscussion || !solutionImplementationDiscussion) {
                return;
            }

            if (sourceDiscussion?.category.id == ids.solutionImplementationCategoryId) {
                patternDiscussion = targetDiscussion;
                solutionImplementationDiscussion = sourceDiscussion;
            }

            const title = `${patternDiscussion.title} - ${solutionImplementationDiscussion.title}`;

            // Function that handles the mapping creation
            // Including updating the pattern and the solution implementation discussions
            const response = await createMapping({ repositoryId, categoryId, title, patternDiscussion: (patternDiscussion as Pattern), solutionImplementationDiscussion: (solutionImplementationDiscussion as SolutionImplementation) });
            console.log("Mapping created successfully:", response);

            setMappingDiscussions(prev => [...prev, response.mapping]);

            // Update state with the created mapping discussion
            addOrUpdateMappingData(response.mapping);
            // Update state with the updated pattern discussion
            addOrUpdatePatternData(response.updatedPattern);
            // Update state with the updated solution implementation discussion
            addOrUpdateSolutionImplementationData(response.updatedSolutionImplementation);

            // Reset the creation state
            setIsInAddMappingMode(false);
            setSelectedTargetOptionDetails(undefined);
        } catch (error) {
            console.error("Error creating mapping:", error);
        }
    };

    // Check if the current state is "creating"
    // Then show the creation UI with a list of available discussions to map and the option to show details
    if (isInAddMappingMode) {
        if (selectedTargetOptionDetails) {
            return (
                <div className={styles.mappingListContainer}>
                    <h2 className={styles.creationTitle}>{selectedTargetOptionDetails.title}</h2>
                    <p>{selectedTargetOptionDetails.description}</p>
                    <button className="button-primary" onClick={() => onCreateMapping(selectedTargetOptionDetails)}>Create Mapping</button>
                    <button className="button-secondary" onClick={() => setSelectedTargetOptionDetails(undefined)}>Back to selection</button>
                </div>
            );
        }

        const isPrevDisabled = currentListPageIndex === 0;

        return (
            <div className={styles.mappingListContainer}>
                <h2 className={styles.mappingTitle}>Create a new mapping</h2>
                {loading && <LoadingSpinner />}
                {!loading && targetMappingOptionList.length === 0 && <p>No items found.</p>}
                {!loading && targetMappingOptionList.length > 0 && (
                    <ul className={styles.creationList}>
                        {targetMappingOptionList.map(item => (
                            <li key={item.number} onClick={() => showDiscussionDetails(item.number)}>
                                {item.title}
                            </li>
                        ))}
                    </ul>
                )}
                <Pagination
                    onPrevPage={handleCreationPrevPage}
                    onNextPage={handleCreationNextPage}
                    hasNextPage={listPageInfo?.hasNextPage || false}
                    isBackDisabled={isPrevDisabled}
                    loading={loading}
                />
                <button className="button-secondary" onClick={() => setIsInAddMappingMode(false)}>Cancel</button>
            </div>
        );
    }

    // Check if the current state is "loading"
    if (loading && mappingDiscussions.length === 0) {
        return <LoadingSpinner />;
    }

    // Check if the current state is "error"
    if (error) {
        return <p>Error loading mappings: {error}</p>;
    }

    // Check if there are no existing mapping discussions
    if (mappingDiscussions.length === 0) {
        return (
            <div className={styles.noItemsContainer}>
                <p>No mappings found.</p>
                <button className="button-primary" onClick={() => setIsInAddMappingMode(true)}>Create new mapping</button>
            </div>
        );
    }

    // In this case mappingDiscussions is not empty and we show the list
    // Option to get details for each mapping including comments
    return (
        <div className={styles.mappingListContainer}>
            <button className="button-primary" onClick={() => setIsInAddMappingMode(true)}>+ Create new mapping</button>
            <ul className={styles.list}>
                {mappingDiscussions.map((discussion) => (
                    (discussion && (
                        <li key={discussion?.id} className={styles.mappingItem}>
                            <div
                                className={styles.mappingHeader}
                                onClick={() => handleMappingClick(discussion)}
                            >
                                <span className={styles.mappingTitle}>{discussion?.title}</span>
                                <span className={`${styles.toggleIcon} ${mappingTargetDetails[discussion?.number]?.isVisible ? styles.toggled : ''}`}>
                                    <FontAwesomeIcon icon={mappingTargetDetails[discussion?.number]?.isVisible ? faChevronUp : faChevronDown} />
                                </span>
                            </div>

                            {mappingTargetDetails[discussion?.number] && mappingTargetDetails[discussion?.number].isVisible && (
                                <div className={styles.linkedDetailsContainer}>
                                    {isLoadingDetails ? (
                                        <LoadingSpinner />
                                    ) : (
                                        <>                                        <p>{mappingTargetDetails[discussion?.number].details?.description}</p>

                                            {/* Show the create comment section always */}
                                            <ul>
                                                <li className={styles.commentItem}>
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

                                            {/* Load comments */}
                                            {/* Show 'Load More Comments' button if there are more comments to load */}
                                            {discussion?.comments?.pageInfo?.hasNextPage && (
                                                <button
                                                    onClick={() => onLoadDiscussionComments(discussion?.id)}
                                                    className="button-primary"
                                                    disabled={isLoadingComments[discussion?.id || '']}
                                                >
                                                    {isLoadingComments[discussion?.id || ''] ? 'Loading...' : 'Load More Comments'}
                                                </button>
                                            )}

                                            {/* Show 'Load Comments' button if no comments are loaded yet */}
                                            {!discussion?.comments?.nodes?.length && !isLoadingComments[discussion?.id || ''] && (
                                                <button
                                                    onClick={() => onLoadDiscussionComments(discussion?.id)}
                                                    className="button-primary"
                                                >
                                                    Load Comments
                                                </button>
                                            )}

                                            {/* Show comments */}
                                            <ul className={styles.commentList}>
                                                {discussion?.comments?.nodes?.map((comment) => (
                                                    <li key={comment.id} className={styles.commentItem}>
                                                        <CommentComponent commentData={comment} />
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </div>
                            )}
                        </li>
                    ))))}
            </ul>
        </div>
    );
};

export default MappingList;