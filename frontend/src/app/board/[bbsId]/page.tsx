'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { boardApi, BoardArticle } from '@/lib/api';

interface PageProps {
  params: Promise<{ bbsId: string }>;
}

export default function BoardListPage({ params }: PageProps) {
  const { bbsId } = use(params);
  const router = useRouter();
  const [articles, setArticles] = useState<BoardArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [boardName, setBoardName] = useState('게시판');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchWrd, setSearchWrd] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jToken');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    loadArticles(currentPage);
  }, [bbsId, currentPage]);

  const loadArticles = async (page: number) => {
    setLoading(true);
    setError('');

    try {
      const response = await boardApi.getList(bbsId, page, undefined, searchWrd || undefined);

      if (response.resultCode === 200 || response.resultCode === '200') {
        const data = response.result;
        setArticles(data.resultList || []);
        setBoardName(data.brdMstrVO?.bbsNm || '게시판');
        if (data.paginationInfo) {
          setTotalPages(data.paginationInfo.totalPageCount || 1);
        }
      } else {
        if (response.resultCode === 403) {
          setError('로그인이 필요합니다.');
        } else {
          setError(response.resultMessage || '게시물을 불러오는데 실패했습니다.');
        }
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadArticles(1);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return dateStr.substring(0, 10);
  };

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
            <Link href="/board" className="text-gray-600 hover:text-gray-800">
              게시판
            </Link>
          </nav>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{boardName}</h1>
          {isLoggedIn && (
            <Link
              href={`/board/${bbsId}/write`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              글쓰기
            </Link>
          )}
        </div>

        {/* 검색 */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchWrd}
              onChange={(e) => setSearchWrd(e.target.value)}
              placeholder="검색어를 입력하세요"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              검색
            </button>
          </div>
        </form>

        {/* 게시물 목록 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">로딩 중...</div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              {error.includes('로그인') && (
                <Link
                  href="/login"
                  className="text-blue-600 hover:underline"
                >
                  로그인하러 가기
                </Link>
              )}
            </div>
          ) : articles.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              게시물이 없습니다.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 w-16">
                    번호
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    제목
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 w-28">
                    작성자
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 w-28">
                    작성일
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 w-20">
                    조회
                  </th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr
                    key={article.nttId}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/board/${bbsId}/${article.nttId}`)}
                  >
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {article.nttNo}
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      {article.replyLc && parseInt(article.replyLc) > 0 && (
                        <span className="mr-2 text-gray-400">
                          {'└'.padStart(parseInt(article.replyLc) * 2, ' ')}
                        </span>
                      )}
                      {article.nttSj}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {article.frstRegisterNm || article.ntcrNm || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(article.frstRegisterPnttm)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {article.inqireCo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              이전
            </button>
            {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              다음
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
