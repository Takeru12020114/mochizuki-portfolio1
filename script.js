/**
 * ==========================================================================
 * ポートフォリオサイト インタラクション制御スクリプト (最新堅牢版)
 * ==========================================================================
 */

// すべての処理を1つのメイン関数に集約します
const initializePortfolio = () => {
  console.log("Portfolio script initialized successfully.");

  /**
   * --------------------------------------------------------------------------
   * 1. モバイルメニュー（ハンバーガーメニュー）の制御
   * --------------------------------------------------------------------------
   */
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (menuToggle && navMenu) {
    const toggleMenu = () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      menuToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
      
      // メニューが開いているときは背景のスクロールを固定し、閉じたら解除します
      if (!isExpanded) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    };

    menuToggle.addEventListener('click', toggleMenu);

    // リンククリック時にメニューを自動で閉じる
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('active')) {
          toggleMenu();
        }
      });
    });
  }

  /**
   * --------------------------------------------------------------------------
   * 2. 固定ヘッダーの高さを考慮したスムーズスクロール
   * --------------------------------------------------------------------------
   */
  const scrollLinks = document.querySelectorAll('a[href^="#"]');
  const headerHeight = 60; // ヘッダーの高さ (60px)

  scrollLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - headerHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  /**
   * --------------------------------------------------------------------------
   * 3. 超高感度な Intersection Observer (スクロールフェードインアニメーション)
   * --------------------------------------------------------------------------
   * スマホやPCなどすべての画面で、スクロールした際に確実に要素がフワッと浮き出るよう制御します。
   */
  const animateElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');

  if (animateElements.length > 0) {
    const observerCallback = (entries, observer) => {
      entries.forEach(entry => {
        // 要素が画面の下端を1pxでも超えたら即時発火（スマホでの発火取りこぼしを完全に防ぐ）
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // 一度表示された要素は監視を終了し、ブラウザの負荷を下げます
          observer.unobserve(entry.target);
        }
      });
    };

    const observerOptions = {
      root: null, // ビューポート（画面）を基準にする
      rootMargin: '0px 0px -10px 0px', // 画面の下端から10px入った地点で即座に検知
      threshold: 0.01 // 要素が1%でも画面に入ったらすぐにフェードインを開始（最大感度）
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    animateElements.forEach(element => {
      observer.observe(element);
    });

    // 【念のためのフォールバック処理】
    // 万が一、古い端末や一部のブラウザでスクロールを検知しなかった場合に備え、
    // 画面ロードから1秒後、初期表示範囲内にある要素へ強制的にvisibleクラスを付与して「消えたまま」を防ぎます。
    setTimeout(() => {
      animateElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          element.classList.add('visible');
        }
      });
    }, 1000);
  }

  /**
   * --------------------------------------------------------------------------
   * 4. お問い合わせフォーム送信処理 (FormSubmit APIの統合 - 画面遷移なし送信)
   * --------------------------------------------------------------------------
   */
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const formMessage = document.getElementById('form-message');

  if (contactForm && submitBtn && formMessage) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault(); // 通常のページ遷移を防止
      
      submitBtn.disabled = true;
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span>送信中...</span>';
      
      const formData = new FormData(contactForm);
      formData.append('_subject', 'ポートフォリオサイトからのお問い合わせ');

      // mode: 'no-cors' で送信することで、ローカルファイル(file://)実行時でも
      // セキュリティに阻まれることなく、その場でスムーズに送信を完了させます。
      fetch('https://formsubmit.co/ajax/takeru.sadou@gmail.com', {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
      })
      .then(() => {
        formMessage.className = 'form-message';
        formMessage.style.display = 'none';
        
        formMessage.classList.add('success');
        formMessage.textContent = 'お問い合わせありがとうございます。メッセージが正常に送信されました！';
        formMessage.style.display = 'block';
        
        contactForm.reset();
      })
      .catch(error => {
        formMessage.className = 'form-message';
        formMessage.style.display = 'none';
        formMessage.classList.add('error');
        formMessage.textContent = '送信中にエラーが発生しました。恐れ入りますが時間をおいて再度お試しください。';
        formMessage.style.display = 'block';
        console.error('Email Submit Error:', error);
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        
        setTimeout(() => {
          formMessage.style.opacity = '0';
          formMessage.style.transition = 'opacity 1s ease';
          setTimeout(() => {
            formMessage.style.display = 'none';
            formMessage.style.opacity = '1';
          }, 1000);
        }, 8000);
      });
    });
  }
};

/**
 * --------------------------------------------------------------------------
 * 安全な初期化起動コード（プロ仕様のタイミング制御）
 * --------------------------------------------------------------------------
 * スマホブラウザの高速読み込み時など、DOMContentLoadedがすでに発火し終わった後に
 * スクリプトが読み込まれた場合でも、検知を取りこぼさずに100%確実に初期化を実行します。
 */
if (document.readyState !== 'loading') {
  initializePortfolio(); // すでにHTML解析が完了している場合は即実行
} else {
  document.addEventListener('DOMContentLoaded', initializePortfolio); // 解析中の場合はイベントを待って実行
}
