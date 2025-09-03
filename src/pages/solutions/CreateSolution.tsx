import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { createSolution } from "../../api/githubSolutions";
import "../../styles/pages/CreateSolution.scss";
import { useDiscussionData } from "../../context/DiscussionDataContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "../../components/LoadingSpinner";

const CreateSolution = () => {
  const { loading, error, ids, addNewSolutionImplementationData } = useDiscussionData();
  // State to manage submission status
  const [isSubmitting, setIsSubmitting] = useState(false);


  const navigate = useNavigate();

  const close = () => navigate("/solutionImplementations");

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [solutionsUrl, setSolutionsUrl] = useState("");

  const repositoryId = ids?.repositoryId || "";
  const solutionImplementationCategoryId = ids?.solutionImplementationCategoryId || "";

  // The following variables are referenced but not defined in the original code:
  // selectedCategoryId, setSelectedCategoryId, solutionCategories
  // You may need to define them or remove the category selection if not needed.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); // Set submitting state to true

    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    if (!repositoryId || !solutionImplementationCategoryId) {
      alert("Repository ID or Category ID is missing.");
      return;
    }

    if (!title || !description || !solutionsUrl) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const solutionImplementationResponse = await createSolution({
        repositoryId: repositoryId,
        categoryId: solutionImplementationCategoryId,
        title,
        description,
        solutionsUrl,
      });
      alert("Solution created successfully!");

      // Add the solution to the discussion data context
      // This ensures the new solution appears in the list without needing a full refresh
      if (addNewSolutionImplementationData) {
        addNewSolutionImplementationData(solutionImplementationResponse);
      }

      // redirect back to solutions
      navigate("/solutionImplementations");
    } catch (err) {
      console.error("Error while creating:", err);
      alert("Creation failed.");
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  return (
    <div className="solution-detail-panel">
      <button onClick={close} className="close-button">
        <FontAwesomeIcon
          icon={faAnglesLeft}
          size="2xs"
          style={{ color: "#49454f" }}
        />{" "}
      </button>

      <div className="solution-creation-content">
        <h2>Create Solution Implementation</h2>
        <form onSubmit={handleSubmit} className="solution-form">
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
            Solution URL:
            <input
              type="string"
              value={solutionsUrl}
              onChange={(e) => setSolutionsUrl(e.target.value)}
              required
            />
          </label>

          <button type="submit">Create</button>
        </form>
      </div>
    </div>
  );
};

export default CreateSolution;
