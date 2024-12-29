# Simonpedia 시스템

> https://github.com/parksb/pedia

## 프로젝트 구조

- `docs/` - 마크다운 문서와 이미지 파일을 담는 디렉토리.
  - `simonpedia.md` - 루트 문서.
  - `images/` - 이미지 파일을 담는 디렉토리
    - `convert.sh` - 이미지를 압축, `.webp`로 변환하는 스크립트.
  - `private/` - 비공개 문서를 담는 디렉토리. 별도 저장소로 분리되어 있으며, 공개 사이트에서 이 디렉토리 하위에 있는 문서를 참조하는 경우 [[http-404]] 문서로 연결된다.
- `scripts/` - 빌드 시스템을 담는 디렉토리.
  - `index.ts` - 문서 탐색, 마크다운 문서의 HTML 변환 등을 수행하는 [[typescript]] 코드.
  - `build.sh` - `index.ts`를 이용해 사이트를 빌드하고, 결과물을 루트의 `build` 디렉토리에 생성하는 스크립트.
  - `templates/` - EJS 템플릿을 담는 디렉토리.
    - `app.ejs` - 컨테이너 템플릿.

## 로드맵

- [x] [[htmx]] 전환
- [ ] 문서 검색 구현
- [ ] 문서 그래프 시각화
