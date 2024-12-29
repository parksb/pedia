# Generic Types, Traits, and Lifetimes (TRPL)

## Generic Data Types

* 모든 프로그래밍 언어는 효과적으로 컨셉을 복제하기 위한 도구를 가지고 있다. 러스트에서는 그 중 하나가 제네릭이다.
* 다른 언어의 일반적인 제네릭과 비슷하다.
* 함수에서: `fn largest<T>(list: &[T]) -> &T`
* struct에서:
  ```rust
  struct Point<T> {
      x: T,
      y: T,
  }

  fn main() {
      let integer = Point { x: 5, y: 10 };
      let float = Point { x: 1.0, y: 4.0 };
  }
  ```
   ```rust
  struct Point<T, U> {
      x: T,
      y: U,
  }

  fn main() {
      let integer_and_float = Point { x: 5, y: 4.0 };
  }
  ```
* enum에서:
  ```rust
  enum Result<T, E> {
      Ok(T),
      Err(E),
  }
  ```
* 메서드에서:
  ```rust
  struct Point<T> {
      x: T,
      y: T,
  }

  impl<T> Point<T> {
      fn x(&self) -> &T {
          &self.x
      }
  }

  fn main() {
      let p = Point { x: 5, y: 10 };
      println!("p.x = {}", p.x()); // p.x = 5
  }
  ```
* 러스트는 컴파일 타임에 monomorphization을 수행한다. monomorphization이란 제네릭 코드를 실제로 채워질 구체적인 타입으로된 코드로 바꾸는 과정을 말한다. 따라서 제네릭을 사용해도 런타임 성능에 문제가 생기지 않는다.

## Traits: Defining Shared Behavior

* 트레잇은 다른 언어의 인터페이스와 유사하다.
* 자바의 추상 클래스와 비슷하다고 하는 쪽이 더 맞을수도.

```rust
pub trait Summarizable {
    fn summary(&self) -> String;
}

pub struct NewsArticle {
    pub headline: String,
    pub location: String,
    pub author: String,
    pub content: String,
}

impl Summarizable for NewsArticle {
    fn summary(&self) -> String {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}

pub struct Tweet {
    pub username: String,
    pub content: String,
    pub reply: bool,
    pub retweet: bool,
}

impl Summarizable for Tweet {
    fn summary(&self) -> String {
        format!("{}: {}", self.username, self.content)
    }
}

fn main() {
    let tweet = Tweet {
        username: String::from("horse_ebooks"),
        content: String::from("of course, as you probably already know, people"),
        reply: false,
        retweet: false,
    };

    println!("1 new tweet: {}", tweet.summary());
}
```

## Validating References with Lifetimes

* 라이프타임은 참조자가 유효한 스코프를 의미한다.
* 라이프타임의 주목적은 댕글링 참조자(dangling reference)를 방지하는 것이다.
* 아래 코드에서 참조의 주체인 `x`의 라이프타임 `'b`가 참조자 `r`의 라이프타임 `'a`보다 짧기 때문에 컴파일되지 않는다:
  ```rust
  {
      let r;         // -------+-- 'a
                     //        |
      {              //        |
          let x = 5; // -+-----+-- 'b
          r = &x;    //  |     |
      }              // -+     |
                     //        |
      println!("r: {}", r); // |
                     //        |
                     // -------+
  }
  ```
* 함수가 받은 참조를 반환할 때도 문제가 생길 수 있다. 아래 함수는 반환되는 참조자 `&str`이 `x`를 참조하는지, `y`를 참조하는지 알 수 없기 때문에 컴파일되지 않는다:
  ```rust
  fn longest(x: &str, y: &str) -> &str {
      if x.len() > y.len() {
          x
      } else {
          y
      }
  }
  ```
  * 따라서 함수 시그니처에 라이프타임을 명시해야 한다.
    ```rust
    fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
        if x.len() > y.len() {
            x
        } else {
            y
        }
    }
    ```
