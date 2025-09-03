import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/pages/PatternDetailPanel.scss";
import { useDiscussionData } from "../../context/DiscussionDataContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";
import MappingList from "../../components/MappingList";
import LoadingSpinner from "../../components/LoadingSpinner";
import { SolutionImplementation } from "../../types/DiscussionData";

const SolutionDetail = () => {
  // use params to get the pattern number from the URL 
  const { solutionImplementationNumber } = useParams();
  console.log("solutionImplementationNumber", solutionImplementationNumber);
  const { loading, error, fetchDiscussionDetailsByNumber, ids } = useDiscussionData();
  const navigate = useNavigate();

  // State for loaded details
  const [solutionImplementationDetails, setSolutionImplementationDetails] = useState<SolutionImplementation | null>(null);

  useEffect(() => {
    const loadDetails = async () => {
      if (solutionImplementationNumber && ids?.solutionImplementationCategoryId) {
        const details = await fetchDiscussionDetailsByNumber(ids.solutionImplementationCategoryId, parseInt(solutionImplementationNumber)) as SolutionImplementation | null;

        if (details) {
          setSolutionImplementationDetails(details);
        }
      }
    };
    loadDetails();
  }, [solutionImplementationNumber, ids, fetchDiscussionDetailsByNumber]);

  const close = () => navigate("/solutionImplementations");

  if (loading && !solutionImplementationDetails) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;
  if (!solutionImplementationDetails) return <p>Solution implementation not found.</p>;


  return (
    <div className="detail-panel">
      <button onClick={close} className="back-button">
        <FontAwesomeIcon icon={faAnglesLeft} />
        <span className="back-button-text">Back</span>
      </button>

      <div className="content-wrapper">
        <div className="content-header">
          <div className="entity-category">
            <span dangerouslySetInnerHTML={{ __html: solutionImplementationDetails.category.emojiHTML }} />
            <span className="category-name">{solutionImplementationDetails.category.name}</span>
          </div>
          <div className="item-title">
            <span className="title-text">{solutionImplementationDetails.title}</span>
          </div>
        </div>

        <div className="content-body">
          <div className="separator"></div>

          <div className="section">
            <h2 className="section-title">Description</h2>
            <div className="description-text" dangerouslySetInnerHTML={{ __html: solutionImplementationDetails.description || "No description available." }} />
          </div>

          <div className="separator"></div>

          <div className="section">
            <h2 className="section-title">Linked Solutions</h2>
            <MappingList
              sourceDiscussion={solutionImplementationDetails}
            />
          </div>
        </div>

        <footer>
          <p><span>Reference:</span> {solutionImplementationDetails.solutionRefUrl}</p>
          <p><span>Created by: </span><img src={solutionImplementationDetails.author.avatarUrl} alt={`${solutionImplementationDetails.author.login} Icon`} className="author-avatar" />{solutionImplementationDetails.author.login}</p>
          <p><span>Created on:</span> {new Date(solutionImplementationDetails.createdAt).toLocaleDateString()}</p>
        </footer>
      </div>
    </div>
  );
};

export default SolutionDetail;
