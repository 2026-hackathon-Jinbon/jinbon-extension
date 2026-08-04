# jinbon-extension

YouTube 또는 Netflix에서 보고 있는 영상의 진본 여부를 확인하는 Chrome 확장 프로그램입니다.

영상 페이지에 `진본 확인` 버튼을 띄우고, 사용자가 버튼을 누르면 현재 영상 URL을 진본 백엔드로 보내 검증 결과를 보여줍니다.

## 동작 흐름

1. 사용자가 YouTube/Netflix 영상 페이지에 들어갑니다.
2. 확장 프로그램이 화면 오른쪽 아래에 `진본 확인` 버튼을 표시합니다.
3. 사용자가 버튼을 누릅니다.
4. 확장 프로그램이 현재 영상 URL을 백엔드 API로 보냅니다.
5. 백엔드가 영상을 분석하고 진본 여부를 응답합니다.
6. 확장 프로그램이 결과 패널을 화면에 보여줍니다.

## 지원 페이지

현재 버튼이 표시되는 페이지는 아래와 같습니다.

- YouTube 일반 영상: `https://www.youtube.com/watch?v=...`
- YouTube Shorts: `https://www.youtube.com/shorts/...`
- Netflix 시청 페이지: `https://www.netflix.com/watch/...`

## 필요한 준비

먼저 진본 백엔드가 실행되어 있어야 합니다.

기본 백엔드 주소는 아래와 같습니다.

```text
http://localhost:8070
```

진본 백엔드 실행:

```bash
cd /Users/se00/Documents/projects/jinbon/jinbon-backend
./scripts/run-local.sh
```

만약 `Docker Desktop이 꺼져 있어요` 메시지가 나오면 Docker Desktop을 먼저 실행한 뒤 다시 시도합니다.

```bash
open -a Docker
```

Docker가 완전히 켜진 다음 다시 실행합니다.

```bash
cd /Users/se00/Documents/projects/jinbon/jinbon-backend
./scripts/run-local.sh
```

## Chrome에 설치하기

1. Chrome 주소창에 아래 주소를 입력합니다.

```text
chrome://extensions
```

2. 오른쪽 위 `개발자 모드`를 켭니다.
3. `압축해제된 확장 프로그램을 로드` 버튼을 누릅니다.
4. 아래 폴더를 선택합니다.

```text
/Users/se00/Documents/projects/jinbon/jinbon-extension
```

5. 확장 프로그램 목록에 `Jinbon Video Verifier`가 보이면 설치 완료입니다.

## 테스트 방법

1. 진본 백엔드를 켭니다.

```bash
cd /Users/se00/Documents/projects/jinbon/jinbon-backend
./scripts/run-local.sh
```

2. Chrome에서 YouTube 영상 페이지를 엽니다.

```text
https://www.youtube.com/watch?v=...
```

3. 화면 오른쪽 아래의 `진본 확인` 버튼을 누릅니다.
4. 결과 패널이 뜨는지 확인합니다.

DB에 등록된 영상이 없으면 아래처럼 나오는 것이 정상입니다.

```text
진본 확인 안 됨
진본에 등록된 기록을 찾지 못했습니다.
```

이 메시지는 오류가 아니라, 아직 해당 영상이 진본 DB에 등록되어 있지 않다는 뜻입니다.

## 백엔드 주소 변경

확장 프로그램 아이콘을 누르면 백엔드 주소를 바꿀 수 있습니다.

기본값:

```text
http://localhost:8070
```

다른 포트로 백엔드를 실행했다면 팝업에서 주소를 수정한 뒤 `저장`을 누릅니다.

## 문제 해결

### 버튼이 안 보여요

아래 페이지인지 확인합니다.

- YouTube `watch` 페이지
- YouTube `shorts` 페이지
- Netflix `watch` 페이지

확장 프로그램을 방금 수정했다면 `chrome://extensions`에서 새로고침 버튼을 누른 뒤 영상 페이지도 새로고침합니다.

### 확인 실패가 떠요

백엔드가 켜져 있는지 확인합니다.

```bash
curl -i http://localhost:8070
```

`401` 같은 응답이 오면 서버는 켜져 있는 상태입니다. 아무 응답이 없거나 연결 실패가 나오면 백엔드를 먼저 실행해야 합니다.

### Docker 오류가 떠요

Docker Desktop을 켜고 다시 백엔드를 실행합니다.

```bash
open -a Docker
```

### 진본 확인이 오래 걸려요

URL 기반 검증은 백엔드가 영상을 다운로드하고 프레임을 분석하기 때문에 시간이 걸릴 수 있습니다. 긴 영상일수록 더 오래 걸릴 수 있습니다.

## 주요 파일

- `manifest.json`: Chrome 확장 프로그램 설정
- `src/content.js`: YouTube/Netflix 페이지에 버튼과 결과 패널을 표시
- `src/background.js`: 백엔드 API 호출 담당
- `src/content.css`: 페이지에 표시되는 버튼/패널 스타일
- `src/popup.html`: 확장 프로그램 팝업 화면
- `src/popup.js`: 백엔드 주소 저장 기능
