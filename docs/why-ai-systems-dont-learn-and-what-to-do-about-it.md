# Why AI systems don't learn and what to do about it: Lessons on autonomous learning from cognitive science

::: INFO
[Emmanuel Dupoux et al., 『Why AI systems don’t learn and what to do about it: Lessons on autonomous learning from cognitive science』, 2026.](https://arxiv.org/abs/2603.15381)
:::

> We critically examine the limitations of current AI models in achieving autonomous learning and propose a learning architecture inspired by human and animal cognition. The proposed framework integrates learning from observation (System A) and learning from active behavior (System B) while flexibly switching between these learning modes as a function of internally generated meta-control signals (System M). We discuss how this could be built by taking inspiration on how organisms adapt to real-world, dynamic environments across evolutionary and developmental timescales.

동물과 달리 현재 [[artificial-intelligence]] 시스템은 자율적으로 학습하지 않는다. 인공지능 시스템은 고정된 훈련 데이터 세트를 기반으로 특정 목표를 최적화하도록 만들어진다. 최신 인공지능 기술은 사전학습과 미세조정(fine-tuning) 두 단계를 거쳐 모델을 훈련한다. 여기에는 상당한 인간의 개입이 필요하다. 인공지능 시스템은 스스로 훈련 데이터를 선택하는 능동 학습 능력(active learning), 학습 모드를 유연하게 전환하는 능력(meta control), 그리고 자신의 수행 능력을 인지하는 능력(meta-cognition)이 부족하다. 반면 생물체는 에이전트가 환경에서 직접 이용 가능한 데이터를 통해 학습하고 적응할 수 있다.

기존의 인공지능 학습 접근법은 하위 분야별로 분절되어 있다. 저자들은 학습을 두 가지 모드로 분류한다.

시스템 A는 관찰 기반 학습이다. 이 시스템에서는 에이전트가 감각 입력을 수동적으로 축적하면서 통계적 모델을 구축한다. 자기지도학습(SSL)이 여기에 해당한다. 강점은 대규모 데이터에서 계층적 추상 표현을 학습할 수 있다는 점이고, 약점은 어떤 데이터가 유용한지 스스로 판단하지 못하며 상관관계와 인과관계를 구분하지 못한다는 점이다.

시스템 B는 행동 기반 학습이다. 이 이스템에서는 에이전트가 환경과 상호작용하면서 목표 달성을 위해 행동을 조정한다. 강화학습이 여기에 해당한다. 인지과학적으로는 아이의 보행 학습이 대표적이다. 처음에는 관찰이 아닌 시행착오를 통해 구르기, 기어가기, 서기, 걷기 단계를 거친다. 강점은 제어와 상호작용에 기반해 진정한 탐색이 가능하다는 점이고, 약점은 샘플 효율성이 극히 낮으며 잘 정의된 보상함수가 필요하다는 점이다.

## 관련문서

- [[welcome-to-the-era-of-experience]]
- [[a-brief-history-of-intelligence]]
- [[artificial-intelligence]]
