# Concurrency (Rust)

- 동시성: 프로그램의 서로 다른 일부를 독립적으로 실행하는 것.
- 병렬성: 프로그램의 서로 다른 일부를 같은 시점에 실행하는 것.

## Thread

- 많은 프로그래밍 언어가 자체적으로 특별한 스레드 구현을 제공한다:
  - 프로그래밍 언어가 제공하는 스레드를 그린 스레드(green thread)라고도 하며, 서로 다른 수의 OS 스레드로 실행된다.
  - 그린 스레드 모델을 M:N 모델이라고도 한다: `N`개의 OS 스레드 당 `M`개의 그린 스레드가 할당된다.
- 러스트는 저수준 프로그래밍 언어이므로 표준 라이브러리가 1:1 스레딩만 제공한다.
- `thread::spawn` 함수를 통해 스레드를 만들 수 있다:
  ```rust
  use std::thread;
  use std::time::Duration;

  fn main() {
      thread::spawn(|| {
          for i in 1..10 {
              println!("hi number {} from the spawned thread!", i);
              thread::sleep(Duration::from_millis(1));
          }
      });

      for i in 1..5 {
          println!("hi number {} from the main thread!", i);
          thread::sleep(Duration::from_millis(1));
      }
  }
  ```
  ```
  hi number 1 from the main thread!
  hi number 1 from the spawned thread!
  hi number 2 from the main thread!
  hi number 2 from the spawned thread!
  hi number 3 from the main thread!
  hi number 3 from the spawned thread!
  hi number 4 from the main thread!
  hi number 4 from the spawned thread!
  hi number 5 from the spawned thread!
  ```
- 아직 스폰된 스레드의 작업이 끝나지 않았는데도 메인 스레드 작업이 끝나는 바람에 프로그램이 종료되어 버렸다.
- `thread::spawn` 함수가 반환하는 `JoinHandle`의 `join` 메서드는 스레드가 끝날 때까지 대기하게 만든다:
  ```rust
  use std::thread;
  use std::time::Duration;

  fn main() {
      let handle = thread::spawn(|| {
          for i in 1..10 {
              println!("hi number {} from the spawned thread!", i);
              thread::sleep(Duration::from_millis(1));
          }
      });

      for i in 1..5 {
          println!("hi number {} from the main thread!", i);
          thread::sleep(Duration::from_millis(1));
      }

      handle.join().unwrap();
  }
  ```
- 스레드 클로저 안에서 메인 스레드의 데이터를 사용하려면 오너십을 이동시켜야 한다:
  - 그렇지 않으면 스레드에서 참조하고 있는 데이터가 메인 스레드에서 드롭되는 경우 문제가 생길 수 있다:
    ```rust
    use std::thread;

    fn main() {
        let v = vec![1, 2, 3];

        let handle = thread::spawn(|| {
            println!("Here's a vector: {:?}", v);
        });

        drop(v); // oh no!

        handle.join().unwrap();
    }
    ```
  - 클로저 앞에 `move` 키워드를 붙이면 클로저가 오너십을 갖게 된다:
    ```rust
    use std::thread;

    fn main() {
        let v = vec![1, 2, 3];

        let handle = thread::spawn(move || {
            println!("Here's a vector: {:?}", v);
        });

        handle.join().unwrap();
    }
    ```
    - 이렇게 하면 클로저가 `v`에 대한 오너십을 갖고 있으므로 메인 스레드에서 `v`를 드롭할 수 없다.
    - 러스트의 오너십 규칙이 또 우리를 구했다.

## Async

- 스레드는 단순하지만, 동기화가 어렵고 성능 오버헤드도 크다. 비동기는 오버헤드가 작다.
- 비동기가 스레드보다 항상 더 나은 것은 아니다. 굳이 비동기의 성능이 필요한게 아니면 스레드를 사용하는게 더 쉽다.
- 러스트 표준 라이브러리는 기본적인 동시성 프로그래밍 도구만 제공한다. 따라서 외부 라이브러리를 사용한다:
  - [futures](https://docs.rs/futures/): 비동기 코드를 작성하기 위한 함수와 트레잇들을 제공한다.
  - [tokio](https://docs.rs/tokio/) or [async-std](https://docs.rs/async-std/): 비동기 런타임을 제공한다.
- `async`는 코드 블록을 `Future` 트레잇을 구현하는 상태 머신으로 변환한다:
  ```rust
  async fn learn_and_sing() {
      // 노래를 부르기 전에 그 노래를 배울 때까지 기다린다.
      // 여기서 `block_on` 대신 `.await`을 사용함으로써 스레드 블로킹을 방지하고,
      // 같은 시점에 `dance`를 실행할 수 있도록 했다. `.await`는 스레드를 블로킹하는 대신
      // future가 완료될 때까지 비동기적으로 기다린다.
      let song = learn_song().await;
      sing_song(song).await;
  }

  async fn async_main() {
      let f1 = learn_and_sing();
      let f2 = dance();

      // `join!`은 `.await`와 비슷하지만 여러 futures를 동시에 기다린다.
      // 만약 `learn_and_sing`가 잠시 블로킹되면, `dance`가 현재 스레드를 점유할 것이다.
      // 만약 `dance`가 블로킹되면, `learn_and_sing`이 다시 스레드를 점유한다.
      // 만약 둘 다 블로킹되면 `async_main`이 블로킹되고, 실행자에게 스레드를 양보할 것이다.
      // `let (book, music) = futures::join!(get_book, get_music);` 처럼 페어를 반환할 수도 있다.
      futures::join!(f1, f2);
  }

  fn main() {
      // `block_on`은 future가 완료될 때까지 현재 스레드를 블로킹한다.
      block_on(async_main());
  }
  ```

### Future

- `Future` 트레잇은 러스트 비동기 프로그래밍의 핵심.
- 대략 이렇게 생겼다:
  ```rust
  trait SimpleFuture {
      type Output;
      fn poll(&mut self, wake: fn()) -> Poll<Self::Output>;
  }

  enum Poll<T> {
      Ready(T),
      Pending,
  }
  ```
  - `poll`: future가 완료됐으면 `Poll::Ready(result)`를, 아니면 `Poll::Pending`을 반환한다.
  - `Poll::Pending` 반환 후 future가 더 진행할 준비가 되면 `wake` 함수를 호출한다.
  - `wake` 함수가 호출되면 실행자가 다시 `poll`을 호출함으로써 future를 더 진행시킨다.

### 자바스크립트와의 차이

- 자바스크립트는 async-first 언어다.
- 두 가지 면에서 자바스크립트의 promise와 러스트의 futures는 다르다:
  1. promise는 생성 즉시 스케줄된다. 반면, futures는 `await`됐을 때만 스케줄된다.
  2. 모든 promies는 fallible하다. 반면, futures는 infallible할 수 있다.

## 참고자료

- https://rust-lang.github.io/async-book/
- https://doc.rust-lang.org/book/ch16-00-concurrency.html
- https://tokio.rs/tokio/tutorial/hello-tokio
- https://blog.yoshuawuyts.com/futures-concurrency/
