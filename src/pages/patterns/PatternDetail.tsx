import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDiscussionData } from "../../context/DiscussionDataContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";
import MappingList from "../../components/MappingList";
import "../../styles/pages/DetailPage.scss";
import { Pattern } from "../../types/DiscussionData";
import LoadingSpinner from "../../components/LoadingSpinner";

const PatternDetail = () => {
  const { patternNumber } = useParams();
  const { loading, error, fetchDiscussionDetailsByNumber, ids } = useDiscussionData();
  const navigate = useNavigate();

  const [patternDetails, setPatternDetails] = useState<Pattern | null>(null);

  useEffect(() => {
    const loadDetails = async () => {
      if (patternNumber && ids?.patternCategoryId) {
        const details = await fetchDiscussionDetailsByNumber(ids.patternCategoryId, parseInt(patternNumber)) as Pattern | null;

        if (details) {
          setPatternDetails(details);
        }
      }
    };
    loadDetails();
  }, [patternNumber, ids, fetchDiscussionDetailsByNumber]);

  const close = () => navigate("/patterns");

  if (loading && !patternDetails) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;
  if (!patternDetails) return <p>Details not found.</p>;

  return (
    <div className="detail-panel">
      <button onClick={close} className="back-button">
        <FontAwesomeIcon icon={faAnglesLeft} />
        <span className="back-button-text">Back</span>
      </button>

      <div className="content-wrapper">
        <div className="content-header">
          <div className="entity-category">
            <span dangerouslySetInnerHTML={{ __html: patternDetails.category.emojiHTML }} />
            <span className="category-name">{patternDetails.category.name}</span>
          </div>
          <div className="item-title">
            <img src={patternDetails.icon} alt={`${patternDetails.title} Icon`} className="item-icon" />
            <span className="title-text">{patternDetails.title}</span>
          </div>
        </div>

        <div className="content-body">
          <div className="separator"></div>

          <div className="section">
            <h2 className="section-title">Description</h2>
            <div className="description-text" dangerouslySetInnerHTML={{ __html: patternDetails.description || "No description available." }} />
          </div>

          <div className="separator"></div>

          <div className="section">
            <h2 className="section-title">Linked Solutions</h2>
            <MappingList
              sourceDiscussion={patternDetails}
            />
          </div>
        </div>

        <footer>
          <p><span>Reference:</span> {patternDetails.patternRef}</p>
          <p><span>Created by: </span><img src={patternDetails.author.avatarUrl} alt={`${patternDetails.author.login} Icon`} className="author-avatar" />{patternDetails.author.login}</p>
          <p><span>Created on:</span> {new Date(patternDetails.createdAt).toLocaleDateString()}</p>
        </footer>
      </div>
    </div>
  );
};

export default PatternDetail;