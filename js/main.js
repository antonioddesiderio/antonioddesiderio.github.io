import { DATA } from './data.js';
import { RubiksCube } from './cube.js';
import { MangaBackground } from './manga-bg.js';
import { ParticleNetwork } from './particles-bg.js'; // New
import { sectionMessages } from './assistantConfig.js';

document.addEventListener('DOMContentLoaded', () => {
    populateContent();
    loadPublications();
    loadManga();
    setupNavigation();
    loadStudents();      // New
    setupStudentFilters(); // New
    loadCollaborationsMap(); // New
    startIntro();
    setupAssistant(); // New



    // Init Backgrounds only on Desktop (> 768px)
    if (window.innerWidth > 768) {
        // Init Manga Sketch Background
        window.mangaBg = new MangaBackground('manga-canvas');

        // Init Particle Background
        window.particleBg = new ParticleNetwork('particles-canvas'); // New
    }


    // Init AOS
    setTimeout(() => {
        AOS.init({
            duration: 800,
            offset: 100,
            once: false,
            mirror: true
        });
    }, 1000); // Delay slightly to ensure layout settle or do it in finishIntro
});

function setupNavigation() {
    setupMobileNav();
    const sections = ['welcome', 'jobs', 'publications', 'students', 'collaborations', 'behind-paper', 'know-more'];
    const navLinks = document.querySelectorAll('.nav-links a');

    // Helper to show a specific section
    const showSection = (id) => {
        sections.forEach(sectionId => {
            const el = document.getElementById(sectionId);
            if (el) {
                if (sectionId === id) {
                    el.classList.remove('section-hidden');
                    // Fix Leaflet rendering when tab becomes visible
                    if (id === 'collaborations' && window.collabMap) {
                        setTimeout(() => {
                            window.collabMap.invalidateSize();
                        }, 100);
                    }
                    // Fix Manga Canvas size when tab becomes visible
                    if (id === 'know-more' && window.mangaBg) {
                        setTimeout(() => {
                            window.mangaBg.resize();
                        }, 100);
                    }
                } else {
                    el.classList.add('section-hidden');
                }
            }
        });
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                showSection(targetId);

                // Optional: Update URL hash without scrolling
                history.pushState(null, null, `#${targetId}`);
            }
        });
    });

    // Initially hide everything except welcome (will be handled by finishIntro somewhat, but good to ensure logic here too if accessed directly, though finishIntro handles mains visibility)
    // Actually, let's enforce it on load as well, or right after content population.
    // showSection('welcome'); // Let's do this in finishIntro to not mess up the fade-in of main-content
}

function populateContent() {
    // Welcome
    document.getElementById('welcome-text').innerHTML = DATA.welcome;
    document.getElementById('year').textContent = new Date().getFullYear();

    // Jobs
    const jobList = document.getElementById('jobs-list');
    DATA.jobs.forEach(job => {
        const li = document.createElement('li');
        li.className = 'list-item';
        li.innerHTML = `
            <h3>${job.title}</h3>
            <span class="meta">${job.institution} | ${job.year}</span>
            <p>${job.description}</p>
        `;
        jobList.appendChild(li);
    });

    // Visiting & Grants
    const grantContainer = document.querySelector('#jobs .container.mt-4');
    if (grantContainer) {
        let content = `<h3>Visiting & Grants</h3>`;

        // Grants
        if (DATA.grants && DATA.grants.length > 0) {
            content += `<h4 class="mt-2 mb-1">Grants</h4><ul class="item-list">`;
            DATA.grants.forEach(g => {
                content += `<li class="list-item" style="margin-bottom: 1rem;">
                    <span class="meta">${g.year} | ${g.title}</span>
                    <p><strong>${g.funder}</strong><br>${g.details}</p>
                </li>`;
            });
            content += `</ul>`;
        }

        // Visiting
        if (DATA.visiting && DATA.visiting.length > 0) {
            content += `<h4 class="mt-2 mb-1">Visiting</h4><ul class="item-list">`;
            DATA.visiting.forEach(v => {
                content += `<li class="list-item" style="margin-bottom: 1rem;">
                    <span class="meta">${v.period}</span>
                    <p><strong>${v.institution}</strong><br>${v.lab}<br>Host: ${v.host}</p>
                </li>`;
            });
            content += `</ul>`;
        }

        grantContainer.innerHTML = content;
    }

    // Contacts
    const contactsContainer = document.getElementById('contacts-container');
    const { emails, socials } = DATA.contacts || {};

    if (contactsContainer && (emails || socials)) {
        let contactsHtml = `<h3 class="contacts-title">Contacts</h3><div class="contacts-area">`;

        if (emails && emails.length > 0) {
            contactsHtml += `<div class="emails-list">`;
            emails.forEach(email => {
                contactsHtml += `<p class="contact-email"><strong>Email:</strong> ${email}</p>`;
            });
            contactsHtml += `</div>`;
        }

        if (socials && socials.length > 0) {
            contactsHtml += `<div class="socials-list">`;
            socials.forEach(social => {
                contactsHtml += `<a href="${social.url}" class="social-link" target="_blank">${social.name}</a>`;
            });
            contactsHtml += `</div>`;
        }
        contactsHtml += `</div>`;
        contactsContainer.innerHTML = contactsHtml;
    }
}

