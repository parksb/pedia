# Object-Oriented Programming (Rust)

## Struct

* struct로 캡슐화할 수 있다:

```rust
pub struct User {
  name: u16,
  age: i16,
}
```

## Implement

* impl로 메소드를 구현할 수 있다.

```rust
impl User {
  pub fn addAge(&self) {
    self.setAge(self.age + 1);
  }

  fn setAge(&mut self, value: i16) {
    self.age = value;
  }
}
```

* trait을 만들고 for 키워드로 특정 struct에 대해 구현할 수 있다:

```rust
pub trait Draw {
  fn draw(&self);
}

pub struct Button {
    pub width: u32,
    pub height: u32,
    pub label: String,
}

impl Draw for Button {
    fn draw(&self) {
        // code to actually draw a button
    }
}
```
