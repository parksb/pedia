# Macros (Rust)

* 코드에 대한 코드, 메타프로그래밍이라고 한다. `println!`, `vec!` 모두 매크로.
* `macro_rules!` 매크로를 이용해 선언형 매크로 (declarative macro)를 만들 수 있다.

```
let v: Vec<u32> = vec![1, 2, 3];

#[macro_export]
macro_rules! vec {
    ( $( $x:expr ),* ) => {
        {
            let mut temp_vec = Vec::new();
            $(
                temp_vec.push($x);
            )*
            temp_vec
        }
    };
}
```

* `#[macro_export]` 표기는 매크로를 어디에서나 사용할 수 있다는 의미.

## 참고자료

* [Daniel Keep, "The Little Book of Rust Macros", danielkeep.github.io.](https://danielkeep.github.io/tlborm/book/)
