          2 class="text-xl font-bold text-white">${cat}</h2>
          ${cat !== 'Comics & Reads' ? `<button onclick="switchCategory('${cat}')" class="text-xs text-gray-400 hover:text-white transition hidden sm:block">View All <i class="fa-solid fa-chevron-right ml-1 text-[10px]"></i></button>` : ''}
        `;
        row.appendChild(header);

        const rail = document.createElement("div");
        rail.className = "flex space-x-4 overflow-x-auto no-scrollbar py-2";
        
        items.forEach(item => {
          rail.appendChild(createMediaCard(item));
        });
        
        row.appendChild(rail);
        categoryRows.appendChild(row);
      });
    }

    // -- UI Render Helpers --

    function createMediaCard(media) {
      const card = document.createElement("div");
      card.className = "relative flex-shrink-0 w-36 sm:w-44 md:w-52 rounded-xl overflow-hidden glass-card cursor-pointer group card-hover";
      card.onclick = () => openDetailModal(media.id);

      const progress = getProgress(media.id);
      const progressBar = progress > 0 ? `<div class="absolute bottom-0 left-0 h-1 bg-brand-red z-20" style="width: ${progress}%"></div>` : '';
      
      const badge = media.type === 'pdf' ? '<span class="absolute top-2 right-2 bg-purple-600 text-[10px] font-bold px-1.5 py-0.5 rounded text-white z-10"><i class="fa-solid fa-book-open"></i></span>' : 
                    media.type === 'series' ? `<span class="absolute top-2 right-2 bg-gray-900/80 text-[10px] font-bold px-1.5 py-0.5 rounded text-white z-10">S${media.season} E${media.episode}</span>` : '';

      card.innerHTML = `
        <div class="aspect-[2/3] relative overflow-hidden bg-gray-800">
          <img src="${media.poster}" alt="${media.title}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500" loading="lazy" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition duration-300"></div>
          ${badge}
          <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 z-10">
            <div class="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 text-white">
              <i class="fa-solid ${media.type === 'pdf' ? 'fa-book-open' : 'fa-play'} ml-0.5"></i>
            </div>
          </div>
          ${progressBar}
        </div>
        <div class="absolute bottom-0 w-full p-3 z-20">
          <h3 class="text-sm font-bold text-white truncate drop-shadow-md">${media.title}</h3>
          <p class="text-[10px] text-gray-300 truncate">${media.year} • ${media.type === 'pdf' ? 'Comic' : media.duration}</p>
        </div>
      `;
      return card;
    }

    function renderWatchlistGrid() {
      const categoryRows = document.getElementById("categoryRows");
      categoryRows.innerHTML = `
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-white flex items-center space-x-2">
            <i class="fa-solid fa-heart text-red-500"></i>
            <span>My Watchlist</span>
          </h2>
          <span class="text-xs text-gray-400">${watchlist.length} items</span>
        </div>
      `;

      if (watchlist.length === 0) {
        categoryRows.innerHTML += `
          <div class="flex flex-col items-center justify-center py-20 text-gray-500 space-y-4">
            <i class="fa-regular fa-folder-open text-4xl"></i>
            <p>Your watchlist is empty.</p>
          </div>
        `;
        return;
      }

      const grid = document.createElement("div");
      grid.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4";
      
      watchlist.forEach(id => {
        const media = MEDIA_DATABASE.find(m => m.id === id);
        if(media) grid.appendChild(createMediaCard(media));
      });
      
      categoryRows.appendChild(grid);
    }

    function setupHeroBanner() {
      // Pick a random featured movie
      const featured = MEDIA_DATABASE.filter(m => m.category === 'Featured Movies');
      const randomHero = featured[Math.floor(Math.random() * featured.length)];
      
      document.getElementById('heroBackdrop').style.backgroundImage = `url('${randomHero.poster.replace('w=500', 'w=1600')}')`;
      document.getElementById('heroTitle').innerText = randomHero.title;
      document.getElementById('heroDescription').innerText = randomHero.description;
      document.getElementById('heroRating').innerText = randomHero.rating;
      document.getElementById('heroYear').innerText = randomHero.year;
      
      const playBtn = document.getElementById('heroPlayBtn');
      playBtn.onclick = () => playMedia(randomHero.id);
      
      const infoBtn = document.getElementById('heroInfoBtn');
      infoBtn.onclick = () => openDetailModal(randomHero.id);

      const heartIcon = document.getElementById('heroHeartIcon');
      heartIcon.className = watchlist.includes(randomHero.id) ? "fa-solid fa-heart text-lg text-red-500" : "fa-regular fa-heart text-lg";
      
      document.getElementById('heroWatchlistBtn').onclick = () => {
        toggleWatchlist(randomHero.id);
        heartIcon.className = watchlist.includes(randomHero.id) ? "fa-solid fa-heart text-lg text-red-500" : "fa-regular fa-heart text-lg";
      };
    }

    // -- Category & Navigation --

    function switchCategory(cat) {
      currentCategory = cat;
      
      // Update Pills
      document.querySelectorAll('.cat-pill').forEach(pill => {
        if(pill.innerText.includes(cat) || (cat === 'All' && pill.innerText.includes('All'))) {
          pill.className = "cat-pill active-pill whitespace-nowrap px-4 py-1.5 text-xs font-semibold rounded-full bg-purple-600 text-white transition";
        } else {
          pill.className = "cat-pill whitespace-nowrap px-4 py-1.5 text-xs font-semibold rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 transition";
        }
      });

      // Update Header Tabs
      document.querySelectorAll('.nav-tab').forEach(tab => {
        if(tab.getAttribute('data-cat') === cat) {
          tab.classList.add('text-white', 'bg-white/10');
          tab.classList.remove('text-gray-300');
        } else {
          tab.classList.remove('text-white', 'bg-white/10');
          tab.classList.add('text-gray-300');
        }
      });

      // Clear search if active
      clearSearch();
      renderCatalog();
    }

    function toggleMobileMenu() {
      const menu = document.getElementById("mobileMenu");
      menu.classList.toggle("hidden");
    }

    // -- Search Logic --

    function handleSearch(query) {
      const resultsSection = document.getElementById("searchResultsSection");
      const grid = document.getElementById("searchResultsGrid");
      const categoryRows = document.getElementById("categoryRows");
      const continueSection = document.getElementById("continueWatchingSection");
      const heroSection = document.getElementById("heroSection");
      const clearBtn = document.getElementById("clearSearchBtn");

      if (!query || query.trim() === "") {
        resultsSection.classList.add("hidden");
        categoryRows.classList.remove("hidden");
        heroSection.classList.remove("hidden");
        clearBtn.classList.add("hidden");
        updateContinueWatchingRail();
        return;
      }

      clearBtn.classList.remove("hidden");
      heroSection.classList.add("hidden");
      continueSection.classList.add("hidden");
      categoryRows.classList.add("hidden");
      resultsSection.classList.remove("hidden");

      const q = query.toLowerCase();
      const results = MEDIA_DATABASE.filter(m => 
        m.title.toLowerCase().includes(q) || 
        m.description.toLowerCase().includes(q) ||
        m.genre.some(g => g.toLowerCase().includes(q))
      );

      document.getElementById("searchHeading").innerHTML = `
        <i class="fa-solid fa-magnifying-glass text-purple-400"></i>
        <span>Search Results (${results.length})</span>
      `;

      grid.innerHTML = "";
      if (results.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-10 text-center text-gray-500">No results found for "${query}"</div>`;
      } else {
        results.forEach(m => grid.appendChild(createMediaCard(m)));
      }
    }

    function clearSearch() {
      const input = document.getElementById("searchInput");
      input.value = "";
      handleSearch("");
    }

    function playSurpriseMedia() {
      const videos = MEDIA_DATABASE.filter(m => m.type !== 'pdf');
      const random = videos[Math.floor(Math.random() * videos.length)];
      playMedia(random.id);
      showToast(`Surprise! Playing ${random.title}`);
    }

    // -- Watchlist & Progress Data Management --

    function toggleWatchlist(id) {
      const index = watchlist.indexOf(id);
      if (index > -1) {
        watchlist.splice(index, 1);
        showToast("Removed from Watchlist");
      } else {
        watchlist.push(id);
        showToast("Added to Watchlist");
      }
      localStorage.setItem("yassil_watchlist", JSON.stringify(watchlist));
      if(currentCategory === 'My List') renderWatchlistGrid();
    }

    function getProgress(id) {
      const progressData = JSON.parse(localStorage.getItem('yassil_progress') || '{}');
      if (progressData[id]) {
        return (progressData[id].currentTime / progressData[id].duration) * 100;
      }
      return 0;
    }

    function saveProgress(id, currentTime, duration) {
      if (!duration || duration === 0) return;
      const progressData = JSON.parse(localStorage.getItem('yassil_progress') || '{}');
      // If watched more than 95%, remove from continue watching
      if (currentTime / duration > 0.95) {
        delete progressData[id];
      } else {
        progressData[id] = { currentTime, duration, timestamp: Date.now() };
      }
      localStorage.setItem('yassil_progress', JSON.stringify(progressData));
    }

    function clearAllProgress() {
      localStorage.removeItem('yassil_progress');
      updateContinueWatchingRail();
      showToast("History cleared");
    }

    function updateContinueWatchingRail() {
      const progressData = JSON.parse(localStorage.getItem('yassil_progress') || '{}');
      const rail = document.getElementById("continueWatchingRail");
      const section = document.getElementById("continueWatchingSection");
      
      rail.innerHTML = "";
      
      const sortedKeys = Object.keys(progressData).sort((a, b) => progressData[b].timestamp - progressData[a].timestamp);
      
      if (sortedKeys.length === 0 || currentCategory !== 'All') {
        section.classList.add("hidden");
        return;
      }

      section.classList.remove("hidden");
      sortedKeys.forEach(id => {
        const media = MEDIA_DATABASE.find(m => m.id === id);
        if (media) {
          rail.appendChild(createMediaCard(media));
        }
      });
    }

    // -- Modal Handling (Detail) --

    function openDetailModal(id) {
      const media = MEDIA_DATABASE.find(m => m.id === id);
      if(!media) return;
      
      activeMedia = media;
      
      document.getElementById('detailBackdrop').style.backgroundImage = `url('${media.poster.replace('w=500', 'w=800')}')`;
      document.getElementById('detailBadge').innerText = media.type === 'pdf' ? 'COMIC' : media.type === 'series' ? 'SERIES' : 'MOVIE';
      document.getElementById('detailTitle').innerText = media.title;
      document.getElementById('detailYear').innerText = media.year;
      document.getElementById('detailRating').innerText = media.rating;
      document.getElementById('detailDuration').innerText = media.type === 'pdf' ? media.duration : media.duration;
      document.getElementById('detailGenre').innerText = media.genre.join(', ');
      document.getElementById('detailDescription').innerText = media.description;

      const heartIcon = document.getElementById('detailHeartIcon');
      const watchText = document.getElementById('detailWatchlistText');
      if (watchlist.includes(id)) {
        heartIcon.className = "fa-solid fa-heart text-red-500";
        watchText.innerText = "Remove";
      } else {
        heartIcon.className = "fa-regular fa-heart";
        watchText.innerText = "Add to Watchlist";
      }

      const episodesContainer = document.getElementById('detailSeriesEpisodes');
      const episodesGrid = document.getElementById('episodesListGrid');
      episodesGrid.innerHTML = '';
      
      if (media.type === 'series') {
        episodesContainer.classList.remove('hidden');
        const seriesEps = MEDIA_DATABASE.filter(m => m.seriesId === media.seriesId).sort((a,b) => a.episode - b.episode);
        
        seriesEps.forEach(ep => {
          const epBtn = document.createElement('button');
          epBtn.className = `w-full text-left p-2 rounded-lg text-sm flex items-center justify-between group ${ep.id === media.id ? 'bg-gray-800 border border-purple-500/50' : 'hover:bg-gray-800/50'}`;
          epBtn.onclick = () => { openDetailModal(ep.id); };
          
          epBtn.innerHTML = `
            <div class="flex items-center space-x-3">
              <span class="text-xs text-gray-500 font-mono w-6">${ep.episode}.</span>
              <span class="${ep.id === media.id ? 'text-white font-bold' : 'text-gray-300'} truncate">${ep.title}</span>
            </div>
            <i class="fa-solid fa-play text-xs opacity-0 group-hover:opacity-100 text-purple-400 transition"></i>
          `;
          episodesGrid.appendChild(epBtn);
        });
      } else {
        episodesContainer.classList.add('hidden');
      }

      document.getElementById('detailPlayBtn').innerHTML = `<i class="fa-solid ${media.type === 'pdf' ? 'fa-book-open' : 'fa-play'}"></i><span>${media.type === 'pdf' ? 'Read Comic' : 'Start Watching'}</span>`;
      
      document.getElementById('detailModal').classList.remove('hidden');
    }

    function closeDetailModal() {
      document.getElementById('detailModal').classList.add('hidden');
    }

    function playFromDetailModal() {
      if(activeMedia) {
        closeDetailModal();
        playMedia(activeMedia.id);
      }
    }

    function toggleWatchlistFromDetail() {
      if(activeMedia) {
        toggleWatchlist(activeMedia.id);
        const heartIcon = document.getElementById('detailHeartIcon');
        const watchText = document.getElementById('detailWatchlistText');
        if (watchlist.includes(activeMedia.id)) {
          heartIcon.className = "fa-solid fa-heart text-red-500";
          watchText.innerText = "Remove";
        } else {
          heartIcon.className = "fa-regular fa-heart";
          watchText.innerText = "Add to Watchlist";
        }
      }
    }

    // -- Video Player & Media Logic --

    function playMedia(id) {
      const media = MEDIA_DATABASE.find(m => m.id === id);
      if(!media) return;
      
      activeMedia = media;
      
      if(media.type === 'pdf') {
        openPdfModal(media.url, media.title);
        return;
      }

      // Prepare Video Player
      document.getElementById('playerTitle').innerText = media.title;
      document.getElementById('playerSubtitle').innerText = media.category;
      document.getElementById('videoErrorOverlay').classList.add('hidden');
      document.getElementById('nextEpisodeCountdown').classList.add('hidden');
      
      mainVideoPlayer.src = media.url;
      mainVideoPlayer.poster = media.poster.replace('w=500', 'w=1600');
      
      // Load saved progress
      const progressData = JSON.parse(localStorage.getItem('yassil_progress') || '{}');
      if (progressData[media.id]) {
        mainVideoPlayer.currentTime = progressData[media.id].currentTime;
      }

      // Check for series playlist
      if (media.type === 'series') {
        currentPlaylist = MEDIA_DATABASE.filter(m => m.seriesId === media.seriesId).sort((a,b) => a.episode - b.episode);
        currentPlaylistIndex = currentPlaylist.findIndex(m => m.id === media.id);
        
        document.getElementById('prevEpBtn').disabled = currentPlaylistIndex <= 0;
        document.getElementById('nextEpBtn').disabled = currentPlaylistIndex >= currentPlaylist.length - 1;
        document.getElementById('autoplayBtn').classList.remove('hidden');
      } else {
        currentPlaylist = [];
        currentPlaylistIndex = -1;
        document.getElementById('prevEpBtn').disabled = true;
        document.getElementById('nextEpBtn').disabled = true;
        document.getElementById('autoplayBtn').classList.add('hidden');
      }

      videoModal.classList.remove('hidden');
      mainVideoPlayer.play().catch(e => {
        console.log("Autoplay prevented or stream error:", e);
        // Show fallback error overlay for archive.org CORS/Format issues
        document.getElementById('videoErrorOverlay').classList.remove('hidden');
        document.getElementById('videoDirectDownloadLink').href = media.url;
      });
      
      updatePlayPauseIcon();
    }

    function closeVideoModal() {
      mainVideoPlayer.pause();
      mainVideoPlayer.src = "";
      videoModal.classList.add('hidden');
      cancelNextAutoplay();
      updateContinueWatchingRail();
    }

    function toggleVideoPlay() {
      if (mainVideoPlayer.paused) {
        mainVideoPlayer.play();
      } else {
        mainVideoPlayer.pause();
      }
      updatePlayPauseIcon();
    }

    function updatePlayPauseIcon() {
      const icon = document.getElementById('playIcon');
      if (mainVideoPlayer.paused) {
        icon.className = "fa-solid fa-play text-xl";
      } else {
        icon.className = "fa-solid fa-pause text-xl";
      }
    }

    function skipVideoTime(seconds) {
      mainVideoPlayer.currentTime += seconds;
    }

    function changePlaybackSpeed(speed) {
      mainVideoPlayer.playbackRate = parseFloat(speed);
    }

    function toggleVideoMute() {
      mainVideoPlayer.muted = !mainVideoPlayer.muted;
      const volIcon = document.getElementById('volumeIcon');
      volIcon.className = mainVideoPlayer.muted ? "fa-solid fa-volume-xmark" : "fa-solid fa-volume-high";
      document.getElementById('volumeSlider').value = mainVideoPlayer.muted ? 0 : mainVideoPlayer.volume;
    }

    function changeVolume(vol) {
      mainVideoPlayer.volume = parseFloat(vol);
      mainVideoPlayer.muted = vol === "0";
      document.getElementById('volumeIcon').className = vol === "0" ? "fa-solid fa-volume-xmark" : "fa-solid fa-volume-high";
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        videoModal.requestFullscreen().catch(err => console.log(err));
      } else {
        document.exitFullscreen();
      }
    }

    async function togglePictureInPicture() {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await mainVideoPlayer.requestPictureInPicture();
      }
    }

    // Format Time (seconds to HH:MM:SS)
    function formatTime(secs) {
      if (isNaN(secs)) return "00:00";
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = Math.floor(secs % 60);
      if (h > 0) return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
      return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }

    // Video Event Listeners
    mainVideoPlayer.addEventListener('timeupdate', () => {
      const cur = mainVideoPlayer.currentTime;
      const dur = mainVideoPlayer.duration;
      
      document.getElementById('currentTimeDisplay').innerText = formatTime(cur);
      document.getElementById('durationDisplay').innerText = formatTime(dur);
      
      if (dur > 0) {
        document.getElementById('playerSeekbar').value = (cur / dur) * 100;
      }

      // Save progress every ~5 seconds
      if (Math.floor(cur) % 5 === 0 && activeMedia) {
        saveProgress(activeMedia.id, cur, dur);
      }
    });

    mainVideoPlayer.addEventListener('loadedmetadata', () => {
      document.getElementById('durationDisplay').innerText = formatTime(mainVideoPlayer.duration);
    });

    mainVideoPlayer.addEventListener('ended', () => {
      // Mark as completed
      if (activeMedia) {
        const progressData = JSON.parse(localStorage.getItem('yassil_progress') || '{}');
        delete progressData[activeMedia.id];
        localStorage.setItem('yassil_progress', JSON.stringify(progressData));
      }

      // Series Autoplay Logic
      if (activeMedia && activeMedia.type === 'series' && currentPlaylistIndex < currentPlaylist.length - 1 && isAutoplayNextEnabled) {
        showNextEpisodeCountdown();
      } else {
        closeVideoModal();
      }
    });

    mainVideoPlayer.addEventListener('error', (e) => {
      document.getElementById('videoErrorOverlay').classList.remove('hidden');
      if (activeMedia) document.getElementById('videoDirectDownloadLink').href = activeMedia.url;
    });

    function onSeekInput(val) {
      if (mainVideoPlayer.duration) {
        mainVideoPlayer.currentTime = (val / 100) * mainVideoPlayer.duration;
      }
    }

    // -- Series Playback Logic --

    function playNextEpisode() {
      if (currentPlaylistIndex < currentPlaylist.length - 1) {
        playMedia(currentPlaylist[currentPlaylistIndex + 1].id);
      }
    }

    function playPreviousEpisode() {
      if (currentPlaylistIndex > 0) {
        playMedia(currentPlaylist[currentPlaylistIndex - 1].id);
      }
    }

    function toggleAutoplayNext() {
      isAutoplayNextEnabled = !isAutoplayNextEnabled;
      document.getElementById('autoplayStatus').innerText = isAutoplayNextEnabled ? "ON" : "OFF";
      document.getElementById('autoplayStatus').className = isAutoplayNextEnabled ? "text-white" : "text-gray-500";
    }

    function showNextEpisodeCountdown() {
      const nextEp = currentPlaylist[currentPlaylistIndex + 1];
      document.getElementById('nextEpTitle').innerText = nextEp.title;
      document.getElementById('nextEpisodeCountdown').classList.remove('hidden');
      
      let timeLeft = 5;
      document.getElementById('countdownSecs').innerText = timeLeft;
      
      nextAutoplayTimer = setInterval(() => {
        timeLeft--;
        document.getElementById('countdownSecs').innerText = timeLeft;
        if (timeLeft <= 0) {
          playNextEpisodeImmediately();
        }
      }, 1000);
    }

    function playNextEpisodeImmediately() {
      cancelNextAutoplay();
      playNextEpisode();
    }

    function cancelNextAutoplay() {
      if(nextAutoplayTimer) clearInterval(nextAutoplayTimer);
      document.getElementById('nextEpisodeCountdown').classList.add('hidden');
    }


    // -- Comic / PDF Viewer --

    function openPdfModal(url, title) {
      document.getElementById('pdfTitle').innerText = title;
      document.getElementById('pdfDownloadBtn').href = url;
      document.getElementById('pdfFrame').src = url;
      pdfModal.classList.remove('hidden');
    }

    function closePdfModal() {
      pdfModal.classList.add('hidden');
      document.getElementById('pdfFrame').src = "about:blank";
    }


    // -- Utilities --

    function showToast(message) {
      const toast = document.getElementById("toastNotification");
      document.getElementById("toastText").innerText = message;
      
      toast.classList.remove("translate-y-20", "opacity-0");
      
      setTimeout(() => {
        toast.classList.add("translate-y-20", "opacity-0");
      }, 3000);
    }

  </script>
</body>
</html>
