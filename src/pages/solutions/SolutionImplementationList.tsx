import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useDiscussionData } from '../../context/DiscussionDataContext';
import Pagination from '../../components/Pagination';
import { SimpleDiscussion } from '../../types/GitHub';
import { ListData, PageInfo } from '../../types/DiscussionData';
import '../../styles/pages/ListPage.scss';

function SolutionImplementationList() {
  const { loading, error, ids, fetchDiscussionList } = useDiscussionData();
  const navigate = useNavigate();

  const [solutionImplementations, setSolutionImplementations] = useState<SimpleDiscussion[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);

  const [pageHistory, setPageHistory] = useState<Array<string | null>>([null]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

  const handleListDataFetched = useCallback((data: ListData) => {
    setSolutionImplementations(data.discussions);
    setPageInfo(data.pageInfo);
  }, []);

  // Use Effect reacts to changing the page index
  useEffect(() => {
    if (!ids.solutionImplementationCategoryId) return;
    const cursor = pageHistory[currentPageIndex];

    // List data are fetched, inside this method it is checked if data can be used from cache
    fetchDiscussionList(ids.solutionImplementationCategoryId, cursor, handleListDataFetched);
  }, [currentPageIndex, pageHistory, fetchDiscussionList, ids, handleListDataFetched]);

  // Handle pagination for loading the next/previous page of solutionImplementations
  const handleNextPage = () => {
    const nextCursor = pageInfo?.endCursor || null;
    if (nextCursor) {
      setPageHistory(prevHistory => [...prevHistory, nextCursor]);
      setCurrentPageIndex(prevIndex => prevIndex + 1);
    }
  };

  const handlePrevPage = () => {
    setCurrentPageIndex(prevIndex => prevIndex - 1);
  };

  let content;
  if (loading && solutionImplementations.length === 0) {
    content = <p>Lade SolutionImplementations...</p>;
  } else if (error) {
    content = <p>Fehler beim Laden: {error}</p>;
  } else if (solutionImplementations.length === 0) {
    content = <p>Keine SolutionImplementations gefunden.</p>;
  } else {
    content = (
      <ul className="item-list">
        {solutionImplementations.map((solutionImplementation) => (
          <li
            key={solutionImplementation.number}
            className="item-card"
            onClick={() => navigate(`/solutionImplementations/${solutionImplementation.number}`)}
          >
            <div className="item-title">
              {solutionImplementation.title}
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="list-page">
      <h1>SolutionImplementations</h1>
      <button onClick={() => navigate('/solutionImplementations/create')} className="create-button">Create New SolutionImplementation</button>
      {content}
      <Outlet />
      <Pagination
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        hasNextPage={pageInfo?.hasNextPage || false}
        isBackDisabled={currentPageIndex === 0}
        loading={loading}
      />
    </div>
  );
}

export default SolutionImplementationList;