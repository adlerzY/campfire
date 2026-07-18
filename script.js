let isTypingInProgress = false;

function typeEffect(element, text, speed = 40, callback) {
  if (!element) return;
  
  isTypingInProgress = true;
  
  element.innerHTML = "";
  const isRed = element.classList.contains('typing-red') || element.id === 'mobile-text';
  element.classList.add(isRed ? 'typing-red' : 'typing');
  
  let index = 0;
  function type() {
    if (text.charAt(index) === '<') {
      index = text.indexOf('>', index) + 1;
    } else {
      index++;
    }
    element.innerHTML = text.substring(0, index);

    if (index < text.length) {
      setTimeout(type, speed);
    } else {
      element.classList.remove('typing', 'typing-red');
      
      isTypingInProgress = false;
      
      if (callback) callback();
    }
  }
  type();
}

document.addEventListener("DOMContentLoaded", () => {
  const pcText = document.getElementById('pc-text');
  const mobileText = document.getElementById('mobile-text');
  const pcChoices = document.getElementById('pc-choices');
  const mobileChoices = document.getElementById('mobile-choices');
  const linksArea = document.getElementById('links-area');
  const buttonsWrapper = document.getElementById('buttons-wrapper');
  const mobileBox = document.getElementById('mobile-box');
  const mobileEmoji = document.getElementById('mobile-emoji');
  const mobileChoicesTitle = document.getElementById('mobile-choices-title');
  
  const knightImg = document.querySelector('img[alt="Sitting Knight"]');
  const knightContainer = knightImg ? knightImg.parentElement : null;
  const fireContainer = document.getElementById('fire-container');
  const cokiImg = document.getElementById('coki-img');
  
  const soundToggle = document.getElementById('sound-toggle');
  const soundIcon = document.getElementById('sound-icon');
  
  const bagToggle = document.getElementById('bag-toggle');
  const invCount = document.getElementById('inv-count');
  const inventoryModal = document.getElementById('inventory-modal');
  const invClose = document.getElementById('inv-close');
  const invSlots = document.getElementById('inv-slots');

  const donateTrigger = document.getElementById('donate-trigger');
  const donateModal = document.getElementById('donate-modal');
  const donateClose = document.getElementById('donate-close');

  const questText = document.getElementById('quest-text');

  const isRealMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  let isAudioPlaying = false;

  let inventory = [];
  let currentQuest = null;
  let knightClickCount = 0;

  const questPool = [
    { id: 'click_knight', target: 'knight', required: 5, current: 0, desc: "روی شوالیه ۵ بار کلیک کن", reward: "قهوه پیکسلی" },
    { id: 'click_fire', target: 'fire', required: 4, current: 0, desc: "روی آتش ۴ بار کلیک کن", reward: "زغال جادویی" },
    { id: 'click_coki', target: 'coki', required: 3, current: 0, desc: "روی کوکی ۳ بار کلیک کن", reward: "استخوان طلایی" }
  ];

  function initRandomQuest() {
    const r = Math.floor(Math.random() * questPool.length);
    currentQuest = JSON.parse(JSON.stringify(questPool[r]));
    updateQuestUI();
  }

  function updateQuestUI() {
    if (!currentQuest) {
      questText.textContent = "کوستی فعال نیست.";
      return;
    }
    questText.textContent = `${currentQuest.desc} (${currentQuest.current}/${currentQuest.required})`;
  }

  function progressQuest(targetType) {
    if (!currentQuest || currentQuest.target !== targetType) return;
    currentQuest.current++;
    updateQuestUI();
    if (currentQuest.current >= currentQuest.required) {
      inventory.push(currentQuest.reward);
      updateInventoryUI();
      showFloatingBubble(`کوست کامل شد! ${currentQuest.reward} دریافت کردی.`, false);
      initRandomQuest();
    }
  }

  function updateInventoryUI() {
    if (inventory.length > 0) {
      invCount.textContent = inventory.length;
      invCount.classList.remove('hidden');
    } else {
      invCount.classList.add('hidden');
    }
    invSlots.innerHTML = "";
    for (let i = 0; i < 8; i++) {
      const slot = document.createElement('div');
      slot.className = "border border-gray-800 bg-[#12131a] flex items-center justify-center text-xs p-1 h-10 w-10 relative";
      if (inventory[i]) {
        slot.textContent = inventory[i] === "قهوه پیکسلی" ? "☕" : inventory[i] === "زغال جادویی" ? "🔥" : "🦴";
        slot.title = inventory[i];
      }
      invSlots.appendChild(slot);
    }
  }

  bagToggle.addEventListener('click', () => {
    inventoryModal.classList.remove('hidden');
  });
  invClose.addEventListener('click', () => {
    inventoryModal.classList.add('hidden');
  });

  donateTrigger.addEventListener('click', () => {
    buttonsWrapper.classList.add('hidden');
    donateModal.classList.remove('hidden');
  });

  donateClose.addEventListener('click', () => {
    donateModal.classList.add('hidden');
    buttonsWrapper.classList.remove('hidden');
  });

  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      if (isAudioPlaying) {
        soundIcon.textContent = "🔇";
      } else {
        soundIcon.textContent = "🔊";
      }
      isAudioPlaying = !isAudioPlaying;
    });
  }

  if (isRealMobile && mobileText) {
    mobileText.innerHTML = "مسافر خسته، کنار آتش من بنشین... 🔥<br>من <span class='text-[#ffbe1a]'>ادرز</span> هستم. توسعه‌دهنده وب، گیمر و جادوگر دنیای کدها.";
    mobileText.classList.remove('typing-red');
    mobileText.classList.add('typing');
    if (mobileEmoji) {
      mobileEmoji.textContent = "🔥";
      mobileEmoji.classList.remove('animate-bounce');
    }
    if (mobileBox) {
      mobileBox.classList.remove('bg-[#150d0d]/95', 'border-red-600');
      mobileBox.classList.add('bg-[#0d0e15]/95', 'border-[#ffbe1a]');
      const arrows = mobileBox.querySelectorAll('.rotate-45');
      arrows.forEach(arrow => {
        arrow.classList.remove('bg-[#150d0d]', 'border-b-4', 'border-r-4', 'border-t-4', 'border-red-600');
        arrow.classList.add('bg-[#0d0e15]', 'border-[#ffbe1a]');
        if (arrow.classList.contains('absolute') && arrow.classList.contains('left-1/2')) {
          arrow.classList.add('border-b-4', 'border-r-4');
        } else {
          arrow.classList.add('border-t-4', 'border-r-4');
        }
      });
    }
    if (mobileChoicesTitle) {
      mobileChoicesTitle.classList.remove('text-[#ff8080]/70');
      mobileChoicesTitle.classList.add('text-[#8a8a98]');
    }
  }

  let isLargeScreen = window.innerWidth >= 1280;
  let activeText = isLargeScreen ? pcText : mobileText;
  let activeChoicesContainer = isLargeScreen ? pcChoices : mobileChoices;
  
  let selectedOption = 'yes'; 
  let selectionLocked = false;    
  let isTypingActive = true;      
  
  const originalPcText = pcText.innerHTML.trim();
  const originalMobileText = mobileText.innerHTML.trim();
  const initialText = isLargeScreen ? originalPcText : originalMobileText;

  const lockedRandomMessages = [
    "انگول نکن",
    "بشین بچه",
    "نکن بچه",
    "کرم نریز ",
    "کرم دست؟",
    "دست بی قرار?"
  ];

  const oracleMessages = [
    "فراموش نکن مسافر، حتی تاریک‌ترین شب‌ها هم با طلوع خورشید تموم میشن. 🌅",
    "دنیا پر از کدهای باگه، ولی زندگی ارزش دیباگ کردن رو داره.",
    "گاهی اوقات بهترین کار اینه که شمشیرت رو زمین بذاری و فقط استراحت کنی. 🛡️",
    "به نظر خسته میای. می‌خوای یه فنجون قهوه پیکسلی برات بریزم؟ ☕",
    "بزرگ‌ترین جادو، کدهاییه که با عشق می‌نویسی.",
    "... سرت رو بالا بگیر مسافر",
    "پیشنهاد می‌کنم گیت‌هاب من رو چک کنی، کدهای جادویی اونجا پنهان شده!",
    "اینجا امن‌ترین نقطه اینترنت برای توئه. هر چقدر دوست داری بمون. 🔥",
    "زندگی مثل یه بازی آرپی‌جیه، لول‌آپ کردن زمان می‌بره، ناامید نشو."
  ];

  const KNIGHT_STATIC = "knight_2.png"; 

  setTimeout(() => {
    typeEffect(activeText, initialText, 35, () => {
      isTypingActive = false;
      showChoices();
    });
  }, 300);

  let emberIntervalTime = 250;
  let emberTimer = null;

  function createEmber() {
    if (!fireContainer) return;
    const ember = document.createElement('div');
    ember.className = 'pixel-ember';
    const randomLeft = Math.floor(Math.random() * 40) + 20;
    const randomDrift = Math.floor(Math.random() * 60) - 30;
    const randomDuration = (Math.random() * 1.5 + 1.0).toFixed(2);
    const randomColor = Math.random() > 0.5 ? '#ff8030' : '#ffbe1a';
    ember.style.left = `${randomLeft}%`;
    ember.style.setProperty('--ember-drift', `${randomDrift}px`);
    ember.style.setProperty('--ember-dur', `${randomDuration}s`);
    ember.style.backgroundColor = randomColor;
    fireContainer.appendChild(ember);
    setTimeout(() => { ember.remove(); }, parseFloat(randomDuration) * 1000);
  }

  function startEmberSpawning() {
    if (emberTimer) clearInterval(emberTimer);
    emberTimer = setInterval(createEmber, emberIntervalTime);
  }

  if (fireContainer) {
    startEmberSpawning();
    fireContainer.addEventListener('click', (e) => {
      e.stopPropagation();
      progressQuest('fire');
      fireContainer.style.transform = 'scale(1.3)';
      emberIntervalTime = 50;
      startEmberSpawning();
      for(let i=0; i<15; i++) { setTimeout(createEmber, i * 30); }
      
      if (selectionLocked && !isTypingActive && !isTypingInProgress) {
        showFloatingBubble("هومم... گرم‌تر شد.", false);
        if (Math.random() > 0.5) {
          isTypingActive = true;
          const fireThanks = "ممنون مسافر! هیزم خوبی بود. حالا بیا باز هم کنار آتش استراحت کن.";
          typeEffect(activeText, fireThanks, 30, () => { isTypingActive = false; });
        }
      }
      setTimeout(() => {
        fireContainer.style.transform = '';
        emberIntervalTime = 250;
        startEmberSpawning();
      }, 2000);
    });
  }

  function showChoices() {
    if (selectionLocked) return;
    activeChoicesContainer.classList.remove('hidden');
    activeChoicesContainer.classList.add('fade-in-pixel');
    updateSelectionVisuals();
    enableSelectionControls();
  }

  function updateSelectionVisuals() {
    if (selectionLocked) return;
    const options = activeChoicesContainer.querySelectorAll('[data-choice]');
    options.forEach(opt => {
      const isSelected = opt.getAttribute('data-choice') === selectedOption;
      const highlightColor = (isLargeScreen || isRealMobile) ? 'text-[#ffbe1a]' : 'text-[#ff8080]';
      if (isSelected) {
        opt.classList.add('underline', 'underline-offset-4', 'decoration-2', highlightColor);
      } else {
        opt.classList.remove('underline', 'underline-offset-4', 'decoration-2', 'text-[#ffbe1a]', 'text-[#ff8080]');
      }
    });
  }

  function confirmSelection() {
    if (selectionLocked) return;
    selectionLocked = true;
    activeChoicesContainer.classList.add('hidden');

    let resultText = "";
    if (selectedOption === 'yes') {
      linksArea.classList.remove('hidden');
      if (isLargeScreen || isRealMobile) {
        resultText = "انتخاب هوشمندانه‌ای بود مسافر... راستی، اگه مایل بودی می‌تونی از دکمه جدید منو مهمون کنی! ☕";
      } else {
        resultText = "دس خوش مسافر! دکمه مهمون کردن هم باز شد، صفا دادی.";
      }
    } else {
      linksArea.classList.add('hidden');
      if (isLargeScreen || isRealMobile) {
        resultText = "پس توهم میری...میموندی باه... اهم سفر سلامت.";
      } else {
        resultText = "نهههه!!! چطوری دلت اومد به یه شوالیه نه بگی؟!!!";
      }
    }

    if (isRealMobile) {
      activeText.classList.remove('typing-red');
      activeText.classList.add('typing');
    }
    typeEffect(activeText, resultText, 35);
  }

  function enableSelectionControls() {
    const options = activeChoicesContainer.querySelectorAll('[data-choice]');
    options.forEach(opt => { opt.replaceWith(opt.cloneNode(true)); });
    const freshOptions = activeChoicesContainer.querySelectorAll('[data-choice]');
    freshOptions.forEach(opt => {
      opt.addEventListener('mouseenter', () => {
        if (selectionLocked) return;
        selectedOption = opt.getAttribute('data-choice');
        updateSelectionVisuals();
      });
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        confirmSelection();
      });
    });
  }

  document.addEventListener('keydown', (e) => {
    if (selectionLocked || isTypingActive) return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      selectedOption = 'no';
      updateSelectionVisuals();
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      selectedOption = 'yes';
      updateSelectionVisuals();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      confirmSelection();
    }
  });

  function showFloatingBubble(message, isWarning = false) {
    if (!knightContainer) return;
    const existingBubbles = knightContainer.querySelectorAll('.pixel-pop-bubble');
    existingBubbles.forEach(b => b.remove());

    const bubble = document.createElement('div');
    const borderColor = (isWarning && !isRealMobile) ? 'border-red-500' : 'border-[#ffbe1a]';
    const textColor = (isWarning && !isRealMobile) ? 'text-[#ff8080]' : 'text-[#ffbe1a]';
    const bgColor = (isWarning && !isRealMobile) ? 'bg-[#150d0d]/95' : 'bg-[#0d0e15]/95';

    bubble.className = `pixel-pop-bubble absolute left-1/2 -top-12 z-50 pointer-events-none flex flex-col items-center justify-center px-4 py-2 border-2 ${borderColor} ${bgColor} shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] min-w-[160px] max-w-[220px] text-center`;
    bubble.innerHTML = `
      <span class="text-[10px] font-bold leading-5 ${textColor}">${message}</span>
      <div class="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-2 h-2 ${bgColor} border-b-2 border-r-2 ${borderColor} rotate-45"></div>
    `;
    knightContainer.appendChild(bubble);
    bubble.addEventListener('animationend', () => { bubble.remove(); });
  }

  if (cokiImg) {
    cokiImg.addEventListener('click', (e) => {
      e.stopPropagation();
      progressQuest('coki');
      cokiImg.classList.remove('hit-shake-coki');
      void cokiImg.offsetWidth;
      cokiImg.classList.add('hit-shake-coki');
      
      if (isTypingInProgress) return;
      
      isTypingActive = true;
      let cokiResponse = "اسمش کوکیه. هی کوکی با اون بازی نکن!";
      if (Math.random() > 0.6) {
        cokiResponse = "کوکی شمشیر رو ول کن الان به بادمون میدی!";
      }
      typeEffect(activeText, cokiResponse, 30, () => {
        isTypingActive = false;
      });
    });
  }

  if (knightImg) {
    knightImg.src = "knight.gif?v=" + Math.random();
    knightImg.addEventListener('click', (e) => {
      e.stopPropagation();
      progressQuest('knight');
      knightImg.classList.remove('hit-shake');
      void knightImg.offsetWidth; 
      knightImg.classList.add('hit-shake');

      if (isTypingActive) {
        showFloatingBubble("صبر کن بزرگ ترت داره صحبت میکنه", !isRealMobile);
      } 
      else if (!isTypingActive && !selectionLocked) {
        showFloatingBubble("...مگه چشم نداری", false);
      } 
      else if (selectionLocked) {
        if (isTypingInProgress) return;

        if (Math.random() < 0.4) {
          const randomIndex = Math.floor(Math.random() * lockedRandomMessages.length);
          const randomMsg = lockedRandomMessages[randomIndex];
          showFloatingBubble(randomMsg, !isRealMobile);
        } else {
          const randomOracleIndex = Math.floor(Math.random() * oracleMessages.length);
          const randomOracleMsg = oracleMessages[randomOracleIndex];
          isTypingActive = true;
          if (isRealMobile) {
            activeText.classList.remove('typing-red');
            activeText.classList.add('typing');
          }
          typeEffect(activeText, randomOracleMsg, 30, () => {
            isTypingActive = false;
          });
        }
      }
    });

    setTimeout(() => {
      knightImg.src = KNIGHT_STATIC;
      scheduleNextKnightAnimation();
    }, 3000);

    function triggerKnightAnimation() {
      knightImg.src = "knight.gif?v=" + Math.random();
      setTimeout(() => {
        knightImg.src = KNIGHT_STATIC; 
        scheduleNextKnightAnimation();
      }, 3000); 
    }

    function scheduleNextKnightAnimation() {
      const randomDelay = Math.floor(Math.random() * 9000) + 1000; 
      setTimeout(triggerKnightAnimation, randomDelay);
    }
  }

  initRandomQuest();
  updateInventoryUI();
});