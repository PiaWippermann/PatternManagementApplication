import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useDiscussionData } from '../../context/DiscussionDataContext';
import Pagination from '../../components/Pagination';
import '../../styles/pages/ListPage.scss';

function PatternList() {
  const { loading, error, ids, discussionData, fetchDiscussionList } = useDiscussionData();
  const navigate = useNavigate();

  // State for page navigation
  const [pageHistory, setPageHistory] = useState<Array<string | null>>([null]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

  // Get the current patterns data from the discussionData object
  const currentCursor = pageHistory[currentPageIndex];
  const currentPatternsPage = discussionData?.patterns.listData[currentCursor || 'null'];
  const patterns = currentPatternsPage?.discussions || [];
  const pageInfo = currentPatternsPage?.pageInfo;

  // Fetch the initial page of patterns when the component first mounts
  useEffect(() => {
    if (ids.patternCategoryId && !discussionData.patterns.listData['null']) {
      fetchDiscussionList(ids.patternCategoryId, null);
    }
  }, [fetchDiscussionList, ids, discussionData]);

  // Handle pagination for loading the next/previous page of patterns
  const handlePageChange = (cursor: string | null) => {
    const isBackNavigation = currentPageIndex > 0 && cursor === pageHistory[currentPageIndex - 1];

    if (isBackNavigation) {
      setCurrentPageIndex(prevIndex => prevIndex - 1);
    } else {
      // check if we already have the data for the requested cursor
      if (discussionData?.patterns.listData[cursor || 'null']) {
        setPageHistory(prevHistory => [...prevHistory, cursor]);
        setCurrentPageIndex(prevIndex => prevIndex + 1);
        return;
      }

      // If not, fetch the data
      fetchDiscussionList(ids.patternCategoryId, cursor);
      setPageHistory(prevHistory => [...prevHistory, cursor]);
      setCurrentPageIndex(prevIndex => prevIndex + 1);
    }
  };

  // Lade-, Fehler- und leere Zustände in einer separaten Variable speichern
  let content;

  if (loading && patterns.length === 0) {
    content = <p>Lade Patterns...</p>;
  } else if (error) {
    content = <p>Fehler beim Laden: {error}</p>;
  } else if (patterns.length === 0) {
    content = <p>Keine Patterns gefunden.</p>;
  } else {
    content = (
      <ul className="item-list">
        {patterns.map((pattern) => (
          <li
            key={pattern.number}
            className="item-card"
            onClick={() => navigate(`/patterns/${pattern.number}`)}
          >
            <div className="item-title">
              {pattern.title}
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="list-page">
      <h1>Patterns</h1>
      {content}
      <Outlet />
      <Pagination
        onPageChange={handlePageChange}
        prevCursor={pageHistory[currentPageIndex - 1]}
        nextCursor={pageInfo?.endCursor || null}
        hasNextPage={pageInfo?.hasNextPage || false}
        loading={loading}
      />
    </div>
  );
}

export default PatternList;