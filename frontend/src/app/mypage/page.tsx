'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mypageApi, MypageData } from '@/lib/api';

interface CodeItem {
  code: string;
  codeNm: string;
}

export default function MypagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    uniqId: '',
    mberId: '',
    mberNm: '',
    mberEmailAdres: '',
    sexdstnCode: '',
    moblphonNo: '',
    zip: '',
    adres: '',
    detailAdres: '',
    passwordHint: '',
    passwordCnsr: '',
    password: '',
  });

  const [passwordHints, setPasswordHints] = useState<CodeItem[]>([]);
  const [genderCodes, setGenderCodes] = useState<CodeItem[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('jToken');
    if (!token) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
    loadMyInfo();
  }, []);

  const loadMyInfo = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await mypageApi.getMyInfo();

      if (response.resultCode === 200 || response.resultCode === '200') {
        const data = response.result;
        if (data.mberManageVO) {
          setFormData({
            ...data.mberManageVO,
            password: '',
          });
        }
        if (data.passwordHint_result) {
          setPasswordHints(data.passwordHint_result);
        }
        if (data.sexdstnCode_result) {
          setGenderCodes(data.sexdstnCode_result);
        }
      } else {
        if (response.resultCode === 403) {
          setError('로그인이 필요합니다.');
          router.push('/login');
        } else {
          setError(response.resultMessage || '정보를 불러오는데 실패했습니다.');
        }
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await mypageApi.updateMyInfo(formData);

      if (response.resultCode === 200 || response.resultCode === '200') {
        setSuccess('정보가 수정되었습니다.');
        setIsEditing(false);

        // 로컬 스토리지의 사용자 정보 업데이트
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          user.name = formData.mberNm;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } else {
        setError(response.resultMessage || '수정에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

    try {
      const response = await mypageApi.deleteAccount({ uniqId: formData.uniqId });

      if (response.resultCode === 200 || response.resultCode === '200') {
        alert('탈퇴 처리되었습니다.');
        localStorage.removeItem('jToken');
        localStorage.removeItem('user');
        router.push('/');
      } else {
        alert(response.resultMessage || '탈퇴 처리에 실패했습니다.');
      }
    } catch (err) {
      alert('서버 연결에 실패했습니다.');
      console.error(err);
    }
  };

  const getGenderName = (code: string) => {
    const gender = genderCodes.find((g) => g.code === code);
    return gender?.codeNm || code;
  };

  const getPasswordHintName = (code: string) => {
    const hint = passwordHints.find((h) => h.code === code);
    return hint?.codeNm || code;
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
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">마이페이지</h1>

        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            로딩 중...
          </div>
        ) : error && !formData.mberId ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-700">내 정보</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-blue-600 hover:text-blue-800"
                >
                  수정
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    아이디
                  </label>
                  <input
                    type="text"
                    value={formData.mberId}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="mberNm"
                    value={formData.mberNm}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="mberEmailAdres"
                    value={formData.mberEmailAdres}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    성별
                  </label>
                  <select
                    name="sexdstnCode"
                    value={formData.sexdstnCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  >
                    <option value="">선택하세요</option>
                    {genderCodes.map((code) => (
                      <option key={code.code} value={code.code}>
                        {code.codeNm}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    휴대폰 번호
                  </label>
                  <input
                    type="tel"
                    name="moblphonNo"
                    value={formData.moblphonNo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm">
                    {success}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      loadMyInfo();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {saving ? '저장 중...' : '저장'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex border-b pb-3">
                  <span className="w-32 text-gray-600">아이디</span>
                  <span className="text-gray-800">{formData.mberId}</span>
                </div>
                <div className="flex border-b pb-3">
                  <span className="w-32 text-gray-600">이름</span>
                  <span className="text-gray-800">{formData.mberNm}</span>
                </div>
                <div className="flex border-b pb-3">
                  <span className="w-32 text-gray-600">이메일</span>
                  <span className="text-gray-800">{formData.mberEmailAdres}</span>
                </div>
                <div className="flex border-b pb-3">
                  <span className="w-32 text-gray-600">성별</span>
                  <span className="text-gray-800">{getGenderName(formData.sexdstnCode)}</span>
                </div>
                <div className="flex border-b pb-3">
                  <span className="w-32 text-gray-600">휴대폰</span>
                  <span className="text-gray-800">{formData.moblphonNo || '-'}</span>
                </div>
                <div className="flex border-b pb-3">
                  <span className="w-32 text-gray-600">비밀번호 힌트</span>
                  <span className="text-gray-800">{getPasswordHintName(formData.passwordHint)}</span>
                </div>

                {success && (
                  <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm">
                    {success}
                  </div>
                )}
              </div>
            )}

            {/* 회원 탈퇴 */}
            <div className="mt-8 pt-6 border-t">
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                회원 탈퇴
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
