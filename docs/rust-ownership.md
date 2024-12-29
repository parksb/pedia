# Ownership (Rust)

## 메소드의 `self`, `&self`, `&mut self`

* `self` - 함수가 값을 소모하는 경우. 오너십을 받는다. (move)
* `&self` - 함수가 값을 읽기만 하는 경우. 참조만 받는다. (borrow)
* `&mut self` - 함수가 값을 소모하지 않고 변경하는 경우. 가변참조를 받는다. (borrow)

## 함수에서 참조 반환하기

* 함수에서 참조를 반환하려 하면 실패한다.

```rust
fn try_create<'a>() -> &'a String {
    &String::new()
}
 ```

* 함수 내에서 만든 임시 값의 오너십을 함수가 가지고 있기 때문이다.
* 함수가 끝날 때 임시 값은 드랍되고, 메모리에서 사라진다.
* 따라서 반화하려던 참조는 댕글링 참조(Dangling reference)가 된다.

```
error[E0515]: cannot return reference to temporary value
 --> src/lib.rs:2:5
  |
2 |     &String::new()
  |     ^-------------
  |     ||
  |     |temporary value created here
  |     returns a reference to data owned by the current function
```

* 함수 내에서 만든 임시 값의 참조를 반환하는 것은 불가능하다.

## 참고자료

* ["References and Borrowing", The Rust Programming Language.](https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html)
* ["Is there any way to return a reference to a variable created in a function?", Stack Overflow, 2015.](https://stackoverflow.com/questions/32682876/is-there-any-way-to-return-a-reference-to-a-variable-created-in-a-function)
