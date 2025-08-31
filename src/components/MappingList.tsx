import React, { useEffect, useState } from 'react';
import { useDiscussionData } from '../context/DiscussionDataContext';
import { useNavigate } from 'react-router-dom';
import Comment from './Comment';
import { PatternSolutionMapping, SolutionImplementation, Pattern } from '../types/DiscussionData';

type MappingListProps = {
    linkedNumbers: number[];
    sourceNumber: number;
};

const MappingList: React.FC<MappingListProps> = ({ linkedNumbers, sourceNumber }) => {
    const { loading, error, ids, fetchDiscussionDetailsByNumber, fetchMappingDiscussionByNumber } = useDiscussionData();
    const [mappingDiscussions, setMappingDiscussions] = useState<(PatternSolutionMapping | undefined)[]>([]);
    const [mappingTargetDetails, setMappingTargetDetails] = useState<{ [key: number]: { details: SolutionImplementation | Pattern | undefined, isVisible: boolean } }>({});
    const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);

    useEffect(() => {
        const loadMappedDiscussions = async () => {
            console.log("Loading mapping discussions:", linkedNumbers);

            if (!linkedNumbers || linkedNumbers.length === 0) {
                setMappingDiscussions([]);
                return;
            }

            const fetchPromises = linkedNumbers.map(discussionNumber => {
                return fetchMappingDiscussionByNumber(discussionNumber);
            });

            try {
                // 2. Warte auf alle Promises, um die Diskussionen abzurufen
                const allDiscussions = await Promise.all(fetchPromises);

                // 3. Filtere mögliche Null-Werte und setze den State
                const validDiscussions = allDiscussions.filter(discussion => discussion !== null);
                console.log("validDiscussions", validDiscussions);
                setMappingDiscussions(validDiscussions);
            } catch (error) {
                console.error("Fehler beim Laden der verknüpften Diskussionen:", error);
            }
        };

        loadMappedDiscussions();
    }, [linkedNumbers, fetchMappingDiscussionByNumber]);

    /**
     * Fetches the details of the mapped discussion
     * That is the solution implementation if the source is a pattern
     * Or the pattern if the source is a solution implementation
     * 
     * @param discussion The discussion that was clicked
     * @returns 
     */
    const handleMappingClick = async (discussion: PatternSolutionMapping | undefined) => {
        if (!discussion) return;

        // Check if we already have the details
        if (mappingTargetDetails[discussion.number]) {
            // Toggle visibility
            setMappingTargetDetails(prevDetails => ({
                ...prevDetails,
                [discussion.number]: {
                    ...prevDetails[discussion.number],
                    isVisible: !prevDetails[discussion.number].isVisible
                }
            }));
            return;
        }

        setIsLoadingDetails(true);

        // The sourceNumber is given
        // Check the parameter field to determine if it's a pattern or solution implementation
        const isSourcePattern = discussion.patternDiscussionNumber === sourceNumber;
        const targetDiscussionNumber = isSourcePattern ? discussion.solutionImplementationDiscussionNumber : discussion.patternDiscussionNumber;
        const targetCategoryId = isSourcePattern ? ids.solutionImplementationCategoryId : ids.patternCategoryId;

        if (!targetDiscussionNumber || !targetCategoryId) {
            console.error("Category ID or discussion number is missing.");
            setIsLoadingDetails(false);
            return;
        }

        const details = await fetchDiscussionDetailsByNumber(targetCategoryId, targetDiscussionNumber);
        console.log("Fetched details for mapping:", details);

        if (details) {
            // Initialize the state variable with the fetched details and the discussion.number as key
            setMappingTargetDetails(prevDetails => ({
                ...prevDetails,
                [discussion.number]: {
                    details: details,
                    isVisible: true
                }
            }));
        }

        setIsLoadingDetails(false);
    };

    if (loading && mappingDiscussions.length === 0) {
        return <p>Loading mappings content...</p>;
    }

    if (error) {
        return <p>Error loading mappings: {error}</p>;
    }

    if (mappingDiscussions.length === 0) {
        return <p>No mappings found.</p>;
    }

    return (
        <div className="mapping-list-container">
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
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MappingList;