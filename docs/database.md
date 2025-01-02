# 데이터베이스

- 미니월드: 데이터베이스에 저장된 데이터에 관한 리얼월드의 일부분.
- DBMS: 데이터베이스를 관리, 생성하기 위한 소프트웨어 시스템.
- 데이터베이스를 정의한다는 것은 데이터의 타입과 구조, 제약을 정의하는 것.
- 메타데이터: 데이터베이스 정의 또는 descriptive information.
- 데이터베이스 시스템:
  ![](https://user-images.githubusercontent.com/6410412/229702076-9c695974-ffcc-45e4-b91f-3f86a43904fc.png)

## 데이터베이스의 특성

- Traditional file processing vs Database approach:
  - 전통적 파일 처리는 각 사용자가 특정 애플리케이션에 필요한 파일을 정의하고 구현함.
  - 데이터베이스는 하나의 저장소가 한 번 정의된 데이터를 관리하고, 다양한 유저가 데이터에 접근함.
- Self-describing nature of a database system:
  - 데이터베이스 시스템은 구조와 제약에 대한 완전한 정의를 포함하고 있다.
  - 메타데이터는 데이터베이스의 구조를 설명한다. (NOSQL의 경우 메타데이터가 불필요함.)
  - 데이터베이스 카탈로그는 DBMS나 데이터베이스 구조에 대한 정보를 필요로하는 유저가 사용한다.
- Insulation between programs and data:
  - Program-data independence: 데이터를 바꿔도 프로그램을 다시 작성할 필요가 없다.
  - Program-operation independence: 명령은 두 부분(인터페이스와 구현)으로 나뉜다. 인터페이스는 명령의 이름과 인자의 데이터타입을 포함한다. 구현은 인터페이스에 영향을 미치지 않고 수정될 수 있다.
- Support of multiple views of the data:
  - 뷰는 데이터베이스의 서브셋, 데이터베이스로부터 유도되지만 명시적으로 저장되지는 않는 가상 데이터를 포함.
- Sharing of data and multiuser transaction processing:
  - 여러 유저가 데이터베이스에 동시 접근할 수 있게 해준다.
  - 동시성 제어, 트랜잭션(isolation, atomic)

## 데이터베이스 시스템 구조

- 데이터 모델: 구조(Structures) + 명령(Operation) + 제약(Constraints)으로 이뤄진 추상 모델.
  - Conceptual(high-level, semantic): 사용자가 데이터를 인식하는 것과 같은 개념 제공.
  - Physical(low-level, internal): 데이터를 어떻게 저장할지에 대한 디테일한 개념 제공.
  - Implementation (representational) data models
  - Self-describing data models: 데이터에 대한 정의와 값이 합쳐진 모델. (e.g., XML, KV Stores, NOSQL, etc.)
- 스키마, 인스턴스, 상태:
  - Schema: 데이터베이스의 구조와 제약, 데이터 타입에 대한 설명.
  - Instance: 데이터베이스의 개별 요소를 가리키는 용어. (e.g., record instance, table instance, entity instance)
  - State: 특정 시점의 데이터베이스에 저장된 실제 데이터. 즉, 데이터베이스의 스냅샷.
  - 스키마는 거의 바뀌지 않지만, 스테이트는 수시로 변경될 수 있다.
  - 스키마는 intension, 스테이트는 extension이라고도 부른다.

### Three-schema 아키텍처

![](https://user-images.githubusercontent.com/6410412/229702415-e9ea7b7e-e9cc-4bd6-a771-686b3588d7f8.png)

- DBMS 스키마를 3개 계층으로 정의할 수 있음.
- Internal schema: 물리적 스토리지 구조와 접근 경로를 정의하는 스키마 (e.g., 인덱스)
- Conceptual schema: 전체 데이터베이스 구조와 제약을 정의하는 스키마.
- External schema: 데이터베이스의 모든 데이터를 제공할 필요가 없는 경우 일부를 뷰로 제공하는 스키마. 보통 conceptual schema와 같은 데이터 모델을 사용.
- 다른 레벨 사이의 의존성을 분리하는 것을 data independence라고 한다:
  - Logical Data Independence: external schema를 변경하지 않고 conceptual schema를 변경할 수 있어야 한다.
  - Physical Data Independence: conceptual shema를 변경하지 않고 internal schema를 변경할 수 있어야 한다.

### DBMS 언어

- Data Definition Language (DDL): conceptual schema를 정의하기 위해 사용하는 언어. 많은 DBMS가 internal/external schema도 정의할 수 있도록 지원.
  - 어떤 DBMS는 internal schema에는 Storage Definition Language (SDL), external schema에는 View Definition Language (VDL)를 사용하도록 분리하기도.
- Data Manipulation Language (DML): 데이터를 조회, 변경하기 위해 사용하는 언어. 범용 언어를 임베드하여 사용할 수도 있음.
  - 하이레벨, 비절차적 DML로 SQL이 있음. declarative language라고도 한다.

### DBMS 아키텍처

#### Physical centralized

![](https://user-images.githubusercontent.com/6410412/229706095-e026beb9-82ea-4d10-85f1-a616bc4bc425.png)

#### Logical two-tier client/server

![](https://user-images.githubusercontent.com/6410412/229706162-de7f9f3e-a84f-4238-9db4-9ffd01b8335f.png)

- 클라이언트에게 쿼리와 트랜잭션 서비스를 제공.
- 클라이언트 애플리케이션은 서버 데이터베이스에 접근하기 위한 API(e.g., ODBC, JDBC)를 사용할 수 있음.

#### Logical three-tier client/server

![](https://user-images.githubusercontent.com/6410412/229706222-22a686e7-a4ef-4407-aed3-a72454cf427e.png)

- 웹 애플리케이션을 위한 일반적인 아키텍처.
- 웹 서버를 통해서만 데이터베이스에 접근할 수 있으므로 보안을 향상시킬 수 있음.

## 하위문서

- [[mysql]]
- [[redis]]
- [[apache-kafka]]
- [[entity-relationship-model]]
- [[relational-data-model]]
- [[relational-algebra]]
- [[database-normalization]]

## 관련문서

- [[database-system-concepts]]
- [[designing-data-intensive-applications]]
