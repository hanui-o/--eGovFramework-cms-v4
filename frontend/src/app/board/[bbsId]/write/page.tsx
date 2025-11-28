'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { boardApi } from '@/lib/api';

interface PageProps {
  params: Promise<{ bbsId: string }>;
}

export default function BoardWritePage({ params }: PageProps) {
  const { bbsId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editNttId = searchParams.get('edit');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [boardName, setBoardName] = useState('게시판');
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    // 로그인 확인
    const token = localStorage.getItem('jToken');
    if (!token) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    // 게시판 정보 로드
    loadBoardInfo();

    // 수정 모드인 경우 기존 글 로드
    if (editNttId) {
      setIsEdit(true);
      loadArticle(editNttId);
    }
  }, [bbsId, editNttId]);

  const loadBoardInfo = async () => {
    try {
      const response = await boardApi.getFileAtchInfo(bbsId);
      if (response.result) {
        setBoardName((response.result as unknown as { bbsNm?: string }).bbsNm || '게시판');
      }
    } catch (err) {
      console.error('Failed to load board info:', err);
    }
  };

  const loadArticle = async (nttId: string) => {
    try {
      const response = await boardApi.getDetail(bbsId, parseInt(nttId));
      if (response.resultCode === 200 || response.resultCode === '200') {
        const data = response.result;
        const article = data.result || data;
        setTitle((article as unknown as { nttSj?: string }).nttSj || '');
        setContent((article as unknown as { nttCn?: string }).nttCn || '');
      }
    } catch (err) {
      console.error('Failed to load article:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('bbsId', bbsId);
      formData.append('nttSj', title);
      formData.append('nttCn', content);

      // 파일 첨부
      if (files) {
        for (let i = 0; i < files.length; i++) {
          formData.append('files', files[i]);
        }
      }

      let response;
      if (isEdit && editNttId) {
        response = await boardApi.update(parseInt(editNttId), formData);
      } else {
        response = await boardApi.create(formData);
      }

      if (response.resultCode === 200 || response.resultCode === '200') {
        alert(isEdit ? '수정되었습니다.' : '등록되었습니다.');
        router.push(`/board/${bbsId}`);
      } else {
        setError(response.resultMessage || (isEdit ? '수정에 실패했습니다.' : '등록에 실패했습니다.'));
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-4">
          <Link
            href={`/board/${bbsId}`}
            className="text-blue-600 hover:underline"
          >
            &larr; {boardName} 목록으로
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            {isEdit ? '게시물 수정' : '게시물 작성'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                placeholder="제목을 입력하세요"
                required
              />
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 resize-none"
                placeholder="내용을 입력하세요"
                required
              />
            </div>

            {/* 파일 첨부 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                파일 첨부
              </label>
              <input
                type="file"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
              <p className="mt-1 text-sm text-gray-500">
                여러 파일을 선택할 수 있습니다.
              </p>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* 버튼 */}
            <div className="flex justify-end gap-2">
              <Link
                href={`/board/${bbsId}`}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? '처리 중...' : isEdit ? '수정' : '등록'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
