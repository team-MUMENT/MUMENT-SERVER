# MUMENT-SERVER

<p align="center"><img src="https://user-images.githubusercontent.com/78145403/178549072-1ddc7a62-c9c7-4c76-a3c8-82db4d4ffec7.png" width=60%></p><br>
<p align="center"><img src="https://user-images.githubusercontent.com/81809575/180454090-ad43efb9-390c-4e76-ba09-2c0db6d0bf03.png" width=60%></p><br>
<p align="center"><img src="https://user-images.githubusercontent.com/81809575/180456406-580f643d-ffa4-43be-a33e-be7a26075a55.png" width=60%></p><br>
<p align="center"><img src="https://user-images.githubusercontent.com/81809575/180456533-59375ae5-3746-40e9-b555-78a23e0087e6.png" width=60%></p><br>
<p align="center"><img src="https://user-images.githubusercontent.com/81809575/180456738-8642c01b-40da-4889-afb6-abdf7f89ab57.png" width=60%></p><br>






## Contributors
<table align="center" style = "width: 100%;">
  <tr>
    <td align="center">
     <a href="https://github.com/hujumee">hujumee</a>
    </td>
    <td align="center">
     <a href="https://github.com/kimchaeeun3447">kimchaeeun3447</a>
    </td>
  </tr>
  <tr>
    <td>
      <img src= "https://user-images.githubusercontent.com/78145403/178553606-27fd8a04-b0cd-4119-9184-d04ff7ee9a9f.png"/> 
    </td>
    <td>
      <img src="https://user-images.githubusercontent.com/78145403/178553774-2272032c-e840-4b37-8943-c0cf89f20a4b.png"/> 
    </td>
  </tr>
  <tr>
    <td align="center">
     DB 스키마 설계<br>프로젝트 초기 세팅<br>홈 화면, 뮤멘트 리스트 조회, 히스토리 조회
    </td>
    <td align="center">
     DB 스키마 설계<br>프로젝트 초기 세팅<br>보관함, 검색, 뮤멘트 기록
    </td>
  </tr>
  
</table>
<br>

## Server Architecture
<p align="center"><img src="https://user-images.githubusercontent.com/81809575/180463246-0da9f1c5-f90e-4801-941e-e7095bc7c8ca.jpg" width=90%></p><br>

