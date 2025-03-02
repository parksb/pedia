# OSC Ch 4. Multithreaded Programming

* 스레드에 대해 다루는 챕터.
* 구체적인 멀티스레드 구현 방법이나 코드가 나온다.

## Threads

* 스레드는 프로세스의 작업 흐름을 말한다.
* 하나의 프로세스가 한 번에 하나의 작업만 수행하는 것은 싱글스레드.
* 하나의 프로세스가 동시에 여러 작업을 수행하는 것은 멀티스레드.
* 프로세서와 메모리가 발전하며 가능해진 기술이다.
* 멀티프로그래밍 시스템이니까 프로세스를 여러개 돌려도 되는데 굳이 스레드를 나누는 데는 이유가 있다:
  1. IPC를 위해 메시지 패싱이나 공유 메모리 또는 파이프를 사용하는 것은 효율도 떨어지고 개발자가 구현, 관리하기도 번거롭다.
  2. 프로세스 사이 컨텍스트 스위치가 계속 일어나면 성능 저하가 발생한다.

## Multithreaded Server Architecture

* 서버와 클라이언트 사이에도 멀티스레드를 구현한다.
* 클라이언트가 서버에게 요청을 보내면 서버는 새로운 스레드를 하나 생성해 요청을 수행한다.
* 프로세스를 생성하는 것보다 스레드를 생성하는 것이 더 빠르기 때문이다.

## Multicore Programming

* 멀티코어 또는 멀티프로세서 시스템을 구현할 때는 동시성(Concurrency)와 병렬성(Parallelism)을 알아야 한다.
* 동시성은 싱글 프로세서 시스템에서 사용되는 방식:
  * 프로세서가 여러 개의 스레드를 번갈아가며 수행함으로써 동시에 실행되는 것처럼 보이게 하는 방식.
* 병렬성은 멀티코어 시스템에서 사용되는 방식:
  * 여러 개의 코어가 각 스레드를 동시에 수행하는 방식.

## User Threads and Kernel Threads

* 유저 스레드는 사용자 수준의 스레드 라이브러리가 관리하는 스레드다:
  * 스레드 라이브러리에는 대표적으로 POSIX Pthreads, Win32 threads, Java threads가 있다.
* 커널 스레드는 커널이 지원하는 스레드다:
  * 커널 스레드를 사용하면 안정적이지만 유저 모드에서 커널 모드로 계속 바꿔줘야 하기 때문에 성능이 저하된다.
  * 반대로 유저 스레드를 사용하면 안정성은 떨어지지만 성능이 저하되지는 않는다.

## Multithreading Models

* 유저 스레드와 커널 스레드의 관계를 설계하는 여러가지 방법이 있다.

### Many-to-One Model

* 하나의 커널 스레드에 여러 개의 유저 스레드를 연결하는 모델.
* 한 번에 하나의 유저 스레드만 커널에 접근할 수 있기 때문에 멀티코어 시스템에서 병렬적인 수행을 할 수가 없다.
* 요즘에는 잘 사용되지 않는 방식이다.

### One-to-One Model

* 하나의 유저 스레드에 하나의 커널 스레드가 대응하는 모델.
* 동시성을 높여주고, 멀티프로세서 시스템에서는 동시에 여러 스레드를 수행할 수 있도록 해준다.
* 유저 스레드를 늘리면 커널 스레드도 똑같이 늘어난다:
  * 커널 스레드를 생성하는 것은 오버헤드가 큰 작업이기 때문에 성능 저하가 발생할 수 있다.

### Many-to-Many Model

* 여러 유저 스레드에 더 적거나 같은 수의 커널 스레드가 대응하는 모델.
* 운영체제는 충분한 수의 커널 스레드를 만들 수 있다:
  * 커널 스레드의 구체적인 개수는 프로그램이나 작동 기기에 따라 다르다.
  * 멀티프로세서 시스템에서는 싱글프로세서 시스템보다 더 많은 커널 스레드가 만들어진다.

### Two-level Model

* 특정 유저 스레드를 위한 커널 스레드를 따로 제공하는 모델.
* 점유율이 높아야하는 유저 스레드를 더 빠르게 처리해줄 수 있다.

## Thread Pools

* 스레드를 요청할 때마다 매번 스레드를 생성, 수행, 삭제하면 성능이 저하된다.
* 그래서 미리 스레드 풀에 여러 개의 스레드를 만들어두고 요청이 오면 스레드 풀에서 스레드를 할당해주는 방법을 사용한다.
