const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navbarLinks = document.querySelectorAll('.nav-link');
const scrollIndicator = document.getElementById('scroll-indicator');
const localTime = document.getElementById('local-time');
const localDate = document.getElementById('local-date');
const pullCord = document.getElementById('pull-cord');
const aboutSection = document.getElementById('about');
const timelineEntries = [...document.querySelectorAll('.timeline-entry')];
const storyYear = document.getElementById('story-year');
const storyCurrentDate = document.getElementById('story-current-date');
const storyCurrentIndex = document.getElementById('story-current-index');
const storyProgressFill = document.getElementById('story-progress-fill');

function closeMenu() {
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
}

function activateDoor(button) {
    const content = doorContent[button.dataset.door];
    if (!content) return;

    selectedDoor = button;
    doorButtons.forEach(door => {
        const isSelected = door === button;
        door.classList.toggle('active', isSelected);
        door.setAttribute('aria-pressed', String(isSelected));
    });
    doorNumber.textContent = content.number;
    doorTitle.textContent = content.title;
    doorDescription.textContent = content.description;
    doorPoints.replaceChildren(...content.points.map(point => {
        const element = document.createElement('li');
        element.textContent = point;
        return element;
    }));
    roomKicker.textContent = `${content.number} · PROJECT ROOM`;
    roomTitle.textContent = content.roomTitle;
    roomDescription.textContent = content.roomDescription;
}

async function openDoor(button, scrollToDoor = false) {
    if (roomIsOpening || !doorRoom.hidden) return;
    activateDoor(button);
    roomIsOpening = true;
    button.classList.add('is-opening');
    button.disabled = true;

    if (scrollToDoor) {
        button.scrollIntoView({
            behavior: reduceMotion.matches ? 'auto' : 'smooth',
            block: 'center',
        });
    }

    await new Promise(resolve => {
        window.setTimeout(resolve, reduceMotion.matches ? 0 : scrollToDoor ? 650 : 420);
    });

    roomProjects.replaceChildren(...projectCards.map(card => card.cloneNode(true)));
    doorRoom.hidden = false;
    doorRoom.setAttribute('aria-hidden', 'false');
    doorRoom.scrollTop = 0;
    roomBack.hidden = false;
    document.body.classList.add('is-door-room-open');
    window.requestAnimationFrame(() => {
        doorRoom.classList.add('is-open');
        roomTitle.focus({ preventScroll: true });
    });
    button.classList.remove('is-opening');
    button.disabled = false;
    roomIsOpening = false;
}

function closeDoorRoom() {
    if (doorRoom.hidden) return;
    doorRoom.classList.remove('is-open');
    doorRoom.setAttribute('aria-hidden', 'true');
    roomBack.hidden = true;
    document.body.classList.remove('is-door-room-open');
    window.setTimeout(() => {
        doorRoom.hidden = true;
        roomProjects.replaceChildren();
        selectedDoor?.focus();
    }, reduceMotion.matches ? 0 : 350);
}

navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navMenu.classList.toggle('active', !isOpen);
    navToggle.classList.toggle('active', !isOpen);
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
});

function updateLocalTime() {
    const now = new Date();
    localTime.textContent = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: '2-digit',
    }).format(now);
    localDate.textContent = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(now);
}

function updateScrollState() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
    scrollIndicator.style.setProperty('--scroll-width', `${scrollPercent}%`);

    const currentSection = [...document.querySelectorAll('section[id]')]
        .filter(section => section.getBoundingClientRect().top <= 160)
        .pop();

    navbarLinks.forEach(link => {
        const target = document.querySelector(link.getAttribute('href'));
        const isCurrent = currentSection && target && (
            target === currentSection ||
            (target.closest('section') === currentSection && target.classList.contains('skill-door') && target.classList.contains('active'))
        );
        link.classList.toggle('active', Boolean(isCurrent));
    });

    updateStoryTimeline();
}

function interpolateColor(start, end, amount) {
    const color = start.map((channel, index) => Math.round(channel + (end[index] - channel) * amount));
    return `rgb(${color.join(' ')})`;
}

