# 📄 내자부 (내 자소서를 부탁해) - 자기소개서 관리 서비스

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 📝 프로젝트 설명

내자부는 자기소개서를 손쉽게 작성하고 관리할 수 있는 웹 애플리케이션입니다.

## ✨ 주요 기능

*   🔐 **사용자 인증**
    *   안전한 JWT 기반 로그인, 회원가입, 로그아웃
    *   이메일 인증 및 가입 시 실시간 중복 확인
    *   임시 비밀번호 사용자의 비밀번호 변경 유도

*   📄 **자기소개서 관리**
    *   자기소개서 생성, 조회, 수정 및 삭제
    *   마감일까지 남은 시간을 실시간으로 표시
    *   `hanspell` 라이브러리를 이용한 맞춤법 검사
    *   다양한 보기 모드 (그리드, 리스트, 캘린더)

*   💬 **커뮤니티**
    *   카테고리별 게시판 (공지사항, 자유게시판, 채용공고, 문의/건의)
    *   게시글 및 댓글 CRUD 기능
    *   관리자의 게시글 상단 고정 기능
    *   게시글 목록에 댓글 수 표시

*   🗑️ **휴지통**
    *   삭제된 자기소개서는 7일간 보관 후 영구 삭제
    *   보관 기간 내 복원 가능

*   ✨ **사용자 경험(UX/UI)**
    *   전체 페이지에 일관된 헤더 및 네비게이션 제공
    *   모든 시스템 알림을 반응형 모달창으로 통일하여 일관성 확보
    *   페이지 이동 없이 부드러운 기능 처리 (로그아웃 제외)

## 🚀 시작하기

### ✅ 요구 사항

*   Node.js
*   npm

### 📦 설치

1.  레포지토리를 클론합니다:
    ```bash
    git clone https://github.com/991357/Naejabu.git
    ```
2.  프로젝트 디렉토리로 이동합니다:
    ```bash
    cd Naejabu/naejabu-app
    ```
3.  의존성을 설치합니다:
    ```bash
    npm install
    ```

### ⚙️ 빌드 및 프로덕션 실행

1.  프로덕션용으로 애플리케이션을 빌드합니다:
    ```bash
    npm run build
    ```
2.  빌드된 애플리케이션을 실행합니다:
    ```bash
    npm run start
    ```

기본적으로 [http://localhost:3000](http://localhost:3000)에서 애플리케이션이 실행됩니다.

## 🛠️ 사용된 기술

*   **프론트엔드**:
    *   Next.js
    *   React
    *   TypeScript
    *   Tailwind CSS
*   **백엔드**:
    *   Next.js API Routes
    *   better-sqlite3 (데이터베이스)
    *   jsonwebtoken (인증)
    *   bcryptjs (비밀번호 해싱)
    *   nodemailer (이메일 발송)
*   **맞춤법 검사**:
    *   hanspell
