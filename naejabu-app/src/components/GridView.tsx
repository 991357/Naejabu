import React from 'react';
import Link from 'next/link';

// Define the type for a single resume object
type Resume = {
  id: string;
  company_name: string;
  deadline: string;
  updated_at: string;
};

// Define the props for the GridView component
type GridViewProps = {
  resumes: Resume[];
  handleDeleteClick: (id: string, e: React.MouseEvent) => void;
};

const GridView = ({ resumes, handleDeleteClick }: GridViewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {resumes.map((resume: any, index: number) => (
        <div
          key={resume.id}
          className="bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-down"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <Link href={`/resumes/${resume.id}`} className="block p-6">
            <div className="flex justify-between items-start">
              <h2 className="font-heading text-2xl font-bold text-primary mb-2">{resume.company_name}</h2>
              <button
                onClick={(e) => handleDeleteClick(resume.id, e)}
                className="text-gray-400 hover:text-red-500 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600">
              마감일: {new Date(resume.deadline).toLocaleDateString('ko-KR')}
            </p>
            <p className="text-sm text-gray-400 mt-4">마지막 수정: {new Date(resume.updated_at).toLocaleString('ko-KR')}</p>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default GridView;