# TRPL Ch 15. Smart Pointers

* 스마트 포인터는 포인터처럼 동작하지만 추가적인 메타데이터와 기능을 가진 데이터 구조다.
* `Box<T>`: 값을 힙에 할당하기 위한 타입
* `Rc<T>`: 여러개의 오너십을 가능하게 하는 참조 카운팅 타입
* `Ref<T>`, `RefMut<T>`: 빌림 규칙을 컴파일 타임 대신 런타임에 강제하는 `RefCell<T>` 타입을 통해 접근되는 타입.

## Using Box<T> to Point to Data on the Heap

![](https://doc.rust-lang.org/book/img/trpl15-01.svg)

* `Box<T>`는 스택 대신 힙에 데이터를 저장하기 위해 사용하는 스마트 포인터다.
* 아래와 같은 상황에서 자주 사용한다:
  * 컴파일 타임에 크기를 알 수 없는 타입을 갖고 있고, 정확한 사이즈를 알아야 하는 컨텍스트에서 해당 타입의 값을 이용하고 싶을 때.
  * 큰 데이터의 복사를 방지하고 오너십을 옭기고 싶을 때.
  * 어떤 값의 구체적인 타입을 알기보다는 특정 트레잇을 구현한 타입이라는 점만 신경쓰고 싶을 때.

## Rc<T>, the Reference Counted Smart Pointer

![](https://doc.rust-lang.org/book/img/trpl15-03.svg)

* `Rc<T>`는 하나의 값이 여러 오너를 갖도록 해주는 타입.
* `5 -> 10` 구조의 리스트 `a`가 있고, 이를 가리키는 리스트 `b`, `c`가 있다고 해보자:
  ```rust
  enum List {
      Cons(i32, Box<List>),
      Nil,
  }

  use crate::List::{Cons, Nil};

  fn main() {
      let a = Cons(5, Box::new(Cons(10, Box::new(Nil))));
      let b = Cons(3, Box::new(a));
      let c = Cons(4, Box::new(a));
  }
  ```
  * 위 코드는 `a`의 오너십이 이동하기 때문에 컴파일에 실패한다:
    ```
    $ cargo run
    Compiling cons-list v0.1.0 (file:///projects/cons-list)
    error[E0382]: use of moved value: `a`
      --> src/main.rs:11:30
       |
    9  |     let a = Cons(5, Box::new(Cons(10, Box::new(Nil))));
       |         - move occurs because `a` has type `List`, which does not implement the `Copy` trait
    10 |     let b = Cons(3, Box::new(a));
       |                              - value moved here
    11 |     let c = Cons(4, Box::new(a));
       |                              ^ value used here after move

    For more information about this error, try `rustc --explain E0382`.
    error: could not compile `cons-list` due to previous error
    ```
  * 이런 경우 `Box<T>` 대신 `Rc<T>` 타입을 이용한다:
    ```rust
    enum List {
      Cons(i32, Rc<List>),
      Nil,
    }

    use crate::List::{Cons, Nil};
    use std::rc::Rc;

    fn main() {
        let a = Rc::new(Cons(5, Rc::new(Cons(10, Rc::new(Nil)))));
        let b = Cons(3, Rc::clone(&a));
        let c = Cons(4, Rc::clone(&a));
    }
    ```
    * `Rc<T>` 타입의 `clone` 함수는 참조 카운터를 증가시킨다. (다른 인스턴스를 만들지만 같은 메모리 주소를 바라본다.)
    * 스레드 세이프하지 않기 때문에 멀티스레드에서 사용할 때는 `Arc<T>` 타입을 사용해야 한다.
