const GN_GAME = (function() {
  const STORAGE_KEY = 'mdd_player';
  const GUN_NS = 'gn-gameplay-v1';
  const RANKS = [
    { name: 'RECRUIT', minXP: 0, color: '#94a3b8' },
    { name: 'WATCHER', minXP: 50, color: '#38bdf8' },
    { name: 'ARCHIVIST', minXP: 150, color: '#22c55e' },
    { name: 'SENTINEL', minXP: 350, color: '#f59e0b' },
    { name: 'GUARDIAN', minXP: 600, color: '#c084fc' },
    { name: 'VANGUARD', minXP: 1000, color: '#fbbf24' },
  ];

  const ACHIEVEMENTS = {
    first_mission:    { name: 'First Steps', desc: 'Accept your first mission', xp: 10, icon: '🏁' },
    first_pin:        { name: 'Pinned It', desc: 'Pin your first IPFS file', xp: 25, icon: '📌' },
    first_witness:    { name: 'Witness', desc: 'Complete a Bitcoin timestamp', xp: 30, icon: '⧖' },
    first_chat:       { name: 'Connected', desc: 'Send a message in GN Chat', xp: 10, icon: '💬' },
    chain_joined:     { name: 'In The Chain', desc: 'Join the Dead Man\'s Chain', xp: 20, icon: '⛓' },
    five_missions:    { name: 'Dedicated', desc: 'Accept 5 missions', xp: 40, icon: '⭐' },
    ten_missions:     { name: 'Committed', desc: 'Accept 10 missions', xp: 75, icon: '🌟' },
    quest_complete:   { name: 'Quest Master', desc: 'Complete a quest path', xp: 50, icon: '🏆' },
    circuit_designed: { name: 'Engineer', desc: 'Design a circuit in Circuit Lab', xp: 20, icon: '⚡' },
    globe_explored:   { name: 'Global View', desc: 'Visit the GN Globe', xp: 5, icon: '🌐' },
    three_paths:      { name: 'Renaissance', desc: 'Start quests on 3 different paths', xp: 60, icon: '🎯' },
    profile_backed_up:{ name: 'Vault Keeper', desc: 'Export your profile backup', xp: 15, icon: '🔐' },
    profile_restored: { name: 'Phoenix', desc: 'Import a saved profile', xp: 10, icon: '🔄' },
    chat_educator:    { name: 'Knowledge Share', desc: 'Read 5 behind-the-scenes tips in chat', xp: 15, icon: '📚' },
    hw_designer:      { name: 'Hardware Hacker', desc: 'Design and share a circuit schematic', xp: 25, icon: '🔧' },
    chat_10:          { name: 'Chatterbox', desc: 'Send 10 messages in GN Chat', xp: 15, icon: '🗣' },
    chat_50:          { name: 'Community Voice', desc: 'Send 50 messages in GN Chat', xp: 30, icon: '📢' },
  };

  let _gun = null;
  let _player = null;
  let _listeners = [];

  function _defaultPlayer() {
    return {
      id: _generateId(),
      codename: '',
      xp: 0,
      rank: 'RECRUIT',
      achievements: [],
      missionsAccepted: [],
      missionsCompleted: [],
      questsCompleted: [],
      pathsStarted: [],
      stats: {
        chatMessages: 0,
        witnessSeals: 0,
        ipfsPins: 0,
        circuitsDesigned: 0,
        loginStreak: 0,
        lastLogin: null,
      },
      createdAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
    };
  }

  function _generateId() {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function _save() {
    if (!_player) return;
    _player.lastSeen = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_player));
    _syncToGun();
    _notifyListeners();
  }

  function _load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        _player = JSON.parse(raw);
        if (!_player.stats) _player.stats = _defaultPlayer().stats;
        if (!_player.missionsCompleted) _player.missionsCompleted = [];
        if (!_player.pathsStarted) _player.pathsStarted = [];
        _updateLoginStreak();
        return true;
      } catch(e) {}
    }
    _player = _defaultPlayer();
    _save();
    return false;
  }

  function _updateLoginStreak() {
    const now = new Date();
    const last = _player.stats.lastLogin ? new Date(_player.stats.lastLogin) : null;
    if (last) {
      const daysDiff = Math.floor((now - last) / 86400000);
      if (daysDiff === 1) {
        _player.stats.loginStreak++;
      } else if (daysDiff > 1) {
        _player.stats.loginStreak = 1;
      }
    } else {
      _player.stats.loginStreak = 1;
    }
    _player.stats.lastLogin = now.toISOString();
  }

  function _computeRank(xp) {
    let rank = RANKS[0];
    for (const r of RANKS) {
      if (xp >= r.minXP) rank = r;
    }
    return rank;
  }

  function _syncToGun() {
    if (!_gun || !_player) return;
    try {
      const publicData = {
        id: _player.id,
        codename: _player.codename,
        xp: _player.xp,
        rank: _player.rank,
        achievementCount: _player.achievements.length,
        missionsAccepted: _player.missionsAccepted.length,
        missionsCompleted: _player.missionsCompleted.length,
        lastSeen: _player.lastSeen,
      };
      _gun.get(GUN_NS).get('players').get(_player.id).put(publicData);
    } catch(e) {}
  }

  function _notifyListeners() {
    for (const fn of _listeners) {
      try { fn(_player); } catch(e) {}
    }
  }

  function init(gunInstance) {
    _gun = gunInstance || null;
    _load();
    return _player;
  }

  function getPlayer() {
    if (!_player) _load();
    return Object.assign({}, _player);
  }

  function setCodename(name) {
    if (!_player) _load();
    _player.codename = name.slice(0, 20);
    _save();
  }

  function _showXPToast(amount, reason, promoted, rankName) {
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%) translateY(-20px);z-index:10000;background:rgba(6,10,18,0.95);border:1px solid #16a34a;color:#22c55e;font-family:var(--font,sans-serif);font-size:1rem;font-weight:700;padding:12px 24px;border-radius:8px;pointer-events:none;opacity:0;transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1);white-space:nowrap;text-align:center;box-shadow:0 0 20px rgba(34,197,94,0.3);';
    toast.textContent = '+' + amount + ' XP';
    if (reason) toast.textContent += ' — ' + reason;
    document.body.appendChild(toast);
    requestAnimationFrame(function() {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    if (promoted) {
      setTimeout(function() {
        toast.style.borderColor = '#c084fc';
        toast.style.color = '#c084fc';
        toast.style.boxShadow = '0 0 24px rgba(192,132,252,0.4)';
        toast.textContent = 'RANK UP: ' + rankName;
        if (typeof GN_FX !== 'undefined') GN_FX.levelUp();
      }, 1200);
    }
    setTimeout(function() {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(-20px)';
      setTimeout(function() { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 400);
    }, promoted ? 3000 : 1800);
  }

  function addXP(amount, reason) {
    if (!_player) _load();
    _player.xp += amount;
    const newRank = _computeRank(_player.xp);
    const promoted = newRank.name !== _player.rank;
    _player.rank = newRank.name;
    _save();
    _showXPToast(amount, reason, promoted, newRank.name);
    if (typeof GN_FX !== 'undefined') GN_FX.xp();
    return { xp: _player.xp, rank: newRank, promoted, reason };
  }

  function unlockAchievement(key) {
    if (!_player) _load();
    if (!ACHIEVEMENTS[key]) return null;
    if (_player.achievements.includes(key)) return null;
    _player.achievements.push(key);
    const ach = ACHIEVEMENTS[key];
    setTimeout(function() {
      if (typeof GN_FX !== 'undefined') GN_FX.achievement();
      var achToast = document.createElement('div');
      achToast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%) translateY(20px);z-index:10000;background:rgba(6,10,18,0.95);border:1px solid #f59e0b;color:#fbbf24;font-family:var(--font,sans-serif);font-size:0.95rem;font-weight:700;padding:14px 24px;border-radius:8px;pointer-events:none;opacity:0;transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1);text-align:center;box-shadow:0 0 20px rgba(245,158,11,0.3);max-width:90vw;';
      achToast.innerHTML = '<div style="font-size:1.3rem;margin-bottom:4px">' + ach.icon + '</div><div>' + ach.name + '</div><div style="font-size:0.78rem;color:#94a3b8;font-weight:500;margin-top:2px">' + ach.desc + '</div>';
      document.body.appendChild(achToast);
      requestAnimationFrame(function() {
        achToast.style.opacity = '1';
        achToast.style.transform = 'translateX(-50%) translateY(0)';
      });
      setTimeout(function() {
        achToast.style.opacity = '0';
        achToast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(function() { if (achToast.parentNode) achToast.parentNode.removeChild(achToast); }, 400);
      }, 2500);
    }, 300);
    const result = addXP(ach.xp, ach.name);
    return { achievement: ach, ...result };
  }

  function acceptMission(missionId) {
    if (!_player) _load();
    if (_player.missionsAccepted.includes(missionId)) return false;
    _player.missionsAccepted.push(missionId);
    _save();
    if (_player.missionsAccepted.length === 1) unlockAchievement('first_mission');
    if (_player.missionsAccepted.length >= 5) unlockAchievement('five_missions');
    if (_player.missionsAccepted.length >= 10) unlockAchievement('ten_missions');
    return true;
  }

  function completeMission(missionId) {
    if (!_player) _load();
    if (_player.missionsCompleted.includes(missionId)) return false;
    _player.missionsCompleted.push(missionId);
    addXP(15, 'Mission completed');
    _save();
    return true;
  }

  function completeQuest(questId) {
    if (!_player) _load();
    if (_player.questsCompleted.includes(questId)) return false;
    _player.questsCompleted.push(questId);
    addXP(20, 'Quest completed');
    _save();
    return true;
  }

  function startPath(pathName) {
    if (!_player) _load();
    if (!_player.pathsStarted.includes(pathName)) {
      _player.pathsStarted.push(pathName);
      _save();
      if (_player.pathsStarted.length >= 3) unlockAchievement('three_paths');
    }
  }

  function trackStat(statKey, increment) {
    if (!_player) _load();
    if (_player.stats[statKey] !== undefined) {
      _player.stats[statKey] += (increment || 1);
      _save();
    }
  }

  function getLeaderboard(callback) {
    if (!_gun) { callback([]); return; }
    const players = [];
    _gun.get(GUN_NS).get('players').map().once(function(data) {
      if (data && data.codename && data.xp !== undefined) {
        players.push({
          id: data.id,
          codename: data.codename,
          xp: data.xp,
          rank: data.rank,
          lastSeen: data.lastSeen,
        });
      }
    });
    setTimeout(function() {
      players.sort(function(a, b) { return b.xp - a.xp; });
      callback(players.slice(0, 25));
    }, 2000);
  }

  function onChange(fn) {
    _listeners.push(fn);
    return function() {
      _listeners = _listeners.filter(function(f) { return f !== fn; });
    };
  }

  function getRankInfo(xp) {
    const current = _computeRank(xp !== undefined ? xp : (_player ? _player.xp : 0));
    const idx = RANKS.indexOf(current);
    const next = idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
    const progress = next
      ? (((_player ? _player.xp : 0) - current.minXP) / (next.minXP - current.minXP)) * 100
      : 100;
    return { current, next, progress: Math.min(100, Math.round(progress)) };
  }

  function getAchievements() {
    if (!_player) _load();
    return Object.keys(ACHIEVEMENTS).map(function(key) {
      return {
        key: key,
        ...ACHIEVEMENTS[key],
        unlocked: _player.achievements.includes(key),
      };
    });
  }

  function exportProfile() {
    if (!_player) _load();
    const data = JSON.stringify(_player, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gn-profile-' + (_player.codename || _player.id) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    unlockAchievement('profile_backed_up');
    return data;
  }

  function importProfile(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      if (!imported.id || imported.xp === undefined) {
        return { success: false, error: 'Invalid profile format' };
      }
      const defaults = _defaultPlayer();
      _player = Object.assign({}, defaults, imported);
      if (!_player.stats) _player.stats = defaults.stats;
      if (!_player.achievements) _player.achievements = [];
      if (!_player.missionsAccepted) _player.missionsAccepted = [];
      if (!_player.missionsCompleted) _player.missionsCompleted = [];
      if (!_player.questsCompleted) _player.questsCompleted = [];
      if (!_player.pathsStarted) _player.pathsStarted = [];
      _player.rank = _computeRank(_player.xp).name;
      _save();
      unlockAchievement('profile_restored');
      return { success: true, player: getPlayer() };
    } catch(e) {
      return { success: false, error: 'Could not parse profile: ' + e.message };
    }
  }

  function importFromFile(callback) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(ev) {
        const result = importProfile(ev.target.result);
        if (callback) callback(result);
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function getProfileShareCode() {
    if (!_player) _load();
    try {
      const mini = {
        i: _player.id,
        c: _player.codename,
        x: _player.xp,
        a: _player.achievements,
        m: _player.missionsAccepted.length,
        mc: _player.missionsCompleted.length,
        q: _player.questsCompleted.length,
        s: _player.stats,
        t: _player.createdAt,
      };
      return btoa(JSON.stringify(mini));
    } catch(e) { return ''; }
  }

  function showProfileModal() {
    if (!_player) _load();
    var existing = document.getElementById('gn-profile-modal');
    if (existing) existing.remove();

    var rankInfo = getRankInfo();
    var achs = getAchievements();
    var unlockedCount = achs.filter(function(a) { return a.unlocked; }).length;

    var achHTML = achs.map(function(a) {
      return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;opacity:' + (a.unlocked ? '1' : '0.35') + '">' +
        '<span style="font-size:1.2rem">' + a.icon + '</span>' +
        '<div style="flex:1">' +
          '<div style="font-weight:700;font-size:0.88rem;color:' + (a.unlocked ? '#22c55e' : '#64748b') + '">' + a.name + (a.unlocked ? ' ✓' : '') + '</div>' +
          '<div style="font-size:0.78rem;color:#94a3b8">' + a.desc + '</div>' +
        '</div>' +
        '<span style="font-size:0.78rem;color:#fbbf24;font-weight:600">+' + a.xp + ' XP</span>' +
      '</div>';
    }).join('');

    var modal = document.createElement('div');
    modal.id = 'gn-profile-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(4,8,16,0.9);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px';
    modal.innerHTML =
      '<div style="background:#0c1422;border:1px solid #1a2840;border-radius:8px;max-width:520px;width:100%;max-height:90vh;overflow-y:auto;font-family:Open Sans,sans-serif">' +
        '<div style="padding:20px 24px;border-bottom:1px solid #1a2840;display:flex;align-items:center;justify-content:space-between">' +
          '<div style="font-size:1.1rem;font-weight:700;color:#38bdf8;letter-spacing:1px">YOUR PROFILE</div>' +
          '<button onclick="document.getElementById(\'gn-profile-modal\').remove()" style="background:none;border:1px solid #1a2840;color:#94a3b8;font-size:1.2rem;padding:4px 10px;cursor:pointer;border-radius:4px">✕</button>' +
        '</div>' +
        '<div style="padding:20px 24px">' +
          '<div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">' +
            '<div style="font-size:2rem">◈</div>' +
            '<div style="flex:1">' +
              '<div style="font-size:1.1rem;font-weight:700;color:#e2e8f0">' + (_player.codename || 'Anonymous') + '</div>' +
              '<div style="font-size:0.82rem;font-weight:700;color:' + rankInfo.current.color + ';letter-spacing:2px">' + rankInfo.current.name + '</div>' +
            '</div>' +
            '<div style="text-align:right">' +
              '<div style="font-size:1.3rem;font-weight:700;color:#fbbf24">' + _player.xp + ' XP</div>' +
              '<div style="font-size:0.72rem;color:#94a3b8">since ' + new Date(_player.createdAt).toLocaleDateString() + '</div>' +
            '</div>' +
          '</div>' +
          (rankInfo.next ?
            '<div style="margin-bottom:20px">' +
              '<div style="height:8px;background:#0a1628;border:1px solid #1a2840;border-radius:4px;overflow:hidden">' +
                '<div style="height:100%;width:' + rankInfo.progress + '%;background:linear-gradient(90deg,' + rankInfo.current.color + ',' + rankInfo.next.color + ');border-radius:4px"></div>' +
              '</div>' +
              '<div style="font-size:0.78rem;color:#94a3b8;margin-top:4px">' + rankInfo.progress + '% to ' + rankInfo.next.name + ' (' + rankInfo.next.minXP + ' XP)</div>' +
            '</div>' : '') +
          '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px">' +
            '<div style="background:#040810;border:1px solid #1a2840;padding:12px;text-align:center;border-radius:4px"><div style="font-size:1.2rem;font-weight:700;color:#22c55e">' + _player.missionsAccepted.length + '</div><div style="font-size:0.72rem;color:#94a3b8;font-weight:600">MISSIONS</div></div>' +
            '<div style="background:#040810;border:1px solid #1a2840;padding:12px;text-align:center;border-radius:4px"><div style="font-size:1.2rem;font-weight:700;color:#38bdf8">' + _player.questsCompleted.length + '</div><div style="font-size:0.72rem;color:#94a3b8;font-weight:600">QUESTS</div></div>' +
            '<div style="background:#040810;border:1px solid #1a2840;padding:12px;text-align:center;border-radius:4px"><div style="font-size:1.2rem;font-weight:700;color:#f59e0b">' + _player.stats.loginStreak + '</div><div style="font-size:0.72rem;color:#94a3b8;font-weight:600">DAY STREAK</div></div>' +
          '</div>' +
          '<div style="font-size:0.82rem;font-weight:700;color:#94a3b8;letter-spacing:2px;margin-bottom:10px">ACHIEVEMENTS (' + unlockedCount + '/' + achs.length + ')</div>' +
          '<div style="max-height:200px;overflow-y:auto;margin-bottom:20px;border:1px solid #1a2840;border-radius:4px;padding:8px 12px;background:#040810">' + achHTML + '</div>' +
          '<div style="background:rgba(34,197,94,0.04);border:1px solid rgba(34,197,94,0.2);border-radius:4px;padding:14px 16px;margin-bottom:16px">' +
            '<div style="font-size:0.82rem;font-weight:700;color:#22c55e;margin-bottom:6px">YOUR DATA STAYS WITH YOU</div>' +
            '<div style="font-size:0.82rem;color:#94a3b8;line-height:1.7">We don\'t collect your personal data, track your behavior, or store anything on our servers. Your profile lives entirely in this browser — that\'s by design, not by accident. We believe tools for democracy shouldn\'t require surrendering your privacy.</div>' +
          '</div>' +
          '<div style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);border-radius:4px;padding:14px 16px;margin-bottom:16px">' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
              '<span style="font-size:1rem">🔐</span>' +
              '<span style="font-size:0.82rem;font-weight:700;color:#f59e0b">VAULT KEEPER MISSION</span>' +
              '<span style="font-size:0.72rem;color:#fbbf24;font-weight:600">+15 XP</span>' +
            '</div>' +
            '<div style="font-size:0.82rem;color:#94a3b8;line-height:1.7">Because your data is local-only, clearing your browser cache or switching devices will reset your progress. Export your profile to earn the <strong style="color:#f59e0b">Vault Keeper</strong> achievement and keep a backup you control. Import it anywhere to pick up where you left off.</div>' +
          '</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
            '<button onclick="GN_GAME.exportProfile();this.innerHTML=\'\\u2713 Vault Secured!\';this.style.borderColor=\'#22c55e\';this.style.color=\'#22c55e\';var b=this;setTimeout(function(){b.innerHTML=\'\\uD83D\\uDD10 Export Profile\'},2500)" style="flex:1;background:rgba(34,197,94,0.08);border:1px solid #16a34a;color:#22c55e;font-family:Open Sans,sans-serif;font-size:0.88rem;font-weight:700;padding:12px 16px;cursor:pointer;border-radius:6px;letter-spacing:1px">Export Profile</button>' +
            '<button onclick="GN_GAME.importFromFile(function(r){if(r.success){alert(\'Profile restored! +10 XP. Page will reload.\');location.reload()}else{alert(r.error)}})" style="flex:1;background:rgba(56,189,248,0.08);border:1px solid #0ea5e9;color:#38bdf8;font-family:Open Sans,sans-serif;font-size:0.88rem;font-weight:700;padding:12px 16px;cursor:pointer;border-radius:6px;letter-spacing:1px">Import Profile</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e) {
      if (e.target === modal) modal.remove();
    });
  }

  function resetPlayer() {
    _player = _defaultPlayer();
    _save();
    return _player;
  }

  function renderPlayerBar(containerId) {
    if (!_player) _load();
    const el = document.getElementById(containerId);
    if (!el) return;
    const rankInfo = getRankInfo();
    el.innerHTML =
      '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
        '<span style="font-size:0.78rem;font-weight:700;color:' + rankInfo.current.color + ';letter-spacing:2px;text-transform:uppercase;border:1px solid ' + rankInfo.current.color + ';padding:3px 10px;border-radius:3px">' + rankInfo.current.name + '</span>' +
        '<span style="font-size:0.88rem;font-weight:600;color:#fbbf24">' + _player.xp + ' XP</span>' +
        (rankInfo.next ?
          '<div style="flex:1;min-width:80px;max-width:200px">' +
            '<div style="height:6px;background:#0a1628;border:1px solid #1a2840;border-radius:3px;overflow:hidden">' +
              '<div style="height:100%;width:' + rankInfo.progress + '%;background:linear-gradient(90deg,' + rankInfo.current.color + ',' + (rankInfo.next ? rankInfo.next.color : rankInfo.current.color) + ');border-radius:3px;transition:width 0.8s"></div>' +
            '</div>' +
            '<div style="font-size:0.72rem;color:#64748b;margin-top:2px">' + rankInfo.progress + '% to ' + rankInfo.next.name + '</div>' +
          '</div>'
          : '<span style="font-size:0.72rem;color:#fbbf24">MAX RANK</span>') +
        '<span style="font-size:0.78rem;color:#94a3b8">' + _player.achievements.length + '/' + Object.keys(ACHIEVEMENTS).length + ' achievements</span>' +
      '</div>';
  }

  return {
    init: init,
    getPlayer: getPlayer,
    setCodename: setCodename,
    addXP: addXP,
    unlockAchievement: unlockAchievement,
    acceptMission: acceptMission,
    completeMission: completeMission,
    completeQuest: completeQuest,
    startPath: startPath,
    trackStat: trackStat,
    getLeaderboard: getLeaderboard,
    onChange: onChange,
    getRankInfo: getRankInfo,
    getAchievements: getAchievements,
    resetPlayer: resetPlayer,
    renderPlayerBar: renderPlayerBar,
    exportProfile: exportProfile,
    importProfile: importProfile,
    importFromFile: importFromFile,
    getProfileShareCode: getProfileShareCode,
    showProfileModal: showProfileModal,
    RANKS: RANKS,
    ACHIEVEMENTS: ACHIEVEMENTS,
  };
})();
