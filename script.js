/**
 * --------------------------------------------------------------------------
 * モバイルメニュー（ハンバーガーメニュー）の制御
 * --------------------------------------------------------------------------
 */
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // メニューを開閉する処理
  const toggleMenu = () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', !isExpanded);
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // 背景のスクロールを固定・解除（メニューが開いているときはスクロールさせない）
    if (!isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  menuToggle.addEventListener('click', toggleMenu);

  // ナビゲーションリンクをクリックしたらメニューを自動で閉じる
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('active')) {
        toggleMenu();
      }
    });
  });
});

/**
 * --------------------------------------------------------------------------
 * ヘッダーの高さを考慮したスムーズスクロールの実装
 * --------------------------------------------------------------------------
 */
document.addEventListener('DOMContentLoaded', () => {
  const scrollLinks = document.querySelectorAll('a[href^="#"]');
  const headerHeight = 60; // 固定ヘッダーの高さ（CSSで定義した60px）

  scrollLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // 対象要素の位置を取得
        const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
        // ヘッダーの高さを引いた目標スクロール位置を算出
        const offsetPosition = elementPosition - headerHeight;

        // スムーズにスクロール
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
});

/**
 * --------------------------------------------------------------------------
 * Intersection Observer（交差監視）によるスクロールフェードインアニメーション
 * --------------------------------------------------------------------------
 */
document.addEventListener('DOMContentLoaded', () => {
  // アニメーション対象のクラス名を持つ要素をすべて取得
  const animateElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');

  // 交差時に実行する処理の定義
  const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
      // 要素が画面（ビューポート）に入ってきた場合
      if (entry.isIntersecting) {
        // .visible クラスを付与してCSSアニメーションをトリガー
        entry.target.classList.add('visible');
        // 一度フェードインした要素は監視を解除して、不要な再描画パフォーマンスロスを防ぐ
        observer.unobserve(entry.target);
      }
    });
  };

  // オブザーバーのオプション（画面の下部20%に入ったらトリガーする設定）
  const observerOptions = {
    root: null, // ブラウザのビューポートを基準にする
    rootMargin: '0px 0px -15% 0px', // トリガー位置を少し上にずらす
    threshold: 0.1 // 10%が見えたら実行
  };

  // オブザーバーの作成と監視の開始
  const observer = new IntersectionObserver(observerCallback, observerOptions);
  
  animateElements.forEach(element => {
    observer.observe(element);
  });
});

/**
 * --------------------------------------------------------------------------
 * お問い合わせフォームの送信処理 (FormSubmit APIの統合とCORSフォールバック)
 * --------------------------------------------------------------------------
 */
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const formMessage = document.getElementById('form-message');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault(); // 一旦、ページ遷移（通常の送信）をキャンセルして非同期送信を試みる
      
      // 送信ボタンを一時的に無効化し、ローディング状態を表示
      submitBtn.disabled = true;
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span>送信中...</span>';
      
      // フォームデータを FormData オブジェクトにまとめる
      // （FormDataを使用することで、JSON送信時のCORSエラーやOPTIONSプリフライトリクエストの発生を抑制します）
      const formData = new FormData(contactForm);
      // メールの件名（サブジェクト）をデータに追加
      formData.append('_subject', 'ポートフォリオサイトからのお問い合わせ');

      // 非同期（バックグラウンド）でのメール送信を試行
      fetch('https://formsubmit.co/ajax/takeru.sadou@gmail.com', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('サーバーエラーが発生しました。');
        }
        return response.json();
      })
      .then(data => {
        // メッセージ表示領域を初期化
        formMessage.className = 'form-message';
        formMessage.style.display = 'none';
        
        if (data.success === 'true' || data.success === true) {
          // 送信成功時：お礼メッセージを表示し、フォームをリセット
          formMessage.classList.add('success');
          formMessage.textContent = 'お問い合わせありがとうございます。メッセージが正常に送信されました！';
          formMessage.style.display = 'block';
          
          contactForm.reset();
          
          // ボタンを元に戻す
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;

          // 8秒後に送信ステータスメッセージをフェードアウトで非表示にする
          setTimeout(() => {
            formMessage.style.opacity = '0';
            formMessage.style.transition = 'opacity 1s ease';
            setTimeout(() => {
              formMessage.style.display = 'none';
              formMessage.style.opacity = '1';
            }, 1000);
          }, 8000);
        } else {
          throw new Error('送信処理に失敗しました。');
        }
      })
      .catch(error => {
        // 【CORSエラーやローカル実行制限（file://）が発生した場合のフォールバック処理】
        // ブラウザのセキュリティ制限等で非同期送信が失敗した場合は、通常のフォーム送信（ページ遷移型）に切り替えて確実に送信します
        console.warn('非同期送信が制限されたため、標準送信へ切り替えます:', error);
        
        formMessage.className = 'form-message';
        formMessage.style.display = 'none';
        formMessage.classList.add('error');
        formMessage.textContent = 'ローカル接続（CORS）制限を検知しました。確実にお届けするため、専用の送信ページへ切り替えます...';
        formMessage.style.display = 'block';

        // 1.5秒後に、ブラウザの標準送信を実行（これによってFormSubmitの完了ページ・認証画面へ遷移し、メールが確実に届きます）
        setTimeout(() => {
          contactForm.submit(); // ネイティブの送信メソッドを呼び出し、通常のPOSTを実行します
        }, 1500);
      });
    });
  }
});
