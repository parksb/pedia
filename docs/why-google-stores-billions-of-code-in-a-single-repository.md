# Why Google Stores Billions of Lines of Code in a Single Repository

::: INFO
[Rachel Potvin et al., "Why Google Stores Billions of Lines of Code in a Single Repository", 2016](https://dl.acm.org/doi/10.1145/2854146)
:::

- 구글은 20억 줄의 코드와 9백만 개의 소스 파일을 하나의 저장소에서 관리하고 있음. 이 저장소에는 매일 4만개의 커밋이 올라오고, 지금까지 35백만 개의 커밋이 쌓였음. 저장소 크기는 86TB에 달함.
- [[monorepo]]의 이점에 대해 이야기해보자:
  - 코드 공유와 재사용이 쉽다.
  - 의존성 관리를 단순화할 수 있다.
  - 코드 가시성이 확보되어 협업에 효율적이다:.
  - 자동화 툴을 이용한 대규모 리팩토링이 가능하다.
- 하지만 단점과 트레이드 오프도 있다:
  - 개발과 실행 양쪽에 툴링을 위한 투자가 필요하다.
  - 불필요한 의존성, 코드 검색을 비롯한 코드베이스의 복잡성이 높아진다.
  - 코드 건정성을 유지하기 위한 노력이 필요하다.
- 구글은 [[monorepo]]의 단점보다 장점에서 얻는 것이 많다고 판단했다.
- 구글은 어떻게 해결했나?
  - 구글 거대한 코드베이스를 관리하기 위한 자체적인 시스템 Piper를 만들었음.
    - Piper의 워크플로우는 다음과 같다:
      - 사용자 워크스페이스를 저장소와 동기화한다 → 코드 작성 → 코드 리뷰 → 커밋
      - 개발자는 일단 저장소의 로컬 카피를 만든다. 이는 Git의 로컬 클론과 비슷하다. Piper 저장소가 업데이트되면 개발자는 자신의 로컬 워크스페이스에 변경사항을 pull할 수 있고, 필요에 따라 작업을 merge할 수도 있다. 또한 워크스페이스의 스냅샷을 다른 개발자와 공유하기 위해 중앙 저장소에 커밋하면 코드리뷰 과정을 거치게 된다. 이 부분은 뒤에 설명하겠다.
      - 대부분의 개발자는 Piper에 CitC(Clients in the Cloud)로 접근한다. 이는 클라우드 기반 스토리지 백엔드와 리눅스 전용 FUSE 파일 시스템으로 구성되어 있다. 개발자들은 자신의 워크스페이스를 파일시스템에 속한 디렉토리로 보게된다. CitC는 수정된 파일만 로컬에 다운로드하는 프록시이기 때문에 로컬 환경에 저장소 전체를 클론하거나 동기화하지 않고도 코드를 찾을 수 있게 해준다.
  - 다양한 IDE를 위한 자체적인 플러그인을 개발해서 DX를 향상한다.
  - 자동화 도구도 적극적으로 사용한다. Rosie, Tricorder, CodeSearch 등.
  - 코드 복잡성 관리는?
    - Clipper 같은 도구로 종속성 그래프를 분석해 불필요한 의존성이나 필요 이상으로 큰 라이브러리를 정리한다.
    - Rosie를 이용해 더 이상 사용되지 않는 코드를 제거하고, 이전 코드와 호환 가능한 리팩토링을 수행할 수 있다.
  - 모든 코드 변경 사항은 Critique라는 자체적인 코드 리뷰 툴을 사용한다.
