document.addEventListener('DOMContentLoaded', () => {

    /* ── 1. Nav scroll class ── */
    const nav = document.getElementById('nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 60);
        }, { passive: true });
    }

    /* ── 2. Hamburger menu ── */
    const hamburger  = document.getElementById('navHamburger');
    const mobileMenu = document.getElementById('navMobile');
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            mobileMenu.classList.toggle('open');
        });
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('open');
                mobileMenu.classList.remove('open');
            });
        });
    }

    /* ── 3. Scroll reveal (with stagger for grids) ── */
    document.querySelectorAll('.features-grid, .steps-grid').forEach(grid => {
        grid.querySelectorAll('.reveal').forEach((el, i) => {
            el.dataset.delay = i * 90;
        });
    });

    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const delay = parseInt(entry.target.dataset.delay || 0);
            setTimeout(() => entry.target.classList.add('visible'), delay);
            revealObs.unobserve(entry.target);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => revealObs.observe(el));

    /* ── 4. Stats counter animation ── */
    const statsObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el     = entry.target;
            const target = parseInt(el.dataset.count);
            const suffix = el.dataset.suffix || '+';
            if (!target) return;
            let current = 0;
            const increment = Math.ceil(target / 55);
            const tick = setInterval(() => {
                current = Math.min(current + increment, target);
                el.textContent = current + suffix;
                if (current >= target) clearInterval(tick);
            }, 28);
            statsObs.unobserve(el);
        });
    }, { threshold: 0.6 });

    document.querySelectorAll('.stat-num[data-count]').forEach(el => statsObs.observe(el));

    /* ── 5. Chat simulator ── */
    const chatContainer = document.getElementById('chatMessages');
    if (chatContainer) {
        const originalMsgs = Array.from(chatContainer.querySelectorAll('.msg'));
        chatContainer.innerHTML = '';

        const injectTypingStyles = () => {
            if (document.getElementById('typing-style')) return;
            const s = document.createElement('style');
            s.id = 'typing-style';
            s.textContent = `
                .typing-bubble {
                    display: inline-flex; align-items: center; gap: 4px;
                    padding: 10px 14px !important; width: 56px;
                    background: rgba(37,211,102,.1);
                    border: 1px solid rgba(37,211,102,.15);
                    border-radius: 16px; border-bottom-left-radius: 4px;
                    align-self: flex-start;
                    opacity: 0; transform: translateY(10px);
                    transition: opacity .4s ease, transform .4s ease;
                }
                .typing-bubble.visible { opacity: 1; transform: translateY(0); }
                .typing-bubble span {
                    width: 6px; height: 6px; border-radius: 50%;
                    background: #25D366;
                    animation: tDot 1.4s infinite ease-in-out both;
                }
                .typing-bubble span:nth-child(1) { animation-delay: -.32s; }
                .typing-bubble span:nth-child(2) { animation-delay: -.16s; }
                @keyframes tDot {
                    0%,80%,100% { transform: scale(.35); opacity: .4; }
                    40%         { transform: scale(1);    opacity: 1;  }
                }
            `;
            document.head.appendChild(s);
        };

        const wait = ms => new Promise(r => setTimeout(r, ms));

        const runChat = async () => {
            injectTypingStyles();
            await wait(1200);

            for (const source of originalMsgs) {
                const isIn = source.classList.contains('msg-in');

                if (isIn) {
                    const typing = document.createElement('div');
                    typing.className = 'typing-bubble';
                    typing.innerHTML = '<span></span><span></span><span></span>';
                    chatContainer.appendChild(typing);
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                    requestAnimationFrame(() => requestAnimationFrame(() => typing.classList.add('visible')));
                    await wait(1500);
                    typing.remove();
                } else {
                    await wait(700);
                }

                const msg = document.createElement('div');
                msg.className = source.className;
                msg.textContent = source.textContent;
                chatContainer.appendChild(msg);
                chatContainer.scrollTop = chatContainer.scrollHeight;
                requestAnimationFrame(() => requestAnimationFrame(() => msg.classList.add('visible')));
                await wait(950);
            }
        };

        const heroObs = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                runChat();
                heroObs.disconnect();
            }
        }, { threshold: 0.1 });

        const hero = document.querySelector('.hero');
        if (hero) heroObs.observe(hero);
        else runChat();
    }

    /* ── 6. Feature card 3D tilt ── */
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width  - 0.5;
            const y = (e.clientY - r.top)  / r.height - 0.5;
            card.style.transform = `perspective(900px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg) translateY(-6px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    /* ── 7. Smooth scroll with nav offset ── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const id = anchor.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const offset = (nav ? nav.offsetHeight : 80) + 20;
            window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
        });
    });

});
