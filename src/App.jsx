import { useEffect, useMemo, useRef, useState } from 'react';

const weddingDate = new Date('2026-09-24T18:00:00+08:00');
const weddingVenue = '四川省资中县喜悦玫瑰花语宴会中心';
const amapSearchParams = `keyword=${encodeURIComponent(weddingVenue)}&city=${encodeURIComponent('内江市')}&view=map`;
const amapUrl = `https://uri.amap.com/search?${amapSearchParams}&callnative=1`;
const amapKey = '2c4e88f3b767db0de947d306d17b7b7c';
const amapSecurityCode = '04344977613a3a9c257ced37751adc5a';
const defaultVenuePosition = [104.851, 29.772];
const venueMapZoom = 15;
const musicSrc = '/wedding-music.mp3';
let amapLoader;

const photos = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1460364157752-926555421a7e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&w=900&q=80',
];

const petals = Array.from({ length: 16 }, (_, index) => ({
  id: index,
  image: `/petal-${(index % 3) + 1}.png`,
  left: `${(index * 17) % 100}%`,
  drift: `${index % 2 === 0 ? 1 : -1}px`,
  scale: (0.38 + (index % 5) * 0.08).toFixed(2),
  opacity: (0.72 + (index % 4) * 0.06).toFixed(2),
  rotate: `${(index * 37) % 180}deg`,
  delay: `${(index % 8) * 0.75}s`,
  duration: `${10 + (index % 6)}s`,
}));

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
        {[
          ['天', days],
          ['时', hours],
          ['分', minutes],
          ['秒', seconds],
        ].map(([label, value]) => (
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
          zoom: venueMapZoom,
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
          map.setZoomAndCenter(venueMapZoom, position);
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
          setMapTip('已显示资中县附近，可点击下方按钮在高德中查看精确地点');
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

function Petals() {
  return (
    <div className="petals" aria-hidden="true">
      {petals.map((petal) => (
        <span
          className="petal"
          key={petal.id}
          style={{
            '--petal-image': `url(${petal.image})`,
            '--petal-drift': petal.drift,
            '--petal-scale': petal.scale,
            '--petal-opacity': petal.opacity,
            '--petal-rotate': petal.rotate,
            left: petal.left,
            animationDelay: petal.delay,
            animationDuration: petal.duration,
          }}
        />
      ))}
    </div>
  );
}

export default function App() {
  const audioRef = useRef(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  useEffect(() => {
    let animationFrame;
    let startTime;
    let isCancelled = false;
    const startDelay = 2200;
    const scrollDuration = 62000;
    const easing = 0.075;

    const cancelAutoScroll = () => {
      isCancelled = true;
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };

    const step = (timestamp) => {
      if (isCancelled) return;
      if (!startTime) startTime = timestamp;

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;

      const progress = Math.min((timestamp - startTime) / scrollDuration, 1);
      const target = maxScroll * progress;
      const current = window.scrollY || document.documentElement.scrollTop;
      const next = current + (target - current) * easing;
      document.documentElement.scrollTop = next;
      document.body.scrollTop = next;

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    const startTimer = window.setTimeout(() => {
      animationFrame = requestAnimationFrame(step);
    }, startDelay);

    window.addEventListener('wheel', cancelAutoScroll, { passive: true, once: true });
    window.addEventListener('touchstart', cancelAutoScroll, { passive: true, once: true });
    window.addEventListener('keydown', cancelAutoScroll, { once: true });

    return () => {
      window.clearTimeout(startTimer);
      cancelAutoScroll();
      window.removeEventListener('wheel', cancelAutoScroll);
      window.removeEventListener('touchstart', cancelAutoScroll);
      window.removeEventListener('keydown', cancelAutoScroll);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.55;
    const tryPlay = () => {
      const playPromise = audio.play();

      if (playPromise) {
        playPromise
          .then(() => setIsMusicPlaying(true))
          .catch(() => setIsMusicPlaying(false));
      }
    };

    tryPlay();
    document.addEventListener('WeixinJSBridgeReady', tryPlay, { once: true });
    window.addEventListener('touchstart', tryPlay, { once: true });
    window.addEventListener('click', tryPlay, { once: true });

    return () => {
      document.removeEventListener('WeixinJSBridgeReady', tryPlay);
      window.removeEventListener('touchstart', tryPlay);
      window.removeEventListener('click', tryPlay);
    };
  }, []);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio
        .play()
        .then(() => setIsMusicPlaying(true))
        .catch(() => setIsMusicPlaying(false));
      return;
    }

    audio.pause();
    setIsMusicPlaying(false);
  };

  return (
    <div className="page">
      <Petals />
      <audio ref={audioRef} src={musicSrc} loop autoPlay playsInline preload="auto" />
      <main className="invitation-card">
        <span className="decorative-flower flower-left" aria-hidden="true" />
        <span className="decorative-flower flower-right" aria-hidden="true" />
        <header className="hero section" id="home">
          <button
            className={`music-button ${isMusicPlaying ? 'is-playing' : 'is-paused'}`}
            type="button"
            aria-label={isMusicPlaying ? '暂停背景音乐' : '播放背景音乐'}
            aria-pressed={isMusicPlaying}
            onClick={toggleMusic}
          >
            <span aria-hidden="true">♪</span>
          </button>
          <div className="heart-mark">♥</div>
          <p className="domain">Wedding Invitation</p>
          <div className="ornament" aria-hidden="true" />
          <h1>我们结婚啦</h1>
          <p className="subtitle">诚挚邀请您见证我们的幸福时刻</p>

          <div className="portrait-frame" aria-label="新人合影剪影">
            <img className="couple-photo" src="/couple-photo.JPG" alt="王刚和谢何丽婚纱照" />
            <span className="gold-heart">♥</span>
          </div>

          <div className="names">
            <div>
              <strong>王刚</strong>
              <span>Wang Gang</span>
            </div>
            <i>♥</i>
            <div>
              <strong>谢何丽</strong>
              <span>Xie Heli</span>
            </div>
          </div>
        </header>

        <section className="section wedding-details" aria-label="婚礼信息">
          <article>
            <span className="detail-icon">▣</span>
            <p>婚礼日期</p>
            <strong>2026.09.24</strong>
            <small>星期四</small>
          </article>
          <article>
            <span className="detail-icon">◷</span>
            <p>婚礼时间</p>
            <strong>18:00</strong>
            <small>晚宴启席</small>
          </article>
          <article>
            <span className="detail-icon">⌖</span>
            <p>婚礼地点</p>
            <strong>喜悦玫瑰花语</strong>
            <small>宴会中心</small>
          </article>
        </section>

        <section className="section soft-panel">
          <h2>浪漫倒计时</h2>
          <Countdown />
        </section>

        <section className="section soft-panel story" id="story">
          <h2>爱情故事</h2>
          <p>
            从相遇到相知，从心动到相守，我们把每一个平凡日子都写成了温柔的章节。愿这一天，有您在场，见证我们把余生交给彼此。
          </p>
        </section>

        <section className="section soft-panel" id="gallery">
          <h2>照片墙</h2>
          <div className="gallery">
            {photos.map((photo, index) => (
              <img key={photo} src={photo} alt={`新人回忆 ${index + 1}`} loading="lazy" />
            ))}
          </div>
        </section>

        <section className="section soft-panel" id="map">
          <h2>婚礼地图</h2>
          <div className="map-wrap" aria-label="婚礼地点导航">
            <WeddingMap />
            <p className="map-address">{weddingVenue}</p>
            <a className="btn map-btn" href={amapUrl} target="_blank" rel="noreferrer">
              打开高德地图导航
            </a>
          </div>
        </section>

        <section className="section rsvp" id="rsvp">
          <p>诚挚邀请您出席</p>
          <a className="btn" href="mailto:rsvp@wgxhl.space?subject=婚礼出席确认">
            回复出席
          </a>
        </section>

        <nav className="bottom-nav" aria-label="婚礼邀请导航">
          <a href="#home">
            <span>♡</span>
            关于我们
          </a>
          <a href="#story">
            <span>▧</span>
            爱情故事
          </a>
          <a href="#gallery">
            <span>♧</span>
            礼金祝福
          </a>
          <a href="#map">
            <span>✉</span>
            联系新人
          </a>
        </nav>
      </main>
    </div>
  );
}
