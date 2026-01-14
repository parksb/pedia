# 콩도르세의 배심원 정리

콩도르세의 배심원 정리(Condorcet's jury theorem)는 집단이 올바른 결정에 도달할 확률에 관한 정리다. 프랑스 철학자 콩도르세가 1785년 저서 『Essay on the Application of Analysis to the Probability of Majority Decisions』에서 언급했다.

이 정리의 전제는 한 집단이 정답이 정해져 있는 안건에 대해 다수결 투표로 결정을 내린다는 점이다. 투표 결과는 정답과 오답 중 하나이며, 각 유권자는 정답에 투표할 독립적인 확률 $p$를 가지고 있다. 정리에 따르면 $p$가 $1 / 2$보다 클 때, 즉, 각 유권자가 올바르게 투표할 확률이 50%보다 높을 때는 유권자 수를 늘릴수록 집단의 결정이 정답에 이를 확률이 높아진다. 반면 $p$가 $1 / 2$보다 작을 때는 유권자 수를 늘릴 수록 결정이 오답에 이를 확률이 높아진다.

## 예시

::: INFO
[Nolen Royalty, "Are Two Heads Better Than One?", 2025](https://eieio.games/blog/two-heads-arent-better-than-one/)
:::

> 당신은 거짓말쟁이 친구 앨리스, 밥과 함께 게임을 하고 있다. 밥이 동전을 던져서 앨리스에게 보여준다. 앨리스는 자신이 본 것을 말하지만, 20% 확률로 거짓말을 한다. 이제 동전이 앞면인지 뒷면인지 추측해보자. 가장 좋은 전략은 앨리스가 하는 말을 항상 믿는 것이다. 80%는 맞으니까.
>
> 이제 밥도 합류한다. 밥은 앨리스와 독립적으로 결정을 하고, 마찬가지로 20% 확률로 거짓말을 한다. 앨리스를 믿을 때 80%는 옳은 선택이었다. 밥의 도움을 받으면 얼마나 더 잘할 수 있을까?
정답은 0%다. 여전히 정답을 맞힐 확률은 80%다.
>
> 앨리스와 밥은 꽤 자주 의견이 일치한다. 이때 대부분(~94%)은 둘 다 진실을 말한다. 가끔 둘 다 거짓말을 하는 경우도 있지만, 그럴 가능성은 매우 낮다. 하지만 상당한 비율(32%)의 경우 앨리스는 앞면이라고 하고밥은 뒷면이라고 하거나, 그 반대의 경우도 있다. 그런 경우에는 아무것도 알 수가 없다.
>
> ```
> - both tell the truth
> Alice: Heads (80%), Bob: Heads (80%)
> happens 80% * 80% = 64% of the time
> we always guess correctly in this case
> 
> - both lie
> Alice: Tails (20%), Bob: Tails (20%)
> happens 20% * 20% = 4% of the time
> we never guess correctly in this case
> 
> - alice tells the truth, bob lies
> Alice: Heads (80%), Bob: Tails (20%)
> happens 80% * 20% = 16% of the time
> we guess at random in this case; we're right 50% of the time
> 
> - alice lies, bob tells the truth
> Alice: Tails (20%), Bob: Heads (80%)
> happens 20% * 80% = 16% of the time
> we guess at random in this case; we're right 50% of the time
> 
> Our total chance to guess correctly is:
> 64% + 16% / 2 + 16% / 2 = 64% + 8% + 8% = 80%
> ```
>
> 여기에는 뭔가 아름다운 점이 있다. 앨리스와 밥의 의견이 일치할 때 정답을 맞힐 확률이 높아지지만, 앨리스와 밥의 의견이 일치하지 않을 확률만큼 정확히 상쇄되기 때문에 우리의 총 정답 확률은 여전히 80%다.
>
> 우리의 친구 찰리(역시 20% 확률로 거짓말을 한다)가 합류한다면 승산은 높아진다. 밥과 앨리스의 의견이 일치하지 않은 경우 찰리가 결정권을 행사(tiebreaker)할 수 있다. 하지만 데이비드가 합류하면 상황은 다시 반복된다. 데이비드는 2-2 분할 가능성을 만들어내고, 우리의 승률은 전혀 나아지지 않는다. 이 과정은 (친구가 충분히 있는 한) 영원히 계속된다. 만약 친구의 수 N이 홀수라면, 친구 수가 N+1명이 되더라도 정답을 맞힐 확률은 높아지지 않는다.
