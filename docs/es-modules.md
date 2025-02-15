# ECMAScript 모듈

ECMAScript 모듈(ESM)은 자바스크립트의 표준 모듈 시스템이다.

## 동작

ESM의 모듈 로드 과정은 세 단계로 나뉜다.

![](images/a8b8c75c-5133-46ed-bf9a-7abe68ddafef.webp)

## ESM-only

자바스크립트 생태계가 이제는 ESM만을 지원해야 한다는 담론이다. 자바스크립트 생태계는 CJS와 ESM의 병용으로 인해 너무나 오래 고통받아왔다. 이제는 ESM으로 모듈 시스템을 통합함으로써 그 고통을 끝낼 수 있다. ESM은 모듈을 비동기적으로 로드하기 때문에 CJS에 비해 성능상 이점이 있으며, top-level await을 지원한다. 또한 정적 분석이 가능하기 때문에 번들러가 불필요한 코드를 제거하는 트리 셰이킹(tree shaking)이 가능하다.

이 담론은 CJS와 ESM을 함께 지원하는 듀얼 패키지(dual package) 역시 반대한다. CJS와 ESM은 근본적으로 다른 모듈 시스템이고, 설계 철학도 다르다. CJS는 단일한 `module.exports` 객체를 사용하는 반면, ESM은 `default`와 named export를 모두 지원한다. ESM 문법으로 코드를 작성한 뒤 CJS로 트랜스파일하면 내보내는 값이 함수나 클래스일 경우 이런 차이를 신경써야 한다. 또한 타입 정보를 올바르게 유지하려면 `.d.mts`와 같은 추가적인 선언 파일을 작성해야 한다. 하나의 패키지에 CJS와 ESM이 함께 있으면 종속성 탐색도 어려워진다. 만약 패키지가 또 다른 ESM-only 의존성을 갖는다면, 사용자가 CJS를 사용하는 경우 문제가 발생할 수 있기 때문이다. 뿐만 아니라, CJS와 ESM 번들을 함께 제공해야 하므로 패키지의 크기를 두 배로 늘린다. 

ESM-only를 어렵게 만든 가장 큰 원인은 Node.js가 CJS를 기본으로 채택했기 때문이고, 이로 인해 많은 자바스크립트 애플리케이션과 패키지가 CJS로 작성되었기 때문이다. 특히 ESM에서는 `import 'cjs'`와 같이 CJS 모듈을 불러올 수 있지만, CJS에서는 `require('esm')`이 불가능했다. 이를 활성화 하려면 `--experimental-require-module` 플래그를 설정해야 했는데, [Node.js 22.12](https://nodejs.org/en/blog/release/v22.12.0)부터 이 플래그가 기본으로 활성화되었다. 

## 참고자료

- ["JavaScript modules", MDN Web Docs](https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide/Modules)
- [Anthony Fu, "Move on to ESM-only", 2025](https://antfu.me/posts/move-on-to-esm-only)
- [Sindre Sorhus, "Pure ESM package", 2025](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c)
- [Lin Clark, "ES modules: A cartoon deep-dive", 2018](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/)

## 관련문서

- [[typescript]]
