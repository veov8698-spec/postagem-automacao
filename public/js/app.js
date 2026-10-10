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
  const groupRefreshToken = document.getElementById('groupRefreshToken');
  const inputRefreshToken = document.getElementById('inputRefreshToken');
  const groupOAuthClient = document.getElementById('groupOAuthClient');
  const inputClientId = document.getElementById('inputClientId');
  const inputClientSecret = document.getElementById('inputClientSecret');
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
    } else if (targetView === 'schedule-view') {
      if (typeof loadScheduleView === 'function') loadScheduleView();
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

  // ================= IA COPYWRITING & HASHTAGS (CHATGPT) =================
  const btnAiEnhance = document.getElementById('btnAiEnhance');
  const aiCaptionFeedback = document.getElementById('aiCaptionFeedback');
  const aiCaptionFeedbackText = document.getElementById('aiCaptionFeedbackText');

  if (btnAiEnhance) {
    btnAiEnhance.addEventListener('click', async () => {
      const currentCaption = postCaption ? postCaption.value.trim() : '';
      const currentTitle = postTitle ? postTitle.value.trim() : '';

      if (!currentCaption && !currentTitle) {
        showToast('Digite pelo menos um rascunho de legenda ou ideia para a I.A melhorar!', 'info');
        if (postCaption) postCaption.focus();
        return;
      }

      const origHtml = btnAiEnhance.innerHTML;
      btnAiEnhance.disabled = true;
      btnAiEnhance.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Criando com I.A...</span>';

      try {
        const payload = {
          title: currentTitle,
          caption: currentCaption,
          platforms: state.selectedPlatforms,
          mediaType: state.selectedFile?.type.startsWith('video/') ? 'video' : 'image'
        };

        const res = await fetch('/api/posts/ai-enhance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.success) {
          if (postCaption && data.caption) {
            postCaption.value = data.caption;
            postCaption.dispatchEvent(new Event('input'));
          }
          if (postTitle && data.title) {
            postTitle.value = data.title;
            postTitle.dispatchEvent(new Event('input'));
          }

          // Se a IA retornou horários de pico personalizados para o perfil/conteúdo, atualiza o compositor e o calendário
          if (Array.isArray(data.peakTimes) && data.peakTimes.length >= 3) {
            window.updateDynamicPeakTimes(data.peakTimes);
          }

          if (aiCaptionFeedback && aiCaptionFeedbackText) {
            const engineLabel = data.source === 'gemini' ? 'Google Gemini' : (data.source === 'openai' ? 'ChatGPT (OpenAI)' : 'Assistente IA Integrado');
            const brandMsg = data.brandName ? ` personalizado para ${data.brandName}` : '';
            aiCaptionFeedbackText.textContent = `Legenda, créditos e 3 horários de pico gerados via ${engineLabel}${brandMsg}!`;
            aiCaptionFeedback.style.display = 'flex';
            setTimeout(() => {
              if (aiCaptionFeedback) aiCaptionFeedback.style.display = 'none';
            }, 6000);
          }

          showToast('Legenda e 3 horários de pico atualizados com sucesso!', 'success');
        } else {
          showToast(data.error || 'Não foi possível melhorar a legenda.', 'error');
        }
      } catch (err) {
        console.error('Erro ao chamar IA:', err);
        showToast('Erro ao conectar com assistente de IA.', 'error');
      } finally {
        btnAiEnhance.disabled = false;
        btnAiEnhance.innerHTML = origHtml;
      }
    });
  }

  // Inicializa o estado visual das plataformas e prévias
  updateSelectAllButtonText();
  updateFormatVisibility();
  updateVisiblePreviewCards();

  // ================= VISIBILIDADE / PRIVACIDADE =================
  state.privacy = 'public';
  const privacyBtns = document.querySelectorAll('.visibility-btn');
  const privacyHelperText = document.getElementById('privacyHelperText');

  privacyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      privacyBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.privacy = btn.getAttribute('data-privacy') || 'public';

      if (privacyHelperText) {
        if (state.privacy === 'public') {
          privacyHelperText.textContent = 'A publicação ficará 100% visível para todos no Feed, Reels e YouTube.';
        } else if (state.privacy === 'private') {
          privacyHelperText.textContent = 'A publicação ficará privada (apenas você / administradores poderão ver).';
        } else if (state.privacy === 'unlisted') {
          privacyHelperText.textContent = 'Não listado: apenas pessoas com o link direto poderão assistir/ver o vídeo.';
        }
      }
    });
  });

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
      if (typeof window.selectComposerPeakTime === 'function' && (!scheduleDateTime || !scheduleDateTime.value)) {
        window.selectComposerPeakTime(0);
      }
      if (submitBtnText) submitBtnText.textContent = 'Confirmar Agendamento';
      if (submitBtnIcon) submitBtnIcon.className = 'fa-regular fa-calendar-check';
    });
  }

  // ================= SUBMISSÃO DO POST =================
  if (postForm) {
    postForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (typeof saveCurrentSlotState === 'function') {
        saveCurrentSlotState();
      }

      // Se estiver em modo lote ou múltiplos slots estiverem configurados com conteúdo
      const activeConfiguredSlots = (typeof videoSlots !== 'undefined')
        ? videoSlots.filter(s => (s.caption && s.caption.trim()) || s.file)
        : [];

      if (videoMode === 'batch' && activeConfiguredSlots.length > 1) {
        // Envio em Lote (Até 3 Vídeos)
        btnSubmitPost.disabled = true;
        const originalText = submitBtnText.textContent;

        try {
          let successCount = 0;
          for (let i = 0; i < activeConfiguredSlots.length; i++) {
            const slot = activeConfiguredSlots[i];
            submitBtnText.textContent = `Processando Vídeo ${i + 1} de ${activeConfiguredSlots.length}...`;

            const formData = new FormData();
            formData.append('title', slot.title || '');
            formData.append('caption', slot.caption || '');
            formData.append('platforms', JSON.stringify(slot.platforms || ['instagram', 'facebook', 'youtube']));
            formData.append('isScheduled', slot.isScheduled ? 'true' : 'false');
            if (slot.isScheduled && slot.scheduledAt) {
              formData.append('scheduledAt', slot.scheduledAt);
            }
            if (slot.file) {
              formData.append('media', slot.file);
            }
            if (slot.thumbFile) {
              formData.append('thumbnail', slot.thumbFile);
            }
            formData.append('privacy', slot.privacy || 'public');
            formData.append('igFormat', slot.igFormat || 'auto');
            formData.append('fbFormat', slot.fbFormat || 'auto');
            formData.append('ytFormat', slot.ytFormat || 'auto');

            const res = await fetch('/api/posts', {
              method: 'POST',
              body: formData
            });
            const data = await res.json();
            if (data.success) {
              successCount++;
            }
          }

          showToast(`🎉 Fila concluída! ${successCount} de ${activeConfiguredSlots.length} vídeos foram salvos/agendados com sucesso!`, 'success');

          // Resetar todos os slots
          videoSlots.forEach(s => {
            s.title = '';
            s.caption = '';
            s.file = null;
            s.fileUrl = null;
            s.thumbFile = null;
            s.thumbUrl = null;
            s.isConfigured = false;
          });
          currentSlot = 0;
          if (typeof loadSlotIntoForm === 'function') loadSlotIntoForm(0);
          if (typeof updateSlotsUI === 'function') updateSlotsUI();

          updateSystemStatus();
          const tabGal = document.getElementById('tabGallery');
          if (tabGal) tabGal.click();
          return;
        } catch (err) {
          showToast('Erro ao processar lote de vídeos: ' + err.message, 'error');
        } finally {
          btnSubmitPost.disabled = false;
          submitBtnText.textContent = originalText;
        }
        return;
      }

      // Envio Individual (Single Slot)
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

      // Envia Visibilidade / Privacidade (public, private, unlisted)
      formData.append('privacy', state.privacy || 'public');

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
          
          const createdPost = data.post || {
            caption,
            title: postTitle.value,
            media_url: state.selectedFile ? URL.createObjectURL(state.selectedFile) : null,
            media_type: state.selectedFile?.type?.startsWith('video/') ? 'video' : 'image'
          };
          const results = data.publishResults;

          postForm.reset();
          if (btnRemoveMedia) btnRemoveMedia.click();
          if (btnRemoveThumbnail) btnRemoveThumbnail.click();
          if (charCounter) charCounter.textContent = '0 caracteres';
          postCaption.dispatchEvent(new Event('input'));
          postTitle.dispatchEvent(new Event('input'));
          if (modeDirect) modeDirect.click();

          // Resetar slot atual
          if (typeof videoSlots !== 'undefined' && videoSlots[currentSlot]) {
            videoSlots[currentSlot].isConfigured = false;
            videoSlots[currentSlot].title = '';
            videoSlots[currentSlot].caption = '';
            videoSlots[currentSlot].file = null;
            if (typeof updateSlotsUI === 'function') updateSlotsUI();
          }

          updateSystemStatus();

          // Abre o Modal Flutuante com Links Diretos para Visualizar Online
          if (window.showPublishSuccessModal && results) {
            window.showPublishSuccessModal(createdPost, results);
          } else {
            const tabGal = document.getElementById('tabGallery');
            if (tabGal) tabGal.click();
          }
        } else {
          if (data.publishResults && window.showPublishSuccessModal) {
            window.showPublishSuccessModal(data.post || { caption, title: postTitle.value }, data.publishResults, true);
          }
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

  window.closePublishSuccessModal = function() {
    const modal = document.getElementById('publishSuccessModal');
    if (modal) modal.style.display = 'none';
  };

  window.showPublishSuccessModal = function(post = {}, publishResults = {}, isFailureOnly = false) {
    const modal = document.getElementById('publishSuccessModal');
    if (!modal) return;

    const titleEl = document.getElementById('publishSuccessTitle');
    const subtitleEl = document.getElementById('publishSuccessSubtitle');
    const iconWrapper = document.getElementById('publishSuccessIconWrapper');
    const iconEl = document.getElementById('publishSuccessIcon');
    const previewEl = document.getElementById('publishSuccessMediaPreview');
    const linksListEl = document.getElementById('publishSuccessLinksList');

    if (!linksListEl) return;

    const results = publishResults || {};
    const platformKeys = Object.keys(results);
    const anySuccess = platformKeys.some(k => results[k]?.success);
    const allSuccess = platformKeys.length > 0 && platformKeys.every(k => results[k]?.success);

    if (allSuccess) {
      if (titleEl) titleEl.textContent = '🎉 Publicação Confirmada Online!';
      if (subtitleEl) subtitleEl.textContent = 'Seu conteúdo já está publicado e disponível para visualização!';
      if (iconWrapper) {
        iconWrapper.style.background = 'rgba(16, 185, 129, 0.15)';
        iconWrapper.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        iconWrapper.style.color = '#10b981';
      }
      if (iconEl) iconEl.className = 'fa-solid fa-circle-check';
    } else if (anySuccess) {
      if (titleEl) titleEl.textContent = '⚠️ Publicado com Restrições / Parcial';
      if (subtitleEl) subtitleEl.textContent = 'Algumas redes foram publicadas e outras precisam de atenção.';
      if (iconWrapper) {
        iconWrapper.style.background = 'rgba(245, 158, 11, 0.15)';
        iconWrapper.style.borderColor = 'rgba(245, 158, 11, 0.3)';
        iconWrapper.style.color = '#f59e0b';
      }
      if (iconEl) iconEl.className = 'fa-solid fa-triangle-exclamation';
    } else {
      if (titleEl) titleEl.textContent = '❌ Falha na Publicação';
      if (subtitleEl) subtitleEl.textContent = 'A API das redes sociais recusou o envio (veja os detalhes abaixo).';
      if (iconWrapper) {
        iconWrapper.style.background = 'rgba(239, 68, 68, 0.15)';
        iconWrapper.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        iconWrapper.style.color = '#ef4444';
      }
      if (iconEl) iconEl.className = 'fa-solid fa-circle-xmark';
    }

    // Prévia de mídia e legenda
    if (previewEl) {
      let mediaPreviewHtml = '';
      const mediaUrl = post.media_url || post.mediaUrl;
      const mediaType = post.media_type || post.mediaType;
      const isVideo = (mediaType === 'video') || (mediaUrl && /\.(mp4|webm|mov|m4v)$/i.test(mediaUrl));

      if (mediaUrl) {
        if (isVideo) {
          mediaPreviewHtml = `
            <div style="position: relative; width: 100%; max-height: 200px; border-radius: 12px; overflow: hidden; background: #000; margin-bottom: 0.85rem; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
              <video src="${mediaUrl}" controls muted playsinline style="width: 100%; max-height: 200px; object-fit: contain;"></video>
            </div>
          `;
        } else {
          mediaPreviewHtml = `
            <div style="width: 100%; max-height: 200px; border-radius: 12px; overflow: hidden; background: #080c14; margin-bottom: 0.85rem; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
              <img src="${mediaUrl}" style="max-width: 100%; max-height: 200px; object-fit: contain; border-radius: 10px;" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80'">
            </div>
          `;
        }
      }

      const captionText = post.caption || '';
      previewEl.innerHTML = `
        ${mediaPreviewHtml}
        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 0.75rem 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
            <strong style="color: #fff; font-size: 0.88rem;">${escapeHtml(post.title || 'Publicação')}</strong>
            <button type="button" id="btnCopyCaptionModalSuccess" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; border-radius: 6px; padding: 0.2rem 0.5rem; font-size: 0.72rem; font-weight: 700; cursor: pointer;">
              <i class="fa-regular fa-copy"></i> Copiar Legenda
            </button>
          </div>
          <p style="margin: 0; font-size: 0.8rem; color: #94a3b8; line-height: 1.4; max-height: 55px; overflow-y: auto;">
            ${escapeHtml(captionText)}
          </p>
        </div>
      `;

      const btnCopySuccess = document.getElementById('btnCopyCaptionModalSuccess');
      if (btnCopySuccess) {
        btnCopySuccess.addEventListener('click', () => {
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(captionText);
              showToast('📋 Legenda copiada!', 'info');
              btnCopySuccess.innerHTML = '<i class="fa-solid fa-check"></i> Copiado!';
            }
          } catch (_) {}
        });
      }
    }

    // Gerar cartões para cada rede
    linksListEl.innerHTML = '';

    if (platformKeys.length > 0) {
      platformKeys.forEach(plat => {
        const item = results[plat];
        const card = document.createElement('div');
        card.style.cssText = 'border-radius: 12px; padding: 0.85rem 1rem; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;';

        let iconBg = '#3b82f6';
        let platIcon = 'fa-share-nodes';
        let platName = capitalize(plat);
        let defaultUrl = '#';

        if (plat === 'instagram') {
          iconBg = 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)';
          platIcon = 'fa-instagram';
          platName = 'Instagram (@gamefyofc)';
          defaultUrl = 'https://www.instagram.com/gamefyofc';
        } else if (plat === 'facebook') {
          iconBg = '#1877f2';
          platIcon = 'fa-facebook';
          platName = 'Facebook (Gamefy Ofic)';
          defaultUrl = 'https://www.facebook.com/1097087796819080';
        } else if (plat === 'youtube') {
          iconBg = '#ff0000';
          platIcon = 'fa-youtube';
          platName = 'YouTube (@gamefyofc)';
          defaultUrl = 'https://www.youtube.com/@gamefyofc';
        }

        const liveUrl = item.publicUrl || item.postUrl || defaultUrl;

        if (item.success) {
          card.style.background = 'rgba(16, 185, 129, 0.08)';
          card.style.border = '1px solid rgba(16, 185, 129, 0.25)';

          card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="width: 40px; height: 40px; border-radius: 10px; background: ${iconBg}; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem; flex-shrink: 0;">
                <i class="fa-brands ${platIcon}"></i>
              </div>
              <div>
                <div style="font-weight: 700; color: #fff; font-size: 0.92rem;">${platName}</div>
                <div style="font-size: 0.75rem; color: #10b981; font-weight: 600;">
                  <i class="fa-solid fa-circle-check"></i> Publicado Oficialmente
                </div>
              </div>
            </div>
            <a href="${liveUrl}" target="_blank" rel="noopener noreferrer" class="btn-submit" style="text-decoration: none; padding: 0.6rem 1rem; font-size: 0.82rem; font-weight: 700; background: ${iconBg}; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: inline-flex; align-items: center; gap: 0.4rem;">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir no ${capitalize(plat)}
            </a>
          `;
        } else {
          card.style.background = 'rgba(239, 68, 68, 0.08)';
          card.style.border = '1px solid rgba(239, 68, 68, 0.25)';

          const isTokenExp = item.tokenExpired || (item.error && (item.error.includes('Token') || item.error.includes('expirou')));
          const errDetail = item.error || 'Falha ao conectar com a API';

          card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem; flex: 1;">
              <div style="width: 40px; height: 40px; border-radius: 10px; background: #ef4444; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem; flex-shrink: 0;">
                <i class="fa-brands ${platIcon}"></i>
              </div>
              <div style="min-width: 0;">
                <div style="font-weight: 700; color: #fff; font-size: 0.92rem;">${platName}</div>
                <div style="font-size: 0.75rem; color: #fca5a5; line-height: 1.3;" title="${escapeHtml(errDetail)}">
                  ❌ ${escapeHtml(errDetail)}
                </div>
              </div>
            </div>
            ${isTokenExp ? `
              <button type="button" onclick="window.closePublishSuccessModal(); window.openConnectModal('${plat}');" class="btn-card-action" style="padding: 0.55rem 0.85rem; font-size: 0.78rem; background: rgba(239, 68, 68, 0.2); color: #fca5a5; border-color: rgba(239,68,68,0.4); white-space: nowrap; font-weight: 700;">
                <i class="fa-solid fa-key"></i> Renovar Token
              </button>
            ` : `
              <a href="${liveUrl}" target="_blank" rel="noopener noreferrer" class="btn-card-action" style="padding: 0.55rem 0.85rem; font-size: 0.78rem; white-space: nowrap;">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> Ver Canal
              </a>
            `}
          `;
        }

        linksListEl.appendChild(card);
      });
    }

    modal.style.display = 'flex';
  };

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
        const isVideo = (post.media_type === 'video') || (post.media_url && /\.(mp4|webm|mov|m4v)$/i.test(post.media_url));
        if (isVideo) {
          mediaHtml = `
            <div class="gallery-media" style="position: relative; background: #080c14;">
              <span class="media-badge-type"><i class="fa-solid fa-video"></i> Vídeo</span>
              <video src="${post.media_url}" preload="metadata" muted playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
              <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; background: rgba(0,0,0,0.25);">
                <i class="fa-solid fa-circle-play" style="color: white; font-size: 2.2rem; opacity: 0.9; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.7));"></i>
              </div>
            </div>
          `;
        } else {
          mediaHtml = `
            <div class="gallery-media">
              <span class="media-badge-type"><i class="fa-solid fa-image"></i> Foto</span>
              <img src="${post.media_url}" alt="Post mídia" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80'">
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
      if (btnDelete) {
        btnDelete.addEventListener('click', () => {
          window.openDeleteModal(post.id, post.title, post.platforms || post.platform, post.status === 'published');
        });
      }

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

  // ================= MODAL DE EXCLUSÃO INTELIGENTE (LOCAL VS TIRAR DO AR) =================
  let pendingDeletePostId = null;

  window.openDeleteModal = function(id, title, platforms, isPublished) {
    pendingDeletePostId = id;
    const deleteModal = document.getElementById('deletePostModal');
    const deleteInfo = document.getElementById('deleteModalPostInfo');
    const hiddenId = document.getElementById('deleteModalPostId');
    if (!deleteModal) return;

    if (hiddenId) hiddenId.value = id;
    if (deleteInfo) {
      const platStr = Array.isArray(platforms) ? platforms.map(p => capitalize(p)).join(', ') : (platforms || 'Redes sociais');
      deleteInfo.innerHTML = `
        <div style="font-weight: 700; color: #f8fafc; font-size: 0.95rem; margin-bottom: 4px;">
          ${escapeHtml(title || 'Publicação sem título')}
        </div>
        <div style="font-size: 0.8rem; color: #94a3b8; display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
          <span>ID: #${id}</span> ·
          <span>Destinos: <strong style="color: #cbd5e1;">${platStr}</strong></span> ·
          <span style="color: ${isPublished ? '#10b981' : '#f59e0b'}; font-weight: 600;">
            ${isPublished ? 'Publicado Online' : 'Agendado / Rascunho'}
          </span>
        </div>
      `;
    }

    // Resetar para 'local'
    const radLocal = document.querySelector('input[name="deleteScope"][value="local"]');
    if (radLocal) radLocal.checked = true;
    updateDeleteRadioStyles('local');

    deleteModal.style.display = 'flex';
  };

  window.closeDeleteModal = function() {
    const deleteModal = document.getElementById('deletePostModal');
    if (deleteModal) deleteModal.style.display = 'none';
    pendingDeletePostId = null;
  };

  function updateDeleteRadioStyles(val) {
    const cardLocal = document.getElementById('optDeleteLocalCard');
    const cardOnline = document.getElementById('optDeleteOnlineCard');
    if (cardLocal) {
      if (val === 'local') {
        cardLocal.style.borderColor = '#3b82f6';
        cardLocal.style.background = 'rgba(59, 130, 246, 0.12)';
      } else {
        cardLocal.style.borderColor = 'rgba(255,255,255,0.08)';
        cardLocal.style.background = 'rgba(255,255,255,0.02)';
      }
    }
    if (cardOnline) {
      if (val === 'online') {
        cardOnline.style.borderColor = '#ef4444';
        cardOnline.style.background = 'rgba(239, 68, 68, 0.15)';
      } else {
        cardOnline.style.borderColor = 'rgba(239, 68, 68, 0.25)';
        cardOnline.style.background = 'rgba(239, 68, 68, 0.04)';
      }
    }
  }

  // Monitorar clique nos radios do modal de exclusão
  document.querySelectorAll('input[name="deleteScope"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      updateDeleteRadioStyles(e.target.value);
    });
  });

  window.confirmExecuteDelete = async function() {
    const id = pendingDeletePostId || (document.getElementById('deleteModalPostId') ? document.getElementById('deleteModalPostId').value : null);
    if (!id) return;

    const selectedScope = document.querySelector('input[name="deleteScope"]:checked')?.value || 'local';
    const removeOnline = (selectedScope === 'online');

    const btnConfirm = document.getElementById('btnConfirmDeletePost');
    const originalText = btnConfirm ? btnConfirm.innerHTML : '';
    if (btnConfirm) {
      btnConfirm.disabled = true;
      btnConfirm.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processando Exclusão...';
    }

    try {
      const res = await fetch(`/api/posts/${id}?removeOnline=${removeOnline}`, {
        method: 'DELETE',
        headers: (typeof getAuthHeaders === 'function') ? getAuthHeaders() : {}
      });
      const data = await res.json();
      if (data.success) {
        if (removeOnline) {
          showToast('🗑️ Post excluído do app e solicitação de remoção oficial enviada às redes sociais!', 'success');
        } else {
          showToast('📁 Postagem removida da galeria do aplicativo com sucesso.', 'info');
        }
        window.closeDeleteModal();
        loadGallery();
        updateSystemStatus();
        if (typeof renderCalendarDays === 'function') renderCalendarDays();
        if (typeof renderSelectedDaySchedule === 'function') renderSelectedDaySchedule();
      } else {
        showToast(data.error || 'Erro ao processar exclusão.', 'error');
      }
    } catch (err) {
      showToast('Erro de comunicação com o servidor ao excluir.', 'error');
    } finally {
      if (btnConfirm) {
        btnConfirm.disabled = false;
        btnConfirm.innerHTML = originalText;
      }
    }
  };

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
        <a href="https://www.youtube.com/@gamefyofc" target="_blank" style="flex: 1; min-width: 160px; text-decoration: none; text-align: center; background: #ff0000; color: #fff; padding: 0.65rem 1rem; border-radius: 10px; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 0.45rem;">
          <i class="fa-brands fa-youtube"></i> @gamefyofc
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
            if (acc.is_fixed_admin) {
              tag.className = 'account-status-tag connected fixed-admin-tag';
              tag.innerHTML = '<i class="fa-solid fa-crown" style="color: #fbbf24; font-size: 0.72rem; margin-right: 0.3rem;"></i> Fixo Adm (Gamefy)';
              tag.style.background = 'rgba(245, 158, 11, 0.15)';
              tag.style.borderColor = 'rgba(245, 158, 11, 0.4)';
              tag.style.color = '#fbbf24';
              tag.title = 'Conta oficial da Gamefy vinculada permanentemente ao Administrador Root';
            } else {
              tag.className = 'account-status-tag connected';
              tag.innerHTML = '<span class="status-dot-sm"></span> Conectado';
              tag.style.background = '';
              tag.style.borderColor = '';
              tag.style.color = '';
            }

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
                  const isVideoFile = (item.media_type === 'video') || 
                                      (item.media_url && /\.(mp4|webm|mov|m4v)$/i.test(item.media_url));

                  if (isVideoFile && item.media_url) {
                    mediaContent = `
                      <div style="position: relative; width: 100%; height: 100%; background: #080c14; overflow: hidden;">
                        <video src="${item.media_url}" preload="metadata" muted playsinline style="width: 100%; height: 100%; object-fit: cover; pointer-events: none;"></video>
                        <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.25);">
                          <i class="fa-solid fa-play" style="color: white; font-size: 0.9rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));"></i>
                        </div>
                      </div>
                    `;
                  } else if (item.media_url) {
                    mediaContent = `<img src="${item.media_url}" alt="Post" loading="lazy" style="width:100%;height:100%;object-fit:cover;">`;
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

      // Renderizar canais adicionais (além das 3 conexões padrão)
      const extraChannelsSection = document.getElementById('extraChannelsSection');
      const extraChannelsGrid = document.getElementById('extraChannelsGrid');
      const extraAccounts = data.accounts.filter(a => a.isExtraChannel || !['instagram', 'facebook', 'youtube', 'default_instagram', 'default_facebook', 'default_youtube'].includes(a.id));

      if (extraChannelsSection && extraChannelsGrid) {
        if (extraAccounts.length > 0) {
          extraChannelsSection.style.display = 'block';
          extraChannelsGrid.innerHTML = '';

          extraAccounts.forEach(acc => {
            const card = document.createElement('div');
            card.className = `account-hub-card ${acc.platform === 'youtube' ? 'yt-card' : (acc.platform === 'instagram' ? 'ig-card' : 'fb-card')}`;

            let iconClass = acc.platform === 'youtube' ? 'fa-brands fa-youtube' : (acc.platform === 'instagram' ? 'fa-brands fa-instagram' : 'fa-brands fa-facebook-f');
            let brandColor = acc.platform === 'youtube' ? '#ff0000' : (acc.platform === 'instagram' ? '#e1306c' : '#1877f2');

            card.innerHTML = `
              <div class="card-brand-header">
                <div class="brand-title-wrap">
                  <span class="brand-icon-circle" style="background: ${brandColor}; color: #fff;"><i class="${iconClass}"></i></span>
                  <span class="brand-title">${capitalize(acc.platform)}</span>
                  <span class="extra-channel-badge">Canal Extra</span>
                </div>
                <div class="account-status-tag connected">
                  <span class="status-dot-sm"></span> Ativo
                </div>
              </div>
              <div class="card-profile-box">
                <div class="avatar-ring connected" style="border-color: ${brandColor};">
                  ${acc.avatar_url ? `<img src="${acc.avatar_url}" class="avatar-img" alt="${acc.account_name}">` : `<div class="avatar-placeholder"><i class="${iconClass}"></i></div>`}
                </div>
                <div class="card-user-info">
                  <div class="card-account-name">${escapeHtml(acc.account_name || 'Canal Secundário')}</div>
                  <div class="card-account-id">${escapeHtml(acc.account_id || 'ID Configurado')}</div>
                  <span class="account-stats-badge" style="display: inline-flex;">Perfil Conectado</span>
                </div>
              </div>
              <div class="card-actions-group" style="margin-top: 1rem;">
                ${acc.profileUrl && acc.profileUrl !== '#' ? `
                  <a href="${acc.profileUrl}" target="_blank" rel="noopener noreferrer" class="btn-card-action link" style="flex: 1; text-align: center;">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir Canal
                  </a>
                ` : ''}
                <button type="button" class="btn-card-sub danger" onclick="window.deleteExtraAccount('${acc.id}')" title="Remover este canal">
                  <i class="fa-solid fa-trash-can"></i> Remover
                </button>
              </div>
            `;
            extraChannelsGrid.appendChild(card);
          });
        } else {
          extraChannelsSection.style.display = 'none';
        }
      }

      if (activeAccountsBadge) {
        activeAccountsBadge.textContent = `${data.accounts.length} canais`;
      }
    } catch (err) {
      console.error('Erro ao carregar contas:', err);
    }
  }

  // ==========================================
  // MODAL CONECTAR CANAL / PERFIL EXTRA
  // ==========================================
  window.openAddAccountModal = function() {
    const modal = document.getElementById('addAccountModal');
    if (modal) modal.style.display = 'flex';
  };

  window.closeAddAccountModal = function() {
    const modal = document.getElementById('addAccountModal');
    if (modal) modal.style.display = 'none';
  };

  window.updateAddAccountFields = function(platform) {
    const lblName = document.getElementById('lblNewAccName');
    const inputName = document.getElementById('newAccName');
    const lblId = document.getElementById('lblNewAccId');
    const inputUrl = document.getElementById('newAccUrl');

    if (platform === 'youtube') {
      if (lblName) lblName.textContent = 'Nome do Canal YouTube *';
      if (inputName) inputName.placeholder = 'Ex: GAMEFY Shorts & Cortes';
      if (lblId) lblId.textContent = 'ID do Canal (ex: UC8rm4-cdDaD1DKodJdoT5ow)';
      if (inputUrl) inputUrl.placeholder = 'Ex: https://www.youtube.com/@seucanal2';
    } else if (platform === 'instagram') {
      if (lblName) lblName.textContent = 'Nome do Perfil Instagram *';
      if (inputName) inputName.placeholder = 'Ex: @gamefy_secundario';
      if (lblId) lblId.textContent = 'ID da Conta Instagram (opcional)';
      if (inputUrl) inputUrl.placeholder = 'Ex: https://www.instagram.com/gamefyofc';
    } else {
      if (lblName) lblName.textContent = 'Nome da Página Facebook *';
      if (inputName) inputName.placeholder = 'Ex: Gamefy Notícias & Memes';
      if (lblId) lblId.textContent = 'ID da Página Facebook (opcional)';
      if (inputUrl) inputUrl.placeholder = 'Ex: https://www.facebook.com/1097087796819080';
    }
  };

  window.handleAddAccountSubmit = async function(e) {
    e.preventDefault();
    const platform = document.getElementById('newAccPlatform')?.value;
    const account_name = document.getElementById('newAccName')?.value;
    const account_id = document.getElementById('newAccId')?.value;
    const profile_url = document.getElementById('newAccUrl')?.value;
    const access_token = document.getElementById('newAccToken')?.value;

    const btnSubmit = document.getElementById('btnSubmitAddAccount');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Conectando...';
    }

    try {
      const res = await fetch('/api/accounts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, account_name, account_id, profile_url, access_token })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🎉 ${capitalize(platform)} "${account_name}" conectado com sucesso!`, 'success');
        window.closeAddAccountModal();
        document.getElementById('addAccountForm')?.reset();
        await loadAccounts();
      } else {
        showToast(data.error || 'Erro ao conectar novo canal.', 'error');
      }
    } catch (err) {
      showToast('Erro de comunicação: ' + err.message, 'error');
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<i class="fa-solid fa-circle-check"></i> Salvar e Conectar';
      }
    }
  };

  window.deleteExtraAccount = async function(id) {
    if (!confirm('Deseja realmente remover este canal secundário do aplicativo?')) return;
    try {
      const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Canal removido com sucesso.', 'info');
        await loadAccounts();
      } else {
        showToast(data.error || 'Erro ao remover canal.', 'error');
      }
    } catch (err) {
      showToast('Erro ao remover canal: ' + err.message, 'error');
    }
  };

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
      if (groupRefreshToken) groupRefreshToken.style.display = 'none';
      if (groupOAuthClient) groupOAuthClient.style.display = 'none';
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
      if (groupRefreshToken) groupRefreshToken.style.display = 'none';
      if (groupOAuthClient) groupOAuthClient.style.display = 'none';
    } else if (platform === 'youtube') {
      connectModalTitle.innerHTML = '<i class="fa-brands fa-youtube" style="color: #ff4d4d;"></i> Conectar Canal Real do YouTube (@gamefyofc)';
      if (instructionsText) {
        instructionsText.innerHTML = '<strong>🔥 Conexão Permanente:</strong> Para o token <u>não expirar a cada 1 hora</u>, no OAuth Playground clique na <strong>engrenagem ⚙️</strong> no topo direito e marque <strong>Access type: Offline</strong>. Ao gerar os tokens, copie o JSON ou o <strong>Refresh Token</strong> para que o sistema se auto-renove para sempre!';
      }
      if (guideLink) {
        guideLink.href = 'https://developers.google.com/oauthplayground/';
        guideLink.innerHTML = '<i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir Google OAuth 2.0 Playground';
      }
      labelAccountId.textContent = 'Channel ID do YouTube';
      inputAccountId.placeholder = 'UC8rm4-cdDaD1DKodJdoT5ow';
      inputAccountId.value = 'UC8rm4-cdDaD1DKodJdoT5ow';
      inputAccountId.required = false;
      helpAccountId.textContent = 'ID oficial do canal Gamefy (UC8rm4-cdDaD1DKodJdoT5ow).';
      labelAccessToken.textContent = 'OAuth Access Token do Google (ya29... ou JSON) *';
      inputAccessToken.placeholder = 'Cole o token ya29... ou o JSON retornado pelo Playground';
      helpAccessToken.textContent = 'Se colar o JSON inteiro com refresh_token, o sistema extrai e salva tudo automaticamente!';
      if (groupApiKey) groupApiKey.style.display = 'block';
      if (groupRefreshToken) groupRefreshToken.style.display = 'block';
      if (groupOAuthClient) groupOAuthClient.style.display = 'block';
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
      let rawToken = inputAccessToken.value.trim();
      let refreshTokenVal = inputRefreshToken ? inputRefreshToken.value.trim() : null;
      let clientIdVal = inputClientId ? inputClientId.value.trim() : null;
      let clientSecretVal = inputClientSecret ? inputClientSecret.value.trim() : null;
      const apiKeyVal = inputApiKey ? inputApiKey.value.trim() : null;

      if (rawToken.startsWith('{')) {
        try {
          const parsed = JSON.parse(rawToken);
          if (parsed.access_token) rawToken = parsed.access_token;
          if (parsed.refresh_token && !refreshTokenVal) {
            refreshTokenVal = parsed.refresh_token;
            if (inputRefreshToken) inputRefreshToken.value = parsed.refresh_token;
          }
        } catch (_) {}
      }

      btnSaveCredentials.disabled = true;
      const origHtml = btnSaveCredentials.innerHTML;
      btnSaveCredentials.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Validando com a API...';

      try {
        const res = await fetch(`/api/accounts/${platform}/connect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            accountId, 
            accessToken: rawToken, 
            apiKey: apiKeyVal,
            refreshToken: refreshTokenVal,
            clientId: clientIdVal,
            clientSecret: clientSecretVal
          })
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
    let token = getAuthToken();
    const navName = document.getElementById('navUserName');
    const navAvatar = document.getElementById('navUserAvatar');
    const navRoleTag = document.getElementById('navUserRoleTag');
    const tabAdmin = document.getElementById('tabAdmin');

    if (!token) {
      // Auto-login automático transparente como Administrador Root (Gamefy)
      try {
        const autoRes = await fetch('/api/auth/auto-admin');
        const autoData = await autoRes.json();
        if (autoData.success && autoData.token) {
          setAuthToken(autoData.token);
          token = autoData.token;
          currentUser = autoData.user;
        }
      } catch (_) {}
    }

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

  window.fastLoginAdminGamefy = async function() {
    try {
      const emailInput = document.getElementById('loginEmail');
      const passInput = document.getElementById('loginPassword');
      if (emailInput) emailInput.value = 'admin@gamefy.com';
      if (passInput) passInput.value = 'GamefyAdmin2026!';

      const res = await fetch('/api/auth/auto-admin');
      const data = await res.json();
      if (data.success && data.token) {
        setAuthToken(data.token);
        currentUser = data.user;
        showToast('👑 Conectado como Administrador Root (Gamefy)!', 'success');
        window.closeAuthModal();
        await checkAuthStatus();
        await loadAccounts();
        await loadGroups();
      } else {
        showToast('Falha ao autenticar administrador.', 'error');
      }
    } catch (err) {
      showToast('Erro ao autenticar: ' + err.message, 'error');
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
  // FILA & MULTI-VÍDEOS (ATÉ 3 VÍDEOS ORGANIZADOS)
  // ===================================================
  const videoSlots = [
    { id: 0, title: '', caption: '', file: null, fileUrl: null, thumbFile: null, thumbUrl: null, platforms: ['instagram','facebook','youtube'], isScheduled: false, scheduledAt: '', igFormat: 'auto', fbFormat: 'auto', ytFormat: 'auto', privacy: 'public', isConfigured: false },
    { id: 1, title: '', caption: '', file: null, fileUrl: null, thumbFile: null, thumbUrl: null, platforms: ['instagram','facebook','youtube'], isScheduled: false, scheduledAt: '', igFormat: 'auto', fbFormat: 'auto', ytFormat: 'auto', privacy: 'public', isConfigured: false },
    { id: 2, title: '', caption: '', file: null, fileUrl: null, thumbFile: null, thumbUrl: null, platforms: ['instagram','facebook','youtube'], isScheduled: false, scheduledAt: '', igFormat: 'auto', fbFormat: 'auto', ytFormat: 'auto', privacy: 'public', isConfigured: false }
  ];
  let currentSlot = 0;
  let videoMode = 'single'; // 'single' ou 'batch'

  function saveCurrentSlotState() {
    const s = videoSlots[currentSlot];
    if (!s) return;

    s.title = postTitle ? postTitle.value : '';
    s.caption = postCaption ? postCaption.value : '';
    s.file = state.selectedFile || null;
    s.fileUrl = state.selectedFileUrl || null;
    s.thumbFile = state.selectedThumbnailFile || null;
    s.thumbUrl = state.selectedThumbnailUrl || null;
    s.platforms = Array.from(document.querySelectorAll('input[name="platform"]:checked')).map(i => i.value);
    s.isScheduled = !!state.isScheduledMode;
    s.scheduledAt = scheduleDateTime ? scheduleDateTime.value : '';
    s.igFormat = state.igFormat || 'auto';
    s.fbFormat = state.fbFormat || 'auto';
    s.ytFormat = state.ytFormat || 'auto';
    s.privacy = state.privacy || 'public';

    if (s.file || s.caption.trim() || s.title.trim()) {
      s.isConfigured = true;
    }

    updateSlotsUI();
  }

  function loadSlotIntoForm(index) {
    const s = videoSlots[index];
    if (!s) return;

    if (postTitle) postTitle.value = s.title || '';
    if (postCaption) postCaption.value = s.caption || '';
    if (charCounter) charCounter.textContent = `${(s.caption || '').length} caracteres`;

    // Mídia
    if (s.file) {
      handleFileSelection(s.file);
    } else {
      state.selectedFile = null;
      state.selectedFileUrl = null;
      if (dropzoneEmpty) dropzoneEmpty.style.display = 'block';
      if (mediaPreviewWrapper) mediaPreviewWrapper.style.display = 'none';
      if (mediaPreviewContainer) mediaPreviewContainer.innerHTML = '';
      if (mediaInput) mediaInput.value = '';
      updateMockupMedia();
    }

    // Thumbnail
    if (s.thumbFile) {
      state.selectedThumbnailFile = s.thumbFile;
      state.selectedThumbnailUrl = URL.createObjectURL(s.thumbFile);
      if (thumbnailDropzoneEmpty) thumbnailDropzoneEmpty.style.display = 'none';
      if (thumbnailPreviewWrapper) thumbnailPreviewWrapper.style.display = 'flex';
      if (thumbnailImgPreview) thumbnailImgPreview.src = state.selectedThumbnailUrl;
    } else {
      state.selectedThumbnailFile = null;
      state.selectedThumbnailUrl = null;
      if (thumbnailDropzoneEmpty) thumbnailDropzoneEmpty.style.display = 'block';
      if (thumbnailPreviewWrapper) thumbnailPreviewWrapper.style.display = 'none';
      if (thumbnailImgPreview) thumbnailImgPreview.src = '';
      if (thumbnailInput) thumbnailInput.value = '';
    }

    // Plataformas
    document.querySelectorAll('.platform-pill').forEach(pill => {
      const cb = pill.querySelector('input[type="checkbox"]');
      if (cb) {
        const checked = s.platforms ? s.platforms.includes(cb.value) : true;
        cb.checked = checked;
        pill.classList.toggle('active', checked);
      }
    });
    updateFormatVisibility();
    updateVisiblePreviewCards();

    // Agendamento
    if (s.isScheduled) {
      if (modeScheduled) modeScheduled.click();
      if (scheduleDateTime && s.scheduledAt) scheduleDateTime.value = s.scheduledAt;
    } else {
      if (modeDirect) modeDirect.click();
    }

    // Formatos e visibilidade
    state.igFormat = s.igFormat || 'auto';
    state.fbFormat = s.fbFormat || 'auto';
    state.ytFormat = s.ytFormat || 'auto';
    state.privacy = s.privacy || 'public';

    if (postTitle) postTitle.dispatchEvent(new Event('input'));
    if (postCaption) postCaption.dispatchEvent(new Event('input'));

    updateSlotsUI();
  }

  function updateSlotsUI() {
    for (let i = 0; i < 3; i++) {
      const btn = document.getElementById(`slotBtn${i}`);
      const lbl = document.getElementById(`slotLabel${i}`);
      const icon = document.getElementById(`slotIcon${i}`);
      const removeBtn = document.getElementById(`slotRemoveBtn${i}`);
      const s = videoSlots[i];

      if (!btn) continue;
      btn.classList.toggle('active', currentSlot === i);

      if (s.isConfigured) {
        btn.classList.add('configured');
        const shortTitle = s.title ? (s.title.length > 12 ? s.title.substring(0, 10) + '...' : s.title) : `Vídeo ${i + 1}`;
        if (lbl) lbl.textContent = shortTitle;
        if (icon) icon.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #10b981;"></i>';
        if (removeBtn) removeBtn.style.display = 'flex';
      } else {
        btn.classList.remove('configured');
        if (lbl) lbl.textContent = (currentSlot === i) ? `Vídeo ${i + 1}` : `+ Vídeo ${i + 1}`;
        if (icon) icon.innerHTML = (currentSlot === i) ? '<i class="fa-solid fa-pen"></i>' : '<i class="fa-solid fa-plus"></i>';
        if (removeBtn) removeBtn.style.display = 'none';
      }
    }

    const statusText = document.getElementById('multiVideoStatusText');
    if (statusText) {
      const isCurConfigured = videoSlots[currentSlot].isConfigured;
      statusText.textContent = `Vídeo ${currentSlot + 1} (${isCurConfigured ? 'Pronto' : 'Em edição'})`;
    }

    const configuredCount = videoSlots.filter(s => s.isConfigured).length;
    if (submitBtnText) {
      if (videoMode === 'batch' && configuredCount > 1) {
        submitBtnText.textContent = state.isScheduledMode ? `Agendar ${configuredCount} Vídeos da Fila` : `Publicar ${configuredCount} Vídeos em Lote`;
      } else {
        submitBtnText.textContent = state.isScheduledMode ? 'Agendar Publicação' : 'Publicar Agora';
      }
    }
  }

  window.clearVideoSlot = function(event, index) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const s = videoSlots[index];
    if (!s) return;

    if (!confirm(`Deseja remover e limpar o Vídeo ${index + 1} da fila de edição?`)) return;

    videoSlots[index] = {
      id: index,
      title: '',
      caption: '',
      file: null,
      fileUrl: null,
      thumbFile: null,
      thumbUrl: null,
      platforms: ['instagram', 'facebook', 'youtube'],
      isScheduled: false,
      scheduledAt: '',
      igFormat: 'auto',
      fbFormat: 'auto',
      ytFormat: 'auto',
      privacy: 'public',
      isConfigured: false
    };

    if (currentSlot === index) {
      loadSlotIntoForm(index);
    }

    updateSlotsUI();
    if (typeof renderQueuePreviewCards === 'function') {
      renderQueuePreviewCards();
    }

    showToast(`🗑️ Vídeo ${index + 1} foi removido da fila com sucesso!`, 'info');
  };

  window.clearAllQueueSlots = function() {
    if (!confirm('Deseja limpar todos os 3 vídeos da fila de edição?')) return;

    for (let i = 0; i < 3; i++) {
      videoSlots[i] = {
        id: i,
        title: '',
        caption: '',
        file: null,
        fileUrl: null,
        thumbFile: null,
        thumbUrl: null,
        platforms: ['instagram', 'facebook', 'youtube'],
        isScheduled: false,
        scheduledAt: '',
        igFormat: 'auto',
        fbFormat: 'auto',
        ytFormat: 'auto',
        privacy: 'public',
        isConfigured: false
      };
    }

    currentSlot = 0;
    loadSlotIntoForm(0);
    updateSlotsUI();
    window.closeQueuePreviewModal();
    showToast('🧹 Fila de vídeos limpa com sucesso.', 'info');
  };

  window.openQueuePreviewModal = function() {
    saveCurrentSlotState();
    const modal = document.getElementById('queuePreviewModal');
    if (modal) {
      modal.style.display = 'flex';
      renderQueuePreviewCards();
    }
  };

  window.closeQueuePreviewModal = function() {
    const modal = document.getElementById('queuePreviewModal');
    if (modal) modal.style.display = 'none';
  };

  window.submitFromQueueModal = function() {
    window.closeQueuePreviewModal();
    const btn = document.getElementById('btnSubmitPost');
    if (btn) btn.click();
  };

  function renderQueuePreviewCards() {
    const container = document.getElementById('queuePreviewCardsContainer');
    if (!container) return;

    container.innerHTML = '';

    videoSlots.forEach((slot, i) => {
      const isCur = currentSlot === i;
      const isConfig = slot.isConfigured || !!(slot.caption?.trim() || slot.file);
      const card = document.createElement('div');
      card.className = 'card';
      card.style.cssText = `padding: 1rem; border-radius: 12px; background: rgba(30, 41, 59, 0.7); border: 1.5px solid ${isCur ? '#3b82f6' : (isConfig ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.08)')}; display: flex; flex-direction: column; justify-content: space-between;`;

      let mediaThumbHtml = '';
      if (slot.file && slot.file.type.startsWith('video/')) {
        mediaThumbHtml = `
          <div style="position: relative; width: 100%; height: 120px; border-radius: 8px; overflow: hidden; background: #000; margin-bottom: 0.75rem;">
            <video src="${slot.fileUrl || (slot.file ? URL.createObjectURL(slot.file) : '')}" style="width: 100%; height: 100%; object-fit: cover;" muted></video>
            <span style="position: absolute; bottom: 6px; right: 6px; background: rgba(0,0,0,0.7); color: #fff; font-size: 0.68rem; padding: 2px 6px; border-radius: 4px;">
              <i class="fa-solid fa-video"></i> Vídeo
            </span>
          </div>
        `;
      } else if (slot.file) {
        mediaThumbHtml = `
          <div style="width: 100%; height: 120px; border-radius: 8px; overflow: hidden; background: #000; margin-bottom: 0.75rem;">
            <img src="${slot.fileUrl || (slot.file ? URL.createObjectURL(slot.file) : '')}" style="width: 100%; height: 100%; object-fit: cover;" alt="Prévia">
          </div>
        `;
      } else {
        mediaThumbHtml = `
          <div style="width: 100%; height: 90px; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.15); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; color: #64748b; font-size: 0.75rem; margin-bottom: 0.75rem;">
            <i class="fa-solid fa-cloud-arrow-up" style="font-size: 1.25rem;"></i>
            <span>Sem vídeo anexado</span>
          </div>
        `;
      }

      const displayTitle = slot.title ? escapeHtml(slot.title) : `<em style="color:#64748b;">Sem título</em>`;
      const displayCaption = slot.caption ? escapeHtml(slot.caption.substring(0, 110)) + (slot.caption.length > 110 ? '...' : '') : `<em style="color:#64748b;">Sem legenda</em>`;
      const dateDisplay = slot.isScheduled && slot.scheduledAt ? `<span style="color: #60a5fa;"><i class="fa-regular fa-clock"></i> ${slot.scheduledAt.replace('T', ' ')}</span>` : `<span style="color: #10b981;"><i class="fa-solid fa-bolt"></i> Imediato</span>`;

      card.innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem;">
            <span style="font-size: 0.82rem; font-weight: 800; color: #f8fafc; display: flex; align-items: center; gap: 6px;">
              <span style="width: 20px; height: 20px; border-radius: 50%; background: ${isCur ? '#3b82f6' : '#1e293b'}; border: 1px solid rgba(255,255,255,0.2); display: inline-flex; align-items: center; justify-content: center; font-size: 0.72rem;">${i + 1}</span>
              Vídeo ${i + 1} ${isCur ? '<span style="font-size: 0.7rem; color: #60a5fa;">(Ativo)</span>' : ''}
            </span>
            <span style="font-size: 0.72rem; padding: 2px 7px; border-radius: 4px; font-weight: 700; background: ${isConfig ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.06)'}; color: ${isConfig ? '#34d399' : '#94a3b8'};">
              ${isConfig ? '✓ Configurado' : 'Vazio'}
            </span>
          </div>

          ${mediaThumbHtml}

          <div style="margin-bottom: 0.5rem;">
            <strong style="color: #fff; font-size: 0.88rem; display: block; margin-bottom: 3px;">${displayTitle}</strong>
            <p style="color: #94a3b8; font-size: 0.78rem; margin: 0; line-height: 1.35;">${displayCaption}</p>
          </div>

          <div style="font-size: 0.72rem; margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.5rem;">
            <span>Momento: ${dateDisplay}</span>
            <span style="color: #cbd5e1;">Redes: ${(slot.platforms || []).join(', ')}</span>
          </div>
        </div>

        <div style="display: flex; gap: 0.4rem; justify-content: flex-end; margin-top: 0.5rem;">
          <button type="button" class="btn-card-action" onclick="window.editSlotFromPreview(${i})" style="flex: 1; padding: 0.4rem 0.6rem; font-size: 0.75rem; justify-content: center; background: rgba(59, 130, 246, 0.15); border-color: rgba(59, 130, 246, 0.35); color: #60a5fa; font-weight: 700;">
            <i class="fa-solid fa-pen"></i> Editar
          </button>
          ${isConfig ? `
            <button type="button" class="btn-card-action" onclick="window.clearVideoSlot(event, ${i})" style="padding: 0.4rem 0.65rem; font-size: 0.75rem; background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.35); color: #f87171;" title="Remover este vídeo">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          ` : ''}
        </div>
      `;

      container.appendChild(card);
    });
  }

  window.editSlotFromPreview = function(index) {
    window.closeQueuePreviewModal();
    window.selectVideoSlot(index);
    window.switchView('composer-view');
  };

  window.setMultiVideoMode = function(mode) {
    videoMode = mode;
    const pillSingle = document.getElementById('pillSingleMode');
    const pillBatch = document.getElementById('pillBatchMode');
    if (pillSingle) pillSingle.classList.toggle('active', mode === 'single');
    if (pillBatch) pillBatch.classList.toggle('active', mode === 'batch');
    updateSlotsUI();
    if (mode === 'batch') {
      showToast('⚡ Modo Lote ativado: você pode preparar até 3 vídeos com horários diferentes e postar juntos!', 'info');
    }
  };

  window.selectVideoSlot = function(index) {
    if (index === currentSlot) return;
    saveCurrentSlotState();
    currentSlot = index;
    loadSlotIntoForm(index);
  };

  window.saveAndGoToNextSlot = function() {
    saveCurrentSlotState();
    videoSlots[currentSlot].isConfigured = true;
    updateSlotsUI();

    if (currentSlot < 2) {
      const nextIndex = currentSlot + 1;
      window.setMultiVideoMode('batch');
      window.selectVideoSlot(nextIndex);
      showToast(`💾 Vídeo ${currentSlot} salvo no rascunho! Agora você pode preparar o Vídeo ${nextIndex + 1}.`, 'success');
    } else {
      showToast('🎉 Todos os 3 vídeos foram configurados na fila! Pronto para publicar.', 'success');
    }
  };

  // ===================================================
  // AGENDA & HORÁRIOS DE PICO GAMER (@gamefyofc)
  // ===================================================
  let calCurrentYear = new Date().getFullYear();
  let calCurrentMonth = new Date().getMonth(); // 0-11
  let calSelectedDate = new Date().toISOString().split('T')[0];
  let cachedCalendarPosts = [];

  let stateCurrentPeakTimes = [
    { time: '12:00', label: '12:00 - Almoço Gamer', icon: '☀️', desc: 'Shorts rápidos e novidades com alto consumo mobile' },
    { time: '18:30', label: '18:30 - Fim de Tarde', icon: '🌇', desc: 'Pico de retorno do trabalho/estudos e feed ativo' },
    { time: '21:15', label: '21:15 - Prime Time Noturno', icon: '🌙', desc: 'Audiência máxima online, gameplays e retenção' }
  ];

  window.updateDynamicPeakTimes = function(newPeaks) {
    if (!Array.isArray(newPeaks) || newPeaks.length < 3) return;

    stateCurrentPeakTimes = [
      {
        time: (newPeaks[0].time || '12:00').slice(0, 5),
        label: newPeaks[0].label || `${newPeaks[0].time} - 1º Pico`,
        icon: '☀️',
        desc: newPeaks[0].reason || 'Pico de audiência inicial'
      },
      {
        time: (newPeaks[1].time || '18:30').slice(0, 5),
        label: newPeaks[1].label || `${newPeaks[1].time} - 2º Pico`,
        icon: '🌇',
        desc: newPeaks[1].reason || 'Maior engajamento feed'
      },
      {
        time: (newPeaks[2].time || '21:15').slice(0, 5),
        label: newPeaks[2].label || `${newPeaks[2].time} - 3º Pico`,
        icon: '🌙',
        desc: newPeaks[2].reason || 'Retenção máxima e prime time'
      }
    ];

    // Atualiza os 3 botões rápidos do compositor
    const p1 = stateCurrentPeakTimes[0];
    const p2 = stateCurrentPeakTimes[1];
    const p3 = stateCurrentPeakTimes[2];

    const cTime1 = document.getElementById('peakChipTime1');
    const cLbl1 = document.getElementById('peakChipLabel1');
    const cTime2 = document.getElementById('peakChipTime2');
    const cLbl2 = document.getElementById('peakChipLabel2');
    const cTime3 = document.getElementById('peakChipTime3');
    const cLbl3 = document.getElementById('peakChipLabel3');

    if (cTime1) cTime1.textContent = p1.time;
    if (cLbl1) cLbl1.textContent = `${p1.icon} ${p1.label.split('-')[1]?.trim() || p1.label}`;
    if (cTime2) cTime2.textContent = p2.time;
    if (cLbl2) cLbl2.textContent = `${p2.icon} ${p2.label.split('-')[1]?.trim() || p2.label}`;
    if (cTime3) cTime3.textContent = p3.time;
    if (cLbl3) cLbl3.textContent = `${p3.icon} ${p3.label.split('-')[1]?.trim() || p3.label}`;

    // Atualiza os 3 cards da coluna do Calendário
    const calTitle1 = document.getElementById('calPeakTitle1');
    const calDesc1 = document.getElementById('calPeakDesc1');
    const calBadge1 = document.getElementById('calPeakBadge1');
    if (calTitle1) calTitle1.textContent = `${p1.icon} 1º Pico: ${p1.time} (${p1.label.split('-')[1]?.trim() || p1.label})`;
    if (calDesc1) calDesc1.textContent = p1.desc;
    if (calBadge1) calBadge1.textContent = p1.time;

    const calTitle2 = document.getElementById('calPeakTitle2');
    const calDesc2 = document.getElementById('calPeakDesc2');
    const calBadge2 = document.getElementById('calPeakBadge2');
    if (calTitle2) calTitle2.textContent = `${p2.icon} 2º Pico: ${p2.time} (${p2.label.split('-')[1]?.trim() || p2.label})`;
    if (calDesc2) calDesc2.textContent = p2.desc;
    if (calBadge2) calBadge2.textContent = p2.time;

    const calTitle3 = document.getElementById('calPeakTitle3');
    const calDesc3 = document.getElementById('calPeakDesc3');
    const calBadge3 = document.getElementById('calPeakBadge3');
    if (calTitle3) calTitle3.textContent = `${p3.icon} 3º Pico: ${p3.time} (${p3.label.split('-')[1]?.trim() || p3.label})`;
    if (calDesc3) calDesc3.textContent = p3.desc;
    if (calBadge3) calBadge3.textContent = p3.time;

    renderSelectedDaySchedule();
  };

  window.selectComposerPeakTime = function(index) {
    if (!stateCurrentPeakTimes[index]) return;
    const peak = stateCurrentPeakTimes[index];
    const targetDate = calSelectedDate || new Date().toISOString().split('T')[0];
    const targetIso = `${targetDate}T${peak.time}`;

    if (scheduleDateTime) {
      scheduleDateTime.value = targetIso;
      scheduleDateTime.dispatchEvent(new Event('change'));
    }

    [1, 2, 3].forEach(n => {
      const btn = document.getElementById(`btnPeak${n}`);
      if (btn) {
        if (n === index + 1) {
          btn.style.background = 'rgba(59, 130, 246, 0.25)';
          btn.style.borderColor = '#3b82f6';
          btn.classList.add('active');
        } else {
          btn.style.background = 'rgba(255, 255, 255, 0.05)';
          btn.style.borderColor = 'rgba(255, 255, 255, 0.12)';
          btn.classList.remove('active');
        }
      }
    });

    if (typeof saveCurrentSlotState === 'function') {
      saveCurrentSlotState();
    }

    renderSelectedDaySchedule();
    showToast(`⏰ Horário ${peak.time} selecionado! Sincronizado com a agenda do dia ${targetDate}.`, 'success');
  };

  window.handleCustomDateTimeChange = function(val) {
    if (!val) return;
    const [d, t] = val.split('T');
    if (d && d !== calSelectedDate) {
      calSelectedDate = d;
      renderCalendar();
    }
    renderSelectedDaySchedule();
  };

  window.selectPeakFromCalendar = function(index) {
    window.selectComposerPeakTime(index);
    window.switchView('composer-view');
  };

  const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  async function loadScheduleView() {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (data.success && data.posts) {
        cachedCalendarPosts = data.posts;
      }
    } catch (_) {}

    renderCalendar();
    renderSelectedDaySchedule();
  }

  function renderCalendar() {
    const titleElem = document.getElementById('calendarMonthTitle');
    const gridElem = document.getElementById('calendarDaysGrid');
    if (!gridElem) return;

    if (titleElem) {
      titleElem.textContent = `${MONTH_NAMES[calCurrentMonth]} ${calCurrentYear}`;
    }

    gridElem.innerHTML = '';

    const firstDayIndex = new Date(calCurrentYear, calCurrentMonth, 1).getDay();
    const lastDate = new Date(calCurrentYear, calCurrentMonth + 1, 0).getDate();
    const prevMonthLastDate = new Date(calCurrentYear, calCurrentMonth, 0).getDate();
    const todayStr = new Date().toISOString().split('T')[0];

    // Dias do mês anterior
    for (let x = firstDayIndex; x > 0; x--) {
      const dayNum = prevMonthLastDate - x + 1;
      const cell = document.createElement('div');
      cell.className = 'calendar-day-cell other-month';
      cell.innerHTML = `<span class="day-number">${dayNum}</span>`;
      gridElem.appendChild(cell);
    }

    // Dias do mês atual
    for (let day = 1; day <= lastDate; day++) {
      const dateStr = `${calCurrentYear}-${String(calCurrentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const cell = document.createElement('div');
      cell.className = 'calendar-day-cell';

      if (dateStr === todayStr) cell.classList.add('today');
      if (dateStr === calSelectedDate) cell.classList.add('selected');

      const dayPosts = cachedCalendarPosts.filter(p => {
        const postDate = (p.scheduled_at || p.published_at || p.created_at || '').split('T')[0];
        return postDate === dateStr;
      });

      let dotsHtml = '';
      if (dayPosts.length > 0) {
        cell.classList.add('has-posts');
        const count = dayPosts.length;
        dotsHtml = `
          <div class="day-posts-dots">
            <span class="day-dot" style="background: #10b981;" title="${count} post(s)"></span>
            ${count > 1 ? `<span class="day-posts-count">${count}</span>` : ''}
          </div>
        `;
      }

      cell.innerHTML = `
        <span class="day-number">${day}</span>
        ${dotsHtml}
      `;

      cell.addEventListener('click', () => {
        calSelectedDate = dateStr;
        renderCalendar();
        renderSelectedDaySchedule();
      });

      gridElem.appendChild(cell);
    }
  }

  function renderSelectedDaySchedule() {
    const listElem = document.getElementById('calDayScheduleList');
    const textElem = document.getElementById('calSelectedDateText');
    const badgeElem = document.getElementById('calDayPostsCountBadge');
    if (!listElem) return;

    const parts = calSelectedDate.split('-');
    const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    if (textElem) {
      const todayStr = new Date().toISOString().split('T')[0];
      textElem.textContent = (calSelectedDate === todayStr) ? `Hoje (${formattedDate})` : formattedDate;
    }

    const dayPosts = cachedCalendarPosts.filter(p => {
      const postDate = (p.scheduled_at || p.published_at || p.created_at || '').split('T')[0];
      return postDate === calSelectedDate;
    });

    if (badgeElem) badgeElem.textContent = `${dayPosts.length} vídeo(s)`;

    const peakSlots = stateCurrentPeakTimes.map((p, i) => ({
      time: p.time,
      title: `${i + 1}º Pico: ${p.time} (${p.label.split('-')[1]?.trim() || p.label})`,
      icon: p.icon || '⏰',
      desc: p.desc || 'Horário de alta retenção'
    }));

    listElem.innerHTML = '';

    peakSlots.forEach((slot, idx) => {
      const matchedPost = dayPosts.find(p => {
        const timePart = (p.scheduled_at || '').slice(11, 16);
        return timePart === slot.time || Math.abs(idx - dayPosts.indexOf(p)) === 0;
      });

      const slotCard = document.createElement('div');
      slotCard.className = 'peak-time-card';
      slotCard.style.padding = '0.75rem 1rem';

      if (matchedPost) {
        slotCard.innerHTML = `
          <div class="peak-time-desc">
            <strong style="color: #6ee7b7; font-size: 0.9rem;">${slot.icon} ${slot.title} - Agendado</strong>
            <span style="color: #f1f5f9; font-weight: 600;">${escapeHtml(matchedPost.title || matchedPost.caption?.substring(0, 45) || 'Vídeo programado')}</span>
            <span style="font-size: 0.75rem; color: #94a3b8;">Redes: ${(matchedPost.platforms || []).join(', ')}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="peak-time-badge" style="background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border-color: rgba(16, 185, 129, 0.4);">${slot.time}</span>
            <button type="button" class="btn-group-icon danger" onclick="window.openDeleteModal(${matchedPost.id}, '${escapeHtml(matchedPost.title || '')}', '${(matchedPost.platforms || []).join(',')}', false)" title="Excluir">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        `;
      } else {
        slotCard.innerHTML = `
          <div class="peak-time-desc">
            <strong style="font-size: 0.9rem;">${slot.icon} ${slot.title}</strong>
            <span>${slot.desc} (Horário Livre)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="peak-time-badge">${slot.time}</span>
            <button type="button" class="btn-card-action" onclick="window.scheduleForPeakTime('${slot.time}', ${idx})" style="padding: 0.35rem 0.7rem; font-size: 0.75rem; background: rgba(59, 130, 246, 0.15); color: #60a5fa; border-color: rgba(59, 130, 246, 0.3);">
              <i class="fa-solid fa-plus"></i> Agendar
            </button>
          </div>
        `;
      }
      listElem.appendChild(slotCard);
    });
  }

  window.scheduleForPeakTime = function(time, slotIndex = 0) {
    const targetIso = `${calSelectedDate}T${time}`;
    window.selectVideoSlot(slotIndex);

    if (modeScheduled) modeScheduled.click();
    if (scheduleDateTime) scheduleDateTime.value = targetIso;

    saveCurrentSlotState();
    window.switchView('composer-view');

    showToast(`⏰ Horário das ${time} do dia ${calSelectedDate} selecionado para o Vídeo ${slotIndex + 1}!`, 'success');
  };

  window.applyPeakTimesToComposer = function() {
    window.setMultiVideoMode('batch');

    const peakTimes = stateCurrentPeakTimes.map(p => p.time);
    peakTimes.forEach((time, i) => {
      videoSlots[i].isScheduled = true;
      videoSlots[i].scheduledAt = `${calSelectedDate}T${time}`;
      if (!videoSlots[i].title) videoSlots[i].title = `Vídeo ${i + 1} (${time})`;
    });

    currentSlot = 0;
    loadSlotIntoForm(0);
    window.switchView('composer-view');

    showToast(`🎯 Os 3 Horários de Pico (${peakTimes.join(', ')}) foram distribuídos nos 3 slots da fila para ${calSelectedDate}!`, 'success');
  };

  // Botões de navegação de mês
  const btnCalPrevMonth = document.getElementById('btnCalPrevMonth');
  const btnCalNextMonth = document.getElementById('btnCalNextMonth');
  const btnCalToday = document.getElementById('btnCalToday');

  if (btnCalPrevMonth) {
    btnCalPrevMonth.addEventListener('click', () => {
      calCurrentMonth--;
      if (calCurrentMonth < 0) {
        calCurrentMonth = 11;
        calCurrentYear--;
      }
      renderCalendar();
    });
  }

  if (btnCalNextMonth) {
    btnCalNextMonth.addEventListener('click', () => {
      calCurrentMonth++;
      if (calCurrentMonth > 11) {
        calCurrentMonth = 0;
        calCurrentYear++;
      }
      renderCalendar();
    });
  }

  if (btnCalToday) {
    btnCalToday.addEventListener('click', () => {
      const now = new Date();
      calCurrentYear = now.getFullYear();
      calCurrentMonth = now.getMonth();
      calSelectedDate = now.toISOString().split('T')[0];
      renderCalendar();
      renderSelectedDaySchedule();
    });
  }

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
    const addAccModal = document.getElementById('addAccountModal');
    if (addAccModal && e.target === addAccModal) {
      addAccModal.style.display = 'none';
    }
    const delModal = document.getElementById('deletePostModal');
    if (delModal && e.target === delModal) {
      delModal.style.display = 'none';
    }
  });
});
