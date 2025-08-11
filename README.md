#  🍷나만의 와인을 찾는 방법, WINE

<img width="1200" height="630" alt="og-image" src="https://github.com/user-attachments/assets/ccf080ed-5bc4-44ca-83cd-fa27f56e58bd" />


당신의 취향에 딱 맞는 와인을 찾고, 다양한 사람들과 와인 경험을 나눠보세요! <br/>
와인파인더는 와인에 대한 정보와 리뷰를 등록하고 탐색할 수 있는 사용자 참여형 와인 커뮤니티입니다.

 
[👉 서비스 바로가기](https://whyne-fe.vercel.app)

<br/>

# 프로젝트 소개

**WINE**은 와인에 대한 다양한 정보를 탐색하고, <br/>
직접 리뷰를 작성하고 공유할 수 있는 와인 정보 기반 커뮤니티 플랫폼입니다. <br/>

로그인을 하면 자신만의 리뷰를 남기거나 새로운 와인을 등록할 수도 있어요!


플레이버 슬라이더, 향미 태그, 그리고 AI 챗봇 추천 기능까지 더해  <br/>
당신의 취향에 딱 맞는 와인을 쉽게 찾을 수 있도록 도와줍니다.

<br/>

# 팀원 소개

<img width="1241" height="420" alt="image" src="https://github.com/user-attachments/assets/ee94a322-e576-403f-804e-f871d2d9bbcb" />





# ✨ 주요 기능 

#### 🔍 와인 탐색 & 검색 (AI 챗봇 추천 포함)<br/>
#### 📝 와인 정보 및 리뷰 등록/수정/삭제 (CRUD)<br/>
#### 💬 와인별 리뷰 등록 기능 (텍스트 + 향미 정보)<br/>
#### 🔍 필터·검색·무한스크롤 등 편리한 탐색 기능 제공<br/>
#### 🙋 로그인/회원가입 및 사용자 인증 기반 기능 제공<br/>

<br/>


# 1. 개발 환경

| 항목         | 사용 기술                     |
|--------------|-------------------------------|
| 개발 언어     | Typescript, HTML, CSS        |
| 코드 에디터   | Visual Studio Code (VSC)      |
| 프레임워크    | Next.js 13                         |
| 포매터       | ESLint, Prettier              |
| 번들링       | Webpack                          |
| 형상 관리     | Git                           |
| 스타일링     | Tailwind 3.4 + shadcn/ui            |
| 배포         | Vercel                       |
| 라우팅       | React Router                  |
| 데이터 패칭   | axios                         |
| 상태관리   | Zustand, TanStack Query                      |

<br/>
<br/>

# 2. 채택한 개발 기술과 브랜치 전략

### Next.js 13, Tailwind
- Next.js 13
   - 파일 기반 라우팅 구조를 사용해 컴포넌트와 URL 경로가 1:1로 매핑되는 직관적인 구조를 설계할 수 있었습니다.
   - getServerSideProps, getStaticProps 등을 통해 페이지 별로 SSR과 SSG를 유연하게 선택할 수 있었습니다. 
   - pages/api 디렉토리를 통한 API 라우트 작성이 가능해<br/> 인증과정에서 돌아오는 응답에 setCookie를 달아주는 BFF를 추가할 수 있었습니다.
     
- Tailwind + shadcn/ui
   - 유틸리티 기반의 빠른 스타일링과 shadcn/ui의 일관된 컴포넌트 사용해, 빠른 MVP 개발이 가능했습니다.
   - 접근성과 디자인 일관성을 지키면서도 cn함수를 통해 유연한 UI 커스터마이징이 가능했습니다.
   - Next.js와의 궁합이 좋아 SSR 환경에서도 안정적으로 작동하며,<br/>
     실제 사용된 클래스만 빌드 시점에 css로 생성되기 때문에 더 작은 번들로 빠르게 렌더링이 가능했습니다.

### Zustand + React Query
- Zustand를 통해 전역 사용자 상태, 필터 정보 등 페이지 간 공유해야 하는 상태를 간편하게 관리할 수 있었습니다.
  
- React Query를 통해 캐싱, 에러 처리, 로딩 상태 관리 등 API 통신 최적화가 가능했습니다.

### React Hook Form + zod

- React Hook Form을 사용하여 가볍고 성능 좋은 폼 상태 관리를 구현할 수 있었고, <br/>Zod와의 연동을 통해 스키마 기반 유효성 검사를 적용했습니다.

- 인풋 컴포넌트에 에러 메시지를 바로 표시하고, 사용자 피드백을 직관적으로 제공할 수 있었습니다

### eslint, prettier
- 정해진 규칙에 따라 자동적으로 코드 스타일을 정리해 코드의 일관성을 유지하고자 했습니다.
- 코드 품질 관리는 eslint에, 코드 포맷팅은 prettier에 일임해 사용했습니다.
- 예외 규칙은 팀원들과 협의 후 사용했습니다.

<br>

### 브랜치 전략

| 이름 | 역할 |
|---|---|
|main |배포(프로덕션)용 코드. 항상 안정된 상태 유지 |
|dev | 개발용 통합 브랜치. 여러 기능이 합쳐지는 곳 |
|feature/xxx | 새로운 기능, 작업 단위별 브랜치 |
|fix/xxx | 버그 수정 브랜치 |
|refactor/xxx | 코드 개선 브랜치 |


<br/>
<br/>

# 3. 프로젝트 구조

```
📦src/
├── assets/
├── pages/
│   ├── _app.tsx        // 전역 설정 (Providers, 스타일)
│   ├── _document.tsx   // HTML 문서 구조
│   ├── index.tsx       // 홈페이지
|   ├── wines/          // 와인 목록 및 상세 페이지
|   ├── my-profile/     // 마이페이지
|   ├── signin/         // 로그인 페이지
|   ├── signup/         // 회원가입 페이지
|   ├── oatuh/          // 소셜 로그인
│   └── api/            // API Routes
├── components/
│   ├── ui/             // shadcn/ui 컴포넌트
│   ├── common/         // 공통 컴포넌트
│   └──  ...
├── lib/
│   ├── utils.ts        // 유틸리티 함수
│   ├── api.ts          // API 클라이언트 (axios)
│   └── auth.ts         // 인증 관련
├── stores/             // Zustand 스토어
├── hooks/              // 커스텀 훅 (TanStack Query)
├── styles/
│   └── globals.css     // Tailwind CSS
└── types/              // TypeScript 타입 정의
```

<br/>
<br/>

# 4. 페이지별 기능

## [초기화면]

- 초기 진입 시 스플래쉬 이미지를 넣어 gnb가 업데이트 되는 모습을 가렸습니다.
- framer motion을 통해 애니메이션을 적용해 사용자에게 부드러운 첫 인상을 제공했습니다.

![KakaoTalk_Recording_20250805_143950-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/9544927c-5db3-4e22-bc1f-529955d9f623)


## [로그인/회원가입]

- 로그인, 회원가입이 가능한 공간입니다.
- 미리 스타일이 적용된 인풋과 rhf를 연결해 유효성 검사를 수행하고 유저에게 즉각적인 피드백을 줍니다.
- 로그인 성공 시 setCookie헤더가 달린 응답을 받아 유저의 엑세스토큰과 리프레쉬 토큰을 쿠키에 저장합니다.
- 카카오 소셜로그인을 지원합니다.

![ezgif com-video-to-gif-converter (1)](https://github.com/user-attachments/assets/3b0bfe08-8c03-4669-b68c-55cc237a1573)


## [마이 프로필 페이지]

- 프로필 이미지와 닉네임을 변경할 수 있는 공간입니다.
- 본인이 작성한 리뷰와 와인을 확인할 수 있습니다.
- 해당 페이지에서 본인이 작성한 리뷰와 와인들을 수정, 삭제할 수 있습니다.

![KakaoTalk_Recording_20250805_144908-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/b88670aa-d146-481f-a51f-24dc71b1e489)


## [와인 목록 페이지]

- 등록된 와인을 조회할 수 있는 공간입니다.
- 검색 바와 필터를 통해 원하는 조건의 와인을 찾을 수 있습니다.
- 상단의 추천와인을 통해 평점이 높은 와인을 추천받을 수 있습니다.
- 와인 등록하기 버튼을 통해 새로운 와인을 등록할 수 있습니다.
- 와인 카드를 클릭해 와인 상세페이지로 이동할 수 있습니다.

![KakaoTalk_Recording_20250805_145151-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/f49e603b-9340-48e0-8b4d-df1fc498c0ec)


## [와인 상세 페이지]

- 와인의 기본 정보와 해당 와인에 달린 리뷰들을 확인할 수 있는 공간입니다.
- 평균 별점이 표시되고, 리뷰하기 버튼을 통해 리뷰를 새롭게 등록할 수 있습니다.
- 관심있는 리뷰는 열어서 상세하게 볼 수 있고, 좋아요를 할 수 있습니다.
- 본인이 작성한 리뷰는 수정 및 삭제가 가능합니다.

![KakaoTalk_Recording_20250805_135143-ezgif com-video-to-gif-converter (1)](https://github.com/user-attachments/assets/d500357b-9893-4e46-b47b-45914dc5468d)

