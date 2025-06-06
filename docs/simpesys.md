# 심페시스

> Simpesys: Simonpedia system

::: INFO
https://github.com/parksb/pedia
:::

심페시스(Simpesys)는 [[simonpedia]]의 빌드 도구이자, 그 도구의 문서 시스템 자체를 의미한다.

## 용어

### 문서

문서란, 개별 마크다운 파일을 의미한다. 내용을 구성하는 마크다운은 [GFM(GitHub Flavored Markdown)](https://github.github.com/gfm/)을 기반으로 확장된 문법을 사용한다.

- 파일명(Filename): 파일 시스템에서 문서의 실제 파일명. e.g., `document-a.md`
- 키(Key): 문서의 고유 식별자. 파일명에서 확장자를 제외한 부분. e.g., `document-a`
- 제목(Title): 문서의 제목. 내용에서 첫 번째로 나타나는 1레벨 헤더를 제목으로 간주한다. e.g., `# Document A`

### 내부링크

내부링크(Internal link)란, 심페시스 내에 있는 문서를 참조하는 링크를 말한다. 라벨링크(Labeled link)는 표시 텍스트를 직접 지정한 형태의 내부링크를 의미한다. 심페시스는 문서에 포함된 모든 내부링크를 자동으로 라벨링크로 변환하며, 이때 라벨은 해당 리크가 가리키는 문서의 제목으로 설졍된다.

### 외부링크

외부링크(External link)란, 심페시스 밖에 있는 웹 리소스를 참조하는 링크를 말한다. 텍스트 끝에 외부 페이지로 이동함을 암시하는 화살표 기호(↗)가 함께 표시된다.

### 블록

블록이란, 문서 내에서 본문과 분리된 영역을 나타내는 시각 요소를 의미한다. 심페시스는 다양한 형태의 블록을 지원하며, 각 블록의 용도는 [[simonpedia-rules]]에서 규정한다.

```
::: NOTE
NOTE 블록
:::
```

::: NOTE
NOTE 블록
:::

```
::: INFO
INFO 블록
:::
```

::: INFO
INFO 블록
:::

## 문서 시스템 구조

전체 문서 시스템은 트리 구조로 이루어져 있다. 심페시스는 '하위문서' 섹션에 속한 모든 내부링크를 해당 문서의 하위 노드로 간주한다.

문서 시스템의 구조는 트리이기 때문에 루트 문서([[simonpedia]])로부터 어떤 하위 문서에 도달하는 경로는 단 하나이다. 하지만 내부링크를 통해 문서 간의 참조 관계를 자유롭게 구축할 수 있기 때문에 문서의 관계가 하나의 엣지로 이어지는 것은 아니다. 즉, 문서의 위계 관계는 트리이지만, 문서의 참조 관계는 트리가 아니라 멀티엣지와 루프, 서킷이 모두 허용되는 그래프이다. 이러한 구조를 통해 심페시스는 전체적인 문서 시스템을 간소하게 유지하면서도 문서 간의 복잡한 참조 관계를 표현할 수 있다.

문서는 파일 시스템에서 평면적이다. 따라서 `document-A.md`와 그 하위 문서 `document-a.md`는 파일 시스템에서 같은 레벨에 있다. 평면적인 파일 시스템에 예외가 있다면 비공개 문서다. 모든 비공개 문서는 별도 저장소로 분리된 `private` 디렉토리 내에 위치한다. 일반 문서에서 비공개 문서를 내부링크를 통해 참조할 수는 있지만, 공개 사이트를 빌드할 때는 비공개 저장소를 복제하지 않기 때문에 링크가 [[http-404]] 페이지로 매핑된다.

## 빌드 및 배포

심페시스로 문서 시스템을 빌드하면 `simonpedia.md` 문서부터 모든 하위 문서를 BFS로 탐색해 색인한다. 심페시스는 [Hono](https://hono.dev/)와 [[htmx]]를 이용해 웹 사이트를 서빙한다. 사용자가 처음 사이트에 접속하면 `<html>`과 `<head>` 태그를 포함하는 완성된 HTML 문서를 제공한다. 이후 사용자가 문서를 탐색할 때는 문서의 본문에 해당하는 HTML만을 부분적으로 제공한다.

## 로드맵

- [x] [[htmx]] 전환
- [x] 사이드바 모바일 대응
- [x] 문서 검색 구현
- [x] 인용 문서 표시
- [x] 빌드 스크립트 파일 분리
- [x] 앵커 태그 중복 문제 개선
- [ ] 문서 그래프 시각화
- [ ] 노트 모아보기
  - 모든 문서의 노트 블록을 모아서 보여주는 단일 문서를 만든다.
  - 의미가 있을까? 가장 바람직한 방향은 모든 문서에 하나 이상의 노트를 작성하는 것.
- [ ] 최근 변경/추가된 문서
  - 루트 문서에 목록을 보여준다. `make commit`할 때 추적할 수 있음.