function updateStoryTimeline() {
    if (!aboutSection || timelineEntries.length === 0) return;

    const sectionRect = aboutSection.getBoundingClientRect();
    if (sectionRect.bottom <= 0 || sectionRect.top >= window.innerHeight) return;

    const sectionScrollableDistance = Math.max(1, sectionRect.height - window.innerHeight);
    const sectionProgress = Math.min(1, Math.max(0, -sectionRect.top / sectionScrollableDistance));
    const viewportAnchor = window.innerHeight * 0.48;
    let activeIndex = 0;

    timelineEntries.forEach((entry, index) => {
        if (entry.getBoundingClientRect().top <= viewportAnchor) activeIndex = index;
    });

    const activeEntry = timelineEntries[activeIndex];
    const date = activeEntry.querySelector('.timeline-date').textContent.trim();
    const yearMatch = date.match(/\b(?:19|20)\d{2}\b/);
    storyYear.textContent = yearMatch ? yearMatch[0] : date;
    storyCurrentDate.textContent = date;
    storyCurrentIndex.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(timelineEntries.length).padStart(2, '0')}`;
    storyProgressFill.style.transform = `scaleX(${(activeIndex + 1) / timelineEntries.length})`;

    timelineEntries.forEach((entry, index) => {
        const isActive = index === activeIndex;
        entry.classList.toggle('active', isActive);
        if (isActive) entry.setAttribute('aria-current', 'true');
        else entry.removeAttribute('aria-current');
    });

    const colors = [
        { primary: [244, 166, 119], secondary: [176, 202, 232] },
        { primary: [220, 164, 202], secondary: [243, 190, 143] },
        { primary: [239, 177, 130], secondary: [187, 199, 231] },
    ];
    const colorPosition = sectionProgress * (colors.length - 1);
    const colorIndex = Math.min(colors.length - 2, Math.floor(colorPosition));
    const colorBlend = colorPosition - colorIndex;
    const primary = interpolateColor(colors[colorIndex].primary, colors[colorIndex + 1].primary, colorBlend);
    const secondary = interpolateColor(colors[colorIndex].secondary, colors[colorIndex + 1].secondary, colorBlend);

    aboutSection.style.setProperty('--story-glow-primary', primary);
    aboutSection.style.setProperty('--story-glow-secondary', secondary);
    aboutSection.style.setProperty('--story-circle-scale', (1 + sectionProgress * 0.62).toFixed(3));
    aboutSection.style.setProperty('--story-clock-rotation', `${(sectionProgress * 360).toFixed(1)}deg`);
    aboutSection.style.setProperty('--story-clock-hour', `${(sectionProgress * 180).toFixed(1)}deg`);
    aboutSection.style.setProperty('--story-clock-minute', `${(sectionProgress * 720).toFixed(1)}deg`);
    aboutSection.style.setProperty('--story-progress', sectionProgress.toFixed(3));
}

window.addEventListener('scroll', updateScrollState, { passive: true });
window.addEventListener('resize', updateScrollState);
updateScrollState();
updateLocalTime();
window.setInterval(updateLocalTime, 60_000);

const doorContent = {
    web: {
        number: '01 / 04',
        title: 'Web development',
        description: 'Responsive, full-stack experiences built from the first component to the final API call.',
        points: ['Discovery & planning', 'UX & visual design', 'Front-end & back-end development', 'Technical SEO & performance', 'Analytics, launch & ongoing support'],
        roomTitle: 'Web Development',
        roomDescription: 'Responsive websites and web apps, shaped from the first sketch to the final interaction.',
    },
    app: {
        number: '02 / 04',
        title: 'App development',
        description: 'Useful digital products with clean interfaces, thoughtful flows, and reliable functionality.',
        points: ['Product flows & interaction design', 'Cross-device responsive interfaces', 'Full-stack application development', 'Real-time features & integrations', 'Testing, refinement & launch'],
        roomTitle: 'App Development',
        roomDescription: 'Useful digital products with clean interfaces, thoughtful flows, and dependable functionality.',
    },
    ai: {
        number: '03 / 04',
        title: 'AI & data',
        description: 'Practical AI features that connect language models, search, and real-world product needs.',
        points: ['Problem discovery & data planning', 'AI-assisted product experiences', 'Retrieval-augmented generation', 'Model and API integrations', 'Evaluation & iteration'],
        roomTitle: 'AI & Data',
        roomDescription: 'Practical AI features that connect language models, search, and real-world product needs.',
    },
    design: {
        number: '04 / 04',
        title: 'Design & detail',
        description: 'Clear visual systems and intuitive interactions, shaped with care from screen to screen.',
        points: ['Visual direction & wireframes', 'Accessible interface systems', 'Responsive design details', 'Interaction & motion design', 'Polish across every screen'],
        roomTitle: 'Design & Detail',
        roomDescription: 'Visual systems and intuitive interactions, brought to life with care across every screen.',
    },
};

const doorButtons = document.querySelectorAll('.skill-door');
const doorNumber = document.getElementById('door-number');
const doorTitle = document.getElementById('door-title');
const doorDescription = document.getElementById('door-description');
const doorPoints = document.getElementById('door-points');
const doorRoom = document.getElementById('door-room');
const roomKicker = document.getElementById('room-kicker');
const roomTitle = document.getElementById('room-title');
const roomDescription = document.getElementById('room-description');
const roomProjects = document.getElementById('door-room-projects');
const roomBack = document.getElementById('door-room-back');
const doorEnterButton = document.getElementById('door-enter-button');
const projectCards = [...document.querySelector('#project-cards-template').content.querySelectorAll('.project-card')];
let selectedDoor = doorButtons[0];
let roomIsOpening = false;

doorButtons.forEach(button => {
    button.addEventListener('pointerenter', () => {
        if (!roomIsOpening) activateDoor(button);
    });
    button.addEventListener('focus', () => activateDoor(button));
    button.addEventListener('click', () => openDoor(button));
});

doorEnterButton.addEventListener('click', () => openDoor(selectedDoor));
roomBack.addEventListener('click', closeDoorRoom);

navbarLinks.forEach(link => link.addEventListener('click', event => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target && target.classList.contains('skill-door')) {
        event.preventDefault();
        closeMenu();
        if (doorRoom.hidden) {
            openDoor(target, true);
        } else {
            closeDoorRoom();
            window.setTimeout(() => openDoor(target, true), reduceMotion.matches ? 0 : 360);
        }
        return;
    }
    closeDoorRoom();
    closeMenu();
}));

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        closeDoorRoom();
        closeMenu();
    }
});

const roleCards = document.querySelectorAll('.role-card');
const roleStack = document.querySelector('.role-stack');
const roleNextButton = document.getElementById('role-next');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let activeRole = 0;

function showNextRole() {
    if (roleCards.length < 2) return;

    roleCards[activeRole].classList.remove('active');
    roleCards[activeRole].setAttribute('aria-hidden', 'true');
    activeRole = (activeRole + 1) % roleCards.length;
    roleCards[activeRole].classList.add('active');
    roleCards[activeRole].setAttribute('aria-hidden', 'false');
    const nextRole = roleCards[(activeRole + 1) % roleCards.length].firstChild.textContent.trim();
    roleNextButton.setAttribute('aria-label', `Show ${nextRole}`);
}

roleNextButton.addEventListener('click', showNextRole);

function moveRoleWithPointer(event) {
    const bounds = roleStack.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
    roleStack.style.setProperty('--role-tilt-x', `${(vertical * -7).toFixed(2)}deg`);
    roleStack.style.setProperty('--role-tilt-y', `${(horizontal * 9).toFixed(2)}deg`);
}

let roleTouchActive = false;
roleStack.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') roleTouchActive = true;
    moveRoleWithPointer(event);
});
roleStack.addEventListener('pointermove', event => {
    if (event.pointerType !== 'touch' || roleTouchActive) moveRoleWithPointer(event);
});
roleStack.addEventListener('pointerup', () => {
    roleTouchActive = false;
});
roleStack.addEventListener('pointercancel', () => {
    roleTouchActive = false;
    roleStack.style.setProperty('--role-tilt-x', '0deg');
    roleStack.style.setProperty('--role-tilt-y', '0deg');
});

roleStack.addEventListener('pointerleave', () => {
    roleTouchActive = false;
    roleStack.style.setProperty('--role-tilt-x', '0deg');
    roleStack.style.setProperty('--role-tilt-y', '0deg');
});

function toggleTheme() {
    const isDark = document.body.classList.toggle('theme-dark');
    pullCord.setAttribute('aria-pressed', String(isDark));
    pullCord.setAttribute(
        'aria-label',
        isDark ? 'Pull the cord to switch to light mode' : 'Pull the cord to switch to dark mode'
    );
}

let pullStartY = null;
let pullStartX = null;
let pullDistance = 0;
let cordSwing = 0;
let suppressCordClick = false;

pullCord.addEventListener('pointerenter', () => {
    pullCord.classList.add('is-touched');
});

pullCord.addEventListener('pointerleave', () => {
    pullCord.classList.remove('is-touched');
});

pullCord.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    pullStartY = event.clientY;
    pullStartX = event.clientX;
    pullDistance = 0;
    cordSwing = 0;
    pullCord.classList.add('is-pulling');
    pullCord.classList.remove('is-touched');
    pullCord.setPointerCapture(event.pointerId);
    event.preventDefault();
});

pullCord.addEventListener('pointermove', event => {
    if (pullStartY === null) return;
    pullDistance = Math.max(0, event.clientY - pullStartY);
    cordSwing = Math.max(-14, Math.min(14, (event.clientX - pullStartX) * 0.18));
    pullCord.style.setProperty('--cord-pull', `${Math.min(pullDistance, 110)}px`);
    pullCord.style.setProperty('--cord-swing', `${cordSwing}deg`);
    pullCord.style.setProperty('--pull-swing', `${cordSwing * -0.65}deg`);
});

pullCord.addEventListener('pointerup', () => {
    if (pullStartY === null) return;
    const releasedDistance = pullDistance;
    const reboundSwing = cordSwing === 0 && releasedDistance > 12 ? 3 : -cordSwing * 0.3;
    if (releasedDistance >= 48) {
        toggleTheme();
        suppressCordClick = true;
        window.setTimeout(() => {
            suppressCordClick = false;
        }, 0);
    }
    pullStartY = null;
    pullStartX = null;
    pullDistance = 0;
    pullCord.classList.remove('is-pulling');
    pullCord.style.setProperty('--cord-swing', `${reboundSwing}deg`);
    pullCord.style.setProperty('--cord-pull', '0px');
    pullCord.style.setProperty('--pull-swing', '0deg');
    window.requestAnimationFrame(() => {
        pullCord.style.setProperty('--cord-swing', '0deg');
    });
});

pullCord.addEventListener('pointercancel', () => {
    pullStartY = null;
    pullStartX = null;
    pullDistance = 0;
    pullCord.classList.remove('is-pulling');
    pullCord.style.setProperty('--cord-swing', '0deg');
    pullCord.style.setProperty('--cord-pull', '0px');
    pullCord.style.setProperty('--pull-swing', '0deg');
});

pullCord.addEventListener('click', () => {
    if (suppressCordClick) {
        suppressCordClick = false;
        return;
    }
    toggleTheme();
});

document.getElementById('current-year').textContent = String(new Date().getFullYear());

document.querySelectorAll('.contact-form').forEach(contactForm => {
    contactForm.addEventListener('submit', () => {
        const submitButton = contactForm.querySelector('button[type="submit"]');
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
    });
});

const contactModal = document.getElementById('contact-modal');
const hireButton = document.querySelector('.hero-buttons .btn-primary');
const contactModalCloseButton = contactModal?.querySelector('.contact-modal-close');
let lastFocusedElement = null;

function openContactModal(event) {
    event.preventDefault();
    lastFocusedElement = document.activeElement;
    contactModal.hidden = false;
    contactModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    window.requestAnimationFrame(() => contactModalCloseButton?.focus());
}

function closeContactModal() {
    if (!contactModal || contactModal.hidden) return;
    contactModal.hidden = true;
    contactModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    lastFocusedElement?.focus();
}

hireButton?.addEventListener('click', openContactModal);
contactModal?.querySelectorAll('[data-close-contact-modal]').forEach(element => {
    element.addEventListener('click', closeContactModal);
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeContactModal();
});
