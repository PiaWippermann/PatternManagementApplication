import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { createPattern } from "../../api/githubPatterns";
import "../../styles/pages/CreatePattern.scss";
import { useDiscussionData } from "../../context/DiscussionDataContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "../../components/LoadingSpinner";

const CreatePattern = () => {
  const { loading, error, ids, addNewPatternData } = useDiscussionData();
  // State to manage submission status
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const close = () => navigate("/patterns");

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [iconUrl, setIconUrl] = useState("");

  const repositoryId = ids?.repositoryId || "";
  const patternCategoryId = ids?.patternCategoryId || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); // Set submitting state to true

    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    if (!repositoryId || !patternCategoryId) {
      alert("Repository ID or Category ID is missing.");
      return;
    }

    if (!title || !description || !referenceUrl) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const patternCreationResponse = await createPattern({
        repositoryId: repositoryId,
        categoryId: patternCategoryId,
        title,
        description,
        referenceUrl,
        iconUrl: iconUrl || undefined,
      });
      alert("Pattern created successfully!");

      // Add the pattern to the discussion data context
      // This ensures the new pattern appears in the list without needing a full refresh
      if (addNewPatternData && patternCreationResponse) {
        addNewPatternData(patternCreationResponse);
      }

      // redirect back to patterns
      navigate("/patterns");
    } catch (err) {
      console.error("Error while creating:", err);
      alert("Creation failed.");
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  return (
    <div className="pattern-detail-panel">
      <button onClick={close} className="close-button">
        <FontAwesomeIcon
          icon={faAnglesLeft}
          size="2xs"
          style={{ color: "#49454f" }}
        />{" "}
      </button>

      <div className="pattern-creation-content">
        <h2>Create Pattern</h2>
        <form onSubmit={handleSubmit} className="pattern-form">
          <label>
            Title:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label>
            Description:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </label>

          <label>
            Reference URL:
            <input
              type="string"
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              required
            />
          </label>

          <label>
            Icon URL (optional):
            <input
              type="url"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
            />
          </label>

          <button type="submit">Create</button>
        </form>
      </div>
    </div>
  );
};

export default CreatePattern;
