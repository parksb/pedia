# Readers-writer 락

Readers-writer 락(RW Lock)은 읽기만 수행하는 프로세스와 쓰기만 수행하는 프로세스를 분리하는 방식의 동기 처리 기법이다. RW 락은 [[race-condition]]가 발생하는 이유는 쓰기 연산 때문이며, 쓰기만 배타적으로 수행하면 문제가 발생하지 않는다는 관찰에 기반한다.

RW 락은 다음 제약을 만족하도록 배타 제어를 수행한다.

- 락을 획등 중인 reader는 같은 시각에 0개 이상 존재할 수 있다.
- 락을 획득 중인 writer는 같은 시각에 1개만 존재할 수 있다.
- reader와 writer는 같은 시각에 락 획득 상태가 될 수 없다.

## 스핀락 기반 RW 락 구현

```c
void rwloack_read_acquire(int *rcnt, volatile int *wcnt) {
    while (1) {
        while (*wcnt); // writer가 있으면 대기한다.
        __sync_fetch_and_add(rcnt, 1);
        if (*wcnt == 0) { // writer가 없으면 락을 획득한다.
            break;
        }
        __sync_fetch_and_sub(rcnt, 1)
    }
}

void rwlock_read_release(int *rcnt) {
    __sync_fetch_and_sub(rcnt, 1);
}

void rwlock_write_acquire(bool *lock, volatile int *rcnt, int *wcnt) {
    __sync_fetch_and_add(wcnt, 1);
    while (*rcnt); // reader가 있으면 대기한다.
    spinlock_acquire(lock);
}

void rwlock_write_release(bool *lock, int *wcnt) {
    spinlock_release(lock);
    __sync_fetch_and_sub(wcnt, 1);
}
```

```c
int rcnt = 0;
int wcnt = 0;
bool lock = false;

void reader() {
    while (1) {
        rwlock_read_acquire(&rcnt, &wcnt);
        // critical section (read only)
        rwlock_read_release(&rcnt);
    }
}

void writer() {
    while (1) {
        rwlock_write_acquire(&lock, &rcnt, &wcnt);
        // critical section (write only)
        rwlock_write_release(&lock, &wcnt);
    }
}
```

## 러스트에서 RW 락 사용

```rust
use std::sync::RwLock;

fn main() {
    let lock = RwLock::new(10);

    {
        // 이뮤터블한 참조(reader)를 얻는다.
        let v1 = lock.read().unwrap();
        let v2 = lock.read().unwrap();
        println!("{} {}", v1, v2); // 읽기 동작
    }

    {
        v = lock.write().unwrap(); // 뮤터블한 참조(writer)를 얻는다.
        *v = 7; // 쓰기 동작
        println!("{}", v); // 읽기 동작
    }
}
```
