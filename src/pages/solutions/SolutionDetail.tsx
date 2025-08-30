import { useParams, useNavigate } from "react-router-dom";
import "../../styles/pages/SolutionDetailPanel.scss";
import { useDiscussionData } from "../../context/DiscussionDataContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";
import CommentComponent from "../../components/Comment";
import { useState } from "react";
import { updateLinkedPatterns } from "../../api/githubSolutions";

const SolutionDetailPanel = () => {
  const { solutionId } = useParams();
  const { data, loading, error, refetchData } = useDiscussionData();

  const navigate = useNavigate();

  const close = () => navigate("/solutions");

  const [isClosing, setIsClosing] = useState(false);

  if (loading) return <div>Lade Solutions...</div>;
  if (error) return <div>Fehler: {error}</div>;
  if (!data) return <p>Keine Daten verfügbar.</p>;

  const [patternToLinkNumber, setPatternToLinkNumber] = useState<number | "">(
    ""
  );

  const { patterns, solutions } = data;
  const solution = solutions.find((p) => p.id === solutionId);
  if (!solution) return <p>Solution nicht gefunden.</p>;

  // get the linked patterns for this solution
  // filter links where solution url matches the current solution's url
  // and map to get the corresponding solution data
  const linkedPatterns = patterns.filter((p) =>
    solution.linkedPatterns.includes(p.number)
  );
  // .filter(Boolean); // This filter(Boolean) is usually for removing null/undefined, not strictly needed here if includes guarantees valid numbers

  // pattern choices contain all patterns which are not already linked to the solution
  const patternChoices = patterns.filter(
    (p) => !solution.linkedPatterns.includes(p.number)
  ); // Corrected: Compare by number
  // .filter(Boolean); // Same as above, not strictly needed

  // closing animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      close();
    }, 300);
  };

  const handleCreatePatternLink = async (e: React.FormEvent) => {
    e.preventDefault();
    // Check if patternToLinkNumber is a valid number (not 0 if 0 is not a valid pattern number, and not empty string)
    if (typeof patternToLinkNumber !== "number" || patternToLinkNumber <= 0) {
      alert("Bitte ein Pattern auswählen.");
      return;
    }

    try {
      await updateLinkedPatterns({
        solutionDiscussionId: solution.id,
        newPatternNumber: patternToLinkNumber,
        solutionDiscussionBody: solution.body,
      });
      alert("Solution erfolgreich aktualisiert!");

      // after updating the discussion, re-fetch data
      refetchData();

      // Optionally, reset the select box after successful link
      setPatternToLinkNumber("");
    } catch (err) {
      console.error("Fehler beim Verknüpfen des Patterns:", err);
      alert("Verknüpfen fehlgeschlagen.");
    }
  };

  return (
    <div className={`solution-detail-panel ${isClosing ? "closing" : ""}`}>
      <button onClick={handleClose} className="close-button">
        <FontAwesomeIcon
          icon={faAnglesLeft}
          size="2xs"
          style={{ color: "#49454f" }}
        />{" "}
      </button>

      <div className="solution-detail-content">
        <div className="solution-category">
          <span
            dangerouslySetInnerHTML={{ __html: solution.category.emojiHTML }}
          />
          <span>{solution.category.name}</span>
        </div>

        <div className="solution-title">
          <span>{solution.title}</span>
        </div>

        <div className="separator"></div>

        <div className="solution-description">
          {solution.description || "Keine Beschreibung verfügbar."}
        </div>

        <div className="separator"></div>

        <div className="solution-linked-patterns">
          <h3>Verlinkte Patterns:</h3>
          <form onSubmit={handleCreatePatternLink} className="solution-form">
            <label>
              Add Linked Pattern:
              <select
                value={patternToLinkNumber}
                // Convert the string value from the select to a number
                onChange={(e) => setPatternToLinkNumber(Number(e.target.value))}
                required
              >
                <option value="">-- auswählen --</option>
                {patternChoices.map((pat) => (
                  <option key={pat.number} value={pat.number}>
                    {pat.title} (# {pat.number}){" "}
                    {/* Added pattern number for clarity */}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">Link Pattern</button>
          </form>

          <ul>
            {linkedPatterns.map((pattern) => (
              <li key={pattern?.id} className="pattern-item">
                <div className="pattern-category">
                  <span
                    dangerouslySetInnerHTML={{
                      __html: pattern?.category.emojiHTML || "",
                    }}
                  />
                  <span>{pattern?.category.name}</span>
                </div>
                <div className="item-title">
                  {/* Ensure pattern?.icon is a valid URL or handle null/undefined */}
                  {pattern?.icon && (
                    <img src={pattern?.icon} alt="Pattern Icon" />
                  )}
                  {pattern?.title} (# {pattern?.number}){" "}
                  {/* Show number here too */}
                </div>

                <div className="separator"></div>

                <div className="pattern-description">
                  {pattern?.description || "Keine Beschreibung verfügbar."}
                </div>

                <div className="pattern-comments">
                  <h4>Kommentare</h4>
                  <ul>
                    {pattern?.comments?.nodes?.map(
                      (
                        comment // Add null checks
                      ) => (
                        <li key={comment?.id}>
                          <CommentComponent commentData={comment} />
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="separator"></div>

        <div className="solution-meta">
          <p>
            <span className="bold">Solution Referenz:</span>{" "}
            {solution.solutionRefUrl || "Keine Referenz verfügbar."}
          </p>
          <p>
            <span className="bold">Erstellt von:</span> {solution.author.login}
          </p>
          <p>
            <span className="bold">Erstellt am:</span>{" "}
            {new Date(solution.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SolutionDetailPanel;
