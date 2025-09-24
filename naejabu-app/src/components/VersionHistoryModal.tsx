// D:\Project_N\naejabu-app\src\components\VersionHistoryModal.tsx

import { useState, useEffect } from 'react';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';

interface Version {
  id: number;
  created_at: string;
}

interface Question {
  question_text: string;
  answer_text: string;
  char_limit: number;
}

interface PreviewVersion {
    id: number;
    questions: Question[];
}

interface VersionHistoryModalProps {
  resumeId: number;
  onClose: () => void;
  onRestore: (questions: Question[]) => void;
  isOpen: boolean;
}

const VersionHistoryModal = ({ resumeId, onClose, onRestore, isOpen }: VersionHistoryModalProps) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [previewVersion, setPreviewVersion] = useState<PreviewVersion | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const [versionToDelete, setVersionToDelete] = useState<Version | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVersions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/resumes/${resumeId}/versions`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch versions.');
      }
      const data = await response.json();
      setVersions(data);
      // Automatically select the latest version for preview
      if (data.length > 0) {
        setSelectedVersionId(data[0].id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchVersions();
    } else {
      // Reset state when modal is closed
      setPreviewVersion(null);
      setSelectedVersionId(null);
    }
  }, [resumeId, isOpen]);

  useEffect(() => {
    const fetchPreview = async () => {
      if (selectedVersionId === null) {
        setPreviewVersion(null);
        return;
      }

      setIsPreviewLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/resumes/${resumeId}/versions/${selectedVersionId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch version content.');
        }
        const data = await response.json();
        setPreviewVersion({ id: selectedVersionId, questions: data.questions });
      } catch (err: any) {
        setError(err.message); // You might want a separate error state for the preview
      } finally {
        setIsPreviewLoading(false);
      }
    };

    fetchPreview();
  }, [selectedVersionId, resumeId]);

  const handleRestore = () => {
    if (!previewVersion) return;
    onRestore(previewVersion.questions);
    onClose();
  };

  const handleDelete = async () => {
    if (!versionToDelete) return;

    setIsDeleting(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/resumes/${resumeId}/versions/${versionToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete version.');
      }

      // Refresh list
      setVersionToDelete(null);
      fetchVersions(); 

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="p-1 dark:bg-gray-800">
          <h2 className="text-3xl font-bold mb-6 dark:text-white">자기소개서 버전 관리</h2>
          
          {error && <div className="text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-200 p-4 rounded-md mb-4">{error}</div>}

          <div className="flex flex-col md:flex-row gap-6" style={{minHeight: '60vh'}}>
            {/* Left: Version List */}
            <div className="md:w-1/3 border-r dark:border-gray-600 pr-4">
              <h3 className="text-xl font-semibold mb-3 dark:text-gray-200">저장된 버전</h3>
              {isLoading ? (
                <LoadingSpinner />
              ) : versions.length === 0 ? (
                <p className="dark:text-gray-400">버전이 없습니다.</p>
              ) : (
                <ul className="space-y-2 overflow-y-auto max-h-[50vh]">
                  {versions.map((version, index) => (
                    <li key={version.id} className={`p-3 border dark:border-gray-700 rounded-md ${selectedVersionId === version.id ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                      <div className="flex justify-between items-center">
                        <label className="flex items-center space-x-3 cursor-pointer w-full">
                          <input
                            type="radio"
                            name="version"
                            value={version.id}
                            checked={selectedVersionId === version.id}
                            onChange={() => setSelectedVersionId(version.id)}
                            className="form-radio h-5 w-5 text-blue-600 bg-gray-200 border-gray-300 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                          />
                          <span className="dark:text-gray-200">
                            {new Date(version.created_at).toLocaleString('ko-KR')}
                            {index === 0 && <span className="text-xs text-blue-500 ml-2">[최신]</span>}
                          </span>
                        </label>
                        {index > 0 && ( // Do not allow deleting the latest version
                          <button onClick={() => setVersionToDelete(version)} className="text-red-500 hover:text-red-700 text-sm p-1">삭제</button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Right: Preview */}
            <div className="md:w-2/3">
              <h3 className="text-xl font-semibold mb-3 dark:text-gray-200">미리보기</h3>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg h-full overflow-y-auto max-h-[50vh]">
                {isPreviewLoading ? (
                  <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>
                ) : previewVersion ? (
                  <div className="space-y-4">
                    {previewVersion.questions.map((q, i) => (
                      <div key={i}>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">{i+1}. {q.question_text} ({q.char_limit}자)</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap mt-1 p-2 bg-white dark:bg-gray-800 rounded">{q.answer_text || '답변 없음'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-full"><p className="text-gray-500">왼쪽에서 버전을 선택하여 미리보세요.</p></div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
              닫기
            </button>
            <button onClick={handleRestore} disabled={!previewVersion || isPreviewLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
              이 버전으로 되돌아가기
            </button>
          </div>
        </div>
      </Modal>

      {/* Deletion Confirmation Modal */}
      {versionToDelete && (
        <Modal isOpen={!!versionToDelete} onClose={() => setVersionToDelete(null)}>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">버전 삭제 확인</h2>
                <p className="dark:text-gray-300">정말로 이 버전을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
                <div className="flex justify-end mt-6">
                    <button onClick={() => setVersionToDelete(null)} className="mr-2 px-4 py-2 rounded bg-gray-300 dark:bg-gray-600 dark:text-white">아니오</button>
                    <button onClick={handleDelete} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700" disabled={isDeleting}>
                        {isDeleting ? '삭제 중...' : '예, 삭제합니다'}
                    </button>
                </div>
            </div>
        </Modal>
      )}
    </>
  );
};

export default VersionHistoryModal;