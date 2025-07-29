import { useDiscussionData } from "../../context/DiscussionDataContext";
import { Outlet, useNavigate } from "react-router-dom";
import "../../styles/pages/Patterns.scss";

const Patterns = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useDiscussionData();

  if (loading) return <div>Lade Patterns...</div>;
  if (error) return <div>Fehler: {error}</div>;
  if (!data) return <p>Keine Daten verfügbar.</p>;

  const { patterns, solutions } = data;

  const getLinkedSolutionCount = (patternDiscussionNumber: number): number =>
    solutions.filter((solution) =>
      solution.linkedPatterns.includes(patternDiscussionNumber)
    ).length;

  return (
    <div className="pattern-page">
      <h1>Patterns</h1>
      <button
        className="pattern-add-btn"
        type="button"
        onClick={() => navigate("/patterns/new")}
      >
        Neues Pattern hinzufügen
      </button>
      <ul className="pattern-list">
        {patterns.map((pattern) => (
          <li
            key={pattern.id}
            className="pattern-card"
            onClick={() => navigate(`/patterns/${pattern.id}`)}
          >
            <div className="pattern-category">
              <span
                dangerouslySetInnerHTML={{ __html: pattern.category.emojiHTML }}
              />
              <span>{pattern.category.name}</span>
            </div>
            <div className="pattern-title">
              {" "}
              <img src={pattern.icon} />
              {pattern.title}
            </div>
            <div className="pattern-meta">
              {getLinkedSolutionCount(pattern.number)} verlinkte Solutions
            </div>
          </li>
        ))}

        <Outlet />
      </ul>
    </div>
  );
};

export default Patterns;
