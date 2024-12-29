# String (Rust)

## `&str`과 `String` 사이 변환

* `to_string()` 메소드는 `&str`을 `String`으로 변환한다.
* `String`에서 참조를 빌리면 `&str`로 변환된다.

```rust
fn main() {
    let s = "Jake".to_string();
    say_hello(&s);
}

fn say_hello(name: &str) { ... }
```

* `String` - 힙 메모리에 할당된 utf8 바이트를 소유하는 버퍼.
* `&str` - `String`으로부터 참조된 슬라이스 또는 정적 메모리에 할당된 값.
