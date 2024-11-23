import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import style from './Payment.module.scss';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bills } = location.state || []; // `Cart`에서 전달된 bills 데이터
  const [userAddress, setUserAddress] = useState(null); // 사용자 정보 저장
  const [paymentMethod, setPaymentMethod] = useState('카드'); // 결제 방법
  const [loading, setLoading] = useState(false);

  // 사용자 정보 불러오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('https://api.bargainus.kr/info', {
          withCredentials: true,
        });
        if (response.status === 200 && response.data) {
          setUserAddress(response.data); // 사용자 주소 정보 저장
        } else {
          throw new Error('Failed to fetch user address');
        }
      } catch (error) {
        console.error('Error fetching user address:', error);
        alert('사용자 정보를 불러오는 데 실패했습니다. 다시 로그인해주세요.');
        navigate('/login');
      }
    };

    fetchUserInfo();
  }, [navigate]);

  // 총 결제 금액 계산
  const calculateTotalPrice = () => {
    return bills.reduce((total, bill) => total + bill.totalPrice, 0);
  };

  // 결제 요청 처리
  const handlePayment = async () => {
    if (!bills || bills.length === 0) {
      alert('결제할 상품이 없습니다.');
      return;
    }

    setLoading(true);

    const paymentData = bills.map((bill) => ({
      billCode: bill.billCode,
      productName: bill.productName,
      count: bill.count,
      price: bill.price,
      totalPrice: bill.totalPrice,
    }));

    const params = new URLSearchParams({
      postalCode: userAddress.postalCode,
      address: userAddress.address,
      detailAddress: userAddress.detailAddress,
    });

    try {
      const response = await axios.put(
        `https://api.bargainus.kr/bills/update?${params.toString()}`,
        paymentData,
        { withCredentials: true }
      );

      if (response.status === 200 && response.data.status) {
        navigate('/order-success', { state: { message: response.data.message } });
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert('결제 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (!bills || !userAddress) {
    return <div className={style.loading}>결제 정보를 불러오는 중...</div>;
  }

  return (
    <div className={style.paymentPage}>
      <h1 className={style.title}>결제 페이지</h1>

      {/* 배송 정보 */}
      <section className={style.addressSection}>
        <h2>배송 정보</h2>
        <p>이름: {userAddress.name}</p>
        <p>전화번호: {userAddress.phoneNumber}</p>
        <p>주소: {userAddress.address}, {userAddress.detailAddress}</p>
        <p>우편번호: {userAddress.postalCode}</p>
      </section>

      {/* 결제 상품 정보 */}
      <section className={style.billSection}>
        <h2>결제 상품 정보</h2>
        {bills.map((bill) => (
          <div key={bill.billCode} className={style.billItem}>
            <p>상품명: {bill.productName}</p>
            <p>수량: {bill.count}</p>
            <p>총 금액: {bill.totalPrice.toLocaleString()} 원</p>
          </div>
        ))}
      </section>

      {/* 총 금액 */}
      <section className={style.totalPriceSection}>
        <h2>총 결제 금액</h2>
        <p className={style.totalPrice}>{calculateTotalPrice().toLocaleString()} 원</p>
      </section>

      {/* 결제 방법 선택 */}
      <section className={style.paymentMethod}>
        <h2>결제 방법</h2>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className={style.methodSelect}
        >
          <option value="카드">카드</option>
          <option value="계좌이체">계좌이체</option>
          <option value="휴대폰 결제">휴대폰 결제</option>
        </select>
      </section>

      {/* 결제 버튼 */}
      <div className={style.actions}>
        <button
          className={style.paymentButton}
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? '결제 진행 중...' : '결제하기'}
        </button>
      </div>
    </div>
  );
};

export default Payment;
