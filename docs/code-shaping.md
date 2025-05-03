# Code Shaping: Iterative Code Editing with Free-form AI-Interpreted Sketching

::: INFO
[Ryan Yen, Jian Zhao, and Daniel Vogel. 2025. Code Shaping: Iterative Code Editing with Free-form AI-Interpreted Sketching. In Proceedings of the 2025 CHI Conference on Human Factors in Computing Systems (CHI '25). Association for Computing Machinery, New York, NY, USA, Article 872, 1–17.](https://programs.sigchi.org/chi/2025/program/content/189580)
:::

> We introduce the concept of code shaping, an interaction paradigm for editing code using free-form sketch annotations directly on top of the code and console output. To evaluate this concept, we conducted a three-stage design study with 18 different programmers to investigate how sketches can communicate intended code edits to an AI model for interpretation and execution. The results show how different sketches are used, the strategies programmers employ during iterative interactions with AI interpretations, and interaction design principles that support the reconciliation between the code editor and sketches. Finally, we demonstrate the practical application of the code shaping concept with two use case scenarios, illustrating design implications from the study.

많은 프로그래머가 아이디어를 시각화하기 위해 화이트보드나 종이에 손으로 필기를 한다. 기존에도 AI가 사용자의 필기를 기반으로 코드를 작성해주는 연구는 있었지만, 필기와 코드가 분리되어 있다는 한계를 벗어나지 못했다. Code Shaping은 단순히 스케치를 코드로 변환하는 툴이 아니라, 필기와 코드 편집이라는 두 워크플로우를 통합하는 툴. 사용자가 코드 위에 자유롭게 필기함으로써 코드를 편집할 수 있다. 코드를 한줄씩 작성하는 것이 아니라, 2차원 평면을 탐색하며 코드를 편집하기 때문에 피험자들이 선형적으로 인식했던 코드 작성을 공간적으로 감각하게 되었다.
