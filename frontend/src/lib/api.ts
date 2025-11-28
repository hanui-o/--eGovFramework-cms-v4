const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface ApiResponse<T = unknown> {
  resultCode: string | number;
  resultMessage: string;
  result: T;
}

export interface LoginResponse {
  jToken?: string;
  resultVO?: {
    id: string;
    name: string;
    email?: string;
    userSe?: string;
  };
}

export interface MemberData {
  mberId: string;
  mberNm: string;
  password: string;
  passwordHint: string;
  passwordCnsr: string;
  mberEmailAdres: string;
  sexdstnCode: string;
  moblphonNo?: string;
  zip?: string;
  adres?: string;
  detailAdres?: string;
}

export async function api<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  return response.json();
}

export async function apiFormData<T>(
  endpoint: string,
  data: Record<string, string>
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const formBody = new URLSearchParams(data).toString();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody,
  });

  return response.json();
}

export const authApi = {
  login: (id: string, password: string) =>
    api<LoginResponse>('/auth/login-jwt', {
      method: 'POST',
      body: JSON.stringify({ id, password }),
    }),
  logout: () => api('/auth/logout'),
};

export const memberApi = {
  // 회원가입 폼 데이터 조회 (패스워드 힌트, 성별 코드 등)
  getSignupFormData: () => api<{
    passwordHint_result: Array<{ code: string; codeNm: string }>;
    sexdstnCode_result: Array<{ code: string; codeNm: string }>;
  }>('/etc/member_insert'),

  // 아이디 중복 체크
  checkId: (id: string) => api<{ usedCnt: number; checkId: string }>(`/etc/member_checkid/${encodeURIComponent(id)}`),

  // 회원가입
  signup: (data: MemberData) => apiFormData('/etc/member_insert', data as unknown as Record<string, string>),

  // 약관 조회
  getAgreement: () => api<{ stplatList: object; sbscrbTy: string }>('/etc/member_agreement'),
};

export interface BoardArticle {
  nttId: number;
  bbsId: string;
  nttNo: number;
  nttSj: string;
  nttCn: string;
  frstRegisterId: string;
  frstRegisterNm?: string;
  frstRegisterPnttm: string;
  inqireCo: number;
  atchFileId?: string;
  ntcrNm?: string;
  replyLc?: string;
  replyAt?: string;
}

export interface BoardMaster {
  bbsId: string;
  bbsNm: string;
  bbsTyCode: string;
  fileAtchPosblAt: string;
  posblAtchFileNumber: number;
  posblAtchFileSize?: number;
}

export interface BoardListResponse {
  resultList: BoardArticle[];
  resultCnt: number;
  paginationInfo: {
    currentPageNo: number;
    recordCountPerPage: number;
    pageSize: number;
    totalRecordCount: number;
    totalPageCount: number;
    firstPageNoOnPageList: number;
    lastPageNoOnPageList: number;
    firstRecordIndex: number;
    lastRecordIndex: number;
  };
  brdMstrVO?: BoardMaster;
  user?: object;
}

export interface BoardDetailResponse {
  result: BoardArticle;
  brdMstrVO?: BoardMaster;
  sessionUniqId?: string;
  user?: object;
}

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jToken') : null;
  return token ? { Authorization: token } : {};
}

export async function apiWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  return response.json();
}

export const boardApi = {
  // 게시물 목록 조회
  getList: (bbsId: string, pageIndex = 1, searchCnd?: string, searchWrd?: string) => {
    const params = new URLSearchParams({
      bbsId,
      pageIndex: String(pageIndex),
    });
    if (searchCnd) params.append('searchCnd', searchCnd);
    if (searchWrd) params.append('searchWrd', searchWrd);
    return apiWithAuth<BoardListResponse>(`/board?${params.toString()}`);
  },

  // 게시물 상세 조회
  getDetail: (bbsId: string, nttId: number) =>
    apiWithAuth<BoardDetailResponse>(`/board/${bbsId}/${nttId}`),

  // 게시물 등록
  create: (data: FormData) => {
    const url = `${API_BASE_URL}/board`;
    return fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: data,
    }).then((res) => res.json());
  },

  // 게시물 수정
  update: (nttId: number, data: FormData) => {
    const url = `${API_BASE_URL}/board/${nttId}`;
    return fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: data,
    }).then((res) => res.json());
  },

  // 게시물 삭제
  delete: (bbsId: string, nttId: number) =>
    apiWithAuth(`/board/${bbsId}/${nttId}`, {
      method: 'PATCH',
      body: JSON.stringify({}),
    }),

  // 게시판 파일첨부 정보
  getFileAtchInfo: (bbsId: string) =>
    apiWithAuth<BoardMaster>(`/boardFileAtch/${bbsId}`),
};

export interface MypageData {
  mberManageVO: {
    uniqId: string;
    mberId: string;
    mberNm: string;
    mberEmailAdres: string;
    sexdstnCode: string;
    moblphonNo: string;
    zip: string;
    adres: string;
    detailAdres: string;
    passwordHint: string;
    passwordCnsr: string;
  };
  passwordHint_result?: Array<{ code: string; codeNm: string }>;
  sexdstnCode_result?: Array<{ code: string; codeNm: string }>;
}

export const mypageApi = {
  // 내 정보 조회
  getMyInfo: () => apiWithAuth<MypageData>('/mypage'),

  // 내 정보 수정
  updateMyInfo: (data: Partial<MypageData['mberManageVO']>) =>
    apiWithAuth('/mypage/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 회원 탈퇴
  deleteAccount: (data: { uniqId: string }) =>
    apiWithAuth('/mypage/delete', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
