import React from 'react';
import Link from 'next/link';
import { FaTrash } from 'react-icons/fa';

// Define the type for a single resume object
type Resume = {
  id: string;
  company_name: string;
  deadline: string;
  updated_at: string;
};

// Define the props for the ListView component
type ListViewProps = {
  resumes: Resume[];
  handleDeleteClick: (id: string, e: React.MouseEvent) => void;
};

const ListView = ({ resumes, handleDeleteClick }: ListViewProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6">회사명</th>
            <th className="py-3 px-6">마감일</th>
            <th className="py-3 px-6">마지막 수정</th>
            <th className="py-3 px-6 text-center">관리</th>
          </tr>
        </thead>
        <tbody className="text-gray-700 text-sm font-light">
          {resumes.map((resume) => (
            <tr key={resume.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-6">
                <Link href={`/resumes/${resume.id}`} className="font-medium text-primary hover:underline">
                  {resume.company_name}
                </Link>
              </td>
              <td className="py-3 px-6">{new Date(resume.deadline).toLocaleDateString('ko-KR')}</td>
              <td className="py-3 px-6">{new Date(resume.updated_at).toLocaleString('ko-KR')}</td>
              <td className="py-3 px-6 text-center">
                <button 
                  onClick={(e) => handleDeleteClick(resume.id, e)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListView;