import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { createPattern } from "../../api/githubPatterns";
import "../../styles/pages/CreatePattern.scss";
import { useDiscussionData } from "../../context/DiscussionDataContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";

const CreatePattern = () => {
  const { data, loading, error, repositoryId } = useDiscussionData();

  const navigate = useNavigate();

  const close = () => navigate("/patterns");

  if (loading) return <div>Lade Patterns...</div>;
  if (error) return <div>Fehler: {error}</div>;
  if (!data) return <p>Keine Daten verfügbar.</p>;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const { discussionCategories } = data;
  const patternCategories = discussionCategories.filter(
    (cat) => cat.type == "Patterns"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId) {
      alert("Bitte eine Kategorie auswählen.");
      return;
    }

    try {
      await createPattern({
        repositoryId: repositoryId,
        categoryId: selectedCategoryId,
        title,
        description,
        referenceUrl,
        iconUrl: iconUrl || undefined,
      });
      alert("Pattern erfolgreich erstellt!");

      // redirect back to patterns
      navigate("/patterns");
    } catch (err) {
      console.error("Fehler beim Erstellen:", err);
      alert("Erstellen fehlgeschlagen.");
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
        <h2>Pattern erstellen</h2>
        <form onSubmit={handleSubmit} className="pattern-form">
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
            Referenz-URL:
            <input
              type="string"
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              required
            />
          </label>

          <label>
            Icon-URL (optional):
            <input
              type="url"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
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
              {patternCategories.map((cat) => (
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

export default CreatePattern;
