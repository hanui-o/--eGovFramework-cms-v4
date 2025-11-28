'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiWithAuth } from '@/lib/api';

interface Member {
  uniqId: string;
  mberId: string;
  mberNm: string;
  mberEmailAdres: string;
  mberSttus: string;
  sbscrbDe: string;
}

interface MemberListResponse {
  resultList: Member[];
  paginationInfo: {
    totalRecordCount: number;
    currentPageNo: number;
    totalPageCount: number;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jToken');
    const user = localStorage.getItem('user');

    if (!token) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    // 관리자 권한 확인 (실제로는 서버에서 확인해야 함)
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.userSe === 'ADM' || userData.groupNm === 'ROLE_ADMIN') {
          setIsAdmin(true);
        }
      } catch {
        // ignore
      }
    }

    loadMembers(currentPage);
  }, [currentPage]);

  const loadMembers = async (page: number) => {
    setLoading(true);
    setError('');

    try {
      const response = await apiWithAuth<MemberListResponse>(`/members?pageIndex=${page}`);

      if (response.resultCode === 200 || response.resultCode === '200') {
        const data = response.result;
        setMembers(data.resultList || []);
        if (data.paginationInfo) {
          setTotalPages(data.paginationInfo.totalPageCount || 1);
        }
      } else {
        if (response.resultCode === 403) {
          setError('관리자 권한이 필요합니다.');
        } else {
          setError(response.resultMessage || '회원 목록을 불러오는데 실패했습니다.');
        }
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'P':
        return '정상';
      case 'D':
        return '탈퇴';
      case 'S':
        return '정지';
      default:
        return status;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return dateStr.substring(0, 10);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <header className="bg-gray-800 shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            eGovFramework CMS
          </Link>
          <nav className="flex items-center gap-4">
            <span className="text-gray-300">관리자 모드</span>
            <Link href="/" className="text-gray-300 hover:text-white">
              사이트로 이동
            </Link>
          </nav>
        </div>
      </header>

      <div className="flex">
        {/* 사이드바 */}
        <aside className="w-64 bg-gray-800 min-h-screen p-4">
          <nav className="space-y-2">
            <Link
              href="/admin"
              className="block px-4 py-2 text-white bg-gray-700 rounded-lg"
            >
              회원 관리
            </Link>
            <Link
              href="/admin/board"
              className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg"
            >
              게시판 관리
            </Link>
            <Link
              href="/admin/settings"
              className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg"
            >
              사이트 설정
            </Link>
          </nav>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">회원 관리</h1>

          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              로딩 중...
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              {error.includes('권한') && (
                <p className="text-gray-500 text-sm">
                  관리자 계정으로 로그인해주세요.
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        아이디
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        이름
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        이메일
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        상태
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        가입일
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        관리
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          회원이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      members.map((member) => (
                        <tr key={member.uniqId} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-800">{member.mberId}</td>
                          <td className="px-4 py-3 text-gray-800">{member.mberNm}</td>
                          <td className="px-4 py-3 text-gray-600 text-sm">
                            {member.mberEmailAdres}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                member.mberSttus === 'P'
                                  ? 'bg-green-100 text-green-800'
                                  : member.mberSttus === 'D'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {getStatusName(member.mberSttus)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-sm">
                            {formatDate(member.sbscrbDe)}
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/admin/members/${member.uniqId}`}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              상세
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    이전
                  </button>
                  {Array.from({ length: Math.min(10, totalPages) }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 border rounded ${
                        currentPage === i + 1 ? 'bg-blue-600 text-white' : ''
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
