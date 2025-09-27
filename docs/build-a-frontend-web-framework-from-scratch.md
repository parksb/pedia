# Build a Frontend Web Framework

::: INFO
Angel Sola, "Build a Frontend Web Framework (From Scratch)", _Manning_, 2024.
:::

[[react]]와 같은 웹 프론트엔드 프레임워크를 직접 만들면서 프레임워크의 내부 동작 방식을 소개하는 책.

## Rendering And The Virtual DOM

애플리케이션의 비즈니스 로직을 다루는 코드와 DOM 조작 코드를 혼합하면 코드베이스를 다루기 어려워 진다. 개발자 입장에서 DOM 조작 로직은 애플리케이션의 로직과 전혀 상관이 없다. 좋은 프레임워크는 개발자가 애플리케이션 로직에만 집중할 수 있게 해준다.

과거의 웹 애플리케이션은 애플리케이션 코드 한 곳에서 비즈니스 로직과 DOM을 모두 다뤘다. DOM 조작을 프레임워크로 분리하면 개발자는 애플리케이션의 비즈니스 로직에만 집중할 수 있다. 이를 통해 (1) 개발자가 작성하는 코드의 양을 줄여 출시 속도를 높이고, (2) 코드의 유지보수성을 높이고, (3) DOM에 대해 잘 이해하고 있는 프레임워크 개발자가 성능을 최적화할 수 있다.

가상 DOM(Virtual DOM, vdom)은 메모리 내에 실제 DOM 구조를 반영하는 자바스크립트 트리이다. 이 트리의 각 노드를 가상 노드(Virtual node)라고 하며, 전체 구조가 가상 DOM이다. 실제 DOM에 비해 가상 DOM은 뷰를 렌더링하는 데 필요한 정보만 포함하고 있어 생성 및 조작 비용이 저렴하다.

가상 DOM이 표현해야 하는 노드에는 세 가지 유형이 있다.

- 텍스트 노드(Text node): 텍스트 콘텐츠를 나타낸다.
- 요소 노드(Element node): 일반적인 HTLM 요소를 나타낸다. `<div>`, `<p>` 등이 있다.
- 프래그먼트 노드(Fragment node): DOM에 연결되기 전까지 부모 노드가 없는 노드의 집합을 나타낸다.

요소 노드를 생성하는 `h(tag, props, children)` 함수를 정의해보자. `h`라는 이름은 하이퍼텍스트를 생성하는 스크립트인 하이퍼스크립트(Hyperscript)에서 따온 것이다. [[react]]는 `React.createElement()` 함수를 사용해 가상 노드를 생성한다. 사용자는 일반적으로는 JSX를 사용하는데, JSX로 작성한 각 HTML 요소는 `React.createElement()` 함수 호출로 변환된다. Vue는 `h()`, Mithril은 `m()` 함수로 가상 노드를 생성한다.



