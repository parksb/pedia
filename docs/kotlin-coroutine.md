# 코루틴 (Kotlin)

## Exceptions handling

### Exception propagation

* 코루틴 빌더는 예외를 처리하는 방식에 따라 두 종류로 나눌 수 있다.
* 예외를 자동으로 전파하는 빌더: `launch`, `actor`
  ```kotlin
  val job = GlobalScope.launch {
    println("Throwing exception from launch")
    throw IndexOutOfBoundsException() // 여기서 예외가 발생
                                      // Thread.defaultUncaughtExceptionHandler에 의해 에러가 출력됨
  }

  try {
    job.join()
    println("Reached")
  } catch (e: IndexOutOfBoundsException) {
    println("Caught IndexOutOfBoundsException") // 예외가 캐치되지 않음
  }
  ```
  ```kotlin
  val job = GlobalScope.launch {
    try {
      println("Throwing exception from launch")
      throw IndexOutOfBoundsException() // 여기서 예외가 발생
    } catch (e: IndexOutOfBoundsException) {
      println("Caught IndexOutOfBoundsException") // 예외가 캐치됨
    }
  }
  ```
* 사용자가 예외를 처리하도록 노출하는 빌더: `async`, `produce`
  ```kotlin
  val deferred = GlobalScope.async {
    println("Throwing exception from async")
    throw ArithmeticException()
  }

  try {
    deferred.await() // 여기서 예외가 발생
    println("Unreached")
  } catch (e: ArithmeticException) {
    println("Caught ArithmeticException") // 예외가 캐치됨
  }
  ```
  ```kotlin
  val deferred = GlobalScope.async {
    try {
      println("Throwing exception from async")
      throw ArithmeticException() // 여기서 예외가 발생
    } catch (e: ArithmeticException) {
      println("Caught ArithmeticException") // 예외가 캐치됨
    }
  }
  ```

### CoroutineExceptionHandler

* 코루틴에서 캐치되지 않는 예외가 발생하면 CoroutineExceptionHandler가 예외를 다룬다.
* 핸들러의 동작을 커스텀할 수도 있다:
  ```kotlin
  val handler = CoroutineExceptionHandler { _, exception ->
    println("CoroutineExceptionHandler got $exception") // 단순히 에러 메시지를 출력하는 커스텀 핸들러
  }

  val job = GlobalScope.launch(handler) { // 커스텀 핸들러를 전달해 코루틴을 만든다
    throw AssertionError()
  }

  job.join()
  ```

### Cancellation

* 코루틴은 동작의 중단을 위해 내부적으로 CancellationException을 사용한다.
* CancellationException은 모든 핸들러가 무시하도록 되어있다.
* 다른 예외와 다르게 CancellationException은 부모 코루틴까지 중단시키지 않는다.
  ```kotlin
  val job = launch {
    val child = launch {
      try {
        delay(Long.MAX_VALUE) // 대기하는 동안 부모 코루틴에게 다시 점유권이 돌아간다
      } catch (e: CancellationException) { // 핸들러가 CancellationException을 무시하기 때문에 직접 캐치한다
        println("Child is cancelled")
      }
    }

    yield() // 자식 코루틴에게 점유권을 넘겨준다

    println("Cancelling child")
    child.cancel() // 자식 코루틴을 중단한다
    child.join()

    yield()

    println("Parent is not cancelled")
  }

  job.join()
  ```
* 부모가 예외를 다루려면 모든 자식 코루틴이 종료되어야 한다:
  ```kotlin
  val job = GlobalScope.launch {
      launch { // 첫째 자식
          try {
              delay(Long.MAX_VALUE)
          } finally {
              withContext(NonCancellable) { // 이미 취소된 코루틴에서 실행할 컨텍스트
                  println("Children are cancelled, but exception is not handled until all children terminate")
                  delay(100)
                  println("The first child finished its non cancellable block")
              }
          }
      }

      launch { // 둘째 자식
          delay(10)
          println("Second child throws an exception")
          throw ArithmeticException() // 둘째 자식이 예외를 던지지만 부모 코루틴이 예외를 다루지 않는다.
      }
  }

  job.join()
  ```
