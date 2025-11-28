'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { memberApi, MemberData } from '@/lib/api';

interface CodeItem {
  code: string;
  codeNm: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [idChecked, setIdChecked] = useState(false);
  const [idAvailable, setIdAvailable] = useState(false);

  // 폼 데이터
  const [formData, setFormData] = useState<MemberData>({
    mberId: '',
    mberNm: '',
    password: '',
    passwordHint: '',
    passwordCnsr: '',
    mberEmailAdres: '',
    sexdstnCode: '',
    moblphonNo: '',
  });
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // 코드 데이터
  const [passwordHints, setPasswordHints] = useState<CodeItem[]>([]);
  const [genderCodes, setGenderCodes] = useState<CodeItem[]>([]);

  // 폼 데이터 로드
  useEffect(() => {
    const loadFormData = async () => {
      try {
        const response = await memberApi.getSignupFormData();
        if (response.result) {
          setPasswordHints(response.result.passwordHint_result || []);
          setGenderCodes(response.result.sexdstnCode_result || []);
        }
      } catch (err) {
        console.error('Failed to load form data:', err);
      }
    };
    loadFormData();
  }, []);

  // 입력값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 아이디 변경 시 중복체크 초기화
    if (name === 'mberId') {
      setIdChecked(false);
      setIdAvailable(false);
    }
  };

  // 아이디 중복 체크
  const checkIdDuplicate = async () => {
    if (!formData.mberId) {
      setError('아이디를 입력해주세요.');
      return;
    }

    try {
      const response = await memberApi.checkId(formData.mberId);
      setIdChecked(true);

      if (response.result && response.result.usedCnt === 0) {
        setIdAvailable(true);
        setError('');
        setSuccess('사용 가능한 아이디입니다.');
      } else {
        setIdAvailable(false);
        setSuccess('');
        setError('이미 사용중인 아이디입니다.');
      }
    } catch (err) {
      setError('아이디 중복 확인에 실패했습니다.');
      console.error(err);
    }
  };

  // 회원가입 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 유효성 검사
    if (!idChecked || !idAvailable) {
      setError('아이디 중복 확인을 해주세요.');
      return;
    }

    if (formData.password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.password.length < 4) {
      setError('비밀번호는 4자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    try {
      const response = await memberApi.signup(formData);

      if (response.resultCode === '200' || response.resultCode === 200) {
        setSuccess('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(response.resultMessage || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">eGovFramework CMS</h1>
          <p className="mt-2 text-gray-600">회원가입</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 아이디 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                아이디 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="mberId"
                  value={formData.mberId}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  placeholder="아이디"
                  required
                />
                <button
                  type="button"
                  onClick={checkIdDuplicate}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
                >
                  중복확인
                </button>
              </div>
              {idChecked && (
                <p className={`mt-1 text-sm ${idAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {idAvailable ? '사용 가능한 아이디입니다.' : '이미 사용중인 아이디입니다.'}
                </p>
              )}
            </div>

            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="mberNm"
                value={formData.mberNm}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                placeholder="이름"
                required
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                placeholder="비밀번호 (4자 이상)"
                required
              />
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                placeholder="비밀번호 확인"
                required
              />
              {passwordConfirm && formData.password !== passwordConfirm && (
                <p className="mt-1 text-sm text-red-600">비밀번호가 일치하지 않습니다.</p>
              )}
            </div>

            {/* 비밀번호 힌트 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 힌트 <span className="text-red-500">*</span>
              </label>
              <select
                name="passwordHint"
                value={formData.passwordHint}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                required
              >
                <option value="">선택하세요</option>
                {passwordHints.map((hint) => (
                  <option key={hint.code} value={hint.code}>
                    {hint.codeNm}
                  </option>
                ))}
              </select>
            </div>

            {/* 비밀번호 힌트 답변 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 힌트 답변 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="passwordCnsr"
                value={formData.passwordCnsr}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                placeholder="힌트에 대한 답변"
                required
              />
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="mberEmailAdres"
                value={formData.mberEmailAdres}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                placeholder="example@email.com"
                required
              />
            </div>

            {/* 성별 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                성별 <span className="text-red-500">*</span>
              </label>
              <select
                name="sexdstnCode"
                value={formData.sexdstnCode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                required
              >
                <option value="">선택하세요</option>
                {genderCodes.map((code) => (
                  <option key={code.code} value={code.code}>
                    {code.codeNm}
                  </option>
                ))}
              </select>
            </div>

            {/* 휴대폰 번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                휴대폰 번호
              </label>
              <input
                type="tel"
                name="moblphonNo"
                value={formData.moblphonNo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                placeholder="010-1234-5678"
              />
            </div>

            {/* 에러/성공 메시지 */}
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

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
            >
              {loading ? '처리 중...' : '회원가입'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
