# LLVM

## A Quick Introduction to Classical Compiler Design

* LLVM은 컴파일러의 기반 구조로 사용되고 있다.
* 전통적인 컴파일러는 프론트엔드, 옵티마이저, 백엔드 three-phase 일체형 구조로 설계된다.
  ![Three Major Components of a Three-Phase Compiler](https://aosabook.org/static/llvm/SimpleCompiler.png)
* 프론트엔드: 소스 코드 파싱, 에러 체크, AST 생성
* 옵티마이저: 불필요한 연산 제거 등 성능 개선을 위한 각종 변환
* 백엔드: target instruction set에 코드 매핑, 레지스터 할당, 명령 스케줄링
* 전통적인 설계의 문제는 하나의 컴파일러가 여러 아키텍처 또는 언어를 지원하지 못한다는 것이다.
* LLVM은 전통적인 설계의 문제를 해결한다.
  ![Retargetablity](https://aosabook.org/static/llvm/RetargetableCompiler.png)
* 위와 같이 retargetable하게 설계하면 기존 옵티마이저와 백엔드를 그대로 둔 채로 새로운 프론트엔드만을 추가해 새 언어를 지원할 수 있다.

## Existing Language Implementations

* 이러한 모델에 세 가지 주요 성공 스토리가 있다.
  1. 자바와 .NET 가상 머신 - JIT 컴파일로 제공, 런타임 지원, 잘 정의된 바이트코드.
  2. 소스를 C 코드로 변환하고, C 컴파일러로 컴파일하기 - 쉬운 이해와 구현, 하지만 열악한 환경과 각종 문제.
  3. GCC - 많은 프론트엔드, 백엔드 지원, 활동적인 커뮤니티, 오래된 역사.
* GCC가 라이브러리로서 재사용될 수 없는 이유가 많다.
  * 광범위한 전역 변수 사용, 불변에 대한 약한 강제, 잘못 설계된 자료 구조.
  * 가장 해결하기 어려운 문제: 초기 설계 문제와 시대에서 비롯된 고유한 구조적 문제.
  * 레이어링 문제와 추상화로 인한 고통: 백엔드가 프론트엔드 AST를 참조해 디버그 정보를 생성한다.

## 참고자료

* [Chris Lattner, "LLVM," in _The Architecture of Open Source Applications_, 2011.](https://aosabook.org/en/llvm.html)
