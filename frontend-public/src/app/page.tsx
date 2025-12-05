'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/api';
import { Container, Heading, Section } from 'lucide-react';
import { Button } from '@/components/hanui/button';
import { SectionHeading } from '@/components/hanui/section-header';
import { Card, CardBody } from '@/components/hanui/card';

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
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <header className="bg-krds-white shadow-sm border-b border-krds-gray-20">
        <Container className="py-4">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="text-2xl font-bold text-krds-primary-50 hover:text-krds-primary-60 transition-colors"
            >
              eGovFramework CMS
            </Link>
            <nav className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-krds-gray-70">
                    <strong className="text-krds-gray-95">
                      {user.name || user.id}
                    </strong>
                    님 환영합니다
                  </span>
                  <Button variant="tertiary" size="sm" onClick={handleLogout}>
                    로그아웃
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="tertiary" size="sm">
                      로그인
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="primary" size="sm">
                      회원가입
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </Container>
      </header>

      {/* 히어로 섹션 */}
      <Section>
        <Container>
          <SectionHeading
            level="h1"
            title="전자정부 표준프레임워크 CMS"
            description="eGovFramework 4.3 기반 콘텐츠 관리 시스템"
            className="text-center"
          />
        </Container>
      </Section>

      {/* 기능 카드 섹션 */}
      <Section>
        <Container>
          <SectionHeading
            level="h2"
            title="주요 기능"
            description="CMS에서 제공하는 주요 기능을 확인하세요."
          />

          <div className="grid md:grid-cols-3 gap-6">
            {/* 게시판 카드 */}
            <Card variant="outlined" padding="md" className="hover:shadow-md transition-shadow">
              <CardBody className="space-y-4">
                <Heading className="text-krds-gray-95">
                  게시판
                </Heading>
                <p className="text-krds-gray-70 leading-relaxed">
                  공지사항, 자유게시판 등 다양한 게시판을 관리합니다.
                </p>
                <Link
                  href="/board"
                  className="inline-flex items-center text-krds-primary-50 hover:text-krds-primary-60 font-medium"
                >
                  바로가기 →
                </Link>
              </CardBody>
            </Card>

            {/* 마이페이지 카드 */}
            <Card variant="outlined" padding="md" className="hover:shadow-md transition-shadow">
              <CardBody className="space-y-4">
                <Heading className="text-krds-gray-95">
                  마이페이지
                </Heading>
                <p className="text-krds-gray-70 leading-relaxed">
                  회원 정보 조회 및 수정, 비밀번호 변경 등을 할 수 있습니다.
                </p>
                <Link
                  href="/mypage"
                  className="inline-flex items-center text-krds-primary-50 hover:text-krds-primary-60 font-medium"
                >
                  바로가기 →
                </Link>
              </CardBody>
            </Card>

            {/* 관리자 카드 */}
            <Card variant="outlined" padding="md" className="hover:shadow-md transition-shadow">
              <CardBody className="space-y-4">
                <Heading className="text-krds-gray-95">
                  관리자
                </Heading>
                <p className="text-krds-gray-70 leading-relaxed">
                  사이트 관리, 회원 관리, 게시판 관리 등 관리자 기능입니다.
                </p>
                <a
                  href="http://localhost:3001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-krds-primary-50 hover:text-krds-primary-60 font-medium"
                >
                  바로가기 →
                </a>
              </CardBody>
            </Card>
          </div>
        </Container>
      </Section>

      {/* 개발자 정보 섹션 */}
      <Section>
        <Container>
          <Card variant="shadow" padding="lg">
            <CardBody>
              <SectionHeading level="h2" title="개발자 정보" />
              <div className="grid md:grid-cols-2 gap-6 text-krds-gray-70">
                <div className="space-y-2">
                  <p>
                    <strong className="text-krds-gray-95">Backend:</strong>{' '}
                    http://localhost:8080
                  </p>
                  <p>
                    <strong className="text-krds-gray-95">Public Frontend:</strong>{' '}
                    http://localhost:3000
                  </p>
                  <p>
                    <strong className="text-krds-gray-95">Admin Frontend:</strong>{' '}
                    http://localhost:3001
                  </p>
                </div>
                <div>
                  <p>
                    <strong className="text-krds-gray-95">Swagger UI:</strong>{' '}
                    <a
                      href="http://localhost:8080/swagger-ui/index.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-krds-primary-50 hover:text-krds-primary-60 hover:underline"
                    >
                      API 문서 보기
                    </a>
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Container>
      </Section>

      {/* 푸터 */}
      <footer className="bg-krds-gray-95 text-krds-gray-40 py-8 mt-auto">
        <Container>
          <p className="text-center">
            © 2024 eGovFramework CMS. All rights reserved.
          </p>
        </Container>
      </footer>
    </div>
  );
}
