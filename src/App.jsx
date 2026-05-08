import { useEffect, useMemo, useRef, useState } from 'react';

const weddingDate = new Date('2026-09-24T18:00:00+08:00');
const weddingVenue = '四川省资中县喜悦玫瑰花语宴会中心';
const amapSearchParams = `keyword=${encodeURIComponent(weddingVenue)}&city=${encodeURIComponent('内江市')}&view=map`;
const amapUrl = `https://uri.amap.com/search?${amapSearchParams}&callnative=1`;
const amapKey = '2c4e88f3b767db0de947d306d17b7b7c';
const amapSecurityCode = '04344977613a3a9c257ced37751adc5a';
const defaultVenuePosition = [104.851, 29.772];
let amapLoader;

const photos = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1460364157752-926555421a7e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&w=900&q=80',
];

function loadAmap() {
  if (window.AMap) {
    return Promise.resolve(window.AMap);
  }

  if (amapLoader) {
    return amapLoader;
  }

  window._AMapSecurityConfig = {
    securityJsCode: amapSecurityCode,
  };

  amapLoader = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${amapKey}&plugin=AMap.Geocoder,AMap.Scale,AMap.ToolBar`;
    script.async = true;
    script.onload = () => resolve(window.AMap);
    script.onerror = () => reject(new Error('高德地图加载失败'));
    document.head.appendChild(script);
  });

  return amapLoader;
}

function Countdown() {
  const [timeLeft, setTimeLeft] = useState(() => weddingDate - new Date());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(weddingDate - new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { days, hours, minutes, seconds, isWeddingDay } = useMemo(() => {
    const total = Math.max(0, timeLeft);
    return {
      days: Math.floor(total / (1000 * 60 * 60 * 24)),
      hours: Math.floor((total / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((total / (1000 * 60)) % 60),
      seconds: Math.floor((total / 1000) % 60),
      isWeddingDay: timeLeft <= 0,
    };
  }, [timeLeft]);

  return (
    <>
      <div className="countdown-grid" aria-label="距离婚礼开始的倒计时">
        {[['天', days], ['时', hours], ['分', minutes], ['秒', seconds]].map(([label, value]) => (
          <div className="time-card" key={label}>
            <div className="time-value">{String(value).padStart(2, '0')}</div>
            <div className="time-label">{label}</div>
          </div>
        ))}
      </div>
      {isWeddingDay && <p className="countdown-done">今天，我们结婚啦</p>}
    </>
  );
}

function WeddingMap() {
  const mapRef = useRef(null);
  const [mapTip, setMapTip] = useState('地图加载中...');

  useEffect(() => {
    let map;
    let cancelled = false;

    loadAmap()
      .then((AMap) => {
        if (cancelled || !mapRef.current) return;

        map = new AMap.Map(mapRef.current, {
          zoom: 16,
          center: defaultVenuePosition,
          viewMode: '2D',
          resizeEnable: true,
        });

        map.addControl(new AMap.Scale());
        map.addControl(new AMap.ToolBar({ position: 'RB' }));

        const placeMarker = (position) => {
          const marker = new AMap.Marker({
            position,
            title: weddingVenue,
          });

          map.add(marker);
          map.setZoomAndCenter(17, position);
          setMapTip('');
        };

        const geocoder = new AMap.Geocoder({
          city: '内江市',
        });

        geocoder.getLocation(weddingVenue, (status, result) => {
          if (cancelled) return;

          const location = result?.geocodes?.[0]?.location;
          if (status === 'complete' && location) {
            placeMarker([location.lng, location.lat]);
            return;
          }

          placeMarker(defaultVenuePosition);
          setMapTip('已显示资中县附近，点击下方按钮可在高德中查看精确地点');
        });
      })
      .catch(() => {
        if (!cancelled) {
          setMapTip('地图暂时无法加载，请点击下方按钮打开高德地图');
        }
      });

    return () => {
      cancelled = true;
      map?.destroy();
    };
  }, []);

  return (
    <>
      <div className="wedding-map" ref={mapRef} aria-label="婚礼地点地图" />
      {mapTip && <p className="map-tip">{mapTip}</p>}
    </>
  );
}

export default function App() {
  return (
    <div className="page">
      <header className="hero section">
        <p className="domain">wgxhl.space</p>
        <h1>王刚 & 谢何丽</h1>
        <p className="subtitle">诚挚邀请您参加我们的婚礼</p>
        <p className="date">2026年9月24日 · 18:00 · 喜悦玫瑰花语宴会中心</p>
        <a className="btn" href="#rsvp">立即 RSVP</a>
      </header>

      <section className="section glass">
        <h2>婚礼信息</h2>
        <ul className="info-list">
          <li><strong>婚礼时间：</strong>2026年9月24日（周四）18:00</li>
          <li><strong>婚礼地点：</strong>{weddingVenue}</li>
          <li><strong>着装建议：</strong>优雅正式 / 浅色系</li>
        </ul>
      </section>

      <section className="section glass">
        <h2>浪漫倒计时</h2>
        <Countdown />
      </section>

      <section className="section glass">
        <h2>婚礼地图</h2>
        <div className="map-wrap" aria-label="婚礼地点导航">
          <WeddingMap />
          <p className="map-address">{weddingVenue}</p>
          <a className="btn map-btn" href={amapUrl} target="_blank" rel="noreferrer">
            打开高德地图导航
          </a>
        </div>
      </section>

      <section className="section glass">
        <h2>照片墙</h2>
        <div className="gallery">
          {photos.map((photo) => (
            <img key={photo} src={photo} alt="couple memory" loading="lazy" />
          ))}
        </div>
      </section>

      <section className="section glass" id="rsvp">
        <h2>RSVP</h2>
        <p>请于 2026年9月15日前 告知我们您的出席安排。</p>
        <a className="btn" href="mailto:rsvp@wgxhl.space?subject=婚礼出席确认">点击回复出席</a>
      </section>
    </div>
  );
}
