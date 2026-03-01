# Towards a Science of AI Agent Reliability

::: INFO
[Stephan Rabanser et al., 『Towards a Science of AI Agent Reliability』, 2026.](https://arxiv.org/abs/2602.16666)
:::

[[artificial-intelligence]] 에이전트의 신뢰성 측정 방법을 제안하는 연구. 기존 에이전트 벤치마크가 평균 성공률에만 치중했기 때문에 평가 결과가 좋아도 실제 환경에서는 자주 실패함을 지적한다. 에이전트가 얼마나 일관되게 동작하는지, 환경 변화에 얼마나 버티는지, 실패를 예측할 수 있는지, 오류가 얼마나 심각한지 알기 위해서는 정확성이 아닌 신뢰성을 평가해야 한다는 것이다.

## 방법론

안전공학 분야의 원칙으로부터 차용한 프레임워크를 바탕으로 에이전트의 신뢰성을 평가할 수 있다. 안정공학 분야는 이미 수십 년 전에 평균 성능이 신뢰성과는 다르다는 결론을 얻었다. 이 연구는 4개의 차원에서 12개의 지표를 제시한다. 중요한 점은 12개 지표가 모두 정확도와는 독립적이라는 점이다. 에이전트의 정확도가 올라간다고 신뢰도가 올라가지는 않는다.

신뢰성 $\mathcal R$은 일관성, 예측가능성, 견고성의 산술 평균이다.

$$
\mathcal R = {1 \over 3}(\mathcal R_\text{Con} + \mathcal R_\text{Pred} + \mathcal R_\text{Rob})
$$

### 일관성(consistency)

일관성은 동일한 작업을 여러 번 독립적으로 실행했을 때 에이전트의 행동이 얼마나 반복 가능한지 평가하는 차원이다.

$$
\mathcal R_\text{Con} = {1 \over 3}C_\text{out} + {1 \over 3} \cdot {{C_\text{traj}}_d + {C_\text{traj}}_s \over 2} + {1 \over 3}C_\text{res}
$$

- 결과 일관성(outcome consistency, $C_\text{out}$): 에이전트가 반복 실행에서 각 작업에 대해 얼마나 성공하거나 실패하는지 측정한다.
- 궤적 분포 일관성(trajectory distribution consistency, ${C_\text{traj}}_d$): 성공적인 실행 간 행동 분포의 유사성을 측정한다. 실패 경로는 서로 관련 없는 원인으로 다양할 수 있으므로 성공한 실행만 비교한다.
- 궤적 순서 일관성(trajectory sequence consistency, ${C_\text{traj}}_s$): 정규화된 레벤슈타인 거리를 사용해 성공적인 실행 간 동작 순서의 유사성을 측정한다.
- 자신감 일관성(confidence consistency, $C_\text{conf}$): 동일한 작업을 여러 번 수행했을 때 에이전트가 스스로 보고한 자신감이 얼마나 안정적인지 측정한다. $\mathcal R_\text{Con}$ 집계에는 포함하지 않는다.
- 리소스 일관성(resource consistency, $C_\text{res}$): 실행 간 리소스 소비의 안정성을 측정한다. 비용, 시간, API 호출, 행동 수, 에러, 호출당 지연시간에 대한 변동 계수를 계산한다.

### 예측가능성(predictability)

예측가능성은 에이전트가 스스로 보고한 자신감 점수가 실제 결과를 얼마나 잘 예측하는지 평가하는 차원이다.

$$
\mathcal R_\text{Pred} = P_\text{brier} 
$$

- 위험 보장 점수(risk-coverage score): 선택적 예측을 기반으로, 작업을 자신감의 내림차순으로 정렬하고, 각 커버리지 수준에서 에러율을 측정한다.
- 보정 점수(calibration score): 예측한 자신감이 관찰된 정확도와 일치하는지 여부를 ECE(Expected Calibration Error)를 사용해 측정한다.
- 변별 점수(discrimination score): 에이전트가 성공적으로 완료한 작업에 대해 잘못 완료한 작업보다 더 높은 자신감을 부여하는지 측정한다.
- 브라이어 점수(brier score, $P_\text{brier}$): 교정 및 판별 능력을 고려하는 채점 규칙이다. 판별력을 갖춘 완벽하게 보정된 에이전트의 수치는 1이다.

### 견고성(rubustness)

견고성은 교란 상황에서 성능 저하를 평가하는 차원이다.

$$
\mathcal R_\text{Rob} = {1 \over 3}(R_\text{fault} + R_\text{struct} + R_\text{prompt})
$$

- 오류 견고성(fault robustness, $R_\text{fault}$): 주입된 도구나 API의 오류에 대한 복원력을 측정한다.
- 구조적 견고성(structural robustness, $R_\text{struct}$): 입력 형식이나 구조 변화에 대한 복원력을 측정한다.
- 프롬프트 견고성(prompt robustness, $R_\text{prompt}$): 지시사항의 표현 방식이나 변경 사항에 대한 복원력을 측정한다.

### 안전성(safety)

안전성은 에이전트가 실행 중 행동 제약 조건을 위반하는지 평가하는 차원이다. 안전성은 작업 수행의 신뢰성이 아닌 제약 위반을 측정하므로 전체 신뢰성 집계에는 포함하지 않는다. 기본 제약 조건은 다음과 같다: (1) 개인 식별 정보 유출 금지, (2) 파괴적인 행위 금지, (3) API 사용 제한 준수, (4) 데이터 접근 최소화.

실험은 14개 모델의 지난 18개월 동안 릴리스된 각 버전에 대해, GAIA(General AI Assistants)[^gaia]와 $\tau$-bench[^taubench] 태스크를 수행했다. GAIA는 다단계 추론, 도구 사종, 웹 브라우징, 파일 조작 등 다양한 행위를 요구하는 문제 해결 작업에서 에이전트의 성능을 평가하기 위해 설계된 벤치마크다. $\tau$-bench는 항공사 도메인을 배경으로 한 실제 고객 서비스 시나리오에서 대화형 에이전트의 성능을 평가하기 위한 벤치마크다. 

## 결과

에이전트가 잘 해결할 수 있는 태스크도 반복 실행하면 자주 실패하며 일관성이 깨지는 모습을 관찰했다. 에이전트의 일관성 점수는 30~75% 수준으로 전반적으로 낮았다. 견고성의 경우, 기술적인 교란에는 대부분의 모델이 잘 대처했다. 그러나 의미가 동일한 프롬프트를 다르게 표현했을 때 성능이 크게 떨어졌다. 실제 교란 상황보다는 표면적인 언어 변형에 더 취약한 모습을 보였다. 예측가능성은 4개 차원 중 가장 취약했다. 에이전트가 보고하는 자신감 수치는 실제 정확도와 일치하지 않았다. GAIA 벤치마크에서 대부분의 모델은 자신의 맞는 예측과 틀린 예측을 구분하는 능력이 랜덤과 다를 바 없는 수준이었다. 안전성은 최신 모델들의 경우 위반 빈도가 낮았지만, 금전적 오류가 흔한 실패 유형으로 관찰되었다.

또한 더 큰 모델이 더 신뢰할 수 있는 것도 아니었다. 스케일업은 일관성을 떨어뜨렸다. 행동 레퍼토리가 넓어질수록 다른 방식으로 문제를 풀 수 있기 때문에 변동성이 커지는 것으로 보인다.

지난 18개월 동안 모델의 정확도는 뚜렷하게 향상됐지만, 신뢰도 지표는 거의 개선되지 않았다. 저자들은 에이전트의 능력-신뢰성 격차가 AI 에이전트의 경제적 영향이 기대만큼 빠르게 나타나지 않는 주요 원인 중 하나일 수 있다고 주장한다. 가장 시급한 개선이 필요한 차원은 일관성과 예측가능성이다.

## 관련문서

- [[measuring-the-impact-of-early-2025-ai-on-experienced-open-source-developer-productivity]]

## 참고자료

- [AI Agent Reliability Tracker](https://hal.cs.princeton.edu/reliability/)

[^gaia]: [Grégoire Mialon et al., 『GAIA: a benchmark for General AI Assistants』, 2023.](https://arxiv.org/abs/2311.12983)
[^taubench]: [Shunyu Yao et al., 『$\tau$-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains』, 2024.](https://arxiv.org/abs/2406.12045)
