# 📄 내자부 (Naejabu) - 이력서 관리 서비스

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 📝 프로젝트 설명

내자부는 이력서를 손쉽게 작성하고 관리할 수 있는 웹 애플리케이션입니다. 맞춤법 검사 기능으로 보다 전문적인 이력서를 작성할 수 있도록 도와줍니다.

## ✨ 주요 기능

*   🔐 **사용자 인증**: 안전한 로그인 및 회원가입 시스템
*   📄 **이력서 관리**: 이력서 생성, 조회, 수정 및 삭제
*   🗑️ **휴지통**: 삭제된 이력서는 휴지통으로 이동되며, 복원하거나 영구적으로 삭제할 수 있습니다.
*   ✍️ **맞춤법 검사**: 이력서 내용의 맞춤법을 검사하고 수정합니다.
*   🖼️ **다양한 보기 모드**: 이력서를 목록, 그리드, 캘린더 등 다양한 형태로 볼 수 있습니다.

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

### 🏃‍♂️ 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 결과를 확인하세요.

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