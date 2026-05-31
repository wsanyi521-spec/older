// Antigravity AI Code System - 银发护卫APP手机版高保真交互控制引擎

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. GLOBAL STATE MANAGEMENT (天津本地化及AI动画全局状态)
    // ==========================================
    const state = {
        currentRole: 'elderly', // 'elderly' or 'guardian'
        activeElderTab: 'home',
        activeGuardTab: 'telemetry',
        
        heartRate: 78,
        
        // Tianjin Nankai Coordinates & Localization
        parentName: '王大爷',
        tianjinAddress: '天津市南开区鼓楼街道古文化街***号',
        tianjinCoordinates: { lat: 39.125642, lng: 117.198354 },
        
        bookings: [
            {
                id: 'ORD-2026-0001',
                name: '适老低升糖膳食配餐',
                desc: '预约状态：已安排送餐 | 配送网格员：小李师傅 (139****1234) 正在鼓楼配送站装车',
                price: 18.00,
                status: 'approved',
                category: '爱心餐饮'
            }
        ],
        
        ledger: [
            { txId: 'TX202605318029', name: '适老家政保洁服务', price: 120.00, splitProv: 102.00, splitPlatform: 14.40, splitStation: 3.60, status: '已付' },
            { txId: 'TX202605318018', name: '社区自提低糖餐', price: 18.00, splitProv: 15.30, splitPlatform: 2.16, splitStation: 0.54, status: '已付' }
        ],
        
        sosActive: false,
        
        // GLOBAL AI CAMERA FALL ANIMATION STATES TO SOLVE LOOP BUG
        aiFallState: 'walking', // 'walking', 'falling', 'fallen'
        aiFallX: 40,
        aiFallY: 80,
        aiFallCycle: 1,
        aiFallSpeed: 1.0,

        // E-COMMERCE CART & AUXILIARY COMMERCIAL GLOBAL STATE VARIABLES
        cart: [],
        chatHistory: [],
        callActive: false,
        callSeconds: 0,
        callTimerId: null,
        isCallMuted: false,
        adImpressions: 1245,
        adClicks: 84,
        partnerApis: [
            { name: '天津老龄委健康数据端口', endpoint: 'api.tianjin.gov/elderly/biometrics', status: 'synced', responseTime: '12ms' },
            { name: '天津第一中心医院网格绿色通道', endpoint: 'api.tjhosp1.cn/greenchannel/booking', status: 'synced', responseTime: '45ms' },
            { name: '南开居委会网格安全巡防对接', endpoint: 'api.nankai.tj.cn/grid/patrol', status: 'synced', responseTime: '24ms' }
        ]
    };

    // ==========================================
    // 2. DOM ELEMENTS SELECTORS
    // ==========================================
    const mobileViewport = document.getElementById('mobile-viewport');
    const phoneSysBar = document.getElementById('phone-sys-bar');
    const appBrandTitle = document.getElementById('app-brand-title');
    
    const btnRoleElder = document.getElementById('btn-role-elder');
    const btnRoleGuard = document.getElementById('btn-role-guard');
    
    const screenElderly = document.getElementById('screen-elderly');
    const screenGuardian = document.getElementById('screen-guardian');
    
    const elderBottomNavBar = document.getElementById('elder-bottom-nav-bar');
    const guardBottomNavBar = document.getElementById('guard-bottom-nav-bar');
    
    const elderTabBtns = document.querySelectorAll('.elder-tab-btn');
    const elderViewPanes = {
        home: document.getElementById('pane-elder-home'),
        services: document.getElementById('pane-elder-services'),
        station: document.getElementById('pane-elder-station'),
        antifraud: document.getElementById('pane-elder-antifraud')
    };
    
    const guardTabBtns = document.querySelectorAll('.guard-tab-btn');
    const guardViewPanes = {
        telemetry: document.getElementById('pane-guard-telemetry'),
        aidetect: document.getElementById('pane-guard-aidetect'),
        approvals: document.getElementById('pane-guard-approvals'),
        ledger: document.getElementById('pane-guard-ledger')
    };

    const guardPendingBadge = document.getElementById('guard-pending-badge');
    const elderRecordsContainer = document.getElementById('elder-records-container');
    const guardApprovalsContainer = document.getElementById('guard-approvals-container');
    const ledgerRowsContainer = document.getElementById('ledger-rows-container');
    
    // Voice assistant elements
    const elderVoiceWave = document.getElementById('elder-voice-wave');
    const elderVoiceTranscript = document.getElementById('elder-voice-transcript');
    const elderVoiceResponse = document.getElementById('elder-voice-response');
    
    // ==========================================
    // 3. SECURE DOM MODAL POPUPS (XSS-FREE)
    // ==========================================
    function openMobileModal(titleText, contentNode, confirmHandler, cancelHandler = null) {
        const overlay = document.createElement('div');
        overlay.className = 'mobile-modal-overlay';
        overlay.id = 'dynamic-mobile-modal';
        
        const body = document.createElement('div');
        body.className = 'mobile-modal-body';
        
        const title = document.createElement('h3');
        title.style.fontSize = '1.05rem';
        title.style.fontWeight = '900';
        title.style.color = 'var(--elder-text-main)';
        title.style.marginBottom = '0.75rem';
        title.textContent = titleText;
        
        body.appendChild(title);
        body.appendChild(contentNode);
        
        const actions = document.createElement('div');
        actions.className = 'mobile-action-row';
        
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'mobile-btn mobile-btn-primary';
        confirmBtn.textContent = '确认';
        confirmBtn.addEventListener('click', () => {
            if (confirmHandler) confirmHandler();
            overlay.remove();
        });
        
        if (cancelHandler !== false) {
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'mobile-btn mobile-btn-cancel';
            cancelBtn.textContent = '取消';
            cancelBtn.addEventListener('click', () => {
                if (cancelHandler) cancelHandler();
                overlay.remove();
            });
            actions.appendChild(cancelBtn);
        }
        
        actions.appendChild(confirmBtn);
        body.appendChild(actions);
        overlay.appendChild(body);
        
        mobileViewport.appendChild(overlay);
    }

    // ==========================================
    // 4. ROLE AND BOTTOM NAV SLIDERS Swaps
    // ==========================================
    function switchRole(role) {
        state.currentRole = role;
        
        if (role === 'elderly') {
            btnRoleElder.classList.add('active');
            btnRoleGuard.classList.remove('active');
            mobileViewport.classList.remove('theme-child');
            
            screenElderly.style.display = 'flex';
            screenGuardian.style.display = 'none';
            
            elderBottomNavBar.style.display = 'grid';
            guardBottomNavBar.style.display = 'none';
            
            appBrandTitle.textContent = '银发护卫 · 守护版';
        } else {
            btnRoleElder.classList.remove('active');
            btnRoleGuard.classList.add('active');
            mobileViewport.classList.add('theme-child');
            
            screenElderly.style.display = 'none';
            screenGuardian.style.display = 'flex';
            
            elderBottomNavBar.style.display = 'none';
            guardBottomNavBar.style.display = 'grid';
            
            appBrandTitle.textContent = '银发护卫 · 监护端';
        }

        // Toggle Floating Shopping Cart display based on role
        const fCart = document.getElementById('floating-cart');
        if (fCart) {
            if (role === 'elderly' && state.activeElderTab === 'station') {
                fCart.style.display = 'flex';
            } else {
                fCart.style.display = 'none';
            }
        }
    }

    btnRoleElder.addEventListener('click', () => switchRole('elderly'));
    btnRoleGuard.addEventListener('click', () => switchRole('guardian'));

    // Elderly Tab Navs
    elderTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-elder-tab');
            state.activeElderTab = tab;
            
            elderTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            Object.keys(elderViewPanes).forEach(k => {
                elderViewPanes[k].style.display = 'none';
            });
            elderViewPanes[tab].style.display = 'flex';

            // Toggle Floating Shopping Cart display based on Elderly Tab selection
            const fCart = document.getElementById('floating-cart');
            if (fCart) {
                if (tab === 'station') {
                    fCart.style.display = 'flex';
                } else {
                    fCart.style.display = 'none';
                }
            }
        });
    });

    // Guardian Tab Navs
    guardTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-guard-tab');
            state.activeGuardTab = tab;
            
            guardTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            Object.keys(guardViewPanes).forEach(k => {
                guardViewPanes[k].style.display = 'none';
            });
            guardViewPanes[tab].style.display = 'flex';
        });
    });

    // ==========================================
    // 5. SYNCHRONIZED TRANSACTION DATA LOOP
    // ==========================================
    function renderBookingsAndApprovals() {
        elderRecordsContainer.replaceChildren();
        guardApprovalsContainer.replaceChildren();
        
        let pendingCount = 0;
        
        state.bookings.forEach(ord => {
            // Elder Screen List Row
            const row = document.createElement('div');
            row.className = 'senior-record-card';
            
            const info = document.createElement('div');
            info.className = 'senior-record-info';
            
            const title = document.createElement('h4');
            title.textContent = ord.name;
            
            const desc = document.createElement('p');
            desc.textContent = ord.desc;
            
            info.appendChild(title);
            info.appendChild(desc);
            
            const badge = document.createElement('div');
            badge.className = 'senior-record-badge';
            
            if (ord.status === 'pending') {
                badge.classList.add('pending');
                badge.textContent = '待子女代付';
            } else {
                badge.classList.add('approved');
                badge.textContent = '已支付';
            }
            
            row.appendChild(info);
            row.appendChild(badge);
            elderRecordsContainer.appendChild(row);
            
            // Guardian Screen Approvals List Row
            if (ord.status === 'pending') {
                pendingCount++;
                
                const card = document.createElement('div');
                card.className = 'guard-approval-card';
                
                const details = document.createElement('div');
                details.className = 'guard-approval-details';
                
                const gTitle = document.createElement('h4');
                gTitle.textContent = ord.name;
                
                const gDesc = document.createElement('p');
                gDesc.textContent = `申请人：王大爷 | 类目：${ord.category} | 时间：刚刚`;
                
                details.appendChild(gTitle);
                details.appendChild(gDesc);
                
                const footer = document.createElement('div');
                footer.className = 'guard-approval-footer';
                
                const price = document.createElement('div');
                price.className = 'guard-approval-price';
                price.textContent = `¥${ord.price.toFixed(2)}`;
                
                const actions = document.createElement('div');
                actions.className = 'guard-approval-actions';
                
                const reject = document.createElement('button');
                reject.className = 'guard-btn-action guard-btn-reject';
                reject.textContent = '拒绝';
                reject.addEventListener('click', () => {
                    state.bookings = state.bookings.filter(b => b.id !== ord.id);
                    renderBookingsAndApprovals();
                });
                
                const approve = document.createElement('button');
                approve.className = 'guard-btn-action guard-btn-approve';
                approve.textContent = '同意代付';
                approve.addEventListener('click', () => {
                    ord.status = 'approved';
                    ord.desc = `预约说明：儿女已完成代付签名授权 | 鼓楼驿站服务网格师傅出库跟进`;
                    
                    // Inject split payment log
                    const txId = 'TX' + Date.now().toString().slice(-8);
                    state.ledger.unshift({
                        txId: txId,
                        name: ord.name,
                        price: ord.price,
                        splitProv: ord.price * 0.85,
                        splitPlatform: ord.price * 0.12,
                        splitStation: ord.price * 0.03,
                        status: '已付'
                    });
                    
                    renderLedgers();
                    renderBookingsAndApprovals();
                });
                
                actions.appendChild(reject);
                actions.appendChild(approve);
                
                footer.appendChild(price);
                footer.appendChild(actions);
                
                card.appendChild(details);
                card.appendChild(footer);
                
                guardApprovalsContainer.appendChild(card);
            }
        });
        
        // Update Bottom Nav Approvals Badge count
        if (pendingCount > 0) {
            guardPendingBadge.textContent = pendingCount.toString();
            guardPendingBadge.style.display = 'inline-block';
        } else {
            guardPendingBadge.style.display = 'none';
        }
    }

    function renderLedgers() {
        ledgerRowsContainer.replaceChildren();
        
        state.ledger.forEach(item => {
            const card = document.createElement('div');
            card.className = 'guard-ledger-item';
            
            const top = document.createElement('div');
            top.className = 'guard-ledger-details';
            
            const name = document.createElement('span');
            name.textContent = item.name;
            
            const price = document.createElement('span');
            price.style.color = '#34d399';
            price.textContent = `¥${item.price.toFixed(2)}`;
            
            top.appendChild(name);
            top.appendChild(price);
            
            const row1 = document.createElement('div');
            row1.className = 'guard-ledger-split-row';
            const l1 = document.createElement('span'); l1.textContent = '服务商 (85%)';
            const v1 = document.createElement('span'); v1.className = 'split-val'; v1.textContent = `¥${item.splitProv.toFixed(2)}`;
            row1.appendChild(l1); row1.appendChild(v1);
            
            const row2 = document.createElement('div');
            row2.className = 'guard-ledger-split-row';
            const l2 = document.createElement('span'); l2.textContent = '平台抽成 (12%)';
            const v2 = document.createElement('span'); v2.className = 'split-val'; v2.textContent = `¥${item.splitPlatform.toFixed(2)}`;
            row2.appendChild(l2); row2.appendChild(v2);
            
            const row3 = document.createElement('div');
            row3.className = 'guard-ledger-split-row';
            const l3 = document.createElement('span'); l3.textContent = '线下驿站 (3%)';
            const v3 = document.createElement('span'); v3.className = 'split-val'; v3.textContent = `¥${item.splitStation.toFixed(2)}`;
            row3.appendChild(l3); row3.appendChild(v3);
            
            card.appendChild(top);
            card.appendChild(row1);
            card.appendChild(row2);
            card.appendChild(row3);
            
            ledgerRowsContainer.appendChild(card);
        });
    }

    renderBookingsAndApprovals();
    renderLedgers();

    // ==========================================
    // 6. ECG HEALTH RENDER ANIMATIONS
    // ==========================================
    const canvasHeart = document.getElementById('canvas-heart-stream');
    const canvasBp = document.getElementById('canvas-bp-stream');
    
    let heartPoints = Array(35).fill(30);
    let bpPoints = Array(35).fill(30);
    
    function drawECGStream(canvas, points, strokeColor, isPulse = true) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let counter = 0;
        
        function loop() {
            if (!ctx) return;
            const w = canvas.width = canvas.clientWidth;
            const h = canvas.height = canvas.clientHeight;
            
            ctx.clearRect(0, 0, w, h);
            
            // Draw background grid lines
            ctx.strokeStyle = 'rgba(255,255,255,0.015)';
            ctx.lineWidth = 1;
            for (let i = 0; i < w; i += 20) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
            }
            for (let j = 0; j < h; j += 15) {
                ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(w, j); ctx.stroke();
            }
            
            counter++;
            if (counter % 5 === 0) {
                let next = h / 2;
                if (isPulse) {
                    const mod = (counter / 5) % 8;
                    if (mod === 0) next = h / 2 - 24;
                    else if (mod === 1) next = h / 2 + 10;
                    else if (mod === 2) next = h / 2 - 3;
                    else next = h / 2 + (Math.random() * 4 - 2);
                } else {
                    next = h / 2 + Math.sin(counter * 0.05) * 12 + (Math.random() * 2 - 1);
                }
                points.push(next);
                if (points.length > 40) points.shift();
            }
            
            ctx.beginPath();
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 6;
            ctx.shadowColor = strokeColor;
            
            for (let i = 0; i < points.length; i++) {
                const x = (w / (points.length - 1)) * i;
                const y = points[i];
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            
            ctx.shadowBlur = 0;
            ctx.fillStyle = isPulse ? 'rgba(2, 132, 199, 0.03)' : 'rgba(37, 99, 235, 0.03)';
            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            ctx.closePath();
            ctx.fill();
            
            requestAnimationFrame(loop);
        }
        loop();
    }

    drawECGStream(canvasHeart, heartPoints, '#0284c7', true);
    drawECGStream(canvasBp, bpPoints, '#2563eb', false);

    // ==========================================
    // 7. AI FALL CAMERA MODEL CANVAS ANIMATION (BUG RESOLVED)
    // ==========================================
    const canvasAiCam = document.getElementById('canvas-ai-camera');
    
    function startMobileFallAiSimulator() {
        if (!canvasAiCam) return;
        const ctx = canvasAiCam.getContext('2d');
        
        function renderFrame() {
            if (!ctx) return;
            const w = canvasAiCam.width = canvasAiCam.clientWidth;
            const h = canvasAiCam.height = canvasAiCam.clientHeight;
            
            ctx.fillStyle = '#060a12';
            ctx.fillRect(0, 0, w, h);
            
            // Read and increment from global state object to keep synchronized
            state.aiFallCycle++;
            
            // Loop control calculations based on global state
            if (state.aiFallState === 'walking') {
                state.aiFallX += state.aiFallSpeed;
                if (state.aiFallX > 140 || state.aiFallX < 40) {
                    state.aiFallSpeed = -state.aiFallSpeed;
                }
            } else if (state.aiFallState === 'falling') {
                state.aiFallY += 3.5;
                if (state.aiFallY >= 105) {
                    state.aiFallY = 105;
                    state.aiFallState = 'fallen';
                    triggerCriticalMobileSos(); // Trigger SOS alert popup within mobile!
                }
            } else if (state.aiFallState === 'fallen') {
                // Keep fallen down for 240 frames, then reset
                if (state.aiFallCycle % 420 === 300) {
                    state.aiFallState = 'walking';
                    state.aiFallY = 80;
                    state.aiFallX = 40;
                }
            }
            
            // Draw background furniture block
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(w - 50, h - 50, 40, 40);
            
            // Draw floor line
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(0, h - 15); ctx.lineTo(w, h - 15); ctx.stroke();
            
            // Draw skeletal wireframe
            ctx.strokeStyle = state.aiFallState === 'fallen' ? '#e11d48' : '#38bdf8';
            ctx.lineWidth = 2.5;
            
            // Head position
            const headRad = 5;
            const headX = state.aiFallState === 'fallen' ? state.aiFallX - 18 : state.aiFallX;
            const headY = state.aiFallState === 'fallen' ? state.aiFallY + 2 : state.aiFallY - 14;
            
            ctx.beginPath();
            ctx.arc(headX, headY, headRad, 0, Math.PI * 2);
            ctx.stroke();
            
            // Body spine
            ctx.beginPath();
            if (state.aiFallState === 'walking') {
                ctx.moveTo(state.aiFallX, state.aiFallY - 9);
                ctx.lineTo(state.aiFallX, state.aiFallY + 6);
                
                // Swing arms
                const swing = Math.sin(state.aiFallCycle * 0.1) * 6;
                ctx.moveTo(state.aiFallX, state.aiFallY - 7);
                ctx.lineTo(state.aiFallX - 8, state.aiFallY + swing);
                ctx.moveTo(state.aiFallX, state.aiFallY - 7);
                ctx.lineTo(state.aiFallX + 8, state.aiFallY - swing);
                
                // Legs
                ctx.moveTo(state.aiFallX, state.aiFallY + 6);
                ctx.lineTo(state.aiFallX - 6, state.aiFallY + 18 + swing * 0.2);
                ctx.moveTo(state.aiFallX, state.aiFallY + 6);
                ctx.lineTo(state.aiFallX + 6, state.aiFallY + 18 - swing * 0.2);
            } else if (state.aiFallState === 'falling') {
                ctx.moveTo(headX, headY + 5);
                ctx.lineTo(state.aiFallX + 10, state.aiFallY + 10);
                
                ctx.moveTo(headX, headY + 7);
                ctx.lineTo(headX - 10, headY - 10);
            } else {
                // Horizontal fallen body posture
                ctx.moveTo(state.aiFallX - 13, state.aiFallY + 2);
                ctx.lineTo(state.aiFallX + 10, state.aiFallY + 2);
                
                ctx.moveTo(state.aiFallX - 8, state.aiFallY + 2);
                ctx.lineTo(state.aiFallX - 12, state.aiFallY - 4);
                
                ctx.moveTo(state.aiFallX + 10, state.aiFallY + 2);
                ctx.lineTo(state.aiFallX + 22, state.aiFallY + 2);
            }
            ctx.stroke();
            
            // Bounding box + confidence overlay
            if (state.aiFallState === 'fallen') {
                ctx.strokeStyle = '#e11d48';
                ctx.lineWidth = 1;
                ctx.strokeRect(state.aiFallX - 25, state.aiFallY - 7, 50, 18);
                ctx.fillStyle = '#e11d48';
                ctx.font = 'bold 7px sans-serif';
                ctx.fillText('FALL DETECT (94%)', state.aiFallX - 25, state.aiFallY - 10);
            } else {
                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = 1;
                ctx.strokeRect(state.aiFallX - 14, state.aiFallY - 24, 28, 45);
                ctx.fillStyle = '#10b981';
                ctx.font = '7px sans-serif';
                ctx.fillText('MONITORING (OK)', state.aiFallX - 14, state.aiFallY - 27);
            }
            
            requestAnimationFrame(renderFrame);
        }
        
        renderFrame();
    }
    
    startMobileFallAiSimulator();

    // ==========================================
    // 8. SOS ALARM EMERGENCIES SYSTEM
    // ==========================================
    const elderSosBtn = document.getElementById('elder-sos-btn');
    
    function triggerElderSosCountdown() {
        if (state.sosActive) return;
        state.sosActive = true;
        
        // Modal countdown inside phone screen
        const content = document.createElement('div');
        
        const count = document.createElement('div');
        count.style.fontSize = '4.5rem';
        count.style.fontWeight = '900';
        count.style.color = '#0284c7';
        count.style.margin = '0.5rem 0';
        count.textContent = '3';
        
        const tip = document.createElement('p');
        tip.style.fontSize = '0.8rem';
        tip.style.color = '#ef4444';
        tip.style.fontWeight = 'bold';
        tip.textContent = '三秒内未按取消，将瞬间群发报警并同步定位数据';
        
        content.appendChild(count);
        content.appendChild(tip);
        
        let localCounter = 3;
        const timer = setInterval(() => {
            localCounter--;
            if (localCounter > 0) {
                count.textContent = localCounter.toString();
            } else {
                clearInterval(timer);
                const overlay = document.getElementById('dynamic-mobile-modal');
                if (overlay) overlay.remove();
                triggerCriticalMobileSos();
            }
        }, 1000);
        
        openMobileModal('🚨 紧急求助呼救中', content, null, () => {
            clearInterval(timer);
            state.sosActive = false;
        });
    }

    function triggerCriticalMobileSos() {
        if (document.getElementById('mobile-sos-popup')) return; // Already triggered
        
        state.sosActive = true;
        
        // Build fullscreen popup inside `#mobile-viewport`
        const overlay = document.createElement('div');
        overlay.className = 'mobile-sos-critical-flash';
        overlay.id = 'mobile-sos-popup';
        
        const wrap = document.createElement('div');
        wrap.className = 'mobile-sos-content';
        
        const title = document.createElement('h2');
        title.className = 'mobile-sos-title';
        title.textContent = '🚨 【极其紧急安全告警】 🚨';
        
        const box = document.createElement('div');
        box.className = 'mobile-sos-box';
        
        const p1 = document.createElement('p');
        p1.style.fontWeight = '900';
        p1.style.fontSize = '0.95rem';
        p1.style.marginBottom = '0.35rem';
        p1.textContent = '父亲王大爷突发安全求救警报！';
        
        const p2 = document.createElement('p');
        p2.textContent = '遥测数据：心率突增: 104 BPM | 天津南开鼓楼驿站';
        
        const p3 = document.createElement('p');
        p3.style.color = '#fde68a';
        p3.style.fontWeight = 'bold';
        p3.style.marginTop = '0.35rem';
        p3.textContent = '来源：鼓楼前台智能AI摄像头捕捉老人离地跌倒';
        
        box.appendChild(p1);
        box.appendChild(p2);
        box.appendChild(p3);
        
        const dismiss = document.createElement('button');
        dismiss.className = 'mobile-sos-btn-dismiss';
        dismiss.textContent = '电话核实 / 释放警报锁定';
        
        wrap.appendChild(title);
        wrap.appendChild(box);
        wrap.appendChild(dismiss);
        overlay.appendChild(wrap);
        
        mobileViewport.appendChild(overlay);
        
        // Auto swap role view to Guardian Mode
        switchRole('guardian');
        
        // Auto click tab to AI detects tab
        guardTabBtns[1].click();
        
        dismiss.addEventListener('click', () => {
            overlay.remove();
            
            // CRITICAL BUG RESOLUTION: RESET GLOBAL ANIMATION STATE INSTANTLY
            state.aiFallState = 'walking';
            state.aiFallX = 40;
            state.aiFallY = 80;
            state.aiFallCycle = 1; // offset so it doesn't trigger trip again on frame 0
            
            state.sosActive = false;
            
            // Add custom recovery log entry
            const item = document.createElement('div');
            item.className = 'guard-log-item-card';
            
            const top = document.createElement('div');
            top.className = 'guard-log-top';
            const label = document.createElement('span');
            label.textContent = '✅ AI 跌倒紧急告警手动安全解除';
            const time = document.createElement('span');
            time.className = 'guard-log-time';
            time.textContent = '刚刚';
            top.appendChild(label);
            top.appendChild(time);
            
            const desc = document.createElement('div');
            desc.textContent = '已核实确认王大爷身体无大碍，警报释放。鼓楼驿站已指派理疗大夫就地辅助老年人复位休整。';
            item.appendChild(top);
            item.appendChild(desc);
            
            const alertBox = document.getElementById('guard-alerts-container');
            alertBox.insertBefore(item, alertBox.firstChild);
        });
    }

    elderSosBtn.addEventListener('click', triggerElderSosCountdown);

    const btnSimulateFall = document.getElementById('btn-simulate-fall');
    if (btnSimulateFall) {
        btnSimulateFall.addEventListener('click', () => {
            if (state.aiFallState === 'walking') {
                state.aiFallState = 'falling';
                state.aiFallY = 80;
                
                const item = document.createElement('div');
                item.className = 'guard-log-item-card danger';
                
                const top = document.createElement('div');
                top.className = 'guard-log-top';
                const label = document.createElement('span');
                label.textContent = '🚨 [CCTV 模拟触发] 跌倒姿态AI解算启动';
                const time = document.createElement('span');
                time.className = 'guard-log-time';
                time.textContent = '刚刚';
                top.appendChild(label);
                top.appendChild(time);
                
                const desc = document.createElement('div');
                desc.textContent = '调试终端人工模拟触发跌倒，边缘相机传感器开始深度追踪骨骼关节点，倾斜率超标判定中...';
                item.appendChild(top);
                item.appendChild(desc);
                
                const container = document.getElementById('guard-alerts-container');
                container.insertBefore(item, container.firstChild);
            }
        });
    }

    // ==========================================
    // 9. DIALECT ASSISTANT INTENT PROCESSING
    // ==========================================
    const dialectIntentData = {
        sc: {
            input: '“老子脑壳有点晕，帮我喊个医生...” (四川话)',
            ai: '“收到！已监测到您发生眩晕。AI助手已将您今日的体检指标发送给南开第一社区的网格医生，并同步给您长女微信。”',
            action: () => {
                const item = document.createElement('div');
                item.className = 'guard-log-item-card warning';
                const top = document.createElement('div');
                top.className = 'guard-log-top';
                const label = document.createElement('span');
                label.textContent = '⚠️ 脑部眩晕自诉上报 (方言语音触发)';
                const time = document.createElement('span');
                time.className = 'guard-log-time';
                time.textContent = '刚刚';
                top.appendChild(label);
                top.appendChild(time);
                
                const desc = document.createElement('div');
                desc.textContent = '老人通过口述自陈感到头晕。大数据呼吸/血压管理组已提醒网格大夫做上门复诊预案。';
                item.appendChild(top);
                item.appendChild(desc);
                
                document.getElementById('guard-alerts-container').insertBefore(item, document.getElementById('guard-alerts-container').firstChild);
            }
        },
        gd: {
            input: '“我想食晏昼饭，送个饭黎...” (粤语)',
            ai: '“收到！已成功为您下单【鼓楼驿站智慧饭堂】预定今日低升糖适老低钠午膳套餐，待女儿王小姐授权扣款代付。”',
            action: () => {
                const newOrd = {
                    id: 'ORD-' + Date.now().toString().slice(-4),
                    name: '助老送餐：鼓楼驿站健康三色套餐',
                    desc: '配餐状态：待儿女远程协助代付 | 天津鼓楼食堂保温柜待装车',
                    price: 18.00,
                    status: 'pending',
                    category: '助老送餐'
                };
                state.bookings.unshift(newOrd);
                renderBookingsAndApprovals();
            }
        },
        mn: {
            input: '“我腰骨酸，预订一个按摩...” (闽南语)',
            ai: '“收到！已为您成功预留【天津鼓楼康养中心】今日下午3点红外线腰部关节理疗排班，协助支付账单已发送至长女手机。”',
            action: () => {
                const newOrd = {
                    id: 'ORD-' + Date.now().toString().slice(-4),
                    name: '康复理疗：红外烤灯关节针灸热疗 (60分钟)',
                    desc: '理疗状态：待儿女协助代付 | 鼓楼驿站康复三室档期预留中',
                    price: 120.00,
                    status: 'pending',
                    category: '健康理疗'
                };
                state.bookings.unshift(newOrd);
                renderBookingsAndApprovals();
            }
        }
    };

    const dialectBtns = document.querySelectorAll('.senior-voice-btn');
    dialectBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const voice = btn.getAttribute('data-elder-voice');
            const item = dialectIntentData[voice];
            if (!item) return;
            
            elderVoiceWave.style.display = 'flex';
            elderVoiceTranscript.textContent = item.input;
            elderVoiceResponse.style.display = 'none';
            
            setTimeout(() => {
                elderVoiceWave.style.display = 'none';
                elderVoiceResponse.textContent = item.ai;
                elderVoiceResponse.style.display = 'block';
                
                item.action();
            }, 1200);
        });
    });

    // ==========================================
    // 10. ELDERLY LIFE SERVICE DYNAMIC SHEETS
    // ==========================================
    const serviceCards = document.querySelectorAll('.senior-service-card');
    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            const name = card.querySelector('.senior-service-name').textContent;
            
            const wrap = document.createElement('div');
            
            const p = document.createElement('p');
            p.style.fontSize = '0.85rem';
            p.style.color = 'var(--elder-text-sub)';
            p.style.marginBottom = '0.5rem';
            p.textContent = `您确定要在线预订【${name}】服务吗？资费标准：¥120.00/次。`;
            
            const group = document.createElement('div');
            group.className = 'mobile-input-group';
            
            const label = document.createElement('label');
            label.textContent = '请输入特殊服务需求/身体情况 (选填)：';
            
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'mobile-text-input';
            input.placeholder = '例如：浴室防滑扶手高度、有骨刺关节痛等...';
            
            group.appendChild(label);
            group.appendChild(input);
            wrap.appendChild(p);
            wrap.appendChild(group);
            
            openMobileModal('📅 助老生活服务预订确认', wrap, () => {
                const reqVal = input.value || '无特殊要求';
                const newOrd = {
                    id: 'ORD-' + Date.now().toString().slice(-4),
                    name: `生活上门服务: ${name}`,
                    desc: `服务预约：待子女协助代付 | 附加诉求: ${reqVal}`,
                    price: 120.00,
                    status: 'pending',
                    category: '上门服务'
                };
                
                state.bookings.unshift(newOrd);
                renderBookingsAndApprovals();
                
                const complete = document.createElement('p');
                complete.style.fontSize = '0.9rem';
                complete.textContent = '已将预订代付申请同步呈递至儿女端，付款完成后立即安排师傅上门。';
                openMobileModal('🎉 申请代付已发送', complete, null, false);
            });
        });
    });

    // ==========================================
    // 11. OFFLINE STATION SHOPPING & PICKUP TICKETS
    // ==========================================
    const storeReserveBtns = document.querySelectorAll('.senior-product-btn');
    storeReserveBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const pName = btn.getAttribute('data-reserve-prod');
            const priceVal = parseFloat(btn.getAttribute('data-price'));
            
            const wrap = document.createElement('div');
            const p = document.createElement('p');
            p.style.fontSize = '0.85rem';
            p.style.color = 'var(--elder-text-sub)';
            p.textContent = `您要预约预订线下驿站的【${pName}】吗？支付完成后，可生成数字提货券码在柜台取货。预约代付价格：¥${priceVal.toFixed(2)}。`;
            
            wrap.appendChild(p);
            
            openMobileModal('🛒 线下自提产品预约', wrap, () => {
                const newOrd = {
                    id: 'ORD-' + Date.now().toString().slice(-4),
                    name: `到店自提商品: ${pName}`,
                    desc: `提货说明：代付款项确认通过后，可在此点击直接生成8位安全核销二维码柜台提货自付。`,
                    price: priceVal,
                    status: 'pending',
                    category: '自提商品'
                };
                
                state.bookings.unshift(newOrd);
                renderBookingsAndApprovals();
                
                const complete = document.createElement('p');
                complete.style.fontSize = '0.9rem';
                complete.textContent = '自提预留成功！已将代扣款单据发送给您的女儿。代付同意后，在此点击卡片即可取货！';
                openMobileModal('🎉 驿站商品锁定成功', complete, null, false);
            });
        });
    });

    // Click elderly record cards to fetch pick-up code (if paid)
    elderRecordsContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.senior-record-card');
        if (!card) return;
        
        const titleText = card.querySelector('h4').textContent;
        const ord = state.bookings.find(b => b.name === titleText);
        
        if (ord && ord.status === 'approved') {
            const rand1 = Math.floor(1000 + Math.random() * 9000);
            const rand2 = Math.floor(1000 + Math.random() * 9000);
            const pickupCode = `${rand1}-${rand2}`;
            
            const wrap = document.createElement('div');
            wrap.style.textAlign = 'center';
            
            const p = document.createElement('p');
            p.style.fontSize = '0.8rem';
            p.style.color = 'var(--elder-text-sub)';
            p.textContent = '请将此8位天津康养核销凭证向天津鼓楼智慧驿站前台店员出示核销：';
            
            const box = document.createElement('div');
            box.style.fontSize = '1.75rem';
            box.style.fontWeight = '900';
            box.style.letterSpacing = '3px';
            box.style.color = 'var(--elder-accent)';
            box.style.background = '#fdfaf4';
            box.style.border = '2px dashed var(--elder-accent)';
            box.style.padding = '0.65rem';
            box.style.borderRadius = '14px';
            box.style.margin = '0.75rem 0';
            box.textContent = pickupCode;
            
            const timeTip = document.createElement('p');
            timeTip.style.fontSize = '0.725rem';
            timeTip.style.color = '#e11d48';
            timeTip.style.fontWeight = 'bold';
            timeTip.textContent = '⏱️ 天津南开节点一次性凭据，30分钟内有效';
            
            wrap.appendChild(p);
            wrap.appendChild(box);
            wrap.appendChild(timeTip);
            
            openMobileModal('🎟️ 线下驿站核销取货码', wrap, null, false);
        } else {
            const wrap = document.createElement('p');
            wrap.textContent = '该项目暂未获得子女代付，暂不可生成取货核销凭据。已提醒催款协助付款。';
            openMobileModal('ℹ️ 凭证未生成', wrap, null, false);
        }
    });

    // ==========================================
    // 12. DYNAMIC ANTI-FRAUD QUIZ TEST
    // ==========================================
    const quizOptionBtns = document.querySelectorAll('.senior-quiz-btn');
    quizOptionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const ans = btn.getAttribute('data-ans');
            
            if (ans === 'correct') {
                const wrap = document.createElement('div');
                wrap.style.textAlign = 'center';
                const icon = document.createElement('div');
                icon.style.fontSize = '2.5rem';
                icon.textContent = '🎉';
                const p = document.createElement('p');
                p.style.fontSize = '0.95rem';
                p.style.fontWeight = 'bold';
                p.style.color = '#15803d';
                p.style.marginTop = '0.35rem';
                p.textContent = '回答完全正确！加分10分！';
                
                const text = document.createElement('p');
                text.style.fontSize = '0.75rem';
                text.style.color = 'var(--elder-text-sub)';
                text.style.marginTop = '0.35rem';
                text.textContent = '南开分局防诈专家提示：任何国家行政或社保医疗清算机关，都绝不会通过电话要求转账或“清查安全账户”。王大爷做得对！';
                
                wrap.appendChild(icon);
                wrap.appendChild(p);
                wrap.appendChild(text);
                
                openMobileModal('💚 天津南开派出所防诈专家点评', wrap, null, false);
            } else {
                const wrap = document.createElement('div');
                wrap.style.textAlign = 'center';
                const icon = document.createElement('div');
                icon.style.fontSize = '2.5rem';
                icon.textContent = '🚨';
                const p = document.createElement('p');
                p.style.fontSize = '0.95rem';
                p.style.fontWeight = 'bold';
                p.style.color = '#dc2626';
                p.style.marginTop = '0.35rem';
                p.textContent = '回答错误！危险操作！';
                
                const text = document.createElement('p');
                text.style.fontSize = '0.75rem';
                text.style.color = 'var(--elder-text-sub)';
                text.style.marginTop = '0.35rem';
                text.textContent = '防诈大数据库提示：只要对方电话里提到“医保卡涉案”、“转移到安全监管账户”，都是网络电信诈骗话术，请切莫转账，立即挂断！';
                
                wrap.appendChild(icon);
                wrap.appendChild(p);
                wrap.appendChild(text);
                
                openMobileModal('🔴 紧急防诈提示', wrap, null, false);
            }
        });
    });

    // Populate initial logs in child warnings list
    const initialWarnings = [
        {
            title: '气温突降支气管中等风险预警',
            time: '1小时前',
            desc: '结合天津今日气温骤降，昨夜智能床垫呼吸气流传感器检测到老年人有偶发性呛咳。大数据健康风险模型推演支气管炎中度易感，已温馨提醒老人家理疗添衣喝水。',
            type: 'warning'
        },
        {
            title: '智能手环高频跌倒AI预警挂钩正常',
            time: '今天 08:30',
            desc: '穿戴心率与呼吸血氧遥测传感器通讯握手通过，当前王大爷在南开第一社区内安全电子围栏范围，未测出跌倒剧烈加速度偏移。',
            type: 'normal'
        }
    ];
    
    const alertBox = document.getElementById('guard-alerts-container');
    initialWarnings.forEach(w => {
        const item = document.createElement('div');
        item.className = 'guard-log-item-card ' + w.type;
        
        const top = document.createElement('div');
        top.className = 'guard-log-top';
        const label = document.createElement('span');
        label.textContent = w.title;
        const time = document.createElement('span');
        time.className = 'guard-log-time';
        time.textContent = w.time;
        top.appendChild(label);
        top.appendChild(time);
        
        const desc = document.createElement('div');
        desc.textContent = w.desc;
        
        item.appendChild(top);
        item.appendChild(desc);
        alertBox.appendChild(item);
    });

    // ==========================================
    // 13. CERTIFIED CAREGIVERS / PROVIDERS DIRECTORY (资质核验公示)
    // ==========================================
    const caregivers = [
        { name: '陈阿姨 (54岁)', rating: '⭐ 4.9', tags: ['持健康证', '公安背景筛查通', '12年康复经验'], role: '金牌护工', service: '全屋保洁/防滑排布' },
        { name: '张师傅 (42岁)', rating: '⭐ 4.8', tags: ['资质已审', '红十字急救证', '退役军人'], role: '高级工匠', service: '扶手水电改装/防滑铺设' },
        { name: '李阿姨 (49岁)', rating: '⭐ 5.0', tags: ['慢病膳食证', '健康管理师'], role: '星级营养师', service: '低钠慢病配餐/送饭上门' }
    ];
    
    const providersBox = document.getElementById('elder-providers-container');
    if (providersBox) {
        providersBox.replaceChildren();
        caregivers.forEach(prov => {
            const card = document.createElement('div');
            card.className = 'provider-mini-card';
            
            const left = document.createElement('div');
            left.className = 'provider-left';
            
            const avatar = document.createElement('div');
            avatar.className = 'provider-avatar';
            avatar.textContent = prov.name.includes('陈') ? '👩' : (prov.name.includes('李') ? '👩‍🍳' : '👨');
            
            const info = document.createElement('div');
            info.className = 'provider-info';
            const h4 = document.createElement('h4');
            h4.textContent = `${prov.name} | ${prov.role}`;
            const p = document.createElement('p');
            p.textContent = `专攻: ${prov.service} (${prov.rating})`;
            info.appendChild(h4);
            info.appendChild(p);
            
            left.appendChild(avatar);
            left.appendChild(info);
            
            const badgeGroup = document.createElement('div');
            badgeGroup.className = 'provider-badge-group';
            prov.tags.forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'verified-tag-green';
                tagSpan.textContent = tag;
                badgeGroup.appendChild(tagSpan);
            });
            
            card.appendChild(left);
            card.appendChild(badgeGroup);
            
            // Safe detailed credentials modal display (No XSS injection)
            card.addEventListener('click', () => {
                const wrap = document.createElement('div');
                wrap.style.textAlign = 'left';
                
                const p1 = document.createElement('p');
                p1.style.fontSize = '0.825rem';
                p1.style.color = 'var(--elder-text-sub)';
                p1.style.marginBottom = '0.4rem';
                p1.textContent = `服务商真实姓名：${prov.name.split(' ')[0]} (已通过天津南开居委会公安背景比对审查)。`;
                
                const p2 = document.createElement('p');
                p2.style.fontSize = '0.825rem';
                p2.style.color = 'var(--elder-text-sub)';
                p2.style.marginBottom = '0.4rem';
                p2.textContent = `核验证书：居家养老护理证、红十字初级急救证、天津康养驿站签约合格协议书。`;
                
                const p3 = document.createElement('p');
                p3.style.fontSize = '0.825rem';
                p3.style.color = '#166534';
                p3.style.fontWeight = 'bold';
                p3.textContent = `🛡️ 银发护卫联盟服务信誉担保：已保额赔付最高 100 万元人身险。`;
                
                wrap.appendChild(p1);
                wrap.appendChild(p2);
                wrap.appendChild(p3);
                
                openMobileModal('🌟 服务商资质核验公示', wrap, null, false);
            });
            
            providersBox.appendChild(card);
        });
    }

    // ==========================================
    // 14. SOCIAL COMMUNITIES & RSVP EVENTS
    // ==========================================
    const socialGroups = [
        { name: '♟️ 天津鼓楼老街象棋楚汉争霸群', members: 42, event: '明天 09:00 鼓楼东侧凉亭线下争霸赛', desc: '红黑切磋，天津大爷的快乐棋盘，欢迎新老街坊参战。' },
        { name: '🤸 鼓楼南广场太极拳气功理疗养生队', members: 68, event: '每日 06:30 晨光普照太极早会', desc: '改善颈椎、气血畅通、名师现场带队纠偏。' }
    ];
    
    const socialBox = document.getElementById('elder-social-groups-container');
    if (socialBox) {
        socialBox.replaceChildren();
        socialGroups.forEach(grp => {
            const card = document.createElement('div');
            card.className = 'interest-group-card';
            
            const head = document.createElement('div');
            head.className = 'interest-group-header';
            
            const title = document.createElement('span');
            title.className = 'interest-group-title';
            title.textContent = grp.name;
            
            const stats = document.createElement('span');
            stats.className = 'interest-group-stats';
            stats.textContent = `${grp.members} 位街坊`;
            
            head.appendChild(title);
            head.appendChild(stats);
            
            const desc = document.createElement('p');
            desc.className = 'interest-group-desc';
            desc.textContent = grp.desc;
            
            const footer = document.createElement('div');
            footer.className = 'interest-group-footer';
            
            const evText = document.createElement('span');
            evText.className = 'interest-group-event';
            evText.textContent = `📅 ${grp.event}`;
            
            const btn = document.createElement('button');
            btn.className = 'join-group-btn';
            btn.textContent = '加入老友群';
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const wrap = document.createElement('p');
                wrap.textContent = `恭喜！您已成功加入【${grp.name}】兴趣老友微信同步网格群，明日活动时间将自动发送定位提醒至您和儿女端。`;
                openMobileModal('🎉 成功加入群聊', wrap, null, false);
            });
            
            footer.appendChild(evText);
            footer.appendChild(btn);
            
            card.appendChild(head);
            card.appendChild(desc);
            card.appendChild(footer);
            
            socialBox.appendChild(card);
        });
    }

    const btnToggleQuiz = document.getElementById('btn-toggle-quiz');
    const btnToggleSocial = document.getElementById('btn-toggle-social');
    const quizSection = document.getElementById('social-quiz-section');
    const socialSection = document.getElementById('social-community-section');
    
    if (btnToggleQuiz && btnToggleSocial && quizSection && socialSection) {
        btnToggleQuiz.addEventListener('click', () => {
            btnToggleQuiz.classList.add('active');
            btnToggleSocial.classList.remove('active');
            quizSection.style.display = 'flex';
            socialSection.style.display = 'none';
        });
        btnToggleSocial.addEventListener('click', () => {
            btnToggleSocial.classList.add('active');
            btnToggleQuiz.classList.remove('active');
            quizSection.style.display = 'none';
            socialSection.style.display = 'flex';
        });
    }

    // ==========================================
    // 15. COHESIVE E-COMMERCE CART SHOPPING & CHECKOUT
    // ==========================================
    const floatingCart = document.getElementById('floating-cart');
    const cartDrawer = document.getElementById('cart-drawer');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const cartCheckoutBtn = document.getElementById('cart-checkout-btn');
    const cartBadgeCount = document.getElementById('cart-badge-count');
    
    if (floatingCart) {
        floatingCart.addEventListener('click', () => {
            if (cartDrawer) cartDrawer.classList.add('open');
        });
    }
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            if (cartDrawer) cartDrawer.classList.remove('open');
        });
    }
    
    function updateCartUI() {
        if (!cartItemsContainer || !cartTotalPrice || !cartBadgeCount) return;
        cartItemsContainer.replaceChildren();
        
        let total = 0;
        state.cart.forEach((item, index) => {
            total += item.price;
            
            const row = document.createElement('div');
            row.className = 'cart-item-row';
            
            const label = document.createElement('span');
            label.textContent = item.name;
            
            const right = document.createElement('div');
            right.style.display = 'flex';
            right.style.gap = '0.5rem';
            right.style.alignItems = 'center';
            
            const price = document.createElement('span');
            price.style.fontWeight = '800';
            price.style.color = '#e11d48';
            price.textContent = `¥${item.price.toFixed(2)}`;
            
            const del = document.createElement('span');
            del.className = 'cart-item-delete';
            del.textContent = '✕';
            del.addEventListener('click', () => {
                state.cart.splice(index, 1);
                updateCartUI();
            });
            
            right.appendChild(price);
            right.appendChild(del);
            
            row.appendChild(label);
            row.appendChild(right);
            
            cartItemsContainer.appendChild(row);
        });
        
        cartTotalPrice.textContent = `¥${total.toFixed(2)}`;
        cartBadgeCount.textContent = state.cart.length.toString();
    }
    
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const name = btn.getAttribute('data-prod-name');
            const price = parseFloat(btn.getAttribute('data-prod-price'));
            
            state.cart.push({ name, price });
            updateCartUI();
            
            const complete = document.createElement('p');
            complete.style.fontSize = '0.85rem';
            complete.textContent = `已成功将【${name}】加入购物车！可以点击右下角购物车图标结算。`;
            openMobileModal('🛒 商品已入购物车', complete, null, false);
        });
    });
    
    if (cartCheckoutBtn) {
        cartCheckoutBtn.addEventListener('click', () => {
            if (state.cart.length === 0) {
                const p = document.createElement('p');
                p.textContent = '您的购物车是空的，请加入产品后再去结算哦！';
                openMobileModal('ℹ️ 购物车为空', p, null, false);
                return;
            }
            
            const deliveryVal = document.querySelector('input[name="cart-delivery"]:checked')?.value || 'station';
            const deliveryLabel = deliveryVal === 'station' ? '线下康养驿站自提' : '送货上门安全签收';
            
            state.cart.forEach(item => {
                const newOrd = {
                    id: 'ORD-' + Date.now().toString().slice(-4) + '-' + Math.floor(Math.random()*10),
                    name: `${deliveryVal === 'station' ? '到店自提' : '送货上门'}: ${item.name}`,
                    desc: `结算说明：待儿女确认代付 | 提货/配送方式：${deliveryLabel} | 天津鼓楼康养区`,
                    price: item.price,
                    status: 'pending',
                    category: '辅助器械'
                };
                state.bookings.unshift(newOrd);
            });
            
            state.cart = [];
            updateCartUI();
            
            if (cartDrawer) cartDrawer.classList.remove('open');
            renderBookingsAndApprovals();
            
            const complete = document.createElement('p');
            complete.style.fontSize = '0.9rem';
            complete.textContent = `已将购物结算项全部合并发送至您儿女的审批代付端。付款完成后，可在“预约记录”中生成取货或物流签收凭证！`;
            openMobileModal('🎉 购物车结算申请已发送', complete, null, false);
        });
    }

    // ==========================================
    // 16. CLINIC MEDICAL CONSULTATIONS & CHAT
    // ==========================================
    const doctorChatInput = document.getElementById('doctor-chat-input');
    const doctorChatSendBtn = document.getElementById('doctor-chat-send-btn');
    const doctorChatFeed = document.getElementById('doctor-chat-feed');
    
    const medicalResponses = {
        '胸闷': '“大爷，出现胸闷气短，请您立即就地坐下休息，千万不要剧烈运动！AI手环已监测到您此时心率为78次/分，目前平稳。我已经同步发出了网格巡诊通知。如果感到憋气伴随前胸绞痛，请立即服用速效救心丸，或双击红色SOS按钮！”',
        '腰疼': '“李大夫收到。老年人腰椎退行性变及老寒腿风湿多见。建议下午3点到天津鼓楼康复大厅做60分钟红外烤灯与关节灸疗。已为您申请适老辅助服务，待儿女代付后即可安排金牌护工张师傅上门协助。”',
        '头晕': '“大爷，手环显示您当前血压正常。但方言检测判定您自诉‘脑壳晕’。为了安全起见，请千万别起身过猛，先静坐5分钟。我已联络鼓楼医疗服务组做上门巡诊预案，并提醒了您的女儿。”',
        '默认': '“李大夫已收到您的健康咨询。大数据健康算法结合您手环 the 实时体征分析，您当前状态平稳。若您觉得骨关节酸痛、失眠或者有感冒咳嗽，建议多喝温开水，或者点击‘助老服务’预约康复网格大夫做面对面查体。”'
    };
    
    function appendChatBubble(text, isDoctor) {
        if (!doctorChatFeed) return;
        const bub = document.createElement('div');
        bub.className = 'chat-bubble ' + (isDoctor ? 'doctor' : 'patient');
        bub.textContent = text;
        doctorChatFeed.appendChild(bub);
        doctorChatFeed.scrollTop = doctorChatFeed.scrollHeight;
    }
    
    if (doctorChatSendBtn && doctorChatInput) {
        doctorChatSendBtn.addEventListener('click', () => {
            const text = doctorChatInput.value.trim();
            if (!text) return;
            
            appendChatBubble(text, false);
            doctorChatInput.value = '';
            
            setTimeout(() => {
                let reply = medicalResponses['默认'];
                if (text.includes('胸闷') || text.includes('胸痛') || text.includes('心慌')) {
                    reply = medicalResponses['胸闷'];
                    
                    // Sync a critical warn log to Child Alerts feed
                    const item = document.createElement('div');
                    item.className = 'guard-log-item-card danger';
                    const top = document.createElement('div');
                    top.className = 'guard-log-top';
                    const label = document.createElement('span');
                    label.textContent = '🚨 [医疗端急症警报] 王大爷自述胸闷心慌';
                    const time = document.createElement('span');
                    time.className = 'guard-log-time';
                    time.textContent = '刚刚';
                    top.appendChild(label);
                    top.appendChild(time);
                    const desc = document.createElement('div');
                    desc.textContent = '老人在在线问诊板块输入“胸闷”自诉。家庭保健医生已发出安全指导，社区网格李师傅已调遣便携式心电仪上门协助监护。';
                    item.appendChild(top);
                    item.appendChild(desc);
                    
                    const alertBoxBox = document.getElementById('guard-alerts-container');
                    if (alertBoxBox) alertBoxBox.insertBefore(item, alertBoxBox.firstChild);
                } else if (text.includes('腰') || text.includes('背') || text.includes('关节')) {
                    reply = medicalResponses['腰疼'];
                } else if (text.includes('晕') || text.includes('昏')) {
                    reply = medicalResponses['头晕'];
                }
                
                appendChatBubble(reply, true);
            }, 800);
        });
        
        doctorChatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') doctorChatSendBtn.click();
        });
    }

    // ==========================================
    // 17. PEER VIDEO/AUDIO CRYPTO CALLING OVERLAYS
    // ==========================================
    const btnTriggerPeerCall = document.getElementById('btn-trigger-peer-call');
    const videoCallOverlay = document.getElementById('video-call-overlay');
    const callTimerLabel = document.getElementById('call-timer-label');
    const callStatusLabel = document.getElementById('call-status-label');
    const callMuteToggle = document.getElementById('call-mute-toggle');
    const callHangupBtn = document.getElementById('call-hangup-btn');
    const callAvatarLabel = document.getElementById('call-avatar-label');
    
    if (btnTriggerPeerCall && videoCallOverlay) {
        btnTriggerPeerCall.addEventListener('click', () => {
            videoCallOverlay.style.display = 'flex';
            callAvatarLabel.textContent = '👩‍🦰';
            document.getElementById('call-user-name').textContent = '长女王小姐';
            callStatusLabel.textContent = '正在发起高安全长通道呼叫...';
            callTimerLabel.style.display = 'none';
            state.callActive = true;
            state.callSeconds = 0;
            
            state.callTimerId = setTimeout(() => {
                callStatusLabel.textContent = '双端高安全加密连线就绪';
                callTimerLabel.style.display = 'block';
                
                state.callTimerId = setInterval(() => {
                    state.callSeconds++;
                    const mm = Math.floor(state.callSeconds / 60).toString().padStart(2, '0');
                    const ss = (state.callSeconds % 60).toString().padStart(2, '0');
                    callTimerLabel.textContent = `${mm}:${ss}`;
                }, 1000);
            }, 2200);
        });
    }
    
    const parentMapMarker = document.getElementById('guard-parent-map-marker');
    if (parentMapMarker) {
        parentMapMarker.addEventListener('click', () => {
            if (!videoCallOverlay) return;
            videoCallOverlay.style.display = 'flex';
            callAvatarLabel.textContent = '👴';
            document.getElementById('call-user-name').textContent = '父亲王大爷';
            callStatusLabel.textContent = '正在穿透局域电子围栏呼叫父亲...';
            callTimerLabel.style.display = 'none';
            state.callActive = true;
            state.callSeconds = 0;
            
            state.callTimerId = setTimeout(() => {
                callStatusLabel.textContent = '5G安全基站高保真低延迟连线中';
                callTimerLabel.style.display = 'block';
                
                state.callTimerId = setInterval(() => {
                    state.callSeconds++;
                    const mm = Math.floor(state.callSeconds / 60).toString().padStart(2, '0');
                    const ss = (state.callSeconds % 60).toString().padStart(2, '0');
                    callTimerLabel.textContent = `${mm}:${ss}`;
                }, 1000);
            }, 2200);
        });
    }
    
    if (callHangupBtn) {
        callHangupBtn.addEventListener('click', () => {
            clearTimeout(state.callTimerId);
            clearInterval(state.callTimerId);
            state.callActive = false;
            if (videoCallOverlay) videoCallOverlay.style.display = 'none';
        });
    }
    
    if (callMuteToggle) {
        callMuteToggle.addEventListener('click', () => {
            state.isCallMuted = !state.isCallMuted;
            callMuteToggle.textContent = state.isCallMuted ? '🔇' : '🎤';
            callMuteToggle.style.background = state.isCallMuted ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.1)';
        });
    }

    // ==========================================
    // 18. LOCALIZED AD CTR STATISTICS MONITORING
    // ==========================================
    const adBanners = document.querySelectorAll('.elderly-ad-banner');
    const adImpressionsLabel = document.getElementById('ad-impressions-val');
    const adClicksLabel = document.getElementById('ad-clicks-val');
    const adCtrLabel = document.getElementById('ad-ctr-val');
    
    adBanners.forEach(ad => {
        ad.addEventListener('click', () => {
            state.adClicks++;
            state.adImpressions += Math.floor(Math.random() * 3 + 1);
            
            if (adImpressionsLabel) adImpressionsLabel.textContent = `${state.adImpressions.toLocaleString()} 次`;
            if (adClicksLabel) adClicksLabel.textContent = `${state.adClicks.toString()} 次`;
            
            const ctr = (state.adClicks / state.adImpressions * 100).toFixed(2);
            if (adCtrLabel) adCtrLabel.textContent = `${ctr}%`;
            
            const adId = ad.getAttribute('data-ad-id');
            const wrap = document.createElement('div');
            wrap.style.textAlign = 'left';
            
            const p1 = document.createElement('p');
            p1.style.fontSize = '0.85rem';
            p1.style.fontWeight = 'bold';
            p1.style.color = 'var(--color-blue-dark)';
            
            if (adId === 'ad_physio') {
                p1.textContent = '【天津中医药大学适老特约中医理疗活动】';
                const p2 = document.createElement('p');
                p2.textContent = '已成功为您申领天津鼓楼老街中医馆现场义诊体验凭证！您可以凭此卡前往驿站前台享受关节脉冲烤灯热疗等服务，已温馨同步提醒儿女。';
                wrap.appendChild(p1); wrap.appendChild(p2);
            } else if (adId === 'ad_diet') {
                p1.textContent = '【适老康膳大厅 - 银发专属长寿膳食配餐优惠】';
                const p2 = document.createElement('p');
                p2.textContent = '已为您成功锁定第一期低升糖低钠营养午餐8折订餐专享券！家庭保健医生已确认该套餐完全契合您的血压与日常养生标准。';
                wrap.appendChild(p1); wrap.appendChild(p2);
            } else if (adId === 'ad_mobility') {
                p1.textContent = '【超轻碳纤维适老助步拐杖/轮椅金牌租赁服务】';
                const p2 = document.createElement('p');
                p2.textContent = '已成功预留免押金提货试戴名额。前台师傅会为您精准根据身高调整助步高度，并加装超强防滑避震脚垫。';
                wrap.appendChild(p1); wrap.appendChild(p2);
            } else {
                p1.textContent = '【人民财险天津分公司专属银发安心保意外保障】';
                const p2 = document.createElement('p');
                p2.textContent = '已为您对接专业意外理赔核算专属客服。保障范围广、赔付快、费率超低，为您和家人撑起安全保护伞。申请已送呈儿女签名。';
                wrap.appendChild(p1); wrap.appendChild(p2);
            }
            
            openMobileModal('🎁 专属适老福利登记成功', wrap, null, false);
        });
    });

    // ==========================================
    // 19. HIGH-END WEEKLY HEALTH REPORT GENERATOR
    // ==========================================
    const btnGenerateReport = document.getElementById('btn-generate-report');
    const weeklyReportContainer = document.getElementById('weekly-report-container');
    
    if (btnGenerateReport && weeklyReportContainer) {
        btnGenerateReport.addEventListener('click', () => {
            const avgHR = Math.floor(72 + Math.random() * 8);
            const sysBP = Math.floor(122 + Math.random() * 8);
            const diaBP = Math.floor(78 + Math.random() * 6);
            const sleepHrs = (7.2 + Math.random() * 0.8).toFixed(1);
            const deepSleepPercent = Math.floor(22 + Math.random()*6);
            
            weeklyReportContainer.replaceChildren();
            weeklyReportContainer.style.display = 'block';
            
            const card = document.createElement('div');
            card.className = 'report-sheet-card';
            
            const title = document.createElement('div');
            title.className = 'report-headline';
            title.textContent = '📊 王大爷 (82岁) 周度脱敏健康评估报告';
            
            const sub = document.createElement('div');
            sub.style.fontSize = '0.625rem';
            sub.style.color = 'var(--guard-text-sub)';
            sub.style.marginBottom = '0.5rem';
            sub.textContent = '数据源: 智能睡眠床垫 + 心率遥测手环 | 天津鼓楼康养节点数据中心解算';
            
            const r1 = document.createElement('div');
            r1.className = 'report-metric-row';
            const l1 = document.createElement('span'); l1.textContent = '心率流式遥测均值 (Avg HR):';
            const v1 = document.createElement('span'); v1.className = 'metric-val'; v1.textContent = `${avgHR} BPM (平稳)`;
            r1.appendChild(l1); r1.appendChild(v1);
            
            const r2 = document.createElement('div');
            r2.className = 'report-metric-row';
            const l2 = document.createElement('span'); l2.textContent = '平均收缩期/舒张期血压 (BP):';
            const v2 = document.createElement('span'); v2.className = 'metric-val'; v2.textContent = `${sysBP}/${diaBP} mmHg`;
            r2.appendChild(l2); r2.appendChild(v2);
            
            const r3 = document.createElement('div');
            r3.className = 'report-metric-row';
            const l3 = document.createElement('span'); l3.textContent = '睡眠综合监测时长 (Avg Sleep):';
            const v3 = document.createElement('span'); v3.className = 'metric-val'; v3.textContent = `${sleepHrs} 小时 (深睡 ${deepSleepPercent}%)`;
            r3.appendChild(l3); r3.appendChild(v3);
            
            const r4 = document.createElement('div');
            r4.className = 'report-metric-row';
            const l4 = document.createElement('span'); l4.textContent = '呼吸暂停与气管易感判定:';
            const v4 = document.createElement('span'); v4.className = 'metric-val'; v4.style.color = '#e11d48'; v4.textContent = `偶发呛咳 (建议做红外胸部理疗)`;
            r4.appendChild(l4); r4.appendChild(v4);
            
            const footerDoc = document.createElement('div');
            footerDoc.style.fontSize = '0.65rem';
            footerDoc.style.color = '#34d399';
            footerDoc.style.fontWeight = 'bold';
            footerDoc.style.marginTop = '0.5rem';
            footerDoc.style.borderTop = '1px solid var(--guard-border)';
            footerDoc.style.paddingTop = '0.4rem';
            footerDoc.textContent = '🟢 AI 大数据建议：大爷当前心脏及负荷状态指标正常。今日多云风大，出门请戴口罩并穿马甲，谨防冷空气诱发气管病变。';
            
            card.appendChild(title);
            card.appendChild(sub);
            card.appendChild(r1);
            card.appendChild(r2);
            card.appendChild(r3);
            card.appendChild(r4);
            card.appendChild(footerDoc);
            
            weeklyReportContainer.appendChild(card);
            
            weeklyReportContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
        });
    }

    // ==========================================
    // 20. THIRD-PARTY OPERATORS & GREEN API CHANNEL
    // ==========================================
    const partnerApiList = document.getElementById('partner-api-list');
    const btnPartnerApiSync = document.getElementById('btn-partner-api-sync');
    
    function renderPartnerAPIs() {
        if (!partnerApiList) return;
        partnerApiList.replaceChildren();
        
        state.partnerApis.forEach(api => {
            const row = document.createElement('div');
            row.className = 'partner-endpoint-row';
            
            const left = document.createElement('div');
            left.style.display = 'flex';
            left.style.flexDirection = 'column';
            left.style.textAlign = 'left';
            
            const name = document.createElement('span');
            name.style.fontWeight = '800';
            name.style.color = '#ffffff';
            name.textContent = api.name;
            
            const url = document.createElement('span');
            url.style.fontSize = '0.6rem';
            url.style.color = 'var(--guard-text-sub)';
            url.textContent = api.endpoint;
            
            left.appendChild(name);
            left.appendChild(url);
            
            const badge = document.createElement('span');
            badge.className = 'api-status-badge ' + api.status;
            badge.textContent = api.status === 'synced' ? `已同步 (${api.responseTime})` : '正在同步数据...';
            
            row.appendChild(left);
            row.appendChild(badge);
            partnerApiList.appendChild(row);
        });
    }
    
    if (btnPartnerApiSync) {
        btnPartnerApiSync.addEventListener('click', () => {
            state.partnerApis.forEach(api => {
                api.status = 'loading';
            });
            renderPartnerAPIs();
            
            state.partnerApis.forEach((api, idx) => {
                setTimeout(() => {
                    api.status = 'synced';
                    api.responseTime = `${Math.floor(10 + Math.random()*50)}ms`;
                    renderPartnerAPIs();
                }, 600 + idx*400);
            });
        });
    }
    
    renderPartnerAPIs();

});