function loadPublications() {
    fetch('assets/publications.csv')
        .then(response => response.text())
        .then(text => {
            const lines = text.trim().split('\n');
            if (lines.length <= 1) return;

            // Header line for reference: Type;Title;Venue;Year;Link;DOI;Tags

            const publicationsGrid = document.getElementById('publications-grid');
            const outreachList = document.getElementById('outreach-list');
            const filterContainer = document.getElementById('pub-filters');

            let allTags = new Set();
            let papers = []; // Journals and Preprints
            let outreachItems = []; // Outreach

            // Parse CSV
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const cols = line.split(';');
                if (cols.length < 5) continue;

                const type = cols[0] ? cols[0].trim() : '';
                const title = cols[1] ? cols[1].trim() : '';
                const venue = cols[2] ? cols[2].trim() : '';
                const year = cols[3] ? cols[3].trim() : '';
                const link = cols[4] ? cols[4].trim() : '#';
                const doi = cols[5] ? cols[5].trim() : '';
                // Tags are in col 6
                const rawTags = cols[6] ? cols[6].trim() : '';
                const tags = rawTags ? rawTags.split('#').map(t => t.trim()) : [];

                const item = { type, title, venue, year, link, doi, tags };

                if (type === 'Outreach') {
                    outreachItems.push(item);
                } else {
                    papers.push(item);
                    // Collect tags ONLY from papers
                    tags.forEach(t => allTags.add(t));
                }
            }

            // Sort by Year Descending
            const sortByYear = (a, b) => parseInt(b.year) - parseInt(a.year);
            papers.sort(sortByYear);
            outreachItems.sort(sortByYear);

            // Render Outreach (Static)
            if (outreachList) {
                outreachList.innerHTML = '';
                outreachItems.forEach(pub => {
                    const li = document.createElement('li');
                    li.className = 'list-item';
                    let content = `<h3><a href="${pub.link}" target="_blank">${pub.title}</a></h3>`;
                    content += `<span class="meta">${pub.venue}, ${pub.year}</span>`;
                    li.innerHTML = content;
                    outreachList.appendChild(li);
                });
            }

            // Render Filters (Based on Papers tags only)
            if (filterContainer) {
                filterContainer.innerHTML = `<button class="filter-btn active" data-filter="all" aria-pressed="true">All</button>`;
                Array.from(allTags).sort().forEach(tag => {
                    filterContainer.innerHTML += `<button class="filter-btn" data-filter="${tag}" aria-pressed="false">${tag}</button>`;
                });

                // Add Filter Listeners
                const buttons = filterContainer.querySelectorAll('.filter-btn');
                buttons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        buttons.forEach(b => {
                            b.classList.remove('active');
                            b.setAttribute('aria-pressed', 'false');
                        });
                        btn.classList.add('active');
                        btn.setAttribute('aria-pressed', 'true');
                        const filter = btn.getAttribute('data-filter');
                        renderPapers(filter);
                    });
                });
            }

            // Internal render function for PAPERS only (Bento Grid)
            const renderPapers = (filter) => {
                if (!publicationsGrid) return;
                publicationsGrid.innerHTML = '';

                papers.forEach((pub, index) => {
                    // Check filter
                    if (filter !== 'all' && !pub.tags.includes(filter)) return;

                    const div = document.createElement('div');
                    
                    // Asymmetric logic: make first item and every 4th item "featured" (wide)
                    const isFeatured = filter === 'all' && (index === 0 || (index > 0 && index % 5 === 0));
                    div.className = `bento-item ${isFeatured ? 'featured' : ''}`;
                    div.setAttribute('data-aos', 'fade-up');

                    let html = `
                        <div>
                            <span class="type-tag">${pub.type}</span>
                            <h3><a href="${pub.link}" target="_blank">${pub.title}</a></h3>
                            <span class="meta">${pub.venue}, ${pub.year}${pub.doi ? ` | DOI: ${pub.doi}` : ''}</span>
                        </div>
                    `;

                    if (pub.tags.length > 0) {
                        html += `<div class="tags">
                            ${pub.tags.map(t => `<span class="tag">${t}</span>`).join('')}
                        </div>`;
                    }

                    div.innerHTML = html;
                    
                    // Interaction: clicking the card opens the link
                    div.addEventListener('click', (e) => {
                        if (e.target.tagName !== 'A') {
                            window.open(pub.link, '_blank');
                        }
                    });

                    publicationsGrid.appendChild(div);
                });
            };

            // Initial Render
            renderPapers('all');

        })
        .catch(err => console.error('Error loading publications:', err));
}

