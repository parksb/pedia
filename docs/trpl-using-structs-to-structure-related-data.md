# Using Structs to Structure Related Data (TRPL)

* C의 구조체와 비슷하다.
  ```rust
  struct User {
      username: String,
      email: String,
      sign_in_count: u64,
      active: bool,
  }
  ```
* `User` struct의 인스턴스를 만들 수 있다.
  ```rust
  let user1 = User {
      email: String::from("someone@example.com"),
      username: String::from("someusername123"),
      active: true,
      sign_in_count: 1,
  };
  ```
* 인스턴스가 가변적이라면 속성에 dot notation으로 접근해 값을 바꿀 수 있다.
* 이름 없는 필드로 이뤄진 tuple struct를 만들 수 있다.
  ```rust
  struct Color(i32, i32, i32);
  struct Point(i32, i32, i32);

  let black = Color(0, 0, 0);
  let origin = Point(0, 0, 0);
  ```

## Derived traits

* struct를 그대로 출력하려고 하면 오류가 발생한다.
  * 일단 포맷 스트링은 `{:?}` 또는 `{:#?}`를 사용해야 한다.
  * 그리고 `std::fmd::Debug`를 implement해야 한다. 러스트는 디버깅 정보를 출력하도록 지원하기 때문이다.
  * 실제로 구현하지 않고 struct 정의 위에 annotation `#[derive(Debug)]`를 적어주면 된다.
  ```rust
  #[derive(Debug)]
  struct Rectangle {
      width: u32,
      height: u32,
  }

  fn main() {
      let rect1 = Rectangle { width: 30, height: 50 };
      println!("rect1 is {:?}", rect1); //  rect1 is Rectangle { width: 30, height: 50 }
  }
  ```

## Method

* struct는 메소드를 가질 수 있으며, `impl` 키워드를 사용해 정의한다.
  ```rust
  impl Rectangle {
      fn area(&self) -> u32 {
          self.width * self.height
      }
  }
  ```
  * 호출할 때는 `rect1.area()`와 같이 한다.
  * 메소드가 인스턴스 자기 자신을 사용하고 싶으면 `&self`를 파라미터로 사용한다. 호출부에서는 무시된다.
* 한 struct에 대한 `impl` 블록이 여러개일 수 있다.

## Enums and Pattern Matching

* `enum` 키워드로 enum을 정의할 수 있다.
  ```rust
  enum Color {
      red,
      blue,
  }
  ```
* `::`으로 접근한다: `let red = Color::red`
* 타입을 지정할 수도 있다: `enum Color { red(String), blue(String) }`
 * 할당: `let red = Color::red(String::from("red"))`

## `Option` Enum

* 표준 라이브러리에 `Option` 타입이 있다.
* 러스트에는 Null이 없다. null 값의 문제는 null 값을 not-null 값으로 사용하려 할 때 발생한다. 이는 에러를 일으키기 쉽다
* 하지만 null은 유용한 점이 있는 것이 사실이다. 그래서 러스트는 null 대신 `Option<T>`라는 enum을 사용하기로 했다.
  ```rust
  enum Option<T> {
      Some(T),
      None,
  }
  ```
  * `Some`과 `None`은 `Option::` 없이 직접 사용할 수 있다.
  * `<T>` 문법은 제네릭 타입 파라미터다.

```rust
let some_number = Some(5);
let some_string = Some("a string");
let absent_number: Option<i32> = None;
```

* `Some`은 어떤 값이든 담을 수 있다.
* `None`을 할당할 때는 변수의 `Option<T>` 타입을 명시해야 한다.
  * `None`은 사실상 `null`과 같다.
  * `null`보다 나은 점은 `Option<T>`와 `T`가 다른 타입이라는 점이다. `i8` 타입과 `Option<i8>` 타입을 연산하면 에러가 발생한다.

## The match operator

* 러스트에는 `match`라는 강력한 연산자가 있다. `match`는 패턴에 따라 값을 비교해 일치하는 것을 실행한다.
  ```rust
  enum Coin {
      Penny,
      Nickel,
      Dime,
      Quarter,
  }

  fn value_in_cents(coin: Coin) -> u8 {
      match coin {
          Coin::Penny => 1,
          Coin::Nickel => 5,
          Coin::Dime => 10,
          Coin::Quarter => 25,
      }
  }
  ```
  * `if`로도 할 수 있지만, `if`는 불리언 값을 반환하는 반면 위 코드는 `coin` 타입을 반환한다.
  * `match` arm은 패턴과 실행할 코드 두 개의 부분으로 나뉜다. `Coin::Penny`는 패턴이다. `=>`는 패턴과 코드를 분리하는 연산자다. 뒤이어 나오는 `1`은 코드다.
  * 코드 블록을 쓸 수도 있다.
  ```rust
  Coin::Penny => {
      println!("Lucky penny!");
      1
  },
  ```

## Matching with `Option<T>`

* `None`을 매칭해 필터링할 수 있다.

```rust
fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        None => None,
        Some(i) => Some(i + 1),
    }
}
```

* 만약 `match`가 `Option<T>` 타입을 비교한다면 반드시 `None`도 비교해야 한다.
* `match`에는 `_` placeholder를 사용할 수 있다. switch문의 `default`와 같다.
  ```rust
  let some_value = 0u8;
  match some_value {
      1 => println!("one"),
      2 => println!("two"),
      _ => (),
  }
  ```

## `if let`

* `if`와 `let`을 합친 문법이다.
* `match`를 이렇게 쓰는걸:

```rust
let some_u8_value = Some(0u8);
match some_u8_value {
    Some(3) => println!("three"),
    _ => (),
}
```

* 이렇게 줄일 수 있다:

```rust
if let Some(3) = some_u8_value {
    println!("three");
}
```
