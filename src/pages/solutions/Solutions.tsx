import { useDiscussionData } from "../../context/DiscussionDataContext";
import { Outlet, useNavigate } from "react-router-dom";
import "../../styles/pages/Solutions.scss";

const Solutions = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useDiscussionData();

  if (loading) return <div>Lade Solutions...</div>;
  if (error) return <div>Fehler: {error}</div>;
  if (!data) return <p>Keine Daten verfügbar.</p>;

  const { solutions } = data;

  return (
    <div className="solution-page">
      <h1>Solutions</h1>
      <button
        className="solution-add-btn"
        type="button"
        onClick={() => navigate("/solutions/new")}
      >
        Neue Solution hinzufügen
      </button>
      <ul className="solution-list">
        {solutions.map((solution) => (
          <li
            key={solution.id}
            className="solution-card"
            onClick={() => navigate(`/solutions/${solution.id}`)}
          >
            <div className="solution-category">
              <span
                dangerouslySetInnerHTML={{
                  __html: solution.category.emojiHTML,
                }}
              />
              <span>{solution.category.name}</span>
            </div>
            <div className="solution-title">{solution.title}</div>
            <div className="solution-meta">
              {solution.linkedPatterns.length} verlinkte Patterns
            </div>
          </li>
        ))}

        <Outlet />
      </ul>
    </div>
  );
};

export default Solutions;