## API
[▶️ API 명세서](https://destiny-plum-124.notion.site/API-8e6aba4083374f7f8b3ff628046eb946)
| Method |  View | description               | 🎤담당  | progress   | issue |
| :----: | :------: | ------------------------- | :-----: | :-------:  | :---: |
| `POST` | 로그인    | 로그인                    |         | `✅ 완료`   |   [#24](https://github.com/team-MUMENT/MUMENT-SERVER/issues/24) |
| `GET`  | 홈       | 배너 조회                  | 🌊유정  | `✅ 완료`    |   [#49](https://github.com/team-MUMENT/MUMENT-SERVER/issues/49) |
| `GET`  |          | 오늘의 뮤멘트 조회          | 🌊유정  | `✅ 완료`    |   [#47](https://github.com/team-MUMENT/MUMENT-SERVER/issues/47) |
| `GET`  |          | 다시 들은 곡의 뮤멘트       | 🌊유정  | `✅ 완료`    |   [#51](https://github.com/team-MUMENT/MUMENT-SERVER/issues/51) | 
| `GET`  |          | 랜덤 태그, 랜덤 뮤멘트      | 🌊유정  | `✅ 완료`    |   [#30](https://github.com/team-MUMENT/MUMENT-SERVER/issues/30) |
| `GET`  |          | 곡 검색                    | 🎶채은  | `✅ 완료`    |   [#15](https://github.com/team-MUMENT/MUMENT-SERVER/issues/15) |
| `GET`  |          | 곡 상세 페이지 - 곡, 나의 뮤멘트 | 🌊유정  | `✅ 완료`    | [#7](https://github.com/team-MUMENT/MUMENT-SERVER/issues/7) |
| `GET`  |          | 곡 상세 페이지 - 모든 뮤멘트 조회 | 🌊유정  | `✅ 완료`    | [#12](https://github.com/team-MUMENT/MUMENT-SERVER/issues/12) |
| `GET`  | 기록하기  | 처음/다시 들어요 선택       | 🎶채은  | `✅ 완료`    |   [#19](https://github.com/team-MUMENT/MUMENT-SERVER/issues/19) |
| `POST` |          | 뮤멘트 기록하기             | 🎶채은  | `✅ 완료` | [#4](https://github.com/team-MUMENT/MUMENT-SERVER/issues/4) |
| `PUT`  |          | 뮤멘트 수정하기             | 🎶채은  | `✅ 완료` |   [#27](https://github.com/team-MUMENT/MUMENT-SERVER/issues/27) |
| `GET`  |          | 뮤멘트 상세보기             | 🎶채은  | `✅ 완료` | [#6](https://github.com/team-MUMENT/MUMENT-SERVER/issues/6) |
|`DELETE`|          | 뮤멘트 삭제하기             | 🎶채은  | `✅ 완료`    |   [#28](https://github.com/team-MUMENT/MUMENT-SERVER/issues/28) |
| `GET`  |          | 나의 히스토리               | 🌊유정  | `✅ 완료`    |   [#13](https://github.com/team-MUMENT/MUMENT-SERVER/issues/13) |
| `GET`  | 보관함    | 내가 작성한 뮤멘트 리스트   | 🎶채은  | `✅ 완료`    | [#10](https://github.com/team-MUMENT/MUMENT-SERVER/issues/10)    |
| `GET`  |           | 좋아요한 뮤멘트 리스트      | 🎶채은  | `✅ 완료`     | [#14](https://github.com/team-MUMENT/MUMENT-SERVER/issues/14)    |
| `POST` | 좋아요    | 뮤멘트 좋아요 등록          | 🌊유정  | `✅ 완료`    |   [#21](https://github.com/team-MUMENT/MUMENT-SERVER/issues/21) |
|`DELETE`|           | 뮤멘트 좋아요 취소         | 🌊유정  | `✅ 완료`    |   [#21](https://github.com/team-MUMENT/MUMENT-SERVER/issues/21) |


## Collection
[▶️ db 콜렉션 스키마](https://destiny-plum-124.notion.site/DB-50509752267446ca9f81dde9f0358d89)
<br>

## Foldering
```
📦src
┣ 📂config
┣ 📂controllers
┣ 📂interfaces
┃  ┣ 📂common
┃  ┣ 📂like
┃  ┣ 📂mument
┃  ┣ 📂music
┃  ┣ 📂user
┣ 📂loaders
┣ 📂models
┣ 📂modules
┣ 📂routes
┣ 📂services
┣ 📜index.ts
```

## Dependency
```
"devDependencies": {
        "@types/express": "^4.17.13",
        "@types/mongoose": "^5.11.97",
        "@types/node": "^17.0.25",
        "@typescript-eslint/eslint-plugin": "^5.30.5",
        "@typescript-eslint/parser": "^5.30.5",
        "eslint": "^8.19.0",
        "eslint-config-prettier": "^8.5.0",
        "eslint-plugin-prettier": "^4.2.1",
        "nodemon": "^2.0.15",
        "prettier": "^2.7.1",
        "ts-node": "^10.7.0",
        "typescript": "^4.6.3"
},
"dependencies": {
        "axios": "^0.27.2",
        "dayjs": "^1.11.3",
        "dotenv": "^16.0.0",
        "express": "^4.17.3",
        "express-validator": "^6.14.0",
        "husky": "^8.0.1",
        "mongoose": "^6.3.1"
}
```

## Commit Convention
| 태그  |                             설명                             |
| :--------: | :----------------------------------------------------------: |
|   [FEAT]   |                       새기능 추가                             |
|    [ADD]   |             부수적인 코드 추가, 라이브러리 추가, 새 파일 생성    |
|    [MOD]   |                  로직 변경, 코드 영향을 주는 수정               |
|    [DEL]   |                     코드 삭제                                 |
|    [FIX]   |                       버그 수정                               |
|   [CHORE]  |                  코드에 영향을 주지 않는 수정                  |
| [REFACTOR] |                   코드 리팩토링                               |
|   [TEST]   |                     테스트 코드 작성, 수정                     |
|   [DOCS]   |                     문서 업데이트                             |
<br>

## Branch Strategy
| 브랜치  |                             설명                             |
| :--------: | :----------------------------------------------------------: |
|   main  |                       배포용 브랜치                           |
|    dev   |             개발용 브랜치    |
|   dev_chaen | 채은 develop 브랜치 |
| dev_youju | 유정 develop 브랜치 |
<details>
<summary>Git Workflow</summary>
<div markdown="1">  

```
1) issue 등록
2) 로컬 dev_본인 브랜치에서 각자 기능 별 개발
3) 작업 완료 시 issue number와 함께 commit, push
2) dev 브랜치에 PR
3) 코드리뷰 후 merge
```
</div>
</details>
<br>

## Coding Convention
<details>
<summary>coding convention</summary>
<div markdown="1">  

```
- 인터페이스명: 🐫UpperCammelCase
- 파일명: 🐫UpperCammelCase
- 변수명: 🐪lowerCammelCase
    - 명사 + 명사
    - 복수 쓰지 않기
    List나 개수를 나타내는 단어로 쓸 것
    - 배열 생성 시
    foos:Foo[] 이런식으로 작성
    
- 함수명: 🐪lowerCammelCase
    - 동사 + 명사
    
- DB 파일명: 🐪lowerCammelCase

- 상수: 대문자

- 따옴표: ‘’(작은 따옴표- 백틱은 예외)

- 축약 가능한 단어
    - num
    - req
    - res
    - 그 외 단어 축약하지 않기
    
- 세미콜론 꼭 달기

- 중괄호
    // 나쁜 예
    wrongExample()
    {
    	const isServerWeak = true;
    }
    
    // 좋은 예
    goodExample() {
    	const isServerBest = true;
    };
        
- 주석
    // 한줄 주석
    
    /**
    * 여러줄
    * 주석
    */
    
    컨트롤러 주석
    /**
    * @ROUTE
    * @DESC
    */
```
</div>
</details>
<br>

