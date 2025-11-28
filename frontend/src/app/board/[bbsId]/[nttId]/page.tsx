'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { boardApi, BoardArticle } from '@/lib/api';

interface PageProps {
  params: Promise<{ bbsId: string; nttId: string }>;
}

export default function BoardDetailPage({ params }: PageProps) {
  const { bbsId, nttId } = use(params);
  const router = useRouter();
  const [article, setArticle] = useState<BoardArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [boardName, setBoardName] = useState('게시판');
  const [isAuthor, setIsAuthor] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadArticle();
  }, [bbsId, nttId]);

  const loadArticle = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await boardApi.getDetail(bbsId, parseInt(nttId));

      if (response.resultCode === 200 || response.resultCode === '200') {
        const data = response.result;
        setArticle(data.result || data as unknown as BoardArticle);
        setBoardName((data as unknown as { brdMstrVO?: { bbsNm?: string } }).brdMstrVO?.bbsNm || '게시판');

        // 작성자 확인
        const user = localStorage.getItem('user');
        if (user) {
          try {
            const userData = JSON.parse(user);
            const sessionUniqId = (data as unknown as { sessionUniqId?: string }).sessionUniqId;
            const articleAuthor = (data.result || data as unknown as BoardArticle).frstRegisterId;
            setIsAuthor(sessionUniqId === articleAuthor || userData.uniqId === articleAuthor);
          } catch {
            setIsAuthor(false);
          }
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

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    setDeleting(true);
    try {
      const response = await boardApi.delete(bbsId, parseInt(nttId));
      if (response.resultCode === 200 || response.resultCode === '200') {
        alert('삭제되었습니다.');
        router.push(`/board/${bbsId}`);
      } else {
        alert(response.resultMessage || '삭제에 실패했습니다.');
      }
    } catch (err) {
      alert('서버 연결에 실패했습니다.');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return dateStr.replace('T', ' ').substring(0, 19);
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
        <div className="mb-4">
          <Link
            href={`/board/${bbsId}`}
            className="text-blue-600 hover:underline"
          >
            &larr; {boardName} 목록으로
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            로딩 중...
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            {error.includes('로그인') && (
              <Link href="/login" className="text-blue-600 hover:underline">
                로그인하러 가기
              </Link>
            )}
          </div>
        ) : article ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* 제목 */}
            <div className="border-b p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                {article.nttSj}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>
                  작성자: {article.frstRegisterNm || article.ntcrNm || '-'}
                </span>
                <span>작성일: {formatDate(article.frstRegisterPnttm)}</span>
                <span>조회수: {article.inqireCo}</span>
              </div>
            </div>

            {/* 내용 */}
            <div className="p-6 min-h-[300px]">
              <div
                className="prose max-w-none text-gray-800"
                dangerouslySetInnerHTML={{
                  __html: article.nttCn?.replace(/\n/g, '<br/>') || '',
                }}
              />
            </div>

            {/* 첨부파일 */}
            {article.atchFileId && (
              <div className="border-t p-6">
                <h3 className="font-medium text-gray-700 mb-2">첨부파일</h3>
                <p className="text-sm text-gray-500">
                  첨부파일 ID: {article.atchFileId}
                </p>
              </div>
            )}

            {/* 버튼 */}
            <div className="border-t p-6 flex justify-between">
              <Link
                href={`/board/${bbsId}`}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                목록
              </Link>
              {isAuthor && (
                <div className="flex gap-2">
                  <Link
                    href={`/board/${bbsId}/write?edit=${nttId}`}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    수정
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                  >
                    {deleting ? '삭제 중...' : '삭제'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            게시물을 찾을 수 없습니다.
          </div>
        )}
      </main>
    </div>
  );
}
