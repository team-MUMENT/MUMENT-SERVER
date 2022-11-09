import request from 'supertest';
import app from '../src/index';
import UserService from '../src/services/UserService';

describe('UserService 테스트', () => {
    describe('GET 보관함 나의 뮤멘트 조회 테스트', () => {
        it('보관함 나의 뮤멘트 조회 - 성공', done => {
            request(app)
                .get('/user/my/2/list')
                .set('Content-Type', 'application/json')
                .expect(200)
                .expect('Content-Type', /json/)
                .then(response => {
                    done();
                })
                .catch(error => {
                    console.error("TEST ERROR: ", error);
                    done(error);
                });
        });
    });

    describe('GET 보관함 좋아요한 뮤멘트 조회 테스트', () => {
        it('보관함 좋아요한 뮤멘트 조회 - 성공', done => {
            request(app)
                .get('/user/like/2/list')
                .set('Content-Type', 'application/json')
                .expect(200)
                .expect('Content-Type', /json/)
                .then(response => {
                    done();
                })
                .catch(error => {
                    console.error("TEST ERROR: ", error);
                    done(error);
                });
        });
    });
});