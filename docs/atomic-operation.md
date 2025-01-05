# 원자적 연산

원자적 연산(Atomic operation)은 공유 자원의 원자적 접근과 변경을 보장하는 연산을 뜻한다. 원자적이라는 것은 불가분한(더 이상 쪼갤 수 없는) 처리 단위를 말한다.

어떤 연산이 원자적이라는 것은 해당 연산 도중 상태는 시스템적으로 관측할 수 없고, 연산이 실패하면 연산 전 상태로 복원된다는 것을 의미한다. 엄밀히는 프로세서의 덧셈, 곱셈 명령도 원자적 연산이지만, 일반적으로는 여러 번의 메모리 접근이 필요한 작업을 원자적으로 처리하는 연산을 말한다.

## Compare and Swap (CAS)

CAS 연산은 메모리 위치의 값(`*p`)과 주어진 값(`val`)을 비교해 두 값이 같은 경우에만 메모리 위치의 값을 변경하는 원자적 연산이다.

```c
bool compare_and_swap(uint64_t *p, uint64_t val, uint64_t newval) {
    if (*p != val) {
        return false;
    }

    *p = newval;
    return true;
}
```

그런데 사실 위 코드는 원자적이지 않다. L2(`if (*p != val)`)는 L5(`*p = newval`)와 별도로 실행될 수 있다. x86 어셈블리 코드로 컴파일하면 아래와 같이 된다.

```x86
    cmpq %rsi, (%rdi) ; rsi 레지스터의 값과 rdi 레지스터가 가리키는 값을 비교한다.
    jne LBB0_1        ; 비교 결과가 같지 않으면 LBB0_1 라벨로 점프한다.
    movq %rdx, (%rdi)
    movl $1, %eax
    retq              ; 1을 반환한다.
LBB0_1:
    xorl %eax, %eax   ; eax 레지스터 값을 0으로 설정한다.
    retq              ; 0을 반환한다.
```

gcc, clang 같은 컴파일러는 원자적 연산을 위한 내장 함수 `__sync_bool_compare_and_swap`을 제공한다. 이 내장 함수는 하드웨어 수준에서 원자적 연산을 보장한다.

```c
bool compare_and_swap(uint64_t *p, uint64_t val, uint64_t newval) {
    return __sync_bool_compare_and_swap(p, val, newval);
}
```

앞서 정의한 `compare_and_swap`과 의미는 똑같지만, 어셈블리 코드로는 다르게 컴파일된다.

```x86
movq %rsi, %rax            ; rsi 레지스터 값을 rax 레지스터로 복사한다.
xorl %ecx, %ecx            ; ecx 레지스터 값을 0으로 초기화한다.
lock cmpxchgq %rdx, (%rdi) ; lock 접두사를 이용해 아토믹하게 값을 비교, 교환한다.
sete %cl
movl %ecx, %eax
retq
```

## Test and Set (TAS)

TAS 연산은 메모리 위치의 값(`*p`)이 `true`인 경우 `true`를 반환하고, `false`인 경우 `true`로 변경한 뒤 `false`를 반환하는 원자적 연산이다.

```c
bool test_and_set(bool *p) {
    if (*p) {
        return true;
    }

    *p = true;
    return false;
}
```

CAS와 마찬가지로 하드웨어 수준에서 원자성을 보장하는 내장 함수 `__sync_lock_test_and_set`이 있다.

```c
bool test_and_set(bool *p) {
    return __sync_lock_test_and_set(bool *p);
}
```

## Load-Link/Store-Conditional (LL/SC)

x86, x86-64에서는 `lock` 접두사로 메모리 락을 걸었지만, ARM, RISC-V 등의 CPU에서는 LL/SC 명령으로 원자적 연산을 구현한다.

- Load-Link (LL): 메모리 읽기를 배타적으로 수행한다.
- Store-Conditional (SC): 메모리 쓰기. LL 명령으로 지정한 메모리로의 쓰기는 다른 프로세스가 침범하지 않은 경우에만 성공한다.

공유 메모리상에 있는 변수를 여러 프로세스가 증가시키는 상황을 가정해보자.

1. P1이 공유 변수 v의 값 1을 LL 명령으로 읽는다.
2. 직후 P2가 v의 값 1을 read 명령으로 읽는다.
3. 이어서 P2가 v의 값 1에 1을 더해 write 명령으로 2를 쓴다.
4. P1이 v의 값 1에 1을 더해 SC 명령으로 2를 쓰지만 실패한다. (LL 명령과 SC 명령 사이에 v로의 쓰기가 발생했기 때문.)

## 관련문서

- [[computer-architecture]]
