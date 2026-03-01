# The Way We Notice, That’s What Really Matters: Instantiating UI Components with Distinguishing Variations

::: INFO
[Priyan Vaithilingam et al., The Way We Notice, That's What Really Matters: Instantiating UI Components with Distinguishing Variations, 2026.](https://arxiv.org/abs/2602.22436)
:::

프론트엔드 개발자는 재사용 가능한 UI 컴포넌트를 만들기 위해 다양한 시각적/동작적 속성(prop)을 매개변수화한다. 이러한 유연성은 장점이지만, 개발자가 컴포넌트를 실제로 인스턴스화할 때는 수많은 속성 값과 그 상호작용을 파악해야 한다. [Storybook](https://storybook.js.org/) 등의 도구를 사용하는 경우 개발자가 직접 컴포넌트의 변형을 작성해야해서 실제 구현과 괴리가 발생하고, "Lorem Ipsum" 같은 비현실적인 데이터로 채워지곤해 실제 사용 맥락을 평가하기도 어렵다. 이 연구는 차별화된 변형(distinguished variations) 개념을 제안한다.

UI 컴포넌트의 변형(variations)을 탐색할 때, 단순히 변형의 수가 많다고 좋은 것은 아니다. 문제는 변형의 차이점이 눈에 띄지 않고, 비현실적이라는 점이다. 디자인 공간을 효과적으로 이해하려면 차별화되는 변형을 찾아야 한다. 가령 알림 센터 화면을 개발하는 경우, 개발자가 보는 모든 변형이 단순히 알림 제목과 메시지만 다르다면 컴포넌트는 기술적으로는 다양해 보일지 몰라도 기능적으로는 중복된다. 또한 한 변형에 대해 특정 기능을 활성화했을 때 모든 알림 메시지에 "Lorem Ipsum"이라는 텍스트가 표시된다면 이는 구별은 할 수 있지만 유용하지는 않다. 따라서 유용한 변형은 다음 조건을 동시에 만족해야 한다.

- 유용한 변형은 모방적(mimetic)이어야 한다. 각 변형은 실제 사용 환경에서 사용될 법한 현실적이고 자연스러운 값으로 채워져야 한다.
- 유용한 변형은 구분(distinct)할 수 있어야 한다. 각 변형은 디자인 공간의 실질적으로 다른 측면을 보여줘야 한다. (e.g., 레이아웃, 테마, 정렬 등)

컴포넌트가 만들 수 있는 모든 속성의 조합으로 형성되는 거대한 디자인 공간에서, 모방적이면서도 구별적인 샘플을 효율적으로 추출할 수 있어야 유용한 변형을 만들 수 있다. 이 연구에서는 Storybook 애드온으로 구현한 Celestial이라는 도구를 통해 차별화된 변형에 대한 구체적인 접근법을 보여준다. Celestial은 차별화된 UI 컴포넌트 변형을 자동으로 생성하고, 개발자가 익숙한 Storybook 환경에서 변형을 쉽게 탐색할 수 있도록 지원한다. 

::: NOTE
컴포넌트의 유용한 변형을 거대한 디자인 공간에서 차별화할 수 있는 것들을 샘플링하는 방식으로 프레이밍한 점이 신선하다.
:::

Celestial은 TSX/JSX 코드를 [[abstract-syntax-tree]]{AST}로 파싱하고, 시각적 영향도(visual impact score)를 계산한다. 이 과정을 통해 식별된 속성 집합을 LLM에게 전달해 값을 생성한다. LLM이 생성하는 값은 모방적이고, 구분 할 수 있으며, 디자인 공간을 폭넓게 커버할 수 있어야 한다. 이어서 LLM이 생성한 값으로 만들어진 변형들을 대상으로, 변형들이 디자인 공간을 얼마나 커버하고 있는지 평가한다. 이 커버리지 메트릭은 다시 LLM에게 전달해 디자인 공간의 더 넓은 영역을 커버하도록 추가 변형을 생성한다.

## 관련문서

- [[human-computer-interaction]]
- [[frontend-platform-engineering]]
