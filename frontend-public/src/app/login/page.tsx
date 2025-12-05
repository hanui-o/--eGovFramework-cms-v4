'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores';
import {
  Section,
  Container,
  SectionHeading,
  Button,
  Card,
  CardBody,
  CardFooter,
  Input,
  Label,
  Alert,
  AlertDescription,
} from '@/components/hanui';

export default function LoginPage() {
  const router = useRouter();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [userSe, setUserSe] = useState('GNR');

  // Zustand Store
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await login(id, password, userSe);

    if (success) {
      router.push('/');
    }
  };

  return (
    <Section
      as="main"
      padding="page-section"
      background="gray"
      className="min-h-screen flex items-center justify-center"
    >
      <Container maxWidth="sm">
        <SectionHeading
          level="h1"
          title="eGovFramework CMS"
          description="로그인"
          className="text-center"
        />

        <Card variant="shadow" padding="lg">
          <form onSubmit={handleLogin}>
            <CardBody className="space-y-6">
              {/* 사용자 유형 선택 */}
              <div className="flex gap-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="userSe"
                    value="USR"
                    checked={userSe === 'USR'}
                    onChange={(e) => setUserSe(e.target.value)}
                    className="mr-2 w-4 h-4 accent-krds-primary-50"
                  />
                  <span className="text-krds-gray-80">관리자/직원</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="userSe"
                    value="GNR"
                    checked={userSe === 'GNR'}
                    onChange={(e) => setUserSe(e.target.value)}
                    className="mr-2 w-4 h-4 accent-krds-primary-50"
                  />
                  <span className="text-krds-gray-80">일반회원</span>
                </label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="id">아이디</Label>
                <Input
                  id="id"
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="아이디를 입력하세요"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                />
              </div>

              {error && (
                <Alert variant="error">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full"
              >
                로그인
              </Button>
            </CardBody>
          </form>

          <CardFooter className="justify-center border-t border-krds-gray-10 mt-6">
            <p className="text-krds-gray-60">
              계정이 없으신가요?{' '}
              <Link
                href="/signup"
                className="text-krds-primary-50 hover:underline font-medium"
              >
                회원가입
              </Link>
            </p>
          </CardFooter>
        </Card>
      </Container>
    </Section>
  );
}
