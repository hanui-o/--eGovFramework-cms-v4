'use client';

import Link from 'next/link';

const BOARDS = [
  {
    bbsId: 'BBSMSTR_AAAAAAAAAAAA',
    name: '공지사항',
    description: '중요한 공지사항을 확인하세요.',
  },
  {
    bbsId: 'BBSMSTR_BBBBBBBBBBBB',
    name: '자유게시판',
    description: '자유롭게 의견을 나누는 공간입니다.',
  },
  {
    bbsId: 'BBSMSTR_CCCCCCCCCCCC',
    name: '갤러리',
    description: '사진과 이미지를 공유하는 게시판입니다.',
  },
];

export default function BoardMainPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            eGovFramework CMS
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-gray-800">
              홈
            </Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-800">
              로그인
            </Link>
          </nav>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">게시판</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {BOARDS.map((board) => (
            <Link
              key={board.bbsId}
              href={`/board/${board.bbsId}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {board.name}
              </h2>
              <p className="text-gray-600">{board.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
