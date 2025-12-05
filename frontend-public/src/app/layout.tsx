import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { HeaderWithPanelMenu, PanelMenuItem } from '@/components/hanui/header-with-panel-menu';
import { SideNavigation } from '@/components/hanui/side-navigation';
import { Footer } from '@/components/hanui/footer';
import { Container } from '@/components/hanui/container';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'eGovFramework CMS',
  description: '전자정부 표준프레임워크 기반 CMS',
};

const panelItems: PanelMenuItem[] = [
          {
            label: '회의',
            panel: [
              {
                label: '회의하기 싫다',
                subContent: {
                  title: '회의 거부 사유',
                  links: [
                    { label: '줌 피로감', href: '/meeting/zoom-fatigue' },
                    { label: '이메일로 대체 가능', href: '/meeting/email' },
                  ],
                },
              },
              { label: '나 왜 초대됨?', href: '/meeting/invited' },
            ],
          },
          { label: '문서화', href: '/docs' },
        ]

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div id="wrap">
          <HeaderWithPanelMenu panelItems={panelItems} />
          <main>
            <Container>
              <SideNavigation
                title="1Depth-title"
                sections={[
                  {
                    label: '2Depth-title',
                    active: true,
                    children: [
                      { label: '3Depth-link', href: '#', active: true },
                      { label: '3Depth-link', href: '#' },
                    ],
                  },
                ]}
              />
              {children}
            </Container>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
