import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/pages/PatternDetailPanel.scss";
import { useDiscussionData } from "../../context/DiscussionDataContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";
import MappingList from "../../components/MappingList";

const PatternDetail = () => {
  // use params to get the pattern number from the URL 
  const { patternNumber } = useParams();

  const { loading, error, fetchDiscussionDetailsByNumber, ids } = useDiscussionData();
  const navigate = useNavigate();

  // State for loaded details
  const [patternDetails, setPatternDetails] = useState<any>(null);

  useEffect(() => {
    const loadDetails = async () => {
      if (patternNumber && ids?.patternCategoryId) {
        // Call the function and wait for the return value
        const details = await fetchDiscussionDetailsByNumber(ids.patternCategoryId, parseInt(patternNumber));
        if (details) {
          setPatternDetails(details);
        }
      }
    };
    loadDetails();
  }, [patternNumber, ids, fetchDiscussionDetailsByNumber]);

  const close = () => navigate("/patterns");

  if (loading && !patternDetails) return <div>Loading patterns...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!patternDetails) return <p>Pattern not found.</p>;

  return (
    <div className="pattern-detail-panel">
      <button onClick={close} className="close-button">
        <FontAwesomeIcon
          icon={faAnglesLeft}
          size="2xs"
          style={{ color: "#49454f" }}
        />{" "}
      </button>

      <div className="pattern-detail-content">
        <div className="pattern-category">
          <span dangerouslySetInnerHTML={{ __html: patternDetails.category.emojiHTML }} />
          <span>{patternDetails.category.name}</span>
        </div>

        <div className="item-title">
          {/* Assumption: Icon is included in the details */}
          <img src={patternDetails.icon} alt={`${patternDetails.title} Icon`} />
          <span>{patternDetails.title}</span>
        </div>

        <div className="separator"></div>

        <div className="pattern-description">
          <p dangerouslySetInnerHTML={{ __html: patternDetails.description || "No description available." }} />
        </div>

        <div className="separator"></div>

        <div className="pattern-linked-solutions">
          <h3>Linked Solutions:</h3>
          <MappingList
            sourceNumber={patternDetails.number}
            linkedNumbers={patternDetails.mappings}
            sourceCategory="patterns"
          />
        </div>

        <div className="separator"></div>

        <div className="pattern-meta">
          <p>
            <span className="bold">Pattern Reference:</span> {patternDetails.number}
          </p>
          <p>
            <span className="bold">Created by: </span>
            <img src={patternDetails.author.avatarUrl} alt={`${patternDetails.author.login} Icon`} />
            {patternDetails.author.login}
          </p>
          <p>
            <span className="bold">Created on:</span>{" "}
            {new Date(patternDetails.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatternDetail;