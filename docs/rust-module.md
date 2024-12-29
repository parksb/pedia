# Module (Rust)

## 다른 파일에서 모듈 가져오기

* `main.rs` 파일에서 `src/services/user.rs` 파일의 `User` struct를 쓰고자 한다.

```
+ src
| + main.rs
| + lib.rs
| + services
| | + user.rs
```

* 그냥 `use crate::services::user`를 하면 루트에 파일이 없다는 에러가 발생한다.

```rust
// src/services/user.rs

pub struct User { ... }
```

* 루트의 `lib.rs` 파일에 모듈을 공개해야 한다.

```rust
// src/lib.rs

pub mod services {
  pub mod user;
}
```

* 디렉토리, 파일 자체가 하나의 모듈이다. `services` 모듈 안에 `user` 모듈이 있는 것.
* `pub mod user;`는 `user` 모듈(파일)의 내용을 다른 위치에서 찾으라는 의미다.

  ```rust
  pub mod services {
 	pub mod user {
	  // contents of services/user.rs
	}
  }
  ```

* 이제 `main.rs`에서 루트를 기준으로 `services` 모듈과 그 안의 `user` 모듈을 찾을 수 있다.

```rust
// src/main.rs

use crate::services::user::User;

fn main() {
  let user = User { ... };
  // do something...
}
```

* `mod.rs` 파일을 이용해 디렉토리 모듈 자체만 공개할 수도 있다.

```
+ src
| + main.rs
| + lib.rs
| + services
| | + mod.rs
```

```rust
// src/services/mod.rs

pub struct User { ... }
```

```rust
// src/lib.rs

pub mod services;
```

```rust
// src/main.rs

use crate::services::User;

fn main() {
  let user = User { ... };
  // do something...
}
```

## 크레이트와 모듈의 차이

* 크레이트는 컴파일 단위로, 컴파일러가 다룰 수 있는 가장 작은 규모의 코드를 말한다.
* 모듈은 크레이트 안에 있는 코드 구조의 단위를 말한다.
* `mod` - 모듈이 존재함을 선언.
* `use` - 다른 곳에 선언된 모듈을 참조해 그 내용을 현재 모듈의 스코프에 가져온다.
