# Error Handling (Rust)

## Panic

* `panic!` 매크로는 프로그램에서 에러를 일으킨다.
* `panic!` 매크로가 동작하면 프로그램은 실패 메시지를 출력하고 스택을 되감는다.

```rust
fn main() {
    panic!("crash and burn");
}
```

## Result

* 대부분의 에러는 프로그램을 중단해야 할 정도로 심각하지는 않다.
* 함수가 실패하면 `Result` 열거형을 반환하도록 한다.

  ```rust
  enum Result<T, E> {
      Ok(T),
      Err(E),
  }
  ```

* 함수가 반환한 `Result`에 따라 분기를 한다.

  ```rust
  let file = File::open("data");
  let file = match file {
      Ok(f) => f,
      Err(error) => {
          panic!("Failed to open the file: {:?}", error)
      },
  }
  ```

* `Result`에서 반환한 에러의 종류에 따라 다시 분기할 수도 있다.

  ```rust
  let file = File::open("data");
  let file = match file {
        Ok(f) => f,
        Err(error) => match error.kind() {
            ErrorKind::NotFound => match File::create("data") {
                Ok(fc) => fc,
                Err(e) => panic!("Failed to create file: {:?}", e),
            },
            other_error => panic!("Failed to open file: {:?}", other_error),
        },
    };
  ```

* `unwrap` - `Result`가 `Ok`면 `Ok`의 값을 반환, `Err`이면 `panic!` 매크로를 호출.

  ```rust
  let file = File::open("data").unwrap();
  ```

* `expect` - `unwrap`과 비슷하지만 `panic!`의 에러 메시지를 직접 설정할 수 있다.

  ```rust
  let file = File::open("data").expect("Failed to open file");
  ```

* `?` - `Result`가 `Ok`면 `Ok`의 값을 반환, `Err`이면 호출부에 `Err`을 반환한다. (이때 함수는 반드시 `Result` 타입을 반환해야 한다.)

  ```rust
  fn open_file() -> Result<String, io::Error> {
      let file = File::open("data")?;
      Ok(file)
  }
  ```
