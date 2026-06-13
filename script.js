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

  // オブザーバーのオプション（画面の下部に入ったらトリガーする設定）
  const observerOptions = {
    root: null, // ブラウザのビューポートを基準にする
    rootMargin: '0px 0px -10px 0px', // 画面の下端から10pxだけ入った地点で即時検知（取りこぼしを完全に防ぐ）
    threshold: 0.01 // 要素の1%でも画面に入ったらすぐにフェードインを開始させて確実に動かす（最大感度）
  };

  // オブザーバーの作成と監視の開始
  const observer = new IntersectionObserver(observerCallback, observerOptions);
  
  animateElements.forEach(element => {
    observer.observe(element);
  });
});

/**
 * --------------------------------------------------------------------------
 * お問い合わせフォームの送信処理 (FormSubmit APIの統合 - 画面遷移なし送信)
 * --------------------------------------------------------------------------
 */
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const formMessage = document.getElementById('form-message');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault(); // 画面遷移（通常のフォーム送信）を防止してスムーズに処理します
      
      // 送信ボタンを一時的に無効化し、ローディング状態を表示
      submitBtn.disabled = true;
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span>送信中...</span>';
      
      // フォームデータを FormData オブジェクトにまとめる
      const formData = new FormData(contactForm);
      // メールの件名（サブジェクト）をデータに追加
      formData.append('_subject', 'ポートフォリオサイトからのお問い合わせ');

      // 非同期（バックグラウンド）でのメール送信を実行します。
      // mode: 'no-cors' を指定することで、ローカルファイル(file://)からの送信時に発生する
      // ブラウザのCORS制限（クロスドメイン制限）をバイパスして、画面遷移なしで確実に送信します。
      fetch('https://formsubmit.co/ajax/takeru.sadou@gmail.com', {
        method: 'POST',
        body: formData,
        mode: 'no-cors' // CORSポリシーによるブロックを回避し、送信を成功させるモード
      })
      .then(() => {
        // mode: 'no-cors' のレスポンスは中身を読み取れない仕様ですが、
        // 通信自体が成功（サーバーへ送信完了）すれば、ここが実行されます。
        
        // メッセージ表示領域を初期化
        formMessage.className = 'form-message';
        formMessage.style.display = 'none';
        
        // 送信成功メッセージを表示
        formMessage.classList.add('success');
        formMessage.textContent = 'お問い合わせありがとうございます。メッセージが正常に送信されました！';
        formMessage.style.display = 'block';
        
        // 入力フォームの内容をリセット
        contactForm.reset();
      })
      .catch(error => {
        // インターネット接続が切れている場合などのエラーハンドリング
        formMessage.className = 'form-message';
        formMessage.style.display = 'none';
        formMessage.classList.add('error');
        formMessage.textContent = '送信中にエラーが発生しました。恐れ入りますが時間をおいて再度お試しください。';
        formMessage.style.display = 'block';
        console.error('Email Submit Error:', error);
      })
      .finally(() => {
        // ボタンの状態を元に戻す
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        
        // 8秒後に送信完了メッセージをフェードアウトで非表示にする
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
});