function loadManga() {
    fetch('assets/manga.json')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('manga-list');
            if (!container) return;

            data.forEach(item => {
                const li = document.createElement('li');
                li.className = 'manga-item';

                // Use placeholder if image fails or path is complex to guess, 
                // but we will assume assets/manga/ is the prefix.
                // We'll add a simple onerror to show a placeholder color/text
                const imgSrc = `assets/manga/${item.image}`;

                li.innerHTML = `
                    <div class="manga-image-container">
                        <img src="${imgSrc}" alt="${item.title}" class="manga-image" onerror="this.parentElement.style.backgroundColor='#ccc'">
                    </div>
                    <div class="manga-content">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                    </div>
                `;
                container.appendChild(li);
            });
        })
        .catch(err => console.error('Error loading manga:', err));
}

function typeWriter(element, text, speed = 100) {
    return new Promise(resolve => {
        let charIndex = 0;
        const typeInterval = setInterval(() => {
            if (charIndex < text.length) {
                element.textContent += text.charAt(charIndex);
                charIndex++;
            } else {
                clearInterval(typeInterval);
                resolve();
            }
        }, speed);
    });
}

let introFinished = false;

function startIntro() {
    const duration = 5000; // 5 seconds
    const progressBar = document.getElementById('progress-bar');
    const introOverlay = document.getElementById('intro-overlay');
    const mainContent = document.getElementById('main-content');
    const greeting = document.getElementById('intro-greeting');
    const skipBtn = document.getElementById('skip-intro');

    const skipNow = () => finishIntro(introOverlay, mainContent);
    if (skipBtn) skipBtn.addEventListener('click', skipNow);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') skipNow();
    });

    // Typewriter effect (Start Immediately)
    (async () => {
        const text1 = "Hello there, I'm Antonio Desiderio";
        const text2 = " :D";
        await typeWriter(greeting, text1, 80);
        await new Promise(r => setTimeout(r, 1000)); // 1 second pause
        await typeWriter(greeting, text2, 100);
    })();

    // Init Cube
    const introCube = new RubiksCube('cube-container-intro', false);
    introCube.scramble();

    // Start solve after small delay
    setTimeout(async () => {
        console.log("Intro: Starting Cube Solve");
        progressBar.style.transition = `transform ${duration}ms linear`;
        progressBar.style.transform = 'scaleX(1)';

        // Await the solve animation instead of relying on a blind setTimeout
        await introCube.solve(duration / 1000);
        console.log("Intro: Cube Solve Finished");
        
        // Add a small buffer after solve finishes
        setTimeout(() => {
            console.log("Intro: Calling finishIntro");
            finishIntro(introOverlay, mainContent);
        }, 500);

    }, 500);
}

