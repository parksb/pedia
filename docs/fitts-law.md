# 피츠의 법칙

피츠의 법칙(Fitts' Law)은 시작 지점부터 목표 지점까지의 거리와 크기가 상호작용 시간에 영향을 미친다는 법칙으로, 1954년 폴 모리스 피츠(Paul Morris Fitts)가 제시했다. 심리학자이자 공군 장교였던 피츠는 항공기 손실의 원인이 조종사와 제어 장치의 상호작용에 대한 고려가 부족했기 때문이라고 생각했다. 오늘날 피츠의 법칙은 [[human-computer-interaction]] 및 인간공학 분야에서 인간 움직임의 예측 모델로서 주로 활용된다.

피츠의 법칙에서 움직임은 두 단계로 나뉜다.

- 초기 움직임: 목표물을 향한 빠르지만 부정확한 움직임.
- 마지막 움직임: 목표를 달성하기 위해 느리지만 정확한 움직임.

작업 시간은 난이도에 비례해 선형적으로 증가한다. 목표물에서 멀수록, 목표물이 작을수록 상호작용에 더 오랜 시간이 걸린다. 다만 서로 다른 작업의 난이도가 같을 수 있으므로, 목표물의 크기보다는 거리가 전체 작업 완료 시간에 더 큰 영향을 미친다.

목표물 중심까지의 거리 $D$와 목표물의 허용 오차 혹은 너비 $W$를 통해 난이도 지수(index of difficulty) $\text{ID}$를 구하는 공식은 다음과 같다.

$$
\text{ID} = \log_2{2D \over W}
$$

[[human-computer-interaction]] 분야에서 자주 사용되는 난이도 지수 공식은 스콧 맥켄지(Scott MacKenzie)가 제시한 섀넌 공식이다.

$$
\text{ID} = \log_2{({D \over W} + 1)}
$$

피츠의 법칙을 인간-컴퓨터 인터페이스에 처음 적용한 것은 스튜어트 카드(Stuart K. Card), 윌리엄 잉글리시(William K. English), 베티 버(Betty Burr)였다. 이들은 다양한 입력 장치의 성능을 비교했고, 마우스가 조이스틱이나 방향키보다 우수하다는 결론을 얻었다. 이 초기 연구는 향후 제록스가 마우스를 상업적으로 출시하게 된 주요 요인이 되었다.

## 관련문서

- [[graphic-design]]

## 참고자료

- [이재용, "피츠의 법칙 Fitts' Law", pxd, 2012](https://story.pxd.co.kr/578)
- [Stuart K. Card, William K. English, Betty Burr, "Evaluation of Mouse, Rate-Controlled Isometric Joystick, Step Keys, and Text Keys for Text Selection on a CRT", 1977](https://bitsavers.trailing-edge.com/pdf/xerox/parc/techReports/SSL-77-1_Evaluation_of_Mouse_Rate-Controlled_Isometric_Joystick_Step_Keys_and_Text_Keys_for_Text_Selection_on_a_CRT.pdf)
- [Steven Hoober, "Fitts’ Law In The Touch Era", 2022](https://www.smashingmagazine.com/2022/02/fitts-law-touch-era/)
