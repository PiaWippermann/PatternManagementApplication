import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useDiscussionData } from '../../context/DiscussionDataContext';
import Pagination from '../../components/Pagination';
import '../../styles/pages/ListPage.scss';

function SolutionImplementationList() {
  const { loading, error, ids, discussionData, fetchDiscussionList } = useDiscussionData();
  const navigate = useNavigate();

  // State for page navigation
  const [pageHistory, setPageHistory] = useState<Array<string | null>>([null]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

  // Get the current solution implementations data from the discussionData object
  const currentCursor = pageHistory[currentPageIndex];
  const currentSolutionImplementationsPage = discussionData?.solutionImplementations.listData[currentCursor || 'null'];
  const solutionImplementations = currentSolutionImplementationsPage?.discussions || [];
  const pageInfo = currentSolutionImplementationsPage?.pageInfo;

  // Fetch the initial page of solutions implementations when the component first mounts
  useEffect(() => {
    if (ids.solutionImplementationCategoryId && !discussionData.solutionImplementations.listData['null']) {
      fetchDiscussionList(ids.solutionImplementationCategoryId, null);
    }
  }, [fetchDiscussionList, ids, discussionData]);

  // Handle pagination for loading the next/previous page of solutions implementations
  const handlePageChange = (cursor: string | null) => {
    const isBackNavigation = currentPageIndex > 0 && cursor === pageHistory[currentPageIndex - 1];

    if (isBackNavigation) {
      setCurrentPageIndex(prevIndex => prevIndex - 1);
    } else {
      // check if we already have the data for the requested cursor
      if (discussionData?.solutionImplementations.listData[cursor || 'null']) {
        setPageHistory(prevHistory => [...prevHistory, cursor]);
        setCurrentPageIndex(prevIndex => prevIndex + 1);
        return;
      }

      // If not, fetch the data
      fetchDiscussionList(ids.solutionImplementationCategoryId, cursor);
      setPageHistory(prevHistory => [...prevHistory, cursor]);
      setCurrentPageIndex(prevIndex => prevIndex + 1);
    }
  };

  // Lade-, Fehler- und leere Zustände in einer separaten Variable speichern
  let content;

  if (loading && solutionImplementations.length === 0) {
    content = <p>Load Solution Implementations</p>;
  } else if (error) {
    content = <p>Fehler beim Laden: {error}</p>;
  } else if (solutionImplementations.length === 0) {
    content = <p>Keine Solution Implementations gefunden.</p>;
  } else {
    content = (
      <ul className="item-list">
        {solutionImplementations.map((solImpl) => (
          <li
            key={solImpl.number}
            className="item-card"
            onClick={() => navigate(`/solutionImplementation/${solImpl.number}`)}
          >
            <div className="item-title">
              {solImpl.title}
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="list-page">
      <h1>Solution Implementation</h1>
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

export default SolutionImplementationList;