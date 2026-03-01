# Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity

::: INFO
[Joel Becker et al., 『Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity』, 2025.](https://arxiv.org/abs/2507.09089)
:::

::: NOTE
이 연구는 실험에 Cursor Pro와 Claude 3.5/3.7 Sonnet을 사용했다. [Claude Code](https://claude.com/product/claude-code)와 Claude 4.6 등장 이후 2025년 초와 비교할 수 없을 정도로 모델 성능이 개선되었고, 개발자들의 AI 도구 숙련도도 높아졌으며, 멀티 에이전트 환경도 일반화되었기 때문에 후속 연구를 주목해야 할 것 같다. 이 연구는 여러 에이전트를 이용해 태스크를 병렬로 작업하는 상황을 고려하지 않았다. 

[METR가 2025년 하반기에 새로운 실험을 시작](https://metr.org/blog/2026-02-24-uplift-update/)했다. AI 도구를 활용했을 때 태스크 처리 속도가 증가했을 가능성이 높다고 판단했는데, 데이터가 편향되어 있어서 근거는 미약하다고 한다.
:::

평균 5년 이상의 프로젝트 경험을 가진 숙련된 개발자 16명을 대상으로 자신이 기여하는 실제 오픈소스 프로젝트의 246개 이슈를 수집했다. 각 태스크는 무작위로 [[artificial-intelligence]]{AI} 사용을 허용/금지하는 조건이 배정됐다. 개발자 본인은 AI를 사용하면 태스크 처리 시간이 24% 단축될 것이라고 예측했고, 태스크 완료 후에는 20% 단축되었다고 추정했다. 

그러나 실제로 [[artificial-intelligence]]{AI} 도구를 허용했을 때 태스크 처리 시간이 오히려 19% 증가했다. 이 결과를 설명할 수 있는 가설적 요인을 몇 개의 범주로 나눴다.

- AI 효과에 대한 과도한 낙관: 개발자들이 AI가 도움이 된다고 믿어서 역효과가 나도 계속 사용한다. AI를 허용했을 때 AI를 사용하지 않은 경우는 16.4%였다. 여기에는 개발자가 AI를 쓰는 경험 자체가 더 즐겁거나, 미래에 더 강력해질 모델을 위한 스킬 투자로 보는 관점이 작동했을 수 있다.
- 저장소에 대한 높은 숙력도: 태스크 친숙도가 낮을수록 AI의 효과가 좋고, 친숙도가 높을수록 더 느려졌다.
- 저장소의 규모와 복잡성: 110만 줄, 10년된 코드베이스에서 LLM은 엉뚱한 파일을 수정하거나, 파일이 너무 커서 편집을 제대로 적용하지 못하는 문제가 반복 발생했다.
- AI 생성 코드의 낮은 신뢰성: 개발자들이 AI 생성 코드를 수략한 비율은 44% 미만이었다. 100% 개발자가 생성된 코드를 수정했고, 56%가 대규모 수정이 필요했다고 답했다. AI 출력 검토에는 전체 시간의 9%를 소비했다.
- 암묵적인 컨텍스트: 개발자들이 쌓아온 암묵지를 AI가 알 수 없어서 엉뚱한 코드를 생성했다.

AI 허용 시에는 개발자가 직접 코딩하고, 정보를 검색하는 시간이 감소했다. AI의 응답을 기다리는 시간은 전체의 4%, AI 출력을 검토하고 정리하는 시간은 9%를 차지했다.

실험 결과를 오해해서는 안 된다. 75% 개발자는 느려졌지만, 25%는 빨라졌다. 개발자들이 처리 시간이 크게 단축될 것이라고 예측한 태스크들에은 실제로도 처리 속도 저하가 적었다. 이 연구의 시사점은 기존 AI 생산성 연구가 과도하게 낙관적으로 편향되었음을 보여주는 것이다.

## 관련문서

- [[your-brain-on-chatgpt-accumulation-of-cognitive-debt-when-using-an-ai-assistant-for-essay-writing-task]]

## 참고자료

- [Joel Becker et al., 『Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity』, METR, 2025.](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)
- [Joel Becker et al., 『We are Changing our Developer Productivity Experiment Design』, METR, 2026.](https://metr.org/blog/2026-02-24-uplift-update/)
