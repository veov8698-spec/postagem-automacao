document.addEventListener('DOMContentLoaded', () => {
  // Estado local da aplicação
  const state = {
    activePlatformFilter: 'all',
    activeStatusFilter: 'all',
    activePreviewTab: 'instagram',
    isScheduledMode: false,
    selectedFile: null,
    selectedFileUrl: null,
    selectedThumbnailFile: null,
    selectedThumbnailUrl: null,
    ytFormat: 'auto',
    detectedYtFormat: null,
    igFormat: 'auto',
    detectedIgFormat: null,
    fbFormat: 'auto',
    detectedRatio: null
  };

  // Elementos do DOM - Navegação
  const navTabs = document.querySelectorAll('.nav-tabs .nav-tab');
  const views = document.querySelectorAll('.view');
  const btnHeaderReconnect = document.getElementById('btnHeaderReconnect');

  // Elementos do DOM - Nova Postagem
  const postForm = document.getElementById('postForm');
  const platformPills = document.querySelectorAll('.platform-pill');
  const btnToggleSelectAll = document.getElementById('btnToggleSelectAll');
  const lblSelectAllText = document.getElementById('lblSelectAllText');

  // Configuração Instagram (Reels vs Feed vs Story)
  const igFormatContainer = document.getElementById('igFormatContainer');
  const igFormatBtns = document.querySelectorAll('.ig-format-btn');
  const igRatioBadge = document.getElementById('igRatioBadge');
  const igRatioText = document.getElementById('igRatioText');

  // Configuração Facebook (Feed vs Reels vs Story)
  const fbFormatContainer = document.getElementById('fbFormatContainer');
  const fbFormatBtns = document.querySelectorAll('.fb-format-btn');

  // Configuração YouTube (Shorts vs Vídeo Padrão)
  const ytFormatContainer = document.getElementById('ytFormatContainer');
  const ytFormatBtns = document.querySelectorAll('.yt-format-btn');
  const ytRatioBadge = document.getElementById('ytRatioBadge');
  const ytRatioText = document.getElementById('ytRatioText');

  const mediaInput = document.getElementById('mediaInput');
  const dropzone = document.getElementById('dropzone');
  const dropzoneEmpty = document.getElementById('dropzoneEmpty');
  const mediaPreviewWrapper = document.getElementById('mediaPreviewWrapper');
  const mediaPreviewContainer = document.getElementById('mediaPreviewContainer');
  const btnRemoveMedia = document.getElementById('btnRemoveMedia');

  // Elementos de Capa / Thumbnail do Vídeo
  const thumbnailInput = document.getElementById('thumbnailInput');
  const thumbnailDropzone = document.getElementById('thumbnailDropzone');
  const thumbnailDropzoneEmpty = document.getElementById('thumbnailDropzoneEmpty');
  const thumbnailPreviewWrapper = document.getElementById('thumbnailPreviewWrapper');
  const thumbnailImgPreview = document.getElementById('thumbnailImgPreview');
  const btnRemoveThumbnail = document.getElementById('btnRemoveThumbnail');

  const postTitle = document.getElementById('postTitle');
  const postCaption = document.getElementById('postCaption');
  const charCounter = document.getElementById('charCounter');
  const quickTagBtns = document.querySelectorAll('.tag-btn');
  const modeDirect = document.getElementById('modeDirect');
  const modeScheduled = document.getElementById('modeScheduled');
  const scheduleBox = document.getElementById('scheduleBox');
  const scheduleDateTime = document.getElementById('scheduleDateTime');
  const btnSubmitPost = document.getElementById('btnSubmitPost');
  const submitBtnText = document.getElementById('submitBtnText');
  const submitBtnIcon = document.getElementById('submitBtnIcon');

  // Elementos do Preview Empilhado & Colapsável
  const previewItemInstagram = document.getElementById('previewItemInstagram');
  const previewItemFacebook = document.getElementById('previewItemFacebook');
  const previewItemYouTube = document.getElementById('previewItemYouTube');
  const noPlatformSelectedPlaceholder = document.getElementById('noPlatformSelectedPlaceholder');
  const btnToggleAllPreviews = document.getElementById('btnToggleAllPreviews');
  const lblToggleAllPreviews = document.getElementById('lblToggleAllPreviews');
  const previewAccordionHeaders = document.querySelectorAll('.preview-accordion-header');

  // Elementos Instagram Feed vs Reels
  const igFeedLayout = document.getElementById('igFeedLayout');
  const igReelsLayout = document.getElementById('igReelsLayout');
  const igPreviewSubtype = document.getElementById('igPreviewSubtype');
  const mockupMediaIgReels = document.getElementById('mockupMediaIgReels');
  const mockupCaptionIgReels = document.getElementById('mockupCaptionIgReels');
  const igReelsHandle = document.getElementById('igReelsHandle');
  const igReelsAvatar = document.getElementById('igReelsAvatar');
  const igReelsAudioTrack = document.getElementById('igReelsAudioTrack');

  // Elementos YouTube Standard vs Shorts
  const ytStandardLayout = document.getElementById('ytStandardLayout');
  const ytShortsLayout = document.getElementById('ytShortsLayout');
  const ytPreviewSubtype = document.getElementById('ytPreviewSubtype');
  const mockupMediaYtShorts = document.getElementById('mockupMediaYtShorts');
  const mockupCaptionYtShorts = document.getElementById('mockupCaptionYtShorts');
  const ytShortsAudioTrack = document.getElementById('ytShortsAudioTrack');
  const ytShortsChannelName = document.getElementById('ytShortsChannelName');

  const mockupCaptionIg = document.getElementById('mockupCaptionIg');
  const mockupCaptionFb = document.getElementById('mockupCaptionFb');
  const mockupCaptionYt = document.getElementById('mockupCaptionYt');
  const mockupTitleYt = document.getElementById('mockupTitleYt');

  // Elementos da Galeria
  const galleryGrid = document.getElementById('galleryGrid');
  const gallerySearchInput = document.getElementById('gallerySearchInput');
  const btnClearSearch = document.getElementById('btnClearSearch');
  const btnGoToComposer = document.getElementById('btnGoToComposer');
  const platformFilterTabs = document.querySelectorAll('.filter-tab');
  const statusFilterSelect = document.getElementById('statusFilterSelect');
  const btnRefreshGallery = document.getElementById('btnRefreshGallery');
  const totalPostsBadge = document.getElementById('totalPostsBadge');
  const statTotal = document.getElementById('statTotal');
  const statIg = document.getElementById('statIg');
  const statFb = document.getElementById('statFb');
  const statYt = document.getElementById('statYt');
  const statSched = document.getElementById('statSched');

  // Elementos do Modal de Postagem
  const postModal = document.getElementById('postModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');
  const btnModalClose = document.getElementById('btnModalClose');

  // Elementos de Contas e APIs
  const activeAccountsBadge = document.getElementById('activeAccountsBadge');
  const btnConnectAllDemo = document.getElementById('btnConnectAllDemo');
  const connectModal = document.getElementById('connectModal');
  const btnConnectModalClose = document.getElementById('btnConnectModalClose');
  const connectForm = document.getElementById('connectForm');
  const connectModalTitle = document.getElementById('connectModalTitle');
  const connectPlatform = document.getElementById('connectPlatform');
  const labelAccountId = document.getElementById('labelAccountId');
  const inputAccountId = document.getElementById('inputAccountId');
  const helpAccountId = document.getElementById('helpAccountId');
  const labelAccessToken = document.getElementById('labelAccessToken');
  const inputAccessToken = document.getElementById('inputAccessToken');
  const helpAccessToken = document.getElementById('helpAccessToken');
  const groupApiKey = document.getElementById('groupApiKey');
  const inputApiKey = document.getElementById('inputApiKey');
  const btnSaveCredentials = document.getElementById('btnSaveCredentials');

  // Elementos de Status do Sistema
  const dbStatusIndicator = document.getElementById('dbStatusIndicator');
  const dbStatusText = document.getElementById('dbStatusText');

  // Configura data mínima para agendamento
  function setupScheduleMinTime() {
    if (!scheduleDateTime) return;
    const now = new Date();
    now.setMinutes(now.getMinutes() + 2);
    const iso = now.toISOString().slice(0, 16);
    scheduleDateTime.min = iso;
    if (!scheduleDateTime.value) {
      scheduleDateTime.value = iso;
    }
  }
  setupScheduleMinTime();

  // ================= NAVEGAÇÃO DE ABAS =================
  window.switchView = function(targetView) {
    if (!targetView) return;
    navTabs.forEach(t => {
      if (t.getAttribute('data-view') === targetView) t.classList.add('active');
      else t.classList.remove('active');
    });
    views.forEach(v => {
      if (v.id === targetView) v.classList.add('active');
      else v.classList.remove('active');
    });

    if (targetView === 'gallery-view') {
      loadGallery();
    } else if (targetView === 'accounts-view') {
      loadAccounts();
    } else if (targetView === 'groups-view') {
      loadGroups();
    } else if (targetView === 'admin-view') {
      loadAdminUsers();
    }
  };

  navTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const button = e.currentTarget;
      const targetView = button.getAttribute('data-view');
      window.switchView(targetView);
    });
  });

  // ================= SELEÇÃO DE PLATAFORMAS & PREVIEWS =================
  function updateSelectAllButtonText() {
    if (!lblSelectAllText) return;
    const checkboxes = document.querySelectorAll('.platform-pill input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    lblSelectAllText.textContent = allChecked ? 'Desmarcar Tudo' : 'Selecionar Tudo';
  }

  function updateFormatVisibility() {
    const igCheckbox = document.querySelector('.platform-pill.ig input[type="checkbox"]');
    const fbCheckbox = document.querySelector('.platform-pill.fb input[type="checkbox"]');
    const ytCheckbox = document.querySelector('.platform-pill.yt input[type="checkbox"]');

    if (igFormatContainer) {
      igFormatContainer.style.display = (igCheckbox && igCheckbox.checked) ? 'block' : 'none';
    }
    if (fbFormatContainer) {
      fbFormatContainer.style.display = (fbCheckbox && fbCheckbox.checked) ? 'block' : 'none';
    }
    if (ytFormatContainer) {
      ytFormatContainer.style.display = (ytCheckbox && ytCheckbox.checked) ? 'block' : 'none';
    }
  }

  // Sincroniza dinamicamente as prévias empilhadas com as redes marcadas
  function updateVisiblePreviewCards() {
    const igCheckbox = document.querySelector('.platform-pill.ig input[type="checkbox"]');
    const fbCheckbox = document.querySelector('.platform-pill.fb input[type="checkbox"]');
    const ytCheckbox = document.querySelector('.platform-pill.yt input[type="checkbox"]');

    const igActive = !!(igCheckbox && igCheckbox.checked);
    const fbActive = !!(fbCheckbox && fbCheckbox.checked);
    const ytActive = !!(ytCheckbox && ytCheckbox.checked);

    if (previewItemInstagram) previewItemInstagram.style.display = igActive ? 'block' : 'none';
    if (previewItemFacebook) previewItemFacebook.style.display = fbActive ? 'block' : 'none';
    if (previewItemYouTube) previewItemYouTube.style.display = ytActive ? 'block' : 'none';

    if (noPlatformSelectedPlaceholder) {
      noPlatformSelectedPlaceholder.style.display = (!igActive && !fbActive && !ytActive) ? 'block' : 'none';
    }

    updateIgPreviewLayout();
    updateYtPreviewLayout();
  }

  platformPills.forEach(pill => {
    const checkbox = pill.querySelector('input[type="checkbox"]');
    if (!checkbox) return;

    checkbox.addEventListener('change', () => {
      pill.classList.toggle('active', checkbox.checked);
      updateSelectAllButtonText();
      updateFormatVisibility();
      updateVisiblePreviewCards();
    });
  });

  if (btnToggleSelectAll) {
    btnToggleSelectAll.addEventListener('click', () => {
      const checkboxes = document.querySelectorAll('.platform-pill input[type="checkbox"]');
      const allChecked = Array.from(checkboxes).every(cb => cb.checked);
      const newStatus = !allChecked;

      checkboxes.forEach(cb => {
        cb.checked = newStatus;
        cb.closest('.platform-pill').classList.toggle('active', newStatus);
      });

      updateSelectAllButtonText();
      updateFormatVisibility();
      updateVisiblePreviewCards();
    });
  }

  // ================= CONTROLES DE COLAPSO DO PREVIEW (SETINHAS) =================
  previewAccordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.preview-accordion-item');
      if (!item) return;

      const isCollapsed = item.classList.toggle('collapsed');
      const stateText = header.querySelector('.preview-state-text');
      if (stateText) {
        stateText.textContent = isCollapsed ? 'Oculto' : 'Visível';
      }
    });
  });

  if (btnToggleAllPreviews) {
    btnToggleAllPreviews.addEventListener('click', () => {
      const items = Array.from(document.querySelectorAll('.preview-accordion-item'))
        .filter(item => item.style.display !== 'none');
      if (items.length === 0) return;

      const anyOpen = items.some(item => !item.classList.contains('collapsed'));
      items.forEach(item => {
        item.classList.toggle('collapsed', anyOpen);
        const stateText = item.querySelector('.preview-state-text');
        if (stateText) {
          stateText.textContent = anyOpen ? 'Oculto' : 'Visível';
        }
      });

      if (lblToggleAllPreviews) {
        lblToggleAllPreviews.textContent = anyOpen ? 'Expandir Todos' : 'Recolher Todos';
      }
    });
  }

  // ================= SELEÇÃO DE FORMATO INSTAGRAM (REELS VS FEED VS STORY) =================
  function updateIgPreviewLayout() {
    if (!igFeedLayout || !igReelsLayout) return;

    let isReels = false;
    if (state.igFormat === 'reels') {
      isReels = true;
    } else if (state.igFormat === 'feed' || state.igFormat === 'story') {
      isReels = false;
    } else {
      isReels = (state.detectedIgFormat === 'reels');
    }

    if (isReels) {
      igFeedLayout.style.display = 'none';
      igReelsLayout.style.display = 'flex';
      if (igPreviewSubtype) igPreviewSubtype.textContent = 'Reels (9:16 Vertical)';
    } else {
      igFeedLayout.style.display = 'flex';
      igReelsLayout.style.display = 'none';
      if (igPreviewSubtype) {
        igPreviewSubtype.textContent = state.igFormat === 'story' ? 'Story (24h)' : 'Feed (Post Normal)';
      }
    }
  }

  igFormatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      igFormatBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.igFormat = btn.getAttribute('data-format') || 'auto';

      if (state.igFormat === 'reels') {
        showToast('Formato fixado como Instagram Reels (9:16 Vertical)', 'info');
      } else if (state.igFormat === 'feed') {
        showToast('Formato fixado como Feed do Instagram (Post Normal)', 'info');
      } else if (state.igFormat === 'story') {
        showToast('Formato fixado como Story do Instagram (Temporário 24h)', 'info');
      } else {
        showToast('Modo Automático: a proporção do vídeo/foto definirá se é Reels ou Feed', 'info');
      }

      updateIgPreviewLayout();
      updateMockupMedia();
    });
  });

  // ================= SELEÇÃO DE FORMATO FACEBOOK (FEED VS REELS VS STORY) =================
  if (fbFormatBtns) {
    fbFormatBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        fbFormatBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.fbFormat = btn.getAttribute('data-format') || 'auto';

        if (state.fbFormat === 'reels') {
          showToast('Formato fixado como Facebook Reels (9:16 Vertical)', 'info');
        } else if (state.fbFormat === 'feed') {
          showToast('Formato fixado como Feed do Facebook (Post / Foto)', 'info');
        } else if (state.fbFormat === 'story') {
          showToast('Formato fixado como Story do Facebook (24h)', 'info');
        } else {
          showToast('Modo Automático: a mídia definirá o formato no Facebook', 'info');
        }
      });
    });
  }

  // ================= SELEÇÃO DE FORMATO YOUTUBE (16:9 VS SHORTS) =================
  function updateYtPreviewLayout() {
    if (!ytStandardLayout || !ytShortsLayout) return;

    let isShorts = false;
    if (state.ytFormat === 'shorts') {
      isShorts = true;
    } else if (state.ytFormat === 'video') {
      isShorts = false;
    } else {
      // Automático: se foi detectado vídeo vertical 9:16 vira Shorts
      isShorts = (state.detectedYtFormat === 'shorts');
    }

    if (isShorts) {
      ytStandardLayout.style.display = 'none';
      ytShortsLayout.style.display = 'flex';
      if (ytPreviewSubtype) ytPreviewSubtype.textContent = 'Shorts (9:16 Vertical)';
    } else {
      ytStandardLayout.style.display = 'flex';
      ytShortsLayout.style.display = 'none';
      if (ytPreviewSubtype) ytPreviewSubtype.textContent = 'Vídeo Padrão (16:9)';
    }
  }

  ytFormatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      ytFormatBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.ytFormat = btn.getAttribute('data-format') || 'auto';

      if (state.ytFormat === 'shorts') {
        showToast('Formato fixado como YouTube Shorts (9:16 Vertical)', 'info');
      } else if (state.ytFormat === 'video') {
        showToast('Formato fixado como Vídeo Padrão (16:9 Horizontal)', 'info');
      } else {
        showToast('Modo Automático: a proporção do vídeo definirá se é Shorts ou Vídeo Padrão', 'info');
      }

      updateYtPreviewLayout();
      updateMockupMedia();
    });
  });

  function updateYtFormatBadge() {
    if (!ytRatioBadge || !ytRatioText) return;
    if (state.detectedYtFormat) {
      ytRatioBadge.style.display = 'inline-flex';
      const label = state.detectedYtFormat === 'shorts' ? 'Shorts (9:16 Vertical)' : 'Vídeo Padrão (16:9 Horizontal)';
      ytRatioText.textContent = `Auto-detectado: ${label}`;
    } else {
      ytRatioBadge.style.display = 'none';
    }
  }

  // ================= UPLOAD E DRAG & DROP DE MÍDIA =================
  if (dropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelection(files[0]);
      }
    });
  }

  if (mediaInput) {
    mediaInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
      }
    });
  }

  function handleFileSelection(file) {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      showToast('Por favor selecione uma imagem ou vídeo válido.', 'error');
      return;
    }

    state.selectedFile = file;
    state.selectedFileUrl = URL.createObjectURL(file);

    // Detecção automática de proporção (Aspect Ratio) para YouTube Shorts vs Vídeo
    if (file.type.startsWith('video/')) {
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.onloadedmetadata = () => {
        const w = tempVideo.videoWidth || 1080;
        const h = tempVideo.videoHeight || 1920;
        const dur = Math.round(tempVideo.duration || 0);
        const isVertical = h >= w;
        const isShorts = isVertical || (dur <= 60 && h >= w);

        state.detectedYtFormat = isShorts ? 'shorts' : 'video';
        state.detectedIgFormat = isVertical ? 'reels' : 'feed';
        state.detectedRatio = `${w}x${h}`;
        updateYtFormatBadge();
        updateYtPreviewLayout();
        updateIgPreviewLayout();
      };
      tempVideo.src = state.selectedFileUrl;
    } else if (file.type.startsWith('image/')) {
      const tempImg = new Image();
      tempImg.onload = () => {
        const w = tempImg.naturalWidth;
        const h = tempImg.naturalHeight;
        const isVertical = h >= w;
        state.detectedYtFormat = isVertical ? 'shorts' : 'video';
        state.detectedIgFormat = isVertical ? 'reels' : 'feed';
        state.detectedRatio = `${w}x${h}`;
        updateYtFormatBadge();
        updateYtPreviewLayout();
        updateIgPreviewLayout();
      };
      tempImg.src = state.selectedFileUrl;
    }

    if (dropzoneEmpty) dropzoneEmpty.style.display = 'none';
    if (mediaPreviewWrapper) mediaPreviewWrapper.style.display = 'flex';
    if (mediaPreviewContainer) {
      mediaPreviewContainer.innerHTML = '';
      const isVideo = file.type.startsWith('video/');
      if (isVideo) {
        const video = document.createElement('video');
        video.src = state.selectedFileUrl;
        video.controls = true;
        video.muted = true;
        mediaPreviewContainer.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.src = state.selectedFileUrl;
        img.alt = 'Preview da imagem';
        mediaPreviewContainer.appendChild(img);
      }
    }

    updateMockupMedia();
  }

  if (btnRemoveMedia) {
    btnRemoveMedia.addEventListener('click', (e) => {
      e.stopPropagation();
      state.selectedFile = null;
      state.detectedYtFormat = null;
      state.detectedRatio = null;
      updateYtFormatBadge();
      updateYtPreviewLayout();

      if (state.selectedFileUrl) {
        URL.revokeObjectURL(state.selectedFileUrl);
        state.selectedFileUrl = null;
      }
      if (mediaInput) mediaInput.value = '';
      if (dropzoneEmpty) dropzoneEmpty.style.display = 'block';
      if (mediaPreviewWrapper) mediaPreviewWrapper.style.display = 'none';
      if (mediaPreviewContainer) mediaPreviewContainer.innerHTML = '';
      updateMockupMedia();
    });
  }

  // ================= UPLOAD DE CAPA / THUMBNAIL DO VÍDEO =================
  if (thumbnailDropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      thumbnailDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        thumbnailDropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      thumbnailDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        thumbnailDropzone.classList.remove('dragover');
      });
    });

    thumbnailDropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleThumbnailSelection(files[0]);
      }
    });
  }

  if (thumbnailInput) {
    thumbnailInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleThumbnailSelection(e.target.files[0]);
      }
    });
  }

  function handleThumbnailSelection(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecione uma imagem válida (PNG, JPG, WEBP) para a capa do vídeo.', 'error');
      return;
    }

    state.selectedThumbnailFile = file;
    state.selectedThumbnailUrl = URL.createObjectURL(file);

    if (thumbnailDropzoneEmpty) thumbnailDropzoneEmpty.style.display = 'none';
    if (thumbnailPreviewWrapper) thumbnailPreviewWrapper.style.display = 'flex';
    if (thumbnailImgPreview) thumbnailImgPreview.src = state.selectedThumbnailUrl;

    updateMockupMedia();
    showToast('Capa do vídeo definida com sucesso!', 'info');
  }

  if (btnRemoveThumbnail) {
    btnRemoveThumbnail.addEventListener('click', (e) => {
      e.stopPropagation();
      state.selectedThumbnailFile = null;
      if (state.selectedThumbnailUrl) {
        URL.revokeObjectURL(state.selectedThumbnailUrl);
        state.selectedThumbnailUrl = null;
      }
      if (thumbnailInput) thumbnailInput.value = '';
      if (thumbnailDropzoneEmpty) thumbnailDropzoneEmpty.style.display = 'flex';
      if (thumbnailPreviewWrapper) thumbnailPreviewWrapper.style.display = 'none';
      if (thumbnailImgPreview) thumbnailImgPreview.src = '';

      updateMockupMedia();
      showToast('Capa do vídeo removida.', 'info');
    });
  }

  // ================= ATUALIZAÇÃO DE MÍDIA NOS MOCKUPS =================
  function updateMockupMedia() {
    const containers = [
      document.getElementById('mockupMediaIg'),
      document.getElementById('mockupMediaIgReels'),
      document.getElementById('mockupMediaFb'),
      document.getElementById('mockupMediaYt'),
      document.getElementById('mockupMediaYtShorts')
    ];

    containers.forEach(container => {
      if (!container) return;
      const isYtStandard = container.id === 'mockupMediaYt';
      const isShorts = container.id === 'mockupMediaYtShorts';
      const isReels = container.id === 'mockupMediaIgReels';

      if (state.selectedFileUrl) {
        const isVideo = state.selectedFile?.type.startsWith('video/');
        if (isVideo) {
          const posterAttr = (isYtStandard && state.selectedThumbnailUrl) ? `poster="${state.selectedThumbnailUrl}"` : '';
          container.innerHTML = `<video src="${state.selectedFileUrl}" ${posterAttr} autoplay loop muted playsinline></video>`;
        } else {
          container.innerHTML = `<img src="${state.selectedFileUrl}" alt="Mockup preview">`;
        }
      } else if (isYtStandard && state.selectedThumbnailUrl) {
        container.innerHTML = `<img src="${state.selectedThumbnailUrl}" alt="Capa YouTube">`;
      } else {
        if (isShorts) {
          container.innerHTML = `
            <div class="mockup-placeholder-media">
              <i class="fa-solid fa-bolt"></i>
              <span>YouTube Shorts (9:16 Vertical)</span>
            </div>
          `;
        } else if (isReels) {
          container.innerHTML = `
            <div class="mockup-placeholder-media">
              <i class="fa-solid fa-clapperboard"></i>
              <span>Instagram Reels (9:16 Vertical)</span>
            </div>
          `;
        } else if (isYtStandard) {
          container.innerHTML = `
            <div class="mockup-placeholder-media">
              <i class="fa-solid fa-play"></i>
              <span>Vídeo / Thumbnail do YouTube (16:9)</span>
            </div>
          `;
        } else {
          container.innerHTML = `
            <div class="mockup-placeholder-media">
              <i class="fa-regular fa-image"></i>
              <span>Sua foto ou vídeo aqui</span>
            </div>
          `;
        }
      }
    });
  }

  // ================= TEXTO E MOCKUP EM TEMPO REAL =================
  if (postCaption) {
    postCaption.addEventListener('input', () => {
      const text = postCaption.value;
      if (charCounter) charCounter.textContent = `${text.length} caracteres`;

      const displayText = text.trim() ? text : 'Sua legenda aparecerá aqui em tempo real...';
      if (mockupCaptionIg) mockupCaptionIg.textContent = displayText;
      if (mockupCaptionIgReels) mockupCaptionIgReels.textContent = displayText;
      if (mockupCaptionFb) mockupCaptionFb.textContent = displayText;
      if (mockupCaptionYt) mockupCaptionYt.textContent = displayText;
      if (mockupCaptionYtShorts) mockupCaptionYtShorts.textContent = displayText;
    });
  }

  if (postTitle) {
    postTitle.addEventListener('input', () => {
      const val = postTitle.value.trim();
      const displayTitle = val ? val : 'Título do seu vídeo no YouTube';
      if (mockupTitleYt) mockupTitleYt.textContent = displayTitle;
    });
  }

  quickTagBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.getAttribute('data-tag');
      if (postCaption && !postCaption.value.includes(tag)) {
        postCaption.value = postCaption.value ? `${postCaption.value.trim()} ${tag}` : tag;
        postCaption.dispatchEvent(new Event('input'));
      }
    });
  });

  // Inicializa o estado visual das plataformas e prévias
  updateSelectAllButtonText();
  updateFormatVisibility();
  updateVisiblePreviewCards();

  // ================= MODO DE PUBLICAÇÃO =================
  if (modeDirect) {
    modeDirect.addEventListener('click', () => {
      state.isScheduledMode = false;
      modeDirect.classList.add('active');
      if (modeScheduled) modeScheduled.classList.remove('active');
      if (scheduleBox) scheduleBox.style.display = 'none';
      if (submitBtnText) submitBtnText.textContent = 'Publicar Imediatamente';
      if (submitBtnIcon) submitBtnIcon.className = 'fa-solid fa-paper-plane';
    });
  }

  if (modeScheduled) {
    modeScheduled.addEventListener('click', () => {
      state.isScheduledMode = true;
      modeScheduled.classList.add('active');
      if (modeDirect) modeDirect.classList.remove('active');
      if (scheduleBox) scheduleBox.style.display = 'block';
      setupScheduleMinTime();
      if (submitBtnText) submitBtnText.textContent = 'Confirmar Agendamento';
      if (submitBtnIcon) submitBtnIcon.className = 'fa-regular fa-calendar-check';
    });
  }

  // ================= SUBMISSÃO DO POST =================
  if (postForm) {
    postForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const selectedPlatforms = Array.from(document.querySelectorAll('input[name="platform"]:checked')).map(i => i.value);
      if (selectedPlatforms.length === 0) {
        showToast('Selecione ao menos uma rede social para postar!', 'error');
        return;
      }

      const caption = postCaption.value.trim();
      if (!caption) {
        showToast('Por favor preencha a legenda da postagem.', 'error');
        return;
      }

      if (state.isScheduledMode && !scheduleDateTime.value) {
        showToast('Por favor selecione a data e horário do agendamento.', 'error');
        return;
      }

      btnSubmitPost.disabled = true;
      const originalText = submitBtnText.textContent;
      submitBtnText.textContent = state.isScheduledMode ? 'Agendando...' : 'Publicando...';

      const formData = new FormData();
      formData.append('title', postTitle.value);
      formData.append('caption', caption);
      formData.append('platforms', JSON.stringify(selectedPlatforms));
      formData.append('isScheduled', state.isScheduledMode);

      if (state.isScheduledMode) {
        formData.append('scheduledAt', scheduleDateTime.value);
      }

      if (state.selectedFile) {
        formData.append('media', state.selectedFile);
      }

      // Envia Thumbnail / Capa Personalizada se houver
      if (state.selectedThumbnailFile) {
        formData.append('thumbnail', state.selectedThumbnailFile);
      }

      // Envia formato do Instagram (Reels / Feed / Story / Auto)
      formData.append('igFormat', state.igFormat || 'auto');
      if (state.detectedIgFormat) {
        formData.append('detectedIgFormat', state.detectedIgFormat);
      }

      // Envia formato do Facebook (Reels / Feed / Story / Auto)
      formData.append('fbFormat', state.fbFormat || 'auto');

      // Envia formato do YouTube (Shorts / Vídeo / Auto)
      formData.append('ytFormat', state.ytFormat || 'auto');
      if (state.detectedYtFormat) {
        formData.append('detectedFormat', state.detectedYtFormat);
      }

      try {
        const res = await fetch('/api/posts', {
          method: 'POST',
          body: formData
        });

        const data = await res.json();

        if (data.success) {
          const modeMsg = state.isScheduledMode ? 'Postagem agendada com sucesso!' : 'Publicação realizada com sucesso!';
          showToast(modeMsg, 'success');
          
          if (data.publishResults) {
            const results = data.publishResults;
            if (results.instagram && results.instagram.success) {
              const formatLabel = (results.instagram.format || 'post').toUpperCase();
              showToast(`📸 Instagram: Publicado como ${formatLabel}!`, 'info');
            }
            if (results.youtube && results.youtube.success) {
              showToast(`▶️ YouTube: Vídeo processado no canal!`, 'info');
            }
            if (results.facebook && results.facebook.success) {
              if (results.facebook.actionRequired) {
                try {
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(caption);
                  }
                } catch (_) {}
                showToast(`📋 Legenda copiada! Abrindo publicação para a Página Gamefy...`, 'success');
                showFacebookConfirmModal(caption, results.facebook);
                
                // Limpa o formulário mantendo o modal visível
                postForm.reset();
                if (btnRemoveMedia) btnRemoveMedia.click();
                if (btnRemoveThumbnail) btnRemoveThumbnail.click();
                if (charCounter) charCounter.textContent = '0 caracteres';
                postCaption.dispatchEvent(new Event('input'));
                postTitle.dispatchEvent(new Event('input'));
                if (modeDirect) modeDirect.click();
                updateSystemStatus();
                return;
              } else {
                showToast(`📘 Facebook: Publicação enviada com sucesso oficial para a Página Gamefy!`, 'info');
              }
            }
          }

          postForm.reset();
          if (btnRemoveMedia) btnRemoveMedia.click();
          if (btnRemoveThumbnail) btnRemoveThumbnail.click();
          if (charCounter) charCounter.textContent = '0 caracteres';
          postCaption.dispatchEvent(new Event('input'));
          postTitle.dispatchEvent(new Event('input'));
          
          if (modeDirect) modeDirect.click();

          updateSystemStatus();
          const tabGal = document.getElementById('tabGallery');
          if (tabGal) tabGal.click();
        } else {
          showToast(data.error || 'Erro ao realizar publicação.', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Erro ao comunicar com o servidor.', 'error');
      } finally {
        btnSubmitPost.disabled = false;
        submitBtnText.textContent = originalText;
      }
    });
  }

  function showFacebookConfirmModal(caption, fbResult = {}) {
    if (!postModal) return;
    modalTitle.innerHTML = '<i class="fa-brands fa-facebook" style="color: #1877f2;"></i> Publicação no Facebook Preparada';
    
    const pageUrl = fbResult.pageUrl || 'https://www.facebook.com/1416757084856499';
    const altPageUrl = 'https://www.facebook.com/profile.php?id=61594967322504';

    modalContent.innerHTML = `
      <div style="text-align: center; padding: 0.5rem 0;">
        <div style="font-size: 3.2rem; color: #10b981; margin-bottom: 0.5rem;">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        <h3 style="margin-bottom: 0.35rem; color: #f8fafc; font-size: 1.25rem; font-weight: 800;">
          Post salvo no Acervo & Legenda Copiada!
        </h3>
        <p style="color: #94a3b8; font-size: 0.88rem; margin-bottom: 1.25rem; line-height: 1.5;">
          A sua legenda já está na sua área de transferência. Basta abrir a sua <strong style="color: #38bdf8;">Página Gamefy</strong> e colar com <kbd style="background: rgba(255,255,255,0.1); padding: 0.2rem 0.4rem; border-radius: 4px; color: #fff;">Ctrl + V</kbd>!
        </p>

        <!-- Caixa de Legenda com Botão de Copiar Novamente -->
        <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 0.85rem 1rem; text-align: left; margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
            <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: #64748b;">Texto Copiado:</span>
            <button type="button" id="btnCopyAgainModal" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; border-radius: 6px; padding: 0.25rem 0.6rem; font-size: 0.75rem; font-weight: 700; cursor: pointer;">
              <i class="fa-regular fa-copy"></i> Copiar Novamente
            </button>
          </div>
          <div style="font-size: 0.85rem; color: #cbd5e1; max-height: 80px; overflow-y: auto; white-space: pre-wrap;">${escapeHtml(caption)}</div>
        </div>
        
        <!-- Botões de Ação Direta -->
        <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.25rem;">
          <a href="${pageUrl}" target="_blank" rel="noopener noreferrer" class="btn-submit" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 0.6rem; background: #1877f2; padding: 0.95rem; border-radius: 12px; font-weight: 800; font-size: 1rem; box-shadow: 0 6px 20px rgba(24, 119, 242, 0.4);">
            <i class="fa-brands fa-facebook"></i> Abrir Página Gamefy & Colar Post
          </a>
          <a href="${altPageUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255,255,255,0.1); padding: 0.75rem; border-radius: 10px; color: #94a3b8; font-weight: 600; font-size: 0.85rem;">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Link Alternativo da Página Gamefy
          </a>
          <button type="button" id="btnGoToGalleryFromModal" style="background: transparent; border: none; color: #38bdf8; font-size: 0.88rem; font-weight: 700; cursor: pointer; padding: 0.4rem; text-decoration: underline;">
            <i class="fa-solid fa-images"></i> Ir para a Galeria de Publicações
          </button>
        </div>
        
        <p style="font-size: 0.78rem; color: #64748b; line-height: 1.4; margin: 0;">
          💡 <strong>Como publicar:</strong> Ao clicar no botão azul acima, a Página Gamefy abrirá no seu navegador. Basta clicar em "Criar publicação", apertar <strong>Ctrl + V</strong> e adicionar sua imagem se houver!
        </p>
      </div>
    `;

    const btnCopyAgain = document.getElementById('btnCopyAgainModal');
    if (btnCopyAgain) {
      btnCopyAgain.addEventListener('click', () => {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(caption);
          }
        } catch (_) {}
        btnCopyAgain.innerHTML = '<i class="fa-solid fa-check"></i> Copiado!';
        showToast('📋 Legenda copiada novamente!', 'success');
      });
    }

    const btnGoGal = document.getElementById('btnGoToGalleryFromModal');
    if (btnGoGal) {
      btnGoGal.addEventListener('click', () => {
        postModal.style.display = 'none';
        const tabGal = document.getElementById('tabGallery');
        if (tabGal) tabGal.click();
      });
    }

    postModal.style.display = 'flex';
  }

  // ================= RECONECTAR CONTAS GAMEFY OFICIAL =================
  const btnReconnectGamefy = document.getElementById('btnReconnectGamefy');
  async function reconnectOfficialAccounts() {
    try {
      showToast('Reconectando contas oficiais...', 'info');
      const res = await fetch('/api/accounts/reconnect-all', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('✅ Contas Gamefy (Instagram @gamefyofc, Facebook Gamefy Ofic, YouTube GAMEFY_OFICIAL) reconectadas com sucesso!', 'success');
        await loadAccounts();
        updateSystemStatus();
      } else {
        showToast('Erro ao reconectar: ' + (data.error || 'Falha'), 'error');
      }
    } catch (err) {
      showToast('Erro ao comunicar com servidor: ' + err.message, 'error');
    }
  }

  if (btnReconnectGamefy) {
    btnReconnectGamefy.addEventListener('click', reconnectOfficialAccounts);
  }
  if (btnHeaderReconnect) {
    btnHeaderReconnect.addEventListener('click', reconnectOfficialAccounts);
  }

  // ================= CONTROLES E FILTROS DA GALERIA =================
  let rawGalleryPosts = [];

  if (btnGoToComposer) {
    btnGoToComposer.addEventListener('click', () => {
      const tabComposer = document.getElementById('tabComposer');
      if (tabComposer) {
        tabComposer.click();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  platformFilterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      platformFilterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.activePlatformFilter = tab.getAttribute('data-filter-platform');
      loadGallery();
    });
  });

  if (statusFilterSelect) {
    statusFilterSelect.addEventListener('change', () => {
      state.activeStatusFilter = statusFilterSelect.value;
      loadGallery();
    });
  }

  if (btnRefreshGallery) {
    btnRefreshGallery.addEventListener('click', () => {
      loadGallery();
      updateSystemStatus();
    });
  }

  if (gallerySearchInput) {
    gallerySearchInput.addEventListener('input', () => {
      const query = gallerySearchInput.value.trim();
      if (btnClearSearch) {
        btnClearSearch.style.display = query ? 'flex' : 'none';
      }
      filterAndRenderGallery();
    });
  }

  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', () => {
      if (gallerySearchInput) gallerySearchInput.value = '';
      btnClearSearch.style.display = 'none';
      filterAndRenderGallery();
      if (gallerySearchInput) gallerySearchInput.focus();
    });
  }

  // Atualizar contadores de métricas da galeria
  function updateGalleryStats(allPosts = []) {
    if (!statTotal) return;
    const total = allPosts.length;
    let igCount = 0;
    let fbCount = 0;
    let ytCount = 0;
    let schedCount = 0;

    allPosts.forEach(p => {
      const plats = p.platforms || [];
      if (plats.includes('instagram')) igCount++;
      if (plats.includes('facebook')) fbCount++;
      if (plats.includes('youtube')) ytCount++;
      if (p.status === 'scheduled') schedCount++;
    });

    statTotal.textContent = total;
    if (statIg) statIg.textContent = igCount;
    if (statFb) statFb.textContent = fbCount;
    if (statYt) statYt.textContent = ytCount;
    if (statSched) statSched.textContent = schedCount;
    if (totalPostsBadge) totalPostsBadge.textContent = total;
  }

  async function loadGallery() {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <h3>Carregando publicações...</h3>
        <p>Buscando acervo sincronizado em tempo real.</p>
      </div>
    `;

    try {
      // Busca geral para métricas
      try {
        const statsRes = await fetch('/api/posts');
        const statsData = await statsRes.json();
        if (statsData.success && statsData.posts) {
          updateGalleryStats(statsData.posts);
        }
      } catch (_) {}

      // Busca filtrada para o grid
      let url = `/api/posts?platform=${state.activePlatformFilter}&status=${state.activeStatusFilter}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.success || !data.posts) {
        rawGalleryPosts = [];
        galleryGrid.innerHTML = `
          <div class="empty-state">
            <i class="fa-solid fa-inbox"></i>
            <h3>Nenhuma postagem nesta categoria</h3>
            <p>Selecione outra plataforma ou crie uma nova postagem na aba ao lado.</p>
          </div>
        `;
        return;
      }

      rawGalleryPosts = data.posts;
      filterAndRenderGallery();
    } catch (err) {
      galleryGrid.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-triangle-exclamation" style="color: #ef4444;"></i>
          <h3>Erro ao carregar a galeria</h3>
          <p>${err.message}</p>
        </div>
      `;
    }
  }

  function filterAndRenderGallery() {
    if (!galleryGrid) return;
    const term = (gallerySearchInput ? gallerySearchInput.value : '').trim().toLowerCase();

    let filtered = rawGalleryPosts;
    if (term) {
      filtered = rawGalleryPosts.filter(post => {
        const captionMatch = (post.caption || '').toLowerCase().includes(term);
        const titleMatch = (post.title || '').toLowerCase().includes(term);
        const platsMatch = (post.platforms || []).some(p => p.toLowerCase().includes(term));
        return captionMatch || titleMatch || platsMatch;
      });
    }

    if (filtered.length === 0) {
      galleryGrid.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-magnifying-glass"></i>
          <h3>Nenhuma postagem encontrada</h3>
          <p>${term ? `Nenhum resultado corresponde à busca "<strong>${escapeHtml(term)}</strong>".` : 'Nenhuma postagem cadastrada com os filtros atuais.'}</p>
        </div>
      `;
      return;
    }

    renderGallery(filtered);
  }

  function renderGallery(posts) {
    galleryGrid.innerHTML = '';

    posts.forEach(post => {
      const card = document.createElement('div');
      card.className = 'gallery-card';

      let mediaHtml = `
        <div class="gallery-media">
          <i class="fa-solid fa-font" style="font-size: 2.5rem; color: #475569;"></i>
        </div>
      `;

      if (post.media_url) {
        if (post.media_type === 'video') {
          mediaHtml = `
            <div class="gallery-media">
              <span class="media-badge-type"><i class="fa-solid fa-video"></i> Vídeo</span>
              <video src="${post.media_url}" preload="metadata" muted></video>
            </div>
          `;
        } else {
          mediaHtml = `
            <div class="gallery-media">
              <span class="media-badge-type"><i class="fa-solid fa-image"></i> Foto</span>
              <img src="${post.media_url}" alt="Post mídia" loading="lazy">
            </div>
          `;
        }
      }

      const platformsHtml = (post.platforms || []).map(p => {
        let icon = 'share-nodes';
        if (p === 'instagram') icon = 'instagram';
        if (p === 'facebook') icon = 'facebook-f';
        if (p === 'youtube') icon = 'youtube';
        return `<span class="plat-badge ${p}"><i class="fa-brands fa-${icon}"></i> ${capitalize(p)}</span>`;
      }).join('');

      let statusLabel = 'Publicado';
      let statusIcon = 'check';
      if (post.status === 'scheduled') {
        statusLabel = 'Agendado';
        statusIcon = 'clock';
      } else if (post.status === 'failed') {
        statusLabel = 'Erro';
        statusIcon = 'xmark';
      }

      let dateDisplay = '';
      if (post.status === 'scheduled' && post.scheduled_at) {
        dateDisplay = `Previsto: ${formatDateTime(post.scheduled_at)}`;
      } else if (post.published_at) {
        dateDisplay = `Publicado: ${formatDateTime(post.published_at)}`;
      } else {
        dateDisplay = formatDateTime(post.created_at);
      }

      card.innerHTML = `
        ${mediaHtml}
        <div class="gallery-body">
          <div class="gallery-platforms">
            ${platformsHtml}
          </div>
          ${post.title ? `<h4 class="gallery-title">${escapeHtml(post.title)}</h4>` : ''}
          <p class="gallery-caption">${escapeHtml(post.caption)}</p>
          <div class="gallery-footer">
            <span class="post-status-badge ${post.status}">
              <i class="fa-solid fa-${statusIcon}"></i> ${statusLabel}
            </span>
            <span class="post-time">${dateDisplay}</span>
          </div>
          <div class="gallery-actions">
            <button class="btn-action btn-view-modal" data-id="${post.id}" title="Ver detalhes e opções">
              <i class="fa-regular fa-eye"></i> Ver
            </button>
            <button class="btn-action btn-copy-fast" data-id="${post.id}" title="Copiar legenda para colar direto nas redes">
              <i class="fa-regular fa-copy"></i> Copiar
            </button>
            ${post.status === 'scheduled' ? `
              <button class="btn-action btn-publish-now" data-id="${post.id}" title="Publicar imediatamente">
                <i class="fa-solid fa-bolt"></i> Postar
              </button>
            ` : ''}
            <button class="btn-action btn-delete" data-id="${post.id}" title="Excluir post">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;

      const btnView = card.querySelector('.btn-view-modal');
      if (btnView) btnView.addEventListener('click', () => openPostModal(post));

      const btnCopyFast = card.querySelector('.btn-copy-fast');
      if (btnCopyFast) {
        btnCopyFast.addEventListener('click', () => {
          const textToCopy = post.caption || post.title || '';
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy);
          }
          showToast('📋 Legenda copiada com sucesso! Pronta para colar.', 'success');
        });
      }

      const btnPublishNow = card.querySelector('.btn-publish-now');
      if (btnPublishNow) {
        btnPublishNow.addEventListener('click', () => publishNowPost(post.id));
      }

      const btnDelete = card.querySelector('.btn-delete');
      if (btnDelete) btnDelete.addEventListener('click', () => deletePost(post.id));

      galleryGrid.appendChild(card);
    });
  }

  async function publishNowPost(id) {
    if (!confirm('Deseja publicar este post agora nas redes selecionadas?')) return;
    try {
      const res = await fetch(`/api/posts/${id}/publish-now`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Post publicado com sucesso!', 'success');
        loadGallery();
        updateSystemStatus();
      } else {
        showToast(data.error || 'Erro ao publicar.', 'error');
      }
    } catch (_) {
      showToast('Erro de conexão.', 'error');
    }
  }

  async function deletePost(id) {
    if (!confirm('Tem certeza que deseja excluir esta postagem da galeria?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Postagem removida da galeria.', 'info');
        loadGallery();
        updateSystemStatus();
      } else {
        showToast(data.error || 'Erro ao excluir.', 'error');
      }
    } catch (_) {
      showToast('Erro de conexão.', 'error');
    }
  }

  // ================= MODAL DE DETALHES AVANÇADO =================
  function openPostModal(post) {
    if (!postModal) return;
    modalTitle.textContent = post.title || 'Detalhes da Postagem';
    
    let mediaHtml = '';
    if (post.media_url) {
      if (post.media_type === 'video') {
        mediaHtml = `<video src="${post.media_url}" controls style="width: 100%; max-height: 380px; border-radius: 12px; margin-bottom: 1.25rem; background: #000; box-shadow: 0 4px 20px rgba(0,0,0,0.5);"></video>`;
      } else {
        mediaHtml = `<img src="${post.media_url}" style="width: 100%; max-height: 380px; object-fit: contain; border-radius: 12px; margin-bottom: 1.25rem; background: #080c14; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">`;
      }
    }

    const plats = (post.platforms || []).map(p => {
      let icon = 'share-nodes';
      if (p === 'instagram') icon = 'instagram';
      if (p === 'facebook') icon = 'facebook-f';
      if (p === 'youtube') icon = 'youtube';
      return `<span class="plat-badge ${p}" style="font-size: 0.85rem; padding: 0.35rem 0.75rem;"><i class="fa-brands fa-${icon}"></i> ${capitalize(p)}</span>`;
    }).join(' ');

    const dateFormatted = post.scheduled_at ? 'Agendado para: ' + formatDateTime(post.scheduled_at) : 'Publicado em: ' + formatDateTime(post.published_at || post.created_at);

    modalContent.innerHTML = `
      ${mediaHtml}
      <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap;">
        <div>${plats}</div>
        <span class="post-status-badge ${post.status}" style="font-size: 0.82rem; padding: 0.35rem 0.75rem;">
          <i class="fa-solid fa-${post.status === 'scheduled' ? 'clock' : (post.status === 'failed' ? 'xmark' : 'check')}"></i> ${capitalize(post.status)}
        </span>
        <span style="font-size: 0.82rem; color: #94a3b8; margin-left: auto;">${dateFormatted}</span>
      </div>

      <div style="margin-bottom: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
          <strong style="color: #94a3b8; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.5px;">Legenda da Postagem:</strong>
          <button type="button" id="btnModalCopyCaption" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; border-radius: 6px; padding: 0.3rem 0.7rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.35rem; transition: all 0.2s;">
            <i class="fa-regular fa-copy"></i> Copiar Legenda
          </button>
        </div>
        <div style="white-space: pre-wrap; background: rgba(15, 23, 42, 0.85); padding: 1rem; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.1); color: #f1f5f9; font-size: 0.92rem; line-height: 1.5; max-height: 200px; overflow-y: auto;">${escapeHtml(post.caption)}</div>
      </div>

      <!-- Auditoria Oficial de Publicação por Destino -->
      <div style="margin-bottom: 1.25rem;">
        <strong style="color: #94a3b8; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 0.5rem;">Status Oficial & Visibilidade por Rede:</strong>
        ${(post.destinations && post.destinations.length > 0) ? post.destinations.map(d => {
          let platColor = d.platform === 'instagram' ? '#e1306c' : (d.platform === 'facebook' ? '#1877f2' : '#ff0000');
          let icon = d.platform === 'instagram' ? 'instagram' : (d.platform === 'facebook' ? 'facebook-f' : 'youtube');
          let visLabel = d.visibility === 'public' ? 'Público 🌐' : (d.visibility === 'private' ? 'Privado 🔒' : 'Restrito ⚠️');
          let stLabel = d.status === 'published' ? 'Confirmado ✅' : (d.status === 'published_with_restrictions' ? 'Publicado c/ Restrições ⚠️' : d.status);
          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.85rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; margin-bottom: 0.4rem;">
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <i class="fa-brands fa-${icon}" style="color: ${platColor}; font-size: 1.1rem;"></i>
                <div>
                  <strong style="color: #fff; font-size: 0.85rem;">${capitalize(d.platform)}</strong>
                  <span style="font-size: 0.78rem; color: #94a3b8; margin-left: 0.4rem;">${stLabel} · <strong style="color: #34d399;">${visLabel}</strong></span>
                </div>
              </div>
              ${d.public_url ? `
                <a href="${d.public_url}" target="_blank" rel="noopener noreferrer" style="color: #60a5fa; font-size: 0.8rem; text-decoration: none; font-weight: 700; background: rgba(59,130,246,0.15); padding: 0.35rem 0.7rem; border-radius: 6px; border: 1px solid rgba(59,130,246,0.3);">
                  <i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir Post Oficial
                </a>
              ` : ''}
            </div>
          `;
        }).join('') : `
          <div style="font-size: 0.82rem; color: #94a3b8; padding: 0.5rem 0;">Aguardando confirmação de novos destinos de envio.</div>
        `}
      </div>

      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.08);">
        <a href="https://www.facebook.com/1097087796819080" target="_blank" style="flex: 1; min-width: 160px; text-decoration: none; text-align: center; background: #1877f2; color: #fff; padding: 0.65rem 1rem; border-radius: 10px; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 0.45rem;">
          <i class="fa-brands fa-facebook-f"></i> Página Gamefy Ofic
        </a>
        <a href="https://www.instagram.com/gamefyofc" target="_blank" style="flex: 1; min-width: 160px; text-decoration: none; text-align: center; background: linear-gradient(135deg, #e1306c 0%, #fd1d1d 50%, #f77737 100%); color: #fff; padding: 0.65rem 1rem; border-radius: 10px; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 0.45rem;">
          <i class="fa-brands fa-instagram"></i> @gamefyofc
        </a>
        <a href="https://www.youtube.com/@GAMEFY_OFICIAL" target="_blank" style="flex: 1; min-width: 160px; text-decoration: none; text-align: center; background: #ff0000; color: #fff; padding: 0.65rem 1rem; border-radius: 10px; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 0.45rem;">
          <i class="fa-brands fa-youtube"></i> GAMEFY_OFICIAL
        </a>
      </div>
    `;

    const btnModalCopyCaption = document.getElementById('btnModalCopyCaption');
    if (btnModalCopyCaption) {
      btnModalCopyCaption.addEventListener('click', () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(post.caption || '');
        }
        btnModalCopyCaption.innerHTML = '<i class="fa-solid fa-check"></i> Copiado!';
        btnModalCopyCaption.style.background = 'rgba(16, 185, 129, 0.2)';
        btnModalCopyCaption.style.borderColor = '#10b981';
        btnModalCopyCaption.style.color = '#34d399';
        showToast('📋 Legenda copiada para a área de transferência!', 'success');
      });
    }

    postModal.style.display = 'flex';
  }

  if (btnModalClose) {
    btnModalClose.addEventListener('click', () => {
      postModal.style.display = 'none';
    });
  }

  if (postModal) {
    postModal.addEventListener('click', (e) => {
      if (e.target === postModal) {
        postModal.style.display = 'none';
      }
    });
  }

  // ================= GERENCIAMENTO DE CONTAS E APIS =================
  async function loadAccounts() {
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      if (!data.success) return;

      let connectedCount = 0;

      data.accounts.forEach(acc => {
        if (acc.is_connected) connectedCount++;

        const isIg = acc.platform === 'instagram';
        const isFb = acc.platform === 'facebook';

        const prefix = isIg ? 'ig' : (isFb ? 'fb' : 'yt');
        const tag = document.getElementById(`${prefix}StatusTag`);
        const nameElem = document.getElementById(`${prefix}AccountName`);
        const idElem = document.getElementById(`${prefix}AccountId`);
        const avatarWrapper = document.getElementById(`${prefix}AvatarWrapper`);
        const statsBadge = document.getElementById(`${prefix}StatsBadge`);
        const feedWrapper = document.getElementById(`${prefix}FeedWrapper`);
        const feedGrid = document.getElementById(`${prefix}RecentFeedGrid`);

        if (tag && nameElem && idElem && avatarWrapper) {
          if (acc.is_connected) {
            tag.className = 'account-status-tag connected';
            tag.innerHTML = '<span class="status-dot-sm"></span> Conectado';

            nameElem.textContent = acc.account_name || 'Conta Conectada';
            idElem.textContent = acc.account_id ? `ID: ${acc.account_id}` : 'Ativo';

            // Atualiza também os mockups de Live Preview com a foto e nome reais
            if (isFb) {
              const fbMockMeta = document.querySelector('#mockupFacebook .user-meta strong');
              const fbMockAvatar = document.querySelector('#mockupFacebook .fb-avatar');
              if (fbMockMeta) fbMockMeta.textContent = acc.account_name;
              if (fbMockAvatar && acc.avatar_url) {
                fbMockAvatar.innerHTML = `<img src="${acc.avatar_url}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
              }
            } else if (isIg) {
              const igMockMeta = document.querySelector('#mockupInstagram .user-meta strong');
              const igMockHandle = document.querySelector('#mockupInstagram .user-handle');
              const igMockAvatar = document.querySelector('#mockupInstagram .ig-avatar');
              if (igMockMeta) igMockMeta.textContent = acc.account_name;
              if (igMockHandle) igMockHandle.textContent = acc.account_name;
              if (igMockAvatar && acc.avatar_url) {
                igMockAvatar.innerHTML = `<img src="${acc.avatar_url}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
              }
            } else {
              // YouTube Standard & Shorts
              const ytChanName = document.getElementById('ytMockupChannelName');
              const ytShortsChan = document.getElementById('ytShortsChannelName');
              const ytAudioTrack = document.getElementById('ytShortsAudioTrack');
              const ytAvatar1 = document.getElementById('ytMockupAvatar');
              const ytAvatar2 = document.getElementById('ytShortsAvatar');

              if (ytChanName) ytChanName.textContent = acc.account_name;
              if (ytShortsChan) ytShortsChan.textContent = `@${acc.account_name.replace(/\s+/g, '')}`;
              if (ytAudioTrack) ytAudioTrack.textContent = `Som original - ${acc.account_name}`;
              if (acc.avatar_url) {
                if (ytAvatar1) ytAvatar1.innerHTML = `<img src="${acc.avatar_url}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
                if (ytAvatar2) ytAvatar2.innerHTML = `<img src="${acc.avatar_url}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
              }
            }

            if (statsBadge) {
              const followers = acc.followersCount || 'Perfil Oficial';
              const postsCount = acc.postsCount || 'Publicações Ativas';
              statsBadge.textContent = `${followers} · ${postsCount}`;
              statsBadge.style.display = 'inline-flex';
            }

            avatarWrapper.className = `avatar-ring ${prefix}-ring connected`;
            if (acc.avatar_url) {
              avatarWrapper.innerHTML = `<img src="${acc.avatar_url}" class="avatar-img" alt="Avatar de ${acc.account_name}">`;
            } else {
              let iconClass = isIg ? 'fa-brands fa-instagram' : (isFb ? 'fa-brands fa-facebook-f' : 'fa-brands fa-youtube');
              avatarWrapper.innerHTML = `<div class="avatar-placeholder"><i class="${iconClass}"></i></div>`;
            }

            // Botão Acessar Perfil
            const profileLink = document.getElementById(`${prefix}ProfileLink`);
            if (profileLink) {
              if (acc.profileUrl && acc.profileUrl !== '#') {
                profileLink.href = acc.profileUrl;
              }
              profileLink.style.display = 'flex';
            }

            // Renderizar feed de publicações recentes
            if (feedWrapper && feedGrid) {
              feedWrapper.style.display = 'block';
              feedGrid.innerHTML = '';

              if (acc.recentPosts && acc.recentPosts.length > 0) {
                acc.recentPosts.slice(0, 6).forEach(item => {
                  const mini = document.createElement('div');
                  mini.className = 'feed-mini-post';
                  
                  let mediaContent = '';
                  if (item.media_url) {
                    mediaContent = `<img src="${item.media_url}" alt="Post" loading="lazy">`;
                  } else {
                    mediaContent = `
                      <div style="width:100%;height:100%;background:rgba(255,255,255,0.03);display:flex;align-items:center;justify-content:center;padding:0.4rem;text-align:center;font-size:0.65rem;color:var(--text-muted);line-height:1.2;overflow:hidden;">
                        <span><i class="fa-solid fa-align-left"></i> ${escapeHtml((item.title || item.caption || 'Post').substring(0, 25))}...</span>
                      </div>
                    `;
                  }
                  
                  mini.innerHTML = `
                    ${mediaContent}
                    <div class="feed-mini-overlay" title="${escapeHtml(item.title || item.caption || '')}">
                      <span><i class="fa-solid ${item.media_type === 'video' ? 'fa-play' : 'fa-eye'}"></i> ${item.likes || 'Ver'}</span>
                    </div>
                  `;

                  mini.addEventListener('click', () => {
                    if (item.url) {
                      window.open(item.url, '_blank');
                    } else {
                      openPostModal({
                        title: item.title || `Publicação no ${capitalize(acc.platform)}`,
                        caption: item.caption,
                        media_url: item.media_url,
                        media_type: item.media_type || 'image',
                        platforms: [acc.platform],
                        status: item.status || 'published',
                        published_at: item.published_at || item.created_at
                      });
                    }
                  });

                  feedGrid.appendChild(mini);
                });
              } else {
                feedGrid.innerHTML = '<div style="grid-column: 1/-1; font-size: 0.75rem; color: var(--text-muted); text-align: center; padding: 0.75rem 0.5rem; background: var(--bg-input); border: 1px dashed var(--border-color); border-radius: 6px;"><i class="fa-regular fa-folder-open" style="margin-right:0.4rem;"></i> Nenhuma publicação recente ainda.</div>';
              }
            }
          } else {
            tag.className = 'account-status-tag disconnected';
            tag.innerHTML = '<span class="status-dot-sm"></span> Não conectado';

            nameElem.textContent = `${capitalize(acc.platform)} Desconectado`;
            idElem.textContent = 'ID: Não configurado';

            const profileLink = document.getElementById(`${prefix}ProfileLink`);
            if (profileLink) profileLink.style.display = 'none';

            if (statsBadge) statsBadge.style.display = 'none';
            if (feedWrapper) feedWrapper.style.display = 'none';

            avatarWrapper.className = `avatar-ring ${prefix}-ring`;
            let iconClass = isIg ? 'fa-brands fa-instagram' : (isFb ? 'fa-brands fa-facebook-f' : 'fa-brands fa-youtube');
            avatarWrapper.innerHTML = `<div class="avatar-placeholder"><i class="${iconClass}"></i></div>`;
          }
        }
      });

      if (activeAccountsBadge) {
        activeAccountsBadge.textContent = `${connectedCount}/3`;
      }
    } catch (err) {
      console.error('Erro ao carregar contas:', err);
    }
  }

  // Elementos do Modal de Login Rápido
  const fastLoginModal = document.getElementById('fastLoginModal');
  const btnFastLoginClose = document.getElementById('btnFastLoginClose');
  const fastLoginForm = document.getElementById('fastLoginForm');
  const fastLoginPlatform = document.getElementById('fastLoginPlatform');
  const fastLoginUsername = document.getElementById('fastLoginUsername');
  const fastLoginTitle = document.getElementById('fastLoginTitle');
  const fastLoginIconBadge = document.getElementById('fastLoginIconBadge');
  const fastLoginSubhead = document.getElementById('fastLoginSubhead');
  const fastLoginDesc = document.getElementById('fastLoginDesc');
  const fastLoginUserLabel = document.getElementById('fastLoginUserLabel');
  const fastLoginInputIcon = document.getElementById('fastLoginInputIcon');
  const btnFastConfirm = document.getElementById('btnFastConfirm');
  const btnOAuthBrowser = document.getElementById('btnOAuthBrowser');

  window.startFastLogin = async (platform) => {
    if (!fastLoginModal) return;
    fastLoginPlatform.value = platform;
    fastLoginUsername.value = '';

    if (platform === 'instagram') {
      fastLoginTitle.textContent = 'Login com Instagram';
      fastLoginIconBadge.className = 'fast-login-icon-badge';
      fastLoginIconBadge.style.background = 'var(--ig-gradient)';
      fastLoginIconBadge.innerHTML = '<i class="fa-brands fa-instagram"></i>';
      fastLoginSubhead.textContent = 'Vincular seu perfil do Instagram';
      fastLoginDesc.textContent = 'Informe seu @ de usuário para autorizar a publicação direta em segundos.';
      fastLoginUserLabel.textContent = 'Seu @ no Instagram:';
      fastLoginInputIcon.className = 'fa-solid fa-at';
      fastLoginUsername.placeholder = '@seu_perfil_insta';
    } else if (platform === 'facebook') {
      fastLoginTitle.textContent = 'Login com Facebook';
      fastLoginIconBadge.className = 'fast-login-icon-badge';
      fastLoginIconBadge.style.background = 'var(--fb-color)';
      fastLoginIconBadge.innerHTML = '<i class="fa-brands fa-facebook-f"></i>';
      fastLoginSubhead.textContent = 'Vincular sua Página do Facebook';
      fastLoginDesc.textContent = 'Informe o nome da sua página comercial para liberar postagens imediatas.';
      fastLoginUserLabel.textContent = 'Nome da Página no Facebook:';
      fastLoginInputIcon.className = 'fa-solid fa-flag';
      fastLoginUsername.placeholder = 'Ex: Minha Empresa Oficial';
    } else if (platform === 'youtube') {
      fastLoginTitle.textContent = 'Login com Google / YouTube';
      fastLoginIconBadge.className = 'fast-login-icon-badge';
      fastLoginIconBadge.style.background = 'var(--yt-color)';
      fastLoginIconBadge.innerHTML = '<i class="fa-brands fa-youtube"></i>';
      fastLoginSubhead.textContent = 'Vincular seu Canal do YouTube';
      fastLoginDesc.textContent = 'Informe o nome do seu canal para upload e agendamento de vídeos/Shorts.';
      fastLoginUserLabel.textContent = 'Nome ou Link do Canal:';
      fastLoginInputIcon.className = 'fa-brands fa-youtube';
      fastLoginUsername.placeholder = 'Ex: Meu Canal Oficial';
    }

    // Verificar se há suporte a OAuth oficial
    try {
      const res = await fetch(`/api/accounts/${platform}/oauth-url`);
      const data = await res.json();
      if (data.supported && data.url) {
        btnOAuthBrowser.style.display = 'block';
        btnOAuthBrowser.onclick = () => {
          window.open(data.url, 'SocialAuth', 'width=650,height=750,top=100,left=200');
        };
      } else {
        btnOAuthBrowser.style.display = 'none';
      }
    } catch (_) {
      btnOAuthBrowser.style.display = 'none';
    }

    fastLoginModal.style.display = 'flex';
    setTimeout(() => fastLoginUsername.focus(), 100);
  };

  if (btnFastLoginClose) {
    btnFastLoginClose.addEventListener('click', () => {
      fastLoginModal.style.display = 'none';
    });
  }

  if (fastLoginModal) {
    fastLoginModal.addEventListener('click', (e) => {
      if (e.target === fastLoginModal) {
        fastLoginModal.style.display = 'none';
      }
    });
  }

  if (fastLoginForm) {
    fastLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const platform = fastLoginPlatform.value;
      const username = fastLoginUsername.value.trim();

      btnFastConfirm.disabled = true;
      const originalText = btnFastConfirm.innerHTML;
      btnFastConfirm.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Conectando...';

      try {
        const res = await fetch(`/api/accounts/${platform}/fast-connect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        });

        const data = await res.json();
        if (data.success) {
          showToast(data.message, 'success');
          fastLoginModal.style.display = 'none';
          loadAccounts();
        } else {
          showToast(data.error || 'Erro ao conectar.', 'error');
        }
      } catch (err) {
        showToast('Erro de comunicação.', 'error');
      } finally {
        btnFastConfirm.disabled = false;
        btnFastConfirm.innerHTML = originalText;
      }
    });
  }

  // ================= CHROME ONE-CLICK SYNC =================
  const btnChromeSync = document.getElementById('btnChromeSync');
  const chromeSyncModal = document.getElementById('chromeSyncModal');
  const btnChromeSyncClose = document.getElementById('btnChromeSyncClose');
  const btnConfirmChromeSync = document.getElementById('btnConfirmChromeSync');

  if (btnChromeSync) {
    btnChromeSync.addEventListener('click', () => {
      if (chromeSyncModal) {
        chromeSyncModal.style.display = 'flex';
      }
    });
  }

  if (btnChromeSyncClose) {
    btnChromeSyncClose.addEventListener('click', () => {
      if (chromeSyncModal) {
        chromeSyncModal.style.display = 'none';
      }
    });
  }

  if (chromeSyncModal) {
    chromeSyncModal.addEventListener('click', (e) => {
      if (e.target === chromeSyncModal) {
        chromeSyncModal.style.display = 'none';
      }
    });
  }

  if (btnConfirmChromeSync) {
    btnConfirmChromeSync.addEventListener('click', async () => {
      btnConfirmChromeSync.disabled = true;
      const orig = btnConfirmChromeSync.innerHTML;
      btnConfirmChromeSync.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sincronizando contas do Chrome...';

      try {
        const res = await fetch('/api/accounts/chrome-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            googleName: 'Canal Oficial do YouTube',
            igHandle: '@meu_perfil_insta',
            fbPageName: 'Minha Página Comercial'
          })
        });

        const data = await res.json();
        if (data.success) {
          showToast(data.message, 'success');
          if (chromeSyncModal) chromeSyncModal.style.display = 'none';
          loadAccounts();
        } else {
          showToast(data.error || 'Erro ao sincronizar.', 'error');
        }
      } catch (err) {
        showToast('Erro de comunicação.', 'error');
      } finally {
        btnConfirmChromeSync.disabled = false;
        btnConfirmChromeSync.innerHTML = orig;
      }
    });
  }

  // Funções de contas expostas globalmente no objeto window
  window.openConnectModal = (platform) => {
    if (!connectModal) return;
    connectPlatform.value = platform;
    inputAccountId.value = '';
    inputAccessToken.value = '';
    if (inputApiKey) inputApiKey.value = '';

    const instructionsText = document.getElementById('apiInstructionsText');
    const guideLink = document.getElementById('apiGuideLink');

    if (platform === 'instagram') {
      connectModalTitle.innerHTML = '<i class="fa-brands fa-instagram" style="color: #ff5483;"></i> Conectar Conta Real do Instagram';
      if (instructionsText) {
        instructionsText.textContent = 'Gere seu token de usuário oficial na ferramenta Meta Graph API Explorer com permissão instagram_content_publish e cole abaixo.';
      }
      if (guideLink) {
        guideLink.href = 'https://developers.facebook.com/tools/explorer/';
        guideLink.innerHTML = '<i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir Meta Graph API Explorer (Oficial)';
      }
      labelAccountId.textContent = 'Instagram Business Account ID *';
      inputAccountId.placeholder = 'Ex: 17841405829201928';
      helpAccountId.textContent = 'Seu ID de Conta Profissional do Instagram vinculado à Página do Facebook.';
      labelAccessToken.textContent = 'Meta Access Token (Token Oficial) *';
      helpAccessToken.textContent = 'Token de usuário ou página gerado no painel da Meta.';
      if (groupApiKey) groupApiKey.style.display = 'none';
    } else if (platform === 'facebook') {
      connectModalTitle.innerHTML = '<i class="fa-brands fa-facebook-f" style="color: #589bff;"></i> Conectar Página Real do Facebook';
      if (instructionsText) {
        instructionsText.textContent = 'Gere o Page Access Token da sua página no Meta Graph Explorer com a permissão pages_manage_posts.';
      }
      if (guideLink) {
        guideLink.href = 'https://developers.facebook.com/tools/explorer/';
        guideLink.innerHTML = '<i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir Meta Graph Explorer (Oficial)';
      }
      labelAccountId.textContent = 'Facebook Page ID *';
      inputAccountId.placeholder = 'Ex: 104928475829102';
      helpAccountId.textContent = 'O ID numérico da sua Página comercial no Facebook.';
      labelAccessToken.textContent = 'Page Access Token *';
      helpAccessToken.textContent = 'Token da Página com permissão pages_manage_posts.';
      if (groupApiKey) groupApiKey.style.display = 'none';
    } else if (platform === 'youtube') {
      connectModalTitle.innerHTML = '<i class="fa-brands fa-youtube" style="color: #ff4d4d;"></i> Conectar Canal Real do YouTube';
      if (instructionsText) {
        instructionsText.textContent = 'Gere um token de autorização do Google no OAuth 2.0 Playground com o escopo https://www.googleapis.com/auth/youtube.upload.';
      }
      if (guideLink) {
        guideLink.href = 'https://developers.google.com/oauthplayground/';
        guideLink.innerHTML = '<i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir Google OAuth 2.0 Playground';
      }
      labelAccountId.textContent = 'Channel ID do YouTube (Opcional se usar Token)';
      inputAccountId.placeholder = 'Ex: UC_x5XG1OV2P6uZZ5FSM9Ttw';
      inputAccountId.required = false;
      helpAccountId.textContent = 'ID do seu canal do YouTube (começa com UC...).';
      labelAccessToken.textContent = 'OAuth Access Token do Google *';
      helpAccessToken.textContent = 'Token gerado no Google Cloud ou OAuth Playground.';
      if (groupApiKey) groupApiKey.style.display = 'block';
    }

    connectModal.style.display = 'flex';
  };

  if (btnConnectModalClose) {
    btnConnectModalClose.addEventListener('click', () => {
      connectModal.style.display = 'none';
    });
  }

  if (connectModal) {
    connectModal.addEventListener('click', (e) => {
      if (e.target === connectModal) {
        connectModal.style.display = 'none';
      }
    });
  }

  window.quickDemoConnect = async (platform) => {
    try {
      showToast(`Conectando conta simulada para ${capitalize(platform)}...`, 'info');
      const res = await fetch(`/api/accounts/${platform}/demo`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        loadAccounts();
      } else {
        showToast(data.error || 'Erro ao ativar demonstração.', 'error');
      }
    } catch (_) {
      showToast('Erro de conexão ao ativar teste.', 'error');
    }
  };

  window.disconnectSocialAccount = async (platform) => {
    if (!confirm(`Deseja desconectar a conta do ${capitalize(platform)}?`)) return;
    try {
      const res = await fetch(`/api/accounts/${platform}/disconnect`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(`Conta do ${capitalize(platform)} desconectada com sucesso.`, 'info');
        loadAccounts();
      }
    } catch (_) {
      showToast('Erro ao desconectar conta.', 'error');
    }
  };

  if (btnConnectAllDemo) {
    btnConnectAllDemo.addEventListener('click', async () => {
      btnConnectAllDemo.disabled = true;
      try {
        await fetch('/api/accounts/instagram/demo', { method: 'POST' });
        await fetch('/api/accounts/facebook/demo', { method: 'POST' });
        await fetch('/api/accounts/youtube/demo', { method: 'POST' });
        showToast('Todas as 3 redes (Instagram, Facebook e YouTube) foram conectadas no Modo Teste!', 'success');
        loadAccounts();
      } catch (_) {
        showToast('Erro ao conectar contas simuladas.', 'error');
      } finally {
        btnConnectAllDemo.disabled = false;
      }
    });
  }

  if (connectForm) {
    connectForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const platform = connectPlatform.value;
      const accountId = inputAccountId.value.trim();
      const accessToken = inputAccessToken.value.trim();
      const apiKey = inputApiKey ? inputApiKey.value.trim() : null;

      btnSaveCredentials.disabled = true;
      const origHtml = btnSaveCredentials.innerHTML;
      btnSaveCredentials.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Validando com a API...';

      try {
        const res = await fetch(`/api/accounts/${platform}/connect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountId, accessToken, apiKey })
        });

        const data = await res.json();
        if (data.success) {
          showToast(data.message, 'success');
          connectModal.style.display = 'none';
          loadAccounts();
        } else {
          showToast(data.error || 'Falha ao validar credenciais.', 'error');
        }
      } catch (err) {
        showToast('Erro ao validar com a API oficial.', 'error');
      } finally {
        btnSaveCredentials.disabled = false;
        btnSaveCredentials.innerHTML = origHtml;
      }
    });
  }

  // ================= STATUS DO SISTEMA =================
  async function updateSystemStatus() {
    try {
      const res = await fetch('/api/system/status');
      const data = await res.json();
      if (data.success) {
        const isDbOk = data.database.connected;
        if (dbStatusIndicator) {
          dbStatusIndicator.className = isDbOk ? 'system-status' : 'system-status offline';
          dbStatusIndicator.title = isDbOk ? `Conectado ao MySQL em ${data.database.host}:${data.database.port}` : `MySQL indisponível (${data.database.error || 'Aguardando serviço'}). Operando com persistência local.`;
        }
        if (dbStatusText) {
          dbStatusText.textContent = isDbOk ? `MySQL Conectado (${data.database.dbName})` : 'Armazenamento Local Ativo';
        }

        if (totalPostsBadge) totalPostsBadge.textContent = data.stats.total;
        if (statTotal) statTotal.textContent = data.stats.total;
        if (statIg) statIg.textContent = data.stats.instagram;
        if (statFb) statFb.textContent = data.stats.facebook;
        if (statYt) statYt.textContent = data.stats.youtube;
        if (statSched) statSched.textContent = data.stats.scheduled;
      }
    } catch (_) {}
  }

  // Inicializações
  updateSystemStatus();
  loadAccounts();
  loadGallery();
  setInterval(updateSystemStatus, 10000);

  // ================= UTILITÁRIOS =================
  function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'circle-info';
    if (type === 'success') icon = 'circle-check';
    if (type === 'error') icon = 'triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid fa-${icon}"></i> <span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 4000);
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function formatDateTime(dtStr) {
    if (!dtStr) return '-';
    const d = new Date(dtStr);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
  }

  // ================= MODAL ALTERNAR PÁGINA DO FACEBOOK =================
  window.openSwitchPageModal = async function() {
    const modal = document.getElementById('switchPageModal');
    const list = document.getElementById('switchPagesList');
    if (!modal || !list) return;

    modal.style.display = 'flex';
    list.innerHTML = `<div style="text-align: center; padding: 2rem; color: #94a3b8;"><i class="fa-solid fa-spinner fa-spin"></i> Carregando suas páginas da Meta...</div>`;

    try {
      const res = await fetch('/api/accounts/facebook-pages');
      const data = await res.json();

      if (!data.success || !data.pages || data.pages.length === 0) {
        list.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 1.5rem;">Nenhuma página encontrada na sua conta da Meta.</p>`;
        return;
      }

      list.innerHTML = '';
      data.pages.forEach(p => {
        const item = document.createElement('div');
        item.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.9rem 1.1rem;
          background: ${p.isActive ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.04)'};
          border: 1px solid ${p.isActive ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.08)'};
          border-radius: 14px;
          gap: 1rem;
          transition: all 0.2s ease;
        `;

        const avatarImg = p.avatar 
          ? `<img src="${p.avatar}" style="width: 46px; height: 46px; border-radius: 50%; object-fit: cover; border: 2px solid ${p.isActive ? '#3b82f6' : 'rgba(255,255,255,0.1)'};">` 
          : `<div style="width: 46px; height: 46px; border-radius: 50%; background: #1877f2; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.2rem;"><i class="fa-brands fa-facebook-f"></i></div>`;

        item.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.9rem; overflow: hidden;">
            ${avatarImg}
            <div style="overflow: hidden;">
              <strong style="color: #fff; font-size: 1rem; display: block; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${escapeHtml(p.name)}</strong>
              <span style="font-size: 0.78rem; color: #94a3b8;">${p.followersCount ? `<strong style="color: #60a5fa;">${p.followersCount}</strong> · ` : ''}ID: ${p.id}</span>
              ${p.isActive ? '<div style="margin-top: 0.2rem;"><span style="color: #34d399; font-size: 0.72rem; font-weight: 700;"><i class="fa-solid fa-circle-check"></i> Página Ativa no App</span></div>' : ''}
            </div>
          </div>
          <div>
            ${p.isActive ? `
              <span style="background: rgba(16, 185, 129, 0.2); color: #34d399; font-size: 0.78rem; font-weight: 700; padding: 0.4rem 0.85rem; border-radius: 20px; display: inline-flex; align-items: center; gap: 0.35rem; border: 1px solid rgba(16, 185, 129, 0.3);">
                <i class="fa-solid fa-check"></i> Em Uso
              </span>
            ` : `
              <button type="button" class="btn-switch-to-page" data-page-id="${p.id}" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; border: none; padding: 0.55rem 1rem; border-radius: 10px; font-weight: 700; font-size: 0.82rem; cursor: pointer; display: inline-flex; align-items: center; gap: 0.35rem; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
                <i class="fa-solid fa-arrow-right-arrow-left"></i> Ativar
              </button>
            `}
          </div>
        `;

        const btnUse = item.querySelector('.btn-switch-to-page');
        if (btnUse) {
          btnUse.addEventListener('click', async () => {
            btnUse.disabled = true;
            btnUse.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Ativando...';
            try {
              const switchRes = await fetch('/api/accounts/switch-facebook-page', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pageId: p.id })
              });
              const switchData = await switchRes.json();
              if (switchData.success) {
                showToast(`Página ativada com sucesso: ${p.name}!`, 'success');
                modal.style.display = 'none';
                await loadAccounts();
              } else {
                showToast(switchData.error || 'Erro ao alternar.', 'error');
                btnUse.disabled = false;
                btnUse.innerHTML = '<i class="fa-solid fa-arrow-right-arrow-left"></i> Ativar';
              }
            } catch (err) {
              showToast(err.message, 'error');
              btnUse.disabled = false;
              btnUse.innerHTML = '<i class="fa-solid fa-arrow-right-arrow-left"></i> Ativar';
            }
          });
        }

        list.appendChild(item);
      });
    } catch (err) {
      list.innerHTML = `<p style="color: #ef4444; padding: 1.5rem; text-align: center;">Erro ao buscar páginas: ${escapeHtml(err.message)}</p>`;
    }
  };

  // ===================================================
  // AUTENTICAÇÃO JWT & GERENCIAMENTO DE SESSÃO
  // ===================================================
  let currentUser = null;

  function getAuthToken() {
    return localStorage.getItem('sp_jwt_token') || null;
  }

  function setAuthToken(token) {
    if (token) localStorage.setItem('sp_jwt_token', token);
    else localStorage.removeItem('sp_jwt_token');
  }

  function getAuthHeaders() {
    const token = getAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  async function checkAuthStatus() {
    const token = getAuthToken();
    const navName = document.getElementById('navUserName');
    const navAvatar = document.getElementById('navUserAvatar');
    const navRoleTag = document.getElementById('navUserRoleTag');
    const tabAdmin = document.getElementById('tabAdmin');

    if (!token) {
      currentUser = null;
      if (navName) navName.textContent = 'Entrar';
      if (navAvatar) navAvatar.textContent = '?';
      if (navRoleTag) navRoleTag.style.display = 'none';
      if (tabAdmin) tabAdmin.style.display = 'none';
      return;
    }

    try {
      const res = await fetch('/api/auth/me', { headers: getAuthHeaders() });
      const data = await res.json();

      if (data.success && data.user) {
        currentUser = data.user;
        const initials = (currentUser.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        
        if (navName) navName.textContent = currentUser.name.split(' ')[0];
        if (navAvatar) navAvatar.textContent = initials;
        if (navRoleTag) {
          navRoleTag.textContent = (currentUser.role || 'user').toUpperCase();
          navRoleTag.className = `role-badge-tag ${currentUser.role || 'user'}`;
          navRoleTag.style.display = 'inline-block';
        }

        // Exibir aba Admin apenas para Root e Admin
        if (tabAdmin) {
          tabAdmin.style.display = (currentUser.role === 'root' || currentUser.role === 'admin') ? 'inline-flex' : 'none';
        }
      } else {
        // Token inválido/expirado
        setAuthToken(null);
        currentUser = null;
        if (navName) navName.textContent = 'Entrar';
        if (navAvatar) navAvatar.textContent = '?';
        if (navRoleTag) navRoleTag.style.display = 'none';
        if (tabAdmin) tabAdmin.style.display = 'none';
      }
    } catch (_) {
      // Ignora erro offline
    }
  }

  window.handleUserAuthClick = function() {
    const modal = document.getElementById('authModal');
    if (!modal) return;

    const loggedInPanel = document.getElementById('loggedInPanel');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTabLogin = document.getElementById('authTabLogin');
    const authTabRegister = document.getElementById('authTabRegister');
    const tabContainer = authTabLogin?.parentElement;

    if (currentUser) {
      // Mostrar perfil do usuário logado
      if (loggedInPanel) loggedInPanel.style.display = 'block';
      if (loginForm) loginForm.style.display = 'none';
      if (registerForm) registerForm.style.display = 'none';
      if (tabContainer) tabContainer.style.display = 'none';

      const userModalAvatar = document.getElementById('userModalAvatar');
      const userModalName = document.getElementById('userModalName');
      const userModalEmail = document.getElementById('userModalEmail');
      const userModalRoleBadge = document.getElementById('userModalRoleBadge');

      if (userModalAvatar) {
        userModalAvatar.textContent = (currentUser.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      }
      if (userModalName) userModalName.textContent = currentUser.name;
      if (userModalEmail) userModalEmail.textContent = currentUser.email;
      if (userModalRoleBadge) {
        userModalRoleBadge.textContent = (currentUser.role || 'user').toUpperCase();
        userModalRoleBadge.className = `role-badge-tag ${currentUser.role || 'user'}`;
      }
    } else {
      // Mostrar tela de login
      if (loggedInPanel) loggedInPanel.style.display = 'none';
      if (tabContainer) tabContainer.style.display = 'flex';
      window.switchAuthTab('login');
    }

    modal.style.display = 'flex';
  };

  window.closeAuthModal = function() {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'none';
  };

  window.switchAuthTab = function(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabLogin = document.getElementById('authTabLogin');
    const tabReg = document.getElementById('authTabRegister');

    if (tab === 'login') {
      if (loginForm) loginForm.style.display = 'block';
      if (registerForm) registerForm.style.display = 'none';
      if (tabLogin) tabLogin.classList.add('active');
      if (tabReg) tabReg.classList.remove('active');
    } else {
      if (loginForm) loginForm.style.display = 'none';
      if (registerForm) registerForm.style.display = 'block';
      if (tabLogin) tabLogin.classList.remove('active');
      if (tabReg) tabReg.classList.add('active');
    }
  };

  window.handleLoginSubmit = async function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success && data.token) {
        setAuthToken(data.token);
        currentUser = data.user;
        showToast('Login realizado com sucesso!', 'success');
        window.closeAuthModal();
        await checkAuthStatus();
        await loadGroups();
      } else {
        showToast(data.error || 'Credenciais inválidas.', 'error');
      }
    } catch (err) {
      showToast('Erro ao conectar ao servidor: ' + err.message, 'error');
    }
  };

  window.handleRegisterSubmit = async function(e) {
    e.preventDefault();
    const name = document.getElementById('registerName')?.value;
    const email = document.getElementById('registerEmail')?.value;
    const password = document.getElementById('registerPassword')?.value;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();

      if (data.success && data.token) {
        setAuthToken(data.token);
        currentUser = data.user;
        showToast('Conta criada com sucesso! Bem-vindo!', 'success');
        window.closeAuthModal();
        await checkAuthStatus();
        await loadGroups();
      } else {
        showToast(data.error || 'Erro ao realizar cadastro.', 'error');
      }
    } catch (err) {
      showToast('Erro ao cadastrar: ' + err.message, 'error');
    }
  };

  window.handleLogout = function() {
    setAuthToken(null);
    currentUser = null;
    showToast('Você saiu da sua conta.', 'info');
    window.closeAuthModal();
    checkAuthStatus();
    loadGroups();
  };

  // ===================================================
  // GERENCIAMENTO DE GRUPOS DE PUBLICAÇÃO
  // ===================================================
  let currentGroups = [];

  async function loadGroups() {
    try {
      const res = await fetch('/api/groups', { headers: getAuthHeaders() });
      const data = await res.json();
      if (!data.success) return;

      currentGroups = data.groups || [];

      // Atualiza badge de grupos no header
      const totalBadge = document.getElementById('totalGroupsBadge');
      if (totalBadge) totalBadge.textContent = currentGroups.length;

      // Atualiza dropdown no Composer
      const selectComposer = document.getElementById('selectComposerGroup');
      if (selectComposer) {
        selectComposer.innerHTML = '<option value="custom">⚡ Seleção Manual Personalizada</option>';
        currentGroups.forEach(g => {
          const plats = (g.platforms || []).map(p => capitalize(p)).join(' + ');
          const opt = document.createElement('option');
          opt.value = g.id;
          opt.textContent = `📁 ${g.name} (${plats})`;
          selectComposer.appendChild(opt);
        });
      }

      // Renderiza grid de grupos
      const grid = document.getElementById('groupsCardsGrid');
      if (!grid) return;

      if (currentGroups.length === 0) {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <i class="fa-solid fa-layer-group"></i>
            <h3>Nenhum grupo cadastrado</h3>
            <p>Crie um grupo para reunir suas contas do Instagram, Facebook e YouTube e publicar em lote com 1 clique.</p>
            <button class="btn-create-group" style="margin-top: 1rem;" onclick="window.openGroupModal()">
              <i class="fa-solid fa-plus"></i> Criar Primeiro Grupo
            </button>
          </div>
        `;
        return;
      }

      grid.innerHTML = '';
      currentGroups.forEach(g => {
        const card = document.createElement('div');
        card.className = 'group-card';

        const platsHtml = (g.platforms || []).map(p => {
          let icon = 'share-nodes';
          if (p === 'instagram') icon = 'instagram';
          if (p === 'facebook') icon = 'facebook-f';
          if (p === 'youtube') icon = 'youtube';
          return `<span class="group-plat-pill ${p}"><i class="fa-brands fa-${icon}"></i> ${capitalize(p)}</span>`;
        }).join('');

        card.innerHTML = `
          <div class="group-card-top">
            <div class="group-icon-circle" style="background: ${g.icon_color || '#6366f1'};">
              <i class="fa-solid fa-layer-group"></i>
            </div>
            <div class="group-info">
              <h3>${escapeHtml(g.name)}</h3>
              <p>${escapeHtml(g.description || 'Sem descrição')}</p>
            </div>
          </div>

          <div class="group-platforms-badges">
            ${platsHtml}
          </div>

          <div class="group-card-actions">
            <button type="button" class="btn-group-use" onclick="window.useGroupToPublish(${g.id})">
              <i class="fa-solid fa-paper-plane"></i> Publicar com este Grupo
            </button>
            <div class="group-action-icons">
              <button type="button" class="btn-group-icon" title="Editar Grupo" onclick="window.openGroupModal(${g.id})">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button type="button" class="btn-group-icon danger" title="Excluir Grupo" onclick="window.deleteGroup(${g.id})">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        `;

        grid.appendChild(card);
      });
    } catch (err) {
      console.warn('Erro ao carregar grupos:', err);
    }
  }

  window.handleGroupSelectionChange = function(selectedVal) {
    if (selectedVal === 'custom') return;

    const group = currentGroups.find(g => g.id === parseInt(selectedVal, 10));
    if (!group) return;

    const targetPlatforms = group.platforms || [];
    const checkboxes = document.querySelectorAll('.platform-pill input[type="checkbox"]');

    checkboxes.forEach(cb => {
      const isIncluded = targetPlatforms.includes(cb.value);
      cb.checked = isIncluded;
      const pill = cb.closest('.platform-pill');
      if (pill) {
        if (isIncluded) pill.classList.add('active');
        else pill.classList.remove('active');
      }
    });

    updatePlatformPreviews();
    updateFormatVisibility();
    updateSelectAllButtonText();
    showToast(`Grupo "${group.name}" selecionado (${targetPlatforms.length} redes ativas).`, 'info');
  };

  window.useGroupToPublish = function(groupId) {
    window.switchView('composer-view');
    const select = document.getElementById('selectComposerGroup');
    if (select) {
      select.value = groupId;
      window.handleGroupSelectionChange(groupId);
    }
  };

  window.openGroupModal = function(groupId = null) {
    const modal = document.getElementById('groupModal');
    if (!modal) return;

    const formId = document.getElementById('groupFormId');
    const formName = document.getElementById('groupFormName');
    const formDesc = document.getElementById('groupFormDescription');
    const formColor = document.getElementById('groupFormColor');
    const title = document.getElementById('groupModalTitle');
    const checkboxes = document.querySelectorAll('input[name="groupPlatforms"]');

    if (groupId) {
      const g = currentGroups.find(item => item.id === parseInt(groupId, 10));
      if (g) {
        formId.value = g.id;
        formName.value = g.name;
        formDesc.value = g.description || '';
        formColor.value = g.icon_color || '#6366f1';
        if (title) title.innerHTML = `<i class="fa-solid fa-pen" style="color: #6366f1;"></i> Editar Grupo`;
        checkboxes.forEach(cb => {
          cb.checked = (g.platforms || []).includes(cb.value);
        });
      }
    } else {
      formId.value = '';
      formName.value = '';
      formDesc.value = '';
      formColor.value = '#6366f1';
      if (title) title.innerHTML = `<i class="fa-solid fa-layer-group" style="color: #6366f1;"></i> Novo Grupo de Redes`;
      checkboxes.forEach(cb => { cb.checked = true; });
    }

    modal.style.display = 'flex';
  };

  window.closeGroupModal = function() {
    const modal = document.getElementById('groupModal');
    if (modal) modal.style.display = 'none';
  };

  window.handleSaveGroup = async function(e) {
    e.preventDefault();
    const id = document.getElementById('groupFormId')?.value;
    const name = document.getElementById('groupFormName')?.value;
    const description = document.getElementById('groupFormDescription')?.value;
    const iconColor = document.getElementById('groupFormColor')?.value;

    const selectedPlats = [];
    document.querySelectorAll('input[name="groupPlatforms"]:checked').forEach(cb => {
      selectedPlats.push(cb.value);
    });

    if (selectedPlats.length === 0) {
      showToast('Selecione pelo menos uma rede social para o grupo.', 'error');
      return;
    }

    const payload = {
      name,
      description,
      iconColor,
      platforms: selectedPlats
    };

    try {
      const url = id ? `/api/groups/${id}` : '/api/groups';
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        showToast(id ? 'Grupo atualizado!' : 'Grupo criado com sucesso!', 'success');
        window.closeGroupModal();
        await loadGroups();
      } else {
        showToast(data.error || 'Erro ao salvar grupo.', 'error');
      }
    } catch (err) {
      showToast('Erro de comunicação: ' + err.message, 'error');
    }
  };

  window.deleteGroup = async function(id) {
    if (!confirm('Deseja realmente excluir este grupo?')) return;

    try {
      const res = await fetch(`/api/groups/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        showToast('Grupo excluído com sucesso.', 'success');
        await loadGroups();
      } else {
        showToast(data.error || 'Erro ao excluir.', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ===================================================
  // PAINEL DE ADMINISTRAÇÃO & USUÁRIOS
  // ===================================================
  async function loadAdminUsers() {
    const tbody = document.getElementById('adminUsersTableBody');
    if (!tbody) return;

    try {
      const res = await fetch('/api/auth/users', { headers: getAuthHeaders() });
      const data = await res.json();

      if (!data.success || !data.users) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #ef4444; padding: 2rem;">Acesso negado. Apenas administradores podem visualizar esta área.</td></tr>`;
        return;
      }

      const users = data.users;
      const countUsersElem = document.getElementById('adminCountUsers');
      const countGroupsElem = document.getElementById('adminCountGroups');
      const currentRoleElem = document.getElementById('adminCurrentRole');

      if (countUsersElem) countUsersElem.textContent = users.length;
      if (countGroupsElem) countGroupsElem.textContent = currentGroups.length;
      if (currentRoleElem && currentUser) currentRoleElem.textContent = (currentUser.role || 'USER').toUpperCase();

      tbody.innerHTML = '';
      users.forEach(u => {
        const tr = document.createElement('tr');
        const isSelf = currentUser && currentUser.id === u.id;

        tr.innerHTML = `
          <td>
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <div class="user-avatar-sm">${(u.name || 'U').charAt(0).toUpperCase()}</div>
              <div>
                <strong style="color: #fff; font-size: 0.95rem;">${escapeHtml(u.name)}</strong>
                ${isSelf ? '<span style="color: #60a5fa; font-size: 0.72rem; margin-left: 0.35rem;">(Você)</span>' : ''}
              </div>
            </div>
          </td>
          <td><span style="color: #94a3b8;">${escapeHtml(u.email)}</span></td>
          <td>
            <select class="role-select" data-user-id="${u.id}" ${(!currentUser || currentUser.role !== 'root' || isSelf) ? 'disabled' : ''} style="background: rgba(30,41,59,0.9); border: 1px solid rgba(255,255,255,0.12); color: #fff; padding: 0.3rem 0.5rem; border-radius: 6px; font-size: 0.8rem;" onchange="window.changeUserRole(${u.id}, this.value)">
              <option value="root" ${u.role === 'root' ? 'selected' : ''}>ROOT</option>
              <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>ADMIN</option>
              <option value="user" ${u.role === 'user' ? 'selected' : ''}>USER</option>
              <option value="member" ${u.role === 'member' ? 'selected' : ''}>MEMBER</option>
            </select>
          </td>
          <td>
            <span style="display: inline-flex; align-items: center; gap: 0.35rem; color: ${u.status === 'active' ? '#34d399' : '#f87171'}; font-size: 0.8rem; font-weight: 700;">
              <span class="status-dot-sm" style="background: currentColor;"></span>
              ${u.status === 'active' ? 'Ativo' : 'Inativo'}
            </span>
          </td>
          <td><span style="color: #94a3b8; font-size: 0.82rem;">${formatDateTime(u.created_at)}</span></td>
          <td style="text-align: right;">
            ${(!isSelf && currentUser && currentUser.role === 'root') ? `
              <button type="button" class="btn-group-icon danger" title="Remover Usuário" onclick="window.deleteUserAdmin(${u.id})">
                <i class="fa-solid fa-trash"></i>
              </button>
            ` : '<span style="color: #64748b; font-size: 0.75rem;">Protegido</span>'}
          </td>
        `;

        tbody.appendChild(tr);
      });
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #ef4444; padding: 2rem;">Erro ao carregar lista de usuários: ${escapeHtml(err.message)}</td></tr>`;
    }
  }

  window.openCreateUserModal = function() {
    const modal = document.getElementById('createUserModal');
    if (modal) modal.style.display = 'flex';
  };

  window.handleAdminCreateUser = async function(e) {
    e.preventDefault();
    const name = document.getElementById('adminNewUserName')?.value;
    const email = document.getElementById('adminNewUserEmail')?.value;
    const password = document.getElementById('adminNewUserPassword')?.value;
    const role = document.getElementById('adminNewUserRole')?.value;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();

      if (data.success && data.user) {
        // Se foi definido um papel diferente de user, atualiza
        if (role && role !== 'user') {
          await fetch(`/api/auth/users/${data.user.id}/role`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ role })
          });
        }
        showToast('Novo usuário cadastrado com sucesso!', 'success');
        document.getElementById('createUserModal').style.display = 'none';
        await loadAdminUsers();
      } else {
        showToast(data.error || 'Erro ao criar usuário.', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  window.changeUserRole = async function(userId, newRole) {
    try {
      const res = await fetch(`/api/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Permissão atualizada com sucesso!', 'success');
      } else {
        showToast(data.error || 'Erro ao alterar permissão.', 'error');
        await loadAdminUsers();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  window.deleteUserAdmin = async function(userId) {
    if (!confirm('Deseja realmente remover este usuário do sistema?')) return;
    try {
      const res = await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        showToast('Usuário removido com sucesso.', 'success');
        await loadAdminUsers();
      } else {
        showToast(data.error || 'Erro ao excluir usuário.', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Inicializações Profissionais
  checkAuthStatus();
  loadGroups();

  // Fechar modal ao clicar fora
  window.addEventListener('click', (e) => {
    const switchModal = document.getElementById('switchPageModal');
    if (switchModal && e.target === switchModal) {
      switchModal.style.display = 'none';
    }
    const groupModal = document.getElementById('groupModal');
    if (groupModal && e.target === groupModal) {
      groupModal.style.display = 'none';
    }
    const authModal = document.getElementById('authModal');
    if (authModal && e.target === authModal) {
      authModal.style.display = 'none';
    }
    const createModal = document.getElementById('createUserModal');
    if (createModal && e.target === createModal) {
      createModal.style.display = 'none';
    }
  });
});
