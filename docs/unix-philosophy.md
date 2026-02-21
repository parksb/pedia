# 유닉스 철학

> 1. Make each program do one thing well. To do a new job, build afresh rather than complicate old programs by adding new "features."
> 2. Expect the output of every program to become the input to another, as yet unknown, program. Don't clutter output with extraneous information. Avoid stringently columnar or binary input formats. Don't insist on interactive input.
> 3. Design and build software, even operating systems, to be tried early, ideally within weeks. Don't hesitate to throw away the clumsy parts and rebuild them.
> 4. Use tools in preference to unskilled help to lighten a programming task, even if you have to detour to build the tools and expect to throw some of them out after you've finished using them.


> 1. 각 프로그램이 한 가지 일을 잘 하도록 만들 것. 새로운 작업을 할 때에는 오래된 프로그램에 새로운 "기능"을 추가해 복잡하게 만들지 말고, 새로운 프로그램을 만들 것.
> 2. 모든 프로그램의 출력이 아직 알려지지 않은 다른 프로그램의 입력으로도 쓰일 수 있다고 고려할 것. 무관한 정보로 출력을 어지럽히지 말 것. 엄격하게 열을 맞춰야 하거나 바이너리 형태로 된 입력 포맷은 사용하지 말 것. 대화형 입력을 고집하지 말 것.
> 3. 소프트웨어를 설계하고 만들 때, 가까운 시간 안에 실행해 돌려볼 수 있도록 작업할 것. 몇 주 내에 첫 결과물이 나올 수 있도록 하는 것이 이상적이다. 만드는 것이 운영체제라 하더라도 똑같다. 어설픈 부분이 있으면 주저하지 말고 다시 만들 것.
> 4. 프로그래밍 작업을 줄이고자 할 때에는, 어설픈 수작업보다 도구를 사용하는 쪽을 선호할 것. 설령 도구를 빌드하기 위해 한참 돌아가야 하고 사용 후 바로 버린다 하더라도 도구를 써서 일을 끝낼 것.

켄 톰슨이 고안한 소프트웨어 개발에 대한 문화적 규범이자 철학적 접근법. [[unix]] 운영체제 개발을 리딩한 경험에 기반해 만들어졌다. 초기 [[unix]] 개발자들은 모듈성과 재사용성이라는 개념을 소프트웨어 공학에 실전적으로 적용했다. 시간이 지나면서 [[unix]]의 주요 개발자들과 [[unix]] 애플리케이션 개발자들은 소프트웨어 개발을 위한 일련의 문화적 규범을 확립했고, 이러한 규범은 [[unix]] 자체의 기술만큼 중요하고 영향력을 얻어 유닉스 철학으로 불리게 되었다.

## 모듈성

유닉스 철학을 관통하는 핵심은 모듈성이다. 특히 유닉스 철학의 두 번째 원칙은 [[unix]] 운영체제에서 파이프(`|`)로 구현되었다. 파이프는 한 프로그램의 출력이 다른 프로그램의 입력이 될 수 있도록 만든다. 이를 통해 만들 수 있는 명령어의 파이프라인은 모듈화된 시스템에서만 가능하다.

모바일 시스템에서도 이 원칙이 잘 지켜지면 좋았을텐데, 소위 슈퍼앱으로 불리는 애플리케이션들을 보면 모듈성과는 거리가 멀어진 것 같아서 아쉽다.

## 참고자료

- [이종립, "Unix philosophy".](https://johngrib.github.io/wiki/Unix-philosophy/)
- [박성환, "[번역] The Unix Philosophy: A Brief Introduction"](https://shoark7.github.io/programming/knowledge/unix-philosophy-intro)
