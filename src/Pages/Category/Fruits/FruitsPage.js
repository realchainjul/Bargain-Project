import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import style from './FruitsPage.module.scss';
import { VscHeart, VscHeartFilled } from 'react-icons/vsc';

const FruitsPage = () => {
  const [fruits, setFruits] = useState([]); // 과일 데이터 저장
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
  const navigate = useNavigate(); // 페이지 이동 함수

  // 로그인 상태 확인
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get('https://api.bargainus.kr/info', { withCredentials: true });
        if (response.status === 200 && response.data.nickname) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  // 과일 목록 불러오기
  useEffect(() => {
    const fetchFruits = async () => {
      try {
        const response = await axios.get('https://api.bargainus.kr/category/fruits', { withCredentials: true });
        if (response.status === 200) {
          setFruits(response.data);
        } else {
          alert('과일 데이터를 불러오는 데 실패했습니다.');
        }
      } catch (error) {
        console.error('과일 데이터 불러오기 오류:', error);
        alert('서버와 연결할 수 없습니다.');
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    fetchFruits();
  }, []);

  // 찜 버튼 클릭 핸들러
  const handleLike = async (fruit) => {
    if (!isLoggedIn) {
      alert('로그인 후 이용 가능합니다.');
      navigate('/login'); // 로그인 페이지로 이동
      return;
    }

    try {
      const response = await axios.get(
        `https://api.bargainus.kr/products/${fruit.pcode}/liked`,
        { withCredentials: true }
      );

      if (response.status === 200) {
        const { likedStatus, message } = response.data; // 서버 응답에서 likedStatus와 메시지 추출
        alert(message); // 메시지 출력

        // fruits 상태를 업데이트
        setFruits((prevFruits) =>
          prevFruits.map((item) =>
            item.pcode === fruit.pcode ? { ...item, likedStatus } : item
          )
        );
      }
    } catch (error) {
      console.error('찜 요청 오류:', error);
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        navigate('/login');
      } else {
        alert('서버와 연결할 수 없습니다.');
      }
    }
  };

  if (loading) {
    return <div className={style.loading}>로딩 중...</div>;
  }

  return (
    <div className={style.fruitsPage}>
      <h1>과일</h1>
      <div className={style.fruitsList}>
        {fruits.map((fruit) => (
          <div key={fruit.pcode} className={style.fruitCard}>
            <img
              src={fruit.photo || '/images/default.jpg'} // 이미지가 없을 경우 기본 이미지 사용
              alt={fruit.name}
              className={style.fruitImage}
              onClick={() => navigate(`/fruits/products/${fruit.pcode}`)} // 상세 페이지로 이동
            />
            <div className={style.fruitInfo}>
              <h2>{fruit.name}</h2>
              <p>{Number(fruit.price).toLocaleString()} 원</p>
              <button
                className={style.likeButton}
                onClick={(e) => {
                  e.stopPropagation(); // 부모 클릭 이벤트 전파 방지
                  handleLike(fruit);
                }}
              >
                {fruit.likedStatus ? (
                  <VscHeartFilled size="20" style={{ color: '#ff4757' }} />
                ) : (
                  <VscHeart size="20" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FruitsPage;
