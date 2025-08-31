import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/pages/PatternDetailPanel.scss";
import { useDiscussionData } from "../../context/DiscussionDataContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";
import MappingList from "../../components/MappingList";


const SolutionDetail = () => {
  // use params to get the pattern number from the URL 
  const { solutionImplementationNumber } = useParams();
  console.log("solutionImplementationNumber", solutionImplementationNumber);
  const { discussionData, loading, error, fetchDiscussionDetailsByNumber, ids } = useDiscussionData();
  const navigate = useNavigate();

  // State for loaded details
  const [solutionImplementationDetails, setSolutionImplementationDetails] = useState<any>(null);

  useEffect(() => {
    const loadDetails = async () => {
      if (solutionImplementationNumber && ids?.solutionImplementationCategoryId) {
        // Call the function and wait for the return value
        const details = await fetchDiscussionDetailsByNumber(ids.solutionImplementationCategoryId, parseInt(solutionImplementationNumber));
        if (details) {
          setSolutionImplementationDetails(details);
        }
      }
    };
    loadDetails();
  }, [solutionImplementationNumber, ids, fetchDiscussionDetailsByNumber]);

  const close = () => navigate("/solutionImplementations");

  if (loading && !solutionImplementationDetails) return <div>Loading solution implementations...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!solutionImplementationDetails) return <p>Solution implementation not found.</p>;


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
          {/* <span dangerouslySetInnerHTML={{ __html: solutionImplementationDetails.category.emojiHTML }} />
          <span>{solutionImplementationDetails.category.name}</span> */}
        </div>

        <div className="item-title">
          <span>{solutionImplementationDetails.title}</span>
        </div>

        <div className="separator"></div>

        <div className="pattern-description">
          <p dangerouslySetInnerHTML={{ __html: solutionImplementationDetails.description || "No description available." }} />
        </div>

        <div className="separator"></div>

        <div className="pattern-linked-solutions">
          <h3>Linked Patterns:</h3>
          <MappingList
            sourceNumber={solutionImplementationDetails.number}
            linkedNumbers={solutionImplementationDetails.mappings}
          />
        </div>

        <div className="separator"></div>

        <div className="pattern-meta">
          <p>
            <span className="bold">Solution Implementation URL:</span> {solutionImplementationDetails.solutionRefUrl || "No URL available."}
          </p>
          <p>
            <span className="bold">Created by: </span>
            <img src={solutionImplementationDetails.author.avatarUrl} alt={`${solutionImplementationDetails.author.login} Icon`} />
            {solutionImplementationDetails.author.login}
          </p>
          <p>
            <span className="bold">Created on:</span>{" "}
            {new Date(solutionImplementationDetails.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SolutionDetail;
