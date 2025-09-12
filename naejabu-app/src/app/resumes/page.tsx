'use client';

import { useState, useEffect } from 'react';
import LoggedInHeader from '../../components/LoggedInHeader';
import Modal from '../../components/Modal';
import CreateResumeModal from '../../components/CreateResumeModal';
import withAuth from '../../components/withAuth';
import GridView from '../../components/GridView';
import ListView from '../../components/ListView';
import CalendarView from '../../components/CalendarView';
import { FaTh, FaList, FaCalendarAlt } from 'react-icons/fa';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (token && token !== 'null') {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
    }
    return {
        'Content-Type': 'application/json',
    };
};

const ResumesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [view, setView] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedView = localStorage.getItem('resumeViewType');
      if (savedView && ['grid', 'list', 'calendar'].includes(savedView)) {
        return savedView as 'grid' | 'list' | 'calendar';
      }
    }
    return 'grid'; // Default view
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('resumeViewType', view);
    }
  }, [view]);

  const fetchResumes = async () => {
    const response = await fetch('/api/resumes', { headers: getAuthHeaders() });
    if (response.ok) {
      const data = await response.json();
      // Ensure data is an array before setting it
      if (Array.isArray(data)) {
        setResumes(data);
      } else {
        console.error('Fetched data is not an array:', data);
        setResumes([]); // Set to empty array to prevent crash
      }
    } else {
      console.error('Failed to fetch resumes:', response.statusText);
      setResumes([]); // Set to empty array on error
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleCreateResume = async (data: { company_name: string; deadline: string; questions: string[] }) => {
    const response = await fetch('/api/resumes', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (response.ok) {
      fetchResumes();
      setIsModalOpen(false);
    } else {
      console.error('Failed to create resume');
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedResumeId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedResumeId) {
      const response = await fetch(`/api/resumes/${selectedResumeId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        fetchResumes();
        setIsDeleteModalOpen(false);
        setSelectedResumeId(null);
      } else {
        console.error('Failed to delete resume');
      }
    }
  };

  const renderView = () => {
    switch (view) {
      case 'grid':
        return <GridView resumes={resumes} handleDeleteClick={handleDeleteClick} />;
      case 'list':
        return <ListView resumes={resumes} handleDeleteClick={handleDeleteClick} />;
      case 'calendar':
        return <CalendarView resumes={resumes} />;
      default:
        return <GridView resumes={resumes} handleDeleteClick={handleDeleteClick} />;
    }
  };

  return (
    <div className="min-h-screen">
      <LoggedInHeader />
      <main className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-heading text-4xl font-bold text-primary">내 자소서 목록</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 bg-gray-200 p-1 rounded-lg">
              <button title="Grid View" onClick={() => setView('grid')} className={`p-2 rounded-md transition-colors ${view === 'grid' ? 'bg-white shadow' : 'hover:bg-gray-300'}`}><FaTh className={view === 'grid' ? 'text-accent' : 'text-gray-500'} /></button>
              <button title="List View" onClick={() => setView('list')} className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-white shadow' : 'hover:bg-gray-300'}`}><FaList className={view === 'list' ? 'text-accent' : 'text-gray-500'} /></button>
              <button title="Calendar View" onClick={() => setView('calendar')} className={`p-2 rounded-md transition-colors ${view === 'calendar' ? 'bg-white shadow' : 'hover:bg-gray-300'}`}><FaCalendarAlt className={view === 'calendar' ? 'text-accent' : 'text-gray-500'} /></button>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-accent hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105 flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>새로 만들기</span>
            </button>
          </div>
        </div>
        
        <div>{renderView()}</div>

      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CreateResumeModal
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreateResume}
        />
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">자소서 삭제</h2>
            <p>정말로 자소서를 삭제하시겠습니까?</p>
            <div className="flex justify-end mt-6">
                <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="mr-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                    취소
                </button>
                <button
                    onClick={confirmDelete}
                    className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                >
                    삭제
                </button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default withAuth(ResumesPage);
