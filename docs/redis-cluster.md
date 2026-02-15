# Redis 클러스터

- 레디스를 수평 확장하기 위한 배포 토폴로지.
- 여러 레디스 노드에 데이터를 분산해 가용성을 높이는 것이 목적.

## Data Sharding

- 레디스 클러스터는 안정 해시를 사용하는 대신 해시 슬롯을 사용한다.
- 16384개의 해시 슬롯이 있고, 키 공간을 나누어 데이터를 샤딩한다.
- 여러 노드에 키가 분산되어 있으면 MGET, MSET을 사용할 수 없음:
  - 따라서 단일 레디스만 사용하는 코드베이스를 클러스터로 마이그레이션할 때 수정이 필요함.
  - 해시 태그를 이용해 하나의 노드에 키를 묶어서 저장할 수 있음:
    - `key:{group}:value` 형태로 저장하면 `{group}`에 따라 키가 분산되지 않고 하나의 노드에 저장됨.
    - 이렇게 하면 해당 `group`에 대한 MGET, MSET을 사용할 수 있음.
    - 단, 해시 태그를 남용하면 레디스 클러스터의 장점인 가용성을 잃게 됨.

## 참고자료

- [Scale with Redis Cluster](https://redis.io/docs/management/scaling/)
- [Redis Cluster Specification](https://redis.io/docs/reference/cluster-spec/)
- [Linear Scaling with Redis Enterprise](https://redis.com/redis-enterprise/technology/linear-scaling-redis-enterprise/)
