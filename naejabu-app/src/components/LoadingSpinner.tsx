'use client';

import Image from 'next/image';

interface LoadingSpinnerProps {
    isOpen: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ isOpen }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-[9999] font-sans">
            <div className="text-center">
                <Image
                    src="/mascot.png"
                    alt="Loading Mascot"
                    width={150}
                    height={150}
                    className="mx-auto mb-4 animate-bounce"
                />
                <p className="text-xl font-bold text-primary animate-pulse">
                    잠시만 기다려주세요...
                </p>
            </div>
        </div>
    );
};

export default LoadingSpinner;
