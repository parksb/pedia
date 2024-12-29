# TRPL Ch 7. Managing Growing Projects with Packages, Crates, and Modules

* 모듈은 `mod` 키워드로 정의한다.
  ```rust
  fn serve_order() {}

  mod back_of_house {
      fn fix_incorrect_order() {
          cook_order();
          super::serve_order();
      }

      pub fn cook_order() {}
  }
  ```
  * 외부에서 `hello`를 호출하려면 모듈을 특정해야 하므로, 네임스페이스 문법인 `::`를 이용해야 한다. `greetings::hello()`
  * `pub`은 public 접근제한자를 뜻한다. 기본적으로 private이다.
  * `mod`는 중첩할 수 있다. 상위 컨텍스트(부모 모듈 등)의 함수에 접근할 때는 `super::`를 이용한다.

## `use`

* `use` 키워드를 이용하면 로컬에 있는 모듈을 스코프로 가져올 수 있다.

```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
}
```

* `use`를 사용하는 건 심볼릭 링크를 만드는 것과 비슷하다. 위의 경우 `hosting`이 해당 스코프에서 유효한 이름이 된다. `hosting` 모듈은 crate root에 정의되어 있다.
* 표준 라이브러리에 있는 모듈을 가져올 수 있다. `use std::io`
* `as` 키워드로 이름을 부여할 수도 있다. `use std::io::Result as IoResult`
* 스코프로 모듈을 가져오면 private으로 가져오게 된다. 이것을 public으로 re-exporting할 수 있다. `pub use crate::front_of_house::hosting`
* 외부 모듈을 설치해서 가져올 수 있다.
  * Cargo.toml 파일에 설치할 모듈을 추가한다.
    ```toml
    [dependencies]
    rand = "0.5.5"
    ```
  * `rand` 모듈을 가져올 때도 `use`를 사용한다. `use rand::Rng`
* `use` 경로를 중첩할 수 있다. `use std::{cmp::Ordering, io}`
  * `io` 자기 자신과 `io::Write`를 스코프로 가져올 때 중첩을 이용한다. `use std::io::{self, Write}`
* 모든 public 요소를 가져올 때는 glob 연산자 `*`을 사용한다. `use std::collections::*`

## Separating modules

* 모듈을 꼭 한 파일에 둘 필요는 없다.
* `src/lib.rs` 파일이 있다.
```rust
mod front_of_house;
pub use crate::front_of_house::hosting;
pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
}
```
* 그리고 `src/front_of_house.rs` 파일이 있다.
```rust
pub mod hosting {
    pub fn add_to_waitlist() {}
}
```
