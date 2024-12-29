# File I/O (Rust)

## 읽기

```rust
let contents = fs::read_to_string("data").expect("Failed to read file");
```

## Line-by-Line 읽기

```rust
let file = File::open("data").expect("Failed to open file");
let reader = BufReader::new(file);
let mut lines_iter = reader.lines().map(|l| l.unwrap());

assert_eq!(lines_iter.next(), Some(String::from("data 1")));
assert_eq!(lines_iter.next(), Some(String::from("data 2")));
assert_eq!(lines_iter.next(), Some(String::from("data 3")));
```

## 디렉토리 파일들 읽기

```rust
let paths = fs::read_dir("store").expect("Failed to read directory");
for path in paths {
    let file = File::open(path.unwrap().path()).expect("Failed to open file");
}
```

## 쓰기

```rust
let mut file = File::create("data").expect("Failed to create file");
file.write_all("Hello, world!").expect("Failed to write file");
```
