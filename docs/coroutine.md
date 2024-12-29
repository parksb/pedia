# 코루틴

* 스레드와 비슷하지만, 프로그래밍 모델의 변경이 필요없는 동시성 프로그래밍 모델.
* 저수준 디테일을 고도로 추상화하고 있어 애플리케이션 레벨에서 사용하기 쉽다.
* 동시성 프로그래밍(다카노 유키, 2022)에서는 중단과 재개가 가능한 함수를 총칭하는 단어로 사용한다:
  * 대칭 코루틴: 제어권을 부여할 함수를 명시적으로 지정함.
    ```
    coroutine A {
      print "Hello"
      yield to B
      print "World"
      yield to B
    }

    coroutine B {
      print "Foo"
      yield to A
      print "Bar"
    }

    yield to A
    ```
    ```
    Hello
    Foo
    World
    Bar
    ```
    * 일반적인 함수 호출은 caller와 callee가 명확하지만, 대칭 코루틴에서는 서로 동등한 대칭 관계가 된다.
  * 비대칭 코루틴: 함수의 중단 지점에서 제어권을 부여했던 지점으로 되돌아감.
    ```python
    def hello():
      print('Hello ', end='')
      yield
      print('World')
      yield

    h = hello() # 'Hello'
    h.__next__() # 'World'
    h.__next__()
    ```
    * 파이썬에서는 비대칭 코루틴을 제너레이터라고 부른다.

## 참고자료

* [[kotlin-coroutine]]
