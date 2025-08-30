import React, { useEffect, useState } from 'react';
import { useDiscussionData } from '../context/DiscussionDataContext';
import { useNavigate } from 'react-router-dom';
import { BaseDiscussion } from '../types/GitHub';

type MappingListProps = {
    linkedNumbers: number[];
    sourceType: 'patterns' | 'solutionImplementations';
};

const MappingList: React.FC<MappingListProps> = ({ linkedNumbers, sourceType }) => {
    const { discussionData, loading, error, ids, fetchDiscussionDetailsByNumber, fetchMappingDiscussionByNumber } = useDiscussionData();
    const navigate = useNavigate();
    const [mappingDiscussions, setMappingDiscussions] = useState<(BaseDiscussion | undefined)[]>([]);

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
    }, [linkedNumbers, sourceType, fetchMappingDiscussionByNumber]);

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
                    <li key={discussion?.id} className="mapping-item">
                        <span className="mapping-title">{discussion?.title}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MappingList;