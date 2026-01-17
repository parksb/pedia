# 웹어셈블리

::: INFO
https://webassembly.org/
:::

웹어셈블리(WebAssembly, WASM)는 웹 브라우저를 포함해 다양한 환경에서 실행할 수 있는 바이너리 인스트럭션 형식이다. [[javascript]]의 느린 속도를 보완하기 위한 목적으로 출발했지만, 범용 런타임으로 확장되고 있다. C/C++, 자바, 파이썬, [[kotlin]], [[rust]] 등 다양한 언어를 웹 어셈블리 모듈로 컴파일할 수 있다.

## WASI

WASI(WebAssembly System Interface)는 WASM 모듈이 웹 브라우저가 아닌 환경에서도 실행될 수 있도록 설계된 표준화된 인터페이스다. WASI는 POSIX와 유사한 시스템 API 집합을 제공해 WASM 모듈이 파일 시스템이나 네트워크, 프로세스 등에 접근할 수 있도록 한다.

## 컨테이너의 대안

> [@solomonstre](https://x.com/solomonstre/status/1111004913222324225) "If WASM+WASI existed in 2008, we wouldn’t have needed to created Docker. That’s how important it is. Webassembly on the server is the future of computing." 
