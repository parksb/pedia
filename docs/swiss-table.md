# 스위스 테이블

스위스 테이블(Swiss table)은 구글이 제시한 고성능 해시 테이블 구현이다. 2017년 CppCon에서 맷 쿨루쿤디스(Matt Kulukundis)가 처음 발표했고, 2018년 Abseil C++ 라이브러리에 오픈소스로 공개되었다. 스위스 테이블로 이름 붙여진 이유는 알키스 에블로이메노스(Alkis Evlogimenos)와 로만 페레펠리차(Roman Perepelitsa)가 구글 취리히 오피스에서 일했기 때문이다.

해시 테이블은 해시 함수를 이용해 키를 특정 슬롯(slot)으로 변환함으로써 키와 값 사이 매핑을 제공한다. 해시 함수가 아무리 완벽하더라도 무한히 많은 키를 유한한 메모리 공간에 매핑할 때는 반드시 충돌이 발생한다. 즉, 서로 다른 두 키가 동일한 슬롯에 매핑될 수 있다. 충돌은 해시 테이블의 성능을 저하시키는 주범이므로 이 문제를 해결하기 위해 체이닝(chaining), 개방 주소(open addressing)와 같은 충돌 해결 전략을 사용한다.

체이닝은 테이블의 각 슬롯에 단일 값이 아니라 연결 리스트를 매핑한다. 테이블을 조회할 때는 해시 함수를 사용해 슬롯을 찾은 다음, 해당 슬롯의 연결 리스트를 순회해 일치하는 키를 찾는다. 체이닝은 구현이 간단하지만, 캐시 친화적이지 않다. 개방 주소는 체이닝과 달리 하나의 키에 하나의 값을 매핑하고, 충돌이 발생하면 해당 슬롯에서부터 순차적으로 인접한 다른 슬롯을 찾는다. 이때 비어있는 다른 슬롯을 찾을 때는 선형 탐색($N+M$번째 슬롯을 탐색)이나 제곱 탐색($N+M^2$번째 슬롯을 탐색)과 같은 일관된 탐색 규칙을 따라야 한다. 빈 슬롯이 하나만 있다면 모든 슬롯을 스캔해야 하므로 최악의 경우 시간복잡도는 $O(N)$이 된다. 이미 점유된 슬롯의 비율을 로드 팩터(load factor)라고 하며, 대부분의 해시 테이블 구현은 최대 로드 팩터(일반적으로 70~90%)를 정의해둔다. 로드 팩터가 임계값을 초과하면 전체 슬롯의 크기를 늘린다. 개방 주소는 캐시 친화적이지만 구현이 복잡하기 때문에 많은 라이브러리가 체이닝으로 구현되어 있다.

업계에서는 해시 테이블의 성능을 개선하기 위해 더 완벽한 해시 함수를 만드는 데 집중해왔다. 반면 스위스 테이블은 해시 테이블의 구조를 개선하는 데 집중했다. 스위스 테이블은 기본적으로 개방 주소 해시 테이블이다. 따라서 하나의 슬롯에는 하나의 값이 매핑된다. 스위스 테이블은 슬롯을 논리적 그룹으로 나누고, 각 슬롯에 메타데이터용 제어 워드(control word)를 둔다. 각 제어 워드는 해당 슬롯이 비어 있는지, 삭제되었는지, 점유 중인지 표현한다. 슬롯이 점유된 경우 제어 워드는 해당 슬롯 `hash(key)`의 하위 7비트를 저장한다. 스위스 테이블에 값을 삽입하거나 조회할 때는 `hash(key)`의 상위 57비트(64비트 시스템인 경우)와 하위 7비트를 나눈다. 이때 상위 비트는 그룹을 선택할 때 사용한다. 만약 사용할 수 있는 빈 슬롯이 없다면 다음 그룹에서 탐색한다.

슬롯에 이미 키가 있는지 확인할 때는 모든 슬롯의 키를 순차적으로 비교할 수도 있지만, 제어 워드를 활용하면 훨씬 효율적이다. 각 슬롯에는 `hash(key)`의 하위 7비트가 저장되어 있으므로 제어 워드에서 특정 7비트를 찾아내면 후보 슬롯을 얻을 수 있다. [[simd]]{SIMD} 하드웨어에서는 단일 명령으로 N개 값에 대한 비교 연산을 병렬 수행할 수 있기 때문에 이 과정은 매우 빠르게 이뤄진다.

[[rust]]는 2018년 C++의 스위스 테이블 구현을 포팅해 `std::collections::HashMap`에 스위스 테이블 구현을 적용했다. 아이러니하게도 구글이 제시한 스위스 테이블이 Go의 `Map` 구현에는 2025년에서야 적용되었다.

## 관련문서

- [[designing-data-intensive-applications-ch3]]
- [[redis]]

## 참고자료

- [Matt Kulukundis, "Designing a Fast, Efficient, Cache-friendly Hash Table, Step by Step", CppCon 2017, 2017.](https://www.youtube.com/watch?v=ncHmEUmJZf4)
- [Sam Benzaquen, Alkis Evlogimenos, Matt Kulukundis, Roman Perepelitsa, "Swiss Tables and absl::Hash", 2018.](https://abseil.io/blog/20180927-swisstables)
- [Michael Pratt, "Faster Go maps with Swiss Tables", The Go Blog, 2025.](https://go.dev/blog/swisstable)
- [Nayef Ghattas, "How Go 1.24's Swiss Tables saved us hundreds of gigabytes", Datadog, 2025.](https://www.datadoghq.com/blog/engineering/go-swiss-tables/)
