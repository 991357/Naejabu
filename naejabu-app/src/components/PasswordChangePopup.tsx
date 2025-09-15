'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface PasswordChangePopupProps {
    onClose: () => void;
}

const PasswordChangePopup: React.FC<PasswordChangePopupProps> = ({ onClose }) => {
    const router = useRouter();

    const handleGoToMyPage = () => {
        router.push('/mypage');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 font-sans">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform transition-all scale-100">
                <Image
                    src="/mascot.png"
                    alt="Mascot"
                    width={120}
                    height={120}
                    className="mx-auto mb-4 animate-bounce"
                />
                <h2 className="text-2xl font-bold text-primary mb-3">보안을 위해 비밀번호를 변경해주세요!</h2>
                <p className="text-gray-600 mb-6">
                    현재 임시 비밀번호를 사용하고 계십니다. <br />
                    개인정보를 안전하게 보호하기 위해, 지금 바로 마이페이지에서 비밀번호를 변경해주세요.
                </p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onClose}
                        className="py-2 px-6 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                    >
                        나중에 할래요
                    </button>
                    <button
                        onClick={handleGoToMyPage}
                        className="py-2 px-6 bg-accent text-white rounded-lg font-bold shadow-md hover:bg-opacity-90"
                    >
                        변경하러 가기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PasswordChangePopup;
