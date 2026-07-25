# ClickHouse

::: INFO
https://clickhouse.com/
:::

![](/images/81464307-8044-46ae-817c-04e041dd34f0.webp)
_클릭하우스 데이터베이스 엔진의 하이 레벨 아키텍처._

클릭하우스(ClickHouse)는 OLAP을 위한 열 지향(column-oriented) DBMS다.

OLTP에서는 일반적으로 하나의 쿼리가 몇 개의 행만 읽고 쓰기 때문에 대부분 밀리초 단위로 트랜잭션을 처리할 수 있지만, OLAP에서는 하나의 쿼리가 수십억, 혹는 수조 개의 행을 일상적으로 처리해야 한다. 분석 쿼리를 실시간으로 처리하기 위해 클릭하우스는 열 지향으로 설계되었다. 행 지향(row-oriented) 데이터베이스에서는 테이블의 행이 순차적으로 저장되기 때문에 일부 열만 필요한 경우에도 디스크 블록을 모두 읽어야 한다. 반면 열 지향 데이터베이스에서는 행이 아닌 열의 값을 디스크에 순차적으로 저장하기 때문에 쿼리에 필요한 일부 열만 디스크에서 읽어들일 수 있다. 분석 쿼리는 일반적으로 특정 열의 값을 집계하는 사례가 많기 때문에 열 지향 설계가 성능 달성에 많은 기여를 할 수 있다.

클릭스택(ClickStack)은 클릭하우스를 기반으로 구축된 [[observability]]{관측} 플랫폼이다. 클릭스택은 프론트엔드 UI를 위한 [HyperDX](https://www.hyperdx.io/), 데이터 수집을 위한 [[open-telemetry]] 컬렉터, 데이터 저장을 위한 클릭하우스 세 컴포넌트로 이루어져 있다. 모두 오픈소스이기 때문에 셀프 호스팅으로 클릭스택을 구축할 수도 있고, 클릭하우스 클라우드가 제공하는 관리형 클릭스택을 사용할 수도 있다.

## 참고자료

- [Robert Schulze et al., 『ClickHouse - Lightning Fast Analytics for Everyone』, 2024.](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf%EF%BC%89%E7%A7%91%E5%AD%A6%E8%AE%BA%E6%96%87%E7%9A%84%E7%BD%91%E9%A1%B5%E7%89%88%E3%80%82%E6%88%91%E4%BB%AC%E8%BF%98%5B%E5%9C%A8%E5%8D%9A%E5%AE%A2%E4%B8%AD)
- [Mark Needham, 『What is a columnar database?』, 2026.](https://clickhouse.com/resources/engineering/what-is-columnar-database)
- [Mathew Duggan, 『Clickhouse is winning the Observability Wars』, 2026](https://matduggan.com/clickhouse-is-winning-the-observability-wars/)

## 관련문서

- [[database]]
- [[designing-data-intensive-applications]]
