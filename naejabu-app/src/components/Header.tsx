import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-primary text-white p-4 shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          내자부
        </Link>
        <div className="space-x-4">
          <Link href="/login" className="hover:text-gray-300">
            로그인
          </Link>
          <Link href="/register" className="bg-accent text-white font-bold py-2 px-4 rounded hover:bg-opacity-80">
            회원가입
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
