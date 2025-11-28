'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email?: string;
  userSe?: string;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 확인
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('jToken');
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('jToken');
      setUser(null);
      router.refresh();
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
            {user ? (
              <>
                <span className="text-gray-700">
                  <strong>{user.name || user.id}</strong>님 환영합니다
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  회원가입
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            전자정부 표준프레임워크 CMS
          </h1>
          <p className="text-xl text-gray-600">
            eGovFramework 4.3 기반 콘텐츠 관리 시스템
          </p>
        </div>

        {/* 기능 카드 */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">게시판</h2>
            <p className="text-gray-600 mb-4">
              공지사항, 자유게시판 등 다양한 게시판을 관리합니다.
            </p>
            <Link
              href="/board"
              className="text-blue-600 hover:underline font-medium"
            >
              바로가기 &rarr;
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">마이페이지</h2>
            <p className="text-gray-600 mb-4">
              회원 정보 조회 및 수정, 비밀번호 변경 등을 할 수 있습니다.
            </p>
            <Link
              href="/mypage"
              className="text-blue-600 hover:underline font-medium"
            >
              바로가기 &rarr;
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">관리자</h2>
            <p className="text-gray-600 mb-4">
              사이트 관리, 회원 관리, 게시판 관리 등 관리자 기능입니다.
            </p>
            <Link
              href="/admin"
              className="text-blue-600 hover:underline font-medium"
            >
              바로가기 &rarr;
            </Link>
          </div>
        </div>

        {/* API 정보 */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">개발자 정보</h2>
          <div className="grid md:grid-cols-2 gap-4 text-gray-600">
            <div>
              <p><strong>Backend:</strong> http://localhost:8080</p>
              <p><strong>Frontend:</strong> http://localhost:3001</p>
            </div>
            <div>
              <p>
                <strong>Swagger UI:</strong>{' '}
                <a
                  href="http://localhost:8080/swagger-ui/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  API 문서 보기
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-800 text-gray-400 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2024 eGovFramework CMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
