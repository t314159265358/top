import sounds from '../../data/sounds.json';

import 'wave-audio-path-player'

import Cookies from 'js-cookie'

/**
 * Color Scheme
 */
{
    let theme = Cookies.get('theme')

    if (theme && ['dark', 'light'].includes(theme)) {
        document.documentElement.dataset.theme = theme;
    }

    document.querySelector('.theme-toggle').addEventListener('click', (button) => {
        let oldTheme = document.documentElement.dataset.theme;

        let newTheme;
        if (oldTheme == 'dark') {
            newTheme = 'light'
        } else {
            newTheme = 'dark';
        }

        document.documentElement.dataset.theme = newTheme;
        Cookies.set('theme', newTheme)
    });
}


/**
 * Observer Hero
 */
{
    const intersectionObserver = new IntersectionObserver((entries) => {
        console.log(entries[0]);

        if (entries[0].isIntersecting) {
            document.querySelector("#header").classList.remove('stuck');
            document.querySelector("#header").dataset.theme = '';
        } else {
            document.querySelector("#header").classList.add('stuck');
            document.querySelector("#header").dataset.theme = 'dark';
        }

    });

    intersectionObserver.observe(document.querySelector(".hero .title"));
}

/**
 * Only Play One Audio at same time.
 */
{
    sounds.forEach(sound => {
        let template = document.querySelector('#sound-item');
        let clone = template.content.cloneNode(true);

        clone.querySelector('.name').innerHTML = sound.name;

        clone.querySelector('audio source').src = 'sounds/' + sound.name + '.wav';

        let cover = null;
        if ('cover' in sound) {
            cover = sound.cover;
        } else {
            cover = 'default';
        }
        let img = clone.querySelector('img')
        img.src = 'sounds/' + cover + '.webp';
        img.alt = sound.name


        document.querySelector('.sound-loop').appendChild(clone)
    })

    let currentAudio = null;

    function stopCurrentAudio() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
    }

    function playAudio(audio) {
        audio.play();
        currentAudio = audio;
    }


    document.querySelectorAll('audio').forEach((audio) => {
        audio.addEventListener('play', function () {
            if (currentAudio == audio) {
                return;
            }

            stopCurrentAudio();

            playAudio(audio);
        }, 1000);

        let isPlaying = false;

        audio.onplaying = function () {
            isPlaying = true;

            audio.closest('.sound-item').dataset.status = 'playing'
        };
        audio.onpause = function () {
            isPlaying = false;

            audio.closest('.sound-item').dataset.status = 'paused'
        };

        audio.onended = function () {
            isPlaying = false;

            audio.closest('.sound-item').dataset.status = 'ended'
        }

        audio.closest('.sound-item').querySelector('.cover').addEventListener('click', (e) => {
            console.log('audio')

            isPlaying ? audio.pause() : audio.play();
        })

        let item = audio.closest('.sound-item');

        let seekCircle = item.querySelector('.seek'),
            totalLength = seekCircle.getTotalLength();

        seekCircle.setAttribute('stroke-dasharray', totalLength)
        seekCircle.setAttribute('stroke-dashoffset', totalLength)

        audio.addEventListener('timeupdate', () => {

            let currentTime = audio.currentTime;
            if (!currentTime)
                return;

            let maxduration = audio.duration;
            let progress = totalLength - (currentTime / maxduration * totalLength);

            console.log(audio.duration);

            seekCircle.setAttribute('stroke-dashoffset', progress);
        });
    });

}



/**
 * Tags Toggle
 */
{
    document.querySelector('.tags-toggle').addEventListener('click', e => {
        document.querySelector('.filter').classList.toggle('tags-open')
    })

    document.querySelectorAll('.tags span').forEach((tag) => {
        tag.addEventListener('click', e => {
            document.querySelector('.filter').classList.remove('tags-open')
        })
    })
}


/**
 * Search
 */
{
    const searchForm = document.querySelector('.search-form');
    const searchInput = searchForm.querySelector('input');

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const searchTerm = searchInput.value.trim().toLowerCase();

        if (!searchTerm) {
            document.querySelector('.no-results').hidden = true;
            document.querySelectorAll('.sound-item').forEach((item, index) => {
                item.hidden = false;
            })
            return;
        }

        // sounds.filter((sound, index) => {
        //     sound.index = index;
        //     return sound.name.toLowerCase().includes(searchTerm) || ('tags' in sound && sound.tags.toLowerCase().includes(searchTerm))
        // })


        let hasResult = false;
        document.querySelectorAll('.sound-item').forEach((item, index) => {
            const sound = sounds[index];

            const match = sound.name.toLowerCase().includes(searchTerm) || ('tags' in sound && sound.tags.toLowerCase().includes(searchTerm));

            item.hidden = !match;

            if (!hasResult && match) {
                hasResult = true;
            }
        })

        document.querySelector('.no-results').hidden = hasResult;
    })

    document.querySelector('.search-form input').addEventListener('input', (e) => {
        searchForm.requestSubmit();
    });

    document.querySelectorAll('.tags span').forEach((item) => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            document.querySelector('.search-form input').value = item.innerText;

            searchForm.requestSubmit()
        })
    })

    document.querySelector('.clear-button').addEventListener('click', (e) => {
        searchInput.value = '';

        searchForm.requestSubmit()
    });
}





/**
 * Loop Layout
 */
{
    const loop = document.querySelector('.sound-loop');

    const currentLayout = Cookies.get('loop_layout') ?? 'grid';
    loop.dataset.layout = currentLayout;

    function switchLayout(currentLayout) {
        document.querySelectorAll('.layout-toggle').forEach(button => {
            button.hidden = currentLayout == button.dataset.layout;
        })
    }

    switchLayout(currentLayout);

    document.querySelectorAll('.layout-toggle').forEach(button => {
        button.addEventListener('click', (e) => {
            const layout = button.dataset.layout;

            loop.dataset.layout = layout;

            Cookies.set('loop_layout', layout)

            switchLayout(layout)
        })
    })

}

/**
 * Help Dialog
 */
{
    const helpContainer = document.querySelector('.help-container');

    document.querySelector('.help-toggle').addEventListener('click', () => {
        helpContainer.hidden = !helpContainer.hidden
    })

    document.querySelector('.help-container .close-button').addEventListener('click', () => {
        helpContainer.hidden = true
    })

    document.querySelector('.help-container').addEventListener('click', (e) => {
        if (!e.target.closest('.help')) {
            helpContainer.hidden = true
        }
    })

}


/**
 * About Dialog
 */
{
    const container = document.querySelector('.about-container');

    document.querySelector('.menu-toggle').addEventListener('click', () => {
        container.hidden = !container.hidden
    })

    document.querySelector('.about-container .close-button').addEventListener('click', () => {
        container.hidden = true
    })

    document.querySelector('.about-container').addEventListener('click', (e) => {
        if (!e.target.closest('.about')) {
            container.hidden = true
        }
    })

}




/**
 * No Source code
 */

// Disable right-click context menu
document.addEventListener('contextmenu', event => event.preventDefault());

// Disable F12 key and Ctrl+Shift+I combo
document.addEventListener('keydown', event => {
    if (event.keyCode === 123 || (event.ctrlKey && event.shiftKey && event.keyCode === 73)) {
        event.preventDefault();
    }
});