function finishIntro(overlay, mainContent) {
    if (introFinished) return;
    introFinished = true;

    // 1. Prepare Main Content: Blurred and Zoomed In
    mainContent.classList.add('cinematic-mount');
    mainContent.classList.remove('hidden');

    // Force Reflow to ensure the browser registers the initial state
    void mainContent.offsetWidth;

    // 2. Trigger the "Resolve" (Focus + Scale Down + Fade In)
    // We do this immediately so it happens AS the overlay fades out, or slightly delayed?
    // Let's fade out the overlay AND resolve the content simultaneously.

    // Fade out overlay
    overlay.style.transition = 'opacity 1.5s ease';
    overlay.style.opacity = '0';

    // Resolve content
    mainContent.classList.add('cinematic-resolve');

    // 3. Cleanup
    setTimeout(() => {
        overlay.style.display = 'none';

        // Remove transition classes to clean up DOM (optional, but good for performance)
        mainContent.classList.remove('cinematic-mount', 'cinematic-resolve');

        // Refresh AOS after intro animation
        AOS.refresh();
    }, 1500);
}

function loadStudents(filter = 'all') {
    const container = document.getElementById('students-timeline');
    if (!container) return;

    container.innerHTML = '';

    const students = DATA.students || [];
    let filtered = filter === 'all'
        ? [...students]
        : students.filter(s => s.tags.includes(filter));
        
    // Sort students by year descending
    filtered.sort((a, b) => parseInt(b.year) - parseInt(a.year));

    filtered.forEach((student, index) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';

        // Alternating animations
        const aosAnim = index % 2 === 0 ? 'fade-left' : 'fade-right';
        // Note: index % 2 === 0 is the first item (0), which is odd in CSS 'nth-child(1)'.
        // CSS nth-child(odd) is 1, 3, 5. So index 0 (1st) is odd.
        // My CSS: odd is Left alignment (left: 0). even is Right alignment (left: 50%).
        // Wait, check CSS again:
        // .timeline-item:nth-child(odd) -> left: 0 (Left side).
        // .timeline-item:nth-child(even) -> left: 50% (Right side).

        // 1st item (index 0) is nth-child(1) -> Odd -> Left Side. Animation should be fade-right (appearing from left).
        // 2nd item (index 1) is nth-child(2) -> Even -> Right Side. Animation should be fade-left (appearing from right).

        const animation = (index + 1) % 2 !== 0 ? 'fade-right' : 'fade-left';

        item.setAttribute('data-aos', animation);

        // Tags HTML
        const tagsHtml = student.tags.map(tag => `<span class="student-tag">${tag}</span>`).join('');

        item.innerHTML = `
            <div class="student-card">
                <div class="card-header">
                    <h3>${student.name}</h3>
                    <div class="card-tags">${tagsHtml}</div>
                </div>
                <div class="card-details-wrapper">
                    <div class="card-details">
                        <p><strong>University:</strong> ${student.university}</p>
                        <p><strong>Collaborators:</strong> ${student.collaborators}</p>
                    </div>
                </div>
            </div>
            <div class="timeline-dot">${student.year}</div>
        `;

        // Interaction
        const card = item.querySelector('.student-card');
        card.addEventListener('click', () => {
            // Close others if desired? Or just toggle. Let's toggle.
            // Accordion: close others (optional but cleaner)
            /*
            document.querySelectorAll('.student-card.expanded').forEach(c => {
                if (c !== card) c.classList.remove('expanded');
            });
            */
            card.classList.toggle('expanded');
        });

        container.appendChild(item);
    });

    // Refresh AOS
    setTimeout(() => AOS.refresh(), 100);
}

function setupStudentFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class
            buttons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            // Add active
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');

            const filter = btn.getAttribute('data-filter');

            // Current items fade out logic could be complex with AOS. 
            // Simple approach: re-render.
            loadStudents(filter);
        });
    });
}




function loadCollaborationsMap() {
    // Check if container exists
    if (!document.getElementById('collaborations-map')) return;

    // Center on Europe: [50, 10], Zoom: 4
    const map = L.map('collaborations-map').setView([50, 10], 4);
    window.collabMap = map; // Expose for invalidateSize

    // OSM standard tiles (Carto light_all now requires an API key)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(map);

    // Collaborators data
    const collaborators = DATA.collaborators || [];

    // Marker Cluster Group
    const markers = L.markerClusterGroup({
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: function (cluster) {
            const childCount = cluster.getChildCount();
            let c = ' marker-cluster-';
            if (childCount < 10) {
                c += 'small';
            } else if (childCount < 100) {
                c += 'medium';
            } else {
                c += 'large';
            }

            return new L.DivIcon({
                html: '<div><span>' + childCount + '</span></div>',
                className: 'marker-cluster' + c,
                iconSize: new L.Point(40, 40)
            });
        }
    });

    collaborators.forEach(collab => {
        // Custom Icon
        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div class="marker-pin"></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        const marker = L.marker(collab.coords, { icon: customIcon });

        // Popup Content
        const popupContent = `
            <div class="popup-content">
                <h3>${collab.name}</h3>
                <span class="uni">${collab.university}</span>
                <span class="uni" style="font-size: 0.75rem; color: #888;">${collab.tag}</span>
                ${collab.site && collab.site !== '#' ? `<a href="${collab.site}" target="_blank">View Profile</a>` : ''}
            </div>
        `;

        marker.bindPopup(popupContent, {
            className: 'glass-popup',
            maxWidth: 300
        });

        markers.addLayer(marker);
    });

    map.addLayer(markers);

    // Fit bounds only if we haven't set a specific request or if helpful.
    // User asked to fix center/zoom to be in Europe. 
    // If we use fitBounds on just 5 Europe points, it might zoom in too much or be fine.
    // I will comment out fitBounds to respect "fix center and zoom to be in Europe" request strictly.
    /*
    if (collaborators.length > 0) {
        map.fitBounds(markers.getBounds(), { padding: [50, 50] });
    }
    */
}

function setupAssistant() {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        const id = section.id;

        // Exclude 'welcome' (About)
        if (id === 'welcome') return;

        // Check if we have a message for this section
        if (sectionMessages[id]) {
            const container = document.createElement('div');
            container.className = 'assistant-container';

            // Image
            const img = document.createElement('img');
            img.src = 'assets/mio-avatar.png';
            img.className = 'assistant-img';
            img.alt = 'Assistant';

            // Balloon
            const balloon = document.createElement('div');
            balloon.className = 'assistant-balloon';
            balloon.textContent = sectionMessages[id];

            // Append
            container.appendChild(balloon);
            container.appendChild(img);

            // Make sure section is relative for absolute positioning
            if (getComputedStyle(section).position === 'static') {
                section.style.position = 'relative';
            }

            section.appendChild(container);

            // Special interaction for Know Me More: Click to Reset Background
            if (id === 'know-more') {
                img.style.cursor = 'pointer'; // Ensure pointer cursor
                img.addEventListener('click', () => {
                    if (window.mangaBg) {
                        window.mangaBg.reset();
                    }
                });
            }
        }
    });
}

function setupMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        const setOpen = (open) => {
            navLinks.classList.toggle('active', open);
            hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
            document.body.classList.toggle('nav-open', open);
        };

        hamburger.addEventListener('click', () => {
            setOpen(!navLinks.classList.contains('active'));
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => setOpen(false));
        });
    }
}
