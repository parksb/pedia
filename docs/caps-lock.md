# Caps Lock

모든 문자를 대문자로 고정하는 키보드의 토글 키. Caps Lock 키는 타자기의 Shift lock 키를 그대로 계승한 것이다. 타자기의 초기 혁신은 동일한 수의 키를 사용해 입력할 수 있는 문자의 수를 두 배로 늘린 것이다. 기계식 타자기의 Shift 키는 새끼 손가락으로 누르기엔 많은 힘이 들었는데, 이때 Shift lock 키를 누르면 두 번 이상의 대문자를 쉽게 입력할 수 있었다.

## 폐기

하지만 오늘날 키보드에서 Caps Lock 키는 애물단지가 되었다. 대부분의 경우 Caps Lock 키는 실수로 누르는 키가 되었고, 심지어 웹 사이트의 비밀번호 입력 폼에서 Caps Lock 키가 눌렸는지 확인하라고 경고하는 것이 관례가 되었다. 이러한 변화에 따라 구글 크롬북 키보드는 Caps Lock 키를 "Everything Button"으로 바꾸었고, 독일 키보드 레이아웃 표준은 Caps Lock 키를 선택 사항으로 규정했다. 제프 래스킨은 <Human Interface>에서 모드(mode)를 사용하는 것이 좋지 않다고 주장했는데, Caps Lock은 전형적인 모달(modal) 인터페이스이다.

맥 계열 기기에서는 입력 소스 전환 키를 Caps Lock 키에 매핑할 수 있다. 그런데 키를 짧게 누르면 입력 소스 전환 동작을 하지만, 조금이라도 길게 누르면 원래 Caps Lock 키의 기능대로 대문자 고정 동작을 한다. Hammerspoon과 같은 키 매핑 도구를 통해 Caps Lock 키를 사용하지 않는 기능 키로 매핑한 뒤, 해당 기능 키를 입력 소스 전환 키로 설정함으로써 Caps Lock 키를 입력 소스 전환 키로만 사용할 수 있다. 아래는 Caps Lock 키를 F19 키로 매핑하는 Hammerspoon 스크립트다. ([foundation_remapping.lua](https://github.com/hetima/hammerspoon-foundation_remapping/blob/master/foundation_remapping.lua) 파일이 필요하다.)

```lua
do
    local remapper = require('foundation_remapping').new()
    remapper:remap('capslock', 'F19')
    remapper:register()
end
```

## 관련문서

- [[human-computer-interaction]]
