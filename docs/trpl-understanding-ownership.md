# Understanding Ownership (TRPL)

* 오너십은 러스트의 메모리 관리 방식이다. C에서는 개발자가 직접 메모리를 할당, 해제한다. JVM에서는 가비지 컬렉터가 메모리를 정리한다.
* 오너십에는 세 가지 규칙이 있다.
  * 각 값은 오너(owner)라고 부르는 변수를 갖는다.
  * 하나의 값은 한 번에 하나의 변수만을 가질 수 있다.
  * 오너가 스코프를 벗어나면 값은 버려진다.

```rust
{ // s is not valid here, it’s not yet declared
    let s = "hello"; // s is valid from this point forward
    // do stuff with s
} // this scope is now over, and s is no longer valid
```

## Copy types and Move types

* 어떤 변수를 다른 변수에 할당할 때 타입에 따라 값이 복사되거나 이동한다.
* Copy type
  ```rust
  let x = 5;
  let y = x; // y is 5, and x is still valid
  ```
  * `x`의 값이 복사되어 `y`에 할당된다. 이것을 '값이 복사되었다'라고 말한다.
  * 정수, 불리언 등 스택 메모리만을 사용하는 대부분의 원시 타입.
* Move type
  ```rust
  let s1 = String::from("hello");
  let s2 = s1; // s2 is "hello", and s1 is nolonger valid
  ```
  * `s1`이 가리키는 메모리 위치를 `s2`가 가리키고, `s1`은 메모리 해제된다. 이것을 '값이 이동했다'라고 말한다.
  * 값을 복사하려면 `clone` 메소드를 사용해야 한다. (`let s2 = s1.clone()`)
  * 문자열, 벡터 등 비원시 타입.

## Ownership and Functions

* 함수 파라미터로 값을 넘기는 것도 변수에 값을 할당하는 것과 비슷하다.
  * move type을 넘기면 값이 이동한다.
  ```rust
  let s = String::from("hello"); // s comes into scope
  do_something(s); // s's value moves into the function...
  // ... and so is no longer valid here
  ```
  * copy type을 넘기면 값이 복사된다.
  ```rust
  let x = 5; // x comes into scope
  do_something(x); // x would move into the function,
  // but i32 is Copy, so it’s okay to still
  // use x afterward
  ```

## References and Borrowing

* 값을 이동시키지 않고 빌려줄 수 있다.
* 변수의 주소를 참조하는 것이다. 단, 값을 변경할 수는 없다. 이것을 shared borrowing이라고 한다.
  ```rust
  fn main() {
      let a = [1, 2, 3];
      let b = &a;
      println!("{:?} {}", a, b[0]); // [1, 2, 3] 1
  }
  ```
  ```rust
  fn main() {
      let s1 = String::from("hello");
      let len = calculate_length(&s1);
      println!("The length of '{}' is {}.", s1, len);
  }

  fn calculate_length(s: &String) -> usize {
      s.len()
  }
  ```
  * 여기서 `s`는 `s1`을 참조한다. 함수의 파라미터로 `s1`의 주소값만 넘기기 때문에 값이 이동하지 않는다.
* 참조한 데이터를 변경하려면 `&mut` 키워드가 붙어야 한다. 이것을 mutable borrowing이라고 한다.
  ```rust
  fn main() {
      let mut a = [1, 2, 3];
      let b = &mut a;
      b[0] = 4;
      println!("{:?}", b); // [4, 2, 3]
  }
  ```
  ```rust
  fn main() {
      let mut s = String::from("hello");
      change(&mut s);
  }

  fn change(some_string: &mut String) {
      some_string.push_str(", world");
  }
  ```
  * 이렇게 하면 `change` 함수 내에서 `some_string`을 변경할 때 caller의 `s`도 변경된다.

