# 에이전트 클라이언트 프로토콜

::: INFO
https://agentclientprotocol.com/overview/introduction
:::

에이전트 클라이언트 프로토콜(Agent Client Protocol, ACP)은 [[artificial-intelligence]]{AI} 에이전트와 코드 편집기(IDE, 텍스트 에디터 등) 간의 통신을 표준화하기 위한 프로토콜이다. [[zed-editor]] 에디터를 개발하는 Zed Industries에서 설계했다.

코딩 에이전트와 편집기는 긴밀하게 결합되어 있지만, 상호운용성은 부족하다. 편집기는 지원하고자 하는 모든 에이전트에 대한 맞춤형 통합을 구축해야 하고, 에이전트는 편집기마다 API를 구현해야 한다. ACP는 이러한 문제를 해결하기 위해 제안되었다. ACP를 구현하는 에이전트는 ACP를 지원하는 모든 편집기와 호환된다.
