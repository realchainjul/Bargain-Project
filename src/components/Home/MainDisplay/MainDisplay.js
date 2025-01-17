import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import style from './MainDisplay.module.scss';
import ProductHeader from '../../Product/ProductHeader';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import axios from 'axios';

export default function MainDisplay({ endpoint, name }) {
  const [data, setData] = useState([]); // 상품 데이터 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const navigate = useNavigate(); // 페이지 이동 함수

  // API를 통해 상품 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://api.bargainus.kr/category/${endpoint}`);
        if (response.status === 200) {
          setData(response.data); // 데이터 저장
        } else {
          alert(`${name} 데이터를 불러오는 데 실패했습니다.`);
        }
      } catch (error) {
        console.error('데이터 불러오기 오류:', error);
        alert('서버와 연결할 수 없습니다.');
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    fetchData();
  }, [endpoint, name]);

  if (loading) {
    return <div className={style.loading}>로딩 중...</div>;
  }

  if (data.length === 0) {
    return <div className={style.error}>상품이 없습니다.</div>;
  }

  return (
    <div className={style.mainProduct}>
      <div className={style.container}>
        <ProductHeader name={name} className={style.header} />
        <div className={style.row}>
          <Swiper
            className={style.swiper}
            modules={[Pagination, Navigation, Autoplay]}
            loop={true} // 루프 슬라이드
            autoplay={{ delay: 3000 }} // 자동 슬라이드
            spaceBetween={20} // 슬라이드 간격
            slidesPerView={5} // 한 번에 보여지는 슬라이드 개수
            pagination={{ clickable: true }} // 페이지네이션 활성화
            style={{
              "--swiper-navigation-color": "#383810",
              "--swiper-navigation-size": "40px",
              "--swiper-pagination-color": "#383810"
            }}
            breakpoints={{
              1800: {
                slidesPerView: 5,
              },
              1320: {
                slidesPerView: 4,
              },
              1024: {
                slidesPerView: 3,
              },
              0: {
                slidesPerView: 2,
              },
            }}
          >
            {data.map((product) => (
              <SwiperSlide key={product.id} className={style.productCard}>
                {/* 상품 카드 클릭 시 상세 페이지로 이동 */}
                <div
                  className={style.productContent}
                  onClick={() => {
                    console.log('Navigating to:', `/${endpoint}/products/${product.pcode}`); // 콘솔에 경로 확인
                    console.log('Product PCode:', product.pcode); // pcode 값 확인
                    navigate(`/${endpoint}/products/${product.pcode}`);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={product.photo || '/images/default.jpg'}
                    alt={product.name}
                    className={style.productImage}
                  />
                  <div className={style.productInfo}>
                    <h3>{product.name}</h3>
                    <p>{Number(product.price).toLocaleString()} 원</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
