import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { createSolution } from "../../api/githubSolutions";
import "../../styles/pages/CreateSolution.scss";
import { useDiscussionData } from "../../context/DiscussionDataContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";

const CreateSolution = () => {
  const { data, loading, error, repositoryId } = useDiscussionData();

  const navigate = useNavigate();

  const close = () => navigate("/solutions");

  if (loading) return <div>Lade Solutions...</div>;
  if (error) return <div>Fehler: {error}</div>;
  if (!data) return <p>Keine Daten verfügbar.</p>;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [solutionsUrl, setSolutionsUrl] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const { discussionCategories } = data;
  const solutionCategories = discussionCategories.filter(
    (cat) => cat.type == "Realizations"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId) {
      alert("Bitte eine Kategorie auswählen.");
      return;
    }

    try {
      await createSolution({
        repositoryId: repositoryId,
        categoryId: selectedCategoryId,
        title,
        description,
        solutionsUrl,
      });
      alert("Solution erfolgreich erstellt!");

      // redirect back to solutions
      navigate("/solutions");
    } catch (err) {
      console.error("Fehler beim Erstellen:", err);
      alert("Erstellen fehlgeschlagen.");
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
        <h2>Solution erstellen</h2>
        <form onSubmit={handleSubmit} className="solution-form">
          <label>
            Titel:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label>
            Beschreibung:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </label>

          <label>
            Solution-URL:
            <input
              type="string"
              value={solutionsUrl}
              onChange={(e) => setSolutionsUrl(e.target.value)}
              required
            />
          </label>

          <label>
            Kategorie:
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              required
            >
              <option value="">-- auswählen --</option>
              {solutionCategories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>

          <button type="submit">Erstellen</button>
        </form>
      </div>
    </div>
  );
};

export default CreateSolution;
