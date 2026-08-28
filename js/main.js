/**
 * 合同会社礎運送 ロードサービスサイト
 * ヘッダー制御・ハンバーガーメニュー・スムーススクロール・FAQアコーディオン・フォーム検証
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------
   * 1. ヘッダーのスクロール連動
   * ------------------------------------------------------------- */
  var header = document.getElementById('header');
  if (header) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        header.classList.toggle('is-scrolled', window.scrollY > 40);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------------------------------------------------------------
   * 2. ハンバーガーメニュー
   * ------------------------------------------------------------- */
  var hamburger = document.getElementById('hamburger');
  var nav = document.getElementById('global-nav');

  function closeMenu() {
    if (!hamburger || !nav) return;
    hamburger.classList.remove('is-open');
    nav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'メニューを開く');
    document.body.style.overflow = '';
  }

  function openMenu() {
    if (!hamburger || !nav) return;
    hamburger.classList.add('is-open');
    nav.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'メニューを閉じる');
    document.body.style.overflow = 'hidden';
  }

  if (hamburger && nav) {
    hamburger.addEventListener('click', function () {
      if (hamburger.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // メニュー内リンクをクリックしたら閉じる
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Escapeキーで閉じる
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    // PC幅に戻ったら強制的に閉じる
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) closeMenu();
    });
  }

  /* ---------------------------------------------------------------
   * 3. スムーススクロール（ヘッダー高さ分オフセット）
   * ------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var headerH = header ? header.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - headerH - 12;
      window.scrollTo({
        top: Math.max(top, 0),
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
    });
  });

  /* ---------------------------------------------------------------
   * 4. スクロール連動フェードイン
   * ------------------------------------------------------------- */
  var fadeEls = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    fadeEls.forEach(function (el) { observer.observe(el); });
  } else {
    // 非対応環境・モーション配慮時は即表示
    fadeEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------------------
   * 5. FAQアコーディオン
   * ------------------------------------------------------------- */
  document.querySelectorAll('.faq-item__button').forEach(function (button) {
    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      var panelId = button.getAttribute('aria-controls');
      var panel = panelId ? document.getElementById(panelId) : null;
      if (!panel) return;
      button.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  });

  /* ---------------------------------------------------------------
   * 6. お問い合わせフォームのバリデーション
   * ------------------------------------------------------------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var formStatus = document.getElementById('form-status');

    // フィールドのエラーを表示する
    function setError(field, message) {
      field.classList.add('is-error');
      field.setAttribute('aria-invalid', 'true');
      var errorEl = form.querySelector('.form-error[data-error-for="' + field.id + '"]');
      if (errorEl) errorEl.textContent = message;
    }

    // フィールドのエラーを消す
    function clearError(field) {
      field.classList.remove('is-error');
      field.removeAttribute('aria-invalid');
      var errorEl = form.querySelector('.form-error[data-error-for="' + field.id + '"]');
      if (errorEl) errorEl.textContent = '';
    }

    // 入力し直したらエラーをクリア
    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      var eventName = (field.tagName === 'SELECT') ? 'change' : 'input';
      field.addEventListener(eventName, function () { clearError(field); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var errors = [];
      var nameField = document.getElementById('name');
      var emailField = document.getElementById('email');
      var phoneField = document.getElementById('phone');
      var typeField = document.getElementById('inquiry-type');
      var messageField = document.getElementById('message');

      // 必須：お名前
      if (nameField && !nameField.value.trim()) {
        setError(nameField, 'お名前を入力してください');
        errors.push(nameField);
      }

      // 必須：メールアドレス（形式チェックあり）
      if (emailField) {
        var emailValue = emailField.value.trim();
        if (!emailValue) {
          setError(emailField, 'メールアドレスを入力してください');
          errors.push(emailField);
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
          setError(emailField, 'メールアドレスの形式が正しくありません');
          errors.push(emailField);
        }
      }

      // 任意：電話番号（入力があれば形式チェック）
      if (phoneField && phoneField.value.trim() && !/^[0-9\-]+$/.test(phoneField.value.trim())) {
        setError(phoneField, '電話番号は半角数字とハイフンで入力してください');
        errors.push(phoneField);
      }

      // 必須：お問い合わせ種別
      if (typeField && !typeField.value) {
        setError(typeField, 'お問い合わせ種別を選択してください');
        errors.push(typeField);
      }

      // 必須：お問い合わせ内容
      if (messageField && !messageField.value.trim()) {
        setError(messageField, 'お問い合わせ内容を入力してください');
        errors.push(messageField);
      }

      if (errors.length > 0) {
        // 最初のエラー項目へスクロールしてフォーカス
        var first = errors[0];
        var headerH = header ? header.offsetHeight : 0;
        var top = first.getBoundingClientRect().top + window.scrollY - headerH - 40;
        window.scrollTo({ top: Math.max(top, 0), behavior: reduceMotion ? 'auto' : 'smooth' });
        first.focus({ preventScroll: true });
        return;
      }

      // TODO: フォーム送信先（Formspree等）が決まったらここで送信処理を実装する
      console.log('validation passed');
      if (formStatus) {
        formStatus.textContent = '送信先の設定が完了していません。お手数ですがお電話にてお問い合わせください。';
      }
    });
  }
})();
