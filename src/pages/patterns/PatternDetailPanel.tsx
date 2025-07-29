import { useParams, useNavigate } from "react-router-dom";
import "../../styles/pages/PatternDetailPanel.scss";
import { useDiscussionData } from "../../context/DiscussionDataContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";
import CommentComponent from "../../components/Comment";

const PatternDetailPanel = () => {
  const { patternId } = useParams();
  const { data, loading, error } = useDiscussionData();

  const navigate = useNavigate();

  const close = () => navigate("/patterns");

  if (loading) return <div>Lade Patterns...</div>;
  if (error) return <div>Fehler: {error}</div>;
  if (!data) return <p>Keine Daten verfügbar.</p>;

  const { patterns, solutions } = data;
  const pattern = patterns.find((p) => p.id === patternId);
  if (!pattern) return <p>Pattern nicht gefunden.</p>;

  // get the linked solutions of the given pattern
  const linkedSolutions = solutions
    .filter((s) => s.linkedPatterns.includes(pattern.number))
    .filter(Boolean);

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
          <span
            dangerouslySetInnerHTML={{ __html: pattern.category.emojiHTML }}
          />
          <span>{pattern.category.name}</span>
        </div>

        <div className="pattern-title">
          <img src={pattern.icon} alt={`${pattern.title} Icon`} />
          <span>{pattern.title}</span>
        </div>

        <div className="separator"></div>

        <div className="pattern-description">
          {pattern.description || "Keine Beschreibung verfügbar."}
        </div>

        <div className="separator"></div>

        <div className="pattern-linked-solutions">
          <h3>Verlinkte Solutions:</h3>
          <ul>
            {linkedSolutions.map((solution) => (
              <li key={solution?.id} className="solution-item">
                <div className="solution-title">
                  <span
                    dangerouslySetInnerHTML={{
                      __html: solution?.category.emojiHTML || "",
                    }}
                  />
                  <a
                    href={solution?.solutionRefUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {solution?.title}
                  </a>
                </div>

                <div className="solution-description">
                  {solution?.description || "Keine Beschreibung verfügbar."}
                </div>

                <div className="solution-comments">
                  <h4>Kommentare</h4>
                  <ul>
                    {solution?.comments.nodes.map((comment) => (
                      <li key={comment?.id}>
                        <CommentComponent commentData={comment} />
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="separator"></div>

        <div className="pattern-meta">
          <p>
            <span className="bold">Pattern Referenz:</span> {pattern.patternRef}
          </p>
          <p>
            <span className="bold">Erstellt von:</span> {pattern.author.login}
          </p>
          <p>
            <span className="bold">Erstellt am:</span>{" "}
            {new Date(pattern.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatternDetailPanel;
